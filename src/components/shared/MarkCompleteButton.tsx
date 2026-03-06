"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { CheckCircle, Circle } from "lucide-react";

interface MarkCompleteButtonProps {
  lessonId: string;
  initialCompleted?: boolean;
}

export function MarkCompleteButton({
  lessonId,
  initialCompleted = false,
}: MarkCompleteButtonProps) {
  const { data: session } = useSession();
  const t = useTranslations("learning");
  const [completed, setCompleted] = useState(initialCompleted);
  const [loading, setLoading] = useState(false);

  if (!session?.user) return null;

  async function handleComplete() {
    if (completed || loading) return;
    setLoading(true);

    try {
      const res = await fetch("/api/user/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lessonId }),
      });

      if (res.ok) {
        setCompleted(true);
      }
    } catch {
      // Silently fail
    } finally {
      setLoading(false);
    }
  }

  if (completed) {
    return (
      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-sm font-medium">
        <CheckCircle className="h-4 w-4" />
        {t("completed")}
      </div>
    );
  }

  return (
    <button
      onClick={handleComplete}
      disabled={loading}
      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white text-sm font-medium transition-colors"
    >
      {loading ? (
        <span className="inline-block h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
      ) : (
        <Circle className="h-4 w-4" />
      )}
      {t("markComplete")}
    </button>
  );
}
