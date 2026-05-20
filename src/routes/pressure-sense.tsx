import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { SensorPage } from "@/components/SensorPage";
import { useT } from "@/context/LanguageContext";
import { usePet } from "@/context/PetContext";

export const Route = createFileRoute("/pressure-sense")({ component: PressureSensePage });

// ───────── Palette ─────────
const G = {
  primary: "#D4A843",
  medium: "#C49A30",
  deep: "#9E7A1A",
  soft: "#FEF8E1",
  pale: "#FFFCF0",
  accent: "#ECC95A",
  muted: "#F5DFA0",
  light: "#FCF0C0",
  white: "#FFFFFF",
  text: "#1A1A2E",
  text2: "#6B7280",
  text3: "#9CA3AF",
  ink: "#4B5563",
  ok: "#16A34A", okBg: "#F0FDF4",
  warn: "#D97706", warnBg: "#FFFBEB",
  danger: "#DC2626", dangerBg: "#FEF2F2",
  info: "#1D4ED8", infoBg: "#EFF8FF",
};

const TIME_TABS = ["1d", "1w", "1m"] as const;
type TimeTab = typeof TIME_TABS[number];

function PressureSensePage() {
  const t = useT();
  const { pet } = usePet();
  const petName = pet?.name || (t("ワンちゃん", "your dog") as string);
  const [timeTab, setTimeTab] = useState<TimeTab>("1w");
  const [graphMode, setGraphMode] = useState<"pressure" | "count">("pressure");

  return (
    <SensorPage
      titleJp="プレッシャーセンス AI"
      titleEn="PressureSense AI"
      subtitleJp="プレッシャーセンス AI"
      descriptorJp="嚥下圧力解析"
      descriptorEn="Swallowing pressure analysis"
      bannerGradient="linear-gradient(135deg,#FFFCF0 0%,#FEF8E1 100%)"
      bannerKanji="嚥"
      bannerKanjiColor="rgba(212,168,67,0.07)"
      bannerSubtitleColor="#C4A030"
    >
      <style>{`
        @keyframes psWaveSlide { from{transform:translateX(0)} to{transform:translateX(-50%)} }
        @keyframes psPulseDot { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.45;transform:scale(1.35)} }
        @keyframes psLiveSig {
          0% { stroke-dashoffset: 0; }
          100% { stroke-dashoffset: -400; }
        }
        @keyframes psFillRise {
          from { transform: translateY(100%); }
          to { transform: translateY(32%); }
        }
        @keyframes psBarGrow { from{transform:scaleY(0)} to{transform:scaleY(1)} }
        @keyframes psZoneGlow {
          0%,100% { opacity: .55; }
          50% { opacity: .95; }
        }
        .ps-hidescroll::-webkit-scrollbar { display:none; }
      `}</style>

      {/* Stats card (moved below banner — no longer overlaps) */}
      <GlassStats />


      {/* Time tabs */}
      <TimeTabs value={timeTab} onChange={setTimeTab} />

      {/* CARD 1 — Pressure gauge + live signal */}
      <PressureGaugeCard />

      {/* CARD 2 — Swallow analysis */}
      <SwallowAnalysisCard />

      {/* CARD 3 — Throat health */}
      <ThroatHealthCard />

      {/* CARD 4 — Hydration correlation */}
      <HydrationCard />

      {/* CARD 5 — Pressure pattern graph */}
      <PressurePatternCard mode={graphMode} setMode={setGraphMode} />

      {/* CARD 6 — Weekly report */}
      <WeeklyReportCard />

      {/* CARD 7 — AI Insight */}
      <AIInsightCard petName={petName} />
    </SensorPage>
  );
}


function GlassStats() {
  const t = useT();
  return (
    <div style={{
      background: "#FFFFFF",
      borderRadius: 20, padding: "16px 16px",
      marginTop: -52, marginBottom: 16, overflow: "hidden",
      boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
      display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr",
      boxSizing: "border-box",
      position: "relative", zIndex: 2,
    }}>
      <StatCol label={t("圧力", "PRESSURE")} value="62" unit="kPa" valueColor={G.primary} />
      <StatCol label={t("嚥下", "SWALLOWS")} value="142" unit={t("回", "")} divider />
      <StatCol label={t("咽頭", "THROAT")} value={t("正常", "Normal")} valueColor={G.ok} divider small />
      <StatCol label={t("水分恐怖", "HYDROPHOBIA")} value={t("なし", "None")} valueColor={G.ok} divider small />
    </div>
  );
}

function StatCol({ label, value, unit, valueColor = G.text, divider, small }: {
  label: string; value: string; unit?: string; valueColor?: string; divider?: boolean; small?: boolean;
}) {
  return (
    <div style={{
      textAlign: "center", padding: "0 6px",
      borderLeft: divider ? `1px solid ${G.soft}` : "none",
    }}>
      <div style={{ fontSize: 9, color: G.text3, letterSpacing: "0.1em", marginBottom: 6 }}>{label}</div>
      <div style={{
        fontSize: small ? 13 : 18, fontFamily: "var(--font-heading)", fontWeight: 600, color: valueColor,
        lineHeight: 1.1, fontVariantNumeric: "tabular-nums",
      }}>
        {value}
        {unit && <span style={{ fontSize: 10, color: G.text3, fontWeight: 500, marginLeft: 3 }}>{unit}</span>}
      </div>
    </div>
  );
}

// ═════════════ TIME TABS ═════════════
function TimeTabs({ value, onChange }: { value: TimeTab; onChange: (v: TimeTab) => void }) {
  const t = useT();
  const labels: Record<TimeTab, string> = {
    "1d": t("今日", "1D") as string,
    "1w": t("週間", "1W") as string,
    "1m": t("月間", "1M") as string,
  };
  return (
    <div style={{
      background: G.soft, borderRadius: 50, padding: 4,
      display: "flex", gap: 4, marginBottom: 14, boxSizing: "border-box",
    }}>
      {TIME_TABS.map((k) => {
        const active = k === value;
        return (
          <button key={k} onClick={() => onChange(k)} style={{
            flex: 1, height: 32, borderRadius: 50, border: "none",
            background: active ? G.primary : "transparent",
            color: active ? "#fff" : G.text3,
            fontSize: 12, fontWeight: 600, cursor: "pointer",
            transition: "all 200ms ease",
          }}>{labels[k]}</button>
        );
      })}
    </div>
  );
}

// ═════════════ CARD 1 — Gauge + live signal ═════════════
function PressureGaugeCard() {
  const t = useT();
  const value = 62;
  const max = 100;
  return (
    <CardG borderColor={G.primary} shadow="0 4px 24px rgba(212,168,67,0.12)">
      <SectionLabel jp="現在の嚥下圧力" en="CURRENT PRESSURE" />

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, alignItems: "center" }}>
        {/* Left — gauge */}
        <div style={{ textAlign: "center" }}>
          <PressureDial value={value} max={max} />
          <div style={{ marginTop: -16, fontFamily: "var(--font-heading)", fontWeight: 600, fontSize: 42, color: G.text, lineHeight: 1 }}>
            62<span style={{ fontSize: 16, color: G.text3, fontWeight: 500, marginLeft: 4 }}>kPa</span>
          </div>
          <div style={{ marginTop: 8 }}>
            <Pill color={G.ok} bg={G.okBg} dot>{t("正常", "Normal")}</Pill>
          </div>
        </div>

        {/* Right — live signal */}
        <div>
          <div style={{ fontSize: 9, color: G.primary, letterSpacing: "0.12em", fontWeight: 600, marginBottom: 4 }}>
            {t("リアルタイム", "LIVE SIGNAL")}
          </div>
          <LiveSignal />
          <div style={{ fontSize: 10, color: G.text3, marginTop: 4, textAlign: "right" }}>
            30s · 30Hz
          </div>
        </div>
      </div>

      {/* status chips */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 14 }}>
        <Pill color={G.ok} bg={G.okBg} dot>{t("嚥下機能: 正常", "Function: Normal")}</Pill>
        <Pill color={G.ok} bg={G.okBg} dot>{t("咽頭: 正常", "Pharynx: Normal")}</Pill>
        <Pill color={G.ok} bg={G.okBg} dot>{t("嚥下困難: なし", "Dysphagia: None")}</Pill>
      </div>
    </CardG>
  );
}

function PressureDial({ value, max }: { value: number; max: number }) {
  const pct = Math.min(1, value / max);
  const W = 180, H = 100, cx = W / 2, cy = H - 6, r = 78;
  const angle = Math.PI - Math.PI * pct;
  const mx = cx + r * Math.cos(angle);
  const my = cy - r * Math.sin(angle);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ maxWidth: 220, display: "block", margin: "0 auto" }}>
      <defs>
        <linearGradient id="gauge-arc" x1="0" x2="1">
          <stop offset="0%" stopColor={G.ok} />
          <stop offset="50%" stopColor={G.warn} />
          <stop offset="100%" stopColor={G.danger} />
        </linearGradient>
      </defs>
      {/* Track */}
      <path d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
        stroke={G.soft} strokeWidth="10" fill="none" strokeLinecap="round" />
      {/* Functional arc */}
      <path d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
        stroke="url(#gauge-arc)" strokeWidth="10" fill="none" strokeLinecap="round" opacity="0.85" />
      {/* Diamond marker */}
      <g transform={`translate(${mx} ${my}) rotate(${(angle * -180 / Math.PI) - 45})`}>
        <rect x="-6" y="-6" width="12" height="12" rx="2" fill={G.primary}
          stroke="#fff" strokeWidth="2" style={{ filter: "drop-shadow(0 2px 4px rgba(212,168,67,.4))" }} />
      </g>
      {/* Ticks */}
      {[0, 0.25, 0.5, 0.75, 1].map((p, i) => {
        const a = Math.PI - Math.PI * p;
        const x1 = cx + (r - 14) * Math.cos(a);
        const y1 = cy - (r - 14) * Math.sin(a);
        const x2 = cx + (r - 8) * Math.cos(a);
        const y2 = cy - (r - 8) * Math.sin(a);
        return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={G.text3} strokeWidth="1" />;
      })}
    </svg>
  );
}

function LiveSignal() {
  const [data, setData] = useState<number[]>(() => Array.from({ length: 60 }, () => 50 + Math.random() * 20));
  useEffect(() => {
    const id = setInterval(() => {
      setData(prev => {
        const next = prev.slice(1);
        const last = prev[prev.length - 1];
        const drift = (Math.random() - 0.5) * 8;
        const spike = Math.random() > 0.92 ? (Math.random() * 18 - 4) : 0;
        const v = Math.max(35, Math.min(85, last + drift + spike));
        next.push(v);
        return next;
      });
    }, 250);
    return () => clearInterval(id);
  }, []);

  const W = 160, H = 80;
  const path = useMemo(() => {
    const step = W / (data.length - 1);
    return data.map((v, i) => {
      const x = i * step;
      const y = H - ((v - 30) / 60) * H;
      return `${i === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`;
    }).join(" ");
  }, [data]);

  return (
    <div style={{
      background: G.pale, borderRadius: 12, padding: 6, height: 80,
      overflow: "hidden", position: "relative",
    }}>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="100%" preserveAspectRatio="none">
        {/* baseline grid */}
        <line x1="0" y1={H / 2} x2={W} y2={H / 2} stroke={G.soft} strokeWidth="1" strokeDasharray="2 3" />
        <path d={path} stroke={G.primary} strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        {/* leading dot */}
        {data.length > 0 && (() => {
          const step = W / (data.length - 1);
          const lastV = data[data.length - 1];
          const x = (data.length - 1) * step;
          const y = H - ((lastV - 30) / 60) * H;
          return <circle cx={x} cy={y} r="2.5" fill={G.primary} />;
        })()}
      </svg>
    </div>
  );
}

// ═════════════ CARD 2 — Swallow Analysis ═════════════
function SwallowAnalysisCard() {
  const t = useT();
  return (
    <CardG borderColor={G.accent}>
      <SectionLabel jp="嚥下分析" en="SWALLOW ANALYSIS" />

      {/* Top — big count */}
      <div style={{ marginTop: 4 }}>
        <div style={{ fontSize: 48, fontFamily: "var(--font-heading)", fontWeight: 600, color: G.primary, lineHeight: 1 }}>
          142<span style={{ fontSize: 18, fontWeight: 600, marginLeft: 2 }}>{t("回", "x")}</span>
        </div>
        <div style={{ fontSize: 11, color: G.text3, marginTop: 4 }}>
          {t("本日の嚥下回数", "Today's swallow count")}
        </div>
      </div>

      {/* Comparison row */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 12, flexWrap: "wrap" }}>
        <span style={{
          background: G.soft, color: G.text2, fontSize: 11, fontWeight: 600,
          padding: "5px 10px", borderRadius: 50,
        }}>{t("昨日 130回", "Yesterday 130")}</span>
        <span style={{ color: G.text3 }}>→</span>
        <span style={{
          background: G.light, color: G.medium, fontSize: 11, fontFamily: "var(--font-heading)", fontWeight: 600,
          padding: "5px 10px", borderRadius: 50,
        }}>{t("本日 142回", "Today 142")}</span>
        <span style={{ color: G.ok, fontSize: 13, fontFamily: "var(--font-heading)", fontWeight: 600 }}>+12 ▲</span>
      </div>

      {/* Quality breakdown */}
      <div style={{ height: 1, background: G.soft, margin: "16px 0 4px" }} />
      <div style={{ fontSize: 11, color: G.text3, marginBottom: 10, letterSpacing: "0.04em" }}>
        {t("品質分析", "QUALITY ANALYSIS")}
      </div>

      <QualityRow
        label={t("嚥下の速度", "Swallow Speed")}
        status={t("正常", "Normal")} position={0.55}
        ticks={[t("遅い", "Slow"), t("正常", "Normal"), t("速い", "Fast")]}
      />
      <QualityRow
        label={t("嚥下の深さ", "Swallow Depth")}
        status={t("適切", "Adequate")} position={0.5}
        ticks={[t("浅い", "Shallow"), t("適切", "Adequate"), t("深い", "Deep")]}
      />
      <QualityRow
        label={t("嚥下間隔", "Swallow Interval")}
        status={t("4.2秒", "4.2 s")} position={0.45}
        ticks={[t("速い", "Rapid"), t("正常", "Normal"), t("遅い", "Slow")]}
      />

      {/* Hourly pattern */}
      <div style={{ height: 1, background: G.soft, margin: "16px 0 12px" }} />
      <div style={{ fontSize: 11, color: G.text3, marginBottom: 10 }}>
        {t("時間別パターン", "Hourly Pattern")}
      </div>
      <HourlyBars />
      <div style={{ fontSize: 10, color: G.medium, marginTop: 8 }}>
        ● {t("最も活発: 12:00-13:00", "Peak: 12:00-13:00")}
      </div>
    </CardG>
  );
}

function QualityRow({ label, status, position, ticks }: {
  label: string; status: string; position: number; ticks: [string, string, string];
}) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
        <span style={{ fontSize: 12, color: G.ink, fontWeight: 500 }}>{label}</span>
        <span style={{
          fontSize: 11, fontWeight: 600, color: G.medium,
          background: G.light, padding: "3px 10px", borderRadius: 50,
        }}>{status}</span>
      </div>
      <div style={{ position: "relative", height: 6, borderRadius: 3, background: G.light, overflow: "hidden" }}>
        <div style={{
          position: "absolute", left: 0, top: 0, bottom: 0,
          width: `${position * 100}%`, background: G.primary, borderRadius: 3,
        }} />
        <div style={{
          position: "absolute", left: `${position * 100}%`, top: -3, bottom: -3,
          width: 4, marginLeft: -2, background: "#fff",
          boxShadow: `0 0 0 1.5px ${G.primary}`, borderRadius: 2,
        }} />
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
        {ticks.map((t, i) => (
          <span key={i} style={{ fontSize: 9, color: G.text3 }}>{t}</span>
        ))}
      </div>
    </div>
  );
}

function HourlyBars() {
  // 6..21 (16 hours), peak at 12-13
  const hours = Array.from({ length: 16 }, (_, i) => i + 6);
  const values = hours.map(h => {
    if (h >= 12 && h <= 13) return 0.95;
    if (h >= 7 && h <= 9) return 0.7;
    if (h >= 18 && h <= 20) return 0.75;
    return 0.25 + Math.random() * 0.3;
  });
  return (
    <div>
      <div style={{ display: "flex", alignItems: "flex-end", gap: 4, height: 56 }}>
        {values.map((v, i) => {
          const isPeak = v > 0.9;
          return (
            <div key={i} style={{
              flex: 1, height: `${v * 100}%`, borderRadius: 3,
              background: isPeak ? G.medium : G.primary,
              opacity: isPeak ? 1 : 0.55,
              transformOrigin: "bottom",
              animation: `psBarGrow 600ms cubic-bezier(.2,.7,.2,1) both`,
              animationDelay: `${i * 25}ms`,
            }} />
          );
        })}
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
        {[6, 9, 12, 15, 18, 21].map(h => (
          <span key={h} style={{ fontSize: 9, color: G.text3 }}>{h}</span>
        ))}
      </div>
    </div>
  );
}

// ═════════════ CARD 3 — Throat Health ═════════════
function ThroatHealthCard() {
  const t = useT();
  const signals = [
    { icon: "🔊", jp: "声のかすれ", en: "Hoarseness", status: t("検出なし", "Not detected"), conf: 96 },
    { icon: "💧", jp: "水分恐怖", en: "Hydrophobia", status: t("リスクなし", "No risk"), conf: 99 },
    { icon: "🔥", jp: "咽頭炎症", en: "Throat Inflammation", status: t("なし", "None"), conf: 94 },
    { icon: "⚡", jp: "嚥下困難", en: "Dysphagia Risk", status: t("低リスク", "Low risk"), conf: 98 },
  ];
  return (
    <CardG borderColor={G.accent} shadow="0 4px 20px rgba(212,168,67,0.10)">
      <SectionLabel jp="咽頭健康ダッシュボード" en="THROAT HEALTH" />

      <ThroatDiagram />

      <div style={{ marginTop: 14 }}>
        {signals.map((s, i) => (
          <div key={s.en}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0" }}>
              <div style={{
                width: 34, height: 34, borderRadius: 10, background: G.soft,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 16, flexShrink: 0,
              }}>{s.icon}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: G.text, lineHeight: 1.2 }}>
                  {t(s.jp, s.en)}
                </div>
                <div style={{ fontSize: 11, color: G.ok, marginTop: 2 }}>● {s.status}</div>
                <div style={{ height: 3, borderRadius: 2, background: G.light, marginTop: 6, overflow: "hidden" }}>
                  <div style={{ width: `${s.conf}%`, height: "100%", background: G.primary }} />
                </div>
              </div>
              <div style={{ fontSize: 10, color: G.text3, fontVariantNumeric: "tabular-nums", flexShrink: 0 }}>
                {t("信頼度", "Conf.")} {s.conf}%
              </div>
            </div>
            {i < signals.length - 1 && <div style={{ height: 1, background: G.soft }} />}
          </div>
        ))}
      </div>
    </CardG>
  );
}

function ThroatDiagram() {
  const t = useT();
  const zones = [
    { y: 18, label: t("声帯", "Vocal Cords") },
    { y: 38, label: t("咽頭", "Pharynx") },
    { y: 58, label: t("食道入口", "Esophageal inlet") },
    { y: 78, label: t("嚥下筋", "Swallow muscles") },
  ];
  return (
    <div style={{ position: "relative", height: 110, background: G.pale, borderRadius: 14, overflow: "hidden", padding: "0 10px" }}>
      <svg viewBox="0 0 320 110" width="100%" height="100%" preserveAspectRatio="none">
        {/* throat outline — stylized neck */}
        <path d="M 90 5 Q 96 30 88 55 Q 84 80 96 105"
          stroke={G.medium} strokeWidth="1.4" fill="none" opacity="0.5" />
        <path d="M 230 5 Q 224 30 232 55 Q 236 80 224 105"
          stroke={G.medium} strokeWidth="1.4" fill="none" opacity="0.5" />
        {/* central trachea hint */}
        <path d="M 160 5 L 160 105" stroke={G.muted} strokeWidth="1" strokeDasharray="2 4" opacity="0.6" />

        {zones.map((z, i) => (
          <g key={i}>
            {/* glow ellipse */}
            <ellipse cx="160" cy={z.y + 4} rx="58" ry="9"
              fill={G.ok} opacity="0.18"
              style={{ animation: `psZoneGlow 3s ease-in-out infinite`, animationDelay: `${i * 0.4}s` }} />
            <ellipse cx="160" cy={z.y + 4} rx="42" ry="6" fill={G.ok} opacity="0.5" />
            <circle cx="160" cy={z.y + 4} r="3" fill={G.ok} />
          </g>
        ))}
      </svg>
      {/* labels overlay */}
      <div style={{
        position: "absolute", inset: 0, display: "flex", flexDirection: "column",
        justifyContent: "space-around", padding: "8px 14px", pointerEvents: "none",
      }}>
        {zones.map((z, i) => (
          <div key={i} style={{
            display: "flex", justifyContent: "space-between", alignItems: "center",
            fontSize: 10, color: G.text2,
          }}>
            <span>{z.label}</span>
            <span style={{ color: G.ok, fontWeight: 600 }}>● {t("健康", "OK")}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ═════════════ CARD 4 — Hydration ═════════════
function HydrationCard() {
  const t = useT();
  const fill = 68;
  return (
    <CardG borderColor={G.accent}>
      <SectionLabel jp="水分補給相関" en="HYDRATION CORRELATION" />
      <div style={{ fontSize: 11, color: G.text3, marginTop: -4, marginBottom: 14 }}>
        {t("嚥下パターンから水分摂取を推定", "Estimating hydration from swallow patterns")}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "120px 1fr", gap: 16, alignItems: "center" }}>
        {/* Drop */}
        <div style={{ textAlign: "center" }}>
          <WaterDrop fill={fill} />
          <div style={{ fontSize: 10, color: G.text3, marginTop: 6 }}>
            {t("推定水分量", "Est. Hydration")}
          </div>
          <div style={{ fontSize: 20, fontFamily: "var(--font-heading)", fontWeight: 600, color: G.primary, lineHeight: 1.2 }}>{fill}%</div>
        </div>
        {/* Stats */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <HydroRow jp="水分嚥下" en="Water swallows" value="38" />
          <HydroRow jp="食物嚥下" en="Food swallows" value="104" />
          <HydroRow jp="乾燥嚥下" en="Dry swallows" value="0" valueColor={G.ok} />
        </div>
      </div>

      <div style={{ marginTop: 14 }}>
        <span style={{
          background: G.infoBg, color: G.info, fontSize: 11, fontWeight: 600,
          padding: "6px 14px", borderRadius: 50, display: "inline-block",
        }}>
          💧 {t("推奨: 30分ごとに水を提供してください", "Tip: Offer water every 30 minutes")}
        </span>
      </div>
    </CardG>
  );
}

function HydroRow({ jp, en, value, valueColor }: { jp: string; en: string; value: string; valueColor?: string }) {
  const t = useT();
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <span style={{ fontSize: 12, color: G.text3 }}>{t(jp, en)}</span>
      <span style={{ fontSize: 13, fontFamily: "var(--font-heading)", fontWeight: 600, color: valueColor ?? G.text }}>
        {value}<span style={{ fontSize: 10, color: G.text3, fontWeight: 500, marginLeft: 3 }}>{t("回", "")}</span>
      </span>
    </div>
  );
}

function WaterDrop({ fill }: { fill: number }) {
  const offset = 100 - fill;
  return (
    <svg viewBox="0 0 80 100" width="80" height="100" style={{ display: "block", margin: "0 auto" }}>
      <defs>
        <linearGradient id="drop-fill" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={G.accent} />
          <stop offset="100%" stopColor={G.medium} />
        </linearGradient>
        <clipPath id="drop-clip">
          <path d="M40 5 C 40 5, 10 40, 10 65 A 30 30 0 0 0 70 65 C 70 40, 40 5, 40 5 Z" />
        </clipPath>
      </defs>
      {/* outline */}
      <path d="M40 5 C 40 5, 10 40, 10 65 A 30 30 0 0 0 70 65 C 70 40, 40 5, 40 5 Z"
        fill={G.pale} stroke={G.muted} strokeWidth="1.5" />
      {/* fill */}
      <g clipPath="url(#drop-clip)">
        <rect x="0" y={offset} width="80" height="100" fill="url(#drop-fill)" />
        {/* surface shine */}
        <ellipse cx="40" cy={offset} rx="35" ry="3" fill="rgba(255,255,255,0.3)" />
      </g>
      {/* highlight */}
      <ellipse cx="28" cy="35" rx="5" ry="9" fill="rgba(255,255,255,0.35)" transform="rotate(-25 28 35)" />
    </svg>
  );
}

// ═════════════ CARD 5 — Pressure Pattern Graph ═════════════
function PressurePatternCard({ mode, setMode }: {
  mode: "pressure" | "count"; setMode: (m: "pressure" | "count") => void;
}) {
  const t = useT();
  const days = ["月", "火", "水", "木", "金", "土", "日"];
  const daysEn = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const pressure = [60, 63, 58, 67, 61, 62, 62];
  const counts = [135, 148, 129, 156, 138, 144, 142];
  const data = mode === "pressure" ? pressure : counts;
  const max = Math.max(...data) * 1.15;
  const min = Math.min(...data) * 0.85;

  const W = 320, H = 140, P = 24;
  const xStep = (W - P * 2) / (data.length - 1);
  const yScale = (v: number) => H - P - ((v - min) / (max - min)) * (H - P * 2);

  const pts = data.map((v, i) => ({ x: P + i * xStep, y: yScale(v) }));
  const path = pts.map((p, i) => i === 0 ? `M ${p.x} ${p.y}` : `L ${p.x} ${p.y}`).join(" ");
  const area = `${path} L ${pts[pts.length - 1].x} ${H - P} L ${pts[0].x} ${H - P} Z`;

  // peak (Thu)
  const peakIdx = data.indexOf(Math.max(...data));

  // danger threshold y (only for pressure mode)
  const dangerY = mode === "pressure" ? yScale(80) : null;
  // normal band (50-70 for pressure)
  const bandTop = mode === "pressure" ? yScale(70) : yScale(min + (max - min) * 0.65);
  const bandBot = mode === "pressure" ? yScale(50) : yScale(min + (max - min) * 0.3);

  return (
    <CardG borderColor={G.accent}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <SectionLabel jp="圧力パターン · 7日間" en="PRESSURE PATTERN · 7D" inline />
        <div style={{ display: "flex", gap: 4, background: G.soft, padding: 3, borderRadius: 50 }}>
          {(["pressure", "count"] as const).map(m => (
            <button key={m} onClick={() => setMode(m)} style={{
              padding: "4px 10px", borderRadius: 50, border: "none",
              fontSize: 10, fontWeight: 600, cursor: "pointer",
              background: mode === m ? G.primary : "transparent",
              color: mode === m ? "#fff" : G.text3,
            }}>
              {m === "pressure" ? t("圧力", "Pressure") : t("回数", "Count")}
            </button>
          ))}
        </div>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display: "block" }}>
        <defs>
          <linearGradient id="press-area" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor={G.primary} stopOpacity="0.18" />
            <stop offset="100%" stopColor={G.primary} stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* normal range band */}
        <rect x={P} y={bandTop} width={W - P * 2} height={Math.abs(bandBot - bandTop)}
          fill={G.ok} opacity="0.06" />
        <text x={P + 4} y={bandTop - 2} fontSize="8" fill={G.ok}>
          {t("正常範囲", "Normal range")}
        </text>

        {/* danger line */}
        {dangerY !== null && (
          <>
            <line x1={P} y1={dangerY} x2={W - P} y2={dangerY}
              stroke={G.danger} strokeWidth="1" strokeDasharray="4 3" opacity="0.7" />
            <text x={W - P - 4} y={dangerY - 3} fontSize="8" fill={G.danger} textAnchor="end">
              {t("危険域", "Danger zone")}
            </text>
          </>
        )}

        {/* area */}
        <path d={area} fill="url(#press-area)" />
        {/* line */}
        <path d={path} stroke={G.primary} strokeWidth="2.5" fill="none"
          strokeLinecap="round" strokeLinejoin="round" />

        {/* points */}
        {pts.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r="4" fill="#fff" stroke={G.primary} strokeWidth="2" />
        ))}

        {/* peak tooltip */}
        {(() => {
          const p = pts[peakIdx];
          const label = `${daysEn[peakIdx]}: ${data[peakIdx]}${mode === "pressure" ? " kPa" : ""}`;
          const w = label.length * 5.5 + 12;
          return (
            <g transform={`translate(${p.x - w / 2} ${p.y - 24})`}>
              <rect x="0" y="0" width={w} height="16" rx="8" fill={G.primary} />
              <text x={w / 2} y="11" fontSize="9" fill="#fff" textAnchor="middle" fontWeight="600">{label}</text>
            </g>
          );
        })()}

        {/* x labels */}
        {days.map((d, i) => (
          <text key={i} x={P + i * xStep} y={H - 4} fontSize="10"
            fill={i === days.length - 1 ? G.primary : G.text3}
            fontWeight={i === days.length - 1 ? 700 : 500}
            textAnchor="middle">{d}</text>
        ))}
      </svg>
    </CardG>
  );
}

// ═════════════ CARD 6 — Weekly Report ═════════════
function WeeklyReportCard() {
  const t = useT();
  const rows = [
    { d: "月", swallows: 135, p: 60, status: "ok" as const },
    { d: "火", swallows: 148, p: 63, status: "ok" as const },
    { d: "水", swallows: 129, p: 58, status: "ok" as const },
    { d: "木", swallows: 156, p: 67, status: "warn" as const },
    { d: "金", swallows: 138, p: 61, status: "ok" as const },
    { d: "土", swallows: 144, p: 62, status: "ok" as const },
    { d: "日", swallows: 142, p: 62, status: "ok" as const, live: true },
  ];
  return (
    <CardG borderColor={G.accent} bg="#FFFDF5">
      <SectionLabel jp="週次レポート" en="WEEKLY REPORT" />

      <div style={{ marginTop: 6 }}>
        {/* Header */}
        <div style={{
          display: "grid", gridTemplateColumns: "1fr 1.2fr 1.4fr 1.4fr",
          fontSize: 10, color: G.text3, letterSpacing: "0.05em",
          padding: "6px 8px", textTransform: "uppercase",
        }}>
          <span>{t("日付", "Date")}</span>
          <span>{t("嚥下回数", "Swallows")}</span>
          <span>{t("平均圧力", "Avg kPa")}</span>
          <span>{t("状態", "Status")}</span>
        </div>

        {rows.map((r, i) => {
          const isToday = !!r.live;
          const statusColor = r.status === "warn" ? G.warn : G.ok;
          const statusLabel = r.status === "warn" ? t("注意", "Warning") : t("正常", "Normal");
          return (
            <div key={r.d}>
              <div style={{
                display: "grid", gridTemplateColumns: "1fr 1.2fr 1.4fr 1.4fr",
                alignItems: "center", padding: "10px 8px",
                background: isToday ? G.soft : "transparent",
                borderRadius: isToday ? 10 : 0,
                borderLeft: r.status === "warn" ? `2px solid ${G.warn}` : "2px solid transparent",
                fontSize: 12, color: G.ink,
              }}>
                <span style={{ fontWeight: isToday ? 700 : 500, color: isToday ? G.medium : G.text }}>
                  {r.d}
                </span>
                <span style={{ fontVariantNumeric: "tabular-nums" }}>{r.swallows}{t("回", "")}</span>
                <span style={{ fontVariantNumeric: "tabular-nums" }}>{r.p} kPa</span>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 5, color: statusColor, fontWeight: 600 }}>
                  <span style={{
                    width: 6, height: 6, borderRadius: "50%", background: statusColor,
                    animation: isToday ? "psPulseDot 1.6s ease-in-out infinite" : "none",
                  }} />
                  {statusLabel}
                </span>
              </div>
              {i < rows.length - 1 && <div style={{ height: 1, background: G.soft }} />}
            </div>
          );
        })}
      </div>

      <div style={{ marginTop: 12, fontSize: 11, color: G.medium, textAlign: "right", fontWeight: 600 }}>
        {t("週平均: 61.9 kPa · 141回/日", "Weekly avg: 61.9 kPa · 141/day")}
      </div>
    </CardG>
  );
}

// ═════════════ CARD 7 — AI Insight ═════════════
function AIInsightCard({ petName }: { petName: string }) {
  const t = useT();
  return (
    <div style={{
      background: "linear-gradient(135deg,#9E7A1A 0%,#C49A30 100%)",
      borderRadius: 26, padding: 22, marginBottom: 14, overflow: "hidden",
      position: "relative", boxSizing: "border-box",
      boxShadow: "0 8px 28px rgba(158,122,26,0.25)",
    }}>
      {/* kanji watermark */}
      <span aria-hidden style={{
        position: "absolute", right: -6, top: -22, fontSize: 120,
        color: "rgba(255,255,255,0.04)", fontFamily: "var(--font-heading)", fontWeight: 600, lineHeight: 1, userSelect: "none",
      }}>健</span>
      {/* wave watermark */}
      <svg aria-hidden viewBox="0 0 400 80" preserveAspectRatio="none"
        style={{ position: "absolute", left: 0, right: 0, bottom: 0, width: "100%", height: 60, opacity: 1 }}>
        <path d="M0 40 Q 50 20 100 40 T 200 40 T 300 40 T 400 40"
          stroke="rgba(255,255,255,0.05)" strokeWidth="1.2" fill="none" />
        <path d="M0 55 Q 50 35 100 55 T 200 55 T 300 55 T 400 55"
          stroke="rgba(255,255,255,0.04)" strokeWidth="1.2" fill="none" />
      </svg>

      <div style={{ position: "relative" }}>
        <div style={{
          fontSize: 11, color: "#F5DFA0", letterSpacing: "0.12em",
          fontFamily: "var(--font-heading)", fontWeight: 600, textTransform: "uppercase",
        }}>
          ✦ {t("AIインサイト", "AI INSIGHT")}
        </div>
        <div style={{ height: 1, background: "rgba(255,255,255,0.15)", margin: "12px 0 14px" }} />

        <div style={{ fontSize: 14, color: "#fff", lineHeight: 1.8 }}>
          {t(
            `${petName}の嚥下パターンは正常範囲内で安定しています。木曜日にわずかな圧力上昇がありましたが、危険域には達していません。水分補給を継続してください。`,
            `${petName}'s swallowing pattern is stable within the normal range. A slight pressure increase on Thursday was detected but did not reach the danger zone. Maintain hydration.`,
          )}
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 14 }}>
          <InsightBadge bg="rgba(22,163,74,0.25)">● {t("嚥下: 正常", "Swallow: Normal")}</InsightBadge>
          <InsightBadge bg="rgba(255,255,255,0.15)">💧 {t("水分: 良好", "Hydration: Good")}</InsightBadge>
          <InsightBadge bg="rgba(217,119,6,0.35)">⚠️ {t("木曜: 要観察", "Thu: Observe")}</InsightBadge>
        </div>

        <div style={{
          display: "flex", justifyContent: "space-between", alignItems: "center",
          marginTop: 16, paddingTop: 12, borderTop: "1px solid rgba(255,255,255,0.12)",
        }}>
          <button style={{
            background: "transparent", border: "none", color: "rgba(255,255,255,0.85)",
            fontSize: 11, fontWeight: 600, cursor: "pointer",
          }}>
            🔔 {t("アラート設定", "Alert Settings")}
          </button>
          <span style={{ fontSize: 10, color: "rgba(255,255,255,0.5)" }}>
            {t("最終更新 14:32", "Updated 14:32")}
          </span>
        </div>
      </div>
    </div>
  );
}

function InsightBadge({ children, bg }: { children: React.ReactNode; bg: string }) {
  return (
    <span style={{
      background: bg, color: "#fff", fontSize: 10, fontWeight: 600,
      padding: "5px 10px", borderRadius: 50,
    }}>{children}</span>
  );
}

// ═════════════ shared ═════════════
function CardG({ children, borderColor, shadow, bg }: {
  children: React.ReactNode; borderColor: string; shadow?: string; bg?: string;
}) {
  return (
    <div style={{
      background: bg ?? "#fff", borderRadius: 22, padding: 18,
      marginBottom: 14, overflow: "hidden", boxSizing: "border-box",
      borderLeft: `4px solid ${borderColor}`,
      boxShadow: shadow ?? "0 2px 14px rgba(0,0,0,0.04)",
    }}>{children}</div>
  );
}

function SectionLabel({ jp, en, inline }: { jp: string; en: string; inline?: boolean }) {
  const t = useT();
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 6,
      marginBottom: inline ? 0 : 10,
    }}>
      <span style={{ width: 5, height: 5, borderRadius: "50%", background: G.primary }} />
      <span style={{
        fontSize: 11, color: G.primary, fontFamily: "var(--font-heading)", fontWeight: 600,
        letterSpacing: "0.08em", textTransform: "uppercase",
      }}>{t(jp, en)}</span>
    </div>
  );
}

function Pill({ children, color, bg, dot }: {
  children: React.ReactNode; color: string; bg: string; dot?: boolean;
}) {
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      background: bg, color, fontSize: 11, fontWeight: 600,
      padding: "4px 12px", borderRadius: 50,
    }}>
      {dot && <span style={{ width: 5, height: 5, borderRadius: "50%", background: color }} />}
      {children}
    </span>
  );
}

// unused-but-imported guard
