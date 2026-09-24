"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/primer/Button";
import { EmptyState } from "@/components/primer/EmptyState";

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
    <div className="mx-auto flex min-h-[60vh] w-full max-w-xl items-center px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
      <EmptyState
        art="lantern"
        title={t("errorTitle")}
        action={
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Button type="button" variant="primary" onClick={reset}>
              {t("tryAgain")}
            </Button>
            <Button href="/" variant="secondary">
              {t("goHome")}
            </Button>
          </div>
        }
      />
    </div>
  );
}
