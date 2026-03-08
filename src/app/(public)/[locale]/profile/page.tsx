"use client";

import { useState, useEffect, FormEvent } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useSession } from "next-auth/react";
import { Link, useRouter } from "@/i18n/navigation";
import { Container } from "@/components/layout/Container";
import {
  User,
  BookOpen,
  Bookmark,
  FileQuestion,
  Calendar,
  Loader2,
  Check,
  CheckCircle,
  Eye,
  EyeOff,
} from "lucide-react";

interface ProfileData {
  name: string;
  email: string;
  image: string | null;
  preferredLanguage: "en" | "ar" | "es";
  role: string;
  userType?: string;
  lessonsCompleted: number;
  bookmarksCount: number;
  quizzesCompleted: number;
  topicsCompleted: number;
  joinedAt: string;
}

export default function ProfilePage() {
  const t = useTranslations("profile");
  const tAuth = useTranslations("auth");
  const locale = useLocale();
  const router = useRouter();
  const { data: session, status } = useSession();

  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);

  // Profile form
  const [name, setName] = useState("");
  const [preferredLanguage, setPreferredLanguage] = useState<"en" | "ar" | "es">("en");
  const [saving, setSaving] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [profileError, setProfileError] = useState("");

  // Password form
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordError, setPasswordError] = useState("");

  useEffect(() => {
    if (status !== "authenticated") {
      setLoading(false);
      return;
    }

    fetch("/api/user/profile")
      .then((res) => res.json())
      .then((data) => {
        if (data.data) {
          setProfile(data.data);
          setName(data.data.name);
          setPreferredLanguage(data.data.preferredLanguage);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [status]);

  async function handleProfileSubmit(e: FormEvent) {
    e.preventDefault();
    setProfileError("");
    setProfileSuccess(false);
    setSaving(true);

    try {
      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, preferredLanguage }),
      });

      const data = await res.json();
      if (!res.ok) {
        setProfileError(data.error || t("updateFailed"));
        return;
      }

      setProfileSuccess(true);
      setTimeout(() => setProfileSuccess(false), 3000);

      // If language changed, redirect to that locale
      if (preferredLanguage !== locale) {
        router.push("/profile");
      }
    } catch {
      setProfileError(t("updateFailed"));
    } finally {
      setSaving(false);
    }
  }

  async function handlePasswordSubmit(e: FormEvent) {
    e.preventDefault();
    setPasswordError("");
    setPasswordSuccess(false);
    setPasswordSaving(true);

    try {
      const res = await fetch("/api/user/profile/password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const data = await res.json();
      if (!res.ok) {
        setPasswordError(data.error || t("passwordFailed"));
        return;
      }

      setPasswordSuccess(true);
      setCurrentPassword("");
      setNewPassword("");
      setTimeout(() => setPasswordSuccess(false), 3000);
    } catch {
      setPasswordError(t("passwordFailed"));
    } finally {
      setPasswordSaving(false);
    }
  }

  if (status === "unauthenticated") {
    return (
      <section className="py-16 sm:py-24">
        <Container size="md">
          <div className="text-center py-16">
            <User className="h-12 w-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              {t("loginRequired")}
            </p>
            <Link
              href="/login"
              className="inline-flex px-6 py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors"
            >
              {tAuth("signIn")}
            </Link>
          </div>
        </Container>
      </section>
    );
  }

  if (loading) {
    return (
      <section className="py-16 sm:py-24">
        <Container size="md">
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
          </div>
        </Container>
      </section>
    );
  }

  const inputClass =
    "w-full px-3 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-colors";
  const labelClass =
    "block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5";

  return (
    <section className="py-16 sm:py-24">
      <Container size="md">
        <div className="mb-8">
          <h1 className="font-heading text-3xl font-bold text-slate-900 dark:text-white">
            {t("title")}
          </h1>
          <div className="mt-3 decorative-line" />
        </div>

        {/* Stats */}
        {profile && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="flex items-center gap-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4">
              <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600">
                <BookOpen className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xl font-bold text-slate-900 dark:text-white">
                  {profile.lessonsCompleted}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {t("lessonsCompleted")}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4">
              <div className="p-2 rounded-lg bg-accent-100 dark:bg-accent-900/30 text-accent-600">
                <Bookmark className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xl font-bold text-slate-900 dark:text-white">
                  {profile.bookmarksCount}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {t("bookmarked")}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4">
              <div className="p-2 rounded-lg bg-primary-100 dark:bg-primary-900/30 text-primary-600">
                <FileQuestion className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xl font-bold text-slate-900 dark:text-white">
                  {profile.quizzesCompleted}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {t("quizzesPassed")}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4">
              <div className="p-2 rounded-lg bg-sky-100 dark:bg-sky-900/30 text-sky-600">
                <CheckCircle className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xl font-bold text-slate-900 dark:text-white">
                  {profile.topicsCompleted}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {t("topicsLearnt")}
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-8">
          {/* Profile settings */}
          <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
              {t("personalInfo")}
            </h2>

            <form onSubmit={handleProfileSubmit} className="space-y-4">
              <div>
                <label htmlFor="email" className={labelClass}>
                  {tAuth("email")}
                </label>
                <input
                  id="email"
                  type="email"
                  value={profile?.email || ""}
                  disabled
                  className={`${inputClass} opacity-60 cursor-not-allowed`}
                />
              </div>

              <div>
                <label htmlFor="name" className={labelClass}>
                  {tAuth("name")}
                </label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className={inputClass}
                />
              </div>

              <div>
                <label htmlFor="language" className={labelClass}>
                  {t("preferredLanguage")}
                </label>
                <select
                  id="language"
                  value={preferredLanguage}
                  onChange={(e) =>
                    setPreferredLanguage(e.target.value as "en" | "ar" | "es")
                  }
                  className={inputClass}
                >
                  <option value="en">English</option>
                  <option value="ar">العربية</option>
                  <option value="es">Español</option>
                </select>
              </div>

              {profile?.joinedAt && (
                <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                  <Calendar className="h-4 w-4" />
                  {t("memberSince", {
                    date: new Date(profile.joinedAt).toLocaleDateString(
                      locale === "ar" ? "ar-SA" : locale === "es" ? "es-ES" : "en-US",
                      { year: "numeric", month: "long" }
                    ),
                  })}
                </div>
              )}

              {profileError && (
                <div className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg px-3 py-2">
                  {profileError}
                </div>
              )}

              {profileSuccess && (
                <div className="flex items-center gap-2 text-sm text-emerald-600 dark:text-emerald-400">
                  <Check className="h-4 w-4" />
                  {t("updateSuccess")}
                </div>
              )}

              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2.5 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white font-medium rounded-lg transition-colors text-sm"
              >
                {saving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  t("saveChanges")
                )}
              </button>
            </form>
          </div>

          {/* Password change */}
          <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
              {t("changePassword")}
            </h2>

            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div>
                <label htmlFor="currentPassword" className={labelClass}>
                  {t("currentPassword")}
                </label>
                <div className="relative">
                  <input
                    id="currentPassword"
                    type={showCurrentPassword ? "text" : "password"}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                    className={`${inputClass} pe-10`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute end-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                    aria-label={showCurrentPassword ? "Hide password" : "Show password"}
                  >
                    {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="newPassword" className={labelClass}>
                  {t("newPassword")}
                </label>
                <div className="relative">
                  <input
                    id="newPassword"
                    type={showNewPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    minLength={8}
                    className={`${inputClass} pe-10`}
                    placeholder={t("minCharacters")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute end-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                    aria-label={showNewPassword ? "Hide password" : "Show password"}
                  >
                    {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {passwordError && (
                <div className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg px-3 py-2">
                  {passwordError}
                </div>
              )}

              {passwordSuccess && (
                <div className="flex items-center gap-2 text-sm text-emerald-600 dark:text-emerald-400">
                  <Check className="h-4 w-4" />
                  {t("passwordSuccess")}
                </div>
              )}

              <button
                type="submit"
                disabled={passwordSaving}
                className="px-6 py-2.5 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white font-medium rounded-lg transition-colors text-sm"
              >
                {passwordSaving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  t("updatePassword")
                )}
              </button>
            </form>
          </div>
        </div>
      </Container>
    </section>
  );
}
