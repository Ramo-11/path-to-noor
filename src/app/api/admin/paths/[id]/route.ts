import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, isAdminSession } from "@/lib/admin-auth";
import { connectDB } from "@/db/connection";
import { LearningPath } from "@/db/models/LearningPath";
import { updateLearningPathSchema } from "@/lib/validations";
import { isStageKey } from "@/lib/stages";
import { normalizeTracks, pathTracksSchema, type TrackKey } from "@/lib/tracks";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin();
  if (!isAdminSession(auth)) return auth;

  const { id } = await params;

  try {
    await connectDB();
    const path = await LearningPath.findById(id);
    if (!path) {
      return NextResponse.json({ error: "Learning path not found" }, { status: 404 });
    }
    return NextResponse.json({ data: path });
  } catch (error) {
    console.error(`[API] GET /admin/paths/${id} error:`, error);
    return NextResponse.json({ error: "Failed to fetch learning path" }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin();
  if (!isAdminSession(auth)) return auth;

  const { id } = await params;

  try {
    const body = await request.json();
    const result = updateLearningPathSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Validation failed", details: result.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    let tracks: TrackKey[] | undefined;
    if (body?.tracks !== undefined) {
      const tracksResult = pathTracksSchema.safeParse(body.tracks);
      if (!tracksResult.success) {
        return NextResponse.json(
          { error: "Choose at least one track", details: { tracks: ["Choose at least one track"] } },
          { status: 400 }
        );
      }
      tracks = tracksResult.data;
    }

    await connectDB();

    const existing = await LearningPath.findById(id);
    if (!existing) {
      return NextResponse.json({ error: "Learning path not found" }, { status: 404 });
    }

    const set: Record<string, unknown> = { ...result.data };
    const unset: Record<string, 1> = {};
    const effectiveTracks = tracks ?? normalizeTracks(existing.tracks);
    if (tracks) set.tracks = tracks;
    if (!effectiveTracks.includes("new")) {
      delete set.stage;
      unset.stage = 1;
    } else if (!set.stage && !isStageKey(existing.stage)) {
      return NextResponse.json(
        { error: "Choose a stage for paths in the New to Islam track", details: { stage: ["Required"] } },
        { status: 400 }
      );
    }

    // Check slug uniqueness if slug is being changed
    if (result.data.slug && result.data.slug !== existing.slug) {
      const slugTaken = await LearningPath.findOne({ slug: result.data.slug, _id: { $ne: id } });
      if (slugTaken) {
        return NextResponse.json(
          { error: "A learning path with this slug already exists" },
          { status: 409 }
        );
      }
    }

    const updated = await LearningPath.findByIdAndUpdate(
      id,
      Object.keys(unset).length > 0 ? { $set: set, $unset: unset } : { $set: set },
      { new: true, runValidators: true }
    );

    return NextResponse.json({
      data: updated,
      message: "Learning path updated successfully",
    });
  } catch (error) {
    console.error(`[API] PUT /admin/paths/${id} error:`, error);
    return NextResponse.json(
      { error: "Failed to update learning path" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin();
  if (!isAdminSession(auth)) return auth;

  const { id } = await params;

  try {
    await connectDB();

    const learningPath = await LearningPath.findById(id);
    if (!learningPath) {
      return NextResponse.json({ error: "Learning path not found" }, { status: 404 });
    }

    await LearningPath.findByIdAndDelete(id);

    return NextResponse.json({ message: "Learning path deleted successfully" });
  } catch (error) {
    console.error(`[API] DELETE /admin/paths/${id} error:`, error);
    return NextResponse.json(
      { error: "Failed to delete learning path" },
      { status: 500 }
    );
  }
}
