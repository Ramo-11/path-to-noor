import type { LocalizedText } from "@/lib/stages";

export type MentorStatus = "none" | "pending" | "assigned";

export interface JourneyExtras {
  savedCount: number;
  quizCount: number;
  recentItems: Array<{ slug: string; title: LocalizedText; completedAt: string }>;
  mentorStatus: MentorStatus;
}

export type JourneyPayload = { access: "guest" } | ({ access: "open" } & JourneyExtras);
