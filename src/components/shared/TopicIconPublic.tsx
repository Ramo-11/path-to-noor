"use client";

import { getIconByName } from "@/components/admin/IconPicker";
import { BookOpen } from "lucide-react";

interface TopicIconPublicProps {
  name: string;
  size?: "md" | "lg";
}

export function TopicIconPublic({ name, size = "md" }: TopicIconPublicProps) {
  const Icon = getIconByName(name) || BookOpen;

  if (size === "lg") {
    return (
      <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-primary-100 dark:bg-primary-900/30 text-primary-600 shrink-0">
        <Icon className="h-7 w-7" />
      </div>
    );
  }

  return (
    <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary-100 dark:bg-primary-900/30 text-primary-600 mb-4">
      <Icon className="h-6 w-6" />
    </div>
  );
}
