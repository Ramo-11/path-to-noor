import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth-config";
import { getPublicQuizByLessonId } from "@/lib/data";
import { getPathForLesson } from "@/lib/learning";
import { lessonAccess } from "@/components/lesson/lesson-access";
import {
  getLearnerLessonState,
  getLessonPlace,
  loadLesson,
  pickLessonContent,
  toLocale,
} from "@/components/lesson/lesson-context";
import type { LessonMemberPayload, MemberContent } from "@/components/lesson/member-types";

const HEADERS = { "Cache-Control": "private, no-store" };

function questionCount(quiz: unknown): number {
  const questions = (quiz as { questions?: unknown } | null)?.questions;
  return Array.isArray(questions) ? questions.length : 0;
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const session = await auth();
  const user = session?.user;
  if (!user?.id) {
    const guest: LessonMemberPayload = { access: "guest" };
    return NextResponse.json(guest, { headers: HEADERS });
  }

  try {
    const { slug } = await params;
    const locale = toLocale(request.nextUrl.searchParams.get("locale") ?? "en");
    const lesson = await loadLesson(slug);
    if (!lesson) return NextResponse.json({ error: "Lesson not found" }, { status: 404, headers: HEADERS });

    if (lessonAccess(lesson, user) === "hidden") {
      const hidden: LessonMemberPayload = { access: "hidden" };
      return NextResponse.json(hidden, { headers: HEADERS });
    }

    const gated = lessonAccess(lesson, null) !== "open";
    const learner = await getLearnerLessonState(user.id, lesson.id);
    const path = await getPathForLesson(lesson.id, learner.completed);
    const place = await getLessonPlace(lesson.id, locale, path, true);

    let content: MemberContent | null = null;
    let hasCheck = false;
    if (gated) {
      const picked = pickLessonContent(lesson, locale);
      const blockMessages =
        picked.hasContent && picked.language !== locale
          ? (await import(`@/messages/${picked.language}/blocks.json`)).default
          : null;
      content = {
        doc: picked.doc,
        language: picked.language,
        isFallback: picked.isFallback,
        hasContent: picked.hasContent,
        blockMessages,
      };
      hasCheck = questionCount(await getPublicQuizByLessonId(lesson.id)) > 0;
    }

    const payload: LessonMemberPayload = {
      access: "open",
      lessonId: lesson.id,
      completed: learner.completed.has(lesson.id),
      saved: learner.saved,
      place,
      minutes: lesson.minutes,
      hasCheck,
      content,
    };
    return NextResponse.json(payload, { headers: HEADERS });
  } catch (error) {
    console.error("[API] GET /me/learn error:", error);
    return NextResponse.json(
      { error: "We could not load your lesson. Please try again." },
      { status: 500, headers: HEADERS }
    );
  }
}
