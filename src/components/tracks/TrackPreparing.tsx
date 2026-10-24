import { useTranslations } from "next-intl";
import { Button } from "@/components/primer/Button";
import { Illustration } from "@/components/primer/Illustration";

interface TrackPreparingProps {
  title?: string;
  askLink?: boolean;
  compact?: boolean;
}

export function TrackPreparing({ title, askLink = false, compact = false }: TrackPreparingProps) {
  const t = useTranslations("tracks.preparing");

  return (
    <div className={`card flex flex-col overflow-hidden ${compact ? "" : "shadow-lift"}`}>
      <div className={`overflow-hidden ${compact ? "aspect-[16/9]" : "aspect-[16/8]"}`}>
        <Illustration name="lantern" sizes="(min-width: 1024px) 540px, 100vw" />
      </div>
      <div className="flex flex-1 flex-col p-6 sm:p-8">
        {title ? <p className="text-meta font-medium text-ink-3">{title}</p> : null}
        <p className={`text-heading font-semibold text-balance ${title ? "mt-1.5" : ""}`}>{t("title")}</p>
        <p className="mt-2 max-w-[46ch] text-ink-2 text-pretty">{t("body")}</p>
        <div className="mt-6 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:gap-6">
          <Button href="/library" variant="secondary" className="w-full sm:w-auto">
            {t("library")}
          </Button>
          {askLink ? (
            <Button href="/contact?topic=question" variant="quiet" className="self-center sm:self-auto">
              {t("ask")}
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
