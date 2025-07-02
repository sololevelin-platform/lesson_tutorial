import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { generateSlug, ensureUniqueSlug } from "@/utils/slug";

const prisma = new PrismaClient();

export async function GET() {
  console.log("Fetching all lessons");

  const lessons = await prisma.lesson.findMany({
    orderBy: { createdAt: 'desc' }
  });
  return NextResponse.json({ lessons });
}

export async function POST(req: Request) {
  try {
    console.log("POST request received");
    
    const body = await req.json();
    console.log("Request body:", body);
    
    const { title, content, image, iframeUrl } = body;

    // Validate required fields
    if (!title || !content) {
      return NextResponse.json(
        { error: "Title and content are required" },
        { status: 400 }
      );
    }

    const baseSlug = generateSlug(title);
    console.log("Generated base slug:", baseSlug);

    const slug = await ensureUniqueSlug(
      baseSlug,
      async (checkSlug: string) => {
        const existing = await prisma.lesson.findUnique({
          where: { slug: checkSlug }
        });
        return !!existing;
      }
    );

    console.log("Final slug:", slug);

    const lesson = await prisma.lesson.create({
      data: {
        title,
        slug,
        content,
        image: image || null,
        iframeUrl: iframeUrl || null,
        userId: "4c56bbf9-32be-4d0d-a6f0-42e576c7791e",
      },
    });

    console.log("Created lesson:", lesson);
    return NextResponse.json(lesson);
  } catch (error) {
    console.error("Error in POST /api/lessons:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}