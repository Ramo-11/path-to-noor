import Link from "next/link";
import { BookOpen, Pencil } from "lucide-react";
import { TopicIcon } from "@/components/admin/TopicIcon";
import { getTopics } from "@/lib/data";
import { paginationSchema } from "@/lib/validations";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { SearchBar } from "@/components/admin/SearchBar";
import { Pagination } from "@/components/admin/Pagination";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { DataTable, type Column } from "@/components/admin/DataTable";
import { TopicDeleteButton } from "./TopicDeleteButton";

interface TopicRow {
  _id: string;
  name: { en: string; ar: string; es: string };
  slug: string;
  icon: string;
  parent: { _id: string; name: { en: string; ar: string; es: string }; slug: string } | null;
  published: boolean;
  createdAt: string;
}

export default async function TopicsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const raw = await searchParams;
  const parsed = paginationSchema.safeParse(raw);
  const params = parsed.success
    ? parsed.data
    : { page: 1, limit: 20, search: undefined, sort: undefined, order: "desc" as const };

  const { data: topics, pagination } = await getTopics(params);

  // Serialize for client components
  const serialized: TopicRow[] = topics.map((t) => ({
    _id: t._id.toString(),
    name: t.name,
    slug: t.slug,
    icon: t.icon || "",
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    parent: (() => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const p = t.parent as any;
      if (p && typeof p === "object" && "name" in p) {
        return {
          _id: String(p._id),
          name: p.name as { en: string; ar: string; es: string },
          slug: String(p.slug),
        };
      }
      return null;
    })(),
    published: t.published,
    createdAt: t.createdAt?.toISOString?.() || String(t.createdAt),
  }));

  const columns: Column<TopicRow>[] = [
    {
      key: "name",
      header: "Name",
      render: (item) => (
        <div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-slate-900 dark:text-white">
              {item.name.en}
            </span>
          </div>
          <span className="text-xs text-slate-400 dark:text-slate-500" dir="rtl">
            {item.name.ar}
          </span>
        </div>
      ),
    },
    {
      key: "parent",
      header: "Parent Topic",
      render: (item) =>
        item.parent ? (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400">
            {item.parent.name.en}
          </span>
        ) : (
          <span className="text-xs text-slate-400">Root</span>
        ),
    },
    {
      key: "icon",
      header: "Icon",
      render: (item) => <TopicIcon name={item.icon} />,
    },
    {
      key: "published",
      header: "Status",
      render: (item) => <StatusBadge published={item.published} />,
    },
    {
      key: "actions",
      header: "",
      render: (item) => (
        <div className="flex items-center gap-1 justify-end">
          <Link
            href={`/admin/topics/${item._id}`}
            className="p-1.5 rounded-lg text-slate-400 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors"
            title="Edit"
          >
            <Pencil className="h-4 w-4" />
          </Link>
          <TopicDeleteButton id={item._id} name={item.name.en} />
        </div>
      ),
      className: "w-24",
    },
  ];

  return (
    <div>
      <AdminPageHeader
        title="Topics"
        description="Organize content into a hierarchical topic tree"
        icon={BookOpen}
        createHref="/admin/topics/new"
        createLabel="Create Topic"
      />

      <div className="mb-6">
        <SearchBar />
      </div>

      <DataTable columns={columns} data={serialized} keyField="_id" emptyMessage="No topics found" />

      <Pagination
        page={pagination.page}
        totalPages={pagination.totalPages}
        total={pagination.total}
      />
    </div>
  );
}
