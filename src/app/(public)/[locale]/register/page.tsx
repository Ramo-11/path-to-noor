"use client";

import { useState, type FormEvent } from "react";
import { signIn } from "next-auth/react";
import { useTranslations, useLocale } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import { Button } from "@/components/primer/Button";
import { TextField } from "@/components/primer/TextField";
import { Notice } from "@/components/primer/Notice";
import { AuthShell } from "@/components/auth/AuthShell";
import { GoogleButton } from "@/components/auth/GoogleButton";
import { AuthDivider } from "@/components/auth/AuthDivider";
import { authErrorKey } from "@/components/auth/auth-errors";
import { Turnstile, turnstileEnabled } from "@/components/auth/Turnstile";
import { Honeypot, useFormStart } from "@/components/auth/BotFields";
import { track } from "@/lib/analytics";

function readTrack(): string | undefined {
  try {
    const value = window.localStorage.getItem("bd.track");
    return value === "curious" || value === "new" || value === "muslim" ? value : undefined;
  } catch {
    return undefined;
  }
}

export default function RegisterPage() {
  const t = useTranslations("auth");
  const locale = useLocale();
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [signedIn, setSignedIn] = useState(false);
  const [website, setWebsite] = useState("");
  const [token, setToken] = useState<string | null>(null);
  const [resetKey, setResetKey] = useState(0);
  const startedAt = useFormStart();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          password,
          locale,
          track: readTrack(),
          website,
          formStartedAt: startedAt.read(),
          turnstileToken: token,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(t(`errors.${authErrorKey(data.code, res.status)}`));
        setLoading(false);
        setResetKey((n) => n + 1);
        return;
      }

      track("sign_up", { method: "email" });

      const signInResult = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });
      setSignedIn(!signInResult?.error);
      setDone(true);
      setLoading(false);
    } catch {
      setError(t("errorDefault"));
      setLoading(false);
    }
  }

  if (done) {
    return (
      <AuthShell mobileArt={false}>
        <h1 className="text-heading font-semibold text-balance">{t("checkEmailTitle")}</h1>
        <p className="mt-2 text-ink-2 text-pretty">{t("checkEmailDescription")}</p>
        <div className="mt-6">
          <Button
            size="lg"
            onClick={() => router.replace(signedIn ? "/onboarding" : "/login")}
          >
            {t("continue")}
          </Button>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell mobileArt={false}>
      <h1 className="text-heading font-semibold text-balance">{t("createTitle")}</h1>
      <p className="mt-2 text-ink-2 text-pretty">{t("createDescription")}</p>

      <div className="mt-6">
        <GoogleButton callbackUrl={`/${locale}/onboarding`} />
      </div>

      <AuthDivider />

      <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>
        <Honeypot value={website} onChange={setWebsite} />
        <TextField
          label={t("name")}
          type="text"
          name="name"
          autoComplete="name"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

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

        <TextField
          label={t("password")}
          type="password"
          name="password"
          autoComplete="new-password"
          required
          minLength={8}
          hint={t("passwordHint")}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <p className="text-meta text-ink-3">
          {t.rich("consent", {
            terms: (chunks) => (
              <Link href="/terms" className="text-ink-2 underline decoration-rule-strong underline-offset-[0.25em] hover:text-ink hover:decoration-ink">
                {chunks}
              </Link>
            ),
            privacy: (chunks) => (
              <Link href="/privacy" className="text-ink-2 underline decoration-rule-strong underline-offset-[0.25em] hover:text-ink hover:decoration-ink">
                {chunks}
              </Link>
            ),
          })}
        </p>

        <Turnstile onToken={setToken} resetKey={resetKey} />

        {error ? <Notice tone="error">{error}</Notice> : null}

        <Button type="submit" size="lg" fullWidth loading={loading} disabled={turnstileEnabled && !token}>
          {t("signUp")}
        </Button>
      </form>

      <p className="mt-6 text-[0.9375rem] text-ink-2">
        {t("alreadyHaveAccount")}{" "}
        <Link
          href="/login"
          className="inline-flex min-h-11 items-center text-ink underline decoration-rule-strong underline-offset-[0.25em] hover:decoration-ink"
        >
          {t("signIn")}
        </Link>
      </p>
    </AuthShell>
  );
}
