import Link from "next/link";
import { notFound } from "next/navigation";
import { getLearningPathById, getPathAnalytics } from "@/lib/data";
import { Route, ArrowLeft, Users, CheckCircle, TrendingUp, BookOpen } from "lucide-react";

export default async function PathAnalyticsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [path, analytics] = await Promise.all([
    getLearningPathById(id),
    getPathAnalytics(id),
  ]);

  if (!path || !analytics) notFound();

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <Link
          href={`/admin/paths/${id}`}
          className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-primary-600 transition-colors mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Edit
        </Link>
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-accent-100 dark:bg-accent-900/30 text-accent-600">
            <Route className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              {path.title.en}
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Path Analytics
            </p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4">
          <div className="flex items-center gap-2 mb-1">
            <Users className="h-4 w-4 text-violet-500" />
            <span className="text-xs text-slate-500 dark:text-slate-400">Enrolled</span>
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">
            {analytics.enrolledCount}
          </p>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="h-4 w-4 text-primary-500" />
            <span className="text-xs text-slate-500 dark:text-slate-400">Avg. Completion</span>
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">
            {analytics.avgCompletion}%
          </p>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4">
          <div className="flex items-center gap-2 mb-1">
            <CheckCircle className="h-4 w-4 text-emerald-500" />
            <span className="text-xs text-slate-500 dark:text-slate-400">Completed</span>
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">
            {analytics.completedCount}
          </p>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4">
          <div className="flex items-center gap-2 mb-1">
            <BookOpen className="h-4 w-4 text-amber-500" />
            <span className="text-xs text-slate-500 dark:text-slate-400">Total Lessons</span>
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">
            {analytics.totalLessons}
          </p>
        </div>
      </div>

      {/* Enrolled Users Table */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
            Enrolled Users ({analytics.enrolledCount})
          </h2>
        </div>
        {analytics.enrolledUsers.length === 0 ? (
          <div className="px-5 py-12 text-center">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              No users have started this path yet.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800">
                  <th className="px-5 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Progress
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Lessons
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Last Activity
                  </th>
                  <th className="px-5 py-3 text-right text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {analytics.enrolledUsers.map((user) => (
                  <tr key={user._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <td className="px-5 py-3">
                      <Link
                        href={`/admin/users/${user._id}`}
                        className="hover:text-primary-600 transition-colors"
                      >
                        <p className="font-medium text-slate-900 dark:text-white">
                          {user.name}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {user.email}
                        </p>
                      </Link>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2 min-w-[140px]">
                        <div className="flex-1 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              user.percentage === 100
                                ? "bg-emerald-500"
                                : "bg-primary-500"
                            }`}
                            style={{ width: `${user.percentage}%` }}
                          />
                        </div>
                        <span className="text-xs text-slate-500 dark:text-slate-400 w-8 text-right">
                          {user.percentage}%
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-slate-600 dark:text-slate-400">
                      {user.completedLessons} / {user.totalLessons}
                    </td>
                    <td className="px-5 py-3 text-slate-500 dark:text-slate-400 text-xs">
                      {new Date(user.lastActivity).toLocaleDateString("en", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-5 py-3 text-right">
                      {user.percentage === 100 ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400">
                          Completed
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-sky-100 dark:bg-sky-900/30 text-sky-700 dark:text-sky-400">
                          In Progress
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
