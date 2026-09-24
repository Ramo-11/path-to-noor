"use client";

import { useEffect, useId, useState } from "react";
import { useTranslations } from "next-intl";
import { Check } from "lucide-react";
import type { StepListAttrs } from "@/lib/lesson-blocks";
import { Button } from "@/components/primer/Button";

interface StepListBlockProps extends StepListAttrs {
  storageKey: string;
}

function readTicks(key: string, length: number): boolean[] | null {
  try {
    const raw = window.sessionStorage.getItem(key);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return null;
    return Array.from({ length }, (_, i) => parsed[i] === true);
  } catch {
    return null;
  }
}

function writeTicks(key: string, ticks: boolean[]) {
  try {
    if (ticks.some(Boolean)) {
      window.sessionStorage.setItem(key, JSON.stringify(ticks));
    } else {
      window.sessionStorage.removeItem(key);
    }
  } catch {
    return;
  }
}

export function StepListBlock({ title, steps, storageKey }: StepListBlockProps) {
  const t = useTranslations("blocks");
  const titleId = useId();
  const [ticks, setTicks] = useState<boolean[]>(() => steps.map(() => false));
  const [flooded, setFlooded] = useState<boolean[]>(() => steps.map(() => false));
  const count = steps.length;

  useEffect(() => {
    const stored = readTicks(storageKey, count);
    if (stored) setTicks(stored);
  }, [storageKey, count]);

  function toggle(index: number) {
    const next = ticks.map((value, i) => (i === index ? !value : value));
    setTicks(next);
    setFlooded((prev) => prev.map((value, i) => (i === index ? next[index] : value)));
    writeTicks(storageKey, next);
  }

  function startOver() {
    const cleared = steps.map(() => false);
    setTicks(cleared);
    setFlooded(cleared);
    writeTicks(storageKey, cleared);
  }

  const done = ticks.filter(Boolean).length;

  return (
    <div role="group" aria-labelledby={titleId} className="primer-grid">
      <div className="px-5 py-4 sm:px-6">
        <p id={titleId} className="font-semibold text-ink text-pretty">
          {title.trim() || t("stepsTitle")}
        </p>
        <p className="mt-1 text-[0.9375rem] text-ink-2">{t("stepsHint")}</p>
      </div>
      <div role="list">
        {steps.map((step, index) => {
          const ticked = ticks[index] === true;
          return (
            <div role="listitem" key={index} className={index > 0 ? "border-t border-rule" : ""}>
              <label className="relative flex min-h-14 cursor-pointer items-start gap-4 px-5 py-4 transition-colors duration-150 hover:bg-wash sm:px-6">
                {ticked ? (
                  <span
                    aria-hidden="true"
                    className={`absolute inset-0 bg-wash ${flooded[index] ? "fill-in" : ""}`}
                  />
                ) : null}
                <span
                  aria-hidden="true"
                  className="relative w-7 shrink-0 text-lg font-semibold leading-7 text-ink tabular"
                >
                  {index + 1}
                </span>
                <span className="relative min-w-0 flex-1 leading-7 text-ink">{step}</span>
                <span className="relative mt-0.5 grid size-6 shrink-0 place-items-center">
                  <input
                    type="checkbox"
                    checked={ticked}
                    onChange={() => toggle(index)}
                    className="peer size-6 cursor-pointer appearance-none rounded-[6px] border border-rule-strong bg-page transition-colors duration-150 checked:border-ink checked:bg-ink"
                  />
                  <Check
                    aria-hidden="true"
                    strokeWidth={2.5}
                    className="pointer-events-none absolute size-4 text-page opacity-0 peer-checked:opacity-100"
                  />
                </span>
              </label>
            </div>
          );
        })}
      </div>
      <div className="flex min-h-14 flex-wrap items-center justify-between gap-x-4 gap-y-1 px-5 py-2 sm:px-6">
        <p aria-live="polite" className="text-meta text-ink-2 tabular">
          {done === count ? t("stepsAllDone", { total: count }) : t("stepsCount", { done, total: count })}
        </p>
        {done > 0 ? (
          <Button variant="quiet" onClick={startOver}>
            {t("stepsStartOver")}
          </Button>
        ) : null}
      </div>
    </div>
  );
}
