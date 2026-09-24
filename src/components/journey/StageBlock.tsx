import { Button } from "@/components/primer/Button";
import { StageMark } from "@/components/primer/StageMark";
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
      <div className="flex flex-col items-start gap-4">
        <h2 className="text-heading font-semibold">{tStages("yourStage")}</h2>
        <p className="max-w-[52ch] text-ink-2">{t("findStartBody")}</p>
        <Button href="/start" variant="primary">
          {t("findStart")}
        </Button>
      </div>
    );
  }

  const stage = placement.stage as StageKey;

  return (
    <div className="flex flex-col items-start gap-5 sm:flex-row sm:items-center">
      <StageMark stage={stage} size="xl" />
      <div className="flex flex-col items-start gap-1.5">
        <h2 className="text-heading font-semibold">
          {tStages("label", { number: STAGE_NUMBER[stage] })}, {tStages(`${stage}.name`)}
        </h2>
        <p className="max-w-[60ch] text-ink-2">{tStages(`${stage}.short`)}</p>
        <Button href="/start" variant="quiet" className="mt-1">
          {t("retakeCheck")}
        </Button>
      </div>
    </div>
  );
}
