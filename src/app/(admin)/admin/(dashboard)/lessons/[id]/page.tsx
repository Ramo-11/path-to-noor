"use client";

import { useState, useEffect, FormEvent, use } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { BilingualEditor } from "@/components/admin/BilingualEditor";

interface ModuleOption {
  _id: string;
  title: { en: string; ar: string };
}

export default function EditLessonPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState("");
  const [modules, setModules] = useState<ModuleOption[]>([]);
  const [form, setForm] = useState({
    titleEn: "",
    titleAr: "",
    moduleId: "",
    estimatedMinutes: 5,
    published: false,
  });
  const [contentEn, setContentEn] = useState<unknown>(null);
  const [contentAr, setContentAr] = useState<unknown>(null);

  useEffect(() => {
    Promise.all([
      fetch(`/api/admin/lessons/${id}`).then((r) => r.json()),
      fetch("/api/admin/modules").then((r) => r.json()),
    ])
      .then(([lessonData, modulesData]) => {
        if (lessonData.data) {
          const l = lessonData.data;
          setForm({
            titleEn: l.title?.en || "",
            titleAr: l.title?.ar || "",
            moduleId: l.moduleId?.toString() || "",
            estimatedMinutes: l.estimatedMinutes || 5,
            published: l.published || false,
          });
          setContentEn(l.content?.en || null);
          setContentAr(l.content?.ar || null);
        }
        if (modulesData.data) {
          setModules(modulesData.data);
        }
      })
      .catch(() => setError("Failed to load lesson"))
      .finally(() => setFetching(false));
  }, [id]);

  function updateField(field: string, value: string | boolean | number) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch(`/api/admin/lessons/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: { en: form.titleEn, ar: form.titleAr },
          content: { en: contentEn, ar: contentAr },
          moduleId: form.moduleId || undefined,
          estimatedMinutes: form.estimatedMinutes,
          published: form.published,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to update lesson");
        return;
      }

      router.push("/admin/lessons");
    } catch {
      setError("An error occurred");
    } finally {
      setLoading(false);
    }
  }

  if (fetching) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <Link
          href="/admin/lessons"
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Lessons
        </Link>
      </div>

      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
          Edit Lesson
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="titleEn" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Title (English)
              </label>
              <input
                id="titleEn"
                type="text"
                value={form.titleEn}
                onChange={(e) => updateField("titleEn", e.target.value)}
                required
                className="w-full px-3 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-colors"
              />
            </div>
            <div>
              <label htmlFor="titleAr" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Title (Arabic)
              </label>
              <input
                id="titleAr"
                type="text"
                value={form.titleAr}
                onChange={(e) => updateField("titleAr", e.target.value)}
                required
                dir="rtl"
                className="w-full px-3 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-colors"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="moduleId" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Module
              </label>
              <select
                id="moduleId"
                value={form.moduleId}
                onChange={(e) => updateField("moduleId", e.target.value)}
                required
                className="w-full px-3 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-colors"
              >
                <option value="">Select module...</option>
                {modules.map((m) => (
                  <option key={m._id} value={m._id}>
                    {m.title.en}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="estimatedMinutes" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Duration (min)
              </label>
              <input
                id="estimatedMinutes"
                type="number"
                min={1}
                value={form.estimatedMinutes}
                onChange={(e) => updateField("estimatedMinutes", parseInt(e.target.value) || 5)}
                className="w-full px-3 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-colors"
              />
            </div>
          </div>

          <BilingualEditor
            contentEn={contentEn}
            contentAr={contentAr}
            onChangeEn={setContentEn}
            onChangeAr={setContentAr}
            label="Lesson Content"
          />

          <div className="flex items-center gap-2">
            <input
              id="published"
              type="checkbox"
              checked={form.published}
              onChange={(e) => updateField("published", e.target.checked)}
              className="rounded border-slate-300 dark:border-slate-600 text-primary-600 focus:ring-primary-500"
            />
            <label htmlFor="published" className="text-sm text-slate-700 dark:text-slate-300">
              Published
            </label>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white font-medium rounded-lg transition-colors"
            >
              {loading ? "Saving..." : "Save Changes"}
            </button>
            <Link
              href="/admin/lessons"
              className="px-6 py-2.5 text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 font-medium rounded-lg transition-colors"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
