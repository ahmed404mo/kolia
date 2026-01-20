import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    // 👑 1. السوبر أدمن (Super Admin)
    if (email === "mo879938@gmail.com" && password === "0100adminmo@g") {
      
      // ✅ الطريقة الصحيحة: نجهز الرد الأول
      const response = NextResponse.json({
        id: "super-admin-id",
        name: "Super Admin (Mo)",
        role: "ADMIN",
        email: email,
        division: null,
        classNumber: null
      });

      // ✅ وبعدين نحط الكوكي جوه الرد
      response.cookies.set("user_role", "ADMIN", { 
          httpOnly: true, 
          path: "/",
          maxAge: 60 * 60 * 24 * 7 // أسبوع
      });

      return response;
    }

    // 2. المستخدم العادي (من الداتابيز)
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user || user.password !== password) {
      return NextResponse.json({ message: "بيانات الدخول غير صحيحة" }, { status: 401 });
    }

    // ✅ نفس الكلام هنا: نجهز الرد الأول
    const response = NextResponse.json({
      id: user.id,
      name: user.name,
      role: user.role,
      email: user.email,
      division: user.division,
      classNumber: user.classNumber
    });

    // ✅ نحط الكوكي في الرد
    response.cookies.set("user_role", user.role, { 
        httpOnly: true, 
        path: "/",
        maxAge: 60 * 60 * 24 * 7 
    });

    return response;

  } catch (error) {
    // 🛑 دي عشان لو حصل خطأ نشوفه في التيرمينال
    console.error("Login API Error:", error);
    return NextResponse.json({ message: "خطأ في السيرفر" }, { status: 500 });
  }
}