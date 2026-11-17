import { useTranslations } from "next-intl";
import type { AbstractIntlMessages } from "next-intl";
import type { Locale } from "@/lib/stages";
import { LessonContent } from "./LessonContent";
import { LessonContentIsland } from "./LessonContentIsland";
import { LessonVideo } from "./LessonVideo";
import { leadVideo } from "./tiptap";

interface LessonBodyProps {
  doc: unknown;
  language: Locale;
  hasContent: boolean;
  blockMessages: AbstractIntlMessages | null;
  slug: string;
  title: string;
  empty: React.ReactNode;
}

export function LessonBody({ doc, language, hasContent, blockMessages, slug, title, empty }: LessonBodyProps) {
  const t = useTranslations("lesson");
  if (!hasContent) return <>{empty}</>;

  const videoTitle = t("videoTitle", { title });
  const lead = leadVideo(doc);
  if (lead) {
    return (
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
    );
  }
  return blockMessages ? (
    <LessonContentIsland locale={language} messages={blockMessages} doc={doc} lessonSlug={slug} videoTitle={videoTitle} />
  ) : (
    <LessonContent doc={doc} lessonSlug={slug} videoTitle={videoTitle} />
  );
}
