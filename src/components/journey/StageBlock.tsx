import { ArrowRight } from "lucide-react";
import { Button } from "@/components/primer/Button";
import { Illustration } from "@/components/primer/Illustration";
import { StageMark } from "@/components/primer/StageMark";
import { STAGE_ART } from "@/lib/illustrations";
import { STAGE_NUMBER, type StageKey } from "@/lib/stages";
import type { PlacementSummary } from "@/lib/learning-types";
import type { Translate } from "./types";

interface StageBlockProps {
  placement: PlacementSummary | null;
  t: Translate;
  tStages: Translate;
}

export function StageBlock({ placement, t, tStages }: StageBlockProps) {
  if (!placement) {
    return (
      <div className="card flex h-full flex-col items-start gap-4 p-6 sm:p-7">
        <h2 className="text-heading font-semibold">{tStages("yourStage")}</h2>
        <p className="max-w-[52ch] text-ink-2 text-pretty">{t("findStartBody")}</p>
        <Button href="/start" variant="primary" className="mt-auto">
          {t("findStart")}
          <ArrowRight aria-hidden="true" strokeWidth={1.75} className="size-4 rtl:rotate-180" />
        </Button>
      </div>
    );
  }

  const stage = placement.stage as StageKey;

  return (
    <div className="card flex h-full flex-col overflow-hidden">
      <div className="aspect-[2/1] overflow-hidden">
        <Illustration name={STAGE_ART[stage]} sizes="(min-width: 1024px) 540px, 100vw" />
      </div>
      <div className="flex flex-1 flex-col items-start gap-2 p-6 sm:p-7">
        <h2 className="flex items-center gap-3 text-heading font-semibold text-balance">
          <StageMark stage={stage} size="md" />
          <span>
            <span className="sr-only">{tStages("label", { number: STAGE_NUMBER[stage] })}: </span>
            {tStages(`${stage}.name`)}
          </span>
        </h2>
        <p className="max-w-[60ch] text-ink-2 text-pretty">{tStages(`${stage}.short`)}</p>
        <Button href="/start" variant="quiet" className="mt-auto">
          {t("retakeCheck")}
        </Button>
      </div>
    </div>
  );
}
