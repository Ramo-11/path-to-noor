"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Check } from "lucide-react";
import { Spinner } from "@/components/primer/Spinner";

interface SubjectLearnedToggleProps {
  topicId: string;
  initialLearned: boolean;
}

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
    <div className="flex flex-col items-start gap-1.5">
      <button
        type="button"
        onClick={toggle}
        disabled={loading}
        aria-pressed={learned}
        aria-busy={loading || undefined}
        className={`inline-flex min-h-11 items-center gap-2 rounded-full px-4 text-[0.9375rem] font-medium transition-colors duration-150 disabled:opacity-45 disabled:pointer-events-none ${
          learned
            ? "bg-stage2-tint text-stage2-text hover:bg-stage2-tint/70"
            : "bg-surface text-ink border border-rule-strong hover:bg-wash"
        }`}
      >
        {loading ? <Spinner /> : learned ? <Check className="size-4" aria-hidden="true" /> : null}
        {learned ? t("learned") : t("markLearned")}
      </button>
      <p role="status" className="min-h-5 text-meta text-danger">
        {failed ? t("toggleFailed") : ""}
      </p>
    </div>
  );
}
