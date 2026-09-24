"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { Check } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { TextField } from "@/components/primer/TextField";
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

export function LibraryBrowser({ subjects, signedIn }: LibraryBrowserProps) {
  const t = useTranslations("library");
  const tLearning = useTranslations("learning");
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
      <div className="pb-8">
        <TextField
          label={t("searchLabel")}
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={t("searchPlaceholder")}
          className="max-w-md"
        />
      </div>

      <div aria-live="polite">
        {filtered.length === 0 ? (
          <p className="py-10 text-ink-2">{t("noResults")}</p>
        ) : (
          <div className="primer-grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((subject) => (
              <Link
                key={subject.id}
                href={`/library/${subject.slug}`}
                className="flex flex-col gap-2 p-6 transition-colors hover:bg-wash"
              >
                <h2 className="text-heading font-semibold text-balance">{subject.name}</h2>
                <p className="text-ink-2 line-clamp-2">{subject.description}</p>
                {subject.lessonCount === 0 ? (
                  <p className="mt-2 text-meta text-ink-3">{t("noLessonsYet")}</p>
                ) : (
                  <div className="mt-2 flex flex-col gap-2">
                    <p className="text-meta text-ink-3">
                      {tLearning("lessonCount", { count: subject.lessonCount })}
                    </p>
                    {signedIn ? (
                      subject.isLearned ? (
                        <p className="inline-flex items-center gap-1.5 text-meta font-medium text-ink">
                          <Check className="size-4" aria-hidden="true" />
                          {t("learned")}
                        </p>
                      ) : (
                        <div>
                          <SubjectProgressBar
                            done={subject.completedCount}
                            total={subject.lessonCount}
                            label={tLearning("lessonsDone", {
                              done: subject.completedCount,
                              total: subject.lessonCount,
                            })}
                          />
                          <p className="mt-1 text-meta text-ink-3">
                            {tLearning("lessonsDone", {
                              done: subject.completedCount,
                              total: subject.lessonCount,
                            })}
                          </p>
                        </div>
                      )
                    ) : null}
                  </div>
                )}
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
