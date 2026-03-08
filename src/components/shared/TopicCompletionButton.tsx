"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { Check, Loader2 } from "lucide-react";

interface TopicCompletionButtonProps {
  topicId: string;
  initialCompleted: boolean;
}

export function TopicCompletionButton({
  topicId,
  initialCompleted,
}: TopicCompletionButtonProps) {
  const { status } = useSession();
  const t = useTranslations("topicProgress");
  const [completed, setCompleted] = useState(initialCompleted);
  const [loading, setLoading] = useState(false);

  if (status !== "authenticated") return null;

  async function handleToggle() {
    setLoading(true);
    try {
      if (completed) {
        const res = await fetch("/api/user/completed-topics", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ topicId }),
        });
        if (res.ok) setCompleted(false);
      } else {
        const res = await fetch("/api/user/completed-topics", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ topicId }),
        });
        if (res.ok) setCompleted(true);
      }
    } catch {
      // Silently fail
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <button
        disabled
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-slate-200 dark:border-slate-700 text-slate-400"
      >
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
      </button>
    );
  }

  if (completed) {
    return (
      <button
        onClick={handleToggle}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-200 dark:hover:bg-emerald-900/50 transition-colors"
        title={t("unmark")}
      >
        <Check className="h-3.5 w-3.5" />
        {t("learnt")}
      </button>
    );
  }

  return (
    <button
      onClick={handleToggle}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 hover:text-primary-700 dark:hover:text-primary-300 hover:border-primary-200 dark:hover:border-primary-800 transition-colors"
    >
      {t("markLearnt")}
    </button>
  );
}
