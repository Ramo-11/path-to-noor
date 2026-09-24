import { Illustration } from "@/components/primer/Illustration";
import { StageMark } from "@/components/primer/StageMark";
import { STAGE_ART } from "@/lib/illustrations";
import { STAGE_STYLES, type StageKey } from "@/lib/stages";

interface StageBannerProps {
  stage: StageKey;
  title: string;
  sentence: string;
  animate?: boolean;
  headingId?: string;
  headingRef?: React.RefObject<HTMLHeadingElement | null>;
  children?: React.ReactNode;
}

export function StageBanner({
  stage,
  title,
  sentence,
  animate = false,
  headingId,
  headingRef,
  children,
}: StageBannerProps) {
  const style = STAGE_STYLES[stage];

  return (
    <div
      className={`grid overflow-hidden rounded-[var(--radius-panel)] ${style.tint} md:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)]`}
    >
      <div className="flex flex-col justify-center px-6 pt-8 pb-6 sm:px-10 sm:pt-10 sm:pb-8 md:py-14 lg:px-14">
        <h1
          id={headingId}
          ref={headingRef}
          tabIndex={-1}
          className="flex items-start gap-3 text-title font-semibold text-balance focus-visible:outline-none!"
        >
          <StageMark stage={stage} size="lg" className="mt-1 sm:mt-1.5" />
          <span>{title}</span>
        </h1>
        <p className="mt-4 max-w-[46ch] text-lg text-ink-2 text-pretty">{sentence}</p>
        {children}
      </div>
      <div className="px-3 pb-3 md:py-3 md:ps-0">
        <div
          className={`aspect-[4/3] overflow-hidden rounded-[calc(var(--radius-panel)-0.5rem)] md:aspect-auto md:h-full md:min-h-[16rem] ${
            animate ? "fill-up" : ""
          }`}
        >
          <Illustration name={STAGE_ART[stage]} sizes="(min-width: 768px) 48vw, 100vw" priority />
        </div>
      </div>
    </div>
  );
}
