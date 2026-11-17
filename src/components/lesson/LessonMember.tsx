"use client";

import { createContext, useContext } from "react";
import { notFound } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { Button } from "@/components/primer/Button";
import { EmptyState } from "@/components/primer/EmptyState";
import { Notice } from "@/components/primer/Notice";
import { LessonContextBar } from "./LessonContextBar";
import { LessonFinish } from "./LessonFinish";
import type { LessonPlace } from "./lesson-context";
import type { LessonMemberPayload, MemberPayload } from "./member-types";
import { useMemberResource, type MemberResource } from "./use-member-resource";

export type LessonMemberData = Extract<MemberPayload<LessonMemberPayload>, { access: "open" }>;

export const EMPTY_PLACE: LessonPlace = {
  path: null,
  step: null,
  lessonNumber: null,
  lessonCount: null,
  cells: [],
  previous: null,
  next: null,
  upNext: null,
  completesStep: false,
  completesPath: false,
};

const LessonMemberContext = createContext<MemberResource<MemberPayload<LessonMemberPayload>>>({ kind: "guest" });

export function LessonMemberProvider({ slug, children }: { slug: string; children: React.ReactNode }) {
  const locale = useLocale();
  const resource = useMemberResource<LessonMemberPayload>(
    `/api/me/learn/${encodeURIComponent(slug)}?locale=${encodeURIComponent(locale)}`
  );
  if (resource.kind === "ready" && resource.data.access === "hidden") notFound();
  return <LessonMemberContext.Provider value={resource}>{children}</LessonMemberContext.Provider>;
}

export function useLessonMember(): { resource: MemberResource<MemberPayload<LessonMemberPayload>>; data: LessonMemberData | null } {
  const resource = useContext(LessonMemberContext);
  const data = resource.kind === "ready" && resource.data.access === "open" ? resource.data : null;
  return { resource, data };
}

function RegionError({ onRetry }: { onRetry: () => void }) {
  const t = useTranslations("common");
  return (
    <div className="flex flex-col items-start gap-3">
      <Notice tone="error">{t("error")}</Notice>
      <Button variant="quiet" onClick={onRetry}>
        {t("tryAgain")}
      </Button>
    </div>
  );
}

interface BarRegionProps {
  lessonId: string;
  guestPlace: LessonPlace;
  signInHref: string;
}

export function LessonBarRegion({ lessonId, guestPlace, signInHref }: BarRegionProps) {
  const { resource, data } = useLessonMember();
  const guestBar = (
    <LessonContextBar place={guestPlace} lessonId={lessonId} saved={false} signedIn={false} signInHref={signInHref} />
  );

  if (data) {
    return (
      <div className="settle">
        <LessonContextBar place={data.place} lessonId={lessonId} saved={data.saved} signedIn signInHref={signInHref} />
      </div>
    );
  }
  if (resource.kind === "error") return guestBar;
  return (
    <>
      <div data-guest-only>{guestBar}</div>
      {resource.kind === "loading" ? (
        <div data-member-skeleton aria-hidden="true">
          <div className="mx-auto w-full max-w-3xl px-4 py-5 sm:px-6 lg:px-8">
            <div className={`animate-pulse rounded-[var(--radius-cell)] bg-primary-tint ${guestPlace.lessonNumber !== null ? "h-28" : "h-16"}`} />
          </div>
        </div>
      ) : null}
    </>
  );
}

interface FinishRegionProps {
  lessonId: string;
  guestPlace: LessonPlace;
  checkHref: string | null;
}

function finishProps(place: LessonPlace) {
  return {
    stage: place.path?.stage ?? null,
    upNext: place.upNext,
    step: place.step,
    cells: place.cells,
    completesStep: place.completesStep,
    completesPath: place.completesPath,
    path: place.path ? { slug: place.path.slug, title: place.path.title } : null,
  };
}

export function LessonFinishRegion({ lessonId, guestPlace, checkHref }: FinishRegionProps) {
  const { resource, data } = useLessonMember();

  if (data) {
    return (
      <div className="settle">
        <LessonFinish lessonId={lessonId} signedIn checkHref={checkHref} {...finishProps(data.place)} />
      </div>
    );
  }
  if (resource.kind === "error") return <RegionError onRetry={resource.retry} />;
  return (
    <>
      <div data-guest-only>
        <LessonFinish lessonId={lessonId} signedIn={false} checkHref={checkHref} {...finishProps(guestPlace)} />
      </div>
      {resource.kind === "loading" ? (
        <div data-member-skeleton aria-hidden="true">
          <div className="h-72 animate-pulse rounded-[var(--radius-panel)] bg-primary-tint" />
        </div>
      ) : null}
    </>
  );
}

function EmptyLesson({ place }: { place: LessonPlace }) {
  const t = useTranslations("lesson");
  return (
    <EmptyState
      title={t("emptyTitle")}
      body={t("emptyBody")}
      art="lantern"
      action={
        place.upNext ? (
          <Button href={`/learn/${place.upNext.slug}`}>{t("continue")}</Button>
        ) : (
          <Button href={place.path ? `/paths/${place.path.slug}` : "/paths"}>
            {place.path ? t("backToPath") : t("seeAllPaths")}
          </Button>
        )
      }
    />
  );
}

export function LessonEmptyRegion({ guestPlace }: { guestPlace: LessonPlace }) {
  const { resource, data } = useLessonMember();
  if (data) return <EmptyLesson place={data.place} />;
  if (resource.kind === "error") return <EmptyLesson place={guestPlace} />;
  return (
    <>
      <div data-guest-only>
        <EmptyLesson place={guestPlace} />
      </div>
      {resource.kind === "loading" ? (
        <div data-member-skeleton aria-hidden="true" className="h-72 animate-pulse rounded-[var(--radius-panel)] bg-primary-tint" />
      ) : null}
    </>
  );
}
