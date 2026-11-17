"use client";

import { useLocale } from "next-intl";
import { useLearner } from "@/lib/use-learner";
import { PlacementFlow } from "./PlacementFlow";
import { buildRecommendations, type Recommendations } from "./recommendations";

function Shell({ children }: { children: React.ReactNode }) {
  return <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">{children}</div>;
}

export function StartRegion({ guestRecommendations }: { guestRecommendations: Recommendations | null }) {
  const { status, me } = useLearner();
  const locale = useLocale();

  if (status === "signedIn" && me) {
    return (
      <div className="settle">
        <Shell>
          <PlacementFlow
            recommendations={buildRecommendations(me.paths, locale)}
            savedStage={me.placement?.stage ?? null}
            isSignedIn
          />
        </Shell>
      </div>
    );
  }
  return (
    <>
      <div data-guest-only>
        <Shell>
          <PlacementFlow recommendations={guestRecommendations} savedStage={null} isSignedIn={false} />
        </Shell>
      </div>
      {status === "loading" ? (
        <div data-member-skeleton aria-hidden="true" className="min-h-[40rem]" />
      ) : null}
    </>
  );
}
