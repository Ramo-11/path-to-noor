"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  ChevronLeft,
  ChevronRight,
  Play,
  Quote,
  Star,
  X,
} from "lucide-react";

interface Story {
  _id: string;
  personName: { en: string; ar: string; es: string };
  title: { en: string; ar: string; es: string };
  excerpt: { en: string; ar: string; es: string };
  videoUrl: string;
  videoType: "youtube" | "upload" | "none";
  thumbnail: string;
  type: "text" | "video" | "both";
  featured: boolean;
}

interface StoriesCarouselProps {
  stories: Story[];
  locale: string;
  sectionTitle: string;
  sectionSubtitle: string;
  sectionBadge: string;
}

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

function YouTubeThumbnail({ videoUrl }: { videoUrl: string }) {
  const ytId = extractYouTubeId(videoUrl);
  if (!ytId) return null;
  return (
    <img
      src={`https://img.youtube.com/vi/${ytId}/hqdefault.jpg`}
      alt=""
      className="w-full h-full object-cover"
    />
  );
}

export function StoriesCarousel({
  stories,
  locale,
  sectionTitle,
  sectionSubtitle,
  sectionBadge,
}: StoriesCarouselProps) {
  const [current, setCurrent] = useState(0);
  const [videoModal, setVideoModal] = useState<string | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const isRtl = locale === "ar";
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const total = stories.length;
  if (total === 0) return null;

  const next = useCallback(() => {
    setCurrent((prev) => (prev + 1) % total);
  }, [total]);

  const prev = useCallback(() => {
    setCurrent((prev) => (prev - 1 + total) % total);
  }, [total]);

  // Auto-advance every 7 seconds
  useEffect(() => {
    if (isPaused || videoModal) return;
    timerRef.current = setInterval(next, 7000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [next, isPaused, videoModal]);

  const story = stories[current];
  const lang = locale as "en" | "ar" | "es";
  const hasVideo = story.type === "video" || story.type === "both";
  const ytId = hasVideo ? extractYouTubeId(story.videoUrl) : null;

  function openVideo() {
    if (story.videoType === "youtube" && ytId) {
      setVideoModal(`https://www.youtube.com/embed/${ytId}?autoplay=1`);
    } else if (story.videoUrl) {
      setVideoModal(story.videoUrl);
    }
  }

  // Visible stories for the mini-previews (3 at a time on desktop)
  const getVisibleIndices = () => {
    const indices: number[] = [];
    for (let i = -1; i <= 1; i++) {
      indices.push(((current + i) % total + total) % total);
    }
    return indices;
  };

  return (
    <>
      <section
        className="py-20 sm:py-28 relative overflow-hidden"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {/* Subtle background pattern */}
        <div className="absolute inset-0 opacity-[0.015] dark:opacity-[0.03]">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`,
              backgroundSize: "32px 32px",
            }}
          />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent-100/80 dark:bg-accent-900/40 text-accent-700 dark:text-accent-300 text-sm font-medium mb-4">
              <Star className="h-3.5 w-3.5" />
              {sectionBadge}
            </div>
            <h2 className="font-heading text-3xl font-bold sm:text-4xl lg:text-5xl tracking-tight text-slate-900 dark:text-white">
              {sectionTitle}
            </h2>
            <div className="mt-3 decorative-line-center" />
            <p className="mt-6 max-w-2xl mx-auto text-lg leading-relaxed text-slate-600 dark:text-slate-400">
              {sectionSubtitle}
            </p>
          </div>

          {/* Main carousel area */}
          <div className="relative">
            {/* Large quote card */}
            <AnimatePresence mode="wait">
              <motion.div
                key={story._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="relative"
              >
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 rounded-2xl overflow-hidden bg-white dark:bg-slate-900 shadow-xl border border-slate-100 dark:border-slate-800">
                  {/* Left: Video / Visual side */}
                  <div className="relative bg-gradient-to-br from-primary-800 to-primary-950 min-h-[280px] lg:min-h-[400px] flex items-center justify-center overflow-hidden">
                    {/* Background thumbnail or gradient */}
                    {hasVideo && (story.thumbnail || ytId) ? (
                      <div className="absolute inset-0">
                        {story.thumbnail ? (
                          <img
                            src={story.thumbnail}
                            alt=""
                            className="w-full h-full object-cover opacity-40"
                          />
                        ) : ytId ? (
                          <div className="w-full h-full opacity-40">
                            <YouTubeThumbnail videoUrl={story.videoUrl} />
                          </div>
                        ) : null}
                        <div className="absolute inset-0 bg-gradient-to-t from-primary-950/80 via-primary-900/50 to-primary-800/60" />
                      </div>
                    ) : (
                      <>
                        <div className="absolute inset-0 noise-overlay opacity-30" />
                        {/* Decorative circles */}
                        <div className="absolute top-1/4 -start-16 w-64 h-64 rounded-full bg-accent-500/10 blur-3xl" />
                        <div className="absolute bottom-1/4 -end-16 w-48 h-48 rounded-full bg-primary-400/10 blur-3xl" />
                      </>
                    )}

                    <div className="relative z-10 text-center p-8">
                      {hasVideo ? (
                        <button
                          onClick={openVideo}
                          className="group relative"
                          aria-label="Play video"
                        >
                          <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center group-hover:bg-white/30 transition-all duration-300 group-hover:scale-110">
                            <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center shadow-lg">
                              <Play className="h-7 w-7 text-primary-700 ms-1" fill="currentColor" />
                            </div>
                          </div>
                          <span className="block mt-4 text-sm font-medium text-white/80 group-hover:text-white transition-colors">
                            {locale === "ar" ? "شاهد القصة" : "Watch Story"}
                          </span>
                        </button>
                      ) : (
                        <div className="flex flex-col items-center">
                          <Quote className="h-16 w-16 text-accent-400/60 mb-4" />
                          <div className="w-16 h-0.5 bg-accent-400/40 rounded-full" />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right: Text content */}
                  <div className="p-8 sm:p-10 lg:p-12 flex flex-col justify-center" dir={isRtl ? "rtl" : "ltr"}>
                    <Quote className="h-8 w-8 text-accent-400/40 mb-6 -scale-x-100" />

                    <h3 className="font-heading text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-4 leading-snug">
                      {story.title[lang] || story.title.en}
                    </h3>

                    <p className="text-base leading-relaxed text-slate-600 dark:text-slate-400 mb-8">
                      {story.excerpt[lang] || story.excerpt.en}
                    </p>

                    <div className="mt-auto flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white font-bold text-sm">
                        {(story.personName[lang] || story.personName.en).charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-900 dark:text-white">
                          {story.personName[lang] || story.personName.en}
                        </p>
                        {story.featured && (
                          <p className="text-xs text-accent-600 dark:text-accent-400 font-medium">
                            {locale === "ar" ? "قصة مميزة" : "Featured Story"}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Navigation */}
            {total > 1 && (
              <div className="flex items-center justify-between mt-8">
                {/* Prev/Next buttons */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={isRtl ? next : prev}
                    className="w-10 h-10 rounded-full bg-white dark:bg-slate-800 shadow-sm border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 hover:border-primary-300 dark:hover:border-primary-600 transition-all"
                    aria-label="Previous story"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button
                    onClick={isRtl ? prev : next}
                    className="w-10 h-10 rounded-full bg-white dark:bg-slate-800 shadow-sm border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 hover:border-primary-300 dark:hover:border-primary-600 transition-all"
                    aria-label="Next story"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </div>

                {/* Dots + counter */}
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5">
                    {stories.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setCurrent(i)}
                        className={`transition-all duration-300 rounded-full ${
                          i === current
                            ? "w-8 h-2 bg-primary-600 dark:bg-primary-400"
                            : "w-2 h-2 bg-slate-300 dark:bg-slate-600 hover:bg-slate-400 dark:hover:bg-slate-500"
                        }`}
                        aria-label={`Go to story ${i + 1}`}
                      />
                    ))}
                  </div>
                  <span className="text-xs text-slate-400 dark:text-slate-500 tabular-nums">
                    {current + 1}/{total}
                  </span>
                </div>
              </div>
            )}

            {/* Mini previews on desktop */}
            {total > 2 && (
              <div className="hidden lg:grid grid-cols-3 gap-4 mt-6">
                {getVisibleIndices().map((idx) => {
                  const s = stories[idx];
                  const isActive = idx === current;
                  return (
                    <button
                      key={`preview-${idx}`}
                      onClick={() => setCurrent(idx)}
                      className={`text-start p-4 rounded-xl border transition-all duration-300 ${
                        isActive
                          ? "bg-primary-50 dark:bg-primary-900/20 border-primary-200 dark:border-primary-800 shadow-sm"
                          : "bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700"
                      }`}
                      dir={isRtl ? "rtl" : "ltr"}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                            isActive
                              ? "bg-primary-600 text-white"
                              : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400"
                          }`}
                        >
                          {(s.personName[lang] || s.personName.en).charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p
                            className={`text-sm font-medium truncate ${
                              isActive
                                ? "text-primary-700 dark:text-primary-300"
                                : "text-slate-700 dark:text-slate-300"
                            }`}
                          >
                            {s.personName[lang] || s.personName.en}
                          </p>
                          <p className="text-xs text-slate-400 dark:text-slate-500 truncate">
                            {s.title[lang] || s.title.en}
                          </p>
                        </div>
                        {(s.type === "video" || s.type === "both") && (
                          <Play className="h-3.5 w-3.5 text-slate-400 shrink-0 ms-auto" />
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Video Modal */}
      <AnimatePresence>
        {videoModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
            onClick={() => setVideoModal(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", duration: 0.4 }}
              className="relative w-full max-w-4xl aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setVideoModal(null)}
                className="absolute -top-12 end-0 text-white/70 hover:text-white transition-colors z-10"
                aria-label="Close video"
              >
                <X className="h-8 w-8" />
              </button>
              {videoModal.includes("youtube.com") ? (
                <iframe
                  src={videoModal}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  title="Story video"
                />
              ) : (
                <video
                  src={videoModal}
                  controls
                  autoPlay
                  className="w-full h-full"
                >
                  <track kind="captions" />
                </video>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
