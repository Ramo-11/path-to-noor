"use client";

import { Check, Share2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { track } from "@/lib/analytics";

interface ShareButtonProps {
  kind: "lesson" | "path";
  slug: string;
  title: string;
  className?: string;
}

type Status = "idle" | "copied" | "failed";

function pageUrl(): string {
  const url = new URL(window.location.href);
  url.search = "";
  url.hash = "";
  return url.toString();
}

async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const field = document.createElement("textarea");
    field.value = text;
    field.setAttribute("readonly", "");
    field.style.position = "fixed";
    field.style.opacity = "0";
    document.body.appendChild(field);
    field.select();
    try {
      return document.execCommand("copy");
    } catch {
      return false;
    } finally {
      document.body.removeChild(field);
    }
  }
}

export function ShareButton({ kind, slug, title, className = "" }: ShareButtonProps) {
  const t = useTranslations("feedback.share");
  const [status, setStatus] = useState<Status>("idle");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    []
  );

  function flash(next: Status) {
    setStatus(next);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setStatus("idle"), 2500);
  }

  async function share() {
    const url = pageUrl();
    const params = kind === "lesson" ? { lesson: slug } : { path: slug };

    if (typeof navigator.share === "function") {
      try {
        await navigator.share({ title, url });
        track("lesson_shared", { ...params, method: "native" });
        return;
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") return;
      }
    }

    const copied = await copyText(url);
    if (copied) track("lesson_shared", { ...params, method: "copy" });
    flash(copied ? "copied" : "failed");
  }

  return (
    <span className={`inline-flex items-center gap-3 ${className}`}>
      <button
        type="button"
        onClick={share}
        className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-rule bg-surface px-5 text-[0.9375rem] font-medium text-ink shadow-soft transition-[background-color,border-color,transform] duration-150 hover:border-rule-strong hover:bg-wash active:translate-y-px focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
      >
        {status === "copied" ? (
          <Check aria-hidden="true" strokeWidth={2.25} className="size-4 text-stage2-text" />
        ) : (
          <Share2 aria-hidden="true" strokeWidth={1.75} className="size-4" />
        )}
        {status === "copied" ? t("copied") : t("label")}
      </button>
      <span role="status" aria-live="polite" className="text-meta text-ink-2">
        {status === "copied" ? t("copiedNote") : status === "failed" ? t("failed") : ""}
      </span>
    </span>
  );
}
