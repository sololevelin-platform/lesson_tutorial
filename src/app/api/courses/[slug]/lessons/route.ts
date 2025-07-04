import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { generateSlug, ensureUniqueSlug } from "@/utils/slug"; // Keep for POST

const prisma = new PrismaClient();

export async function GET(
  req: Request,
  { params }: { params: { slug: string } } 
) {
  const { slug: courseSlug } = params;

  try {
    const course = await prisma.course.findUnique({
      where: { slug: courseSlug },
      include: {
        lessons: {
          orderBy: { createdAt: 'asc' }
        }
      }
    });

    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    return NextResponse.json({ lessons: course.lessons });
  } catch (error) {
    console.error("Error fetching lessons for course:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(
  req: Request,
  { params }: { params: { slug: string } } 
) {
  try {
    const { slug: courseSlug } = params;
    const body = await req.json();
    const { title, content, image, iframeUrl } = body;

    if (!title || !content) {
      return NextResponse.json(
        { error: "Title and content are required" },
        { status: 400 }
      );
    }

    const course = await prisma.course.findUnique({
      where: { slug: courseSlug },
    });

    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    const baseSlug = generateSlug(title);
    const lessonSlug = await ensureUniqueSlug(
      baseSlug,
      async (checkSlug: string) => {
        const existing = await prisma.lesson.findUnique({
          where: { slug: checkSlug }
        });
        return !!existing;
      }
    );

    const lesson = await prisma.lesson.create({
      data: {
        title,
        slug: lessonSlug,
        content,
        image: image || null,
        iframeUrl: iframeUrl || null,
        courseId: course.id, 
      },
    });

    console.log("Created lesson:", lesson);
    return NextResponse.json(lesson);
  } catch (error) {
    console.error("Error in POST /api/courses/[slug]/lessons:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}