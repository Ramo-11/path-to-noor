import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, isAdminSession } from "@/lib/admin-auth";
import { connectDB } from "@/db/connection";
import { Quiz } from "@/db/models/Quiz";
import { createQuizSchema } from "@/lib/validations";

export async function POST(request: NextRequest) {
  const auth = await requireAdmin();
  if (!isAdminSession(auth)) return auth;

  try {
    const body = await request.json();
    const result = createQuizSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Validation failed", details: result.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    await connectDB();

    // Check that this lesson doesn't already have a quiz (lessonId is unique)
    const existingQuiz = await Quiz.findOne({ lessonId: result.data.lessonId });
    if (existingQuiz) {
      return NextResponse.json(
        { error: "This lesson already has a quiz assigned to it" },
        { status: 409 }
      );
    }

    const quiz = await Quiz.create(result.data);

    return NextResponse.json(
      { data: quiz, message: "Quiz created successfully" },
      { status: 201 }
    );
  } catch (error) {
    console.error("[API] POST /admin/quizzes error:", error);
    return NextResponse.json(
      { error: "Failed to create quiz" },
      { status: 500 }
    );
  }
}
