import Link from "next/link";
import { Layers, Pencil, Trash2 } from "lucide-react";
import { getModules } from "@/lib/data";
import { paginationSchema } from "@/lib/validations";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { SearchBar } from "@/components/admin/SearchBar";
import { Pagination } from "@/components/admin/Pagination";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { DataTable, type Column } from "@/components/admin/DataTable";
import { ModuleDeleteButton } from "./ModuleDeleteButton";

interface ModuleRow {
  _id: string;
  title: { en: string; ar: string };
  slug: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  topics: Array<{ _id: string; name: { en: string; ar: string }; slug: string } | any>;
  lessons: Array<{ lessonId: unknown; order: number }>;
  published: boolean;
  createdAt: string;
}

export default async function ModulesPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const raw = await searchParams;
  const parsed = paginationSchema.safeParse(raw);
  const params = parsed.success
    ? parsed.data
    : { page: 1, limit: 20, search: undefined, sort: undefined, order: "desc" as const };

  const { data: modules, pagination } = await getModules(params);

  // Serialize for client components
  const serialized: ModuleRow[] = modules.map((m) => ({
    _id: m._id.toString(),
    title: m.title,
    slug: m.slug,
    topics: Array.isArray(m.topics)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ? m.topics.map((t: any) =>
          typeof t === "object" && t !== null && "name" in t
            ? { _id: String(t._id), name: t.name as { en: string; ar: string }, slug: String(t.slug) }
            : { _id: String(t), name: { en: "", ar: "" }, slug: "" }
        )
      : [],
    lessons: m.lessons || [],
    published: m.published,
    createdAt: m.createdAt?.toISOString?.() || String(m.createdAt),
  }));

  const columns: Column<ModuleRow>[] = [
    {
      key: "title",
      header: "Title",
      render: (item) => (
        <div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-slate-900 dark:text-white">
              {item.title.en}
            </span>
          </div>
          <span className="text-xs text-slate-400 dark:text-slate-500" dir="rtl">
            {item.title.ar}
          </span>
        </div>
      ),
    },
    {
      key: "topics",
      header: "Topics",
      render: (item) => (
        <div className="flex flex-wrap gap-1">
          {item.topics.length === 0 ? (
            <span className="text-xs text-slate-400">None</span>
          ) : (
            item.topics.map((t) => (
              <span
                key={t._id}
                className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400"
              >
                {t.name?.en || "Unknown"}
              </span>
            ))
          )}
        </div>
      ),
    },
    {
      key: "lessons",
      header: "Lessons",
      render: (item) => (
        <span className="text-sm text-slate-600 dark:text-slate-400">
          {item.lessons.length}
        </span>
      ),
      className: "text-center",
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
            href={`/admin/modules/${item._id}`}
            className="p-1.5 rounded-lg text-slate-400 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors"
            title="Edit"
          >
            <Pencil className="h-4 w-4" />
          </Link>
          <ModuleDeleteButton id={item._id} title={item.title.en} />
        </div>
      ),
      className: "w-24",
    },
  ];

  return (
    <div>
      <AdminPageHeader
        title="Modules"
        description="Group lessons into structured learning modules"
        icon={Layers}
        createHref="/admin/modules/new"
        createLabel="Create Module"
      />

      <div className="mb-6">
        <SearchBar />
      </div>

      <DataTable columns={columns} data={serialized} keyField="_id" emptyMessage="No modules found" />

      <Pagination
        page={pagination.page}
        totalPages={pagination.totalPages}
        total={pagination.total}
      />
    </div>
  );
}
