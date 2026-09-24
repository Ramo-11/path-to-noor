"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Send } from "lucide-react";
import { Button } from "@/components/primer/Button";
import { TextField, TextAreaField } from "@/components/primer/TextField";
import { Notice } from "@/components/primer/Notice";

export function ContactForm() {
  const t = useTranslations("contact");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [website, setWebsite] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);
  const formLoadedAt = useRef(0);

  useEffect(() => {
    formLoadedAt.current = Date.now();
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          subject,
          message,
          website,
          formLoadedAt: formLoadedAt.current,
        }),
      });

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
    setMessage("");
    setWebsite("");
    setError("");
    setSent(false);
    formLoadedAt.current = Date.now();
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
      <form onSubmit={handleSubmit} className="flex flex-col gap-5 px-6 py-8 sm:px-8">
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            insetInlineStart: "-10000px",
            top: "auto",
            width: "1px",
            height: "1px",
            overflow: "hidden",
          }}
        >
          <label htmlFor="contact-website">Website</label>
          <input
            id="contact-website"
            type="text"
            name="website"
            tabIndex={-1}
            autoComplete="off"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <TextField
            label={t("nameLabel")}
            placeholder={t("namePlaceholder")}
            required
            maxLength={100}
            autoComplete="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <TextField
            label={t("emailLabel")}
            type="email"
            placeholder={t("emailPlaceholder")}
            required
            maxLength={254}
            autoComplete="email"
            inputMode="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <TextField
          label={t("subjectLabel")}
          placeholder={t("subjectPlaceholder")}
          required
          maxLength={200}
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
        />

        <TextAreaField
          label={t("messageLabel")}
          placeholder={t("messagePlaceholder")}
          required
          maxLength={5000}
          rows={6}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />

        {error ? (
          <Notice tone="error">
            <p>{error}</p>
          </Notice>
        ) : null}

        <div>
          <Button type="submit" variant="primary" size="lg" loading={loading} disabled={loading}>
            {!loading ? <Send className="size-4" aria-hidden="true" /> : null}
            {loading ? t("sending") : t("send")}
          </Button>
        </div>
      </form>
    </div>
  );
}
