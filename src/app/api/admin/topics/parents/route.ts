import { NextResponse } from "next/server";
import { requireAdmin, isAdminSession } from "@/lib/admin-auth";
import { connectDB } from "@/db/connection";
import { Topic } from "@/db/models/Topic";

export async function GET() {
  const auth = await requireAdmin();
  if (!isAdminSession(auth)) return auth;

  try {
    await connectDB();

    const topics = await Topic.find()
      .select("name slug")
      .sort({ "name.en": 1 })
      .lean();

    const data = topics.map((t) => ({
      _id: t._id.toString(),
      name: t.name,
      slug: t.slug,
    }));

    return NextResponse.json({ data });
  } catch (error) {
    console.error("[API] GET /admin/topics/parents error:", error);
    return NextResponse.json(
      { error: "Failed to fetch topics" },
      { status: 500 }
    );
  }
}
