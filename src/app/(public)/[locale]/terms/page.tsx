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
    title: t("termsTitle"),
    description: t("termsDescription"),
  };
}

export default async function TermsOfServicePage({
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
            {t("termsTitle")}
          </h1>
          <div className="mt-3 decorative-line" />
          <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
            {t("lastUpdated", { date: lastUpdated })}
          </p>
        </div>

        <div className="prose prose-slate dark:prose-invert max-w-none prose-headings:font-heading prose-headings:tracking-tight prose-h2:text-xl prose-h2:mt-10 prose-h2:mb-4 prose-p:leading-relaxed prose-li:leading-relaxed">
          <h2>{t("terms.acceptanceTitle")}</h2>
          <p>{t("terms.acceptanceText")}</p>

          <h2>{t("terms.descriptionTitle")}</h2>
          <p>{t("terms.descriptionText")}</p>

          <h2>{t("terms.accountsTitle")}</h2>
          <p>{t("terms.accountsIntro")}</p>
          <ul>
            <li>{t("terms.accountsItem1")}</li>
            <li>{t("terms.accountsItem2")}</li>
            <li>{t("terms.accountsItem3")}</li>
          </ul>

          <h2>{t("terms.conductTitle")}</h2>
          <p>{t("terms.conductIntro")}</p>
          <ul>
            <li>{t("terms.conductItem1")}</li>
            <li>{t("terms.conductItem2")}</li>
            <li>{t("terms.conductItem3")}</li>
            <li>{t("terms.conductItem4")}</li>
          </ul>

          <h2>{t("terms.contentTitle")}</h2>
          <p>{t("terms.contentText")}</p>

          <h2>{t("terms.ipTitle")}</h2>
          <p>{t("terms.ipText")}</p>

          <h2>{t("terms.mentorshipTitle")}</h2>
          <p>{t("terms.mentorshipText")}</p>

          <h2>{t("terms.disclaimerTitle")}</h2>
          <p>{t("terms.disclaimerText")}</p>

          <h2>{t("terms.limitationTitle")}</h2>
          <p>{t("terms.limitationText")}</p>

          <h2>{t("terms.terminationTitle")}</h2>
          <p>{t("terms.terminationText")}</p>

          <h2>{t("terms.changesTitle")}</h2>
          <p>{t("terms.changesText")}</p>

          <h2>{t("terms.contactTitle")}</h2>
          <p>{t("terms.contactText")}</p>
        </div>
      </Container>
    </section>
  );
}
