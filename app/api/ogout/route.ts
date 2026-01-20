import { NextResponse } from "next/server";

export async function POST() {
  try {
    // 1. نجهز الرد الأول
    const response = NextResponse.json({
      success: true,
      message: "Logged out successfully",
    });

    // 2. نحذف الكوكي من جوه الرد نفسه (ده الأضمن)
    // بنخليها فاضية وبنخلي الـ path / عشان يضمن يمسحها من الموقع كله
    response.cookies.set("user_role", "", {
      httpOnly: true,
      path: "/", // مهم جداً عشان يطابق مسار الكوكي الأصلية
      expires: new Date(0), // تاريخ قديم عشان تتمسح فوراً
      maxAge: 0,
    });

    return response;
  } catch (error) {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}