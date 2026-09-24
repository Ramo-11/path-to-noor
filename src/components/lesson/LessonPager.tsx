import { getTranslations } from "next-intl/server";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Link } from "@/i18n/navigation";
import type { NavLesson } from "./lesson-context";

interface LessonPagerProps {
  previous: NavLesson | null;
  next: NavLesson | null;
  className?: string;
}

export async function LessonPager({ previous, next, className = "" }: LessonPagerProps) {
  if (!previous && !next) return null;
  const t = await getTranslations("lesson");

  return (
    <nav aria-label={t("pagerLabel")} className={`primer-grid grid-cols-2 ${className}`}>
      {previous ? (
        <div>
          <Link
            href={`/learn/${previous.slug}`}
            className="flex h-full min-h-20 flex-col justify-center gap-1 px-4 py-4 transition-colors duration-150 hover:bg-wash sm:px-6"
          >
            <span className="inline-flex items-center gap-1.5 text-meta text-ink-3">
              <ArrowLeft aria-hidden="true" strokeWidth={2} className="size-4 rtl:rotate-180" />
              {t("previous")}
            </span>
            <span className="line-clamp-2 font-medium text-ink">{previous.title}</span>
          </Link>
        </div>
      ) : (
        <div aria-hidden="true" />
      )}
      {next ? (
        <div>
          <Link
            href={`/learn/${next.slug}`}
            className="flex h-full min-h-20 flex-col items-end justify-center gap-1 px-4 py-4 text-end transition-colors duration-150 hover:bg-wash sm:px-6"
          >
            <span className="inline-flex items-center gap-1.5 text-meta text-ink-3">
              {t("next")}
              <ArrowRight aria-hidden="true" strokeWidth={2} className="size-4 rtl:rotate-180" />
            </span>
            <span className="line-clamp-2 font-medium text-ink">{next.title}</span>
          </Link>
        </div>
      ) : (
        <div aria-hidden="true" />
      )}
    </nav>
  );
}
