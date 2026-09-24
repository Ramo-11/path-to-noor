"use client";

import { TriangleAlert } from "lucide-react";
import { signOut } from "next-auth/react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/primer/Button";

interface AccountActionsProps {
  locale: string;
}

export function AccountActions({ locale }: AccountActionsProps) {
  const t = useTranslations("settings");

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col items-start gap-4">
        <h2 className="text-heading font-semibold">{t("account")}</h2>
        <p className="text-ink-2">{t("signOutBody")}</p>
        <Button type="button" variant="secondary" onClick={() => signOut({ callbackUrl: `/${locale}` })}>
          {t("signOut")}
        </Button>
      </div>

      <div className="flex flex-col items-start gap-2 rounded-[var(--radius-control)] bg-danger-tint px-4 py-4 sm:px-5">
        <p className="flex items-center gap-2 text-[0.9375rem] font-medium text-danger">
          <TriangleAlert aria-hidden="true" strokeWidth={1.75} className="size-4 shrink-0" />
          {t("dangerZone")}
        </p>
        <p className="text-ink-2">
          {t.rich("deleteAccount", {
            contact: (chunks) => (
              <Link
                href="/contact"
                className="text-ink underline decoration-rule-strong underline-offset-[0.25em] hover:decoration-ink"
              >
                {chunks}
              </Link>
            ),
          })}
        </p>
      </div>
    </div>
  );
}
