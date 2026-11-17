import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { getTrackPathOutlines } from "@/lib/learning";
import { routing } from "@/i18n/routing";
import { PageBanner } from "@/components/primer/PageBanner";
import { CuriousActions, CuriousOutline } from "@/components/tracks/CuriousRegions";

export const revalidate = 300;

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

type Params = Promise<{ locale: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "tracks.curiousPage" });
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
    alternates: {
      canonical: `/${locale}/curious`,
      languages: { en: "/en/curious", ar: "/ar/curious", es: "/es/curious" },
    },
  };
}

async function loadGuestPath() {
  try {
    const [entry] = await getTrackPathOutlines("curious", { isGuest: true });
    return entry?.path && entry.path.totalLessons > 0 ? entry.path : null;
  } catch (error) {
    console.error("[curious] Failed to load path:", error);
    return null;
  }
}

export default async function CuriousPage({ params }: { params: Params }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const guestPath = await loadGuestPath();
  const t = await getTranslations("tracks");

  return (
    <div className="mx-auto w-full max-w-6xl px-4 pb-16 sm:px-6 sm:pb-24 lg:px-8">
      <PageBanner title={t("curious.title")} lead={t("curiousPage.lead")} art="lib-questions" tone="sky">
        <CuriousActions guestPath={guestPath} askLabel={t("ask")} />
      </PageBanner>
      <CuriousOutline guestPath={guestPath} />
    </div>
  );
}
