import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth-config";
import { connectDB } from "@/db/connection";
import { Lesson } from "@/db/models/Lesson";
import { Quiz } from "@/db/models/Quiz";
import { getClientIp, rateLimit } from "@/lib/rate-limit";
import { lessonAccess } from "@/components/lesson/lesson-access";
import { answersFit, scoreQuiz } from "@/components/lesson/check-scoring";

const scoreSchema = z.object({
  answers: z.array(z.number().int().min(0).max(50).nullable()).min(1).max(200),
});

export async function POST(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const limit = rateLimit(`quiz-score:${getClientIp(request.headers)}`, 120, 10 * 60 * 1000);
  if (!limit.success) {
    return NextResponse.json({ error: "Too many requests. Please wait a moment." }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid answers" }, { status: 400 });
  }
  const parsed = scoreSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid answers" }, { status: 400 });
  }

  try {
    const { slug } = await params;
    if (!slug || slug.length > 200) {
      return NextResponse.json({ error: "Lesson not found" }, { status: 404 });
    }

    await connectDB();
    const lesson = await Lesson.findOne({ slug, published: true })
      .select("_id audience guestAccessible")
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

    const { answers } = parsed.data;
    if (!answersFit(quiz.questions, answers)) {
      return NextResponse.json({ error: "This knowledge check has changed" }, { status: 409 });
    }

    return NextResponse.json({ data: scoreQuiz(quiz.questions, answers, quiz.passingScore) });
  } catch (error) {
    console.error("[API] POST /public/quiz/[slug]/score error:", error);
    return NextResponse.json({ error: "Failed to check answers" }, { status: 500 });
  }
}
