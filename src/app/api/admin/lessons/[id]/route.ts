import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { requireAdmin, isAdminSession } from "@/lib/admin-auth";
import { connectDB } from "@/db/connection";
import { Lesson } from "@/db/models/Lesson";
import { Module } from "@/db/models/Module";
import { Quiz } from "@/db/models/Quiz";
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

    // If moduleId is changing, update both old and new module's lessons arrays
    const newModuleId = result.data.moduleId;
    if (newModuleId && newModuleId.toString() !== existing.moduleId.toString()) {
      // Remove from old module
      await Module.findByIdAndUpdate(existing.moduleId, {
        $pull: { lessons: { lessonId: id } },
      });

      // Add to new module
      const maxOrder = await Module.aggregate([
        { $match: { _id: new mongoose.Types.ObjectId(newModuleId.toString()) } },
        { $unwind: { path: "$lessons", preserveNullAndEmptyArrays: true } },
        { $group: { _id: null, maxOrder: { $max: "$lessons.order" } } },
      ]);
      const nextOrder = (maxOrder[0]?.maxOrder ?? 0) + 1;

      await Module.findByIdAndUpdate(newModuleId, {
        $push: { lessons: { lessonId: id, order: nextOrder } },
      });
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

    // Check if any modules reference this lesson
    const referencingModules = await Module.find(
      { "lessons.lessonId": id },
      { title: 1 }
    ).lean();

    if (referencingModules.length > 0) {
      const moduleNames = referencingModules
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .map((m: any) => `"${m.title?.en || m.title}"`)
        .join(", ");
      return NextResponse.json(
        {
          error: `Cannot delete this lesson because it is used in modules: ${moduleNames}. Remove it from those modules first.`,
        },
        { status: 409 }
      );
    }

    // Check if a quiz exists for this lesson
    const quiz = await Quiz.findOne({ lessonId: id });
    if (quiz) {
      return NextResponse.json(
        {
          error: "Cannot delete this lesson because it has an associated quiz. Delete the quiz first.",
        },
        { status: 409 }
      );
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
