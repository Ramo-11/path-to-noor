"use client";

import { useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/primer/Button";
import { Notice } from "@/components/primer/Notice";
import { EmptyState } from "@/components/primer/EmptyState";

export interface SavedLessonRow {
  id: string;
  slug: string;
  title: string;
  minutes: number;
  context: { type: "path"; title: string; slug: string } | { type: "step"; title: string } | null;
}

interface PendingRemoval {
  lesson: SavedLessonRow;
  index: number;
}

interface SavedListProps {
  initialLessons: SavedLessonRow[];
}

const UNDO_WINDOW_MS = 5000;

export function SavedList({ initialLessons }: SavedListProps) {
  const t = useTranslations("saved");
  const tLearning = useTranslations("learning");
  const [lessons, setLessons] = useState(initialLessons);
  const [pending, setPending] = useState<PendingRemoval | null>(null);
  const [error, setError] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function clearPendingTimer() {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }

  async function handleRemove(lesson: SavedLessonRow) {
    const index = lessons.findIndex((item) => item.id === lesson.id);
    if (index === -1) return;

    clearPendingTimer();
    setError(null);
    setLessons((prev) => prev.filter((item) => item.id !== lesson.id));
    setPending({ lesson, index });

    try {
      const res = await fetch("/api/user/bookmarks", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lessonId: lesson.id }),
      });
      if (!res.ok) throw new Error("remove failed");
    } catch {
      setLessons((prev) => {
        const next = [...prev];
        next.splice(index, 0, lesson);
        return next;
      });
      setPending(null);
      setError(t("removeError"));
      return;
    }

    timerRef.current = setTimeout(() => {
      setPending(null);
    }, UNDO_WINDOW_MS);
  }

  async function handleUndo() {
    if (!pending) return;
    clearPendingTimer();
    const { lesson, index } = pending;
    setLessons((prev) => {
      const next = [...prev];
      next.splice(index, 0, lesson);
      return next;
    });
    setPending(null);
    setError(null);

    try {
      const res = await fetch("/api/user/bookmarks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lessonId: lesson.id }),
      });
      if (!res.ok) throw new Error("undo failed");
    } catch {
      setError(t("undoError"));
    }
  }

  if (lessons.length === 0 && !pending) {
    return (
      <EmptyState
        title={t("emptyTitle")}
        body={t("emptyBody")}
        action={<Button href="/paths">{t("explorePaths")}</Button>}
      />
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div aria-live="polite" className="flex flex-col gap-4">
        {error ? <Notice tone="error">{error}</Notice> : null}
        {pending ? (
          <Notice tone="info">
            <div className="flex items-center justify-between gap-4">
              <span>{t("removed")}</span>
              <button
                type="button"
                onClick={handleUndo}
                className="inline-flex min-h-11 items-center font-medium underline underline-offset-[0.25em] hover:no-underline"
              >
                {t("undo")}
              </button>
            </div>
          </Notice>
        ) : null}
      </div>

      {lessons.length > 0 ? (
        <div className="primer-grid grid-cols-1">
          {lessons.map((lesson) => (
            <div key={lesson.id} className="flex flex-wrap items-center gap-4 px-5 py-4">
              <div className="min-w-0 flex-1">
                <Link
                  href={`/learn/${lesson.slug}`}
                  className="text-[0.9375rem] font-medium text-ink hover:underline"
                >
                  {lesson.title}
                </Link>
                {lesson.context?.type === "path" ? (
                  <p className="mt-1 text-meta text-ink-3">
                    <Link
                      href={`/paths/${lesson.context.slug}`}
                      className="underline decoration-rule-strong underline-offset-[0.25em] hover:decoration-ink"
                    >
                      {t("partOfPath", { path: lesson.context.title })}
                    </Link>
                  </p>
                ) : null}
                {lesson.context?.type === "step" ? (
                  <p className="mt-1 text-meta text-ink-3">{lesson.context.title}</p>
                ) : null}
              </div>
              {lesson.minutes > 0 ? (
                <span className="shrink-0 text-meta text-ink-3">
                  {tLearning("minutes", { count: lesson.minutes })}
                </span>
              ) : null}
              <Button variant="secondary" onClick={() => handleRemove(lesson)}>
                {t("remove")}
              </Button>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
