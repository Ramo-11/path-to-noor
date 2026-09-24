"use client";

import { Plus, X, ChevronUp, ChevronDown } from "lucide-react";

export interface OutcomeRow {
  en: string;
  ar: string;
  es: string;
}

const MAX_OUTCOMES = 8;

const inputClass =
  "w-full px-2.5 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-colors";

interface OutcomesEditorProps {
  outcomes: OutcomeRow[];
  onChange: (outcomes: OutcomeRow[]) => void;
}

export function OutcomesEditor({ outcomes, onChange }: OutcomesEditorProps) {
  function update(index: number, field: keyof OutcomeRow, value: string) {
    const next = [...outcomes];
    next[index] = { ...next[index], [field]: value };
    onChange(next);
  }

  function remove(index: number) {
    onChange(outcomes.filter((_, i) => i !== index));
  }

  function move(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= outcomes.length) return;
    const next = [...outcomes];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  }

  function add() {
    if (outcomes.length >= MAX_OUTCOMES) return;
    onChange([...outcomes, { en: "", ar: "", es: "" }]);
  }

  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
        What learners will be able to do
      </label>
      <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
        Up to {MAX_OUTCOMES} outcomes shown to learners on the path page. Rows left blank in English are dropped when you save.
      </p>

      <div className="space-y-2">
        {outcomes.map((outcome, index) => (
          <div
            key={index}
            className="flex items-start gap-2 p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50"
          >
            <span className="inline-flex items-center justify-center w-6 h-6 mt-1 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 text-xs font-bold shrink-0">
              {index + 1}
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 flex-1 min-w-0">
              <input
                type="text"
                value={outcome.en}
                onChange={(e) => update(index, "en", e.target.value)}
                placeholder="English"
                maxLength={200}
                className={inputClass}
              />
              <input
                type="text"
                value={outcome.ar}
                onChange={(e) => update(index, "ar", e.target.value)}
                placeholder="Arabic"
                dir="rtl"
                maxLength={200}
                className={inputClass}
              />
              <input
                type="text"
                value={outcome.es}
                onChange={(e) => update(index, "es", e.target.value)}
                placeholder="Spanish"
                maxLength={200}
                className={inputClass}
              />
            </div>
            <div className="flex flex-col gap-0.5 shrink-0">
              <button
                type="button"
                onClick={() => move(index, -1)}
                disabled={index === 0}
                className="p-1 rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed"
                title="Move up"
              >
                <ChevronUp className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={() => move(index, 1)}
                disabled={index === outcomes.length - 1}
                className="p-1 rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed"
                title="Move down"
              >
                <ChevronDown className="h-3.5 w-3.5" />
              </button>
            </div>
            <button
              type="button"
              onClick={() => remove(index)}
              className="p-1.5 mt-0.5 rounded text-slate-400 hover:text-red-500 shrink-0"
              title="Remove outcome"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={add}
        disabled={outcomes.length >= MAX_OUTCOMES}
        className="mt-2 inline-flex items-center gap-1.5 text-sm font-medium text-primary-600 hover:text-primary-700 disabled:opacity-40 disabled:cursor-not-allowed"
      >
        <Plus className="h-4 w-4" />
        Add outcome
      </button>
    </div>
  );
}
