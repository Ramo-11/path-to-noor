import { Inline } from "./Inline";
import type { FlowAttrs } from "@/lib/lesson-blocks";

export function FlowBlock({ title, steps }: FlowAttrs) {
  return (
    <div className="rounded-[var(--radius-cell)] border border-rule bg-surface px-5 py-5 shadow-soft sm:px-6">
      {title.trim() ? <p className="font-semibold text-ink">{title}</p> : null}
      <ol className={title.trim() ? "mt-4" : ""}>
        {steps.map((step, index) => (
          <li key={index} className="relative flex gap-4 pb-5 last:pb-0">
            {index < steps.length - 1 ? (
              <span aria-hidden="true" className="absolute start-[1.0625rem] top-9 bottom-0 w-px bg-rule" />
            ) : null}
            <span
              aria-hidden="true"
              className="relative flex size-[2.125rem] shrink-0 items-center justify-center rounded-full bg-primary-tint text-[0.9375rem] font-semibold text-primary tabular"
            >
              {index + 1}
            </span>
            <div className="min-w-0 pt-0.5">
              <p className="font-semibold leading-snug text-ink">{step.label}</p>
              {step.text.trim() ? (
                <p className="mt-0.5 text-[1.0625rem] leading-snug text-ink-2">
                  <Inline text={step.text} />
                </p>
              ) : null}
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
