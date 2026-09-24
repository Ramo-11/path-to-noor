interface HomeSectionProps {
  labelledBy: string;
  children: React.ReactNode;
}

export function HomeSection({ labelledBy, children }: HomeSectionProps) {
  return (
    <section aria-labelledby={labelledBy} className="border-t border-rule">
      <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">{children}</div>
    </section>
  );
}
