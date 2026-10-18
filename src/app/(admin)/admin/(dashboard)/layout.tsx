import { redirect } from "next/navigation";
import { getCurrentAdmin } from "@/lib/admin-auth";
import { DashboardShell } from "./DashboardShell";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const admin = await getCurrentAdmin();

  if (!admin) {
    redirect("/admin/login");
  }

  return (
    <DashboardShell
      userName={admin.user.name || "Admin"}
      userRole={admin.user.role}
    >
      {children}
    </DashboardShell>
  );
}
