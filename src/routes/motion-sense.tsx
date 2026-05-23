import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import AppShell, { TopBar } from "@/components/AppShell";
import { SenseBanner } from "@/components/SenseBanner";
import { useLanguage } from "@/context/LanguageContext";
import { useT } from "@/context/LanguageContext";
import { usePet, displayName } from "@/context/PetContext";
import { Activity, Moon, Flame, Clock, Sparkles, ArrowUp } from "lucide-react";

export const Route = createFileRoute("/motion-sense")({ component: MotionSensePage });

// ---------- Tokens ----------
const C = {
  page: "#EAF2F8",
  card: "#FFFFFF",
  sumi: "#1A2E40",
  ink: "#1A2E40",
  ink2: "#1A2E40",
  muted: "#6B8FA8",
  faint: "#6B8FA8",
  divider: "#D6EAF5",
  // Pastel blue identity (token names kept as `rose*` for minimal diff)
  rose: "#5BAFD6",       // primary soft sky blue
  roseDeep: "#3A87B0",   // best/peak bar emphasis only
  roseSoft: "#7EC8E3",   // pastel cornflower
  rosePale: "#A8D4EA",   // soft blue
  roseTint: "#D6EAF5",   // very light blue tint
  roseFill: "#D6EAF5",   // barely blue
  roseMid: "#7EC8E3",    // medium pastel blue
  roseTrack: "#D6EAF5",  // progress track
  indigo: "#7EC8E3",
  orange: "#F4A261",
  green: "#16A34A",
  greenBg: "#F0FDF4",
};

// ---------- Data ----------
const WEEK = [
  { jp: "月", en: "Mon", v: 3200 },
  { jp: "火", en: "Tue", v: 4100 },
  { jp: "水", en: "Wed", v: 2800 },
  { jp: "木", en: "Thu", v: 5200 },
  { jp: "金", en: "Fri", v: 3600 },
  { jp: "土", en: "Sat", v: 4800 },
  { jp: "日", en: "Sun", v: 2340 },
];
const TREND = [42, 58, 38, 82, 55, 74, 65];

// Hourly intensity (0=none,1=low,2=med,3=high) for 24h
const TIMELINE: number[] = [
  0, 0, 0, 0, 0, 0, 1, 2, 3, 3, 3, 2,
  1, 1, 2, 2, 1, 2, 3, 2, 1, 1, 0, 0,
];
const NOW_HOUR = 14;

// ---------- Hooks ----------
function useCount(target: number, duration = 1200) {
  const [v, setV] = useState(0);
  useEffect(() => {
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setV(Math.round(target * eased));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);
  return v;
}

function useMounted(delay = 80) {
  const [m, setM] = useState(false);
  useEffect(() => { const id = setTimeout(() => setM(true), delay); return () => clearTimeout(id); }, [delay]);
  return m;
}

// ---------- Reusable ----------
function CardBox({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div
      style={{
        background: C.card,
        borderRadius: 16,
        boxShadow: "0 2px 12px rgba(91, 175, 214, 0.10)",
        padding: 20,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

function SectionHeader({ jp, en, rightJp, rightEn }: { jp: string; en: string; rightJp?: string; rightEn?: string }) {
  const t = useT();
  return (
    <div className="flex items-center justify-between" style={{ marginBottom: 14 }}>
      <div className="flex items-center" style={{ gap: 6 }}>
        <span style={{ width: 5, height: 5, borderRadius: "50%", background: C.rose }} />
        <span style={{ fontSize: 11, color: C.muted, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase" }}>
          {t(jp, en)}
        </span>
      </div>
      {rightJp && rightEn && (
        <span style={{ fontSize: 11, color: C.muted }}>{t(rightJp, rightEn)}</span>
      )}
    </div>
  );
}

// ---------- Page ----------
function MotionSensePage() {
  const t = useT();
  const { pet } = usePet();
  const name = displayName(pet, "Fluffy");
  const [tab, setTab] = useState<"1d" | "1w" | "1m">("1d");
  const mounted = useMounted(80);

  return (
    <AppShell
      noPadding
      renderTopBar={({ menuOpen, onMenuClick }) => (
        <TopBar showBack backTo="/home" menuOpen={menuOpen} onMenuClick={onMenuClick} />
      )}
    >
      <style>{`
        @keyframes msLive { 0%,100%{transform:scale(1);opacity:1} 50%{transform:scale(1.35);opacity:.55} }
        @keyframes msCardIn { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        @keyframes msPulse { 0%,100%{box-shadow:0 0 0 0 rgba(123,179,212,.6)} 50%{box-shadow:0 0 12px 2px rgba(123,179,212,.5)} }
        @keyframes msFloat { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-3px)} }
        .ms-stack > * { opacity:0; animation: msCardIn 350ms cubic-bezier(.2,.7,.2,1) forwards; }
        .ms-stack > *:nth-child(1){animation-delay:80ms}
        .ms-stack > *:nth-child(2){animation-delay:160ms}
        .ms-stack > *:nth-child(3){animation-delay:240ms}
        .ms-stack > *:nth-child(4){animation-delay:320ms}
        .ms-stack > *:nth-child(5){animation-delay:400ms}
        .ms-stack > *:nth-child(6){animation-delay:480ms}
      `}</style>

      <div style={{ background: C.page, minHeight: "100%", paddingBottom: 100 }}>
        {/* HEADER */}
        <SenseBanner
          subtitleJp="モーションセンス"
          titleEn="MotionSense"
          descriptorJp="アクティビティ追跡"
          descriptorEn="Activity tracking"
          bgGradient="linear-gradient(135deg,#F0F7FC 0%,#E1F0FA 100%)"
          kanji="動"
          kanjiColor="rgba(123,179,212,0.07)"
          subtitleColor="#7BB3D4"
        />


        {/* TIME TABS */}
        <div style={{ padding: "0 16px", marginTop: -36, position: "relative", zIndex: 2 }}>
          <div className="flex" style={{ background: "#F3F4F6", borderRadius: 50, padding: 3, gap: 2 }}>
            {(["1d", "1w", "1m"] as const).map((v) => {
              const active = tab === v;
              return (
                <button key={v} onClick={() => setTab(v)} style={{
                  flex: 1, height: 30, borderRadius: 50,
                  background: active ? C.rose : "transparent",
                  color: active ? "#FFF" : C.muted,
                  fontSize: 13, fontWeight: active ? 600 : 500,
                  letterSpacing: "0.04em", transition: "all 200ms ease",
                }}>
                  {v.toUpperCase()}
                </button>
              );
            })}
          </div>
        </div>

        {/* CONTENT */}
        <div className="ms-stack" style={{ padding: "16px", display: "flex", flexDirection: "column", gap: 14, position: "relative", zIndex: 2 }}>
          <HeroStepCard mounted={mounted} />
          <WeeklyBarCard mounted={mounted} />
          <MetricCards />
          <TrendCard mounted={mounted} />
          <TimelineCard />
          <AIInsightBlock name={name} />
        </div>
      </div>
    </AppShell>
  );
}

// ---------- Card 1: Hero ----------
function HeroStepCard({ mounted }: { mounted: boolean }) {
  const t = useT();
  const steps = 2340;
  const goal = 5000;
  const pct = steps / goal;
  const stepsAnim = useCount(steps, 1200);
  const R = 65, sw = 12, cx = 75, cy = 75;
  const CIRC = 2 * Math.PI * R;
  const offset = mounted ? CIRC * (1 - pct) : CIRC;

  // arc end point for glowing dot
  const angle = -Math.PI / 2 + pct * Math.PI * 2;
  const endX = cx + R * Math.cos(angle);
  const endY = cy + R * Math.sin(angle);

  return (
    <div style={{
      position: "relative",
      background: C.card,
      borderRadius: 16,
      padding: 24,
      boxShadow: "0 2px 12px rgba(91, 175, 214, 0.10)",
      overflow: "hidden",
    }}>
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, height: "60%",
        background: "linear-gradient(180deg,rgba(123,179,212,0.06) 0%,rgba(255,255,255,0) 100%)",
        pointerEvents: "none",
      }} />
      <div className="flex" style={{ gap: 18, position: "relative", alignItems: "center" }}>
        {/* Ring */}
        <div style={{ position: "relative", width: 150, height: 150, flexShrink: 0 }}>
          <svg width={150} height={150} viewBox="0 0 150 150">
            <defs>
              <linearGradient id="msRing" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor={C.rose} />
                <stop offset="100%" stopColor={C.rosePale} />
              </linearGradient>
            </defs>
            <circle cx={cx} cy={cy} r={R + sw / 2 + 3} stroke="rgba(123,179,212,0.18)" strokeWidth={1} fill="none" />
            <circle cx={cx} cy={cy} r={R} stroke={C.roseTrack} strokeWidth={sw} fill="none" />
            <circle
              cx={cx} cy={cy} r={R}
              stroke="url(#msRing)" strokeWidth={sw} fill="none" strokeLinecap="round"
              strokeDasharray={CIRC}
              strokeDashoffset={offset}
              transform={`rotate(-90 ${cx} ${cy})`}
              style={{ transition: "stroke-dashoffset 1.4s cubic-bezier(.2,.7,.2,1)" }}
            />
            {mounted && (
              <circle cx={endX} cy={endY} r={5} fill={C.rose}
                style={{ filter: "drop-shadow(0 0 6px rgba(123,179,212,0.7))", animation: "msPulse 1.8s ease-in-out infinite", transformOrigin: `${endX}px ${endY}px` }}
              />
            )}
          </svg>
          <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
            <span style={{ position: "absolute", top: 28, fontSize: 38, opacity: 0.08, color: C.rose }}></span>
            <div className="flex items-baseline" style={{ gap: 4 }}>
              <span style={{ fontSize: 30, fontFamily: "var(--font-heading)", fontWeight: 600, color: C.sumi, fontVariantNumeric: "tabular-nums", lineHeight: 1 }}>
                {stepsAnim.toLocaleString()}
              </span>
              <span style={{ fontSize: 14, color: C.rose, fontWeight: 600 }}>歩</span>
            </div>
            <div style={{ fontSize: 12, color: C.rose, fontWeight: 500, marginTop: 4 }}>
              {Math.round(pct * 100)}%
            </div>
          </div>
        </div>

        {/* Stats */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 10, color: C.muted, letterSpacing: "0.08em" }}>{t("目標", "GOAL")}</div>
          <div style={{ fontSize: 18, fontFamily: "var(--font-heading)", fontWeight: 600, color: C.sumi, fontVariantNumeric: "tabular-nums" }}>
            {goal.toLocaleString()}歩
          </div>
          <div style={{ height: 4, background: C.divider, borderRadius: 2, marginTop: 6, overflow: "hidden" }}>
            <div style={{ width: mounted ? `${pct * 100}%` : 0, height: "100%", background: C.rose, borderRadius: 2, transition: "width 1.2s ease-out" }} />
          </div>
          <div style={{ height: 1, background: C.divider, margin: "12px 0" }} />
          <div style={{ fontSize: 10, color: C.muted, letterSpacing: "0.08em" }}>{t("残り", "REMAINING")}</div>
          <div style={{ fontSize: 16, fontWeight: 600, color: C.rose, fontVariantNumeric: "tabular-nums" }}>
            {(goal - steps).toLocaleString()}歩
          </div>
          <div style={{ fontSize: 10, color: C.muted, marginTop: 8, letterSpacing: "0.08em" }}>{t("予想達成", "EST. GOAL")}</div>
          <div style={{ fontSize: 14, fontWeight: 500, color: C.sumi }}>17:30頃</div>
        </div>
      </div>

      <div style={{ height: 1, background: C.divider, margin: "16px 0" }} />

      <div className="flex" style={{ gap: 8, flexWrap: "wrap" }}>
        <Pill icon="" label={t("活発", "Active")} value="2h 15m" valueColor={C.rose} />
        <Pill icon="" label={t("休息", "Rest")} value="13h 45m" valueColor={C.ink2} />
        <Pill icon="" label="" value="285 kcal" valueColor={C.orange} />
      </div>
    </div>
  );
}

function Pill({ icon, label, value, valueColor }: { icon: string; label: string; value: string; valueColor: string }) {
  return (
    <div className="flex items-center" style={{
      background: "#F9F9F9", borderRadius: 50, padding: "6px 12px", gap: 6, fontSize: 11,
    }}>
      <span style={{ fontSize: 12 }}>{icon}</span>
      {label && <span style={{ color: C.muted }}>{label}</span>}
      <span style={{ color: valueColor, fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>{value}</span>
    </div>
  );
}

// ---------- Card 2: Weekly Bars ----------
function WeeklyBarCard({ mounted }: { mounted: boolean }) {
  const t = useT();
  const max = Math.max(...WEEK.map((d) => d.v));
  const bestIdx = WEEK.findIndex((d) => d.v === max);
  const todayIdx = WEEK.length - 1;
  const total = WEEK.reduce((s, d) => s + d.v, 0);
  const chartH = 130;

  return (
    <CardBox>
      <SectionHeader jp="週間アクティビティ" en="Weekly Activity" rightJp="今週" rightEn="This week" />

      <div className="flex" style={{ height: 180, gap: 4, alignItems: "flex-end", justifyContent: "space-evenly", padding: "8px 0 0" }}>
        {WEEK.map((d, i) => {
          const isBest = i === bestIdx;
          const isToday = i === todayIdx;
          const barH = Math.max(18, (d.v / max) * chartH);
          const grad = isToday
            ? `linear-gradient(180deg,${C.rose} 0%,${C.roseSoft} 100%)`
            : isBest
            ? `linear-gradient(180deg,${C.roseDeep} 0%,${C.rose} 100%)`
            : `linear-gradient(180deg,${C.rose} 0%,${C.roseFill} 100%)`;
          return (
            <div key={d.en} className="flex flex-col items-center" style={{ flex: 1, minWidth: 0 }}>
              <div style={{ height: 22, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-end" }}>
                {isBest && (
                  <>
                    <div style={{ fontSize: 8, color: C.rose, fontWeight: 600 }}>{t("最高", "Best")}</div>
                    <div style={{ fontSize: 9, color: C.rose, lineHeight: 1 }}>★</div>
                  </>
                )}
                {isToday && (
                  <>
                    <div style={{ fontSize: 8, color: C.rose, fontWeight: 600 }}>{t("今日", "Today")}</div>
                    <div style={{ fontSize: 10, lineHeight: 1, animation: "msFloat 2s ease-in-out infinite" }}></div>
                  </>
                )}
              </div>
              <div style={{ fontSize: 8, color: C.muted, marginBottom: 3, fontVariantNumeric: "tabular-nums" }}>
                {(d.v / 1000).toFixed(1)}k
              </div>
              <div style={{
                position: "relative", width: 26, height: chartH,
                background: C.roseTint, borderRadius: 50, overflow: "hidden",
              }}>
                <div style={{
                  position: "absolute", left: 0, right: 0, bottom: 0,
                  height: mounted ? barH : 0,
                  background: grad, borderRadius: 50,
                  transition: `height 600ms cubic-bezier(.34,1.2,.64,1) ${i * 60}ms`,
                }} />
              </div>
              <div style={{
                fontSize: 10, marginTop: 6,
                color: isToday ? C.rose : C.muted,
                fontWeight: isToday ? 600 : 400,
              }}>
                {t(d.jp, d.en)}
              </div>
              {isToday && <div style={{ width: 4, height: 4, borderRadius: "50%", background: C.rose, marginTop: 2 }} />}
            </div>
          );
        })}
      </div>

      <div style={{ height: 1, background: C.divider, margin: "14px 0 12px" }} />
      <div className="flex items-center justify-between" style={{ flexWrap: "wrap", gap: 6 }}>
        <div className="flex items-baseline" style={{ gap: 6 }}>
          <span style={{ fontSize: 11, color: C.muted }}>{t("今週の合計", "Weekly Total")}</span>
          <span style={{ fontSize: 14, fontFamily: "var(--font-heading)", fontWeight: 600, color: C.rose, fontVariantNumeric: "tabular-nums" }}>
            {total.toLocaleString()}歩
          </span>
        </div>
        <span style={{ fontSize: 11, color: C.green, fontWeight: 600 }}>
          {t("先週比 +8% ↑", "+8% vs last week ↑")}
        </span>
      </div>
    </CardBox>
  );
}

// ---------- Card 3: Three Metrics ----------
function MetricCards() {
  const t = useT();
  return (
    <div className="grid grid-cols-3" style={{ gap: 10 }}>
      <MetricCard
        icon={<Activity size={20} />} color={C.rose} bg="rgba(123,179,212,0.12)"
        value="2h 15m" jp="活動時間" en="Active Time" arcPct={0.09}
      />
      <MetricCard
        icon={<Moon size={20} />} color={C.indigo} bg="rgba(99,102,241,0.1)"
        value="13h 45m" jp="休息時間" en="Rest Time" arcPct={0.57}
      />
      <MetricCard
        icon={<Flame size={20} />} color={C.orange} bg="rgba(249,115,22,0.1)"
        value="285" unit="kcal" jp="消費カロリー" en="Calories Burned" arcPct={0.42}
      />
    </div>
  );

  function MetricCard({ icon, color, bg, value, unit, jp, en, arcPct }: {
    icon: React.ReactNode; color: string; bg: string; value: string; unit?: string; jp: string; en: string; arcPct: number;
  }) {
    return (
      <div style={{
        background: C.card, borderRadius: 20, padding: "16px 10px",
        boxShadow: "0 2px 16px rgba(0,0,0,0.05)",
        display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center",
      }}>
        <div style={{
          width: 44, height: 44, borderRadius: "50%", background: bg, color,
          display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 8,
        }}>{icon}</div>
        <div className="flex items-baseline" style={{ gap: 3 }}>
          <span style={{ fontSize: 18, fontFamily: "var(--font-heading)", fontWeight: 600, color: C.sumi, fontVariantNumeric: "tabular-nums", lineHeight: 1 }}>
            {value}
          </span>
          {unit && <span style={{ fontSize: 11, color, fontWeight: 600 }}>{unit}</span>}
        </div>
        <div style={{ fontSize: 10, color: C.muted, marginTop: 6 }}>{t(jp, jp)}</div>
        <div style={{ fontSize: 9, color: C.faint }}>{en}</div>
        <svg width={32} height={18} viewBox="0 0 32 18" style={{ marginTop: 6 }}>
          <path d="M2,16 A14,14 0 0 1 30,16" stroke={C.divider} strokeWidth={2.5} fill="none" strokeLinecap="round" />
          <path
            d="M2,16 A14,14 0 0 1 30,16"
            stroke={color} strokeWidth={2.5} fill="none" strokeLinecap="round"
            strokeDasharray={44} strokeDashoffset={44 * (1 - arcPct)}
            style={{ transition: "stroke-dashoffset 1.2s ease-out" }}
          />
        </svg>
      </div>
    );
  }
}

// ---------- Card 4: Trend Line ----------
function TrendCard({ mounted }: { mounted: boolean }) {
  const t = useT();
  const W = 280, H = 130, PX = 16, PY = 16;
  const innerW = W - PX * 2, innerH = H - PY * 2;
  const pts = TREND.map((v, i) => {
    const x = PX + (i / (TREND.length - 1)) * innerW;
    const y = PY + (1 - v / 100) * innerH;
    return [x, y] as [number, number];
  });
  // monotone-ish smoothing via cubic
  const path = pts.reduce((acc, p, i) => {
    if (i === 0) return `M${p[0]},${p[1]}`;
    const prev = pts[i - 1];
    const midX = (prev[0] + p[0]) / 2;
    return `${acc} C${midX},${prev[1]} ${midX},${p[1]} ${p[0]},${p[1]}`;
  }, "");
  const areaPath = `${path} L${pts[pts.length - 1][0]},${H - PY} L${pts[0][0]},${H - PY} Z`;

  return (
    <CardBox>
      <SectionHeader jp="活動レベル" en="Activity Level" rightJp="過去7日間" rightEn="Past 7 days" />
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" height={H}>
        <defs>
          <linearGradient id="msArea" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={C.rose} stopOpacity="0.15" />
            <stop offset="100%" stopColor={C.rose} stopOpacity="0" />
          </linearGradient>
        </defs>
        {[PY + innerH * 0.25, PY + innerH * 0.75].map((y) => (
          <line key={y} x1={PX} x2={W - PX} y1={y} y2={y} stroke="rgba(0,0,0,0.04)" strokeWidth={1} />
        ))}
        <text x={4} y={PY + 4} fontSize={8} fill={C.faint}>High</text>
        <text x={4} y={PY + innerH / 2 + 3} fontSize={8} fill={C.faint}>Mid</text>
        <text x={4} y={PY + innerH} fontSize={8} fill={C.faint}>Low</text>

        <path d={areaPath} fill="url(#msArea)" opacity={mounted ? 1 : 0} style={{ transition: "opacity 1s ease-out" }} />
        <path
          d={path} stroke={C.rose} strokeWidth={2.5} fill="none"
          strokeLinecap="round" strokeLinejoin="round"
          pathLength={1} strokeDasharray={1}
          strokeDashoffset={mounted ? 0 : 1}
          style={{ transition: "stroke-dashoffset 1.2s ease-out" }}
        />
        {pts.map((p, i) => (
          <g key={i}>
            <circle cx={p[0]} cy={p[1]} r={3} fill="#fff" stroke={C.rose} strokeWidth={2} />
            <text x={p[0]} y={H - 2} fontSize={10}
              fill={i === pts.length - 1 ? C.rose : C.muted}
              fontWeight={i === pts.length - 1 ? 600 : 400}
              textAnchor="middle">
              {t(WEEK[i].jp, WEEK[i].en)}
            </text>
          </g>
        ))}
      </svg>
      <div className="flex items-center" style={{ gap: 6, marginTop: 8 }}>
        <Clock size={14} color={C.rose} />
        <span style={{ fontSize: 12, color: C.ink2 }}>
          {t("最も活発な時間帯: 10:00 - 12:00", "Most active time: 10:00 - 12:00")}
        </span>
      </div>
    </CardBox>
  );
}

// ---------- Card 5: Timeline ----------
function TimelineCard() {
  const t = useT();
  const colors = ["#F0F7FC", C.roseFill, C.roseMid, C.rose];
  return (
    <CardBox>
      <SectionHeader jp="本日のタイムライン" en="Today's Timeline" />
      <div style={{ position: "relative", paddingTop: 14 }}>
        <div className="flex" style={{ gap: 2, alignItems: "flex-end" }}>
          {TIMELINE.map((lv, h) => (
            <div key={h} style={{
              flex: 1, height: 32, borderRadius: 4,
              background: colors[lv],
              position: "relative",
            }} />
          ))}
        </div>
        {/* Now marker */}
        <div style={{
          position: "absolute", top: 0, bottom: 18,
          left: `calc(${(NOW_HOUR / 24) * 100}% + ${NOW_HOUR}px)`,
          width: 1.5, background: C.rose,
        }}>
          <div style={{
            position: "absolute", top: -2, left: "50%", transform: "translateX(-50%)",
            fontSize: 8, color: C.rose, fontFamily: "var(--font-heading)", fontWeight: 600, whiteSpace: "nowrap",
            background: "#FFF", padding: "0 4px", borderRadius: 4,
          }}>
            {t("現在", "Now")}
          </div>
        </div>
        <div className="flex" style={{ marginTop: 6, justifyContent: "space-between", padding: "0 2px" }}>
          {[6, 9, 12, 15, 18, 21].map((h) => (
            <span key={h} style={{ fontSize: 9, color: C.muted, fontVariantNumeric: "tabular-nums" }}>{h}</span>
          ))}
        </div>
      </div>
      <div className="flex" style={{ gap: 10, marginTop: 12, flexWrap: "wrap" }}>
        {[
          { c: colors[0], jp: "非活動", en: "None" },
          { c: colors[1], jp: "軽い", en: "Light" },
          { c: colors[2], jp: "中程度", en: "Medium" },
          { c: colors[3], jp: "高強度", en: "High" },
        ].map((x) => (
          <div key={x.en} className="flex items-center" style={{ gap: 4 }}>
            <span style={{ width: 10, height: 10, borderRadius: 2, background: x.c }} />
            <span style={{ fontSize: 9, color: "#6B7280" }}>{t(x.jp, x.en)}</span>
          </div>
        ))}
      </div>
    </CardBox>
  );
}

// ---------- Card 6: AI Insight ----------
function AIInsightBlock({ name }: { name: string }) {
  const t = useT();
  const { language } = useLanguage();
  const jp = `${name}は先週より12%多く動いています。木曜日が最も活発で、5,200歩を達成しました！`;
  const en = `${name} is 12% more active than last week. Thursday was the most active day with 5,200 steps!`;
  return (
    <div style={{
      background: "#2C4A6E",
      borderRadius: 16,
      padding: 20,
      boxShadow: "0 2px 12px rgba(91, 175, 214, 0.10)",
      color: "#FFFFFF",
    }}>
      <div className="flex items-center" style={{ gap: 6 }}>
        <Sparkles size={16} color="#FFFFFF" />
        <span style={{ fontSize: 11, color: "#FFFFFF", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase" }}>
          {t("AIインサイト", "AI Insight")}
        </span>
      </div>
      <div style={{ height: 1, background: "rgba(255,255,255,0.18)", margin: "12px 0" }} />
      {language !== "english" && (
        <div style={{ fontSize: 14, color: "rgba(255,255,255,0.92)", lineHeight: 1.8 }}>{jp}</div>
      )}
      {language !== "japanese" && (
        <div style={{
          fontSize: language === "english" ? 14 : 12,
          color: language === "english" ? "rgba(255,255,255,0.92)" : "rgba(255,255,255,0.7)",
          lineHeight: language === "english" ? 1.8 : 1.6,
          marginTop: language === "mixed" ? 6 : 0,
        }}>{en}</div>
      )}

      <div className="inline-flex items-center" style={{
        marginTop: 12, gap: 4,
        background: "rgba(255,255,255,0.15)", color: "#FFFFFF",
        borderRadius: 50, padding: "4px 12px",
        fontSize: 11, fontWeight: 500, width: "fit-content",
      }}>
        <ArrowUp size={12} color="#86EFAC" />
        {t("先週比 +12% 改善", "12% improvement from last week")}
      </div>
      <div className="flex items-center justify-end" style={{ gap: 4, marginTop: 12 }}>
        <span style={{ fontSize: 10, color: "rgba(255,255,255,0.5)" }}>{t("最終更新", "Last updated")}:</span>
        <span style={{ fontSize: 11, color: "rgba(255,255,255,0.5)" }}>{t("今日 14:32", "Today 14:32")}</span>
      </div>
    </div>
  );
}
