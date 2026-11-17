import { NextResponse } from "next/server";
import { auth } from "@/lib/auth-config";
import { connectDB } from "@/db/connection";
import { User } from "@/db/models/User";
import { Lesson } from "@/db/models/Lesson";
import { MentorRequest } from "@/db/models/MentorRequest";
import type { LocalizedText } from "@/lib/stages";
import type { JourneyExtras, JourneyPayload } from "@/components/journey/journey-types";

const HEADERS = { "Cache-Control": "private, no-store" };

interface LeanUserDoc {
  progress?: Array<{ lessonId: unknown; completedAt: Date }>;
  bookmarks?: unknown[];
  quizResults?: unknown[];
}

interface LeanLessonDoc {
  _id: unknown;
  title: LocalizedText;
  slug: string;
}

export async function GET() {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    const guest: JourneyPayload = { access: "guest" };
    return NextResponse.json(guest, { headers: HEADERS });
  }

  try {
    await connectDB();
    const userDoc = (await User.findById(userId)
      .select("progress bookmarks quizResults")
      .lean()) as LeanUserDoc | null;

    const progress = userDoc?.progress ?? [];
    const recentProgress = [...progress]
      .sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime())
      .slice(0, 5);
    const recentLessonIds = recentProgress.map((entry) => String(entry.lessonId));
    const recentLessons = recentLessonIds.length
      ? ((await Lesson.find({ _id: { $in: recentLessonIds } })
          .select("title slug")
          .lean()) as LeanLessonDoc[])
      : [];
    const lessonMap = new Map(recentLessons.map((lesson) => [String(lesson._id), lesson]));
    const recentItems = recentProgress.reduce<JourneyExtras["recentItems"]>((acc, entry) => {
      const lesson = lessonMap.get(String(entry.lessonId));
      if (lesson) {
        acc.push({
          slug: lesson.slug,
          title: lesson.title,
          completedAt: new Date(entry.completedAt).toISOString(),
        });
      }
      return acc;
    }, []);

    const mentorRequest = (await MentorRequest.findOne({
      revertId: userId,
      status: { $in: ["pending", "assigned"] },
    })
      .select("status")
      .lean()) as { status: "pending" | "assigned" } | null;

    const payload: JourneyPayload = {
      access: "open",
      savedCount: userDoc?.bookmarks?.length ?? 0,
      quizCount: userDoc?.quizResults?.length ?? 0,
      recentItems,
      mentorStatus: mentorRequest?.status ?? "none",
    };
    return NextResponse.json(payload, { headers: HEADERS });
  } catch (error) {
    console.error("[API] GET /me/journey error:", error);
    return NextResponse.json(
      { error: "We could not load your journey. Please try again." },
      { status: 500, headers: HEADERS }
    );
  }
}
