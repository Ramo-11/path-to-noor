"use client";

import { useLocale, useTranslations } from "next-intl";
import { Button } from "@/components/primer/Button";
import { EmptyState } from "@/components/primer/EmptyState";
import { PageBanner } from "@/components/primer/PageBanner";
import { PlacementPrompt } from "@/components/paths/PlacementPrompt";
import { PathTrackSection } from "@/components/tracks/PathTrackSection";
import { StageGroupBlock } from "@/components/tracks/StageGroupBlock";
import { useLearner } from "@/lib/use-learner";
import { TRACKS } from "@/lib/tracks";
import type { StageKey } from "@/lib/stages";
import type { PathOutline, TrackGroups } from "@/lib/learning-types";
import { groupPaths } from "./group-paths";

interface PathsBodyProps {
  groups: TrackGroups;
  signedIn: boolean;
  learnerStage: StageKey | null;
}

function PathsBody({ groups, signedIn, learnerStage }: PathsBodyProps) {
  const locale = useLocale();
  const t = useTranslations("paths");
  const tTracks = useTranslations("tracks");
  const hasPaths =
    groups.curious.length > 0 ||
    groups.muslim.length > 0 ||
    groups.new.some((group) => group.paths.length > 0);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 pb-16 sm:px-6 sm:pb-24 lg:px-8">
      <PageBanner title={t("title")} lead={t("lead")} art="journey" tone="sky">
        {hasPaths ? (
          <nav aria-label={t("jumpTo")}>
            <ul className="flex flex-wrap gap-2.5">
              {TRACKS.map((track) => (
                <li key={track}>
                  <a
                    href={`#track-${track}`}
                    className="inline-flex min-h-11 items-center rounded-full border border-rule bg-surface px-4 text-[0.9375rem] font-medium text-ink shadow-soft transition-colors duration-150 hover:border-rule-strong hover:bg-wash"
                  >
                    {tTracks(`${track}.title`)}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        ) : null}
      </PageBanner>

      {hasPaths ? (
        <div className="mt-10 sm:mt-14">
          <PathTrackSection track="curious" locale={locale} paths={groups.curious} />
          <PathTrackSection
            track="new"
            locale={locale}
            action={<PlacementPrompt signedIn={signedIn} serverStage={learnerStage} />}
          >
            {groups.new.map((group) => (
              <StageGroupBlock
                key={group.stage}
                stage={group.stage}
                paths={group.paths}
                locale={locale}
                signedIn={signedIn}
                learnerStage={learnerStage}
              />
            ))}
          </PathTrackSection>
          <PathTrackSection track="muslim" locale={locale} paths={groups.muslim} />
        </div>
      ) : (
        <div className="mt-8">
          <EmptyState
            art="lantern"
            title={t("emptyTitle")}
            body={t("emptyBody")}
            action={
              <Button href="/library" variant="secondary">
                {t("openLibrary")}
              </Button>
            }
          />
        </div>
      )}
    </div>
  );
}

export function PathsList({ guestGroups }: { guestGroups: TrackGroups }) {
  const { status, me } = useLearner();

  if (status === "signedIn" && me) {
    const paths: PathOutline[] = me.paths;
    return (
      <div className="settle">
        <PathsBody groups={groupPaths(paths)} signedIn learnerStage={me.placement?.stage ?? null} />
      </div>
    );
  }
  return (
    <>
      <div data-guest-only>
        <PathsBody groups={guestGroups} signedIn={false} learnerStage={null} />
      </div>
      {status === "loading" ? (
        <div data-member-skeleton aria-hidden="true" className="min-h-[70rem]" />
      ) : null}
    </>
  );
}
