import { Button } from "@/components/primer/Button";
import { ProgressCells } from "@/components/primer/ProgressCells";
import { Notice } from "@/components/primer/Notice";
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
      <div className="flex flex-col items-start gap-5">
        <h2 className="text-heading font-semibold">{started ? t("continueHeading") : t("pathReady")}</h2>
        <p className="text-lg text-ink text-balance">
          {t("continueLessonLine", {
            step: nextLesson.stepIndex + 1,
            lesson: nextLesson.lessonIndex + 1,
            title: localized(nextLesson.title, locale),
          })}
        </p>
        <div className="w-full max-w-xs">
          <ProgressCells
            done={currentPath.completedLessons}
            total={currentPath.totalLessons}
            stage={currentPath.stage}
            label={progressLabel}
          />
        </div>
        <p className="text-meta text-ink-3">{progressLabel}</p>
        <Button href={`/learn/${nextLesson.slug}`} variant="primary">
          {started ? tLearning("continue") : tLearning("start")}
        </Button>
      </div>
    );
  }

  if (recommendedPath && !recommendedPath.isComplete && recommendedPath.nextLesson) {
    return (
      <div className="flex flex-col items-start gap-5">
        <h2 className="text-heading font-semibold">{t("pathReady")}</h2>
        <p className="text-lg text-ink text-balance">{localized(recommendedPath.title, locale)}</p>
        <Button href={`/paths/${recommendedPath.slug}`} variant="primary">
          {tLearning("start")}
        </Button>
      </div>
    );
  }

  if (startedPaths.length > 0 || recommendedPath?.isComplete) {
    return (
      <div className="flex flex-col items-start gap-4">
        <p className="text-lg text-ink text-balance">{t("allCaughtUp")}</p>
        <Button href="/paths" variant="quiet">
          {t("exploreMorePaths")}
        </Button>
      </div>
    );
  }

  if (state.placement) {
    return (
      <Notice tone="info">
        <p>{tStages("preparing")}</p>
      </Notice>
    );
  }

  return null;
}
