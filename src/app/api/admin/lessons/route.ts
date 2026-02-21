import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, isAdminSession } from "@/lib/admin-auth";
import { connectDB } from "@/db/connection";
import { Lesson } from "@/db/models/Lesson";
import { createLessonSchema, slugify } from "@/lib/validations";

export async function GET() {
  const auth = await requireAdmin();
  if (!isAdminSession(auth)) return auth;

  try {
    await connectDB();

    const lessons = await Lesson.find()
      .select("_id title")
      .sort({ "title.en": 1 })
      .lean();

    const data = lessons.map((l) => ({
      _id: l._id.toString(),
      title: l.title,
    }));

    return NextResponse.json({ data });
  } catch (error) {
    console.error("[API] GET /admin/lessons error:", error);
    return NextResponse.json(
      { error: "Failed to fetch lessons" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const auth = await requireAdmin();
  if (!isAdminSession(auth)) return auth;

  try {
    const body = await request.json();
    const result = createLessonSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Validation failed", details: result.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    await connectDB();

    // Auto-generate slug from English title if not provided
    if (!result.data.slug) {
      result.data.slug = slugify(result.data.title.en);
    }

    // Check slug uniqueness
    const existingSlug = await Lesson.findOne({ slug: result.data.slug });
    if (existingSlug) {
      return NextResponse.json(
        { error: "A lesson with this slug already exists" },
        { status: 409 }
      );
    }

    const lesson = await Lesson.create(result.data);

    return NextResponse.json(
      { data: lesson, message: "Lesson created successfully" },
      { status: 201 }
    );
  } catch (error) {
    console.error("[API] POST /admin/lessons error:", error);
    return NextResponse.json(
      { error: "Failed to create lesson" },
      { status: 500 }
    );
  }
}
