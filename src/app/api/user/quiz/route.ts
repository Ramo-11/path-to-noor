import { NextRequest, NextResponse } from "next/server";
import { Types } from "mongoose";
import { auth } from "@/lib/auth-config";
import { connectDB } from "@/db/connection";
import { User } from "@/db/models/User";
import { Quiz } from "@/db/models/Quiz";
import { quizSubmitSchema } from "@/lib/validations";

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const parsed = quizSubmitSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid quiz submission" },
        { status: 400 }
      );
    }
    const { quizId, answers } = parsed.data;

    await connectDB();

    const quiz = await Quiz.findById(quizId).lean();
    if (!quiz) {
      return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
    }

    if (answers.length !== quiz.questions.length) {
      return NextResponse.json(
        { error: "Answers count does not match question count" },
        { status: 400 }
      );
    }

    // Score the quiz: answers is an array of selected option indices per question
    let correctCount = 0;
    const results = quiz.questions.map((question, qIndex) => {
      const rawIndex = answers[qIndex];
      const optionsLen = question.options.length;
      const selectedIndex =
        typeof rawIndex === "number" && rawIndex >= 0 && rawIndex < optionsLen
          ? rawIndex
          : -1;
      const correctIndex = question.options.findIndex((opt) => opt.isCorrect);
      const isCorrect = selectedIndex === correctIndex;
      if (isCorrect) correctCount++;

      return {
        questionIndex: qIndex,
        selectedIndex,
        correctIndex,
        isCorrect,
        explanation: question.explanation,
      };
    });

    const score = Math.round((correctCount / quiz.questions.length) * 100);
    const passed = score >= quiz.passingScore;

    // Save the result to the user's quizResults
    const user = await User.findById(session.user.id);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Replace previous attempt for this quiz (keep latest only)
    const existingIndex = user.quizResults.findIndex(
      (r) => r.quizId.toString() === quizId
    );
    const resultEntry = {
      quizId: new Types.ObjectId(quizId),
      score,
      passed,
      completedAt: new Date(),
    };

    if (existingIndex >= 0) {
      user.quizResults[existingIndex] = resultEntry as typeof user.quizResults[number];
    } else {
      user.quizResults.push(resultEntry as typeof user.quizResults[number]);
    }
    await user.save();

    return NextResponse.json({
      data: {
        score,
        passed,
        passingScore: quiz.passingScore,
        correctCount,
        totalQuestions: quiz.questions.length,
        results,
      },
    });
  } catch (error) {
    console.error("[API] POST /user/quiz error:", error);
    return NextResponse.json(
      { error: "Failed to submit quiz" },
      { status: 500 }
    );
  }
}
