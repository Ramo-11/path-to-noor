interface LessonVideoProps {
  src: string;
  title: string;
  className?: string;
}

export function LessonVideo({ src, title, className = "" }: LessonVideoProps) {
  return (
    <div
      className={`lesson-video relative aspect-video w-full overflow-hidden rounded-[var(--radius-cell)] bg-wash ${className}`}
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
