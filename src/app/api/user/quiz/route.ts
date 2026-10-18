import { NextRequest, NextResponse } from "next/server";
import { Types } from "mongoose";
import { auth } from "@/lib/auth-config";
import { connectDB } from "@/db/connection";
import { User } from "@/db/models/User";
import { Quiz } from "@/db/models/Quiz";
import { Lesson } from "@/db/models/Lesson";
import { quizSubmitSchema } from "@/lib/validations";
import { lessonAccess } from "@/components/lesson/lesson-access";
import { answersFit, scoreQuiz } from "@/components/lesson/check-scoring";

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid knowledge check answers" }, { status: 400 });
  }
  const parsed = quizSubmitSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid knowledge check answers" }, { status: 400 });
  }
  const { quizId, answers } = parsed.data;

  try {
    await connectDB();

    const quiz = await Quiz.findById(quizId).lean();
    if (!quiz || quiz.questions.length === 0) {
      return NextResponse.json({ error: "Knowledge check not found" }, { status: 404 });
    }

    const lesson = await Lesson.findOne({ _id: quiz.lessonId, published: true })
      .select("_id audience guestAccessible")
      .lean();
    if (!lesson || lessonAccess(lesson, session.user) !== "open") {
      return NextResponse.json({ error: "Knowledge check not found" }, { status: 404 });
    }

    if (!answersFit(quiz.questions, answers)) {
      return NextResponse.json({ error: "This knowledge check has changed" }, { status: 409 });
    }

    const summary = scoreQuiz(quiz.questions, answers, quiz.passingScore);
    const score = summary.score ?? 0;
    const passed = summary.passed === true;

    const quizObjectId = new Types.ObjectId(quizId);
    const resultEntry = { quizId: quizObjectId, score, passed, completedAt: new Date() };
    let saved = false;
    for (let attempt = 0; attempt < 3 && !saved; attempt += 1) {
      const replaced = await User.updateOne(
        { _id: session.user.id, "quizResults.quizId": quizObjectId },
        { $set: { "quizResults.$": resultEntry } }
      );
      if (replaced.matchedCount > 0) {
        saved = true;
        break;
      }
      const added = await User.updateOne(
        { _id: session.user.id, "quizResults.quizId": { $ne: quizObjectId } },
        { $push: { quizResults: resultEntry } }
      );
      saved = added.matchedCount > 0;
      if (!saved && !(await User.exists({ _id: session.user.id }))) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }
    }

    return NextResponse.json({
      data: {
        score,
        passed,
        passingScore: quiz.passingScore,
        correctCount: summary.correctCount,
        totalQuestions: summary.totalQuestions,
        results: summary.results,
      },
    });
  } catch (error) {
    console.error("[API] POST /user/quiz error:", error);
    return NextResponse.json({ error: "Failed to save knowledge check" }, { status: 500 });
  }
}
