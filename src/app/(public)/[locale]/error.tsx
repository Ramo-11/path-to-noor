"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/primer/Button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations("system");

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col items-start gap-6 px-4 py-24 sm:px-6 sm:py-32 lg:px-8">
      <h1 className="text-title font-semibold text-balance">{t("errorTitle")}</h1>
      <p className="max-w-[52ch] text-ink-2">{t("errorBody")}</p>
      <div className="flex flex-wrap gap-3">
        <Button type="button" variant="primary" onClick={reset}>
          {t("tryAgain")}
        </Button>
        <Button href="/" variant="secondary">
          {t("goHome")}
        </Button>
      </div>
    </div>
  );
}
