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

    // 🔥 التحقق الهام: هل المحاضرة ما زالت نشطة؟ 🔥
    if (lecture.isActive === false) {
        return NextResponse.json({ message: "عفواً، تم إغلاق باب التسجيل لهذه المحاضرة." }, { status: 403 });
    }

    // 2. التحقق من الشعبة
    const student = await prisma.user.findUnique({
        where: { id: userId }
    });

    if (!student) {
        return NextResponse.json({ message: "بيانات الطالب غير موجودة" }, { status: 404 });
    }

    if (lecture.allowedDivisions) {
        const allowed = lecture.allowedDivisions.split(",");
        if (!student.division || !allowed.includes(student.division)) {
            return NextResponse.json({ 
                message: `عفواً، هذا التسجيل مخصص للشعب: ${allowed.join(" و ")} فقط.` 
            }, { status: 403 });
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

    // 4. 🔥🔥 التحقق من التكرار (التعديل هنا) 🔥🔥
    const existing = await prisma.attendance.findFirst({
      where: { userId, lectureId: lecture.id }
    });

    if (existing) {
      // 👇 غيرنا الحالة لـ 409 عشان التطبيق يفهم إنه خطأ ويعرض الرسالة الحمراء
      return NextResponse.json({ 
          message: "تم تسجيل الحضور مسبقاً لهذه المحاضرة! ✅" 
      }, { status: 409 }); 
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