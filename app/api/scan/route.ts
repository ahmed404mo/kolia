import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { userId, qrCode } = await req.json();

    // 1. البحث عن المحاضرة بهذا الكود
    const lecture = await prisma.lecture.findFirst({
      where: { qrCode: qrCode }
    });

    if (!lecture) {
      return NextResponse.json({ message: "كود غير صالح" }, { status: 404 });
    }

    // 2. التحقق من التكرار
    const existing = await prisma.attendance.findFirst({
      where: { userId, lectureId: lecture.id }
    });

    if (existing) {
      // حتى لو مسجل مسبقاً، نرجع بيانات النجاح عشان الواجهة تتحدث لو كانت معلقة
      return NextResponse.json({ 
          message: "Already Registered", 
          lectureId: lecture.id // 🔥 نرجع الـ ID الحقيقي
      }, { status: 200 }); 
    }

    // 3. تسجيل الحضور
    const newAttendance = await prisma.attendance.create({
      data: {
        userId,
        lectureId: lecture.id,
        status: "PRESENT"
      }
    });

    // 4. إرجاع بيانات النجاح مع الـ ID الحقيقي
    return NextResponse.json({ 
        message: "Success", 
        lectureId: lecture.id // 🔥 أهم جزء: نرجع الـ ID الحقيقي للفرونت إند
    });

  } catch (error) {
    return NextResponse.json({ message: "Error" }, { status: 500 });
  }
}