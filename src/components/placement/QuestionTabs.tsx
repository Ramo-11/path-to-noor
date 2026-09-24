"use client";

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
      className="primer-grid w-max grid-cols-6"
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

        return (
          <li
            key={index}
            aria-current={isCurrent ? "step" : undefined}
            className="relative grid size-10 place-items-center sm:size-11"
          >
            <span
              aria-hidden="true"
              className={`text-[0.9375rem] font-semibold tabular ${isCurrent ? "text-ink" : "text-ink-3"}`}
            >
              {number}
            </span>
            {isCurrent && !isAnswered ? (
              <span aria-hidden="true" className="absolute inset-x-0 bottom-0 h-[3px] bg-ink" />
            ) : null}
            {isAnswered ? (
              <span
                aria-hidden="true"
                className="fill-in absolute inset-0 grid place-items-center bg-ink text-[0.9375rem] font-semibold text-page tabular"
              >
                {number}
                {isCurrent ? <span className="absolute inset-x-2 bottom-1.5 h-[2px] rounded-full bg-page" /> : null}
              </span>
            ) : null}
            {preview ? null : <span className="sr-only">{status}</span>}
          </li>
        );
      })}
    </ol>
  );
}
