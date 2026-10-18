import { auth } from "@/lib/auth-config";
import { NextResponse } from "next/server";
import { connectDB } from "@/db/connection";
import { User } from "@/db/models/User";

interface AdminSession {
  user: {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
    role: string;
    preferredLanguage: string;
  };
}

type AuthResult = AdminSession | NextResponse;

export function isAdminSession(result: AuthResult): result is AdminSession {
  return !(result instanceof NextResponse);
}

export async function getCurrentAdmin(requireSuper = false): Promise<AdminSession | null> {
  const session = await auth();
  if (!session?.user?.id) return null;

  await connectDB();
  const dbUser = await User.findById(session.user.id).select("role isActive").lean();
  if (!dbUser || !dbUser.isActive) return null;

  const allowed = requireSuper
    ? dbUser.role === "super_admin"
    : dbUser.role === "admin" || dbUser.role === "super_admin";
  if (!allowed) return null;

  return { user: { ...session.user, role: dbUser.role } };
}

async function guard(requireSuper: boolean): Promise<AuthResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = await getCurrentAdmin(requireSuper);
  if (!admin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  return admin;
}

export async function requireAdmin(): Promise<AuthResult> {
  return guard(false);
}

export async function requireSuperAdmin(): Promise<AuthResult> {
  return guard(true);
}
