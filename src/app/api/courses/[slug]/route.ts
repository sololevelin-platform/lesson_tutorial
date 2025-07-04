import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { generateSlug, ensureUniqueSlug } from "@/utils/slug"; 

const prisma = new PrismaClient();

export async function GET(
  req: Request,
  { params }: { params: { slug: string } }
) {
  const { slug } = await params; 

  try {
    const course = await prisma.course.findUnique({
      where: { slug },
      include: {
        lessons: {
          orderBy: { createdAt: 'asc' },
          select: {
            id: true,
            title: true,
            slug: true,
            content: true,
            image: true,
            iframeUrl: true,
            createdAt: true,
            updatedAt: true,
            courseId: true,
          }
        }
      }
    });

    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    return NextResponse.json({ course });
  } catch (error) {
    console.error("Error fetching course:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(req: Request,{ params }: { params: { slug: string } }) {
  const { slug } = await params; 
  const { title, description, image } = await req.json();

  try {
    const currentCourse = await prisma.course.findUnique({
      where: { slug },
    });

    if (!currentCourse) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    let newSlug = slug;
    if (title !== currentCourse.title) {
      const baseSlug = generateSlug(title);
      newSlug = await ensureUniqueSlug(
        baseSlug,
        async (checkSlug: string) => {
          if (checkSlug === slug) return false;
          const existing = await prisma.course.findUnique({
            where: { slug: checkSlug }
          });
          return !!existing;
        }
      );
    }

    const updatedCourse = await prisma.course.update({
      where: { slug },
      data: {
        title,
        slug: newSlug,
        description,
        image: image || null,
      },
    });

    console.log("Updated course:", updatedCourse);
    return NextResponse.json(updatedCourse);
  } catch (error) {
    console.error("Error updating course:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}