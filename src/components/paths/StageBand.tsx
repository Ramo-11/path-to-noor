import { getTranslations } from "next-intl/server";
import { Button } from "@/components/primer/Button";
import { StageMark } from "@/components/primer/StageMark";
import type { PathOutline } from "@/lib/learning-types";
import { STAGE_NUMBER, type StageKey } from "@/lib/stages";
import { PathRow } from "./PathRow";
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

  return (
    <section
      id={`stage-${stage}`}
      aria-labelledby={titleId}
      className="scroll-mt-16 border-t border-rule py-14 sm:py-20"
    >
      <div className="grid gap-8 lg:grid-cols-12 lg:gap-12">
        <div className="lg:col-span-4">
          <div className="flex items-start gap-5">
            <StageMark stage={stage} size="xl" />
            <div className="flex flex-col items-start gap-2 pt-1">
              <span aria-hidden="true" className="font-medium text-ink-2">
                {ts("label", { number })}
              </span>
              <YourStageFlag stage={stage} signedIn={signedIn} serverStage={learnerStage} />
            </div>
          </div>
          <h2 id={titleId} className="mt-6 text-heading font-semibold text-balance">
            <span className="sr-only">{t("stageHeading", { number })} </span>
            {ts(`${stage}.name`)}
          </h2>
          <p className="mt-3 max-w-[46ch] text-ink-2 text-pretty">{ts(`${stage}.long`)}</p>
        </div>

        <div className="lg:col-span-8">
          {paths.length > 0 ? (
            <ul className="primer-grid grid-cols-1">
              {paths.map((path) => (
                <li key={path.id}>
                  <PathRow path={path} locale={locale} signedIn={signedIn} />
                </li>
              ))}
            </ul>
          ) : (
            <div className="primer-grid">
              <div className="px-5 py-7 sm:px-7">
                <p className="font-medium text-ink">{ts("preparing")}</p>
                {stage === "deeper" ? (
                  <>
                    <p className="mt-2 max-w-[52ch] text-ink-2 text-pretty">{t("preparingLibrary")}</p>
                    <Button href="/library" variant="quiet" className="mt-2">
                      {t("openLibrary")}
                    </Button>
                  </>
                ) : null}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
