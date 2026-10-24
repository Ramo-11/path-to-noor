"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function PurgeUnverified() {
  const router = useRouter();
  const [count, setCount] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  async function review() {
    setBusy(true);
    setMessage("");
    try {
      const res = await fetch("/api/admin/users/purge-unverified");
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error();
      if (data.count === 0) setMessage("No unverified accounts older than 7 days.");
      else setCount(data.count);
    } catch {
      setMessage("Could not check the count. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  async function confirm() {
    if (count === null) return;
    setBusy(true);
    try {
      const res = await fetch("/api/admin/users/purge-unverified", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ expectedCount: count }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.status === 409 && typeof data.count === "number") {
        setCount(data.count);
        setMessage("The number changed. Please review and confirm again.");
        return;
      }
      if (!res.ok) throw new Error();
      setCount(null);
      setMessage(`Deleted ${data.deleted} accounts.`);
      router.refresh();
    } catch {
      setMessage("Could not delete. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mb-4">
      <button
        type="button"
        onClick={review}
        disabled={busy}
        className="px-3 py-2 text-sm font-medium rounded-lg border border-red-300 dark:border-red-800 text-red-700 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-50"
      >
        Delete unverified older than 7 days
      </button>
      {message ? (
        <p role="status" className="mt-2 text-sm text-slate-600 dark:text-slate-400">
          {message}
        </p>
      ) : null}
      {count !== null ? (
        <div
          role="alertdialog"
          aria-labelledby="purge-title"
          className="mt-3 max-w-lg rounded-xl border border-red-200 dark:border-red-900 bg-white dark:bg-slate-900 p-4"
        >
          <p id="purge-title" className="text-sm text-slate-900 dark:text-white">
            This will permanently delete {count} unverified {count === 1 ? "account" : "accounts"} older than
            7 days. Verified users, admins, and anyone with progress, saved lessons, or a mentor request are
            never deleted.
          </p>
          <div className="mt-3 flex gap-2">
            <button
              type="button"
              onClick={confirm}
              disabled={busy}
              className="px-3 py-2 text-sm font-medium rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
            >
              Delete {count}
            </button>
            <button
              type="button"
              onClick={() => setCount(null)}
              disabled={busy}
              className="px-3 py-2 text-sm font-medium rounded-lg border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
