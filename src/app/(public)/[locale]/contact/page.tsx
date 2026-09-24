import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { PageBanner } from "@/components/primer/PageBanner";
import { ContactForm } from "@/components/contact/ContactForm";
import { ContactFaq } from "@/components/contact/ContactFaq";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "contact" });
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
  };
}

export default async function ContactPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  await params;
  const t = await getTranslations("contact");

  return (
    <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
      <PageBanner title={t("title")} lead={t("lead")} art="lib-dawah" tone="dawn" />
      <div className="grid grid-cols-1 gap-12 pt-10 pb-24 lg:grid-cols-2 lg:gap-16">
        <ContactForm />
        <ContactFaq />
      </div>
    </div>
  );
}
