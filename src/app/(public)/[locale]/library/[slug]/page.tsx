import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { ArrowLeft, ArrowRight, Check, ChevronRight } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { auth } from "@/lib/auth-config";
import {
  getPublicTopicBySlug,
  getPublicSubtopics,
  getPublicModulesByTopic,
} from "@/lib/data";
import { getCompletedLessonIds } from "@/lib/learning";
import { localized } from "@/lib/stages";
import { connectDB } from "@/db/connection";
import { User } from "@/db/models/User";
import { LearningPath } from "@/db/models/LearningPath";
import "@/db/models/Lesson";
import { PageIntro } from "@/components/primer/PageIntro";
import { Button } from "@/components/primer/Button";
import { EmptyState } from "@/components/primer/EmptyState";
import { SubjectLearnedToggle } from "@/components/library/SubjectLearnedToggle";

interface PageParams {
  locale: string;
  slug: string;
}

interface PageProps {
  params: Promise<PageParams>;
}

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

  const BackArrow = locale === "ar" ? ArrowRight : ArrowLeft;

  return (
    <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
      <div className="pt-10">
        <Link
          href="/library"
          className="inline-flex items-center gap-2 text-[0.9375rem] text-ink-2 hover:text-ink"
        >
          <BackArrow className="size-4 rtl:rotate-180" aria-hidden="true" />
          {t("backToLibrary")}
        </Link>
      </div>

      {topic.parent ? (
        <p className="mt-6 text-meta text-ink-3">
          <Link
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            href={`/library/${(topic.parent as any).slug}`}
            className="underline decoration-rule-strong underline-offset-[0.25em] hover:decoration-ink"
          >
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            {localized((topic.parent as any).name, locale)}
          </Link>
        </p>
      ) : null}

      <PageIntro
        title={localized(topic.name, locale)}
        lead={localized(topic.description, locale)}
        aside={
          session?.user ? (
            <SubjectLearnedToggle topicId={topicId} initialLearned={isLearned} />
          ) : null
        }
      />

      <div className="flex flex-col gap-16 pb-16 sm:pb-24">
        {subtopics.length > 0 ? (
          <section aria-labelledby="library-subtopics-heading">
            <h2 id="library-subtopics-heading" className="text-heading font-semibold">
              {t("subSubjectsHeading", { subject: localized(topic.name, locale) })}
            </h2>
            <ul className="primer-grid mt-4 grid-cols-1">
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              {(subtopics as any[]).map((sub) => (
                <li key={sub._id.toString()}>
                  <Link
                    href={`/library/${sub.slug}`}
                    className="flex items-center justify-between gap-4 px-5 py-4 hover:bg-wash"
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
            <div className="mt-6 flex flex-col divide-y divide-rule">
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              {(modules as any[]).map((mod) => {
                const sortedLessons = (mod.lessons || [])
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  .filter((entry: any) => entry.lessonId)
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  .sort((a: any, b: any) => (a.order ?? 0) - (b.order ?? 0));
                const pathInfo = pathByModuleId.get(mod._id.toString());

                return (
                  <div key={mod._id.toString()} className="py-10 first:pt-0">
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
                      <div className="primer-grid mt-5 grid-cols-1">
                        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                        {sortedLessons.map((entry: any) => {
                          const lesson = entry.lessonId;
                          const done = completedLessonIds.has(lesson._id.toString());
                          return (
                            <Link
                              key={lesson._id.toString()}
                              href={`/learn/${lesson.slug}`}
                              className="flex items-center justify-between gap-4 px-5 py-4 hover:bg-wash"
                            >
                              <span className={`font-medium ${done ? "text-ink-2" : "text-ink"}`}>
                                {localized(lesson.title, locale)}
                              </span>
                              <span className="flex shrink-0 items-center gap-3 text-meta text-ink-3">
                                {lesson.estimatedMinutes > 0
                                  ? tLearning("minutes", { count: lesson.estimatedMinutes })
                                  : null}
                                {done ? (
                                  <span className="inline-flex items-center gap-1 font-medium text-ink">
                                    <Check className="size-4" aria-hidden="true" />
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
          />
        )}
      </div>
    </div>
  );
}
