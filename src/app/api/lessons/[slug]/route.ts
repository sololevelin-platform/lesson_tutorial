import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { generateSlug, ensureUniqueSlug } from "@/utils/slug";

const prisma = new PrismaClient();

export async function GET(_: Request, { params }: { params: { slug: string } }) {
  try {
    const lesson = await prisma.lesson.findUnique({
      where: { slug: params.slug },
    });

    if (!lesson) {
      return NextResponse.json({ error: "Lesson not found" }, { status: 404 });
    }

    return NextResponse.json({ lesson });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch lesson" },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: Request,
  { params }: { params: { slug: string } }
) {
  const { title, content, image } = await req.json();

  try {
    const currentLesson = await prisma.lesson.findUnique({
      where: { slug: params.slug }
    });

    if (!currentLesson) {
      return NextResponse.json({ error: "Lesson not found" }, { status: 404 });
    }

    let newSlug = params.slug;

    if (currentLesson.title !== title) {
      const baseSlug = generateSlug(title);
      newSlug = await ensureUniqueSlug(
        baseSlug,
        async (checkSlug: string) => {
          const existing = await prisma.lesson.findUnique({
            where: { slug: checkSlug }
          });
          return !!existing;
        },
        params.slug 
      );
    }

    const updated = await prisma.lesson.update({
      where: { slug: params.slug },
      data: { 
        title, 
        slug: newSlug,
        content, 
        image 
      },
    });
    
    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update lesson" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _: Request,
  { params }: { params: { slug: string } }
) {
  try {
    await prisma.lesson.delete({
      where: { slug: params.slug },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete lesson" },
      { status: 500 }
    );
  }
}