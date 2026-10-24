"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { DataTable, type Column } from "@/components/admin/DataTable";
import { adminCall } from "./api";
import { RowMenu } from "./RowMenu";
import { UserFormDialog } from "./UserFormDialog";
import {
  LANGUAGE_LABELS,
  TRACK_LABELS,
  TYPE_LABELS,
  statusClass,
  statusLabel,
  type EditableUser,
  type UserRow,
} from "./types";

type Confirm =
  | { kind: "delete"; ids: string[]; name: string }
  | { kind: "toggle"; user: UserRow }
  | null;

export function UsersTable({ rows }: { rows: UserRow[] }) {
  const router = useRouter();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [busyId, setBusyId] = useState<string | null>(null);
  const [bulkBusy, setBulkBusy] = useState(false);
  const [notice, setNotice] = useState<{ kind: "ok" | "error"; text: string } | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<EditableUser | null>(null);
  const [confirm, setConfirm] = useState<Confirm>(null);

  const allSelected = rows.length > 0 && rows.every((r) => selected.has(r._id));

  function toggleAll() {
    setSelected(allSelected ? new Set() : new Set(rows.map((r) => r._id)));
  }

  function toggleOne(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function openAdd() {
    setEditing(null);
    setFormOpen(true);
  }

  function openEdit(u: UserRow) {
    setEditing({
      _id: u._id,
      name: u.name,
      email: u.email,
      userType: u.userType,
      track: u.track,
      preferredLanguage: u.preferredLanguage,
      isActive: u.isActive,
      verified: u.verified,
    });
    setFormOpen(true);
  }

  async function run(id: string, action: () => ReturnType<typeof adminCall>, success: string) {
    setBusyId(id);
    setNotice(null);
    const result = await action();
    setBusyId(null);
    if (!result.ok) {
      setNotice({ kind: "error", text: result.error ?? "Something went wrong. Please try again." });
      return;
    }
    setNotice({ kind: "ok", text: result.message ?? success });
    router.refresh();
  }

  async function confirmed() {
    const current = confirm;
    setConfirm(null);
    if (!current) return;
    if (current.kind === "toggle") {
      const u = current.user;
      await run(u._id, () => adminCall(`/api/admin/users/${u._id}`, "PATCH", { isActive: !u.isActive }), u.isActive ? "User deactivated." : "User activated.");
      return;
    }
    if (current.ids.length === 1) {
      await run(current.ids[0], () => adminCall(`/api/admin/users/${current.ids[0]}`, "DELETE"), "User deleted.");
    } else {
      setBulkBusy(true);
      setNotice(null);
      const result = await adminCall("/api/admin/users/bulk-delete", "POST", { ids: current.ids });
      setBulkBusy(false);
      if (!result.ok) {
        setNotice({ kind: "error", text: result.error ?? "Something went wrong. Please try again." });
        return;
      }
      const deleted = Number(result.data?.deleted ?? 0);
      setNotice({ kind: "ok", text: `Deleted ${deleted} ${deleted === 1 ? "user" : "users"}.` });
      router.refresh();
    }
    setSelected((prev) => {
      const next = new Set(prev);
      current.ids.forEach((id) => next.delete(id));
      return next;
    });
  }

  const columns: Column<UserRow>[] = [
    {
      key: "select",
      header: (
        <input
          type="checkbox"
          checked={allSelected}
          onChange={toggleAll}
          onClick={(e) => e.stopPropagation()}
          aria-label="Select all users on this page"
          className="h-4 w-4 rounded border-slate-300"
        />
      ),
      className: "w-10",
      render: (u) => (
        <span onClick={(e) => e.stopPropagation()}>
          <input
            type="checkbox"
            checked={selected.has(u._id)}
            onChange={() => toggleOne(u._id)}
            aria-label={`Select ${u.name}`}
            className="h-4 w-4 rounded border-slate-300"
          />
        </span>
      ),
    },
    {
      key: "name",
      header: "User",
      render: (u) => (
        <div>
          <p className="font-medium text-slate-900 dark:text-white">{u.name}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">{u.email}</p>
        </div>
      ),
    },
    {
      key: "userType",
      header: "Type",
      render: (u) =>
        u.userType ? (
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
              u.userType === "revert"
                ? "bg-sky-100 dark:bg-sky-900/30 text-sky-700 dark:text-sky-400"
                : "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400"
            }`}
          >
            {TYPE_LABELS[u.userType] ?? "None"}
          </span>
        ) : (
          <span className="text-xs text-slate-400">None</span>
        ),
    },
    {
      key: "track",
      header: "Track",
      render: (u) => (
        <span className="text-sm text-slate-600 dark:text-slate-400">
          {u.track ? TRACK_LABELS[u.track] ?? "None" : "None"}
        </span>
      ),
    },
    {
      key: "language",
      header: "Language",
      render: (u) => (
        <span className="text-sm text-slate-600 dark:text-slate-400">
          {LANGUAGE_LABELS[u.preferredLanguage] ?? u.preferredLanguage}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (u) => {
        const label = statusLabel(u);
        return (
          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${statusClass(label)}`}>
            {label}
          </span>
        );
      },
    },
    {
      key: "createdAt",
      header: "Joined",
      render: (u) => (
        <span className="text-sm text-slate-500 dark:text-slate-400">
          {new Date(u.createdAt).toLocaleDateString()}
        </span>
      ),
    },
    {
      key: "actions",
      header: "",
      className: "w-16",
      render: (u) => (
        <RowMenu
          label={`Actions for ${u.name}`}
          disabled={busyId === u._id}
          items={[
            { label: "View", onSelect: () => router.push(`/admin/users/${u._id}`) },
            { label: "Edit", onSelect: () => openEdit(u) },
            {
              label: "Mark email verified",
              hidden: u.verified,
              onSelect: () =>
                run(u._id, () => adminCall(`/api/admin/users/${u._id}/verify`, "POST"), "Email marked as verified."),
            },
            {
              label: u.isActive ? "Deactivate" : "Activate",
              onSelect: () => (u.isActive ? setConfirm({ kind: "toggle", user: u }) : run(u._id, () => adminCall(`/api/admin/users/${u._id}`, "PATCH", { isActive: true }), "User activated.")),
            },
            {
              label: "Send password reset",
              onSelect: () =>
                run(u._id, () => adminCall(`/api/admin/users/${u._id}/reset`, "POST"), "Password reset email sent."),
            },
            {
              label: "Delete",
              danger: true,
              onSelect: () => setConfirm({ kind: "delete", ids: [u._id], name: u.name }),
            },
          ]}
        />
      ),
    },
  ];

  const selectedCount = selected.size;
  const confirmCount = confirm?.kind === "delete" ? confirm.ids.length : 0;

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={openAdd}
          className="inline-flex items-center px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors"
        >
          Add user
        </button>
        {selectedCount > 0 ? (
          <>
            <button
              type="button"
              disabled={bulkBusy}
              onClick={() => setConfirm({ kind: "delete", ids: Array.from(selected), name: "" })}
              className="px-4 py-2 text-sm font-medium rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
            >
              {bulkBusy ? "Deleting..." : "Delete selected"} ({selectedCount})
            </button>
            <button
              type="button"
              onClick={() => setSelected(new Set())}
              className="px-3 py-2 text-sm text-slate-600 dark:text-slate-400 hover:underline"
            >
              Clear selection
            </button>
          </>
        ) : null}
      </div>

      {notice ? (
        <div
          role={notice.kind === "error" ? "alert" : "status"}
          className={`mb-4 flex items-start justify-between gap-3 px-4 py-3 rounded-lg text-sm ${
            notice.kind === "error"
              ? "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400"
              : "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400"
          }`}
        >
          <span>{notice.text}</span>
          <button type="button" onClick={() => setNotice(null)} className="font-medium underline shrink-0">
            Dismiss
          </button>
        </div>
      ) : null}

      <DataTable
        columns={columns}
        data={rows}
        keyField="_id"
        emptyMessage="No users found"
        onRowClick={(u) => router.push(`/admin/users/${u._id}`)}
      />

      <UserFormDialog
        open={formOpen}
        user={editing}
        onClose={() => setFormOpen(false)}
        onSaved={(text) => {
          setFormOpen(false);
          setNotice({ kind: "ok", text });
          router.refresh();
        }}
      />

      <ConfirmDialog
        open={confirm !== null}
        title={
          confirm?.kind === "toggle"
            ? "Deactivate user"
            : confirmCount === 1
            ? "Delete user"
            : `Delete ${confirmCount} users`
        }
        message={
          confirm?.kind === "toggle"
            ? `${confirm.user.name} will no longer be able to sign in. You can activate them again at any time.`
            : confirmCount === 1
            ? `Delete ${confirm?.kind === "delete" ? confirm.name || "this user" : ""}? Their account, progress, mentor requests, and volunteer applications are removed for good. This cannot be undone.`
            : `Delete exactly ${confirmCount} users? Their accounts, progress, mentor requests, and volunteer applications are removed for good. This cannot be undone.`
        }
        confirmLabel={confirm?.kind === "toggle" ? "Deactivate" : confirmCount > 1 ? `Delete ${confirmCount}` : "Delete"}
        variant={confirm?.kind === "toggle" ? "warning" : "danger"}
        onConfirm={confirmed}
        onCancel={() => setConfirm(null)}
      />
    </div>
  );
}

