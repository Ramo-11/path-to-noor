import { Check } from "lucide-react";
import { localized, type LocalizedText, type StageKey } from "@/lib/stages";
import { toneStyle } from "@/lib/path-tone";

interface OutcomesCardProps {
  title: string;
  outcomes: LocalizedText[];
  stage: StageKey | null;
  locale: string;
  className?: string;
}

export function OutcomesCard({ title, outcomes, stage, locale, className = "" }: OutcomesCardProps) {
  if (outcomes.length === 0) return null;
  const style = toneStyle(stage);

  return (
    <div className={`rounded-[var(--radius-cell)] ${style.tint} p-5 sm:p-7 ${className}`}>
      <h2 className="font-semibold text-ink">{title}</h2>
      <ul className="mt-4 grid gap-x-10 gap-y-2.5 md:grid-cols-2">
        {outcomes.map((outcome, index) => (
          <li key={index} className="flex items-start gap-2.5 text-ink-2 text-pretty">
            <Check aria-hidden="true" strokeWidth={2.25} className={`mt-0.5 size-4 shrink-0 ${style.text}`} />
            <span>{localized(outcome, locale)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
