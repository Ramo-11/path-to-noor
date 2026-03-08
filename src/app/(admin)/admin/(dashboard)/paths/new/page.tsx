"use client";

import { useState, useEffect, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, GripVertical, Plus, X } from "lucide-react";
import Link from "next/link";
import { ImageUpload } from "@/components/admin/ImageUpload";

interface ModuleOption {
  _id: string;
  title: { en: string; ar: string };
  slug: string;
}

export default function NewPathPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [allModules, setAllModules] = useState<ModuleOption[]>([]);
  const [selectedModuleIds, setSelectedModuleIds] = useState<string[]>([]);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [form, setForm] = useState({
    titleEn: "",
    titleAr: "",
    titleEs: "",
    descriptionEn: "",
    descriptionAr: "",
    descriptionEs: "",
    thumbnail: "",
    difficulty: "beginner" as "beginner" | "intermediate" | "advanced",
    estimatedHours: 1,
    audience: "all" as "all" | "revert" | "mentor",
    guestAccessible: true,
    published: false,
  });

  useEffect(() => {
    fetch("/api/admin/modules")
      .then((res) => res.json())
      .then((data) => {
        if (data.data) setAllModules(data.data);
      })
      .catch(() => {});
  }, []);

  function updateField(field: string, value: string | number | boolean) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function addModule(moduleId: string) {
    if (!selectedModuleIds.includes(moduleId)) {
      setSelectedModuleIds((prev) => [...prev, moduleId]);
    }
  }

  function removeModule(moduleId: string) {
    setSelectedModuleIds((prev) => prev.filter((id) => id !== moduleId));
  }

  function handleDragStart(index: number) {
    setDragIndex(index);
  }

  function handleDragOver(e: React.DragEvent, index: number) {
    e.preventDefault();
    if (dragIndex === null || dragIndex === index) return;

    setSelectedModuleIds((prev) => {
      const updated = [...prev];
      const [moved] = updated.splice(dragIndex, 1);
      updated.splice(index, 0, moved);
      return updated;
    });
    setDragIndex(index);
  }

  function handleDragEnd() {
    setDragIndex(null);
  }

  const availableModules = allModules.filter(
    (m) => !selectedModuleIds.includes(m._id)
  );

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/admin/paths", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: { en: form.titleEn, ar: form.titleAr, es: form.titleEs },
          description: { en: form.descriptionEn, ar: form.descriptionAr, es: form.descriptionEs },
          thumbnail: form.thumbnail || undefined,
          difficulty: form.difficulty,
          estimatedHours: form.estimatedHours,
          modules: selectedModuleIds.map((id, i) => ({
            moduleId: id,
            order: i + 1,
          })),
          audience: form.audience,
          guestAccessible: form.guestAccessible,
          published: form.published,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to create learning path");
        return;
      }
      router.push("/admin/paths");
    } catch {
      setError("An error occurred");
    } finally {
      setLoading(false);
    }
  }

  const inputClass =
    "w-full px-3 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-colors";
  const labelClass =
    "block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5";

  return (
    <div>
      <div className="mb-6">
        <Link
          href="/admin/paths"
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Learning Paths
        </Link>
      </div>

      <div className="max-w-2xl">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
          Create Learning Path
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label htmlFor="titleEn" className={labelClass}>
                Title (English)
              </label>
              <input
                id="titleEn"
                type="text"
                value={form.titleEn}
                onChange={(e) => updateField("titleEn", e.target.value)}
                required
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="titleAr" className={labelClass}>
                Title (Arabic)
              </label>
              <input
                id="titleAr"
                type="text"
                value={form.titleAr}
                onChange={(e) => updateField("titleAr", e.target.value)}
                dir="rtl"
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="titleEs" className={labelClass}>
                Title (Spanish)
              </label>
              <input
                id="titleEs"
                type="text"
                value={form.titleEs}
                onChange={(e) => updateField("titleEs", e.target.value)}
                className={inputClass}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label htmlFor="descEn" className={labelClass}>
                Description (English)
              </label>
              <textarea
                id="descEn"
                value={form.descriptionEn}
                onChange={(e) => updateField("descriptionEn", e.target.value)}
                required
                rows={3}
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="descAr" className={labelClass}>
                Description (Arabic)
              </label>
              <textarea
                id="descAr"
                value={form.descriptionAr}
                onChange={(e) => updateField("descriptionAr", e.target.value)}
                rows={3}
                dir="rtl"
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="descEs" className={labelClass}>
                Description (Spanish)
              </label>
              <textarea
                id="descEs"
                value={form.descriptionEs}
                onChange={(e) => updateField("descriptionEs", e.target.value)}
                rows={3}
                className={inputClass}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="difficulty" className={labelClass}>
                Difficulty
              </label>
              <select
                id="difficulty"
                value={form.difficulty}
                onChange={(e) => updateField("difficulty", e.target.value)}
                className={inputClass}
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>
            <div>
              <label htmlFor="hours" className={labelClass}>
                Estimated Hours
              </label>
              <input
                id="hours"
                type="number"
                min={1}
                value={form.estimatedHours}
                onChange={(e) =>
                  updateField("estimatedHours", Number(e.target.value))
                }
                className={inputClass}
              />
            </div>
          </div>

          {/* Module selection and ordering */}
          <div>
            <label className={labelClass}>Modules</label>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
              Add modules to this path and drag to reorder them.
            </p>

            {/* Selected modules - sortable list */}
            {selectedModuleIds.length > 0 && (
              <div className="space-y-2 mb-4">
                {selectedModuleIds.map((moduleId, index) => {
                  const mod = allModules.find((m) => m._id === moduleId);
                  if (!mod) return null;

                  return (
                    <div
                      key={moduleId}
                      draggable
                      onDragStart={() => handleDragStart(index)}
                      onDragOver={(e) => handleDragOver(e, index)}
                      onDragEnd={handleDragEnd}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg border bg-white dark:bg-slate-800 transition-colors ${
                        dragIndex === index
                          ? "border-primary-400 shadow-sm"
                          : "border-slate-200 dark:border-slate-700"
                      }`}
                    >
                      <GripVertical className="h-4 w-4 text-slate-400 cursor-grab shrink-0" />
                      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 text-xs font-bold shrink-0">
                        {index + 1}
                      </span>
                      <span className="flex-1 text-sm font-medium text-slate-700 dark:text-slate-300 truncate">
                        {mod.title.en}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeModule(moduleId)}
                        className="p-1 rounded text-slate-400 hover:text-red-500 transition-colors shrink-0"
                        aria-label={`Remove ${mod.title.en}`}
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Add module dropdown */}
            {availableModules.length > 0 && (
              <div className="flex gap-2">
                <select
                  id="addModule"
                  className={inputClass}
                  defaultValue=""
                  onChange={(e) => {
                    if (e.target.value) {
                      addModule(e.target.value);
                      e.target.value = "";
                    }
                  }}
                >
                  <option value="" disabled>
                    Select a module to add...
                  </option>
                  {availableModules.map((mod) => (
                    <option key={mod._id} value={mod._id}>
                      {mod.title.en}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {allModules.length === 0 && (
              <p className="text-sm text-slate-400 dark:text-slate-500 italic">
                No modules created yet. Create modules first.
              </p>
            )}
          </div>

          <div>
            <label className={labelClass}>Thumbnail</label>
            <ImageUpload
              value={form.thumbnail}
              onChange={(url) => updateField("thumbnail", url)}
            />
          </div>

          {/* Audience & Guest Access */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="audience" className={labelClass}>
                Audience
              </label>
              <select
                id="audience"
                value={form.audience}
                onChange={(e) => updateField("audience", e.target.value)}
                className={inputClass}
              >
                <option value="all">Everyone</option>
                <option value="revert">Reverts Only</option>
                <option value="mentor">Mentors Only</option>
              </select>
              <p className="mt-1 text-xs text-slate-400">Who should see this content</p>
            </div>
            <div className="flex items-start pt-7">
              <div>
                <div className="flex items-center gap-2">
                  <input
                    id="guestAccessible"
                    type="checkbox"
                    checked={form.guestAccessible}
                    onChange={(e) => updateField("guestAccessible", e.target.checked)}
                    className="rounded border-slate-300 dark:border-slate-600 text-primary-600 focus:ring-primary-500"
                  />
                  <label htmlFor="guestAccessible" className="text-sm text-slate-700 dark:text-slate-300">
                    Available to guests
                  </label>
                </div>
                <p className="mt-1 text-xs text-slate-400">Allow non-logged-in users to view this content</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              id="published"
              type="checkbox"
              checked={form.published}
              onChange={(e) => updateField("published", e.target.checked)}
              className="rounded border-slate-300 dark:border-slate-600 text-primary-600 focus:ring-primary-500"
            />
            <label
              htmlFor="published"
              className="text-sm text-slate-700 dark:text-slate-300"
            >
              Publish immediately
            </label>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white font-medium rounded-lg transition-colors"
            >
              {loading ? "Creating..." : "Create Path"}
            </button>
            <Link
              href="/admin/paths"
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
