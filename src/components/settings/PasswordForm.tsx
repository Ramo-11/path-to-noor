"use client";

import { useState, type FormEvent } from "react";
import { useTranslations } from "next-intl";
import { TextField } from "@/components/primer/TextField";
import { Button } from "@/components/primer/Button";
import { Notice } from "@/components/primer/Notice";

interface PasswordFormProps {
  hasPassword: boolean;
}

const ERROR_KEYS: Record<string, string> = {
  invalid_input: "newPasswordHint",
  not_found: "errorNotFound",
  google_account: "googleOnlyNotice",
  wrong_password: "errorWrongPassword",
  rate_limited: "errorRateLimited",
};

const PASSWORD_RULE = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9]).{8,128}$/;

export function PasswordForm({ hasPassword }: PasswordFormProps) {
  const t = useTranslations("settings");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  if (!hasPassword) {
    return (
      <div className="flex flex-col items-start gap-2">
        <h2 className="text-heading font-semibold">{t("password")}</h2>
        <p className="text-ink-2">{t("googleOnlyNotice")}</p>
      </div>
    );
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError("");
    setSuccess(false);

    if (!PASSWORD_RULE.test(newPassword)) {
      setError(t("newPasswordHint"));
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/user/profile/password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(t(ERROR_KEYS[data.error] ?? "errorGeneric"));
        return;
      }

      setSuccess(true);
      setCurrentPassword("");
      setNewPassword("");
    } catch {
      setError(t("errorGeneric"));
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col items-start gap-5">
      <h2 className="text-heading font-semibold">{t("password")}</h2>

      <TextField
        label={t("currentPassword")}
        type="password"
        value={currentPassword}
        onChange={(event) => setCurrentPassword(event.target.value)}
        required
        autoComplete="current-password"
        className="w-full"
      />

      <TextField
        label={t("newPassword")}
        type="password"
        value={newPassword}
        onChange={(event) => setNewPassword(event.target.value)}
        required
        minLength={8}
        hint={t("newPasswordHint")}
        autoComplete="new-password"
        className="w-full"
      />

      {error ? <Notice tone="error">{error}</Notice> : null}
      {success ? <Notice tone="success">{t("passwordUpdated")}</Notice> : null}

      <Button type="submit" loading={saving}>
        {t("updatePassword")}
      </Button>
    </form>
  );
}
