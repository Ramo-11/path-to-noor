import { ArrowRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/primer/Button";
import { Illustration } from "@/components/primer/Illustration";
import { PathProgress } from "@/components/paths/PathProgress";
import { StageChip } from "@/components/primer/StageChip";
import { pathArtFor } from "@/lib/path-tone";
import type { PathView } from "@/components/placement/recommendations";

interface ContinueCardProps {
  path: PathView;
  actionLabel: string;
  meta?: string;
  note?: string;
}

export function ContinueCard({ path, actionLabel, meta, note }: ContinueCardProps) {
  const t = useTranslations("home.welcome");
  const tLearning = useTranslations("learning");
  const next = path.next;
  if (!next) return null;

  return (
    <article aria-labelledby="home-continue-title" className="card overflow-hidden shadow-lift">
      <div className="relative aspect-[16/8] overflow-hidden">
        {path.stage ? (
          <StageChip stage={path.stage} className="absolute start-3 top-3 shadow-soft z-10" />
        ) : null}
        <Illustration name={pathArtFor(path.slug, path.stage)} sizes="(min-width: 1024px) 540px, 100vw" priority />
      </div>
      <div className="p-6 sm:p-8">
        <h2 id="home-continue-title" className="text-heading font-semibold text-balance">
          {next.title}
        </h2>
        <p className="mt-1.5 text-ink-2 text-pretty">
          {t("position", {
            step: next.stepNumber,
            lesson: next.lessonNumber,
            path: path.title,
          })}
        </p>
        <PathProgress
          done={path.completedLessons}
          total={path.totalLessons}
          stage={path.stage}
          label={tLearning("lessonsDone", { done: path.completedLessons, total: path.totalLessons })}
          className="mt-6"
        />
        <p className="mt-2.5 text-meta text-ink-3 tabular">
          {meta ?? tLearning("lessonsDone", { done: path.completedLessons, total: path.totalLessons })}
        </p>
        {note ? <p className="mt-4 max-w-[52ch] text-[0.9375rem] text-ink-2 text-pretty">{note}</p> : null}
        <div className="mt-7 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:gap-6">
          <Button href={`/learn/${next.slug}`} size="lg" className="w-full sm:w-auto">
            {actionLabel}
            <ArrowRight aria-hidden="true" strokeWidth={2} className="size-5 shrink-0 rtl:rotate-180" />
          </Button>
          <Button href={path.pathHref} variant="quiet" className="self-center sm:self-auto">
            {t("seePath")}
          </Button>
        </div>
      </div>
    </article>
  );
}
