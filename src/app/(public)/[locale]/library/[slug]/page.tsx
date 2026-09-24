import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { ArrowLeft, Check, ChevronRight, FileText, HelpCircle, PlayCircle } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { auth } from "@/lib/auth-config";
import {
  getPublicTopicBySlug,
  getPublicSubtopics,
  getPublicModulesByTopic,
} from "@/lib/data";
import { getCompletedLessonIds } from "@/lib/learning";
import { localized } from "@/lib/stages";
import { artTone, libraryArt } from "@/lib/illustrations";
import { connectDB } from "@/db/connection";
import { User } from "@/db/models/User";
import { LearningPath } from "@/db/models/LearningPath";
import "@/db/models/Lesson";
import { PageBanner } from "@/components/primer/PageBanner";
import { Button } from "@/components/primer/Button";
import { EmptyState } from "@/components/primer/EmptyState";
import { SubjectLearnedToggle } from "@/components/library/SubjectLearnedToggle";
import { SubjectProgressBar } from "@/components/library/SubjectProgressBar";

interface PageParams {
  locale: string;
  slug: string;
}

interface PageProps {
  params: Promise<PageParams>;
}

interface LessonRef {
  _id: { toString(): string };
}

interface LessonEntry {
  lessonId?: LessonRef | null;
}

interface ModuleLessons {
  lessons?: LessonEntry[];
}

interface ParentTopic {
  slug: string;
  name: { en: string; ar?: string; es?: string };
}

const LESSON_TYPE_ICON = {
  article: FileText,
  video: PlayCircle,
  quiz: HelpCircle,
} as const;

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  const topic = await getPublicTopicBySlug(slug);
  if (!topic) return {};
  return {
    title: localized(topic.name, locale),
    description: localized(topic.description, locale),
  };
}

export default async function LibrarySubjectPage({ params }: PageProps) {
  const { locale, slug } = await params;
  const t = await getTranslations("library");
  const tLearning = await getTranslations("learning");

  const topic = await getPublicTopicBySlug(slug);
  if (!topic) notFound();
  const topicId = topic._id.toString();

  const session = await auth();
  const ctx = { userType: session?.user?.userType, isGuest: !session?.user };

  const [subtopics, modules] = await Promise.all([
    getPublicSubtopics(topicId, ctx),
    getPublicModulesByTopic(topicId, ctx),
  ]);

  let completedLessonIds = new Set<string>();
  let isLearned = false;
  if (session?.user?.id) {
    completedLessonIds = await getCompletedLessonIds(session.user.id);
    await connectDB();
    const user = await User.findById(session.user.id).select("completedTopics").lean();
    isLearned = (
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (user as any)?.completedTopics || []
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ).some((entry: any) => entry.topicId?.toString() === topicId);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const moduleIds = (modules as any[]).map((mod) => mod._id.toString());
  await connectDB();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const pathsForModules = (await LearningPath.find({
    published: true,
    "modules.moduleId": { $in: moduleIds },
  })
    .select("title slug modules.moduleId")
    .lean()) as any[];

  const pathByModuleId = new Map<string, { title: { en: string; ar: string; es: string }; slug: string }>();
  for (const path of pathsForModules) {
    for (const entry of path.modules || []) {
      if (!entry.moduleId) continue;
      const mid = entry.moduleId.toString();
      if (!pathByModuleId.has(mid)) {
        pathByModuleId.set(mid, { title: path.title, slug: path.slug });
      }
    }
  }

  const allLessonEntries = (modules as unknown as ModuleLessons[]).flatMap((mod) =>
    (mod.lessons || []).filter((entry): entry is { lessonId: LessonRef } => Boolean(entry.lessonId))
  );
  const totalLessons = allLessonEntries.length;
  const completedInSubject = allLessonEntries.filter((entry) =>
    completedLessonIds.has(entry.lessonId._id.toString())
  ).length;

  const parent = topic.parent as unknown as ParentTopic | null | undefined;

  return (
    <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-center gap-1.5 pt-8 text-meta text-ink-3">
        <Link href="/library" className="inline-flex items-center gap-1.5 hover:text-ink">
          <ArrowLeft className="size-3.5 rtl:rotate-180" aria-hidden="true" />
          {t("backToLibrary")}
        </Link>
        {parent ? (
          <>
            <ChevronRight className="size-3.5 rtl:rotate-180" aria-hidden="true" />
            <Link href={`/library/${parent.slug}`} className="hover:text-ink">
              {localized(parent.name, locale)}
            </Link>
          </>
        ) : null}
      </div>

      <PageBanner
        title={localized(topic.name, locale)}
        lead={localized(topic.description, locale)}
        art={libraryArt(topic.slug)}
        tone={artTone(libraryArt(topic.slug))}
      >
        {session?.user ? (
          <div className="flex flex-col gap-5">
            {totalLessons > 0 ? (
              <div className="max-w-xs">
                <SubjectProgressBar
                  done={completedInSubject}
                  total={totalLessons}
                  label={tLearning("lessonsDone", { done: completedInSubject, total: totalLessons })}
                />
                <p className="mt-1.5 text-meta text-ink-3 tabular">
                  {tLearning("lessonsDone", { done: completedInSubject, total: totalLessons })}
                </p>
              </div>
            ) : null}
            <SubjectLearnedToggle topicId={topicId} initialLearned={isLearned} />
          </div>
        ) : null}
      </PageBanner>

      <div className="flex flex-col gap-14 pt-10 pb-16 sm:pb-24">
        {subtopics.length > 0 ? (
          <section aria-labelledby="library-subtopics-heading">
            <h2 id="library-subtopics-heading" className="text-heading font-semibold">
              {t("subSubjectsHeading", { subject: localized(topic.name, locale) })}
            </h2>
            <ul className="mt-4 flex flex-col gap-2">
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              {(subtopics as any[]).map((sub) => (
                <li key={sub._id.toString()}>
                  <Link
                    href={`/library/${sub.slug}`}
                    className="flex items-center justify-between gap-4 rounded-[var(--radius-control)] border border-rule bg-surface px-5 py-4 shadow-soft transition-colors hover:border-rule-strong hover:bg-wash"
                  >
                    <span className="font-medium text-ink">{localized(sub.name, locale)}</span>
                    <ChevronRight className="size-4 shrink-0 text-ink-3 rtl:rotate-180" aria-hidden="true" />
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {modules.length > 0 ? (
          <section aria-labelledby="library-steps-heading">
            <h2 id="library-steps-heading" className="text-heading font-semibold">
              {tLearning("steps")}
            </h2>
            <div className="mt-6 flex flex-col gap-10">
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              {(modules as any[]).map((mod) => {
                const sortedLessons = (mod.lessons || [])
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  .filter((entry: any) => entry.lessonId)
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  .sort((a: any, b: any) => (a.order ?? 0) - (b.order ?? 0));
                const pathInfo = pathByModuleId.get(mod._id.toString());

                return (
                  <div key={mod._id.toString()}>
                    <h3 className="text-heading font-semibold">{localized(mod.title, locale)}</h3>
                    {mod.description ? (
                      <p className="mt-2 max-w-[68ch] text-ink-2">{localized(mod.description, locale)}</p>
                    ) : null}
                    {pathInfo ? (
                      <p className="mt-2 text-meta text-ink-3">
                        <Link
                          href={`/paths/${pathInfo.slug}`}
                          className="underline decoration-rule-strong underline-offset-[0.25em] hover:decoration-ink"
                        >
                          {t("partOfPath", { path: localized(pathInfo.title, locale) })}
                        </Link>
                      </p>
                    ) : null}

                    {sortedLessons.length > 0 ? (
                      <div className="mt-5 flex flex-col gap-2">
                        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                        {sortedLessons.map((entry: any) => {
                          const lesson = entry.lessonId;
                          const done = completedLessonIds.has(lesson._id.toString());
                          const TypeIcon =
                            LESSON_TYPE_ICON[lesson.type as keyof typeof LESSON_TYPE_ICON] ?? FileText;
                          return (
                            <Link
                              key={lesson._id.toString()}
                              href={`/learn/${lesson.slug}`}
                              className="flex items-center gap-4 rounded-[var(--radius-control)] border border-rule bg-surface px-4 py-3.5 shadow-soft transition-colors hover:border-rule-strong hover:bg-wash"
                            >
                              <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary-tint text-primary">
                                <TypeIcon className="size-4" strokeWidth={1.75} aria-hidden="true" />
                              </span>
                              <span className={`min-w-0 flex-1 font-medium ${done ? "text-ink-2" : "text-ink"}`}>
                                {localized(lesson.title, locale)}
                              </span>
                              <span className="flex shrink-0 items-center gap-3 text-meta text-ink-3">
                                {lesson.estimatedMinutes > 0
                                  ? tLearning("minutes", { count: lesson.estimatedMinutes })
                                  : null}
                                {done ? (
                                  <span className="inline-flex items-center gap-1 rounded-full bg-stage2-tint px-2.5 py-1 font-medium text-stage2-text">
                                    <Check className="size-3.5" aria-hidden="true" />
                                    {tLearning("done")}
                                  </span>
                                ) : null}
                              </span>
                            </Link>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="mt-5 text-ink-3">{tLearning("comingSoon")}</p>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        ) : (
          <EmptyState
            title={t("emptyStepsTitle")}
            body={t("emptyStepsBody")}
            action={<Button href="/paths">{t("browsePaths")}</Button>}
            art="lantern"
          />
        )}
      </div>
    </div>
  );
}
