"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/components/primer/Button";
import { EmptyState } from "@/components/primer/EmptyState";
import { refreshLearner, useLearner } from "@/lib/use-learner";
import type { PathOutline } from "@/lib/learning-types";
import { PathJourney } from "./PathJourney";

function NotFoundView() {
  const t = useTranslations("paths");
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
      <EmptyState
        art="lantern"
        title={t("notFoundTitle")}
        body={t("notFoundBody")}
        action={<Button href="/paths">{t("browseAll")}</Button>}
      />
    </div>
  );
}

function ErrorView() {
  const t = useTranslations("system");
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
      <EmptyState
        art="lantern"
        title={t("errorTitle")}
        action={
          <Button variant="secondary" onClick={() => void refreshLearner()}>
            {t("tryAgain")}
          </Button>
        }
      />
    </div>
  );
}

function Skeleton() {
  return <div data-member-skeleton aria-hidden="true" className="min-h-[60rem]" />;
}

interface PathJourneyRegionProps {
  slug: string;
  guestPath: PathOutline | null;
}

export function PathJourneyRegion({ slug, guestPath }: PathJourneyRegionProps) {
  const { status, me } = useLearner();

  if (status === "signedIn" && me) {
    const path = me.paths.find((p) => p.slug === slug) ?? null;
    return (
      <div className="settle">
        {path ? <PathJourney path={path} signedIn /> : <NotFoundView />}
      </div>
    );
  }

  if (guestPath) {
    return (
      <>
        <div data-guest-only>
          <PathJourney path={guestPath} signedIn={false} />
        </div>
        {status === "loading" ? <Skeleton /> : null}
      </>
    );
  }

  if (status === "loading") return <div className="min-h-[60rem]" aria-hidden="true" />;
  if (status === "error") return <ErrorView />;
  return <NotFoundView />;
}
