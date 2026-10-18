"use client";

import { useId, useState, useSyncExternalStore } from "react";
import { useTranslations } from "next-intl";
import { Check } from "lucide-react";
import type { StepListAttrs } from "@/lib/lesson-blocks";
import { Button } from "@/components/primer/Button";

interface StepListBlockProps extends StepListAttrs {
  storageKey: string;
}

function readRaw(key: string): string | null {
  try {
    return window.sessionStorage.getItem(key);
  } catch {
    return null;
  }
}

function parseTicks(raw: string | null, length: number): boolean[] | null {
  if (!raw) return null;
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return null;
    return Array.from({ length }, (_, i) => parsed[i] === true);
  } catch {
    return null;
  }
}

const noopSubscribe = () => () => {};

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
  const [localTicks, setTicks] = useState<boolean[] | null>(null);
  const storedRaw = useSyncExternalStore(noopSubscribe, () => readRaw(storageKey), () => null);
  const [flooded, setFlooded] = useState<boolean[]>(() => steps.map(() => false));
  const count = steps.length;

  const ticks = localTicks ?? parseTicks(storedRaw, count) ?? steps.map(() => false);

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
  const allDone = done === count;

  return (
    <div role="group" aria-labelledby={titleId} className="card overflow-hidden">
      <div className="px-5 py-4 sm:px-6">
        <p id={titleId} className="font-semibold text-ink text-pretty">
          {title.trim() || t("stepsTitle")}
        </p>
        <p className="mt-1 text-[0.9375rem] text-ink-2">{t("stepsHint")}</p>
      </div>
      <div role="list" className="divide-y divide-rule border-t border-rule">
        {steps.map((step, index) => {
          const ticked = ticks[index] === true;
          return (
            <div role="listitem" key={index}>
              <label className="relative flex min-h-14 cursor-pointer items-center gap-4 px-5 py-4 transition-colors duration-150 hover:bg-wash sm:px-6">
                {ticked ? (
                  <span
                    aria-hidden="true"
                    className={`absolute inset-0 bg-stage2-tint ${flooded[index] ? "fill-in" : ""}`}
                  />
                ) : null}
                <input
                  type="checkbox"
                  checked={ticked}
                  onChange={() => toggle(index)}
                  className="sr-only"
                />
                <span
                  aria-hidden="true"
                  className={`relative grid size-8 shrink-0 place-items-center rounded-full text-sm font-semibold tabular transition-colors duration-150 ${
                    ticked ? "bg-stage2 text-on-stage2" : "bg-primary-tint text-primary"
                  }`}
                >
                  {ticked ? <Check strokeWidth={2.5} className="size-4" /> : index + 1}
                </span>
                <span className="relative min-w-0 flex-1 leading-7 text-ink">{step}</span>
              </label>
            </div>
          );
        })}
      </div>
      <div className="flex min-h-14 flex-wrap items-center justify-between gap-x-4 gap-y-1 border-t border-rule px-5 py-2 sm:px-6">
        <p
          aria-live="polite"
          className={`text-meta tabular ${allDone ? "font-medium text-stage2-text" : "text-ink-2"}`}
        >
          {allDone ? t("stepsAllDone", { total: count }) : t("stepsCount", { done, total: count })}
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
