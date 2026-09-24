import { ExternalLink, Play } from "lucide-react";

interface LessonVideoProps {
  src: string;
  title: string;
  className?: string;
}

export function LessonVideo({ src, title, className = "" }: LessonVideoProps) {
  return (
    <div
      className={`lesson-video relative aspect-video w-full overflow-hidden rounded-[var(--radius-cell)] bg-wash shadow-soft ${className}`}
    >
      <iframe
        src={src}
        title={title}
        loading="lazy"
        allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        referrerPolicy="strict-origin-when-cross-origin"
        className="absolute inset-0 size-full border-0"
      />
    </div>
  );
}

interface LinkedVideoProps {
  href: string;
  label: string;
  newTabLabel: string;
}

export function LinkedVideo({ href, label, newTabLabel }: LinkedVideoProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="card card-link group flex items-center gap-4 p-4 no-underline! sm:p-5"
    >
      <span className="inline-flex size-12 shrink-0 items-center justify-center rounded-full bg-primary text-on-primary shadow-soft">
        <Play aria-hidden="true" strokeWidth={2} className="size-5 translate-x-px" fill="currentColor" />
      </span>
      <span className="min-w-0 flex-1 font-medium text-ink">{label}</span>
      <ExternalLink aria-hidden="true" strokeWidth={1.75} className="size-4 shrink-0 text-ink-3 group-hover:text-primary" />
      <span className="sr-only">({newTabLabel})</span>
    </a>
  );
}
