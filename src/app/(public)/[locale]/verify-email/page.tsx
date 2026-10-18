"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { useLocale, useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/primer/Button";
import { Notice } from "@/components/primer/Notice";
import { AuthShell } from "@/components/auth/AuthShell";
import { authErrorKey } from "@/components/auth/auth-errors";
import { track } from "@/lib/analytics";

type State = "loading" | "success" | "expired" | "invalid" | "error";
type ResendState = "idle" | "sending" | "sent" | "signin" | "error";

function VerifyEmail() {
  const t = useTranslations("verifyEmail");
  const locale = useLocale();
  const token = useSearchParams().get("token");
  const { status: sessionStatus, update } = useSession();
  const [state, setState] = useState<State>(token ? "loading" : "invalid");
  const [resend, setResend] = useState<ResendState>("idle");
  const started = useRef(false);

  useEffect(() => {
    if (!token || started.current) return;
    started.current = true;
    (async () => {
      try {
        const res = await fetch("/api/auth/verify-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        });
        if (res.ok) {
          setState("success");
          track("email_verified");
          return;
        }
        const data = await res.json().catch(() => ({}));
        const key = authErrorKey(data.code, res.status);
        setState(key === "expired_token" ? "expired" : key === "server_error" || key === "rate_limited" ? "error" : "invalid");
      } catch {
        setState("error");
      }
    })();
  }, [token]);

  const refreshed = useRef(false);
  useEffect(() => {
    if (state !== "success" || sessionStatus === "loading" || refreshed.current) return;
    refreshed.current = true;
    if (sessionStatus === "authenticated") void update({});
  }, [state, sessionStatus, update]);

  async function sendAgain() {
    if (sessionStatus !== "authenticated") {
      setResend("signin");
      return;
    }
    setResend("sending");
    try {
      const res = await fetch("/api/auth/verify-email/resend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ locale }),
      });
      setResend(res.ok ? "sent" : "error");
    } catch {
      setResend("error");
    }
  }

  if (state === "loading") {
    return (
      <AuthShell>
        <h1 className="text-heading font-semibold text-balance">{t("verifying")}</h1>
        <p className="mt-2 text-ink-2" role="status">{t("verifyingDescription")}</p>
      </AuthShell>
    );
  }

  if (state === "success") {
    return (
      <AuthShell>
        <h1 className="text-heading font-semibold text-balance">{t("successTitle")}</h1>
        <p className="mt-2 text-ink-2 text-pretty">{t("successDescription")}</p>
        <div className="mt-6">
          <Button href="/" size="lg">
            {t("continue")}
          </Button>
        </div>
      </AuthShell>
    );
  }

  const title = state === "expired" ? t("expiredTitle") : state === "error" ? t("errorTitle") : t("invalidTitle");
  const description =
    state === "expired" ? t("expiredDescription") : state === "error" ? t("errorDescription") : t("invalidDescription");

  return (
    <AuthShell>
      <h1 className="text-heading font-semibold text-balance">{title}</h1>
      <p className="mt-2 text-ink-2 text-pretty">{description}</p>

      <div className="mt-6 flex flex-col gap-4">
        {resend === "sent" ? <Notice tone="success">{t("resent")}</Notice> : null}
        {resend === "error" ? <Notice tone="error">{t("resendError")}</Notice> : null}
        {resend === "signin" ? <Notice tone="info">{t("signInToResend")}</Notice> : null}
        <div className="flex flex-wrap items-center gap-3">
          <Button onClick={sendAgain} loading={resend === "sending"} disabled={resend === "sent"}>
            {t("resend")}
          </Button>
          <Button href="/login" variant="quiet">
            {t("goToSignIn")}
          </Button>
        </div>
      </div>
    </AuthShell>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="mx-auto w-full max-w-5xl px-4 py-20 sm:px-6 lg:px-8" />}>
      <VerifyEmail />
    </Suspense>
  );
}
