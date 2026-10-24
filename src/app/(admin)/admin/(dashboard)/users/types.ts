export interface UserRow {
  _id: string;
  name: string;
  email: string;
  userType?: string;
  track?: string;
  verified: boolean;
  legacy: boolean;
  isActive: boolean;
  preferredLanguage: string;
  createdAt: string;
}

export interface EditableUser {
  _id: string;
  name: string;
  email: string;
  userType?: string;
  track?: string;
  preferredLanguage: string;
  isActive: boolean;
  verified: boolean;
}

export const TRACK_LABELS: Record<string, string> = {
  curious: "Curious",
  new: "New to Islam",
  muslim: "Muslim",
};

export const TYPE_LABELS: Record<string, string> = {
  revert: "New Muslim",
  mentor: "Mentor",
};

export const LANGUAGE_LABELS: Record<string, string> = {
  en: "English",
  ar: "Arabic",
  es: "Spanish",
};

export function statusLabel(u: { isActive: boolean; verified: boolean; legacy: boolean }): string {
  if (!u.isActive) return "Inactive";
  if (u.verified) return "Active";
  return u.legacy ? "Not verified (older account)" : "Unverified";
}

export function statusClass(label: string): string {
  if (label === "Inactive") return "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400";
  if (label === "Active") return "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400";
  if (label === "Unverified") return "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400";
  return "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400";
}
