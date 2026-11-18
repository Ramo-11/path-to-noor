import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { getPathsByTrack, type TrackGroups } from "@/lib/learning";
import { routing } from "@/i18n/routing";
import { PathsList } from "@/components/paths/PathsList";

export const revalidate = 300;

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

type Params = Promise<{ locale: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "paths" });
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
  };
}

const EMPTY: TrackGroups = { curious: [], new: [], muslim: [] };

export default async function PathsPage({ params }: { params: Params }) {
  const { locale } = await params;
  setRequestLocale(locale);

  let groups = EMPTY;
  try {
    groups = await getPathsByTrack({ isGuest: true });
  } catch (error) {
    console.error("[paths] Failed to load paths:", error);
  }

  return <PathsList guestGroups={groups} />;
}
