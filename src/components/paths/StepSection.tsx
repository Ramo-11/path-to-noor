import { ArrowRight, Check, ChevronDown } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import type { StepOutline } from "@/lib/learning-types";
import { STAGE_STYLES, localized, type StageKey } from "@/lib/stages";
import { MetaList } from "./MetaList";
import { durationOf } from "./duration";
import type { StepState } from "./StepTabs";

interface StepSectionProps {
  step: StepOutline;
  number: number;
  isLast: boolean;
  state: StepState;
  stage: StageKey;
  locale: string;
  signedIn: boolean;
  nextLessonId: string | null;
}

export async function StepSection({
  step,
  number,
  isLast,
  state,
  stage,
  locale,
  signedIn,
  nextLessonId,
}: StepSectionProps) {
  const t = await getTranslations("paths");
  const tl = await getTranslations("learning");
  const style = STAGE_STYLES[stage];
  const titleId = `step-${number}-title`;
  const description = localized(step.description, locale);
  const duration = durationOf(step.totalMinutes);
  const partlyDone = signedIn && step.completedCount > 0 && !step.isComplete;
  const defaultOpen = !step.isPreparing && state === "current";

  const numeralStates: Record<Exclude<StepState, "complete">, string> = {
    current: `border-2 ${style.border} ${style.tint} ${style.text}`,
    upcoming: "border border-rule bg-page text-ink",
    preparing: "border border-rule bg-wash text-ink-3",
  };
  const numeral = state === "complete" ? `${style.fill} ${style.onFill}` : numeralStates[state];

  const header = (
    <>
      <h2 id={titleId} className="text-heading font-semibold text-balance">
        <span className="sr-only">{t("stepHeading", { number })} </span>
        {localized(step.title, locale)}
      </h2>
      {description ? <p className="mt-2 line-clamp-1 max-w-[62ch] text-ink-2">{description}</p> : null}
      <MetaList
        className="mt-3"
        items={
          step.isPreparing
            ? []
            : [
                tl("lessonCount", { count: step.lessons.length }),
                duration ? tl(duration.key, { count: duration.count }) : null,
                partlyDone
                  ? tl("lessonsDone", { done: step.completedCount, total: step.lessons.length })
                  : null,
              ]
        }
      />
    </>
  );

  return (
    <section
      id={`step-${number}`}
      aria-labelledby={titleId}
      className="grid scroll-mt-44 grid-cols-[2.75rem_minmax(0,1fr)] gap-x-3 sm:grid-cols-[5rem_minmax(0,1fr)] sm:gap-x-8 lg:scroll-mt-28"
    >
      <div aria-hidden="true" className="flex flex-col items-center">
        <span
          className={`relative z-10 grid size-11 place-items-center rounded-full text-2xl font-semibold tabular sm:size-20 sm:text-5xl ${numeral}`}
        >
          {number}
        </span>
        {isLast ? null : <span className="w-px flex-1 bg-rule" />}
      </div>

      <div className={`min-w-0 pt-2 sm:pt-5 ${isLast ? "" : "pb-16 sm:pb-20"}`}>
        {step.isPreparing ? (
          <>
            {header}
            <div className="mt-6 rounded-[var(--radius-cell)] bg-wash px-5 py-5 text-ink-2 sm:px-6">
              {t("stepPreparing")}
            </div>
          </>
        ) : (
          <details className="group" open={defaultOpen}>
            <summary className="flex cursor-pointer list-none items-start justify-between gap-3 [&::-webkit-details-marker]:hidden">
              <div className="min-w-0">{header}</div>
              <ChevronDown
                aria-hidden="true"
                strokeWidth={1.75}
                className="mt-1 size-5 shrink-0 text-ink-3 transition-transform duration-200 group-open:rotate-180"
              />
            </summary>

            <ol className="mt-6 flex flex-col gap-2">
              {step.lessons.map((lesson, index) => {
                const lessonNumber = `${number}.${index + 1}`;
                const isNext = lesson.id === nextLessonId;
                const isDone = signedIn && lesson.completed;

                return (
                  <li key={lesson.id} className="relative">
                    <Link
                      href={`/learn/${lesson.slug}`}
                      className={`group/row flex min-h-16 items-center gap-3 rounded-[var(--radius-control)] px-4 py-3 transition-colors duration-150 focus-visible:-outline-offset-4! sm:gap-5 sm:px-5 ${
                        isNext ? style.tint : "hover:bg-wash"
                      }`}
                    >
                      <span
                        className={`hidden w-10 shrink-0 font-semibold tabular sm:block ${isNext ? style.text : "text-ink-3"}`}
                      >
                        {lessonNumber}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block font-medium text-ink text-pretty">
                          {localized(lesson.title, locale)}
                        </span>
                        <span className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-meta text-ink-3">
                          <span className="font-semibold tabular sm:hidden">{lessonNumber}</span>
                          {isNext ? <span className={`font-medium ${style.text}`}>{tl("upNext")}</span> : null}
                          {isDone ? <span className="font-medium text-ink-2">{tl("done")}</span> : null}
                          {lesson.estimatedMinutes > 0 ? (
                            <span className="tabular">{tl("minutes", { count: lesson.estimatedMinutes })}</span>
                          ) : null}
                        </span>
                      </span>
                      {isDone ? (
                        <span
                          aria-hidden="true"
                          className="grid size-8 shrink-0 place-items-center rounded-full bg-stage2 text-on-stage2"
                        >
                          <Check strokeWidth={2.5} className="size-4" />
                        </span>
                      ) : isNext ? (
                        <span
                          aria-hidden="true"
                          className="inline-flex min-h-11 min-w-11 shrink-0 items-center justify-center gap-1.5 rounded-full bg-primary px-2.5 text-[0.9375rem] font-medium text-on-primary transition-colors duration-150 group-hover/row:bg-primary-hover sm:px-3.5"
                        >
                          <span className="hidden sm:inline">{tl("start")}</span>
                          <ArrowRight className="size-4 rtl:rotate-180" />
                        </span>
                      ) : signedIn ? (
                        <span
                          aria-hidden="true"
                          className="size-8 shrink-0 rounded-full border border-rule-strong"
                        />
                      ) : (
                        <ArrowRight
                          aria-hidden="true"
                          className="size-5 shrink-0 text-ink-3 transition-colors duration-150 group-hover/row:text-ink rtl:rotate-180"
                        />
                      )}
                    </Link>
                  </li>
                );
              })}
            </ol>
          </details>
        )}

        {signedIn && step.isComplete ? (
          <p className="mt-5 flex items-center gap-4 text-meta font-medium text-ink">
            <span className="shrink-0">{t("stepComplete", { number })}</span>
            <span aria-hidden="true" className={`h-1 flex-1 rounded-[2px] ${style.fill}`} />
          </p>
        ) : null}
      </div>
    </section>
  );
}
