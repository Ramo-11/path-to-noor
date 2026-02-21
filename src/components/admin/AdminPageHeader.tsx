import Link from "next/link";
import { Plus, type LucideIcon } from "lucide-react";

interface AdminPageHeaderProps {
  title: string;
  description: string;
  icon: LucideIcon;
  createHref: string;
  createLabel: string;
}

export function AdminPageHeader({
  title,
  description,
  icon: Icon,
  createHref,
  createLabel,
}: AdminPageHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-8">
      <div className="flex items-center gap-3">
        <div className="p-2.5 rounded-xl bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400">
          <Icon className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            {title}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {description}
          </p>
        </div>
      </div>
      <Link
        href={createHref}
        className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors"
      >
        <Plus className="h-4 w-4" />
        {createLabel}
      </Link>
    </div>
  );
}
