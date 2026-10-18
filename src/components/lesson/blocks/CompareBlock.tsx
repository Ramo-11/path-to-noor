import { Inline } from "./Inline";
import type { CompareAttrs, CompareSide } from "@/lib/lesson-blocks";

function Side({ side, tone }: { side: CompareSide; tone: "first" | "second" }) {
  const palette =
    tone === "first" ? "bg-primary-tint text-primary" : "border border-rule bg-surface text-ink";
  return (
    <div className={`rounded-[var(--radius-cell)] px-5 py-5 ${palette}`}>
      <p className="text-[1.0625rem] font-semibold leading-snug">{side.title}</p>
      <ul className="mt-3 list-disc space-y-2 ps-5 text-ink marker:text-ink-3">
        {side.items.map((item, index) => (
          <li key={index} className="text-[1.0625rem] leading-snug">
            <Inline text={item} />
          </li>
        ))}
      </ul>
    </div>
  );
}

export function CompareBlock({ first, second }: CompareAttrs) {
  return (
    <div className="grid grid-cols-1 gap-3 min-[400px]:grid-cols-2">
      <Side side={first} tone="first" />
      <Side side={second} tone="second" />
    </div>
  );
}
