import { auth } from "@/lib/auth-config";
import { NextResponse } from "next/server";

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

export async function requireAdmin(): Promise<AuthResult> {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const isAdmin =
    session.user.role === "admin" || session.user.role === "super_admin";

  if (!isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  return { user: session.user };
}

export async function requireSuperAdmin(): Promise<AuthResult> {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (session.user.role !== "super_admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  return { user: session.user };
}
