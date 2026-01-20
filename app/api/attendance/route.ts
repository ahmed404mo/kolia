import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { userId, lectureId, status } = await req.json();

    if (status === "PRESENT") {
      // تسجيل حضور
      await prisma.attendance.create({
        data: { userId, lectureId }
      }).catch(() => {}); // لو موجود أصلاً كمل عادي
    } else {
      // إلغاء حضور
      await prisma.attendance.deleteMany({
        where: { userId, lectureId }
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}