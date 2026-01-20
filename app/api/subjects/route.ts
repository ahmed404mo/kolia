import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const subjects = await prisma.subject.findMany({
      orderBy: { term: 'asc' } // ترتيب حسب التيرم
    });
    return NextResponse.json(subjects);
  } catch (error) {
    return NextResponse.json({ message: "فشل تحميل المواد" }, { status: 500 });
  }
}