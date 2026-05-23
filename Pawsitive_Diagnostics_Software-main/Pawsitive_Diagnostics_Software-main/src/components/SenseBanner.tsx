import { useLanguage } from "@/context/LanguageContext";

/**
 * Shared sense-page banner. Soft pastel gradient, dark navy title,
 * subtle kanji watermark, white LIVE pill. Flat bottom edge, 150px tall.
 */
export function SenseBanner({
  subtitleJp,
  titleEn,
  descriptorJp,
  descriptorEn,
  bgGradient,
  kanji,
  kanjiColor,
  subtitleColor,
}: {
  subtitleJp: string;
  titleEn: string;
  descriptorJp: string;
  descriptorEn: string;
  bgGradient: string;
  kanji: string;
  kanjiColor: string;
  subtitleColor: string;
}) {
  const { language } = useLanguage();
  const descriptor = language === "japanese" ? descriptorJp : descriptorEn;
  return (
    <>
      <style>{`
        @keyframes sbLiveDot { 0%,100%{transform:scale(1);opacity:1} 50%{transform:scale(1.3);opacity:.55} }
      `}</style>
      <div
        style={{
          position: "relative",
          zIndex: 1,
          height: 186,
          padding: "20px 20px 36px 20px",
          background: bgGradient,
          overflow: "hidden",
          boxSizing: "border-box",
        }}
      >
        <span
          aria-hidden
          style={{
            position: "absolute",
            right: -10,
            top: 10,
            fontSize: 120,
            lineHeight: 1,
            fontFamily: "var(--font-heading)", fontWeight: 600,
            color: kanjiColor,
            pointerEvents: "none",
            userSelect: "none",
            fontFamily: "'Noto Serif JP', serif",
          }}
        >
          {kanji}
        </span>
        <div
          style={{
            position: "relative",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            gap: 12,
          }}
        >
          <div style={{ minWidth: 0 }}>
            <div
              style={{
                fontSize: 13,
                fontWeight: 400,
                color: subtitleColor,
                letterSpacing: "0.08em",
                lineHeight: 1.2,
              }}
            >
              {subtitleJp}
            </div>
            <div
              style={{
                fontSize: 26,
                fontFamily: "var(--font-heading)", fontWeight: 600,
                color: "#1A1A2E",
                lineHeight: 1.15,
                marginTop: 4,
                letterSpacing: "-0.01em",
              }}
            >
              {titleEn}
            </div>
            <div
              style={{
                fontSize: 13,
                fontWeight: 400,
                color: "#6B7280",
                marginTop: 6,
                lineHeight: 1.3,
              }}
            >
              {descriptor}
            </div>
          </div>
          <span
            className="inline-flex items-center"
            style={{
              flexShrink: 0,
              background: "#FFFFFF",
              color: "#1A1A2E",
              borderRadius: 50,
              padding: "5px 11px 5px 9px",
              fontSize: 11,
              fontFamily: "var(--font-heading)", fontWeight: 600,
              letterSpacing: "0.1em",
              gap: 6,
              boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
            }}
          >
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: "#E53935",
                animation: "sbLiveDot 1.5s ease-in-out infinite",
              }}
            />
            LIVE
          </span>
        </div>
      </div>
    </>
  );
}
