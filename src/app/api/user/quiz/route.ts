import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth-config";
import { connectDB } from "@/db/connection";
import { User } from "@/db/models/User";
import { Quiz } from "@/db/models/Quiz";

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { quizId, answers } = await request.json();

    if (!quizId || !Array.isArray(answers)) {
      return NextResponse.json(
        { error: "quizId and answers array are required" },
        { status: 400 }
      );
    }

    await connectDB();

    const quiz = await Quiz.findById(quizId).lean();
    if (!quiz) {
      return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
    }

    // Score the quiz: answers is an array of selected option indices per question
    let correctCount = 0;
    const results = quiz.questions.map((question, qIndex) => {
      const selectedIndex = answers[qIndex] as number | undefined;
      const correctIndex = question.options.findIndex((opt) => opt.isCorrect);
      const isCorrect = selectedIndex === correctIndex;
      if (isCorrect) correctCount++;

      return {
        questionIndex: qIndex,
        selectedIndex: selectedIndex ?? -1,
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
      quizId,
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
