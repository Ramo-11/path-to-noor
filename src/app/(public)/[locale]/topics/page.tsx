import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { getPublicTopics } from "@/lib/data";
import { auth } from "@/lib/auth-config";
import { Container } from "@/components/layout/Container";
import {
  AnimateIn,
  StaggerContainer,
  StaggerItem,
} from "@/components/shared/AnimateIn";
import { TopicIconPublic } from "@/components/shared/TopicIconPublic";
import { CheckCircle2 } from "lucide-react";

export default async function TopicsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations("topics");
  const tPaths = await getTranslations("paths");
  const tLearning = await getTranslations("learning");
  const session = await auth();
  const topics = await getPublicTopics({
    userType: session?.user?.userType,
    isGuest: !session?.user,
  });

  // Only show root topics (no parent)
  const rootTopics = topics.filter((topic: any) => !topic.parent);

  // Fetch user progress and lesson counts per topic
  let completedTopicIds = new Set<string>();
  let completedLessonIds = new Set<string>();
  // Map of topicId -> { total: number, completed: number }
  const topicProgress = new Map<string, { total: number; completed: number }>();

  if (session?.user?.id) {
    const { User } = await import("@/db/models/User");
    const { Module } = await import("@/db/models/Module");
    const { connectDB } = await import("@/db/connection");
    await connectDB();

    const user = await User.findById(session.user.id)
      .select("completedTopics progress")
      .lean();
    if (user) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const userAny = user as any;
      completedTopicIds = new Set(
        userAny.completedTopics?.map((ct: any) => ct.topicId?.toString()) || []
      );
      completedLessonIds = new Set(
        userAny.progress?.map((p: any) => p.lessonId?.toString()) || []
      );
    }

    // Fetch all published modules for root topics with their lesson IDs
    const rootTopicIds = rootTopics.map((t: any) => t._id);
    const modules = await Module.find({
      topics: { $in: rootTopicIds },
      published: true,
    })
      .populate({
        path: "lessons.lessonId",
        select: "_id",
        match: { published: true },
      })
      .select("topics lessons")
      .lean();

    // Compute lesson counts per topic
    for (const mod of modules as any[]) {
      const lessonIds = (mod.lessons || [])
        .filter((l: any) => l.lessonId)
        .map((l: any) => l.lessonId._id.toString());

      for (const topicId of mod.topics || []) {
        const tid = topicId.toString();
        const existing = topicProgress.get(tid) || { total: 0, completed: 0 };
        existing.total += lessonIds.length;
        existing.completed += lessonIds.filter((id: string) =>
          completedLessonIds.has(id)
        ).length;
        topicProgress.set(tid, existing);
      }
    }
  }

  return (
    <section className="py-16 sm:py-24">
      <Container>
        <AnimateIn preset="fade-up" className="text-center mb-16">
          <h1 className="font-heading text-3xl font-bold sm:text-4xl tracking-tight text-slate-900 dark:text-white">
            {t("title")}
          </h1>
          <div className="mt-3 decorative-line-center" />
          <p className="mt-6 max-w-2xl mx-auto text-lg leading-relaxed text-slate-600 dark:text-slate-400">
            {t("subtitle")}
          </p>
        </AnimateIn>

        {rootTopics.length === 0 ? (
          <p className="text-center text-slate-500 dark:text-slate-400 py-12">
            {t("noTopics")}
          </p>
        ) : (
          <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {rootTopics.map((topic: any) => {
              const topicId = topic._id.toString();
              const isCompleted = completedTopicIds.has(topicId);
              const progress = topicProgress.get(topicId);
              const hasProgress = progress && progress.total > 0;
              const progressPercent = hasProgress
                ? Math.round((progress.completed / progress.total) * 100)
                : 0;

              return (
                <StaggerItem key={topicId}>
                  <Link href={`/topics/${topic.slug}`} className="block group">
                    <div className={`card-hover rounded-2xl bg-white dark:bg-slate-900 shadow-sm border p-6 h-full flex flex-col ${
                      isCompleted
                        ? "border-emerald-200 dark:border-emerald-800/50"
                        : "border-slate-100 dark:border-slate-800"
                    }`}>
                      <div className="flex items-start justify-between gap-3 mb-2">
                        {topic.icon && (
                          <TopicIconPublic name={topic.icon} />
                        )}
                        {session?.user && isCompleted && (
                          <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 px-2 py-0.5 rounded-full shrink-0">
                            <CheckCircle2 className="h-3 w-3" />
                            {tLearning("completed")}
                          </span>
                        )}
                      </div>
                      <h2 className="font-heading text-lg font-semibold text-slate-900 dark:text-white mb-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                        {(topic.name as any)[locale] || topic.name.en}
                      </h2>
                      <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400 line-clamp-3">
                        {(topic.description as any)[locale] ||
                          topic.description.en}
                      </p>

                      {/* Lesson progress */}
                      {session?.user && hasProgress && !isCompleted && (
                        <div className="mt-auto pt-4">
                          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1.5">
                            <span>
                              {tPaths("lessonsCompleted", {
                                completed: progress.completed,
                                total: progress.total,
                              })}
                            </span>
                          </div>
                          <div className="h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-500 ${
                                progressPercent === 100
                                  ? "bg-emerald-500"
                                  : "bg-primary-500"
                              }`}
                              style={{ width: `${progressPercent}%` }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </Link>
                </StaggerItem>
              );
            })}
          </StaggerContainer>
        )}
      </Container>
    </section>
  );
}
