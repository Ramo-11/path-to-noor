import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { Link } from "@/i18n/navigation";
import {
  getPublicTopicBySlug,
  getPublicSubtopics,
  getPublicModulesByTopic,
} from "@/lib/data";
import { auth } from "@/lib/auth-config";
import { Container } from "@/components/layout/Container";
import {
  AnimateIn,
  StaggerContainer,
  StaggerItem,
} from "@/components/shared/AnimateIn";
import {
  BookOpen,
  FolderOpen,
  ArrowLeft,
  ArrowRight,
  Clock,
  FileText,
  CheckCircle,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";
import { TopicIconPublic } from "@/components/shared/TopicIconPublic";
import { TopicCompletionButton } from "@/components/shared/TopicCompletionButton";
import { User } from "@/db/models/User";
import { connectDB } from "@/db/connection";

export default async function TopicDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const t = await getTranslations("topics");
  const tLearning = await getTranslations("learning");
  const tCommon = await getTranslations("common");

  const topic = await getPublicTopicBySlug(slug);
  if (!topic) notFound();

  const session = await auth();
  const audienceCtx = {
    userType: session?.user?.userType,
    isGuest: !session?.user,
  };

  const topicAny = topic as any;
  const subtopics = await getPublicSubtopics(topicAny._id.toString(), audienceCtx);
  const modules = await getPublicModulesByTopic(topicAny._id.toString(), audienceCtx);

  // Fetch user's completed topics and lesson progress
  let completedTopicIds = new Set<string>();
  let completedLessonIds = new Set<string>();
  if (session?.user?.id) {
    await connectDB();
    const user = await User.findById(session.user.id).select("completedTopics progress").lean();
    if (user) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const userAny = user as any;
      completedTopicIds = new Set(userAny.completedTopics?.map((ct: any) => ct.topicId?.toString()) || []);
      completedLessonIds = new Set(userAny.progress?.map((p: any) => p.lessonId?.toString()) || []);
    }
  }

  const BackArrow = locale === "ar" ? ArrowRight : ArrowLeft;

  return (
    <section className="py-16 sm:py-24">
      <Container>
        {/* Back link */}
        <AnimateIn preset="fade-in">
          <Link
            href="/topics"
            className="inline-flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors mb-8"
          >
            <BackArrow className="h-4 w-4" />
            {tCommon("back")}
          </Link>
        </AnimateIn>

        {/* Topic header */}
        <AnimateIn preset="fade-up" className="mb-16">
          <div className="flex items-start gap-4">
            {topicAny.icon && (
              <TopicIconPublic name={topicAny.icon} size="lg" />
            )}
            <div>
              <h1 className="font-heading text-3xl font-bold sm:text-4xl tracking-tight text-slate-900 dark:text-white">
                {topicAny.name[locale] || topicAny.name.en}
              </h1>
              <div className="mt-3 decorative-line" />
              <p className="mt-4 max-w-3xl text-lg leading-relaxed text-slate-600 dark:text-slate-400">
                {topicAny.description[locale] || topicAny.description.en}
              </p>
              {session?.user && (
                <div className="mt-4">
                  <TopicCompletionButton
                    topicId={topicAny._id.toString()}
                    initialCompleted={completedTopicIds.has(topicAny._id.toString())}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Parent breadcrumb */}
          {topicAny.parent && (
            <div className="mt-4 ms-18">
              <Link
                href={`/topics/${topicAny.parent.slug}`}
                className="text-sm text-primary-600 dark:text-primary-400 hover:underline"
              >
                {topicAny.parent.name[locale] || topicAny.parent.name.en}
              </Link>
            </div>
          )}
        </AnimateIn>

        {/* Subtopics section */}
        {subtopics.length > 0 && (
          <div className="mb-16">
            <AnimateIn preset="fade-up">
              <h2 className="font-heading text-2xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-3">
                <FolderOpen className="h-6 w-6 text-primary-600" />
                {t("subtopics")}
              </h2>
            </AnimateIn>

            <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {subtopics.map((sub: any) => (
                <StaggerItem key={sub._id.toString()}>
                  <Link
                    href={`/topics/${sub.slug}`}
                    className="block group"
                  >
                    <div className="card-hover rounded-2xl bg-white dark:bg-slate-900 shadow-sm border border-slate-100 dark:border-slate-800 p-6 h-full">
                      <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-accent-50 dark:bg-accent-900/20 text-accent-600 dark:text-accent-400 mb-3">
                        <FolderOpen className="h-5 w-5" />
                      </div>
                      <h3 className="font-heading text-lg font-semibold text-slate-900 dark:text-white mb-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                        {sub.name[locale] || sub.name.en}
                      </h3>
                      <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400 line-clamp-2">
                        {sub.description[locale] || sub.description.en}
                      </p>
                    </div>
                  </Link>
                </StaggerItem>
              ))}
            </StaggerContainer>
          </div>
        )}

        {/* Modules section */}
        {modules.length > 0 && (
          <div>
            <AnimateIn preset="fade-up">
              <h2 className="font-heading text-2xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-3">
                <BookOpen className="h-6 w-6 text-primary-600" />
                {t("modules")}
              </h2>
            </AnimateIn>

            <StaggerContainer className="space-y-6">
              {modules.map((mod: any) => {
                const sortedLessons = (mod.lessons || [])
                  .filter((l: any) => l.lessonId)
                  .sort((a: any, b: any) => a.order - b.order);
                const lessonCount = sortedLessons.length;
                const totalMinutes = sortedLessons.reduce(
                  (sum: number, l: any) =>
                    sum + (l.lessonId?.estimatedMinutes || 0),
                  0
                );
                const completedCount = session?.user
                  ? sortedLessons.filter((l: any) =>
                      completedLessonIds.has(l.lessonId._id.toString())
                    ).length
                  : 0;
                const moduleComplete = lessonCount > 0 && completedCount === lessonCount;
                const GoArrow = locale === "ar" ? ChevronLeft : ChevronRight;

                return (
                  <StaggerItem key={mod._id.toString()}>
                    <div className="rounded-2xl bg-white dark:bg-slate-900 shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
                      {/* Module header */}
                      <div className="p-6 border-b border-slate-100 dark:border-slate-800">
                        <div className="flex items-center gap-4">
                          <div className={`inline-flex items-center justify-center w-10 h-10 rounded-full shrink-0 ${
                            moduleComplete
                              ? "bg-emerald-500 text-white"
                              : "bg-primary-100 dark:bg-primary-900/30 text-primary-600"
                          }`}>
                            {moduleComplete ? (
                              <CheckCircle className="h-5 w-5" />
                            ) : (
                              <BookOpen className="h-5 w-5" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-heading text-lg font-semibold text-slate-900 dark:text-white">
                              {mod.title[locale] || mod.title.en}
                            </h3>
                            {mod.description && (
                              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                                {mod.description[locale] || mod.description.en}
                              </p>
                            )}
                          </div>
                          <div className="flex items-center gap-3 shrink-0">
                            <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                              <span className="inline-flex items-center gap-1">
                                <FileText className="h-3.5 w-3.5" />
                                {lessonCount} {tLearning("lessons")}
                              </span>
                              {totalMinutes > 0 && (
                                <span className="hidden sm:inline-flex items-center gap-1">
                                  <Clock className="h-3.5 w-3.5" />
                                  {tLearning("estimatedTime", { minutes: totalMinutes })}
                                </span>
                              )}
                            </div>
                            {session?.user && lessonCount > 0 && (
                              <span className={`text-xs font-medium ${
                                moduleComplete
                                  ? "text-emerald-600 dark:text-emerald-400"
                                  : "text-slate-500 dark:text-slate-400"
                              }`}>
                                {completedCount}/{lessonCount}
                              </span>
                            )}
                          </div>
                        </div>
                        {/* Module progress bar */}
                        {session?.user && lessonCount > 0 && completedCount > 0 && (
                          <div className="mt-4 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-500 ${
                                moduleComplete ? "bg-emerald-500" : "bg-primary-500"
                              }`}
                              style={{ width: `${Math.round((completedCount / lessonCount) * 100)}%` }}
                            />
                          </div>
                        )}
                      </div>

                      {/* Lesson list */}
                      {sortedLessons.length > 0 && (
                        <ul className="divide-y divide-slate-100 dark:divide-slate-800">
                          {sortedLessons.map((entry: any) => {
                            const lesson = entry.lessonId;
                            if (!lesson) return null;
                            const isCompleted = completedLessonIds.has(lesson._id.toString());

                            return (
                              <li key={lesson._id.toString()}>
                                <Link
                                  href={`/learn/${lesson.slug}`}
                                  className="flex items-center gap-4 px-6 py-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group"
                                >
                                  {isCompleted ? (
                                    <CheckCircle className="h-5 w-5 text-emerald-500 shrink-0" />
                                  ) : (
                                    <FileText className="h-5 w-5 text-slate-400 dark:text-slate-500 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors shrink-0" />
                                  )}
                                  <div className="flex-1 min-w-0">
                                    <span className={`text-sm font-medium transition-colors ${
                                      isCompleted
                                        ? "text-slate-500 dark:text-slate-400"
                                        : "text-slate-700 dark:text-slate-300 group-hover:text-primary-600 dark:group-hover:text-primary-400"
                                    }`}>
                                      {lesson.title[locale] || lesson.title.en}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-3 shrink-0">
                                    {lesson.estimatedMinutes > 0 && (
                                      <span className="text-xs text-slate-400 dark:text-slate-500 whitespace-nowrap hidden sm:inline">
                                        {tLearning("estimatedTime", { minutes: lesson.estimatedMinutes })}
                                      </span>
                                    )}
                                    <GoArrow className="h-4 w-4 text-slate-300 dark:text-slate-600 group-hover:text-primary-500 transition-colors" />
                                  </div>
                                </Link>
                              </li>
                            );
                          })}
                        </ul>
                      )}
                    </div>
                  </StaggerItem>
                );
              })}
            </StaggerContainer>
          </div>
        )}

        {/* Empty state — no subtopics and no modules */}
        {subtopics.length === 0 && modules.length === 0 && (
          <AnimateIn preset="fade-in">
            <p className="text-center text-slate-500 dark:text-slate-400 py-12">
              {t("noTopics")}
            </p>
          </AnimateIn>
        )}
      </Container>
    </section>
  );
}
