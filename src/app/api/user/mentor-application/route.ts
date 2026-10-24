import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth-config";
import { connectDB } from "@/db/connection";
import { User } from "@/db/models/User";
import { MentorApplication } from "@/db/models/MentorApplication";
import { rateLimitShared } from "@/lib/rate-limit";
import { sendAdminVolunteerEmail } from "@/lib/email";

const applicationSchema = z.object({
  about: z.string().trim().min(1).max(2000),
  experience: z.string().trim().min(1).max(2000),
  languages: z.array(z.enum(["en", "ar", "es"])).min(1).max(3),
  otherLanguages: z.string().trim().max(200).optional(),
  availability: z.string().trim().min(1).max(500),
  gender: z.enum(["male", "female"]),
  agreedToGuidelines: z.literal(true),
});

const LANGUAGE_NAMES = { en: "English", ar: "Arabic", es: "Spanish" } as const;

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  try {
    await connectDB();
    const application = await MentorApplication.findOne({ userId: session.user.id })
      .sort({ createdAt: -1 })
      .select("status createdAt")
      .lean();
    return NextResponse.json({ data: application });
  } catch (error) {
    console.error("[API] GET /user/mentor-application error:", error);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const limit = await rateLimitShared(`mentor-application:${session.user.id}`, 5, 60 * 60 * 1000);
  if (!limit.success) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }

  const parsed = applicationSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_input" }, { status: 400 });
  }

  try {
    await connectDB();

    const user = await User.findById(session.user.id)
      .select("name email userType emailVerified")
      .lean();
    if (!user) {
      return NextResponse.json({ error: "not_found" }, { status: 404 });
    }
    if (!user.emailVerified) {
      return NextResponse.json({ error: "email_unverified" }, { status: 403 });
    }
    if (user.userType === "mentor") {
      return NextResponse.json({ error: "already_mentor" }, { status: 409 });
    }

    const open = await MentorApplication.findOne({
      userId: session.user.id,
      status: { $in: ["pending", "approved"] },
    }).select("_id");
    if (open) {
      return NextResponse.json({ error: "already_applied" }, { status: 409 });
    }

    const data = parsed.data;
    const application = await MentorApplication.create({
      userId: session.user.id,
      about: data.about,
      experience: data.experience,
      languages: [...new Set(data.languages)],
      otherLanguages: data.otherLanguages ?? "",
      availability: data.availability,
      gender: data.gender,
      agreedToGuidelines: true,
    });

    const languages = [
      ...application.languages.map((l) => LANGUAGE_NAMES[l]),
      ...(data.otherLanguages ? [data.otherLanguages] : []),
    ].join(", ");
    await sendAdminVolunteerEmail({
      name: user.name,
      email: user.email,
      gender: data.gender,
      languages,
      availability: data.availability,
      about: data.about,
    });

    return NextResponse.json(
      { data: { status: application.status, createdAt: application.createdAt } },
      { status: 201 }
    );
  } catch (error) {
    if ((error as { code?: number }).code === 11000) {
      return NextResponse.json({ error: "already_applied" }, { status: 409 });
    }
    console.error("[API] POST /user/mentor-application error:", error);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}
