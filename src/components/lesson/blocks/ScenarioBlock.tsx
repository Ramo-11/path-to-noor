import { useTranslations } from "next-intl";
import { Inline } from "./Inline";
import type { ScenarioAttrs } from "@/lib/lesson-blocks";

export function ScenarioBlock({ situation, lines }: ScenarioAttrs) {
  const t = useTranslations("blocks");
  return (
    <div>
      {situation.trim() ? <p className="mb-3 text-[0.9375rem] text-ink-3">{situation}</p> : null}
      <ul className="flex flex-col gap-2.5">
        {lines.map((line, index) => {
          const mine = line.from === "you";
          return (
            <li
              key={index}
              className={`max-w-[85%] rounded-[1.25rem] px-4 py-3 text-[1.0625rem] leading-snug text-ink ${
                mine ? "self-end bg-primary-tint" : "self-start bg-wash"
              }`}
            >
              <span className="sr-only">{mine ? t("scenarioYou") : t("scenarioThem")}: </span>
              <Inline text={line.text} />
            </li>
          );
        })}
      </ul>
    </div>
  );
}
