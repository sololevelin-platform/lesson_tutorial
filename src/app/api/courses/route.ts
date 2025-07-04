import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { generateSlug, ensureUniqueSlug } from "@/utils/slug"; 

const prisma = new PrismaClient();


export async function GET() {
  console.log("Fetching all courses");
  try {
    const courses = await prisma.course.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        lessons: {
          select: { id: true }
        }
      }
    });

    const coursesWithLessonCount = courses.map(course => ({
      ...course,
      lessonCount: course.lessons.length
    }));

    return NextResponse.json({ courses: coursesWithLessonCount });
  } catch (error) {
    console.error("Error fetching courses:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}


export async function POST(req: Request) {
  try {
    console.log("POST request received for course creation");
    const body = await req.json();
    const { title, description, image, userId } = body;

    if (!title || !description || !userId) {
      return NextResponse.json(
        { error: "Title, description, and userId are required" },
        { status: 400 }
      );
    }

    const baseSlug = generateSlug(title);
    const slug = await ensureUniqueSlug(
      baseSlug,
      async (checkSlug: string) => {
        const existing = await prisma.course.findUnique({
          where: { slug: checkSlug }
        });
        return !!existing;
      }
    );

    const course = await prisma.course.create({
      data: {
        title,
        slug,
        description,
        image: image || null,
        userId: "661e4e31-11fc-47cc-b4ad-dab76744eaa1",
      },
    });

    console.log("Created course:", course);
    return NextResponse.json(course);
  } catch (error) {
    console.error("Error in POST /api/courses:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}