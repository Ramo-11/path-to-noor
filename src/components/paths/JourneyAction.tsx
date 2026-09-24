import { ArrowRight, Check } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/primer/Button";
import { ProgressCells } from "@/components/primer/ProgressCells";
import type { PathOutline } from "@/lib/learning-types";
import { STAGE_STYLES, localized } from "@/lib/stages";

interface JourneyActionProps {
  path: PathOutline;
  locale: string;
  signedIn: boolean;
}

export async function JourneyAction({ path, locale, signedIn }: JourneyActionProps) {
  const t = await getTranslations("paths");
  const tl = await getTranslations("learning");
  const style = STAGE_STYLES[path.stage];
  const started = signedIn && path.completedLessons > 0;
  const complete = signedIn && path.isComplete;
  const next = complete ? null : path.nextLesson;
  const firstLesson = path.steps.find((step) => step.lessons.length > 0)?.lessons[0] ?? null;
  const progressText = complete
    ? tl("complete")
    : tl("lessonsDone", { done: path.completedLessons, total: path.totalLessons });

  if (!firstLesson) {
    return (
      <div className="primer-grid">
        <div className="flex flex-col items-start gap-3 p-5 sm:p-6">
          <p className="font-semibold text-ink text-balance">{t("noLessonsTitle")}</p>
          <p className="text-ink-2 text-pretty">{t("noLessonsBody")}</p>
          <Button href="/paths" variant="secondary" className="mt-2">
            {t("browseAll")}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="primer-grid">
      <div className="flex flex-col gap-4 p-5 sm:p-6">
        {signedIn ? (
          <div>
            <p aria-hidden="true" className="text-meta font-medium text-ink">
              {progressText}
            </p>
            <ProgressCells
              className="mt-2"
              done={path.completedLessons}
              total={path.totalLessons}
              stage={path.stage}
              label={progressText}
            />
          </div>
        ) : null}

        {complete ? (
          <>
            <p className="flex items-center gap-3 text-ink">
              <span
                aria-hidden="true"
                className={`grid size-7 shrink-0 place-items-center rounded-md ${style.fill} ${style.onFill}`}
              >
                <Check strokeWidth={2.5} className="size-4" />
              </span>
              {t("finishedLine")}
            </p>
            <Button href={`/learn/${firstLesson.slug}`} size="lg" variant="secondary" fullWidth>
              {tl("reviewPath")}
            </Button>
          </>
        ) : started && next ? (
          <div>
            <Button href={`/learn/${next.slug}`} size="lg" fullWidth>
              {tl("continue")}
              <ArrowRight aria-hidden="true" className="size-4 rtl:rotate-180" />
            </Button>
            <p className="mt-3 text-meta text-ink-2 text-pretty">
              {t("nextCaption", {
                step: next.stepIndex + 1,
                lesson: next.lessonIndex + 1,
                title: localized(next.title, locale),
              })}
            </p>
          </div>
        ) : (
          <div>
            <Button href={`/learn/${(next ?? firstLesson).slug}`} size="lg" fullWidth>
              {tl("startPath")}
              <ArrowRight aria-hidden="true" className="size-4 rtl:rotate-180" />
            </Button>
            {signedIn ? null : (
              <Link
                href="/register"
                className="mt-2 inline-flex min-h-11 items-center text-[0.9375rem] text-ink-2 underline decoration-rule-strong underline-offset-[0.25em] transition-colors duration-150 hover:text-ink hover:decoration-ink"
              >
                {t("registerPrompt")}
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
