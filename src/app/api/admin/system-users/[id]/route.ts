import { NextRequest, NextResponse } from "next/server";
import { requireSuperAdmin, isAdminSession } from "@/lib/admin-auth";
import { connectDB } from "@/db/connection";
import { User } from "@/db/models/User";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireSuperAdmin();
  if (!isAdminSession(auth)) return auth;

  const { id } = await params;

  try {
    const body = await request.json();
    const { name, role, isActive } = body;

    if (role && !["admin", "super_admin"].includes(role)) {
      return NextResponse.json(
        { error: "Role must be admin or super_admin" },
        { status: 400 }
      );
    }

    // Prevent super admin from changing their own role
    if (role && id === auth.user.id) {
      return NextResponse.json(
        { error: "You cannot change your own role" },
        { status: 400 }
      );
    }

    // Prevent deactivating yourself
    if (isActive === false && id === auth.user.id) {
      return NextResponse.json(
        { error: "You cannot deactivate your own account" },
        { status: 400 }
      );
    }

    await connectDB();

    const user = await User.findById(id);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (!["admin", "super_admin"].includes(user.role)) {
      return NextResponse.json(
        { error: "This user is not a system user" },
        { status: 400 }
      );
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const update: Record<string, any> = {};
    if (name !== undefined) update.name = name.trim();
    if (role !== undefined) update.role = role;
    if (isActive !== undefined) update.isActive = isActive;

    const updated = await User.findByIdAndUpdate(
      id,
      { $set: update },
      { new: true, runValidators: true }
    ).select("-progress -bookmarks -password");

    return NextResponse.json({
      data: updated,
      message: "System user updated successfully",
    });
  } catch (error) {
    console.error(`[API] PUT /admin/system-users/${id} error:`, error);
    return NextResponse.json(
      { error: "Failed to update system user" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireSuperAdmin();
  if (!isAdminSession(auth)) return auth;

  const { id } = await params;

  try {
    // Prevent deleting yourself
    if (id === auth.user.id) {
      return NextResponse.json(
        { error: "You cannot delete your own account" },
        { status: 400 }
      );
    }

    await connectDB();

    const user = await User.findById(id);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (!["admin", "super_admin"].includes(user.role)) {
      return NextResponse.json(
        { error: "This user is not a system user" },
        { status: 400 }
      );
    }

    await User.findByIdAndDelete(id);

    return NextResponse.json({ message: "System user deleted successfully" });
  } catch (error) {
    console.error(`[API] DELETE /admin/system-users/${id} error:`, error);
    return NextResponse.json(
      { error: "Failed to delete system user" },
      { status: 500 }
    );
  }
}
