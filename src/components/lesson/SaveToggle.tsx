"use client";

import { useId, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Bookmark } from "lucide-react";
import { Button } from "@/components/primer/Button";

interface SaveToggleProps {
  lessonId: string;
  initialSaved: boolean;
  signedIn: boolean;
  signInHref: string;
  children: React.ReactNode;
}

export function SaveToggle({ lessonId, initialSaved, signedIn, signInHref, children }: SaveToggleProps) {
  const t = useTranslations("lesson");
  const promptId = useId();
  const [saved, setSaved] = useState(initialSaved);
  const [failed, setFailed] = useState(false);
  const [promptOpen, setPromptOpen] = useState(false);
  const inFlight = useRef(false);

  async function toggle() {
    if (!signedIn) {
      setPromptOpen((open) => !open);
      return;
    }
    if (inFlight.current) return;
    inFlight.current = true;
    const next = !saved;
    setSaved(next);
    setFailed(false);
    try {
      const res = await fetch("/api/user/bookmarks", {
        method: next ? "POST" : "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lessonId }),
      });
      if (!res.ok) throw new Error(`bookmarks ${res.status}`);
    } catch {
      setSaved(!next);
      setFailed(true);
    } finally {
      inFlight.current = false;
    }
  }

  return (
    <div>
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">{children}</div>
        <button
          type="button"
          onClick={toggle}
          aria-pressed={signedIn ? saved : undefined}
          aria-expanded={signedIn ? undefined : promptOpen}
          aria-controls={signedIn ? undefined : promptId}
          className={`inline-flex min-h-11 shrink-0 items-center gap-2 rounded-[var(--radius-control)] border px-3.5 text-[0.9375rem] font-medium transition-colors duration-150 ${
            saved ? "border-ink bg-ink text-page hover:bg-ink/85" : "border-rule-strong bg-page text-ink hover:border-ink hover:bg-wash"
          }`}
        >
          <Bookmark
            aria-hidden="true"
            strokeWidth={1.75}
            className={`size-[18px] ${saved ? "fill-current" : ""}`}
          />
          {saved ? t("saved") : t("save")}
        </button>
      </div>
      <div aria-live="polite">
        {failed ? (
          <p className="settle mt-3 text-meta text-danger">{t("saveError")}</p>
        ) : null}
      </div>
      {!signedIn && promptOpen ? (
        <div
          id={promptId}
          className="settle mt-4 flex flex-col gap-3 rounded-[var(--radius-cell)] bg-wash px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5"
        >
          <p className="text-[0.9375rem] text-ink">{t("saveSignIn")}</p>
          <div className="flex shrink-0 flex-wrap items-center gap-x-5 gap-y-1">
            <Button variant="quiet" href={signInHref}>
              {t("signIn")}
            </Button>
            <Button variant="quiet" href="/register">
              {t("createAccount")}
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
