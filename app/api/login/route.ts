import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { compare } from "bcryptjs"; // 🔥 استيراد مكتبة المقارنة والتشفير

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    // 1. السوبر أدمن (مفيش فيه تغيير)
    if (email === "mo879938@gmail.com" && password === "0100adminmo@g") {
      const response = NextResponse.json({
        id: "super-admin-id",
        name: "Super Admin (Mo)",
        role: "ADMIN",
        email: email,
        image: null,
        attendance: [] 
      });
      response.cookies.set("user_role", "ADMIN", { httpOnly: true, path: "/", maxAge: 60 * 60 * 24 * 7 });
      return response;
    }

    // 2. المستخدم العادي (الطالب)
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        attendance: {
          include: {
            lecture: true // لازم نجيب تفاصيل المحاضرة عشان نعرف التاريخ والـ ID
          }
        }
      }
    });

    if (!user) {
      return NextResponse.json({ message: "بيانات الدخول خطأ" }, { status: 401 });
    }

    // 🔥🔥🔥 التعديل السحري: مقارنة الباسورد العادي بالهاش اللي في الداتابيز 🔥🔥🔥
    const isPasswordValid = await compare(password, user.password);

    if (!isPasswordValid) {
      return NextResponse.json({ message: "بيانات الدخول خطأ" }, { status: 401 });
    }

    // خطوة أمان إضافية: مسح الباسورد المشفر من الـ Object قبل ما يتبعت للـ LocalStorage
    const { password: _, ...userWithoutPassword } = user;

    const response = NextResponse.json(userWithoutPassword);
    
    // تسجيل الكوكي للميدل وير
    response.cookies.set("user_role", user.role, { httpOnly: true, path: "/", maxAge: 60 * 60 * 24 * 7 });
    
    return response;

  } catch (error) {
    console.error("Login Error:", error);
    return NextResponse.json({ message: "Error" }, { status: 500 });
  }
}