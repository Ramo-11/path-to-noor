import { Link } from "@/i18n/navigation";
import { localized, type LocalizedText } from "@/lib/stages";
import { LocalDate } from "./LocalDate";
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

export function RecentRows({ items, locale, t }: RecentRowsProps) {
  if (items.length === 0) {
    return <p className="text-ink-2">{t("recentEmpty")}</p>;
  }

  return (
    <div className="card divide-y divide-rule overflow-hidden">
      {items.map((item) => (
        <Link
          key={item.slug}
          href={`/learn/${item.slug}`}
          className="flex items-center justify-between gap-4 px-5 py-4 transition-colors duration-150 hover:bg-wash sm:px-6"
        >
          <span className="truncate text-ink">{localized(item.title, locale)}</span>
          <LocalDate
            value={new Date(item.completedAt).toISOString()}
            locale={locale}
            className="shrink-0 text-meta text-ink-3 tabular"
          />
        </Link>
      ))}
    </div>
  );
}
