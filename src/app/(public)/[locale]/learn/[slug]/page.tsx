import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Clock } from "lucide-react";
import { auth } from "@/lib/auth-config";
import { getPublicQuizByLessonId } from "@/lib/data";
import { getPathForLesson } from "@/lib/learning";
import { localized } from "@/lib/stages";
import { Button } from "@/components/primer/Button";
import { EmptyState } from "@/components/primer/EmptyState";
import { LessonContent } from "@/components/lesson/LessonContent";
import { LessonContentIsland } from "@/components/lesson/LessonContentIsland";
import { LessonVideo } from "@/components/lesson/LessonVideo";
import { LessonContextBar } from "@/components/lesson/LessonContextBar";
import { LessonPager } from "@/components/lesson/LessonPager";
import { LessonFinish } from "@/components/lesson/LessonFinish";
import { DoneMark, LessonProgressProvider } from "@/components/lesson/LessonProgress";
import { lessonAccess } from "@/components/lesson/lesson-access";
import {
  getLearnerLessonState,
  getLessonPlace,
  loadLesson,
  pickLessonContent,
  titleLanguage,
} from "@/components/lesson/lesson-context";
import { excerpt, leadVideo } from "@/components/lesson/tiptap";
import { LessonFeedback } from "@/components/feedback/LessonFeedback";
import { ShareButton } from "@/components/feedback/ShareButton";
import { OG_LOCALES } from "@/components/feedback/og-locale";

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
  const picked = pickLessonContent(lesson, locale);
  const description = picked.hasContent ? excerpt(picked.doc, 160) : "";

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
  const [lesson, session] = await Promise.all([loadLesson(slug), auth()]);
  if (!lesson) notFound();

  const userId = session?.user?.id;
  const access = lessonAccess(lesson, session?.user);
  if (access === "hidden") notFound();

  const t = await getTranslations("lesson");
  const title = localized(lesson.title, locale);
  const titleLang = titleLanguage(lesson.title, locale);
  const lessonPath = `/${locale}/learn/${slug}`;
  const signInHref = `/login?callbackUrl=${encodeURIComponent(lessonPath)}`;

  if (access === "signIn") {
    return (
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
  }

  const [learner, quiz] = await Promise.all([
    getLearnerLessonState(userId, lesson.id),
    getPublicQuizByLessonId(lesson.id),
  ]);
  const path = await getPathForLesson(lesson.id, learner.completed);
  const signedIn = Boolean(userId);
  const place = await getLessonPlace(lesson.id, locale, path, signedIn);

  const picked = pickLessonContent(lesson, locale);
  const lead = picked.hasContent ? leadVideo(picked.doc) : null;
  const contentDir = picked.language === "ar" ? "rtl" : "ltr";
  const blockMessages =
    picked.hasContent && picked.language !== locale
      ? (await import(`@/messages/${picked.language}/blocks.json`)).default
      : null;
  const videoTitle = t("videoTitle", { title });
  const checkHref = quizQuestionCount(quiz) > 0 ? `/learn/${slug}/check` : null;
  const isDone = learner.completed.has(lesson.id);

  const minutesLine =
    lesson.minutes > 0
      ? lead
        ? t("minutesWatch", { count: lesson.minutes })
        : t("minutesRead", { count: lesson.minutes })
      : null;

  return (
    <LessonProgressProvider lessonId={lesson.id} lessonSlug={lesson.slug} initialDone={isDone}>
      <LessonContextBar
        place={place}
        lessonId={lesson.id}
        saved={learner.saved}
        signedIn={signedIn}
        signInHref={signInHref}
      />

      <article
        aria-labelledby="lesson-title"
        className="mx-auto w-full max-w-3xl px-4 pt-10 pb-20 sm:px-6 sm:pt-14 sm:pb-28 lg:px-8"
      >
        <header>
          <h1
            id="lesson-title"
            lang={titleLang}
            dir={titleLang === "ar" ? "rtl" : "ltr"}
            className="text-title font-semibold text-balance"
          >
            {title}
          </h1>
          {minutesLine || signedIn ? (
            <p className="mt-4 flex flex-wrap items-center gap-2">
              {minutesLine ? (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-wash px-2.5 py-1 text-meta font-medium text-ink-2">
                  <Clock aria-hidden="true" strokeWidth={1.75} className="size-3.5" />
                  <span className="tabular">{minutesLine}</span>
                </span>
              ) : null}
              {signedIn ? <DoneMark /> : null}
            </p>
          ) : null}
          {picked.hasContent ? (
            <div className="mt-5">
              <ShareButton kind="lesson" slug={slug} title={title} />
            </div>
          ) : null}
          {picked.isFallback ? (
            <p className="mt-5 max-w-[60ch] text-meta text-ink-2">
              {t("translationMissing")}
            </p>
          ) : null}
        </header>

        <div dir={contentDir} lang={picked.language} className="mt-10 sm:mt-12">
          {lead ? (
            <>
              <LessonVideo src={lead.src} title={videoTitle} />
              {lead.caption.length > 0 ? (
                <div className="mt-5 flex max-w-[68ch] flex-col gap-2 text-ink-2">
                  {lead.caption.map((line, index) => (
                    <p key={index}>{line}</p>
                  ))}
                </div>
              ) : null}
            </>
          ) : picked.hasContent ? (
            blockMessages ? (
              <LessonContentIsland
                locale={picked.language}
                messages={blockMessages}
                doc={picked.doc}
                lessonSlug={slug}
                videoTitle={videoTitle}
              />
            ) : (
              <LessonContent doc={picked.doc} lessonSlug={slug} videoTitle={videoTitle} />
            )
          ) : (
            <EmptyState
              title={t("emptyTitle")}
              body={t("emptyBody")}
              art="lantern"
              action={
                place.upNext ? (
                  <Button href={`/learn/${place.upNext.slug}`}>{t("continue")}</Button>
                ) : (
                  <Button href={place.path ? `/paths/${place.path.slug}` : "/paths"}>
                    {place.path ? t("backToPath") : t("seeAllPaths")}
                  </Button>
                )
              }
            />
          )}
        </div>

        {picked.hasContent ? (
          <div className="mt-16 sm:mt-20">
            <LessonFinish
              lessonId={lesson.id}
              signedIn={signedIn}
              stage={place.path?.stage ?? null}
              checkHref={checkHref}
              upNext={place.upNext}
              step={place.step}
              cells={place.cells}
              completesStep={place.completesStep}
              completesPath={place.completesPath}
              path={place.path ? { slug: place.path.slug, title: place.path.title } : null}
            />
          </div>
        ) : null}

        {picked.hasContent ? <LessonFeedback lessonSlug={slug} className="mt-10 sm:mt-12" /> : null}

        <LessonPager
          previous={place.previous}
          next={place.next}
          stage={place.path?.stage ?? null}
          className="mt-8"
        />
      </article>
    </LessonProgressProvider>
  );
}
