import { NextRequest, NextResponse } from "next/server";
import { requireSuperAdmin, requireAdmin, isAdminSession } from "@/lib/admin-auth";
import { connectDB } from "@/db/connection";
import { User } from "@/db/models/User";
import bcrypt from "bcrypt";
import { updateUserSchema, adminCreateUserSchema } from "@/lib/validations";
import { issueSetPasswordLink } from "./_lib/shared";

export async function GET(request: NextRequest) {
  const auth = await requireAdmin();
  if (!isAdminSession(auth)) return auth;

  try {
    const { searchParams } = new URL(request.url);
    const roleFilter = searchParams.get("roleFilter");

    await connectDB();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const filter: Record<string, any> = {};

    if (roleFilter === "admins_only") {
      // Only super_admin can list system users
      if (auth.user.role !== "super_admin") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
      filter.role = { $in: ["admin", "super_admin"] };
    } else {
      filter.role = "user";
    }

    const users = await User.find(filter)
      .select("-progress -bookmarks -password")
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ data: users });
  } catch (error) {
    console.error("[API] GET /admin/users error:", error);
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    );
  }
}

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

export async function POST(request: NextRequest) {
  const auth = await requireAdmin();
  if (!isAdminSession(auth)) return auth;

  try {
    const parsed = adminCreateUserSchema.safeParse(await request.json().catch(() => null));
    if (!parsed.success) {
      const issue = parsed.error.issues[0];
      return NextResponse.json(
        { error: issue?.message || "Please check the details and try again" },
        { status: 400 }
      );
    }
    const input = parsed.data;

    await connectDB();
    const existing = await User.exists({ email: input.email });
    if (existing) {
      return NextResponse.json(
        { error: "A user with this email already exists" },
        { status: 409 }
      );
    }

    const doc: Record<string, unknown> = {
      name: input.name,
      email: input.email,
      role: "user",
      isActive: true,
      preferredLanguage: input.preferredLanguage,
    };
    if (input.userType) doc.userType = input.userType;
    if (input.track) doc.track = input.track;
    if (input.mode === "password") {
      doc.password = await bcrypt.hash(input.password as string, 12);
      doc.emailVerified = new Date();
    }

    let created;
    try {
      created = await User.create(doc);
    } catch (error) {
      if ((error as { code?: number }).code === 11000) {
        return NextResponse.json(
          { error: "A user with this email already exists" },
          { status: 409 }
        );
      }
      throw error;
    }

    let emailSent = true;
    if (input.mode === "invite") {
      try {
        await issueSetPasswordLink(
          created._id.toString(),
          input.email,
          input.name,
          input.preferredLanguage,
          "invite"
        );
      } catch (error) {
        console.error("[API] invitation email failed:", error);
        emailSent = false;
      }
    }

    return NextResponse.json(
      { data: { _id: created._id.toString() }, emailSent },
      { status: 201 }
    );
  } catch (error) {
    console.error("[API] POST /admin/users error:", error);
    return NextResponse.json({ error: "Failed to create user" }, { status: 500 });
  }
}
