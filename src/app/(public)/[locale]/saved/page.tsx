import { getTranslations } from "next-intl/server";
import { auth } from "@/lib/auth-config";
import { getUserBookmarkedLessons } from "@/lib/data";
import { localized } from "@/lib/stages";
import { connectDB } from "@/db/connection";
import { Module } from "@/db/models/Module";
import { LearningPath } from "@/db/models/LearningPath";
import { PageIntro } from "@/components/primer/PageIntro";
import { PageBanner } from "@/components/primer/PageBanner";
import { Button } from "@/components/primer/Button";
import { EmptyState } from "@/components/primer/EmptyState";
import { SavedList, type SavedLessonRow } from "@/components/saved/SavedList";

export default async function SavedPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations("saved");
  const tCommon = await getTranslations("common");
  const session = await auth();

  if (!session?.user?.id) {
    return (
      <div className="mx-auto w-full max-w-3xl px-4 sm:px-6 lg:px-8">
        <PageIntro title={t("title")} />
        <div className="pb-16 sm:pb-24">
          <EmptyState
            title={t("signInTitle")}
            body={t("signInBody")}
            action={
              <div className="flex flex-wrap gap-3">
                <Button href="/login">{tCommon("signIn")}</Button>
                <Button href="/register" variant="secondary">
                  {tCommon("createAccount")}
                </Button>
              </div>
            }
            art="saved"
          />
        </div>
      </div>
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const bookmarked = (await getUserBookmarkedLessons(session.user.id)) as any[];
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const modules = modulesResult as any[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const paths = pathsResult as any[];

  const moduleTitleById = new Map(modules.map((mod) => [mod._id.toString(), mod.title]));
  const pathByModuleId = new Map<string, { title: { en: string; ar: string; es: string }; slug: string }>();
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

  return (
    <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
      <PageBanner title={t("title")} lead={t("lead")} art="saved" tone="dawn" />
      <div className="mx-auto max-w-3xl pt-10 pb-16 sm:pb-24">
        {lessons.length === 0 ? (
          <EmptyState
            title={t("emptyTitle")}
            body={t("emptyBody")}
            action={<Button href="/paths">{t("explorePaths")}</Button>}
            art="saved"
          />
        ) : (
          <SavedList initialLessons={lessons} />
        )}
      </div>
    </div>
  );
}
