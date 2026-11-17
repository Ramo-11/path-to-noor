import type { IllustrationName } from "@/lib/illustrations";
import { Illustration } from "./Illustration";

export type BannerTone = "dawn" | "day" | "evening" | "sky" | "neutral";

const tones: Record<BannerTone, string> = {
  dawn: "bg-stage1-tint",
  day: "bg-stage2-tint",
  evening: "bg-stage3-tint",
  sky: "bg-sky-tint",
  neutral: "bg-canvas",
};

interface PageBannerProps {
  title: React.ReactNode;
  lead?: React.ReactNode;
  art: IllustrationName;
  tone?: BannerTone;
  children?: React.ReactNode;
  titleId?: string;
}

export function PageBanner({ title, lead, art, tone = "neutral", children, titleId }: PageBannerProps) {
  return (
    <header
      className={`mt-4 grid overflow-hidden rounded-[var(--radius-panel)] sm:mt-8 md:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] ${tones[tone]}`}
    >
      <div className="flex flex-col justify-center px-6 pt-8 pb-6 sm:px-10 sm:pt-12 md:py-14 lg:px-14">
        <h1 id={titleId} className="text-title font-semibold text-balance">
          {title}
        </h1>
        {lead ? <p className="mt-3 max-w-[40ch] text-lg text-ink-2 text-pretty">{lead}</p> : null}
        {children ? <div className="mt-7">{children}</div> : null}
      </div>
      <div className="px-3 pb-3 md:py-3 md:ps-0">
        <div className="aspect-[16/9] overflow-hidden rounded-[calc(var(--radius-panel)-0.5rem)] md:aspect-auto md:h-full md:min-h-[17rem]">
          <Illustration name={art} sizes="(min-width: 768px) 48vw, 100vw" priority />
        </div>
      </div>
    </header>
  );
}
