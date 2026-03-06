"use client";

import { useState, useEffect, FormEvent, use } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { ImageUpload } from "@/components/admin/ImageUpload";

interface TopicOption {
  _id: string;
  name: { en: string; ar: string };
}

export default function EditModulePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState("");
  const [topics, setTopics] = useState<TopicOption[]>([]);
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [form, setForm] = useState({
    titleEn: "",
    titleAr: "",
    descriptionEn: "",
    descriptionAr: "",
    thumbnail: "",
    published: false,
  });

  useEffect(() => {
    Promise.all([
      fetch(`/api/admin/modules/${id}`).then((r) => r.json()),
      fetch("/api/admin/topics/parents").then((r) => r.json()),
    ])
      .then(([moduleData, topicsData]) => {
        if (moduleData.data) {
          const m = moduleData.data;
          setForm({
            titleEn: m.title?.en || "",
            titleAr: m.title?.ar || "",
            descriptionEn: m.description?.en || "",
            descriptionAr: m.description?.ar || "",
            thumbnail: m.thumbnail || "",
            published: m.published || false,
          });
          // Extract topic IDs from populated or raw array
          const topicIds = (m.topics || []).map((t: any) =>
            typeof t === "string" ? t : t._id?.toString() || t.toString()
          );
          setSelectedTopics(topicIds);
        }
        if (topicsData.data) {
          setTopics(topicsData.data);
        }
      })
      .catch(() => setError("Failed to load module"))
      .finally(() => setFetching(false));
  }, [id]);

  function updateField(field: string, value: string | boolean) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function toggleTopic(topicId: string) {
    setSelectedTopics((prev) =>
      prev.includes(topicId)
        ? prev.filter((tid) => tid !== topicId)
        : [...prev, topicId]
    );
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");

    if (selectedTopics.length === 0) {
      setError("Please select at least one topic");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`/api/admin/modules/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: { en: form.titleEn, ar: form.titleAr },
          description: { en: form.descriptionEn, ar: form.descriptionAr },
          thumbnail: form.thumbnail || undefined,
          topics: selectedTopics,
          published: form.published,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to update module");
        return;
      }

      router.push("/admin/modules");
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
          href="/admin/modules"
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Modules
        </Link>
      </div>

      <div className="max-w-2xl">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
          Edit Module
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
                dir="rtl"
                className="w-full px-3 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-colors"
              />
            </div>
          </div>

          {/* Topic selection */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Topics *
            </label>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
              Select which topics this module belongs to
            </p>
            {topics.length === 0 ? (
              <p className="text-sm text-slate-400 dark:text-slate-500 italic">
                No topics created yet.
              </p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {topics.map((topic) => (
                  <button
                    key={topic._id}
                    type="button"
                    onClick={() => toggleTopic(topic._id)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
                      selectedTopics.includes(topic._id)
                        ? "bg-primary-600 text-white border-primary-600"
                        : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700 hover:border-primary-400"
                    }`}
                  >
                    {topic.name.en}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="descEn" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Description (English)
              </label>
              <textarea
                id="descEn"
                value={form.descriptionEn}
                onChange={(e) => updateField("descriptionEn", e.target.value)}
                required
                rows={3}
                className="w-full px-3 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-colors"
              />
            </div>
            <div>
              <label htmlFor="descAr" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Description (Arabic)
              </label>
              <textarea
                id="descAr"
                value={form.descriptionAr}
                onChange={(e) => updateField("descriptionAr", e.target.value)}
                rows={3}
                dir="rtl"
                className="w-full px-3 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Thumbnail
            </label>
            <ImageUpload
              value={form.thumbnail}
              onChange={(url) => updateField("thumbnail", url)}
            />
          </div>

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
              href="/admin/modules"
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
