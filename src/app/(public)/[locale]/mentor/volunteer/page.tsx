import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { auth } from "@/lib/auth-config";
import { connectDB } from "@/db/connection";
import { User } from "@/db/models/User";
import { MentorApplication } from "@/db/models/MentorApplication";
import { PageBanner } from "@/components/primer/PageBanner";
import { Button } from "@/components/primer/Button";
import { Notice } from "@/components/primer/Notice";
import { Link } from "@/i18n/navigation";
import { VolunteerForm } from "@/components/mentor/VolunteerForm";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "volunteer" });
  return { title: t("metaTitle"), description: t("metaDescription") };
}

type View = "guest" | "unverified" | "pending" | "approved" | "declined" | "form" | "error";

export default async function VolunteerPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("volunteer");
  const session = await auth();

  let view: View = "guest";
  if (session?.user?.id) {
    try {
      await connectDB();
      const user = await User.findById(session.user.id).select("userType emailVerified").lean();
      if (!user) {
        view = "guest";
      } else if (user.userType === "mentor") {
        view = "approved";
      } else if (!user.emailVerified) {
        view = "unverified";
      } else {
        const latest = await MentorApplication.findOne({ userId: session.user.id })
          .sort({ createdAt: -1 })
          .select("status")
          .lean();
        view = latest?.status === "pending" ? "pending" : latest?.status === "declined" ? "declined" : latest?.status === "approved" ? "approved" : "form";
      }
    } catch {
      view = "error";
    }
  }

  const callback = encodeURIComponent(`/${locale}/mentor/volunteer`);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
      <PageBanner title={t("title")} lead={t("lead")} art="mentor" tone="evening" />
      <div className="flex flex-col gap-6 pt-10 pb-24">
        {view === "guest" ? (
          <div className="card max-w-2xl p-6 sm:p-8">
            <div className="flex flex-col items-start gap-4">
              <p className="text-ink-2 text-pretty">{t("intro")}</p>
              <h2 className="text-heading font-semibold">{t("signInTitle")}</h2>
              <p className="text-ink-2">{t("signInBody")}</p>
              <div className="flex flex-wrap gap-3">
                <Button href={`/login?callbackUrl=${callback}`} variant="primary" size="lg">
                  {t("signInCta")}
                </Button>
                <Button href={`/register?callbackUrl=${callback}`} variant="secondary" size="lg">
                  {t("createAccountCta")}
                </Button>
              </div>
            </div>
          </div>
        ) : null}

        {view === "unverified" ? (
          <Notice tone="info" className="max-w-2xl">
            <p className="font-medium">{t("verifyTitle")}</p>
            <p className="mt-1">{t("verifyBody")}</p>
            <div className="mt-3">
              <Link
                href="/settings"
                className="inline-flex min-h-11 items-center text-ink underline decoration-rule-strong underline-offset-[0.25em] hover:decoration-ink"
              >
                {t("verifyLink")}
              </Link>
            </div>
          </Notice>
        ) : null}

        {view === "pending" ? (
          <div className="card max-w-2xl p-6 sm:p-8" role="status">
            <h2 className="text-heading font-semibold">{t("pendingTitle")}</h2>
            <p className="mt-2 text-ink-2">{t("pendingBody")}</p>
          </div>
        ) : null}

        {view === "approved" ? (
          <div className="card max-w-2xl p-6 sm:p-8">
            <div className="flex flex-col items-start gap-3">
              <h2 className="text-heading font-semibold">{t("approvedTitle")}</h2>
              <p className="text-ink-2">{t("approvedBody")}</p>
              <Button href="/mentor" variant="primary">
                {t("approvedCta")}
              </Button>
            </div>
          </div>
        ) : null}

        {view === "declined" ? (
          <div className="card max-w-2xl p-6 sm:p-8">
            <div className="flex flex-col items-start gap-3">
              <h2 className="text-heading font-semibold">{t("declinedTitle")}</h2>
              <p className="text-ink-2">{t("declinedBody")}</p>
              <Button href="/contact" variant="secondary">
                {t("declinedCta")}
              </Button>
            </div>
          </div>
        ) : null}

        {view === "error" ? (
          <Notice tone="error" className="max-w-2xl">
            <p>{t("loadError")}</p>
            <div className="mt-3">
              <Button href="/mentor/volunteer" variant="secondary">
                {t("retry")}
              </Button>
            </div>
          </Notice>
        ) : null}

        {view === "form" ? (
          <>
            <p className="max-w-2xl text-ink-2 text-pretty">{t("intro")}</p>
            <VolunteerForm />
          </>
        ) : null}
      </div>
    </div>
  );
}
