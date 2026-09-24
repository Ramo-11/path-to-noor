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
    "bg-primary text-on-primary border border-primary shadow-soft hover:bg-primary-hover hover:border-primary-hover active:translate-y-px",
  secondary:
    "bg-surface text-ink border border-rule shadow-soft hover:border-rule-strong hover:bg-wash active:translate-y-px",
  quiet:
    "bg-transparent text-primary border border-transparent underline decoration-primary/30 underline-offset-[0.25em] hover:decoration-primary px-0!",
  danger:
    "bg-surface text-danger border border-danger/50 hover:bg-danger-tint",
};

const sizes: Record<Size, string> = {
  md: "min-h-11 px-5 text-[0.9375rem]",
  lg: "min-h-13 px-7 text-base",
};

function classes({ variant = "primary", size = "md", fullWidth, className = "" }: BaseProps) {
  return [
    "inline-flex items-center justify-center gap-2 rounded-full font-medium whitespace-nowrap transition-[background-color,border-color,color,transform] duration-150",
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
