"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useLocale, useTranslations } from "next-intl";
import { usePathname } from "@/i18n/navigation";

type Status = "idle" | "sending" | "sent" | "error";

export function VerifyEmailBanner() {
  const t = useTranslations("verifyEmail");
  const locale = useLocale();
  const pathname = usePathname();
  const { data: session, status: sessionStatus } = useSession();
  const [status, setStatus] = useState<Status>("idle");

  if (sessionStatus !== "authenticated" || !session?.user) return null;
  if (session.user.emailVerified) return null;
  if (pathname.startsWith("/verify-email")) return null;

  async function resend() {
    setStatus("sending");
    try {
      const res = await fetch("/api/auth/verify-email/resend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ locale }),
      });
      setStatus(res.ok ? "sent" : "error");
    } catch {
      setStatus("error");
    }
  }

  return (
    <div role="status" className="border-b border-rule bg-primary-tint px-4 py-2 text-[0.9375rem] text-ink">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-x-4 gap-y-1">
        <p className="min-w-0 py-2 text-pretty">
          {status === "sent"
            ? t("bannerSent")
            : status === "error"
              ? t("bannerError")
              : t("bannerMessage")}
        </p>
        {status !== "sent" ? (
          <button
            type="button"
            onClick={resend}
            disabled={status === "sending"}
            className="min-h-11 shrink-0 px-2 font-medium text-primary underline underline-offset-[0.25em] disabled:opacity-60"
          >
            {status === "sending" ? t("sending") : t("resend")}
          </button>
        ) : null}
      </div>
    </div>
  );
}
