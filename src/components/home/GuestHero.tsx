"use client";

import type { PathView, StartCandidates } from "@/components/placement/recommendations";
import { useStoredTrack } from "@/components/tracks/storage";
import { ChooserHero, NewStartHero, TrackReadyHero } from "./Hero";

interface GuestHeroProps {
  candidates: StartCandidates;
  views: { curious: PathView | null; muslim: PathView | null };
  firstName: string | null;
}

export function GuestHero({ candidates, views, firstName }: GuestHeroProps) {
  const track = useStoredTrack();

  if (track === "new") {
    return (
      <div className="settle">
        <NewStartHero candidates={candidates} reflectStored />
      </div>
    );
  }
  if (track === "curious" || track === "muslim") {
    return (
      <div className="settle">
        <TrackReadyHero track={track} path={views[track]} firstName={firstName} />
      </div>
    );
  }
  return <ChooserHero />;
}
