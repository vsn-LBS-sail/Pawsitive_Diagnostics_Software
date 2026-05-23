import { createFileRoute } from "@tanstack/react-router";
import AppShell, { TopBar } from "@/components/AppShell";
import jsPDF from "jspdf";
import { QRCodeSVG as QRCode } from "qrcode.react";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip,
  CartesianGrid, ReferenceLine, ReferenceArea,
} from "recharts";
import { useState, type ReactNode } from "react";
import {
  QrCode, FileDown, Activity, Thermometer, Footprints, Moon,
  Syringe, Check, Clock, AlertTriangle, Stethoscope, Cross, CheckCircle2,
} from "lucide-react";
import { useT, useLanguage } from "@/context/LanguageContext";
import { usePet, type PetProfile } from "@/context/PetContext";
import DogAvatar, { BREED_KEY_BY_JP, type BreedKey } from "@/components/DogAvatar";
import { REPORT_CHART_DATA, VACCINE_RECORDS, LAST_VET_VISIT } from "@/lib/mock";

export const Route = createFileRoute("/report")({ component: Report });

const TABS = ["1d", "1w", "1m", "3m", "6m", "4y"] as const;

function Report() {
  const t = useT();
  const { language } = useLanguage();
  const { pet } = usePet();
  const [tab, setTab] = useState<(typeof TABS)[number]>("1w");

  const dogName = pet.name || (language === "english" ? "your dog" : "ワンちゃん");

  const dayLabels = language === "english"
    ? ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
    : ["月", "火", "水", "木", "金", "土", "日"];

  const scoreData = REPORT_CHART_DATA.score.map((v, i) => ({ d: dayLabels[i], v }));
  const tempData  = REPORT_CHART_DATA.temp.map((v, i)  => ({ d: dayLabels[i], v }));
  const stepsData = REPORT_CHART_DATA.steps.map((v, i) => ({ d: dayLabels[i], v }));
  const sleepData = REPORT_CHART_DATA.sleep.map((v, i) => ({ d: dayLabels[i], v }));

  return (
    <AppShell
      titleJp="健康レポート"
      titleEn="Health Report"
      renderTopBar={({ menuOpen, onMenuClick }) => <TopBar showBack backTo="/home" menuOpen={menuOpen} onMenuClick={onMenuClick} />}
    >
      {/* Hero Summary Card */}
      <HeroCard pet={pet} dogName={dogName} />

      {/* Time filter tabs */}
      <div
        style={{
          background: "#FFFFFF",
          borderRadius: 16,
          padding: 4,
          margin: "0 0 12px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
          display: "flex",
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
                fontFamily: "var(--font-heading)", fontWeight: 600,
                color: active ? "#fff" : "#C4B8B4",
                background: active ? "#447F98" : "transparent",
                boxShadow: active ? "0 2px 8px rgba(232,130,154,0.3)" : "none",
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
        topStrip="linear-gradient(90deg, #E8F5EE, #D4F0E4)"
        icon={<Activity size={18} color="#6BAF92" />}
        iconBg="#E8F5EE"
        titleJp="健康スコア推移"
        titleEn="Health Score"
        chipText="87 / 100"
        chipBg="#E8F5EE"
        chipColor="#6BAF92"
      >
        <ResponsiveContainer width="100%" height={160}>
          <AreaChart data={scoreData} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
            <defs>
              <linearGradient id="scoreFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#6BAF92" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#6BAF92" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#F5F0EC" vertical={false} />
            <XAxis dataKey="d" tick={{ fill: "#C4B8B4", fontSize: 10 }} axisLine={false} tickLine={false} />
            <YAxis domain={[60, 100]} tick={{ fill: "#C4B8B4", fontSize: 10 }} axisLine={false} tickLine={false} />
            <Tooltip content={<NiceTooltip color="#6BAF92" suffix="" />} />
            <Area type="monotone" dataKey="v" stroke="#6BAF92" strokeWidth={2.5} fill="url(#scoreFill)"
              dot={{ r: 3, fill: "#6BAF92" }} animationDuration={1000} />
          </AreaChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* Temperature */}
      <ChartCard
        topStrip="linear-gradient(90deg, #FFE8DC, #FFF2EC)"
        icon={<Thermometer size={18} color="#D4714E" />}
        iconBg="#FFE8DC"
        titleJp="体温履歴"
        titleEn="Temperature History"
        chipText="Avg 38.5°C"
        chipBg="#FFE8DC"
        chipColor="#D4714E"
      >
        <ResponsiveContainer width="100%" height={160}>
          <AreaChart data={tempData} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
            <defs>
              <linearGradient id="tempFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#D4714E" stopOpacity={0.2} />
                <stop offset="100%" stopColor="#D4714E" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#F5F0EC" vertical={false} />
            <XAxis dataKey="d" tick={{ fill: "#C4B8B4", fontSize: 10 }} axisLine={false} tickLine={false} />
            <YAxis domain={[37.5, 39.5]} tick={{ fill: "#C4B8B4", fontSize: 10 }} axisLine={false} tickLine={false} />
            <ReferenceArea y1={38.0} y2={39.2} fill="#FFF0EC" fillOpacity={0.3} />
            <ReferenceLine y={38.5} stroke="#D4714E" strokeDasharray="4 4" strokeOpacity={0.4}
              label={{ value: t("正常", "Normal"), position: "right", fill: "#D4714E", fontSize: 10 }} />
            <Tooltip content={<NiceTooltip color="#D4714E" suffix="°C" />} />
            <Area type="monotone" dataKey="v" stroke="#D4714E" strokeWidth={2.5} fill="url(#tempFill)"
              dot={{ r: 3, fill: "#D4714E" }} animationDuration={1000} />
          </AreaChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* Activity Steps */}
      <ChartCard
        topStrip="linear-gradient(90deg, #E8F2FF, #EEF5FF)"
        icon={<Footprints size={18} color="#5B9BD5" />}
        iconBg="#E8F2FF"
        titleJp="運動・歩数"
        titleEn="Activity Steps"
        chipText="Avg 2,340"
        chipBg="#E8F2FF"
        chipColor="#5B9BD5"
      >
        <ResponsiveContainer width="100%" height={160}>
          <BarChart data={stepsData} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
            <defs>
              <linearGradient id="stepsFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#5B9BD5" stopOpacity={1} />
                <stop offset="100%" stopColor="#A8CCEA" stopOpacity={1} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#F5F0EC" vertical={false} />
            <XAxis dataKey="d" tick={{ fill: "#C4B8B4", fontSize: 10 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: "#C4B8B4", fontSize: 10 }} axisLine={false} tickLine={false} />
            <ReferenceLine y={3000} stroke="#5B9BD5" strokeDasharray="4 4" strokeOpacity={0.4}
              label={{ value: t("目標", "Goal"), position: "right", fill: "#5B9BD5", fontSize: 10 }} />
            <Tooltip content={<NiceTooltip color="#5B9BD5" suffix="" />} />
            <Bar dataKey="v" fill="url(#stepsFill)" radius={[6, 6, 0, 0]} animationDuration={1000} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* Sleep */}
      <ChartCard
        topStrip="linear-gradient(90deg, #F0ECFF, #F8F5FF)"
        icon={<Moon size={18} color="#7B68C8" />}
        iconBg="#F0ECFF"
        titleJp="睡眠パターン"
        titleEn="Sleep Pattern"
        chipText="Avg 7.5h"
        chipBg="#F0ECFF"
        chipColor="#7B68C8"
      >
        <ResponsiveContainer width="100%" height={160}>
          <BarChart data={sleepData} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
            <defs>
              <linearGradient id="sleepFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#7B68C8" stopOpacity={1} />
                <stop offset="100%" stopColor="#9B88D8" stopOpacity={1} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#F5F0EC" vertical={false} />
            <XAxis dataKey="d" tick={{ fill: "#C4B8B4", fontSize: 10 }} axisLine={false} tickLine={false} />
            <YAxis domain={[0, 12]} tick={{ fill: "#C4B8B4", fontSize: 10 }} axisLine={false} tickLine={false} />
            <ReferenceArea y1={8} y2={10} fill="#7B68C8" fillOpacity={0.06} />
            <Tooltip content={<NiceTooltip color="#7B68C8" suffix="h" />} />
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
        <HealthReportCard />
      </div>
    </AppShell>
  );
}

/* ─────────── Hero ─────────── */
function HeroCard({ pet, dogName }: { pet: PetProfile; dogName: string }) {
  const t = useT();
  const { language } = useLanguage();
  const score = 87;
  const r = 44;
  const circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;
  const breedKey: BreedKey = BREED_KEY_BY_JP[pet.breedJp] ?? "shiba";

  const now = new Date();
  const monthLabel = language === "english"
    ? now.toLocaleString("en", { month: "long", year: "numeric" })
    : `${now.getFullYear()}年${now.getMonth() + 1}月`;
  const todayLabel = language === "english"
    ? now.toLocaleString("en", { month: "short", day: "numeric", year: "numeric" })
    : `${now.getFullYear()}年${now.getMonth() + 1}月${now.getDate()}日`;

  return (
    <div style={{
      background: "#FFFFFF",
      borderRadius: 24,
      marginBottom: 16,
      overflow: "hidden",
      boxShadow: "0 8px 32px rgba(232,130,154,0.12)",
    }}>
      <div style={{ height: 8, background: "linear-gradient(90deg, #E8829A, #7B68C8, #6BAF92)" }} />
      <div style={{ padding: 20 }}>
        {/* Row 1: identity */}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{
            width: 44, height: 44, borderRadius: "50%",
            border: "2px solid #FFD4E8", overflow: "hidden",
            boxShadow: "0 4px 12px rgba(232,130,154,0.2)",
            display: "flex", alignItems: "center", justifyContent: "center",
            background: "#fff", flexShrink: 0,
          }}>
            <DogAvatar
              breed={breedKey}
              furColor={pet.avatar.furColor}
              earStyle={pet.avatar.earStyle as any}
              eyeStyle={pet.avatar.eyeStyle as any}
              collarColor={pet.avatar.collarColor}
              size={40}
              showCollar={false}
              ring={false}
            />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 16, fontFamily: "var(--font-heading)", fontWeight: 600, color: "#2C2C2C", lineHeight: 1.2 }}>
              Health Report
            </div>
            <div style={{ fontSize: 11, color: "#8A8A8A", marginTop: 2 }}>
              {t(pet.breedJp || "柴犬", pet.breedEn || "Shiba Inu")} · {monthLabel}
            </div>
          </div>
          <div style={{
            display: "flex", alignItems: "center", gap: 6,
            background: "#E8F5EE", border: "1px solid #B8D4C0",
            borderRadius: 20, padding: "4px 12px", flexShrink: 0,
          }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#6BAF92" }} />
            <span style={{ fontSize: 11, fontFamily: "var(--font-heading)", fontWeight: 600, color: "#6BAF92" }}>
              {t("良好", "Good")}
            </span>
          </div>
        </div>

        <div style={{ height: 1, background: "#F5F0EC", margin: "14px 0" }} />

        {/* Row 2: ring + stats */}
        <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: 20, alignItems: "center" }}>
          <div style={{ position: "relative", width: 100, height: 100 }}>
            <svg width={100} height={100} viewBox="0 0 100 100">
              <circle cx={50} cy={50} r={r} stroke="#E0F0E8" strokeWidth={10} fill="none" />
              <circle
                cx={50} cy={50} r={r} stroke="#6BAF92" strokeWidth={10} fill="none"
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
                <span style={{ fontSize: 28, fontFamily: "var(--font-heading)", fontWeight: 600, color: "#2C2C2C", lineHeight: 1 }}>{score}</span>
                <span style={{ fontSize: 12, color: "#8A8A8A" }}>/100</span>
              </div>
              <span style={{ fontSize: 9, color: "#C4B8B4", letterSpacing: "0.1em", marginTop: 2 }}>
                {t("スコア", "SCORE")}
              </span>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column" }}>
            <StatRow
              icon={<Thermometer size={16} color="#D4714E" />} iconBg="#FFE8DC"
              labelJp="体温" labelEn="Avg Temp" value="38.5°C" valueColor="#D4714E"
            />
            <div style={{ height: 1, background: "#F8F5F2" }} />
            <StatRow
              icon={<Footprints size={16} color="#5B9BD5" />} iconBg="#E8F2FF"
              labelJp="歩数" labelEn="Avg Steps" value="2,340" valueColor="#5B9BD5"
            />
            <div style={{ height: 1, background: "#F8F5F2" }} />
            <StatRow
              icon={<Moon size={16} color="#7B68C8" />} iconBg="#F0ECFF"
              labelJp="睡眠" labelEn="Sleep" value="7.5h" valueColor="#7B68C8"
            />
          </div>
        </div>

        <div style={{ height: 1, background: "#F5F0EC", margin: "14px 0" }} />

        {/* Row 3: status */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <CheckCircle2 size={14} color="#6BAF92" />
            <span style={{ fontSize: 12, color: "#6BAF92", fontWeight: 600 }}>
              {t("全センサー正常", "All sensors normal")}
            </span>
          </div>
          <span style={{ fontSize: 11, color: "#C4B8B4" }}>
            {todayLabel}
          </span>
        </div>
      </div>
    </div>
  );
}

function StatRow({ icon, iconBg, labelJp, labelEn, value, valueColor }: {
  icon: ReactNode; iconBg: string;
  labelJp: string; labelEn: string;
  value: string; valueColor: string;
}) {
  const t = useT();
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "8px 0" }}>
      <div style={{
        width: 32, height: 32, borderRadius: 8, background: iconBg,
        display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
      }}>{icon}</div>
      <span style={{ flex: 1, fontSize: 11, color: "#8A8A8A" }}>
        {t(labelJp, labelEn)}
      </span>
      <span style={{ fontSize: 15, fontFamily: "var(--font-heading)", fontWeight: 600, color: valueColor }}>{value}</span>
    </div>
  );
}

/* ─────────── Section Divider ─────────── */
function SectionDivider({ jp, en }: { jp: string; en: string }) {
  const t = useT();
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "4px 0 10px" }}>
      <div style={{ flex: 1, height: 1, background: "#EDE8E4" }} />
      <span style={{ fontSize: 11, color: "#C4B8B4", letterSpacing: "0.1em" }}>
        {t(jp, en)}
      </span>
      <div style={{ flex: 1, height: 1, background: "#EDE8E4" }} />
    </div>
  );
}

/* ─────────── Chart Card Wrapper ─────────── */
function ChartCard({
  topStrip, icon, iconBg, titleJp, titleEn, chipText, chipBg, chipColor, children,
}: {
  topStrip: string; icon: ReactNode; iconBg: string;
  titleJp: string; titleEn: string;
  chipText: string; chipBg: string; chipColor: string;
  children: ReactNode;
}) {
  const t = useT();
  const { language } = useLanguage();
  return (
    <div style={{
      background: "#FFFFFF", borderRadius: 20, marginBottom: 12,
      boxShadow: "0 4px 16px rgba(0,0,0,0.07)", overflow: "hidden",
    }}>
      <div style={{ height: 6, background: topStrip }} />
      <div style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        padding: "14px 16px 4px",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 10, background: iconBg,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>{icon}</div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: "#2C2C2C" }}>
              {t(titleJp, titleEn)}
            </div>
            {language === "mixed" && (
              <div style={{ fontSize: 11, color: "#8A8A8A" }}>{titleEn}</div>
            )}
          </div>
        </div>
        <span style={{
          background: chipBg, color: chipColor, fontSize: 12, fontFamily: "var(--font-heading)", fontWeight: 600,
          padding: "4px 12px", borderRadius: 20,
        }}>{chipText}</span>
      </div>
      <div style={{ padding: "8px 8px 12px" }}>{children}</div>
    </div>
  );
}

function NiceTooltip({ active, payload, label, color, suffix }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: "#fff", border: `1px solid ${color}`, borderRadius: 12,
      padding: "6px 10px", fontSize: 11, color: "#2C2C2C",
      boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
    }}>
      <div style={{ color: "#8A8A8A" }}>{label}</div>
      <div style={{ fontFamily: "var(--font-heading)", fontWeight: 600, color }}>{payload[0].value}{suffix}</div>
    </div>
  );
}

/* ─────────── Vaccination Card ─────────── */
type VaxStatus = "current" | "soon" | "overdue";
function VaccinationCard() {
  const t = useT();
  const vaccines = VACCINE_RECORDS.map((v) => ({
    jp: v.jp, en: v.en,
    date: v.status === "soon" ? t(`次回 ${v.date}`, `Next: ${v.date}`) : v.date,
    status: (v.status === "ok" ? "current" : v.status) as VaxStatus,
  }));
  return (
    <div style={{
      background: "#FFFFFF", borderRadius: 20, marginBottom: 12,
      boxShadow: "0 4px 16px rgba(0,0,0,0.07)", overflow: "hidden",
      borderLeft: "4px solid #6BAF92",
    }}>
      <div style={{ height: 6, background: "var(--color-bg-card)" }} />
      <div style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        padding: "14px 16px 10px",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Syringe size={18} color="#6BAF92" />
          <span style={{ fontSize: 14, fontFamily: "var(--font-heading)", fontWeight: 600, color: "#2C2C2C" }}>
            {t("ワクチン記録", "Vaccination Records")}
          </span>
        </div>
        <span style={{
          background: "#E8F5EE", color: "#6BAF92", fontSize: 11, fontFamily: "var(--font-heading)", fontWeight: 600,
          padding: "3px 10px", borderRadius: 20,
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
  const cfg = {
    current: { icon: <Check size={16} color="#6BAF92" />, bg: "#E8F5EE", chipBg: "#6BAF92", chipText: t("最新", "Current"), rowBg: "transparent" },
    soon: { icon: <Clock size={16} color="#D4A843" />, bg: "#FFF3CC", chipBg: "#D4A843", chipText: t("もうすぐ", "Soon"), rowBg: "transparent" },
    overdue: { icon: <AlertTriangle size={16} color="#E53935" />, bg: "#FFF0F0", chipBg: "#E53935", chipText: t("期限切れ", "Overdue"), rowBg: "#FFFAFA" },
  }[status];
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 12,
      padding: "0 16px", height: 56,
      borderTop: isLast ? undefined : undefined,
      borderBottom: isLast ? "none" : "1px solid #F5F0EC",
      background: cfg.rowBg,
    }}>
      <div style={{
        width: 32, height: 32, borderRadius: "50%", background: cfg.bg,
        display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
      }}>{cfg.icon}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: "#2C2C2C", lineHeight: 1.2 }}>
          {t(jp, en)}
        </div>
        <div style={{ fontSize: 11, color: "#8A8A8A" }}>{en}</div>
      </div>
      <span style={{ fontSize: 12, color: "#8A8A8A", whiteSpace: "nowrap" }}>{date}</span>
      <span style={{
        background: cfg.chipBg, color: "#fff", fontSize: 10, fontFamily: "var(--font-heading)", fontWeight: 600,
        padding: "3px 8px", borderRadius: 12, whiteSpace: "nowrap",
      }}>{cfg.chipText}</span>
    </div>
  );
}

/* ─────────── Last Visit Card ─────────── */
function LastVisitCard() {
  const t = useT();
  return (
    <div style={{
      background: "#FFFFFF", borderRadius: 20, marginBottom: 12,
      boxShadow: "0 4px 16px rgba(0,0,0,0.07)", overflow: "hidden",
      borderLeft: "4px solid #5B9BD5",
    }}>
      <div style={{ height: 6, background: "var(--color-bg-card)" }} />
      <div style={{ padding: "14px 16px 4px", display: "flex", alignItems: "center", gap: 10 }}>
        <Stethoscope size={18} color="#5B9BD5" />
        <span style={{ fontSize: 14, fontFamily: "var(--font-heading)", fontWeight: 600, color: "#2C2C2C" }}>
          {t("最後の診察", "Last Vet Visit")}
        </span>
      </div>
      <div style={{ padding: "8px 16px 12px", display: "flex", gap: 12, alignItems: "center" }}>
        <div style={{
          width: 48, height: 48, borderRadius: "50%", background: "#E8F2FF",
          display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
          boxShadow: "0 4px 12px rgba(91,155,213,0.15)",
        }}>
          <Cross size={22} color="#5B9BD5" />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 15, fontFamily: "var(--font-heading)", fontWeight: 600, color: "#2C2C2C", lineHeight: 1.2 }}>
            {t(LAST_VET_VISIT.clinicJp, LAST_VET_VISIT.clinicEn)}
          </div>
          <div style={{ fontSize: 12, color: "#8A8A8A", marginTop: 2 }}>
            {t(LAST_VET_VISIT.dateJp, LAST_VET_VISIT.dateEn)}
          </div>
          <span style={{
            display: "inline-block", marginTop: 6, fontSize: 11, fontFamily: "var(--font-heading)", fontWeight: 600,
            background: "#E8F5EE", color: "#6BAF92",
            padding: "3px 10px", borderRadius: 20,
          }}>{t(LAST_VET_VISIT.resultJp, LAST_VET_VISIT.resultEn)}</span>
        </div>
      </div>
      <div style={{
        padding: "10px 16px", borderTop: "1px solid #F5F0EC",
        display: "flex", justifyContent: "space-between", alignItems: "center",
      }}>
        <div>
          <div style={{ fontSize: 11, color: "#8A8A8A" }}>{t("次回予約", "Next Appointment")}</div>
          <div style={{ fontSize: 12, color: "#2C2C2C", fontWeight: 600 }}>
            {t("未定", "Not scheduled")}
          </div>
        </div>
        <button style={{
          background: "#E8F2FF", color: "#5B9BD5", fontSize: 12, fontFamily: "var(--font-heading)", fontWeight: 600,
          border: "1px solid #C8E0F8", borderRadius: 20, padding: "6px 16px",
        }}>
          {t("予約する →", "Book Now →")}
        </button>
      </div>
    </div>
  );
}

/* ─────────── QR & Sell Cards ─────────── */
function QRCard() {
  const t = useT();
  const { pet } = usePet();
  const [refId, setRefId] = useState<string | null>(null);
  const [qrText, setQrText] = useState("");
  const [qrDate, setQrDate] = useState("");
  const [generating, setGenerating] = useState(false);

  const generateQR = () => {
    setGenerating(true);
    setTimeout(() => {
      const newRef = Math.floor(100000 + Math.random() * 900000).toString();
      setRefId(newRef);
      const d = new Date();
      const dateStr = `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
      setQrDate(dateStr);
      
      const dogName = pet.name?.trim() ? pet.name : "Tomy";
      const lastVet = "Apr 20, 2026";
      setQrText(`Pawsitive Health Report - ${dogName} - Generated: ${dateStr} - Latest Vet Visit: ${lastVet} - Ref: PAW-${newRef}`);
      setGenerating(false);
    }, 800);
  };

  return (
    <div style={{
      background: "var(--color-primary)",
      borderRadius: 20, border: "1.5px solid #C8C0F0",
      padding: 16, boxShadow: "0 4px 16px rgba(123,104,200,0.15)",
      display: "flex", flexDirection: "column", alignItems: "center", gap: 8,
    }}>
      <div style={{
        width: 56, height: 56, borderRadius: "50%", background: "#fff",
        display: "flex", alignItems: "center", justifyContent: "center",
        boxShadow: "0 4px 12px rgba(123,104,200,0.2)", flexShrink: 0,
      }}>
        <QrCode size={28} color="#7B68C8" />
      </div>
      <div style={{ fontSize: 13, fontFamily: "var(--font-heading)", fontWeight: 600, color: "#4A3A8A", textAlign: "center" }}>
        {t("獣医用QRコード", "Vet QR Code")}
      </div>
      <div style={{ fontSize: 10, color: "#7B68C8", textAlign: "center" }}>
        {t("毎回新しいQRを生成", "New QR every visit")}
      </div>
      
      <div style={{
        width: 120, height: 120, background: "#fff", borderRadius: 12,
        border: "2px solid #C8C0F0", padding: generating || refId ? 8 : 6,
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        {generating ? (
          <span style={{ fontSize: 13, color: "#7B68C8", fontFamily: "var(--font-heading)", fontWeight: 600 }}>Generating...</span>
        ) : refId ? (
          <QRCode value={qrText} size={100} fgColor="#7C3AED" />
        ) : (
          <div style={{
            width: "100%", height: "100%", display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 1,
          }}>
            {Array.from({ length: 49 }).map((_, i) => (
              <div key={i} style={{
                background: [0, 6, 8, 9, 12, 14, 18, 20, 22, 27, 30, 33, 36, 40, 42, 44, 48].includes(i % 49) || (i * 7) % 13 < 5 ? "#7B68C8" : "transparent",
                borderRadius: 1,
              }} />
            ))}
          </div>
        )}
      </div>

      {refId && !generating && (
        <div style={{ fontSize: 9, color: "#9B88D8", textAlign: "center", marginTop: -4 }}>
          Ref: PAW-{refId} · {qrDate}
        </div>
      )}

      <button onClick={generateQR} disabled={generating} style={{
        width: "100%", height: 40, marginTop: "auto",
        background: generating ? "#C8C0F0" : "linear-gradient(135deg, #7B68C8, #9B88D8)",
        color: "#fff", fontFamily: "var(--font-heading)", fontWeight: 600, fontSize: 13, borderRadius: 12,
        boxShadow: generating ? "none" : "0 4px 12px rgba(123,104,200,0.3)",
      }}>
        {t("生成", "Generate")}
      </button>
    </div>
  );
}

function HealthReportCard() {
  const t = useT();
  const { pet } = usePet();
  
  const generatePDF = () => {
    const doc = new jsPDF();
    const dogName = pet.name?.trim() || "Tomy";
    const ref = Math.floor(100000 + Math.random() * 900000).toString();
    const date = new Date();
    const dateStr = `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`;
    const filenameDate = `${String(date.getDate()).padStart(2, '0')}-${String(date.getMonth() + 1).padStart(2, '0')}-${date.getFullYear()}`;

    // Header Background
    doc.setFillColor(245, 230, 200);
    doc.rect(0, 0, 210, 40, "F");

    // Header Text
    doc.setFont("helvetica", "bold");
    doc.setTextColor(184, 134, 11);
    doc.setFontSize(22);
    doc.text("PAWSITIVE", 105, 15, { align: "center" });
    
    doc.setFontSize(12);
    doc.text("Health Report", 105, 25, { align: "center" });

    // Thin line
    doc.setDrawColor(184, 134, 11);
    doc.setLineWidth(0.5);
    doc.line(20, 35, 190, 35);

    // Patient Details
    doc.setFontSize(9);
    doc.text("PATIENT DETAILS", 20, 50);
    
    doc.setFont("helvetica", "normal");
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    doc.text(`Dog's Name: ${dogName}`, 20, 60);
    doc.text(`Breed: ${pet.breedEn || "Not specified"}`, 20, 66);
    doc.text(`Age: ${pet.age ? pet.age + " yrs" : "Not specified"}`, 20, 72);
    doc.text(`Owner: ${pet.ownerName || "Not specified"}`, 20, 78);
    doc.text(`Generated Date: ${dateStr}`, 130, 60);
    doc.text(`Report Reference: PAW-${ref}`, 130, 66);

    doc.setDrawColor(200, 200, 200);
    doc.line(20, 85, 190, 85);

    // SENSOR READINGS
    doc.setFont("helvetica", "bold");
    doc.setTextColor(184, 134, 11);
    doc.setFontSize(9);
    doc.text("SENSOR READINGS", 20, 95);
    
    doc.setFont("helvetica", "normal");
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    
    const sensors = [
      { name: "Overall Health Score", value: "87/100" },
      { name: "Body Temperature", value: "38.5°C" },
      { name: "Motion/Activity Level", value: "2,340 steps" },
      { name: "Air Quality Index", value: "Normal" },
      { name: "Heart Rate", value: "Not recorded" },
      { name: "SpO2", value: "Not recorded" },
    ];
    
    let y = 105;
    sensors.forEach(s => {
      doc.text(s.name, 20, y);
      doc.text("...................................................................", 70, y);
      doc.text(s.value, 150, y);
      y += 6;
    });

    doc.setDrawColor(200, 200, 200);
    doc.line(20, y + 5, 190, y + 5);
    y += 15;

    // VACCINATION & VET
    doc.setFont("helvetica", "bold");
    doc.setTextColor(184, 134, 11);
    doc.setFontSize(9);
    doc.text("HEALTH HISTORY", 20, y);
    
    doc.setFont("helvetica", "normal");
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    y += 10;
    
    doc.text(`Vaccination Status: ${pet.vaccinated ? "Up to date" : "Not up to date"}`, 20, y); y+=6;
    doc.text(`Last Vet Visit: ${LAST_VET_VISIT.dateEn}`, 20, y); y+=6;
    doc.text(`Vet/Hospital: ${pet.vetName || LAST_VET_VISIT.clinicEn}`, 20, y); y+=6;
    doc.text(`Last Checkup Result: All clear`, 20, y); y+=6;
    doc.text(`Known Health Conditions: ${pet.healthConditions || "None reported"}`, 20, y); y+=6;
    doc.text(`Next Appointment: Not scheduled`, 20, y); y+=6;

    doc.setDrawColor(200, 200, 200);
    doc.line(20, y + 5, 190, y + 5);

    // FOOTER
    doc.setFontSize(8);
    doc.setTextColor(153, 153, 153);
    doc.text("Generated by Pawsitive Smart Collar System", 105, 280, { align: "center" });
    doc.text("This report is for reference only and does not replace professional veterinary advice.", 105, 285, { align: "center" });

    doc.save(`Pawsitive_Health_Report_${dogName.replace(/\s+/g, '_')}_${filenameDate}.pdf`);
  };

  const items: [string, string][] = [
    ["ワクチン履歴", "Vaccination history"],
    ["最終診察", "Last checkup details"],
    ["年間データ", "Annual data"],
  ];
  return (
    <div style={{
      background: "var(--color-primary)",
      borderRadius: 20, border: "1.5px solid #F0D890",
      padding: 16, boxShadow: "0 4px 16px rgba(212,168,67,0.15)",
      display: "flex", flexDirection: "column", alignItems: "center", gap: 8,
    }}>
      <div style={{
        width: 56, height: 56, borderRadius: "50%", background: "#fff",
        display: "flex", alignItems: "center", justifyContent: "center",
        boxShadow: "0 4px 12px rgba(212,168,67,0.2)", flexShrink: 0,
      }}>
        <FileDown size={28} color="#D4A843" />
      </div>
      <div style={{ fontSize: 13, fontFamily: "var(--font-heading)", fontWeight: 600, color: "#78540A", textAlign: "center" }}>
        {t("健康レポート", "Health Report")}
      </div>
      <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 4, marginTop: 4 }}>
        {items.map(([jp, en]) => (
          <div key={en} style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{
              width: 14, height: 14, borderRadius: "50%", background: "#D4A843",
              display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
            }}>
              <Check size={9} color="#fff" strokeWidth={3} />
            </div>
            <span style={{ fontSize: 10, color: "#5C4000" }}>{t(jp, en)}</span>
          </div>
        ))}
      </div>
      <button onClick={generatePDF} style={{
        width: "100%", height: 40, marginTop: "auto",
        background: "var(--color-primary)",
        color: "#fff", fontFamily: "var(--font-heading)", fontWeight: 600, fontSize: 12, borderRadius: 12,
        boxShadow: "0 4px 12px rgba(212,168,67,0.4)",
        display: "flex", alignItems: "center", justifyContent: "center", gap: 4,
      }}>
         {t("PDFをエクスポート", "Export PDF")}
      </button>
    </div>
  );
}
