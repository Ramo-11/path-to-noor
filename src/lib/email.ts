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
  const from = process.env.RESEND_FROM || "Basmet Dawah <noreply@basmetdawah.com>";

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
        <h1 style="color: #1E3A5F; font-size: 24px; margin: 0;">Basmet Dawah</h1>
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
        Basmet Dawah &mdash; A guided learning platform for new Muslims
      </p>
    </div>
  `;

  const { error } = await resend.emails.send({
    from,
    to,
    subject: "Reset Your Password — Basmet Dawah",
    html,
  });

  if (error) {
    console.error("[Email] Failed to send reset email:", error);
    throw new Error("Failed to send email");
  }
}

interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export async function sendContactFormEmail(data: ContactFormData): Promise<void> {
  const resend = getResend();
  const from = process.env.RESEND_FROM || "Basmet Dawah <noreply@basmetdawah.com>";
  const to = "admin@basmetdawah.org";

  if (!resend) {
    console.warn("[Email] Resend not configured. Contact form from:", data.email, "Subject:", data.subject);
    return;
  }

  const escapedName = escapeHtml(data.name);
  const escapedEmail = escapeHtml(data.email);
  const escapedSubject = escapeHtml(data.subject);
  const escapedMessage = escapeHtml(data.message).replace(/\n/g, "<br>");

  const html = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 560px; margin: 0 auto; padding: 40px 20px;">
      <div style="text-align: center; margin-bottom: 32px;">
        <h1 style="color: #1E3A5F; font-size: 24px; margin: 0;">Basmet Dawah</h1>
      </div>
      <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 32px;">
        <h2 style="color: #1e293b; font-size: 20px; margin: 0 0 16px;">New Contact Form Message</h2>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
          <tr>
            <td style="color: #94a3b8; font-size: 13px; padding: 8px 0; vertical-align: top; width: 80px;">From</td>
            <td style="color: #1e293b; font-size: 15px; padding: 8px 0;">${escapedName}</td>
          </tr>
          <tr>
            <td style="color: #94a3b8; font-size: 13px; padding: 8px 0; vertical-align: top;">Email</td>
            <td style="color: #1e293b; font-size: 15px; padding: 8px 0;"><a href="mailto:${escapedEmail}" style="color: #1E3A5F;">${escapedEmail}</a></td>
          </tr>
          <tr>
            <td style="color: #94a3b8; font-size: 13px; padding: 8px 0; vertical-align: top;">Subject</td>
            <td style="color: #1e293b; font-size: 15px; padding: 8px 0;">${escapedSubject}</td>
          </tr>
        </table>
        <div style="border-top: 1px solid #e2e8f0; padding-top: 20px;">
          <p style="color: #94a3b8; font-size: 13px; margin: 0 0 8px;">Message</p>
          <p style="color: #475569; font-size: 15px; line-height: 1.6; margin: 0;">${escapedMessage}</p>
        </div>
      </div>
      <p style="color: #94a3b8; font-size: 12px; text-align: center; margin-top: 24px;">
        Basmet Dawah &mdash; Contact Form Submission
      </p>
    </div>
  `;

  const { error } = await resend.emails.send({
    from,
    to,
    replyTo: data.email,
    subject: `[Contact] ${data.subject}`,
    html,
  });

  if (error) {
    console.error("[Email] Failed to send contact form email:", error);
    throw new Error("Failed to send email");
  }
}

export async function sendMentorAssignmentEmail(
  mentorEmail: string,
  mentorName: string,
  menteeName: string
): Promise<void> {
  const resend = getResend();
  const from = process.env.RESEND_FROM || "Basmet Dawah <noreply@basmetdawah.com>";

  if (!resend) {
    console.warn("[Email] Resend not configured. Mentor assignment email to:", mentorEmail);
    return;
  }

  const html = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 560px; margin: 0 auto; padding: 40px 20px;">
      <div style="text-align: center; margin-bottom: 32px;">
        <h1 style="color: #1E3A5F; font-size: 24px; margin: 0;">Basmet Dawah</h1>
      </div>
      <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 32px;">
        <h2 style="color: #1e293b; font-size: 20px; margin: 0 0 16px;">New Mentee Assigned</h2>
        <p style="color: #475569; font-size: 15px; line-height: 1.6; margin: 0 0 24px;">
          Assalamu Alaikum ${escapeHtml(mentorName)},<br><br>
          You have been assigned a new mentee: <strong>${escapeHtml(menteeName)}</strong>.<br><br>
          Visit your mentorship dashboard to see their contact details and reach out to them. May Allah reward your efforts.
        </p>
        <div style="text-align: center; margin: 32px 0;">
          <a href="https://basmetdawah.org/en/mentorship" style="display: inline-block; background: #1E3A5F; color: #ffffff; text-decoration: none; padding: 12px 32px; border-radius: 8px; font-weight: 600; font-size: 15px;">
            View Your Mentees
          </a>
        </div>
      </div>
      <p style="color: #94a3b8; font-size: 12px; text-align: center; margin-top: 24px;">
        Basmet Dawah &mdash; A guided learning platform for new Muslims
      </p>
    </div>
  `;

  const { error } = await resend.emails.send({
    from,
    to: mentorEmail,
    subject: "New Mentee Assigned — Basmet Dawah",
    html,
  });

  if (error) {
    console.error("[Email] Failed to send mentor assignment email:", error);
  }
}

export async function sendMenteeNotificationEmail(
  menteeEmail: string,
  menteeName: string,
  mentorName: string
): Promise<void> {
  const resend = getResend();
  const from = process.env.RESEND_FROM || "Basmet Dawah <noreply@basmetdawah.com>";

  if (!resend) {
    console.warn("[Email] Resend not configured. Mentee notification email to:", menteeEmail);
    return;
  }

  const html = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 560px; margin: 0 auto; padding: 40px 20px;">
      <div style="text-align: center; margin-bottom: 32px;">
        <h1 style="color: #1E3A5F; font-size: 24px; margin: 0;">Basmet Dawah</h1>
      </div>
      <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 32px;">
        <h2 style="color: #1e293b; font-size: 20px; margin: 0 0 16px;">Your Mentor Has Been Assigned!</h2>
        <p style="color: #475569; font-size: 15px; line-height: 1.6; margin: 0 0 24px;">
          Assalamu Alaikum ${escapeHtml(menteeName)},<br><br>
          Great news! You have been matched with a mentor: <strong>${escapeHtml(mentorName)}</strong>.<br><br>
          Your mentor will reach out to you soon to help guide you on your learning journey. In the meantime, keep exploring the lessons on Basmet Dawah!
        </p>
        <div style="text-align: center; margin: 32px 0;">
          <a href="https://basmetdawah.org/en" style="display: inline-block; background: #1E3A5F; color: #ffffff; text-decoration: none; padding: 12px 32px; border-radius: 8px; font-weight: 600; font-size: 15px;">
            Continue Learning
          </a>
        </div>
      </div>
      <p style="color: #94a3b8; font-size: 12px; text-align: center; margin-top: 24px;">
        Basmet Dawah &mdash; A guided learning platform for new Muslims
      </p>
    </div>
  `;

  const { error } = await resend.emails.send({
    from,
    to: menteeEmail,
    subject: "Your Mentor Has Been Assigned! — Basmet Dawah",
    html,
  });

  if (error) {
    console.error("[Email] Failed to send mentee notification email:", error);
  }
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
