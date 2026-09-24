import { ArrowRight } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Button } from "@/components/primer/Button";
import { ProgressCells } from "@/components/primer/ProgressCells";
import { STAGES, type StageKey } from "@/lib/stages";

interface JourneyEndProps {
  complete: boolean;
  stage: StageKey;
  title: string;
  totalLessons: number;
}

export async function JourneyEnd({ complete, stage, title, totalLessons }: JourneyEndProps) {
  const t = await getTranslations("paths");
  const tl = await getTranslations("learning");
  const ts = await getTranslations("stages");
  const nextStage = STAGES[STAGES.indexOf(stage) + 1];

  return (
    <div className="grid grid-cols-[2.75rem_minmax(0,1fr)] gap-x-3 pt-16 sm:grid-cols-[5rem_minmax(0,1fr)] sm:gap-x-8 sm:pt-20">
      <div className="col-start-2">
        {complete ? (
          <section aria-labelledby="path-finished-title" className="primer-grid">
            <div className="p-6 sm:p-10">
              <ProgressCells
                done={totalLessons}
                total={totalLessons}
                stage={stage}
                label={tl("complete")}
                className="max-w-sm"
              />
              <h2
                id="path-finished-title"
                className="mt-8 text-heading font-semibold text-balance"
              >
                {t("finishedTitle", { title })}
              </h2>
              <p className="mt-3 max-w-[52ch] text-ink-2 text-pretty">{t("finishedBody")}</p>
              <div className="mt-8">
                {nextStage ? (
                  <Button
                    href={`/paths#stage-${nextStage}`}
                    variant="secondary"
                    className="py-2.5 text-start whitespace-normal!"
                  >
                    {t("nextStageLink", { name: ts(`${nextStage}.name`) })}
                    <ArrowRight aria-hidden="true" className="size-4 rtl:rotate-180" />
                  </Button>
                ) : (
                  <Button href="/paths" variant="secondary">
                    {t("browseAll")}
                    <ArrowRight aria-hidden="true" className="size-4 rtl:rotate-180" />
                  </Button>
                )}
              </div>
            </div>
          </section>
        ) : (
          <Button href="/paths" variant="quiet">
            {t("browseAll")}
          </Button>
        )}
      </div>
    </div>
  );
}
