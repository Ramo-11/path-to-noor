"use client";

import { useState, useEffect, FormEvent } from "react";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Container } from "@/components/layout/Container";
import {
  Handshake,
  Loader2,
  Check,
  Clock,
  User,
  Mail,
} from "lucide-react";

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

export default function MentorshipPage() {
  const t = useTranslations("mentorship");
  const tAuth = useTranslations("auth");
  const { data: session, status: authStatus } = useSession();

  const [request, setRequest] = useState<MentorRequestData | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const isRevert = session?.user?.userType === "revert";

  useEffect(() => {
    if (authStatus !== "authenticated") {
      setLoading(false);
      return;
    }

    fetch("/api/user/mentor-request")
      .then((res) => res.json())
      .then((data) => {
        if (data.data) setRequest(data.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [authStatus]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSubmitting(true);

    try {
      const res = await fetch("/api/user/mentor-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong");
        return;
      }

      setSuccess(t("requestSubmitted"));
      setRequest(data.data);
    } catch {
      setError("Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  // Not logged in
  if (authStatus === "unauthenticated") {
    return (
      <section className="py-16 sm:py-24">
        <Container size="md">
          <div className="text-center py-16">
            <Handshake className="h-12 w-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              {t("loginRequired")}
            </p>
            <Link
              href="/login"
              className="inline-flex px-6 py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors"
            >
              {tAuth("signIn")}
            </Link>
          </div>
        </Container>
      </section>
    );
  }

  if (loading) {
    return (
      <section className="py-16 sm:py-24">
        <Container size="md">
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
          </div>
        </Container>
      </section>
    );
  }

  // Not a revert
  if (!isRevert) {
    return (
      <section className="py-16 sm:py-24">
        <Container size="md">
          <div className="text-center py-16">
            <Handshake className="h-12 w-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
            <p className="text-slate-600 dark:text-slate-400">
              {t("notRevert")}
            </p>
          </div>
        </Container>
      </section>
    );
  }

  const inputClass =
    "w-full px-3 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-colors";

  return (
    <section className="py-16 sm:py-24">
      <Container size="md">
        <div className="mb-8">
          <h1 className="font-heading text-3xl font-bold text-slate-900 dark:text-white">
            {t("title")}
          </h1>
          <div className="mt-3 decorative-line" />
        </div>

        {/* Assigned mentor */}
        {request?.status === "assigned" && request.mentorId && (
          <div className="rounded-2xl bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-800 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600">
                <Check className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                  {t("mentorAssigned")}
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {t("mentorAssignedDescription")}
                </p>
              </div>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                  <User className="h-5 w-5 text-primary-600" />
                </div>
                <div>
                  <p className="font-medium text-slate-900 dark:text-white">
                    {request.mentorId.name}
                  </p>
                  <p className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-1">
                    <Mail className="h-3.5 w-3.5" />
                    {request.mentorId.email}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Pending request */}
        {request?.status === "pending" && (
          <div className="rounded-2xl bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-800 p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/30 text-amber-600">
                <Clock className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                  {t("requestPending")}
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {t("requestPendingDescription")}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Request form — only show if no active request */}
        {!request && (
          <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg bg-primary-100 dark:bg-primary-900/30 text-primary-600">
                <Handshake className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                  {t("requestMentor")}
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {t("requestMentorDescription")}
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="message"
                  className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5"
                >
                  {t("yourMessage")}
                </label>
                <textarea
                  id="message"
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={t("messagePlaceholder")}
                  className={inputClass}
                />
              </div>

              {error && (
                <div className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg px-3 py-2">
                  {error}
                </div>
              )}

              {success && (
                <div className="flex items-center gap-2 text-sm text-emerald-600 dark:text-emerald-400">
                  <Check className="h-4 w-4" />
                  {success}
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2.5 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white font-medium rounded-lg transition-colors"
              >
                {submitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  t("submitRequest")
                )}
              </button>
            </form>
          </div>
        )}
      </Container>
    </section>
  );
}
