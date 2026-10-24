"use client";

import { useEffect, useId, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Check, Globe, Monitor, Moon, Sun } from "lucide-react";
import { Link, usePathname } from "@/i18n/navigation";
import { useThemeMode, type ThemeMode } from "@/components/layout/ThemeToggle";

const LOCALES = ["en", "ar", "es"] as const;
const LOCALE_CODES = { en: "EN", ar: "AR", es: "ES" } as const;
const LOCALE_NAMES = { en: "English", ar: "العربية", es: "Español" } as const;

const MODES = [
  { value: "light", key: "themeLight", Icon: Sun },
  { value: "dark", key: "themeDark", Icon: Moon },
  { value: "system", key: "themeSystem", Icon: Monitor },
] as const;

export function PreferencesMenu() {
  const t = useTranslations("nav");
  const locale = useLocale() as (typeof LOCALES)[number];
  const pathname = usePathname();
  const [mode, setMode] = useThemeMode();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const panelId = useId();

  useEffect(() => {
    if (!open) return;
    function onPointer(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    }
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
        return;
      }
      if (!["ArrowDown", "ArrowUp", "ArrowLeft", "ArrowRight"].includes(event.key)) return;
      const items = Array.from(
        panelRef.current?.querySelectorAll<HTMLElement>("[data-pref-item]") ?? [],
      );
      if (!items.length) return;
      const index = items.indexOf(document.activeElement as HTMLElement);
      const forward = event.key === "ArrowDown" || event.key === "ArrowRight";
      const next = index < 0 ? 0 : (index + (forward ? 1 : -1) + items.length) % items.length;
      event.preventDefault();
      items[next].focus();
    }
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    panelRef.current?.querySelector<HTMLElement>('[aria-current="true"], [aria-checked="true"]')?.focus();
  }, [open]);

  return (
    <div ref={rootRef} className="md:relative">
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={t("preferences")}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={open ? panelId : undefined}
        className="inline-flex h-10 items-center gap-1.5 rounded-full px-2.5 text-[0.8125rem] font-semibold tabular text-ink-2 transition-colors duration-150 hover:bg-wash hover:text-ink active:bg-wash/70 aria-expanded:bg-wash aria-expanded:text-ink"
      >
        <Globe className="size-[18px]" strokeWidth={1.75} aria-hidden="true" />
        <span>{LOCALE_CODES[locale]}</span>
      </button>

      {open ? (
        <div
          ref={panelRef}
          id={panelId}
          role="dialog"
          aria-label={t("preferences")}
          className="absolute inset-x-4 top-full z-50 mt-2 rounded-[var(--radius-cell)] border border-rule bg-surface p-2 shadow-lift md:inset-x-auto md:end-0 md:w-64"
        >
          <p className="px-2.5 pb-1 pt-1.5 text-[0.75rem] font-medium text-ink-3">{t("language")}</p>
          <div role="group" aria-label={t("language")} className="flex flex-col">
            {LOCALES.map((l) => {
              const current = l === locale;
              return (
                <Link
                  key={l}
                  data-pref-item
                  href={pathname}
                  locale={l}
                  lang={l}
                  onClick={() => setOpen(false)}
                  aria-current={current ? "true" : undefined}
                  className={`flex h-10 items-center justify-between rounded-[var(--radius-control)] px-2.5 text-[0.9375rem] transition-colors duration-150 active:bg-wash/70 ${
                    current ? "bg-primary-tint font-medium text-primary" : "text-ink-2 hover:bg-wash hover:text-ink"
                  }`}
                >
                  {LOCALE_NAMES[l]}
                  {current ? <Check className="size-4" strokeWidth={2} aria-hidden="true" /> : null}
                </Link>
              );
            })}
          </div>

          <div className="my-2 border-t border-rule" />

          <p className="px-2.5 pb-1 text-[0.75rem] font-medium text-ink-3">{t("appearance")}</p>
          <div
            role="radiogroup"
            aria-label={t("appearance")}
            className="grid grid-cols-3 gap-1 rounded-full bg-wash p-1"
          >
            {MODES.map(({ value, key, Icon }) => {
              const selected = mode === value;
              return (
                <button
                  key={value}
                  type="button"
                  role="radio"
                  data-pref-item
                  aria-checked={selected}
                  onClick={() => setMode(value as ThemeMode)}
                  className={`inline-flex h-8 items-center justify-center gap-1.5 rounded-full text-[0.8125rem] font-medium transition-colors duration-150 ${
                    selected ? "bg-surface text-ink shadow-sm" : "text-ink-3 hover:text-ink"
                  }`}
                >
                  <Icon className="size-3.5" strokeWidth={1.75} aria-hidden="true" />
                  <span>{t(key)}</span>
                </button>
              );
            })}
          </div>

          <div className="mt-2 border-t border-rule pt-2 md:hidden">
            <Link
              data-pref-item
              href="/contact"
              onClick={() => setOpen(false)}
              className="flex h-10 items-center rounded-[var(--radius-control)] px-2.5 text-[0.9375rem] text-ink-2 transition-colors duration-150 hover:bg-wash hover:text-ink"
            >
              {t("contact")}
            </Link>
          </div>
        </div>
      ) : null}
    </div>
  );
}
