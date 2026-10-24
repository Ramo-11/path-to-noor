"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { HeartHandshake, Loader2 } from "lucide-react";

type Status = "pending" | "approved" | "declined";

interface Application {
  _id: string;
  userId: { _id: string; name: string; email: string } | null;
  about: string;
  experience: string;
  languages: string[];
  otherLanguages?: string;
  availability: string;
  gender: "male" | "female";
  status: Status;
  adminNote?: string;
  createdAt: string;
}

const LANGUAGE_NAMES: Record<string, string> = { en: "English", ar: "Arabic", es: "Spanish" };

const STATUS_STYLE: Record<Status, string> = {
  pending: "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400",
  approved: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400",
  declined: "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400",
};

const FILTERS = ["all", "pending", "approved", "declined"] as const;

export function VolunteersTab({ onChanged }: { onChanged: () => void }) {
  const [items, setItems] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("pending");
  const [openId, setOpenId] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [actionError, setActionError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setFailed(false);
    try {
      const res = await fetch("/api/admin/mentor-applications");
      const json = await res.json();
      if (!res.ok || !json.data) throw new Error("failed");
      setItems(json.data);
    } catch {
      setFailed(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(load, 0);
    return () => clearTimeout(timer);
  }, [load]);

  async function decide(id: string, status: "approved" | "declined") {
    setSaving(true);
    setActionError("");
    try {
      const res = await fetch(`/api/admin/mentor-applications/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, adminNote: note.trim() || undefined }),
      });
      if (!res.ok) throw new Error("failed");
      setOpenId(null);
      setNote("");
      await load();
      onChanged();
    } catch {
      setActionError("Could not save the decision. Try again.");
    } finally {
      setSaving(false);
    }
  }

  const visible = filter === "all" ? items : items.filter((i) => i.status === filter);

  if (loading && items.length === 0) {
    return (
      <div className="flex items-center justify-center py-16" role="status" aria-label="Loading">
        <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
      </div>
    );
  }

  if (failed) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-500 dark:text-slate-400">Could not load applications.</p>
        <button
          onClick={load}
          className="mt-3 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-5">
        {FILTERS.map((f) => {
          const count = f === "all" ? items.length : items.filter((i) => i.status === f).length;
          return (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                filter === f
                  ? "bg-primary-600 text-white"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
              }`}
            >
              {f === "all" ? "All" : f[0].toUpperCase() + f.slice(1)} ({count})
            </button>
          );
        })}
      </div>

      {visible.length === 0 ? (
        <div className="text-center py-12">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 mb-3">
            <HeartHandshake className="h-6 w-6 text-slate-400" />
          </div>
          <p className="text-slate-500 dark:text-slate-400">
            No {filter === "all" ? "" : filter} applications found.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {visible.map((app) => {
            const langs = [
              ...app.languages.map((l) => LANGUAGE_NAMES[l] ?? l),
              ...(app.otherLanguages ? [app.otherLanguages] : []),
            ].join(", ");
            const acting = openId === app._id;
            return (
              <div
                key={app._id}
                className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5"
              >
                <div className="flex flex-wrap items-center gap-2">
                  {app.userId ? (
                    <Link
                      href={`/admin/users/${app.userId._id}`}
                      className="font-semibold text-slate-900 dark:text-white hover:text-primary-600"
                    >
                      {app.userId.name}
                    </Link>
                  ) : (
                    <span className="font-semibold text-slate-500">Deleted user</span>
                  )}
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_STYLE[app.status]}`}>
                    {app.status[0].toUpperCase() + app.status.slice(1)}
                  </span>
                </div>
                {app.userId && (
                  <p className="text-sm text-slate-500 dark:text-slate-400">{app.userId.email}</p>
                )}
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                  Applied{" "}
                  {new Date(app.createdAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </p>

                <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-3">
                  <div>
                    <dt className="text-xs text-slate-400">Gender</dt>
                    <dd className="text-slate-700 dark:text-slate-300 capitalize">{app.gender}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-slate-400">Languages</dt>
                    <dd className="text-slate-700 dark:text-slate-300">{langs}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-slate-400">Availability</dt>
                    <dd className="text-slate-700 dark:text-slate-300">{app.availability}</dd>
                  </div>
                </dl>
                <div className="mt-3 text-sm">
                  <p className="text-xs text-slate-400">Why they want to help</p>
                  <p className="text-slate-700 dark:text-slate-300 whitespace-pre-wrap">{app.about}</p>
                </div>
                <div className="mt-3 text-sm">
                  <p className="text-xs text-slate-400">Knowledge and background</p>
                  <p className="text-slate-700 dark:text-slate-300 whitespace-pre-wrap">{app.experience}</p>
                </div>
                {app.adminNote && !acting && (
                  <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">Note: {app.adminNote}</p>
                )}

                {app.status === "pending" && !acting && (
                  <div className="mt-4">
                    <button
                      onClick={() => {
                        setOpenId(app._id);
                        setNote("");
                        setActionError("");
                      }}
                      className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg"
                    >
                      Review
                    </button>
                  </div>
                )}

                {acting && (
                  <div className="mt-4 border-t border-slate-100 dark:border-slate-800 pt-4">
                    <label
                      htmlFor={`note-${app._id}`}
                      className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5"
                    >
                      Note (optional)
                    </label>
                    <textarea
                      id={`note-${app._id}`}
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      maxLength={1000}
                      rows={2}
                      className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm"
                    />
                    {actionError && (
                      <p role="alert" className="mt-2 text-sm text-red-600">
                        {actionError}
                      </p>
                    )}
                    <div className="mt-3 flex flex-wrap gap-2">
                      <button
                        onClick={() => decide(app._id, "approved")}
                        disabled={saving}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-sm font-medium rounded-lg"
                      >
                        {saving ? "Saving" : "Approve"}
                      </button>
                      <button
                        onClick={() => decide(app._id, "declined")}
                        disabled={saving}
                        className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-50 text-slate-700 dark:text-slate-300 text-sm font-medium rounded-lg"
                      >
                        Decline
                      </button>
                      <button
                        onClick={() => setOpenId(null)}
                        disabled={saving}
                        className="px-4 py-2 text-slate-500 text-sm"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
