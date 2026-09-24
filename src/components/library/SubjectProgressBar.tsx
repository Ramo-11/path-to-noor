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
      className={`flex h-2 w-full gap-1 ${className}`}
    >
      {segmented ? (
        Array.from({ length: cells }, (_, i) => (
          <span key={i} className={`h-full flex-1 rounded-full ${i < done ? "bg-primary" : "bg-wash"}`} />
        ))
      ) : (
        <span className="relative h-full flex-1 overflow-hidden rounded-full bg-wash">
          <span
            className="absolute inset-y-0 start-0 rounded-full bg-primary"
            style={{ width: `${Math.round((done / cells) * 100)}%` }}
          />
        </span>
      )}
    </div>
  );
}
