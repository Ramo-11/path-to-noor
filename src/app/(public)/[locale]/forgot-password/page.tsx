"use client";

import { useState, type FormEvent } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/primer/Button";
import { TextField } from "@/components/primer/TextField";
import { Notice } from "@/components/primer/Notice";
import { PageIntro } from "@/components/primer/PageIntro";

export default function ForgotPasswordPage() {
  const t = useTranslations("forgotPassword");
  const tAuth = useTranslations("auth");

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
        body: JSON.stringify({ email }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || t("error"));
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
      <div className="mx-auto w-full max-w-md px-4 sm:px-6">
        <PageIntro title={t("checkEmail")} lead={t("checkEmailDescription")} />
        <div className="pb-16 sm:pb-24">
          <p className="text-meta text-ink-3">{t("oauthHint")}</p>
          <div className="mt-8">
            <Button href="/login" variant="quiet">
              {t("backToLogin")}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-md px-4 sm:px-6">
      <PageIntro title={t("title")} lead={t("description")} />

      <div className="pb-16 sm:pb-24">
        <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>
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

        <div className="mt-8">
          <Button href="/login" variant="quiet">
            {t("backToLogin")}
          </Button>
        </div>
      </div>
    </div>
  );
}
