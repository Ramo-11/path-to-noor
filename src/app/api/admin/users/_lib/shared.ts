import crypto from "crypto";
import mongoose from "mongoose";
import { User } from "@/db/models/User";
import { MentorRequest } from "@/db/models/MentorRequest";
import { MentorApplication } from "@/db/models/MentorApplication";
import { sendPasswordResetEmail, sendInvitationEmail } from "@/lib/email";
import { getSiteUrl } from "@/config/env";

export const VERIFICATION_LAUNCH = new Date("2026-10-17T00:00:00.000Z");

const RESET_TTL_MS = 60 * 60 * 1000;
const INVITE_TTL_MS = 7 * 24 * 60 * 60 * 1000;

export function isValidId(id: string): boolean {
  return mongoose.isValidObjectId(id) && /^[0-9a-fA-F]{24}$/.test(id);
}

export async function issueSetPasswordLink(
  userId: string,
  email: string,
  name: string,
  locale: string,
  kind: "reset" | "invite"
): Promise<void> {
  const token = crypto.randomBytes(32).toString("hex");
  const hashed = crypto.createHash("sha256").update(token).digest("hex");
  await User.updateOne(
    { _id: userId },
    {
      $set: {
        resetToken: hashed,
        resetTokenExpiry: new Date(Date.now() + (kind === "invite" ? INVITE_TTL_MS : RESET_TTL_MS)),
      },
    }
  );
  const url = `${getSiteUrl()}/${locale}/reset-password?token=${token}`;
  if (kind === "invite") await sendInvitationEmail(email, name, url, locale);
  else await sendPasswordResetEmail(email, name, url, locale);
}

export async function deleteLearners(ids: string[]): Promise<number> {
  const targets = await User.find({ _id: { $in: ids }, role: "user" }).select("_id").lean();
  const targetIds = targets.map((t) => t._id);
  if (targetIds.length === 0) return 0;
  await MentorRequest.deleteMany({ revertId: { $in: targetIds } });
  await MentorApplication.deleteMany({ userId: { $in: targetIds } });
  await MentorRequest.updateMany(
    { mentorId: { $in: targetIds }, status: "assigned" },
    { $set: { status: "pending" }, $unset: { mentorId: 1 } }
  );
  await MentorRequest.updateMany({ mentorId: { $in: targetIds } }, { $unset: { mentorId: 1 } });
  await User.updateMany(
    { assignedMentorId: { $in: targetIds } },
    { $unset: { assignedMentorId: 1 } }
  );
  const result = await User.deleteMany({ _id: { $in: targetIds }, role: "user" });
  return result.deletedCount;
}
