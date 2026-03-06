import { NextResponse } from "next/server";
import { connectDB } from "@/db/connection";
import { Lesson } from "@/db/models/Lesson";
import { Quiz } from "@/db/models/Quiz";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    await connectDB();

    const lesson = await Lesson.findOne({ slug, published: true })
      .select("_id title")
      .lean();

    if (!lesson) {
      return NextResponse.json({ error: "Lesson not found" }, { status: 404 });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const lessonAny = lesson as any;
    const quiz = await Quiz.findOne({ lessonId: lessonAny._id }).lean();

    if (!quiz) {
      return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const quizAny = quiz as any;

    // Strip isCorrect from options so clients can't cheat
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sanitizedQuestions = quizAny.questions.map((q: any) => ({
      question: q.question,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      options: q.options.map((opt: any) => ({
        text: opt.text,
      })),
      explanation: { en: "", ar: "" },
    }));

    return NextResponse.json({
      data: {
        quiz: {
          _id: quizAny._id.toString(),
          lessonId: quizAny.lessonId.toString(),
          passingScore: quizAny.passingScore,
          questions: sanitizedQuestions,
        },
        lessonTitle: lessonAny.title,
      },
    });
  } catch (error) {
    console.error("[API] GET /public/quiz/[slug] error:", error);
    return NextResponse.json(
      { error: "Failed to fetch quiz" },
      { status: 500 }
    );
  }
}
