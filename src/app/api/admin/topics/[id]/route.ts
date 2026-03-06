import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, isAdminSession } from "@/lib/admin-auth";
import { connectDB } from "@/db/connection";
import { Topic } from "@/db/models/Topic";
import { Module } from "@/db/models/Module";
import { updateTopicSchema } from "@/lib/validations";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin();
  if (!isAdminSession(auth)) return auth;

  const { id } = await params;

  try {
    await connectDB();

    const topic = await Topic.findById(id).populate("parent", "name slug");
    if (!topic) {
      return NextResponse.json({ error: "Topic not found" }, { status: 404 });
    }

    return NextResponse.json({ data: topic });
  } catch (error) {
    console.error(`[API] GET /admin/topics/${id} error:`, error);
    return NextResponse.json(
      { error: "Failed to fetch topic" },
      { status: 500 }
    );
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
    const result = updateTopicSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Validation failed", details: result.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    await connectDB();

    const existing = await Topic.findById(id);
    if (!existing) {
      return NextResponse.json({ error: "Topic not found" }, { status: 404 });
    }

    // Check slug uniqueness if slug is being changed
    if (result.data.slug && result.data.slug !== existing.slug) {
      const slugTaken = await Topic.findOne({ slug: result.data.slug, _id: { $ne: id } });
      if (slugTaken) {
        return NextResponse.json(
          { error: "A topic with this slug already exists" },
          { status: 409 }
        );
      }
    }

    const updated = await Topic.findByIdAndUpdate(
      id,
      { $set: result.data },
      { new: true, runValidators: true }
    );

    return NextResponse.json({
      data: updated,
      message: "Topic updated successfully",
    });
  } catch (error) {
    console.error(`[API] PUT /admin/topics/${id} error:`, error);
    return NextResponse.json(
      { error: "Failed to update topic" },
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

    const topic = await Topic.findById(id);
    if (!topic) {
      return NextResponse.json({ error: "Topic not found" }, { status: 404 });
    }

    // Check for subtopics
    const subtopicCount = await Topic.countDocuments({ parent: id });
    if (subtopicCount > 0) {
      return NextResponse.json(
        {
          error: `Cannot delete this topic because it has ${subtopicCount} subtopic(s). Delete or reassign them first.`,
        },
        { status: 409 }
      );
    }

    // Check if any modules reference this topic
    const referencingModules = await Module.find(
      { topics: id },
      { title: 1 }
    ).lean();

    if (referencingModules.length > 0) {
      const moduleNames = referencingModules
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .map((m: any) => `"${m.title?.en || m.title}"`)
        .join(", ");
      return NextResponse.json(
        {
          error: `Cannot delete this topic because it is used in modules: ${moduleNames}. Remove it from those modules first.`,
        },
        { status: 409 }
      );
    }

    await Topic.findByIdAndDelete(id);

    return NextResponse.json({ message: "Topic deleted successfully" });
  } catch (error) {
    console.error(`[API] DELETE /admin/topics/${id} error:`, error);
    return NextResponse.json(
      { error: "Failed to delete topic" },
      { status: 500 }
    );
  }
}
