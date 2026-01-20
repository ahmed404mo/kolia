import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// إجبار السيرفر على عدم تخزين البيانات (لضمان التحديث الفوري)
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // 1. جلب الطلاب مع سجل الحضور
    const students = await prisma.user.findMany({
      where: { role: "STUDENT" },
      orderBy: { classNumber: 'asc' }, // ترتيب حسب رقم الكشف
      include: { 
        attendance: true // 🔥 هام جداً: هذا السطر هو المسؤول عن إظهار علامة الصح
      }    
    });

    // 2. جلب المحاضرات
    const lectures = await prisma.lecture.findMany({
      orderBy: { date: 'desc' }
    });

    return NextResponse.json({
      students,
      lectures
    });

  } catch (error) {
    console.error("Report API Error:", error);
    return NextResponse.json({ message: "Error fetching report data" }, { status: 500 });
  }
}