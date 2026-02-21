interface StatusBadgeProps {
  published: boolean;
}

export function StatusBadge({ published }: StatusBadgeProps) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
        published
          ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400"
          : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
      }`}
    >
      {published ? "Published" : "Draft"}
    </span>
  );
}
