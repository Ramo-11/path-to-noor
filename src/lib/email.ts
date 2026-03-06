import { Resend } from "resend";

function getResend(): Resend | null {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return null;
  return new Resend(apiKey);
}

export async function sendPasswordResetEmail(
  to: string,
  name: string,
  resetUrl: string
): Promise<void> {
  const resend = getResend();
  const from = process.env.RESEND_FROM || "Path to Noor <noreply@pathtonoor.com>";

  if (!resend) {
    console.warn(
      "[Email] Resend not configured (RESEND_API_KEY missing). Reset URL for",
      to,
      ":",
      resetUrl
    );
    return;
  }

  const html = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 560px; margin: 0 auto; padding: 40px 20px;">
      <div style="text-align: center; margin-bottom: 32px;">
        <h1 style="color: #1E3A5F; font-size: 24px; margin: 0;">Path to Noor</h1>
      </div>
      <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 32px;">
        <h2 style="color: #1e293b; font-size: 20px; margin: 0 0 16px;">Reset Your Password</h2>
        <p style="color: #475569; font-size: 15px; line-height: 1.6; margin: 0 0 24px;">
          Hello ${name},<br><br>
          We received a request to reset your password. Click the button below to choose a new one. This link expires in 1 hour.
        </p>
        <div style="text-align: center; margin: 32px 0;">
          <a href="${resetUrl}" style="display: inline-block; background: #1E3A5F; color: #ffffff; text-decoration: none; padding: 12px 32px; border-radius: 8px; font-weight: 600; font-size: 15px;">
            Reset Password
          </a>
        </div>
        <p style="color: #94a3b8; font-size: 13px; line-height: 1.5; margin: 0;">
          If you didn't request this, you can safely ignore this email. Your password won't be changed.
        </p>
      </div>
      <p style="color: #94a3b8; font-size: 12px; text-align: center; margin-top: 24px;">
        Path to Noor &mdash; A guided learning platform for new Muslims
      </p>
    </div>
  `;

  const { error } = await resend.emails.send({
    from,
    to,
    subject: "Reset Your Password — Path to Noor",
    html,
  });

  if (error) {
    console.error("[Email] Failed to send reset email:", error);
    throw new Error("Failed to send email");
  }
}
