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
  role: string;
  isActive: boolean;
  preferredLanguage: string;
  createdAt: string;
}

const roleColors: Record<string, string> = {
  super_admin: "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400",
  admin: "bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400",
  user: "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400",
};

const columns: Column<UserRow>[] = [
  {
    key: "name",
    header: "User",
    render: (item) => (
      <div>
        <p className="font-medium text-slate-900 dark:text-white">{item.name}</p>
        <p className="text-xs text-slate-500 dark:text-slate-400">{item.email}</p>
      </div>
    ),
  },
  {
    key: "role",
    header: "Role",
    render: (item) => (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
          roleColors[item.role] || roleColors.user
        }`}
      >
        {item.role.replace("_", " ")}
      </span>
    ),
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
  const { data, pagination } = await getUsers(params);

  const serialized: UserRow[] = data.map((u) => ({
    _id: u._id.toString(),
    name: u.name,
    email: u.email,
    role: u.role,
    isActive: u.isActive,
    preferredLanguage: u.preferredLanguage,
    createdAt: u.createdAt?.toISOString?.() || String(u.createdAt),
  }));

  return (
    <div>
      <AdminPageHeader
        title="Users"
        description="Manage platform users and their roles"
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
