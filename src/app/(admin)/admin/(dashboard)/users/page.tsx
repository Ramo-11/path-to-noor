import Link from "next/link";
import { Users } from "lucide-react";
import { getUsers } from "@/lib/data";
import { paginationSchema } from "@/lib/validations";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { SearchBar } from "@/components/admin/SearchBar";
import { Pagination } from "@/components/admin/Pagination";
import { DataTable, type Column } from "@/components/admin/DataTable";

interface UserRow {
  _id: string;
  name: string;
  email: string;
  userType?: string;
  isActive: boolean;
  preferredLanguage: string;
  createdAt: string;
}

const columns: Column<UserRow>[] = [
  {
    key: "name",
    header: "User",
    render: (item) => (
      <Link href={`/admin/users/${item._id}`} className="block group">
        <p className="font-medium text-slate-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
          {item.name}
        </p>
        <p className="text-xs text-slate-500 dark:text-slate-400">{item.email}</p>
      </Link>
    ),
  },
  {
    key: "userType",
    header: "Type",
    render: (item) => {
      if (!item.userType) return <span className="text-xs text-slate-400">—</span>;
      const colors = item.userType === "revert"
        ? "bg-sky-100 dark:bg-sky-900/30 text-sky-700 dark:text-sky-400"
        : "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400";
      return (
        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium capitalize ${colors}`}>
          {item.userType === "revert" ? "New Muslim" : "Mentor"}
        </span>
      );
    },
  },
  {
    key: "language",
    header: "Language",
    render: (item) => (
      <span className="text-sm text-slate-600 dark:text-slate-400 uppercase">
        {item.preferredLanguage}
      </span>
    ),
  },
  {
    key: "status",
    header: "Status",
    render: (item) => (
      <span
        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
          item.isActive
            ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400"
            : "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400"
        }`}
      >
        {item.isActive ? "Active" : "Inactive"}
      </span>
    ),
  },
  {
    key: "createdAt",
    header: "Joined",
    render: (item) => (
      <span className="text-sm text-slate-500 dark:text-slate-400">
        {new Date(item.createdAt).toLocaleDateString()}
      </span>
    ),
  },
];

export default async function UsersPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const rawParams = await searchParams;
  const params = paginationSchema.parse(rawParams);
  const { data, pagination } = await getUsers(params, "users_only");

  const serialized: UserRow[] = data.map((u) => ({
    _id: u._id.toString(),
    name: u.name,
    email: u.email,
    userType: (u as any).userType,
    isActive: u.isActive,
    preferredLanguage: u.preferredLanguage,
    createdAt: u.createdAt?.toISOString?.() || String(u.createdAt),
  }));

  return (
    <div>
      <AdminPageHeader
        title="Users"
        description="Platform users and their activity"
        icon={Users}
        createHref=""
        createLabel=""
      />

      <div className="mb-4">
        <SearchBar />
      </div>

      <DataTable
        columns={columns}
        data={serialized}
        keyField="_id"
        emptyMessage="No users found"
      />

      <Pagination
        page={pagination.page}
        totalPages={pagination.totalPages}
        total={pagination.total}
      />
    </div>
  );
}
