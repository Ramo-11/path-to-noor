import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { auth } from "@/lib/auth-config";
import { PageBanner } from "@/components/primer/PageBanner";
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
        <PageBanner title={t("title")} lead={t("guestLead")} art="mentor" tone="evening" />
        <GuestIntro />
      </div>
    );
  }

  const userType = session.user.userType;

  if (userType === "mentor") {
    return (
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
        <PageBanner title={t("mentorTitle")} lead={t("mentorLead")} art="mentor" tone="evening" />
        <div className="pt-10">
          <MenteeList />
        </div>
      </div>
    );
  }

  const track = (session.user as { track?: string }).track;

  if (userType === "revert" || track === "new") {
    return (
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
        <PageBanner title={t("title")} lead={t("revertLead")} art="mentor" tone="evening" />
        <div className="pt-10">
          <RequestPanel />
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
      <PageBanner title={t("title")} lead={t("guestLead")} art="mentor" tone="evening" />
      <div className="card mt-10 max-w-2xl">
        <div className="flex flex-col items-start gap-3 px-6 py-8 sm:px-8">
          <h2 className="text-heading font-semibold">{t("volunteerPromptTitle")}</h2>
          <p className="text-ink-2">{t("volunteerPromptBody")}</p>
          <Button href="/mentor/volunteer" variant="secondary">
            {t("volunteerLink")}
          </Button>
        </div>
      </div>
      <div className="pb-24" />
    </div>
  );
}
