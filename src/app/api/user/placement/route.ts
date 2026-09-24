import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth-config";
import { connectDB } from "@/db/connection";
import { User } from "@/db/models/User";
import {
  PLACEMENT_QUESTIONS,
  computePlacement,
  isCompletePlacement,
  type PlacementAnswers,
} from "@/lib/placement";
import { STAGES, isStageKey, type StageKey } from "@/lib/stages";

const answersBody = z
  .object({
    answers: z
      .record(z.string().max(32), z.string().max(32))
      .refine((value) => Object.keys(value).length <= PLACEMENT_QUESTIONS.length * 2),
  })
  .strict();

const stageBody = z.object({ stage: z.enum(STAGES) }).strict();

const placementBody = z.union([answersBody, stageBody]);

function toPlainAnswers(value: unknown): Record<string, string> {
  const entries: Array<[string, unknown]> =
    value instanceof Map
      ? [...value.entries()]
      : value && typeof value === "object"
        ? Object.entries(value as Record<string, unknown>)
        : [];
  return Object.fromEntries(
    entries.filter((entry): entry is [string, string] => typeof entry[1] === "string")
  );
}

function pickAnswers(answers: PlacementAnswers): PlacementAnswers {
  return Object.fromEntries(
    PLACEMENT_QUESTIONS.map((question) => [question.id, answers[question.id]])
  ) as PlacementAnswers;
}

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json(
      { error: "Please sign in to see your starting point." },
      { status: 401 }
    );
  }

  try {
    await connectDB();
    const user = await User.findById(session.user.id).select("placement").lean();
    if (!user) {
      return NextResponse.json({ error: "We could not find your account." }, { status: 404 });
    }

    const placement = user.placement;
    if (!placement || !isStageKey(placement.stage)) {
      return NextResponse.json({ data: null });
    }

    return NextResponse.json({
      data: {
        stage: placement.stage,
        answers: toPlainAnswers(placement.answers),
        takenAt: placement.takenAt ? new Date(placement.takenAt).toISOString() : null,
      },
    });
  } catch (error) {
    console.error("[API] GET /user/placement error:", error);
    return NextResponse.json(
      { error: "We could not load your starting point. Please try again." },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json(
      { error: "Please sign in to save your starting point." },
      { status: 401 }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "We could not read that request." }, { status: 400 });
  }

  const parsed = placementBody.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Please answer every question, or choose a stage." },
      { status: 400 }
    );
  }

  let stage: StageKey;
  let answers: Record<string, string> | null = null;

  if ("answers" in parsed.data) {
    if (!isCompletePlacement(parsed.data.answers)) {
      return NextResponse.json(
        { error: "Please answer every question before saving." },
        { status: 400 }
      );
    }
    const picked = pickAnswers(parsed.data.answers);
    answers = picked;
    stage = computePlacement(picked).stage;
  } else {
    stage = parsed.data.stage;
  }

  try {
    await connectDB();
    const user = await User.findById(session.user.id).select("placement").lean();
    if (!user) {
      return NextResponse.json({ error: "We could not find your account." }, { status: 404 });
    }

    const savedAnswers = answers ?? toPlainAnswers(user.placement?.answers);

    await User.updateOne(
      { _id: session.user.id },
      { $set: { placement: { stage, answers: savedAnswers, takenAt: new Date() } } },
      { runValidators: true }
    );

    return NextResponse.json({ data: { stage } });
  } catch (error) {
    console.error("[API] POST /user/placement error:", error);
    return NextResponse.json(
      { error: "We could not save your starting point. Please try again." },
      { status: 500 }
    );
  }
}
