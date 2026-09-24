import { Lightbulb } from "lucide-react";
import { useTranslations } from "next-intl";
import type { KeyPointAttrs } from "@/lib/lesson-blocks";

export function KeyPoint({ text }: KeyPointAttrs) {
  const t = useTranslations("blocks");

  return (
    <div role="note" className="flex gap-4 rounded-[var(--radius-cell)] bg-accent-tint px-5 py-5 sm:px-7 sm:py-6">
      <Lightbulb aria-hidden="true" strokeWidth={1.75} className="mt-0.5 size-5 shrink-0 text-accent-text" />
      <div className="min-w-0">
        <p className="text-meta font-semibold text-accent-text">{t("remember")}</p>
        <p className="mt-1.5 whitespace-pre-line text-lg text-ink">{text}</p>
      </div>
    </div>
  );
}
