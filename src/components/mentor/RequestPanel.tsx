"use client";

import { FormEvent, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Mail } from "lucide-react";
import { Button } from "@/components/primer/Button";
import { TextAreaField } from "@/components/primer/TextField";
import { Notice } from "@/components/primer/Notice";
import { Spinner } from "@/components/primer/Spinner";
import { StatusChip } from "./StatusChip";

interface MentorRequestData {
  _id: string;
  status: "pending" | "assigned" | "rejected";
  message?: string;
  mentorId?: {
    name: string;
    email: string;
  };
  createdAt: string;
}

type Phase = "loading" | "error" | "ready";

export function RequestPanel() {
  const t = useTranslations("mentor");

  const [phase, setPhase] = useState<Phase>("loading");
  const [request, setRequest] = useState<MentorRequestData | null>(null);
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [canceling, setCanceling] = useState(false);
  const [formError, setFormError] = useState("");
  const [cancelError, setCancelError] = useState("");

  async function load() {
    setPhase("loading");
    try {
      const res = await fetch("/api/user/mentor-request");
      if (!res.ok) throw new Error("failed");
      const data = await res.json();
      setRequest(data.data ?? null);
      setPhase("ready");
    } catch {
      setPhase("error");
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setFormError("");
    setSubmitting(true);

    try {
      const res = await fetch("/api/user/mentor-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      });

      const data = await res.json();

      if (!res.ok) {
        setFormError(data.error || t("submitError"));
        return;
      }

      setRequest(data.data);
      setMessage("");
    } catch {
      setFormError(t("submitError"));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleCancel() {
    setCancelError("");
    setCanceling(true);
    try {
      const res = await fetch("/api/user/mentor-request", { method: "DELETE" });
      if (!res.ok) {
        setCancelError(t("cancelError"));
        return;
      }
      setRequest(null);
    } catch {
      setCancelError(t("cancelError"));
    } finally {
      setCanceling(false);
    }
  }

  if (phase === "loading") {
    return (
      <div className="flex items-center justify-center py-16 text-ink-2" role="status" aria-label={t("loading")}>
        <Spinner className="size-6" />
      </div>
    );
  }

  if (phase === "error") {
    return (
      <Notice tone="error">
        <p>{t("loadError")}</p>
        <div className="mt-3">
          <Button variant="secondary" onClick={load}>
            {t("retry")}
          </Button>
        </div>
      </Notice>
    );
  }

  const form = (
    <div className="card max-w-2xl p-6 sm:p-8">
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <TextAreaField
          label={t("yourMessage")}
          hint={t("messageHint")}
          placeholder={t("messagePlaceholder")}
          maxLength={2000}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        {formError ? (
          <Notice tone="error">
            <p>{formError}</p>
          </Notice>
        ) : null}
        <div>
          <Button type="submit" variant="primary" loading={submitting} disabled={submitting}>
            {t("submitRequest")}
          </Button>
        </div>
      </form>
    </div>
  );

  return (
    <div aria-live="polite" className="flex flex-col gap-8 pt-10 pb-24">
      {request?.status === "assigned" && request.mentorId ? (
        <div className="card max-w-2xl p-6 sm:p-8">
          <div className="flex flex-col items-start gap-3">
            <StatusChip status="assigned" />
            <h2 className="text-heading font-semibold">{t("assignedTitle")}</h2>
            <p className="text-ink-2">{t("assignedBody")}</p>
            <div className="mt-1 flex flex-col gap-1">
              <p className="font-medium text-ink">{request.mentorId.name}</p>
              <a
                href={`mailto:${request.mentorId.email}`}
                className="inline-flex w-fit items-center gap-1.5 text-ink-2 underline decoration-rule-strong underline-offset-[0.25em] hover:text-ink hover:decoration-ink"
              >
                <Mail className="size-4" aria-hidden="true" />
                {request.mentorId.email}
              </a>
            </div>
          </div>
        </div>
      ) : null}

      {request?.status === "pending" ? (
        <div className="card max-w-2xl p-6 sm:p-8">
          <div className="flex flex-col items-start gap-3">
            <StatusChip status="pending" />
            <h2 className="text-heading font-semibold">{t("pendingTitle")}</h2>
            <p className="text-ink-2">{t("pendingBody")}</p>
            {cancelError ? (
              <Notice tone="error">
                <p>{cancelError}</p>
              </Notice>
            ) : null}
            <Button variant="secondary" onClick={handleCancel} loading={canceling} disabled={canceling}>
              {t("cancelRequest")}
            </Button>
          </div>
        </div>
      ) : null}

      {request?.status === "rejected" ? (
        <div className="flex flex-col gap-6">
          <div className="card max-w-2xl p-6 sm:p-8">
            <div className="flex flex-col items-start gap-3">
              <StatusChip status="rejected" />
              <h2 className="text-heading font-semibold">{t("rejectedTitle")}</h2>
              <p className="text-ink-2">{t("rejectedBody")}</p>
            </div>
          </div>
          {form}
        </div>
      ) : null}

      {!request ? form : null}
    </div>
  );
}
