import Link from "next/link";
import { BookOpen, Route, GraduationCap, Users, Layers, FileQuestion, Flag } from "lucide-react";
import { getDashboardStats } from "@/lib/data";
import { connectDB } from "@/db/connection";
import { MentorRequest } from "@/db/models/MentorRequest";
import { MentorApplication } from "@/db/models/MentorApplication";
import { LessonReport } from "@/db/models/LessonReport";
import { AnalyticsCharts } from "@/components/admin/AnalyticsCharts";

export default async function AdminDashboardPage() {
  const stats = await getDashboardStats();
  await connectDB();
  const [openReports, pendingRequests, pendingVolunteers] = await Promise.all([
    LessonReport.countDocuments({ kind: "report", status: "open" }),
    MentorRequest.countDocuments({ status: "pending" }),
    MentorApplication.countDocuments({ status: "pending" }),
  ]);

  const cards = [
    { label: "Topics", value: stats.topics, icon: BookOpen, color: "bg-primary-100 dark:bg-primary-900/30 text-primary-600" },
    { label: "Learning Paths", value: stats.paths, icon: Route, color: "bg-accent-100 dark:bg-accent-900/30 text-accent-600" },
    { label: "Modules", value: stats.modules, icon: Layers, color: "bg-sky-100 dark:bg-sky-900/30 text-sky-600" },
    { label: "Lessons", value: stats.lessons, icon: GraduationCap, color: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600" },
    { label: "Quizzes", value: stats.quizzes, icon: FileQuestion, color: "bg-amber-100 dark:bg-amber-900/30 text-amber-600" },
    { label: "Users", value: stats.users, icon: Users, color: "bg-violet-100 dark:bg-violet-900/30 text-violet-600" },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
        Dashboard
      </h1>

      {pendingRequests + pendingVolunteers > 0 && (
        <section
          aria-labelledby="attention-title"
          className="mb-6 rounded-xl border border-amber-200 dark:border-amber-800/40 bg-amber-50 dark:bg-amber-900/10 p-5"
        >
          <h2 id="attention-title" className="text-base font-semibold text-slate-900 dark:text-white">
            Needs your attention
          </h2>
          <ul className="mt-2 space-y-1 text-sm">
            {pendingRequests > 0 && (
              <li>
                <Link
                  href="/admin/mentorship"
                  className="text-primary-700 dark:text-primary-400 hover:underline"
                >
                  {pendingRequests} mentor {pendingRequests === 1 ? "request is" : "requests are"} waiting for a match
                </Link>
              </li>
            )}
            {pendingVolunteers > 0 && (
              <li>
                <Link
                  href="/admin/mentorship?tab=volunteers"
                  className="text-primary-700 dark:text-primary-400 hover:underline"
                >
                  {pendingVolunteers} volunteer {pendingVolunteers === 1 ? "application is" : "applications are"} waiting for review
                </Link>
              </li>
            )}
          </ul>
        </section>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map((stat) => (
          <div
            key={stat.label}
            className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5"
          >
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-lg ${stat.color}`}>
                <stat.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  {stat.value}
                </p>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {stat.label}
                </p>
              </div>
            </div>
          </div>
        ))}
        <Link
          href="/admin/reports"
          className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 hover:border-primary-300 dark:hover:border-primary-700 transition-colors"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-lg bg-rose-100 dark:bg-rose-900/30 text-rose-600">
              <Flag className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">{openReports}</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">Open reports</p>
            </div>
          </div>
        </Link>
      </div>

      <div className="mt-8">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
          Analytics
        </h2>
        <AnalyticsCharts />
      </div>
    </div>
  );
}
