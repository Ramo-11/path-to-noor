"use client";

import { NextIntlClientProvider, type AbstractIntlMessages } from "next-intl";
import { LessonContent } from "./LessonContent";

interface LessonContentIslandProps {
  locale: string;
  messages: AbstractIntlMessages;
  doc: unknown;
  lessonSlug: string;
  videoTitle: string;
}

export function LessonContentIsland({ locale, messages, doc, lessonSlug, videoTitle }: LessonContentIslandProps) {
  return (
    <NextIntlClientProvider locale={locale} messages={{ blocks: messages }}>
      <LessonContent doc={doc} lessonSlug={lessonSlug} videoTitle={videoTitle} />
    </NextIntlClientProvider>
  );
}
