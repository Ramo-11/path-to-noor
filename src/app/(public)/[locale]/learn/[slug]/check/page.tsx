import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { ArrowLeft } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { auth } from "@/lib/auth-config";
import { getPublicQuizByLessonId } from "@/lib/data";
import { getPathForLesson } from "@/lib/learning";
import { localized, type LocalizedText } from "@/lib/stages";
import { Button } from "@/components/primer/Button";
import { EmptyState } from "@/components/primer/EmptyState";
import { KnowledgeCheck, type CheckQuestion } from "@/components/lesson/KnowledgeCheck";
import { lessonAccess } from "@/components/lesson/lesson-access";
import { getLearnerLessonState, getLessonPlace, loadLesson } from "@/components/lesson/lesson-context";

interface PageProps {
  params: Promise<{ locale: string; slug: string }>;
}

function asText(value: unknown): LocalizedText {
  const v = (value && typeof value === "object" ? value : {}) as Record<string, unknown>;
  return {
    en: typeof v.en === "string" ? v.en : "",
    ar: typeof v.ar === "string" ? v.ar : "",
    es: typeof v.es === "string" ? v.es : "",
  };
}

function toClientQuiz(doc: unknown, locale: string): { id: string; questions: CheckQuestion[] } | null {
  if (!doc || typeof doc !== "object") return null;
  const quiz = doc as { _id?: unknown; questions?: unknown };
  if (!Array.isArray(quiz.questions)) return null;

  const questions: CheckQuestion[] = quiz.questions.map((raw) => {
    const q = (raw && typeof raw === "object" ? raw : {}) as { question?: unknown; options?: unknown };
    const options = Array.isArray(q.options) ? q.options : [];
    return {
      question: localized(asText(q.question), locale),
      options: options.map((option) =>
        localized(asText((option as { text?: unknown } | null)?.text), locale)
      ),
    };
  });

  if (questions.length === 0 || questions.some((q) => q.options.length === 0)) return null;
  return { id: String(quiz._id), questions };
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
  const [lesson, session] = await Promise.all([loadLesson(slug), auth()]);
  if (!lesson) notFound();

  const access = lessonAccess(lesson, session?.user);
  if (access === "hidden") notFound();

  const t = await getTranslations("check");
  const userId = session?.user?.id;
  const signedIn = Boolean(userId);
  const lessonTitle = localized(lesson.title, locale);
  const lessonHref = `/learn/${slug}`;
  const signInHref = `/login?callbackUrl=${encodeURIComponent(`/${locale}/learn/${slug}/check`)}`;

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

  if (access === "signIn") {
    return (
      <div className="mx-auto w-full max-w-3xl px-4 pt-8 pb-20 sm:px-6 sm:pt-10 sm:pb-28 lg:px-8">
        {header}
        <div className="mt-10">
          <EmptyState
            title={t("signInTitle")}
            body={t("signInBody")}
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

  const [quizDoc, learner] = await Promise.all([
    getPublicQuizByLessonId(lesson.id),
    getLearnerLessonState(userId, lesson.id),
  ]);
  const quiz = toClientQuiz(quizDoc, locale);

  if (!quiz) {
    return (
      <div className="mx-auto w-full max-w-3xl px-4 pt-8 pb-20 sm:px-6 sm:pt-10 sm:pb-28 lg:px-8">
        {header}
        <div className="mt-10">
          <EmptyState
            title={t("emptyTitle")}
            body={t("emptyBody")}
            action={
              <Button size="lg" href={lessonHref}>
                {t("backToLesson")}
              </Button>
            }
          />
        </div>
      </div>
    );
  }

  const path = await getPathForLesson(lesson.id, learner.completed);
  const place = await getLessonPlace(lesson.id, locale, path, signedIn);

  return (
    <div className="mx-auto w-full max-w-3xl px-4 pt-8 pb-20 sm:px-6 sm:pt-10 sm:pb-28 lg:px-8">
      {header}
      <p className="mt-4 max-w-[60ch] text-lg text-ink-2 text-pretty">
        {t("lead", { lesson: lessonTitle, count: quiz.questions.length })}
      </p>
      <KnowledgeCheck
        slug={slug}
        quizId={quiz.id}
        questions={quiz.questions}
        signedIn={signedIn}
        upNext={place.upNext ? { slug: place.upNext.slug, title: place.upNext.title } : null}
        path={place.path ? { slug: place.path.slug, title: place.path.title } : null}
      />
    </div>
  );
}
