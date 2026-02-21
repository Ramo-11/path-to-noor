import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, isAdminSession } from "@/lib/admin-auth";
import { connectDB } from "@/db/connection";
import { Quiz } from "@/db/models/Quiz";
import { updateQuizSchema } from "@/lib/validations";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin();
  if (!isAdminSession(auth)) return auth;

  const { id } = await params;

  try {
    await connectDB();

    const quiz = await Quiz.findById(id).populate("lessonId", "title slug");
    if (!quiz) {
      return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
    }

    return NextResponse.json({ data: quiz });
  } catch (error) {
    console.error(`[API] GET /admin/quizzes/${id} error:`, error);
    return NextResponse.json(
      { error: "Failed to fetch quiz" },
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
    const result = updateQuizSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Validation failed", details: result.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    await connectDB();

    const existing = await Quiz.findById(id);
    if (!existing) {
      return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
    }

    // If lessonId is changing, check uniqueness
    if (
      result.data.lessonId &&
      result.data.lessonId !== existing.lessonId.toString()
    ) {
      const conflict = await Quiz.findOne({
        lessonId: result.data.lessonId,
        _id: { $ne: id },
      });
      if (conflict) {
        return NextResponse.json(
          { error: "This lesson already has a quiz assigned to it" },
          { status: 409 }
        );
      }
    }

    const updated = await Quiz.findByIdAndUpdate(
      id,
      { $set: result.data },
      { new: true, runValidators: true }
    );

    return NextResponse.json({
      data: updated,
      message: "Quiz updated successfully",
    });
  } catch (error) {
    console.error(`[API] PUT /admin/quizzes/${id} error:`, error);
    return NextResponse.json(
      { error: "Failed to update quiz" },
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

    const quiz = await Quiz.findById(id);
    if (!quiz) {
      return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
    }

    await Quiz.findByIdAndDelete(id);

    return NextResponse.json({ message: "Quiz deleted successfully" });
  } catch (error) {
    console.error(`[API] DELETE /admin/quizzes/${id} error:`, error);
    return NextResponse.json(
      { error: "Failed to delete quiz" },
      { status: 500 }
    );
  }
}
