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

    // 1. 🔥 دمج الاستعلامات (Parallel Fetching) 🔥
    // بدلاً من الانتظار مرتين، نطلب بيانات المحاضرة والطالب في نفس اللحظة
    const [lecture, student] = await Promise.all([
      prisma.lecture.findFirst({ where: { qrCode: qrCode } }),
      prisma.user.findUnique({ where: { id: userId }, select: { id: true, division: true } }) // جلب الحقول المطلوبة فقط لتخفيف الحمل
    ]);

    // التحقق من وجود البيانات
    if (!lecture) return NextResponse.json({ message: "كود غير صالح" }, { status: 404 });
    if (!student) return NextResponse.json({ message: "بيانات الطالب غير موجودة" }, { status: 404 });

    // 2. التحقق من حالة المحاضرة
    if (lecture.isActive === false) {
        return NextResponse.json({ message: "عفواً، تم إغلاق باب التسجيل لهذه المحاضرة." }, { status: 403 });
    }

    // 3. التحقق من الشعبة
    if (lecture.allowedDivisions) {
        const allowed = lecture.allowedDivisions.split(",");
        if (!student.division || !allowed.includes(student.division)) {
            return NextResponse.json({ 
                message: `عفواً، هذا التسجيل مخصص للشعب: ${allowed.join(" و ")} فقط.` 
            }, { status: 403 });
        }
    }

    // 4. التحقق من الموقع الجغرافي
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

    // 5. 🔥 تسجيل الحضور بذكاء (الاعتماد على الـ Prisma Unique Constraint) 🔥
    // حذفنا استعلام الـ findFirst للبحث عن التكرار، وسنحاول التسجيل مباشرة.
    // إذا كان مسجلاً من قبل، سترفض قاعدة البيانات الطلب (Error Code P2002) وسنلتقطها.
    try {
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

    } catch (dbError: any) {
        // P2002 هو كود الخطأ في Prisma عند محاولة تكرار قيمة فريدة (Unique Constraint)
        if (dbError.code === 'P2002') {
            return NextResponse.json({ 
                message: "تم تسجيل الحضور مسبقاً لهذه المحاضرة! ✅" 
            }, { status: 409 });
        }
        throw dbError; // رمي الخطأ ليتم التقاطه في الـ catch الرئيسية إذا لم يكن خطأ تكرار
    }

  } catch (error) {
    console.error("Attendance API Error:", error);
    return NextResponse.json({ message: "حدث خطأ داخلي في الخادم" }, { status: 500 });
  }
}