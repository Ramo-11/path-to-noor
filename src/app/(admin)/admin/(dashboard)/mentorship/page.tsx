"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Handshake,
  Clock,
  CheckCircle,
  XCircle,
  User,
  Users,
  Loader2,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";

interface MentorOption {
  _id: string;
  name: string;
  email: string;
}

interface MentorRequest {
  _id: string;
  revertId: {
    _id: string;
    name: string;
    email: string;
  };
  mentorId?: {
    _id: string;
    name: string;
    email: string;
  };
  status: "pending" | "assigned" | "rejected";
  message?: string;
  adminNote?: string;
  createdAt: string;
}

interface MentorAssignment {
  mentor: {
    _id: string;
    name: string;
    email: string;
  };
  reverts: Array<{
    _id: string;
    name: string;
    email: string;
  }>;
}

const statusConfig = {
  pending: {
    icon: Clock,
    label: "Pending",
    color: "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400",
  },
  assigned: {
    icon: CheckCircle,
    label: "Assigned",
    color: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400",
  },
  rejected: {
    icon: XCircle,
    label: "Rejected",
    color: "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400",
  },
};

export default function MentorshipPage() {
  const [tab, setTab] = useState<"requests" | "assignments">("requests");
  const [requests, setRequests] = useState<MentorRequest[]>([]);
  const [assignments, setAssignments] = useState<MentorAssignment[]>([]);
  const [mentors, setMentors] = useState<MentorOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editMentorId, setEditMentorId] = useState("");
  const [editStatus, setEditStatus] = useState<string>("");
  const [editNote, setEditNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const [reqRes, assignRes, mentorRes] = await Promise.all([
        fetch("/api/admin/mentor-requests").then((r) => r.json()),
        fetch("/api/admin/mentor-assignments").then((r) => r.json()),
        fetch("/api/admin/mentors").then((r) => r.json()),
      ]);

      if (reqRes.data) setRequests(reqRes.data);
      if (assignRes.data) setAssignments(assignRes.data);
      if (mentorRes.data) setMentors(mentorRes.data);
    } catch {
      // Silently fail
    } finally {
      setLoading(false);
    }
  }

  function startEditing(req: MentorRequest) {
    setEditingId(req._id);
    setEditMentorId(req.mentorId?._id || "");
    setEditStatus(req.status);
    setEditNote(req.adminNote || "");
  }

  async function handleSave(requestId: string) {
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/mentor-requests/${requestId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mentorId: editMentorId || undefined,
          status: editStatus,
          adminNote: editNote,
        }),
      });

      if (res.ok) {
        setEditingId(null);
        await loadData();
      }
    } catch {
      // Silently fail
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!deleteId) return;

    try {
      const res = await fetch(`/api/admin/mentor-requests/${deleteId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setDeleteId(null);
        await loadData();
      }
    } catch {
      // Silently fail
    }
  }

  const filteredRequests =
    statusFilter === "all"
      ? requests
      : requests.filter((r) => r.status === statusFilter);

  const inputClass =
    "w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-colors text-sm";

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
      </div>
    );
  }

  return (
    <div>
      <AdminPageHeader
        title="Mentorship"
        description="Manage mentor requests and assignments"
        icon={Handshake}
        createHref=""
        createLabel=""
      />

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg w-fit">
        <button
          onClick={() => setTab("requests")}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            tab === "requests"
              ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          Requests ({requests.length})
        </button>
        <button
          onClick={() => setTab("assignments")}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            tab === "assignments"
              ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          Assignments ({assignments.length})
        </button>
      </div>

      {/* Requests Tab */}
      {tab === "requests" && (
        <div>
          {/* Status filter */}
          <div className="mb-4">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="assigned">Assigned</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          {filteredRequests.length === 0 ? (
            <div className="text-center py-12 text-slate-500 dark:text-slate-400">
              No mentor requests found.
            </div>
          ) : (
            <div className="space-y-3">
              {filteredRequests.map((req) => {
                const config = statusConfig[req.status];
                const StatusIcon = config.icon;
                const isEditing = editingId === req._id;

                return (
                  <div
                    key={req._id}
                    className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3 min-w-0">
                        <div className="h-10 w-10 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center shrink-0">
                          <User className="h-5 w-5 text-primary-600" />
                        </div>
                        <div className="min-w-0">
                          <Link
                            href={`/admin/users/${req.revertId._id}`}
                            className="font-medium text-slate-900 dark:text-white hover:text-primary-600 transition-colors"
                          >
                            {req.revertId.name}
                          </Link>
                          <p className="text-sm text-slate-500 dark:text-slate-400">
                            {req.revertId.email}
                          </p>
                          {req.message && (
                            <p className="text-sm text-slate-600 dark:text-slate-300 mt-1 italic">
                              &ldquo;{req.message}&rdquo;
                            </p>
                          )}
                          <p className="text-xs text-slate-400 mt-1">
                            {new Date(req.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${config.color}`}
                        >
                          <StatusIcon className="h-3 w-3" />
                          {config.label}
                        </span>
                      </div>
                    </div>

                    {/* Assigned mentor display */}
                    {req.mentorId && !isEditing && (
                      <div className="mt-3 ms-13 flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                        <Users className="h-3.5 w-3.5" />
                        Assigned to:{" "}
                        <span className="font-medium text-slate-900 dark:text-white">
                          {req.mentorId.name}
                        </span>
                      </div>
                    )}

                    {/* Edit form */}
                    {isEditing ? (
                      <div className="mt-4 ms-13 space-y-3 border-t border-slate-100 dark:border-slate-800 pt-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                              Assign Mentor
                            </label>
                            <select
                              value={editMentorId}
                              onChange={(e) => setEditMentorId(e.target.value)}
                              className={inputClass}
                            >
                              <option value="">No mentor</option>
                              {mentors.map((m) => (
                                <option key={m._id} value={m._id}>
                                  {m.name} ({m.email})
                                </option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                              Status
                            </label>
                            <select
                              value={editStatus}
                              onChange={(e) => setEditStatus(e.target.value)}
                              className={inputClass}
                            >
                              <option value="pending">Pending</option>
                              <option value="assigned">Assigned</option>
                              <option value="rejected">Rejected</option>
                            </select>
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                            Admin Note
                          </label>
                          <input
                            type="text"
                            value={editNote}
                            onChange={(e) => setEditNote(e.target.value)}
                            className={inputClass}
                            placeholder="Optional note..."
                          />
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleSave(req._id)}
                            disabled={saving}
                            className="px-4 py-2 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors"
                          >
                            {saving ? "Saving..." : "Save"}
                          </button>
                          <button
                            onClick={() => setEditingId(null)}
                            className="px-4 py-2 text-slate-600 dark:text-slate-400 text-sm font-medium rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="mt-3 ms-13 flex gap-2">
                        <button
                          onClick={() => startEditing(req)}
                          className="text-xs text-primary-600 hover:text-primary-700 font-medium"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => setDeleteId(req._id)}
                          className="text-xs text-red-600 hover:text-red-700 font-medium"
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Assignments Tab */}
      {tab === "assignments" && (
        <div>
          {assignments.length === 0 ? (
            <div className="text-center py-12 text-slate-500 dark:text-slate-400">
              No mentor assignments yet.
            </div>
          ) : (
            <div className="space-y-4">
              {assignments.map((assignment) => (
                <MentorCard key={assignment.mentor._id} assignment={assignment} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Delete confirmation */}
      <ConfirmDialog
        open={!!deleteId}
        title="Delete Request"
        message="Are you sure you want to delete this mentor request? This will also remove any mentor assignment for this user."
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}

function MentorCard({ assignment }: { assignment: MentorAssignment }) {
  const [expanded, setExpanded] = useState(true);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors text-left"
      >
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-accent-100 dark:bg-accent-900/30 flex items-center justify-center">
            <Users className="h-5 w-5 text-accent-600" />
          </div>
          <div>
            <p className="font-medium text-slate-900 dark:text-white">
              {assignment.mentor.name}
            </p>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {assignment.mentor.email} &middot;{" "}
              {assignment.reverts.length} revert(s) assigned
            </p>
          </div>
        </div>
        {expanded ? (
          <ChevronDown className="h-4 w-4 text-slate-400" />
        ) : (
          <ChevronRight className="h-4 w-4 text-slate-400" />
        )}
      </button>

      {expanded && (
        <div className="border-t border-slate-100 dark:border-slate-800 px-4 py-3 space-y-2">
          {assignment.reverts.map((revert) => (
            <div
              key={revert._id}
              className="flex items-center gap-3 py-2 text-sm"
            >
              <div className="h-8 w-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                <User className="h-4 w-4 text-slate-500" />
              </div>
              <div>
                <Link
                  href={`/admin/users/${revert._id}`}
                  className="font-medium text-slate-700 dark:text-slate-300 hover:text-primary-600 transition-colors"
                >
                  {revert.name}
                </Link>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {revert.email}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
