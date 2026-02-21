"use client";

import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminTopbar } from "@/components/admin/AdminTopbar";

interface DashboardShellProps {
  children: React.ReactNode;
  userName: string;
  userRole: string;
}

export function DashboardShell({
  children,
  userName,
  userRole,
}: DashboardShellProps) {
  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950">
      <AdminSidebar userRole={userRole} />
      <div className="flex-1 flex flex-col">
        <AdminTopbar displayName={userName} role={userRole} />
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
