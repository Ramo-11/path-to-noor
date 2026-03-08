import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth-config";
import { connectDB } from "@/db/connection";
import { User } from "@/db/models/User";
import { MentorRequest } from "@/db/models/MentorRequest";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await connectDB();

    const mentorRequest = await MentorRequest.findOne({
      revertId: session.user.id,
      status: { $in: ["pending", "assigned"] },
    })
      .populate("mentorId", "name email")
      .lean();

    return NextResponse.json({ data: mentorRequest });
  } catch (error) {
    console.error("[API] GET /user/mentor-request error:", error);
    return NextResponse.json(
      { error: "Failed to fetch mentor request" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await connectDB();

    const user = await User.findById(session.user.id).select("userType").lean();
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (user.userType !== "revert") {
      return NextResponse.json(
        { error: "Only revert users can request a mentor" },
        { status: 403 }
      );
    }

    const existingRequest = await MentorRequest.findOne({
      revertId: session.user.id,
      status: { $in: ["pending", "assigned"] },
    });

    if (existingRequest) {
      return NextResponse.json(
        { error: "You already have a pending or assigned mentor request" },
        { status: 409 }
      );
    }

    const body = await request.json();

    const mentorRequest = await MentorRequest.create({
      revertId: session.user.id,
      message: body.message || "",
    });

    return NextResponse.json(
      { data: mentorRequest, message: "Mentor request submitted" },
      { status: 201 }
    );
  } catch (error) {
    console.error("[API] POST /user/mentor-request error:", error);
    return NextResponse.json(
      { error: "Failed to submit mentor request" },
      { status: 500 }
    );
  }
}
