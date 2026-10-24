"use client";

import { ArrowRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/primer/Button";
import { EmptyState } from "@/components/primer/EmptyState";
import { Illustration } from "@/components/primer/Illustration";
import { Notice } from "@/components/primer/Notice";
import { StageChip } from "@/components/primer/StageChip";
import { useRouter } from "@/i18n/navigation";
import { pathArtFor } from "@/lib/path-tone";
import type { StageKey } from "@/lib/stages";
import type { Recommendation } from "./recommendations";

export function RecommendedPath({
  recommendation,
  stage,
}: {
  recommendation: Recommendation | null;
  stage: StageKey;
}) {
  const t = useTranslations("start");
  const tStages = useTranslations("stages");
  const tLearning = useTranslations("learning");
  const router = useRouter();

  if (!recommendation) {
    return (
      <EmptyState
        art="lantern"
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

  const path = recommendation.path;
  if (!path) {
    return (
      <EmptyState
        art="lantern"
        title={t("result.noPath.title")}
        body={t("result.noPath.body")}
        action={<Button href="/library">{t("result.noPath.action")}</Button>}
      />
    );
  }

  const startLabel = path.isComplete
    ? tLearning("reviewPath")
    : path.isStarted
      ? tLearning("continuePath")
      : tLearning("startPath");

  return (
    <div className="card overflow-hidden">
      <div className="relative aspect-[16/8] overflow-hidden">
        {path.stage ? (
          <StageChip stage={path.stage} className="absolute start-3 top-3 shadow-soft z-10" />
        ) : null}
        <Illustration name={pathArtFor(path.slug, path.stage)} sizes="(min-width: 768px) 640px, 100vw" />
      </div>
      <div className="p-6 sm:p-8">
        <h2 id="placement-path-title" className="text-heading font-semibold text-balance">
          {path.title}
        </h2>
        <p className="mt-1.5 text-meta text-ink-3 tabular">
          {t("result.pathMeta", {
            steps: tLearning("stepCount", { count: path.steps.length }),
            lessons: tLearning("lessonCount", { count: path.totalLessons }),
          })}
        </p>
        {recommendation.isFallback ? (
          <Notice className="mt-4">{t("result.fallback", { stage: tStages(`${stage}.name`) })}</Notice>
        ) : null}
        <div className="mt-6 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:gap-6">
          <Button href={path.startHref} size="lg" className="w-full sm:w-auto">
            {startLabel}
            <ArrowRight aria-hidden="true" strokeWidth={1.75} className="size-5 shrink-0 rtl:rotate-180" />
          </Button>
          <Button href={path.pathHref} variant="quiet" className="self-center sm:self-auto">
            {t("result.seePath")}
          </Button>
        </div>
      </div>
    </div>
  );
}
