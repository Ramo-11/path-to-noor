import crypto from "crypto";
import { User } from "@/db/models/User";
import { sendVerificationEmail } from "@/lib/email";
import { getSiteUrl } from "@/config/env";

const VERIFY_TTL_MS = 24 * 60 * 60 * 1000;

export function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export async function issueVerification(
  userId: string,
  email: string,
  name: string,
  locale: string
): Promise<void> {
  const token = crypto.randomBytes(32).toString("hex");
  await User.updateOne(
    { _id: userId },
    {
      $set: {
        emailVerifyToken: hashToken(token),
        emailVerifyExpiry: new Date(Date.now() + VERIFY_TTL_MS),
      },
    }
  );
  const url = `${getSiteUrl()}/${locale}/verify-email?token=${token}`;
  await sendVerificationEmail(email, name, url, locale);
}
