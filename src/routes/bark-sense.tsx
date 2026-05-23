import { createFileRoute } from "@tanstack/react-router";
import AppShell, { TopBar } from "@/components/AppShell";
import { SenseBanner } from "@/components/SenseBanner";
import { useLanguage } from "@/context/LanguageContext";
import { usePet, displayName } from "@/context/PetContext";
import { useEffect, useState, type CSSProperties, type ReactNode } from "react";

export const Route = createFileRoute("/bark-sense")({ component: BarkSensePage });

type Lang = "english" | "japanese" | "mixed";

// Soft pastel purple palette for this page
const P = {
  primary: "#5BAFD6",   // primary accent
  deep:    "#2C4A6E",   // ai card bg
  mid:     "#5BAFD6",   // primary accent
  soft:    "#D6EAF5",   // track/tint
  pale:    "#EAF2F8",   // page background
  accent:  "#6B8FA8",   // subtext/labels
  muted:   "#D6EAF5",   // track/tint
  light:   "#7EC8E3",   // secondary accent
  darker:  "#3A87B0",   // accent deep
};

type EmotionKey =
  | "contentment" | "joy" | "affection" | "excitement"
  | "distress" | "fear" | "disgust" | "suspicion" | "anger";

const EMO: Record<EmotionKey, { jp: string; en: string; color: string }> = {
  contentment: { jp: "穏やか",   en: "Contentment", color: "#6DBA91" },
  joy:         { jp: "喜び",     en: "Joy",         color: "#FCD34D" },
  affection:   { jp: "愛情",     en: "Affection",   color: "#F472B6" },
  excitement:  { jp: "興奮",     en: "Excitement",  color: "#F59E0B" },
  distress:    { jp: "苦悩",     en: "Distress",    color: "#EF4444" },
  fear:        { jp: "恐れ",     en: "Fear",        color: "#94A3B8" },
  disgust:     { jp: "嫌悪",     en: "Disgust",     color: "#65A30D" },
  suspicion:   { jp: "警戒",     en: "Suspicion",   color: "#A78BFA" },
  anger:       { jp: "怒り",     en: "Anger",       color: "#DC2626" },
};
const RADAR_ORDER: EmotionKey[] = [
  "excitement","contentment","distress","disgust","fear","anger","joy","suspicion","affection",
];

function pickT(lang: Lang, jp: string, en: string) {
  if (lang === "english") return en;
  if (lang === "japanese") return jp;
  return `${jp} / ${en}`;
}

function Section({ children, style }: { children: ReactNode; style?: CSSProperties }) {
  return (
    <section
      style={{
        background: "#FFFFFF",
        borderRadius: 16,
        padding: 20,
        width: "100%",
        boxSizing: "border-box",
        overflow: "hidden",
        boxShadow: "0 2px 12px rgba(91, 175, 214, 0.10)",
        ...style,
      }}
    >
      {children}
    </section>
  );
}

function Label({ lang, jp, en }: { lang: Lang; jp: string; en: string }) {
  return (
    <div
      style={{
        color: P.accent,
        fontSize: 11,
        fontFamily: "var(--font-heading)", fontWeight: 600,
        letterSpacing: "0.14em",
        textTransform: "uppercase",
      }}
    >
      {pickT(lang, jp, en)}
    </div>
  );
}

function BarkSensePage() {
  const { language } = useLanguage();
  const lang = language as Lang;
  const { pet } = usePet();
  const dogName = displayName(pet, "Fluffy");

  const [mounted, setMounted] = useState(false);
  useEffect(() => { const t = setTimeout(() => setMounted(true), 30); return () => clearTimeout(t); }, []);

  // Mood breakdown
  const mood: { key: EmotionKey; pct: number }[] = [
    { key: "contentment", pct: 68 },
    { key: "joy", pct: 16 },
    { key: "affection", pct: 9 },
    { key: "distress", pct: 4 },
    { key: "suspicion", pct: 3 },
  ];

  // Radar layout (sized so labels stay fully inside the card)
  const radarSize = 240;
  const center = radarSize / 2;
  const blobRadius = center - 52;
  const labelRadius = center - 38;

  // 24h activity
  const hours = Array.from({ length: 24 }, (_, h) => {
    const noise = Math.sin(h * 1.3) + Math.cos(h * 0.7);
    let level = 0;
    if (h >= 6 && h <= 8) level = 2;
    else if (h >= 9 && h <= 11) level = 1;
    else if (h >= 12 && h <= 14) level = 2;
    else if (h >= 15 && h <= 17) level = 3;
    else if (h >= 18 && h <= 20) level = 2;
    else if (h >= 21 && h <= 23) level = 1;
    else level = 0;
    if (noise > 1.2) level = Math.min(3, level + 1);
    return level;
  });
  // Bark activity bars (low → peak) in pastel purples
  const heatColors = ["#E8E3FF", "#C2B5F0", "#9B8EC4", "#8B7DBF"];
  const nowHour = 14;

  // Donut
  const donut = [
    { key: "contentment" as EmotionKey, pct: 55, trend: "+8%" },
    { key: "joy" as EmotionKey, pct: 18, trend: "+1%" },
    { key: "affection" as EmotionKey, pct: 12, trend: "+2%" },
    { key: "excitement" as EmotionKey, pct: 7, trend: "0%" },
    { key: "distress" as EmotionKey, pct: 5, trend: "-3%" },
    { key: "suspicion" as EmotionKey, pct: 3, trend: "-1%" },
  ];
  const donutR = 64;
  const donutC = 2 * Math.PI * donutR;
  let donutOffset = 0;

  // Week journey
  const week: { jp: string; en: string; emotion: EmotionKey; rangeJp: string; rangeEn: string; today?: boolean }[] = [
    { jp: "月", en: "Mon", emotion: "contentment", rangeJp: "9:00–18:00", rangeEn: "09:00–18:00" },
    { jp: "火", en: "Tue", emotion: "joy",         rangeJp: "10:00–14:00", rangeEn: "10:00–14:00" },
    { jp: "水", en: "Wed", emotion: "affection",   rangeJp: "15:00–17:30", rangeEn: "15:00–17:30" },
    { jp: "木", en: "Thu", emotion: "contentment", rangeJp: "終日", rangeEn: "All day" },
    { jp: "金", en: "Fri", emotion: "excitement",  rangeJp: "夕方", rangeEn: "Evening" },
    { jp: "土", en: "Sat", emotion: "suspicion",   rangeJp: "夜",   rangeEn: "Night" },
    { jp: "日", en: "Sun", emotion: "contentment", rangeJp: "現在", rangeEn: "Now", today: true },
  ];

  return (
    <AppShell
      noPadding
      renderTopBar={({ menuOpen, onMenuClick }) => (
        <TopBar showBack backTo="/home" menuOpen={menuOpen} onMenuClick={onMenuClick} />
      )}
    >
      <style>{`
        @keyframes bsHeroFade { from { opacity: 0; transform: translateY(8px);} to { opacity: 1; transform: translateY(0);} }
        @keyframes bsPulseRing { 0% { transform: scale(0.8); opacity: 0.7;} 80% { transform: scale(2.4); opacity: 0;} 100% { opacity: 0;} }
        @keyframes bsLiveDot { 0%,100% { opacity: 1;} 50% { opacity: 0.35;} }
        @keyframes bsWave {
          0%, 100% { transform: scaleY(0.4); }
          50% { transform: scaleY(1); }
        }
        @keyframes bsSignal {
          0% { transform: translateX(-30%); }
          100% { transform: translateX(30%); }
        }
        @keyframes bsBarFill { from { width: 0%; } }
        @keyframes bsFadeUp { from { opacity: 0; transform: translateY(10px);} to { opacity: 1; transform: translateY(0);} }
        .bs-bar { animation: bsBarFill 1.1s cubic-bezier(.2,.8,.2,1) both; }
        .bs-fade { animation: bsFadeUp .6s ease-out both; }
        .bs-wave-bar { transform-origin: center; animation: bsWave 1.3s ease-in-out infinite; }
      `}</style>

      <div
        style={{
          background: P.pale,
          minHeight: "100%",
          paddingBottom: 110,
          position: "relative",
        }}
      >
        {/* Ambient background blobs (purple) */}
        <div aria-hidden style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: 240, left: -60, width: 220, height: 220, borderRadius: "50%", background: P.accent, filter: "blur(80px)", opacity: 0.18 }} />
          <div style={{ position: "absolute", top: 620, right: -80, width: 260, height: 260, borderRadius: "50%", background: P.primary, filter: "blur(90px)", opacity: 0.16 }} />
          <div style={{ position: "absolute", top: 1100, left: -40, width: 200, height: 200, borderRadius: "50%", background: P.light, filter: "blur(80px)", opacity: 0.22 }} />
        </div>

        {/* HERO */}
        <SenseBanner
          subtitleJp="バークセンス AI"
          titleEn="BarkSense AI"
          descriptorJp="鳴き声から感情を解析"
          descriptorEn="Emotion from bark patterns"
          bgGradient="linear-gradient(135deg,#F5F0FF 0%,#EDE9FE 100%)"
          kanji="声"
          kanjiColor="rgba(139,92,246,0.06)"
          subtitleColor="#9B8EC4"
        />

        {/* Redesigned hero stats bar */}
        <HeroStatsBar
          lang={lang}
          dogName={dogName}
          emotion="calm"
          confidence={94}
          barkSamples={128}
          deltaYesterday={12}
          sparkline={[14, 18, 12, 22, 30, 24, 28]}
          trendJp="過去30分で増加傾向"
          trendEn="Increasing past 30 min"
          timestamp="14:32"
          live
        />



        {/* CARDS */}
        <div style={{ padding: "16px 16px 0", display: "flex", flexDirection: "column", gap: 18, position: "relative" }}>

          {/* CARD 1 - Emotion Radar */}
          <Section
            style={{
              borderLeftColor: P.primary,
              animation: "bsFadeUp .6s ease-out .15s both",
            }}
          >
            <Label lang={lang} jp="感情レーダー" en="Emotion Radar" />
            <div style={{ marginTop: 4, color: "#1A1A2E", fontSize: 17, fontFamily: "var(--font-heading)", fontWeight: 600 }}>
              {pickT(lang, "今のサウンドマップ", "Acoustic emotion map")}
            </div>

            <div style={{ position: "relative", width: "100%", marginTop: 14, display: "flex", justifyContent: "center" }}>
              <svg viewBox={`0 0 ${radarSize} ${radarSize}`} style={{ width: "100%", maxWidth: 200, overflow: "hidden" }}>
                {/* concentric circles */}
                {[1, 2, 3].map((i) => (
                  <circle
                    key={i}
                    cx={center} cy={center}
                    r={(blobRadius * i) / 3}
                    fill="none"
                    stroke="rgba(124,58,237,0.08)"
                    strokeWidth={1}
                  />
                ))}
                {/* radial guides */}
                {RADAR_ORDER.map((_, i) => {
                  const a = (i / RADAR_ORDER.length) * Math.PI * 2 - Math.PI / 2;
                  return (
                    <line
                      key={i}
                      x1={center} y1={center}
                      x2={center + Math.cos(a) * blobRadius}
                      y2={center + Math.sin(a) * blobRadius}
                      stroke="rgba(124,58,237,0.06)"
                      strokeWidth={1}
                    />
                  );
                })}
                {/* emotion blobs */}
                {RADAR_ORDER.map((k, i) => {
                  const a = (i / RADAR_ORDER.length) * Math.PI * 2 - Math.PI / 2;
                  const r = blobRadius * 0.78;
                  const x = center + Math.cos(a) * r;
                  const y = center + Math.sin(a) * r;
                  const isCurrent = k === "contentment";
                  return (
                    <circle
                      key={k}
                      cx={x} cy={y}
                      r={isCurrent ? 22 : 16}
                      fill={EMO[k].color}
                      opacity={isCurrent ? 0.45 : 0.18}
                      style={{ filter: "blur(6px)" }}
                    />
                  );
                })}
                {/* line to marker */}
                {(() => {
                  const i = RADAR_ORDER.indexOf("contentment");
                  const a = (i / RADAR_ORDER.length) * Math.PI * 2 - Math.PI / 2;
                  const r = blobRadius * 0.78;
                  const x = center + Math.cos(a) * r;
                  const y = center + Math.sin(a) * r;
                  return (
                    <>
                      <path
                        d={`M ${center} ${center} Q ${(center + x) / 2 + 10} ${(center + y) / 2 - 10} ${x} ${y}`}
                        stroke="#6DBA91" strokeWidth={1.2} fill="none" strokeDasharray="3 3" opacity={0.7}
                      />
                      <circle cx={x} cy={y} r={7} fill="#6DBA91" style={{ filter: "drop-shadow(0 0 6px rgba(109,186,145,0.6))" }} />
                      <circle cx={x} cy={y} r={11} fill="none" stroke="rgba(109,186,145,0.25)" strokeWidth={4} />
                      <circle cx={x} cy={y} r={6} fill="none" stroke="#6DBA91" strokeWidth={2} style={{ transformOrigin: `${x}px ${y}px`, animation: "bsPulseRing 2s ease-out infinite" }} />
                    </>
                  );
                })()}

                {/* center glass card */}
                <circle cx={center} cy={center} r={38} fill="white" stroke="rgba(139,125,191,0.10)" />
                <circle cx={center} cy={center} r={38} fill="none" stroke="rgba(139,125,191,0.10)" strokeWidth={6} />

                {/* labels (centered anchor so text stays inside the card) */}
                {RADAR_ORDER.map((k, i) => {
                  const a = (i / RADAR_ORDER.length) * Math.PI * 2 - Math.PI / 2;
                  const x = center + Math.cos(a) * labelRadius;
                  const y = center + Math.sin(a) * labelRadius;
                  return (
                    <g key={k} transform={`translate(${x}, ${y})`}>
                      <text
                        textAnchor="middle"
                        dominantBaseline="middle"
                        fontSize={9}
                        fontWeight={k === "contentment" ? 700 : 500}
                        fill={k === "contentment" ? "#1A1A2E" : "#6B7280"}
                      >
                        {lang === "english" ? EMO[k].en : EMO[k].jp}
                      </text>
                      {lang === "mixed" && (
                        <text textAnchor="middle" dominantBaseline="middle" y={9} fontSize={7} fill="#9CA3AF">
                          {EMO[k].en}
                        </text>
                      )}
                    </g>
                  );
                })}
              </svg>

              {/* center content overlay */}
              <div
                style={{
                  position: "absolute",
                  left: "50%", top: "50%",
                  transform: "translate(-50%, -50%)",
                  display: "flex", flexDirection: "column", alignItems: "center",
                  pointerEvents: "none",
                }}
              >
                <div style={{ display: "flex", alignItems: "flex-end", gap: 3, height: 22 }}>
                  {[0.5, 0.8, 1, 0.8, 0.5].map((h, i) => (
                    <div
                      key={i}
                      className="bs-wave-bar"
                      style={{
                        width: 3, height: 22 * h,
                        borderRadius: 2,
                        background: `linear-gradient(180deg, ${P.accent} 0%, #6DBA91 100%)`,
                        animationDelay: `${i * 0.12}s`,
                      }}
                    />
                  ))}
                </div>
                <div style={{ marginTop: 6, fontSize: 14, fontFamily: "var(--font-heading)", fontWeight: 600, color: "#1A1A2E" }}>
                  {pickT(lang, "穏やか", "Contentment")}
                </div>
                <div style={{ fontSize: 10, color: "#6B7280", fontWeight: 600 }}>94%</div>
              </div>
            </div>

            {/* Live bark signal strip */}
            <div style={{ marginTop: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                <div style={{ fontSize: 11, color: P.accent, fontFamily: "var(--font-heading)", fontWeight: 600, letterSpacing: "0.06em" }}>
                  {pickT(lang, "ライブ波形", "Live bark signal")}
                </div>
                <div style={{
                  display: "inline-flex", alignItems: "center", gap: 5,
                  background: P.soft, color: P.primary,
                  padding: "3px 9px", borderRadius: 999, fontSize: 10, fontFamily: "var(--font-heading)", fontWeight: 600,
                }}>
                  <span style={{ width: 5, height: 5, borderRadius: "50%", background: P.primary, animation: "bsLiveDot 1.4s ease-in-out infinite" }} />
                  {pickT(lang, "解析中", "Analyzing")}
                </div>
              </div>
              <div style={{
                height: 44, borderRadius: 14,
                background: `linear-gradient(90deg, ${P.soft}, rgba(124,58,237,0.08))`,
                position: "relative", overflow: "hidden",
                border: "1px solid rgba(124,58,237,0.10)",
              }}>
                <svg viewBox="0 0 300 44" preserveAspectRatio="none" style={{ width: "200%", height: "100%", animation: "bsSignal 6s linear infinite" }}>
                  {Array.from({ length: 60 }).map((_, i) => {
                    const h = 6 + Math.abs(Math.sin(i * 0.7) + Math.cos(i * 0.31)) * 14;
                    return (
                      <rect
                        key={i}
                        x={i * 5} y={22 - h / 2}
                        width={2} height={h} rx={1}
                        fill={`url(#bsGrad)`}
                      />
                    );
                  })}
                  <defs>
                    <linearGradient id="bsGrad" x1="0" x2="1">
                      <stop offset="0%" stopColor={P.light} />
                      <stop offset="100%" stopColor={P.primary} />
                    </linearGradient>
                  </defs>
                </svg>
              </div>
            </div>
          </Section>

          {/* CARD 2 - Today's mood */}
          <Section style={{ animation: "bsFadeUp .6s ease-out .2s both" }}>
            <Label lang={lang} jp="今日のムード" en="Today's Mood" />
            <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: 18, marginTop: 14, alignItems: "center" }}>
              <div style={{ textAlign: "center", minWidth: 96 }}>
                <div style={{
                  fontSize: 44, fontFamily: "var(--font-heading)", fontWeight: 600, color: P.primary,
                  lineHeight: 1, letterSpacing: "-0.02em",
                }}>68%</div>
                <div style={{ fontSize: 11, color: "#6B7280", fontWeight: 600, marginTop: 6 }}>
                  {pickT(lang, "穏やか", "Calm state")}
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {mood.map((m, i) => (
                  <div key={m.key}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, marginBottom: 3 }}>
                      <span style={{ color: "#1A1A2E", fontWeight: 600 }}>
                        {lang === "english" ? EMO[m.key].en : EMO[m.key].jp}
                      </span>
                      <span style={{ color: "#6B7280" }}>{m.pct}%</span>
                    </div>
                    <div style={{ height: 6, background: P.soft, borderRadius: 99, overflow: "hidden" }}>
                      <div
                        className="bs-bar"
                        style={{
                          width: mounted ? `${m.pct}%` : 0,
                          height: "100%",
                          background: EMO[m.key].color,
                          borderRadius: 99,
                          transition: "width 1s cubic-bezier(.2,.8,.2,1)",
                          animationDelay: `${i * 0.08}s`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ marginTop: 14, padding: 12, background: P.pale, borderRadius: 14, fontSize: 12, color: "#1A1A2E", lineHeight: 1.5 }}>
              {lang === "english" && (
                <>{dogName} has been mostly calm today, with short affectionate bursts in the afternoon.</>
              )}
              {lang === "japanese" && (
                <>{dogName}は本日ほとんど穏やかで、午後に短い愛情表現が見られました。</>
              )}
              {lang === "mixed" && (
                <>
                  <div>{dogName}は本日ほとんど穏やかで、午後に短い愛情表現が見られました。</div>
                  <div style={{ fontSize: 11, opacity: 0.75, marginTop: 4 }}>
                    {dogName} has been mostly calm today, with short affectionate bursts in the afternoon.
                  </div>
                </>
              )}
            </div>
          </Section>

          {/* CARD 3 - Emotion Journey */}
          <Section style={{ animation: "bsFadeUp .6s ease-out .25s both" }}>
            <Label lang={lang} jp="感情の軌跡" en="Emotion Journey" />
            <div style={{ marginTop: 4, color: "#1A1A2E", fontSize: 15, fontFamily: "var(--font-heading)", fontWeight: 600 }}>
              {pickT(lang, "今週の感情マップ", "This week")}
            </div>
            <div style={{ position: "relative", marginTop: 16 }}>
              <div style={{
                position: "absolute", left: 14, top: 14, bottom: 14,
                width: 2, background: P.light, borderRadius: 2,
              }} />
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {week.map((d, i) => (
                  <div
                    key={i}
                    className="bs-fade"
                    style={{
                      display: "flex", alignItems: "center", gap: 12,
                      animationDelay: `${0.05 * i}s`,
                    }}
                  >
                    <div style={{
                      width: 30, height: 30, borderRadius: "50%",
                      background: d.today ? P.primary : "white", flexShrink: 0,
                      border: d.today ? `2px solid ${P.primary}` : `1.5px solid ${P.light}`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 11, fontFamily: "var(--font-heading)", fontWeight: 600, color: d.today ? "white" : "#1A1A2E",
                boxShadow: d.today ? `0 0 0 3px rgba(124,58,237,0.2)` : "none",
                      position: "relative", zIndex: 1,
                    }}>
                      {lang === "english" ? d.en.slice(0, 1) : d.jp}
                    </div>
                    <div style={{
                      flex: 1,
                      background: d.today ? P.pale : "#FAFAF9",
                      borderRadius: 14, padding: "10px 12px",
                      border: d.today ? `1px solid ${P.muted}` : "1px solid rgba(0,0,0,0.04)",
                      boxShadow: d.today ? "0 8px 20px rgba(124,58,237,0.12)" : "none",
                      display: "flex", alignItems: "center", gap: 10,
                    }}>
                      <div style={{
                        width: 4, alignSelf: "stretch",
                        background: EMO[d.emotion].color, borderRadius: 4,
                      }} />
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                          <div style={{ fontSize: 13, fontFamily: "var(--font-heading)", fontWeight: 600, color: "#1A1A2E" }}>
                            {lang === "english" ? EMO[d.emotion].en : EMO[d.emotion].jp}
                            {lang === "mixed" && (
                              <span style={{ fontSize: 10, color: "#9CA3AF", marginLeft: 6, fontWeight: 500 }}>
                                {EMO[d.emotion].en}
                              </span>
                            )}
                          </div>
                          <div style={{ fontSize: 10, color: "#6B7280" }}>
                            {lang === "english" ? d.rangeEn : d.rangeJp}
                          </div>
                        </div>
                      </div>
                      {d.today && (
                        <div style={{
                          display: "inline-flex", alignItems: "center", gap: 4,
                          fontSize: 9, color: "white", fontFamily: "var(--font-heading)", fontWeight: 600, letterSpacing: "0.1em",
                          background: P.primary, padding: "3px 8px", borderRadius: 999,
                        }}>
                          <span style={{ width: 5, height: 5, borderRadius: "50%", background: "white", animation: "bsLiveDot 1.4s ease-in-out infinite" }} />
                          LIVE
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Section>

          {/* CARD 4 - Bark Activity */}
          <Section style={{ animation: "bsFadeUp .6s ease-out .3s both" }}>
            <Label lang={lang} jp="鳴き声アクティビティ" en="Bark Activity" />
            <div style={{ marginTop: 4, color: "#1A1A2E", fontSize: 15, fontFamily: "var(--font-heading)", fontWeight: 600 }}>
              {pickT(lang, "24時間のサウンド", "24-hour sound pattern")}
            </div>

            <div style={{ position: "relative", marginTop: 16 }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(24, 1fr)", gap: 3, height: 56, alignItems: "end" }}>
                {hours.map((lv, i) => (
                  <div
                    key={i}
                    style={{
                      background: heatColors[lv],
                      borderRadius: 4,
                      height: `${30 + lv * 22}%`,
                      animation: "bsFadeUp .4s ease-out both",
                      animationDelay: `${i * 0.012}s`,
                    }}
                    title={`${i}:00`}
                  />
                ))}
              </div>
              {/* Now marker */}
              <div style={{
                position: "absolute",
                left: `calc(${(nowHour + 0.5) / 24 * 100}% - 1px)`,
                top: -4, bottom: -4,
                width: 2, background: P.primary,
                boxShadow: `0 0 8px rgba(124,58,237,0.6)`,
              }}>
                <div style={{
                  position: "absolute", top: -16, left: "50%",
                  transform: "translateX(-50%)",
                  background: P.primary, color: "white",
                  fontSize: 9, fontFamily: "var(--font-heading)", fontWeight: 600, padding: "2px 6px", borderRadius: 6,
                  letterSpacing: "0.08em",
                }}>
                  {pickT(lang, "現在", "NOW")}
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", marginTop: 8, fontSize: 9, color: "#9CA3AF" }}>
                {["6", "9", "12", "15", "18", "21"].map((h) => (
                  <div key={h} style={{ textAlign: "left" }}>{h}:00</div>
                ))}
              </div>
            </div>

            <div style={{ marginTop: 14, display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
              {[
                { label: pickT(lang, "総鳴き声", "Total barks"), value: "128" },
                { label: pickT(lang, "最長静寂", "Longest calm"), value: "3h 20m" },
                { label: pickT(lang, "ピーク時刻", "Peak time"), value: "17:40" },
              ].map((s, i) => (
                <div key={i} style={{
                  background: P.pale, borderRadius: 12, padding: "10px 8px",
                  textAlign: "center",
                }}>
                  <div style={{ fontSize: 9, color: "#9CA3AF", fontWeight: 600, letterSpacing: "0.06em" }}>{s.label}</div>
                  <div style={{ fontSize: 14, color: "#1A1A2E", fontFamily: "var(--font-heading)", fontWeight: 600, marginTop: 4 }}>{s.value}</div>
                </div>
              ))}
            </div>
          </Section>

          {/* CARD 5 - Emotion Breakdown (Donut) */}
          <Section style={{ animation: "bsFadeUp .6s ease-out .35s both" }}>
            <Label lang={lang} jp="感情分布" en="Emotion Breakdown" />

            {/* Donut centered on top */}
            <div style={{ marginTop: 14, display: "flex", justifyContent: "center" }}>
              <div style={{ position: "relative", width: 180, height: 180 }}>
                <svg width="180" height="180" viewBox="0 0 180 180" style={{ transform: "rotate(-90deg)" }}>
                  <circle cx="90" cy="90" r={donutR} fill="none" stroke={P.soft} strokeWidth="22" />
                  {donut.map((d) => {
                    const len = (d.pct / 100) * donutC;
                    const off = donutOffset;
                    donutOffset += len;
                    return (
                      <circle
                        key={d.key}
                        cx="90" cy="90" r={donutR}
                        fill="none"
                        stroke={EMO[d.key].color}
                        strokeWidth="22"
                        strokeDasharray={`${mounted ? len : 0} ${donutC}`}
                        strokeDashoffset={-off}
                        style={{
                          transition: "stroke-dasharray 1.1s cubic-bezier(.2,.8,.2,1)",
                          filter: "drop-shadow(0 2px 4px rgba(139,125,191,0.18))",
                        }}
                      />
                    );
                  })}
                </svg>
                <div style={{
                  position: "absolute", inset: 0, display: "flex",
                  flexDirection: "column", alignItems: "center", justifyContent: "center",
                }}>
                  <div style={{ fontSize: 11, color: "#6B7280", fontWeight: 600 }}>
                    {pickT(lang, "穏やか", "Contentment")}
                  </div>
                  <div style={{ fontSize: 32, fontFamily: "var(--font-heading)", fontWeight: 600, color: P.primary, lineHeight: 1 }}>55%</div>
                </div>
              </div>
            </div>

            {/* Legend: 2-column grid below the donut, all 9 emotions */}
            {(() => {
              const byKey = Object.fromEntries(donut.map((d) => [d.key, d])) as Partial<Record<EmotionKey, { pct: number; trend: string }>>;
              const left: EmotionKey[] = ["contentment", "affection", "distress", "anger"];
              const right: EmotionKey[] = ["joy", "excitement", "fear", "disgust", "suspicion"];
              const renderRow = (k: EmotionKey) => {
                const d = byKey[k];
                const pct = d?.pct ?? 0;
                const trend = d?.trend ?? "0%";
                const trendColor = trend.startsWith("+") ? "#16A34A" : trend.startsWith("-") ? "#EF4444" : "#9CA3AF";
                const arrow = trend.startsWith("+") ? "▲" : trend.startsWith("-") ? "▼" : "■";
                return (
                  <div key={k} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, minWidth: 0 }}>
                    <span style={{ width: 8, height: 8, borderRadius: "50%", background: EMO[k].color, flexShrink: 0 }} />
                    <span style={{ color: "#1A1A2E", fontWeight: 600, flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {lang === "english" ? EMO[k].en : EMO[k].jp}
                    </span>
                    <span style={{ color: "#6B7280", fontVariantNumeric: "tabular-nums" }}>{pct}%</span>
                    <span style={{ fontSize: 10, fontFamily: "var(--font-heading)", fontWeight: 600, color: trendColor, display: "inline-flex", alignItems: "center", gap: 2 }}>
                      <span style={{ fontSize: 8 }}>{arrow}</span>
                    </span>
                  </div>
                );
              };
              return (
                <div style={{ marginTop: 18, display: "grid", gridTemplateColumns: "1fr 1fr", columnGap: 16, rowGap: 10 }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>{left.map(renderRow)}</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>{right.map(renderRow)}</div>
                </div>
              );
            })()}
          </Section>

          {/* CARD 6 - AI Insight */}
          <section
            style={{
              position: "relative",
              borderRadius: 16,
              padding: 22,
              background: "#2C4A6E",
              boxShadow: "0 2px 12px rgba(91, 175, 214, 0.10)",
              overflow: "hidden",
              animation: "bsFadeUp .6s ease-out .4s both",
            }}
          >
            {/* waveform watermark */}
            <svg aria-hidden viewBox="0 0 400 200" preserveAspectRatio="none"
              style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }}>
              {[30, 70, 110, 150, 190].map((y, i) => (
                <path
                  key={i}
                  d={`M0 ${y} Q 100 ${y - 14 + i * 3} 200 ${y} T 400 ${y}`}
                  stroke="rgba(255,255,255,0.05)"
                  strokeWidth={1}
                  fill="none"
                />
              ))}  

            </svg>
            <div
              aria-hidden
              style={{
                position: "absolute",
                right: -20,
                top: -20,
                fontSize: 140,
                color: "white",
                opacity: 0.06,
                fontFamily: "var(--font-heading)",
                fontWeight: 600,
                lineHeight: 1,
              }}
            >
              声
            </div>

            <div style={{ position: "relative", display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{
                fontSize: 11, color: "#FFFFFF",
                fontFamily: "var(--font-heading)", fontWeight: 600, letterSpacing: "0.1em",
              }}>AI INSIGHT</div>
              <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.15)" }} />
            </div>

            <div style={{ position: "relative", marginTop: 14, color: "white", fontSize: 14, lineHeight: 1.6 }}>
              {lang === "english" && (
                <>{dogName}'s bark pattern is calm and stable today. Short affectionate bursts were detected in the afternoon, but no stress signals were found.</>
              )}
              {lang === "japanese" && (
                <>{dogName}の鳴き声パターンは本日穏やかで安定しています。午後に短い愛情表現がありましたが、ストレスの兆候は検出されていません。</>
              )}
              {lang === "mixed" && (
                <>
                  <div>{dogName}の鳴き声パターンは本日穏やかで安定しています。</div>
                  <div style={{ fontSize: 12, opacity: 0.75, marginTop: 8 }}>
                    {dogName}'s bark pattern is calm and stable today.
                  </div>
                </>
              )}
            </div>

            <div style={{ position: "relative", marginTop: 16, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
              <div style={{
                display: "inline-flex", alignItems: "center", gap: 6,
                background: "rgba(109,186,145,0.20)", color: "#6DBA91",
                padding: "6px 12px", borderRadius: 999, fontSize: 11, fontFamily: "var(--font-heading)", fontWeight: 600,
                border: "1px solid rgba(109,186,145,0.40)",
              }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#6DBA91" }} />
                {pickT(lang, "感情状態は安定", "Stable emotional state")}
              </div>
              <div style={{ fontSize: 10, color: "rgba(255,255,255,0.45)" }}>
                {pickT(lang, "更新 14:32", "Updated 14:32")}
              </div>
            </div>
          </section>

        </div>
      </div>
    </AppShell>
  );
}

// ============================================================
// Hero Stats Bar — primary emotion card + confidence + samples
// ============================================================

type HeroEmotion =
  | "calm" | "joy" | "affection" | "distress"
  | "pain" | "suspicion" | "fear" | "aggression";

const HERO_EMO: Record<HeroEmotion, { jp: string; en: string; color: string; alert: boolean }> = {
  calm:       { jp: "穏やか",   en: "Calm",       color: "#7EC8A4", alert: false },
  joy:        { jp: "喜び",     en: "Joy",        color: "#F4A261", alert: false },
  affection:  { jp: "愛情",     en: "Affection",  color: "#F28B9F", alert: false },
  distress:   { jp: "苦悩",     en: "Distress",   color: "#E05C5C", alert: true  },
  pain:       { jp: "痛み",     en: "Pain",       color: "#E05C5C", alert: true  },
  suspicion:  { jp: "警戒",     en: "Suspicion",  color: "#9B8EC4", alert: false },
  fear:       { jp: "恐れ",     en: "Fear",       color: "#5C6BC0", alert: false },
  aggression: { jp: "攻撃性",   en: "Aggression", color: "#E8572A", alert: true  },
};

function hexA(hex: string, a: number) {
  const h = hex.replace("#", "");
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${a})`;
}

function HeroStatsBar({
  lang, dogName, emotion, confidence, barkSamples, deltaYesterday,
  sparkline, trendJp, trendEn, timestamp, live,
}: {
  lang: Lang;
  dogName: string;
  emotion: HeroEmotion;
  confidence: number;
  barkSamples: number;
  deltaYesterday: number | null;
  sparkline: number[];
  trendJp: string;
  trendEn: string;
  timestamp: string;
  live: boolean;
}) {
  const emo = HERO_EMO[emotion];
  const alert = emo.alert;
  const lowConf = confidence < 65;
  const confColor = confidence >= 80 ? "#2EA56A" : confidence >= 60 ? "#D97706" : "#E05C5C";
  const confSubJp = confidence >= 80 ? "高い信頼性" : confidence >= 60 ? "中程度" : "低い — 再試行中";
  const confSubEn = confidence >= 80 ? "High reliability" : confidence >= 60 ? "Moderate" : "Low — retrying";

  // semicircle gauge
  const gaugeR = 26;
  const gaugeC = Math.PI * gaugeR; // half-circumference
  const gaugeFill = gaugeC * (1 - Math.min(100, Math.max(0, confidence)) / 100);

  // sparkline
  const sMax = Math.max(...sparkline, 1);
  const sw = 64, sh = 22, gap = 2;
  const bw = (sw - gap * (sparkline.length - 1)) / sparkline.length;

  return (
    <>
      <style>{`
        @keyframes hsbPulseBorder { 0%,100% { box-shadow: 0 8px 24px rgba(0,0,0,0.08), 0 0 0 0 var(--alertC);} 50% { box-shadow: 0 8px 24px rgba(0,0,0,0.08), 0 0 0 6px rgba(0,0,0,0);} }
        @keyframes hsbCalmRing { 0%,100% { transform: scale(1); opacity: .55;} 50% { transform: scale(1.18); opacity: .15;} }
        @keyframes hsbSpike { 0%,100% { transform: scaleY(0.4);} 40% { transform: scaleY(1);} 70% { transform: scaleY(.3);} }
        @keyframes hsbAlertPulse { 0%,100% { transform: scale(1); opacity: 1;} 50% { transform: scale(1.12); opacity: .55;} }
        @keyframes hsbLiveDot { 0%,100% { opacity: 1; transform: scale(1);} 50% { opacity: .35; transform: scale(.85);} }
        .hsb-alert-card { animation: hsbPulseBorder 1.8s ease-in-out infinite; }
      `}</style>

      <div style={{ padding: "0 16px", position: "relative", zIndex: 2, marginTop: -36, maxWidth: 390, marginLeft: "auto", marginRight: "auto" }}>
        {/* Attention banner */}
        {alert && (
          <div
            style={{
              background: hexA(emo.color, 0.12),
              color: emo.color,
              border: `1px solid ${hexA(emo.color, 0.35)}`,
              borderRadius: 12,
              padding: "8px 12px",
              fontSize: 12,
              fontFamily: "var(--font-heading)", fontWeight: 600,
              marginBottom: 10,
              display: "flex",
              alignItems: "center",
              gap: 8,
              animation: "bsFadeUp .5s ease-out both",
            }}
          >
            <span style={{ fontSize: 14 }}>⚠</span>
            <span>
              {pickT(lang, `注意が必要 — ${dogName}を確認してください`, `Attention needed — check on ${dogName}`)}
            </span>
          </div>
        )}

        {/* PRIMARY CARD */}
        <div
          className={alert ? "hsb-alert-card" : ""}
          style={{
            // @ts-expect-error css var
            "--alertC": hexA(emo.color, 0.55),
            background: alert ? `linear-gradient(135deg, ${hexA(emo.color, 0.14)} 0%, #FFFFFF 70%)` : "#FFFFFF",
            borderRadius: 16,
            boxShadow: "0 2px 12px rgba(91, 175, 214, 0.10)",
            padding: 16,
            position: "relative",
            overflow: "hidden",
            animation: "bsFadeUp .7s ease-out .05s both",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{ fontSize: 11, color: "#6B8FA8", fontFamily: "var(--font-heading)", fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase" }}>
                {pickT(lang, "現在の感情", "Current Emotion")}
              </div>
              <div style={{ fontSize: 32, fontFamily: "var(--font-heading)", fontWeight: 600, color: "#1A2E40", lineHeight: 1.05, marginTop: 4, letterSpacing: "-0.02em" }}>
                {lang === "japanese" ? emo.jp : emo.en}
              </div>
              {lang === "mixed" && (
                <div style={{ fontSize: 12, color: "#6B8FA8", fontWeight: 500, marginTop: 2 }}>{emo.jp}</div>
              )}
              <div style={{ fontSize: 11, color: "#6B8FA8", fontWeight: 500, marginTop: 6, display: "flex", alignItems: "center", gap: 4 }}>
                <span style={{ color: emo.color, fontFamily: "var(--font-heading)", fontWeight: 600 }}>↑</span>
                {pickT(lang, trendJp, trendEn)}
              </div>
            </div>

            {/* Emotion icon */}
            <div style={{ width: 52, height: 52, position: "relative", flexShrink: 0 }}>
              {alert ? (
                <div
                  style={{
                    position: "absolute", inset: 0,
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}
                >
                  <svg width="44" height="44" viewBox="0 0 44 44" style={{ animation: "hsbAlertPulse 1.2s ease-in-out infinite", transformOrigin: "center" }}>
                    <path d="M22 6 L40 36 L4 36 Z" fill="none" stroke={emo.color} strokeWidth="2.4" strokeLinejoin="round" />
                    <line x1="22" y1="17" x2="22" y2="26" stroke={emo.color} strokeWidth="2.4" strokeLinecap="round" />
                    <circle cx="22" cy="31" r="1.6" fill={emo.color} />
                  </svg>
                </div>
              ) : emotion === "calm" ? (
                <>
                  <div style={{ position: "absolute", inset: 0, borderRadius: "50%", background: hexA(emo.color, 0.35), animation: "hsbCalmRing 3s ease-in-out infinite" }} />
                  <div style={{ position: "absolute", inset: 10, borderRadius: "50%", background: emo.color }} />
                </>
              ) : (
                <div style={{ position: "absolute", inset: 6, borderRadius: "50%", background: hexA(emo.color, 0.85), display: "flex", alignItems: "flex-end", justifyContent: "center", gap: 2, padding: 8 }}>
                  {[0.5, 0.9, 1, 0.7].map((h, i) => (
                    <div key={i} style={{ width: 3, height: 18 * h, borderRadius: 2, background: "#fff", animation: "hsbSpike 1.2s ease-in-out infinite", animationDelay: `${i * 0.12}s`, transformOrigin: "bottom" }} />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Timestamp */}
          <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 6, marginTop: 10, fontSize: 10, color: "#6B8FA8", fontWeight: 600 }}>
            {live ? (
              <>
                <span>{pickT(lang, `最終更新 ${timestamp}`, `Last updated ${timestamp}`)}</span>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 4, color: "#2EA56A" }}>
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#2EA56A", animation: "hsbLiveDot 1.3s ease-in-out infinite" }} />
                  LIVE
                </span>
              </>
            ) : (
              <span>{pickT(lang, `最終同期 ${timestamp}`, `Last sync ${timestamp}`)}</span>
            )}
          </div>
        </div>

        {/* SECONDARY ROW */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 16 }}>
          {/* Confidence */}
          <div style={{
            background: "#FFFFFF", borderRadius: 16, padding: 14,
            boxShadow: "0 2px 12px rgba(91, 175, 214, 0.10)",
            position: "relative", overflow: "hidden",
            animation: "bsFadeUp .7s ease-out .15s both",
          }}>
            <div style={{ fontSize: 11, color: "#6B8FA8", fontFamily: "var(--font-heading)", fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase" }}>
              {pickT(lang, "信頼度", "Confidence")}
            </div>
            <div style={{ display: "flex", alignItems: "flex-end", gap: 10, marginTop: 8 }}>
              <svg width="64" height="34" viewBox="0 0 64 34" style={{ flexShrink: 0 }}>
                <path d={`M 6 32 A ${gaugeR} ${gaugeR} 0 0 1 58 32`} fill="none" stroke="#EEF0F4" strokeWidth="5" strokeLinecap="round" />
                <path
                  d={`M 6 32 A ${gaugeR} ${gaugeR} 0 0 1 58 32`}
                  fill="none" stroke={confColor} strokeWidth="5" strokeLinecap="round"
                  strokeDasharray={`${gaugeC} ${gaugeC}`}
                  strokeDashoffset={gaugeFill}
                  style={{ transition: "stroke-dashoffset .8s ease-out" }}
                />
              </svg>
              <div style={{ fontSize: 28, fontFamily: "var(--font-heading)", fontWeight: 600, color: "#1A2E40", lineHeight: 1, letterSpacing: "-0.02em" }}>
                {confidence}<span style={{ fontSize: 16, color: "#6B8FA8" }}>%</span>
              </div>
            </div>
            <div style={{ fontSize: 10, color: lowConf ? "#D97706" : "#6B8FA8", fontWeight: 600, marginTop: 6 }}>
              {lowConf
                ? pickT(lang, "信号弱 — 首輪を近づけてください", "Low signal — move collar closer")
                : pickT(lang, confSubJp, confSubEn)}
            </div>
          </div>

          {/* Bark Samples */}
          <div style={{
            background: "#FFFFFF", borderRadius: 16, padding: 14,
            boxShadow: "0 2px 12px rgba(91, 175, 214, 0.10)",
            position: "relative", overflow: "hidden",
            animation: "bsFadeUp .7s ease-out .22s both",
          }}>
            <div style={{ fontSize: 11, color: "#6B8FA8", fontFamily: "var(--font-heading)", fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase" }}>
              {pickT(lang, "本日の鳴き声", "Bark Samples Today")}
            </div>
            <div style={{ display: "flex", alignItems: "flex-end", justifycontent: "space-between", gap: 6, marginTop: 8 }}>
              <div style={{ fontSize: 28, fontFamily: "var(--font-heading)", fontWeight: 600, color: "#1A2E40", lineHeight: 1, letterSpacing: "-0.02em" }}>
                {barkSamples}
              </div>
              <svg width={sw} height={sh} viewBox={`0 0 ${sw} ${sh}`} style={{ flexShrink: 0 }}>
                {sparkline.map((v, i) => {
                  const h = Math.max(2, (v / sMax) * sh);
                  return (
                    <rect
                      key={i}
                      x={i * (bw + gap)}
                      y={sh - h}
                      width={bw}
                      height={h}
                      rx={1.5}
                      fill={i === sparkline.length - 1 ? P.primary : P.soft}
                    />
                  );
                })}
              </svg>
            </div>
            <div style={{ fontSize: 10, fontWeight: 600, marginTop: 6,
              color: deltaYesterday === null ? "#6B8FA8" : deltaYesterday >= 0 ? "#2EA56A" : "#B57373" }}>
              {deltaYesterday === null
                ? pickT(lang, "基準日 1日目", "Baseline day 1")
                : deltaYesterday >= 0
                  ? pickT(lang, `昨日より +${deltaYesterday}`, `+${deltaYesterday} from yesterday`)
                  : pickT(lang, `昨日より ${deltaYesterday}`, `${deltaYesterday} from yesterday`)}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

