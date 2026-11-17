import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { LegalLayout } from "@/components/legal/LegalLayout";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "legal" });
  return {
    title: t("termsTitle"),
    description: t("termsDescription"),
  };
}

export default async function TermsOfServicePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  await params;
  const t = await getTranslations("legal");

  const sections = [
    { id: "acceptance", title: t("terms.acceptanceTitle"), content: t("terms.acceptanceText") },
    { id: "description", title: t("terms.descriptionTitle"), content: t("terms.descriptionText") },
    {
      id: "accounts",
      title: t("terms.accountsTitle"),
      content: t("terms.accountsIntro"),
      items: [t("terms.accountsItem1"), t("terms.accountsItem2"), t("terms.accountsItem3")],
    },
    {
      id: "conduct",
      title: t("terms.conductTitle"),
      content: t("terms.conductIntro"),
      items: [
        t("terms.conductItem1"),
        t("terms.conductItem2"),
        t("terms.conductItem3"),
        t("terms.conductItem4"),
      ],
    },
    { id: "content", title: t("terms.contentTitle"), content: t("terms.contentText") },
    { id: "ip", title: t("terms.ipTitle"), content: t("terms.ipText") },
    { id: "mentorship", title: t("terms.mentorshipTitle"), content: t("terms.mentorshipText") },
    { id: "disclaimer", title: t("terms.disclaimerTitle"), content: t("terms.disclaimerText") },
    { id: "limitation", title: t("terms.limitationTitle"), content: t("terms.limitationText") },
    { id: "termination", title: t("terms.terminationTitle"), content: t("terms.terminationText") },
    { id: "changes", title: t("terms.changesTitle"), content: t("terms.changesText") },
    { id: "contact", title: t("terms.contactTitle"), content: t("terms.contactText") },
  ];

  return (
    <LegalLayout
      title={t("termsTitle")}
      lastUpdated={t("lastUpdated", { date: t("updateDate") })}
      contentsLabel={t("contents")}
      sections={sections}
    />
  );
}
