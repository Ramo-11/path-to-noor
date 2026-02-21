import { AnimateIn } from "@/components/shared/AnimateIn";

interface SectionHeadingProps {
  title: string;
  subtitle?: string;
  centered?: boolean;
  className?: string;
  light?: boolean;
}

export function SectionHeading({
  title,
  subtitle,
  centered = true,
  className = "",
  light = false,
}: SectionHeadingProps) {
  return (
    <AnimateIn preset="fade-up" className={`${centered ? "text-center" : "text-start"} ${className}`}>
      <h2
        className={`font-heading text-3xl font-bold sm:text-4xl lg:text-[2.75rem] tracking-tight ${
          light ? "text-white" : "text-slate-900 dark:text-white"
        }`}
      >
        {title}
      </h2>
      <div className={`mt-3 ${centered ? "decorative-line-center" : "decorative-line"}`} />
      {subtitle && (
        <p
          className={`mt-6 max-w-2xl text-lg leading-relaxed ${centered ? "mx-auto" : ""} ${
            light ? "text-white/70" : "text-slate-600 dark:text-slate-400"
          }`}
        >
          {subtitle}
        </p>
      )}
    </AnimateIn>
  );
}
