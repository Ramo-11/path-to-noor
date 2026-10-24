import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { auth } from "@/lib/auth-config";
import { getCompletedLessonIds, getLearnerState, getPathsByTrack } from "@/lib/learning";
import { TRACKS } from "@/lib/tracks";
import { Button } from "@/components/primer/Button";
import { EmptyState } from "@/components/primer/EmptyState";
import { PageBanner } from "@/components/primer/PageBanner";
import { PlacementPrompt } from "@/components/paths/PlacementPrompt";
import { PathTrackSection } from "@/components/tracks/PathTrackSection";
import { StageGroupBlock } from "@/components/tracks/StageGroupBlock";

type Params = Promise<{ locale: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "paths" });
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
  };
}

export default async function PathsPage({ params }: { params: Params }) {
  const { locale } = await params;
  const session = await auth();
  const userId = session?.user?.id;
  const signedIn = Boolean(session?.user);
  const ctx = { userType: session?.user?.userType, isGuest: !signedIn };

  const completed = await getCompletedLessonIds(userId);
  const [groups, learner] = await Promise.all([
    getPathsByTrack(ctx, completed),
    userId ? getLearnerState(userId, ctx) : Promise.resolve(null),
  ]);

  const [t, tTracks] = await Promise.all([getTranslations("paths"), getTranslations("tracks")]);
  const learnerStage = learner?.placement?.stage ?? null;
  const hasPaths =
    groups.curious.length > 0 ||
    groups.muslim.length > 0 ||
    groups.new.some((group) => group.paths.length > 0);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 pb-16 sm:px-6 sm:pb-24 lg:px-8">
      <PageBanner title={t("title")} lead={t("lead")} art="journey" tone="sky">
        {hasPaths ? (
          <nav aria-label={t("jumpTo")}>
            <ul className="flex flex-wrap gap-2.5">
              {TRACKS.map((track) => (
                <li key={track}>
                  <a
                    href={`#track-${track}`}
                    className="inline-flex min-h-11 items-center rounded-full border border-rule bg-surface px-4 text-[0.9375rem] font-medium text-ink shadow-soft transition-colors duration-150 hover:border-rule-strong hover:bg-wash"
                  >
                    {tTracks(`${track}.title`)}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        ) : null}
      </PageBanner>

      {hasPaths ? (
        <div className="mt-10 sm:mt-14">
          <PathTrackSection track="curious" locale={locale} paths={groups.curious} />
          <PathTrackSection
            track="new"
            locale={locale}
            action={<PlacementPrompt signedIn={signedIn} serverStage={learnerStage} />}
          >
            {groups.new.map((group) => (
              <StageGroupBlock
                key={group.stage}
                stage={group.stage}
                paths={group.paths}
                locale={locale}
                signedIn={signedIn}
                learnerStage={learnerStage}
              />
            ))}
          </PathTrackSection>
          <PathTrackSection track="muslim" locale={locale} paths={groups.muslim} />
        </div>
      ) : (
        <div className="mt-8">
          <EmptyState
            art="lantern"
            title={t("emptyTitle")}
            body={t("emptyBody")}
            action={
              <Button href="/library" variant="secondary">
                {t("openLibrary")}
              </Button>
            }
          />
        </div>
      )}
    </div>
  );
}
