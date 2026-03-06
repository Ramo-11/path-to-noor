"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { Bookmark } from "lucide-react";

interface BookmarkButtonProps {
  lessonId: string;
}

export function BookmarkButton({ lessonId }: BookmarkButtonProps) {
  const { data: session } = useSession();
  const t = useTranslations("bookmarks");
  const [bookmarked, setBookmarked] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!session?.user) return;

    fetch("/api/user/bookmarks")
      .then((res) => res.json())
      .then((data) => {
        if (data.data?.includes(lessonId)) {
          setBookmarked(true);
        }
      })
      .catch(() => {});
  }, [session, lessonId]);

  if (!session?.user) return null;

  async function handleToggle() {
    if (loading) return;
    setLoading(true);

    try {
      if (bookmarked) {
        await fetch("/api/user/bookmarks", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ lessonId }),
        });
        setBookmarked(false);
      } else {
        await fetch("/api/user/bookmarks", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ lessonId }),
        });
        setBookmarked(true);
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 ${
        bookmarked
          ? "bg-accent-100 dark:bg-accent-900/30 text-accent-700 dark:text-accent-400"
          : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
      }`}
      aria-label={bookmarked ? t("remove") : t("title")}
    >
      <Bookmark
        className={`h-4 w-4 ${bookmarked ? "fill-current" : ""}`}
      />
    </button>
  );
}
