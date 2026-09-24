"use client";

import { Check } from "lucide-react";
import { useTranslations } from "next-intl";
import { Illustration } from "@/components/primer/Illustration";
import { StageMark } from "@/components/primer/StageMark";
import { STAGE_ART } from "@/lib/illustrations";
import { STAGE_NUMBER, type StageKey } from "@/lib/stages";

interface StageTileProps {
  stage: StageKey;
  active?: boolean;
  onSelect?: (stage: StageKey) => void;
}

export function StageTile({ stage, active = false, onSelect }: StageTileProps) {
  const t = useTranslations("stages");
  const interactive = Boolean(onSelect);

  const body = (
    <>
      <div className="aspect-[4/3] w-full overflow-hidden rounded-[calc(var(--radius-cell)-0.375rem)]">
        <Illustration name={STAGE_ART[stage]} sizes="(min-width: 640px) 200px, 33vw" />
      </div>
      <span className="mt-3 flex items-center gap-2 text-[0.9375rem] leading-snug font-semibold text-balance">
        <StageMark stage={stage} size="sm" />
        <span className="min-w-0">
          <span className="sr-only">{t("label", { number: STAGE_NUMBER[stage] })}: </span>
          {t(`${stage}.name`)}
        </span>
      </span>
      {interactive ? (
        <span
          aria-hidden="true"
          className={`mt-1.5 flex items-center gap-1.5 text-meta font-medium ${active ? "text-primary" : "invisible"}`}
        >
          <Check strokeWidth={2.25} className="size-3.5" />
          {t("yourStage")}
        </span>
      ) : null}
    </>
  );

  if (!interactive) {
    return <div className="flex flex-col text-start">{body}</div>;
  }

  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={() => onSelect?.(stage)}
      className={`group flex flex-col rounded-[var(--radius-cell)] p-2 text-start transition-colors duration-150 hover:bg-wash focus-visible:outline-offset-2 ${
        active ? "bg-primary-tint" : ""
      }`}
    >
      {body}
    </button>
  );
}
