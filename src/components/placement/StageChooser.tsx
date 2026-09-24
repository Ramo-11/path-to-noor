"use client";

import { STAGES, type StageKey } from "@/lib/stages";
import { StageTile } from "./StageTile";

interface StageChooserProps {
  current: StageKey;
  label: string;
  onChoose: (stage: StageKey) => void;
}

export function StageChooser({ current, label, onChoose }: StageChooserProps) {
  return (
    <div role="group" aria-label={label} className="grid grid-cols-3 gap-3 sm:gap-4">
      {STAGES.map((stage) => (
        <StageTile key={stage} stage={stage} active={stage === current} onSelect={onChoose} />
      ))}
    </div>
  );
}
