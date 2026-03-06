"use client";

import { useEffect, useState } from "react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { TrendingUp, Users, BookOpen, FileQuestion, Route } from "lucide-react";

interface SignupDataPoint {
  date: string;
  count: number;
}

interface CompletionDataPoint {
  date: string;
  count: number;
}

interface QuizDataPoint {
  date: string;
  total: number;
  passed: number;
}

interface PopularPath {
  _id: string;
  title: { en: string; ar: string };
  totalLessons: number;
  enrolledUsers: number;
  avgCompletion: number;
}

interface AnalyticsData {
  signups: SignupDataPoint[];
  completions: CompletionDataPoint[];
  quizActivity: QuizDataPoint[];
  popularPaths: PopularPath[];
}

function ChartCard({
  title,
  icon: Icon,
  children,
  summary,
}: {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
  summary?: string;
}) {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4 text-slate-500 dark:text-slate-400" />
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
            {title}
          </h3>
        </div>
        {summary && (
          <span className="text-xs text-slate-500 dark:text-slate-400">
            {summary}
          </span>
        )}
      </div>
      {children}
    </div>
  );
}

function formatDate(dateStr: string) {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en", { month: "short", day: "numeric" });
}

function formatTooltipLabel(label: unknown) {
  return formatDate(String(label));
}

export function AnalyticsCharts() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/analytics")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load analytics");
        return res.json();
      })
      .then((json) => setData(json.data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 h-[320px] animate-pulse"
          >
            <div className="h-4 w-32 bg-slate-200 dark:bg-slate-700 rounded mb-4" />
            <div className="h-full bg-slate-100 dark:bg-slate-800 rounded" />
          </div>
        ))}
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-8 text-center">
        <p className="text-slate-500 dark:text-slate-400">
          {error || "Failed to load analytics data"}
        </p>
      </div>
    );
  }

  const totalSignups = data.signups.reduce((s, d) => s + d.count, 0);
  const totalCompletions = data.completions.reduce((s, d) => s + d.count, 0);
  const totalQuizAttempts = data.quizActivity.reduce((s, d) => s + d.total, 0);
  const totalQuizPassed = data.quizActivity.reduce((s, d) => s + d.passed, 0);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Signups Chart */}
      <ChartCard
        title="New Users (30 days)"
        icon={Users}
        summary={`${totalSignups} total`}
      >
        <div className="h-[240px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data.signups}>
              <defs>
                <linearGradient id="signupGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.4} />
              <XAxis
                dataKey="date"
                tickFormatter={formatDate}
                tick={{ fontSize: 11, fill: "#94a3b8" }}
                tickLine={false}
                axisLine={false}
                interval="preserveStartEnd"
              />
              <YAxis
                tick={{ fontSize: 11, fill: "#94a3b8" }}
                tickLine={false}
                axisLine={false}
                allowDecimals={false}
              />
              <Tooltip
                labelFormatter={formatTooltipLabel}
                contentStyle={{
                  borderRadius: "8px",
                  border: "1px solid #e2e8f0",
                  fontSize: "12px",
                }}
              />
              <Area
                type="monotone"
                dataKey="count"
                name="Signups"
                stroke="#7c3aed"
                fill="url(#signupGrad)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>

      {/* Lesson Completions Chart */}
      <ChartCard
        title="Lesson Completions (30 days)"
        icon={BookOpen}
        summary={`${totalCompletions} total`}
      >
        <div className="h-[240px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data.completions}>
              <defs>
                <linearGradient id="completionGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#059669" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#059669" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.4} />
              <XAxis
                dataKey="date"
                tickFormatter={formatDate}
                tick={{ fontSize: 11, fill: "#94a3b8" }}
                tickLine={false}
                axisLine={false}
                interval="preserveStartEnd"
              />
              <YAxis
                tick={{ fontSize: 11, fill: "#94a3b8" }}
                tickLine={false}
                axisLine={false}
                allowDecimals={false}
              />
              <Tooltip
                labelFormatter={formatTooltipLabel}
                contentStyle={{
                  borderRadius: "8px",
                  border: "1px solid #e2e8f0",
                  fontSize: "12px",
                }}
              />
              <Area
                type="monotone"
                dataKey="count"
                name="Completions"
                stroke="#059669"
                fill="url(#completionGrad)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>

      {/* Quiz Activity Chart */}
      <ChartCard
        title="Quiz Activity (30 days)"
        icon={FileQuestion}
        summary={`${totalQuizAttempts} attempts, ${totalQuizPassed} passed`}
      >
        <div className="h-[240px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.quizActivity}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.4} />
              <XAxis
                dataKey="date"
                tickFormatter={formatDate}
                tick={{ fontSize: 11, fill: "#94a3b8" }}
                tickLine={false}
                axisLine={false}
                interval="preserveStartEnd"
              />
              <YAxis
                tick={{ fontSize: 11, fill: "#94a3b8" }}
                tickLine={false}
                axisLine={false}
                allowDecimals={false}
              />
              <Tooltip
                labelFormatter={formatTooltipLabel}
                contentStyle={{
                  borderRadius: "8px",
                  border: "1px solid #e2e8f0",
                  fontSize: "12px",
                }}
              />
              <Legend
                iconType="circle"
                iconSize={8}
                wrapperStyle={{ fontSize: "12px" }}
              />
              <Bar dataKey="total" name="Attempts" fill="#f59e0b" radius={[2, 2, 0, 0]} />
              <Bar dataKey="passed" name="Passed" fill="#059669" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>

      {/* Popular Paths */}
      <ChartCard
        title="Learning Path Engagement"
        icon={Route}
        summary={`${data.popularPaths.length} paths`}
      >
        <div className="h-[240px] overflow-y-auto">
          {data.popularPaths.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-sm text-slate-400">No learning path data yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {data.popularPaths
                .sort((a, b) => b.enrolledUsers - a.enrolledUsers)
                .map((path) => (
                  <div key={path._id} className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-slate-900 dark:text-white truncate max-w-[60%]">
                        {path.title.en}
                      </span>
                      <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                        <span>{path.enrolledUsers} users</span>
                        <span>{path.avgCompletion}% avg</span>
                      </div>
                    </div>
                    <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary-500 rounded-full transition-all"
                        style={{ width: `${path.avgCompletion}%` }}
                      />
                    </div>
                    <p className="text-xs text-slate-400">
                      {path.totalLessons} lessons
                    </p>
                  </div>
                ))}
            </div>
          )}
        </div>
      </ChartCard>

      {/* Summary Stats Row */}
      <div className="lg:col-span-2 grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 text-center">
          <div className="flex items-center justify-center gap-1.5 mb-1">
            <TrendingUp className="h-3.5 w-3.5 text-violet-500" />
            <span className="text-xs text-slate-500 dark:text-slate-400">New Users</span>
          </div>
          <p className="text-xl font-bold text-slate-900 dark:text-white">{totalSignups}</p>
          <p className="text-[10px] text-slate-400">last 30 days</p>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 text-center">
          <div className="flex items-center justify-center gap-1.5 mb-1">
            <BookOpen className="h-3.5 w-3.5 text-emerald-500" />
            <span className="text-xs text-slate-500 dark:text-slate-400">Completions</span>
          </div>
          <p className="text-xl font-bold text-slate-900 dark:text-white">{totalCompletions}</p>
          <p className="text-[10px] text-slate-400">last 30 days</p>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 text-center">
          <div className="flex items-center justify-center gap-1.5 mb-1">
            <FileQuestion className="h-3.5 w-3.5 text-amber-500" />
            <span className="text-xs text-slate-500 dark:text-slate-400">Quiz Attempts</span>
          </div>
          <p className="text-xl font-bold text-slate-900 dark:text-white">{totalQuizAttempts}</p>
          <p className="text-[10px] text-slate-400">last 30 days</p>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 text-center">
          <div className="flex items-center justify-center gap-1.5 mb-1">
            <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
            <span className="text-xs text-slate-500 dark:text-slate-400">Pass Rate</span>
          </div>
          <p className="text-xl font-bold text-slate-900 dark:text-white">
            {totalQuizAttempts > 0
              ? Math.round((totalQuizPassed / totalQuizAttempts) * 100)
              : 0}
            %
          </p>
          <p className="text-[10px] text-slate-400">last 30 days</p>
        </div>
      </div>
    </div>
  );
}
