"use client";

import { ArrowRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/primer/Button";
import { Illustration } from "@/components/primer/Illustration";
import { PLACEMENT_QUESTIONS } from "@/lib/placement";
import { STAGE_NUMBER, STAGES, type StageKey } from "@/lib/stages";
import { QuestionTabs } from "./QuestionTabs";
import { RecommendedPath } from "./RecommendedPath";
import type { Recommendation } from "./recommendations";
import { StageBanner } from "./StageBanner";
import { StageTile } from "./StageTile";

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
      <div className="grid overflow-hidden rounded-[var(--radius-panel)] bg-stage1-tint md:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)]">
        <div className="flex flex-col justify-center px-6 pt-8 pb-6 sm:px-10 sm:pt-10 md:py-14 lg:px-14">
          <h1
            ref={headingRef}
            tabIndex={-1}
            className="text-title font-semibold text-balance focus-visible:outline-none!"
          >
            {t("title")}
          </h1>
          <p className="mt-3 max-w-[38ch] text-lg text-ink-2 text-pretty">{t("lead")}</p>
          <div className="mt-7">
            <QuestionTabs total={PLACEMENT_QUESTIONS.length} current={null} answered={[]} />
          </div>
          <div className="mt-8 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:gap-6">
            <Button size="lg" onClick={onBegin} className="w-full sm:w-auto">
              {t("begin")}
              {arrow}
            </Button>
            <Button href="/paths" variant="quiet" className="self-center sm:self-auto">
              {t("skip")}
            </Button>
          </div>
        </div>
        <div className="px-3 pb-3 md:py-3 md:ps-0">
          <div className="aspect-[4/3] overflow-hidden rounded-[calc(var(--radius-panel)-0.5rem)] md:aspect-auto md:h-full md:min-h-[17rem]">
            <Illustration
              name="journey"
              sizes="(min-width: 768px) 48vw, 100vw"
              priority
              className="rtl:-scale-x-100"
            />
          </div>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-3 gap-3 sm:mt-10 sm:gap-4">
        {STAGES.map((stage) => (
          <StageTile key={stage} stage={stage} />
        ))}
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

  return (
    <div className="settle mx-auto max-w-3xl">
      <StageBanner
        stage={stage}
        headingRef={headingRef}
        title={t("title", { number: STAGE_NUMBER[stage], name: tStages(`${stage}.name`) })}
        sentence={tStages(`${stage}.short`)}
      />
      <div className="mt-10 sm:mt-12">
        <RecommendedPath recommendation={recommendation} stage={stage} />
      </div>
      <div className="mt-8 border-t border-rule pt-6">
        <Button variant="quiet" onClick={onRetake}>
          {t("retake")}
        </Button>
      </div>
    </div>
  );
}
