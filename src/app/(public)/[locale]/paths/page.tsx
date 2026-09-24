import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { auth } from "@/lib/auth-config";
import { getCompletedLessonIds, getLearnerState, getPathsByStage } from "@/lib/learning";
import { Button } from "@/components/primer/Button";
import { EmptyState } from "@/components/primer/EmptyState";
import { PageIntro } from "@/components/primer/PageIntro";
import { PlacementPrompt } from "@/components/paths/PlacementPrompt";
import { StageBand } from "@/components/paths/StageBand";

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
    getPathsByStage(ctx, completed),
    userId ? getLearnerState(userId, ctx) : Promise.resolve(null),
  ]);

  const t = await getTranslations("paths");
  const learnerStage = learner?.placement?.stage ?? null;
  const hasPaths = groups.some((group) => group.paths.length > 0);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 pb-16 sm:px-6 sm:pb-24 lg:px-8">
      <PageIntro
        title={t("title")}
        lead={t("lead")}
        aside={
          hasPaths ? <PlacementPrompt signedIn={signedIn} serverStage={learnerStage} /> : undefined
        }
      />

      {hasPaths ? (
        groups.map((group) => (
          <StageBand
            key={group.stage}
            stage={group.stage}
            paths={group.paths}
            locale={locale}
            signedIn={signedIn}
            learnerStage={learnerStage}
          />
        ))
      ) : (
        <EmptyState
          title={t("emptyTitle")}
          body={t("emptyBody")}
          action={
            <Button href="/library" variant="secondary">
              {t("openLibrary")}
            </Button>
          }
        />
      )}
    </div>
  );
}
