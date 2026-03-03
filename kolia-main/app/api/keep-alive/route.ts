import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    // استعلام بسيط جداً وسريع لا يستهلك موارد
    await prisma.$queryRaw`SELECT 1`;
    return NextResponse.json({ message: 'Database pinged successfully' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to ping database' }, { status: 500 });
  }
}
