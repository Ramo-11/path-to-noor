"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Notice } from "@/components/primer/Notice";
import { Button } from "@/components/primer/Button";

export function AccountDeletedNotice() {
  const t = useTranslations("settings");
  const searchParams = useSearchParams();
  const flagged = searchParams.get("account") === "deleted";
  const [visible, setVisible] = useState(flagged);

  useEffect(() => {
    if (!flagged) return;
    const url = new URL(window.location.href);
    url.searchParams.delete("account");
    window.history.replaceState(window.history.state, "", url.pathname + url.search + url.hash);
  }, [flagged]);

  if (!visible) return null;

  return (
    <div className="mx-auto w-full max-w-6xl px-4 pt-4 sm:px-6 lg:px-8">
      <Notice tone="success" className="items-center">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span>{t("deletedNotice")}</span>
          <Button type="button" variant="quiet" onClick={() => setVisible(false)}>
            {t("dismiss")}
          </Button>
        </div>
      </Notice>
    </div>
  );
}
