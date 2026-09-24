"use client";

import { useEffect, useRef, useState } from "react";
import { Check } from "lucide-react";
import { STAGE_STYLES, type StageKey } from "@/lib/stages";

export type StepState = "complete" | "current" | "upcoming" | "preparing";

export interface StepTab {
  id: string;
  number: number;
  numberLabel: string;
  title: string;
  state: StepState;
  status: string;
  statusLabel?: string;
}

interface StepTabsProps {
  tabs: StepTab[];
  stage: StageKey;
  label: string;
}

function scrollBehavior(instant: boolean): ScrollBehavior {
  if (instant) return "auto";
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth";
}

function revealTab(container: HTMLElement, tab: HTMLElement, center: boolean) {
  const box = container.getBoundingClientRect();
  const rect = tab.getBoundingClientRect();
  let left = 0;
  let top = 0;

  if (container.scrollWidth > container.clientWidth) {
    if (center) left = rect.left + rect.width / 2 - (box.left + box.width / 2);
    else if (rect.left < box.left) left = rect.left - box.left - 16;
    else if (rect.right > box.right) left = rect.right - box.right + 16;
  }

  if (container.scrollHeight > container.clientHeight) {
    if (center) top = rect.top + rect.height / 2 - (box.top + box.height / 2);
    else if (rect.top < box.top) top = rect.top - box.top - 8;
    else if (rect.bottom > box.bottom) top = rect.bottom - box.bottom + 8;
  }

  if (left !== 0 || top !== 0) {
    container.scrollBy({ left, top, behavior: scrollBehavior(center) });
  }
}

const numeralStates: Record<Exclude<StepState, "complete">, string> = {
  current: "border-2 border-ink text-ink",
  upcoming: "border border-rule text-ink",
  preparing: "border border-rule text-ink-3",
};

export function StepTabs({ tabs, stage, label }: StepTabsProps) {
  const navRef = useRef<HTMLElement>(null);
  const [active, setActive] = useState<string | null>(null);
  const style = STAGE_STYLES[stage];
  const ids = tabs.map((tab) => tab.id).join(" ");

  useEffect(() => {
    const nav = navRef.current;
    const current = nav?.querySelector<HTMLElement>('[data-state="current"]');
    if (nav && current) revealTab(nav, current, true);
  }, []);

  useEffect(() => {
    const order = ids.split(" ").filter(Boolean);
    const sections = order
      .map((id) => document.getElementById(id))
      .filter((section): section is HTMLElement => section !== null);
    if (sections.length === 0) return;

    const visible = new Set<string>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) visible.add(entry.target.id);
          else visible.delete(entry.target.id);
        }
        const first = order.find((id) => visible.has(id));
        if (first) setActive(first);
      },
      { rootMargin: "-35% 0px -55% 0px" }
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, [ids]);

  useEffect(() => {
    const nav = navRef.current;
    if (!nav || !active) return;
    const tab = nav.querySelector<HTMLElement>(`[data-tab="${active}"]`);
    if (tab) revealTab(nav, tab, false);
  }, [active]);

  return (
    <nav
      ref={navRef}
      aria-label={label}
      className="sticky top-16 z-20 -mx-4 snap-x snap-mandatory scroll-px-4 overflow-x-auto border-b border-rule bg-page px-4 py-3 sm:-mx-6 sm:scroll-px-6 sm:px-6 lg:top-24 lg:z-auto lg:mx-0 lg:mt-16 lg:max-h-[calc(100dvh-8rem)] lg:snap-none lg:self-start lg:overflow-x-hidden lg:overflow-y-auto lg:border-0 lg:bg-transparent lg:p-0"
    >
      <ol className="primer-grid w-max auto-cols-[10.5rem] grid-flow-col lg:w-full lg:auto-cols-auto lg:grid-flow-row lg:grid-cols-1">
        {tabs.map((tab) => {
          const inView = active === tab.id;
          const numeral =
            tab.state === "complete" ? `${style.fill} ${style.onFill}` : numeralStates[tab.state];

          return (
            <li key={tab.id} data-tab={tab.id} data-state={tab.state} className="relative snap-start">
              <a
                href={`#${tab.id}`}
                aria-current={inView ? "location" : undefined}
                className={`relative flex h-full min-h-16 items-center gap-3 px-3 py-3 transition-colors duration-150 hover:bg-wash focus-visible:-outline-offset-4! lg:gap-4 lg:px-4 ${inView ? "bg-wash" : ""}`}
              >
                <span
                  aria-hidden="true"
                  className={`grid size-10 shrink-0 place-items-center rounded-lg text-lg font-semibold tabular lg:size-12 lg:text-2xl ${numeral}`}
                >
                  {tab.number}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="sr-only">{tab.numberLabel}, </span>
                  <span
                    className={`block truncate text-[0.9375rem] leading-snug font-medium lg:line-clamp-2 lg:whitespace-normal ${tab.state === "preparing" ? "text-ink-3" : "text-ink"}`}
                  >
                    {tab.title}
                  </span>
                  <span className="mt-1 flex items-center gap-1 text-meta">
                    {tab.state === "complete" ? (
                      <Check
                        aria-hidden="true"
                        strokeWidth={2.5}
                        className={`size-3.5 shrink-0 ${style.text}`}
                      />
                    ) : null}
                    <span
                      aria-hidden={tab.statusLabel ? true : undefined}
                      className={
                        tab.state === "current"
                          ? "font-medium text-ink"
                          : tab.state === "complete"
                            ? "text-ink-2"
                            : "tabular text-ink-3"
                      }
                    >
                      {tab.status}
                    </span>
                    {tab.statusLabel ? <span className="sr-only">{tab.statusLabel}</span> : null}
                  </span>
                </span>
                {inView ? (
                  <>
                    <span
                      aria-hidden="true"
                      className="absolute inset-x-0 bottom-0 h-[3px] bg-ink lg:hidden"
                    />
                    <span
                      aria-hidden="true"
                      className="absolute inset-y-0 start-0 hidden w-[3px] bg-ink lg:block"
                    />
                  </>
                ) : null}
              </a>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
