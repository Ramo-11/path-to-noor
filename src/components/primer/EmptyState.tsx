interface EmptyStateProps {
  title: React.ReactNode;
  body?: React.ReactNode;
  action?: React.ReactNode;
}

export function EmptyState({ title, body, action }: EmptyStateProps) {
  return (
    <div className="primer-grid">
      <div className="flex flex-col items-start gap-3 px-6 py-10 sm:px-10 sm:py-14">
        <p className="text-heading font-semibold">{title}</p>
        {body ? <p className="max-w-[52ch] text-ink-2">{body}</p> : null}
        {action ? <div className="mt-3">{action}</div> : null}
      </div>
    </div>
  );
}
