import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, isAdminSession } from "@/lib/admin-auth";
import { connectDB } from "@/db/connection";
import { LearningPath } from "@/db/models/LearningPath";
import { createLearningPathSchema, slugify } from "@/lib/validations";
import { DEFAULT_PATH_TRACKS, pathTracksSchema } from "@/lib/tracks";

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

    const tracksResult =
      body?.tracks === undefined
        ? { success: true as const, data: [...DEFAULT_PATH_TRACKS] }
        : pathTracksSchema.safeParse(body.tracks);
    if (!tracksResult.success) {
      return NextResponse.json(
        { error: "Choose at least one track", details: { tracks: ["Choose at least one track"] } },
        { status: 400 }
      );
    }
    const tracks = tracksResult.data;

    await connectDB();

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

    const { stage, ...rest } = result.data;
    const learningPath = await LearningPath.create(
      tracks.includes("new") ? { ...rest, stage, tracks } : { ...rest, tracks }
    );

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
