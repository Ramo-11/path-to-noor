import { NextResponse } from "next/server";
import { auth } from "@/lib/auth-config";
import { connectDB } from "@/db/connection";
import { Lesson } from "@/db/models/Lesson";
import { Quiz } from "@/db/models/Quiz";
import { lessonAccess } from "@/components/lesson/lesson-access";

export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;
    if (!slug || slug.length > 200) {
      return NextResponse.json({ error: "Lesson not found" }, { status: 404 });
    }

    await connectDB();
    const lesson = await Lesson.findOne({ slug, published: true })
      .select("_id title audience guestAccessible")
      .lean();
    if (!lesson) {
      return NextResponse.json({ error: "Lesson not found" }, { status: 404 });
    }

    const session = await auth();
    const access = lessonAccess(lesson, session?.user);
    if (access === "hidden") {
      return NextResponse.json({ error: "Lesson not found" }, { status: 404 });
    }
    if (access === "signIn") {
      return NextResponse.json({ error: "Sign in required" }, { status: 401 });
    }

    const quiz = await Quiz.findOne({ lessonId: lesson._id }).lean();
    if (!quiz || quiz.questions.length === 0) {
      return NextResponse.json({ error: "Knowledge check not found" }, { status: 404 });
    }

    return NextResponse.json({
      data: {
        quiz: {
          _id: quiz._id.toString(),
          lessonId: quiz.lessonId.toString(),
          passingScore: quiz.passingScore,
          questions: quiz.questions.map((question) => ({
            question: question.question,
            options: question.options.map((option) => ({ text: option.text })),
          })),
        },
        lessonTitle: lesson.title,
      },
    });
  } catch (error) {
    console.error("[API] GET /public/quiz/[slug] error:", error);
    return NextResponse.json({ error: "Failed to fetch knowledge check" }, { status: 500 });
  }
}
