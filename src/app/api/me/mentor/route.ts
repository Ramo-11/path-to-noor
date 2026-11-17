import { NextResponse } from "next/server";
import { auth } from "@/lib/auth-config";
import { connectDB } from "@/db/connection";
import { User } from "@/db/models/User";
import { MentorApplication } from "@/db/models/MentorApplication";

const HEADERS = { "Cache-Control": "private, no-store" };

export type VolunteerView = "guest" | "unverified" | "pending" | "approved" | "declined" | "form";

export async function GET() {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    return NextResponse.json({ view: "guest" satisfies VolunteerView }, { headers: HEADERS });
  }

  try {
    await connectDB();
    const user = await User.findById(userId).select("userType emailVerified").lean();
    let view: VolunteerView;
    if (!user) {
      view = "guest";
    } else if (user.userType === "mentor") {
      view = "approved";
    } else if (!user.emailVerified) {
      view = "unverified";
    } else {
      const latest = await MentorApplication.findOne({ userId })
        .sort({ createdAt: -1 })
        .select("status")
        .lean();
      view =
        latest?.status === "pending"
          ? "pending"
          : latest?.status === "declined"
            ? "declined"
            : latest?.status === "approved"
              ? "approved"
              : "form";
    }
    return NextResponse.json({ view }, { headers: HEADERS });
  } catch (error) {
    console.error("[API] GET /me/mentor error:", error);
    return NextResponse.json(
      { error: "We could not load your application. Please try again." },
      { status: 500, headers: HEADERS }
    );
  }
}
