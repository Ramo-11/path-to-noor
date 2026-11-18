"use client";

import { useTranslations } from "next-intl";
import { PageBanner } from "@/components/primer/PageBanner";
import { Button } from "@/components/primer/Button";
import { Notice } from "@/components/primer/Notice";
import { refreshLearner, useLearner } from "@/lib/use-learner";
import type { MeSignedIn } from "@/lib/me-types";
import { MenteeList } from "./MenteeList";
import { RequestPanel } from "./RequestPanel";

function MemberView({ me }: { me: MeSignedIn }) {
  const t = useTranslations("mentor");
  const { userType } = me.user;

  if (userType === "mentor") {
    return (
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
        <PageBanner title={t("mentorTitle")} lead={t("mentorLead")} art="mentor" tone="evening" />
        <div className="pt-10">
          <MenteeList />
        </div>
      </div>
    );
  }

  if (userType === "revert" || me.track === "new") {
    return (
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
        <PageBanner title={t("title")} lead={t("revertLead")} art="mentor" tone="evening" />
        <div className="pt-10">
          <RequestPanel />
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
      <PageBanner title={t("title")} lead={t("guestLead")} art="mentor" tone="evening" />
      <div className="card mt-10 max-w-2xl">
        <div className="flex flex-col items-start gap-3 px-6 py-8 sm:px-8">
          <h2 className="text-heading font-semibold">{t("volunteerPromptTitle")}</h2>
          <p className="text-ink-2">{t("volunteerPromptBody")}</p>
          <Button href="/mentor/volunteer" variant="secondary">
            {t("volunteerLink")}
          </Button>
        </div>
      </div>
      <div className="pb-24" />
    </div>
  );
}

export function MentorPageView({ guest }: { guest: React.ReactNode }) {
  const t = useTranslations("mentor");
  const { status, me } = useLearner();

  if (status === "signedIn" && me) {
    return (
      <div className="settle">
        <MemberView me={me} />
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <Notice tone="error" className="max-w-2xl">
          <p>{t("loadError")}</p>
          <div className="mt-3">
            <Button variant="secondary" onClick={() => void refreshLearner()}>
              {t("retry")}
            </Button>
          </div>
        </Notice>
      </div>
    );
  }

  return (
    <>
      <div data-guest-only>{guest}</div>
      {status === "loading" ? (
        <div data-member-skeleton role="status" className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
          <span className="sr-only">{t("loading")}</span>
          <div aria-hidden="true" className="mt-4 h-64 animate-pulse rounded-[var(--radius-panel)] bg-stage3-tint sm:mt-8" />
          <div aria-hidden="true" className="mt-10 h-48 max-w-2xl animate-pulse rounded-[var(--radius-panel)] bg-stage3-tint" />
        </div>
      ) : null}
    </>
  );
}
