import { STAGE_STYLES, type StageKey } from "@/lib/stages";

interface ProgressCellsProps {
  done: number;
  total: number;
  stage: StageKey;
  label: string;
  className?: string;
}

export function ProgressCells({ done, total, stage, label, className = "" }: ProgressCellsProps) {
  const style = STAGE_STYLES[stage];
  const cells = Math.max(total, 1);
  const segmented = cells <= 24;

  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={total}
      aria-valuenow={done}
      className={`flex h-2 w-full gap-[3px] ${className}`}
    >
      {segmented ? (
        Array.from({ length: cells }, (_, i) => (
          <span
            key={i}
            className={`h-full flex-1 rounded-[2px] ${i < done ? style.fill : "bg-rule"}`}
          />
        ))
      ) : (
        <span className="relative h-full flex-1 overflow-hidden rounded-[2px] bg-rule">
          <span
            className={`absolute inset-y-0 start-0 ${style.fill}`}
            style={{ width: `${Math.round((done / cells) * 100)}%` }}
          />
        </span>
      )}
    </div>
  );
}
