"use client";

import { createContext, useContext } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useLearner } from "@/lib/use-learner";
import { useMeResource } from "@/components/me/use-me-resource";
import { MemberError } from "@/components/me/MemberError";
import { SubjectLearnedToggle } from "./SubjectLearnedToggle";
import { SubjectProgressBar } from "./SubjectProgressBar";
import { SubjectSections } from "./SubjectSections";
import type { SubjectMePayload } from "./library-types";

type MemberData = Extract<SubjectMePayload, { signedIn: true }>;

interface SubjectMemberState {
  guestLoading: boolean;
  lapsed: boolean;
  signedIn: boolean;
  status: "idle" | "loading" | "ready" | "error";
  data: MemberData | null;
  retry: () => void;
}

const SubjectMemberContext = createContext<SubjectMemberState | null>(null);

function useSubjectMember(): SubjectMemberState {
  const value = useContext(SubjectMemberContext);
  if (!value) throw new Error("SubjectMemberProvider is missing");
  return value;
}

export function SubjectMemberProvider({ slug, children }: { slug: string; children: React.ReactNode }) {
  const locale = useLocale();
  const { status } = useLearner();
  const signedIn = status === "signedIn";
  const resource = useMeResource<SubjectMePayload>(
    signedIn ? `/api/me/library/${encodeURIComponent(slug)}?locale=${locale}` : null
  );
  const data = resource.data?.signedIn ? resource.data : null;
  const lapsed = resource.status === "ready" && !data;

  const value: SubjectMemberState = {
    guestLoading: status === "loading",
    lapsed,
    signedIn: signedIn && !lapsed,
    status: lapsed ? "idle" : resource.status,
    data,
    retry: resource.retry,
  };
  return <SubjectMemberContext.Provider value={value}>{children}</SubjectMemberContext.Provider>;
}

function Skeleton({ className }: { className: string }) {
  return (
    <div
      aria-hidden="true"
      className={`animate-pulse rounded-[var(--radius-control)] bg-primary-tint ${className}`}
    />
  );
}

export function SubjectBannerMember({ topicId }: { topicId: string }) {
  const tLearning = useTranslations("learning");
  const { guestLoading, signedIn, status, data } = useSubjectMember();

  if (!signedIn) {
    return guestLoading ? (
      <div data-member-skeleton>
        <Skeleton className="h-24 max-w-xs" />
      </div>
    ) : null;
  }
  if (status === "loading") return <Skeleton className="h-24 max-w-xs" />;
  if (status !== "ready" || !data) return null;

  const lessons = data.content.modules.flatMap((mod) => mod.lessons);
  const completed = new Set(data.completedLessonIds);
  const total = lessons.length;
  const done = lessons.filter((lesson) => completed.has(lesson.id)).length;

  return (
    <div className="settle flex flex-col gap-5">
      {total > 0 ? (
        <div className="max-w-xs">
          <SubjectProgressBar
            done={done}
            total={total}
            label={tLearning("lessonsDone", { done, total })}
          />
          <p className="mt-1.5 text-meta text-ink-3 tabular">{tLearning("lessonsDone", { done, total })}</p>
        </div>
      ) : null}
      <SubjectLearnedToggle topicId={topicId} initialLearned={data.isLearned} />
    </div>
  );
}

export function SubjectBodyMember({
  subjectName,
  children,
}: {
  subjectName: string;
  children: React.ReactNode;
}) {
  const { guestLoading, lapsed, signedIn, status, data, retry } = useSubjectMember();

  if (!signedIn) {
    if (lapsed) return <>{children}</>;
    return (
      <>
        <div data-guest-only>{children}</div>
        {guestLoading ? (
          <div data-member-skeleton>
            <Skeleton className="h-[32rem]" />
          </div>
        ) : null}
      </>
    );
  }
  if (status === "error") return <MemberError onRetry={retry} />;
  if (status !== "ready" || !data) return <Skeleton className="h-[32rem]" />;

  return (
    <div className="settle">
      <SubjectSections
        subjectName={subjectName}
        content={data.content}
        completedLessonIds={data.completedLessonIds}
      />
    </div>
  );
}
