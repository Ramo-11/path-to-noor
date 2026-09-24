import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { auth } from "@/lib/auth-config";
import { PageIntro } from "@/components/primer/PageIntro";
import { Button } from "@/components/primer/Button";
import { GuestIntro } from "@/components/mentor/GuestIntro";
import { RequestPanel } from "@/components/mentor/RequestPanel";
import { MenteeList } from "@/components/mentor/MenteeList";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "mentor" });
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
  };
}

export default async function MentorPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  await params;
  const session = await auth();
  const t = await getTranslations("mentor");

  if (!session?.user) {
    return (
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
        <PageIntro title={t("title")} lead={t("guestLead")} />
        <GuestIntro />
      </div>
    );
  }

  const userType = session.user.userType;

  if (userType === "mentor") {
    return (
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
        <PageIntro title={t("mentorTitle")} lead={t("mentorLead")} />
        <MenteeList />
      </div>
    );
  }

  if (userType === "revert") {
    return (
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
        <PageIntro title={t("title")} lead={t("revertLead")} />
        <RequestPanel />
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
      <PageIntro title={t("title")} />
      <div className="primer-grid max-w-2xl grid-cols-1 pb-24">
        <div className="flex flex-col items-start gap-4 px-6 py-10 sm:px-8">
          <p className="text-ink-2">{t("onboardingPrompt")}</p>
          <Button href="/onboarding" variant="primary">
            {t("finishOnboarding")}
          </Button>
        </div>
      </div>
    </div>
  );
}
