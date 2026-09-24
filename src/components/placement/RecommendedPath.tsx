"use client";

import { ArrowRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/primer/Button";
import { EmptyState } from "@/components/primer/EmptyState";
import { Notice } from "@/components/primer/Notice";
import { useRouter } from "@/i18n/navigation";
import { STAGE_STYLES, type StageKey } from "@/lib/stages";
import type { PathView, Recommendation, StepView } from "./recommendations";

function StepRow({ step, number, stage }: { step: StepView; number: number; stage: StageKey }) {
  const tLearning = useTranslations("learning");
  const style = STAGE_STYLES[stage];

  const tab = step.isComplete
    ? `${style.fill} ${style.onFill}`
    : step.isPreparing
      ? "border border-dashed border-rule-strong text-ink-3"
      : step.isNext
        ? "bg-ink text-page"
        : "border border-rule-strong text-ink";

  const meta = step.isPreparing
    ? tLearning("comingSoon")
    : step.isComplete
      ? tLearning("done")
      : step.completedCount > 0
        ? tLearning("lessonsDone", { done: step.completedCount, total: step.lessonCount })
        : tLearning("lessonCount", { count: step.lessonCount });

  return (
    <li className="flex items-center gap-4 px-4 py-3.5 sm:px-5 sm:py-4">
      <span
        aria-hidden="true"
        className={`grid size-10 shrink-0 place-items-center rounded-[8px] font-semibold tabular ${tab}`}
      >
        {number}
      </span>
      <span className="min-w-0 flex-1">
        <span className={`block leading-snug font-medium text-pretty ${step.isPreparing ? "text-ink-2" : "text-ink"}`}>
          <span className="sr-only">{tLearning("stepNumber", { number })}: </span>
          {step.title}
        </span>
        <span className="mt-0.5 block text-meta text-ink-3">{meta}</span>
      </span>
    </li>
  );
}

function PathBlock({
  path,
  isFallback,
  stage,
}: {
  path: PathView;
  isFallback: boolean;
  stage: StageKey;
}) {
  const t = useTranslations("start.result");
  const tLearning = useTranslations("learning");
  const tStages = useTranslations("stages");

  const startLabel = path.isComplete
    ? tLearning("reviewPath")
    : path.isStarted
      ? tLearning("continuePath")
      : tLearning("startPath");

  return (
    <div className="grid gap-10 lg:grid-cols-12 lg:gap-16">
      <div className="lg:col-span-5">
        <h2 id="placement-path-title" className="text-title font-semibold text-balance">
          {t("pathHeading", { title: path.title })}
        </h2>
        {path.description ? (
          <p className="mt-4 max-w-[56ch] text-lg text-ink-2 text-pretty">{path.description}</p>
        ) : null}
        <p className="mt-4 text-meta text-ink-3">
          {t("pathMeta", {
            steps: tLearning("stepCount", { count: path.steps.length }),
            lessons: tLearning("lessonCount", { count: path.totalLessons }),
          })}
        </p>
        {isFallback ? (
          <Notice className="mt-6">{t("fallback", { stage: tStages(`${stage}.name`) })}</Notice>
        ) : null}
        <div className="mt-8 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:gap-6">
          <Button href={path.startHref} size="lg" className="w-full sm:w-auto">
            {startLabel}
            <ArrowRight aria-hidden="true" strokeWidth={1.75} className="size-5 shrink-0 rtl:rotate-180" />
          </Button>
          <Button href={path.pathHref} variant="quiet" className="self-center sm:self-auto">
            {t("seePath")}
          </Button>
        </div>
      </div>
      <ol aria-label={t("stepsLabel")} className="primer-grid content-start self-start lg:col-span-7">
        {path.steps.map((step, index) => (
          <StepRow key={index} step={step} number={index + 1} stage={path.stage} />
        ))}
      </ol>
    </div>
  );
}

export function RecommendedPath({
  recommendation,
  stage,
}: {
  recommendation: Recommendation | null;
  stage: StageKey;
}) {
  const t = useTranslations("start");
  const router = useRouter();

  if (!recommendation) {
    return (
      <EmptyState
        title={t("pathsError.title")}
        body={t("pathsError.body")}
        action={
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-6">
            <Button onClick={() => router.refresh()}>{t("pathsError.retry")}</Button>
            <Button href="/paths" variant="quiet">
              {t("pathsError.browse")}
            </Button>
          </div>
        }
      />
    );
  }

  if (!recommendation.path) {
    return (
      <EmptyState
        title={t("result.noPath.title")}
        body={t("result.noPath.body")}
        action={<Button href="/library">{t("result.noPath.action")}</Button>}
      />
    );
  }

  return <PathBlock path={recommendation.path} isFallback={recommendation.isFallback} stage={stage} />;
}
