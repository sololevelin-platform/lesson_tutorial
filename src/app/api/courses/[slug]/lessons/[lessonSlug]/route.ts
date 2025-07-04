import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { generateSlug, ensureUniqueSlug } from "@/utils/slug"; // Keep for PUT

const prisma = new PrismaClient();

export async function GET(
  req: Request,
  { params }: { params: { slug: string; lessonSlug: string } }
) {
  const { slug: courseSlug, lessonSlug } = params;

  try {
    const lesson = await prisma.lesson.findUnique({
      where: {
        slug: lessonSlug,
        course: { slug: courseSlug } 
      },
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

export async function PUT(req: Request,{ params }: { params: { slug: string; lessonSlug: string } }) {
  const { slug: courseSlug, lessonSlug } = params;
  const { title, content, image, iframeUrl } = await req.json();

  try {
    const currentLesson = await prisma.lesson.findUnique({
      where: {
        slug: lessonSlug,
        course: { slug: courseSlug }
      },
    });

    if (!currentLesson) {
      return NextResponse.json({ error: "Lesson not found" }, { status: 404 });
    }

    let newLessonSlug = lessonSlug;
    if (title !== currentLesson.title) {
      const baseSlug = generateSlug(title);
      newLessonSlug = await ensureUniqueSlug(
        baseSlug,
        async (checkSlug: string) => {
          if (checkSlug === lessonSlug) return false;
          const existing = await prisma.lesson.findUnique({
            where: { slug: checkSlug }
          });
          return !!existing;
        }
      );
    }

    const updatedLesson = await prisma.lesson.update({
      where: {
        slug: lessonSlug,
        course: { slug: courseSlug }
      },
      data: {
        title,
        slug: newLessonSlug,
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
