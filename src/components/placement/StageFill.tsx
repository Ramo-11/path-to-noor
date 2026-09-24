import { STAGE_NUMBER, STAGE_STYLES, type StageKey } from "@/lib/stages";

const numeral =
  "absolute start-5 bottom-3 text-[7.5rem] leading-[0.8] font-semibold tracking-[-0.05em] tabular sm:start-6 sm:bottom-4 sm:text-[10rem] md:text-[11rem]";

export function StageFill({ stage, animate }: { stage: StageKey; animate: boolean }) {
  const style = STAGE_STYLES[stage];
  const number = STAGE_NUMBER[stage];

  return (
    <div aria-hidden="true" className="primer-grid self-start">
      <div className="relative h-40 sm:h-52 md:h-64">
        <span className={`${numeral} text-rule`}>{number}</span>
        <div className={`absolute inset-0 ${style.fill} ${animate ? "fill-up" : ""}`}>
          <span className={`${numeral} ${style.onFill}`}>{number}</span>
        </div>
      </div>
    </div>
  );
}
