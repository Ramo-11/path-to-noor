import { Link } from "@/i18n/navigation";
import type { Translate } from "./types";

export type MentorStatus = "none" | "pending" | "assigned";

interface QuickLinksRowProps {
  savedCount: number;
  quizCount: number;
  mentorStatus: MentorStatus;
  t: Translate;
}

const mentorStatusKey: Record<MentorStatus, string> = {
  none: "mentorStatusNone",
  pending: "mentorStatusRequested",
  assigned: "mentorStatusMatched",
};

export function QuickLinksRow({ savedCount, quizCount, mentorStatus, t }: QuickLinksRowProps) {
  return (
    <div className="primer-grid grid-cols-1 sm:grid-cols-3">
      <Link
        href="/saved"
        className="flex flex-col gap-1 px-5 py-4 transition-colors duration-150 hover:bg-wash sm:px-6"
      >
        <span className="text-ink">
          {t("saved")} ({savedCount})
        </span>
      </Link>
      <div className="flex flex-col gap-1 px-5 py-4 sm:px-6">
        <span className="text-ink">
          {t("knowledgeChecksTaken")} ({quizCount})
        </span>
      </div>
      <Link
        href="/mentor"
        className="flex flex-col gap-1 px-5 py-4 transition-colors duration-150 hover:bg-wash sm:px-6"
      >
        <span className="text-ink">{t("talkToMentor")}</span>
        <span className="text-meta text-ink-3">{t(mentorStatusKey[mentorStatus])}</span>
      </Link>
    </div>
  );
}
