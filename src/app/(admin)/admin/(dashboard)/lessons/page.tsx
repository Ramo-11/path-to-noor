import Link from "next/link";
import { FileText, Pencil } from "lucide-react";
import { getLessons } from "@/lib/data";
import { paginationSchema } from "@/lib/validations";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { SearchBar } from "@/components/admin/SearchBar";
import { Pagination } from "@/components/admin/Pagination";
import { DataTable, type Column } from "@/components/admin/DataTable";
import { LessonDeleteButton } from "./LessonDeleteButton";

interface LessonRow {
  _id: string;
  titleEn: string;
  titleAr: string;
  estimatedMinutes: number;
  published: boolean;
}

const columns: Column<LessonRow>[] = [
  {
    key: "title",
    header: "Title",
    render: (item) => (
      <div>
        <p className="font-medium text-slate-900 dark:text-white">{item.titleEn}</p>
        <p className="text-xs text-slate-500 dark:text-slate-400" dir="rtl">{item.titleAr}</p>
      </div>
    ),
  },
  {
    key: "duration",
    header: "Duration",
    render: (item) => (
      <span className="text-slate-600 dark:text-slate-400">{item.estimatedMinutes} min</span>
    ),
  },
  {
    key: "status",
    header: "Status",
    render: (item) => (
      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
        item.published
          ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400"
          : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
      }`}>
        {item.published ? "Published" : "Draft"}
      </span>
    ),
  },
  {
    key: "actions",
    header: "",
    className: "text-right",
    render: (item) => (
      <div className="flex items-center justify-end gap-2">
        <Link
          href={`/admin/lessons/${item._id}`}
          className="p-1.5 rounded-lg text-slate-500 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors"
          title="Edit"
        >
          <Pencil className="h-4 w-4" />
        </Link>
        <LessonDeleteButton id={item._id} />
      </div>
    ),
  },
];

export default async function LessonsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const rawParams = await searchParams;
  const params = paginationSchema.parse(rawParams);
  const { data, pagination } = await getLessons(params);

  const serialized: LessonRow[] = data.map((l) => ({
    _id: (l as any)._id.toString(),
    titleEn: (l as any).title?.en || "",
    titleAr: (l as any).title?.ar || "",
    estimatedMinutes: (l as any).estimatedMinutes || 0,
    published: (l as any).published || false,
  }));

  return (
    <div>
      <AdminPageHeader
        title="Lessons"
        description="Create and manage lesson content"
        icon={FileText}
        createHref="/admin/lessons/new"
        createLabel="Create Lesson"
      />

      <div className="mb-4">
        <SearchBar />
      </div>

      <DataTable
        columns={columns}
        data={serialized}
        keyField="_id"
        emptyMessage="No lessons found"
      />

      <Pagination
        page={pagination.page}
        totalPages={pagination.totalPages}
        total={pagination.total}
      />
    </div>
  );
}
