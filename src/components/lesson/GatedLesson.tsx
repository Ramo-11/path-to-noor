"use client";

import { useLocale, useTranslations } from "next-intl";
import { Button } from "@/components/primer/Button";
import { Notice } from "@/components/primer/Notice";
import { LessonBody } from "./LessonBody";
import { LessonEmptyRegion, useLessonMember } from "./LessonMember";
import { LessonShell } from "./LessonShell";
import { leadVideo } from "./tiptap";

interface GatedLessonProps {
  slug: string;
  title: string;
  titleLang: string;
  signInHref: string;
  wall: React.ReactNode;
}

function GatedSkeleton({ title, titleLang }: { title: string; titleLang: string }) {
  return (
    <div aria-hidden="true" className="mx-auto w-full max-w-3xl px-4 pt-12 pb-20 sm:px-6 sm:pt-16 sm:pb-28 lg:px-8">
      <p lang={titleLang} dir={titleLang === "ar" ? "rtl" : "ltr"} className="text-title font-semibold text-balance">
        {title}
      </p>
      <div className="mt-10 h-96 animate-pulse rounded-[var(--radius-panel)] bg-primary-tint" />
    </div>
  );
}

export function GatedLesson({ slug, title, titleLang, signInHref, wall }: GatedLessonProps) {
  const t = useTranslations("common");
  const locale = useLocale();
  const { resource, data } = useLessonMember();

  if (data) {
    const content = data.content;
    const hasContent = content?.hasContent ?? false;
    const language = content?.language ?? (locale as "en" | "ar" | "es");
    const doc = content?.doc ?? null;
    return (
      <div className="settle">
        <LessonShell
          lessonId={data.lessonId}
          slug={slug}
          title={title}
          titleLang={titleLang}
          minutes={data.minutes}
          isWatch={hasContent && leadVideo(doc) !== null}
          hasContent={hasContent}
          isFallback={content?.isFallback ?? false}
          contentDir={language === "ar" ? "rtl" : "ltr"}
          contentLang={language}
          checkHref={data.hasCheck ? `/learn/${slug}/check` : null}
          signInHref={signInHref}
          guestPlace={null}
          body={
            <LessonBody
              doc={doc}
              language={language}
              hasContent={hasContent}
              blockMessages={content?.blockMessages ?? null}
              slug={slug}
              title={title}
              empty={<LessonEmptyRegion guestPlace={data.place} />}
            />
          }
        />
      </div>
    );
  }

  if (resource.kind === "error") {
    return (
      <div className="mx-auto w-full max-w-3xl px-4 pt-12 pb-20 sm:px-6 sm:pt-16 sm:pb-28 lg:px-8">
        <Notice tone="error">{t("error")}</Notice>
        <div className="mt-4">
          <Button variant="quiet" onClick={resource.retry}>
            {t("tryAgain")}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div data-guest-only>{wall}</div>
      {resource.kind === "loading" ? (
        <div data-member-skeleton>
          <GatedSkeleton title={title} titleLang={titleLang} />
        </div>
      ) : null}
    </>
  );
}
