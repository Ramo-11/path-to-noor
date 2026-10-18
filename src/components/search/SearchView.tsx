"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { Clock, Search, X } from "lucide-react";
import { Link, usePathname, useRouter } from "@/i18n/navigation";
import { Button } from "@/components/primer/Button";
import { EmptyState } from "@/components/primer/EmptyState";
import { Spinner } from "@/components/primer/Spinner";
import { StageChip } from "@/components/primer/StageChip";
import type { StageKey } from "@/lib/stages";
import { track } from "@/lib/analytics";

interface SearchResult {
  slug: string;
  title: string;
  minutes: number;
  pathTitle: string | null;
  stepTitle: string | null;
  stage: StageKey | null;
  access: "open" | "signIn";
}

type Status = "idle" | "loading" | "done" | "error";

const DEBOUNCE_MS = 300;
const MIN_LENGTH = 2;

export function SearchView() {
  const t = useTranslations("search");
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const urlQuery = (searchParams.get("q") ?? "").slice(0, 80);

  const [input, setInput] = useState(urlQuery);
  const [outcome, setOutcome] = useState<{ key: string; status: "done" | "error"; results: SearchResult[] } | null>(null);
  const [retryTick, setRetryTick] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const lastPushed = useRef(urlQuery);

  useEffect(() => {
    if (window.matchMedia("(min-width: 768px) and (pointer: fine)").matches) {
      inputRef.current?.focus();
    }
  }, []);

  useEffect(() => {
    if (urlQuery !== lastPushed.current) {
      lastPushed.current = urlQuery;
      setInput(urlQuery);
    }
  }, [urlQuery]);

  useEffect(() => {
    const trimmed = input.trim();
    if (trimmed === urlQuery.trim()) return;
    const timer = window.setTimeout(() => {
      lastPushed.current = trimmed;
      const next = trimmed ? `${pathname}?q=${encodeURIComponent(trimmed)}` : pathname;
      router.replace(next, { scroll: false });
    }, DEBOUNCE_MS);
    return () => window.clearTimeout(timer);
  }, [input, urlQuery, pathname, router]);

  const activeQuery = urlQuery.trim();

  const requestKey = `${activeQuery}|${locale}|${retryTick}`;
  const tooShort = activeQuery.length < MIN_LENGTH;
  const status: Status = tooShort ? "idle" : outcome?.key === requestKey ? outcome.status : "loading";
  const results = outcome && outcome.key === requestKey ? outcome.results : [];

  useEffect(() => {
    if (activeQuery.length < MIN_LENGTH) return;

    const controller = new AbortController();

    fetch(`/api/public/search?q=${encodeURIComponent(activeQuery)}&locale=${locale}`, {
      signal: controller.signal,
    })
      .then((res) => {
        if (!res.ok) throw new Error("search failed");
        return res.json();
      })
      .then((body) => {
        const list: SearchResult[] = Array.isArray(body?.data?.results) ? body.data.results : [];
        setOutcome({ key: requestKey, status: "done", results: list });
        track("search", { q_length: activeQuery.length, result_count: list.length });
      })
      .catch((error) => {
        if (error?.name === "AbortError") return;
        setOutcome({ key: requestKey, status: "error", results: [] });
      });

    return () => controller.abort();
  }, [activeQuery, locale, requestKey]);

  const clear = useCallback(() => {
    setInput("");
    inputRef.current?.focus();
  }, []);

  return (
    <div className="flex flex-col gap-6">
      <form
        role="search"
        onSubmit={(event) => {
          event.preventDefault();
          const trimmed = input.trim();
          lastPushed.current = trimmed;
          router.replace(trimmed ? `${pathname}?q=${encodeURIComponent(trimmed)}` : pathname, {
            scroll: false,
          });
        }}
      >
        <label htmlFor="lesson-search" className="sr-only">
          {t("label")}
        </label>
        <div className="relative">
          <Search
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 start-4 my-auto size-5 text-ink-3"
          />
          <input
            ref={inputRef}
            id="lesson-search"
            type="search"
            value={input}
            maxLength={80}
            onChange={(event) => setInput(event.target.value)}
            placeholder={t("placeholder")}
            autoComplete="off"
            enterKeyHint="search"
            className="w-full min-h-13 rounded-[var(--radius-control)] border border-rule-strong bg-surface ps-12 pe-12 text-base text-ink placeholder:text-ink-3 transition-colors focus:border-primary focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary [&::-webkit-search-cancel-button]:hidden"
          />
          {input ? (
            <button
              type="button"
              onClick={clear}
              aria-label={t("clear")}
              className="absolute inset-y-0 end-0 flex w-12 items-center justify-center rounded-e-[var(--radius-control)] text-ink-2 hover:text-primary"
            >
              <X aria-hidden="true" className="size-5" />
            </button>
          ) : null}
        </div>
      </form>

      <div aria-live="polite" aria-busy={status === "loading"}>
        {status === "idle" ? <p className="text-ink-3">{t("hint")}</p> : null}

        {status === "loading" ? (
          <div className="flex items-center gap-3 py-6 text-ink-2">
            <Spinner />
            <span>{t("searching")}</span>
          </div>
        ) : null}

        {status === "error" ? (
          <EmptyState
            title={t("errorTitle")}
            body={t("errorBody")}
            action={
              <Button type="button" variant="secondary" onClick={() => setRetryTick((n) => n + 1)}>
                {t("retry")}
              </Button>
            }
          />
        ) : null}

        {status === "done" && results.length === 0 ? (
          <EmptyState
            title={t("emptyTitle")}
            body={t("emptyBody")}
            action={<Button href="/paths">{t("browsePaths")}</Button>}
          />
        ) : null}

        {status === "done" && results.length > 0 ? (
          <div className="flex flex-col gap-4">
            <p className="text-meta text-ink-3">{t("count", { count: results.length })}</p>
            <ul className="flex flex-col gap-3">
              {results.map((result) => (
                <li key={result.slug}>
                  <Link
                    href={`/learn/${result.slug}`}
                    className="card card-link flex min-h-11 flex-col gap-2 p-5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary sm:p-6"
                  >
                    <span className="text-lg font-semibold text-ink text-balance">{result.title}</span>
                    {result.pathTitle || result.stepTitle ? (
                      <span className="text-[0.9375rem] text-ink-2">
                        {[result.pathTitle, result.stepTitle].filter(Boolean).join(" / ")}
                      </span>
                    ) : null}
                    <span className="flex flex-wrap items-center gap-x-3 gap-y-2 text-meta text-ink-3">
                      {result.stage ? <StageChip stage={result.stage} /> : null}
                      {result.minutes > 0 ? (
                        <span className="inline-flex items-center gap-1.5">
                          <Clock aria-hidden="true" className="size-4" />
                          {t("minutes", { count: result.minutes })}
                        </span>
                      ) : null}
                      {result.access === "signIn" ? <span>{t("signInToRead")}</span> : null}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>
    </div>
  );
}
