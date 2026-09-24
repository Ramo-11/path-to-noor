export function BrandMark({ className = "size-8" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" aria-hidden="true" className={`shrink-0 ${className}`}>
      <rect width="32" height="32" rx="10" className="fill-stage1-tint" />
      <path d="M8.5 20.5a7.5 7.5 0 0 1 15 0Z" className="fill-stage1" />
      <path d="M16 7.5v3M8.9 10.4l2 2M23.1 10.4l-2 2" className="stroke-accent" strokeWidth="2" strokeLinecap="round" />
      <path d="M6.5 21h19" className="stroke-primary" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
