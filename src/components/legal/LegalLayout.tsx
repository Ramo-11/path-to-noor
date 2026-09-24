interface LegalSection {
  id: string;
  title: string;
  content: string;
  items?: string[];
}

interface LegalLayoutProps {
  title: string;
  lastUpdated: string;
  contentsLabel: string;
  sections: LegalSection[];
}

export function LegalLayout({ title, lastUpdated, contentsLabel, sections }: LegalLayoutProps) {
  return (
    <div className="mx-auto w-full max-w-5xl px-4 sm:px-6 lg:px-8">
      <header className="mt-4 overflow-hidden rounded-[var(--radius-panel)] bg-sky-tint px-6 py-10 sm:mt-8 sm:px-10 sm:py-14 lg:px-14">
        <h1 className="max-w-2xl text-title font-semibold text-balance">{title}</h1>
        <span className="mt-4 inline-flex items-center rounded-full bg-page px-3 py-1 text-meta font-medium text-ink-2">
          {lastUpdated}
        </span>
      </header>

      <div className="grid gap-10 py-12 sm:py-16 lg:grid-cols-[minmax(0,1fr)_14rem] lg:items-start lg:gap-16">
        <div className="flex max-w-[68ch] flex-col pb-4">
          {sections.map((section, i) => (
            <section key={section.id} id={section.id} className={`py-7 ${i > 0 ? "primer-rule" : ""}`}>
              <h2 className="text-heading font-semibold text-primary">{section.title}</h2>
              <p className="mt-3 text-ink-2 leading-relaxed">{section.content}</p>
              {section.items ? (
                <ul className="mt-4 flex flex-col gap-2.5">
                  {section.items.map((item, j) => (
                    <li key={j} className="flex items-start gap-3 text-ink-2">
                      <span aria-hidden="true" className="mt-[0.6em] size-1.5 shrink-0 rounded-full bg-ink-3" />
                      <span className="leading-relaxed">{item}</span>
                    </li>
                  ))}
                </ul>
              ) : null}
            </section>
          ))}
        </div>

        {sections.length > 0 ? (
          <nav aria-label={contentsLabel} className="hidden lg:sticky lg:top-20 lg:block">
            <p className="mb-3 text-[0.9375rem] font-medium text-ink">{contentsLabel}</p>
            <ol className="flex flex-col gap-1.5 border-s border-rule ps-4">
              {sections.map((section) => (
                <li key={section.id}>
                  <a href={`#${section.id}`} className="text-[0.9375rem] text-ink-2 hover:text-ink">
                    {section.title}
                  </a>
                </li>
              ))}
            </ol>
          </nav>
        ) : null}
      </div>
    </div>
  );
}
