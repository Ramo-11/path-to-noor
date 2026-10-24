import { ArrowRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/primer/Button";
import type { PathOutline } from "@/lib/learning-types";

interface TrackActionProps {
  path: PathOutline;
  signedIn: boolean;
  variant?: "primary" | "secondary";
  className?: string;
}

export function trackActionTarget(path: PathOutline, signedIn: boolean) {
  const started = signedIn && path.isStarted;
  const complete = signedIn && path.isComplete;
  if (complete || !path.nextLesson) {
    return { href: `/paths/${path.slug}`, kind: "review" as const };
  }
  return { href: `/learn/${path.nextLesson.slug}`, kind: started ? ("continue" as const) : ("start" as const) };
}

export function TrackAction({ path, signedIn, variant = "primary", className = "" }: TrackActionProps) {
  const t = useTranslations("tracks.action");
  const { href, kind } = trackActionTarget(path, signedIn);

  return (
    <Button href={href} variant={variant} size="lg" className={`w-full sm:w-auto ${className}`}>
      {t(kind)}
      {kind === "review" ? null : (
        <ArrowRight aria-hidden="true" strokeWidth={2} className="size-5 shrink-0 rtl:rotate-180" />
      )}
    </Button>
  );
}
