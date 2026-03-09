import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { getPublicLearningPathBySlug } from "@/lib/data";
import { auth } from "@/lib/auth-config";
import { Container } from "@/components/layout/Container";
import {
  AnimateIn,
  StaggerContainer,
  StaggerItem,
} from "@/components/shared/AnimateIn";
import {
  Route,
  Clock,
  Layers,
  ArrowLeft,
  ArrowRight,
  FileText,
  CheckCircle,
  GraduationCap,
  Trophy,
} from "lucide-react";

const difficultyColors: Record<string, string> = {
  beginner:
    "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  intermediate:
    "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  advanced:
    "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
};

export default async function PathDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const t = await getTranslations("paths");
  const tLearning = await getTranslations("learning");
  const tCommon = await getTranslations("common");

  const path = await getPublicLearningPathBySlug(slug);
  if (!path) notFound();

  const pathAny = path as any;

  // Fetch user's completed lesson IDs for progress indicators
  const session = await auth();
  let completedIds: string[] = [];
  if (session?.user?.id) {
    const { User } = await import("@/db/models/User");
    const { connectDB } = await import("@/db/connection");
    await connectDB();
    const user = await User.findById(session.user.id).select("progress").lean();
    if (user) {
      completedIds = ((user as any).progress || []).map(
        (p: any) => p.lessonId.toString()
      );
    }
  }
  const BackArrow = locale === "ar" ? ArrowRight : ArrowLeft;

  // Filter out modules where moduleId is null (unpublished modules)
  const validModules = (pathAny.modules || [])
    .filter((m: any) => m.moduleId)
    .sort((a: any, b: any) => a.order - b.order);

  // Compute overall progress
  let totalLessonsInPath = 0;
  let completedLessonsInPath = 0;
  for (const entry of validModules) {
    const mod = entry.moduleId;
    const lessons = (mod.lessons || []).filter((l: any) => l.lessonId);
    totalLessonsInPath += lessons.length;
    if (completedIds.length > 0) {
      for (const l of lessons) {
        if (completedIds.includes(l.lessonId._id.toString())) {
          completedLessonsInPath++;
        }
      }
    }
  }
  const progressPercentage =
    totalLessonsInPath > 0
      ? Math.round((completedLessonsInPath / totalLessonsInPath) * 100)
      : 0;
  const hasStarted = completedLessonsInPath > 0;
  const isCompleted = hasStarted && completedLessonsInPath === totalLessonsInPath;

  return (
    <section className="py-16 sm:py-24">
      <Container>
        {/* Back link */}
        <AnimateIn preset="fade-in">
          <Link
            href="/paths"
            className="inline-flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors mb-8"
          >
            <BackArrow className="h-4 w-4" />
            {tCommon("back")}
          </Link>
        </AnimateIn>

        {/* Hero section */}
        <AnimateIn preset="fade-up" className="mb-16">
          <div className="relative overflow-hidden rounded-2xl bg-white dark:bg-slate-900 shadow-sm border border-slate-100 dark:border-slate-800 p-8 sm:p-12">
            <div className="flex flex-col sm:flex-row sm:items-start gap-6">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary-100 dark:bg-primary-900/30 text-primary-600 shrink-0">
                <Route className="h-8 w-8" />
              </div>
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-3 mb-3">
                  <span
                    className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                      difficultyColors[pathAny.difficulty] ||
                      difficultyColors.beginner
                    }`}
                  >
                    {tLearning(`difficulty.${pathAny.difficulty}`)}
                  </span>
                  <span className="inline-flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                    <Clock className="h-3.5 w-3.5" />
                    {t("hours", { count: pathAny.estimatedHours })}
                  </span>
                  <span className="inline-flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                    <Layers className="h-3.5 w-3.5" />
                    {t("moduleCount", { count: validModules.length })}
                  </span>
                </div>
                <h1 className="font-heading text-3xl font-bold sm:text-4xl tracking-tight text-slate-900 dark:text-white">
                  {pathAny.title[locale] || pathAny.title.en}
                </h1>
                <div className="mt-3 decorative-line" />
                <p className="mt-4 max-w-3xl text-lg leading-relaxed text-slate-600 dark:text-slate-400">
                  {pathAny.description[locale] || pathAny.description.en}
                </p>
              </div>
            </div>
          </div>
        </AnimateIn>

        {/* Progress Card (logged-in users only) */}
        {session?.user && totalLessonsInPath > 0 && (
          <AnimateIn preset="fade-up" className="mb-10">
            <div
              className={`rounded-2xl border p-6 sm:p-8 ${
                isCompleted
                  ? "bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800"
                  : "bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800"
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
                <div
                  className={`inline-flex items-center justify-center w-12 h-12 rounded-xl shrink-0 ${
                    isCompleted
                      ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600"
                      : "bg-primary-100 dark:bg-primary-900/30 text-primary-600"
                  }`}
                >
                  {isCompleted ? (
                    <Trophy className="h-6 w-6" />
                  ) : (
                    <GraduationCap className="h-6 w-6" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-heading text-base font-semibold text-slate-900 dark:text-white">
                      {t("yourProgress")}
                    </h3>
                    <span
                      className={`text-sm font-bold ${
                        isCompleted
                          ? "text-emerald-600 dark:text-emerald-400"
                          : "text-primary-600 dark:text-primary-400"
                      }`}
                    >
                      {progressPercentage}%
                    </span>
                  </div>
                  <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mb-2">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isCompleted ? "bg-emerald-500" : "bg-primary-500"
                      }`}
                      style={{ width: `${progressPercentage}%` }}
                    />
                  </div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    {isCompleted
                      ? t("pathCompleted")
                      : hasStarted
                        ? t("lessonsCompleted", {
                            completed: completedLessonsInPath,
                            total: totalLessonsInPath,
                          })
                        : t("notStarted")}
                  </p>
                </div>
              </div>
            </div>
          </AnimateIn>
        )}

        {/* Module list */}
        {validModules.length > 0 && (
          <StaggerContainer className="space-y-6">
            {validModules.map((entry: any, index: number) => {
              const mod = entry.moduleId;
              const lessons = (mod.lessons || [])
                .filter((l: any) => l.lessonId)
                .sort((a: any, b: any) => a.order - b.order);

              const moduleLessonCount = lessons.length;
              const moduleCompletedCount = session?.user
                ? lessons.filter((l: any) =>
                    completedIds.includes(l.lessonId._id.toString())
                  ).length
                : 0;
              const moduleComplete =
                moduleLessonCount > 0 &&
                moduleCompletedCount === moduleLessonCount;

              return (
                <StaggerItem key={mod._id.toString()}>
                  <div className="rounded-2xl bg-white dark:bg-slate-900 shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
                    {/* Module header */}
                    <div className="p-6 border-b border-slate-100 dark:border-slate-800">
                      <div className="flex items-center gap-4">
                        <span
                          className={`inline-flex items-center justify-center w-10 h-10 rounded-full text-sm font-bold shrink-0 ${
                            moduleComplete
                              ? "bg-emerald-500 text-white"
                              : "bg-primary-600 text-white"
                          }`}
                        >
                          {moduleComplete ? (
                            <CheckCircle className="h-5 w-5" />
                          ) : (
                            index + 1
                          )}
                        </span>
                        <div className="flex-1">
                          <h2 className="font-heading text-xl font-semibold text-slate-900 dark:text-white">
                            {mod.title[locale] || mod.title.en}
                          </h2>
                          {mod.description && (
                            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                              {mod.description[locale] ||
                                mod.description.en}
                            </p>
                          )}
                        </div>
                        {session?.user && moduleLessonCount > 0 && (
                          <span className="text-xs text-slate-500 dark:text-slate-400 shrink-0">
                            {moduleCompletedCount}/{moduleLessonCount}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Lesson list */}
                    {lessons.length > 0 && (
                      <ul className="divide-y divide-slate-100 dark:divide-slate-800">
                        {lessons.map((lessonEntry: any) => {
                          const lesson = lessonEntry.lessonId;
                          if (!lesson) return null;

                          return (
                            <li key={lesson._id.toString()}>
                              <Link
                                href={`/learn/${lesson.slug}`}
                                className="flex items-center gap-4 px-6 py-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group"
                              >
                                <FileText className="h-5 w-5 text-slate-400 dark:text-slate-500 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors shrink-0" />
                                <div className="flex-1 min-w-0">
                                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                                    {lesson.title[locale] ||
                                      lesson.title.en}
                                  </span>
                                </div>
                                <div className="flex items-center gap-3 shrink-0">
                                  {lesson.estimatedMinutes > 0 && (
                                    <span className="text-xs text-slate-400 dark:text-slate-500 whitespace-nowrap">
                                      {tLearning("estimatedTime", {
                                        minutes:
                                          lesson.estimatedMinutes,
                                      })}
                                    </span>
                                  )}
                                  {completedIds.includes(lesson._id.toString()) && (
                                    <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0" />
                                  )}
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
        )}
      </Container>
    </section>
  );
}
