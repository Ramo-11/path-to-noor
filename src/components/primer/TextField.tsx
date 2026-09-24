"use client";

import { useId, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useTranslations } from "next-intl";

interface TextFieldProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "id"> {
  label: string;
  hint?: string;
  error?: string;
}

const inputClass =
  "w-full min-h-12 rounded-[var(--radius-control)] border border-rule-strong bg-surface px-4 text-base text-ink placeholder:text-ink-3 transition-colors focus:border-primary focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary aria-invalid:border-danger";

export function TextField({ label, hint, error, type = "text", className = "", ...rest }: TextFieldProps) {
  const id = useId();
  const t = useTranslations("common");
  const [visible, setVisible] = useState(false);
  const isPassword = type === "password";
  const describedBy = [hint ? `${id}-hint` : "", error ? `${id}-error` : ""].filter(Boolean).join(" ");

  return (
    <div className={className}>
      <label htmlFor={id} className="mb-2 block text-[0.9375rem] font-medium text-ink">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type={isPassword && visible ? "text" : type}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy || undefined}
          className={`${inputClass} ${isPassword ? "pe-12" : ""}`}
          {...rest}
        />
        {isPassword ? (
          <button
            type="button"
            onClick={() => setVisible((v) => !v)}
            aria-label={visible ? t("hidePassword") : t("showPassword")}
            aria-pressed={visible}
            className="absolute inset-y-0 end-0 flex w-12 items-center justify-center rounded-e-[var(--radius-control)] text-ink-2 hover:text-primary"
          >
            {visible ? <EyeOff className="size-5" aria-hidden="true" /> : <Eye className="size-5" aria-hidden="true" />}
          </button>
        ) : null}
      </div>
      {hint && !error ? (
        <p id={`${id}-hint`} className="mt-1.5 text-meta text-ink-3">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={`${id}-error`} className="mt-1.5 text-meta text-danger">
          {error}
        </p>
      ) : null}
    </div>
  );
}

interface TextAreaFieldProps extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, "id"> {
  label: string;
  hint?: string;
  error?: string;
}

export function TextAreaField({ label, hint, error, className = "", ...rest }: TextAreaFieldProps) {
  const id = useId();
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-2 block text-[0.9375rem] font-medium text-ink">
        {label}
      </label>
      <textarea
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={hint || error ? `${id}-note` : undefined}
        className={`${inputClass} min-h-32 py-3 leading-relaxed`}
        {...rest}
      />
      {hint || error ? (
        <p id={`${id}-note`} className={`mt-1.5 text-meta ${error ? "text-danger" : "text-ink-3"}`}>
          {error || hint}
        </p>
      ) : null}
    </div>
  );
}
