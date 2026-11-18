import { NextResponse } from "next/server";
import { auth } from "@/lib/auth-config";
import { getLearnerState } from "@/lib/learning";
import { sessionTrack } from "@/lib/tracks";
import type { MePayload } from "@/lib/me-types";

const HEADERS = { "Cache-Control": "private, no-store" };

export async function GET() {
  const session = await auth();
  const user = session?.user;
  if (!user?.id) {
    const guest: MePayload = { user: null };
    return NextResponse.json(guest, { headers: HEADERS });
  }

  try {
    const state = await getLearnerState(user.id, { userType: user.userType, isGuest: false });
    const payload: MePayload = {
      user: {
        id: user.id,
        name: user.name ?? null,
        role: user.role,
        userType: user.userType ?? null,
        emailVerified: Boolean(user.emailVerified),
      },
      track: state.track ?? sessionTrack(user),
      placement: state.placement,
      completedLessonIds: state.completedLessonIds,
      currentPath: state.currentPath,
      recommendedPath: state.recommendedPath,
      recommendedIsFallback: state.recommendedIsFallback,
      paths: state.paths,
    };
    return NextResponse.json(payload, { headers: HEADERS });
  } catch (error) {
    console.error("[API] GET /me error:", error);
    return NextResponse.json(
      { error: "We could not load your learning. Please try again." },
      { status: 500, headers: HEADERS }
    );
  }
}
