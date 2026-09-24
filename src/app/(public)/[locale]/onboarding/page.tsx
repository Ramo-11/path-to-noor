"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { useTranslations } from "next-intl";
import { useSession } from "next-auth/react";
import { useRouter } from "@/i18n/navigation";
import { Button } from "@/components/primer/Button";
import { Illustration } from "@/components/primer/Illustration";
import { Notice } from "@/components/primer/Notice";
import { PLACEMENT_STORAGE_KEY, type StoredPlacement } from "@/lib/placement";
import { isStageKey } from "@/lib/stages";

type UserType = "revert" | "mentor";

function hasStoredPlacement(): boolean {
  try {
    const raw = window.localStorage.getItem(PLACEMENT_STORAGE_KEY);
    if (!raw) return false;
    const parsed = JSON.parse(raw) as Partial<StoredPlacement>;
    return Boolean(parsed && isStageKey(parsed.stage) && parsed.takenAt);
  } catch {
    return false;
  }
}

export default function OnboardingPage() {
  const t = useTranslations("onboarding");
  const router = useRouter();
  const { update } = useSession();

  const [userType, setUserType] = useState<UserType | "">("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const options: Array<{ value: UserType; title: string; description: string }> = [
    { value: "revert", title: t("revertTitle"), description: t("revertDescription") },
    { value: "mentor", title: t("mentorTitle"), description: t("mentorDescription") },
  ];

  async function handleSubmit() {
    if (!userType) return;
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/set-user-type", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userType }),
      });

      if (!res.ok) {
        setError(t("errorDefault"));
        setLoading(false);
        return;
      }

      await update({ userType });

      if (userType === "mentor") {
        router.replace("/mentor");
        return;
      }

      router.replace(hasStoredPlacement() ? "/" : "/start");
    } catch {
      setError(t("errorDefault"));
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-md px-4 pt-10 pb-16 sm:px-6 sm:pt-14 sm:pb-24">
      <div className="mx-auto aspect-[3/4] w-28 overflow-hidden rounded-[var(--radius-panel)] sm:w-32">
        <Illustration name="welcome" sizes="128px" priority />
      </div>

      <div className="mt-7 text-center">
        <h1 className="text-title font-semibold text-balance">{t("title")}</h1>
        <p className="mt-2.5 text-lg text-ink-2 text-pretty">{t("lead")}</p>
      </div>

      <div className="mt-9">
        <fieldset>
          <legend className="mb-3 text-[0.9375rem] font-medium text-ink">{t("legend")}</legend>
          <div className="flex flex-col gap-3">
            {options.map((option) => {
              const checked = userType === option.value;
              return (
                <label
                  key={option.value}
                  className={`flex min-h-14 cursor-pointer items-start gap-4 rounded-[var(--radius-cell)] border px-5 py-4 transition-colors duration-150 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-primary sm:px-6 ${
                    checked
                      ? "border-primary bg-primary-tint"
                      : "border-rule bg-surface hover:border-rule-strong hover:bg-wash"
                  }`}
                >
                  <input
                    type="radio"
                    name="userType"
                    value={option.value}
                    checked={checked}
                    onChange={() => setUserType(option.value)}
                    className="sr-only"
                  />
                  <span
                    aria-hidden="true"
                    className={`mt-0.5 grid size-6 shrink-0 place-items-center rounded-full border-[1.5px] ${
                      checked ? "border-primary bg-primary text-on-primary" : "border-rule-strong text-transparent"
                    }`}
                  >
                    <Check strokeWidth={2.5} className="size-3.5" />
                  </span>
                  <span className="min-w-0">
                    <span className={`block text-base font-semibold text-balance ${checked ? "text-primary" : "text-ink"}`}>
                      {option.title}
                    </span>
                    <span className="mt-0.5 block text-[0.9375rem] text-ink-2 text-pretty">
                      {option.description}
                    </span>
                  </span>
                </label>
              );
            })}
          </div>
        </fieldset>

        {error ? (
          <div className="mt-6">
            <Notice tone="error">{error}</Notice>
          </div>
        ) : null}

        <div className="mt-8">
          <Button
            type="button"
            size="lg"
            fullWidth
            disabled={!userType}
            loading={loading}
            onClick={handleSubmit}
          >
            {t("continue")}
          </Button>
        </div>
      </div>
    </div>
  );
}
