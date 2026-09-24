import { ILLUSTRATIONS, SMALL_WIDTH, type IllustrationName } from "@/lib/illustrations";

interface IllustrationProps {
  name: IllustrationName;
  sizes: string;
  priority?: boolean;
  className?: string;
}

export function Illustration({ name, sizes, priority = false, className = "" }: IllustrationProps) {
  const { width, height } = ILLUSTRATIONS[name];
  const base = `/illustrations/${name}`;

  return (
    <img
      src={`${base}.webp`}
      srcSet={`${base}-sm.webp ${SMALL_WIDTH}w, ${base}.webp ${width}w`}
      sizes={sizes}
      width={width}
      height={height}
      alt=""
      loading={priority ? "eager" : "lazy"}
      fetchPriority={priority ? "high" : "auto"}
      decoding="async"
      draggable={false}
      className={`illo ${className}`}
    />
  );
}
