import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, isAdminSession } from "@/lib/admin-auth";
import { connectDB } from "@/db/connection";
import { User } from "@/db/models/User";
import { MentorRequest } from "@/db/models/MentorRequest";
import { MentorApplication } from "@/db/models/MentorApplication";
import { VERIFICATION_LAUNCH } from "../_lib/shared";

const MIN_AGE_MS = 7 * 24 * 60 * 60 * 1000;

const EMPTY = (field: string) => ({ $or: [{ [field]: { $exists: false } }, { [field]: { $size: 0 } }] });
const ABSENT = (field: string) => ({ $or: [{ [field]: { $exists: false } }, { [field]: null }] });

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function buildFilter(): Promise<Record<string, any>> {
  const [requesters, applicants] = await Promise.all([
    MentorRequest.distinct("revertId"),
    MentorApplication.distinct("userId"),
  ]);
  return {
    role: "user",
    $and: [
      ABSENT("emailVerified"),
      ABSENT("lastLoginAt"),
      ABSENT("userType"),
      ABSENT("track"),
      ABSENT("placement"),
      ABSENT("assignedMentorId"),
      EMPTY("progress"),
      EMPTY("bookmarks"),
      EMPTY("quizResults"),
      EMPTY("completedTopics"),
    ],
    createdAt: { $gte: VERIFICATION_LAUNCH, $lt: new Date(Date.now() - MIN_AGE_MS) },
    password: { $exists: true, $nin: [null, ""] },
    _id: { $nin: [...requesters, ...applicants] },
  };
}

export async function GET() {
  const auth = await requireAdmin();
  if (!isAdminSession(auth)) return auth;
  try {
    await connectDB();
    const count = await User.countDocuments(await buildFilter());
    return NextResponse.json({ count });
  } catch (error) {
    console.error("[API] GET /admin/users/purge-unverified error:", error);
    return NextResponse.json({ error: "Failed to count users" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const auth = await requireAdmin();
  if (!isAdminSession(auth)) return auth;
  try {
    const body = await request.json().catch(() => null);
    const expected = body?.expectedCount;
    if (typeof expected !== "number" || !Number.isInteger(expected) || expected < 0) {
      return NextResponse.json({ error: "expectedCount is required" }, { status: 400 });
    }
    await connectDB();
    const filter = await buildFilter();
    const count = await User.countDocuments(filter);
    if (count !== expected) {
      return NextResponse.json(
        { error: "The number of matching users changed. Please review and confirm again.", count },
        { status: 409 }
      );
    }
    const result = await User.deleteMany(filter);
    return NextResponse.json({ deleted: result.deletedCount });
  } catch (error) {
    console.error("[API] DELETE /admin/users/purge-unverified error:", error);
    return NextResponse.json({ error: "Failed to delete users" }, { status: 500 });
  }
}
