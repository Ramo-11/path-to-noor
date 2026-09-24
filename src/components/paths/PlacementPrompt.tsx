"use client";

import { ArrowRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/primer/Button";
import { StageMark } from "@/components/primer/StageMark";
import { STAGE_NUMBER, type StageKey } from "@/lib/stages";
import { useStoredStage } from "./useStoredStage";

interface PlacementPromptProps {
  signedIn: boolean;
  serverStage: StageKey | null;
}

export function PlacementPrompt({ signedIn, serverStage }: PlacementPromptProps) {
  const t = useTranslations("paths");
  const ts = useTranslations("stages");
  const storedStage = useStoredStage(!signedIn);
  const stage = signedIn ? serverStage : storedStage;

  const prompt = (
    <Button href="/start" size="lg" className="w-full sm:w-auto">
      {t("findStart")}
      <ArrowRight aria-hidden="true" strokeWidth={1.75} className="size-4 rtl:rotate-180" />
    </Button>
  );

  const known = stage ? (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
      <span className="inline-flex items-center gap-2.5">
        <StageMark stage={stage} size="sm" />
        <span className="font-semibold text-ink">
          <span className="sr-only">{ts("label", { number: STAGE_NUMBER[stage] })}, </span>
          {ts(`${stage}.name`)}
        </span>
      </span>
      <Button href="/start" variant="quiet">
        {t("retake")}
      </Button>
    </div>
  ) : null;

  if (signedIn) return known ?? prompt;

  return (
    <div className="grid">
      <div className={`col-start-1 row-start-1 ${stage ? "invisible" : ""}`}>{prompt}</div>
      {known ? <div className="col-start-1 row-start-1 self-center">{known}</div> : null}
    </div>
  );
}
