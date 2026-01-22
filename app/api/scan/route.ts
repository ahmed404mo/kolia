import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// دالة حساب المسافة بين نقطتين (بالمتر)
function getDistanceFromLatLonInM(lat1: number, lon1: number, lat2: number, lon2: number) {
  var R = 6371; // Radius of the earth in km
  var dLat = deg2rad(lat2 - lat1);  // deg2rad below
  var dLon = deg2rad(lon2 - lon1);
  var a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  var d = R * c * 1000; // Distance in meters
  return d;
}

function deg2rad(deg: number) {
  return deg * (Math.PI / 180);
}

export async function POST(req: Request) {
  try {
    // 🔥 استلام الموقع (lat, lng) من الطالب
    const { userId, qrCode, lat, lng } = await req.json();

    // 1. البحث عن المحاضرة
    const lecture = await prisma.lecture.findFirst({
      where: { qrCode: qrCode }
    });

    if (!lecture) {
      return NextResponse.json({ message: "كود غير صالح" }, { status: 404 });
    }

    // 2. التحقق من الموقع الجغرافي (لو المحاضرة مش أونلاين ومسجل ليها موقع)
    if (lecture.type !== 'ONLINE' && lecture.lat && lecture.lng) {
      if (!lat || !lng) {
        return NextResponse.json({ message: "يجب تفعيل الموقع الجغرافي (GPS)" }, { status: 400 });
      }

      const distance = getDistanceFromLatLonInM(lecture.lat, lecture.lng, lat, lng);
      
      // 👇👇👇👇 هنا تتحكم في مساحة المدرج 👇👇👇👇
      const MAX_DISTANCE_METERS = 200; // خليتها 200 متر عشان المدرجات الكبيرة
      // 👆👆👆👆 غير الرقم ده براحتك (100, 150, 300...) 👆👆👆👆

      if (distance > MAX_DISTANCE_METERS) {
        return NextResponse.json({ 
          message: `أنت بعيد عن القاعة (${Math.round(distance)} متر). اقترب وحاول مرة أخرى.` 
        }, { status: 400 });
      }
    }

    // 3. التحقق من التكرار
    const existing = await prisma.attendance.findFirst({
      where: { userId, lectureId: lecture.id }
    });

    if (existing) {
      return NextResponse.json({ 
          message: "Already Registered", 
          lectureId: lecture.id 
      }, { status: 200 }); 
    }

    // 4. تسجيل الحضور
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