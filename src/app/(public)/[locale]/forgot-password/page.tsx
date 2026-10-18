"use client";

import { useState, type FormEvent } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Button } from "@/components/primer/Button";
import { TextField } from "@/components/primer/TextField";
import { Notice } from "@/components/primer/Notice";
import { AuthShell } from "@/components/auth/AuthShell";
import { authErrorKey } from "@/components/auth/auth-errors";

export default function ForgotPasswordPage() {
  const t = useTranslations("forgotPassword");
  const tAuth = useTranslations("auth");
  const locale = useLocale();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, locale }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(t(`errors.${authErrorKey(data.code, res.status)}`));
        setLoading(false);
        return;
      }

      setSent(true);
    } catch {
      setError(t("error"));
    } finally {
      setLoading(false);
    }
  }

  if (sent) {
    return (
      <AuthShell>
        <h1 className="text-heading font-semibold text-balance">{t("checkEmail")}</h1>
        <p className="mt-2 text-ink-2 text-pretty">{t("checkEmailDescription")}</p>
        <details className="mt-4 text-[0.9375rem] text-ink-2">
          <summary className="cursor-pointer font-medium text-ink">{t("oauthHintSummary")}</summary>
          <p className="mt-2 text-pretty">{t("oauthHint")}</p>
        </details>
        <div className="mt-6">
          <Button href="/login" variant="quiet">
            {t("backToLogin")}
          </Button>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell>
      <h1 className="text-heading font-semibold text-balance">{t("title")}</h1>
      <p className="mt-2 text-ink-2 text-pretty">{t("description")}</p>

      <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-5" noValidate>
        <TextField
          label={tAuth("email")}
          type="email"
          name="email"
          autoComplete="email"
          inputMode="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        {error ? <Notice tone="error">{error}</Notice> : null}

        <Button type="submit" size="lg" fullWidth loading={loading}>
          {t("submit")}
        </Button>
      </form>

      <div className="mt-6">
        <Button href="/login" variant="quiet">
          {t("backToLogin")}
        </Button>
      </div>
    </AuthShell>
  );
}
