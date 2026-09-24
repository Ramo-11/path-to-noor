interface HomeSectionProps {
  labelledBy: string;
  children: React.ReactNode;
  tone?: "page" | "canvas";
}

export function HomeSection({ labelledBy, children, tone = "page" }: HomeSectionProps) {
  return (
    <section aria-labelledby={labelledBy} className={tone === "canvas" ? "bg-canvas" : ""}>
      <div className="mx-auto w-full max-w-6xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8">{children}</div>
    </section>
  );
}
