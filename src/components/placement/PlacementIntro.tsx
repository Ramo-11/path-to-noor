"use client";

import { ArrowRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/primer/Button";
import { ProgressCells } from "@/components/primer/ProgressCells";
import { STAGE_NUMBER, type StageKey } from "@/lib/stages";
import { PLACEMENT_QUESTIONS } from "@/lib/placement";
import type { Recommendation } from "./recommendations";
import { QuestionTabs } from "./QuestionTabs";
import { StageFill } from "./StageFill";

const arrow = <ArrowRight aria-hidden="true" strokeWidth={1.75} className="size-5 shrink-0 rtl:rotate-180" />;

export function NewIntro({
  headingRef,
  onBegin,
}: {
  headingRef: React.RefObject<HTMLHeadingElement | null>;
  onBegin: () => void;
}) {
  const t = useTranslations("start.intro");

  return (
    <div>
      <h1 ref={headingRef} tabIndex={-1} className="text-display font-semibold text-balance focus-visible:outline-none!">
        {t("title")}
      </h1>
      <p className="mt-6 max-w-[52ch] text-lg text-ink-2 text-pretty sm:text-xl sm:leading-relaxed">
        {t("lead")}
      </p>
      <div className="mt-10">
        <QuestionTabs total={PLACEMENT_QUESTIONS.length} current={null} answered={[]} />
        <p className="mt-3 text-meta text-ink-3">{t("note")}</p>
      </div>
      <div className="mt-10 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:gap-8">
        <Button size="lg" onClick={onBegin} className="w-full sm:w-auto">
          {t("begin")}
          {arrow}
        </Button>
        <Button href="/paths" variant="quiet" className="self-center sm:self-auto">
          {t("skip")}
        </Button>
      </div>
    </div>
  );
}

export function ExistingIntro({
  stage,
  recommendation,
  headingRef,
  onRetake,
}: {
  stage: StageKey;
  recommendation: Recommendation | null;
  headingRef: React.RefObject<HTMLHeadingElement | null>;
  onRetake: () => void;
}) {
  const t = useTranslations("start.existing");
  const tStages = useTranslations("stages");
  const tLearning = useTranslations("learning");
  const tResult = useTranslations("start.result");
  const path = recommendation?.path ?? null;
  const continueHref = path ? path.startHref : recommendation ? "/library" : "/paths";

  return (
    <div className="settle grid gap-8 md:grid-cols-[14rem_minmax(0,1fr)] md:gap-12">
      <StageFill stage={stage} animate={false} />
      <div className="min-w-0">
        <h1 ref={headingRef} tabIndex={-1} className="text-title font-semibold text-balance focus-visible:outline-none!">
          {t("title", { number: STAGE_NUMBER[stage], name: tStages(`${stage}.name`) })}
        </h1>
        <p className="mt-4 max-w-[60ch] text-lg text-ink-2 text-pretty">{tStages(`${stage}.long`)}</p>

        {path ? (
          <div className="primer-grid mt-8">
            <div className="px-5 py-5 sm:px-6">
              <p className="font-semibold text-pretty">{path.title}</p>
              <p className="mt-1 text-[0.9375rem] text-ink-2 text-pretty">
                {path.next && !path.isComplete
                  ? t("nextLesson", { title: path.next.title })
                  : tLearning("lessonCount", { count: path.totalLessons })}
              </p>
              {path.isStarted ? (
                <div className="mt-4">
                  <ProgressCells
                    done={path.completedLessons}
                    total={path.totalLessons}
                    stage={path.stage}
                    label={tLearning("lessonsDone", { done: path.completedLessons, total: path.totalLessons })}
                  />
                  <p className="mt-2 text-meta text-ink-3 tabular">
                    {tLearning("lessonsDone", { done: path.completedLessons, total: path.totalLessons })}
                  </p>
                </div>
              ) : null}
            </div>
          </div>
        ) : null}
        {path && recommendation?.isFallback ? (
          <p className="mt-3 max-w-[60ch] text-[0.9375rem] text-ink-2 text-pretty">
            {tResult("fallback", { stage: tStages(`${stage}.name`) })}
          </p>
        ) : null}

        <div className="mt-8 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:gap-4">
          <Button href={continueHref} size="lg" className="w-full sm:w-auto">
            {t("continue")}
            {arrow}
          </Button>
          <Button variant="secondary" size="lg" onClick={onRetake} className="w-full sm:w-auto">
            {t("retake")}
          </Button>
        </div>
        {path ? (
          <Button href={path.pathHref} variant="quiet" className="mt-3">
            {t("seePath")}
          </Button>
        ) : null}
      </div>
    </div>
  );
}
