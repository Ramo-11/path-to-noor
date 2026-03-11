import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth-config";
import { connectDB } from "@/db/connection";
import { User } from "@/db/models/User";
import { LearningPath } from "@/db/models/LearningPath";
import { Module } from "@/db/models/Module";
import { Lesson } from "@/db/models/Lesson";

function computeStreakDays(
  progress: Array<{ lessonId: unknown; completedAt: Date }>
): number {
  if (!progress || progress.length === 0) return 0;

  const uniqueDays = new Set(
    progress.map((p) => {
      const d = new Date(p.completedAt);
      return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
    })
  );

  const sortedDays = Array.from(uniqueDays)
    .map((key) => {
      const [y, m, d] = key.split("-").map(Number);
      return new Date(y, m, d);
    })
    .sort((a, b) => b.getTime() - a.getTime());

  const today = new Date();
  const todayKey = `${today.getFullYear()}-${today.getMonth()}-${today.getDate()}`;
  const yesterdayDate = new Date(today);
  yesterdayDate.setDate(yesterdayDate.getDate() - 1);
  const yesterdayKey = `${yesterdayDate.getFullYear()}-${yesterdayDate.getMonth()}-${yesterdayDate.getDate()}`;

  // Streak must include today or yesterday
  const latestKey = `${sortedDays[0].getFullYear()}-${sortedDays[0].getMonth()}-${sortedDays[0].getDate()}`;
  if (latestKey !== todayKey && latestKey !== yesterdayKey) return 0;

  let streak = 1;
  for (let i = 1; i < sortedDays.length; i++) {
    const diff = sortedDays[i - 1].getTime() - sortedDays[i].getTime();
    const oneDay = 24 * 60 * 60 * 1000;
    if (diff === oneDay) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
}

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await connectDB();
    const user = await User.findById(session.user.id)
      .select("name email image preferredLanguage role userType progress bookmarks quizResults completedTopics createdAt")
      .lean();

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const userAny = user as any;

    const progress: Array<{ lessonId: string; completedAt: Date }> =
      userAny.progress || [];
    const quizResults: Array<{ quizId: string; score: number; passed: boolean; completedAt: Date }> =
      userAny.quizResults || [];

    const completedLessonIds = new Set(
      progress.map((p) => p.lessonId.toString())
    );

    // Quiz stats
    const quizAvgScore =
      quizResults.length > 0
        ? Math.round(
            quizResults.reduce((sum, q) => sum + q.score, 0) /
              quizResults.length
          )
        : 0;
    const quizPassRate =
      quizResults.length > 0
        ? Math.round(
            (quizResults.filter((q) => q.passed).length / quizResults.length) *
              100
          )
        : 0;

    // Streak
    const streakDays = computeStreakDays(progress);

    // Learning path progress
    const allPaths = await LearningPath.find({ published: true })
      .select("title modules slug")
      .lean();

    // Collect all module IDs from all paths
    const allModuleIds = Array.from(
      new Set(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        allPaths.flatMap((p: any) =>
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          p.modules.map((m: any) => m.moduleId.toString())
        )
      )
    );

    // Fetch modules with their lessons
    const modules = await Module.find({ _id: { $in: allModuleIds } })
      .select("lessons")
      .lean();

    const moduleLessonMap = new Map<string, string[]>();
    for (const mod of modules) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const modAny = mod as any;
      moduleLessonMap.set(
        modAny._id.toString(),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (modAny.lessons || []).map((l: any) => l.lessonId.toString())
      );
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const pathProgress = allPaths.map((path: any) => {
      const pathLessonIds: string[] = [];
      for (const mod of path.modules) {
        const lessons = moduleLessonMap.get(mod.moduleId.toString()) || [];
        pathLessonIds.push(...lessons);
      }
      const completedInPath = pathLessonIds.filter((id) =>
        completedLessonIds.has(id)
      ).length;
      const totalInPath = pathLessonIds.length;
      const percentage =
        totalInPath > 0 ? Math.round((completedInPath / totalInPath) * 100) : 0;

      return {
        title: path.title,
        slug: path.slug,
        completedLessons: completedInPath,
        totalLessons: totalInPath,
        percentage,
      };
    });

    const pathsStarted = pathProgress.filter(
      (p) => p.completedLessons > 0
    ).length;
    const pathsCompleted = pathProgress.filter(
      (p) => p.totalLessons > 0 && p.completedLessons === p.totalLessons
    ).length;

    // Recent activity: last 10 completed lessons with titles
    const sortedProgress = [...progress].sort(
      (a, b) =>
        new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()
    );
    const recentLessonIds = sortedProgress.slice(0, 10).map((p) => p.lessonId);

    const recentLessons = await Lesson.find({ _id: { $in: recentLessonIds } })
      .select("title slug")
      .lean();

    const lessonTitleMap = new Map<string, { en: string; ar: string; es: string; slug: string }>();
    for (const lesson of recentLessons) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const lessonAny = lesson as any;
      lessonTitleMap.set(lessonAny._id.toString(), {
        en: lessonAny.title.en,
        ar: lessonAny.title.ar,
        es: lessonAny.title.es,
        slug: lessonAny.slug,
      });
    }

    const recentActivity = sortedProgress.slice(0, 10).map((p) => {
      const lessonInfo = lessonTitleMap.get(p.lessonId.toString());
      return {
        title: lessonInfo?.en
          ? { en: lessonInfo.en, ar: lessonInfo.ar, es: lessonInfo.es }
          : { en: "Lesson", ar: "درس", es: "Lección" },
        slug: lessonInfo?.slug || "",
        completedAt: p.completedAt,
      };
    });

    return NextResponse.json({
      data: {
        name: userAny.name,
        email: userAny.email,
        image: userAny.image,
        preferredLanguage: userAny.preferredLanguage,
        role: userAny.role,
        userType: userAny.userType,
        lessonsCompleted: progress.length,
        bookmarksCount: userAny.bookmarks?.length || 0,
        quizzesCompleted: quizResults.length,
        topicsCompleted: userAny.completedTopics?.length || 0,
        joinedAt: userAny.createdAt,
        quizAvgScore,
        quizPassRate,
        streakDays,
        totalLearningPaths: allPaths.length,
        pathsStarted,
        pathsCompleted,
        pathProgress: pathProgress.filter((p) => p.completedLessons > 0),
        recentActivity,
      },
    });
  } catch (error) {
    console.error("[API] GET /user/profile error:", error);
    return NextResponse.json(
      { error: "Failed to fetch profile" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { name, preferredLanguage } = await request.json();

    const updates: Record<string, string> = {};
    if (name && typeof name === "string" && name.trim().length > 0) {
      updates.name = name.trim();
    }
    if (preferredLanguage === "en" || preferredLanguage === "ar" || preferredLanguage === "es") {
      updates.preferredLanguage = preferredLanguage;
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: "No valid fields to update" },
        { status: 400 }
      );
    }

    await connectDB();
    const user = await User.findByIdAndUpdate(session.user.id, updates, {
      new: true,
    }).select("name email preferredLanguage");

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      data: { name: user.name, preferredLanguage: user.preferredLanguage },
      message: "Profile updated",
    });
  } catch (error) {
    console.error("[API] PUT /user/profile error:", error);
    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 }
    );
  }
}
