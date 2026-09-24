import { getTranslations } from "next-intl/server";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { STAGE_STYLES, type StageKey } from "@/lib/stages";
import type { NavLesson } from "./lesson-context";

interface LessonPagerProps {
  previous: NavLesson | null;
  next: NavLesson | null;
  stage: StageKey | null;
  className?: string;
}

const HOVER_TINT: Record<StageKey, string> = {
  beginning: "hover:bg-stage1-tint",
  foundations: "hover:bg-stage2-tint",
  deeper: "hover:bg-stage3-tint",
};

export async function LessonPager({ previous, next, stage, className = "" }: LessonPagerProps) {
  if (!previous && !next) return null;
  const t = await getTranslations("lesson");
  const hoverTint = stage ? HOVER_TINT[stage] : "hover:bg-wash";
  const arrowColor = stage ? STAGE_STYLES[stage].text : "text-ink-3";

  return (
    <nav aria-label={t("pagerLabel")} className={`grid gap-3 sm:grid-cols-2 ${className}`}>
      {previous ? (
        <Link
          href={`/learn/${previous.slug}`}
          className={`card flex min-h-20 flex-col justify-center gap-1 px-5 py-4 transition-[background-color,border-color,box-shadow,transform] duration-200 hover:-translate-y-0.5 hover:border-rule-strong hover:shadow-lift sm:px-6 ${hoverTint}`}
        >
          <span className={`inline-flex items-center gap-1.5 text-meta font-medium ${arrowColor}`}>
            <ArrowLeft aria-hidden="true" strokeWidth={2} className="size-4 rtl:rotate-180" />
            {t("previous")}
          </span>
          <span className="line-clamp-2 font-medium text-ink">{previous.title}</span>
        </Link>
      ) : (
        <div aria-hidden="true" />
      )}
      {next ? (
        <Link
          href={`/learn/${next.slug}`}
          className={`card flex min-h-20 flex-col items-end justify-center gap-1 px-5 py-4 text-end transition-[background-color,border-color,box-shadow,transform] duration-200 hover:-translate-y-0.5 hover:border-rule-strong hover:shadow-lift sm:px-6 ${hoverTint}`}
        >
          <span className={`inline-flex items-center gap-1.5 text-meta font-medium ${arrowColor}`}>
            {t("next")}
            <ArrowRight aria-hidden="true" strokeWidth={2} className="size-4 rtl:rotate-180" />
          </span>
          <span className="line-clamp-2 font-medium text-ink">{next.title}</span>
        </Link>
      ) : (
        <div aria-hidden="true" />
      )}
    </nav>
  );
}
