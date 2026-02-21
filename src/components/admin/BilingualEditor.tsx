"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import { TipTapEditor } from "./TipTapEditor";
import { TipTapRenderer } from "@/components/shared/TipTapRenderer";
import {
  Pencil,
  Columns2,
  Eye,
  Maximize2,
  X,
} from "lucide-react";

type ViewMode = "edit" | "split" | "preview";

interface BilingualEditorProps {
  contentEn: unknown;
  contentAr: unknown;
  onChangeEn: (content: unknown) => void;
  onChangeAr: (content: unknown) => void;
  label?: string;
}

export function BilingualEditor({
  contentEn,
  contentAr,
  onChangeEn,
  onChangeAr,
  label = "Content",
}: BilingualEditorProps) {
  const [activeTab, setActiveTab] = useState<"en" | "ar">("en");
  const [viewMode, setViewMode] = useState<ViewMode>("edit");
  const [fullscreen, setFullscreen] = useState(false);
  const [fullscreenLang, setFullscreenLang] = useState<"en" | "ar">("en");

  const activeContent = activeTab === "en" ? contentEn : contentAr;

  return (
    <div>
      {label && (
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
          {label}
        </label>
      )}

      {/* Header: language tabs + view mode toggle */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 mb-0">
        {/* Language tabs */}
        <div className="flex">
          <button
            type="button"
            onClick={() => setActiveTab("en")}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "en"
                ? "border-primary-600 text-primary-700 dark:text-primary-400"
                : "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
            }`}
          >
            English
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("ar")}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "ar"
                ? "border-primary-600 text-primary-700 dark:text-primary-400"
                : "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
            }`}
          >
            العربية
          </button>
        </div>

        {/* View mode + fullscreen */}
        <div className="flex items-center gap-1 pb-1">
          <ViewModeButton
            active={viewMode === "edit"}
            onClick={() => setViewMode("edit")}
            title="Edit"
          >
            <Pencil className="h-3.5 w-3.5" />
          </ViewModeButton>
          <ViewModeButton
            active={viewMode === "split"}
            onClick={() => setViewMode("split")}
            title="Split (Editor + Preview)"
          >
            <Columns2 className="h-3.5 w-3.5" />
          </ViewModeButton>
          <ViewModeButton
            active={viewMode === "preview"}
            onClick={() => setViewMode("preview")}
            title="Preview"
          >
            <Eye className="h-3.5 w-3.5" />
          </ViewModeButton>

          <div className="w-px h-4 bg-slate-200 dark:bg-slate-700 mx-1" />

          <button
            type="button"
            onClick={() => {
              setFullscreenLang(activeTab);
              setFullscreen(true);
            }}
            title="Fullscreen Preview"
            className="p-1.5 rounded text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            <Maximize2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Edit mode */}
      {viewMode === "edit" && (
        <>
          <div className={activeTab === "en" ? "block" : "hidden"}>
            <TipTapEditor
              content={contentEn}
              onChange={onChangeEn}
              placeholder="Write content in English..."
            />
          </div>
          <div className={activeTab === "ar" ? "block" : "hidden"} dir="rtl">
            <TipTapEditor
              content={contentAr}
              onChange={onChangeAr}
              placeholder="اكتب المحتوى بالعربية..."
            />
          </div>
        </>
      )}

      {/* Split mode — editor + preview side by side */}
      {viewMode === "split" && (
        <div className="grid grid-cols-1 lg:grid-cols-[2fr_3fr] gap-4">
          <div className="min-w-0">
            <div className={activeTab === "en" ? "block" : "hidden"}>
              <TipTapEditor
                content={contentEn}
                onChange={onChangeEn}
                placeholder="Write content in English..."
              />
            </div>
            <div className={activeTab === "ar" ? "block" : "hidden"} dir="rtl">
              <TipTapEditor
                content={contentAr}
                onChange={onChangeAr}
                placeholder="اكتب المحتوى بالعربية..."
              />
            </div>
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-1.5">
              <div className="text-xs font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                Live Preview
              </div>
              <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" title="Synced — updates as you type" />
            </div>
            <div
              dir={activeTab === "ar" ? "rtl" : "ltr"}
              lang={activeTab}
              className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-6 sm:p-8 min-h-[400px]"
            >
              {activeContent ? (
                <TipTapRenderer content={activeContent} />
              ) : (
                <p className="text-slate-400 dark:text-slate-500 text-sm">
                  Start typing to see preview...
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Preview mode — preview only */}
      {viewMode === "preview" && (
        <div
          dir={activeTab === "ar" ? "rtl" : "ltr"}
          lang={activeTab}
          className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-6 sm:p-10 min-h-[400px]"
        >
          {activeContent ? (
            <TipTapRenderer content={activeContent} />
          ) : (
            <p className="text-slate-400 dark:text-slate-500 text-sm text-center py-8">
              No content to preview
            </p>
          )}
        </div>
      )}

      {/* Fullscreen preview overlay */}
      {fullscreen &&
        createPortal(
          <FullscreenPreview
            contentEn={contentEn}
            contentAr={contentAr}
            initialLang={fullscreenLang}
            onClose={() => setFullscreen(false)}
          />,
          document.body
        )}
    </div>
  );
}

function FullscreenPreview({
  contentEn,
  contentAr,
  initialLang,
  onClose,
}: {
  contentEn: unknown;
  contentAr: unknown;
  initialLang: "en" | "ar";
  onClose: () => void;
}) {
  const [lang, setLang] = useState<"en" | "ar">(initialLang);
  const content = lang === "en" ? contentEn : contentAr;

  return (
    <div className="fixed inset-0 z-50 bg-slate-100 dark:bg-slate-950 overflow-auto">
      {/* Top bar */}
      <div className="sticky top-0 z-10 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Eye className="h-4 w-4 text-slate-500" />
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
            Fullscreen Preview
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
            <button
              type="button"
              onClick={() => setLang("en")}
              className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                lang === "en"
                  ? "bg-primary-600 text-white"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              EN
            </button>
            <button
              type="button"
              onClick={() => setLang("ar")}
              className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                lang === "ar"
                  ? "bg-primary-600 text-white"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              AR
            </button>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Content — mirrors public lesson page layout */}
      <div className="max-w-3xl mx-auto py-10 px-4">
        <div
          dir={lang === "ar" ? "rtl" : "ltr"}
          lang={lang}
          className="rounded-2xl bg-white dark:bg-slate-900 shadow-sm border border-slate-100 dark:border-slate-800 p-6 sm:p-10"
        >
          {content ? (
            <TipTapRenderer content={content} />
          ) : (
            <p className="text-slate-400 dark:text-slate-500 text-center py-8">
              No content to preview
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function ViewModeButton({
  active,
  onClick,
  title,
  children,
}: {
  active: boolean;
  onClick: () => void;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={`p-1.5 rounded transition-colors ${
        active
          ? "bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400"
          : "text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
      }`}
    >
      {children}
    </button>
  );
}
