"use client";

import { signOut } from "next-auth/react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/primer/Button";

interface SignOutBlockProps {
  locale: string;
}

export function SignOutBlock({ locale }: SignOutBlockProps) {
  const t = useTranslations("settings");

  return (
    <div className="flex flex-col items-start gap-4">
      <p className="text-ink-2">{t("signOutBody")}</p>
      <Button type="button" variant="secondary" onClick={() => signOut({ callbackUrl: `/${locale}` })}>
        {t("signOut")}
      </Button>
    </div>
  );
}

export function DeleteAccountNotice() {
  const t = useTranslations("settings");

  return (
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
  );
}
