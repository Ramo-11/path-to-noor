"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import Link from "next/link";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Heart } from "lucide-react";

interface StoryFormData {
  personName: { en: string; ar: string; es: string };
  title: { en: string; ar: string; es: string };
  excerpt: { en: string; ar: string; es: string };
  content: { en: string; ar: string; es: string };
  videoUrl: string;
  videoType: "youtube" | "upload" | "none";
  thumbnail: string;
  type: "text" | "video" | "both";
  featured: boolean;
  published: boolean;
  order: number;
}

interface StoryFormProps {
  mode: "create" | "edit";
  initialData?: StoryFormData & { _id: string };
}

const defaultData: StoryFormData = {
  personName: { en: "", ar: "", es: "" },
  title: { en: "", ar: "", es: "" },
  excerpt: { en: "", ar: "", es: "" },
  content: { en: "", ar: "", es: "" },
  videoUrl: "",
  videoType: "none",
  thumbnail: "",
  type: "text",
  featured: false,
  published: false,
  order: 0,
};

function extractYouTubeId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /^([a-zA-Z0-9_-]{11})$/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

export function StoryForm({ mode, initialData }: StoryFormProps) {
  const router = useRouter();
  const [form, setForm] = useState<StoryFormData>(initialData || defaultData);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [globalError, setGlobalError] = useState("");
  const [langTab, setLangTab] = useState<"en" | "ar" | "es">("en");

  function updateBilingual(field: "personName" | "title" | "excerpt" | "content", lang: "en" | "ar" | "es", value: string) {
    setForm((prev) => ({
      ...prev,
      [field]: { ...prev[field], [lang]: value },
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setErrors({});
    setGlobalError("");

    try {
      const url = mode === "create"
        ? "/api/admin/stories"
        : `/api/admin/stories/${initialData?._id}`;

      const res = await fetch(url, {
        method: mode === "create" ? "POST" : "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const json = await res.json();

      if (!res.ok) {
        if (json.details) {
          setErrors(json.details);
        } else {
          setGlobalError(json.error || "Something went wrong");
        }
        return;
      }

      router.push("/admin/stories");
      router.refresh();
    } catch {
      setGlobalError("Failed to save story");
    } finally {
      setSaving(false);
    }
  }

  const youtubePreviewId = form.videoType === "youtube" ? extractYouTubeId(form.videoUrl) : null;

  return (
    <div>
      <AdminPageHeader
        title={mode === "create" ? "Create Story" : "Edit Story"}
        description={mode === "create" ? "Add a new revert story or shahada video" : "Update this story"}
        icon={Heart}
      />

      <div className="mb-6">
        <Link
          href="/admin/stories"
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Stories
        </Link>
      </div>

      {globalError && (
        <div className="mb-6 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 px-4 py-3 text-sm text-red-700 dark:text-red-400">
          {globalError}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Language Tabs */}
        <div className="flex gap-1 bg-slate-100 dark:bg-slate-800 rounded-lg p-1 w-fit">
          {(["en", "ar", "es"] as const).map((lang) => (
            <button
              key={lang}
              type="button"
              onClick={() => setLangTab(lang)}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
                langTab === lang
                  ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm"
                  : "text-slate-500 hover:text-slate-700 dark:text-slate-400"
              }`}
            >
              {lang === "en" ? "English" : lang === "ar" ? "Arabic" : "Spanish"}
            </button>
          ))}
        </div>

        {/* Person Name & Title */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Person Name ({langTab.toUpperCase()}) *
            </label>
            <input
              type="text"
              value={form.personName[langTab]}
              onChange={(e) => updateBilingual("personName", langTab, e.target.value)}
              dir={langTab === "ar" ? "rtl" : "ltr"}
              className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-4 py-2.5 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder={langTab === "ar" ? "اسم الشخص" : "Person's name"}
            />
            {errors["personName.en"] && langTab === "en" && (
              <p className="mt-1 text-xs text-red-500">{errors["personName.en"][0]}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Title ({langTab.toUpperCase()}) *
            </label>
            <input
              type="text"
              value={form.title[langTab]}
              onChange={(e) => updateBilingual("title", langTab, e.target.value)}
              dir={langTab === "ar" ? "rtl" : "ltr"}
              className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-4 py-2.5 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder={langTab === "ar" ? "عنوان القصة" : "Story title"}
            />
            {errors["title.en"] && langTab === "en" && (
              <p className="mt-1 text-xs text-red-500">{errors["title.en"][0]}</p>
            )}
          </div>
        </div>

        {/* Excerpt */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
            Excerpt ({langTab.toUpperCase()}) *
          </label>
          <textarea
            value={form.excerpt[langTab]}
            onChange={(e) => updateBilingual("excerpt", langTab, e.target.value)}
            dir={langTab === "ar" ? "rtl" : "ltr"}
            rows={3}
            className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-4 py-2.5 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder={langTab === "ar" ? "مقتطف قصير يظهر في الكاروسيل..." : "Short excerpt shown in the carousel..."}
          />
          {errors["excerpt.en"] && langTab === "en" && (
            <p className="mt-1 text-xs text-red-500">{errors["excerpt.en"][0]}</p>
          )}
        </div>

        {/* Full Content */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
            Full Story ({langTab.toUpperCase()})
          </label>
          <textarea
            value={form.content[langTab]}
            onChange={(e) => updateBilingual("content", langTab, e.target.value)}
            dir={langTab === "ar" ? "rtl" : "ltr"}
            rows={6}
            className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-4 py-2.5 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder={langTab === "ar" ? "القصة الكاملة (اختياري)..." : "Full story text (optional)..."}
          />
        </div>

        {/* Story Type & Video */}
        <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-6 space-y-6">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Media</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Story Type
              </label>
              <select
                value={form.type}
                onChange={(e) => setForm((prev) => ({ ...prev, type: e.target.value as StoryFormData["type"] }))}
                className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-4 py-2.5 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="text">Text Only</option>
                <option value="video">Video Only</option>
                <option value="both">Text & Video</option>
              </select>
            </div>

            {(form.type === "video" || form.type === "both") && (
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  Video Source
                </label>
                <select
                  value={form.videoType}
                  onChange={(e) => setForm((prev) => ({ ...prev, videoType: e.target.value as StoryFormData["videoType"] }))}
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-4 py-2.5 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="youtube">YouTube</option>
                  <option value="upload">Direct URL</option>
                </select>
              </div>
            )}
          </div>

          {(form.type === "video" || form.type === "both") && (
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                {form.videoType === "youtube" ? "YouTube URL" : "Video URL"}
              </label>
              <input
                type="text"
                value={form.videoUrl}
                onChange={(e) => setForm((prev) => ({ ...prev, videoUrl: e.target.value }))}
                className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-4 py-2.5 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder={form.videoType === "youtube" ? "https://youtube.com/watch?v=..." : "https://example.com/video.mp4"}
              />
              {youtubePreviewId && (
                <div className="mt-3 rounded-lg overflow-hidden aspect-video max-w-md">
                  <iframe
                    src={`https://www.youtube.com/embed/${youtubePreviewId}`}
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    title="Video preview"
                  />
                </div>
              )}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Thumbnail URL (optional)
            </label>
            <input
              type="text"
              value={form.thumbnail}
              onChange={(e) => setForm((prev) => ({ ...prev, thumbnail: e.target.value }))}
              className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-4 py-2.5 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="https://res.cloudinary.com/..."
            />
          </div>
        </div>

        {/* Settings */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Display Order
            </label>
            <input
              type="number"
              value={form.order}
              onChange={(e) => setForm((prev) => ({ ...prev, order: parseInt(e.target.value) || 0 }))}
              className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-4 py-2.5 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              min={0}
            />
          </div>

          <div className="flex items-center gap-3 pt-6">
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={form.featured}
                onChange={(e) => setForm((prev) => ({ ...prev, featured: e.target.checked }))}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-slate-300 dark:bg-slate-600 rounded-full peer peer-checked:bg-accent-500 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all" />
            </label>
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Featured</span>
          </div>

          <div className="flex items-center gap-3 pt-6">
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={form.published}
                onChange={(e) => setForm((prev) => ({ ...prev, published: e.target.checked }))}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-slate-300 dark:bg-slate-600 rounded-full peer peer-checked:bg-emerald-500 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all" />
            </label>
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Published</span>
          </div>
        </div>

        {/* Submit */}
        <div className="flex items-center gap-4 pt-4 border-t border-slate-200 dark:border-slate-700">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-lg bg-primary-600 hover:bg-primary-700 text-white px-6 py-2.5 text-sm font-medium transition-colors disabled:opacity-50"
          >
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            {mode === "create" ? "Create Story" : "Save Changes"}
          </button>
          <Link
            href="/admin/stories"
            className="text-sm text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
