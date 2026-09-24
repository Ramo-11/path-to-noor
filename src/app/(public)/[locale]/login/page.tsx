"use client";

import { Suspense, useState, type FormEvent } from "react";
import { signIn } from "next-auth/react";
import { useTranslations, useLocale } from "next-intl";
import { useSearchParams } from "next/navigation";
import { Link, useRouter } from "@/i18n/navigation";
import { Button } from "@/components/primer/Button";
import { TextField } from "@/components/primer/TextField";
import { Notice } from "@/components/primer/Notice";
import { AuthShell } from "@/components/auth/AuthShell";
import { GoogleButton } from "@/components/auth/GoogleButton";
import { AuthDivider } from "@/components/auth/AuthDivider";
import { getSafeCallbackUrl } from "@/components/auth/callback-url";

function LoginForm() {
  const t = useTranslations("auth");
  const locale = useLocale();
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = getSafeCallbackUrl(searchParams.get("callbackUrl"));
  const oauthError = searchParams.get("error");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(oauthError ? t("errorOAuth") : "");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError(t("errorCredentials"));
        setLoading(false);
        return;
      }

      if (callbackUrl) {
        window.location.assign(callbackUrl);
        return;
      }

      const sessionRes = await fetch("/api/auth/session");
      const session = await sessionRes.json();
      const role = session?.user?.role;

      if (role === "admin" || role === "super_admin") {
        window.location.assign("/admin");
        return;
      }

      router.replace("/");
    } catch {
      setError(t("errorDefault"));
      setLoading(false);
    }
  }

  return (
    <AuthShell>
      <h1 className="text-heading font-semibold text-balance">{t("welcomeBack")}</h1>
      <p className="mt-2 text-ink-2 text-pretty">{t("signInDescription")}</p>

      <div className="mt-6">
        <GoogleButton callbackUrl={callbackUrl ?? `/${locale}`} />
      </div>

      <AuthDivider />

      <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>
        <TextField
          label={t("email")}
          type="email"
          name="email"
          autoComplete="email"
          inputMode="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <div>
          <TextField
            label={t("password")}
            type="password"
            name="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <div className="mt-2 text-end">
            <Link
              href="/forgot-password"
              className="text-[0.9375rem] text-ink-2 underline decoration-rule-strong underline-offset-[0.25em] hover:text-ink hover:decoration-ink"
            >
              {t("forgotPassword")}
            </Link>
          </div>
        </div>

        {error ? <Notice tone="error">{error}</Notice> : null}

        <Button type="submit" size="lg" fullWidth loading={loading}>
          {t("signIn")}
        </Button>
      </form>

      <p className="mt-6 text-[0.9375rem] text-ink-2">
        {t("dontHaveAccount")}{" "}
        <Link
          href="/register"
          className="text-ink underline decoration-rule-strong underline-offset-[0.25em] hover:decoration-ink"
        >
          {t("signUp")}
        </Link>
      </p>
    </AuthShell>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="mx-auto w-full max-w-5xl px-4 py-20 sm:px-6 lg:px-8" />}>
      <LoginForm />
    </Suspense>
  );
}
