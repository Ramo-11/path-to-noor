import { Resend } from "resend";

function getResend(): Resend | null {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return null;
  return new Resend(apiKey);
}

type Locale = "en" | "ar" | "es";

function asLocale(value: string | undefined): Locale {
  return value === "ar" || value === "es" ? value : "en";
}

interface Copy {
  hello: (name: string) => string;
  resetSubject: string;
  resetTitle: string;
  resetBody: string;
  resetButton: string;
  resetIgnore: string;
  verifySubject: string;
  verifyTitle: string;
  verifyBody: string;
  verifyButton: string;
  verifyIgnore: string;
  existsSubject: string;
  existsTitle: string;
  existsBody: string;
  existsButton: string;
  existsIgnore: string;
  footer: string;
}

const COPY: Record<Locale, Copy> = {
  en: {
    hello: (name) => `Hello ${name},`,
    resetSubject: "Reset your password | Basmet Dawah",
    resetTitle: "Reset your password",
    resetBody:
      "We received a request to reset your password. Choose a new one with the button below. This link expires in 1 hour.",
    resetButton: "Reset password",
    resetIgnore: "If you did not ask for this, you can ignore this email. Your password stays the same.",
    verifySubject: "Confirm your email | Basmet Dawah",
    verifyTitle: "Confirm your email",
    verifyBody:
      "Welcome to Basmet Dawah. Please confirm your email address with the button below. This link expires in 24 hours.",
    verifyButton: "Confirm email",
    verifyIgnore: "If you did not create an account, you can ignore this email.",
    existsSubject: "You already have an account | Basmet Dawah",
    existsTitle: "You already have an account",
    existsBody:
      "Someone tried to create a Basmet Dawah account with this email address. If it was you, just sign in. If you forgot your password, you can reset it from the sign in page.",
    existsButton: "Go to sign in",
    existsIgnore: "If it was not you, you can ignore this email. Nothing has changed on your account.",
    footer: "Basmet Dawah | A guided learning platform for new Muslims",
  },
  ar: {
    hello: (name) => `مرحبًا ${name}،`,
    resetSubject: "إعادة تعيين كلمة المرور | بسمة دعوة",
    resetTitle: "إعادة تعيين كلمة المرور",
    resetBody:
      "وصلنا طلب لإعادة تعيين كلمة المرور. اختر كلمة مرور جديدة من الزر أدناه. ينتهي الرابط بعد ساعة واحدة.",
    resetButton: "إعادة تعيين كلمة المرور",
    resetIgnore: "إن لم تطلب ذلك فتجاهل هذه الرسالة. ستبقى كلمة المرور كما هي.",
    verifySubject: "أكّد بريدك الإلكتروني | بسمة دعوة",
    verifyTitle: "أكّد بريدك الإلكتروني",
    verifyBody:
      "أهلًا بك في بسمة دعوة. أكّد عنوان بريدك الإلكتروني من الزر أدناه. ينتهي الرابط بعد 24 ساعة.",
    verifyButton: "تأكيد البريد",
    verifyIgnore: "إن لم تنشئ حسابًا فتجاهل هذه الرسالة.",
    existsSubject: "لديك حساب بالفعل | بسمة دعوة",
    existsTitle: "لديك حساب بالفعل",
    existsBody:
      "حاول أحدهم إنشاء حساب في بسمة دعوة بهذا البريد. إن كنت أنت فسجّل الدخول فقط. وإن نسيت كلمة المرور فيمكنك إعادة تعيينها من صفحة تسجيل الدخول.",
    existsButton: "الذهاب إلى تسجيل الدخول",
    existsIgnore: "إن لم تكن أنت فتجاهل هذه الرسالة. لم يتغير شيء في حسابك.",
    footer: "بسمة دعوة | منصة تعلّم موجَّهة للمسلمين الجدد",
  },
  es: {
    hello: (name) => `Hola ${name},`,
    resetSubject: "Restablece tu contraseña | Basmet Dawah",
    resetTitle: "Restablece tu contraseña",
    resetBody:
      "Recibimos una solicitud para restablecer tu contraseña. Elige una nueva con el botón de abajo. El enlace vence en 1 hora.",
    resetButton: "Restablecer contraseña",
    resetIgnore: "Si no lo pediste, puedes ignorar este correo. Tu contraseña no cambiará.",
    verifySubject: "Confirma tu correo | Basmet Dawah",
    verifyTitle: "Confirma tu correo",
    verifyBody:
      "Te damos la bienvenida a Basmet Dawah. Confirma tu correo con el botón de abajo. El enlace vence en 24 horas.",
    verifyButton: "Confirmar correo",
    verifyIgnore: "Si no creaste una cuenta, puedes ignorar este correo.",
    existsSubject: "Ya tienes una cuenta | Basmet Dawah",
    existsTitle: "Ya tienes una cuenta",
    existsBody:
      "Alguien intentó crear una cuenta de Basmet Dawah con este correo. Si fuiste tú, solo inicia sesión. Si olvidaste tu contraseña, puedes restablecerla desde la página de inicio de sesión.",
    existsButton: "Ir a iniciar sesión",
    existsIgnore: "Si no fuiste tú, ignora este correo. Tu cuenta no ha cambiado.",
    footer: "Basmet Dawah | Una plataforma guiada para nuevos musulmanes",
  },
};

function fromAddress(): string {
  return process.env.RESEND_FROM || "Basmet Dawah <noreply@basmetdawah.com>";
}

function actionEmail(
  locale: Locale,
  copy: { title: string; body: string; button: string; ignore: string },
  name: string,
  url: string
): string {
  const c = COPY[locale];
  const dir = locale === "ar" ? "rtl" : "ltr";
  return `
    <div dir="${dir}" style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 560px; margin: 0 auto; padding: 40px 20px;">
      <div style="text-align: center; margin-bottom: 32px;">
        <h1 style="color: #1E3A5F; font-size: 24px; margin: 0;">Basmet Dawah</h1>
      </div>
      <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 32px;">
        <h2 style="color: #1e293b; font-size: 20px; margin: 0 0 16px;">${escapeHtml(copy.title)}</h2>
        <p style="color: #475569; font-size: 15px; line-height: 1.6; margin: 0 0 24px;">
          ${escapeHtml(c.hello(name))}<br><br>
          ${escapeHtml(copy.body)}
        </p>
        <div style="text-align: center; margin: 32px 0;">
          <a href="${escapeHtml(url)}" style="display: inline-block; background: #1E3A5F; color: #ffffff; text-decoration: none; padding: 12px 32px; border-radius: 8px; font-weight: 600; font-size: 15px;">
            ${escapeHtml(copy.button)}
          </a>
        </div>
        <p style="color: #94a3b8; font-size: 13px; line-height: 1.5; margin: 0;">
          ${escapeHtml(copy.ignore)}
        </p>
      </div>
      <p style="color: #94a3b8; font-size: 12px; text-align: center; margin-top: 24px;">
        ${escapeHtml(c.footer)}
      </p>
    </div>
  `;
}

async function deliver(
  label: string,
  to: string,
  subject: string,
  html: string,
  link: string
): Promise<void> {
  const resend = getResend();
  if (!resend) {
    console.warn(`[Email] Resend not configured (RESEND_API_KEY missing). ${label} for`, to, ":", link);
    return;
  }
  const { error } = await resend.emails.send({ from: fromAddress(), to, subject, html });
  if (error) {
    console.error(`[Email] Failed to send ${label}:`, error);
    throw new Error("Failed to send email");
  }
}

export async function sendPasswordResetEmail(
  to: string,
  name: string,
  resetUrl: string,
  locale?: string
): Promise<void> {
  const l = asLocale(locale);
  const c = COPY[l];
  const html = actionEmail(
    l,
    { title: c.resetTitle, body: c.resetBody, button: c.resetButton, ignore: c.resetIgnore },
    name,
    resetUrl
  );
  await deliver("reset email", to, c.resetSubject, html, resetUrl);
}

export async function sendVerificationEmail(
  to: string,
  name: string,
  verifyUrl: string,
  locale?: string
): Promise<void> {
  const l = asLocale(locale);
  const c = COPY[l];
  const html = actionEmail(
    l,
    { title: c.verifyTitle, body: c.verifyBody, button: c.verifyButton, ignore: c.verifyIgnore },
    name,
    verifyUrl
  );
  await deliver("verification email", to, c.verifySubject, html, verifyUrl);
}

export async function sendAccountExistsEmail(
  to: string,
  name: string,
  signInUrl: string,
  locale?: string
): Promise<void> {
  const l = asLocale(locale);
  const c = COPY[l];
  const html = actionEmail(
    l,
    { title: c.existsTitle, body: c.existsBody, button: c.existsButton, ignore: c.existsIgnore },
    name,
    signInUrl
  );
  await deliver("account exists notice", to, c.existsSubject, html, signInUrl);
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
        Basmet Dawah | Contact Form Submission
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
          Visit your mentor page to see their contact details and reach out to them. May Allah reward your efforts.
        </p>
        <div style="text-align: center; margin: 32px 0;">
          <a href="https://basmetdawah.org/en/mentor" style="display: inline-block; background: #1E3A5F; color: #ffffff; text-decoration: none; padding: 12px 32px; border-radius: 8px; font-weight: 600; font-size: 15px;">
            View Your Mentees
          </a>
        </div>
      </div>
      <p style="color: #94a3b8; font-size: 12px; text-align: center; margin-top: 24px;">
        Basmet Dawah | A guided learning platform for new Muslims
      </p>
    </div>
  `;

  const { error } = await resend.emails.send({
    from,
    to: mentorEmail,
    subject: "New Mentee Assigned | Basmet Dawah",
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
        Basmet Dawah | A guided learning platform for new Muslims
      </p>
    </div>
  `;

  const { error } = await resend.emails.send({
    from,
    to: menteeEmail,
    subject: "Your Mentor Has Been Assigned! | Basmet Dawah",
    html,
  });

  if (error) {
    console.error("[Email] Failed to send mentee notification email:", error);
  }
}

const SITE_URL = "https://basmetdawah.org";

function adminShell(title: string, rows: Array<[string, string]>, body: { label: string; text: string } | null, buttonLabel: string, url: string): string {
  const rowHtml = rows
    .map(
      ([k, v]) => `
          <tr>
            <td style="color: #94a3b8; font-size: 13px; padding: 8px 0; vertical-align: top; width: 110px;">${escapeHtml(k)}</td>
            <td style="color: #1e293b; font-size: 15px; padding: 8px 0;">${escapeHtml(v).replace(/\n/g, "<br>")}</td>
          </tr>`
    )
    .join("");
  const bodyHtml = body
    ? `<div style="border-top: 1px solid #e2e8f0; padding-top: 20px;">
          <p style="color: #94a3b8; font-size: 13px; margin: 0 0 8px;">${escapeHtml(body.label)}</p>
          <p style="color: #475569; font-size: 15px; line-height: 1.6; margin: 0;">${escapeHtml(body.text).replace(/\n/g, "<br>")}</p>
        </div>`
    : "";
  return `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 560px; margin: 0 auto; padding: 40px 20px;">
      <div style="text-align: center; margin-bottom: 32px;">
        <h1 style="color: #1E3A5F; font-size: 24px; margin: 0;">Basmet Dawah</h1>
      </div>
      <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 32px;">
        <h2 style="color: #1e293b; font-size: 20px; margin: 0 0 16px;">${escapeHtml(title)}</h2>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">${rowHtml}
        </table>
        ${bodyHtml}
        <div style="text-align: center; margin: 32px 0 0;">
          <a href="${escapeHtml(url)}" style="display: inline-block; background: #1E3A5F; color: #ffffff; text-decoration: none; padding: 12px 32px; border-radius: 8px; font-weight: 600; font-size: 15px;">
            ${escapeHtml(buttonLabel)}
          </a>
        </div>
      </div>
      <p style="color: #94a3b8; font-size: 12px; text-align: center; margin-top: 24px;">
        Basmet Dawah | Admin notice
      </p>
    </div>
  `;
}

async function sendAdminNotice(label: string, subject: string, html: string): Promise<void> {
  const resend = getResend();
  if (!resend) {
    console.warn(`[Email] Resend not configured. ${label}`);
    return;
  }
  const { error } = await resend.emails.send({
    from: fromAddress(),
    to: "admin@basmetdawah.org",
    subject,
    html,
  });
  if (error) {
    console.error(`[Email] Failed to send ${label}:`, error);
  }
}

export async function sendAdminMentorRequestEmail(data: {
  name: string;
  email: string;
  message?: string;
}): Promise<void> {
  try {
    const html = adminShell(
      "New mentor request",
      [
        ["From", data.name],
        ["Email", data.email],
      ],
      data.message ? { label: "Message", text: data.message } : null,
      "Open Mentorship",
      `${SITE_URL}/admin/mentorship`
    );
    await sendAdminNotice("mentor request notice", "New mentor request | Basmet Dawah", html);
  } catch (error) {
    console.error("[Email] Mentor request notice failed:", error);
  }
}

export async function sendAdminVolunteerEmail(data: {
  name: string;
  email: string;
  gender: string;
  languages: string;
  availability: string;
  about: string;
}): Promise<void> {
  try {
    const html = adminShell(
      "New volunteer mentor application",
      [
        ["From", data.name],
        ["Email", data.email],
        ["Gender", data.gender],
        ["Languages", data.languages],
        ["Availability", data.availability],
      ],
      { label: "Why they want to help", text: data.about },
      "Review applications",
      `${SITE_URL}/admin/mentorship`
    );
    await sendAdminNotice("volunteer application notice", "New volunteer mentor application | Basmet Dawah", html);
  } catch (error) {
    console.error("[Email] Volunteer notice failed:", error);
  }
}

export async function sendMentorApprovedEmail(to: string, name: string, locale?: string): Promise<void> {
  const l = asLocale(locale);
  const text = {
    en: {
      subject: "You are now a mentor | Basmet Dawah",
      title: "You are now a mentor",
      body: "Thank you for offering your time. Your application is approved. When we match a new Muslim with you, we will email you and they will appear on your mentor page.",
      button: "Open mentor page",
    },
    ar: {
      subject: "أصبحت مرشدًا | بسمة دعوة",
      title: "أصبحت مرشدًا",
      body: "شكرًا لبذل وقتك. تمت الموافقة على طلبك. عندما نربطك بمسلم جديد سنراسلك وسيظهر في صفحة المرشد الخاصة بك.",
      button: "فتح صفحة المرشد",
    },
    es: {
      subject: "Ya eres mentor | Basmet Dawah",
      title: "Ya eres mentor",
      body: "Gracias por ofrecer tu tiempo. Tu solicitud fue aprobada. Cuando asignemos a un nuevo musulmán contigo, te escribiremos y aparecerá en tu página de mentor.",
      button: "Abrir página de mentor",
    },
  }[l];
  const html = actionEmail(
    l,
    { title: text.title, body: text.body, button: text.button, ignore: "" },
    name,
    `${SITE_URL}/${l}/mentor`
  );
  const resend = getResend();
  if (!resend) {
    console.warn("[Email] Resend not configured. Mentor approved email to:", to);
    return;
  }
  const { error } = await resend.emails.send({ from: fromAddress(), to, subject: text.subject, html });
  if (error) {
    console.error("[Email] Failed to send mentor approved email:", error);
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
