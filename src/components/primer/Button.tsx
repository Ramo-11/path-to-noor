import { Link } from "@/i18n/navigation";
import { Spinner } from "./Spinner";

type Variant = "primary" | "secondary" | "quiet" | "danger";
type Size = "md" | "lg";

interface BaseProps {
  children: React.ReactNode;
  variant?: Variant;
  size?: Size;
  fullWidth?: boolean;
  className?: string;
}

interface LinkButtonProps extends BaseProps {
  href: string;
  external?: boolean;
}

interface ActionButtonProps extends BaseProps {
  href?: undefined;
  type?: "button" | "submit";
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
  "aria-label"?: string;
}

const variants: Record<Variant, string> = {
  primary:
    "bg-ink text-page border border-ink hover:bg-ink/85 active:bg-ink/75",
  secondary:
    "bg-page text-ink border border-ink hover:bg-wash active:bg-rule",
  quiet:
    "bg-transparent text-ink border border-transparent underline decoration-rule-strong underline-offset-[0.25em] hover:decoration-ink px-0!",
  danger:
    "bg-page text-danger border border-danger hover:bg-danger-tint",
};

const sizes: Record<Size, string> = {
  md: "min-h-11 px-5 text-[0.9375rem]",
  lg: "min-h-13 px-7 text-base",
};

function classes({ variant = "primary", size = "md", fullWidth, className = "" }: BaseProps) {
  return [
    "inline-flex items-center justify-center gap-2 rounded-[var(--radius-control)] font-medium whitespace-nowrap transition-colors duration-150",
    "disabled:opacity-45 disabled:pointer-events-none",
    variants[variant],
    sizes[size],
    fullWidth ? "w-full" : "",
    className,
  ].join(" ");
}

export function Button(props: LinkButtonProps | ActionButtonProps) {
  if (props.href !== undefined) {
    const { href, external, children } = props;
    if (external) {
      return (
        <a href={href} target="_blank" rel="noopener noreferrer" className={classes(props)}>
          {children}
        </a>
      );
    }
    return (
      <Link href={href} className={classes(props)}>
        {children}
      </Link>
    );
  }

  const { type = "button", onClick, disabled, loading, children } = props;
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      aria-label={props["aria-label"]}
      className={classes(props)}
    >
      {loading ? <Spinner /> : null}
      {children}
    </button>
  );
}
