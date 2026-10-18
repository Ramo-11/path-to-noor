import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { StageChip } from "@/components/primer/StageChip";
import type { LessonPlace } from "./lesson-context";
import { SaveToggle } from "./SaveToggle";
import { StepCells } from "./LessonProgress";

interface LessonContextBarProps {
  place: LessonPlace;
  lessonId: string;
  saved: boolean;
  signedIn: boolean;
  signInHref: string;
}

export async function LessonContextBar({ place, lessonId, saved, signedIn, signInHref }: LessonContextBarProps) {
  const t = await getTranslations("lesson");
  const { path, step } = place;
  const stepLine =
    step && step.number !== null ? t("stepLabel", { number: step.number, title: step.title }) : step?.title ?? "";

  return (
    <div className="bg-canvas">
      <div className="mx-auto w-full max-w-3xl px-4 py-5 sm:px-6 lg:px-8">
        <SaveToggle lessonId={lessonId} initialSaved={saved} signedIn={signedIn} signInHref={signInHref}>
          <nav aria-label={t("contextLabel")} className="min-w-0">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
              {path ? <StageChip stage={path.stage} /> : null}
              {path ? (
                <Link
                  href={`/paths/${path.slug}`}
                  className="-my-3 inline-flex min-h-11 items-center text-meta font-medium text-ink-2 underline decoration-transparent underline-offset-[0.25em] transition-colors duration-150 hover:text-ink hover:decoration-ink"
                >
                  {path.title}
                </Link>
              ) : (
                <Link
                  href="/library"
                  className="-my-3 inline-flex min-h-11 items-center text-meta font-medium text-ink-2 underline decoration-transparent underline-offset-[0.25em] transition-colors duration-150 hover:text-ink hover:decoration-ink"
                >
                  {t("library")}
                </Link>
              )}
            </div>
            {stepLine ? (
              <p className="mt-1.5 text-[0.9375rem] font-semibold leading-snug text-ink text-pretty">{stepLine}</p>
            ) : null}
          </nav>
        </SaveToggle>
        {place.lessonNumber !== null && place.lessonCount !== null ? (
          <div className="mt-4 flex items-center gap-4">
            {path && place.cells.length > 0 ? (
              <StepCells cells={place.cells} currentId={lessonId} stage={path.stage} className="flex-1" />
            ) : null}
            <p className="shrink-0 text-meta text-ink-3 tabular">
              {t("lessonOf", { current: place.lessonNumber, total: place.lessonCount })}
            </p>
          </div>
        ) : null}
      </div>
    </div>
  );
}
