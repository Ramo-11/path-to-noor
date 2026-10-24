"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/components/primer/Button";
import { useTrackAction } from "./useTrackAction";

export function TrackPrimaryLink({ className = "" }: { className?: string }) {
  const t = useTranslations("nav.primary");
  const { href, track } = useTrackAction();

  return (
    <Button href={href} variant="quiet" className={className}>
      {t(track ?? "none")}
    </Button>
  );
}
