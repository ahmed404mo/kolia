import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, password, division, classNumber } = body;

    // 1. التأكد إن الايميل مش موجود قبل كده
    const existingUser = await prisma.user.findUnique({
      where: { email: email },
    });

    if (existingUser) {
      return NextResponse.json(
        { message: "هذا البريد الإلكتروني مستخدم بالفعل" }, 
        { status: 400 }
      );
    }

    // 2. إنشاء المستخدم الجديد في الداتابيز
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password, // في المشاريع الحقيقية بنشفر الباسورد، بس للتجربة عادي
        division: String(division), // نتأكد إنه نص
        classNumber: String(classNumber),
        role: "STUDENT", // أي حد يسجل جديد هو طالب
      },
    });

    return NextResponse.json({ message: "تم التسجيل بنجاح", user: newUser }, { status: 201 });

  } catch (error) {
    console.error("Registration Error:", error);
    return NextResponse.json({ message: "حدث خطأ أثناء التسجيل" }, { status: 500 });
  }
}