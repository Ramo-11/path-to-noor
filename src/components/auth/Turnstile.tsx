"use client";

import { useEffect, useRef } from "react";
import { useLocale, useTranslations } from "next-intl";

interface TurnstileApi {
  render: (el: HTMLElement, options: Record<string, unknown>) => string;
  reset: (id?: string) => void;
  remove: (id?: string) => void;
}

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

const SITE_KEY = (process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? "").trim();
const SCRIPT_SRC = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";

export const turnstileEnabled = SITE_KEY !== "";

let scriptPromise: Promise<void> | null = null;

function loadScript(): Promise<void> {
  if (window.turnstile) return Promise.resolve();
  if (scriptPromise) return scriptPromise;
  scriptPromise = new Promise<void>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = SCRIPT_SRC;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => {
      scriptPromise = null;
      reject(new Error("turnstile script failed"));
    };
    document.head.appendChild(script);
  });
  return scriptPromise;
}

interface TurnstileProps {
  onToken: (token: string | null) => void;
  resetKey?: number;
}

export function Turnstile({ onToken, resetKey = 0 }: TurnstileProps) {
  const t = useTranslations("auth");
  const locale = useLocale();
  const hostRef = useRef<HTMLDivElement>(null);
  const widgetRef = useRef<string | null>(null);
  const onTokenRef = useRef(onToken);

  useEffect(() => {
    onTokenRef.current = onToken;
  }, [onToken]);

  useEffect(() => {
    if (!turnstileEnabled) return;
    let cancelled = false;
    loadScript()
      .then(() => {
        if (cancelled || !hostRef.current || !window.turnstile) return;
        const dark = document.documentElement.classList.contains("dark");
        widgetRef.current = window.turnstile.render(hostRef.current, {
          sitekey: SITE_KEY,
          theme: dark ? "dark" : "light",
          language: locale,
          callback: (token: string) => onTokenRef.current(token),
          "expired-callback": () => {
            onTokenRef.current(null);
            window.turnstile?.reset(widgetRef.current ?? undefined);
          },
          "error-callback": () => {
            onTokenRef.current(null);
            window.turnstile?.reset(widgetRef.current ?? undefined);
            return true;
          },
        });
      })
      .catch(() => onTokenRef.current(null));
    return () => {
      cancelled = true;
      if (widgetRef.current && window.turnstile) window.turnstile.remove(widgetRef.current);
      widgetRef.current = null;
    };
  }, [locale]);

  useEffect(() => {
    if (resetKey > 0 && widgetRef.current && window.turnstile) {
      onTokenRef.current(null);
      window.turnstile.reset(widgetRef.current);
    }
  }, [resetKey]);

  if (!turnstileEnabled) return null;

  return <div ref={hostRef} role="group" aria-label={t("humanCheck")} className="min-h-[65px]" />;
}
