// app/api/lessons/route.ts
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  const lessons = await prisma.lesson.findMany();
  return NextResponse.json({ lessons });
}
export async function POST(req: Request) {
  const { title, content } = await req.json();
  
  const lesson = await prisma.lesson.create({
    data: { title, content, userId: 'bf926f9b-2a38-4ab5-bf03-4f91b107d7e5' }, 
  });
  return NextResponse.json(lesson);
}
