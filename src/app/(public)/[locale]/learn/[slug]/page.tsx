import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { getPublicQuizByLessonId } from "@/lib/data";
import { getPathForLesson } from "@/lib/learning";
import { localized } from "@/lib/stages";
import { Button } from "@/components/primer/Button";
import { EmptyState } from "@/components/primer/EmptyState";
import {
  getLessonPlace,
  loadLesson,
  pickLessonContent,
  titleLanguage,
} from "@/components/lesson/lesson-context";
import { lessonAccess } from "@/components/lesson/lesson-access";
import { LessonBody } from "@/components/lesson/LessonBody";
import { LessonEmptyRegion, LessonMemberProvider } from "@/components/lesson/LessonMember";
import { LessonShell } from "@/components/lesson/LessonShell";
import { GatedLesson } from "@/components/lesson/GatedLesson";
import { excerpt, leadVideo } from "@/components/lesson/tiptap";
import { OG_LOCALES } from "@/components/feedback/og-locale";

export const revalidate = 300;

export function generateStaticParams() {
  return [];
}

interface PageProps {
  params: Promise<{ locale: string; slug: string }>;
}

function quizQuestionCount(quiz: unknown): number {
  const questions = (quiz as { questions?: unknown } | null)?.questions;
  return Array.isArray(questions) ? questions.length : 0;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  const lesson = await loadLesson(slug);
  if (!lesson) {
    const t = await getTranslations({ locale, namespace: "lesson" });
    return { title: t("notFoundTitle"), robots: { index: false } };
  }

  const title = localized(lesson.title, locale);
  const gated = lessonAccess(lesson, null) !== "open";
  const picked = pickLessonContent(lesson, locale);
  const description = !gated && picked.hasContent ? excerpt(picked.doc, 160) : "";

  return {
    title,
    description: description || undefined,
    alternates: {
      canonical: `/${locale}/learn/${slug}`,
      languages: { en: `/en/learn/${slug}`, ar: `/ar/learn/${slug}`, es: `/es/learn/${slug}` },
    },
    openGraph: {
      type: "article",
      title,
      description: description || undefined,
      url: `/${locale}/learn/${slug}`,
      siteName: "Basmet Dawah",
      locale: OG_LOCALES[locale] ?? OG_LOCALES.en,
    },
    twitter: { card: "summary_large_image", title, description: description || undefined },
    robots: lesson.guestAccessible && lesson.audience !== "mentor" ? undefined : { index: false },
  };
}

export default async function LessonPage({ params }: PageProps) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const lesson = await loadLesson(slug);
  if (!lesson) notFound();

  const t = await getTranslations("lesson");
  const title = localized(lesson.title, locale);
  const titleLang = titleLanguage(lesson.title, locale);
  const lessonPath = `/${locale}/learn/${slug}`;
  const signInHref = `/login?callbackUrl=${encodeURIComponent(lessonPath)}`;

  if (lessonAccess(lesson, null) === "signIn") {
    const wall = (
      <div className="mx-auto w-full max-w-3xl px-4 pt-12 pb-20 sm:px-6 sm:pt-16 sm:pb-28 lg:px-8">
        <h1
          lang={titleLang}
          dir={titleLang === "ar" ? "rtl" : "ltr"}
          className="text-title font-semibold text-balance"
        >
          {title}
        </h1>
        <div className="mt-10">
          <EmptyState
            title={t("signInRequiredTitle")}
            body={t("signInRequiredBody")}
            art="welcome"
            action={
              <div className="flex flex-wrap gap-3">
                <Button size="lg" href={signInHref}>
                  {t("signIn")}
                </Button>
                <Button size="lg" variant="secondary" href="/register">
                  {t("createAccount")}
                </Button>
              </div>
            }
          />
        </div>
      </div>
    );
    return (
      <LessonMemberProvider key={slug} slug={slug}>
        <GatedLesson slug={slug} title={title} titleLang={titleLang} signInHref={signInHref} wall={wall} />
      </LessonMemberProvider>
    );
  }

  const quiz = await getPublicQuizByLessonId(lesson.id);
  const path = await getPathForLesson(lesson.id);
  const place = await getLessonPlace(lesson.id, locale, path, false);

  const picked = pickLessonContent(lesson, locale);
  const lead = picked.hasContent ? leadVideo(picked.doc) : null;
  const blockMessages =
    picked.hasContent && picked.language !== locale
      ? (await import(`@/messages/${picked.language}/blocks.json`)).default
      : null;
  const checkHref = quizQuestionCount(quiz) > 0 ? `/learn/${slug}/check` : null;

  return (
    <LessonMemberProvider key={slug} slug={slug}>
      <LessonShell
        lessonId={lesson.id}
        slug={slug}
        title={title}
        titleLang={titleLang}
        minutes={lesson.minutes}
        isWatch={lead !== null}
        hasContent={picked.hasContent}
        isFallback={picked.isFallback}
        contentDir={picked.language === "ar" ? "rtl" : "ltr"}
        contentLang={picked.language}
        checkHref={checkHref}
        signInHref={signInHref}
        guestPlace={place}
        body={
          <LessonBody
            doc={picked.doc}
            language={picked.language}
            hasContent={picked.hasContent}
            blockMessages={blockMessages}
            slug={slug}
            title={title}
            empty={<LessonEmptyRegion guestPlace={place} />}
          />
        }
      />
    </LessonMemberProvider>
  );
}
