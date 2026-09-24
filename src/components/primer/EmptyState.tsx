import type { IllustrationName } from "@/lib/illustrations";
import { Illustration } from "./Illustration";

interface EmptyStateProps {
  title: React.ReactNode;
  body?: React.ReactNode;
  action?: React.ReactNode;
  art?: IllustrationName;
}

export function EmptyState({ title, body, action, art }: EmptyStateProps) {
  return (
    <div className="card flex flex-col items-center gap-3 px-6 py-10 text-center sm:px-10 sm:py-12">
      {art ? (
        <div className="mb-3 aspect-[4/3] w-full max-w-[15rem] overflow-hidden rounded-[var(--radius-cell)]">
          <Illustration name={art} sizes="240px" />
        </div>
      ) : null}
      <p className="text-heading font-semibold text-balance">{title}</p>
      {body ? <p className="max-w-[42ch] text-ink-2 text-pretty">{body}</p> : null}
      {action ? <div className="mt-3">{action}</div> : null}
    </div>
  );
}
