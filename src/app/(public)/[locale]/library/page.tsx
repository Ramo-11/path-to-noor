import { getTranslations, setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { TrackPrimaryLink } from "@/components/tracks/TrackPrimaryLink";
import { PageBanner } from "@/components/primer/PageBanner";
import { LibraryRegion } from "@/components/library/LibraryRegion";
import { buildLibrarySubjects } from "@/components/library/library-data";
import type { LibrarySubjectCard } from "@/components/library/library-types";

export const revalidate = 300;

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LibraryPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("library");

  let subjects: LibrarySubjectCard[] = [];
  try {
    subjects = await buildLibrarySubjects({ isGuest: true }, locale);
  } catch (error) {
    console.error("[library] Failed to load subjects:", error);
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
      <PageBanner title={t("title")} lead={t("lead")} art="lib-pillars" tone="dawn">
        <TrackPrimaryLink />
      </PageBanner>
      <div className="pt-10 pb-16 sm:pt-12 sm:pb-24">
        <LibraryRegion subjects={subjects} />
      </div>
    </div>
  );
}
