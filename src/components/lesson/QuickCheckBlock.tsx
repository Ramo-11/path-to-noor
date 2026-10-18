"use client";

import { useId, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Check, X } from "lucide-react";
import type { QuickCheckAttrs } from "@/lib/lesson-blocks";
import { Button } from "@/components/primer/Button";

export function QuickCheckBlock({ question, options, correctIndex, explanation }: QuickCheckAttrs) {
  const t = useTranslations("blocks");
  const questionId = useId();
  const optionRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const [choice, setChoice] = useState<number | null>(null);

  const answered = choice !== null;
  const isRight = choice === correctIndex;
  const announcement = !answered
    ? ""
    : isRight
      ? t("right")
      : `${t("notQuite")} ${t("theAnswer", { answer: options[correctIndex] })}`;

  function choose(index: number) {
    if (answered) return;
    setChoice(index);
  }

  function tryAgain() {
    setChoice(null);
    optionRefs.current[0]?.focus();
  }

  return (
    <div className="rounded-[var(--radius-cell)] border border-rule bg-surface px-5 py-5 shadow-soft sm:px-6 sm:py-6">
      <p className="text-meta font-semibold text-ink-3">{t("quickLabel")}</p>
      <p id={questionId} className="mt-1.5 font-semibold text-ink text-pretty">
        {question}
      </p>
      <div role="group" aria-labelledby={questionId} className="mt-5 flex flex-col gap-3">
        {options.map((option, index) => {
          const isCorrect = index === correctIndex;
          const isChosen = index === choice;
          const showCorrect = answered && isCorrect;
          const showMissed = answered && isChosen && !isCorrect;
          const tone = showCorrect
            ? "border-stage2 bg-stage2-tint"
            : showMissed
              ? "border-danger bg-danger-tint"
              : "border-rule bg-surface";

          return (
            <button
              key={index}
              ref={(node) => {
                optionRefs.current[index] = node;
              }}
              type="button"
              onClick={() => choose(index)}
              aria-disabled={answered || undefined}
              className={`flex min-h-14 w-full items-center gap-3 rounded-full border px-5 py-3.5 text-start transition-colors duration-150 ${tone} ${
                answered ? "cursor-default" : "cursor-pointer hover:border-rule-strong"
              }`}
            >
              <span className="min-w-0 flex-1 text-[1.0625rem] text-ink">{option}</span>
              {showCorrect ? (
                <span className="inline-flex shrink-0 items-center gap-1.5 text-meta font-medium text-stage2-text">
                  <Check aria-hidden="true" strokeWidth={2.5} className="size-4" />
                  {isChosen ? t("right") : t("correctAnswer")}
                </span>
              ) : null}
              {showMissed ? (
                <span className="inline-flex shrink-0 items-center gap-1.5 text-meta font-medium text-danger">
                  <X aria-hidden="true" strokeWidth={2.5} className="size-4" />
                  {t("yourAnswer")}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>
      {answered ? (
        <div className="settle mt-5 rounded-[var(--radius-cell)] bg-canvas px-5 py-5 sm:px-6">
          <p className="font-semibold text-ink">{isRight ? t("right") : t("notQuite")}</p>
          {!isRight ? (
            <p className="mt-1 text-ink">{t("theAnswer", { answer: options[correctIndex] })}</p>
          ) : null}
          {explanation.trim() ? (
            <p className="mt-3 whitespace-pre-line text-ink-2">{explanation}</p>
          ) : null}
          <div className="mt-3">
            <Button variant="quiet" onClick={tryAgain}>
              {t("tryAgain")}
            </Button>
          </div>
        </div>
      ) : null}
      <p aria-live="polite" className="sr-only">
        {announcement}
      </p>
    </div>
  );
}
