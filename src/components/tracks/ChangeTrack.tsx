"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useSession } from "next-auth/react";
import { usePathname, useRouter } from "@/i18n/navigation";
import { Spinner } from "@/components/primer/Spinner";
import { clearAccountTrack, clearStoredTrack } from "./storage";

interface ChangeTrackProps {
  variant?: "change" | "notYou";
  className?: string;
}

export function ChangeTrack({ variant = "change", className = "" }: ChangeTrackProps) {
  const t = useTranslations("tracks");
  const { status, update } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);

  async function handleClick() {
    setBusy(true);
    setFailed(false);
    clearStoredTrack();

    if (status === "authenticated") {
      const cleared = await clearAccountTrack();
      if (!cleared) {
        setBusy(false);
        setFailed(true);
        return;
      }
      await update({ track: null });
    }

    if (pathname === "/") {
      router.refresh();
      setBusy(false);
      return;
    }
    router.push("/");
  }

  const button = (
    <button
      type="button"
      onClick={handleClick}
      disabled={busy}
      aria-busy={busy || undefined}
      className="inline-flex min-h-11 items-center gap-2 text-[0.875rem] text-ink-2 underline decoration-rule-strong underline-offset-[0.3em] transition-colors duration-150 hover:text-ink hover:decoration-ink disabled:opacity-60"
    >
      {busy ? <Spinner /> : null}
      {variant === "change" ? t("changeWhere") : t("changeAction")}
    </button>
  );

  return (
    <div className={className}>
      {variant === "notYou" ? (
        <p className="flex flex-wrap items-center gap-x-2 text-[0.875rem] text-ink-3">
          <span>{t("notYou")}</span>
          {button}
        </p>
      ) : (
        button
      )}
      {failed ? (
        <p role="alert" className="mt-1 text-[0.875rem] text-danger">
          {t("changeError")}
        </p>
      ) : null}
    </div>
  );
}
