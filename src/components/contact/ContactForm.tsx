"use client";

import { FormEvent, useId, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useSession } from "next-auth/react";
import { ChevronDown, Send } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/primer/Button";
import { TextField, TextAreaField } from "@/components/primer/TextField";
import { Notice } from "@/components/primer/Notice";
import { Turnstile, turnstileEnabled } from "@/components/auth/Turnstile";
import { Honeypot, useFormStart } from "@/components/auth/BotFields";

const TOPICS = ["question", "mentor", "technical", "feedback", "other"] as const;
type Topic = (typeof TOPICS)[number];
const TOPIC_KEY: Record<Topic, string> = {
  question: "topicQuestion",
  mentor: "topicMentor",
  technical: "topicTechnical",
  feedback: "topicFeedback",
  other: "topicOther",
};
const PLACEHOLDER_KEY: Record<Topic, string> = {
  question: "messagePlaceholderQuestion",
  mentor: "messagePlaceholderMentor",
  technical: "messagePlaceholderTechnical",
  feedback: "messagePlaceholderFeedback",
  other: "messagePlaceholder",
};
type Errors = Partial<Record<"name" | "email" | "topic" | "subject" | "message", string>>;

export function ContactForm() {
  const t = useTranslations("contact");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [website, setWebsite] = useState("");
  const params = useSearchParams();
  const initialTopic = params.get("topic");
  const [topic, setTopic] = useState<Topic | "">(
    TOPICS.find((k) => k === initialTopic) ?? ""
  );
  const { status } = useSession();
  const topicId = useId();
  const [errors, setErrors] = useState<Errors>({});
  const [token, setToken] = useState<string | null>(null);
  const [resetKey, setResetKey] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);
  const startedAt = useFormStart();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    const found: Errors = {};
    if (!name.trim()) found.name = t("nameRequired");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) found.email = t("emailInvalid");
    if (!topic) found.topic = t("subjectRequired");
    if (topic === "other" && !subject.trim()) found.subject = t("customSubjectRequired");
    if (!message.trim()) found.message = t("messageRequired");
    setErrors(found);
    if (Object.keys(found).length > 0) {
      const first = (["name", "email", "topic", "subject", "message"] as const).find((k) => found[k]);
      if (first) {
        const el = document.querySelector<HTMLElement>(`[data-field="${first}"]`);
        (el?.matches("input, textarea") ? el : el?.querySelector<HTMLElement>("select"))?.focus();
      }
      return;
    }
    setLoading(true);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          subject: topic === "other" ? subject : "",
          message,
          topic,
          website,
          formStartedAt: startedAt.read(),
          turnstileToken: token,
        }),
      });

      if (res.status !== 429 && res.status !== 200) setResetKey((n) => n + 1);

      if (res.status === 400 && (await res.clone().json().catch(() => ({}))).error === "verification_failed") {
        setError(t("errorVerification"));
        return;
      }

      if (res.status === 429) {
        setError(t("errorRateLimit"));
        return;
      }

      if (!res.ok) {
        setError(t("errorDefault"));
        return;
      }

      setSent(true);
    } catch {
      setError(t("errorDefault"));
    } finally {
      setLoading(false);
    }
  }

  function handleReset() {
    setName("");
    setEmail("");
    setSubject("");
    setTopic("");
    setErrors({});
    setMessage("");
    setWebsite("");
    setError("");
    setSent(false);
    startedAt.restart();
    setResetKey((n) => n + 1);
  }

  if (sent) {
    return (
      <div className="card">
        <div className="flex flex-col items-start gap-4 px-6 py-12 sm:px-8" aria-live="polite">
          <h2 className="text-heading font-semibold">{t("successTitle")}</h2>
          <p className="max-w-[48ch] text-ink-2">{t("successMessage")}</p>
          <Button type="button" variant="secondary" onClick={handleReset}>
            {t("sendAnother")}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5 px-6 py-8 sm:px-8">
        <Honeypot value={website} onChange={setWebsite} />

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <TextField
            label={t("nameLabel")}
            placeholder={t("namePlaceholder")}
            maxLength={100}
            autoComplete="name"
            data-field="name"
            error={errors.name}
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (errors.name) setErrors((p) => ({ ...p, name: undefined }));
            }}
          />
          <TextField
            label={t("emailLabel")}
            type="email"
            placeholder={t("emailPlaceholder")}
            maxLength={254}
            autoComplete="email"
            inputMode="email"
            data-field="email"
            error={errors.email}
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (errors.email) setErrors((p) => ({ ...p, email: undefined }));
            }}
          />
        </div>

        <div data-field="topic">
          <label htmlFor={topicId} className="mb-2 block text-[0.9375rem] font-medium text-ink">
            {t("subjectLabel")}
          </label>
          <div className="relative">
            <select
              id={topicId}
              value={topic}
              aria-invalid={errors.topic ? true : undefined}
              aria-describedby={errors.topic ? `${topicId}-error` : undefined}
              onChange={(e) => {
                setTopic(e.target.value as Topic | "");
                if (errors.topic) setErrors((p) => ({ ...p, topic: undefined }));
              }}
              className={`w-full min-h-12 cursor-pointer appearance-none rounded-[var(--radius-control)] border border-rule-strong bg-surface ps-4 pe-11 text-base transition-colors focus:border-primary focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary aria-invalid:border-danger ${topic ? "text-ink" : "text-ink-3"}`}
            >
              <option value="" disabled>
                {t("subjectPlaceholder")}
              </option>
              {TOPICS.map((key) => (
                <option key={key} value={key} className="text-ink">
                  {t(TOPIC_KEY[key])}
                </option>
              ))}
            </select>
            <ChevronDown
              className="pointer-events-none absolute end-4 top-1/2 size-5 -translate-y-1/2 text-ink-2"
              aria-hidden="true"
            />
          </div>
          {errors.topic ? (
            <p id={`${topicId}-error`} className="mt-1.5 text-meta text-danger">
              {errors.topic}
            </p>
          ) : null}
          {topic === "mentor" ? (
            <p className="mt-1.5 text-meta text-ink-3">
              {status === "authenticated" ? (
                <>
                  {t("mentorHintSignedIn")}{" "}
                  <Link href="/mentor" className="font-medium text-primary underline underline-offset-2">
                    {t("mentorHintLink")}
                  </Link>
                </>
              ) : (
                t("mentorHintGuest")
              )}
            </p>
          ) : null}
        </div>

        {topic === "other" ? (
          <TextField
            label={t("customSubjectLabel")}
            placeholder={t("customSubjectPlaceholder")}
            maxLength={120}
            data-field="subject"
            error={errors.subject}
            value={subject}
            onChange={(e) => {
              setSubject(e.target.value);
              if (errors.subject) setErrors((p) => ({ ...p, subject: undefined }));
            }}
          />
        ) : null}

        <TextAreaField
          label={t("messageLabel")}
          placeholder={t(topic ? PLACEHOLDER_KEY[topic] : "messagePlaceholder")}
          maxLength={5000}
          rows={6}
          data-field="message"
          error={errors.message}
          value={message}
          onChange={(e) => {
            setMessage(e.target.value);
            if (errors.message) setErrors((p) => ({ ...p, message: undefined }));
          }}
        />

        <Turnstile onToken={setToken} resetKey={resetKey} />

        {error ? (
          <Notice tone="error">
            <p>{error}</p>
          </Notice>
        ) : null}

        <div>
          <Button type="submit" variant="primary" size="lg" loading={loading} disabled={loading || (turnstileEnabled && !token)}>
            {!loading ? <Send className="size-4" aria-hidden="true" /> : null}
            {loading ? t("sending") : t("send")}
          </Button>
        </div>
      </form>
    </div>
  );
}
