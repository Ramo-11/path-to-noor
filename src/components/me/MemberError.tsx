"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/components/primer/Button";
import { Notice } from "@/components/primer/Notice";

export function MemberError({ onRetry }: { onRetry: () => void }) {
  const t = useTranslations("common");
  return (
    <Notice tone="error">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span>{t("error")}</span>
        <Button variant="secondary" onClick={onRetry}>
          {t("tryAgain")}
        </Button>
      </div>
    </Notice>
  );
}
