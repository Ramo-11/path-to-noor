import { getTranslations } from "next-intl/server";
import { Container } from "@/components/layout/Container";
import type { Metadata } from "next";

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
  const { locale } = await params;
  const t = await getTranslations("legal");
  const lastUpdated = "March 11, 2026";

  return (
    <section className="py-16 sm:py-24">
      <Container size="md">
        <div className="mb-10">
          <h1 className="font-heading text-3xl font-bold sm:text-4xl tracking-tight text-slate-900 dark:text-white">
            {t("privacyTitle")}
          </h1>
          <div className="mt-3 decorative-line" />
          <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
            {t("lastUpdated", { date: lastUpdated })}
          </p>
        </div>

        <div className="prose prose-slate dark:prose-invert max-w-none prose-headings:font-heading prose-headings:tracking-tight prose-h2:text-xl prose-h2:mt-10 prose-h2:mb-4 prose-p:leading-relaxed prose-li:leading-relaxed">
          <h2>{t("privacy.introTitle")}</h2>
          <p>{t("privacy.introText")}</p>

          <h2>{t("privacy.collectTitle")}</h2>
          <p>{t("privacy.collectIntro")}</p>
          <ul>
            <li>{t("privacy.collectItem1")}</li>
            <li>{t("privacy.collectItem2")}</li>
            <li>{t("privacy.collectItem3")}</li>
            <li>{t("privacy.collectItem4")}</li>
          </ul>

          <h2>{t("privacy.useTitle")}</h2>
          <p>{t("privacy.useIntro")}</p>
          <ul>
            <li>{t("privacy.useItem1")}</li>
            <li>{t("privacy.useItem2")}</li>
            <li>{t("privacy.useItem3")}</li>
            <li>{t("privacy.useItem4")}</li>
          </ul>

          <h2>{t("privacy.sharingTitle")}</h2>
          <p>{t("privacy.sharingText")}</p>

          <h2>{t("privacy.cookiesTitle")}</h2>
          <p>{t("privacy.cookiesText")}</p>

          <h2>{t("privacy.securityTitle")}</h2>
          <p>{t("privacy.securityText")}</p>

          <h2>{t("privacy.childrenTitle")}</h2>
          <p>{t("privacy.childrenText")}</p>

          <h2>{t("privacy.rightsTitle")}</h2>
          <p>{t("privacy.rightsIntro")}</p>
          <ul>
            <li>{t("privacy.rightsItem1")}</li>
            <li>{t("privacy.rightsItem2")}</li>
            <li>{t("privacy.rightsItem3")}</li>
          </ul>

          <h2>{t("privacy.changesTitle")}</h2>
          <p>{t("privacy.changesText")}</p>

          <h2>{t("privacy.contactTitle")}</h2>
          <p>{t("privacy.contactText")}</p>
        </div>
      </Container>
    </section>
  );
}
