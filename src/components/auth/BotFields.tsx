"use client";

import { useCallback, useEffect, useRef, type Dispatch, type SetStateAction } from "react";

export function useFormStart() {
  const startedAt = useRef(0);
  const restart = useCallback(() => {
    startedAt.current = Date.now();
  }, []);
  useEffect(() => {
    restart();
  }, [restart]);
  const read = useCallback(() => startedAt.current, []);
  return { read, restart };
}

interface HoneypotProps {
  value: string;
  onChange: Dispatch<SetStateAction<string>>;
}

export function Honeypot({ value, onChange }: HoneypotProps) {
  return (
    <div
      aria-hidden="true"
      style={{
        position: "absolute",
        insetInlineStart: "-10000px",
        top: "auto",
        width: "1px",
        height: "1px",
        overflow: "hidden",
      }}
    >
      <label htmlFor="bd-website">Website</label>
      <input
        id="bd-website"
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}
