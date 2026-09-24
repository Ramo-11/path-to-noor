import { Link } from "@/i18n/navigation";
import { StageMark } from "@/components/primer/StageMark";
import { ProgressCells } from "@/components/primer/ProgressCells";
import { localized } from "@/lib/stages";
import type { PathOutline } from "@/lib/learning-types";
import type { Translate } from "./types";

interface PathRowsProps {
  paths: PathOutline[];
  locale: string;
  tLearning: Translate;
}

export function PathRows({ paths, locale, tLearning }: PathRowsProps) {
  return (
    <div className="primer-grid grid-cols-1">
      {paths.map((path) => {
        const progressLabel = tLearning("lessonsDone", {
          done: path.completedLessons,
          total: path.totalLessons,
        });
        return (
          <Link
            key={path.id}
            href={`/paths/${path.slug}`}
            className="flex items-center gap-4 px-5 py-4 transition-colors duration-150 hover:bg-wash sm:px-6"
          >
            <StageMark stage={path.stage} size="md" />
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium text-ink">{localized(path.title, locale)}</p>
              <div className="mt-2 max-w-3xs">
                <ProgressCells
                  done={path.completedLessons}
                  total={path.totalLessons}
                  stage={path.stage}
                  label={progressLabel}
                />
              </div>
            </div>
            <span className="shrink-0 text-meta text-ink-3">
              {path.isComplete ? tLearning("complete") : progressLabel}
            </span>
          </Link>
        );
      })}
    </div>
  );
}
