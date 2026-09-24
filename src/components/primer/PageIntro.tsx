interface PageIntroProps {
  title: React.ReactNode;
  lead?: React.ReactNode;
  aside?: React.ReactNode;
  children?: React.ReactNode;
  size?: "title" | "display";
}

export function PageIntro({ title, lead, aside, children, size = "title" }: PageIntroProps) {
  return (
    <header className="flex flex-col gap-6 pt-10 pb-8 sm:pt-14 sm:pb-10 md:flex-row md:items-end md:justify-between">
      <div className="max-w-3xl">
        <h1
          className={`${size === "display" ? "text-display" : "text-title"} font-semibold text-balance`}
        >
          {title}
        </h1>
        {lead ? <p className="mt-3 max-w-[52ch] text-lg text-ink-2 text-pretty">{lead}</p> : null}
        {children}
      </div>
      {aside ? <div className="shrink-0">{aside}</div> : null}
    </header>
  );
}
