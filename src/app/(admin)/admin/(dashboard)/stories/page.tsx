import Link from "next/link";
import { Heart, Pencil, Play, FileText, Video } from "lucide-react";
import { getStories } from "@/lib/data";
import { paginationSchema } from "@/lib/validations";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { SearchBar } from "@/components/admin/SearchBar";
import { Pagination } from "@/components/admin/Pagination";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { DataTable, type Column } from "@/components/admin/DataTable";
import { StoryDeleteButton } from "./StoryDeleteButton";

interface StoryRow {
  _id: string;
  personName: { en: string; ar: string; es: string };
  title: { en: string; ar: string; es: string };
  type: "text" | "video" | "both";
  featured: boolean;
  published: boolean;
  order: number;
  createdAt: string;
}

const typeIcons = {
  text: FileText,
  video: Video,
  both: Play,
};

export default async function StoriesPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const raw = await searchParams;
  const parsed = paginationSchema.safeParse(raw);
  const params = parsed.success
    ? parsed.data
    : { page: 1, limit: 20, search: undefined, sort: undefined, order: "desc" as const };

  const { data: stories, pagination } = await getStories(params);

  const serialized: StoryRow[] = stories.map((s) => ({
    _id: s._id.toString(),
    personName: s.personName,
    title: s.title,
    type: s.type,
    featured: s.featured,
    published: s.published,
    order: s.order,
    createdAt: s.createdAt?.toISOString?.() || String(s.createdAt),
  }));

  const columns: Column<StoryRow>[] = [
    {
      key: "title",
      header: "Story",
      render: (item) => (
        <div>
          <span className="text-sm font-medium text-slate-900 dark:text-white">
            {item.title.en}
          </span>
          <div className="text-xs text-slate-400 dark:text-slate-500">
            by {item.personName.en}
          </div>
        </div>
      ),
    },
    {
      key: "type",
      header: "Type",
      render: (item) => {
        const Icon = typeIcons[item.type];
        return (
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
            <Icon className="h-3.5 w-3.5" />
            {item.type === "both" ? "Text & Video" : item.type === "video" ? "Video" : "Text"}
          </div>
        );
      },
    },
    {
      key: "featured",
      header: "Featured",
      render: (item) =>
        item.featured ? (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-accent-100 dark:bg-accent-900/20 text-accent-700 dark:text-accent-400">
            <Heart className="h-3 w-3 fill-current" />
            Featured
          </span>
        ) : (
          <span className="text-xs text-slate-400">—</span>
        ),
    },
    {
      key: "order",
      header: "Order",
      render: (item) => (
        <span className="text-sm text-slate-600 dark:text-slate-400">{item.order}</span>
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
      render: (item) => (
        <div className="flex items-center gap-1 justify-end">
          <Link
            href={`/admin/stories/${item._id}`}
            className="p-1.5 rounded-lg text-slate-400 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors"
            title="Edit"
          >
            <Pencil className="h-4 w-4" />
          </Link>
          <StoryDeleteButton id={item._id} name={item.title.en} />
        </div>
      ),
      className: "w-24",
    },
  ];

  return (
    <div>
      <AdminPageHeader
        title="Stories"
        description="Manage revert stories and shahada videos"
        icon={Heart}
        createHref="/admin/stories/new"
        createLabel="Add Story"
      />

      <div className="mb-6">
        <SearchBar />
      </div>

      <DataTable columns={columns} data={serialized} keyField="_id" emptyMessage="No stories found" />

      <Pagination
        page={pagination.page}
        totalPages={pagination.totalPages}
        total={pagination.total}
      />
    </div>
  );
}
