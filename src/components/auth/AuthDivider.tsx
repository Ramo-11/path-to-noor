"use client";

import { useTranslations } from "next-intl";

export function AuthDivider() {
  const t = useTranslations("auth");

  return (
    <div className="my-8 flex items-center gap-4">
      <span className="h-px flex-1 bg-rule" aria-hidden="true" />
      <span className="text-meta text-ink-3">{t("or")}</span>
      <span className="h-px flex-1 bg-rule" aria-hidden="true" />
    </div>
  );
}
