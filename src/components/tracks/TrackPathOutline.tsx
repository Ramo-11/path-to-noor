import { ArrowRight, Check } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/primer/Button";
import { PathProgress } from "@/components/paths/PathProgress";
import { OutcomesCard } from "@/components/paths/OutcomesCard";
import type { PathOutline } from "@/lib/learning-types";
import { localized } from "@/lib/stages";
import { toneStyle } from "@/lib/path-tone";

interface TrackPathOutlineProps {
  path: PathOutline;
  locale: string;
  signedIn: boolean;
}

export function TrackPathOutline({ path, locale, signedIn }: TrackPathOutlineProps) {
  const t = useTranslations("tracks.outline");
  const tl = useTranslations("learning");
  const style = toneStyle(path.stage);
  const nextStep = signedIn && !path.isComplete ? (path.nextLesson?.stepIndex ?? -1) : -1;
  const titleId = `outline-${path.slug}`;

  return (
    <section aria-labelledby={titleId} className="mt-10 sm:mt-14">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0">
          <h2 id={titleId} className="text-heading font-semibold text-balance">
            {t("title")}
          </h2>
          <p className="mt-1.5 text-ink-2 tabular">
            {t("counts", {
              steps: tl("stepCount", { count: path.steps.length }),
              lessons: tl("lessonCount", { count: path.totalLessons }),
            })}
          </p>
        </div>
        <Button href={`/paths/${path.slug}`} variant="quiet">
          {t("seePath")}
          <ArrowRight aria-hidden="true" strokeWidth={2} className="size-4 rtl:rotate-180" />
        </Button>
      </div>

      {signedIn && path.isStarted ? (
        <PathProgress
          done={path.completedLessons}
          total={path.totalLessons}
          stage={path.stage}
          label={tl("lessonsDone", { done: path.completedLessons, total: path.totalLessons })}
          className="mt-6 max-w-md"
        />
      ) : null}

      <ol className="mt-6 grid gap-3 sm:grid-cols-2">
        {path.steps.map((step, index) => {
          const done = signedIn && step.isComplete;
          const current = index === nextStep;
          const status = step.isPreparing
            ? tl("comingSoon")
            : done
              ? tl("done")
              : signedIn && step.completedCount > 0
                ? tl("lessonsDone", { done: step.completedCount, total: step.lessons.length })
                : tl("lessonCount", { count: step.lessons.length });

          return (
            <li
              key={step.id}
              aria-current={current ? "step" : undefined}
              className={`card flex items-start gap-4 p-4 sm:p-5 ${current ? "border-rule-strong shadow-lift" : ""}`}
            >
              <span
                aria-hidden="true"
                className={`inline-flex size-9 shrink-0 items-center justify-center rounded-full text-[0.9375rem] font-semibold tabular ${
                  done ? `${style.fill} ${style.onFill}` : `${style.tint} ${style.text}`
                }`}
              >
                {done ? <Check strokeWidth={2.5} className="size-4" /> : index + 1}
              </span>
              <div className="min-w-0 pt-1">
                <p className="text-meta font-medium text-ink-3">{tl("stepNumber", { number: index + 1 })}</p>
                <h3 className="mt-0.5 text-lg leading-snug font-semibold text-balance">
                  {localized(step.title, locale)}
                </h3>
                <p className="mt-1 text-[0.9375rem] text-ink-2 tabular">
                  {current ? t("current", { status }) : status}
                </p>
              </div>
            </li>
          );
        })}
      </ol>

      {path.outcomes.length > 0 ? (
        <OutcomesCard
          title={t("outcomes")}
          outcomes={path.outcomes}
          stage={path.stage}
          locale={locale}
          className="mt-8"
        />
      ) : null}
    </section>
  );
}
