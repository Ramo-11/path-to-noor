interface SubjectProgressBarProps {
  done: number;
  total: number;
  label: string;
  className?: string;
}

export function SubjectProgressBar({ done, total, label, className = "" }: SubjectProgressBarProps) {
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
          <span key={i} className={`h-full flex-1 rounded-[2px] ${i < done ? "bg-ink" : "bg-rule"}`} />
        ))
      ) : (
        <span className="relative h-full flex-1 overflow-hidden rounded-[2px] bg-rule">
          <span
            className="absolute inset-y-0 start-0 bg-ink"
            style={{ width: `${Math.round((done / cells) * 100)}%` }}
          />
        </span>
      )}
    </div>
  );
}
