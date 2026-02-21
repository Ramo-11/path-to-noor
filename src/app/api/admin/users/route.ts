import { NextRequest, NextResponse } from "next/server";
import { requireSuperAdmin, isAdminSession } from "@/lib/admin-auth";
import { connectDB } from "@/db/connection";
import { User } from "@/db/models/User";
import { updateUserSchema } from "@/lib/validations";

export async function PUT(request: NextRequest) {
  const auth = await requireSuperAdmin();
  if (!isAdminSession(auth)) return auth;

  try {
    const body = await request.json();
    const { userId, ...updateData } = body;

    if (!userId) {
      return NextResponse.json(
        { error: "userId is required" },
        { status: 400 }
      );
    }

    const result = updateUserSchema.safeParse(updateData);
    if (!result.success) {
      return NextResponse.json(
        { error: "Validation failed", details: result.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    // Prevent super admin from changing their own role
    if (result.data.role && userId === auth.user.id) {
      return NextResponse.json(
        { error: "You cannot change your own role" },
        { status: 400 }
      );
    }

    await connectDB();

    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const updated = await User.findByIdAndUpdate(
      userId,
      { $set: result.data },
      { new: true, runValidators: true }
    ).select("-progress -bookmarks");

    return NextResponse.json({
      data: updated,
      message: "User updated successfully",
    });
  } catch (error) {
    console.error("[API] PUT /admin/users error:", error);
    return NextResponse.json(
      { error: "Failed to update user" },
      { status: 500 }
    );
  }
}
