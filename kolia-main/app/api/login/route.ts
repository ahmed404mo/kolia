import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    // 1. السوبر أدمن
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
        // 🔥🔥🔥 هذا هو الجزء الذي كان ينقصك 🔥🔥🔥
        attendance: {
          include: {
            lecture: true // لازم نجيب تفاصيل المحاضرة عشان نعرف التاريخ والـ ID
          }
        }
      }
    });

    if (!user || user.password !== password) {
      return NextResponse.json({ message: "بيانات الدخول خطأ" }, { status: 401 });
    }

    const response = NextResponse.json(user);
    response.cookies.set("user_role", user.role, { httpOnly: true, path: "/", maxAge: 60 * 60 * 24 * 7 });
    return response;

  } catch (error) {
    return NextResponse.json({ message: "Error" }, { status: 500 });
  }
}