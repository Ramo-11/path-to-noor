"use client";

import { useLocale, useTranslations } from "next-intl";
import { LearnerRegion } from "@/components/home/LearnerRegion";
import { MUSLIM_PRIMARY_PATH_SLUG } from "@/lib/tracks";
import type { PathOutline } from "@/lib/learning-types";
import { TrackPathCard } from "./TrackPathCard";

export interface MuslimEntry {
  slug: string;
  path: PathOutline | null;
}

interface MuslimPathsProps {
  slugs: string[];
  guestEntries: MuslimEntry[];
}

export function MuslimPaths({ slugs, guestEntries }: MuslimPathsProps) {
  const locale = useLocale();
  const t = useTranslations("tracks");

  const list = (entries: MuslimEntry[], signedIn: boolean) => (
    <ul className="mt-8 grid gap-5 sm:mt-10 md:grid-cols-2 md:gap-6">
      {entries.map(({ slug, path }) => {
        const recommended = slug === MUSLIM_PRIMARY_PATH_SLUG;
        return (
          <li key={slug} className="flex">
            <TrackPathCard
              path={path}
              fallbackTitle={t(recommended ? "muslimPage.deeperTitle" : "muslimPage.walkTitle")}
              locale={locale}
              signedIn={signedIn}
              recommended={recommended}
              headingId={`muslim-path-${slug}`}
            />
          </li>
        );
      })}
    </ul>
  );

  return (
    <LearnerRegion
      skeletonClass="mt-8 min-h-[32rem] animate-pulse rounded-[var(--radius-panel)] bg-primary-tint sm:mt-10"
      member={(me) =>
        list(
          slugs.map((slug) => ({ slug, path: me.paths.find((p) => p.slug === slug) ?? null })),
          true
        )
      }
    >
      {list(guestEntries, false)}
    </LearnerRegion>
  );
}
