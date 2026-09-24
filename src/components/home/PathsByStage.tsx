import { ArrowRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/primer/Button";
import { StageMark } from "@/components/primer/StageMark";
import { Link } from "@/i18n/navigation";
import { STAGE_NUMBER, localized } from "@/lib/stages";
import type { PathOutline, StageGroup } from "@/lib/learning-types";
import { HomeSection } from "./HomeSection";

function PathRow({ path, locale }: { path: PathOutline; locale: string }) {
  const t = useTranslations("home.paths");
  const tLearning = useTranslations("learning");

  const meta =
    path.totalLessons > 0
      ? t("counts", {
          steps: tLearning("stepCount", { count: path.steps.length }),
          lessons: tLearning("lessonCount", { count: path.totalLessons }),
        })
      : t("preparing");

  const status = path.isComplete
    ? t("done")
    : path.isStarted
      ? t("progress", { percent: path.percent })
      : null;

  return (
    <li>
      <Link
        href={`/paths/${path.slug}`}
        className="group flex min-h-18 items-center gap-4 px-5 py-4 transition-colors duration-150 hover:bg-wash focus-visible:outline-offset-[-4px]! md:px-6"
      >
        <span className="min-w-0 flex-1">
          <span className="block font-medium text-ink text-pretty">{localized(path.title, locale)}</span>
          <span className="mt-0.5 block text-meta text-ink-3">{meta}</span>
        </span>
        {status ? <span className="shrink-0 text-meta font-medium text-ink-2 tabular">{status}</span> : null}
        <ArrowRight
          aria-hidden="true"
          strokeWidth={1.75}
          className="size-5 shrink-0 text-ink-3 transition-colors duration-150 group-hover:text-ink rtl:rotate-180"
        />
      </Link>
    </li>
  );
}

export function PathsByStage({ groups, locale }: { groups: StageGroup[]; locale: string }) {
  const t = useTranslations("home.paths");
  const tStages = useTranslations("stages");

  return (
    <HomeSection labelledBy="home-paths">
      <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div className="max-w-2xl">
          <h2 id="home-paths" className="text-title font-semibold text-balance">
            {t("title")}
          </h2>
          <p className="mt-4 text-lg text-ink-2 text-pretty">{t("lead")}</p>
        </div>
        <Button href="/paths" variant="quiet" className="self-start md:self-auto">
          {t("viewAll")}
          <ArrowRight aria-hidden="true" strokeWidth={1.75} className="size-4 rtl:rotate-180" />
        </Button>
      </div>
      <div className="primer-grid mt-10 sm:mt-12">
        {groups.map((group) => {
          const number = STAGE_NUMBER[group.stage];
          return (
            <div key={group.stage} className="grid md:grid-cols-[17rem_minmax(0,1fr)]">
              <div className="flex items-center gap-4 border-b border-rule px-5 py-4 md:items-start md:border-e md:border-b-0 md:px-6 md:py-6">
                <StageMark stage={group.stage} size="md" />
                <h3 className="leading-snug font-semibold md:pt-1.5">
                  <span className="sr-only">{tStages("label", { number })}: </span>
                  {tStages(`${group.stage}.name`)}
                </h3>
              </div>
              {group.paths.length > 0 ? (
                <ul className="divide-y divide-rule">
                  {group.paths.map((path) => (
                    <PathRow key={path.id} path={path} locale={locale} />
                  ))}
                </ul>
              ) : (
                <p className="flex min-h-18 items-center px-5 py-4 text-ink-3 md:px-6">
                  {tStages("preparing")}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </HomeSection>
  );
}
