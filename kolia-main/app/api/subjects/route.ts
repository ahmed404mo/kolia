import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const subjects = await prisma.subject.findMany({
      orderBy: { term: 'asc' }, // ترتيب حسب الترم
      include: {
        lectures: true // جلب المحاضرات لحساب العدد
      }
    });
    return NextResponse.json(subjects);
  } catch (error) {
    return NextResponse.json({ message: "Error" }, { status: 500 });
  }
}