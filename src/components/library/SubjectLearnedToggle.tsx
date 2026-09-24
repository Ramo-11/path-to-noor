"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Check } from "lucide-react";
import { Spinner } from "@/components/primer/Spinner";

interface SubjectLearnedToggleProps {
  topicId: string;
  initialLearned: boolean;
}

const toggleClass =
  "inline-flex min-h-11 items-center gap-2 text-[0.9375rem] font-medium text-ink underline decoration-rule-strong underline-offset-[0.25em] transition-colors duration-150 hover:decoration-ink disabled:opacity-45 disabled:pointer-events-none";

export function SubjectLearnedToggle({
  topicId,
  initialLearned,
}: SubjectLearnedToggleProps) {
  const t = useTranslations("library");
  const [learned, setLearned] = useState(initialLearned);
  const [loading, setLoading] = useState(false);
  const [failed, setFailed] = useState(false);

  async function toggle() {
    setLoading(true);
    setFailed(false);
    try {
      const res = await fetch("/api/user/completed-topics", {
        method: learned ? "DELETE" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topicId }),
      });
      if (res.ok) {
        setLearned((prev) => !prev);
      } else {
        setFailed(true);
      }
    } catch {
      setFailed(true);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-start gap-1">
      <button
        type="button"
        onClick={toggle}
        disabled={loading}
        aria-pressed={learned}
        aria-busy={loading || undefined}
        className={toggleClass}
      >
        {loading ? (
          <Spinner />
        ) : learned ? (
          <Check className="size-4" aria-hidden="true" />
        ) : null}
        {learned ? t("learned") : t("markLearned")}
      </button>
      <p role="status" className="min-h-5 text-meta text-danger">
        {failed ? t("toggleFailed") : ""}
      </p>
    </div>
  );
}
