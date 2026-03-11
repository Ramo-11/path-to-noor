import { getTranslations } from "next-intl/server";
import { Container } from "@/components/layout/Container";
import { AnimateIn } from "@/components/shared/AnimateIn";
import { FileText } from "lucide-react";
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
  await params;
  const t = await getTranslations("legal");
  const lastUpdated = "March 11, 2026";

  const sections = [
    {
      title: t("terms.acceptanceTitle"),
      content: t("terms.acceptanceText"),
    },
    {
      title: t("terms.descriptionTitle"),
      content: t("terms.descriptionText"),
    },
    {
      title: t("terms.accountsTitle"),
      content: t("terms.accountsIntro"),
      items: [
        t("terms.accountsItem1"),
        t("terms.accountsItem2"),
        t("terms.accountsItem3"),
      ],
    },
    {
      title: t("terms.conductTitle"),
      content: t("terms.conductIntro"),
      items: [
        t("terms.conductItem1"),
        t("terms.conductItem2"),
        t("terms.conductItem3"),
        t("terms.conductItem4"),
      ],
    },
    {
      title: t("terms.contentTitle"),
      content: t("terms.contentText"),
    },
    {
      title: t("terms.ipTitle"),
      content: t("terms.ipText"),
    },
    {
      title: t("terms.mentorshipTitle"),
      content: t("terms.mentorshipText"),
    },
    {
      title: t("terms.disclaimerTitle"),
      content: t("terms.disclaimerText"),
    },
    {
      title: t("terms.limitationTitle"),
      content: t("terms.limitationText"),
    },
    {
      title: t("terms.terminationTitle"),
      content: t("terms.terminationText"),
    },
    {
      title: t("terms.changesTitle"),
      content: t("terms.changesText"),
    },
    {
      title: t("terms.contactTitle"),
      content: t("terms.contactText"),
    },
  ];

  return (
    <section className="py-16 sm:py-24">
      <Container size="md">
        <AnimateIn preset="fade-up">
          {/* Header */}
          <div className="mb-12">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary-100 dark:bg-primary-900/30 text-primary-600 mb-6">
              <FileText className="h-7 w-7" />
            </div>
            <h1 className="font-heading text-3xl font-bold sm:text-4xl tracking-tight text-slate-900 dark:text-white">
              {t("termsTitle")}
            </h1>
            <div className="mt-3 decorative-line" />
            <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
              {t("lastUpdated", { date: lastUpdated })}
            </p>
          </div>
        </AnimateIn>

        {/* Content */}
        <AnimateIn preset="fade-up" delay={0.15}>
          <div className="rounded-2xl bg-white dark:bg-slate-900 shadow-sm border border-slate-100 dark:border-slate-800 divide-y divide-slate-100 dark:divide-slate-800">
            {sections.map((section, i) => (
              <div key={i} className="p-6 sm:p-8">
                <h2 className="font-heading text-lg font-semibold text-slate-900 dark:text-white mb-3">
                  {section.title}
                </h2>
                <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                  {section.content}
                </p>
                {section.items && (
                  <ul className="mt-4 space-y-2.5">
                    {section.items.map((item, j) => (
                      <li
                        key={j}
                        className="flex items-start gap-3 text-sm text-slate-600 dark:text-slate-400"
                      >
                        <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary-500 shrink-0" />
                        <span className="leading-relaxed">{item}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </AnimateIn>
      </Container>
    </section>
  );
}
