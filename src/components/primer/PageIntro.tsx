interface PageIntroProps {
  title: React.ReactNode;
  lead?: React.ReactNode;
  aside?: React.ReactNode;
  children?: React.ReactNode;
  size?: "title" | "display";
}

export function PageIntro({ title, lead, aside, children, size = "title" }: PageIntroProps) {
  return (
    <header className="flex flex-col gap-6 pt-12 pb-10 sm:pt-16 sm:pb-12 md:flex-row md:items-end md:justify-between">
      <div className="max-w-3xl">
        <h1
          className={`${size === "display" ? "text-display" : "text-title"} font-semibold text-balance`}
        >
          {title}
        </h1>
        {lead ? <p className="mt-4 max-w-[60ch] text-lg text-ink-2 text-pretty">{lead}</p> : null}
        {children}
      </div>
      {aside ? <div className="shrink-0">{aside}</div> : null}
    </header>
  );
}
