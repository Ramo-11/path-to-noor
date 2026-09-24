import { ArrowRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { Illustration } from "@/components/primer/Illustration";
import { ProgressCells } from "@/components/primer/ProgressCells";
import { StageChip } from "@/components/primer/StageChip";
import { Link } from "@/i18n/navigation";
import { pathArt } from "@/lib/illustrations";
import { localized } from "@/lib/stages";
import type { PathOutline } from "@/lib/learning-types";

interface PathCardProps {
  path: PathOutline;
  locale: string;
  wide?: boolean;
  showStage?: boolean;
}

export function PathCard({ path, locale, wide = false, showStage = true }: PathCardProps) {
  const t = useTranslations("paths");
  const tl = useTranslations("learning");

  const meta =
    path.totalLessons > 0
      ? t("cardMeta", {
          steps: tl("stepCount", { count: path.steps.length }),
          lessons: tl("lessonCount", { count: path.totalLessons }),
        })
      : t("lessonsPreparing");

  const statusText = path.isComplete
    ? tl("complete")
    : path.isStarted
      ? tl("percentDone", { percent: path.percent })
      : meta;

  return (
    <Link
      href={`/paths/${path.slug}`}
      className={`card card-link group flex h-full flex-col overflow-hidden ${wide ? "md:flex-row" : ""}`}
    >
      <div className={`relative aspect-[16/9] overflow-hidden ${wide ? "md:aspect-auto md:w-[46%] md:shrink-0" : ""}`}>
        {showStage ? <StageChip stage={path.stage} className="absolute start-3 top-3 shadow-soft z-10" /> : null}
        <Illustration
          name={pathArt(path.slug, path.stage)}
          sizes={wide ? "(min-width: 768px) 46vw, 100vw" : "(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"}
          className="transition-transform duration-500 ease-[var(--ease-fill)] group-hover:scale-[1.03]"
        />
      </div>
      <div className={`flex flex-1 flex-col p-5 sm:p-6 ${wide ? "md:p-8" : ""}`}>
        <h3 className={`leading-snug font-semibold text-balance ${wide ? "text-xl md:text-heading" : "text-xl"}`}>
          {localized(path.title, locale)}
        </h3>
        {wide && path.description ? (
          <p className="mt-2 line-clamp-2 max-w-[48ch] text-ink-2 text-pretty md:line-clamp-3">{localized(path.description, locale)}</p>
        ) : null}
        <div className="mt-auto pt-5">
          {path.isStarted && !path.isComplete ? (
            <ProgressCells
              done={path.completedLessons}
              total={path.totalLessons}
              stage={path.stage}
              label={tl("lessonsDone", { done: path.completedLessons, total: path.totalLessons })}
              className="mb-3"
            />
          ) : null}
          <p className="flex items-center justify-between gap-3 text-meta text-ink-3 tabular">
            <span>{statusText}</span>
            <ArrowRight
              aria-hidden="true"
              strokeWidth={2}
              className="size-4 shrink-0 text-primary transition-transform duration-200 group-hover:translate-x-0.5 rtl:rotate-180 rtl:group-hover:-translate-x-0.5"
            />
          </p>
        </div>
      </div>
    </Link>
  );
}
