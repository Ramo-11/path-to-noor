import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { PageBanner } from "@/components/primer/PageBanner";
import { Button } from "@/components/primer/Button";
import { VolunteerView } from "@/components/mentor/VolunteerView";

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
  const t = await getTranslations({ locale, namespace: "volunteer" });
  return { title: t("metaTitle"), description: t("metaDescription") };
}

export default async function VolunteerPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("volunteer");
  const callback = encodeURIComponent(`/${locale}/mentor/volunteer`);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
      <PageBanner title={t("title")} lead={t("lead")} art="mentor" tone="evening" />
      <div className="flex flex-col gap-6 pt-10 pb-24">
        <VolunteerView
          guest={
            <div className="card max-w-2xl p-6 sm:p-8">
              <div className="flex flex-col items-start gap-4">
                <p className="text-ink-2 text-pretty">{t("intro")}</p>
                <h2 className="text-heading font-semibold">{t("signInTitle")}</h2>
                <p className="text-ink-2">{t("signInBody")}</p>
                <div className="flex flex-wrap gap-3">
                  <Button href={`/login?callbackUrl=${callback}`} variant="primary" size="lg">
                    {t("signInCta")}
                  </Button>
                  <Button href={`/register?callbackUrl=${callback}`} variant="secondary" size="lg">
                    {t("createAccountCta")}
                  </Button>
                </div>
              </div>
            </div>
          }
        />
      </div>
    </div>
  );
}
