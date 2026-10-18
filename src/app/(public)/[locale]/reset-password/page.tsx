"use client";

import { Suspense, useState, type FormEvent } from "react";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/primer/Button";
import { TextField } from "@/components/primer/TextField";
import { Notice } from "@/components/primer/Notice";
import { AuthShell } from "@/components/auth/AuthShell";
import { authErrorKey } from "@/components/auth/auth-errors";

function ResetPasswordForm() {
  const t = useTranslations("resetPassword");
  const tAuth = useTranslations("auth");
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [tokenInvalid, setTokenInvalid] = useState(!token);
  const [error, setError] = useState("");

  if (tokenInvalid) {
    return (
      <AuthShell>
        <h1 className="text-heading font-semibold text-balance">{t("invalidToken")}</h1>
        <p className="mt-2 text-ink-2 text-pretty">{t("invalidTokenDescription")}</p>
        <div className="mt-6">
          <Button href="/forgot-password" variant="quiet">
            {t("requestNewLink")}
          </Button>
        </div>
      </AuthShell>
    );
  }

  if (success) {
    return (
      <AuthShell>
        <h1 className="text-heading font-semibold text-balance">{t("success")}</h1>
        <p className="mt-2 text-ink-2 text-pretty">{t("successDescription")}</p>
        <div className="mt-6">
          <Button href="/login" size="lg">
            {tAuth("signIn")}
          </Button>
        </div>
      </AuthShell>
    );
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError(t("passwordMismatch"));
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const key = authErrorKey(data.code, res.status);
        if (key === "invalid_token" || key === "expired_token") {
          setTokenInvalid(true);
          return;
        }
        setError(t(`errors.${key}`));
        return;
      }

      setSuccess(true);
    } catch {
      setError(t("error"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell>
      <h1 className="text-heading font-semibold text-balance">{t("title")}</h1>
      <p className="mt-2 text-ink-2 text-pretty">{t("description")}</p>

      <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-5" noValidate>
        <TextField
          label={t("newPassword")}
          type="password"
          name="new-password"
          autoComplete="new-password"
          required
          minLength={8}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <TextField
          label={t("confirmPassword")}
          type="password"
          name="confirm-password"
          autoComplete="new-password"
          required
          minLength={8}
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />

        {error ? <Notice tone="error">{error}</Notice> : null}

        <Button type="submit" size="lg" fullWidth loading={loading}>
          {t("submit")}
        </Button>
      </form>
    </AuthShell>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="mx-auto w-full max-w-5xl px-4 py-20 sm:px-6 lg:px-8" />}>
      <ResetPasswordForm />
    </Suspense>
  );
}
