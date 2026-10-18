import { STAGE_NUMBER, STAGE_STYLES, type StageKey } from "@/lib/stages";

interface StageMarkProps {
  stage: StageKey;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

const sizes = {
  sm: "size-7 text-sm rounded-full",
  md: "size-9 text-base rounded-full",
  lg: "size-14 text-2xl rounded-2xl",
  xl: "size-20 text-4xl rounded-3xl",
};

export function StageMark({ stage, size = "md", className = "" }: StageMarkProps) {
  const style = STAGE_STYLES[stage];
  return (
    <span
      aria-hidden="true"
      className={`inline-flex shrink-0 items-center justify-center font-semibold tabular ${style.fill} ${style.onFill} ${sizes[size]} ${className}`}
    >
      {STAGE_NUMBER[stage]}
    </span>
  );
}
