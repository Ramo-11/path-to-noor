"use client";

import { useState, type FormEvent } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { TextField } from "@/components/primer/TextField";
import { Button } from "@/components/primer/Button";
import { Notice } from "@/components/primer/Notice";

type Language = "en" | "ar" | "es";

interface DetailsFormProps {
  initialName: string;
  email: string;
  initialLanguage: Language;
  locale: string;
}

const LANGUAGES: Array<{ code: Language; labelKey: string }> = [
  { code: "en", labelKey: "languageEnglish" },
  { code: "ar", labelKey: "languageArabic" },
  { code: "es", labelKey: "languageSpanish" },
];

const ERROR_KEYS: Record<string, string> = {
  invalid_input: "errorInvalidInput",
  not_found: "errorNotFound",
};

export function DetailsForm({ initialName, email, initialLanguage, locale }: DetailsFormProps) {
  const t = useTranslations("settings");
  const router = useRouter();

  const [name, setName] = useState(initialName);
  const [language, setLanguage] = useState<Language>(initialLanguage);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    setSuccess(false);
    setError("");

    try {
      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, preferredLanguage: language }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(t(ERROR_KEYS[data.error] ?? "errorGeneric"));
        setSaving(false);
        return;
      }

      if (language !== locale) {
        router.push("/settings", { locale: language });
        return;
      }

      setSuccess(true);
      setSaving(false);
    } catch {
      setError(t("errorGeneric"));
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col items-start gap-5">
      <h2 className="text-heading font-semibold">{t("yourDetails")}</h2>

      <TextField
        label={t("name")}
        value={name}
        onChange={(event) => setName(event.target.value)}
        required
        minLength={1}
        maxLength={80}
        autoComplete="name"
        className="w-full"
      />

      <TextField
        label={t("email")}
        value={email}
        disabled
        autoComplete="email"
        className="w-full"
      />

      <fieldset>
        <legend className="mb-3 block text-[0.9375rem] font-medium text-ink">
          {t("preferredLanguage")}
        </legend>
        <div className="flex flex-wrap gap-x-6 gap-y-3">
          {LANGUAGES.map((option) => (
            <label
              key={option.code}
              className="flex min-h-11 items-center gap-2 text-[0.9375rem] text-ink"
            >
              <input
                type="radio"
                name="preferredLanguage"
                value={option.code}
                checked={language === option.code}
                onChange={() => setLanguage(option.code)}
                className="size-4 accent-ink"
              />
              {t(option.labelKey)}
            </label>
          ))}
        </div>
      </fieldset>

      {error ? <Notice tone="error">{error}</Notice> : null}
      {success ? <Notice tone="success">{t("detailsSaved")}</Notice> : null}

      <Button type="submit" loading={saving}>
        {t("saveChanges")}
      </Button>
    </form>
  );
}
