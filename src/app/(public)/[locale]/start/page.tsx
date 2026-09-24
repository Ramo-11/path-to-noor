import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { auth } from "@/lib/auth-config";
import { getCompletedLessonIds, getLearnerState, getPathOutlines } from "@/lib/learning";
import { PlacementFlow } from "@/components/placement/PlacementFlow";
import { buildRecommendations } from "@/components/placement/recommendations";

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
  const session = await auth();
  const userId = session?.user?.id;
  const ctx = { userType: session?.user?.userType, isGuest: !session?.user };

  const [stateResult, outlinesResult] = await Promise.allSettled([
    userId ? getLearnerState(userId, ctx) : Promise.resolve(null),
    getCompletedLessonIds(userId).then((completed) => getPathOutlines(ctx, completed)),
  ]);

  if (stateResult.status === "rejected") {
    console.error("[start] Failed to load learner state:", stateResult.reason);
  }
  if (outlinesResult.status === "rejected") {
    console.error("[start] Failed to load paths:", outlinesResult.reason);
  }

  const savedStage =
    stateResult.status === "fulfilled" ? (stateResult.value?.placement?.stage ?? null) : null;
  const recommendations =
    outlinesResult.status === "fulfilled" ? buildRecommendations(outlinesResult.value, locale) : null;

  return (
    <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
      <PlacementFlow
        recommendations={recommendations}
        savedStage={savedStage}
        isSignedIn={Boolean(userId)}
      />
    </div>
  );
}
