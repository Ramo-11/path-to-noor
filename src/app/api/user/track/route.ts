import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth-config";
import { connectDB } from "@/db/connection";
import { User } from "@/db/models/User";
import { isTrackKey, trackBodySchema } from "@/lib/tracks";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Please sign in first." }, { status: 401 });
  }

  try {
    await connectDB();
    const user = await User.findById(session.user.id).select("track").lean();
    if (!user) {
      return NextResponse.json({ error: "We could not find your account." }, { status: 404 });
    }
    return NextResponse.json({ data: isTrackKey(user.track) ? user.track : null });
  } catch (error) {
    console.error("[API] GET /user/track error:", error);
    return NextResponse.json(
      { error: "We could not load your choice. Please try again." },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Please sign in first." }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "We could not read that request." }, { status: 400 });
  }

  const parsed = trackBodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Please choose one of the options." }, { status: 400 });
  }

  const { track } = parsed.data;

  try {
    await connectDB();
    const result = await User.updateOne(
      { _id: session.user.id },
      { $set: { track } },
      { runValidators: true }
    );
    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "We could not find your account." }, { status: 404 });
    }

    if (track === "new") {
      await User.updateOne(
        { _id: session.user.id, userType: null },
        { $set: { userType: "revert" } },
        { runValidators: true }
      );
    }

    return NextResponse.json({ data: { track } });
  } catch (error) {
    console.error("[API] POST /user/track error:", error);
    return NextResponse.json(
      { error: "We could not save your choice. Please try again." },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Please sign in first." }, { status: 401 });
  }

  try {
    await connectDB();
    await User.updateOne({ _id: session.user.id }, { $unset: { track: 1 } });
    return NextResponse.json({ data: null });
  } catch (error) {
    console.error("[API] DELETE /user/track error:", error);
    return NextResponse.json(
      { error: "We could not clear your choice. Please try again." },
      { status: 500 }
    );
  }
}
