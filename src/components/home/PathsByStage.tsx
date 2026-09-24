import { ArrowRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/primer/Button";
import { Illustration } from "@/components/primer/Illustration";
import { ProgressCells } from "@/components/primer/ProgressCells";
import { StageChip } from "@/components/primer/StageChip";
import { Link } from "@/i18n/navigation";
import { pathArt } from "@/lib/illustrations";
import { localized } from "@/lib/stages";
import type { PathOutline, StageGroup } from "@/lib/learning-types";
import { HomeSection } from "./HomeSection";

function PathCard({ path, locale }: { path: PathOutline; locale: string }) {
  const t = useTranslations("home.paths");
  const tLearning = useTranslations("learning");

  const meta =
    path.totalLessons > 0
      ? t("counts", {
          steps: tLearning("stepCount", { count: path.steps.length }),
          lessons: tLearning("lessonCount", { count: path.totalLessons }),
        })
      : t("preparing");

  return (
    <li className="flex">
      <Link href={`/paths/${path.slug}`} className="card card-link group flex w-full flex-col overflow-hidden">
        <div className="relative aspect-[16/9] overflow-hidden">
          <StageChip stage={path.stage} className="absolute start-3 top-3 shadow-soft z-10" />
          <Illustration
            name={pathArt(path.slug, path.stage)}
            sizes="(min-width: 768px) 33vw, 100vw"
            className="transition-transform duration-500 ease-[var(--ease-fill)] group-hover:scale-[1.03]"
          />
        </div>
        <div className="flex flex-1 flex-col p-5 sm:p-6">
          <h3 className="text-xl leading-snug font-semibold text-balance">{localized(path.title, locale)}</h3>
          <div className="mt-auto pt-5">
            {path.isStarted && !path.isComplete ? (
              <ProgressCells
                done={path.completedLessons}
                total={path.totalLessons}
                stage={path.stage}
                label={tLearning("lessonsDone", { done: path.completedLessons, total: path.totalLessons })}
                className="mb-3"
              />
            ) : null}
            <p className="flex items-center justify-between gap-3 text-meta text-ink-3 tabular">
              <span>
                {path.isComplete
                  ? t("done")
                  : path.isStarted
                    ? t("progress", { percent: path.percent })
                    : meta}
              </span>
              <ArrowRight
                aria-hidden="true"
                strokeWidth={2}
                className="size-4 shrink-0 text-primary transition-transform duration-200 group-hover:translate-x-0.5 rtl:rotate-180 rtl:group-hover:-translate-x-0.5"
              />
            </p>
          </div>
        </div>
      </Link>
    </li>
  );
}

export function PathsByStage({ groups, locale }: { groups: StageGroup[]; locale: string }) {
  const t = useTranslations("home.paths");
  const paths = groups.flatMap((group) => group.paths);
  if (paths.length === 0) return null;

  return (
    <HomeSection labelledBy="home-paths" tone="canvas">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h2 id="home-paths" className="text-title font-semibold text-balance">
          {t("title")}
        </h2>
        <Button href="/paths" variant="quiet">
          {t("viewAll")}
          <ArrowRight aria-hidden="true" strokeWidth={2} className="size-4 rtl:rotate-180" />
        </Button>
      </div>
      <ul className="mt-8 grid gap-5 sm:mt-10 md:grid-cols-3">
        {paths.map((path) => (
          <PathCard key={path.id} path={path} locale={locale} />
        ))}
      </ul>
    </HomeSection>
  );
}
