import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth-config";
import { connectDB } from "@/db/connection";
import { User } from "@/db/models/User";
import { Lesson } from "@/db/models/Lesson";
import { Quiz } from "@/db/models/Quiz";
import { MentorRequest } from "@/db/models/MentorRequest";
import { rateLimitShared, getClientIp } from "@/lib/rate-limit";

type Titles = { en?: string; ar?: string; es?: string };

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const limit = await rateLimitShared(
    `export-data:${session.user.id}:${getClientIp(request.headers)}`,
    5,
    60 * 60 * 1000
  );
  if (!limit.success) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }

  try {
    await connectDB();
    const user = await User.findById(session.user.id)
      .select(
        "email name role userType preferredLanguage progress bookmarks quizResults completedTopics placement createdAt lastLoginAt"
      )
      .lean();
    if (!user) {
      return NextResponse.json({ error: "not_found" }, { status: 404 });
    }

    const progress = user.progress ?? [];
    const bookmarks = user.bookmarks ?? [];
    const quizResults = user.quizResults ?? [];

    const quizzes = await Quiz.find({ _id: { $in: quizResults.map((r) => r.quizId) } })
      .select("lessonId")
      .lean();
    const lessonByQuiz = new Map(quizzes.map((q) => [String(q._id), String(q.lessonId)]));

    const lessonIds = new Set<string>([
      ...progress.map((p) => String(p.lessonId)),
      ...bookmarks.map((b) => String(b)),
      ...lessonByQuiz.values(),
    ]);
    const lessons = await Lesson.find({ _id: { $in: Array.from(lessonIds) } })
      .select("title slug")
      .lean();
    const lessonById = new Map(lessons.map((l) => [String(l._id), l]));
    const lessonRef = (id: unknown) => {
      const lesson = lessonById.get(String(id));
      return lesson
        ? { slug: lesson.slug, title: lesson.title as Titles }
        : { slug: null, title: null };
    };

    const requests = await MentorRequest.find({ revertId: user._id })
      .select("status message createdAt updatedAt mentorId")
      .sort({ createdAt: 1 })
      .lean();

    const payload = {
      exportedAt: new Date().toISOString(),
      profile: {
        name: user.name,
        email: user.email,
        accountType: user.userType ?? null,
        preferredLanguage: user.preferredLanguage,
        joinedAt: user.createdAt,
        lastLoginAt: user.lastLoginAt ?? null,
      },
      placement: user.placement
        ? {
            stage: user.placement.stage,
            answers: user.placement.answers ?? {},
            takenAt: user.placement.takenAt,
          }
        : null,
      progress: progress.map((p) => ({ ...lessonRef(p.lessonId), completedAt: p.completedAt })),
      bookmarks: bookmarks.map((b) => lessonRef(b)),
      quizResults: quizResults.map((r) => ({
        lesson: lessonRef(lessonByQuiz.get(String(r.quizId))),
        score: r.score,
        passed: r.passed,
        completedAt: r.completedAt,
      })),
      mentorRequests: requests.map((r) => ({
        status: r.status,
        message: r.message ?? "",
        hasMentor: Boolean(r.mentorId),
        requestedAt: r.createdAt,
        updatedAt: r.updatedAt,
      })),
    };

    const day = new Date().toISOString().slice(0, 10);
    return new NextResponse(JSON.stringify(payload, null, 2), {
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Content-Disposition": `attachment; filename="basmet-dawah-my-data-${day}.json"`,
        "Cache-Control": "private, no-store",
      },
    });
  } catch (error) {
    console.error("[API] GET /user/export error:", error);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}
