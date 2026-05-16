import { NextRequest, NextResponse } from "next/server";
import { Types } from "mongoose";
import { requireAdmin, isAdminSession } from "@/lib/admin-auth";
import { connectDB } from "@/db/connection";
import { MentorRequest } from "@/db/models/MentorRequest";
import { User } from "@/db/models/User";
import {
  sendMentorAssignmentEmail,
  sendMenteeNotificationEmail,
} from "@/lib/email";
import { mentorRequestUpdateSchema } from "@/lib/validations";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin();
  if (!isAdminSession(auth)) return auth;

  try {
    const { id } = await params;
    const body = await request.json();
    const parsed = mentorRequestUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: parsed.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }
    const { mentorId, status, adminNote, notifyMentor, notifyMentee } =
      parsed.data;

    await connectDB();

    const mentorRequest = await MentorRequest.findById(id);
    if (!mentorRequest) {
      return NextResponse.json(
        { error: "Mentor request not found" },
        { status: 404 }
      );
    }

    if (mentorId !== undefined) mentorRequest.mentorId = new Types.ObjectId(mentorId);
    if (status !== undefined) mentorRequest.status = status;
    if (adminNote !== undefined) mentorRequest.adminNote = adminNote;

    await mentorRequest.save();

    if (status === "assigned" && mentorId) {
      await User.findByIdAndUpdate(mentorRequest.revertId, {
        assignedMentorId: mentorId,
      });

      // Send email notifications (fire-and-forget)
      if (notifyMentor || notifyMentee) {
        const [mentor, mentee] = await Promise.all([
          User.findById(mentorId).select("name email").lean(),
          User.findById(mentorRequest.revertId).select("name email").lean(),
        ]);

        if (mentor && mentee) {
          const mentorAny = mentor as { name: string; email: string };
          const menteeAny = mentee as { name: string; email: string };

          const emailPromises: Promise<void>[] = [];
          if (notifyMentor) {
            emailPromises.push(
              sendMentorAssignmentEmail(mentorAny.email, mentorAny.name, menteeAny.name)
            );
          }
          if (notifyMentee) {
            emailPromises.push(
              sendMenteeNotificationEmail(menteeAny.email, menteeAny.name, mentorAny.name)
            );
          }
          // Don't await — send in background so API responds quickly
          Promise.all(emailPromises).catch((err) =>
            console.error("[API] Mentor assignment email error:", err)
          );
        }
      }
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
