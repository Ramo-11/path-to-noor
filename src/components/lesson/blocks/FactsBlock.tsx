import { Inline } from "./Inline";
import { FACT_ICON_COMPONENTS } from "./fact-icons";
import type { FactsAttrs } from "@/lib/lesson-blocks";

export function FactsBlock({ title, items }: FactsAttrs) {
  const cols = items.length >= 6 ? "lg:grid-cols-6" : items.length >= 3 ? "lg:grid-cols-3" : "lg:grid-cols-2";
  return (
    <div>
      {title.trim() ? <p className="mb-3 font-semibold text-ink">{title}</p> : null}
      <ul className={`grid grid-cols-2 gap-3 ${cols}`}>
        {items.map((item, index) => {
          const Icon = item.icon ? FACT_ICON_COMPONENTS[item.icon] : null;
          return (
            <li
              key={index}
              className="flex flex-col items-start gap-2 rounded-[var(--radius-cell)] border border-rule bg-surface px-4 py-4 shadow-soft"
            >
              <span
                aria-hidden="true"
                className="flex size-9 items-center justify-center rounded-full bg-stage1-tint text-[0.9375rem] font-semibold text-stage1-text tabular"
              >
                {Icon ? <Icon strokeWidth={1.75} className="size-5" /> : index + 1}
              </span>
              <p className="font-semibold leading-snug text-ink">{item.label}</p>
              {item.text.trim() ? (
                <p className="text-[0.9375rem] leading-snug text-ink-2">
                  <Inline text={item.text} />
                </p>
              ) : null}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
