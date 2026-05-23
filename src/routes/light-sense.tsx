import { createFileRoute } from "@tanstack/react-router";
import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import AppShell, { TopBar } from "@/components/AppShell";
import { SenseBanner } from "@/components/SenseBanner";
import { useT } from "@/context/LanguageContext";
import { toast } from "sonner";

export const Route = createFileRoute("/light-sense")({ component: LightSensePage });

// ───────────── Blue palette — matches motion-sense ─────────────
const P = {
  primary: "#F4A0BC",
  medium: "#E8849A",
  deep: "#C96B82",
  soft: "#FEF0F5",
  pale: "#FFF5F8",
  accent: "#F7B8CC",
  muted: "#FAD0DF",
  light: "#FDE8EF",
  divider: "#FEE8F0",
  white: "#FFFFFF",
  text: "#1A1A2E",
  text2: "#6B7280",
  text3: "#9CA3AF",
  ink: "#4B5563",
};

// ───────────── Color utils ─────────────
function hslToHex(h: number, s: number, l: number) {
  s /= 100; l /= 100;
  const k = (n: number) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) =>
    Math.round(255 * (l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1))))).toString(16).padStart(2, "0");
  return `#${f(0)}${f(8)}${f(4)}`.toUpperCase();
}
function hexToRgb(hex: string) {
  const h = hex.replace("#", "");
  return { r: parseInt(h.slice(0, 2), 16), g: parseInt(h.slice(2, 4), 16), b: parseInt(h.slice(4, 6), 16) };
}
function hexToHsl(hex: string) {
  const { r, g, b } = hexToRgb(hex);
  const rn = r / 255, gn = g / 255, bn = b / 255;
  const max = Math.max(rn, gn, bn), min = Math.min(rn, gn, bn);
  let h = 0, s = 0; const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case rn: h = (gn - bn) / d + (gn < bn ? 6 : 0); break;
      case gn: h = (bn - rn) / d + 2; break;
      case bn: h = (rn - gn) / d + 4; break;
    }
    h *= 60;
  }
  return { h, s: s * 100, l: l * 100 };
}

type NamedColor = { hex: string; jp: string; en: string };
const JAPANESE_PALETTE: NamedColor[] = [
  { hex: "#FFB7C5", jp: "桜", en: "Sakura" },
  { hex: "#F19BAB", jp: "撫子", en: "Nadeshiko" },
  { hex: "#E8B4BD", jp: "梅", en: "Ume" },
  { hex: "#DB7093", jp: "牡丹", en: "Botan" },
  { hex: "#9B8EC4", jp: "藤", en: "Fuji" },
  { hex: "#8DC47C", jp: "若草", en: "Wakakusa" },
  { hex: "#F6AD3B", jp: "山吹", en: "Yamabuki" },
  { hex: "#4169E1", jp: "瑠璃", en: "Ruri" },
  { hex: "#FFFFFF", jp: "白", en: "Shiro" },
  { hex: "#C8C8C8", jp: "銀", en: "Gin" },
  { hex: "#C0392B", jp: "紅", en: "Kurenai" },
  { hex: "#1A1A2E", jp: "漆", en: "Urushi" },
];
function findName(hex: string): NamedColor | undefined {
  const u = hex.toUpperCase();
  return JAPANESE_PALETTE.find((c) => c.hex.toUpperCase() === u);
}

type Mode = "steady" | "blink" | "pulse" | "rainbow";
type Env = "indoor" | "outdoor";

// ───────────── Color Wheel ─────────────
function ColorWheel({
  size, color, onChange,
}: {
  size: number;
  color: string;
  onChange: (hex: string) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState(false);
  const ring = 40;
  const radius = size / 2;
  const trackR = radius - ring / 2;

  const { h } = hexToHsl(color);
  const rad = ((h - 90) * Math.PI) / 180;
  const ix = radius + Math.cos(rad) * trackR;
  const iy = radius + Math.sin(rad) * trackR;

  const pick = useCallback((cx: number, cy: number) => {
    const el = ref.current; if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = cx - rect.left - radius;
    const y = cy - rect.top - radius;
    let ang = (Math.atan2(y, x) * 180) / Math.PI + 90;
    if (ang < 0) ang += 360;
    if (ang >= 360) ang -= 360;
    onChange(hslToHex(ang, 85, 65));
  }, [radius, onChange]);

  useEffect(() => {
    if (!dragging) return;
    const move = (e: PointerEvent) => pick(e.clientX, e.clientY);
    const up = () => setDragging(false);
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    return () => { window.removeEventListener("pointermove", move); window.removeEventListener("pointerup", up); };
  }, [dragging, pick]);

  return (
    <div
      ref={ref}
      onPointerDown={(e) => {
        setDragging(true);
        (e.target as Element).setPointerCapture?.(e.pointerId);
        pick(e.clientX, e.clientY);
      }}
      style={{
        position: "relative", width: size, height: size, borderRadius: "50%",
        background: `conic-gradient(from 0deg, #ff0000, #ffaa00, #ffff00, #aaff00, #00ff00, #00ffaa, #00ffff, #00aaff, #0000ff, #aa00ff, #ff00ff, #ff00aa, #ff0000)`,
        cursor: dragging ? "grabbing" : "grab", touchAction: "none",
        boxShadow: `inset 0 0 0 1px ${P.muted}, 0 4px 20px rgba(244,160,188,0.15)`,
        boxSizing: "border-box",
      }}
    >
      {/* mask center to ring */}
      <div style={{
        position: "absolute", inset: ring, borderRadius: "50%",
        background: P.white,
        boxShadow: `inset 0 0 0 1px ${P.muted}`,
      }} />
      {/* center preview */}
      <div style={{
        position: "absolute", left: "50%", top: "50%", transform: "translate(-50%,-50%)",
        width: 90, height: 90, borderRadius: "50%",
        background: P.white, display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        pointerEvents: "none",
      }}>
        <div style={{
          width: 56, height: 56, borderRadius: "50%",
          background: color,
          boxShadow: `0 0 22px 4px ${color}55, inset 0 0 0 1px rgba(255,255,255,0.4)`,
        }} />
        <div style={{ fontSize: 11, color: P.text3, marginTop: 6, letterSpacing: "0.04em", fontVariantNumeric: "tabular-nums" }}>{color}</div>
      </div>
      {/* drag thumb */}
      <div style={{
        position: "absolute", width: 16, height: 16, borderRadius: "50%",
        left: ix - 8, top: iy - 8,
        background: "#fff",
        boxShadow: dragging
          ? "0 4px 12px rgba(0,0,0,0.25), inset 0 0 0 1px rgba(0,0,0,0.05)"
          : "0 2px 6px rgba(0,0,0,0.18), inset 0 0 0 1px rgba(0,0,0,0.05)",
        pointerEvents: "none",
      }} />
    </div>
  );
}

// ───────────── Inline SVG icons (no emojis) ─────────────
function IconMoon({ size = 16, color = "#9CA3AF" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z" />
    </svg>
  );
}
function IconPaw({ size = 16, color = "#9CA3AF" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <circle cx="6" cy="9" r="2" /><circle cx="10" cy="5" r="2" />
      <circle cx="14" cy="5" r="2" /><circle cx="18" cy="9" r="2" />
      <path d="M12 11c-3 0-6 3-6 6 0 2 1.5 3 3 3 1 0 1.5-.5 3-.5s2 .5 3 .5c1.5 0 3-1 3-3 0-3-3-6-6-6Z" />
    </svg>
  );
}
function IconZz({ size = 16, color = "#9CA3AF" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 7h6L5 17h6" /><path d="M13 11h5l-5 6h5" />
    </svg>
  );
}
function IconWarning({ size = 16, color = "#C0C0C0" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.4} strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" />
      <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  );
}
function IconBattery({ size = 16, color = "#C0C0C0" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.4} strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="7" width="17" height="10" rx="2" />
      <line x1="22" y1="11" x2="22" y2="13" />
      <line x1="6" y1="11" x2="6" y2="13" />
    </svg>
  );
}

// ───────────── Toggle ─────────────
function Toggle({ on, onChange }: { on: boolean; onChange: () => void }) {
  return (
    <button
      onClick={(e) => { e.stopPropagation(); onChange(); }}
      style={{
        position: "relative", width: 40, height: 22, borderRadius: 50,
        background: on ? P.primary : "#E5E7EB",
        border: "none", cursor: "pointer", padding: 0, flexShrink: 0,
        transition: "background 200ms ease",
      }}
    >
      <span style={{
        position: "absolute", top: 2, left: on ? 20 : 2,
        width: 18, height: 18, borderRadius: "50%", background: "#fff",
        boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
        transition: "left 200ms ease",
      }} />
    </button>
  );
}

// ───────────── Page ─────────────
function LightSensePage() {
  const t = useT();
  const [color, setColor] = useState("#FFB7C5");
  const [saturation, setSaturation] = useState(85);
  const [brightness, setBrightness] = useState(75);
  const [mode, setMode] = useState<Mode>("steady");
  const [env, setEnv] = useState<Env>("outdoor");
  const [schedules, setSchedules] = useState<Record<"night" | "walk" | "sleep", boolean>>({
    night: true, walk: false, sleep: false,
  });

  const named = useMemo(() => findName(color), [color]);

  const selectColor = (hex: string) => setColor(hex);

  const previewAnim =
    mode === "blink" ? "lsBlink 0.8s ease-in-out infinite" :
    mode === "pulse" ? "lsPulse 1.6s ease-in-out infinite" :
    mode === "rainbow" ? "lsHue 3s linear infinite" :
    "none";

  const cardBase: React.CSSProperties = {
    background: P.white, borderRadius: 22, padding: 20, overflow: "hidden",
    boxShadow: "0 4px 20px rgba(244,160,188,0.10)",
    borderLeft: `4px solid ${P.accent}`, boxSizing: "border-box",
  };
  const labelStyle: React.CSSProperties = {
    color: P.primary, fontSize: 11, letterSpacing: "0.08em", fontFamily: "var(--font-heading)", fontWeight: 600, marginBottom: 14,
    display: "flex", alignItems: "center", gap: 6,
  };

  return (
    <AppShell
      noPadding
      renderTopBar={({ menuOpen, onMenuClick }) => (
        <TopBar showBack backTo="/home" menuOpen={menuOpen} onMenuClick={onMenuClick} />
      )}
    >
      <style>{`
        @keyframes lsBlink { 0%,100%{opacity:1} 50%{opacity:0.1} }
        @keyframes lsPulse { 0%,100%{transform:scale(1);opacity:1} 50%{transform:scale(1.4);opacity:0.7} }
        @keyframes lsPulseRing { 0%{transform:scale(1);opacity:0.6} 100%{transform:scale(1.8);opacity:0} }
        @keyframes lsHue { 0%{filter:hue-rotate(0deg)} 100%{filter:hue-rotate(360deg)} }
        .ls-slider { -webkit-appearance: none; appearance: none; background: transparent; }
        .ls-slider::-webkit-slider-thumb {
          -webkit-appearance: none; appearance: none;
          width: 20px; height: 20px; border-radius: 50%;
          background: #fff; cursor: pointer;
          box-shadow: 0 2px 6px rgba(0,0,0,0.18);
          border: none;
        }
        .ls-slider::-moz-range-thumb {
          width: 20px; height: 20px; border-radius: 50%; background: #fff;
          box-shadow: 0 2px 6px rgba(0,0,0,0.18); border: none;
        }
      `}</style>

      <div style={{ background: P.pale, minHeight: "100%", paddingBottom: 120, boxSizing: "border-box" }}>
        {/* HERO */}
        <SenseBanner
          subtitleJp="ライトセンス AI"
          titleEn="LightSense AI"
          descriptorJp="カラーライト制御"
          descriptorEn="Collar light control"
          bgGradient="linear-gradient(135deg, #FFF5F8 0%, #FEE8F0 100%)"
          kanji="光"
          kanjiColor="rgba(244,160,188,0.08)"
          subtitleColor="#D4849E"
        />

        {/* Stats card below banner */}
        <div style={{ padding: "0 16px", marginTop: -36, position: "relative", zIndex: 2 }}>
          <div style={{
            background: P.white, borderRadius: 20, padding: 16,
            boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
            display: "grid", gridTemplateColumns: "1fr 1fr 1fr",
            boxSizing: "border-box",
          }}>
            <StatCol label={t("カラー", "CURRENT")}>
              <div style={{
                width: 30, height: 30, borderRadius: "50%", background: color, margin: "0 auto",
                boxShadow: `0 0 12px ${color}66`, border: "2px solid #fff",
              }} />
            </StatCol>
            <StatCol label={t("明るさ", "BRIGHTNESS")} divider>
              <div style={{ fontSize: 20, fontFamily: "var(--font-heading)", fontWeight: 600, color: P.primary, fontVariantNumeric: "tabular-nums" }}>{brightness}%</div>
            </StatCol>
            <StatCol label={t("モード", "MODE")} divider>
              <div style={{ fontSize: 13, fontWeight: 600, color: P.text, textTransform: "capitalize" }}>{mode}</div>
            </StatCol>
          </div>
        </div>

        <div style={{ padding: "16px 16px", display: "flex", flexDirection: "column", gap: 14 }}>

          {/* CARD 1: Color Wheel */}
          <div style={{ ...cardBase, borderLeft: `4px solid ${P.primary}`, borderRadius: 24 }}>
            <div style={labelStyle}>
              <span style={{ width: 5, height: 5, borderRadius: "50%", background: P.primary }} />
              {t("カラー選択", "COLOR SELECT")}
            </div>
            <div style={{ display: "flex", justifyContent: "center", padding: "8px 0 18px" }}>
              <ColorWheel size={210} color={color} onChange={setColor} />
            </div>

            {/* Brightness slider */}
            <SliderRow
              labelJp="明るさ" labelEn="Brightness" value={brightness}
              track={`linear-gradient(to right, ${P.soft}, ${color})`}
              onChange={setBrightness}
            />
            <div style={{ height: 14 }} />
            {/* Saturation slider */}
            <SliderRow
              labelJp="彩度" labelEn="Saturation" value={saturation}
              track={`linear-gradient(to right, #E5E7EB, ${hslToHex(hexToHsl(color).h, 100, 55)})`}
              onChange={(v) => {
                setSaturation(v);
                const { h } = hexToHsl(color);
                setColor(hslToHex(h, v, 60));
              }}
            />
          </div>

          {/* CARD 2: Japanese palette */}
          <div style={cardBase}>
            <div style={labelStyle}>
              <span style={{ width: 5, height: 5, borderRadius: "50%", background: P.primary }} />
              {t("和の色", "JAPANESE PALETTE")}
            </div>
            <div style={{ fontSize: 11, color: P.text3, marginBottom: 16 }}>
              {t("伝統的な日本の色", "Traditional Japanese colors")}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }}>
              {JAPANESE_PALETTE.map((c) => {
                const active = c.hex.toUpperCase() === color.toUpperCase();
                return (
                  <button key={c.hex} onClick={() => selectColor(c.hex)}
                    style={{
                      display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
                      background: "transparent", border: "none", cursor: "pointer", padding: 0,
                    }}>
                    <div style={{
                      width: 44, height: 44, borderRadius: "50%", background: c.hex,
                      boxShadow: active
                        ? `0 0 0 2px #fff, 0 0 0 3.5px ${P.primary}, 0 3px 10px rgba(0,0,0,0.12)`
                        : "0 2px 8px rgba(0,0,0,0.08)",
                      border: c.hex === "#FFFFFF" ? `1px solid ${P.divider}` : "none",
                      transition: "box-shadow 0.18s ease",
                    }} />
                    <div style={{ fontSize: 9, color: P.text3, lineHeight: 1.1, textAlign: "center" }}>{c.jp}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* CARD 3: Light Modes */}
          <div style={cardBase}>
            <div style={labelStyle}>
              <span style={{ width: 5, height: 5, borderRadius: "50%", background: P.primary }} />
              {t("ライトモード", "LIGHT MODES")}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              {([
                { k: "steady", jp: "常灯", en: "Steady", subJp: "一定の光", subEn: "Constant" },
                { k: "blink", jp: "点滅", en: "Blink", subJp: "注意を引く", subEn: "Alert" },
                { k: "pulse", jp: "パルス", en: "Pulse", subJp: "呼吸する光", subEn: "Breathe" },
                { k: "rainbow", jp: "虹", en: "Rainbow", subJp: "カラーサイクル", subEn: "Cycle" },
              ] as const).map((m) => {
                const active = mode === m.k;
                return (
                  <button key={m.k} onClick={() => setMode(m.k as Mode)}
                    style={{
                      borderRadius: 16, padding: 16, textAlign: "left", cursor: "pointer",
                      background: active ? P.pale : "#fff",
                      border: active ? `1.5px solid ${P.primary}` : `1.5px solid ${P.divider}`,
                      transition: "all 0.2s",
                      display: "flex", flexDirection: "column", gap: 10,
                      boxSizing: "border-box",
                    }}>
                    <div style={{ position: "relative", height: 22, display: "flex", alignItems: "center" }}>
                      <ModeIcon k={m.k as Mode} color={color} />
                    </div>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: P.text }}>{m.jp}</div>
                      <div style={{ fontSize: 11, color: P.text3, marginTop: 2 }}>{m.subJp} / {m.subEn}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* CARD 4: Auto Schedule */}
          <div style={cardBase}>
            <div style={labelStyle}>
              <span style={{ width: 5, height: 5, borderRadius: "50%", background: P.primary }} />
              {t("自動スケジュール", "AUTO SCHEDULE")}
            </div>
            <div style={{ fontSize: 11, color: P.text3, marginBottom: 6 }}>
              {t("時間帯に合わせて自動調整", "Auto-adjust by time")}
            </div>
            <ScheduleRow
              icon={<IconMoon />}
              titleJp="夜間モード" titleEn="Night Mode"
              meta={`19:00 – 07:00 · ${t("明るさ", "Brightness")} 40%`}
              on={schedules.night} onToggle={() => setSchedules({ ...schedules, night: !schedules.night })}
              first
            />
            <ScheduleRow
              icon={<IconPaw />}
              titleJp="散歩モード" titleEn="Walk Mode"
              meta={`07:00–09:00, 17:00–19:00 · ${t("全輝度", "Full brightness")}`}
              on={schedules.walk} onToggle={() => setSchedules({ ...schedules, walk: !schedules.walk })}
            />
            <ScheduleRow
              icon={<IconZz />}
              titleJp="おやすみ" titleEn="Sleep Mode"
              meta={`22:00 – 06:00 · ${t("消灯", "Off")}`}
              on={schedules.sleep} onToggle={() => setSchedules({ ...schedules, sleep: !schedules.sleep })}
            />
          </div>

          {/* CARD 5: Collar preview */}
          <div style={{
            borderRadius: 24, padding: 28, background: P.text, overflow: "hidden", boxSizing: "border-box",
          }}>
            <div style={{
              color: "rgba(255,255,255,0.4)", fontSize: 10, letterSpacing: "0.15em",
              fontWeight: 600, textAlign: "center", marginBottom: 18,
            }}>{t("プレビュー", "PREVIEW")}</div>

            <div style={{ display: "flex", justifyContent: "center", padding: "12px 0 20px" }}>
              <div style={{
                position: "relative", width: 140, height: 140,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                {/* Outer ring */}
                <div style={{
                  position: "absolute", width: 140, height: 140, borderRadius: "50%",
                  border: "1px solid rgba(255,255,255,0.06)",
                }} />
                {/* Middle ring */}
                <div style={{
                  position: "absolute", width: 110, height: 110, borderRadius: "50%",
                  border: "1px solid rgba(255,255,255,0.10)",
                }} />
                {/* Inner color circle with glow */}
                <div style={{
                  width: 70, height: 70, borderRadius: "50%",
                  background: color,
                  opacity: 0.5 + (brightness / 100) * 0.5 * (env === "indoor" ? 0.75 : 1),
                  boxShadow: `
                    0 0 20px 5px ${color}99,
                    0 0 40px 10px ${color}4D,
                    0 0 60px 20px ${color}26
                  `,
                  animation: previewAnim,
                }} />
              </div>
            </div>

            <div style={{ textAlign: "center", marginBottom: 16 }}>
              <div style={{ color: "#fff", fontSize: 18, fontWeight: 300, letterSpacing: "0.02em" }}>
                {named ? named.jp : t("カスタム", "Custom")}
              </div>
              <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 11, marginTop: 4, fontVariantNumeric: "tabular-nums" }}>
                {color} · {brightness}%
              </div>
            </div>

            <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
              {([
                { k: "indoor", jp: "屋内", en: "Indoor" },
                { k: "outdoor", jp: "屋外", en: "Outdoor" },
              ] as const).map((e) => (
                <button key={e.k} onClick={() => setEnv(e.k as Env)}
                  style={{
                    padding: "6px 16px", borderRadius: 50, fontSize: 11, cursor: "pointer",
                    background: env === e.k ? "rgba(255,255,255,0.18)" : "rgba(255,255,255,0.08)",
                    color: env === e.k ? "#fff" : "rgba(255,255,255,0.6)",
                    border: "none", letterSpacing: "0.02em",
                    transition: "background 200ms ease",
                  }}>{e.jp} / {e.en}</button>
              ))}
            </div>
          </div>

          {/* CARD 6: Safety Guide */}
          <div style={{ ...cardBase, background: P.pale }}>
            <div style={labelStyle}>
              <span style={{ width: 5, height: 5, borderRadius: "50%", background: P.primary }} />
              {t("安全ガイド", "SAFETY GUIDE")}
            </div>
            <SafetyRow
              icon={<IconMoon color="#C0C0C0" />}
              titleJp="夜間散歩" titleEn="Night walks"
              jp="明るさ80%以上を推奨します"
              en="80% brightness or higher recommended"
              first
            />
            <SafetyRow
              icon={<IconWarning />}
              titleJp="交通量の多いエリア" titleEn="High traffic areas"
              jp="点滅モードで視認性を高めてください"
              en="Use blink mode to increase visibility"
            />
            <SafetyRow
              icon={<IconBattery />}
              titleJp="バッテリー節約" titleEn="Battery saving"
              jp="点滅モードは常灯より50%節電します"
              en="Blink mode saves 50% more battery"
            />
          </div>
        </div>

        {/* Set Color button */}
        <div style={{ position: "sticky", bottom: 16, padding: "0 16px" }}>
          <button
            onClick={() => toast.success(t("カラーを設定しました", "Color set!"))}
            style={{
              width: "100%", height: 52, borderRadius: 50, border: "none",
              background: `linear-gradient(135deg, ${P.medium}, ${P.primary})`,
              color: "#fff", fontSize: 16, fontWeight: 600, cursor: "pointer",
              boxShadow: "0 6px 20px rgba(244,160,188,0.4)",
              letterSpacing: "0.02em",
            }}>
            {t("カラーを設定", "Set Color")}
          </button>
        </div>
      </div>
    </AppShell>
  );
}

// ───────────── Subcomponents ─────────────
function StatCol({ label, children, divider }: { label: string; children: React.ReactNode; divider?: boolean }) {
  return (
    <div style={{
      textAlign: "center",
      borderLeft: divider ? `1px solid ${P.divider}` : "none",
      padding: "0 4px",
    }}>
      <div style={{ fontSize: 9, letterSpacing: "0.12em", color: P.text3, fontFamily: "var(--font-heading)", fontWeight: 600, marginBottom: 8 }}>{label}</div>
      <div style={{ height: 30, display: "flex", alignItems: "center", justifyContent: "center" }}>{children}</div>
    </div>
  );
}

function SliderRow({ labelJp, labelEn, value, track, onChange }: {
  labelJp: string; labelEn: string; value: number; track: string; onChange: (v: number) => void;
}) {
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
        <span style={{ fontSize: 11, color: P.text3 }}>{labelJp} / {labelEn}</span>
        <span style={{ fontSize: 11, color: P.primary, fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>{value}%</span>
      </div>
      <div style={{ position: "relative", height: 20, display: "flex", alignItems: "center" }}>
        <div style={{
          position: "absolute", left: 0, right: 0, height: 8, borderRadius: 50,
          background: track,
        }} />
        <input type="range" min={0} max={100} value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="ls-slider"
          style={{ position: "relative", width: "100%", height: 20, zIndex: 2, margin: 0 }} />
      </div>
    </div>
  );
}

function ModeIcon({ k, color }: { k: Mode; color: string }) {
  if (k === "steady") {
    return <span style={{ width: 16, height: 16, borderRadius: "50%", background: color, boxShadow: `0 0 10px ${color}99` }} />;
  }
  if (k === "blink") {
    return <span style={{ width: 16, height: 16, borderRadius: "50%", background: color, animation: "lsBlink 0.8s ease-in-out infinite" }} />;
  }
  if (k === "pulse") {
    return (
      <span style={{ position: "relative", width: 16, height: 16 }}>
        <span style={{ position: "absolute", inset: 0, borderRadius: "50%", background: color, animation: "lsPulse 1.6s ease-in-out infinite" }} />
        <span style={{ position: "absolute", inset: -4, borderRadius: "50%", border: `1.5px solid ${color}`, animation: "lsPulseRing 1.6s ease-out infinite" }} />
      </span>
    );
  }
  // rainbow
  return (
    <span style={{
      width: 16, height: 16, borderRadius: "50%",
      background: "conic-gradient(red, orange, yellow, lime, cyan, blue, magenta, red)",
      animation: "lsHue 3s linear infinite",
    }} />
  );
}

function ScheduleRow({ icon, titleJp, titleEn, meta, on, onToggle, first }: {
  icon: React.ReactNode; titleJp: string; titleEn: string; meta: string;
  on: boolean; onToggle: () => void; first?: boolean;
}) {
  return (
    <div
      onClick={onToggle}
      style={{
        display: "flex", alignItems: "center", gap: 12,
        padding: "14px 0",
        borderTop: first ? "none" : `1px solid ${P.divider}`,
        cursor: "pointer",
      }}>
      <div style={{
        width: 32, height: 32, borderRadius: "50%", background: P.soft,
        display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
      }}>{icon}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, color: P.text, fontWeight: 500, lineHeight: 1.25 }}>{titleJp} / {titleEn}</div>
        <div style={{ fontSize: 11, color: P.text3, marginTop: 2 }}>{meta}</div>
      </div>
      <Toggle on={on} onChange={onToggle} />
    </div>
  );
}

function SafetyRow({ icon, titleJp, titleEn, jp, en, first }: {
  icon: React.ReactNode; titleJp: string; titleEn: string; jp: string; en: string; first?: boolean;
}) {
  return (
    <div style={{
      display: "flex", alignItems: "flex-start", gap: 12,
      padding: "14px 0",
      borderTop: first ? "none" : `1px solid ${P.divider}`,
    }}>
      <div style={{
        width: 32, height: 32, borderRadius: "50%", background: P.soft,
        display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
      }}>{icon}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, color: P.text, fontWeight: 500, lineHeight: 1.25 }}>{titleJp} / {titleEn}</div>
        <div style={{ fontSize: 11, color: P.text3, marginTop: 3, lineHeight: 1.45 }}>{jp}</div>
        <div style={{ fontSize: 11, color: P.text3, marginTop: 1, lineHeight: 1.45 }}>{en}</div>
      </div>
    </div>
  );
}
