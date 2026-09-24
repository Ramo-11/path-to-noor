"use client";

import { NextIntlClientProvider } from "next-intl";
import { LessonContent } from "@/components/lesson/LessonContent";
import blocks from "@/messages/en/blocks.json";

export function LessonPreview({ content }: { content: unknown }) {
  return (
    <NextIntlClientProvider locale="en" messages={{ blocks }}>
      <LessonContent doc={content} lessonSlug="admin-preview" videoTitle="Lesson video" />
    </NextIntlClientProvider>
  );
}
