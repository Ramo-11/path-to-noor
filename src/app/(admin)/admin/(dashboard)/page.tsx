import { BookOpen, Route, GraduationCap, Users } from "lucide-react";

const stats = [
  { label: "Topics", value: "0", icon: BookOpen, color: "bg-primary-100 dark:bg-primary-900/30 text-primary-600" },
  { label: "Learning Paths", value: "0", icon: Route, color: "bg-accent-100 dark:bg-accent-900/30 text-accent-600" },
  { label: "Lessons", value: "0", icon: GraduationCap, color: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600" },
  { label: "Users", value: "0", icon: Users, color: "bg-violet-100 dark:bg-violet-900/30 text-violet-600" },
];

export default function AdminDashboardPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
        Dashboard
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
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
      </div>

      <div className="mt-8 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
          Welcome to Path to Noor Admin
        </h2>
        <p className="text-slate-600 dark:text-slate-400">
          Use the sidebar to manage topics, learning paths, modules, lessons, quizzes, and users.
          Start by creating topics to organize your content hierarchy.
        </p>
      </div>
    </div>
  );
}
