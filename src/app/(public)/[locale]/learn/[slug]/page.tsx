import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { getPublicLessonBySlug } from "@/lib/data";
import { auth } from "@/lib/auth-config";
import { Container } from "@/components/layout/Container";
import { AnimateIn } from "@/components/shared/AnimateIn";
import { TipTapRenderer } from "@/components/shared/TipTapRenderer";
import { MarkCompleteButton } from "@/components/shared/MarkCompleteButton";
import {
  ArrowLeft,
  ArrowRight,
  Clock,
} from "lucide-react";

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

  const lessonAny = lesson as any;

  // Check if the current user has completed this lesson
  const session = await auth();
  let isCompleted = false;
  if (session?.user?.id) {
    const { User } = await import("@/db/models/User");
    const { connectDB } = await import("@/db/connection");
    await connectDB();
    const user = await User.findById(session.user.id).select("progress").lean();
    if (user) {
      isCompleted =
        (user as any).progress?.some(
          (p: any) => p.lessonId.toString() === (lessonAny._id?.toString() || "")
        ) || false;
    }
  }
  const BackArrow = locale === "ar" ? ArrowRight : ArrowLeft;

  // Select the correct content based on locale
  const content =
    locale === "ar" ? lessonAny.content?.ar : lessonAny.content?.en;
  const contentDir = locale === "ar" ? "rtl" : "ltr";

  return (
    <section className="py-16 sm:py-24">
      <Container size="md">
        {/* Back navigation */}
        <AnimateIn preset="fade-in">
          <Link
            href="/topics"
            className="inline-flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors mb-8"
          >
            <BackArrow className="h-4 w-4" />
            {t("backToModule")}
          </Link>
        </AnimateIn>

        {/* Lesson header */}
        <AnimateIn preset="fade-up" className="mb-10">
          {lessonAny.estimatedMinutes > 0 && (
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <span className="inline-flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                <Clock className="h-3.5 w-3.5" />
                {tLearning("estimatedTime", {
                  minutes: lessonAny.estimatedMinutes,
                })}
              </span>
            </div>
          )}

          {/* Title — show both languages */}
          <h1 className="font-heading text-3xl font-bold sm:text-4xl tracking-tight text-slate-900 dark:text-white">
            {lessonAny.title[locale] || lessonAny.title.en}
          </h1>
          {lessonAny.title.en && lessonAny.title.ar && (
            <p
              className="mt-2 text-lg text-slate-500 dark:text-slate-400"
              dir={locale === "ar" ? "ltr" : "rtl"}
              lang={locale === "ar" ? "en" : "ar"}
            >
              {locale === "ar" ? lessonAny.title.en : lessonAny.title.ar}
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
            {content ? (
              <TipTapRenderer content={content} />
            ) : (
              <p className="text-slate-500 dark:text-slate-400 text-center py-8">
                {t("notFoundDescription")}
              </p>
            )}
          </div>
        </AnimateIn>

        {/* Mark complete */}
        <AnimateIn preset="fade-up" delay={0.3}>
          <div className="mt-8 flex justify-center">
            <MarkCompleteButton
              lessonId={lessonAny._id.toString()}
              initialCompleted={isCompleted}
            />
          </div>
        </AnimateIn>
      </Container>
    </section>
  );
}
