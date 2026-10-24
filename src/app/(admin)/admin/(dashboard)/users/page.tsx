import Link from "next/link";
import { Users } from "lucide-react";
import { connectDB } from "@/db/connection";
import { User } from "@/db/models/User";
import { paginationSchema } from "@/lib/validations";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { SearchBar } from "@/components/admin/SearchBar";
import { Pagination } from "@/components/admin/Pagination";
import { PurgeUnverified } from "./PurgeUnverified";
import { UsersTable } from "./UsersTable";
import { VERIFICATION_LAUNCH } from "@/app/api/admin/users/_lib/shared";
import type { UserRow } from "./types";

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

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
  if (unverifiedOnly) {
    filter.$and = [{ $or: [{ emailVerified: null }, { emailVerified: { $exists: false } }] }];
    filter.createdAt = { $gte: VERIFICATION_LAUNCH };
  }
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
    legacy: !u.emailVerified && new Date(u.createdAt).getTime() < VERIFICATION_LAUNCH.getTime(),
    isActive: u.isActive,
    preferredLanguage: u.preferredLanguage,
    createdAt: u.createdAt?.toISOString?.() || String(u.createdAt),
  }));

  return (
    <div>
      <AdminPageHeader
        title="Users"
        description="Add, edit, and remove learners"
        icon={Users}
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
            Unverified (new signups)
          </Link>
        </nav>
      </div>

      <PurgeUnverified />

      <UsersTable rows={serialized} />

      <Pagination
        page={pagination.page}
        totalPages={pagination.totalPages}
        total={pagination.total}
      />
    </div>
  );
}
