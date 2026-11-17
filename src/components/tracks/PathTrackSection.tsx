import { getTranslations } from "next-intl/server";
import { Illustration } from "@/components/primer/Illustration";
import { PathCard } from "@/components/paths/PathCard";
import type { PathOutline } from "@/lib/learning-types";
import type { TrackKey } from "@/lib/tracks";

interface PathTrackSectionProps {
  track: TrackKey;
  locale: string;
  paths?: PathOutline[];
  action?: React.ReactNode;
  children?: React.ReactNode;
}

export function PathGrid({ paths, locale }: { paths: PathOutline[]; locale: string }) {
  return (
    <ul className={`grid gap-5 ${paths.length > 1 ? "sm:grid-cols-2 lg:grid-cols-3" : ""}`}>
      {paths.map((path) => (
        <li key={path.id} className="flex">
          <PathCard path={path} locale={locale} wide={paths.length === 1} showStage={false} />
        </li>
      ))}
    </ul>
  );
}

export async function PreparingRow({ title, body }: { title?: string; body?: string | null }) {
  const t = await getTranslations("tracks.preparing");
  const text = body === undefined ? t("body") : body;
  return (
    <div className="card flex flex-col items-center gap-4 p-5 text-center sm:flex-row sm:p-6 sm:text-start">
      <div className="size-16 shrink-0 overflow-hidden rounded-[var(--radius-cell)] sm:size-20">
        <Illustration name="lantern" sizes="80px" />
      </div>
      <div className="min-w-0">
        <p className="font-medium text-ink">{title ?? t("sectionTitle")}</p>
        {text ? <p className="mt-1 text-ink-2 text-pretty">{text}</p> : null}
      </div>
    </div>
  );
}

export async function PathTrackSection({ track, locale, paths, action, children }: PathTrackSectionProps) {
  const t = await getTranslations("tracks");
  const titleId = `track-${track}-title`;

  return (
    <section
      id={`track-${track}`}
      aria-labelledby={titleId}
      className="scroll-mt-24 border-t border-rule pt-10 first:border-t-0 sm:pt-14"
    >
      <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-4">
        <div className="min-w-0">
          <h2 id={titleId} className="text-title font-semibold text-balance">
            {t(`${track}.title`)}
          </h2>
          <p className="mt-2 max-w-[52ch] text-lg text-ink-2 text-pretty">{t(`${track}.line`)}</p>
        </div>
        {action}
      </div>
      <div className="mt-7 sm:mt-8">
        {children ??
          (paths && paths.length > 0 ? <PathGrid paths={paths} locale={locale} /> : <PreparingRow />)}
      </div>
    </section>
  );
}
