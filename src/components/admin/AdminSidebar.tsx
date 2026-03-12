"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  BookOpen,
  Route,
  Library,
  GraduationCap,
  HelpCircle,
  Users,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Handshake,
  Heart,
  type LucideIcon,
} from "lucide-react";
import { useState } from "react";

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  superAdminOnly?: boolean;
}

const navItems: NavItem[] = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/topics", label: "Topics", icon: BookOpen },
  { href: "/admin/paths", label: "Learning Paths", icon: Route },
  { href: "/admin/modules", label: "Modules", icon: Library },
  { href: "/admin/lessons", label: "Lessons", icon: GraduationCap },
  { href: "/admin/quizzes", label: "Quizzes", icon: HelpCircle },
  { href: "/admin/stories", label: "Stories", icon: Heart },
  { href: "/admin/mentorship", label: "Mentorship", icon: Handshake },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/system-users", label: "System Users", icon: ShieldCheck, superAdminOnly: true },
];

interface AdminSidebarProps {
  userRole: string;
}

export function AdminSidebar({ userRole }: AdminSidebarProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  const filteredItems = navItems.filter(
    (item) => !item.superAdminOnly || userRole === "super_admin"
  );

  return (
    <aside
      className={`${
        collapsed ? "w-16" : "w-60"
      } bg-slate-900 dark:bg-slate-950 text-white flex flex-col transition-all duration-200 min-h-screen`}
    >
      <div className="p-4 flex items-center justify-between border-b border-slate-800">
        {!collapsed && (
          <Link href="/admin" className="font-bold text-lg">
            Basmet Dawah
          </Link>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </button>
      </div>

      <nav className="flex-1 py-4 space-y-1 px-2">
        {filteredItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/admin" && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                isActive
                  ? "bg-primary-600 text-white"
                  : "text-slate-300 hover:bg-slate-800 hover:text-white"
              }`}
              title={collapsed ? item.label : undefined}
            >
              <item.icon className="h-5 w-5 flex-shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      <div className="p-3 border-t border-slate-800">
        <Link
          href="/en"
          className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm text-slate-400 hover:bg-slate-800 hover:text-white transition-colors ${
            collapsed ? "justify-center" : ""
          }`}
          title={collapsed ? "View Public Site" : undefined}
        >
          <ExternalLink className="h-4 w-4 flex-shrink-0" />
          {!collapsed && <span>View Public Site</span>}
        </Link>
      </div>
    </aside>
  );
}
