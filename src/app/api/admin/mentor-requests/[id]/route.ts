import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, isAdminSession } from "@/lib/admin-auth";
import { connectDB } from "@/db/connection";
import { MentorRequest } from "@/db/models/MentorRequest";
import { User } from "@/db/models/User";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin();
  if (!isAdminSession(auth)) return auth;

  try {
    const { id } = await params;
    const body = await request.json();
    const { mentorId, status, adminNote } = body;

    await connectDB();

    const mentorRequest = await MentorRequest.findById(id);
    if (!mentorRequest) {
      return NextResponse.json(
        { error: "Mentor request not found" },
        { status: 404 }
      );
    }

    if (mentorId !== undefined) mentorRequest.mentorId = mentorId;
    if (status !== undefined) mentorRequest.status = status;
    if (adminNote !== undefined) mentorRequest.adminNote = adminNote;

    await mentorRequest.save();

    if (status === "assigned" && mentorId) {
      await User.findByIdAndUpdate(mentorRequest.revertId, {
        assignedMentorId: mentorId,
      });
    }

    if (status === "rejected") {
      await User.findByIdAndUpdate(mentorRequest.revertId, {
        $unset: { assignedMentorId: 1 },
      });
    }

    return NextResponse.json({
      data: mentorRequest,
      message: "Mentor request updated",
    });
  } catch (error) {
    console.error("[API] PUT /admin/mentor-requests/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to update mentor request" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin();
  if (!isAdminSession(auth)) return auth;

  try {
    const { id } = await params;

    await connectDB();

    const mentorRequest = await MentorRequest.findById(id);
    if (!mentorRequest) {
      return NextResponse.json(
        { error: "Mentor request not found" },
        { status: 404 }
      );
    }

    if (mentorRequest.mentorId) {
      await User.findByIdAndUpdate(mentorRequest.revertId, {
        $unset: { assignedMentorId: 1 },
      });
    }

    await MentorRequest.findByIdAndDelete(id);

    return NextResponse.json({ message: "Mentor request deleted" });
  } catch (error) {
    console.error("[API] DELETE /admin/mentor-requests/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to delete mentor request" },
      { status: 500 }
    );
  }
}
