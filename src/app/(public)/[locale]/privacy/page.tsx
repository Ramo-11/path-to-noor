import { getTranslations } from "next-intl/server";
import { Container } from "@/components/layout/Container";
import { AnimateIn } from "@/components/shared/AnimateIn";
import { Shield } from "lucide-react";
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
  await params;
  const t = await getTranslations("legal");
  const lastUpdated = "March 11, 2026";

  const sections = [
    {
      title: t("privacy.introTitle"),
      content: t("privacy.introText"),
    },
    {
      title: t("privacy.collectTitle"),
      content: t("privacy.collectIntro"),
      items: [
        t("privacy.collectItem1"),
        t("privacy.collectItem2"),
        t("privacy.collectItem3"),
        t("privacy.collectItem4"),
      ],
    },
    {
      title: t("privacy.useTitle"),
      content: t("privacy.useIntro"),
      items: [
        t("privacy.useItem1"),
        t("privacy.useItem2"),
        t("privacy.useItem3"),
        t("privacy.useItem4"),
      ],
    },
    {
      title: t("privacy.sharingTitle"),
      content: t("privacy.sharingText"),
    },
    {
      title: t("privacy.cookiesTitle"),
      content: t("privacy.cookiesText"),
    },
    {
      title: t("privacy.securityTitle"),
      content: t("privacy.securityText"),
    },
    {
      title: t("privacy.childrenTitle"),
      content: t("privacy.childrenText"),
    },
    {
      title: t("privacy.rightsTitle"),
      content: t("privacy.rightsIntro"),
      items: [
        t("privacy.rightsItem1"),
        t("privacy.rightsItem2"),
        t("privacy.rightsItem3"),
      ],
    },
    {
      title: t("privacy.changesTitle"),
      content: t("privacy.changesText"),
    },
    {
      title: t("privacy.contactTitle"),
      content: t("privacy.contactText"),
    },
  ];

  return (
    <section className="py-16 sm:py-24">
      <Container size="md">
        <AnimateIn preset="fade-up">
          {/* Header */}
          <div className="mb-12">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary-100 dark:bg-primary-900/30 text-primary-600 mb-6">
              <Shield className="h-7 w-7" />
            </div>
            <h1 className="font-heading text-3xl font-bold sm:text-4xl tracking-tight text-slate-900 dark:text-white">
              {t("privacyTitle")}
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
