"use client";

import { getIconByName } from "@/components/admin/IconPicker";

interface TopicIconProps {
  name: string;
}

export function TopicIcon({ name }: TopicIconProps) {
  const Icon = getIconByName(name);

  if (!Icon) {
    return <span className="text-xs text-slate-400">—</span>;
  }

  return (
    <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-primary-50 dark:bg-primary-900/20 text-primary-600">
      <Icon className="h-4 w-4" />
    </span>
  );
}
