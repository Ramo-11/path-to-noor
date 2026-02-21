import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, isAdminSession } from "@/lib/admin-auth";
import { connectDB } from "@/db/connection";
import { Lesson } from "@/db/models/Lesson";
import { updateLessonSchema } from "@/lib/validations";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin();
  if (!isAdminSession(auth)) return auth;

  const { id } = await params;

  try {
    await connectDB();

    const lesson = await Lesson.findById(id);
    if (!lesson) {
      return NextResponse.json({ error: "Lesson not found" }, { status: 404 });
    }

    return NextResponse.json({ data: lesson });
  } catch (error) {
    console.error(`[API] GET /admin/lessons/${id} error:`, error);
    return NextResponse.json(
      { error: "Failed to fetch lesson" },
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
    const result = updateLessonSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Validation failed", details: result.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    await connectDB();

    const existing = await Lesson.findById(id);
    if (!existing) {
      return NextResponse.json({ error: "Lesson not found" }, { status: 404 });
    }

    // Check slug uniqueness if slug is being changed
    if (result.data.slug && result.data.slug !== existing.slug) {
      const slugTaken = await Lesson.findOne({ slug: result.data.slug, _id: { $ne: id } });
      if (slugTaken) {
        return NextResponse.json(
          { error: "A lesson with this slug already exists" },
          { status: 409 }
        );
      }
    }

    const updated = await Lesson.findByIdAndUpdate(
      id,
      { $set: result.data },
      { new: true, runValidators: true }
    );

    return NextResponse.json({
      data: updated,
      message: "Lesson updated successfully",
    });
  } catch (error) {
    console.error(`[API] PUT /admin/lessons/${id} error:`, error);
    return NextResponse.json(
      { error: "Failed to update lesson" },
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

    const lesson = await Lesson.findById(id);
    if (!lesson) {
      return NextResponse.json({ error: "Lesson not found" }, { status: 404 });
    }

    await Lesson.findByIdAndDelete(id);

    return NextResponse.json({ message: "Lesson deleted successfully" });
  } catch (error) {
    console.error(`[API] DELETE /admin/lessons/${id} error:`, error);
    return NextResponse.json(
      { error: "Failed to delete lesson" },
      { status: 500 }
    );
  }
}
