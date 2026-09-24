"use client";

import { useId, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Check } from "lucide-react";
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
    <div>
      <div role="group" aria-labelledby={questionId} className="primer-grid">
        <div className="px-5 py-4 sm:px-6">
          <p id={questionId} className="font-semibold text-ink text-pretty">
            {question}
          </p>
        </div>
        {options.map((option, index) => {
          const isCorrect = index === correctIndex;
          const isChosen = index === choice;
          const showCorrect = answered && isCorrect;
          const showMissed = answered && isChosen && !isCorrect;
          return (
            <div key={index}>
              <button
                ref={(node) => {
                  optionRefs.current[index] = node;
                }}
                type="button"
                onClick={() => choose(index)}
                aria-disabled={answered || undefined}
                className={`relative flex min-h-14 w-full items-center gap-4 px-5 py-3.5 text-start transition-colors duration-150 sm:px-6 ${
                  answered ? "cursor-default" : "cursor-pointer hover:bg-wash"
                }`}
              >
                {showCorrect ? (
                  <span aria-hidden="true" className="absolute inset-0 bg-stage2-tint fill-in" />
                ) : null}
                {showMissed ? <span aria-hidden="true" className="absolute inset-0 bg-wash" /> : null}
                <span
                  aria-hidden="true"
                  className={`relative order-last grid size-5 shrink-0 place-items-center rounded-full ${
                    showCorrect
                      ? "border border-stage2-text bg-stage2-text text-page"
                      : isChosen
                        ? "border-[6px] border-ink"
                        : "border border-rule-strong"
                  }`}
                >
                  {showCorrect ? <Check strokeWidth={3} className="size-3" /> : null}
                </span>
                <span className="relative min-w-0 flex-1 text-ink">{option}</span>
                {showCorrect ? (
                  <span className="relative shrink-0 text-meta font-medium text-stage2-text">
                    {isChosen ? t("right") : t("correctAnswer")}
                  </span>
                ) : null}
                {showMissed ? (
                  <span className="relative shrink-0 text-meta text-ink-2">{t("yourAnswer")}</span>
                ) : null}
              </button>
            </div>
          );
        })}
        {answered ? (
          <div className="settle px-5 py-5 sm:px-6">
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
      </div>
      <p aria-live="polite" className="sr-only">
        {announcement}
      </p>
    </div>
  );
}
