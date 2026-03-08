"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Save, Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { IconPicker } from "@/components/admin/IconPicker";

interface TopicFormData {
  name: { en: string; ar: string; es: string };
  description: { en: string; ar: string; es: string };
  icon: string;
  parent: string | null;
  order: number;
  audience: "all" | "revert" | "mentor";
  guestAccessible: boolean;
  published: boolean;
}

interface ParentOption {
  _id: string;
  name: { en: string; ar: string; es: string };
}

interface TopicFormProps {
  initialData?: TopicFormData & { _id: string };
  mode: "create" | "edit";
}

export function TopicForm({ initialData, mode }: TopicFormProps) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [globalError, setGlobalError] = useState("");
  const [parentOptions, setParentOptions] = useState<ParentOption[]>([]);

  const [form, setForm] = useState<TopicFormData>({
    name: initialData?.name || { en: "", ar: "", es: "" },
    description: initialData?.description || { en: "", ar: "", es: "" },
    icon: initialData?.icon ?? "",
    parent: initialData?.parent || null,
    order: initialData?.order ?? 1,
    audience: initialData?.audience ?? "all",
    guestAccessible: initialData?.guestAccessible ?? true,
    published: initialData?.published ?? false,
  });

  // Fetch parent topic options
  useEffect(() => {
    async function fetchTopics() {
      try {
        const res = await fetch("/api/admin/topics?limit=100");
        if (!res.ok) return;
        // The list endpoint doesn't exist as GET on the API, so we use the page data approach
        // Actually, we need to fetch from the topics list. Let's use a simple approach:
        // We'll fetch all topics for the dropdown from the same API
      } catch {
        // Silently fail — parent is optional
      }
    }
    fetchTopics();
  }, []);

  // Load parent options from a dedicated fetch
  useEffect(() => {
    async function loadParents() {
      try {
        // Fetch topics for the parent dropdown
        // Since there's no GET list endpoint on the API, we'll make a simple fetch
        // that returns topics. We can use a trick: fetch the page and parse,
        // but that's not clean. Instead, let's just rely on what we have.
        // The cleanest approach: we add nothing extra, just fetch all topics via a small API call.
        const res = await fetch("/api/admin/topics/parents");
        if (res.ok) {
          const json = await res.json();
          setParentOptions(json.data || []);
        }
      } catch {
        // Parent select will just be empty — that's fine
      }
    }
    loadParents();
  }, []);

  function handleNameEnChange(value: string) {
    setForm((prev) => ({ ...prev, name: { ...prev.name, en: value } }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setErrors({});
    setGlobalError("");

    try {
      const url =
        mode === "edit"
          ? `/api/admin/topics/${initialData?._id}`
          : "/api/admin/topics";

      const method = mode === "edit" ? "PUT" : "POST";

      const payload = {
        ...form,
        parent: form.parent || null,
      };

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.details) {
          setErrors(data.details);
        }
        setGlobalError(data.error || "Something went wrong");
        return;
      }

      router.push("/admin/topics");
      router.refresh();
    } catch {
      setGlobalError("Failed to save topic. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <div className="mb-6">
        <Link
          href="/admin/topics"
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-primary-600 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Topics
        </Link>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
        <h1 className="text-xl font-semibold text-slate-900 dark:text-white mb-6">
          {mode === "create" ? "Create Topic" : "Edit Topic"}
        </h1>

        {globalError && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm">
            {globalError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name fields */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="name-en" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Name (English) *
              </label>
              <input
                id="name-en"
                type="text"
                value={form.name.en}
                onChange={(e) => handleNameEnChange(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-colors"
                required
              />
              {errors["name.en"] && (
                <p className="mt-1 text-xs text-red-500">{errors["name.en"][0]}</p>
              )}
            </div>
            <div>
              <label htmlFor="name-ar" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Name (Arabic)
              </label>
              <input
                id="name-ar"
                type="text"
                dir="rtl"
                value={form.name.ar}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, name: { ...prev.name, ar: e.target.value } }))
                }
                className="w-full px-3 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-colors"
              />
              {errors["name.ar"] && (
                <p className="mt-1 text-xs text-red-500">{errors["name.ar"][0]}</p>
              )}
            </div>
            <div>
              <label htmlFor="name-es" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Name (Spanish)
              </label>
              <input
                id="name-es"
                type="text"
                value={form.name.es}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, name: { ...prev.name, es: e.target.value } }))
                }
                className="w-full px-3 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-colors"
              />
              {errors["name.es"] && (
                <p className="mt-1 text-xs text-red-500">{errors["name.es"][0]}</p>
              )}
            </div>
          </div>

          {/* Description fields */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="desc-en" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Description (English) *
              </label>
              <textarea
                id="desc-en"
                rows={3}
                value={form.description.en}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    description: { ...prev.description, en: e.target.value },
                  }))
                }
                className="w-full px-3 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-colors"
                required
              />
              {errors["description.en"] && (
                <p className="mt-1 text-xs text-red-500">{errors["description.en"][0]}</p>
              )}
            </div>
            <div>
              <label htmlFor="desc-ar" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Description (Arabic)
              </label>
              <textarea
                id="desc-ar"
                rows={3}
                dir="rtl"
                value={form.description.ar}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    description: { ...prev.description, ar: e.target.value },
                  }))
                }
                className="w-full px-3 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-colors"
              />
              {errors["description.ar"] && (
                <p className="mt-1 text-xs text-red-500">{errors["description.ar"][0]}</p>
              )}
            </div>
            <div>
              <label htmlFor="desc-es" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Description (Spanish)
              </label>
              <textarea
                id="desc-es"
                rows={3}
                value={form.description.es}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    description: { ...prev.description, es: e.target.value },
                  }))
                }
                className="w-full px-3 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-colors"
              />
              {errors["description.es"] && (
                <p className="mt-1 text-xs text-red-500">{errors["description.es"][0]}</p>
              )}
            </div>
          </div>

          {/* Icon + Parent */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Icon
              </label>
              <IconPicker
                value={form.icon}
                onChange={(icon) => setForm((prev) => ({ ...prev, icon }))}
              />
            </div>
            <div>
              <label htmlFor="parent" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Parent Topic
              </label>
              <select
                id="parent"
                value={form.parent || ""}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    parent: e.target.value || null,
                  }))
                }
                className="w-full px-3 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-colors"
              >
                <option value="">None (Root Topic)</option>
                {parentOptions
                  .filter((p) => p._id !== initialData?._id)
                  .map((p) => (
                    <option key={p._id} value={p._id}>
                      {p.name.en}
                    </option>
                  ))}
              </select>
            </div>
          </div>

          {/* Order */}
          <div>
            <label htmlFor="order" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Order
            </label>
            <input
              id="order"
              type="number"
              min={1}
              value={form.order}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, order: parseInt(e.target.value) || 1 }))
              }
              className="w-full px-3 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-colors"
            />
            <p className="mt-1 text-xs text-slate-400">
              Display order among sibling topics
            </p>
          </div>

          {/* Audience & Guest Access */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="audience" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Audience
              </label>
              <select
                id="audience"
                value={form.audience}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, audience: e.target.value as "all" | "revert" | "mentor" }))
                }
                className="w-full px-3 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-colors"
              >
                <option value="all">Everyone</option>
                <option value="revert">Reverts Only</option>
                <option value="mentor">Mentors Only</option>
              </select>
              <p className="mt-1 text-xs text-slate-400">Who should see this content</p>
            </div>
            <div className="flex items-center pt-7">
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.guestAccessible}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, guestAccessible: e.target.checked }))
                  }
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:after:border-slate-600 peer-checked:bg-primary-600" />
                <span className="ml-3 text-sm font-medium text-slate-700 dark:text-slate-300">
                  Available to guests
                </span>
              </label>
              <p className="mt-1 text-xs text-slate-400 ml-14">Allow non-logged-in users to view this content</p>
            </div>
          </div>

          {/* Published */}
          <div className="flex items-center">
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={form.published}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, published: e.target.checked }))
                }
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:after:border-slate-600 peer-checked:bg-primary-600" />
              <span className="ml-3 text-sm font-medium text-slate-700 dark:text-slate-300">
                Published
              </span>
            </label>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary-600 text-white font-medium text-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              {saving ? "Saving..." : mode === "create" ? "Create Topic" : "Update Topic"}
            </button>
            <Link
              href="/admin/topics"
              className="px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 font-medium text-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
