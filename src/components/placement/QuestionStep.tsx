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

function OptionFace({ label, checked }: { label: string; checked: boolean }) {
  return (
    <span className="flex w-full items-center gap-4 px-5 py-4 sm:px-6 sm:py-5">
      <span className="min-w-0 flex-1 text-[1.0625rem] leading-snug font-medium text-pretty sm:text-lg">
        {label}
      </span>
      <span
        className={`grid size-6 shrink-0 place-items-center rounded-full border-[1.5px] ${
          checked ? "border-page" : "border-rule-strong"
        }`}
      >
        {checked ? <Check strokeWidth={2.5} className="size-3.5" /> : null}
      </span>
    </span>
  );
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
        className="primer-grid mt-8 sm:mt-10"
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
              className="group relative flex min-h-16 w-full items-center text-start text-ink transition-colors duration-150 hover:bg-wash! focus-visible:outline-none!"
            >
              <OptionFace label={label} checked={false} />
              {checked ? (
                <span
                  aria-hidden="true"
                  className={`absolute inset-0 flex items-center bg-ink text-page ${
                    flooding === option.id ? "fill-in" : ""
                  }`}
                >
                  <OptionFace label={label} checked />
                </span>
              ) : null}
              <span
                aria-hidden="true"
                className={`pointer-events-none absolute inset-1.5 rounded-[8px] border-2 opacity-0 transition-opacity duration-150 group-focus-visible:opacity-100 ${
                  checked ? "border-page" : "border-ink"
                }`}
              />
            </button>
          );
        })}
      </div>
    </div>
  );
}
