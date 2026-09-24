"use client";

import { useCallback, useEffect, useState } from "react";
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

function applyTheme(dark: boolean) {
  document.documentElement.classList.toggle("dark", dark);
}

export function ThemeToggle({
  darkLabel = "Switch to dark mode",
  lightLabel = "Switch to light mode",
}: ThemeToggleProps) {
  const [dark, setDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const isDark = getStoredTheme();
    setDark(isDark);
    applyTheme(isDark);
    setMounted(true);
  }, []);

  const toggle = useCallback(() => {
    setDark((prev) => {
      const next = !prev;
      applyTheme(next);
      localStorage.setItem("theme", next ? "dark" : "light");
      return next;
    });
  }, []);

  const isDark = mounted && dark;
  const label = isDark ? lightLabel : darkLabel;

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={label}
      className="inline-flex size-10 shrink-0 items-center justify-center rounded-full text-ink-2 transition-colors duration-150 hover:bg-wash hover:text-ink"
      suppressHydrationWarning
    >
      {isDark ? (
        <Sun className="size-[18px]" strokeWidth={1.75} aria-hidden="true" />
      ) : (
        <Moon className="size-[18px]" strokeWidth={1.75} aria-hidden="true" />
      )}
    </button>
  );
}
