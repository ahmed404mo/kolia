import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

function getDistanceFromLatLonInM(lat1: number, lon1: number, lat2: number, lon2: number) {
  var R = 6371; 
  var dLat = deg2rad(lat2 - lat1); 
  var dLon = deg2rad(lon2 - lon1);
  var a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  var d = R * c * 1000; 
  return d;
}

function deg2rad(deg: number) {
  return deg * (Math.PI / 180);
}

export async function POST(req: Request) {
  try {
    const { userId, qrCode, lat, lng } = await req.json();

    // 1. البحث عن المحاضرة
    const lecture = await prisma.lecture.findFirst({
      where: { qrCode: qrCode }
    });

    if (!lecture) {
      return NextResponse.json({ message: "كود غير صالح" }, { status: 404 });
    }

    // 🔥 2. التحقق من الشعبة (Logic الجديد) 🔥
    // لازم نجيب بيانات الطالب الأول عشان نعرف شعبته
    const student = await prisma.user.findUnique({
        where: { id: userId }
    });

    if (!student) {
        return NextResponse.json({ message: "بيانات الطالب غير موجودة" }, { status: 404 });
    }

    // لو المحاضرة مخصصة لشعب معينة (الحقل مش null)
    if (lecture.allowedDivisions) {
        // تحويل النص لمصفوفة: "1,2" -> ["1", "2"]
        const allowed = lecture.allowedDivisions.split(",");
        
        // التحقق هل شعبة الطالب موجودة في القائمة
        if (!student.division || !allowed.includes(student.division)) {
            return NextResponse.json({ 
                message: `عفواً، هذا التسجيل مخصص للشعب: ${allowed.join(" و ")} فقط.` 
            }, { status: 403 }); // 403 Forbidden
        }
    }

    // 3. التحقق من الموقع الجغرافي
    if (lecture.type !== 'ONLINE' && lecture.lat && lecture.lng) {
      if (!lat || !lng) {
        return NextResponse.json({ message: "يجب تفعيل الموقع الجغرافي (GPS)" }, { status: 400 });
      }

      const distance = getDistanceFromLatLonInM(lecture.lat, lecture.lng, lat, lng);
      const MAX_DISTANCE_METERS = 200; 

      if (distance > MAX_DISTANCE_METERS) {
        return NextResponse.json({ 
          message: `أنت بعيد عن القاعة (${Math.round(distance)} متر). اقترب وحاول مرة أخرى.` 
        }, { status: 400 });
      }
    }

    // 4. التحقق من التكرار
    const existing = await prisma.attendance.findFirst({
      where: { userId, lectureId: lecture.id }
    });

    if (existing) {
      return NextResponse.json({ 
          message: "Already Registered", 
          lectureId: lecture.id 
      }, { status: 200 }); 
    }

    // 5. تسجيل الحضور
    await prisma.attendance.create({
      data: {
        userId,
        lectureId: lecture.id,
        status: "PRESENT"
      }
    });

    return NextResponse.json({ 
        message: "Success", 
        lectureId: lecture.id 
    });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Error" }, { status: 500 });
  }
}