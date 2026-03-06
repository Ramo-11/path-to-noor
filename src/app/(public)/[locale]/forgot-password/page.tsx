"use client";

import { useState, FormEvent } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Mail, ArrowLeft, ArrowRight, Loader2, CheckCircle } from "lucide-react";
import { useLocale } from "next-intl";

export default function ForgotPasswordPage() {
  const t = useTranslations("forgotPassword");
  const tAuth = useTranslations("auth");
  const locale = useLocale();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const BackArrow = locale === "ar" ? ArrowRight : ArrowLeft;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || t("error"));
        return;
      }

      setSent(true);
    } catch {
      setError(t("error"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="py-12 sm:py-20">
      <div className="max-w-md mx-auto px-4">
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-8">
          {sent ? (
            <div className="text-center">
              <CheckCircle className="h-12 w-12 text-emerald-500 mx-auto mb-4" />
              <h1 className="font-heading text-2xl font-bold text-slate-900 dark:text-white mb-2">
                {t("checkEmail")}
              </h1>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
                {t("checkEmailDescription")}
              </p>
              <Link
                href="/login"
                className="inline-flex items-center gap-2 text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors"
              >
                <BackArrow className="h-4 w-4" />
                {t("backToLogin")}
              </Link>
            </div>
          ) : (
            <>
              <div className="text-center mb-8">
                <Mail className="h-10 w-10 text-primary-600 mx-auto mb-3" />
                <h1 className="font-heading text-2xl font-bold text-slate-900 dark:text-white">
                  {t("title")}
                </h1>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                  {t("description")}
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5"
                  >
                    {tAuth("email")}
                  </label>
                  <input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-colors"
                    placeholder="you@example.com"
                  />
                </div>

                {error && (
                  <div className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg px-3 py-2">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full px-6 py-2.5 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white font-medium rounded-lg transition-colors"
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin mx-auto" />
                  ) : (
                    t("submit")
                  )}
                </button>
              </form>

              <p className="mt-6 text-center text-sm text-slate-600 dark:text-slate-400">
                <Link
                  href="/login"
                  className="font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400 transition-colors"
                >
                  {t("backToLogin")}
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
