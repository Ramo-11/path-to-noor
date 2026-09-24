"use client";

import { useLocale, useTranslations } from "next-intl";
import { StageMark } from "@/components/primer/StageMark";
import { STAGES, STAGE_STYLES } from "@/lib/stages";
import type { StageLevels } from "./meter";

export function StageStrip({ levels }: { levels: StageLevels }) {
  const t = useTranslations("stages");
  const tFlow = useTranslations("start.flow");
  const rtl = useLocale() === "ar";

  return (
    <div aria-hidden="true">
      <div className="primer-grid grid-cols-3 lg:grid-cols-1">
        {STAGES.map((stage) => {
          const hidden = 100 - Math.round(levels[stage] * 100);
          const clipPath = rtl ? `inset(0 0 0 ${hidden}%)` : `inset(0 ${hidden}% 0 0)`;
          const style = STAGE_STYLES[stage];
          return (
            <div key={stage} className="relative">
              <span
                className={`absolute inset-0 ${style.tint} transition-[clip-path] duration-650 ease-fill`}
                style={{ clipPath }}
              />
              <span
                className={`absolute inset-x-0 bottom-0 h-[3px] ${style.fill} transition-[clip-path] duration-650 ease-fill`}
                style={{ clipPath }}
              />
              <div className="relative flex flex-col items-start gap-2.5 px-3 pt-3 pb-4 lg:flex-row lg:items-center lg:gap-3 lg:px-4 lg:py-4">
                <StageMark stage={stage} size="sm" />
                <span className="text-meta leading-snug font-medium text-ink">{t(`${stage}.name`)}</span>
              </div>
            </div>
          );
        })}
      </div>
      <p className="mt-3 text-meta text-ink-3">{tFlow("stripCaption")}</p>
    </div>
  );
}
