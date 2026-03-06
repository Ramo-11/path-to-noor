import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, isAdminSession } from "@/lib/admin-auth";
import { getAdminUserDetail } from "@/lib/data";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin();
  if (!isAdminSession(auth)) return auth;

  try {
    const { id } = await params;
    const result = await getAdminUserDetail(id);

    if (!result) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ data: result });
  } catch (error) {
    console.error("[API] GET /admin/users/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to fetch user details" },
      { status: 500 }
    );
  }
}
