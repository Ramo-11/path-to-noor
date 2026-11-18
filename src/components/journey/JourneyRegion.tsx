"use client";

import { useLocale, useTranslations } from "next-intl";
import { Button } from "@/components/primer/Button";
import { Notice } from "@/components/primer/Notice";
import { PageBanner, type BannerTone } from "@/components/primer/PageBanner";
import { useMemberResource } from "@/components/lesson/use-member-resource";
import { refreshLearner, useLearner } from "@/lib/use-learner";
import type { MeSignedIn } from "@/lib/me-types";
import type { LearnerState } from "@/lib/learning-types";
import type { StageKey } from "@/lib/stages";
import { ContinueBlock } from "./ContinueBlock";
import { PathRows } from "./PathRows";
import { QuickLinksRow } from "./QuickLinksRow";
import { RecentRows } from "./RecentRows";
import { StageBlock } from "./StageBlock";
import type { JourneyPayload } from "./journey-types";

const BANNER_TONE: Record<StageKey, BannerTone> = {
  beginning: "dawn",
  foundations: "day",
  deeper: "evening",
};

function toState(me: MeSignedIn): LearnerState {
  return {
    track: me.track,
    placement: me.placement,
    completedLessonIds: me.completedLessonIds,
    currentPath: me.currentPath,
    recommendedPath: me.recommendedPath,
    recommendedIsFallback: me.recommendedIsFallback,
    startedPaths: me.paths.filter((path) => path.isStarted),
    paths: me.paths,
  };
}

function ExtrasSkeleton() {
  return (
    <div aria-hidden="true">
      <div className="mt-10 sm:mt-14">
        <div className="mb-5 h-7 w-40 animate-pulse rounded-full bg-primary-tint" />
        <div className="h-60 animate-pulse rounded-[var(--radius-panel)] bg-primary-tint" />
      </div>
      <div className="mt-10 grid gap-4 sm:mt-14 sm:grid-cols-3">
        <div className="h-24 animate-pulse rounded-[var(--radius-panel)] bg-primary-tint" />
        <div className="h-24 animate-pulse rounded-[var(--radius-panel)] bg-primary-tint" />
        <div className="h-24 animate-pulse rounded-[var(--radius-panel)] bg-primary-tint" />
      </div>
    </div>
  );
}

function JourneyError({ onRetry }: { onRetry: () => void }) {
  const t = useTranslations("common");
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
      <Notice tone="error">
        <p>{t("error")}</p>
      </Notice>
      <div className="mt-4">
        <Button variant="quiet" onClick={onRetry}>
          {t("tryAgain")}
        </Button>
      </div>
    </div>
  );
}

function JourneyMember({ me }: { me: MeSignedIn }) {
  const locale = useLocale();
  const t = useTranslations("journey");
  const tStages = useTranslations("stages");
  const tLearning = useTranslations("learning");
  const tTracks = useTranslations("tracks");
  const extras = useMemberResource<JourneyPayload>("/api/me/journey");
  const state = toState(me);

  if (extras.kind === "error") return <JourneyError onRetry={extras.retry} />;

  const trimmedName = (me.user.name ?? "").trim();
  const firstName = trimmedName ? trimmedName.split(/\s+/)[0] : trimmedName;
  const bannerStage = state.currentPath?.stage ?? state.placement?.stage ?? null;
  const bannerTone: BannerTone = bannerStage ? BANNER_TONE[bannerStage] : "sky";
  const ready = extras.kind === "ready" && extras.data.access === "open" ? extras.data : null;

  return (
    <div className="mx-auto w-full max-w-6xl px-4 pb-16 sm:px-6 sm:pb-24 lg:px-8">
      <PageBanner title={t("greeting", { name: firstName })} art="journey" tone={bannerTone} />

      <div className="mt-8 grid gap-5 sm:mt-10 lg:grid-cols-2 lg:gap-6">
        <StageBlock placement={state.placement} track={state.track} t={t} tStages={tStages} tTracks={tTracks} />
        <ContinueBlock state={state} locale={locale} t={t} tLearning={tLearning} tStages={tStages} />
      </div>

      {state.startedPaths.length > 0 ? (
        <section className="mt-10 sm:mt-14">
          <h2 className="mb-5 text-heading font-semibold">{t("yourPaths")}</h2>
          <PathRows paths={state.startedPaths} locale={locale} />
        </section>
      ) : null}

      {ready ? (
        <div className="settle">
          <section className="mt-10 sm:mt-14">
            <h2 className="mb-5 text-heading font-semibold">{t("recentlyDone")}</h2>
            <RecentRows items={ready.recentItems} locale={locale} t={t} />
          </section>

          <section className="mt-10 sm:mt-14">
            <QuickLinksRow
              savedCount={ready.savedCount}
              quizCount={ready.quizCount}
              mentorStatus={ready.mentorStatus}
              volunteer={state.track === "muslim"}
              t={t}
            />
          </section>
        </div>
      ) : (
        <ExtrasSkeleton />
      )}

      <div className="mt-10 sm:mt-14">
        <Button href="/settings" variant="quiet">
          {t("settingsLink")}
        </Button>
      </div>
    </div>
  );
}

function PageSkeleton() {
  return (
    <div aria-hidden="true" className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
      <div className="h-44 animate-pulse rounded-[var(--radius-panel)] bg-primary-tint sm:h-56" />
      <div className="mt-8 grid gap-5 sm:mt-10 lg:grid-cols-2 lg:gap-6">
        <div className="h-96 animate-pulse rounded-[var(--radius-panel)] bg-primary-tint" />
        <div className="h-96 animate-pulse rounded-[var(--radius-panel)] bg-primary-tint" />
      </div>
    </div>
  );
}

export function JourneyRegion({ children }: { children: React.ReactNode }) {
  const { status, me } = useLearner();

  if (status === "signedIn" && me) {
    return (
      <div className="settle">
        <JourneyMember me={me} />
      </div>
    );
  }
  if (status === "error") return <JourneyError onRetry={() => void refreshLearner()} />;

  return (
    <>
      <div data-guest-only>{children}</div>
      {status === "loading" ? (
        <div data-member-skeleton>
          <PageSkeleton />
        </div>
      ) : null}
    </>
  );
}
