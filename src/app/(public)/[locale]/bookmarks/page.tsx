"use client";

import { useState, useEffect } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useSession } from "next-auth/react";
import { Link } from "@/i18n/navigation";
import { Container } from "@/components/layout/Container";
import { Bookmark, Clock, FileText, Loader2, Trash2 } from "lucide-react";

interface BookmarkedLesson {
  _id: string;
  title: { en: string; ar: string };
  slug: string;
  estimatedMinutes: number;
}

export default function BookmarksPage() {
  const t = useTranslations("bookmarks");
  const tLearning = useTranslations("learning");
  const locale = useLocale();
  const { data: session, status } = useSession();
  const [lessons, setLessons] = useState<BookmarkedLesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [removing, setRemoving] = useState<string | null>(null);

  useEffect(() => {
    if (status !== "authenticated") {
      setLoading(false);
      return;
    }

    fetch("/api/user/bookmarks/details")
      .then((res) => res.json())
      .then((data) => {
        if (data.data) setLessons(data.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [status]);

  async function removeBookmark(lessonId: string) {
    setRemoving(lessonId);
    try {
      await fetch("/api/user/bookmarks", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lessonId }),
      });
      setLessons((prev) => prev.filter((l) => l._id !== lessonId));
    } catch {
      // silently fail
    } finally {
      setRemoving(null);
    }
  }

  if (status === "unauthenticated") {
    return (
      <section className="py-16 sm:py-24">
        <Container size="md">
          <div className="text-center py-16">
            <Bookmark className="h-12 w-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              {t("loginRequired")}
            </p>
            <Link
              href="/login"
              className="inline-flex px-6 py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors"
            >
              {t("signIn")}
            </Link>
          </div>
        </Container>
      </section>
    );
  }

  return (
    <section className="py-16 sm:py-24">
      <Container size="md">
        <div className="mb-8">
          <h1 className="font-heading text-3xl font-bold text-slate-900 dark:text-white">
            {t("title")}
          </h1>
          <p className="mt-2 text-slate-600 dark:text-slate-400">
            {t("subtitle")}
          </p>
          <div className="mt-3 decorative-line" />
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
          </div>
        ) : lessons.length === 0 ? (
          <div className="text-center py-16">
            <Bookmark className="h-12 w-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
            <p className="text-slate-500 dark:text-slate-400">{t("empty")}</p>
            <Link
              href="/paths"
              className="mt-4 inline-flex text-sm text-primary-600 hover:text-primary-700 font-medium transition-colors"
            >
              {t("explorePaths")}
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {lessons.map((lesson) => (
              <div
                key={lesson._id}
                className="flex items-center gap-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-5 py-4 group"
              >
                <FileText className="h-5 w-5 text-slate-400 shrink-0" />
                <Link
                  href={`/learn/${lesson.slug}`}
                  className="flex-1 min-w-0"
                >
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                    {lesson.title[locale as "en" | "ar"] || lesson.title.en}
                  </span>
                </Link>
                {lesson.estimatedMinutes > 0 && (
                  <span className="text-xs text-slate-400 shrink-0 flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" />
                    {tLearning("estimatedTime", {
                      minutes: lesson.estimatedMinutes,
                    })}
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => removeBookmark(lesson._id)}
                  disabled={removing === lesson._id}
                  className="p-1.5 rounded text-slate-400 hover:text-red-500 transition-colors shrink-0 disabled:opacity-50"
                  aria-label={t("remove")}
                >
                  {removing === lesson._id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                </button>
              </div>
            ))}
          </div>
        )}
      </Container>
    </section>
  );
}
