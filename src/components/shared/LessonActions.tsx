"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import { MarkCompleteButton } from "./MarkCompleteButton";
import { BookmarkButton } from "./BookmarkButton";
import {
  ArrowRight,
  ArrowLeft,
  Trophy,
  Route,
  X,
  FileQuestion,
} from "lucide-react";

interface LessonActionsProps {
  lessonId: string;
  lessonSlug: string;
  initialCompleted: boolean;
  hasQuiz: boolean;
  nextLesson: { title: { en: string; ar: string; es: string }; slug: string } | null;
  previousLesson: { title: { en: string; ar: string; es: string }; slug: string } | null;
  pathSlug: string | null;
  pathTitle: { en: string; ar: string; es: string } | null;
  currentIndex: number;
  totalInModule: number;
}

export function LessonActions({
  lessonId,
  lessonSlug,
  initialCompleted,
  hasQuiz,
  nextLesson,
  previousLesson,
  pathSlug,
  pathTitle,
  currentIndex,
  totalInModule,
}: LessonActionsProps) {
  const t = useTranslations("lesson");
  const tQuiz = useTranslations("quiz");
  const locale = useLocale();
  const [showCongrats, setShowCongrats] = useState(false);

  // Suppress unused variable — pathTitle reserved for breadcrumb display in modal
  void pathTitle;

  const GoArrow = locale === "ar" ? ArrowLeft : ArrowRight;
  const BackArrow = locale === "ar" ? ArrowRight : ArrowLeft;

  function handleComplete() {
    setShowCongrats(true);
  }

  return (
    <>
      {/* Progress in module */}
      <div className="flex items-center justify-between text-sm text-slate-500 dark:text-slate-400 mb-4">
        <span>
          {locale === "ar"
            ? `الدرس ${currentIndex + 1} من ${totalInModule}`
            : locale === "es"
              ? `Leccion ${currentIndex + 1} de ${totalInModule}`
              : `Lesson ${currentIndex + 1} of ${totalInModule}`}
        </span>
      </div>

      {/* Main Actions */}
      <div className="flex flex-wrap items-center justify-center gap-3 mb-6">
        <MarkCompleteButton
          lessonId={lessonId}
          initialCompleted={initialCompleted}
          onComplete={handleComplete}
        />
        <BookmarkButton lessonId={lessonId} />
      </div>

      {/* Quiz Button */}
      {hasQuiz && (
        <div className="text-center mb-6">
          <Link
            href={`/learn/${lessonSlug}/quiz`}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-accent-500 hover:bg-accent-600 text-white font-medium rounded-lg transition-colors text-sm"
          >
            <FileQuestion className="h-4 w-4" />
            {tQuiz("takeQuiz")}
          </Link>
        </div>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between pt-6 border-t border-slate-200 dark:border-slate-800">
        {previousLesson ? (
          <Link
            href={`/learn/${previousLesson.slug}`}
            className="group flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
          >
            <BackArrow className="h-4 w-4" />
            <span className="hidden sm:inline">
              {previousLesson.title[locale as "en" | "ar" | "es"] || previousLesson.title.en}
            </span>
            <span className="sm:hidden">{t("previousLesson")}</span>
          </Link>
        ) : (
          <div />
        )}

        {nextLesson ? (
          <Link
            href={`/learn/${nextLesson.slug}`}
            className="group inline-flex items-center gap-2 px-5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold rounded-lg transition-colors"
          >
            {t("nextLesson")}
            <GoArrow className="h-4 w-4" />
          </Link>
        ) : pathSlug ? (
          <Link
            href={`/paths/${pathSlug}`}
            className="group inline-flex items-center gap-2 px-5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold rounded-lg transition-colors"
          >
            <Route className="h-4 w-4" />
            {t("backToPath")}
          </Link>
        ) : (
          <div />
        )}
      </div>

      {/* Congratulations Modal */}
      {showCongrats && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="relative bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-8 max-w-md w-full text-center">
            <button
              onClick={() => setShowCongrats(false)}
              className="absolute top-4 end-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/30 mb-4">
              <Trophy className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
            </div>

            <h2 className="font-heading text-2xl font-bold text-slate-900 dark:text-white mb-2">
              {locale === "ar" ? "أحسنت!" : locale === "es" ? "!Bien hecho!" : "Well done!"}
            </h2>
            <p className="text-slate-500 dark:text-slate-400 mb-6">
              {locale === "ar"
                ? "لقد أكملت هذا الدرس بنجاح. استمر في التعلم!"
                : locale === "es"
                  ? "Has completado esta leccion. !Sigue aprendiendo!"
                  : "You've completed this lesson. Keep up the great work!"}
            </p>

            <div className="flex flex-col gap-3">
              {hasQuiz && (
                <Link
                  href={`/learn/${lessonSlug}/quiz`}
                  onClick={() => setShowCongrats(false)}
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-accent-500 hover:bg-accent-600 text-white font-medium rounded-lg transition-colors text-sm"
                >
                  <FileQuestion className="h-4 w-4" />
                  {tQuiz("takeQuiz")}
                </Link>
              )}
              {nextLesson && (
                <Link
                  href={`/learn/${nextLesson.slug}`}
                  onClick={() => setShowCongrats(false)}
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors text-sm"
                >
                  {t("nextLesson")}
                  <GoArrow className="h-4 w-4" />
                </Link>
              )}
              {pathSlug && (
                <Link
                  href={`/paths/${pathSlug}`}
                  onClick={() => setShowCongrats(false)}
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 font-medium rounded-lg transition-colors text-sm"
                >
                  <Route className="h-4 w-4" />
                  {t("backToPath")}
                </Link>
              )}
              <button
                onClick={() => setShowCongrats(false)}
                className="text-sm text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
              >
                {locale === "ar" ? "إغلاق" : locale === "es" ? "Cerrar" : "Close"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
