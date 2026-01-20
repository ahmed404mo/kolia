import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { topic, type, subjectId, date, electiveName } = body; // ضفنا electiveName هنا

    // 1. التأكد من وجود المادة
    const subject = await prisma.subject.findUnique({
      where: { id: subjectId }
    });

    if (!subject) {
      return NextResponse.json({ message: "Subject not found" }, { status: 404 });
    }

    // 🔥🔥🔥 التعديل الجديد: تحديث اسم المادة في الداتا بيز لو هي اختياري 🔥🔥🔥
    if (subject.isElective && electiveName) {
      await prisma.subject.update({
        where: { id: subjectId },
        data: { name: electiveName } // تغيير الاسم في جدول المواد
      });
    }

    // 2. إنشاء المحاضرة
    const lecture = await prisma.lecture.create({
      data: {
        topic,
        type,
        subjectId,
        date: date ? new Date(date) : new Date(),
        qrCode: `LEC-${crypto.randomUUID()}`
      },
    });

    return NextResponse.json(lecture);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Error creating lecture" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
    try {
        const body = await req.json();
        const { id, topic, date } = body;
        
        const lecture = await prisma.lecture.update({
            where: { id },
            data: { 
                topic, 
                date: new Date(date) 
            }
        });
        
        return NextResponse.json(lecture);
    } catch(e) {
        return NextResponse.json({ message: "Error" }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get("id");
        if(!id) return NextResponse.json({message: "ID required"}, {status: 400});

        await prisma.attendance.deleteMany({ where: { lectureId: id } });
        await prisma.lecture.delete({ where: { id } });

        return NextResponse.json({ message: "Deleted" });
    } catch(e) {
        return NextResponse.json({ message: "Error" }, { status: 500 });
    }
}