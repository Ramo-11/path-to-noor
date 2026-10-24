import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { auth } from "@/lib/auth-config";
import { getCompletedLessonIds, getTrackPathOutlines } from "@/lib/learning";
import { MUSLIM_PRIMARY_PATH_SLUG } from "@/lib/tracks";
import { Button } from "@/components/primer/Button";
import { PageBanner } from "@/components/primer/PageBanner";
import { ChangeTrack } from "@/components/tracks/ChangeTrack";
import { TrackPathCard } from "@/components/tracks/TrackPathCard";

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

export default async function MuslimPage({ params }: { params: Params }) {
  const { locale } = await params;
  const session = await auth();
  const userId = session?.user?.id;
  const signedIn = Boolean(userId);
  const ctx = { userType: session?.user?.userType, isGuest: !signedIn };

  const completed = await getCompletedLessonIds(userId);
  const entries = await getTrackPathOutlines("muslim", ctx, completed);

  const t = await getTranslations("tracks");

  return (
    <div className="mx-auto w-full max-w-6xl px-4 pb-16 sm:px-6 sm:pb-24 lg:px-8">
      <PageBanner title={t("muslim.title")} lead={t("muslimPage.lead")} art="stage-evening" tone="evening" />

      <ul className="mt-8 grid gap-5 sm:mt-10 md:grid-cols-2 md:gap-6">
        {entries.map(({ slug, path }) => {
          const recommended = slug === MUSLIM_PRIMARY_PATH_SLUG;
          return (
            <li key={slug} className="flex">
              <TrackPathCard
                path={path}
                fallbackTitle={t(recommended ? "muslimPage.deeperTitle" : "muslimPage.walkTitle")}
                locale={locale}
                signedIn={signedIn}
                recommended={recommended}
                headingId={`muslim-path-${slug}`}
              />
            </li>
          );
        })}
      </ul>

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
