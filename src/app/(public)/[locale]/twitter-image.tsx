import { OG_CONTENT_TYPE, OG_SIZE, renderOgImage } from "@/components/feedback/og";

export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = "Basmet Dawah";

export default async function Image({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return renderOgImage({ locale });
}
