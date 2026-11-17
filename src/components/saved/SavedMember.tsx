"use client";

import { useLocale, useTranslations } from "next-intl";
import { useLearner } from "@/lib/use-learner";
import { useMeResource } from "@/components/me/use-me-resource";
import { MemberError } from "@/components/me/MemberError";
import { PageBanner } from "@/components/primer/PageBanner";
import { Button } from "@/components/primer/Button";
import { EmptyState } from "@/components/primer/EmptyState";
import { SavedList } from "./SavedList";
import type { SavedMePayload } from "./saved-types";

function SavedSkeleton() {
  return (
    <div aria-hidden="true" className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
      <div className="mt-4 h-72 animate-pulse rounded-[var(--radius-panel)] bg-primary-tint sm:mt-8" />
      <div className="mx-auto flex max-w-3xl flex-col gap-3 pt-10 pb-16 sm:pb-24">
        {Array.from({ length: 3 }, (_, index) => (
          <div key={index} className="h-24 animate-pulse rounded-[var(--radius-cell)] bg-primary-tint" />
        ))}
      </div>
    </div>
  );
}

export function SavedMember({ children }: { children: React.ReactNode }) {
  const locale = useLocale();
  const t = useTranslations("saved");
  const { status } = useLearner();
  const signedIn = status === "signedIn";
  const resource = useMeResource<SavedMePayload>(signedIn ? `/api/me/saved?locale=${locale}` : null);

  if (!signedIn) {
    return (
      <>
        <div data-guest-only>{children}</div>
        {status === "loading" ? (
          <div data-member-skeleton>
            <SavedSkeleton />
          </div>
        ) : null}
      </>
    );
  }

  if (resource.status === "error") {
    return (
      <div className="mx-auto w-full max-w-3xl px-4 pt-10 pb-16 sm:px-6 sm:pb-24 lg:px-8">
        <MemberError onRetry={resource.retry} />
      </div>
    );
  }
  if (resource.status !== "ready" || !resource.data) return <SavedSkeleton />;
  if (!resource.data.signedIn) return <>{children}</>;

  const lessons = resource.data.lessons;
  return (
    <div className="settle mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
      <PageBanner title={t("title")} lead={t("lead")} art="saved" tone="dawn" />
      <div className="mx-auto max-w-3xl pt-10 pb-16 sm:pb-24">
        {lessons.length === 0 ? (
          <EmptyState
            title={t("emptyTitle")}
            body={t("emptyBody")}
            action={<Button href="/paths">{t("explorePaths")}</Button>}
            art="saved"
          />
        ) : (
          <SavedList initialLessons={lessons} />
        )}
      </div>
    </div>
  );
}
