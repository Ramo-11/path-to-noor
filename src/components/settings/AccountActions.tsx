"use client";

import { useState, type FormEvent } from "react";
import { TriangleAlert } from "lucide-react";
import { signOut } from "next-auth/react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/primer/Button";
import { Notice } from "@/components/primer/Notice";
import { TextField } from "@/components/primer/TextField";
import { clearOfflinePages } from "@/components/pwa/offline-cache";

interface AccountActionsProps {
  locale: string;
  hasPassword: boolean;
  canDelete: boolean;
}

const ERROR_KEYS: Record<string, string> = {
  invalid_input: "errorInvalidInput",
  not_found: "errorNotFound",
  admin_blocked: "adminBlocked",
  confirm_mismatch: "errorConfirmMismatch",
  password_required: "errorPasswordRequired",
  wrong_password: "errorWrongPassword",
  rate_limited: "errorRateLimited",
  unauthorized: "errorNotFound",
};

export function AccountActions({ locale, hasPassword, canDelete }: AccountActionsProps) {
  const t = useTranslations("settings");

  const [downloading, setDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState("");
  const [confirming, setConfirming] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [password, setPassword] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  async function handleSignOut() {
    await clearOfflinePages();
    await signOut({ callbackUrl: `/${locale}` });
  }

  async function handleDownload() {
    setDownloadError("");
    setDownloading(true);
    try {
      const res = await fetch("/api/user/export");
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setDownloadError(t(ERROR_KEYS[data.error] ?? "errorGeneric"));
        return;
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `basmet-dawah-my-data-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch {
      setDownloadError(t("errorGeneric"));
    } finally {
      setDownloading(false);
    }
  }

  function cancelDelete() {
    setConfirming(false);
    setConfirmText("");
    setPassword("");
    setDeleteError("");
  }

  async function handleDelete(event: FormEvent) {
    event.preventDefault();
    setDeleteError("");
    setDeleting(true);
    try {
      const res = await fetch("/api/user/account", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ confirm: confirmText, ...(hasPassword ? { password } : {}) }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setDeleteError(t(ERROR_KEYS[data.error] ?? "errorGeneric"));
        setDeleting(false);
        return;
      }
      await clearOfflinePages();
      await signOut({ callbackUrl: `/${locale}?account=deleted` });
    } catch {
      setDeleteError(t("errorGeneric"));
      setDeleting(false);
    }
  }

  const canSubmit = confirmText.trim().length > 0 && (!hasPassword || password.length > 0);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col items-start gap-4">
        <h2 className="text-heading font-semibold">{t("account")}</h2>
        <p className="text-ink-2">{t("signOutBody")}</p>
        <Button type="button" variant="secondary" onClick={handleSignOut}>
          {t("signOut")}
        </Button>
      </div>

      <div className="flex flex-col items-start gap-4">
        <h2 className="text-heading font-semibold">{t("dataTitle")}</h2>
        <p className="text-ink-2">{t("dataBody")}</p>
        {downloadError ? <Notice tone="error">{downloadError}</Notice> : null}
        <Button type="button" variant="secondary" onClick={handleDownload} loading={downloading}>
          {downloading ? t("downloading") : t("downloadData")}
        </Button>
      </div>

      <div className="flex flex-col items-start gap-3 rounded-[var(--radius-control)] bg-danger-tint px-4 py-4 sm:px-5">
        <p className="flex items-center gap-2 text-[0.9375rem] font-medium text-danger">
          <TriangleAlert aria-hidden="true" strokeWidth={1.75} className="size-4 shrink-0" />
          {t("dangerZone")}
        </p>

        {!canDelete ? (
          <p className="text-ink-2">{t("adminBlocked")}</p>
        ) : !confirming ? (
          <>
            <p className="text-ink-2">{t("deleteBody")}</p>
            <Button type="button" variant="danger" onClick={() => setConfirming(true)}>
              {t("deleteStart")}
            </Button>
          </>
        ) : (
          <form onSubmit={handleDelete} className="flex w-full flex-col items-start gap-4">
            <p className="text-ink-2">{t("deleteWarning")}</p>
            <TextField
              label={t("deleteConfirmLabel")}
              value={confirmText}
              onChange={(event) => setConfirmText(event.target.value)}
              autoComplete="off"
              autoCapitalize="off"
              spellCheck={false}
              className="w-full"
            />
            {hasPassword ? (
              <TextField
                label={t("deletePasswordLabel")}
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="current-password"
                className="w-full"
              />
            ) : null}
            {deleteError ? (
              <Notice tone="error" className="w-full">
                {deleteError}
              </Notice>
            ) : null}
            <div className="flex flex-wrap items-center gap-3">
              <Button type="submit" variant="danger" loading={deleting} disabled={!canSubmit}>
                {deleting ? t("deleting") : t("deleteConfirm")}
              </Button>
              <Button type="button" variant="secondary" onClick={cancelDelete} disabled={deleting}>
                {t("cancel")}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
