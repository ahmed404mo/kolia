import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs"; 

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, password, division, classNumber } = body;

    const existingUser = await prisma.user.findUnique({
      where: { email: email },
    });

    if (existingUser) {
      return NextResponse.json(
        { message: "هذا البريد الإلكتروني مستخدم بالفعل" }, 
        { status: 400 }
      );
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword, 
        division: String(division), 
        classNumber: String(classNumber),
        role: "STUDENT", 
      },
    });

    const { password: _, ...userWithoutPassword } = newUser;

    const response = NextResponse.json(
      { message: "تم التسجيل بنجاح", user: userWithoutPassword }, 
      { status: 201 }
    );

    response.cookies.set("user_role", newUser.role, {
      path: "/",
      maxAge: 60 * 60 * 24 * 30, // الكوكي هيفضل شغال 30 يوم
      httpOnly: false, 
      secure: process.env.NODE_ENV === "production", 
    });

    return response;

  } catch (error) {
    console.error("Registration Error:", error);
    return NextResponse.json({ message: "حدث خطأ أثناء التسجيل" }, { status: 500 });
  }
}