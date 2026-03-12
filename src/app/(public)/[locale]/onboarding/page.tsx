"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useSession } from "next-auth/react";

export default function OnboardingPage() {
  const t = useTranslations("auth");
  const locale = useLocale();
  const { update } = useSession();

  const [userType, setUserType] = useState<"revert" | "mentor" | "">("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit() {
    if (!userType) return;
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/set-user-type", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userType }),
      });

      if (!res.ok) {
        setError(t("errorDefault"));
        setLoading(false);
        return;
      }

      // Refresh the session so userType is available immediately
      await update();
      // Full reload to ensure session is fully propagated
      window.location.href = `/${locale}`;
    } catch {
      setError(t("errorDefault"));
      setLoading(false);
    }
  }

  return (
    <section className="py-12 sm:py-20">
      <div className="max-w-md mx-auto px-4">
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-8">
          <div className="text-center mb-8">
            <h1 className="font-heading text-2xl font-bold text-slate-900 dark:text-white">
              {t("onboardingTitle")}
            </h1>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
              {t("onboardingDescription")}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
              {t("iAmA")}
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setUserType("revert")}
                className={`flex flex-col items-center gap-1.5 px-4 py-4 rounded-lg border-2 text-sm font-medium transition-colors ${
                  userType === "revert"
                    ? "border-primary-600 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300"
                    : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-600"
                }`}
              >
                <span className="text-base">{t("revert")}</span>
                <span className="text-xs font-normal opacity-70">
                  {t("revertDescription")}
                </span>
              </button>
              <button
                type="button"
                onClick={() => setUserType("mentor")}
                className={`flex flex-col items-center gap-1.5 px-4 py-4 rounded-lg border-2 text-sm font-medium transition-colors ${
                  userType === "mentor"
                    ? "border-primary-600 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300"
                    : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-600"
                }`}
              >
                <span className="text-base">{t("mentor")}</span>
                <span className="text-xs font-normal opacity-70">
                  {t("mentorDescription")}
                </span>
              </button>
            </div>
          </div>

          {error && (
            <div className="mt-4 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg px-3 py-2">
              {error}
            </div>
          )}

          <button
            type="button"
            onClick={handleSubmit}
            disabled={!userType || loading}
            className="mt-6 w-full px-6 py-2.5 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white font-medium rounded-lg transition-colors"
          >
            {loading ? (
              <span className="inline-block h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              t("continue")
            )}
          </button>
        </div>
      </div>
    </section>
  );
}
