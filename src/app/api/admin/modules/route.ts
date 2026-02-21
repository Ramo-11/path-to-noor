import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, isAdminSession } from "@/lib/admin-auth";
import { connectDB } from "@/db/connection";
import { Module } from "@/db/models/Module";
import { createModuleSchema, slugify } from "@/lib/validations";

export async function GET() {
  const auth = await requireAdmin();
  if (!isAdminSession(auth)) return auth;

  try {
    await connectDB();

    const modules = await Module.find()
      .select("title slug")
      .sort({ "title.en": 1 })
      .lean();

    const data = modules.map((m) => ({
      _id: m._id.toString(),
      title: m.title,
      slug: m.slug,
    }));

    return NextResponse.json({ data });
  } catch (error) {
    console.error("[API] GET /admin/modules error:", error);
    return NextResponse.json(
      { error: "Failed to fetch modules" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const auth = await requireAdmin();
  if (!isAdminSession(auth)) return auth;

  try {
    const body = await request.json();
    const result = createModuleSchema.safeParse(body);

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
    const existingSlug = await Module.findOne({ slug: result.data.slug });
    if (existingSlug) {
      return NextResponse.json(
        { error: "A module with this slug already exists" },
        { status: 409 }
      );
    }

    const module = await Module.create(result.data);

    return NextResponse.json(
      { data: module, message: "Module created successfully" },
      { status: 201 }
    );
  } catch (error) {
    console.error("[API] POST /admin/modules error:", error);
    return NextResponse.json(
      { error: "Failed to create module" },
      { status: 500 }
    );
  }
}
