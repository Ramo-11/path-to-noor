import { NextResponse } from "next/server";
import { auth } from "@/lib/auth-config";
import { connectDB } from "@/db/connection";
import { MentorRequest } from "@/db/models/MentorRequest";

interface MenteeRequest {
  revertId: { _id: { toString(): string }; name: string; email: string };
  message?: string;
  updatedAt: Date;
}

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  try {
    await connectDB();

    const requests = await MentorRequest.find({
      mentorId: session.user.id,
      status: "assigned",
    })
      .populate("revertId", "name email")
      .sort({ updatedAt: -1 })
      .lean();

    const mentees = (requests as unknown as MenteeRequest[])
      .filter((req) => req.revertId)
      .map((req) => ({
        _id: req.revertId._id.toString(),
        name: req.revertId.name,
        email: req.revertId.email,
        message: req.message || null,
        assignedAt: req.updatedAt,
      }));

    return NextResponse.json({ data: mentees });
  } catch (error) {
    console.error("[API] GET /user/my-mentees error:", error);
    return NextResponse.json(
      { error: "server_error" },
      { status: 500 }
    );
  }
}
