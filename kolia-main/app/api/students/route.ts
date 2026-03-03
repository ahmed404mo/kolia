import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { hash } from "bcryptjs";

export async function GET(req: Request) {
  try {
    const students = await prisma.user.findMany({
      where: { role: "STUDENT" },
      orderBy: { classNumber: 'asc' }
    });
    return NextResponse.json(students);
  } catch (error) {
    return NextResponse.json({ message: "Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, password, division, classNumber, image } = body;

    const hashedPassword = await hash(password, 12);

    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: "STUDENT",
        division,
        classNumber,
        image // ✅ حفظ الصورة عند الإنشاء
      },
    });

    return NextResponse.json(newUser);
  } catch (error) {
    return NextResponse.json({ message: "Error" }, { status: 500 });
  }
}

// 🔥🔥🔥 دالة التعديل (المسؤولة عن حفظ الصورة الجديدة) 🔥🔥🔥
export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { id, name, email, password, division, classNumber, image } = body;

    const data: any = { 
        name, 
        email, 
        division, 
        classNumber, 
        image // ✅ لازم نتأكد إن الصورة موجودة هنا
    };

    // تحديث الباسورد فقط لو اتبعت
    if (password && password.trim() !== "") {
      data.password = await hash(password, 12);
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: data,
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error("Update Error:", error); // عشان نشوف الخطأ في الترمينال
    return NextResponse.json({ message: "Error updating student" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) return NextResponse.json({ message: "ID required" }, { status: 400 });

    // مسح الحضور الأول عشان ميعملش مشاكل
    await prisma.attendance.deleteMany({ where: { userId: id } });
    await prisma.user.delete({ where: { id } });

    return NextResponse.json({ message: "Deleted" });
  } catch (error) {
    return NextResponse.json({ message: "Error" }, { status: 500 });
  }
}