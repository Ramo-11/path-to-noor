"use client";

import { useEffect, useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useSession } from "next-auth/react";
import { Button } from "@/components/primer/Button";
import { EmptyState } from "@/components/primer/EmptyState";
import { PageIntro } from "@/components/primer/PageIntro";
import { Spinner } from "@/components/primer/Spinner";
import { DetailsForm } from "@/components/settings/DetailsForm";
import { PasswordForm } from "@/components/settings/PasswordForm";
import { SignOutBlock, DeleteAccountNotice } from "@/components/settings/AccountActions";

type Language = "en" | "ar" | "es";

interface ProfileData {
  name: string;
  email: string;
  preferredLanguage: Language;
  hasPassword: boolean;
}

export default function SettingsPage() {
  const t = useTranslations("settings");
  const tCommon = useTranslations("common");
  const locale = useLocale();
  const { status } = useSession();

  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    if (status !== "authenticated") {
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setLoadError(false);

    fetch("/api/user/profile")
      .then((res) => {
        if (!res.ok) throw new Error("failed to load profile");
        return res.json();
      })
      .then((data) => {
        if (!cancelled && data.data) setProfile(data.data);
      })
      .catch(() => {
        if (!cancelled) setLoadError(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [status]);

  if (status === "unauthenticated") {
    return (
      <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
        <EmptyState
          title={t("guestTitle")}
          body={t("guestBody")}
          action={
            <div className="flex flex-wrap items-center gap-3">
              <Button href="/login" variant="primary">
                {t("signIn")}
              </Button>
              <Button href="/register" variant="secondary">
                {t("createAccount")}
              </Button>
            </div>
          }
        />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="mx-auto flex w-full max-w-6xl items-center justify-center px-4 py-24 sm:px-6 lg:px-8">
        <Spinner className="text-ink-2" />
      </div>
    );
  }

  if (loadError || !profile) {
    return (
      <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
        <EmptyState
          title={t("errorGeneric")}
          action={
            <Button type="button" variant="secondary" onClick={() => window.location.reload()}>
              {tCommon("tryAgain")}
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-3xl px-4 sm:px-6 lg:px-8">
      <PageIntro title={t("title")} />

      <div className="primer-grid grid-cols-1 pb-16 sm:pb-24">
        <div className="px-6 py-8 sm:px-8">
          <DetailsForm
            initialName={profile.name}
            email={profile.email}
            initialLanguage={profile.preferredLanguage}
            locale={locale}
          />
        </div>
        <div className="px-6 py-8 sm:px-8">
          <PasswordForm hasPassword={profile.hasPassword} />
        </div>
        <div className="px-6 py-8 sm:px-8">
          <SignOutBlock locale={locale} />
        </div>
        <div className="px-6 py-8 sm:px-8">
          <DeleteAccountNotice />
        </div>
      </div>
    </div>
  );
}
