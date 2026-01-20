import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userId, qrCode } = body;

    console.log("📦 [SCAN API] البيانات المستلمة:", { userId, qrCode });

    if (!userId || !qrCode) {
      return NextResponse.json({ message: "بيانات ناقصة" }, { status: 400 });
    }

    // 1. نبحث عن المحاضرة. الـ qrCode هنا هو الـ ID الصافي اللي جاي من الموبايل
    // بنجرب نبحث عنه في حقل qrCode أو الـ id نفسه لضمان أقصى توافق
    const lecture = await prisma.lecture.findFirst({
      where: {
        OR: [
          { qrCode: qrCode },
          { id: qrCode }
        ]
      },
    });

    if (!lecture) {
      console.log("⚠️ لم يتم العثور على محاضرة بالكود:", qrCode);
      return NextResponse.json({ message: "رمز QR غير صالح أو المحاضرة غير موجودة" }, { status: 404 });
    }

    // 2. التحقق من وجود الطالب
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return NextResponse.json({ message: "الطالب غير موجود" }, { status: 404 });
    }

    // 3. تسجيل الحضور
    try {
      await prisma.attendance.create({
        data: {
          userId,
          lectureId: lecture.id,
          status: "PRESENT",
        },
      });
      
      console.log("✅ تم تسجيل الحضور بنجاح");
      return NextResponse.json({ message: "Success" });
      
    } catch (e: any) {
      // إذا كان مسجلاً مسبقاً (P2002 هو خطأ Unique constraint في Prisma)
      if (e.code === "P2002") {
        return NextResponse.json({ message: "Already Registered" });
      }
      throw e; // يروح للـ catch الكبيرة
    }

  } catch (error) {
    console.error("❌ خطأ في السيرفر:", error);
    return NextResponse.json({ message: "Database Error" }, { status: 500 });
  }
}