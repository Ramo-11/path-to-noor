"use client";

import { useLocale } from "next-intl";
import { Button } from "@/components/primer/Button";
import { LearnerRegion } from "@/components/home/LearnerRegion";
import { useLearner } from "@/lib/use-learner";
import { CURIOUS_PATH_SLUG } from "@/lib/tracks";
import type { PathOutline } from "@/lib/learning-types";
import { ChangeTrack } from "./ChangeTrack";
import { TrackAction } from "./TrackAction";
import { TrackPathOutline } from "./TrackPathOutline";
import { TrackPreparing } from "./TrackPreparing";
import { readyPath } from "./track-paths";

interface CuriousProps {
  guestPath: PathOutline | null;
}

export function CuriousActions({ guestPath, askLabel }: CuriousProps & { askLabel: string }) {
  const { status, me } = useLearner();
  const signedIn = status === "signedIn" && me !== null;
  const path = signedIn ? readyPath(me.paths, CURIOUS_PATH_SLUG) : guestPath;
  const spaced = status === "loading" || path !== null;

  return (
    <>
      {signedIn ? (
        <div className="settle">{path ? <TrackAction path={path} signedIn /> : null}</div>
      ) : (
        <>
          <div data-guest-only>{guestPath ? <TrackAction path={guestPath} signedIn={false} /> : null}</div>
          {status === "loading" ? (
            <div data-member-skeleton aria-hidden="true" className="h-12 w-full animate-pulse rounded-full bg-primary-tint sm:w-44" />
          ) : null}
        </>
      )}
      <div className={`flex flex-col items-start gap-1 ${spaced ? "mt-5" : ""}`}>
        <Button href="/contact?topic=question" variant="quiet">
          {askLabel}
        </Button>
        <ChangeTrack variant="notYou" />
      </div>
    </>
  );
}

export function CuriousOutline({ guestPath }: CuriousProps) {
  const locale = useLocale();
  const view = (path: PathOutline | null, signedIn: boolean) =>
    path ? (
      <TrackPathOutline path={path} locale={locale} signedIn={signedIn} />
    ) : (
      <div className="mx-auto mt-10 max-w-xl sm:mt-14">
        <TrackPreparing compact />
      </div>
    );

  return (
    <LearnerRegion
      skeletonClass="mt-10 min-h-[40rem] animate-pulse rounded-[var(--radius-panel)] bg-primary-tint sm:mt-14"
      member={(me) => view(readyPath(me.paths, CURIOUS_PATH_SLUG), true)}
    >
      {view(guestPath, false)}
    </LearnerRegion>
  );
}
