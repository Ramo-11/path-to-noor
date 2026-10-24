import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth-config";
import { connectDB } from "@/db/connection";
import { User } from "@/db/models/User";
import { MentorRequest } from "@/db/models/MentorRequest";
import { mentorRequestCreateSchema } from "@/lib/validations";
import { sendAdminMentorRequestEmail } from "@/lib/email";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  try {
    await connectDB();

    const mentorRequest = await MentorRequest.findOne({
      revertId: session.user.id,
      status: { $in: ["pending", "assigned", "rejected"] },
    })
      .sort({ createdAt: -1 })
      .populate("mentorId", "name email")
      .lean();

    return NextResponse.json({ data: mentorRequest });
  } catch (error) {
    console.error("[API] GET /user/mentor-request error:", error);
    return NextResponse.json(
      { error: "server_error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const parsed = mentorRequestCreateSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_input" }, { status: 400 });
  }

  try {
    await connectDB();

    const user = await User.findById(session.user.id).select("name email userType track emailVerified").lean();
    if (!user) {
      return NextResponse.json({ error: "not_found" }, { status: 404 });
    }

    const track = (user as { track?: string }).track;
    if (user.userType === "mentor" || (user.userType !== "revert" && track !== "new")) {
      return NextResponse.json({ error: "revert_only" }, { status: 403 });
    }

    if (!user.emailVerified) {
      return NextResponse.json({ error: "email_unverified" }, { status: 403 });
    }

    const existingRequest = await MentorRequest.findOne({
      revertId: session.user.id,
      status: { $in: ["pending", "assigned"] },
    });

    if (existingRequest) {
      return NextResponse.json({ error: "already_requested" }, { status: 409 });
    }

    const mentorRequest = await MentorRequest.create({
      revertId: session.user.id,
      message: parsed.data.message,
    });

    await sendAdminMentorRequestEmail({
      name: user.name,
      email: user.email,
      message: parsed.data.message,
    });

    return NextResponse.json({ data: mentorRequest }, { status: 201 });
  } catch (error) {
    console.error("[API] POST /user/mentor-request error:", error);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}

export async function DELETE() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  try {
    await connectDB();

    const mentorRequest = await MentorRequest.findOne({
      revertId: session.user.id,
      status: "pending",
    });

    if (!mentorRequest) {
      return NextResponse.json(
        { error: "not_found" },
        { status: 404 }
      );
    }

    await mentorRequest.deleteOne();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[API] DELETE /user/mentor-request error:", error);
    return NextResponse.json(
      { error: "server_error" },
      { status: 500 }
    );
  }
}
