import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { Link } from "@/i18n/navigation";
import {
  getPublicLessonBySlug,
  getPublicQuizByLessonId,
  getLessonNavigationContext,
} from "@/lib/data";
import { auth } from "@/lib/auth-config";
import { Container } from "@/components/layout/Container";
import { AnimateIn } from "@/components/shared/AnimateIn";
import { TipTapRenderer } from "@/components/shared/TipTapRenderer";
import { LessonActions } from "@/components/shared/LessonActions";
import { ArrowLeft, ArrowRight, Clock, Route } from "lucide-react";

export default async function LessonPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const t = await getTranslations("lesson");
  const tLearning = await getTranslations("learning");

  const lesson = await getPublicLessonBySlug(slug);
  if (!lesson) notFound();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const lessonAny = lesson as any;
  const lessonId = lessonAny._id.toString();
  const title = lessonAny.title as { en: string; ar: string; es: string };
  const content = lessonAny.content as
    | { en: unknown; ar: unknown; es: unknown }
    | undefined;
  const estimatedMinutes = lessonAny.estimatedMinutes as number;

  // Fetch quiz, navigation context, and session in parallel
  const [quiz, navContext, session] = await Promise.all([
    getPublicQuizByLessonId(lessonId),
    getLessonNavigationContext(lessonId, locale),
    auth(),
  ]);
  const hasQuiz = !!quiz;

  // Check if the current user has completed this lesson
  let isCompleted = false;
  if (session?.user?.id) {
    const { User } = await import("@/db/models/User");
    const { connectDB } = await import("@/db/connection");
    await connectDB();
    const user = await User.findById(session.user.id)
      .select("progress")
      .lean();
    if (user) {
      isCompleted =
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (user as any).progress?.some(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (p: any) => p.lessonId.toString() === lessonId
        ) || false;
    }
  }

  const BackArrow = locale === "ar" ? ArrowRight : ArrowLeft;

  // Select the correct content based on locale
  const localizedContent =
    locale === "ar"
      ? content?.ar
      : locale === "es"
        ? content?.es || content?.en
        : content?.en;
  const contentDir = locale === "ar" ? "rtl" : "ltr";

  return (
    <section className="py-16 sm:py-24">
      <Container size="md">
        {/* Breadcrumb navigation */}
        <AnimateIn preset="fade-in">
          <div className="flex flex-wrap items-center gap-2 text-sm text-slate-500 dark:text-slate-400 mb-8">
            {navContext?.path ? (
              <>
                <Link
                  href={`/paths/${navContext.path.slug}`}
                  className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors inline-flex items-center gap-1"
                >
                  <Route className="h-3.5 w-3.5" />
                  {navContext.path.title[locale as "en" | "ar" | "es"] ||
                    navContext.path.title.en}
                </Link>
                <span className="text-slate-300 dark:text-slate-600">/</span>
                <span>
                  {navContext.module.title[locale as "en" | "ar" | "es"] ||
                    navContext.module.title.en}
                </span>
              </>
            ) : (
              <Link
                href="/topics"
                className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors inline-flex items-center gap-1"
              >
                <BackArrow className="h-3.5 w-3.5" />
                {t("backToModule")}
              </Link>
            )}
          </div>
        </AnimateIn>

        {/* Lesson header */}
        <AnimateIn preset="fade-up" className="mb-10">
          {estimatedMinutes > 0 && (
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <span className="inline-flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                <Clock className="h-3.5 w-3.5" />
                {tLearning("estimatedTime", {
                  minutes: estimatedMinutes,
                })}
              </span>
            </div>
          )}

          <h1 className="font-heading text-3xl font-bold sm:text-4xl tracking-tight text-slate-900 dark:text-white">
            {title[locale as "en" | "ar" | "es"] || title.en}
          </h1>
          {title.en && title.ar && locale !== "es" && (
            <p
              className="mt-2 text-lg text-slate-500 dark:text-slate-400"
              dir={locale === "ar" ? "ltr" : "rtl"}
              lang={locale === "ar" ? "en" : "ar"}
            >
              {locale === "ar" ? title.en : title.ar}
            </p>
          )}
          <div className="mt-4 decorative-line" />
        </AnimateIn>

        {/* Lesson content */}
        <AnimateIn preset="fade-up" delay={0.15}>
          <div
            dir={contentDir}
            lang={locale}
            className="rounded-2xl bg-white dark:bg-slate-900 shadow-sm border border-slate-100 dark:border-slate-800 p-6 sm:p-10"
          >
            {localizedContent ? (
              <TipTapRenderer content={localizedContent} />
            ) : (
              <p className="text-slate-500 dark:text-slate-400 text-center py-8">
                {t("notFoundDescription")}
              </p>
            )}
          </div>
        </AnimateIn>

        {/* Actions & Navigation */}
        <AnimateIn preset="fade-up" delay={0.3}>
          <div className="mt-8">
            <LessonActions
              lessonId={lessonId}
              lessonSlug={slug}
              initialCompleted={isCompleted}
              hasQuiz={hasQuiz}
              nextLesson={navContext?.nextLesson ?? null}
              previousLesson={navContext?.previousLesson ?? null}
              pathSlug={navContext?.path?.slug ?? null}
              pathTitle={navContext?.path?.title ?? null}
              currentIndex={navContext?.currentIndex ?? 0}
              totalInModule={navContext?.totalInModule ?? 1}
            />
          </div>
        </AnimateIn>
      </Container>
    </section>
  );
}
