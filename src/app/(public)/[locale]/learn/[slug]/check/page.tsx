import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ArrowLeft } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { getPublicQuizByLessonId } from "@/lib/data";
import { getPathForLesson } from "@/lib/learning";
import { localized } from "@/lib/stages";
import { Button } from "@/components/primer/Button";
import { EmptyState } from "@/components/primer/EmptyState";
import { CheckRegion } from "@/components/lesson/CheckRegion";
import { toClientQuiz } from "@/components/lesson/check-quiz";
import { lessonAccess } from "@/components/lesson/lesson-access";
import { getLessonPlace, loadLesson } from "@/components/lesson/lesson-context";

export const revalidate = 300;

export function generateStaticParams() {
  return [];
}

interface PageProps {
  params: Promise<{ locale: string; slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  const t = await getTranslations({ locale, namespace: "check" });
  const lesson = await loadLesson(slug);
  return {
    title: lesson ? t("metaTitle", { lesson: localized(lesson.title, locale) }) : t("title"),
    robots: { index: false },
  };
}

export default async function KnowledgeCheckPage({ params }: PageProps) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const lesson = await loadLesson(slug);
  if (!lesson) notFound();

  const t = await getTranslations("check");
  const lessonTitle = localized(lesson.title, locale);
  const lessonHref = `/learn/${slug}`;
  const signInHref = `/login?callbackUrl=${encodeURIComponent(`/${locale}/learn/${slug}/check`)}`;
  const gated = lessonAccess(lesson, null) === "signIn";

  const header = (
    <>
      <Link
        href={lessonHref}
        className="-ms-1 inline-flex min-h-11 items-center gap-2 px-1 text-[0.9375rem] font-medium text-ink-2 transition-colors duration-150 hover:text-ink"
      >
        <ArrowLeft aria-hidden="true" strokeWidth={2} className="size-4 rtl:rotate-180" />
        {t("backToLesson")}
      </Link>
      <h1 className="mt-6 text-title font-semibold text-balance">{t("title")}</h1>
    </>
  );

  const wall = (
    <div className="mt-10">
      <EmptyState
        title={t("signInTitle")}
        body={t("signInBody")}
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
  );

  let guestQuiz: ReturnType<typeof toClientQuiz> | undefined;
  let guestPlace: Awaited<ReturnType<typeof getLessonPlace>> | null = null;
  if (!gated) {
    guestQuiz = toClientQuiz(await getPublicQuizByLessonId(lesson.id), locale);
    if (guestQuiz) {
      const path = await getPathForLesson(lesson.id);
      guestPlace = await getLessonPlace(lesson.id, locale, path, false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-3xl px-4 pt-8 pb-20 sm:px-6 sm:pt-10 sm:pb-28 lg:px-8">
      {header}
      <CheckRegion
        slug={slug}
        lessonTitle={lessonTitle}
        lessonHref={lessonHref}
        guestQuiz={guestQuiz}
        guestPlace={guestPlace}
        wall={gated ? wall : null}
      />
    </div>
  );
}
