import { OG_CONTENT_TYPE, OG_SIZE, renderOgImage } from "@/components/feedback/og";
import { loadLesson } from "@/components/lesson/lesson-context";
import { getPathForLesson } from "@/lib/learning";
import { localized } from "@/lib/stages";

export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = "Basmet Dawah";

export default async function Image({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params;
  const lesson = await loadLesson(slug).catch(() => null);
  if (!lesson || lesson.audience === "mentor" || !lesson.guestAccessible) {
    return renderOgImage({ locale });
  }
  const path = await getPathForLesson(lesson.id, new Set(), { isGuest: true }).catch(() => null);
  return renderOgImage({
    locale,
    kind: "lesson",
    title: localized(lesson.title, locale),
    stage: path?.stage ?? undefined,
  });
}
