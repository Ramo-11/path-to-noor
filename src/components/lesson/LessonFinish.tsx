"use client";

import { useEffect, useId, useRef, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { ArrowRight, Check } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/primer/Button";
import { Notice } from "@/components/primer/Notice";
import { Illustration } from "@/components/primer/Illustration";
import { STAGE_STYLES, type StageKey } from "@/lib/stages";
import { StepCells, useLessonProgress } from "./LessonProgress";

export interface FinishLesson {
  slug: string;
  title: string;
  stepNumber: number | null;
  stepTitle: string;
  minutes: number;
}

interface LessonFinishProps {
  lessonId: string;
  signedIn: boolean;
  stage: StageKey | null;
  checkHref: string | null;
  upNext: FinishLesson | null;
  step: { number: number | null; title: string } | null;
  cells: Array<{ id: string; completed: boolean }>;
  completesStep: boolean;
  completesPath: boolean;
  path: { slug: string; title: string } | null;
}

function UpNextRow({ lesson, className = "" }: { lesson: FinishLesson; className?: string }) {
  const t = useTranslations("lesson");
  const stepLabel =
    lesson.stepNumber !== null
      ? t("stepLabel", { number: lesson.stepNumber, title: lesson.stepTitle })
      : lesson.stepTitle;
  const meta = lesson.minutes > 0 ? t("metaPair", { first: stepLabel, second: t("minutes", { count: lesson.minutes }) }) : stepLabel;

  return (
    <div className={`flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between ${className}`}>
      <div className="min-w-0">
        <p className="text-lg text-ink-2 text-pretty">
          {t.rich("upNext", {
            title: lesson.title,
            strong: (chunks) => <span className="font-semibold text-ink">{chunks}</span>,
          })}
        </p>
        {meta ? <p className="mt-1 text-meta text-ink-3">{meta}</p> : null}
      </div>
      <Button size="lg" href={`/learn/${lesson.slug}`} className="shrink-0">
        {t("continue")}
        <ArrowRight aria-hidden="true" strokeWidth={2} className="size-[18px] rtl:rotate-180" />
      </Button>
    </div>
  );
}

function PathLink({ path }: { path: { slug: string; title: string } | null }) {
  const t = useTranslations("lesson");
  return path ? (
    <Button variant="quiet" href={`/paths/${path.slug}`}>
      {t("backToPath")}
    </Button>
  ) : (
    <Button variant="quiet" href="/paths">
      {t("seeAllPaths")}
    </Button>
  );
}

function FinishHead({ tint, children }: { tint: string; children: ReactNode }) {
  return (
    <div className={`grid gap-6 px-6 py-8 sm:grid-cols-[minmax(0,1fr)_7rem] sm:items-center sm:px-8 sm:py-10 ${tint}`}>
      <div className="min-w-0">{children}</div>
      <div className="hidden aspect-square w-full overflow-hidden rounded-[var(--radius-cell)] sm:block">
        <Illustration name="sprout" sizes="112px" />
      </div>
    </div>
  );
}

export function LessonFinish({
  signedIn,
  stage,
  checkHref,
  upNext,
  step,
  cells,
  completesStep,
  completesPath,
  path,
  lessonId,
}: LessonFinishProps) {
  const t = useTranslations("lesson");
  const titleId = useId();
  const milestoneId = useId();
  const doneHeading = useRef<HTMLHeadingElement>(null);
  const { done, justDone, status, markDone } = useLessonProgress();
  const style = stage ? STAGE_STYLES[stage] : null;
  const panelTint = style ? style.tint : "bg-stage1-tint";

  useEffect(() => {
    if (justDone) doneHeading.current?.focus();
  }, [justDone]);

  if (!signedIn) {
    return (
      <section aria-labelledby={titleId} className="overflow-hidden rounded-[var(--radius-panel)] bg-surface">
        <FinishHead tint={panelTint}>
          <h2 id={titleId} className="text-heading font-semibold text-balance">
            {upNext ? t("guestTitle") : t("guestEndTitle")}
          </h2>
          {upNext ? (
            <>
              <UpNextRow lesson={upNext} className="mt-5" />
              {checkHref ? (
                <div className="mt-4">
                  <Button variant="secondary" href={checkHref}>
                    {t("takeCheck")}
                  </Button>
                </div>
              ) : null}
            </>
          ) : (
            <div className="mt-6 flex flex-wrap items-center gap-3">
              {checkHref ? (
                <Button size="lg" href={checkHref}>
                  {t("takeCheck")}
                </Button>
              ) : null}
              <Button
                size="lg"
                variant={checkHref ? "secondary" : "primary"}
                href={path ? `/paths/${path.slug}` : "/paths"}
              >
                {path ? t("backToPath") : t("seeAllPaths")}
              </Button>
            </div>
          )}
          <p className="mt-6 text-[0.9375rem] text-ink-2 text-pretty">
            {t.rich("guestInvite", {
              link: (chunks) => (
                <Link
                  href="/register"
                  className="font-medium text-ink underline decoration-rule-strong underline-offset-[0.25em] transition-colors duration-150 hover:decoration-ink"
                >
                  {chunks}
                </Link>
              ),
            })}
          </p>
        </FinishHead>
      </section>
    );
  }

  if (!done) {
    return (
      <section aria-labelledby={titleId} className="overflow-hidden rounded-[var(--radius-panel)] bg-surface">
        <FinishHead tint={panelTint}>
          <h2 id={titleId} className="text-heading font-semibold text-balance">
            {t("finishTitle")}
          </h2>
          <p className="mt-2 max-w-[52ch] text-ink-2 text-pretty">{t("finishBody")}</p>
          {status === "error" ? (
            <Notice tone="error" className="mt-5">
              {t("markError")}
            </Notice>
          ) : null}
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Button size="lg" onClick={markDone}>
              <Check aria-hidden="true" strokeWidth={2} className="size-[18px]" />
              {t("markDone")}
            </Button>
            {checkHref ? (
              <Button size="lg" variant="secondary" href={checkHref}>
                {t("takeCheck")}
              </Button>
            ) : null}
          </div>
        </FinishHead>
      </section>
    );
  }

  const showStepMilestone = justDone && completesStep && !completesPath && step?.number != null;
  const showPathMilestone = justDone && completesPath && path !== null;
  const stepLine =
    step && step.number !== null ? t("stepLabel", { number: step.number, title: step.title }) : step?.title ?? "";
  const doneInStep = cells.filter((cell) => (cell.id === lessonId ? true : cell.completed)).length;

  return (
    <section aria-labelledby={titleId} className="overflow-hidden rounded-[var(--radius-panel)] bg-surface">
      <FinishHead tint={panelTint}>
        <h2
          id={titleId}
          ref={doneHeading}
          tabIndex={-1}
          aria-describedby={showStepMilestone || showPathMilestone ? milestoneId : undefined}
          className="flex items-center gap-3 text-heading font-semibold"
        >
          <span
            aria-hidden="true"
            className={`relative grid size-8 shrink-0 place-items-center overflow-hidden rounded-full ${
              style ? `${style.fill} ${style.onFill}` : "bg-primary text-on-primary"
            } ${justDone ? "fill-in" : ""}`}
          >
            <Check strokeWidth={2.5} className="size-[18px]" />
          </span>
          {justDone ? t("doneTitle") : t("alreadyDone")}
        </h2>
        {stage && cells.length > 0 ? (
          <div className="mt-6">
            <p className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 text-meta">
              <span className="font-medium text-ink">{stepLine}</span>
              <span className="text-ink-3 tabular">{t("stepProgress", { done: doneInStep, total: cells.length })}</span>
            </p>
            <StepCells cells={cells} currentId={lessonId} stage={stage} className="mt-2.5" />
          </div>
        ) : null}
      </FinishHead>

      {showStepMilestone && style && step ? (
        <div className="relative overflow-hidden">
          <span aria-hidden="true" className={`absolute inset-0 ${style.fill} fill-in`} />
          <p id={milestoneId} className={`relative px-6 py-5 text-lg font-semibold sm:px-8 ${style.onFill}`}>
            {t("stepComplete", { number: step.number ?? 0, title: step.title })}
          </p>
        </div>
      ) : null}

      {showPathMilestone && path ? (
        <div className="relative overflow-hidden">
          <span
            aria-hidden="true"
            className={`absolute inset-0 ${style ? style.fill : "bg-primary"} fill-up`}
          />
          <div
            id={milestoneId}
            className={`relative px-6 py-8 sm:px-8 sm:py-10 ${style ? style.onFill : "text-on-primary"}`}
          >
            <p className="text-heading font-semibold text-balance">{t("pathComplete", { title: path.title })}</p>
            <p className="mt-2 max-w-[52ch]">{t("pathCompleteBody")}</p>
          </div>
        </div>
      ) : null}

      {upNext ? (
        <div className="border-t border-rule px-6 py-7 sm:px-8">
          <UpNextRow lesson={upNext} />
        </div>
      ) : null}

      <div className="flex flex-wrap items-center gap-x-5 gap-y-3 border-t border-rule px-6 py-6 sm:px-8">
        {upNext ? (
          <>
            {checkHref ? (
              <Button variant="secondary" href={checkHref}>
                {t("takeCheck")}
              </Button>
            ) : null}
            <PathLink path={path} />
          </>
        ) : checkHref ? (
          <>
            <Button size="lg" href={checkHref}>
              {t("takeCheck")}
            </Button>
            <PathLink path={path} />
          </>
        ) : (
          <Button size="lg" href={path ? `/paths/${path.slug}` : "/paths"}>
            {path ? t("backToPath") : t("seeAllPaths")}
          </Button>
        )}
      </div>
    </section>
  );
}
