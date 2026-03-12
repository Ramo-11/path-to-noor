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
  MessageSquare,
  StickyNote,
  ArrowRight,
  Trash2,
  RotateCcw,
  Mail,
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
  const [actionRequestId, setActionRequestId] = useState<string | null>(null);
  const [actionMentorId, setActionMentorId] = useState("");
  const [actionNote, setActionNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [notifyMentor, setNotifyMentor] = useState(true);
  const [notifyMentee, setNotifyMentee] = useState(true);

  const pendingCount = requests.filter((r) => r.status === "pending").length;

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

  async function handleAssign(requestId: string) {
    if (!actionMentorId) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/mentor-requests/${requestId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mentorId: actionMentorId,
          status: "assigned",
          adminNote: actionNote || undefined,
          notifyMentor,
          notifyMentee,
        }),
      });
      if (res.ok) {
        setActionRequestId(null);
        setActionMentorId("");
        setActionNote("");
        setNotifyMentor(true);
        setNotifyMentee(true);
        await loadData();
      }
    } catch {
      // Silently fail
    } finally {
      setSaving(false);
    }
  }

  async function handleReject(requestId: string) {
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/mentor-requests/${requestId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "rejected",
          adminNote: actionNote || undefined,
        }),
      });
      if (res.ok) {
        setActionRequestId(null);
        setActionNote("");
        await loadData();
      }
    } catch {
      // Silently fail
    } finally {
      setSaving(false);
    }
  }

  async function handleReopen(requestId: string) {
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/mentor-requests/${requestId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "pending", mentorId: undefined }),
      });
      if (res.ok) await loadData();
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
      />

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
            <Clock className="h-5 w-5 text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{pendingCount}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">Pending Requests</p>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
            <CheckCircle className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{assignments.length}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">Active Mentors</p>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
            <Users className="h-5 w-5 text-primary-600 dark:text-primary-400" />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">
              {assignments.reduce((sum, a) => sum + a.reverts.length, 0)}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">Reverts Matched</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg w-fit">
        <button
          onClick={() => setTab("requests")}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${
            tab === "requests"
              ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          Requests
          {pendingCount > 0 && (
            <span className="inline-flex items-center justify-center h-5 min-w-5 px-1.5 rounded-full bg-amber-500 text-white text-xs font-semibold">
              {pendingCount}
            </span>
          )}
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
          {/* Status filter pills */}
          <div className="flex flex-wrap gap-2 mb-5">
            {(["all", "pending", "assigned", "rejected"] as const).map((s) => {
              const count =
                s === "all"
                  ? requests.length
                  : requests.filter((r) => r.status === s).length;
              return (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                    statusFilter === s
                      ? "bg-primary-600 text-white"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
                  }`}
                >
                  {s === "all" ? "All" : statusConfig[s].label} ({count})
                </button>
              );
            })}
          </div>

          {filteredRequests.length === 0 ? (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 mb-3">
                <Handshake className="h-6 w-6 text-slate-400" />
              </div>
              <p className="text-slate-500 dark:text-slate-400">
                No {statusFilter === "all" ? "" : statusFilter} requests found.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredRequests.map((req) => {
                const config = statusConfig[req.status];
                const StatusIcon = config.icon;
                const isActioning = actionRequestId === req._id;

                return (
                  <div
                    key={req._id}
                    className={`bg-white dark:bg-slate-900 rounded-xl border overflow-hidden transition-colors ${
                      req.status === "pending"
                        ? "border-amber-200 dark:border-amber-800/40"
                        : "border-slate-200 dark:border-slate-800"
                    }`}
                  >
                    {/* Request header */}
                    <div className="p-5">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3 min-w-0">
                          <div className="h-10 w-10 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center shrink-0">
                            <User className="h-5 w-5 text-primary-600" />
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <Link
                                href={`/admin/users/${req.revertId._id}`}
                                className="font-semibold text-slate-900 dark:text-white hover:text-primary-600 transition-colors"
                              >
                                {req.revertId.name}
                              </Link>
                              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
                                <StatusIcon className="h-3 w-3" />
                                {config.label}
                              </span>
                            </div>
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                              {req.revertId.email}
                            </p>
                            <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                              Requested {new Date(req.createdAt).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              })}
                            </p>
                          </div>
                        </div>

                        <button
                          onClick={() => setDeleteId(req._id)}
                          className="p-1.5 text-slate-400 hover:text-red-500 transition-colors rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30"
                          aria-label="Delete request"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>

                      {/* Message from revert */}
                      {req.message && (
                        <div className="mt-3 ms-13 flex items-start gap-2 bg-slate-50 dark:bg-slate-800/50 rounded-lg px-3 py-2.5">
                          <MessageSquare className="h-3.5 w-3.5 text-slate-400 mt-0.5 shrink-0" />
                          <p className="text-sm text-slate-600 dark:text-slate-300 italic">
                            {req.message}
                          </p>
                        </div>
                      )}

                      {/* Admin note */}
                      {req.adminNote && !isActioning && (
                        <div className="mt-2 ms-13 flex items-start gap-2 text-xs text-slate-500 dark:text-slate-400">
                          <StickyNote className="h-3 w-3 mt-0.5 shrink-0" />
                          <span>{req.adminNote}</span>
                        </div>
                      )}

                      {/* Assigned mentor display */}
                      {req.mentorId && req.status === "assigned" && !isActioning && (
                        <div className="mt-3 ms-13 inline-flex items-center gap-2 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg px-3 py-2 text-sm">
                          <ArrowRight className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                          <span className="text-slate-600 dark:text-slate-400">Assigned to</span>
                          <span className="font-medium text-slate-900 dark:text-white">
                            {req.mentorId.name}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Action bar for pending requests */}
                    {req.status === "pending" && !isActioning && (
                      <div className="px-5 pb-4 flex gap-2 ms-13">
                        <button
                          onClick={() => {
                            setActionRequestId(req._id);
                            setActionMentorId("");
                            setActionNote(req.adminNote || "");
                          }}
                          className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg transition-colors"
                        >
                          <Users className="h-3.5 w-3.5" />
                          Assign Mentor
                        </button>
                        <button
                          onClick={() => {
                            setActionRequestId(req._id);
                            setActionMentorId("__reject__");
                            setActionNote(req.adminNote || "");
                          }}
                          className="inline-flex items-center gap-1.5 px-4 py-2 border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 text-sm font-medium rounded-lg transition-colors"
                        >
                          <XCircle className="h-3.5 w-3.5" />
                          Reject
                        </button>
                      </div>
                    )}

                    {/* Reopen for assigned/rejected */}
                    {req.status !== "pending" && !isActioning && (
                      <div className="px-5 pb-4 ms-13">
                        <button
                          onClick={() => handleReopen(req._id)}
                          disabled={saving}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-400 border border-slate-300 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                        >
                          <RotateCcw className="h-3 w-3" />
                          Reopen as Pending
                        </button>
                      </div>
                    )}

                    {/* Assignment panel */}
                    {isActioning && actionMentorId !== "__reject__" && (
                      <div className="border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/30 px-5 py-4">
                        <div className="ms-13 space-y-3">
                          <div>
                            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wide">
                              Select Mentor
                            </label>
                            {mentors.length === 0 ? (
                              <p className="text-sm text-slate-500 dark:text-slate-400">
                                No mentors available. Users with the &quot;Mentor&quot; type will appear here.
                              </p>
                            ) : (
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {mentors.map((m) => (
                                  <button
                                    key={m._id}
                                    type="button"
                                    onClick={() => setActionMentorId(m._id)}
                                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg border-2 text-start transition-colors ${
                                      actionMentorId === m._id
                                        ? "border-primary-600 bg-primary-50 dark:bg-primary-900/20"
                                        : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600"
                                    }`}
                                  >
                                    <div className="h-8 w-8 rounded-full bg-accent-100 dark:bg-accent-900/30 flex items-center justify-center shrink-0">
                                      <User className="h-4 w-4 text-accent-600 dark:text-accent-400" />
                                    </div>
                                    <div className="min-w-0">
                                      <p className={`text-sm font-medium truncate ${
                                        actionMentorId === m._id
                                          ? "text-primary-700 dark:text-primary-300"
                                          : "text-slate-700 dark:text-slate-300"
                                      }`}>
                                        {m.name}
                                      </p>
                                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                                        {m.email}
                                      </p>
                                    </div>
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wide">
                              Admin Note (optional)
                            </label>
                            <input
                              type="text"
                              value={actionNote}
                              onChange={(e) => setActionNote(e.target.value)}
                              className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-colors text-sm"
                              placeholder="e.g. Speaks same language, similar background..."
                            />
                          </div>
                          {/* Email notifications */}
                          <div>
                            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wide">
                              Email Notifications
                            </label>
                            <div className="flex flex-wrap gap-3">
                              <label className="flex items-center gap-2 cursor-pointer select-none">
                                <button
                                  type="button"
                                  role="switch"
                                  aria-checked={notifyMentor}
                                  onClick={() => setNotifyMentor(!notifyMentor)}
                                  className={`relative inline-flex h-5 w-9 shrink-0 rounded-full transition-colors ${
                                    notifyMentor
                                      ? "bg-primary-600"
                                      : "bg-slate-300 dark:bg-slate-600"
                                  }`}
                                >
                                  <span
                                    className={`inline-block h-4 w-4 rounded-full bg-white shadow-sm transition-transform mt-0.5 ${
                                      notifyMentor ? "translate-x-4 ms-0.5" : "translate-x-0.5"
                                    }`}
                                  />
                                </button>
                                <Mail className="h-3.5 w-3.5 text-slate-500" />
                                <span className="text-sm text-slate-700 dark:text-slate-300">
                                  Notify Mentor
                                </span>
                              </label>
                              <label className="flex items-center gap-2 cursor-pointer select-none">
                                <button
                                  type="button"
                                  role="switch"
                                  aria-checked={notifyMentee}
                                  onClick={() => setNotifyMentee(!notifyMentee)}
                                  className={`relative inline-flex h-5 w-9 shrink-0 rounded-full transition-colors ${
                                    notifyMentee
                                      ? "bg-primary-600"
                                      : "bg-slate-300 dark:bg-slate-600"
                                  }`}
                                >
                                  <span
                                    className={`inline-block h-4 w-4 rounded-full bg-white shadow-sm transition-transform mt-0.5 ${
                                      notifyMentee ? "translate-x-4 ms-0.5" : "translate-x-0.5"
                                    }`}
                                  />
                                </button>
                                <Mail className="h-3.5 w-3.5 text-slate-500" />
                                <span className="text-sm text-slate-700 dark:text-slate-300">
                                  Notify Mentee
                                </span>
                              </label>
                            </div>
                          </div>

                          <div className="flex gap-2">
                            <button
                              onClick={() => handleAssign(req._id)}
                              disabled={saving || !actionMentorId}
                              className="inline-flex items-center gap-1.5 px-5 py-2 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors"
                            >
                              {saving ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              ) : (
                                <CheckCircle className="h-3.5 w-3.5" />
                              )}
                              {saving ? "Assigning..." : "Confirm Assignment"}
                            </button>
                            <button
                              onClick={() => {
                                setActionRequestId(null);
                                setActionMentorId("");
                                setActionNote("");
                                setNotifyMentor(true);
                                setNotifyMentee(true);
                              }}
                              className="px-4 py-2 text-slate-600 dark:text-slate-400 text-sm font-medium rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-800 transition-colors"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Rejection panel */}
                    {isActioning && actionMentorId === "__reject__" && (
                      <div className="border-t border-slate-100 dark:border-slate-800 bg-red-50/50 dark:bg-red-950/10 px-5 py-4">
                        <div className="ms-13 space-y-3">
                          <div>
                            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wide">
                              Reason for rejection (optional)
                            </label>
                            <input
                              type="text"
                              value={actionNote}
                              onChange={(e) => setActionNote(e.target.value)}
                              className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-colors text-sm"
                              placeholder="e.g. Duplicate request, user already assigned..."
                            />
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleReject(req._id)}
                              disabled={saving}
                              className="inline-flex items-center gap-1.5 px-5 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors"
                            >
                              {saving ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              ) : (
                                <XCircle className="h-3.5 w-3.5" />
                              )}
                              {saving ? "Rejecting..." : "Confirm Rejection"}
                            </button>
                            <button
                              onClick={() => {
                                setActionRequestId(null);
                                setActionMentorId("");
                                setActionNote("");
                              }}
                              className="px-4 py-2 text-slate-600 dark:text-slate-400 text-sm font-medium rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-800 transition-colors"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
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
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 mb-3">
                <Users className="h-6 w-6 text-slate-400" />
              </div>
              <p className="text-slate-500 dark:text-slate-400">
                No mentor assignments yet.
              </p>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                Assign mentors to pending requests to see them here.
              </p>
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
            <p className="font-semibold text-slate-900 dark:text-white">
              {assignment.mentor.name}
            </p>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {assignment.mentor.email} &middot;{" "}
              {assignment.reverts.length} mentee{assignment.reverts.length !== 1 ? "s" : ""}
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
        <div className="border-t border-slate-100 dark:border-slate-800">
          {assignment.reverts.map((revert) => (
            <div
              key={revert._id}
              className="flex items-center gap-3 px-4 py-3 border-b last:border-b-0 border-slate-50 dark:border-slate-800/50"
            >
              <div className="h-8 w-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
                <User className="h-4 w-4 text-slate-500" />
              </div>
              <div className="min-w-0">
                <Link
                  href={`/admin/users/${revert._id}`}
                  className="text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-primary-600 transition-colors"
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
