"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/primer/Button";
import { Notice } from "@/components/primer/Notice";
import { Link } from "@/i18n/navigation";
import { refreshLearner, useLearner } from "@/lib/use-learner";
import type { VolunteerView as ViewName } from "@/app/api/me/mentor/route";
import { VolunteerForm } from "./VolunteerForm";

type Phase = { kind: "loading" } | { kind: "error" } | { kind: "ready"; view: ViewName };

function useVolunteerView(enabled: boolean) {
  const [phase, setPhase] = useState<Phase>({ kind: "loading" });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;
    fetch("/api/me/mentor", { cache: "no-store", credentials: "same-origin" })
      .then((res) => {
        if (!res.ok) throw new Error(String(res.status));
        return res.json() as Promise<{ view: ViewName }>;
      })
      .then((data) => {
        if (!cancelled) setPhase({ kind: "ready", view: data.view });
      })
      .catch(() => {
        if (!cancelled) setPhase({ kind: "error" });
      });
    return () => {
      cancelled = true;
    };
  }, [enabled, attempt]);

  const retry = useCallback(() => {
    setPhase({ kind: "loading" });
    setAttempt((n) => n + 1);
  }, []);

  return { phase, retry };
}

function ErrorNotice({ onRetry }: { onRetry: () => void }) {
  const t = useTranslations("volunteer");
  return (
    <Notice tone="error" className="max-w-2xl">
      <p>{t("loadError")}</p>
      <div className="mt-3">
        <Button variant="secondary" onClick={onRetry}>
          {t("retry")}
        </Button>
      </div>
    </Notice>
  );
}

function Skeleton() {
  const t = useTranslations("volunteer");
  return (
    <div data-member-skeleton role="status" className="max-w-2xl">
      <span className="sr-only">{t("loading")}</span>
      <div aria-hidden="true" className="h-48 animate-pulse rounded-[var(--radius-panel)] bg-stage3-tint" />
    </div>
  );
}

function MemberView({ view }: { view: ViewName }) {
  const t = useTranslations("volunteer");

  switch (view) {
    case "guest":
      return null;
    case "unverified":
      return (
        <Notice tone="info" className="max-w-2xl">
          <p className="font-medium">{t("verifyTitle")}</p>
          <p className="mt-1">{t("verifyBody")}</p>
          <div className="mt-3">
            <Link
              href="/settings"
              className="inline-flex min-h-11 items-center text-ink underline decoration-rule-strong underline-offset-[0.25em] hover:decoration-ink"
            >
              {t("verifyLink")}
            </Link>
          </div>
        </Notice>
      );
    case "pending":
      return (
        <div className="card max-w-2xl p-6 sm:p-8" role="status">
          <h2 className="text-heading font-semibold">{t("pendingTitle")}</h2>
          <p className="mt-2 text-ink-2">{t("pendingBody")}</p>
        </div>
      );
    case "approved":
      return (
        <div className="card max-w-2xl p-6 sm:p-8">
          <div className="flex flex-col items-start gap-3">
            <h2 className="text-heading font-semibold">{t("approvedTitle")}</h2>
            <p className="text-ink-2">{t("approvedBody")}</p>
            <Button href="/mentor" variant="primary">
              {t("approvedCta")}
            </Button>
          </div>
        </div>
      );
    case "declined":
      return (
        <div className="card max-w-2xl p-6 sm:p-8">
          <div className="flex flex-col items-start gap-3">
            <h2 className="text-heading font-semibold">{t("declinedTitle")}</h2>
            <p className="text-ink-2">{t("declinedBody")}</p>
            <Button href="/contact" variant="secondary">
              {t("declinedCta")}
            </Button>
          </div>
        </div>
      );
    case "form":
      return (
        <>
          <p className="max-w-2xl text-ink-2 text-pretty">{t("intro")}</p>
          <VolunteerForm />
        </>
      );
  }
}

export function VolunteerView({ guest }: { guest: React.ReactNode }) {
  const { status } = useLearner();
  const { phase, retry } = useVolunteerView(status === "signedIn");

  if (status === "error") return <ErrorNotice onRetry={() => void refreshLearner()} />;

  if (status === "signedIn") {
    if (phase.kind === "error") return <ErrorNotice onRetry={retry} />;
    if (phase.kind === "ready") {
      return phase.view === "guest" ? (
        <>{guest}</>
      ) : (
        <div className="settle flex flex-col gap-6">
          <MemberView view={phase.view} />
        </div>
      );
    }
    return <Skeleton />;
  }

  return (
    <>
      <div data-guest-only>{guest}</div>
      {status === "loading" ? <Skeleton /> : null}
    </>
  );
}
