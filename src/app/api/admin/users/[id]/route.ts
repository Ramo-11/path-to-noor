import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, isAdminSession } from "@/lib/admin-auth";
import { getAdminUserDetail } from "@/lib/data";
import { connectDB } from "@/db/connection";
import { User } from "@/db/models/User";
import { MentorRequest } from "@/db/models/MentorRequest";
import { MentorApplication } from "@/db/models/MentorApplication";
import { adminUpdateUserSchema } from "@/lib/validations";
import { deleteLearners, isValidId } from "../_lib/shared";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, { params }: Ctx) {
  const auth = await requireAdmin();
  if (!isAdminSession(auth)) return auth;

  try {
    const { id } = await params;
    if (!isValidId(id)) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    const result = await getAdminUserDetail(id);

    if (!result) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const [mentorRequest, mentorApplication] = await Promise.all([
      MentorRequest.findOne({ revertId: id })
        .sort({ createdAt: -1 })
        .select("status mentorId createdAt")
        .populate({ path: "mentorId", select: "name email" })
        .lean(),
      MentorApplication.findOne({ userId: id })
        .sort({ createdAt: -1 })
        .select("status createdAt")
        .lean(),
    ]);

    return NextResponse.json({
      data: {
        ...result,
        mentorRequest: mentorRequest ? JSON.parse(JSON.stringify(mentorRequest)) : null,
        mentorApplication: mentorApplication ? JSON.parse(JSON.stringify(mentorApplication)) : null,
      },
    });
  } catch (error) {
    console.error("[API] GET /admin/users/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to fetch user details" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest, { params }: Ctx) {
  const auth = await requireAdmin();
  if (!isAdminSession(auth)) return auth;

  try {
    const { id } = await params;
    if (!isValidId(id)) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    const parsed = adminUpdateUserSchema.safeParse(await request.json().catch(() => null));
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Please check the details and try again" },
        { status: 400 }
      );
    }
    const input = parsed.data;

    await connectDB();
    const user = await User.findOne({ _id: id, role: "user" }).select("email emailVerified");
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const set: Record<string, unknown> = {};
    const unset: Record<string, 1> = {};

    if (input.name !== undefined) set.name = input.name;
    if (input.preferredLanguage !== undefined) set.preferredLanguage = input.preferredLanguage;
    if (input.isActive !== undefined) set.isActive = input.isActive;
    if (input.userType !== undefined) {
      if (input.userType === null) unset.userType = 1;
      else set.userType = input.userType;
    }
    if (input.track !== undefined) {
      if (input.track === null) unset.track = 1;
      else set.track = input.track;
    }

    const emailChanged = input.email !== undefined && input.email !== user.email;
    if (emailChanged) {
      const taken = await User.exists({ email: input.email, _id: { $ne: user._id } });
      if (taken) {
        return NextResponse.json(
          { error: "Another user already has this email" },
          { status: 409 }
        );
      }
      set.email = input.email;
      unset.emailVerifyToken = 1;
      unset.emailVerifyExpiry = 1;
      unset.resetToken = 1;
      unset.resetTokenExpiry = 1;
      set.emailVerified = input.emailVerified === true ? new Date() : null;
    } else if (input.emailVerified !== undefined) {
      if (input.emailVerified && !user.emailVerified) set.emailVerified = new Date();
      if (!input.emailVerified) set.emailVerified = null;
    }

    const update: Record<string, unknown> = {};
    if (Object.keys(set).length) update.$set = set;
    if (Object.keys(unset).length) update.$unset = unset;
    if (!Object.keys(update).length) {
      return NextResponse.json({ message: "Nothing to update" });
    }

    try {
      await User.updateOne({ _id: user._id }, update, { runValidators: true });
    } catch (error) {
      if ((error as { code?: number }).code === 11000) {
        return NextResponse.json(
          { error: "Another user already has this email" },
          { status: 409 }
        );
      }
      throw error;
    }

    return NextResponse.json({ message: "User updated" });
  } catch (error) {
    console.error("[API] PATCH /admin/users/[id] error:", error);
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, { params }: Ctx) {
  const auth = await requireAdmin();
  if (!isAdminSession(auth)) return auth;

  try {
    const { id } = await params;
    if (!isValidId(id)) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    await connectDB();
    const deleted = await deleteLearners([id]);
    if (deleted === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    return NextResponse.json({ deleted });
  } catch (error) {
    console.error("[API] DELETE /admin/users/[id] error:", error);
    return NextResponse.json({ error: "Failed to delete user" }, { status: 500 });
  }
}
