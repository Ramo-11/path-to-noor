"use client";

import { useLocale } from "next-intl";
import { useLearner } from "@/lib/use-learner";
import { toPathView } from "@/components/placement/recommendations";
import type { PathView, StartCandidates } from "@/components/placement/recommendations";
import type { MeSignedIn } from "@/lib/me-types";
import { NewStartHero, ReadyHero, TrackReadyHero, WelcomeHero } from "./Hero";
import { GuestHero } from "./GuestHero";
import { MentorBlock } from "./MentorBlock";

interface HomeViews {
  candidates: StartCandidates;
  views: { curious: PathView | null; muslim: PathView | null };
}

function firstNameOf(name: string | null): string | null {
  const first = name?.trim().split(/\s+/)[0];
  return first ? first : null;
}

function HeroSkeleton() {
  return (
    <section aria-hidden="true" className="glow-dawn">
      <div className="mx-auto grid min-h-[34rem] w-full max-w-6xl items-center gap-10 px-4 pt-8 pb-12 sm:px-6 sm:pt-14 sm:pb-16 lg:min-h-[30rem] lg:grid-cols-12 lg:gap-14 lg:px-8 lg:pt-16 lg:pb-20">
        <div className="flex flex-col gap-5 lg:col-span-6">
          <div className="h-12 w-4/5 animate-pulse rounded-2xl bg-primary-tint" />
          <div className="h-12 w-3/5 animate-pulse rounded-2xl bg-primary-tint" />
          <div className="mt-4 h-5 w-2/3 animate-pulse rounded-full bg-primary-tint" />
          <div className="h-12 w-44 animate-pulse rounded-full bg-primary-tint" />
        </div>
        <div className="aspect-[4/3] animate-pulse rounded-[var(--radius-panel)] bg-primary-tint lg:col-span-6" />
      </div>
    </section>
  );
}

function SignedInHero({ me, candidates, views }: HomeViews & { me: MeSignedIn }) {
  const locale = useLocale();
  const firstName = firstNameOf(me.user.name);
  const { track, placement, currentPath, recommendedPath } = me;

  if (currentPath && currentPath.isStarted && currentPath.nextLesson) {
    return (
      <WelcomeHero
        path={toPathView(currentPath, locale)}
        stage={placement?.stage ?? null}
        firstName={firstName}
        showChange={track !== null}
      />
    );
  }
  if (track === "new") {
    return placement && recommendedPath && recommendedPath.nextLesson && !recommendedPath.isComplete ? (
      <ReadyHero
        path={toPathView(recommendedPath, locale)}
        stage={placement.stage}
        isFallback={me.recommendedIsFallback}
        firstName={firstName}
      />
    ) : (
      <NewStartHero candidates={candidates} reflectStored={!placement} />
    );
  }
  if (track === "curious" || track === "muslim") {
    const path = recommendedPath ? toPathView(recommendedPath, locale) : views[track];
    return <TrackReadyHero track={track} path={path} firstName={firstName} />;
  }
  return <GuestHero candidates={candidates} views={views} firstName={firstName} />;
}

export function HomeHero(props: HomeViews) {
  const { status, me } = useLearner();

  if (status === "signedIn" && me) {
    return (
      <div className="settle">
        <SignedInHero me={me} {...props} />
      </div>
    );
  }
  return (
    <>
      <div data-guest-only>
        <GuestHero {...props} firstName={null} />
      </div>
      {status === "loading" ? (
        <div data-member-skeleton>
          <HeroSkeleton />
        </div>
      ) : null}
    </>
  );
}

export function HomeMentor() {
  const { status, me } = useLearner();
  if (me?.user.userType === "mentor") return null;
  const choice = me?.track === "muslim" ? "volunteer" : me?.track === "new" ? "request" : "contact";
  return <MentorBlock mentorChoice={status === "signedIn" ? choice : "contact"} />;
}
