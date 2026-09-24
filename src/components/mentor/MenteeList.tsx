"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Mail } from "lucide-react";
import { Button } from "@/components/primer/Button";
import { EmptyState } from "@/components/primer/EmptyState";
import { Notice } from "@/components/primer/Notice";
import { Spinner } from "@/components/primer/Spinner";

interface Mentee {
  _id: string;
  name: string;
  email: string;
  message: string | null;
  assignedAt: string;
}

type Phase = "loading" | "error" | "ready";

export function MenteeList() {
  const t = useTranslations("mentor");
  const locale = useLocale();

  const [phase, setPhase] = useState<Phase>("loading");
  const [mentees, setMentees] = useState<Mentee[]>([]);

  async function load() {
    setPhase("loading");
    try {
      const res = await fetch("/api/user/my-mentees");
      if (!res.ok) throw new Error("failed");
      const data = await res.json();
      setMentees(data.data ?? []);
      setPhase("ready");
    } catch {
      setPhase("error");
    }
  }

  useEffect(() => {
    load();
  }, []);

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
        <p>{t("menteesLoadError")}</p>
        <div className="mt-3">
          <Button variant="secondary" onClick={load}>
            {t("retry")}
          </Button>
        </div>
      </Notice>
    );
  }

  if (mentees.length === 0) {
    return (
      <div className="pt-10">
        <EmptyState title={t("noMentees")} body={t("noMenteesBody")} art="mentor" />
      </div>
    );
  }

  const formatter = new Intl.DateTimeFormat(locale, { month: "short", day: "numeric", year: "numeric" });

  return (
    <div aria-live="polite" className="flex flex-col gap-4 pt-10 pb-24">
      {mentees.map((mentee) => (
        <div
          key={mentee._id}
          className="flex flex-col gap-2 rounded-[var(--radius-cell)] border border-rule bg-surface px-6 py-6 shadow-soft"
        >
          <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
            <p className="text-heading font-semibold">{mentee.name}</p>
            <p className="text-meta text-ink-3">
              {t("assignedOn", { date: formatter.format(new Date(mentee.assignedAt)) })}
            </p>
          </div>
          <a
            href={`mailto:${mentee.email}`}
            className="inline-flex w-fit items-center gap-1.5 text-ink-2 underline decoration-rule-strong underline-offset-[0.25em] hover:text-ink hover:decoration-ink"
          >
            <Mail className="size-4" aria-hidden="true" />
            {mentee.email}
          </a>
          {mentee.message ? <p className="mt-1 max-w-[64ch] text-ink-2">{mentee.message}</p> : null}
        </div>
      ))}
    </div>
  );
}
