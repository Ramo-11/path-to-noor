import { getTranslations } from "next-intl/server";
import { StageMark } from "@/components/primer/StageMark";
import { YourStageFlag } from "@/components/paths/YourStageFlag";
import type { PathOutline } from "@/lib/learning-types";
import { STAGE_NUMBER, STAGE_STYLES, type StageKey } from "@/lib/stages";
import { PathGrid, PreparingRow } from "./PathTrackSection";

interface StageGroupBlockProps {
  stage: StageKey;
  paths: PathOutline[];
  locale: string;
  signedIn: boolean;
  learnerStage: StageKey | null;
}

export async function StageGroupBlock({ stage, paths, locale, signedIn, learnerStage }: StageGroupBlockProps) {
  const t = await getTranslations("paths");
  const ts = await getTranslations("stages");
  const number = STAGE_NUMBER[stage];
  const titleId = `stage-${stage}-title`;

  return (
    <section
      id={`stage-${stage}`}
      aria-labelledby={titleId}
      className={`scroll-mt-24 rounded-[var(--radius-panel)] ${STAGE_STYLES[stage].tint} mt-5 p-6 first:mt-0 sm:p-8 lg:p-10`}
    >
      <div className="flex flex-wrap items-center gap-4 sm:gap-5">
        <StageMark stage={stage} size="lg" />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
            <h3 id={titleId} className="text-heading font-semibold text-balance">
              <span className="sr-only">{t("stageHeading", { number })} </span>
              {ts(`${stage}.name`)}
            </h3>
            <YourStageFlag stage={stage} signedIn={signedIn} serverStage={learnerStage} />
          </div>
          <p className="mt-1 text-ink-2 text-pretty">{ts(`${stage}.short`)}</p>
        </div>
      </div>
      <div className="mt-7 sm:mt-8">
        {paths.length > 0 ? (
          <PathGrid paths={paths} locale={locale} />
        ) : (
          <PreparingRow title={ts("preparing")} body={stage === "deeper" ? t("preparingLibrary") : null} />
        )}
      </div>
    </section>
  );
}
