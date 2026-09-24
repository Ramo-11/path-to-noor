import { useTranslations } from "next-intl";

type MentorRequestStatus = "pending" | "assigned" | "rejected";

const TONES: Record<MentorRequestStatus, string> = {
  pending: "bg-accent-tint text-accent-text",
  assigned: "bg-stage2-tint text-stage2-text",
  rejected: "bg-wash text-ink-2",
};

const LABEL_KEY: Record<MentorRequestStatus, string> = {
  pending: "statusPending",
  assigned: "statusAssigned",
  rejected: "statusNotMatched",
};

export function StatusChip({ status }: { status: MentorRequestStatus }) {
  const t = useTranslations("mentor");
  return (
    <span className={`inline-flex items-center rounded-full px-3 py-1 text-meta font-medium ${TONES[status]}`}>
      {t(LABEL_KEY[status])}
    </span>
  );
}
