"use client";

import { useState, useEffect, FormEvent, use } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function EditPathPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    titleEn: "",
    titleAr: "",
    descriptionEn: "",
    descriptionAr: "",
    thumbnail: "",
    difficulty: "beginner" as "beginner" | "intermediate" | "advanced",
    estimatedHours: 1,
    published: false,
  });

  useEffect(() => {
    fetch(`/api/admin/paths/${id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.data) {
          const p = data.data;
          setForm({
            titleEn: p.title?.en || "",
            titleAr: p.title?.ar || "",
            descriptionEn: p.description?.en || "",
            descriptionAr: p.description?.ar || "",
            thumbnail: p.thumbnail || "",
            difficulty: p.difficulty || "beginner",
            estimatedHours: p.estimatedHours || 1,
            published: p.published || false,
          });
        }
      })
      .catch(() => setError("Failed to load learning path"))
      .finally(() => setFetching(false));
  }, [id]);

  function updateField(field: string, value: string | number | boolean) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch(`/api/admin/paths/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: { en: form.titleEn, ar: form.titleAr },
          description: { en: form.descriptionEn, ar: form.descriptionAr },
          thumbnail: form.thumbnail || undefined,
          difficulty: form.difficulty,
          estimatedHours: form.estimatedHours,
          published: form.published,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to update learning path");
        return;
      }
      router.push("/admin/paths");
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

  const inputClass = "w-full px-3 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-colors";
  const labelClass = "block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5";

  return (
    <div>
      <div className="mb-6">
        <Link href="/admin/paths" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back to Learning Paths
        </Link>
      </div>

      <div className="max-w-2xl">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Edit Learning Path</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg text-sm">{error}</div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="titleEn" className={labelClass}>Title (English)</label>
              <input id="titleEn" type="text" value={form.titleEn} onChange={(e) => updateField("titleEn", e.target.value)} required className={inputClass} />
            </div>
            <div>
              <label htmlFor="titleAr" className={labelClass}>Title (Arabic)</label>
              <input id="titleAr" type="text" value={form.titleAr} onChange={(e) => updateField("titleAr", e.target.value)} required dir="rtl" className={inputClass} />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="descEn" className={labelClass}>Description (English)</label>
              <textarea id="descEn" value={form.descriptionEn} onChange={(e) => updateField("descriptionEn", e.target.value)} required rows={3} className={inputClass} />
            </div>
            <div>
              <label htmlFor="descAr" className={labelClass}>Description (Arabic)</label>
              <textarea id="descAr" value={form.descriptionAr} onChange={(e) => updateField("descriptionAr", e.target.value)} required rows={3} dir="rtl" className={inputClass} />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="difficulty" className={labelClass}>Difficulty</label>
              <select id="difficulty" value={form.difficulty} onChange={(e) => updateField("difficulty", e.target.value)} className={inputClass}>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>
            <div>
              <label htmlFor="hours" className={labelClass}>Estimated Hours</label>
              <input id="hours" type="number" min={1} value={form.estimatedHours} onChange={(e) => updateField("estimatedHours", Number(e.target.value))} className={inputClass} />
            </div>
          </div>

          <div>
            <label htmlFor="thumbnail" className={labelClass}>Thumbnail URL (optional)</label>
            <input id="thumbnail" type="url" value={form.thumbnail} onChange={(e) => updateField("thumbnail", e.target.value)} placeholder="https://res.cloudinary.com/..." className={inputClass} />
          </div>

          <div className="flex items-center gap-2">
            <input id="published" type="checkbox" checked={form.published} onChange={(e) => updateField("published", e.target.checked)} className="rounded border-slate-300 dark:border-slate-600 text-primary-600 focus:ring-primary-500" />
            <label htmlFor="published" className="text-sm text-slate-700 dark:text-slate-300">Published</label>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={loading} className="px-6 py-2.5 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white font-medium rounded-lg transition-colors">
              {loading ? "Saving..." : "Save Changes"}
            </button>
            <Link href="/admin/paths" className="px-6 py-2.5 text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 font-medium rounded-lg transition-colors">
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
