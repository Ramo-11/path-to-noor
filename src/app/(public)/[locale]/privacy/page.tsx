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
    title: t("privacyTitle"),
    description: t("privacyDescription"),
  };
}

export default async function PrivacyPolicyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  await params;
  const t = await getTranslations("legal");

  const sections = [
    { id: "introduction", title: t("privacy.introTitle"), content: t("privacy.introText") },
    {
      id: "collect",
      title: t("privacy.collectTitle"),
      content: t("privacy.collectIntro"),
      items: [
        t("privacy.collectItem1"),
        t("privacy.collectItem2"),
        t("privacy.collectItem3"),
        t("privacy.collectItem4"),
        t("privacy.collectItem5"),
      ],
    },
    {
      id: "use",
      title: t("privacy.useTitle"),
      content: t("privacy.useIntro"),
      items: [
        t("privacy.useItem1"),
        t("privacy.useItem2"),
        t("privacy.useItem3"),
        t("privacy.useItem4"),
        t("privacy.useItem5"),
      ],
    },
    { id: "sharing", title: t("privacy.sharingTitle"), content: t("privacy.sharingText") },
    { id: "cookies", title: t("privacy.cookiesTitle"), content: t("privacy.cookiesText") },
    { id: "security", title: t("privacy.securityTitle"), content: t("privacy.securityText") },
    { id: "children", title: t("privacy.childrenTitle"), content: t("privacy.childrenText") },
    {
      id: "rights",
      title: t("privacy.rightsTitle"),
      content: t("privacy.rightsIntro"),
      items: [t("privacy.rightsItem1"), t("privacy.rightsItem2"), t("privacy.rightsItem3")],
    },
    { id: "changes", title: t("privacy.changesTitle"), content: t("privacy.changesText") },
    { id: "contact", title: t("privacy.contactTitle"), content: t("privacy.contactText") },
  ];

  return (
    <LegalLayout
      title={t("privacyTitle")}
      lastUpdated={t("lastUpdated", { date: t("updateDate") })}
      contentsLabel={t("contents")}
      sections={sections}
    />
  );
}
