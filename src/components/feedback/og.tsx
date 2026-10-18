import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { getTranslations } from "next-intl/server";
import type { StageKey } from "@/lib/stages";

export const OG_SIZE = { width: 1200, height: 630 };
export const OG_CONTENT_TYPE = "image/png";

const INK = "#1d2140";
const INK_2 = "#4b5070";
const PRIMARY = "#2b3990";
const PRIMARY_TINT = "#e9ecfa";

const STAGE_LOOK: Record<StageKey, { glow: string; tint: string; text: string; solid: string }> = {
  beginning: { glow: "#ffe3d3", tint: "#ffeee7", text: "#b5472c", solid: "#f07c5e" },
  foundations: { glow: "#dcf0f7", tint: "#e4f5ec", text: "#1e7a52", solid: "#218358" },
  deeper: { glow: "#e3e1fa", tint: "#ecebfa", text: "#4b45a8", solid: "#4b45a8" },
};

const DEFAULT_LOOK = { glow: "#ffe3d3", tint: PRIMARY_TINT, text: PRIMARY, solid: PRIMARY };

let fontCache: Promise<{ regular: Buffer; semibold: Buffer }> | null = null;

function loadFonts() {
  if (!fontCache) {
    const dir = path.join(process.cwd(), "src", "assets", "fonts");
    fontCache = Promise.all([
      readFile(path.join(dir, "ReadexPro-400.ttf")),
      readFile(path.join(dir, "ReadexPro-600.ttf")),
    ]).then(([regular, semibold]) => ({ regular, semibold }));
    fontCache.catch(() => {
      fontCache = null;
    });
  }
  return fontCache;
}

function clip(text: string, max: number): string {
  const clean = text.replace(/\s+/g, " ").trim();
  return clean.length > max ? `${clean.slice(0, max - 1).trimEnd()}...` : clean;
}

function titleSize(text: string): number {
  if (text.length <= 28) return 84;
  if (text.length <= 50) return 70;
  if (text.length <= 80) return 58;
  return 48;
}

function Words({ text, rtl, size, style }: { text: string; rtl: boolean; size: number; style: Record<string, string | number> }) {
  if (!rtl) return <div style={{ display: "flex", fontSize: size, ...style }}>{text}</div>;
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "row-reverse",
        flexWrap: "wrap",
        columnGap: size * 0.28,
        fontSize: size,
        ...style,
      }}
    >
      {text.split(" ").map((word, index) => (
        <div key={index} style={{ display: "flex" }}>
          {word}
        </div>
      ))}
    </div>
  );
}

interface OgOptions {
  locale: string;
  title?: string;
  kind?: "lesson" | "path";
  stage?: StageKey;
}

export async function renderOgImage({ locale, title, kind, stage }: OgOptions) {
  const [t, tStages, fonts] = await Promise.all([
    getTranslations({ locale, namespace: "feedback.og" }),
    getTranslations({ locale, namespace: "stages" }),
    loadFonts(),
  ]);

  const rtl = locale === "ar";
  const look = stage ? STAGE_LOOK[stage] : DEFAULT_LOOK;
  const heading = clip(title || t("tagline"), 110);
  const label = kind === "lesson" ? t("lesson") : kind === "path" ? t("path") : null;
  const stageName = stage ? tStages(`${stage}.name`) : null;
  const side = rtl ? { left: 56 } : { right: 56 };

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          alignItems: rtl ? "flex-end" : "flex-start",
          padding: "56px 72px 60px",
          position: "relative",
          fontFamily: "Readex Pro",
          backgroundImage: `linear-gradient(180deg, ${look.glow} 0%, #ffffff 78%)`,
        }}
      >
        <div
          style={{
            position: "absolute",
            bottom: 0,
            display: "flex",
            ...side,
          }}
        >
          <svg width="340" height="340" viewBox="0 0 32 32">
            <path d="M8.5 20.5a7.5 7.5 0 0 1 15 0Z" fill="#F07C5E" />
            <path
              d="M16 7.5v3M8.9 10.4l2 2M23.1 10.4l-2 2"
              stroke="#E9A21F"
              strokeWidth="2"
              strokeLinecap="round"
              fill="none"
            />
            <path d="M6.5 21h19" stroke="#2B3990" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </div>

        <div style={{ display: "flex", flexDirection: rtl ? "row-reverse" : "row", alignItems: "center", gap: 16 }}>
          <svg width="56" height="56" viewBox="0 0 32 32">
            <path d="M8.5 20.5a7.5 7.5 0 0 1 15 0Z" fill="#F07C5E" />
            <path
              d="M16 7.5v3M8.9 10.4l2 2M23.1 10.4l-2 2"
              stroke="#E9A21F"
              strokeWidth="2"
              strokeLinecap="round"
              fill="none"
            />
            <path d="M6.5 21h19" stroke="#2B3990" strokeWidth="2" strokeLinecap="round" />
          </svg>
          <div style={{ display: "flex", fontSize: 34, fontWeight: 600, color: INK }}>{t("site")}</div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", alignItems: rtl ? "flex-end" : "flex-start", maxWidth: 780 }}>
          {label || stageName ? (
            <div style={{ display: "flex", flexDirection: rtl ? "row-reverse" : "row", gap: 12, marginBottom: 28 }}>
              {label ? (
                <div
                  style={{
                    display: "flex",
                    padding: "8px 22px",
                    borderRadius: 999,
                    background: PRIMARY_TINT,
                    color: PRIMARY,
                    fontSize: 26,
                    fontWeight: 600,
                  }}
                >
                  <Words text={label} rtl={rtl} size={26} style={{ fontWeight: 600 }} />
                </div>
              ) : null}
              {stageName ? (
                <div
                  style={{
                    display: "flex",
                    flexDirection: rtl ? "row-reverse" : "row",
                    alignItems: "center",
                    gap: 10,
                    padding: "8px 22px",
                    borderRadius: 999,
                    background: look.tint,
                    color: look.text,
                    fontSize: 26,
                    fontWeight: 600,
                  }}
                >
                  <div style={{ display: "flex", width: 14, height: 14, borderRadius: 999, background: look.solid }} />
                  <Words text={stageName} rtl={rtl} size={26} style={{ fontWeight: 600 }} />
                </div>
              ) : null}
            </div>
          ) : null}
          <Words
            text={heading}
            rtl={rtl}
            size={titleSize(heading)}
            style={{ fontWeight: 600, lineHeight: 1.25, color: INK, letterSpacing: rtl ? 0 : -1.5 }}
          />
        </div>

        <Words text={label ? t("tagline") : ""} rtl={rtl} size={28} style={{ color: INK_2, fontWeight: 400 }} />
      </div>
    ),
    {
      ...OG_SIZE,
      fonts: [
        { name: "Readex Pro", data: fonts.regular, weight: 400, style: "normal" },
        { name: "Readex Pro", data: fonts.semibold, weight: 600, style: "normal" },
      ],
    }
  );
}
