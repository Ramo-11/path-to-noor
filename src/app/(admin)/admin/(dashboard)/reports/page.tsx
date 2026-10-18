"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Flag, Loader2, CheckCircle, RotateCcw, ExternalLink, ThumbsUp, ThumbsDown } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";

type Status = "open" | "resolved";
type Filter = Status | "all";

interface Report {
  _id: string;
  lessonId: { _id: string; title?: { en?: string }; slug?: string } | null;
  lessonSlug: string;
  locale: string;
  reason?: string;
  note?: string;
  status: Status;
  createdAt: string;
}

interface FeedbackRow {
  lessonId: string;
  slug: string;
  title: string;
  helpful: number;
  notHelpful: number;
}

const reasonLabels: Record<string, string> = {
  incorrect: "Wrong or unclear information",
  translation: "Translation problem",
  video: "Video not working",
  other: "Other",
};

const filters: { value: Filter; label: string }[] = [
  { value: "open", label: "Open" },
  { value: "resolved", label: "Resolved" },
  { value: "all", label: "All" },
];

interface ReportsResponse {
  data?: Report[];
  feedback?: FeedbackRow[];
  counts?: { open: number; resolved: number };
}

async function requestReports(filter: Filter): Promise<ReportsResponse> {
  const res = await fetch(`/api/admin/reports?status=${filter}`);
  if (!res.ok) throw new Error("failed");
  return res.json();
}

export default function ReportsPage() {
  const [filter, setFilter] = useState<Filter>("open");
  const [reports, setReports] = useState<Report[]>([]);
  const [feedback, setFeedback] = useState<FeedbackRow[]>([]);
  const [counts, setCounts] = useState({ open: 0, resolved: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  const applyData = useCallback((json: ReportsResponse) => {
    setReports(json.data ?? []);
    setFeedback(json.feedback ?? []);
    setCounts(json.counts ?? { open: 0, resolved: 0 });
    setError(false);
  }, []);

  const load = useCallback(async () => {
    try {
      applyData(await requestReports(filter));
    } catch {
      setError(true);
    }
  }, [filter, applyData]);

  useEffect(() => {
    let cancelled = false;
    requestReports(filter)
      .then((json) => {
        if (!cancelled) applyData(json);
      })
      .catch(() => {
        if (!cancelled) setError(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [filter, applyData]);

  async function setStatus(id: string, status: Status) {
    setBusyId(id);
    try {
      const res = await fetch(`/api/admin/reports/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error("failed");
      await load();
    } catch {
      setError(true);
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div>
      <AdminPageHeader
        title="Reports"
        description="Problems learners flagged in lessons, and how helpful lessons were"
        icon={Flag}
      />

      <div className="flex flex-wrap gap-2 mb-6" role="tablist" aria-label="Report status">
        {filters.map((item) => {
          const count =
            item.value === "open" ? counts.open : item.value === "resolved" ? counts.resolved : null;
          const active = filter === item.value;
          return (
            <button
              key={item.value}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => {
                if (item.value === filter) return;
                setLoading(true);
                setFilter(item.value);
              }}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                active
                  ? "bg-primary-600 text-white"
                  : "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
              }`}
            >
              {item.label}
              {count !== null ? ` (${count})` : ""}
            </button>
          );
        })}
      </div>

      {loading ? (
        <div className="flex items-center gap-2 py-12 justify-center text-slate-500">
          <Loader2 className="h-5 w-5 animate-spin" />
          Loading reports
        </div>
      ) : error ? (
        <div className="rounded-xl border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-900/20 p-5 text-sm text-red-700 dark:text-red-400 flex items-center justify-between gap-4">
          <span>Reports could not be loaded or updated.</span>
          <button
            type="button"
            onClick={load}
            className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-red-200 dark:border-red-900/50 font-medium"
          >
            Try again
          </button>
        </div>
      ) : reports.length === 0 ? (
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-10 text-center text-slate-500 dark:text-slate-400">
          {filter === "open" ? "No open reports." : "No reports here."}
        </div>
      ) : (
        <ul className="space-y-3">
          {reports.map((report) => {
            const lesson = report.lessonId;
            const slug = lesson?.slug ?? report.lessonSlug;
            const isOpen = report.status === "open";
            return (
              <li
                key={report._id}
                className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-medium text-slate-900 dark:text-white">
                      {lesson?.title?.en ?? slug}
                    </p>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                      {reasonLabels[report.reason ?? "other"] ?? report.reason} ·{" "}
                      {report.locale.toUpperCase()} ·{" "}
                      {new Date(report.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                      isOpen
                        ? "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400"
                        : "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400"
                    }`}
                  >
                    {isOpen ? "Open" : "Resolved"}
                  </span>
                </div>

                {report.note ? (
                  <p className="mt-3 text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap break-words">
                    {report.note}
                  </p>
                ) : null}

                <div className="mt-4 flex flex-wrap items-center gap-2 text-sm">
                  {lesson?._id ? (
                    <Link
                      href={`/admin/lessons/${lesson._id}`}
                      className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                    >
                      Edit lesson
                    </Link>
                  ) : null}
                  <Link
                    href={`/${report.locale}/learn/${slug}`}
                    target="_blank"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                  >
                    View public page
                    <ExternalLink className="h-3.5 w-3.5" />
                  </Link>
                  <button
                    type="button"
                    disabled={busyId === report._id}
                    onClick={() => setStatus(report._id, isOpen ? "resolved" : "open")}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary-600 text-white hover:bg-primary-700 disabled:opacity-50"
                  >
                    {isOpen ? <CheckCircle className="h-4 w-4" /> : <RotateCcw className="h-4 w-4" />}
                    {isOpen ? "Mark resolved" : "Reopen"}
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {!loading && !error ? (
        <section className="mt-10">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
            Was this helpful
          </h2>
          {feedback.length === 0 ? (
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 text-center text-slate-500 dark:text-slate-400">
              No votes yet.
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                    <th className="px-4 py-3 font-medium">Lesson</th>
                    <th className="px-4 py-3 font-medium">Helpful</th>
                    <th className="px-4 py-3 font-medium">Not helpful</th>
                  </tr>
                </thead>
                <tbody>
                  {feedback.map((row) => (
                    <tr
                      key={row.lessonId}
                      className="border-b last:border-0 border-slate-100 dark:border-slate-800"
                    >
                      <td className="px-4 py-3 text-slate-900 dark:text-white">{row.title}</td>
                      <td className="px-4 py-3 text-emerald-700 dark:text-emerald-400">
                        <span className="inline-flex items-center gap-1.5">
                          <ThumbsUp className="h-4 w-4" />
                          {row.helpful}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-700 dark:text-slate-300">
                        <span className="inline-flex items-center gap-1.5">
                          <ThumbsDown className="h-4 w-4" />
                          {row.notHelpful}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      ) : null}
    </div>
  );
}
