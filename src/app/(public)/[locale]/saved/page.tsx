import { getTranslations, setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { PageIntro } from "@/components/primer/PageIntro";
import { Button } from "@/components/primer/Button";
import { EmptyState } from "@/components/primer/EmptyState";
import { SavedMember } from "@/components/saved/SavedMember";

export const revalidate = 3600;

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function SavedPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("saved");
  const tCommon = await getTranslations("common");

  return (
    <SavedMember>
      <div className="mx-auto w-full max-w-3xl px-4 sm:px-6 lg:px-8">
        <PageIntro title={t("title")} />
        <div className="pb-16 sm:pb-24">
          <EmptyState
            title={t("signInTitle")}
            body={t("signInBody")}
            action={
              <div className="flex flex-wrap gap-3">
                <Button href="/login">{tCommon("signIn")}</Button>
                <Button href="/register" variant="secondary">
                  {tCommon("createAccount")}
                </Button>
              </div>
            }
            art="saved"
          />
        </div>
      </div>
    </SavedMember>
  );
}
