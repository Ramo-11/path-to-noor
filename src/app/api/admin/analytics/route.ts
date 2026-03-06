import { NextResponse } from "next/server";
import { requireAdmin, isAdminSession } from "@/lib/admin-auth";
import {
  getSignupTrends,
  getCompletionTrends,
  getQuizActivityTrends,
  getPopularPaths,
} from "@/lib/data";

export async function GET() {
  const auth = await requireAdmin();
  if (!isAdminSession(auth)) return auth;

  try {
    const [signups, completions, quizActivity, popularPaths] =
      await Promise.all([
        getSignupTrends(30),
        getCompletionTrends(30),
        getQuizActivityTrends(30),
        getPopularPaths(),
      ]);

    return NextResponse.json({
      data: { signups, completions, quizActivity, popularPaths },
    });
  } catch (error) {
    console.error("[API] GET /admin/analytics error:", error);
    return NextResponse.json(
      { error: "Failed to fetch analytics" },
      { status: 500 }
    );
  }
}
