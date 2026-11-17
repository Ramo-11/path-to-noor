import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { getPathOutlines } from "@/lib/learning";
import { routing } from "@/i18n/routing";
import { StartRegion } from "@/components/placement/StartRegion";
import { buildRecommendations, type Recommendations } from "@/components/placement/recommendations";

export const revalidate = 300;

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

type PageProps = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "start" });
  return {
    title: t("meta.title"),
    description: t("meta.description"),
  };
}

export default async function StartPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  let recommendations: Recommendations | null = null;
  try {
    recommendations = buildRecommendations(await getPathOutlines({ isGuest: true }), locale);
  } catch (error) {
    console.error("[start] Failed to load paths:", error);
  }

  return <StartRegion guestRecommendations={recommendations} />;
}
