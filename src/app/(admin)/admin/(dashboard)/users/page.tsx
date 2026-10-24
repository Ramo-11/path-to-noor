import Link from "next/link";
import { Users } from "lucide-react";
import { connectDB } from "@/db/connection";
import { User } from "@/db/models/User";
import { paginationSchema } from "@/lib/validations";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { SearchBar } from "@/components/admin/SearchBar";
import { Pagination } from "@/components/admin/Pagination";
import { PurgeUnverified } from "./PurgeUnverified";
import { DataTable, type Column } from "@/components/admin/DataTable";

interface UserRow {
  _id: string;
  name: string;
  email: string;
  userType?: string;
  track?: string;
  verified: boolean;
  isActive: boolean;
  preferredLanguage: string;
  createdAt: string;
}

const TRACK_LABELS: Record<string, string> = {
  curious: "Curious",
  new: "New to Islam",
  muslim: "Muslim",
};

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
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
      if (!item.userType) return <span className="text-xs text-slate-400">None</span>;
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
    key: "track",
    header: "Track",
    render: (item) => (
      <span className="text-sm text-slate-600 dark:text-slate-400">
        {item.track ? TRACK_LABELS[item.track] ?? "None" : "None"}
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
          !item.isActive
            ? "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400"
            : !item.verified
            ? "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400"
            : "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400"
        }`}
      >
        {!item.isActive ? "Inactive" : !item.verified ? "Unverified" : "Active"}
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
  const unverifiedOnly = rawParams.status === "unverified";
  await connectDB();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const filter: Record<string, any> = { role: "user" };
  if (unverifiedOnly) filter.$and = [{ $or: [{ emailVerified: null }, { emailVerified: { $exists: false } }] }];
  if (params.search) {
    const escaped = escapeRegex(params.search);
    filter.$or = [
      { name: { $regex: escaped, $options: "i" } },
      { email: { $regex: escaped, $options: "i" } },
    ];
  }
  const [data, total] = await Promise.all([
    User.find(filter)
      .select("-progress -bookmarks -completedTopics")
      .sort({ createdAt: -1 })
      .skip((params.page - 1) * params.limit)
      .limit(params.limit)
      .lean(),
    User.countDocuments(filter),
  ]);
  const pagination = {
    page: params.page,
    total,
    totalPages: Math.ceil(total / params.limit) || 1,
  };

  const serialized: UserRow[] = data.map((u) => ({
    _id: u._id.toString(),
    name: u.name,
    email: u.email,
    userType: u.userType,
    track: (u as { track?: string }).track,
    verified: Boolean(u.emailVerified),
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

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <SearchBar />
        <nav aria-label="Filter users" className="flex gap-2 text-sm">
          <Link
            href="/admin/users"
            aria-current={unverifiedOnly ? undefined : "page"}
            className={`px-3 py-2 rounded-lg border ${unverifiedOnly ? "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400" : "border-primary-500 text-primary-700 dark:text-primary-400 font-medium"}`}
          >
            All users
          </Link>
          <Link
            href="/admin/users?status=unverified"
            aria-current={unverifiedOnly ? "page" : undefined}
            className={`px-3 py-2 rounded-lg border ${unverifiedOnly ? "border-primary-500 text-primary-700 dark:text-primary-400 font-medium" : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400"}`}
          >
            Unverified
          </Link>
        </nav>
      </div>

      <PurgeUnverified />

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
