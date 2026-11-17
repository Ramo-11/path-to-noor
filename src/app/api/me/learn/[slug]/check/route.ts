import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth-config";
import { getPublicQuizByLessonId } from "@/lib/data";
import { getPathForLesson } from "@/lib/learning";
import { lessonAccess } from "@/components/lesson/lesson-access";
import { toClientQuiz } from "@/components/lesson/check-quiz";
import { getLearnerLessonState, getLessonPlace, loadLesson, toLocale } from "@/components/lesson/lesson-context";
import type { CheckMemberPayload } from "@/components/lesson/member-types";

const HEADERS = { "Cache-Control": "private, no-store" };

export async function GET(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const session = await auth();
  const user = session?.user;
  if (!user?.id) {
    const guest: CheckMemberPayload = { access: "guest" };
    return NextResponse.json(guest, { headers: HEADERS });
  }

  try {
    const { slug } = await params;
    const locale = toLocale(request.nextUrl.searchParams.get("locale") ?? "en");
    const lesson = await loadLesson(slug);
    if (!lesson) return NextResponse.json({ error: "Lesson not found" }, { status: 404, headers: HEADERS });

    if (lessonAccess(lesson, user) === "hidden") {
      const hidden: CheckMemberPayload = { access: "hidden" };
      return NextResponse.json(hidden, { headers: HEADERS });
    }

    const [quizDoc, learner] = await Promise.all([
      getPublicQuizByLessonId(lesson.id),
      getLearnerLessonState(user.id, lesson.id),
    ]);
    const quiz = toClientQuiz(quizDoc, locale);
    const path = await getPathForLesson(lesson.id, learner.completed);
    const place = await getLessonPlace(lesson.id, locale, path, true);

    const payload: CheckMemberPayload = { access: "open", place, quiz };
    return NextResponse.json(payload, { headers: HEADERS });
  } catch (error) {
    console.error("[API] GET /me/learn/check error:", error);
    return NextResponse.json(
      { error: "We could not load your check. Please try again." },
      { status: 500, headers: HEADERS }
    );
  }
}
