"use client";

import { useLearner } from "@/lib/use-learner";
import type { MeSignedIn } from "@/lib/me-types";

interface LearnerRegionProps {
  children: React.ReactNode;
  member: (me: MeSignedIn) => React.ReactNode;
  skeletonClass?: string;
}

export function LearnerRegion({ children, member, skeletonClass }: LearnerRegionProps) {
  const { status, me } = useLearner();

  if (status === "signedIn" && me) return <div className="settle">{member(me)}</div>;

  return (
    <>
      <div data-guest-only>{children}</div>
      {status === "loading" && skeletonClass ? (
        <div data-member-skeleton aria-hidden="true" className={skeletonClass} />
      ) : null}
    </>
  );
}
