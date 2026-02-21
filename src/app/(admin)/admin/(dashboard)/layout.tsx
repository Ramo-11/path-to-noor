import { auth } from "@/lib/auth-config";
import { redirect } from "next/navigation";
import { DashboardShell } from "./DashboardShell";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/admin/login");
  }

  const isAdmin =
    session.user.role === "admin" || session.user.role === "super_admin";
  if (!isAdmin) {
    redirect("/admin/login");
  }

  return (
    <DashboardShell
      userName={session.user.name || "Admin"}
      userRole={session.user.role}
    >
      {children}
    </DashboardShell>
  );
}
