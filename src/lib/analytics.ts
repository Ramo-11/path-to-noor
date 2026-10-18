export type AnalyticsEvent =
  | "placement_started"
  | "placement_completed"
  | "lesson_started"
  | "lesson_completed"
  | "knowledge_check_completed"
  | "sign_up"
  | "email_verified"
  | "mentor_requested"
  | "lesson_shared"
  | "lesson_reported"
  | "lesson_feedback"
  | "audio_played"
  | "search"
  | "app_installed";

type Params = Record<string, string | number | boolean | undefined>;

declare global {
  interface Window {
    gtag?: (command: "event", name: string, params?: Params) => void;
  }
}

export function track(event: AnalyticsEvent, params: Params = {}) {
  if (typeof window === "undefined" || typeof window.gtag !== "function") return;
  const lang = document.documentElement.lang || undefined;
  window.gtag("event", event, { language: lang, ...params });
}
