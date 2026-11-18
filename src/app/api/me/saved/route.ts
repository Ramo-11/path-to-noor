import { NextResponse, type NextRequest } from "next/server";
import { auth } from "@/lib/auth-config";
import { getUserBookmarkedLessons } from "@/lib/data";
import { localized } from "@/lib/stages";
import { routing } from "@/i18n/routing";
import { connectDB } from "@/db/connection";
import { Module } from "@/db/models/Module";
import { LearningPath } from "@/db/models/LearningPath";
import type { SavedLessonRow, SavedMePayload } from "@/components/saved/saved-types";

const HEADERS = { "Cache-Control": "private, no-store" };

type LocalizedField = { en: string; ar?: string; es?: string };

export async function GET(request: NextRequest) {
  const requested = request.nextUrl.searchParams.get("locale") ?? "";
  const locale = routing.locales.find((value) => value === requested) ?? routing.defaultLocale;

  const session = await auth();
  const user = session?.user;
  if (!user?.id) {
    const guest: SavedMePayload = { signedIn: false };
    return NextResponse.json(guest, { headers: HEADERS });
  }

  try {
    const bookmarked = (await getUserBookmarkedLessons(user.id)) as {
      _id: { toString(): string };
      slug: string;
      title: LocalizedField;
      estimatedMinutes?: number;
      moduleId?: { toString(): string };
    }[];
    const moduleIds = Array.from(
      new Set(
        bookmarked
          .map((lesson) => lesson.moduleId?.toString())
          .filter((id): id is string => Boolean(id))
      )
    );

    await connectDB();
    const [modulesResult, pathsResult] = await Promise.all([
      Module.find({ _id: { $in: moduleIds } }).select("title").lean(),
      LearningPath.find({ published: true, "modules.moduleId": { $in: moduleIds } })
        .select("title slug modules.moduleId")
        .lean(),
    ]);
    const modules = modulesResult as unknown as { _id: { toString(): string }; title: LocalizedField }[];
    const paths = pathsResult as unknown as {
      title: LocalizedField;
      slug: string;
      modules?: { moduleId?: { toString(): string } }[];
    }[];

    const moduleTitleById = new Map(modules.map((mod) => [mod._id.toString(), mod.title]));
    const pathByModuleId = new Map<string, { title: LocalizedField; slug: string }>();
    for (const path of paths) {
      for (const entry of path.modules || []) {
        if (!entry.moduleId) continue;
        const mid = entry.moduleId.toString();
        if (!pathByModuleId.has(mid)) {
          pathByModuleId.set(mid, { title: path.title, slug: path.slug });
        }
      }
    }

    const lessons: SavedLessonRow[] = bookmarked.map((lesson) => {
      const mid = lesson.moduleId?.toString();
      const pathInfo = mid ? pathByModuleId.get(mid) : undefined;
      const moduleTitle = mid ? moduleTitleById.get(mid) : undefined;

      let context: SavedLessonRow["context"] = null;
      if (pathInfo) {
        context = { type: "path", title: localized(pathInfo.title, locale), slug: pathInfo.slug };
      } else if (moduleTitle) {
        context = { type: "step", title: localized(moduleTitle, locale) };
      }

      return {
        id: lesson._id.toString(),
        slug: lesson.slug,
        title: localized(lesson.title, locale),
        minutes: lesson.estimatedMinutes || 0,
        context,
      };
    });

    const payload: SavedMePayload = { signedIn: true, lessons };
    return NextResponse.json(payload, { headers: HEADERS });
  } catch (error) {
    console.error("[API] GET /me/saved error:", error);
    return NextResponse.json(
      { error: "We could not load your saved lessons. Please try again." },
      { status: 500, headers: HEADERS }
    );
  }
}
