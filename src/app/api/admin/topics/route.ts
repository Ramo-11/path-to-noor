import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, isAdminSession } from "@/lib/admin-auth";
import { connectDB } from "@/db/connection";
import { Topic } from "@/db/models/Topic";
import { createTopicSchema, slugify } from "@/lib/validations";

export async function POST(request: NextRequest) {
  const auth = await requireAdmin();
  if (!isAdminSession(auth)) return auth;

  try {
    const body = await request.json();
    const result = createTopicSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Validation failed", details: result.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    await connectDB();

    // Auto-generate slug from English name if not provided
    if (!result.data.slug) {
      result.data.slug = slugify(result.data.name.en);
    }

    // Check slug uniqueness
    const existingSlug = await Topic.findOne({ slug: result.data.slug });
    if (existingSlug) {
      return NextResponse.json(
        { error: "A topic with this slug already exists" },
        { status: 409 }
      );
    }

    const topic = await Topic.create(result.data);

    return NextResponse.json(
      { data: topic, message: "Topic created successfully" },
      { status: 201 }
    );
  } catch (error) {
    console.error("[API] POST /admin/topics error:", error);
    return NextResponse.json(
      { error: "Failed to create topic" },
      { status: 500 }
    );
  }
}
