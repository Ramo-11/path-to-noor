"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useTranslations } from "next-intl";
import { useLocale } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import { Eye, EyeOff } from "lucide-react";

export default function RegisterPage() {
  const t = useTranslations("auth");
  const locale = useLocale();
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [userType, setUserType] = useState<"revert" | "mentor" | "">("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, userType }),
      });

      if (res.status === 409) {
        setError(t("errorEmailExists"));
        setLoading(false);
        return;
      }

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || t("errorDefault"));
        setLoading(false);
        return;
      }

      setSuccess(t("registrationSuccess"));
      setTimeout(() => {
        router.push("/login");
      }, 1500);
    } catch {
      setError(t("errorDefault"));
    } finally {
      setLoading(false);
    }
  }

  function handleGoogleSignIn() {
    setGoogleLoading(true);
    signIn("google", { callbackUrl: `/${locale}` });
  }

  return (
    <section className="py-12 sm:py-20">
      <div className="max-w-md mx-auto px-4">
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="font-heading text-2xl font-bold text-slate-900 dark:text-white">
              {t("signUp")}
            </h1>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
              {t("createAccountDescription")}
            </p>
          </div>

          {/* Google OAuth */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={googleLoading}
            className="w-full flex items-center justify-center gap-3 px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 transition-colors"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            {googleLoading ? (
              <span className="inline-block h-4 w-4 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin" />
            ) : (
              t("continueWithGoogle")
            )}
          </button>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200 dark:border-slate-700" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-white dark:bg-slate-900 px-3 text-slate-500 dark:text-slate-400">
                {t("or")}
              </span>
            </div>
          </div>

          {/* Registration Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5"
              >
                {t("name")}
              </label>
              <input
                id="name"
                type="text"
                required
                autoComplete="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-colors"
                placeholder="Your full name"
              />
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5"
              >
                {t("email")}
              </label>
              <input
                id="email"
                type="email"
                required
                autoComplete="email"
                inputMode="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-colors"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5"
              >
                {t("password")}
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  minLength={8}
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2.5 pe-10 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-colors"
                  placeholder="Min. 8 chars, mix letters & numbers"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute end-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                {t("iAmA")}
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setUserType("revert")}
                  className={`flex flex-col items-center gap-1.5 px-4 py-3 rounded-lg border-2 text-sm font-medium transition-colors ${
                    userType === "revert"
                      ? "border-primary-600 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300"
                      : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-600"
                  }`}
                >
                  <span className="text-base">{t("revert")}</span>
                  <span className="text-xs font-normal text-slate-600 dark:text-slate-400">{t("revertDescription")}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setUserType("mentor")}
                  className={`flex flex-col items-center gap-1.5 px-4 py-3 rounded-lg border-2 text-sm font-medium transition-colors ${
                    userType === "mentor"
                      ? "border-primary-600 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300"
                      : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-600"
                  }`}
                >
                  <span className="text-base">{t("mentor")}</span>
                  <span className="text-xs font-normal text-slate-600 dark:text-slate-400">{t("mentorDescription")}</span>
                </button>
              </div>
            </div>

            {error && (
              <div
                role="alert"
                aria-live="assertive"
                className="text-sm text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg px-3 py-2"
              >
                {error}
              </div>
            )}

            {success && (
              <div
                role="status"
                aria-live="polite"
                className="text-sm text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-lg px-3 py-2"
              >
                {success}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !!success}
              aria-busy={loading}
              className="w-full px-6 py-2.5 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white font-medium rounded-lg transition-colors"
            >
              {loading ? (
                <span className="inline-block h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                t("signUp")
              )}
            </button>
          </form>

          {/* Footer link */}
          <p className="mt-6 text-center text-sm text-slate-600 dark:text-slate-400">
            {t("alreadyHaveAccount")}{" "}
            <Link
              href="/login"
              className="font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 transition-colors"
            >
              {t("signIn")}
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
}
