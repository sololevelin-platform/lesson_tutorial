import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { generateSlug, ensureUniqueSlug } from "@/utils/slug";

const prisma = new PrismaClient();

export async function GET(
  req: Request,
  { params }: { params: { slug: string } }
) {
  const { slug } = params;

  try {
    const lesson = await prisma.lesson.findUnique({
      where: { slug },
    });

    if (!lesson) {
      return NextResponse.json({ error: "Lesson not found" }, { status: 404 });
    }

    return NextResponse.json({ lesson });
  } catch (error) {
    console.error("Error fetching lesson:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(
  req: Request,
  { params }: { params: { slug: string } }
) {
  const { slug } = params;
  const { title, content, image, iframeUrl } = await req.json();

  try {
    // Generate new slug if title changed
    const currentLesson = await prisma.lesson.findUnique({
      where: { slug },
    });

    if (!currentLesson) {
      return NextResponse.json({ error: "Lesson not found" }, { status: 404 });
    }

    let newSlug = slug;
    if (title !== currentLesson.title) {
      const baseSlug = generateSlug(title);
      newSlug = await ensureUniqueSlug(
        baseSlug,
        async (checkSlug: string) => {
          if (checkSlug === slug) return false; // Allow keeping current slug
          const existing = await prisma.lesson.findUnique({
            where: { slug: checkSlug }
          });
          return !!existing;
        }
      );
    }

    const updatedLesson = await prisma.lesson.update({
      where: { slug },
      data: {
        title,
        slug: newSlug,
        content,
        image: image || null,
        iframeUrl: iframeUrl || null,
      },
    });

    console.log("Updated lesson:", updatedLesson);
    return NextResponse.json(updatedLesson);
  } catch (error) {
    console.error("Error updating lesson:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { slug: string } }
) {
  const { slug } = params;

  try {
    await prisma.lesson.delete({
      where: { slug },
    });

    return NextResponse.json({ message: "Lesson deleted successfully" });
  } catch (error) {
    console.error("Error deleting lesson:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}