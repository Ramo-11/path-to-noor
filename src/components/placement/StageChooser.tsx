"use client";

import { Check } from "lucide-react";
import { useTranslations } from "next-intl";
import { StageMark } from "@/components/primer/StageMark";
import { STAGES, STAGE_NUMBER, STAGE_STYLES, type StageKey } from "@/lib/stages";

interface StageChooserProps {
  current: StageKey;
  label: string;
  onChoose: (stage: StageKey) => void;
}

export function StageChooser({ current, label, onChoose }: StageChooserProps) {
  const t = useTranslations("stages");
  const tAdjust = useTranslations("start.result.adjust");

  return (
    <div role="group" aria-label={label} className="primer-grid grid-cols-1 sm:grid-cols-3">
      {STAGES.map((stage) => {
        const active = stage === current;
        return (
          <button
            key={stage}
            type="button"
            aria-pressed={active}
            onClick={() => onChoose(stage)}
            className="group relative flex min-h-16 items-start gap-4 px-5 pt-6 pb-5 text-start transition-colors duration-150 hover:bg-wash! focus-visible:outline-offset-[-4px]! sm:flex-col sm:gap-4 sm:px-6 sm:pt-8 sm:pb-6"
          >
            <span
              aria-hidden="true"
              className={`absolute inset-x-0 top-0 ${active ? "h-2" : "h-1"} ${STAGE_STYLES[stage].fill}`}
            />
            <StageMark stage={stage} size="md" />
            <span className="min-w-0 flex-1">
              <span className="block font-semibold text-ink">
                <span className="sr-only">{t("label", { number: STAGE_NUMBER[stage] })}: </span>
                {t(`${stage}.name`)}
              </span>
              <span className="mt-1 block text-[0.9375rem] leading-relaxed text-ink-2 text-pretty">
                {t(`${stage}.short`)}
              </span>
              {active ? (
                <span className="mt-3 inline-flex items-center gap-1.5 text-meta font-medium text-ink">
                  <Check aria-hidden="true" strokeWidth={2.25} className="size-4" />
                  {tAdjust("current")}
                </span>
              ) : null}
            </span>
          </button>
        );
      })}
    </div>
  );
}
