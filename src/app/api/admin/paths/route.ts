import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, isAdminSession } from "@/lib/admin-auth";
import { connectDB } from "@/db/connection";
import { LearningPath } from "@/db/models/LearningPath";
import { createLearningPathSchema, slugify } from "@/lib/validations";

export async function POST(request: NextRequest) {
  const auth = await requireAdmin();
  if (!isAdminSession(auth)) return auth;

  try {
    const body = await request.json();
    const result = createLearningPathSchema.safeParse(body);

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
    const existingSlug = await LearningPath.findOne({ slug: result.data.slug });
    if (existingSlug) {
      return NextResponse.json(
        { error: "A learning path with this slug already exists" },
        { status: 409 }
      );
    }

    const learningPath = await LearningPath.create(result.data);

    return NextResponse.json(
      { data: learningPath, message: "Learning path created successfully" },
      { status: 201 }
    );
  } catch (error) {
    console.error("[API] POST /admin/paths error:", error);
    return NextResponse.json(
      { error: "Failed to create learning path" },
      { status: 500 }
    );
  }
}
