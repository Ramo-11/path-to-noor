"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useSession } from "next-auth/react";
import { useRouter } from "@/i18n/navigation";
import { Button } from "@/components/primer/Button";
import { Notice } from "@/components/primer/Notice";
import { PageIntro } from "@/components/primer/PageIntro";
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
    <div className="mx-auto w-full max-w-md px-4 sm:px-6">
      <PageIntro title={t("title")} lead={t("lead")} />

      <div className="pb-16 sm:pb-24">
        <fieldset>
          <legend className="mb-2 text-[0.9375rem] font-medium text-ink">
            {t("legend")}
          </legend>
          <div className="primer-grid grid-cols-1">
            {options.map((option) => (
              <label
                key={option.value}
                className={`flex cursor-pointer items-start gap-4 px-5 py-6 transition-colors duration-150 ${
                  userType === option.value ? "bg-wash" : "hover:bg-wash/60"
                }`}
              >
                <input
                  type="radio"
                  name="userType"
                  value={option.value}
                  checked={userType === option.value}
                  onChange={() => setUserType(option.value)}
                  className="mt-1 size-5 shrink-0 accent-ink"
                />
                <span>
                  <span className="block text-heading font-semibold text-balance">
                    {option.title}
                  </span>
                  <span className="mt-1 block text-body text-ink-2">
                    {option.description}
                  </span>
                </span>
              </label>
            ))}
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
