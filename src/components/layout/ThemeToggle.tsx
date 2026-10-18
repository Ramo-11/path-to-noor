"use client";

import { useCallback, useEffect, useSyncExternalStore } from "react";
import { useMounted } from "@/lib/use-mounted";
import { Moon, Sun } from "lucide-react";

interface ThemeToggleProps {
  darkLabel?: string;
  lightLabel?: string;
}

function getStoredTheme(): boolean {
  if (typeof window === "undefined") return false;
  const stored = localStorage.getItem("theme");
  if (stored === "dark") return true;
  if (stored === "light") return false;
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

const THEME_EVENT = "bd-theme-change";

function subscribeTheme(onChange: () => void) {
  const media = window.matchMedia("(prefers-color-scheme: dark)");
  window.addEventListener(THEME_EVENT, onChange);
  window.addEventListener("storage", onChange);
  media.addEventListener("change", onChange);
  return () => {
    window.removeEventListener(THEME_EVENT, onChange);
    window.removeEventListener("storage", onChange);
    media.removeEventListener("change", onChange);
  };
}

function applyTheme(dark: boolean) {
  document.documentElement.classList.toggle("dark", dark);
}

export function ThemeToggle({
  darkLabel = "Switch to dark mode",
  lightLabel = "Switch to light mode",
}: ThemeToggleProps) {
  const dark = useSyncExternalStore(subscribeTheme, getStoredTheme, () => false);
  const mounted = useMounted();

  useEffect(() => {
    applyTheme(dark);
  }, [dark]);

  const toggle = useCallback(() => {
    const next = !getStoredTheme();
    applyTheme(next);
    localStorage.setItem("theme", next ? "dark" : "light");
    window.dispatchEvent(new Event(THEME_EVENT));
  }, []);

  const isDark = mounted && dark;
  const label = isDark ? lightLabel : darkLabel;

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={label}
      className="inline-flex size-11 shrink-0 items-center justify-center rounded-full text-ink-2 transition-colors duration-150 hover:bg-wash hover:text-ink"
      suppressHydrationWarning
    >
      {isDark ? (
        <Sun className="size-5" strokeWidth={1.75} aria-hidden="true" />
      ) : (
        <Moon className="size-5" strokeWidth={1.75} aria-hidden="true" />
      )}
    </button>
  );
}
