import { NextResponse } from "next/server";
import { auth } from "@/lib/auth-config";
import { connectDB } from "@/db/connection";
import { MentorRequest } from "@/db/models/MentorRequest";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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

    const mentees = requests.map((req: any) => ({
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
      { error: "Failed to fetch mentees" },
      { status: 500 }
    );
  }
}
