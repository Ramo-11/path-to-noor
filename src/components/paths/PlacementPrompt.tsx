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
    <div>
      <p className="text-ink-2 text-pretty">{t("findStartHint")}</p>
      <Button href="/start" fullWidth className="mt-4 py-2.5 whitespace-normal!">
        {t("findStart")}
        <ArrowRight aria-hidden="true" className="size-4 rtl:rotate-180" />
      </Button>
    </div>
  );

  const known = stage ? (
    <div>
      <p className="flex flex-wrap items-center gap-x-3 gap-y-2">
        <span className="text-ink-2">{t("yourStageLabel")}</span>
        <span className="inline-flex items-center gap-2.5">
          <StageMark stage={stage} size="sm" />
          <span className="font-semibold text-ink">
            <span className="sr-only">{ts("label", { number: STAGE_NUMBER[stage] })}, </span>
            {ts(`${stage}.name`)}
          </span>
        </span>
      </p>
      <Button href="/start" variant="quiet" className="mt-2">
        {t("retake")}
      </Button>
    </div>
  ) : null;

  return (
    <div className="primer-grid w-full md:w-[22rem]">
      <div className="grid p-5 sm:p-6">
        {signedIn ? (
          (known ?? prompt)
        ) : (
          <>
            <div className={`col-start-1 row-start-1 ${stage ? "invisible" : ""}`}>{prompt}</div>
            {known ? <div className="col-start-1 row-start-1 self-center">{known}</div> : null}
          </>
        )}
      </div>
    </div>
  );
}
