"use client";

import { useSyncExternalStore } from "react";
import { TRACK_STORAGE_KEY, isTrackKey, type TrackKey } from "@/lib/tracks";

const CHANGE_EVENT = "bd:track-change";

function readRaw(): string | null {
  try {
    return window.localStorage.getItem(TRACK_STORAGE_KEY);
  } catch {
    return null;
  }
}

function subscribe(onChange: () => void) {
  window.addEventListener("storage", onChange);
  window.addEventListener(CHANGE_EVENT, onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(CHANGE_EVENT, onChange);
  };
}

function serverSnapshot() {
  return null;
}

function notify() {
  try {
    window.dispatchEvent(new Event(CHANGE_EVENT));
  } catch {
    return;
  }
}

export function readStoredTrack(): TrackKey | null {
  const raw = readRaw();
  return isTrackKey(raw) ? raw : null;
}

export function writeStoredTrack(track: TrackKey): boolean {
  try {
    window.localStorage.setItem(TRACK_STORAGE_KEY, track);
    notify();
    return true;
  } catch {
    return false;
  }
}

export function clearStoredTrack(): void {
  try {
    window.localStorage.removeItem(TRACK_STORAGE_KEY);
  } catch {
    return;
  }
  notify();
}

export function useStoredTrack(): TrackKey | null {
  const raw = useSyncExternalStore(subscribe, readRaw, serverSnapshot);
  return isTrackKey(raw) ? raw : null;
}

export async function saveAccountTrack(track: TrackKey): Promise<boolean> {
  try {
    const response = await fetch("/api/user/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ track }),
      keepalive: true,
    });
    return response.ok;
  } catch {
    return false;
  }
}

export async function clearAccountTrack(): Promise<boolean> {
  try {
    const response = await fetch("/api/user/track", { method: "DELETE" });
    return response.ok;
  } catch {
    return false;
  }
}
