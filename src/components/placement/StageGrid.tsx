import { ArrowRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { STAGES, STAGE_NUMBER, STAGE_STYLES } from "@/lib/stages";

export function StageGrid({ label }: { label: string }) {
  const t = useTranslations("stages");

  return (
    <nav aria-label={label}>
      <ol className="primer-grid grid-cols-1 sm:grid-cols-3">
        {STAGES.map((stage) => {
          const number = STAGE_NUMBER[stage];
          return (
            <li key={stage} className="flex">
              <Link
                href={`/paths#stage-${stage}`}
                className="group relative flex w-full items-start gap-5 py-5 ps-7 pe-5 transition-colors duration-150 hover:bg-wash focus-visible:outline-offset-[-4px]! sm:min-h-[17rem] sm:flex-col sm:gap-8 sm:px-6 sm:pt-10 sm:pb-7 lg:min-h-[19rem]"
              >
                <span
                  aria-hidden="true"
                  className={`absolute inset-y-0 start-0 w-2 sm:inset-x-0 sm:top-0 sm:bottom-auto sm:h-2 sm:w-auto ${STAGE_STYLES[stage].fill}`}
                />
                <span
                  aria-hidden="true"
                  className="w-10 shrink-0 text-[3.25rem] leading-[0.85] font-semibold tracking-[-0.04em] tabular sm:w-auto sm:text-[4.5rem] lg:text-[5.25rem]"
                >
                  {number}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-lg leading-snug font-semibold text-balance sm:text-xl">
                    <span className="sr-only">{t("label", { number })}: </span>
                    {t(`${stage}.name`)}
                  </span>
                  <span className="mt-1.5 block text-[0.9375rem] leading-relaxed text-ink-2 text-pretty">
                    {t(`${stage}.short`)}
                  </span>
                </span>
                <ArrowRight
                  aria-hidden="true"
                  strokeWidth={1.75}
                  className="mt-1 size-5 shrink-0 text-ink-3 transition-colors duration-150 group-hover:text-ink rtl:rotate-180 sm:absolute sm:end-5 sm:top-9 sm:mt-0"
                />
              </Link>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
