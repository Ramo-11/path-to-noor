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
    <div className="mx-auto w-full max-w-3xl px-4 sm:px-6 lg:px-8">
      <header className="pt-12 pb-8 sm:pt-16 sm:pb-10">
        <h1 className="text-title font-semibold text-balance">{title}</h1>
        <p className="mt-3 text-meta text-ink-3">{lastUpdated}</p>
      </header>

      <nav aria-label={contentsLabel} className="primer-grid mb-12 grid-cols-1">
        <div className="px-6 py-5 sm:px-8">
          <p className="mb-3 text-[0.9375rem] font-medium text-ink">{contentsLabel}</p>
          <ol className="flex flex-col gap-1.5">
            {sections.map((section) => (
              <li key={section.id}>
                <a
                  href={`#${section.id}`}
                  className="text-ink-2 underline decoration-rule-strong underline-offset-[0.25em] hover:text-ink hover:decoration-ink"
                >
                  {section.title}
                </a>
              </li>
            ))}
          </ol>
        </div>
      </nav>

      <div className="flex flex-col pb-24">
        {sections.map((section, i) => (
          <section key={section.id} id={section.id} className={`py-8 ${i > 0 ? "primer-rule" : ""}`}>
            <h2 className="text-heading font-semibold">{section.title}</h2>
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
    </div>
  );
}
