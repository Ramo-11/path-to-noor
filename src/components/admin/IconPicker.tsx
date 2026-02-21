"use client";

import { useState, useRef, useEffect } from "react";
import {
  BookOpen,
  Book,
  GraduationCap,
  Star,
  Heart,
  Moon,
  Sun,
  Lightbulb,
  Users,
  Globe,
  MessageCircle,
  Compass,
  Map,
  Landmark,
  Scroll,
  PenTool,
  Sparkles,
  Shield,
  Award,
  Target,
  Feather,
  Scale,
  Layers,
  FileText,
  Video,
  Headphones,
  Clock,
  Calendar,
  Flame,
  HandHeart,
  Eye,
  Leaf,
  Mountain,
  type LucideIcon,
  ChevronDown,
  Search,
  X,
} from "lucide-react";

export const ICON_OPTIONS: { name: string; icon: LucideIcon; label: string }[] = [
  { name: "BookOpen", icon: BookOpen, label: "Book Open" },
  { name: "Book", icon: Book, label: "Book" },
  { name: "GraduationCap", icon: GraduationCap, label: "Graduation Cap" },
  { name: "Scroll", icon: Scroll, label: "Scroll" },
  { name: "Feather", icon: Feather, label: "Feather / Pen" },
  { name: "PenTool", icon: PenTool, label: "Pen Tool" },
  { name: "FileText", icon: FileText, label: "Document" },
  { name: "Moon", icon: Moon, label: "Moon" },
  { name: "Sun", icon: Sun, label: "Sun" },
  { name: "Star", icon: Star, label: "Star" },
  { name: "Sparkles", icon: Sparkles, label: "Sparkles" },
  { name: "Flame", icon: Flame, label: "Flame" },
  { name: "Heart", icon: Heart, label: "Heart" },
  { name: "HandHeart", icon: HandHeart, label: "Charity / Giving" },
  { name: "Lightbulb", icon: Lightbulb, label: "Lightbulb" },
  { name: "Eye", icon: Eye, label: "Eye / Insight" },
  { name: "Compass", icon: Compass, label: "Compass / Guidance" },
  { name: "Map", icon: Map, label: "Map / Journey" },
  { name: "Globe", icon: Globe, label: "Globe / World" },
  { name: "Mountain", icon: Mountain, label: "Mountain" },
  { name: "Leaf", icon: Leaf, label: "Leaf / Growth" },
  { name: "Landmark", icon: Landmark, label: "Landmark / Mosque" },
  { name: "Scale", icon: Scale, label: "Scale / Justice" },
  { name: "Shield", icon: Shield, label: "Shield" },
  { name: "Users", icon: Users, label: "Community" },
  { name: "MessageCircle", icon: MessageCircle, label: "Discussion" },
  { name: "Layers", icon: Layers, label: "Layers / Levels" },
  { name: "Target", icon: Target, label: "Target / Goals" },
  { name: "Award", icon: Award, label: "Award" },
  { name: "Video", icon: Video, label: "Video" },
  { name: "Headphones", icon: Headphones, label: "Audio" },
  { name: "Clock", icon: Clock, label: "Clock / History" },
  { name: "Calendar", icon: Calendar, label: "Calendar" },
];

/** Map icon name string to its Lucide component */
export function getIconByName(name: string): LucideIcon | null {
  const found = ICON_OPTIONS.find((o) => o.name === name);
  return found?.icon || null;
}

interface IconPickerProps {
  value: string;
  onChange: (value: string) => void;
}

export function IconPicker({ value, onChange }: IconPickerProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  // Close on click outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [open]);

  // Focus search when opened
  useEffect(() => {
    if (open && searchRef.current) {
      searchRef.current.focus();
    }
  }, [open]);

  const filtered = search
    ? ICON_OPTIONS.filter(
        (o) =>
          o.label.toLowerCase().includes(search.toLowerCase()) ||
          o.name.toLowerCase().includes(search.toLowerCase())
      )
    : ICON_OPTIONS;

  const SelectedIcon = value ? getIconByName(value) : null;

  return (
    <div ref={containerRef} className="relative">
      {/* Trigger button */}
      <button
        type="button"
        onClick={() => {
          setOpen(!open);
          setSearch("");
        }}
        className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-colors text-sm"
      >
        <span className="flex items-center gap-2.5">
          {SelectedIcon ? (
            <>
              <span className="inline-flex items-center justify-center w-7 h-7 rounded-md bg-primary-50 dark:bg-primary-900/30 text-primary-600">
                <SelectedIcon className="h-4 w-4" />
              </span>
              <span>{ICON_OPTIONS.find((o) => o.name === value)?.label || value}</span>
            </>
          ) : (
            <span className="text-slate-400 dark:text-slate-500">No icon</span>
          )}
        </span>
        <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute z-50 mt-1 w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg max-h-72 flex flex-col">
          {/* Search */}
          <div className="p-2 border-b border-slate-100 dark:border-slate-700">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
              <input
                ref={searchRef}
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search icons..."
                className="w-full pl-8 pr-3 py-1.5 text-sm rounded-md border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:ring-1 focus:ring-primary-500"
              />
            </div>
          </div>

          {/* Options list */}
          <div className="overflow-y-auto flex-1 p-1">
            {/* None option */}
            <button
              type="button"
              onClick={() => {
                onChange("");
                setOpen(false);
              }}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-sm transition-colors ${
                !value
                  ? "bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700"
              }`}
            >
              <span className="inline-flex items-center justify-center w-7 h-7 rounded-md bg-slate-100 dark:bg-slate-700 text-slate-400">
                <X className="h-4 w-4" />
              </span>
              <span>No icon</span>
            </button>

            {filtered.map((option) => {
              const Icon = option.icon;
              const isSelected = value === option.name;
              return (
                <button
                  key={option.name}
                  type="button"
                  onClick={() => {
                    onChange(option.name);
                    setOpen(false);
                  }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-sm transition-colors ${
                    isSelected
                      ? "bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300"
                      : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
                  }`}
                >
                  <span
                    className={`inline-flex items-center justify-center w-7 h-7 rounded-md ${
                      isSelected
                        ? "bg-primary-100 dark:bg-primary-900/30 text-primary-600"
                        : "bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                  </span>
                  <span>{option.label}</span>
                </button>
              );
            })}

            {filtered.length === 0 && (
              <p className="text-center text-sm text-slate-400 dark:text-slate-500 py-4">
                No icons found
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
