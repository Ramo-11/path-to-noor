"use client";

import { Check } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import type { PlacementQuestion } from "@/lib/placement";

interface QuestionStepProps {
  question: PlacementQuestion;
  selected: string | undefined;
  flooding: string | null;
  autoFocus: boolean;
  onSelect: (optionId: string) => void;
}

export function QuestionStep({ question, selected, flooding, autoFocus, onSelect }: QuestionStepProps) {
  const t = useTranslations(`start.questions.${question.id}`);
  const rtl = useLocale() === "ar";
  const headingId = useId();
  const helperId = useId();
  const optionRefs = useRef<Array<HTMLButtonElement | null>>([]);

  const selectedIndex = question.options.findIndex((option) => option.id === selected);
  const [focusIndex, setFocusIndex] = useState(selectedIndex >= 0 ? selectedIndex : 0);
  const hasHelper = t.has("helper");
  const focusedOnMount = useRef(false);

  useEffect(() => {
    if (!autoFocus || focusedOnMount.current) return;
    focusedOnMount.current = true;
    optionRefs.current[focusIndex]?.focus({ preventScroll: true });
  }, [autoFocus, focusIndex]);

  function move(event: React.KeyboardEvent<HTMLButtonElement>, index: number) {
    const count = question.options.length;
    const forward = (index + 1) % count;
    const backward = (index - 1 + count) % count;
    const targets: Record<string, number> = {
      ArrowDown: forward,
      ArrowUp: backward,
      ArrowRight: rtl ? backward : forward,
      ArrowLeft: rtl ? forward : backward,
      Home: 0,
      End: count - 1,
    };
    const target = targets[event.key];
    if (target === undefined) return;
    event.preventDefault();
    setFocusIndex(target);
    optionRefs.current[target]?.focus();
  }

  return (
    <div className="settle">
      <h2 id={headingId} className="text-title font-semibold text-balance">
        {t("title")}
      </h2>
      {hasHelper ? (
        <p id={helperId} className="mt-4 max-w-[52ch] text-lg text-ink-2 text-pretty">
          {t("helper")}
        </p>
      ) : null}
      <div
        role="radiogroup"
        aria-labelledby={headingId}
        aria-describedby={hasHelper ? helperId : undefined}
        className="mt-8 flex flex-col gap-3 sm:mt-10"
      >
        {question.options.map((option, index) => {
          const checked = option.id === selected;
          const label = t(`options.${option.id}`);
          return (
            <button
              key={option.id}
              ref={(node) => {
                optionRefs.current[index] = node;
              }}
              type="button"
              role="radio"
              aria-checked={checked}
              tabIndex={index === focusIndex ? 0 : -1}
              onClick={() => onSelect(option.id)}
              onKeyDown={(event) => move(event, index)}
              onFocus={() => setFocusIndex(index)}
              className={`flex min-h-14 w-full items-center justify-between gap-4 rounded-[var(--radius-cell)] border px-5 py-4 text-start transition duration-150 ease-[var(--ease-fill)] focus-visible:outline-offset-2 sm:min-h-16 sm:px-6 ${
                checked
                  ? "border-primary bg-primary-tint text-primary"
                  : "border-rule bg-surface text-ink hover:border-rule-strong hover:bg-wash"
              } ${flooding === option.id ? "scale-[0.99]" : ""}`}
            >
              <span className="min-w-0 flex-1 text-[1.0625rem] leading-snug font-medium text-pretty sm:text-lg">
                {label}
              </span>
              <span
                aria-hidden="true"
                className={`grid size-7 shrink-0 place-items-center rounded-full border-[1.5px] transition-colors duration-150 ${
                  checked ? "border-primary bg-primary text-on-primary" : "border-rule-strong text-transparent"
                }`}
              >
                <Check strokeWidth={2.5} className="size-4" />
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
