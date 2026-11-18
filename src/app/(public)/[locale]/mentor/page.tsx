import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { PageBanner } from "@/components/primer/PageBanner";
import { GuestIntro } from "@/components/mentor/GuestIntro";
import { MentorPageView } from "@/components/mentor/MentorPageView";

export const revalidate = 3600;

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

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
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("mentor");

  return (
    <MentorPageView
      guest={
        <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
          <PageBanner title={t("title")} lead={t("guestLead")} art="mentor" tone="evening" />
          <GuestIntro />
        </div>
      }
    />
  );
}
