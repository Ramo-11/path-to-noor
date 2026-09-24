import { getTranslations } from "next-intl/server";
import { auth } from "@/lib/auth-config";
import { connectDB } from "@/db/connection";
import { User } from "@/db/models/User";
import { Lesson } from "@/db/models/Lesson";
import { MentorRequest } from "@/db/models/MentorRequest";
import { getLearnerState } from "@/lib/learning";
import type { LocalizedText, StageKey } from "@/lib/stages";
import { Button } from "@/components/primer/Button";
import { EmptyState } from "@/components/primer/EmptyState";
import { Notice } from "@/components/primer/Notice";
import { PageBanner, type BannerTone } from "@/components/primer/PageBanner";
import { StageBlock } from "@/components/journey/StageBlock";
import { ContinueBlock } from "@/components/journey/ContinueBlock";
import { PathRows } from "@/components/journey/PathRows";
import { RecentRows, type RecentItem } from "@/components/journey/RecentRows";
import { QuickLinksRow, type MentorStatus } from "@/components/journey/QuickLinksRow";

interface LeanProgressEntry {
  lessonId: unknown;
  completedAt: Date;
}

interface LeanUserDoc {
  progress?: LeanProgressEntry[];
  bookmarks?: unknown[];
  quizResults?: unknown[];
}

interface LeanLessonDoc {
  _id: unknown;
  title: LocalizedText;
  slug: string;
}

interface LeanMentorRequestDoc {
  status: "pending" | "assigned";
}

const BANNER_TONE: Record<StageKey, BannerTone> = {
  beginning: "dawn",
  foundations: "day",
  deeper: "evening",
};

export default async function JourneyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations("journey");
  const session = await auth();

  if (!session?.user?.id) {
    return (
      <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
        <EmptyState
          art="journey"
          title={t("guestTitle")}
          body={t("guestBody")}
          action={
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Button href="/login" variant="primary">
                {t("signIn")}
              </Button>
              <Button href="/register" variant="secondary">
                {t("createAccount")}
              </Button>
              <Button href="/start" variant="quiet">
                {t("findStart")}
              </Button>
            </div>
          }
        />
      </div>
    );
  }

  const tStages = await getTranslations("stages");
  const tLearning = await getTranslations("learning");
  const tCommon = await getTranslations("common");

  try {
    const ctx = { userType: session.user.userType, isGuest: false };
    const state = await getLearnerState(session.user.id, ctx);

    await connectDB();
    const userDoc = (await User.findById(session.user.id)
      .select("progress bookmarks quizResults")
      .lean()) as LeanUserDoc | null;

    const progress = userDoc?.progress ?? [];
    const savedCount = userDoc?.bookmarks?.length ?? 0;
    const quizCount = userDoc?.quizResults?.length ?? 0;

    const recentProgress = [...progress]
      .sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime())
      .slice(0, 5);
    const recentLessonIds = recentProgress.map((entry) => String(entry.lessonId));
    const recentLessons = recentLessonIds.length
      ? ((await Lesson.find({ _id: { $in: recentLessonIds } })
          .select("title slug")
          .lean()) as LeanLessonDoc[])
      : [];
    const lessonMap = new Map(recentLessons.map((lesson) => [String(lesson._id), lesson]));
    const recentItems: RecentItem[] = recentProgress.reduce<RecentItem[]>((acc, entry) => {
      const lesson = lessonMap.get(String(entry.lessonId));
      if (lesson) {
        acc.push({ slug: lesson.slug, title: lesson.title, completedAt: entry.completedAt });
      }
      return acc;
    }, []);

    const mentorRequest = (await MentorRequest.findOne({
      revertId: session.user.id,
      status: { $in: ["pending", "assigned"] },
    })
      .select("status")
      .lean()) as LeanMentorRequestDoc | null;
    const mentorStatus: MentorStatus = mentorRequest?.status ?? "none";

    const trimmedName = (session.user.name ?? "").trim();
    const firstName = trimmedName ? trimmedName.split(/\s+/)[0] : trimmedName;
    const bannerStage = state.currentPath?.stage ?? state.placement?.stage ?? null;
    const bannerTone: BannerTone = bannerStage ? BANNER_TONE[bannerStage] : "sky";

    return (
      <div className="mx-auto w-full max-w-6xl px-4 pb-16 sm:px-6 sm:pb-24 lg:px-8">
        <PageBanner title={t("greeting", { name: firstName })} art="journey" tone={bannerTone} />

        <div className="mt-8 grid gap-5 sm:mt-10 lg:grid-cols-2 lg:gap-6">
          <StageBlock placement={state.placement} t={t} tStages={tStages} />
          <ContinueBlock state={state} locale={locale} t={t} tLearning={tLearning} tStages={tStages} />
        </div>

        {state.startedPaths.length > 0 ? (
          <section className="mt-10 sm:mt-14">
            <h2 className="mb-5 text-heading font-semibold">{t("yourPaths")}</h2>
            <PathRows paths={state.startedPaths} locale={locale} />
          </section>
        ) : null}

        <section className="mt-10 sm:mt-14">
          <h2 className="mb-5 text-heading font-semibold">{t("recentlyDone")}</h2>
          <RecentRows items={recentItems} locale={locale} t={t} />
        </section>

        <section className="mt-10 sm:mt-14">
          <QuickLinksRow savedCount={savedCount} quizCount={quizCount} mentorStatus={mentorStatus} t={t} />
        </section>

        <div className="mt-10 sm:mt-14">
          <Button href="/settings" variant="quiet">
            {t("settingsLink")}
          </Button>
        </div>
      </div>
    );
  } catch (error) {
    console.error("[journey] failed to load learner state", error);
    return (
      <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
        <Notice tone="error">
          <p>{tCommon("error")}</p>
        </Notice>
        <div className="mt-4">
          <Button href="/journey" variant="quiet">
            {tCommon("tryAgain")}
          </Button>
        </div>
      </div>
    );
  }
}
