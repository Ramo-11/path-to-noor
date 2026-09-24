"use client";

import { useId, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { Check, Search } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Illustration } from "@/components/primer/Illustration";
import { EmptyState } from "@/components/primer/EmptyState";
import { libraryArt } from "@/lib/illustrations";
import { SubjectProgressBar } from "./SubjectProgressBar";

export interface LibrarySubjectCard {
  id: string;
  slug: string;
  name: string;
  description: string;
  lessonCount: number;
  completedCount: number;
  isLearned: boolean;
}

interface LibraryBrowserProps {
  subjects: LibrarySubjectCard[];
  signedIn: boolean;
}

function SubjectCard({ subject, signedIn }: { subject: LibrarySubjectCard; signedIn: boolean }) {
  const t = useTranslations("library");
  const tLearning = useTranslations("learning");
  const showProgress = signedIn && !subject.isLearned && subject.completedCount > 0;

  return (
    <li className="flex">
      <Link href={`/library/${subject.slug}`} className="card card-link group flex w-full flex-col overflow-hidden">
        <div className="aspect-[4/3] overflow-hidden">
          <Illustration
            name={libraryArt(subject.slug)}
            sizes="(min-width: 1024px) 33vw, 50vw"
            className="transition-transform duration-500 ease-[var(--ease-fill)] group-hover:scale-[1.03]"
          />
        </div>
        <div className="flex flex-1 flex-col p-3.5 sm:p-6">
          <h2 className="text-base leading-snug font-semibold text-balance sm:text-heading">{subject.name}</h2>
          <p className="mt-1.5 hidden text-ink-2 text-pretty sm:line-clamp-2">{subject.description}</p>
          <div className="mt-auto flex flex-col gap-2.5 pt-3 sm:pt-5">
            <div className="flex flex-wrap items-center gap-2">
              {subject.lessonCount > 0 ? (
                <span className="inline-flex items-center rounded-full bg-primary-tint px-2.5 py-1 text-meta font-medium text-primary">
                  {tLearning("lessonCount", { count: subject.lessonCount })}
                </span>
              ) : (
                <span className="inline-flex items-center rounded-full bg-wash px-2.5 py-1 text-meta text-ink-3">
                  {t("noLessonsYet")}
                </span>
              )}
              {signedIn && subject.isLearned ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-stage2-tint px-2.5 py-1 text-meta font-medium text-stage2-text">
                  <Check className="size-3.5" strokeWidth={2} aria-hidden="true" />
                  {t("learned")}
                </span>
              ) : null}
            </div>
            {showProgress ? (
              <div>
                <SubjectProgressBar
                  done={subject.completedCount}
                  total={subject.lessonCount}
                  label={tLearning("lessonsDone", { done: subject.completedCount, total: subject.lessonCount })}
                />
                <p className="mt-1.5 text-meta text-ink-3 tabular">
                  {tLearning("lessonsDone", { done: subject.completedCount, total: subject.lessonCount })}
                </p>
              </div>
            ) : null}
          </div>
        </div>
      </Link>
    </li>
  );
}

export function LibraryBrowser({ subjects, signedIn }: LibraryBrowserProps) {
  const t = useTranslations("library");
  const searchId = useId();
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return subjects;
    return subjects.filter(
      (subject) =>
        subject.name.toLowerCase().includes(q) || subject.description.toLowerCase().includes(q)
    );
  }, [subjects, query]);

  return (
    <div>
      <div className="pb-8 sm:pb-10">
        <label htmlFor={searchId} className="sr-only">
          {t("searchLabel")}
        </label>
        <div className="relative max-w-md">
          <Search
            aria-hidden="true"
            strokeWidth={1.75}
            className="pointer-events-none absolute inset-y-0 start-4 my-auto size-5 text-ink-3"
          />
          <input
            id={searchId}
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={t("searchPlaceholder")}
            className="min-h-12 w-full rounded-[var(--radius-control)] border border-rule-strong bg-surface ps-11 pe-4 text-base text-ink placeholder:text-ink-3 transition-colors focus:border-primary focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          />
        </div>
      </div>

      <div aria-live="polite">
        {filtered.length === 0 ? (
          <EmptyState title={t("noResults")} art="lantern" />
        ) : (
          <ul className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-3">
            {filtered.map((subject) => (
              <SubjectCard key={subject.id} subject={subject} signedIn={signedIn} />
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
