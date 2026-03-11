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
  const [oauthOnly, setOauthOnly] = useState(false);
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

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || t("error"));
        return;
      }

      if (data.oauthOnly) {
        setOauthOnly(true);
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
          {oauthOnly ? (
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary-100 dark:bg-primary-900/30 mx-auto mb-4">
                <svg className="h-6 w-6" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
              </div>
              <h1 className="font-heading text-2xl font-bold text-slate-900 dark:text-white mb-2">
                {locale === "ar" ? "حسابك مرتبط بجوجل" : locale === "es" ? "Tu cuenta usa Google" : "Your account uses Google"}
              </h1>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
                {locale === "ar"
                  ? "هذا الحساب تم إنشاؤه باستخدام تسجيل الدخول بجوجل. لا تحتاج إلى كلمة مرور — فقط اضغط \"المتابعة مع جوجل\" لتسجيل الدخول."
                  : locale === "es"
                    ? "Esta cuenta fue creada con inicio de sesion de Google. No necesitas una contrasena — solo haz clic en \"Continuar con Google\" para iniciar sesion."
                    : "This account was created with Google sign-in. You don't need a password — just click \"Continue with Google\" to sign in."}
              </p>
              <Link
                href="/login"
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors text-sm"
              >
                <BackArrow className="h-4 w-4" />
                {t("backToLogin")}
              </Link>
            </div>
          ) : sent ? (
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
