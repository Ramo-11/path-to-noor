import type { LucideIcon } from "lucide-react";

interface MetaChipItem {
  icon: LucideIcon;
  label: string;
}

interface MetaChipsProps {
  items: Array<MetaChipItem | null | undefined | false>;
  className?: string;
}

export function MetaChips({ items, className = "" }: MetaChipsProps) {
  const visible = items.filter((item): item is MetaChipItem => Boolean(item));
  if (visible.length === 0) return null;

  return (
    <ul className={`flex flex-wrap items-center gap-2 ${className}`}>
      {visible.map(({ icon: Icon, label }, index) => (
        <li
          key={index}
          className="inline-flex items-center gap-1.5 rounded-full bg-surface/70 px-3 py-1.5 text-meta font-medium text-ink-2"
        >
          <Icon aria-hidden="true" strokeWidth={1.75} className="size-3.5 shrink-0" />
          {label}
        </li>
      ))}
    </ul>
  );
}
