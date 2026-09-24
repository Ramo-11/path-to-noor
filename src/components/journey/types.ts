import type { getTranslations } from "next-intl/server";

export type Translate = Awaited<ReturnType<typeof getTranslations>>;
