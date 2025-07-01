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
    data: { title, content, image: '', userId: '4c56bbf9-32be-4d0d-a6f0-42e576c7791e' }, 
  });
  return NextResponse.json(lesson);
}
