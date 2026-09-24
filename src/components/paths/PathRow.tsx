import { ArrowRight, Check } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { ProgressCells } from "@/components/primer/ProgressCells";
import type { PathOutline } from "@/lib/learning-types";
import { STAGE_STYLES, localized } from "@/lib/stages";
import { MetaList } from "./MetaList";
import { pathDuration } from "./duration";

interface PathRowProps {
  path: PathOutline;
  locale: string;
  signedIn: boolean;
}

export async function PathRow({ path, locale, signedIn }: PathRowProps) {
  const t = await getTranslations("paths");
  const tl = await getTranslations("learning");
  const title = localized(path.title, locale);
  const description = localized(path.description, locale);
  const duration = pathDuration(path);
  const showProgress = signedIn && path.totalLessons > 0;
  const progressText = path.isComplete
    ? tl("complete")
    : tl("lessonsDone", { done: path.completedLessons, total: path.totalLessons });

  return (
    <Link
      href={`/paths/${path.slug}`}
      className="group flex items-start gap-6 px-5 py-6 transition-colors duration-150 hover:bg-wash focus-visible:-outline-offset-4! sm:px-7 sm:py-7"
    >
      <div className="min-w-0 flex-1">
        <h3 className="text-heading font-semibold text-balance">{title}</h3>
        {description ? (
          <p className="mt-2 line-clamp-2 max-w-[60ch] text-ink-2">{description}</p>
        ) : null}
        <MetaList
          className="mt-4"
          items={[
            tl("stepCount", { count: path.steps.length }),
            path.totalLessons > 0
              ? tl("lessonCount", { count: path.totalLessons })
              : t("lessonsPreparing"),
            duration ? tl(duration.key, { count: duration.count }) : null,
          ]}
        />
        {showProgress ? (
          <div className="mt-5 flex max-w-md flex-col gap-2">
            <div aria-hidden="true">
              <ProgressCells
                done={path.completedLessons}
                total={path.totalLessons}
                stage={path.stage}
                label={progressText}
              />
            </div>
            <p className="flex items-center gap-1.5 text-meta font-medium text-ink">
              {path.isComplete ? (
                <Check
                  aria-hidden="true"
                  strokeWidth={2.5}
                  className={`size-4 ${STAGE_STYLES[path.stage].text}`}
                />
              ) : null}
              {progressText}
            </p>
          </div>
        ) : null}
      </div>
      <ArrowRight
        aria-hidden="true"
        className="mt-1.5 size-5 shrink-0 text-ink-3 transition-colors duration-150 group-hover:text-ink rtl:rotate-180"
      />
    </Link>
  );
}
