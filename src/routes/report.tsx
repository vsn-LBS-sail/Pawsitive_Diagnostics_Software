import { createFileRoute } from "@tanstack/react-router";
import AppShell, { TopBar } from "@/components/AppShell";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip,
  CartesianGrid, ReferenceLine, ReferenceArea,
} from "recharts";
import { useState, type ReactNode, type CSSProperties } from "react";
import {
  QrCode, FileDown, Activity, Thermometer, Footprints, Moon,
  Syringe, Check, Clock, AlertTriangle, Stethoscope, Cross, CheckCircle2,
} from "lucide-react";
import { useT, useLanguage } from "@/context/LanguageContext";
import { usePet, type PetProfile } from "@/context/PetContext";
import DogAvatar, { BREED_KEY_BY_JP, type BreedKey } from "@/components/DogAvatar";

export const Route = createFileRoute("/report")({ component: Report });

const TABS = ["1d", "1w", "1m", "3m", "6m", "4y"] as const;

/* ─────────── Palette ─────────── */
const C = {
  turquoise: "#447F98",
  slate: "#628B85",
  platinum: "#DADEE3",
  glacier: "#B9DBE1",
  ice: "#D6EBF3",
  heading: "#2d4a52",
};

const glass: CSSProperties = {
  background: "#FFFFFF",
  backdropFilter: "blur(8px)",
  WebkitBackdropFilter: "blur(8px)",
  border: "1px solid rgba(185, 219, 225, 0.5)",
  borderRadius: 20,
  boxShadow: "0 4px 20px rgba(68, 127, 152, 0.08)",
};

// Frosted variant preserved for QR & PDF cards (unchanged from prior design)
const frosted: CSSProperties = {
  background: "rgba(214, 235, 243, 0.45)",
  backdropFilter: "blur(16px) saturate(180%)",
  WebkitBackdropFilter: "blur(16px) saturate(180%)",
  border: "1px solid rgba(185, 219, 225, 0.6)",
  borderRadius: 20,
  boxShadow: "0 8px 32px rgba(68, 127, 152, 0.12)",
};

function Report() {
  const t = useT();
  const { language } = useLanguage();
  const { pet } = usePet();
  const [tab, setTab] = useState<(typeof TABS)[number]>("1w");

  const dogName = pet.name || (language === "english" ? "your dog" : "ワンちゃん");

  const dayLabels = language === "english"
    ? ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
    : ["月", "火", "水", "木", "金", "土", "日"];

  const scoreData = [82, 85, 83, 87, 86, 88, 87].map((v, i) => ({ d: dayLabels[i], v }));
  const tempData = [38.3, 38.6, 38.4, 38.8, 38.5, 38.7, 38.5].map((v, i) => ({ d: dayLabels[i], v }));
  const stepsData = [1800, 2600, 2400, 2200, 2000, 2800, 3100].map((v, i) => ({ d: dayLabels[i], v }));
  const sleepData = [7.2, 8.1, 7.5, 6.8, 7.9, 8.4, 7.5].map((v, i) => ({ d: dayLabels[i], v }));

  return (
    <AppShell
      titleJp="健康レポート"
      titleEn="Health Report"
      renderTopBar={({ menuOpen, onMenuClick }) => <TopBar showBack backTo="/home" menuOpen={menuOpen} onMenuClick={onMenuClick} />}
    >
      <div
        style={{
          margin: "-16px -16px 0",
          padding: "16px",
          minHeight: "calc(100% + 32px)",
          background: `linear-gradient(160deg, #F0F7FA 0%, ${C.platinum} 100%)`,
        }}
      >
        <HeroBanner pet={pet} />
        <HeroCard pet={pet} dogName={dogName} />

        {/* Time filter tabs */}
        <div
          style={{
            ...glass,
            padding: 4,
            margin: "0 0 12px",
            display: "flex",
            borderRadius: 16,
          }}
        >
          {TABS.map((tb) => {
            const active = tab === tb;
            return (
              <button
                key={tb}
                onClick={() => setTab(tb)}
                style={{
                  flex: 1,
                  height: 36,
                  borderRadius: 12,
                  fontSize: 12,
                  fontWeight: 700,
                  color: active ? "#fff" : C.slate,
                  background: active ? C.turquoise : "rgba(214, 235, 243, 0.6)",
                  border: "none",
                  margin: 2,
                  boxShadow: active ? "0 2px 8px rgba(68,127,152,0.25)" : "none",
                  transition: "all 0.2s",
                }}
              >
                {tb}
              </button>
            );
          })}
        </div>

        <SectionDivider jp="センサーデータ" en="Sensor Data" />

        {/* Health Score */}
        <ChartCard
          icon={<Activity size={18} color={C.turquoise} />}
          titleJp="健康スコア推移"
          titleEn="Health Score"
          chipText="87 / 100"
        >
          <ResponsiveContainer width="100%" height={160}>
            <AreaChart data={scoreData} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
              <defs>
                <linearGradient id="scoreFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={C.turquoise} stopOpacity={0.35} />
                  <stop offset="100%" stopColor={C.turquoise} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(68,127,152,0.1)" vertical={false} />
              <XAxis dataKey="d" tick={{ fill: C.slate, fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis domain={[60, 100]} tick={{ fill: C.slate, fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip content={<NiceTooltip suffix="" />} />
              <Area type="monotone" dataKey="v" stroke={C.turquoise} strokeWidth={2.5} fill="url(#scoreFill)"
                dot={{ r: 3, fill: C.turquoise }} animationDuration={1000} />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Temperature */}
        <ChartCard
          icon={<Thermometer size={18} color={C.slate} />}
          titleJp="体温履歴"
          titleEn="Temperature History"
          chipText="Avg 38.5°C"
        >
          <ResponsiveContainer width="100%" height={160}>
            <AreaChart data={tempData} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
              <defs>
                <linearGradient id="tempFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={C.slate} stopOpacity={0.3} />
                  <stop offset="100%" stopColor={C.slate} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(68,127,152,0.1)" vertical={false} />
              <XAxis dataKey="d" tick={{ fill: C.slate, fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis domain={[37.5, 39.5]} tick={{ fill: C.slate, fontSize: 10 }} axisLine={false} tickLine={false} />
              <ReferenceArea y1={38.0} y2={39.2} fill={C.glacier} fillOpacity={0.25} />
              <ReferenceLine y={38.5} stroke={C.slate} strokeDasharray="4 4" strokeOpacity={0.5}
                label={{ value: t("正常", "Normal"), position: "right", fill: C.slate, fontSize: 10 }} />
              <Tooltip content={<NiceTooltip suffix="°C" />} />
              <Area type="monotone" dataKey="v" stroke={C.slate} strokeWidth={2.5} fill="url(#tempFill)"
                dot={{ r: 3, fill: C.slate }} animationDuration={1000} />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Activity Steps */}
        <ChartCard
          icon={<Footprints size={18} color={C.turquoise} />}
          titleJp="運動・歩数"
          titleEn="Activity Steps"
          chipText="Avg 2,340"
        >
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={stepsData} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
              <defs>
                <linearGradient id="stepsFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={C.turquoise} stopOpacity={1} />
                  <stop offset="100%" stopColor={C.glacier} stopOpacity={1} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(68,127,152,0.1)" vertical={false} />
              <XAxis dataKey="d" tick={{ fill: C.slate, fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: C.slate, fontSize: 10 }} axisLine={false} tickLine={false} />
              <ReferenceLine y={3000} stroke={C.turquoise} strokeDasharray="4 4" strokeOpacity={0.5}
                label={{ value: t("目標", "Goal"), position: "right", fill: C.turquoise, fontSize: 10 }} />
              <Tooltip content={<NiceTooltip suffix="" />} />
              <Bar dataKey="v" fill="url(#stepsFill)" radius={[6, 6, 0, 0]} animationDuration={1000} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Sleep */}
        <ChartCard
          icon={<Moon size={18} color={C.slate} />}
          titleJp="睡眠パターン"
          titleEn="Sleep Pattern"
          chipText="Avg 7.5h"
        >
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={sleepData} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
              <defs>
                <linearGradient id="sleepFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={C.slate} stopOpacity={1} />
                  <stop offset="100%" stopColor={C.glacier} stopOpacity={1} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(68,127,152,0.1)" vertical={false} />
              <XAxis dataKey="d" tick={{ fill: C.slate, fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis domain={[0, 12]} tick={{ fill: C.slate, fontSize: 10 }} axisLine={false} tickLine={false} />
              <ReferenceArea y1={8} y2={10} fill={C.slate} fillOpacity={0.08} />
              <Tooltip content={<NiceTooltip suffix="h" />} />
              <Bar dataKey="v" fill="url(#sleepFill)" radius={[6, 6, 0, 0]} animationDuration={1000} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <SectionDivider jp="健康記録" en="Health Records" />

        <VaccinationCard />
        <LastVisitCard />

        <SectionDivider jp="レポート" en="Reports" />

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12, alignItems: "stretch" }}>
          <QRCard />
          <PDFCard />
        </div>
      </div>
    </AppShell>
  );
}

/* ─────────── Hero ─────────── */
function HeroCard({ pet: _pet, dogName: _dogName }: { pet: PetProfile; dogName: string }) {
  const t = useT();
  const score = 87;
  const r = 44;
  const circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;


  return (
    <div style={{
      ...glass,
      marginBottom: 16,
      overflow: "hidden",
      borderRadius: 24,
    }}>
      <div style={{ height: 8, background: `linear-gradient(90deg, ${C.turquoise}, ${C.slate}, ${C.glacier})` }} />
      <div style={{ padding: 20 }}>
        {/* Row 1 removed — identity now lives in HeroBanner above */}

        {/* Row 2: ring + stats */}
        <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: 20, alignItems: "center" }}>
          <div style={{ position: "relative", width: 100, height: 100 }}>
            <svg width={100} height={100} viewBox="0 0 100 100">
              <circle cx={50} cy={50} r={r} stroke={C.glacier} strokeWidth={10} fill="none" />
              <circle
                cx={50} cy={50} r={r} stroke={C.turquoise} strokeWidth={10} fill="none"
                strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={offset}
                transform="rotate(-90 50 50)"
              />
            </svg>
            <div style={{
              position: "absolute", inset: 0,
              display: "flex", flexDirection: "column",
              alignItems: "center", justifyContent: "center",
            }}>
              <div style={{ display: "flex", alignItems: "baseline", gap: 2 }}>
                <span style={{ fontSize: 28, fontWeight: 700, color: C.turquoise, lineHeight: 1 }}>{score}</span>
                <span style={{ fontSize: 12, color: C.slate }}>/100</span>
              </div>
              <span style={{ fontSize: 9, color: C.slate, letterSpacing: "0.1em", marginTop: 2 }}>
                {t("スコア", "SCORE")}
              </span>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column" }}>
            <StatRow
              icon={<Thermometer size={16} color={C.slate} />}
              labelJp="体温" labelEn="Avg Temp" value="38.5°C"
            />
            <div style={{ height: 1, background: "rgba(185,219,225,0.4)" }} />
            <StatRow
              icon={<Footprints size={16} color={C.slate} />}
              labelJp="歩数" labelEn="Avg Steps" value="2,340"
            />
            <div style={{ height: 1, background: "rgba(185,219,225,0.4)" }} />
            <StatRow
              icon={<Moon size={16} color={C.slate} />}
              labelJp="睡眠" labelEn="Sleep" value="7.5h"
            />
          </div>
        </div>

        <div style={{ height: 1, background: "rgba(185,219,225,0.5)", margin: "14px 0" }} />

        {/* Row 3: status */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <CheckCircle2 size={14} color={C.turquoise} />
            <span style={{ fontSize: 12, color: C.turquoise, fontWeight: 600 }}>
              {t("全センサー正常", "All sensors normal")}
            </span>
          </div>
          <span style={{ fontSize: 11, color: C.slate }}>
            {t("2026年5月16日", "May 16, 2026")}
          </span>
        </div>
      </div>
    </div>
  );
}

function StatRow({ icon, labelJp, labelEn, value }: {
  icon: ReactNode;
  labelJp: string; labelEn: string;
  value: string;
}) {
  const t = useT();
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "8px 0" }}>
      <div style={{
        width: 32, height: 32, borderRadius: 999,
        background: "rgba(185, 219, 225, 0.5)",
        backdropFilter: "blur(8px)",
        border: `1px solid rgba(185,219,225,0.7)`,
        display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
      }}>{icon}</div>
      <span style={{ flex: 1, fontSize: 11, color: C.slate }}>
        {t(labelJp, labelEn)}
      </span>
      <span style={{ fontSize: 15, fontWeight: 700, color: C.turquoise }}>{value}</span>
    </div>
  );
}

/* ─────────── Section Divider ─────────── */
function SectionDivider({ jp, en }: { jp: string; en: string }) {
  const t = useT();
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "4px 0 10px" }}>
      <div style={{ flex: 1, height: 1, background: C.glacier }} />
      <span style={{ fontSize: 11, color: C.slate, letterSpacing: "0.1em", fontWeight: 600 }}>
        {t(jp, en)}
      </span>
      <div style={{ flex: 1, height: 1, background: C.glacier }} />
    </div>
  );
}

/* ─────────── Chart Card Wrapper ─────────── */
function ChartCard({
  icon, titleJp, titleEn, chipText, children,
}: {
  icon: ReactNode;
  titleJp: string; titleEn: string;
  chipText: string;
  children: ReactNode;
}) {
  const t = useT();
  const { language } = useLanguage();
  return (
    <div style={{
      ...glass,
      marginBottom: 12,
      overflow: "hidden",
    }}>
      <div style={{ height: 6, background: `linear-gradient(90deg, ${C.turquoise}, ${C.glacier})` }} />
      <div style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        padding: "14px 16px 4px",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 10,
            background: "rgba(185, 219, 225, 0.6)",
            border: `1px solid ${C.glacier}`,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>{icon}</div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: C.heading }}>
              {t(titleJp, titleEn)}
            </div>
            {language === "mixed" && (
              <div style={{ fontSize: 11, color: C.slate }}>{titleEn}</div>
            )}
          </div>
        </div>
        <span style={{
          background: "rgba(185, 219, 225, 0.6)", color: C.turquoise, fontSize: 12, fontWeight: 700,
          padding: "4px 12px", borderRadius: 20, border: `1px solid ${C.glacier}`,
        }}>{chipText}</span>
      </div>
      <div style={{ padding: "8px 8px 12px" }}>{children}</div>
    </div>
  );
}

function NiceTooltip({ active, payload, label, suffix }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: "rgba(185, 219, 225, 0.85)",
      backdropFilter: "blur(8px)",
      border: `1px solid ${C.turquoise}`, borderRadius: 12,
      padding: "6px 10px", fontSize: 11, color: C.turquoise,
      boxShadow: "0 4px 12px rgba(68,127,152,0.18)",
    }}>
      <div style={{ color: C.slate }}>{label}</div>
      <div style={{ fontWeight: 700, color: C.turquoise }}>{payload[0].value}{suffix}</div>
    </div>
  );
}

/* ─────────── Vaccination Card ─────────── */
type VaxStatus = "current" | "soon";
function VaccinationCard() {
  const t = useT();
  const vaccines: { jp: string; en: string; date: string; status: VaxStatus }[] = [
    { jp: "狂犬病", en: "Rabies", date: "2025/04/15", status: "current" },
    { jp: "混合ワクチン", en: "Combination", date: "2025/03/02", status: "current" },
    { jp: "フィラリア", en: "Heartworm", date: "2026/01/20", status: "current" },
    { jp: "ノミ・マダニ", en: "Flea & Tick", date: t("次回 2026年6月", "Next: Jun 2026"), status: "soon" },
  ];
  return (
    <div style={{
      ...glass,
      marginBottom: 12,
      overflow: "hidden",
      borderLeft: `4px solid ${C.turquoise}`,
    }}>
      <div style={{ height: 6, background: `linear-gradient(90deg, ${C.turquoise}, ${C.glacier})` }} />
      <div style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        padding: "14px 16px 10px",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Syringe size={18} color={C.turquoise} />
          <span style={{ fontSize: 14, fontWeight: 700, color: C.heading }}>
            {t("ワクチン記録", "Vaccination Records")}
          </span>
        </div>
        <span style={{
          background: "rgba(185, 219, 225, 0.6)", color: C.turquoise, fontSize: 11, fontWeight: 700,
          padding: "3px 10px", borderRadius: 20, border: `1px solid ${C.glacier}`,
        }}>{t("4件", "4 records")}</span>
      </div>
      <div>
        {vaccines.map((v, i) => <VaccineRow key={v.en} {...v} isLast={i === vaccines.length - 1} />)}
      </div>
    </div>
  );
}

function VaccineRow({ jp, en, date, status, isLast }: {
  jp: string; en: string; date: string; status: VaxStatus; isLast: boolean;
}) {
  const t = useT();
  const cfg = status === "current"
    ? {
        icon: <Check size={16} color={C.turquoise} />,
        bg: "rgba(185, 219, 225, 0.6)",
        chipBg: "rgba(68, 127, 152, 0.15)",
        chipBorder: C.turquoise,
        chipColor: C.turquoise,
        chipText: t("最新", "Current"),
      }
    : {
        icon: <Clock size={16} color={C.slate} />,
        bg: "rgba(185, 219, 225, 0.5)",
        chipBg: "rgba(98, 139, 133, 0.15)",
        chipBorder: C.slate,
        chipColor: C.slate,
        chipText: t("もうすぐ", "Soon"),
      };
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 12,
      padding: "0 16px", height: 56,
      borderBottom: isLast ? "none" : "1px solid rgba(185,219,225,0.4)",
    }}>
      <div style={{
        width: 32, height: 32, borderRadius: "50%", background: cfg.bg,
        border: `1px solid ${C.glacier}`,
        display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
      }}>{cfg.icon}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: C.heading, lineHeight: 1.2 }}>
          {t(jp, en)}
        </div>
        <div style={{ fontSize: 11, color: C.slate }}>{en}</div>
      </div>
      <span style={{ fontSize: 12, color: C.slate, whiteSpace: "nowrap" }}>{date}</span>
      <span style={{
        background: cfg.chipBg, color: cfg.chipColor, fontSize: 10, fontWeight: 700,
        padding: "3px 8px", borderRadius: 12, whiteSpace: "nowrap",
        border: `1px solid ${cfg.chipBorder}`,
      }}>{cfg.chipText}</span>
    </div>
  );
}

/* ─────────── Last Visit Card ─────────── */
function LastVisitCard() {
  const t = useT();
  return (
    <div style={{
      ...glass,
      marginBottom: 12,
      overflow: "hidden",
      borderLeft: `4px solid ${C.turquoise}`,
    }}>
      <div style={{ height: 6, background: `linear-gradient(90deg, ${C.turquoise}, ${C.glacier})` }} />
      <div style={{ padding: "14px 16px 4px", display: "flex", alignItems: "center", gap: 10 }}>
        <Stethoscope size={18} color={C.turquoise} />
        <span style={{ fontSize: 14, fontWeight: 700, color: C.heading }}>
          {t("最後の診察", "Last Vet Visit")}
        </span>
      </div>
      <div style={{ padding: "8px 16px 12px", display: "flex", gap: 12, alignItems: "center" }}>
        <div style={{
          width: 48, height: 48, borderRadius: "50%", background: "rgba(185, 219, 225, 0.6)",
          border: `1px solid ${C.glacier}`,
          display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
          boxShadow: "0 4px 12px rgba(68,127,152,0.15)",
        }}>
          <Cross size={22} color={C.turquoise} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: C.heading, lineHeight: 1.2 }}>
            {t("渋谷動物病院", "Shibuya Animal Hospital")}
          </div>
          <div style={{ fontSize: 12, color: C.slate, marginTop: 2 }}>
            {t("2026年4月20日", "Apr 20, 2026")}
          </div>
          <span style={{
            display: "inline-block", marginTop: 6, fontSize: 11, fontWeight: 700,
            background: "rgba(68, 127, 152, 0.15)", color: C.turquoise,
            border: `1px solid ${C.turquoise}`,
            padding: "3px 10px", borderRadius: 20,
          }}>{t("健康診断: 異常なし ✓", "Health check: All clear ✓")}</span>
        </div>
      </div>
      <div style={{
        padding: "10px 16px", borderTop: "1px solid rgba(185,219,225,0.4)",
        display: "flex", justifyContent: "space-between", alignItems: "center",
      }}>
        <div>
          <div style={{ fontSize: 11, color: C.slate }}>{t("次回予約", "Next Appointment")}</div>
          <div style={{ fontSize: 12, color: C.heading, fontWeight: 600 }}>
            {t("未定", "Not scheduled")}
          </div>
        </div>
        <button
          style={{
            background: "transparent", color: C.turquoise, fontSize: 12, fontWeight: 700,
            border: `1px solid ${C.turquoise}`, borderRadius: 20, padding: "6px 16px",
            transition: "background 0.2s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(68,127,152,0.1)")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
        >
          {t("予約する →", "Book Now →")}
        </button>
      </div>
    </div>
  );
}

/* ─────────── QR & PDF Cards ─────────── */
const accentCard = (accent: string): CSSProperties => ({
  background: "#FFFFFF",
  borderRadius: 20,
  borderLeft: `4px solid ${accent}`,
  boxShadow: "0 4px 16px rgba(68, 127, 152, 0.08)",
});

function QRCard() {
  const t = useT();
  return (
    <div style={{
      ...accentCard(C.turquoise),
      padding: 16,
      display: "flex", flexDirection: "column", alignItems: "center", gap: 8,
    }}>
      <div style={{
        width: 56, height: 56, borderRadius: "50%", background: "rgba(185, 219, 225, 0.3)",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <QrCode size={28} color={C.turquoise} />
      </div>
      <div style={{ fontSize: 13, fontWeight: 700, color: C.heading, textAlign: "center" }}>
        {t("獣医用QRコード", "Vet QR Code")}
      </div>
      <div style={{ fontSize: 10, color: C.slate, textAlign: "center" }}>
        {t("毎回新しいQRを生成", "New QR every visit")}
      </div>
      <div style={{
        width: 80, height: 80, background: "#FFFFFF", borderRadius: 8,
        border: "1px solid rgba(185, 219, 225, 0.5)", padding: 6,
        display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 1,
      }}>
        {Array.from({ length: 49 }).map((_, i) => (
          <div key={i} style={{
            background: [0, 6, 8, 9, 12, 14, 18, 20, 22, 27, 30, 33, 36, 40, 42, 44, 48].includes(i % 49) || (i * 7) % 13 < 5 ? C.turquoise : "transparent",
            borderRadius: 1,
          }} />
        ))}
      </div>
      <button style={{
        width: "100%", height: 40, marginTop: 4,
        background: "rgba(68, 127, 152, 0.12)",
        color: C.turquoise, fontWeight: 700, fontSize: 13, borderRadius: 12,
        border: `1px solid ${C.turquoise}`,
      }}>
        {t("生成", "Generate")}
      </button>
    </div>
  );
}

function PDFCard() {
  const t = useT();
  const items: [string, string][] = [
    ["ワクチン履歴", "Vaccination history"],
    ["最終診察", "Last checkup details"],
    ["年間データ", "Annual data"],
  ];
  return (
    <div style={{
      ...accentCard(C.slate),
      padding: 16,
      display: "flex", flexDirection: "column", alignItems: "center", gap: 8,
    }}>
      <div style={{
        width: 56, height: 56, borderRadius: "50%", background: "rgba(185, 219, 225, 0.3)",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <FileDown size={28} color={C.slate} />
      </div>
      <div style={{ fontSize: 13, fontWeight: 700, color: C.heading, textAlign: "center" }}>
        {t("PDF出力", "PDF Export")}
      </div>
      <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 4, marginTop: 4 }}>
        {items.map(([jp, en]) => (
          <div key={en} style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <Check size={12} color={C.turquoise} strokeWidth={3} style={{ flexShrink: 0 }} />
            <span style={{ fontSize: 10, color: C.slate }}>{t(jp, en)}</span>
          </div>
        ))}
      </div>
      <button style={{
        width: "100%", height: 40, marginTop: "auto",
        background: "rgba(98, 139, 133, 0.12)",
        color: C.slate, fontWeight: 700, fontSize: 12, borderRadius: 12,
        border: `1px solid ${C.slate}`,
        display: "flex", alignItems: "center", justifyContent: "center", gap: 4,
      }}>
        {t("PDF出力", "PDF Export")}
      </button>
    </div>
  );
}

/* ─────────── Hero Banner ─────────── */
function HeroBanner({ pet }: { pet: PetProfile }) {
  const t = useT();
  const { language } = useLanguage();
  const breedEn = pet.breedEn || "Shiba Inu";
  const breedJp = pet.breedJp || "柴犬";
  const name = pet.name || (language === "english" ? "your dog" : "ワンちゃん");

  return (
    <div
      style={{
        position: "relative",
        width: "auto",
        height: 160,
        margin: "-16px -16px 16px",
        borderRadius: "0 0 28px 28px",
        overflow: "hidden",
        background: `linear-gradient(135deg, ${C.turquoise} 0%, ${C.glacier} 100%)`,
        boxShadow: "0 6px 24px rgba(68,127,152,0.18)",
      }}
    >
      {/* Decorative blobs */}
      <div style={{
        position: "absolute", top: -60, right: -50, width: 180, height: 180,
        borderRadius: "50%", background: "rgba(214, 235, 243, 0.25)",
        filter: "blur(2px)",
      }} />
      <div style={{
        position: "absolute", bottom: -40, left: -30, width: 120, height: 120,
        borderRadius: "50%", background: "rgba(255, 255, 255, 0.15)",
      }} />
      <div style={{
        position: "absolute", top: 40, left: "55%", width: 70, height: 70,
        borderRadius: "50%", background: "rgba(255, 255, 255, 0.1)",
      }} />

      {/* Decorative ECG/heartbeat line on the right */}
      <svg
        width={140} height={80} viewBox="0 0 140 80"
        style={{
          position: "absolute", right: -10, top: "50%",
          transform: "translateY(-50%)",
          opacity: 1, pointerEvents: "none",
        }}
        aria-hidden
      >
        <path
          d="M0 40 L25 40 L32 20 L40 60 L48 10 L56 65 L66 40 L90 40 L96 28 L104 52 L112 40 L140 40"
          stroke="rgba(255,255,255,0.18)"
          strokeWidth={2.5}
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>

      {/* Bottom fade overlay */}
      <div style={{
        position: "absolute", inset: 0,
        background: "linear-gradient(180deg, transparent 65%, rgba(240,247,250,0.35) 100%)",
        pointerEvents: "none",
      }} />

      {/* Text content */}
      <div style={{
        position: "relative", zIndex: 1,
        padding: 24,
        display: "flex", flexDirection: "column",
        height: "100%", justifyContent: "space-between",
      }}>
        <div>
          <div style={{
            fontSize: 11,
            color: "rgba(255,255,255,0.75)",
            letterSpacing: "0.1em",
            fontWeight: 600,
            textTransform: "uppercase",
          }}>
            {t("ヘルスレポート", "Health")}
          </div>
          <div style={{
            fontSize: 28, fontWeight: 700, color: "#FFFFFF",
            lineHeight: 1.1, marginTop: 4,
            letterSpacing: "-0.01em",
          }}>
            {t("健康レポート", "Health Report")}
          </div>
          <div style={{
            fontSize: 13, color: "rgba(255,255,255,0.85)",
            marginTop: 6, display: "flex", alignItems: "center", gap: 6,
          }}>
            <span style={{ color: "rgba(255,255,255,0.6)" }} aria-hidden>🐾</span>
            <span>{name} · {t(breedJp, breedEn)} · {t("2026年5月", "May 2026")}</span>
          </div>
        </div>

        <div style={{
          alignSelf: "flex-start",
          display: "inline-flex", alignItems: "center", gap: 6,
          background: "rgba(255,255,255,0.25)",
          backdropFilter: "blur(8px)",
          WebkitBackdropFilter: "blur(8px)",
          border: "1px solid rgba(255,255,255,0.4)",
          borderRadius: 20,
          padding: "4px 12px",
        }}>
          <span style={{
            width: 6, height: 6, borderRadius: "50%",
            background: "#FFFFFF",
            boxShadow: "0 0 8px rgba(255,255,255,0.8)",
          }} />
          <span style={{ fontSize: 12, color: "#FFFFFF", fontWeight: 600 }}>
            {t("良好", "Good")}
          </span>
        </div>
      </div>
    </div>
  );
}

// AlertTriangle import retained for future overdue states
void AlertTriangle;
void AlertTriangle;
