import { AlertCircle, CheckCircle2, Info } from "lucide-react";

interface NoticeProps {
  tone?: "info" | "success" | "error";
  children: React.ReactNode;
  className?: string;
}

const tones = {
  info: { box: "bg-primary-tint text-ink", icon: "text-primary", Icon: Info },
  success: { box: "bg-stage2-tint text-ink", icon: "text-stage2-text", Icon: CheckCircle2 },
  error: { box: "bg-danger-tint text-ink", icon: "text-danger", Icon: AlertCircle },
};

export function Notice({ tone = "info", children, className = "" }: NoticeProps) {
  const { box, icon, Icon } = tones[tone];
  return (
    <div
      role={tone === "error" ? "alert" : "status"}
      className={`flex items-start gap-3 rounded-[var(--radius-control)] px-4 py-3 text-[0.9375rem] ${box} ${className}`}
    >
      <Icon aria-hidden="true" className={`mt-0.5 size-4 shrink-0 ${icon}`} />
      <div className="min-w-0">{children}</div>
    </div>
  );
}
