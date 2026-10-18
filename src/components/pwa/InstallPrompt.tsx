"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { X } from "lucide-react";
import { useTranslations } from "next-intl";
import { usePathname } from "@/i18n/navigation";
import { Button } from "@/components/primer/Button";
import { isTabBarHidden } from "@/components/layout/tab-bar-visibility";
import { track } from "@/lib/analytics";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

type Mode = "none" | "native" | "ios";

const VISITS_KEY = "bd.visits";
const SESSION_KEY = "bd.visit-counted";
const DISMISSED_KEY = "bd.install-dismissed";
const INSTALLED_KEY = "bd.installed";
const DISMISS_MS = 30 * 24 * 60 * 60 * 1000;
const MIN_VISITS = 2;

function readStorage(storage: Storage | undefined, key: string): string | null {
  try {
    return storage?.getItem(key) ?? null;
  } catch {
    return null;
  }
}

function writeStorage(storage: Storage | undefined, key: string, value: string) {
  try {
    storage?.setItem(key, value);
  } catch {
    return;
  }
}

function isStandalone(): boolean {
  const nav = window.navigator as Navigator & { standalone?: boolean };
  return window.matchMedia("(display-mode: standalone)").matches || nav.standalone === true;
}

function isIosSafari(): boolean {
  const ua = window.navigator.userAgent;
  const ios =
    /iPad|iPhone|iPod/.test(ua) ||
    (window.navigator.platform === "MacIntel" && window.navigator.maxTouchPoints > 1);
  const otherBrowser = /CriOS|FxiOS|EdgiOS|OPiOS|GSA/.test(ua);
  return ios && !otherBrowser;
}

const RECHECK_EVENT = "bd-install-recheck";

function countVisit() {
  if (readStorage(window.sessionStorage, SESSION_KEY)) return;
  const visits = Number(readStorage(window.localStorage, VISITS_KEY)) || 0;
  writeStorage(window.localStorage, VISITS_KEY, String(visits + 1));
  writeStorage(window.sessionStorage, SESSION_KEY, "1");
}

function eligible(): boolean {
  if (isStandalone()) return false;
  if (readStorage(window.localStorage, INSTALLED_KEY)) return false;
  const dismissedAt = Number(readStorage(window.localStorage, DISMISSED_KEY));
  if (dismissedAt && Date.now() - dismissedAt < DISMISS_MS) return false;
  const visits = Number(readStorage(window.localStorage, VISITS_KEY)) || 0;
  return visits >= MIN_VISITS;
}

function subscribeRecheck(onChange: () => void) {
  window.addEventListener(RECHECK_EVENT, onChange);
  return () => window.removeEventListener(RECHECK_EVENT, onChange);
}

const noopSubscribe = () => () => {};

function recheck() {
  window.dispatchEvent(new Event(RECHECK_EVENT));
}

export function InstallPrompt() {
  const t = useTranslations("install");
  const pathname = usePathname();
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const ready = useSyncExternalStore(subscribeRecheck, eligible, () => false);
  const iosDevice = useSyncExternalStore(noopSubscribe, isIosSafari, () => false);
  const mode: Mode = !ready ? "none" : deferred ? "native" : iosDevice ? "ios" : "none";

  useEffect(() => {
    countVisit();
    recheck();

    const onPrompt = (event: Event) => {
      event.preventDefault();
      setDeferred(event as BeforeInstallPromptEvent);
    };
    const onInstalled = () => {
      track("app_installed");
      writeStorage(window.localStorage, INSTALLED_KEY, "1");
      setDeferred(null);
      recheck();
    };

    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  function dismiss() {
    writeStorage(window.localStorage, DISMISSED_KEY, String(Date.now()));
    recheck();
  }

  async function install() {
    if (!deferred) return;
    try {
      await deferred.prompt();
      const choice = await deferred.userChoice;
      if (choice.outcome === "dismissed") dismiss();
    } catch {
      dismiss();
    } finally {
      setDeferred(null);
    }
  }

  if (mode === "none" || isTabBarHidden(pathname)) return null;

  return (
    <aside
      aria-label={t("title")}
      className="card fixed inset-x-4 bottom-[calc(4.75rem+env(safe-area-inset-bottom))] z-40 flex flex-col gap-3 p-5 shadow-lift md:start-4 md:end-auto md:bottom-4 md:w-96"
    >
      <button
        type="button"
        onClick={dismiss}
        aria-label={t("close")}
        className="absolute end-1 top-1 flex size-11 items-center justify-center rounded-full text-ink-2 hover:bg-wash hover:text-ink"
      >
        <X aria-hidden="true" className="size-5" />
      </button>
      <p className="pe-10 text-base font-semibold text-ink">{t("title")}</p>
      <p className="text-[0.9375rem] text-ink-2">{mode === "ios" ? t("iosBody") : t("body")}</p>
      <div className="flex flex-wrap items-center gap-3">
        {mode === "native" ? (
          <Button type="button" onClick={install}>
            {t("add")}
          </Button>
        ) : null}
        <Button type="button" variant="quiet" onClick={dismiss}>
          {t("notNow")}
        </Button>
      </div>
    </aside>
  );
}
