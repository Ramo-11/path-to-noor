"use client";

import { useCallback, useEffect, useState } from "react";

export type MeResourceStatus = "idle" | "loading" | "ready" | "error";

interface MeResourceState<T> {
  url: string | null;
  data: T | null;
  failed: boolean;
}

export interface MeResource<T> {
  status: MeResourceStatus;
  data: T | null;
  retry: () => void;
}

export function useMeResource<T>(url: string | null): MeResource<T> {
  const [state, setState] = useState<MeResourceState<T>>({ url: null, data: null, failed: false });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (!url) return;
    const controller = new AbortController();
    fetch(url, { cache: "no-store", credentials: "same-origin", signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error(String(response.status));
        return response.json() as Promise<T>;
      })
      .then((data) => setState({ url, data, failed: false }))
      .catch(() => {
        if (controller.signal.aborted) return;
        setState({ url, data: null, failed: true });
      });
    return () => controller.abort();
  }, [url, attempt]);

  const retry = useCallback(() => {
    setState({ url: null, data: null, failed: false });
    setAttempt((value) => value + 1);
  }, []);

  const current = url !== null && state.url === url ? state : null;
  const status: MeResourceStatus = !url ? "idle" : !current ? "loading" : current.failed ? "error" : "ready";
  return { status, data: current?.data ?? null, retry };
}
