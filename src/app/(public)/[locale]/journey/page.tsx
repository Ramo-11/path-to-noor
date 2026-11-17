import { getTranslations, setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { Button } from "@/components/primer/Button";
import { EmptyState } from "@/components/primer/EmptyState";
import { JourneyRegion } from "@/components/journey/JourneyRegion";
import { TrackPrimaryLink } from "@/components/tracks/TrackPrimaryLink";

export const revalidate = 3600;

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function JourneyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("journey");

  return (
    <JourneyRegion>
      <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
        <EmptyState
          art="journey"
          title={t("guestTitle")}
          body={t("guestBody")}
          action={
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Button href="/login" variant="primary">
                {t("signIn")}
              </Button>
              <Button href="/register" variant="secondary">
                {t("createAccount")}
              </Button>
              <TrackPrimaryLink />
            </div>
          }
        />
      </div>
    </JourneyRegion>
  );
}
