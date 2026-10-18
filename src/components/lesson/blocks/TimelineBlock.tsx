import { Inline } from "./Inline";
import type { TimelineAttrs } from "@/lib/lesson-blocks";

export function TimelineBlock({ title, events }: TimelineAttrs) {
  return (
    <div className="rounded-[var(--radius-cell)] bg-canvas px-5 py-5 sm:px-6">
      {title.trim() ? <p className="font-semibold text-ink">{title}</p> : null}
      <ol className={title.trim() ? "mt-4" : ""}>
        {events.map((event, index) => (
          <li key={index} className="relative flex gap-4 pb-5 last:pb-0">
            {index < events.length - 1 ? (
              <span aria-hidden="true" className="absolute start-[0.3125rem] top-5 bottom-0 w-px bg-rule" />
            ) : null}
            <span aria-hidden="true" className="relative mt-[0.4rem] size-[0.6875rem] shrink-0 rounded-full bg-stage3" />
            <div className="min-w-0">
              <p className="text-[0.9375rem] font-semibold leading-snug text-stage3-text">{event.when}</p>
              <p className="mt-0.5 text-[1.0625rem] leading-snug text-ink">
                <Inline text={event.text} />
              </p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
