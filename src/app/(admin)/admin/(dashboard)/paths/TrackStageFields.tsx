"use client";

import { STAGES, STAGE_NUMBER, type StageKey } from "@/lib/stages";
import { TRACKS, TRACK_LABELS, type TrackKey } from "@/lib/tracks";

const STAGE_LABELS: Record<StageKey, string> = {
  beginning: "Just beginning",
  foundations: "Building the basics",
  deeper: "Growing deeper",
};

interface TrackStageFieldsProps {
  tracks: TrackKey[];
  stage: StageKey;
  onTracksChange: (tracks: TrackKey[]) => void;
  onStageChange: (stage: StageKey) => void;
  inputClass: string;
  labelClass: string;
}

export function TrackStageFields({
  tracks,
  stage,
  onTracksChange,
  onStageChange,
  inputClass,
  labelClass,
}: TrackStageFieldsProps) {
  const missing = tracks.length === 0;

  function toggle(track: TrackKey, checked: boolean) {
    const next = checked ? [...tracks, track] : tracks.filter((t) => t !== track);
    onTracksChange(TRACKS.filter((t) => next.includes(t)));
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <fieldset aria-describedby="tracks-help">
        <legend className={labelClass}>Tracks</legend>
        <div className="space-y-2">
          {TRACKS.map((track) => (
            <div key={track} className="flex items-center gap-2">
              <input
                id={`track-${track}`}
                type="checkbox"
                checked={tracks.includes(track)}
                onChange={(e) => toggle(track, e.target.checked)}
                className="rounded border-slate-300 dark:border-slate-600 text-primary-600 focus:ring-primary-500"
              />
              <label htmlFor={`track-${track}`} className="text-sm text-slate-700 dark:text-slate-300">
                {TRACK_LABELS[track]}
              </label>
            </div>
          ))}
        </div>
        <p
          id="tracks-help"
          className={`mt-1 text-xs ${missing ? "text-red-600 dark:text-red-400" : "text-slate-400"}`}
        >
          {missing ? "Choose at least one track." : "Who this path is for. A path can be in more than one track."}
        </p>
      </fieldset>
      {tracks.includes("new") ? (
        <div>
          <label htmlFor="stage" className={labelClass}>
            Stage
          </label>
          <select
            id="stage"
            value={stage}
            required
            onChange={(e) => onStageChange(e.target.value as StageKey)}
            className={inputClass}
          >
            {STAGES.map((key) => (
              <option key={key} value={key}>
                Stage {STAGE_NUMBER[key]}: {STAGE_LABELS[key]}
              </option>
            ))}
          </select>
          <p className="mt-1 text-xs text-slate-400">Where this path sits for people new to Islam</p>
        </div>
      ) : null}
    </div>
  );
}
