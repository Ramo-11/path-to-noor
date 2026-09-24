import { ArrowRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/primer/Button";
import { ProgressCells } from "@/components/primer/ProgressCells";
import { STAGE_STYLES } from "@/lib/stages";
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
    <div className="primer-grid">
      <article aria-labelledby="home-continue-title" className="relative">
        <span aria-hidden="true" className={`absolute inset-x-0 top-0 h-2 ${STAGE_STYLES[path.stage].fill}`} />
        <div className="flex gap-5 px-6 pt-10 pb-6 sm:gap-8 sm:px-8 sm:pt-12">
          <span
            aria-hidden="true"
            className="shrink-0 text-[3.5rem] leading-[0.85] font-semibold tracking-[-0.04em] tabular sm:text-[5rem]"
          >
            {next.stepNumber}
          </span>
          <div className="min-w-0">
            <h2 id="home-continue-title" className="text-heading font-semibold text-balance">
              {next.title}
            </h2>
            <p className="mt-2 text-ink-2 text-pretty">
              {t("position", {
                step: next.stepNumber,
                lesson: next.lessonNumber,
                path: path.title,
              })}
            </p>
          </div>
        </div>
        <div className="px-6 sm:px-8">
          <ProgressCells
            done={path.completedLessons}
            total={path.totalLessons}
            stage={path.stage}
            label={tLearning("lessonsDone", { done: path.completedLessons, total: path.totalLessons })}
          />
          <p className="mt-2.5 text-meta text-ink-3 tabular">
            {meta ?? tLearning("lessonsDone", { done: path.completedLessons, total: path.totalLessons })}
          </p>
          {note ? <p className="mt-5 max-w-[52ch] text-[0.9375rem] text-ink-2 text-pretty">{note}</p> : null}
        </div>
        <div className="flex flex-col items-stretch gap-3 px-6 pt-7 pb-7 sm:flex-row sm:items-center sm:gap-6 sm:px-8 sm:pb-8">
          <Button href={`/learn/${next.slug}`} size="lg" className="w-full sm:w-auto">
            {actionLabel}
            <ArrowRight aria-hidden="true" strokeWidth={1.75} className="size-5 shrink-0 rtl:rotate-180" />
          </Button>
          <Button href={path.pathHref} variant="quiet" className="self-center sm:self-auto">
            {t("seePath")}
          </Button>
        </div>
      </article>
    </div>
  );
}
