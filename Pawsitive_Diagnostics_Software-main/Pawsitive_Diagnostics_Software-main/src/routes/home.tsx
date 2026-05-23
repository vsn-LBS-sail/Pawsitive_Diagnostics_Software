import { createFileRoute, Link } from "@tanstack/react-router";
import AppShell from "@/components/AppShell";
import { useEffect, useState, type ReactNode, type CSSProperties } from "react";
import { DAILY_FACTS } from "@/lib/mock";
import {
  Brain, Microscope, Activity, Thermometer, MapPin, Wind, Sun, GitMerge,
  Check, BatteryMedium, Signal, Bluetooth, PawPrint, type LucideIcon,
} from "lucide-react";
import { motion } from "framer-motion";
import { useT, useLanguage } from "@/context/LanguageContext";
import { usePet, displayName } from "@/context/PetContext";
import MORNING_IMAGE from "@/assets/dashboard dog design - morning.png";
import AFTERNOON_IMAGE from "@/assets/dashboard dog design - Afternoon.png";
import NIGHT_IMAGE from "@/assets/dashboard dog design - Night.png";

import BOY_MORN from "@/assets/dashboard boy morn.png";
import BOY_AFT from "@/assets/dashboard boy afternoon.png";
import BOY_EVE from "@/assets/dashboard boy eve.png";
import BOY_NIGHT from "@/assets/dashboard boy  night.png";

import GIRL_MORN from "@/assets/dashboard girl morn.png";
import GIRL_AFT from "@/assets/dashboard girl afternoon.png";
import GIRL_EVE from "@/assets/dashboard girl eve.png";
import GIRL_NIGHT from "@/assets/dashboard girl night.png";

export const Route = createFileRoute("/home")({ component: Home });

/* ---------- Japanese palette ---------- */
const JP = {
  bg: "var(--color-bg-app)",
  card: "var(--color-bg-card)",
  sumi: "var(--color-text-primary)",
  usuzumi: "var(--color-text-secondary)",
  divider: "var(--color-border-card)",
  sakura: "var(--color-primary)",
  sakuraSoft: "transparent",
  sakuraStrip: "transparent",
  fuji: "var(--color-secondary)",
  fujiSoft: "transparent",
  fujiStrip: "transparent",
  matcha: "var(--color-text-muted)",
  matchaSoft: "transparent",
  matchaStrip: "transparent",
  yuzu: "var(--color-secondary)",
  yuzuSoft: "transparent",
  yuzuStrip: "transparent",
  sora: "var(--color-secondary)",
  soraSoft: "transparent",
  soraStrip: "transparent",
  momiji: "var(--color-secondary)",
  momijiSoft: "transparent",
  momijiStrip: "transparent",
};

const CARD_SHADOW = "0 2px 20px rgba(0,0,0,0.06), 0 1px 4px rgba(0,0,0,0.04)";

/* Refined card wrapper: white bg, left accent border, top color strip */
function JCard({
  accent,
  strip,
  children,
  className = "",
  style,
}: {
  accent: string;
  strip: string;
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <div
      className={"relative " + className}
      style={{
        background: JP.card,
        borderRadius: 20,
        borderLeft: `4px solid ${accent}`,
        boxShadow: CARD_SHADOW,
        overflow: "hidden",
        transition: "transform 0.2s ease",
        ...style,
      }}
    >
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 8, background: strip, pointerEvents: "none" }} />
      <div style={{ paddingTop: 8 }}>{children}</div>
    </div>
  );
}

/* Section label with thin lines: ──── LABEL ──── */
function SectionLabel({ jp, en }: { jp: string; en: string }) {
  const t = useT();
  return (
    <div className="flex items-center" style={{ gap: 12, margin: "20px 0 10px" }}>
      <div style={{ flex: 1, height: 1, background: "#E0DAD4" }} />
      <div style={{ fontSize: 11, color: JP.usuzumi, letterSpacing: "0.15em", textTransform: "uppercase", fontWeight: 600 }}>
        {t(jp, en)}
      </div>
      <div style={{ flex: 1, height: 1, background: "#E0DAD4" }} />
    </div>
  );
}

/* ---------- Sensors ---------- */
type Sensor = {
  Icon: LucideIcon;
  accent: string; iconBg: string; strip: string;
  jp: string; en: string;
  subJp: string; subEn: string;
  valJp: string; valEn: string;
  to: string;
  ml?: boolean;
  progress?: number;
  noteJp?: string; noteEn?: string;
};

const sensors: Sensor[] = [
  { Icon: Brain, accent: JP.fuji, iconBg: "#EDE0FF", strip: JP.fujiStrip, to: "/bark-sense",
    jp: "吠え分析", en: "BarkSense AI", subJp: "鳴き声解析", subEn: "Bark Analysis", valJp: "穏やか", valEn: "Calm", ml: true },
  { Icon: Microscope, accent: JP.sakura, iconBg: "#FFE4EC", strip: JP.sakuraStrip, to: "/skin-sense",
    jp: "皮膚センサー", en: "SkinSense AI", subJp: "皮膚の健康", subEn: "Skin Health", valJp: "正常", valEn: "Normal", ml: true },
  { Icon: Activity, accent: JP.sora, iconBg: "#E8F2FF", strip: JP.soraStrip, to: "/motion-sense",
    jp: "運動センサー", en: "MotionSense", subJp: "活動量", subEn: "Activity Track", valJp: "2,340 歩", valEn: "2,340 steps", progress: 65 },
  { Icon: Thermometer, accent: JP.momiji, iconBg: "#FFE8DC", strip: JP.momijiStrip, to: "/temp-sense",
    jp: "体温センサー", en: "TempSense AI", subJp: "体温", subEn: "Body Temp", valJp: "38.5°C", valEn: "38.5°C", noteJp: "正常範囲", noteEn: "Normal Range" },
  { Icon: MapPin, accent: JP.matcha, iconBg: "#E8F5EE", strip: JP.matchaStrip, to: "/map",
    jp: "位置センサー", en: "LocationSense", subJp: "GPS + 地図", subEn: "GPS + Map", valJp: "渋谷区, 東京", valEn: "Shibuya, Tokyo" },
  { Icon: Wind, accent: JP.yuzu, iconBg: "#FFF8DC", strip: JP.yuzuStrip, to: "/pressure-sense",
    jp: "圧力センサー", en: "PressureSense", subJp: "圧力データ", subEn: "Pressure Data", valJp: "正常範囲", valEn: "Normal Range" },
  { Icon: Sun, accent: "#C4920A", iconBg: "#FFFBCC", strip: "linear-gradient(90deg,#FFF8DC,#FFFEF0)", to: "/light-sense",
    jp: "光センサー", en: "LightSense AI", subJp: "RGB光データ", subEn: "RGB Light Data", valJp: "室内", valEn: "Indoor" },
  { Icon: GitMerge, accent: "#9B72CF", iconBg: "#F0E8FF", strip: "linear-gradient(90deg,#F0E8FF,#F8F5FF)", to: "/report",
    jp: "総合分析", en: "CombineSense", subJp: "総合解析", subEn: "Combined Analysis", valJp: "87/100", valEn: "87/100" },
];

/* ---------- Hero (postcard-style, watercolour Japan) ---------- */
type TimeBand = "morning" | "afternoon" | "evening" | "night";
function getTimeBand(): TimeBand {
  const h = new Date().getHours();
  if (h >= 5 && h < 12) return "morning";
  if (h >= 12 && h < 17) return "afternoon";
  if (h >= 17 && h < 21) return "evening";
  return "night";
}

function HeroPostcard({ score, name, mood, celebrate, ownerGender }: { score: number; name: string; mood: string; celebrate?: boolean; ownerGender?: string | null }) {
  const t = useT();

  const getImages = () => {
    if (ownerGender === "Male") {
      return { morning: BOY_MORN, afternoon: BOY_AFT, evening: BOY_EVE, night: BOY_NIGHT };
    }
    return { morning: GIRL_MORN, afternoon: GIRL_AFT, evening: GIRL_EVE, night: GIRL_NIGHT };
  };
  const images = getImages();

  const [band, setBand] = useState<TimeBand>(getTimeBand());
  const [slots, setSlots] = useState([
    { id: 0, src: images[getTimeBand()], anim: `${getTimeBand()}Anim`, active: true },
    { id: 1, src: "", anim: "", active: false }
  ]);

  useEffect(() => {
    const updateTime = () => {
      const newBand = getTimeBand();
      setBand(newBand);
      
      const newSrc = images[newBand];
      const newAnim = `${newBand}Anim`;
      
      setSlots(curr => {
        const activeIdx = curr[0].active ? 0 : 1;
        const inactiveIdx = activeIdx === 0 ? 1 : 0;
        
        if (curr[activeIdx].src !== newSrc) {
          const next = [...curr];
          next[inactiveIdx] = { id: inactiveIdx, src: newSrc, anim: newAnim, active: true };
          next[activeIdx] = { ...curr[activeIdx], active: false };
          return next;
        }
        return curr;
      });
    };
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, []);

  const labelJp = band === "morning" ? "おはよう" : band === "afternoon" ? "こんにちは" : band === "evening" ? "こんばんは" : "おやすみ";
  const labelEn = band === "morning" ? "Good Morning" : band === "afternoon" ? "Good Afternoon" : band === "evening" ? "Good Evening" : "Good Night";

  const hasName = !!name && name !== t("ワンちゃん", "Your Dog");
  const greeting = hasName ? t(`ようこそ、${name}！`, `Welcome, ${name}!`) : name;

  return (
    <div
      className="relative"
      style={{
        margin: "12px 16px 4px",
        height: 160,
        borderRadius: 24,
        overflow: "hidden",
        background: "#EAF4F9",
        border: "0.5px solid #B9D8E1",
        boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
        animation: celebrate ? "heroCelebrate 0.8s ease-out" : "none",
      }}
    >
      <style>{`
        @keyframes morningScene {
          0%   { transform: scale(1) translateX(0px); }
          30%  { transform: scale(1.04) translateX(-6px); }
          60%  { transform: scale(1.02) translateX(4px); }
          100% { transform: scale(1) translateX(0px); }
        }
        .anim-morningAnim { animation: morningScene 6s ease-in-out infinite; }

        @keyframes afternoonScene {
          0%   { transform: scale(1) translateY(0px); }
          50%  { transform: scale(1.02) translateY(-3px); }
          100% { transform: scale(1) translateY(0px); }
        }
        .anim-afternoonAnim { animation: afternoonScene 10s ease-in-out infinite; }

        @keyframes eveningScene {
          0%   { transform: scale(1.02) translateX(0px); }
          25%  { transform: scale(1.04) translateX(-8px); }
          75%  { transform: scale(1.03) translateX(6px); }
          100% { transform: scale(1.02) translateX(0px); }
        }
        .anim-eveningAnim { animation: eveningScene 8s ease-in-out infinite; }

        @keyframes nightScene {
          0%   { transform: scale(1) translateY(0px); }
          50%  { transform: scale(1.015) translateY(-2px); }
          100% { transform: scale(1) translateY(0px); }
        }
        .anim-nightAnim { animation: nightScene 14s ease-in-out infinite; }

        @keyframes petalFall {
          0% { transform: translateY(-15%) translateX(0px) rotate(0deg); opacity: 0; }
          4% { opacity: 0.82; }
          20% { transform: translateY(40%) translateX(9px) rotate(12deg); opacity: 0.75; }
          38% { transform: translateY(110%) translateX(-5px) rotate(28deg); opacity: 0; }
          39% { transform: translateY(-15%) translateX(0px) rotate(0deg); opacity: 0; }
          100% { transform: translateY(-15%) translateX(0px) rotate(0deg); opacity: 0; }
        }
      `}</style>

      <div 
        className="absolute inset-y-0 right-0" 
        style={{ width: "52%", overflow: "hidden", borderTopRightRadius: "inherit", borderBottomRightRadius: "inherit", flexShrink: 0 }}
      >
        {slots.map(slot => (
          <img 
            key={slot.id}
            src={slot.src || images.morning}
            alt="Welcome scene" 
            className={slot.anim ? `anim-${slot.anim}` : ""}
            style={{ 
              position: "absolute",
              inset: 0,
              width: "100%", 
              height: "100%", 
              objectFit: "cover", 
              objectPosition: "48% 45%",
              opacity: slot.active ? 1 : 0,
              zIndex: slot.active ? 2 : 1,
              transition: "opacity 2s ease-in-out",
              willChange: "transform, opacity",
              filter: "saturate(0.82) brightness(1.02)"
            }} 
          />
        ))}

        {/* Left edge gradient fade */}
        <div style={{
          position: "absolute",
          inset: 0,
          zIndex: 4,
          pointerEvents: "none",
          background: "linear-gradient(to right, rgba(255, 255, 255, 0.85) 0%, rgba(255, 255, 255, 0.3) 25%, rgba(255, 255, 255, 0) 55%)"
        }} />

        {/* Sakura Petals */}
        {[
          { left: "8%", delay: "0s" },
          { left: "18%", delay: "1s" },
          { left: "28%", delay: "2s" },
          { left: "38%", delay: "3s" },
          { left: "48%", delay: "4s" },
          { left: "57%", delay: "5s" },
          { left: "66%", delay: "6s" },
          { left: "75%", delay: "7s" },
          { left: "84%", delay: "8s" },
          { left: "92%", delay: "9s" },
        ].map((pos, i) => (
          <div key={i} style={{
            position: "absolute",
            top: "-15px",
            left: pos.left,
            width: "9px",
            height: "13px",
            background: "#FFB7C5",
            borderRadius: "50% 0 50% 0",
            pointerEvents: "none",
            zIndex: 10,
            opacity: 0,
            animation: `petalFall 10s ease-in both infinite ${pos.delay}`
          }} />
        ))}
      </div>

      {/* Left content */}
      <div style={{ position: "absolute", top: 0, bottom: 0, left: 0, width: "50%", padding: "20px 0 20px 20px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
        <div>
          <div style={{ fontSize: 11, color: JP.sakura, letterSpacing: "0.05em", fontWeight: 600 }}>
            {t(`${labelJp} / ${labelEn}`, `${labelEn} / ${labelJp}`)}
          </div>
          <div style={{ fontSize: 24, fontFamily: "var(--font-heading)", fontWeight: 600, color: JP.sumi, lineHeight: 1.1, marginTop: 4 }}>
            {greeting}
          </div>
          <div className="flex items-center" style={{ gap: 6, marginTop: 6 }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: JP.matcha, display: "inline-block" }} />
            <span style={{ fontSize: 12, color: JP.matcha, fontWeight: 500 }}>
              {mood}
            </span>
          </div>
        </div>

        <div>
          <span style={{
            display: "inline-block",
            background: JP.sakuraSoft,
            color: JP.sakura,
            borderRadius: 20,
            padding: "4px 12px",
            fontSize: 11,
            fontFamily: "var(--font-heading)", fontWeight: 600,
            fontVariantNumeric: "tabular-nums",
          }}>
            {score} / 100 ✦
          </span>
        </div>
      </div>

      <style>{`
        @keyframes heroCelebrate {
          0%,100% { transform: scale(1) rotate(0deg); }
          25% { transform: scale(1.02) rotate(-0.5deg); }
          75% { transform: scale(1.02) rotate(0.5deg); }
        }
      `}</style>
    </div>
  );
}

/* ---------- Page ---------- */
function Home() {
  const [factIdx, setFactIdx] = useState(0);
  const t = useT();
  const { language } = useLanguage();
  const { pet, updatePet } = usePet();
  const [celebrate, setCelebrate] = useState(false);
  useEffect(() => {
    const tm = setInterval(() => setFactIdx((i) => (i + 1) % DAILY_FACTS.length), 10000);
    return () => clearInterval(tm);
  }, []);
  useEffect(() => {
    if (pet.justCompletedOnboarding && pet.name?.trim()) {
      setCelebrate(true);
      const id = setTimeout(() => {
        setCelebrate(false);
        updatePet({ justCompletedOnboarding: false });
      }, 2000);
      return () => clearTimeout(id);
    }
  }, [pet.justCompletedOnboarding, pet.name, updatePet]);
  const fact = DAILY_FACTS[factIdx];
  const score = 87;

  const dogName = displayName(pet);
  const heroName = pet.name?.trim() ? dogName : t("ワンちゃん", "Your Dog");
  const mood = pet.name?.trim()
    ? t(`${pet.name}は元気です`, `${dogName} is feeling great`)
    : t("元気です", "Feeling great");

  return (
    <AppShell titleJp="" titleEn="" noPadding>
      <HeroPostcard score={score} name={heroName} mood={mood} celebrate={celebrate} ownerGender={pet.ownerGender} />

      <div style={{ padding: "0 16px" }}>

        {/* Daily fact */}
        <motion.div key={factIdx} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} style={{ marginTop: 8 }}>
          <JCard accent="#447F98" strip="transparent" style={{ background: "#B9D8E1" }}>
            <div style={{ padding: 16 }}>
              <div className="flex justify-between items-center">
                <div className="flex items-center" style={{ gap: 6 }}>
                  <PawPrint size={14} strokeWidth={1.75} style={{ color: "#447F98" }} />
                  <span style={{ fontSize: 12, fontFamily: "var(--font-heading)", fontWeight: 600, color: "#447F98", letterSpacing: "0.02em" }}>
                    {t("今日の豆知識", "Daily Dog Fact")}
                  </span>
                </div>
              </div>
              <div style={{ marginTop: 10, fontSize: 15, lineHeight: 1.5, color: "#2C3E50", fontWeight: 500 }}>
                {language === "english" ? fact.en : fact.jp}
              </div>
              {language === "mixed" && (
                <div style={{ marginTop: 6, fontSize: 11, color: JP.usuzumi, lineHeight: 1.5 }}>{fact.en}</div>
              )}
            </div>
          </JCard>
        </motion.div>

        {/* Health score */}
        <div style={{ marginTop: 8 }}>
          <JCard accent={JP.matcha} strip={JP.matchaStrip}>
            <div style={{ padding: 16 }} className="flex items-center gap-4">
              <ScoreRing value={score} />
              <div className="flex-1">
                <div style={{ fontSize: 16, fontWeight: 600, color: JP.sumi, letterSpacing: "0.02em" }}>
                  {t("総合健康スコア", "Overall Health Score")}
                </div>
                {language === "mixed" && <div style={{ fontSize: 11, color: JP.usuzumi, marginTop: 2 }}>Overall Health Score</div>}
                <div className="flex items-center" style={{ gap: 6, marginTop: 8, fontSize: 12 }}>
                  <span className="relative inline-block" style={{ width: 8, height: 8 }}>
                    <span style={{ position:"absolute", inset:0, borderRadius:"50%", background: "#1D9E75" }}/>
                    <span className="animate-ping" style={{ position:"absolute", inset:0, borderRadius:"50%", background: "#1D9E75", opacity: 0.6 }}/>
                  </span>
                  <span style={{ color: "#1D9E75", fontFamily: "var(--font-heading)", fontWeight: 600, letterSpacing: "0.05em" }}>LIVE</span>
                  <span style={{ color: JP.usuzumi }}>· {t("全センサー稼働中", "All sensors active")}</span>
                </div>
              </div>
            </div>
          </JCard>
        </div>

        {/* Collar status */}
        <div style={{ marginTop: 8 }}>
          <JCard accent={JP.sora} strip={JP.soraStrip}>
            <div style={{ padding: 16 }}>
              <div style={{ fontSize: 16, fontFamily: "var(--font-heading)", fontWeight: 600, color: JP.sumi, marginBottom: 14, letterSpacing: "0.02em" }}>
                {t("カラーステータス", "Collar Status")}
              </div>

              <div className="flex items-center" style={{ gap: 12 }}>
                <div className="flex items-center justify-center" style={{ width: 40, height: 40, borderRadius: "50%", background: "#EBF4FF" }}>
                  <Check size={20} strokeWidth={2.5} style={{ color: JP.sora }} />
                </div>
                <div className="flex-1">
                  <div style={{ fontSize: 14, fontWeight: 600, color: JP.sumi }}>{t("接続済み", "Connected")}</div>
                  <div style={{ fontSize: 12, color: JP.usuzumi }}>{t("最終同期: 2分前", "Last sync: 2 minutes ago")}</div>
                </div>
              </div>

              <div style={{ height: 1, background: JP.divider, margin: "14px 0" }} />

              <div className="flex items-center justify-between" style={{ marginBottom: 12 }}>
                <div className="flex items-center" style={{ gap: 6 }}>
                  <BatteryMedium size={18} strokeWidth={1.5} style={{ color: JP.sora }} />
                  <span style={{ fontSize: 13, color: JP.sumi, fontWeight: 500 }}>{t("バッテリー", "Battery")}</span>
                </div>
                <div className="flex items-center">
                  <div style={{ width: 110, height: 6, background: "#EBF4FF", borderRadius: 4, overflow: "hidden" }}>
                    <div style={{ width: "87%", height: "100%", background: JP.sora, borderRadius: 4 }}/>
                  </div>
                  <span style={{ marginLeft: 8, fontSize: 13, fontFamily: "var(--font-heading)", fontWeight: 600, color: JP.sora, fontVariantNumeric: "tabular-nums" }}>87%</span>
                </div>
              </div>

              <div className="flex items-center justify-between" style={{ marginBottom: 14 }}>
                <div className="flex items-center" style={{ gap: 6 }}>
                  <Signal size={18} strokeWidth={1.5} style={{ color: JP.sora }} />
                  <span style={{ fontSize: 13, color: JP.sumi, fontWeight: 500 }}>{t("信号強度", "Signal Strength")}</span>
                </div>
                <div className="flex items-center">
                  <div className="flex items-end" style={{ gap: 3 }}>
                    {[6, 10, 14, 18].map((h) => (
                      <div key={h} style={{ width: 4, height: h, background: JP.sora, borderRadius: 2 }} />
                    ))}
                  </div>
                  <span style={{ marginLeft: 8, fontSize: 13, fontWeight: 600, color: JP.sora }}>{t("優秀", "Excellent")}</span>
                </div>
              </div>

              <button
                className="w-full flex items-center justify-center"
                style={{
                  background: "#F0F6FF",
                  color: JP.sora,
                  border: "1px solid #C8E0F8",
                  borderRadius: 12,
                  height: 44,
                  fontSize: 14,
                  fontWeight: 600,
                  gap: 8,
                  letterSpacing: "0.02em",
                }}
              >
                <Bluetooth size={16} strokeWidth={1.75} />
                {t("カラーを接続", "Connect Collar")}
              </button>
            </div>
          </JCard>
        </div>

        {/* AI Sensors section */}
        <SectionLabel jp="AI センサー" en="AI Sensors" />

        <div className="grid grid-cols-2" style={{ gap: 8 }}>
          {sensors.map((s) => {
            const Icon = s.Icon;
            return (
              <Link
                key={s.en}
                to={s.to}
                style={{
                  position: "relative",
                  background: "var(--color-bg-card)",
                  borderRadius: 20,
                  border: "1.5px solid #629885",
                  boxShadow: CARD_SHADOW,
                  overflow: "hidden",
                  transition: "transform 0.2s ease",
                }}
                className="flex flex-col"
              >
                <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 10, background: s.strip, pointerEvents: "none" }} />
                <div style={{ padding: 14, paddingTop: 18, display: "flex", flexDirection: "column", flex: 1 }}>


                  <div style={{ width: 44, height: 44, borderRadius: 12, background: s.iconBg, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Icon size={22} strokeWidth={1.5} style={{ color: s.accent }} />
                  </div>

                  <div style={{ marginTop: 12, fontSize: 14, fontWeight: 600, color: JP.sumi, letterSpacing: "0.01em", lineHeight: 1.2 }}>
                    {t(s.jp, s.en)}
                  </div>
                  <div style={{ fontSize: 11, color: JP.usuzumi, marginTop: 2, lineHeight: 1.3 }}>
                    {t(s.subJp, s.subEn)}
                  </div>

                  <div className="flex items-center justify-between" style={{ marginTop: 10, gap: 6 }}>
                    <div style={{ fontSize: 16, fontFamily: "var(--font-heading)", fontWeight: 600, color: JP.sumi, fontVariantNumeric: "tabular-nums", lineHeight: 1.1 }}>
                      {t(s.valJp, s.valEn)}
                    </div>
                    <span className="animate-pulse" style={{ width: 6, height: 6, borderRadius: "50%", background: s.accent, flexShrink: 0 }}/>
                  </div>

                  {s.noteJp && (
                    <div style={{ fontSize: 11, color: JP.usuzumi, marginTop: 4 }}>
                      {t(s.noteJp, s.noteEn!)}
                    </div>
                  )}

                  {s.progress !== undefined && (
                    <div style={{ marginTop: 10, height: 4, borderRadius: 4, overflow: "hidden", background: "#F0ECE8" }}>
                      <div style={{ width: `${s.progress}%`, height: "100%", background: s.accent, borderRadius: 4 }}/>
                    </div>
                  )}

                </div>
              </Link>
            );
          })}
        </div>

        {/* Quick Access */}
        <SectionLabel jp="クイックアクセス" en="Quick Access" />

        <div className="grid grid-cols-2" style={{ gap: 10, marginBottom: 16 }}>
          {/* Health Report Card */}
          <Link
            to="/report"
            className="relative overflow-hidden"
            style={{
              height: 90,
              borderRadius: 20,
              background: "#447F98",
              border: "0.5px solid #A8CCD8",
              boxShadow: "0 8px 24px rgba(68,127,152,0.35)",
              transition: "transform 0.2s ease, box-shadow 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "scale(1.02)";
              e.currentTarget.style.boxShadow = "0 12px 32px rgba(102,126,234,0.45)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "scale(1)";
              e.currentTarget.style.boxShadow = "0 8px 24px rgba(102,126,234,0.35)";
            }}
          >
            {/* Inner highlight */}
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: "rgba(255,255,255,0.3)", zIndex: 2, pointerEvents: "none" }} />
            {/* Decorative circles */}
            <div style={{ position: "absolute", top: -20, right: 20, width: 60, height: 60, borderRadius: "50%", background: "rgba(255,255,255,0.06)", pointerEvents: "none" }} />
            <div style={{ position: "absolute", bottom: 10, left: -10, width: 40, height: 40, borderRadius: "50%", background: "rgba(255,255,255,0.06)", pointerEvents: "none" }} />
            <div style={{ position: "absolute", top: 30, right: 50, width: 80, height: 80, borderRadius: "50%", background: "rgba(255,255,255,0.06)", pointerEvents: "none" }} />
            {/* Content */}
            <div style={{ position: "relative", zIndex: 1, padding: "12px 14px", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
              <div>
                <div style={{ fontSize: 10, color: "rgba(255,255,255,0.75)", letterSpacing: "0.08em", fontWeight: 600 }}>
                  {t("レポート", "Report")}
                </div>
                <div style={{ fontSize: 18, fontFamily: "var(--font-heading)", fontWeight: 600, color: "#fff", lineHeight: 1.1, marginTop: 2 }}>
                  Health
                </div>
                <div style={{ fontSize: 18, fontFamily: "var(--font-heading)", fontWeight: 600, color: "#fff", lineHeight: 1.1 }}>
                  Report <span style={{ fontSize: 14 }}>→</span>
                </div>
              </div>
            </div>
            {/* Floating stat badge */}
            <div style={{
              position: "absolute",
              top: 10,
              right: 10,
              background: "rgba(255,255,255,0.2)",
              backdropFilter: "blur(4px)",
              WebkitBackdropFilter: "blur(4px)",
              color: "#fff",
              fontSize: 11,
              fontFamily: "var(--font-heading)", fontWeight: 600,
              borderRadius: 10,
              padding: "3px 8px",
              zIndex: 2,
              pointerEvents: "none",
            }}>
              87/100
            </div>
            {/* Large decorative icon */}
            <Activity size={52} strokeWidth={1.5} style={{
              position: "absolute",
              right: -8,
              bottom: -8,
              color: "rgba(255,255,255,0.15)",
              pointerEvents: "none",
            }} />
          </Link>

          {/* Breeds Card */}
          <Link
            to="/breeds"
            className="relative overflow-hidden"
            style={{
              height: 90,
              borderRadius: 20,
              background: "#4A7FA5",
              border: "0.5px solid #A8CCD8",
              boxShadow: "0 8px 24px rgba(74,127,165,0.35)",
              transition: "transform 0.2s ease, box-shadow 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "scale(1.02)";
              e.currentTarget.style.boxShadow = "0 12px 32px rgba(74,127,165,0.45)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "scale(1)";
              e.currentTarget.style.boxShadow = "0 8px 24px rgba(74,127,165,0.35)";
            }}
          >
            {/* Inner highlight */}
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: "rgba(255,255,255,0.3)", zIndex: 2, pointerEvents: "none" }} />
            {/* Decorative circles */}
            <div style={{ position: "absolute", top: -15, right: 25, width: 55, height: 55, borderRadius: "50%", background: "rgba(255,255,255,0.06)", pointerEvents: "none" }} />
            <div style={{ position: "absolute", bottom: 5, left: -5, width: 45, height: 45, borderRadius: "50%", background: "rgba(255,255,255,0.06)", pointerEvents: "none" }} />
            <div style={{ position: "absolute", top: 25, right: 55, width: 75, height: 75, borderRadius: "50%", background: "rgba(255,255,255,0.06)", pointerEvents: "none" }} />
            {/* Content */}
            <div style={{ position: "relative", zIndex: 1, padding: "12px 14px", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
              <div>
                <div style={{ fontSize: 10, color: "rgba(255,255,255,0.75)", letterSpacing: "0.08em", fontWeight: 600 }}>
                  {t("犬種図鑑", "Breeds")}
                </div>
                <div style={{ fontSize: 18, fontFamily: "var(--font-heading)", fontWeight: 600, color: "#fff", lineHeight: 1.1, marginTop: 2 }}>
                  Breed
                </div>
                <div style={{ fontSize: 18, fontFamily: "var(--font-heading)", fontWeight: 600, color: "#fff", lineHeight: 1.1 }}>
                  Guide <span style={{ fontSize: 14 }}>→</span>
                </div>
              </div>
            </div>
            {/* Floating badge */}
            <div style={{
              position: "absolute",
              top: 10,
              right: 10,
              background: "rgba(255,255,255,0.2)",
              backdropFilter: "blur(4px)",
              WebkitBackdropFilter: "blur(4px)",
              color: "#fff",
              fontSize: 11,
              fontFamily: "var(--font-heading)", fontWeight: 600,
              borderRadius: 10,
              padding: "3px 8px",
              zIndex: 2,
              pointerEvents: "none",
            }}>
              {t("200+ 犬種", "200+ Breeds")}
            </div>
            {/* Large decorative icon */}
            <PawPrint size={52} strokeWidth={1.5} style={{
              position: "absolute",
              right: -8,
              bottom: -8,
              color: "rgba(255,255,255,0.15)",
              pointerEvents: "none",
            }} />
          </Link>
        </div>
      </div>
    </AppShell>
  );
}

function ScoreRing({ value }: { value: number }) {
  const r = 32, c = 2 * Math.PI * r;
  const off = c - (value / 100) * c;
  return (
    <div className="relative" style={{ width: 80, height: 80 }}>
      <svg className="-rotate-90" width="80" height="80" viewBox="0 0 80 80">
        <circle cx="40" cy="40" r={r} stroke="#A8CCD8" strokeWidth="6" fill="none"/>
        <circle cx="40" cy="40" r={r} stroke="#1A56DB" strokeWidth="6" fill="none" strokeLinecap="round"
          strokeDasharray={c} strokeDashoffset={off} style={{ transition: "stroke-dashoffset 1.2s ease" }}/>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div style={{ fontSize: 22, fontFamily: "var(--font-body)", fontWeight: 700, color: "#2C3E50", fontVariantNumeric: "tabular-nums", lineHeight: 1 }}>{value}</div>
        <div style={{ fontSize: 9, fontFamily: "var(--font-body)", color: "#3A6B80", marginTop: 2 }}>/100</div>
      </div>
    </div>
  );
}
