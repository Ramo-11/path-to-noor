import { ChevronDown } from "lucide-react";
import type { ReactNode } from "react";

export function MoreBlock({ title, children }: { title: string; children: ReactNode }) {
  return (
    <details className="group overflow-hidden rounded-[var(--radius-cell)] border border-rule bg-surface">
      <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-3 px-5 py-3 text-[1rem] font-semibold text-primary [&::-webkit-details-marker]:hidden">
        {title}
        <ChevronDown
          aria-hidden="true"
          strokeWidth={2}
          className="size-4 shrink-0 text-ink-3 transition-transform duration-200 group-open:rotate-180"
        />
      </summary>
      <div className="space-y-[1.1em] border-t border-rule px-5 pt-4 pb-5">{children}</div>
    </details>
  );
}
