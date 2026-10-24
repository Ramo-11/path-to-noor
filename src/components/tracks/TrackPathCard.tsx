import { useTranslations } from "next-intl";
import { Button } from "@/components/primer/Button";
import { Illustration } from "@/components/primer/Illustration";
import { PathProgress } from "@/components/paths/PathProgress";
import { pathArtFor } from "@/lib/path-tone";
import type { PathOutline } from "@/lib/learning-types";
import { localized } from "@/lib/stages";
import { TrackAction } from "./TrackAction";

interface TrackPathCardProps {
  path: PathOutline | null;
  fallbackTitle: string;
  locale: string;
  signedIn: boolean;
  recommended?: boolean;
  headingId: string;
}

export function TrackPathCard({
  path,
  fallbackTitle,
  locale,
  signedIn,
  recommended = false,
  headingId,
}: TrackPathCardProps) {
  const t = useTranslations("tracks");
  const tl = useTranslations("learning");
  const ready = path && path.totalLessons > 0 ? path : null;
  const title = path ? localized(path.title, locale) : fallbackTitle;
  const description = ready ? localized(ready.description, locale) : t("preparing.body");

  return (
    <article
      aria-labelledby={headingId}
      className={`card flex h-full w-full flex-col overflow-hidden ${recommended ? "shadow-lift" : ""}`}
    >
      <div className="relative aspect-[16/9] overflow-hidden">
        {recommended ? (
          <span className="absolute start-3 top-3 z-10 inline-flex items-center rounded-full bg-surface px-3 py-1 text-meta font-medium text-primary shadow-soft">
            {t("muslimPage.recommended")}
          </span>
        ) : null}
        <Illustration
          name={ready ? pathArtFor(ready.slug, ready.stage) : "lantern"}
          sizes="(min-width: 768px) 50vw, 100vw"
        />
      </div>
      <div className="flex flex-1 flex-col p-6 sm:p-8">
        <h2 id={headingId} className="text-heading font-semibold text-balance">
          {title}
        </h2>
        {ready ? null : <p className="mt-1.5 text-meta font-medium text-ink-3">{t("preparing.title")}</p>}
        <p className="mt-2 line-clamp-4 max-w-[52ch] text-ink-2 text-pretty">{description}</p>
        {ready ? (
          <div className="mt-auto pt-6">
            {signedIn && ready.isStarted && !ready.isComplete ? (
              <PathProgress
                done={ready.completedLessons}
                total={ready.totalLessons}
                stage={ready.stage}
                label={tl("lessonsDone", { done: ready.completedLessons, total: ready.totalLessons })}
                className="mb-2.5"
              />
            ) : null}
            <p className="text-meta text-ink-3 tabular">
              {signedIn && ready.isStarted
                ? tl("lessonsDone", { done: ready.completedLessons, total: ready.totalLessons })
                : t("outline.counts", {
                    steps: tl("stepCount", { count: ready.steps.length }),
                    lessons: tl("lessonCount", { count: ready.totalLessons }),
                  })}
            </p>
            <TrackAction
              path={ready}
              signedIn={signedIn}
              variant={recommended ? "primary" : "secondary"}
              className="mt-5"
            />
          </div>
        ) : (
          <div className="mt-auto pt-6">
            <Button href="/library" variant="secondary" className="w-full sm:w-auto">
              {t("preparing.library")}
            </Button>
          </div>
        )}
      </div>
    </article>
  );
}
