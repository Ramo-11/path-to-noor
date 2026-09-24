"use client";

import { Check } from "lucide-react";
import { useTranslations } from "next-intl";

interface QuestionTabsProps {
  total: number;
  current: number | null;
  answered: boolean[];
}

export function QuestionTabs({ total, current, answered }: QuestionTabsProps) {
  const t = useTranslations("start.flow");
  const preview = current === null;

  return (
    <ol
      aria-label={preview ? undefined : t("tabsLabel")}
      aria-hidden={preview ? true : undefined}
      className="flex items-center gap-2"
    >
      {Array.from({ length: total }, (_, index) => {
        const number = index + 1;
        const isAnswered = answered[index] ?? false;
        const isCurrent = index === current;
        const status = isAnswered
          ? t("tabAnswered", { number })
          : isCurrent
            ? t("tabCurrent", { number })
            : t("tabUpcoming", { number });

        const tone = isAnswered
          ? "bg-primary text-on-primary"
          : isCurrent
            ? "bg-primary-tint text-primary ring-2 ring-primary"
            : preview
              ? "bg-primary-tint text-primary"
              : "bg-wash text-ink-3";

        return (
          <li key={index} aria-current={isCurrent ? "step" : undefined} className="flex">
            <span
              aria-hidden="true"
              className={`grid size-8 shrink-0 place-items-center rounded-full text-[0.8125rem] font-semibold tabular transition-colors duration-150 sm:size-9 ${tone}`}
            >
              {isAnswered ? <Check strokeWidth={2.5} className="size-4" /> : number}
            </span>
            {preview ? null : <span className="sr-only">{status}</span>}
          </li>
        );
      })}
    </ol>
  );
}
