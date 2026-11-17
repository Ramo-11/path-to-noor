"use client";

import { useLocale } from "next-intl";
import { useLearner } from "@/lib/use-learner";
import { useMeResource } from "@/components/me/use-me-resource";
import { MemberError } from "@/components/me/MemberError";
import { LibraryBrowser } from "./LibraryBrowser";
import type { LibraryMePayload, LibrarySubjectCard } from "./library-types";

function LibrarySkeleton() {
  return (
    <div aria-hidden="true">
      <div className="mb-8 h-12 max-w-md animate-pulse rounded-[var(--radius-control)] bg-primary-tint sm:mb-10" />
      <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-3">
        {Array.from({ length: 6 }, (_, index) => (
          <div key={index} className="aspect-[4/5] animate-pulse rounded-[var(--radius-panel)] bg-primary-tint" />
        ))}
      </div>
    </div>
  );
}

export function LibraryRegion({ subjects }: { subjects: LibrarySubjectCard[] }) {
  const locale = useLocale();
  const { status } = useLearner();
  const signedIn = status === "signedIn";
  const resource = useMeResource<LibraryMePayload>(signedIn ? `/api/me/library?locale=${locale}` : null);

  if (!signedIn) {
    return (
      <>
        <div data-guest-only>
          <LibraryBrowser subjects={subjects} signedIn={false} />
        </div>
        {status === "loading" ? (
          <div data-member-skeleton>
            <LibrarySkeleton />
          </div>
        ) : null}
      </>
    );
  }

  if (resource.status === "error") return <MemberError onRetry={resource.retry} />;
  if (resource.status !== "ready" || !resource.data) return <LibrarySkeleton />;
  if (!resource.data.signedIn) return <LibraryBrowser subjects={subjects} signedIn={false} />;

  return (
    <div className="settle">
      <LibraryBrowser subjects={resource.data.subjects} signedIn />
    </div>
  );
}
