import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    const type = searchParams.get("type");

    if (type === 'GLOBAL_ALL') {
        const tasks = await prisma.globalTask.findMany({ orderBy: { createdAt: 'desc' } });
        return NextResponse.json(tasks);
    }

    if (!userId) return NextResponse.json({ message: "ID required" }, { status: 400 });

    const personalTasks = await prisma.personalTask.findMany({ where: { userId }, orderBy: { createdAt: 'desc' } });
    const globalTasks = await prisma.globalTask.findMany({ orderBy: { createdAt: 'desc' }, take: 20 });

    return NextResponse.json({ personal: personalTasks, global: globalTasks });
  } catch (error) { return NextResponse.json({ message: "Error" }, { status: 500 }); }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { title, userId, type, link, image, category } = body; // 🔥 استقبلنا category

    if (!title && !image) return NextResponse.json({ message: "Required" }, { status: 400 });

    if (type === 'GLOBAL') {
        const newTask = await prisma.globalTask.create({
            data: { 
                title: title || "", 
                link: link || null,
                image: image || null,
                category: category || "NEWS" // 🔥 حفظ النوع
            }
        });
        return NextResponse.json(newTask);
    } else {
        if (!userId) return NextResponse.json({ message: "User ID required" }, { status: 400 });
        const newTask = await prisma.personalTask.create({
            data: { title: title || "مهمة جديدة", userId }
        });
        return NextResponse.json(newTask);
    }
  } catch (error) { return NextResponse.json({ message: "Error" }, { status: 500 }); }
}

// PUT & DELETE زي ما هما (مفيش تغيير جوهري)
export async function PUT(req: Request) {
    try {
        const body = await req.json();
        const { id, isDone, type, title, link, image } = body;
        if (type === 'GLOBAL') {
            const updated = await prisma.globalTask.update({ where: { id }, data: { title, link, image } });
            return NextResponse.json(updated);
        }
        const updated = await prisma.personalTask.update({ where: { id }, data: { isDone } });
        return NextResponse.json(updated);
    } catch (error) { return NextResponse.json({ message: "Error" }, { status: 500 }); }
}

export async function DELETE(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get("id");
        const type = searchParams.get("type");
        if(!id) return NextResponse.json({ message: "ID required" }, { status: 400 });
        if (type === 'GLOBAL') await prisma.globalTask.delete({ where: { id } });
        else await prisma.personalTask.delete({ where: { id } });
        return NextResponse.json({ message: "Deleted" });
    } catch (error) { return NextResponse.json({ message: "Error" }, { status: 500 }); }
}