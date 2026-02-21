import Link from "next/link";
import { Route, Pencil, Trash2 } from "lucide-react";
import { getLearningPaths } from "@/lib/data";
import { paginationSchema } from "@/lib/validations";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { SearchBar } from "@/components/admin/SearchBar";
import { Pagination } from "@/components/admin/Pagination";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { DataTable, type Column } from "@/components/admin/DataTable";
import { PathDeleteButton } from "./PathDeleteButton";

interface SerializedPath {
  _id: string;
  title: { en: string; ar: string };
  slug: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  estimatedHours: number;
  modules: Array<{ moduleId: string; order: number }>;
  published: boolean;
}

const difficultyColors: Record<string, string> = {
  beginner:
    "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400",
  intermediate:
    "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400",
  advanced:
    "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400",
};

const columns: Column<SerializedPath>[] = [
  {
    key: "title",
    header: "Title",
    render: (item) => (
      <div>
        <p className="font-medium text-slate-900 dark:text-white">
          {item.title.en}
        </p>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5" dir="rtl">
          {item.title.ar}
        </p>
      </div>
    ),
  },
  {
    key: "difficulty",
    header: "Difficulty",
    render: (item) => (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
          difficultyColors[item.difficulty] || ""
        }`}
      >
        {item.difficulty}
      </span>
    ),
  },
  {
    key: "modules",
    header: "Modules",
    render: (item) => (
      <span className="text-slate-600 dark:text-slate-400">
        {item.modules.length}
      </span>
    ),
  },
  {
    key: "estimatedHours",
    header: "Hours",
    render: (item) => (
      <span className="text-slate-600 dark:text-slate-400">
        {item.estimatedHours}h
      </span>
    ),
  },
  {
    key: "published",
    header: "Status",
    render: (item) => <StatusBadge published={item.published} />,
  },
  {
    key: "actions",
    header: "",
    className: "text-right",
    render: (item) => (
      <div className="flex items-center justify-end gap-2">
        <Link
          href={`/admin/paths/${item._id}`}
          className="p-1.5 rounded-lg text-slate-500 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors"
          title="Edit"
        >
          <Pencil className="h-4 w-4" />
        </Link>
        <PathDeleteButton id={item._id} title={item.title.en} />
      </div>
    ),
  },
];

export default async function PathsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const rawParams = await searchParams;
  const params = paginationSchema.parse(rawParams);
  const { data, pagination } = await getLearningPaths(params);

  // Serialize for client components
  const serialized: SerializedPath[] = data.map((path) => ({
    _id: path._id.toString(),
    title: path.title,
    slug: path.slug,
    difficulty: path.difficulty,
    estimatedHours: path.estimatedHours,
    modules: path.modules.map((m) => ({
      moduleId: m.moduleId.toString(),
      order: m.order,
    })),
    published: path.published,
  }));

  return (
    <div>
      <AdminPageHeader
        title="Learning Paths"
        description="Curated sequences of modules for structured learning"
        icon={Route}
        createHref="/admin/paths/new"
        createLabel="Create Path"
      />

      <div className="mb-4">
        <SearchBar />
      </div>

      <DataTable
        columns={columns}
        data={serialized}
        keyField="_id"
        emptyMessage="No learning paths found"
      />

      <Pagination
        page={pagination.page}
        totalPages={pagination.totalPages}
        total={pagination.total}
      />
    </div>
  );
}
