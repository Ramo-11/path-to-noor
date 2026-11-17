"use client";

import { useTranslations } from "next-intl";
import { Check, ChevronRight, FileText, HelpCircle, PlayCircle } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/primer/Button";
import { EmptyState } from "@/components/primer/EmptyState";
import type { SubjectContent } from "./library-types";

const LESSON_TYPE_ICON = {
  article: FileText,
  video: PlayCircle,
  quiz: HelpCircle,
} as const;

interface SubjectSectionsProps {
  subjectName: string;
  content: SubjectContent;
  completedLessonIds: string[];
}

export function SubjectSections({ subjectName, content, completedLessonIds }: SubjectSectionsProps) {
  const t = useTranslations("library");
  const tLearning = useTranslations("learning");
  const completed = new Set(completedLessonIds);
  const { subtopics, modules } = content;

  return (
    <div className="flex flex-col gap-14">
      {subtopics.length > 0 ? (
        <section aria-labelledby="library-subtopics-heading">
          <h2 id="library-subtopics-heading" className="text-heading font-semibold">
            {t("subSubjectsHeading", { subject: subjectName })}
          </h2>
          <ul className="mt-4 flex flex-col gap-2">
            {subtopics.map((sub) => (
              <li key={sub.id}>
                <Link
                  href={`/library/${sub.slug}`}
                  className="flex items-center justify-between gap-4 rounded-[var(--radius-control)] border border-rule bg-surface px-5 py-4 shadow-soft transition-colors hover:border-rule-strong hover:bg-wash"
                >
                  <span className="font-medium text-ink">{sub.name}</span>
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
            {modules.map((mod) => (
              <div key={mod.id}>
                <h3 className="text-heading font-semibold">{mod.title}</h3>
                {mod.description ? <p className="mt-2 max-w-[68ch] text-ink-2">{mod.description}</p> : null}
                {mod.path ? (
                  <p className="mt-2 text-meta text-ink-3">
                    <Link
                      href={`/paths/${mod.path.slug}`}
                      className="underline decoration-rule-strong underline-offset-[0.25em] hover:decoration-ink"
                    >
                      {t("partOfPath", { path: mod.path.title })}
                    </Link>
                  </p>
                ) : null}

                {mod.lessons.length > 0 ? (
                  <div className="mt-5 flex flex-col gap-2">
                    {mod.lessons.map((lesson) => {
                      const done = completed.has(lesson.id);
                      const TypeIcon =
                        LESSON_TYPE_ICON[lesson.type as keyof typeof LESSON_TYPE_ICON] ?? FileText;
                      return (
                        <Link
                          key={lesson.id}
                          href={`/learn/${lesson.slug}`}
                          className="flex items-center gap-4 rounded-[var(--radius-control)] border border-rule bg-surface px-4 py-3.5 shadow-soft transition-colors hover:border-rule-strong hover:bg-wash"
                        >
                          <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary-tint text-primary">
                            <TypeIcon className="size-4" strokeWidth={1.75} aria-hidden="true" />
                          </span>
                          <span className={`min-w-0 flex-1 font-medium ${done ? "text-ink-2" : "text-ink"}`}>
                            {lesson.title}
                          </span>
                          <span className="flex shrink-0 items-center gap-3 text-meta text-ink-3">
                            {lesson.minutes > 0 ? tLearning("minutes", { count: lesson.minutes }) : null}
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
            ))}
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
  );
}
