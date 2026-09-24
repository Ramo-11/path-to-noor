"use client";

import { useState } from "react";
import type { Editor } from "@tiptap/react";
import { Languages, ListOrdered, HelpCircle, Sparkles } from "lucide-react";
import {
  LESSON_BLOCK_DEFAULTS,
  type LessonBlockAttrs,
  type LessonBlockType,
} from "@/lib/lesson-blocks";
import { PhraseCardForm } from "./PhraseCardBlock";
import { StepListForm } from "./StepListBlock";
import { QuickCheckForm } from "./QuickCheckBlock";
import { KeyPointForm } from "./KeyPointBlock";

const BLOCK_BUTTONS: { type: LessonBlockType; label: string; icon: typeof Languages }[] = [
  { type: "phraseCard", label: "Arabic phrase", icon: Languages },
  { type: "stepList", label: "Steps", icon: ListOrdered },
  { type: "quickCheck", label: "Quick question", icon: HelpCircle },
  { type: "keyPoint", label: "Key point", icon: Sparkles },
];

export function InsertBlockToolbar({ editor }: { editor: Editor }) {
  const [open, setOpen] = useState<LessonBlockType | null>(null);

  function insert<T extends LessonBlockType>(type: T, attrs: LessonBlockAttrs[T]) {
    editor.chain().focus().insertContent({ type, attrs }).run();
    setOpen(null);
  }

  return (
    <div className="flex items-center gap-0.5">
      {BLOCK_BUTTONS.map(({ type, label, icon: Icon }) => (
        <div key={type} className="relative">
          <button
            type="button"
            onClick={() => setOpen(open === type ? null : type)}
            title={label}
            className={`flex items-center gap-1 px-2 py-1.5 rounded text-xs font-medium transition-colors ${
              open === type
                ? "bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400"
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
            }`}
          >
            <Icon className="h-3.5 w-3.5" />
            {label}
          </button>

          {open === type && (
            <div className="absolute top-full left-0 mt-1 z-50">
              {type === "phraseCard" && (
                <PhraseCardForm
                  initial={LESSON_BLOCK_DEFAULTS.phraseCard}
                  submitLabel="Insert"
                  onCancel={() => setOpen(null)}
                  onSubmit={(attrs) => insert("phraseCard", attrs)}
                />
              )}
              {type === "stepList" && (
                <StepListForm
                  initial={LESSON_BLOCK_DEFAULTS.stepList}
                  submitLabel="Insert"
                  onCancel={() => setOpen(null)}
                  onSubmit={(attrs) => insert("stepList", attrs)}
                />
              )}
              {type === "quickCheck" && (
                <QuickCheckForm
                  initial={LESSON_BLOCK_DEFAULTS.quickCheck}
                  submitLabel="Insert"
                  onCancel={() => setOpen(null)}
                  onSubmit={(attrs) => insert("quickCheck", attrs)}
                />
              )}
              {type === "keyPoint" && (
                <KeyPointForm
                  initial={LESSON_BLOCK_DEFAULTS.keyPoint}
                  submitLabel="Insert"
                  onCancel={() => setOpen(null)}
                  onSubmit={(attrs) => insert("keyPoint", attrs)}
                />
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
