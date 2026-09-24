"use client";

import { Suspense, useState, type FormEvent } from "react";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/primer/Button";
import { TextField } from "@/components/primer/TextField";
import { Notice } from "@/components/primer/Notice";
import { PageIntro } from "@/components/primer/PageIntro";

const INVALID_TOKEN_ERROR = "Invalid or expired reset token";

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
      <>
        <PageIntro title={t("invalidToken")} lead={t("invalidTokenDescription")} />
        <div className="pb-16 sm:pb-24">
          <Button href="/forgot-password" variant="quiet">
            {t("requestNewLink")}
          </Button>
        </div>
      </>
    );
  }

  if (success) {
    return (
      <>
        <PageIntro title={t("success")} lead={t("successDescription")} />
        <div className="pb-16 sm:pb-24">
          <Button href="/login" size="lg">
            {tAuth("signIn")}
          </Button>
        </div>
      </>
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

      const data = await res.json();
      if (!res.ok) {
        if (data.error === INVALID_TOKEN_ERROR) {
          setTokenInvalid(true);
          return;
        }
        setError(data.error || t("error"));
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
    <>
      <PageIntro title={t("title")} lead={t("description")} />

      <div className="pb-16 sm:pb-24">
        <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>
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
      </div>
    </>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="mx-auto w-full max-w-md px-4 sm:px-6">
      <Suspense fallback={<div className="py-16 sm:py-24" />}>
        <ResetPasswordForm />
      </Suspense>
    </div>
  );
}
