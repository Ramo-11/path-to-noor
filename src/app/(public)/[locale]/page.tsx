import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { auth } from "@/lib/auth-config";
import {
  getPublicTopics,
  getPublicLearningPaths,
  getHomepageStats,
} from "@/lib/data";
import { Container } from "@/components/layout/Container";
import {
  AnimateIn,
  StaggerContainer,
  StaggerItem,
} from "@/components/shared/AnimateIn";
import { AnimatedCounter } from "@/components/shared/AnimatedCounter";
import { TopicIconPublic } from "@/components/shared/TopicIconPublic";
import { Button } from "@/components/ui/Button";
import {
  BookOpen,
  Route,
  BarChart3,
  Languages,
  Clock,
  Layers,
  ArrowRight,
  ArrowLeft,
  Handshake,
  Sparkles,
  Compass,
  CheckCircle2,
  UserCheck,
  GraduationCap,
} from "lucide-react";

const featureIcons = [BookOpen, Route, BarChart3, Languages];
const featureKeys = [
  "structuredPaths",
  "browseTopics",
  "trackProgress",
  "bilingual",
] as const;

const difficultyColors: Record<string, string> = {
  beginner:
    "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  intermediate:
    "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  advanced:
    "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function countLessonsInPath(path: any): number {
  let count = 0;
  for (const mod of path.modules || []) {
    if (!mod.moduleId) continue;
    count += mod.moduleId.lessons?.length || 0;
  }
  return count;
}

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations("home");
  const tPaths = await getTranslations("paths");
  const tLearning = await getTranslations("learning");

  const session = await auth();
  const ctx = { userType: session?.user?.userType, isGuest: !session?.user };

  const [rootTopics, allPaths, stats] = await Promise.all([
    getPublicTopics(ctx).then((topics) =>
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      topics.filter((t: any) => !t.parent).slice(0, 6)
    ),
    getPublicLearningPaths(ctx),
    getHomepageStats(),
  ]);

  const featuredPath = allPaths[0] || null;
  const otherPaths = allPaths.slice(1, 4);
  const GoArrow = locale === "ar" ? ArrowLeft : ArrowRight;

  const reasonIcons = [Compass, BarChart3, UserCheck];

  return (
    <>
      {/* ──────────────── Hero ──────────────── */}
      <section className="relative overflow-hidden gradient-mesh noise-overlay">
        <Container className="relative z-10 py-24 sm:py-32 lg:py-40">
          <AnimateIn preset="fade-up" className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-100/80 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300 text-sm font-medium mb-6 backdrop-blur-sm">
              <Sparkles className="h-3.5 w-3.5" />
              {locale === "ar"
                ? "منصة تعليمية للمسلمين الجدد"
                : locale === "es"
                  ? "Plataforma de aprendizaje para nuevos musulmanes"
                  : "A learning platform for new Muslims"}
            </div>
            <h1 className="font-heading text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl text-slate-900 dark:text-white">
              <span className="gradient-text">{t("hero.title")}</span>
            </h1>
            <p className="mt-6 text-lg leading-relaxed text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              {t("hero.subtitle")}
            </p>
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button href="/paths" size="lg">
                {t("hero.explorePaths")}
              </Button>
              {!session?.user && (
                <Button href="/register" variant="outline" size="lg">
                  {t("hero.createAccount")}
                </Button>
              )}
            </div>
          </AnimateIn>
        </Container>
      </section>

      {/* ──────────────── Stats bar ──────────────── */}
      <section className="relative -mt-8 z-20">
        <Container>
          <AnimateIn preset="fade-up">
            <div className="glass-card rounded-2xl shadow-lg p-6 sm:p-8">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 text-center">
                <div>
                  <p className="text-3xl sm:text-4xl font-bold text-primary-700 dark:text-primary-300 stat-glow">
                    <AnimatedCounter value={stats.pathCount} />
                  </p>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                    {t("stats.paths")}
                  </p>
                </div>
                <div>
                  <p className="text-3xl sm:text-4xl font-bold text-primary-700 dark:text-primary-300 stat-glow">
                    <AnimatedCounter value={stats.lessonCount} />
                  </p>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                    {t("stats.lessons")}
                  </p>
                </div>
                <div>
                  <p className="text-3xl sm:text-4xl font-bold text-primary-700 dark:text-primary-300 stat-glow">
                    <AnimatedCounter value={stats.topicCount} />
                  </p>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                    {t("stats.topics")}
                  </p>
                </div>
                <div>
                  <p className="text-3xl sm:text-4xl font-bold text-accent-600 dark:text-accent-400 stat-glow">
                    <AnimatedCounter value={stats.languageCount} />
                  </p>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                    {t("stats.languages")}
                  </p>
                </div>
              </div>
            </div>
          </AnimateIn>
        </Container>
      </section>

      {/* ══════════════════════════════════════════════════════════
          LEARNING PATHS — THE MAIN EVENT
          ══════════════════════════════════════════════════════════ */}
      {allPaths.length > 0 && (
        <section className="py-20 sm:py-28 section-divider">
          <Container>
            {/* Section Header */}
            <AnimateIn preset="fade-up" className="text-center mb-6">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent-100/80 dark:bg-accent-900/40 text-accent-700 dark:text-accent-300 text-sm font-medium mb-4">
                <Route className="h-3.5 w-3.5" />
                {t("paths.badge")}
              </div>
              <h2 className="font-heading text-3xl font-bold sm:text-4xl lg:text-5xl tracking-tight text-slate-900 dark:text-white">
                {t("paths.title")}
              </h2>
              <div className="mt-3 decorative-line-center" />
              <p className="mt-6 max-w-2xl mx-auto text-lg leading-relaxed text-slate-600 dark:text-slate-400">
                {t("paths.subtitle")}
              </p>
            </AnimateIn>

            {/* Why Learning Paths — 3 reasons */}
            <AnimateIn preset="fade-up" className="mt-12 mb-16">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {([1, 2, 3] as const).map((n) => {
                  const Icon = reasonIcons[n - 1];
                  return (
                    <div
                      key={n}
                      className="flex flex-col items-center text-center p-6 rounded-2xl bg-slate-50/80 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800"
                    >
                      <div className="inline-flex items-center justify-center w-11 h-11 rounded-xl bg-primary-100 dark:bg-primary-900/30 text-primary-600 mb-4">
                        <Icon className="h-5 w-5" />
                      </div>
                      <h3 className="font-heading text-base font-semibold text-slate-900 dark:text-white mb-1.5">
                        {t(`paths.reason${n}Title`)}
                      </h3>
                      <p className="text-sm leading-relaxed text-slate-500 dark:text-slate-400">
                        {t(`paths.reason${n}`)}
                      </p>
                    </div>
                  );
                })}
              </div>
            </AnimateIn>

            {/* Featured Path — Hero Card */}
            {featuredPath && (
              <AnimateIn preset="fade-up" className="mb-8">
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary-700 to-primary-900 dark:from-primary-800 dark:to-primary-950 noise-overlay">
                  <div className="relative z-10 p-8 sm:p-12 flex flex-col lg:flex-row lg:items-center gap-8">
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-3 mb-4">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent-500/20 text-accent-300 text-xs font-medium">
                          <Sparkles className="h-3 w-3" />
                          {t("paths.featured")}
                        </span>
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                            difficultyColors[featuredPath.difficulty] ||
                            difficultyColors.beginner
                          }`}
                        >
                          {tLearning(`difficulty.${featuredPath.difficulty}`)}
                        </span>
                      </div>
                      <h3 className="font-heading text-2xl sm:text-3xl font-bold text-white mb-3">
                        {featuredPath.title[locale as "en" | "ar" | "es"] || featuredPath.title.en}
                      </h3>
                      <p className="text-primary-200 leading-relaxed max-w-xl mb-6">
                        {featuredPath.description[locale as "en" | "ar" | "es"] || featuredPath.description.en}
                      </p>
                      <div className="flex flex-wrap items-center gap-5 text-sm text-primary-300">
                        <span className="inline-flex items-center gap-1.5">
                          <Clock className="h-4 w-4" />
                          {tPaths("hours", { count: featuredPath.estimatedHours })}
                        </span>
                        <span className="inline-flex items-center gap-1.5">
                          <Layers className="h-4 w-4" />
                          {tPaths("moduleCount", {
                            count: featuredPath.modules?.filter(
                              // eslint-disable-next-line @typescript-eslint/no-explicit-any
                              (m: any) => m.moduleId
                            ).length || 0,
                          })}
                        </span>
                        <span className="inline-flex items-center gap-1.5">
                          <GraduationCap className="h-4 w-4" />
                          {t("paths.lessonsCount", {
                            count: countLessonsInPath(featuredPath),
                          })}
                        </span>
                      </div>
                    </div>
                    <div className="shrink-0">
                      <Link
                        href={`/paths/${featuredPath.slug}`}
                        className="inline-flex items-center gap-2 rounded-lg bg-white text-primary-700 hover:bg-primary-50 transition-colors px-7 py-3.5 text-sm font-semibold shadow-lg"
                      >
                        {t("paths.startLearning")}
                        <GoArrow className="h-4 w-4" />
                      </Link>
                    </div>
                  </div>
                </div>
              </AnimateIn>
            )}

            {/* Other Paths — Grid */}
            {otherPaths.length > 0 && (
              <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                {otherPaths.map((path: any) => {
                  const moduleCount =
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    path.modules?.filter((m: any) => m.moduleId).length || 0;
                  const lessonCount = countLessonsInPath(path);

                  return (
                    <StaggerItem key={path._id.toString()}>
                      <Link href={`/paths/${path.slug}`} className="block group h-full">
                        <div className="card-hover rounded-2xl bg-white dark:bg-slate-900 shadow-sm border border-slate-100 dark:border-slate-800 p-6 h-full flex flex-col">
                          <div className="flex items-center justify-between mb-4">
                            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary-100 dark:bg-primary-900/30 text-primary-600 group-hover:bg-primary-200 dark:group-hover:bg-primary-900/50 transition-colors">
                              <Route className="h-6 w-6" />
                            </div>
                            <span
                              className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                                difficultyColors[path.difficulty] ||
                                difficultyColors.beginner
                              }`}
                            >
                              {tLearning(`difficulty.${path.difficulty}`)}
                            </span>
                          </div>

                          <h3 className="font-heading text-lg font-semibold text-slate-900 dark:text-white mb-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                            {path.title[locale] || path.title.en}
                          </h3>
                          <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400 line-clamp-3 mb-4">
                            {path.description[locale] || path.description.en}
                          </p>

                          <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400 mt-auto">
                            <span className="inline-flex items-center gap-1">
                              <Clock className="h-3.5 w-3.5" />
                              {tPaths("hours", { count: path.estimatedHours })}
                            </span>
                            <span className="inline-flex items-center gap-1">
                              <Layers className="h-3.5 w-3.5" />
                              {tPaths("moduleCount", { count: moduleCount })}
                            </span>
                            <span className="inline-flex items-center gap-1">
                              <GraduationCap className="h-3.5 w-3.5" />
                              {t("paths.lessonsCount", { count: lessonCount })}
                            </span>
                          </div>
                        </div>
                      </Link>
                    </StaggerItem>
                  );
                })}
              </StaggerContainer>
            )}

            <AnimateIn preset="fade-up" className="text-center mt-10">
              <Button href="/paths" size="lg">
                {t("paths.viewAll")}
                <GoArrow className="h-4 w-4 ms-2" />
              </Button>
            </AnimateIn>
          </Container>
        </section>
      )}

      {/* ──────────────── Topics ──────────────── */}
      {rootTopics.length > 0 && (
        <section className="py-20 sm:py-28 bg-slate-50/50 dark:bg-slate-900/30">
          <Container>
            <AnimateIn preset="fade-up" className="text-center mb-12">
              <h2 className="font-heading text-3xl font-bold sm:text-4xl tracking-tight text-slate-900 dark:text-white">
                {t("topics.title")}
              </h2>
              <div className="mt-3 decorative-line-center" />
              <p className="mt-6 max-w-2xl mx-auto text-lg leading-relaxed text-slate-600 dark:text-slate-400">
                {t("topics.subtitle")}
              </p>
            </AnimateIn>

            <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              {rootTopics.map((topic: any) => (
                <StaggerItem key={topic._id.toString()}>
                  <Link href={`/topics/${topic.slug}`} className="block group">
                    <div className="card-hover rounded-2xl bg-white dark:bg-slate-900 shadow-sm border border-slate-100 dark:border-slate-800 p-6 h-full">
                      {topic.icon && <TopicIconPublic name={topic.icon} />}
                      <h3 className="font-heading text-lg font-semibold text-slate-900 dark:text-white mb-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                        {topic.name[locale] || topic.name.en}
                      </h3>
                      <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400 line-clamp-2">
                        {topic.description[locale] || topic.description.en}
                      </p>
                    </div>
                  </Link>
                </StaggerItem>
              ))}
            </StaggerContainer>

            <AnimateIn preset="fade-up" className="text-center mt-10">
              <Button href="/topics" variant="outline" size="md">
                {t("topics.viewAll")}
                <GoArrow className="h-4 w-4 ms-2" />
              </Button>
            </AnimateIn>
          </Container>
        </section>
      )}

      {/* ──────────────── Features ──────────────── */}
      <section className="py-20 sm:py-28 section-divider">
        <Container>
          <AnimateIn preset="fade-up" className="text-center mb-16">
            <h2 className="font-heading text-3xl font-bold sm:text-4xl tracking-tight text-slate-900 dark:text-white">
              {t("features.title")}
            </h2>
            <div className="mt-3 decorative-line-center" />
            <p className="mt-6 max-w-2xl mx-auto text-lg leading-relaxed text-slate-600 dark:text-slate-400">
              {t("features.subtitle")}
            </p>
          </AnimateIn>

          <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featureKeys.map((key, i) => {
              const Icon = featureIcons[i];
              return (
                <StaggerItem key={key}>
                  <div className="card-hover rounded-2xl bg-white dark:bg-slate-900 shadow-sm border border-slate-100 dark:border-slate-800 p-6 h-full">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary-100 dark:bg-primary-900/30 text-primary-600 mb-4">
                      <Icon className="h-6 w-6" />
                    </div>
                    <h3 className="font-heading text-lg font-semibold text-slate-900 dark:text-white mb-2">
                      {t(`features.${key}.title`)}
                    </h3>
                    <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                      {t(`features.${key}.description`)}
                    </p>
                  </div>
                </StaggerItem>
              );
            })}
          </StaggerContainer>
        </Container>
      </section>

      {/* ──────────────── Mentor Banner ──────────────── */}
      <section className="py-16 sm:py-20">
        <Container>
          <AnimateIn preset="fade-up">
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary-700 to-primary-900 dark:from-primary-800 dark:to-primary-950 px-8 py-12 sm:px-14 sm:py-16 noise-overlay">
              <div className="relative z-10 flex flex-col lg:flex-row items-center gap-8 lg:gap-12">
                <div className="flex-1 text-center lg:text-start">
                  <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-white/10 text-accent-400 mb-5">
                    <Handshake className="h-7 w-7" />
                  </div>
                  <h2 className="font-heading text-2xl sm:text-3xl font-bold text-white mb-3">
                    {t("mentorBanner.title")}
                  </h2>
                  <p className="text-primary-200 leading-relaxed max-w-lg">
                    {t("mentorBanner.subtitle")}
                  </p>
                </div>
                <div className="shrink-0">
                  <Link
                    href="/mentorship"
                    className="inline-flex items-center gap-2 rounded-lg bg-white text-primary-700 hover:bg-primary-50 transition-colors px-7 py-3.5 text-sm font-semibold shadow-lg"
                  >
                    {t("mentorBanner.requestMentor")}
                    <GoArrow className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            </div>
          </AnimateIn>
        </Container>
      </section>

      {/* ──────────────── Final CTA ──────────────── */}
      {!session?.user && (
        <section className="py-20 sm:py-28 bg-slate-50/50 dark:bg-slate-900/30">
          <Container size="md">
            <AnimateIn preset="fade-up" className="text-center">
              <h2 className="font-heading text-3xl font-bold sm:text-4xl tracking-tight text-slate-900 dark:text-white">
                {t("cta.title")}
              </h2>
              <div className="mt-3 decorative-line-center" />
              <p className="mt-6 max-w-xl mx-auto text-lg leading-relaxed text-slate-600 dark:text-slate-400">
                {t("cta.subtitle")}
              </p>
              <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button href="/register" size="lg">
                  {t("cta.getStarted")}
                </Button>
                <Button href="/paths" variant="outline" size="lg">
                  {t("cta.browsePaths")}
                </Button>
              </div>
            </AnimateIn>
          </Container>
        </section>
      )}
    </>
  );
}
