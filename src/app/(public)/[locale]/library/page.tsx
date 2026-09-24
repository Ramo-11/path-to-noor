import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { auth } from "@/lib/auth-config";
import { getPublicTopics } from "@/lib/data";
import { getCompletedLessonIds } from "@/lib/learning";
import { localized } from "@/lib/stages";
import { connectDB } from "@/db/connection";
import { Module } from "@/db/models/Module";
import { User } from "@/db/models/User";
import "@/db/models/Lesson";
import { PageIntro } from "@/components/primer/PageIntro";
import { LibraryBrowser, type LibrarySubjectCard } from "@/components/library/LibraryBrowser";

interface ModuleAudienceContext {
  userType?: string;
  isGuest: boolean;
}

function moduleAudienceFilter(ctx: ModuleAudienceContext) {
  const filter: Record<string, unknown> = { published: true };
  if (ctx.isGuest) {
    filter.guestAccessible = true;
    filter.audience = { $in: ["all", "revert"] };
  } else if (ctx.userType === "revert") {
    filter.audience = { $in: ["all", "revert"] };
  }
  return filter;
}

export default async function LibraryPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations("library");
  const session = await auth();
  const ctx: ModuleAudienceContext = {
    userType: session?.user?.userType,
    isGuest: !session?.user,
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const topics = (await getPublicTopics(ctx)) as any[];
  const rootTopics = topics.filter((topic) => !topic.parent);
  const rootTopicIds = rootTopics.map((topic) => topic._id);

  await connectDB();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const modules = (await Module.find({
    ...moduleAudienceFilter(ctx),
    topics: { $in: rootTopicIds },
  })
    .select("topics lessons")
    .populate({ path: "lessons.lessonId", select: "_id", match: { published: true } })
    .lean()) as any[];

  const lessonCountByTopic = new Map<string, number>();
  for (const mod of modules) {
    const publishedLessonCount = (mod.lessons || []).filter(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (entry: any) => entry.lessonId
    ).length;
    for (const topicId of mod.topics || []) {
      const tid = topicId.toString();
      lessonCountByTopic.set(tid, (lessonCountByTopic.get(tid) || 0) + publishedLessonCount);
    }
  }

  let completedLessonIds = new Set<string>();
  let learnedTopicIds = new Set<string>();
  if (session?.user?.id) {
    completedLessonIds = await getCompletedLessonIds(session.user.id);
    const user = await User.findById(session.user.id).select("completedTopics").lean();
    learnedTopicIds = new Set(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ((user as any)?.completedTopics || []).map((entry: any) => entry.topicId?.toString())
    );
  }

  const completedCountByTopic = new Map<string, number>();
  if (completedLessonIds.size > 0) {
    for (const mod of modules) {
      const completedInModule = (mod.lessons || []).filter(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (entry: any) => entry.lessonId && completedLessonIds.has(entry.lessonId._id.toString())
      ).length;
      for (const topicId of mod.topics || []) {
        const tid = topicId.toString();
        completedCountByTopic.set(tid, (completedCountByTopic.get(tid) || 0) + completedInModule);
      }
    }
  }

  const subjects: LibrarySubjectCard[] = rootTopics.map((topic) => {
    const id = topic._id.toString();
    return {
      id,
      slug: topic.slug,
      name: localized(topic.name, locale),
      description: localized(topic.description, locale),
      lessonCount: lessonCountByTopic.get(id) || 0,
      completedCount: completedCountByTopic.get(id) || 0,
      isLearned: learnedTopicIds.has(id),
    };
  });

  return (
    <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
      <PageIntro
        title={t("title")}
        lead={
          <>
            {t("lead")}{" "}
            <Link
              href="/start"
              className="text-ink underline decoration-rule-strong underline-offset-[0.25em] hover:decoration-ink"
            >
              {t("findStart")}
            </Link>
          </>
        }
      />
      <div className="pb-16 sm:pb-24">
        <LibraryBrowser subjects={subjects} signedIn={Boolean(session?.user)} />
      </div>
    </div>
  );
}
