"use client";

import { useEffect, useRef, useState } from "react";

export interface MenuItem {
  label: string;
  onSelect: () => void;
  danger?: boolean;
  hidden?: boolean;
}

export function RowMenu({ items, label, disabled }: { items: MenuItem[]; label: string; disabled?: boolean }) {
  const [pos, setPos] = useState<{ top: number; right: number } | null>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!pos) return;
    function onDown(e: MouseEvent) {
      const t = e.target as Node;
      if (menuRef.current?.contains(t) || buttonRef.current?.contains(t)) return;
      setPos(null);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setPos(null);
        buttonRef.current?.focus();
      }
    }
    function close() {
      setPos(null);
    }
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    window.addEventListener("scroll", close, true);
    window.addEventListener("resize", close);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("scroll", close, true);
      window.removeEventListener("resize", close);
    };
  }, [pos]);

  useEffect(() => {
    if (pos) menuRef.current?.querySelector<HTMLButtonElement>("button")?.focus();
  }, [pos]);

  const visible = items.filter((i) => !i.hidden);

  function toggle() {
    if (pos) return setPos(null);
    const rect = buttonRef.current?.getBoundingClientRect();
    if (!rect) return;
    const height = visible.length * 40 + 8;
    const below = rect.bottom + 4;
    const top = below + height > window.innerHeight && rect.top - 4 - height > 0 ? rect.top - 4 - height : below;
    setPos({ top, right: window.innerWidth - rect.right });
  }

  return (
    <div onClick={(e) => e.stopPropagation()} className="text-right">
      <button
        ref={buttonRef}
        type="button"
        onClick={toggle}
        disabled={disabled}
        aria-haspopup="menu"
        aria-expanded={pos !== null}
        aria-label={label}
        className="px-2.5 py-1 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50"
      >
        ...
      </button>
      {pos ? (
        <div
          ref={menuRef}
          role="menu"
          style={{ position: "fixed", top: pos.top, right: pos.right }}
          className="z-40 min-w-48 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-lg text-left"
        >
          {visible.map((item) => (
            <button
              key={item.label}
              type="button"
              role="menuitem"
              onClick={() => {
                setPos(null);
                item.onSelect();
              }}
              className={`block w-full px-4 py-2 text-left text-sm hover:bg-slate-50 dark:hover:bg-slate-800 ${
                item.danger ? "text-red-600 dark:text-red-400" : "text-slate-700 dark:text-slate-300"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
