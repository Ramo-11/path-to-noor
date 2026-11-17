"use client";

import { useTranslations } from "next-intl";
import { Clock } from "lucide-react";
import { LessonFeedback } from "@/components/feedback/LessonFeedback";
import { ShareButton } from "@/components/feedback/ShareButton";
import { LessonPager } from "./LessonPager";
import { DoneMark, LessonProgressProvider } from "./LessonProgress";
import { EMPTY_PLACE, LessonBarRegion, LessonFinishRegion, useLessonMember } from "./LessonMember";
import type { LessonPlace } from "./lesson-context";

interface LessonShellProps {
  lessonId: string;
  slug: string;
  title: string;
  titleLang: string;
  minutes: number;
  isWatch: boolean;
  hasContent: boolean;
  isFallback: boolean;
  contentDir: "ltr" | "rtl";
  contentLang: string;
  checkHref: string | null;
  signInHref: string;
  guestPlace: LessonPlace | null;
  body: React.ReactNode;
}

export function LessonShell({
  lessonId,
  slug,
  title,
  titleLang,
  minutes,
  isWatch,
  hasContent,
  isFallback,
  contentDir,
  contentLang,
  checkHref,
  signInHref,
  guestPlace,
  body,
}: LessonShellProps) {
  const t = useTranslations("lesson");
  const { data } = useLessonMember();
  const place = data?.place ?? guestPlace ?? EMPTY_PLACE;
  const stage = place.path?.stage ?? null;

  const minutesLine =
    minutes > 0 ? (isWatch ? t("minutesWatch", { count: minutes }) : t("minutesRead", { count: minutes })) : null;

  return (
    <LessonProgressProvider lessonId={lessonId} lessonSlug={slug} initialDone={data?.completed ?? false}>
      <LessonBarRegion lessonId={lessonId} guestPlace={guestPlace ?? EMPTY_PLACE} signInHref={signInHref} />

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
          {minutesLine || data ? (
            <p className="mt-4 flex flex-wrap items-center gap-2">
              {minutesLine ? (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-wash px-2.5 py-1 text-meta font-medium text-ink-2">
                  <Clock aria-hidden="true" strokeWidth={1.75} className="size-3.5" />
                  <span className="tabular">{minutesLine}</span>
                </span>
              ) : null}
              {data ? <DoneMark /> : null}
            </p>
          ) : null}
          {hasContent ? (
            <div className="mt-5">
              <ShareButton kind="lesson" slug={slug} title={title} />
            </div>
          ) : null}
          {isFallback ? (
            <p className="mt-5 max-w-[60ch] text-meta text-ink-2">{t("translationMissing")}</p>
          ) : null}
        </header>

        <div dir={contentDir} lang={contentLang} className="mt-10 sm:mt-12">
          {body}
        </div>

        {hasContent ? (
          <div className="mt-16 sm:mt-20">
            <LessonFinishRegion lessonId={lessonId} guestPlace={guestPlace ?? EMPTY_PLACE} checkHref={checkHref} />
          </div>
        ) : null}

        {hasContent ? <LessonFeedback lessonSlug={slug} className="mt-10 sm:mt-12" /> : null}

        <LessonPager previous={place.previous} next={place.next} stage={stage} className="mt-8" />
      </article>
    </LessonProgressProvider>
  );
}
