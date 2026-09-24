import { getTranslations } from "next-intl/server";
import { Button } from "@/components/primer/Button";
import { Illustration } from "@/components/primer/Illustration";
import { StageMark } from "@/components/primer/StageMark";
import type { PathOutline } from "@/lib/learning-types";
import { STAGE_NUMBER, STAGE_STYLES, type StageKey } from "@/lib/stages";
import { PathCard } from "./PathCard";
import { YourStageFlag } from "./YourStageFlag";

interface StageBandProps {
  stage: StageKey;
  paths: PathOutline[];
  locale: string;
  signedIn: boolean;
  learnerStage: StageKey | null;
}

export async function StageBand({ stage, paths, locale, signedIn, learnerStage }: StageBandProps) {
  const t = await getTranslations("paths");
  const ts = await getTranslations("stages");
  const number = STAGE_NUMBER[stage];
  const titleId = `stage-${stage}-title`;
  const style = STAGE_STYLES[stage];

  return (
    <section
      id={`stage-${stage}`}
      aria-labelledby={titleId}
      className={`scroll-mt-24 rounded-[var(--radius-panel)] ${style.tint} mt-6 p-6 first:mt-0 sm:p-8 lg:p-10`}
    >
      <div className="flex flex-wrap items-center gap-4 sm:gap-5">
        <StageMark stage={stage} size="lg" />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
            <h2 id={titleId} className="text-heading font-semibold text-balance">
              <span className="sr-only">{t("stageHeading", { number })} </span>
              {ts(`${stage}.name`)}
            </h2>
            <YourStageFlag stage={stage} signedIn={signedIn} serverStage={learnerStage} />
          </div>
          <p className="mt-1 text-ink-2 text-pretty">{ts(`${stage}.short`)}</p>
        </div>
      </div>

      <div className="mt-7 sm:mt-8">
        {paths.length > 0 ? (
          <ul className={`grid gap-5 ${paths.length > 1 ? "sm:grid-cols-2 lg:grid-cols-3" : ""}`}>
            {paths.map((path) => (
              <li key={path.id} className="flex">
                <PathCard path={path} locale={locale} wide={paths.length === 1} showStage={false} />
              </li>
            ))}
          </ul>
        ) : (
          <div className="card flex flex-col items-center gap-4 p-5 text-center sm:flex-row sm:p-6 sm:text-start">
            <div className="size-16 shrink-0 overflow-hidden rounded-[var(--radius-cell)] sm:size-20">
              <Illustration name="lantern" sizes="80px" />
            </div>
            <div className="min-w-0">
              <p className="font-medium text-ink">{ts("preparing")}</p>
              {stage === "deeper" ? (
                <>
                  <p className="mt-1 text-ink-2 text-pretty">{t("preparingLibrary")}</p>
                  <Button href="/library" variant="quiet" className="mt-1">
                    {t("openLibrary")}
                  </Button>
                </>
              ) : null}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
