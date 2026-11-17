import type { Metadata } from "next";
import { cache } from "react";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { connectDB } from "@/db/connection";
import { LearningPath } from "@/db/models/LearningPath";
import { getPathOutlineBySlug } from "@/lib/learning";
import { localized } from "@/lib/stages";
import { PathJourneyRegion } from "@/components/paths/PathJourneyRegion";
import { OG_LOCALES } from "@/components/feedback/og-locale";

export const revalidate = 300;

export function generateStaticParams() {
  return [];
}

type Params = Promise<{ locale: string; slug: string }>;

const loadPath = cache(async (slug: string) => {
  const guest = await getPathOutlineBySlug(slug, new Set(), { isGuest: true });
  if (guest) return { guest, exists: true };
  await connectDB();
  const exists = Boolean(await LearningPath.exists({ published: true, slug }));
  return { guest: null, exists };
});

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { locale, slug } = await params;
  const { guest, exists } = await loadPath(slug);
  if (!guest) {
    const t = await getTranslations({ locale, namespace: "paths" });
    return exists
      ? { title: t("title"), robots: { index: false, follow: false } }
      : { title: t("notFoundTitle") };
  }
  const title = localized(guest.title, locale);
  const description = localized(guest.description, locale) || undefined;
  return {
    title,
    description,
    alternates: {
      canonical: `/${locale}/paths/${slug}`,
      languages: { en: `/en/paths/${slug}`, ar: `/ar/paths/${slug}`, es: `/es/paths/${slug}` },
    },
    openGraph: {
      type: "website",
      title,
      description,
      url: `/${locale}/paths/${slug}`,
      siteName: "Basmet Dawah",
      locale: OG_LOCALES[locale] ?? OG_LOCALES.en,
    },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function PathJourneyPage({ params }: { params: Params }) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const { guest, exists } = await loadPath(slug);
  if (!exists) notFound();

  return <PathJourneyRegion slug={slug} guestPath={guest} />;
}
