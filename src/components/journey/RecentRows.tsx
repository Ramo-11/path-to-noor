import { Link } from "@/i18n/navigation";
import { localized, type LocalizedText } from "@/lib/stages";
import type { Translate } from "./types";

export interface RecentItem {
  slug: string;
  title: LocalizedText;
  completedAt: Date | string;
}

interface RecentRowsProps {
  items: RecentItem[];
  locale: string;
  t: Translate;
}

function formatDate(value: Date | string, locale: string) {
  const date = new Date(value);
  const localeTag = locale === "ar" ? "ar" : locale === "es" ? "es" : "en";
  return date.toLocaleDateString(localeTag, { month: "short", day: "numeric" });
}

export function RecentRows({ items, locale, t }: RecentRowsProps) {
  if (items.length === 0) {
    return <p className="text-ink-2">{t("recentEmpty")}</p>;
  }

  return (
    <div className="primer-grid grid-cols-1">
      {items.map((item) => (
        <Link
          key={item.slug}
          href={`/learn/${item.slug}`}
          className="flex items-center justify-between gap-4 px-5 py-4 transition-colors duration-150 hover:bg-wash sm:px-6"
        >
          <span className="truncate text-ink">{localized(item.title, locale)}</span>
          <span className="shrink-0 text-meta text-ink-3">{formatDate(item.completedAt, locale)}</span>
        </Link>
      ))}
    </div>
  );
}
