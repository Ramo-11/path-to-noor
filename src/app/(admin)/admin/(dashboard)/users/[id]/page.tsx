"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  User as UserIcon,
  Users,
  Mail,
  Calendar,
  BookOpen,
  CheckCircle,
  XCircle,
  Bookmark,
  FileQuestion,
  Route,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { STAGE_NUMBER, isStageKey } from "@/lib/stages";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { adminCall } from "../api";
import { UserFormDialog } from "../UserFormDialog";
import { LANGUAGE_LABELS, TRACK_LABELS, TYPE_LABELS } from "../types";

interface LessonProgress {
  _id: string;
  title: { en: string; ar: string; es: string };
  completed: boolean;
}

interface ModuleProgress {
  _id: string;
  title: { en: string; ar: string; es: string };
  lessons: LessonProgress[];
  completedCount: number;
  totalLessons: number;
}

interface PathProgress {
  _id: string;
  title: { en: string; ar: string; es: string };
  stage?: string;
  modules: ModuleProgress[];
  totalLessons: number;
  completedCount: number;
  percentage: number;
}

interface QuizResult {
  quizId: {
    _id: string;
    lessonId: {
      _id: string;
      title: { en: string; ar: string; es: string };
      slug: string;
    };
  };
  score: number;
  passed: boolean;
  completedAt: string;
}

interface CompletedTopic {
  topicId: {
    _id: string;
    name: { en: string; ar: string; es: string };
    slug: string;
    icon?: string;
  };
  completedAt: string;
}

interface UserDetail {
  _id: string;
  name: string;
  email: string;
  image?: string;
  role: string;
  userType?: string;
  track?: string;
  isActive: boolean;
  emailVerified?: string | null;
  placement?: { stage: string; takenAt: string };
  preferredLanguage: string;
  progress: Array<{
    lessonId: {
      _id: string;
      title: { en: string; ar: string; es: string };
      slug: string;
    };
    completedAt: string;
  }>;
  bookmarks: Array<{
    _id: string;
    title: { en: string; ar: string; es: string };
    slug: string;
  }>;
  quizResults: QuizResult[];
  completedTopics: CompletedTopic[];
  assignedMentorId?: {
    _id: string;
    name: string;
    email: string;
  };
  createdAt: string;
  lastLoginAt?: string;
}

interface UserDetailData {
  mentorRequest: { status: string; createdAt: string; mentorId?: { name: string; email: string } | null } | null;
  mentorApplication: { status: string; createdAt: string } | null;
  user: UserDetail;
  pathProgress: PathProgress[];
  allPathProgress: PathProgress[];
}

const roleColors: Record<string, string> = {
  super_admin: "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400",
  admin: "bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400",
  user: "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400",
};

const userTypeColors: Record<string, string> = {
  revert: "bg-sky-100 dark:bg-sky-900/30 text-sky-700 dark:text-sky-400",
  mentor: "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400",
};

function PathProgressCard({ path }: { path: PathProgress }) {
  const [expanded, setExpanded] = useState(path.percentage > 0 && path.percentage < 100);

  return (
    <div className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors text-left"
      >
        <div className="flex items-center gap-3 min-w-0">
          <Route className="h-4 w-4 text-primary-500 shrink-0" />
          <div className="min-w-0">
            <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
              {path.title.en}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {path.completedCount}/{path.totalLessons} lessons
              {isStageKey(path.stage) && ` \u00b7 Stage ${STAGE_NUMBER[path.stage]}`}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-24 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${
                  path.percentage === 100
                    ? "bg-emerald-500"
                    : path.percentage > 0
                    ? "bg-primary-500"
                    : "bg-slate-300 dark:bg-slate-600"
                }`}
                style={{ width: `${path.percentage}%` }}
              />
            </div>
            <span className="text-xs font-medium text-slate-600 dark:text-slate-400 w-10 text-right">
              {path.percentage}%
            </span>
          </div>
          {expanded ? (
            <ChevronDown className="h-4 w-4 text-slate-400" />
          ) : (
            <ChevronRight className="h-4 w-4 text-slate-400" />
          )}
        </div>
      </button>

      {expanded && (
        <div className="border-t border-slate-200 dark:border-slate-700 px-4 py-3 space-y-3 bg-slate-50/50 dark:bg-slate-800/30">
          {path.modules.map((mod) => (
            <div key={mod._id}>
              <div className="flex items-center justify-between mb-1.5">
                <p className="text-xs font-medium text-slate-700 dark:text-slate-300">
                  {mod.title.en}
                </p>
                <span className="text-[10px] text-slate-500">
                  {mod.completedCount}/{mod.totalLessons}
                </span>
              </div>
              <div className="space-y-1">
                {mod.lessons.map((lesson) => (
                  <div
                    key={lesson._id}
                    className="flex items-center gap-2 text-xs"
                  >
                    {lesson.completed ? (
                      <CheckCircle className="h-3 w-3 text-emerald-500 shrink-0" />
                    ) : (
                      <div className="h-3 w-3 rounded-full border border-slate-300 dark:border-slate-600 shrink-0" />
                    )}
                    <span
                      className={
                        lesson.completed
                          ? "text-slate-600 dark:text-slate-400"
                          : "text-slate-400 dark:text-slate-500"
                      }
                    >
                      {lesson.title.en}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function UserDetailPage() {
  const params = useParams();
  const [data, setData] = useState<UserDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAllPaths, setShowAllPaths] = useState(false);
  const router = useRouter();
  const [reloadKey, setReloadKey] = useState(0);
  const [notice, setNotice] = useState<{ kind: "ok" | "error"; text: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [confirm, setConfirm] = useState<"delete" | "deactivate" | null>(null);

  useEffect(() => {
    fetch(`/api/admin/users/${params.id}`)
      .then((res) => {
        if (!res.ok) throw new Error(res.status === 404 ? "User not found" : "Failed to load user");
        return res.json();
      })
      .then((json) => setData(json.data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [params.id, reloadKey]);

  async function act(action: () => ReturnType<typeof adminCall>, success: string, after?: () => void) {
    setBusy(true);
    setNotice(null);
    const result = await action();
    setBusy(false);
    if (!result.ok) {
      setNotice({ kind: "error", text: result.error ?? "Something went wrong. Please try again." });
      return;
    }
    setNotice({ kind: "ok", text: result.message ?? success });
    if (after) after();
    else setReloadKey((k) => k + 1);
  }

  async function confirmed() {
    const kind = confirm;
    setConfirm(null);
    const id = String(params.id);
    if (kind === "delete") {
      await act(() => adminCall(`/api/admin/users/${id}`, "DELETE"), "User deleted.", () => router.push("/admin/users"));
    } else if (kind === "deactivate") {
      await act(() => adminCall(`/api/admin/users/${id}`, "PATCH", { isActive: false }), "User deactivated.");
    }
  }

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 w-48 bg-slate-200 dark:bg-slate-700 rounded" />
        <div className="h-40 bg-slate-200 dark:bg-slate-700 rounded-xl" />
        <div className="h-60 bg-slate-200 dark:bg-slate-700 rounded-xl" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-500 dark:text-slate-400">
          {error || "User not found"}
        </p>
        <Link
          href="/admin/users"
          className="inline-flex items-center gap-1 text-sm text-primary-600 hover:text-primary-700 mt-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Users
        </Link>
      </div>
    );
  }

  const { user, pathProgress, allPathProgress, mentorRequest, mentorApplication } = data;
  const verified = Boolean(user.emailVerified);
  const legacy = !verified && new Date(user.createdAt).getTime() < new Date("2026-10-17T00:00:00.000Z").getTime();
  const verifiedLabel = verified ? "Verified" : legacy ? "Not verified (older account)" : "Unverified";
  const requestLabels: Record<string, string> = { pending: "Pending", assigned: "Assigned", rejected: "Rejected" };
  const applicationLabels: Record<string, string> = { pending: "Pending", approved: "Approved", declined: "Declined" };
  const detailRows: Array<[string, string]> = [
    ["Type", user.userType ? TYPE_LABELS[user.userType] ?? "None" : "None"],
    ["Track", user.track ? TRACK_LABELS[user.track] ?? "None" : "None"],
    ["Language", LANGUAGE_LABELS[user.preferredLanguage] ?? user.preferredLanguage],
    ["Status", user.isActive ? "Active" : "Inactive"],
    ["Email", verifiedLabel],
    ["Joined", new Date(user.createdAt).toLocaleString()],
    ["Last sign-in", user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString() : "Never"],
    [
      "Level check",
      user.placement && isStageKey(user.placement.stage) ? `Stage ${STAGE_NUMBER[user.placement.stage]}` : "Not taken",
    ],
    ["Lessons completed", String(user.progress?.length || 0)],
    ["Bookmarks", String(user.bookmarks?.length || 0)],
    ["Mentor request", mentorRequest ? requestLabels[mentorRequest.status] ?? mentorRequest.status : "None"],
    ["Volunteer application", mentorApplication ? applicationLabels[mentorApplication.status] ?? mentorApplication.status : "None"],
  ];
  const actionClass =
    "px-3 py-2 text-sm font-medium rounded-lg border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50";
  const displayPaths = showAllPaths ? allPathProgress : pathProgress;

  const recentCompletions = [...(user.progress || [])]
    .filter((p) => p.lessonId)
    .sort(
      (a, b) =>
        new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()
    )
    .slice(0, 10);

  const recentQuizzes = [...(user.quizResults || [])]
    .filter((q) => q.quizId?.lessonId)
    .sort(
      (a, b) =>
        new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()
    )
    .slice(0, 10);

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <Link
          href="/admin/users"
          className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300 mb-3"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Users
        </Link>

        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5">
          <div className="flex items-start gap-4">
            <div className="h-14 w-14 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center shrink-0">
              {user.image ? (
                <Image
                  src={user.image}
                  alt={user.name}
                  width={56}
                  height={56}
                  className="h-14 w-14 rounded-full object-cover"
                  unoptimized
                />
              ) : (
                <UserIcon className="h-6 w-6 text-primary-600" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-xl font-bold text-slate-900 dark:text-white">
                  {user.name}
                </h1>
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
                    roleColors[user.role] || roleColors.user
                  }`}
                >
                  {user.role.replace("_", " ")}
                </span>
                {user.userType && (
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
                      userTypeColors[user.userType] || ""
                    }`}
                  >
                    {user.userType === "revert" ? "New Muslim" : "Mentor"}
                  </span>
                )}
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                    user.isActive
                      ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400"
                      : "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400"
                  }`}
                >
                  {user.isActive ? "Active" : "Inactive"}
                </span>
              </div>
              <div className="flex items-center gap-4 mt-2 text-sm text-slate-500 dark:text-slate-400 flex-wrap">
                <span className="inline-flex items-center gap-1">
                  <Mail className="h-3.5 w-3.5" />
                  {user.email}
                </span>
                <span className="inline-flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" />
                  Joined {new Date(user.createdAt).toLocaleDateString()}
                </span>
                <span className="uppercase text-xs font-medium">
                  {user.preferredLanguage}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5">
            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-3 text-center">
              <p className="text-lg font-bold text-slate-900 dark:text-white">
                {user.progress?.length || 0}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Lessons Completed
              </p>
            </div>
            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-3 text-center">
              <p className="text-lg font-bold text-slate-900 dark:text-white">
                {user.quizResults?.length || 0}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Quizzes Taken
              </p>
            </div>
            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-3 text-center">
              <p className="text-lg font-bold text-slate-900 dark:text-white">
                {user.quizResults?.filter((q) => q.passed).length || 0}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Quizzes Passed
              </p>
            </div>
            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-3 text-center">
              <p className="text-lg font-bold text-slate-900 dark:text-white">
                {user.bookmarks?.length || 0}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Bookmarks
              </p>
            </div>
          </div>
        </div>
      </div>

      {notice ? (
        <div
          role={notice.kind === "error" ? "alert" : "status"}
          className={`mb-4 px-4 py-3 rounded-lg text-sm ${
            notice.kind === "error"
              ? "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400"
              : "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400"
          }`}
        >
          {notice.text}
        </div>
      ) : null}

      {user.role === "user" ? (
        <div className="mb-4 flex flex-wrap gap-2">
          <button type="button" disabled={busy} onClick={() => setEditOpen(true)} className={actionClass}>
            Edit
          </button>
          {!verified ? (
            <button
              type="button"
              disabled={busy}
              onClick={() => act(() => adminCall(`/api/admin/users/${user._id}/verify`, "POST"), "Email marked as verified.")}
              className={actionClass}
            >
              Mark email verified
            </button>
          ) : null}
          <button
            type="button"
            disabled={busy}
            onClick={() =>
              user.isActive
                ? setConfirm("deactivate")
                : act(() => adminCall(`/api/admin/users/${user._id}`, "PATCH", { isActive: true }), "User activated.")
            }
            className={actionClass}
          >
            {user.isActive ? "Deactivate" : "Activate"}
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() => act(() => adminCall(`/api/admin/users/${user._id}/reset`, "POST"), "Password reset email sent.")}
            className={actionClass}
          >
            Send password reset
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() => setConfirm("delete")}
            className="px-3 py-2 text-sm font-medium rounded-lg border border-red-300 dark:border-red-800 text-red-700 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-50"
          >
            Delete
          </button>
        </div>
      ) : null}

      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 mb-4">
        <h2 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">Profile</h2>
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-sm">
          {detailRows.map(([label, value]) => (
            <div key={label} className="flex justify-between gap-4 border-b border-slate-100 dark:border-slate-800 py-1.5">
              <dt className="text-slate-500 dark:text-slate-400">{label}</dt>
              <dd className="text-slate-900 dark:text-white text-right">{value}</dd>
            </div>
          ))}
        </dl>
        {mentorRequest?.mentorId ? (
          <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
            Mentor on the request: {mentorRequest.mentorId.name} ({mentorRequest.mentorId.email})
          </p>
        ) : null}
      </div>

      <UserFormDialog
        open={editOpen}
        user={{
          _id: user._id,
          name: user.name,
          email: user.email,
          userType: user.userType,
          track: user.track,
          preferredLanguage: user.preferredLanguage,
          isActive: user.isActive,
          verified,
        }}
        onClose={() => setEditOpen(false)}
        onSaved={(text) => {
          setEditOpen(false);
          setNotice({ kind: "ok", text });
          setReloadKey((k) => k + 1);
        }}
      />

      <ConfirmDialog
        open={confirm !== null}
        title={confirm === "delete" ? "Delete user" : "Deactivate user"}
        message={
          confirm === "delete"
            ? `Delete ${user.name}? Their account, progress, mentor requests, and volunteer applications are removed for good. This cannot be undone.`
            : `${user.name} will no longer be able to sign in. You can activate them again at any time.`
        }
        confirmLabel={confirm === "delete" ? "Delete" : "Deactivate"}
        variant={confirm === "delete" ? "danger" : "warning"}
        onConfirm={confirmed}
        onCancel={() => setConfirm(null)}
      />

      {/* Mentor Assignment (for reverts) */}
      {user.userType === "revert" && user.assignedMentorId && (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 mb-4">
          <div className="flex items-center gap-2 mb-3">
            <Users className="h-4 w-4 text-slate-500 dark:text-slate-400" />
            <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
              Assigned Mentor
            </h2>
          </div>
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
              <UserIcon className="h-4 w-4 text-amber-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-900 dark:text-white">
                {user.assignedMentorId.name}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {user.assignedMentorId.email}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Completed Topics */}
      {user.completedTopics && user.completedTopics.length > 0 && (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 mb-4">
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle className="h-4 w-4 text-emerald-500" />
            <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
              Topics Marked as Learnt ({user.completedTopics.length})
            </h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {user.completedTopics.map((ct) => (
              <span
                key={ct.topicId?._id || String(ct)}
                className="inline-flex items-center px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 text-sm text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800"
              >
                <CheckCircle className="h-3 w-3 me-1.5" />
                {ct.topicId?.name?.en || "Unknown"}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Learning Path Progress */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 mb-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Route className="h-4 w-4 text-slate-500 dark:text-slate-400" />
            <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
              Learning Path Progress
            </h2>
          </div>
          <button
            onClick={() => setShowAllPaths(!showAllPaths)}
            className="text-xs text-primary-600 hover:text-primary-700"
          >
            {showAllPaths ? "Show active only" : "Show all paths"}
          </button>
        </div>

        {displayPaths.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-6">
            {showAllPaths
              ? "No learning paths available"
              : "User hasn't started any learning path yet"}
          </p>
        ) : (
          <div className="space-y-2">
            {displayPaths.map((path) => (
              <PathProgressCard key={path._id} path={path} />
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Recent Completions */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5">
          <div className="flex items-center gap-2 mb-4">
            <BookOpen className="h-4 w-4 text-slate-500 dark:text-slate-400" />
            <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
              Recent Completions
            </h2>
          </div>

          {recentCompletions.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-6">
              No completions yet
            </p>
          ) : (
            <div className="space-y-2">
              {recentCompletions.map((p, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800 last:border-0"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <CheckCircle className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                    <span className="text-sm text-slate-700 dark:text-slate-300 truncate">
                      {p.lessonId.title?.en || "Unknown lesson"}
                    </span>
                  </div>
                  <span className="text-xs text-slate-400 shrink-0 ms-2">
                    {new Date(p.completedAt).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quiz Results */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5">
          <div className="flex items-center gap-2 mb-4">
            <FileQuestion className="h-4 w-4 text-slate-500 dark:text-slate-400" />
            <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
              Quiz Results
            </h2>
          </div>

          {recentQuizzes.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-6">
              No quizzes taken yet
            </p>
          ) : (
            <div className="space-y-2">
              {recentQuizzes.map((q, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800 last:border-0"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    {q.passed ? (
                      <CheckCircle className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                    ) : (
                      <XCircle className="h-3.5 w-3.5 text-red-500 shrink-0" />
                    )}
                    <div className="min-w-0">
                      <span className="text-sm text-slate-700 dark:text-slate-300 truncate block">
                        {q.quizId.lessonId?.title?.en || "Unknown quiz"}
                      </span>
                      <span className="text-xs text-slate-400">
                        Score: {q.score}%
                      </span>
                    </div>
                  </div>
                  <span className="text-xs text-slate-400 shrink-0 ms-2">
                    {new Date(q.completedAt).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Bookmarks */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 lg:col-span-2">
          <div className="flex items-center gap-2 mb-4">
            <Bookmark className="h-4 w-4 text-slate-500 dark:text-slate-400" />
            <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
              Bookmarks ({user.bookmarks?.length || 0})
            </h2>
          </div>

          {(!user.bookmarks || user.bookmarks.length === 0) ? (
            <p className="text-sm text-slate-400 text-center py-6">
              No bookmarks
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {user.bookmarks.map((b) => (
                <span
                  key={b._id}
                  className="inline-flex items-center px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-sm text-slate-700 dark:text-slate-300"
                >
                  <BookOpen className="h-3 w-3 me-1.5 text-slate-400" />
                  {b.title?.en || "Unknown"}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
