"use client";

import { FormEvent, useId, useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/primer/Button";
import { TextAreaField, TextField } from "@/components/primer/TextField";
import { Notice } from "@/components/primer/Notice";
import { Link } from "@/i18n/navigation";

const LANGS = [
  { code: "en", key: "langEn" },
  { code: "ar", key: "langAr" },
  { code: "es", key: "langEs" },
] as const;

type Errors = Partial<Record<"about" | "experience" | "languages" | "availability" | "gender" | "agree", string>>;

const checkClass = "mt-0.5 size-5 shrink-0 accent-[var(--primary)]";

export function VolunteerForm() {
  const t = useTranslations("volunteer");
  const groupId = useId();

  const [about, setAbout] = useState("");
  const [experience, setExperience] = useState("");
  const [languages, setLanguages] = useState<string[]>([]);
  const [otherLanguages, setOtherLanguages] = useState("");
  const [availability, setAvailability] = useState("");
  const [gender, setGender] = useState<"male" | "female" | "">("");
  const [agree, setAgree] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [formError, setFormError] = useState("");
  const [needsVerify, setNeedsVerify] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  function validate(): Errors {
    const e: Errors = {};
    if (!about.trim()) e.about = t("errorAbout");
    if (!experience.trim()) e.experience = t("errorExperience");
    if (languages.length === 0) e.languages = t("errorLanguages");
    if (!availability.trim()) e.availability = t("errorAvailability");
    if (!gender) e.gender = t("errorGender");
    if (!agree) e.agree = t("errorAgree");
    return e;
  }

  async function handleSubmit(ev: FormEvent) {
    ev.preventDefault();
    setFormError("");
    setNeedsVerify(false);
    const found = validate();
    setErrors(found);
    if (Object.keys(found).length > 0) {
      setFormError(t("errorSummary"));
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/user/mentor-application", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          about,
          experience,
          languages,
          otherLanguages,
          availability,
          gender,
          agreedToGuidelines: true,
        }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        const code = data?.error;
        if (code === "email_unverified") setNeedsVerify(true);
        else if (code === "already_applied" || code === "already_mentor") setFormError(t("errorAlreadyApplied"));
        else if (code === "rate_limited") setFormError(t("errorRateLimited"));
        else if (code === "invalid_input") setFormError(t("errorSummary"));
        else setFormError(t("errorServer"));
        return;
      }
      setDone(true);
    } catch {
      setFormError(t("errorServer"));
    } finally {
      setSubmitting(false);
    }
  }

  function toggleLanguage(code: string) {
    setLanguages((prev) => (prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]));
    if (errors.languages) setErrors((p) => ({ ...p, languages: undefined }));
  }

  if (done) {
    return (
      <div className="card max-w-2xl p-6 sm:p-8" role="status">
        <h2 className="text-heading font-semibold">{t("successTitle")}</h2>
        <p className="mt-2 text-ink-2">{t("successBody")}</p>
      </div>
    );
  }

  return (
    <div className="card max-w-2xl p-6 sm:p-8">
      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-6">
        <TextAreaField
          label={t("aboutLabel")}
          hint={t("aboutHint")}
          error={errors.about}
          maxLength={2000}
          value={about}
          onChange={(e) => setAbout(e.target.value)}
        />
        <TextAreaField
          label={t("experienceLabel")}
          hint={t("experienceHint")}
          error={errors.experience}
          maxLength={2000}
          value={experience}
          onChange={(e) => setExperience(e.target.value)}
        />

        <fieldset aria-describedby={errors.languages ? `${groupId}-lang-error` : undefined}>
          <legend className="mb-2 text-[0.9375rem] font-medium text-ink">{t("languagesLabel")}</legend>
          <div className="flex flex-wrap gap-x-6 gap-y-2">
            {LANGS.map((l) => (
              <label key={l.code} className="flex min-h-11 items-center gap-2.5 text-ink">
                <input
                  type="checkbox"
                  className={checkClass}
                  checked={languages.includes(l.code)}
                  onChange={() => toggleLanguage(l.code)}
                />
                {t(l.key)}
              </label>
            ))}
          </div>
          {errors.languages ? (
            <p id={`${groupId}-lang-error`} className="mt-1.5 text-meta text-danger">
              {errors.languages}
            </p>
          ) : null}
        </fieldset>

        <TextField
          label={t("otherLanguagesLabel")}
          maxLength={200}
          value={otherLanguages}
          onChange={(e) => setOtherLanguages(e.target.value)}
        />

        <TextField
          label={t("availabilityLabel")}
          hint={t("availabilityHint")}
          error={errors.availability}
          maxLength={500}
          value={availability}
          onChange={(e) => setAvailability(e.target.value)}
        />

        <fieldset aria-describedby={`${groupId}-gender-note`}>
          <legend className="mb-2 text-[0.9375rem] font-medium text-ink">{t("genderLabel")}</legend>
          <div className="flex flex-wrap gap-x-6 gap-y-2">
            {(["male", "female"] as const).map((g) => (
              <label key={g} className="flex min-h-11 items-center gap-2.5 text-ink">
                <input
                  type="radio"
                  name="gender"
                  className={checkClass}
                  checked={gender === g}
                  onChange={() => {
                    setGender(g);
                    if (errors.gender) setErrors((p) => ({ ...p, gender: undefined }));
                  }}
                />
                {t(g)}
              </label>
            ))}
          </div>
          <p id={`${groupId}-gender-note`} className={`mt-1.5 text-meta ${errors.gender ? "text-danger" : "text-ink-3"}`}>
            {errors.gender || t("genderHint")}
          </p>
        </fieldset>

        <section className="rounded-[var(--radius-cell)] bg-wash p-5">
          <h2 className="text-[0.9375rem] font-semibold text-ink">{t("guidelinesTitle")}</h2>
          <ul className="mt-2 list-disc space-y-1.5 ps-5 text-[0.9375rem] text-ink-2">
            <li>{t("guideline1")}</li>
            <li>{t("guideline2")}</li>
            <li>{t("guideline3")}</li>
            <li>{t("guideline4")}</li>
          </ul>
          <label className="mt-4 flex items-start gap-2.5 text-ink">
            <input
              type="checkbox"
              className={checkClass}
              checked={agree}
              aria-invalid={errors.agree ? true : undefined}
              aria-describedby={errors.agree ? `${groupId}-agree-error` : undefined}
              onChange={(e) => {
                setAgree(e.target.checked);
                if (errors.agree) setErrors((p) => ({ ...p, agree: undefined }));
              }}
            />
            <span>{t("agreeLabel")}</span>
          </label>
          {errors.agree ? (
            <p id={`${groupId}-agree-error`} className="mt-1.5 text-meta text-danger">
              {errors.agree}
            </p>
          ) : null}
        </section>

        {needsVerify ? (
          <Notice tone="error">
            <p>{t("errorEmailUnverified")}</p>
            <div className="mt-3">
              <Link
                href="/settings"
                className="inline-flex min-h-11 items-center text-ink underline decoration-rule-strong underline-offset-[0.25em] hover:decoration-ink"
              >
                {t("verifyLink")}
              </Link>
            </div>
          </Notice>
        ) : null}
        {formError ? (
          <Notice tone="error">
            <p>{formError}</p>
          </Notice>
        ) : null}

        <div>
          <Button type="submit" variant="primary" loading={submitting} disabled={submitting}>
            {t("submit")}
          </Button>
        </div>
      </form>
    </div>
  );
}
