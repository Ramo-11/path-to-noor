import { Suspense } from "react";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { PageIntro } from "@/components/primer/PageIntro";
import { Spinner } from "@/components/primer/Spinner";
import { SearchView } from "@/components/search/SearchView";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "search" });
  return { title: t("title"), robots: { index: false } };
}

export default async function SearchPage() {
  const t = await getTranslations("search");

  return (
    <div className="mx-auto w-full max-w-3xl px-4 sm:px-6 lg:px-8">
      <PageIntro title={t("title")} lead={t("lead")} />
      <div className="pb-16 sm:pb-24">
        <Suspense
          fallback={
            <div className="flex justify-center py-12">
              <Spinner className="text-ink-2" />
            </div>
          }
        >
          <SearchView />
        </Suspense>
      </div>
    </div>
  );
}
