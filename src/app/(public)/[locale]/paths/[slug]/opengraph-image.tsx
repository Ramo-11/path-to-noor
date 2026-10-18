import { OG_CONTENT_TYPE, OG_SIZE, renderOgImage } from "@/components/feedback/og";
import { getPathOutlineBySlug } from "@/lib/learning";
import { localized } from "@/lib/stages";

export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = "Basmet Dawah";

export default async function Image({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params;
  const path = await getPathOutlineBySlug(slug, new Set(), { isGuest: true }).catch(() => null);
  if (!path) return renderOgImage({ locale });
  return renderOgImage({
    locale,
    kind: "path",
    title: localized(path.title, locale),
    stage: path.stage,
  });
}
