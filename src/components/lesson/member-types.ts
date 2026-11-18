import type { AbstractIntlMessages } from "next-intl";
import type { Locale } from "@/lib/stages";
import type { LessonPlace } from "./lesson-context";
import type { ClientQuiz } from "./check-quiz";

export interface MemberContent {
  doc: unknown;
  language: Locale;
  isFallback: boolean;
  hasContent: boolean;
  blockMessages: AbstractIntlMessages | null;
}

export type LessonMemberPayload =
  | { access: "guest" }
  | { access: "hidden" }
  | {
      access: "open";
      lessonId: string;
      completed: boolean;
      saved: boolean;
      place: LessonPlace;
      minutes: number;
      hasCheck: boolean;
      content: MemberContent | null;
    };

export type CheckMemberPayload =
  | { access: "guest" }
  | { access: "hidden" }
  | { access: "open"; place: LessonPlace; quiz: ClientQuiz | null };

export type MemberPayload<T extends { access: string }> = Exclude<T, { access: "guest" }>;
