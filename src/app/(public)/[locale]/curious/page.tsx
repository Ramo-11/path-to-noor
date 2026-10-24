import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { auth } from "@/lib/auth-config";
import { getCompletedLessonIds, getTrackPathOutlines } from "@/lib/learning";
import { Button } from "@/components/primer/Button";
import { PageBanner } from "@/components/primer/PageBanner";
import { ChangeTrack } from "@/components/tracks/ChangeTrack";
import { TrackAction } from "@/components/tracks/TrackAction";
import { TrackPathOutline } from "@/components/tracks/TrackPathOutline";
import { TrackPreparing } from "@/components/tracks/TrackPreparing";

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

export default async function CuriousPage({ params }: { params: Params }) {
  const { locale } = await params;
  const session = await auth();
  const userId = session?.user?.id;
  const signedIn = Boolean(userId);
  const ctx = { userType: session?.user?.userType, isGuest: !signedIn };

  const completed = await getCompletedLessonIds(userId);
  const [entry] = await getTrackPathOutlines("curious", ctx, completed);
  const path = entry?.path && entry.path.totalLessons > 0 ? entry.path : null;

  const t = await getTranslations("tracks");

  return (
    <div className="mx-auto w-full max-w-6xl px-4 pb-16 sm:px-6 sm:pb-24 lg:px-8">
      <PageBanner title={t("curious.title")} lead={t("curiousPage.lead")} art="lib-questions" tone="sky">
        {path ? <TrackAction path={path} signedIn={signedIn} /> : null}
        <div className={`flex flex-col items-start gap-1 ${path ? "mt-5" : ""}`}>
          <Button href="/contact?topic=question" variant="quiet">
            {t("ask")}
          </Button>
          <ChangeTrack variant="notYou" />
        </div>
      </PageBanner>

      {path ? (
        <TrackPathOutline path={path} locale={locale} signedIn={signedIn} />
      ) : (
        <div className="mx-auto mt-10 max-w-xl sm:mt-14">
          <TrackPreparing compact />
        </div>
      )}
    </div>
  );
}
