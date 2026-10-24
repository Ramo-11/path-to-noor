import { toneStyle } from "@/lib/path-tone";
import type { StageKey } from "@/lib/stages";

interface PathProgressProps {
  done: number;
  total: number;
  stage: StageKey | null;
  label: string;
  className?: string;
}

export function PathProgress({ done, total, stage, label, className = "" }: PathProgressProps) {
  const style = toneStyle(stage);
  const cells = Math.max(total, 1);
  const segmented = cells <= 24;

  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={total}
      aria-valuenow={done}
      className={`flex h-2 w-full gap-1 ${className}`}
    >
      {segmented ? (
        Array.from({ length: cells }, (_, i) => (
          <span key={i} className={`h-full flex-1 rounded-full ${i < done ? style.fill : "bg-wash"}`} />
        ))
      ) : (
        <span className="relative h-full flex-1 overflow-hidden rounded-full bg-wash">
          <span
            className={`absolute inset-y-0 start-0 rounded-full ${style.fill}`}
            style={{ width: `${Math.round((done / cells) * 100)}%` }}
          />
        </span>
      )}
    </div>
  );
}
