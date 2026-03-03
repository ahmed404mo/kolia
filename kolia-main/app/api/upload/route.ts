import { NextResponse } from "next/server";
import { writeFile } from "fs/promises";
import { join } from "path";
import { mkdir } from "fs/promises";

export async function POST(req: Request) {
  try {
    const data = await req.formData();
    const file: File | null = data.get("file") as unknown as File;

    if (!file) {
      return NextResponse.json({ message: "No file uploaded" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // التأكد من وجود الفولدر
    const uploadDir = join(process.cwd(), "public/uploads");
    try {
        await mkdir(uploadDir, { recursive: true });
    } catch (e) {}

    // اسم ملف فريد (التاريخ + الاسم الأصلي)
    const uniqueName = `${Date.now()}-${file.name.replace(/\s/g, "_")}`;
    const path = join(uploadDir, uniqueName);

    await writeFile(path, buffer);
    
    // نرجع رابط الصورة عشان يتخزن في الداتا بيز
    const imageUrl = `/uploads/${uniqueName}`;

    return NextResponse.json({ url: imageUrl, message: "Uploaded" });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Upload failed" }, { status: 500 });
  }
}