// app/api/lessons/[id]/route.ts
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const { title, content } = await req.json();
  const updated = await prisma.lesson.update({
    where: { id: params.id },
    data: { title, content },
  });
  return NextResponse.json(updated);
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  await prisma.lesson.delete({
    where: { id: params.id },
  });
  return NextResponse.json({ success: true });
}
