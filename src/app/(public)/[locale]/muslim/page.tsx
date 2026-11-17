import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { getTrackPathOutlines } from "@/lib/learning";
import { TRACK_PATH_SLUGS } from "@/lib/tracks";
import { routing } from "@/i18n/routing";
import { Button } from "@/components/primer/Button";
import { PageBanner } from "@/components/primer/PageBanner";
import { ChangeTrack } from "@/components/tracks/ChangeTrack";
import { MuslimPaths, type MuslimEntry } from "@/components/tracks/MuslimPaths";

export const revalidate = 300;

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

type Params = Promise<{ locale: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "tracks.muslimPage" });
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
    alternates: {
      canonical: `/${locale}/muslim`,
      languages: { en: "/en/muslim", ar: "/ar/muslim", es: "/es/muslim" },
    },
  };
}

async function loadGuestEntries(): Promise<MuslimEntry[]> {
  try {
    return await getTrackPathOutlines("muslim", { isGuest: true });
  } catch (error) {
    console.error("[muslim] Failed to load paths:", error);
    return TRACK_PATH_SLUGS.muslim.map((slug) => ({ slug, path: null }));
  }
}

export default async function MuslimPage({ params }: { params: Params }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const guestEntries = await loadGuestEntries();
  const t = await getTranslations("tracks");

  return (
    <div className="mx-auto w-full max-w-6xl px-4 pb-16 sm:px-6 sm:pb-24 lg:px-8">
      <PageBanner title={t("muslim.title")} lead={t("muslimPage.lead")} art="stage-evening" tone="evening" />

      <MuslimPaths slugs={TRACK_PATH_SLUGS.muslim} guestEntries={guestEntries} />

      <div className="mt-8 flex flex-col items-start gap-1 sm:mt-10">
        <Button href="/contact?topic=question" variant="quiet">
          {t("ask")}
        </Button>
        <Button href="/mentor/volunteer" variant="quiet">
          {t("muslimPage.volunteer")}
        </Button>
        <ChangeTrack variant="notYou" />
      </div>
    </div>
  );
}
