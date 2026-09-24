import { ArrowRight } from "lucide-react";
import { Button } from "@/components/primer/Button";
import { Illustration } from "@/components/primer/Illustration";
import { Notice } from "@/components/primer/Notice";
import { ProgressCells } from "@/components/primer/ProgressCells";
import { StageChip } from "@/components/primer/StageChip";
import { pathArt } from "@/lib/illustrations";
import { localized } from "@/lib/stages";
import type { LearnerState } from "@/lib/learning-types";
import type { Translate } from "./types";

interface ContinueBlockProps {
  state: LearnerState;
  locale: string;
  t: Translate;
  tLearning: Translate;
  tStages: Translate;
}

export function ContinueBlock({ state, locale, t, tLearning, tStages }: ContinueBlockProps) {
  const { currentPath, recommendedPath, startedPaths } = state;

  if (currentPath?.nextLesson) {
    const { nextLesson } = currentPath;
    const started = currentPath.completedLessons > 0;
    const progressLabel = tLearning("lessonsDone", {
      done: currentPath.completedLessons,
      total: currentPath.totalLessons,
    });

    return (
      <article className="card flex h-full flex-col overflow-hidden shadow-lift">
        <div className="relative aspect-[16/8] overflow-hidden">
          <StageChip stage={currentPath.stage} className="absolute start-3 top-3 shadow-soft z-10" />
          <Illustration
            name={pathArt(currentPath.slug, currentPath.stage)}
            sizes="(min-width: 1024px) 540px, 100vw"
            priority
          />
        </div>
        <div className="flex flex-1 flex-col p-6 sm:p-7">
          <h2 className="text-heading font-semibold text-balance">
            {started ? t("continueHeading") : t("pathReady")}
          </h2>
          <p className="mt-1.5 text-ink-2 text-pretty">
            {t("continueLessonLine", {
              step: nextLesson.stepIndex + 1,
              lesson: nextLesson.lessonIndex + 1,
              title: localized(nextLesson.title, locale),
            })}
          </p>
          <div className="mt-auto pt-6">
            <ProgressCells
              done={currentPath.completedLessons}
              total={currentPath.totalLessons}
              stage={currentPath.stage}
              label={progressLabel}
            />
            <p className="mt-2.5 text-meta text-ink-3 tabular">{progressLabel}</p>
            <Button href={`/learn/${nextLesson.slug}`} size="lg" className="mt-5 w-full sm:w-auto">
              {started ? tLearning("continue") : tLearning("start")}
              <ArrowRight aria-hidden="true" className="size-4 rtl:rotate-180" />
            </Button>
          </div>
        </div>
      </article>
    );
  }

  if (recommendedPath && !recommendedPath.isComplete && recommendedPath.nextLesson) {
    return (
      <article className="card flex h-full flex-col overflow-hidden shadow-lift">
        <div className="relative aspect-[16/8] overflow-hidden">
          <StageChip stage={recommendedPath.stage} className="absolute start-3 top-3 shadow-soft z-10" />
          <Illustration
            name={pathArt(recommendedPath.slug, recommendedPath.stage)}
            sizes="(min-width: 1024px) 540px, 100vw"
          />
        </div>
        <div className="flex flex-1 flex-col p-6 sm:p-7">
          <h2 className="text-heading font-semibold text-balance">{t("pathReady")}</h2>
          <p className="mt-1.5 text-ink text-pretty">{localized(recommendedPath.title, locale)}</p>
          <Button href={`/paths/${recommendedPath.slug}`} size="lg" className="mt-auto w-full sm:w-auto">
            {tLearning("start")}
            <ArrowRight aria-hidden="true" className="size-4 rtl:rotate-180" />
          </Button>
        </div>
      </article>
    );
  }

  if (startedPaths.length > 0 || recommendedPath?.isComplete) {
    return (
      <div className="card flex h-full flex-col items-start gap-4 p-6 sm:p-7">
        <p className="text-lg text-ink text-balance">{t("allCaughtUp")}</p>
        <Button href="/paths" variant="quiet" className="mt-auto">
          {t("exploreMorePaths")}
        </Button>
      </div>
    );
  }

  if (state.placement) {
    return (
      <Notice tone="info" className="h-full">
        <p>{tStages("preparing")}</p>
      </Notice>
    );
  }

  return null;
}
