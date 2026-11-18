"use client";

import { useCallback, useEffect, useState } from "react";
import { useLearner } from "@/lib/use-learner";

export type MemberResource<T> =
  | { kind: "guest" }
  | { kind: "loading" }
  | { kind: "error"; retry: () => void }
  | { kind: "ready"; data: T };

export function useMemberResource<T extends { access: string }>(url: string): MemberResource<Exclude<T, { access: "guest" }>> {
  type Ready = Exclude<T, { access: "guest" }>;
  const { status, me } = useLearner();
  const [data, setData] = useState<Ready | null>(null);
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const key = status === "signedIn" && me ? `${me.user.id}:${me.completedLessonIds.length}` : null;

  useEffect(() => {
    if (!key) return;
    const controller = new AbortController();
    fetch(url, { cache: "no-store", credentials: "same-origin", signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error(String(response.status));
        return response.json() as Promise<T>;
      })
      .then((payload) => {
        if (payload.access === "guest") throw new Error("guest");
        setData(payload as Ready);
        setFailed(false);
      })
      .catch(() => {
        if (!controller.signal.aborted) setFailed(true);
      });
    return () => controller.abort();
  }, [key, url, attempt]);

  const retry = useCallback(() => {
    setFailed(false);
    setAttempt((value) => value + 1);
  }, []);

  if (!key) return status === "loading" ? { kind: "loading" } : { kind: "guest" };
  if (data) return { kind: "ready", data };
  if (failed) return { kind: "error", retry };
  return { kind: "loading" };
}
