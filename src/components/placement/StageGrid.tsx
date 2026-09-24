import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Illustration } from "@/components/primer/Illustration";
import { StageMark } from "@/components/primer/StageMark";
import { STAGE_ART } from "@/lib/illustrations";
import { STAGES, STAGE_NUMBER } from "@/lib/stages";

export function StageGrid({ label }: { label: string }) {
  const t = useTranslations("stages");

  return (
    <nav aria-label={label}>
      <ol className="grid gap-4 sm:grid-cols-3 sm:gap-5">
        {STAGES.map((stage) => {
          const number = STAGE_NUMBER[stage];
          return (
            <li key={stage} className="flex">
              <Link
                href={`/paths#stage-${stage}`}
                className="card card-link group flex w-full items-center overflow-hidden sm:flex-col sm:items-stretch"
              >
                <div className="m-2 size-24 shrink-0 overflow-hidden rounded-[calc(var(--radius-cell)-0.375rem)] sm:m-0 sm:aspect-[16/10] sm:size-auto sm:rounded-none">
                  <Illustration
                    name={STAGE_ART[stage]}
                    sizes="(min-width: 640px) 33vw, 100vw"
                    className="transition-transform duration-500 ease-[var(--ease-fill)] group-hover:scale-[1.03]"
                  />
                </div>
                <div className="flex flex-1 items-start gap-3.5 py-3 pe-4 ps-2 sm:p-5">
                  <span className="hidden sm:block">
                    <StageMark stage={stage} size="md" />
                  </span>
                  <span className="min-w-0">
                    <span className="flex items-center gap-2 text-lg leading-snug font-semibold text-balance">
                      <span className="sm:hidden">
                        <StageMark stage={stage} size="sm" />
                      </span>
                      <span className="sr-only">{t("label", { number })}: </span>
                      {t(`${stage}.name`)}
                    </span>
                    <span className="mt-1 block text-[0.9375rem] leading-relaxed text-ink-2 text-pretty">
                      {t(`${stage}.short`)}
                    </span>
                  </span>
                </div>
              </Link>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
