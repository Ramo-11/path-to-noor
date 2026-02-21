"use client";

import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";
import { ThemeToggle } from "@/components/layout/ThemeToggle";

interface AdminTopbarProps {
  displayName: string;
  role: string;
}

export function AdminTopbar({ displayName, role }: AdminTopbarProps) {
  return (
    <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-6">
      <div />

      <div className="flex items-center gap-4">
        <ThemeToggle />

        <div className="flex items-center gap-3 ps-3 border-s border-slate-200 dark:border-slate-700">
          <div className="text-right">
            <p className="text-sm font-medium text-slate-900 dark:text-white">
              {displayName}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 capitalize">
              {role.replace("_", " ")}
            </p>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/admin/login" })}
            className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-600 dark:text-slate-400"
            aria-label="Sign out"
          >
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      </div>
    </header>
  );
}
