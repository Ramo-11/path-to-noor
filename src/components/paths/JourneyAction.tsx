import { ArrowRight, Check } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/primer/Button";
import { PathProgress } from "@/components/paths/PathProgress";
import type { PathOutline } from "@/lib/learning-types";
import { localized } from "@/lib/stages";
import { toneStyle } from "@/lib/path-tone";

interface JourneyActionProps {
  path: PathOutline;
  locale: string;
  signedIn: boolean;
}

export async function JourneyAction({ path, locale, signedIn }: JourneyActionProps) {
  const t = await getTranslations("paths");
  const tl = await getTranslations("learning");
  const style = toneStyle(path.stage);
  const started = signedIn && path.completedLessons > 0;
  const complete = signedIn && path.isComplete;
  const next = complete ? null : path.nextLesson;
  const firstLesson = path.steps.find((step) => step.lessons.length > 0)?.lessons[0] ?? null;
  const progressText = complete
    ? tl("complete")
    : tl("lessonsDone", { done: path.completedLessons, total: path.totalLessons });

  if (!firstLesson) {
    return (
      <div className="flex flex-col items-start gap-3">
        <p className="font-semibold text-ink text-balance">{t("noLessonsTitle")}</p>
        <p className="text-ink-2 text-pretty">{t("noLessonsBody")}</p>
        <Button href="/paths" variant="secondary" className="mt-1">
          {t("browseAll")}
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {signedIn ? (
        <div className="max-w-xs">
          <p aria-hidden="true" className="text-meta font-medium text-ink">
            {progressText}
          </p>
          <PathProgress
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
              className={`grid size-7 shrink-0 place-items-center rounded-full ${style.fill} ${style.onFill}`}
            >
              <Check strokeWidth={2.5} className="size-4" />
            </span>
            {t("finishedLine")}
          </p>
          <Button href={`/learn/${firstLesson.slug}`} size="lg" variant="secondary" className="w-full sm:w-auto">
            {tl("reviewPath")}
          </Button>
        </>
      ) : started && next ? (
        <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:gap-5">
          <Button href={`/learn/${next.slug}`} size="lg" className="w-full sm:w-auto">
            {tl("continue")}
            <ArrowRight aria-hidden="true" className="size-4 rtl:rotate-180" />
          </Button>
          <p className="text-meta text-ink-2 text-pretty">
            {t("nextCaption", {
              step: next.stepIndex + 1,
              lesson: next.lessonIndex + 1,
              title: localized(next.title, locale),
            })}
          </p>
        </div>
      ) : (
        <div className="flex flex-col items-start gap-2">
          <Button href={`/learn/${(next ?? firstLesson).slug}`} size="lg" className="w-full sm:w-auto">
            {tl("startPath")}
            <ArrowRight aria-hidden="true" className="size-4 rtl:rotate-180" />
          </Button>
          {signedIn ? null : (
            <Link
              href="/register"
              className="inline-flex min-h-11 items-center text-[0.9375rem] text-ink-2 underline decoration-rule-strong underline-offset-[0.25em] transition-colors duration-150 hover:text-ink hover:decoration-ink"
            >
              {t("registerPrompt")}
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
