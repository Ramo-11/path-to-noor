import { BookMarked, ClipboardCheck, MessagesSquare } from "lucide-react";
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
    <div className="grid gap-4 sm:grid-cols-3">
      <Link href="/saved" className="card card-link flex items-center gap-3 p-5">
        <span aria-hidden="true" className="grid size-10 shrink-0 place-items-center rounded-full bg-sky-tint text-primary">
          <BookMarked strokeWidth={1.75} className="size-5" />
        </span>
        <span className="min-w-0">
          <span className="block font-medium text-ink">{t("saved")}</span>
          <span className="text-meta text-ink-3 tabular">{savedCount}</span>
        </span>
      </Link>

      <div className="card flex items-center gap-3 p-5">
        <span
          aria-hidden="true"
          className="grid size-10 shrink-0 place-items-center rounded-full bg-stage2-tint text-stage2-text"
        >
          <ClipboardCheck strokeWidth={1.75} className="size-5" />
        </span>
        <span className="min-w-0">
          <span className="block font-medium text-ink">{t("knowledgeChecksTaken")}</span>
          <span className="text-meta text-ink-3 tabular">{quizCount}</span>
        </span>
      </div>

      <Link href="/mentor" className="card card-link flex items-center gap-3 p-5">
        <span
          aria-hidden="true"
          className="grid size-10 shrink-0 place-items-center rounded-full bg-accent-tint text-accent-text"
        >
          <MessagesSquare strokeWidth={1.75} className="size-5" />
        </span>
        <span className="min-w-0">
          <span className="block font-medium text-ink">{t("talkToMentor")}</span>
          <span className="text-meta text-ink-3">{t(mentorStatusKey[mentorStatus])}</span>
        </span>
      </Link>
    </div>
  );
}
