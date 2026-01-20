import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// 1. حذف محاضرة (DELETE)
export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  console.log("🗑️ محاولة حذف المحاضرة رقم:", params.id); // رسالة تتبع

  try {
    const id = params.id;

    // مسح الحضور أولاً (مهم جداً عشان الداتابيز ماتعترضش)
    await prisma.attendance.deleteMany({
      where: { lectureId: id }
    });

    // مسح المحاضرة
    await prisma.lecture.delete({
      where: { id: id }
    });

    console.log("✅ تم الحذف بنجاح");
    return NextResponse.json({ success: true });

  } catch (error) {
    console.error("❌ فشل الحذف:", error);
    return NextResponse.json({ message: "فشل الحذف" }, { status: 500 });
  }
}

// 2. تعديل اسم المحاضرة (PUT)
export async function PUT(req: Request, { params }: { params: { id: string } }) {
  console.log("✏️ محاولة تعديل المحاضرة رقم:", params.id); // رسالة تتبع

  try {
    const { topic } = await req.json();
    
    const updated = await prisma.lecture.update({
      where: { id: params.id },
      data: { topic }
    });

    console.log("✅ تم التعديل بنجاح");
    return NextResponse.json(updated);

  } catch (error) {
    console.error("❌ فشل التعديل:", error);
    return NextResponse.json({ message: "فشل التعديل" }, { status: 500 });
  }
}