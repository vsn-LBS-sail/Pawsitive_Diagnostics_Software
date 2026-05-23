import { createFileRoute } from "@tanstack/react-router";
import AppShell from "@/components/AppShell";
import { CLINICS } from "@/lib/mock";
import {
  Search,
  SlidersHorizontal,
  Star,
  Navigation,
  Video,
  Phone,
  MapPin,
  Heart,
  Plus,
  HeartPulse,
  ThumbsUp,
  Microscope,
  Building2,
  Bookmark,
  ChevronRight,
  Clock,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useT, useLanguage } from "@/context/LanguageContext";

export const Route = createFileRoute("/clinics")({ component: Clinics });

// ── Per-clinic themes ─────────────────────────────────────────
type Theme = { from: string; to: string; accent: string; soft: string };
const CLINIC_THEMES: Theme[] = [
  { from: "#E8F5EE", to: "#D4F0E4", accent: "#6BAF92", soft: "#E8F5EE" }, // Shibuya mint
  { from: "#FFF0F5", to: "#FFE4EC", accent: "#E8829A", soft: "#FFF0F5" }, // Harajuku sakura
  { from: "#EEF5FF", to: "#E0EEFF", accent: "#5B9BD5", soft: "#E8F2FF" }, // Shinjuku blue
  { from: "#FFF8DC", to: "#FFF3CC", accent: "#D4A843", soft: "#FFF8DC" }, // Yoyogi yuzu
  { from: "#F0ECFF", to: "#E8E0FF", accent: "#7B68C8", soft: "#F0ECFF" }, // Meguro fuji
];

const SPECIALTIES = [
  { jp: "歯科", en: "Dental" },
  { jp: "外科", en: "Surgery" },
  { jp: "皮膚科", en: "Derm" },
  { jp: "内科", en: "Internal" },
];

const TYPE_LABEL = ["一般 / General", "専門 / Specialist", "一般 / General", "一般 / General", "専門 / Specialist"];

// ── Category tabs ─────────────────────────────────────────────
type Cat = { jp: string; en: string; Icon: typeof Star; accent: string; from: string; to: string };
const CATS: Cat[] = [
  { jp: "高評価", en: "Top Rated", Icon: Star, accent: "#D4A843", from: "#FFF3CC", to: "#FFF8E8" },
  { jp: "近く", en: "Nearby", Icon: MapPin, accent: "#5B9BD5", from: "#E8F2FF", to: "#F0F7FF" },
  { jp: "おすすめ", en: "Recommended", Icon: ThumbsUp, accent: "#6BAF92", from: "#E8F5EE", to: "#F2FAF5" },
  { jp: "専門", en: "Specialized", Icon: Microscope, accent: "#7B68C8", from: "#F0ECFF", to: "#F8F5FF" },
  { jp: "公立/私立", en: "Public/Private", Icon: Building2, accent: "#E8829A", from: "#FFF0F5", to: "#FFF8FA" },
];

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center" style={{ gap: 1 }}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          size={12}
          style={{ color: i <= Math.round(rating) ? "#D4A843" : "#EDE8E4" }}
          fill={i <= Math.round(rating) ? "#D4A843" : "#EDE8E4"}
        />
      ))}
    </div>
  );
}

function SectionLabel({ jp, en }: { jp: string; en: string }) {
  const t = useT();
  return (
    <div className="flex items-center gap-3" style={{ margin: "16px 16px 8px" }}>
      <div style={{ flex: 1, height: 1, background: "#EDE8E4" }} />
      <div style={{ fontSize: 11, color: "#C4B8B4", letterSpacing: "0.08em", fontWeight: 600 }}>
        {t(jp, en)}
      </div>
      <div style={{ flex: 1, height: 1, background: "#EDE8E4" }} />
    </div>
  );
}

function Clinics() {
  const t = useT();
  const { language } = useLanguage();
  const [filter, setFilter] = useState(false);
  const [active, setActive] = useState(1);
  const [focused, setFocused] = useState(false);
  const [query, setQuery] = useState("");
  const [saved, setSaved] = useState<Record<number, boolean>>({});
  const [minStars, setMinStars] = useState(4);
  const [distance, setDistance] = useState(5);
  const [openOnly, setOpenOnly] = useState(true);
  const [emOnly, setEmOnly] = useState(false);
  const [specSel, setSpecSel] = useState<Record<string, boolean>>({});

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return CLINICS.filter((c) => {
      if (q && !c.en.toLowerCase().includes(q) && !c.jp.includes(query.trim())) return false;
      return true;
    });
  }, [query]);

  const emergencyClinic = CLINICS.find((c) => c.em && c.open) ?? CLINICS[0];
  const openCount = CLINICS.filter((c) => c.open).length;
  const emCount = CLINICS.filter((c) => c.em).length;
  const avgRating = (CLINICS.reduce((a, c) => a + c.rating, 0) / CLINICS.length).toFixed(1);

  const openMaps = (name: string) => {
    if (typeof window !== "undefined") {
      window.open(`https://maps.google.com/?q=${encodeURIComponent(name)}`, "_blank");
    }
  };

  return (
    <AppShell noPadding>
      {/* ── Header banner ──────────────────────────────────── */}
      <div className="relative">
        <div
          className="relative overflow-hidden"
          style={{
            height: 130,
            background: "linear-gradient(135deg,#EEF5FF 0%,#E8F5EE 50%,#F0F5FF 100%)",
            borderRadius: "0 0 28px 28px",
          }}
        >
          {/* Soft cross */}
          <div style={{ position: "absolute", right: 30, top: 30, width: 80, height: 80, opacity: 0.12 }}>
            <div style={{ position: "absolute", left: 30, top: 0, width: 20, height: 80, borderRadius: 8, background: "#5B9BD5" }} />
            <div style={{ position: "absolute", left: 0, top: 30, width: 80, height: 20, borderRadius: 8, background: "#5B9BD5" }} />
          </div>
          <Heart size={12} style={{ position: "absolute", right: 110, top: 28, color: "#E8829A", opacity: 0.45 }} fill="#E8829A" />
          <Heart size={8} style={{ position: "absolute", right: 28, top: 78, color: "#6BAF92", opacity: 0.45 }} fill="#6BAF92" />
          <Heart size={10} style={{ position: "absolute", right: 80, top: 96, color: "#5B9BD5", opacity: 0.45 }} fill="#5B9BD5" />
          {/* Petals */}
          {[{ l: 200, t: 14 }, { l: 240, t: 70 }, { l: 170, t: 90 }].map((p, i) => (
            <div
              key={i}
              style={{
                position: "absolute", left: p.l, top: p.t,
                width: 8, height: 12, background: "#FFB7C5", opacity: 0.35,
                borderRadius: "50% 50% 50% 50% / 60% 60% 40% 40%",
                animation: `petalFall 7s ${i * 1.3}s ease-in-out infinite`,
              }}
            />
          ))}

          <div style={{ position: "absolute", left: 20, top: 20, right: 130 }}>
            <div style={{ fontSize: 11, color: "#5B9BD5", letterSpacing: "0.1em", fontWeight: 600 }}>
              {t("動物病院", "Animal Clinics")}
            </div>
            <div style={{ fontSize: 26, fontFamily: "var(--font-heading)", fontWeight: 600, color: "#2C2C2C", lineHeight: 1.1, marginTop: 2 }}>
              {t("クリニックを探す", "Find Care")}
            </div>
            <div style={{ fontSize: 13, color: "#8A8A8A", marginTop: 4 }}>
              {t("近くの動物病院", "Near You")}
            </div>
            <div
              className="inline-flex items-center gap-1"
              style={{
                marginTop: 8,
                background: "rgba(255,255,255,0.7)",
                border: "1px solid #C8E0F8",
                borderRadius: 20,
                padding: "4px 12px",
                fontSize: 11,
                color: "#5B9BD5",
                fontWeight: 600,
              }}
            >
              <MapPin size={11} />
              {t("渋谷区, 東京", "Shibuya, Tokyo")}
            </div>
          </div>
        </div>
      </div>

      {/* ── Search bar ─────────────────────────────────────── */}
      <div
        className="flex items-center"
        style={{
          margin: "12px 16px",
          background: "#FFFFFF",
          borderRadius: 16,
          height: 52,
          padding: "0 16px",
          border: `1.5px solid ${focused ? "#E8829A" : "#EDE8E4"}`,
          boxShadow: focused
            ? "0 4px 16px rgba(0,0,0,0.08), 0 0 0 3px rgba(232,130,154,0.1)"
            : "0 4px 16px rgba(0,0,0,0.08)",
          transition: "all 0.18s ease",
        }}
      >
        <Search size={18} style={{ color: "#E8829A", marginRight: 10 }} />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className="flex-1 bg-transparent outline-none"
          style={{ fontSize: 14, color: "#2C2C2C" }}
          placeholder={t("クリニックを検索", "Search clinics")}
        />
        <div style={{ width: 1, height: 24, background: "#EDE8E4", marginLeft: 8 }} />
        <button
          onClick={() => setFilter(true)}
          className="flex items-center justify-center"
          style={{ marginLeft: 12, width: 36, height: 36, borderRadius: "50%", background: "#E8F2FF" }}
          aria-label={t("絞り込み", "Filters")}
        >
          <SlidersHorizontal size={18} style={{ color: "#5B9BD5" }} />
        </button>
      </div>

      {/* ── Quick stats ─────────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-2" style={{ padding: "0 16px" }}>
        {[
          { n: String(CLINICS.length), jp: "近隣クリニック", en: "Clinics Nearby", color: "#5B9BD5", emoji: "" },
          { n: avgRating, jp: "平均評価", en: "Avg Rating", color: "#D4A843", emoji: "" },
          { n: String(emCount), jp: "24時間対応", en: "24h Open", color: "#E53935", emoji: "" },
        ].map((s) => (
          <div
            key={s.en}
            style={{
              background: "#FFFFFF",
              borderRadius: 14,
              padding: "10px 12px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
              borderTop: `3px solid ${s.color}`,
            }}
          >
            <div className="flex items-center gap-1.5">
              <span style={{ fontSize: 14 }}>{s.emoji}</span>
              <span className="tabular-nums" style={{ fontSize: 20, fontFamily: "var(--font-heading)", fontWeight: 600, color: "#2C2C2C" }}>{s.n}</span>
            </div>
            <div style={{ fontSize: 10, color: "#8A8A8A", marginTop: 2, lineHeight: 1.2 }}>
              {t(s.jp, s.en)}
            </div>
          </div>
        ))}
      </div>

      {/* ── Map preview ────────────────────────────────────── */}
      <div
        className="relative overflow-hidden"
        style={{
          margin: "12px 16px 4px",
          height: 120,
          borderRadius: 20,
          background:
            "linear-gradient(180deg,#E8EEF5,#DCE6EF), repeating-linear-gradient(0deg,transparent,transparent 18px,rgba(91,155,213,0.08) 19px), repeating-linear-gradient(90deg,transparent,transparent 18px,rgba(91,155,213,0.08) 19px)",
        }}
      >
        {/* Faux roads */}
        <div style={{ position: "absolute", top: 40, left: 0, right: 0, height: 3, background: "rgba(255,255,255,0.7)" }} />
        <div style={{ position: "absolute", top: 0, bottom: 0, left: "55%", width: 3, background: "rgba(255,255,255,0.7)" }} />
        {/* Pins */}
        {[
          { l: "20%", t: "30%", c: "#6BAF92" },
          { l: "60%", t: "25%", c: "#E8829A" },
          { l: "45%", t: "65%", c: "#5B9BD5" },
          { l: "75%", t: "60%", c: "#D4A843" },
        ].map((p, i) => (
          <div
            key={i}
            style={{
              position: "absolute", left: p.l, top: p.t,
              width: 14, height: 14, borderRadius: "50%",
              background: p.c, border: "2px solid #fff",
              boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
            }}
          />
        ))}
        <button
          className="absolute"
          style={{
            left: "50%", top: "50%", transform: "translate(-50%,-50%)",
            background: "#fff", color: "#5B9BD5",
            borderRadius: 20, padding: "8px 20px",
            fontSize: 12, fontFamily: "var(--font-heading)", fontWeight: 600,
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
            display: "flex", alignItems: "center", gap: 6,
          }}
        >
          <MapPin size={14} /> {t("地図で見る", "View on Map")}
        </button>
      </div>

      {/* ── Category tabs ──────────────────────────────────── */}
      <div className="flex gap-2 overflow-x-auto scrollbar-hide" style={{ padding: "12px 16px 4px" }}>
        {CATS.map((c, i) => {
          const sel = active === i;
          const Icon = c.Icon;
          return (
            <button
              key={c.en}
              onClick={() => setActive(i)}
              className="shrink-0 flex items-center gap-1.5"
              style={{
                background: sel ? `linear-gradient(135deg, ${c.from}, ${c.to})` : "#FFFFFF",
                border: `1.5px solid ${sel ? c.accent : "#EDE8E4"}`,
                color: sel ? c.accent : "#8A8A8A",
                fontWeight: sel ? 700 : 500,
                fontSize: 12,
                borderRadius: 20,
                padding: "8px 14px",
                height: 36,
                boxShadow: sel ? `0 2px 8px ${c.accent}26` : "0 2px 6px rgba(0,0,0,0.04)",
                transition: "all 0.18s ease",
              }}
            >
              <Icon size={14} style={{ color: sel ? c.accent : "#8A8A8A" }} fill={sel && c.en === "Top Rated" ? c.accent : "none"} />
              {t(c.jp, c.en)}
            </button>
          );
        })}
      </div>

      {/* ── Emergency banner ───────────────────────────────── */}
      <SectionLabel jp="緊急対応" en="Emergency" />
      <motion.div
        animate={{ boxShadow: ["0 8px 24px rgba(229,57,53,0.3)", "0 8px 32px rgba(229,57,53,0.5)", "0 8px 24px rgba(229,57,53,0.3)"] }}
        transition={{ duration: 2, repeat: Infinity }}
        style={{
          margin: "0 16px 12px",
          background: "var(--color-primary)",
          borderRadius: 20,
          padding: "16px 20px",
          color: "#fff",
        }}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <span style={{ fontSize: 28, lineHeight: 1 }}></span>
            <div className="min-w-0">
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.85)" }}>
                {t("緊急の場合", "In Emergency")}
              </div>
              <div style={{ fontSize: 16, fontFamily: "var(--font-heading)", fontWeight: 600, lineHeight: 1.25 }}>
                {t("最寄りの24時間病院", "Nearest 24H Hospital")}
              </div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.9)", marginTop: 4 }}>
                {language === "english" ? emergencyClinic.en : emergencyClinic.jp} · {emergencyClinic.km}km · {emergencyClinic.rating}
              </div>
            </div>
          </div>
          <a
            href="tel:+81000000000"
            className="flex items-center gap-1.5 shrink-0"
            style={{
              background: "#fff", color: "#E53935",
              borderRadius: 20, padding: "8px 14px",
              fontSize: 13, fontFamily: "var(--font-heading)", fontWeight: 600,
              boxShadow: "0 4px 8px rgba(0,0,0,0.15)",
            }}
          >
            <Phone size={14} />
            {t("電話", "Call")}
          </a>
        </div>
      </motion.div>

      {/* ── Video consultation ─────────────────────────────── */}
      <button
        className="w-full text-left flex items-center gap-3"
        style={{
          margin: "0 16px 12px",
          width: "calc(100% - 32px)",
          background: "var(--color-primary)",
          border: "1.5px solid #C8C0F0",
          borderRadius: 20,
          padding: "14px 16px",
        }}
      >
        <div
          className="shrink-0 flex items-center justify-center"
          style={{ width: 56, height: 56, borderRadius: "50%", background: "#fff", boxShadow: "0 4px 12px rgba(123,104,200,0.2)" }}
        >
          <Video size={26} style={{ color: "#7B68C8" }} />
        </div>
        <div className="flex-1 min-w-0">
          <div style={{ fontSize: 15, fontFamily: "var(--font-heading)", fontWeight: 600, color: "#4A3A8A" }}>
            {t("ビデオ診察", "Video Consultation")}
          </div>
          <div style={{ fontSize: 12, color: "#7B68C8", marginTop: 2 }}>
            {t("今すぐ獣医と相談", "Consult a vet now")}
          </div>
          <span
            className="inline-block"
            style={{
              marginTop: 6, background: "#E8F5EE", color: "#6BAF92",
              fontSize: 10, fontFamily: "var(--font-heading)", fontWeight: 600,
              padding: "2px 8px", borderRadius: 20,
            }}
          >
            ● 24/7 Available
          </span>
        </div>
        <div
          className="shrink-0 flex items-center justify-center"
          style={{ width: 36, height: 36, borderRadius: "50%", background: "#7B68C8", color: "#fff" }}
        >
          <ChevronRight size={18} />
        </div>
      </button>

      {/* ── Clinics list ───────────────────────────────────── */}
      <SectionLabel jp="近くのクリニック" en="Nearby" />
      <div style={{ paddingBottom: 24 }}>
        {filtered.map((c, i) => {
          const th = CLINIC_THEMES[i % CLINIC_THEMES.length];
          const closed = !c.open;
          const isNew = i === 1;
          return (
            <div
              key={i}
              style={{
                background: "#FFFFFF",
                borderRadius: 20,
                margin: "0 16px 12px",
                boxShadow: "0 4px 16px rgba(0,0,0,0.07)",
                overflow: "hidden",
              }}
            >
              {/* Banner */}
              <div
                className="relative"
                style={{ height: 100, background: `linear-gradient(135deg, ${th.from}, ${th.to})` }}
              >
                {/* Watermark cross */}
                <div style={{ position: "absolute", right: 16, top: 14, opacity: 0.18 }}>
                  <Plus size={70} style={{ color: th.accent }} strokeWidth={2.5} />
                </div>
                {/* Tiny scattered paws */}
                {[{ l: 90, t: 18 }, { l: 140, t: 60 }, { l: 60, t: 70 }].map((p, k) => (
                  <span
                    key={k}
                    style={{ position: "absolute", left: p.l, top: p.t, fontSize: 12, opacity: 0.35 }}
                  >
                    
                  </span>
                ))}
                {/* Clinic icon */}
                <div
                  className="absolute flex items-center justify-center"
                  style={{
                    left: 14, top: "50%", transform: "translateY(-50%)",
                    width: 56, height: 56, borderRadius: "50%",
                    background: "#fff",
                    border: "2px solid #fff",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                  }}
                >
                  <HeartPulse size={28} style={{ color: th.accent }} />
                </div>
                {/* 24H badge */}
                {c.em && (
                  <div
                    className="pulse-red absolute"
                    style={{
                      top: 0, right: 0,
                      background: "#E53935", color: "#fff",
                      fontSize: 10, fontFamily: "var(--font-heading)", fontWeight: 600,
                      padding: "5px 10px",
                      borderRadius: "0 20px 0 12px",
                      letterSpacing: "0.05em",
                    }}
                  >
                    24H 
                  </div>
                )}
                {/* NEW badge */}
                {isNew && (
                  <div
                    className="absolute"
                    style={{
                      top: 8, left: 80,
                      background: "#7B68C8", color: "#fff",
                      fontSize: 9, fontFamily: "var(--font-heading)", fontWeight: 600,
                      padding: "3px 8px", borderRadius: 10,
                      letterSpacing: "0.1em",
                    }}
                  >
                    NEW
                  </div>
                )}
                {/* Closed overlay */}
                {closed && (
                  <div
                    className="absolute inset-0 flex items-center justify-center"
                    style={{ background: "rgba(0,0,0,0.35)", color: "#fff", fontSize: 12, fontFamily: "var(--font-heading)", fontWeight: 600 }}
                  >
                    {t("閉院中", "Closed")}
                  </div>
                )}
                {/* Bookmark */}
                <button
                  onClick={() => setSaved((s) => ({ ...s, [i]: !s[i] }))}
                  aria-label="save"
                  className="absolute flex items-center justify-center"
                  style={{
                    bottom: 8, right: 10,
                    width: 32, height: 32, borderRadius: "50%",
                    background: "rgba(255,255,255,0.95)",
                    boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
                  }}
                >
                  <Bookmark
                    size={14}
                    style={{ color: saved[i] ? "#D4A843" : "#C4B8B4" }}
                    fill={saved[i] ? "#D4A843" : "none"}
                  />
                </button>
              </div>

              {/* Body */}
              <div style={{ padding: "14px 16px" }}>
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div style={{ fontSize: 16, fontFamily: "var(--font-heading)", fontWeight: 600, color: "#2C2C2C", lineHeight: 1.25 }}>
                      {language === "english" ? c.en : c.jp}
                    </div>
                    {language === "mixed" && (
                      <div style={{ fontSize: 11, color: "#8A8A8A", marginTop: 2 }}>{c.en}</div>
                    )}
                  </div>
                  <span
                    className="shrink-0"
                    style={{
                      fontSize: 10, fontFamily: "var(--font-heading)", fontWeight: 600,
                      padding: "3px 10px", borderRadius: 20,
                      background: c.open ? "#E8F5EE" : "#F5F5F5",
                      color: c.open ? "#6BAF92" : "#8A8A8A",
                      border: `1px solid ${c.open ? "#B8D4C0" : "#EDE8E4"}`,
                    }}
                  >
                    {c.open ? t("営業中", "Open") : t("閉院中", "Closed")}
                  </span>
                </div>

                {/* Rating row */}
                <div className="flex items-center gap-2" style={{ marginTop: 8, flexWrap: "wrap" }}>
                  <Stars rating={c.rating} />
                  <span style={{ fontSize: 13, fontFamily: "var(--font-heading)", fontWeight: 600, color: "#D4A843" }}>{c.rating}</span>
                  <span style={{ fontSize: 11, color: "#C4B8B4" }}>(47)</span>
                  <span style={{ color: "#EDE8E4" }}>·</span>
                  <span className="flex items-center gap-1" style={{ fontSize: 12, color: "#8A8A8A" }}>
                    <MapPin size={10} style={{ color: "#E8829A" }} /> {c.km}km
                  </span>
                  <span style={{ color: "#EDE8E4" }}>·</span>
                  <span className="flex items-center gap-1" style={{ fontSize: 11, color: "#8A8A8A" }}>
                     {Math.round(c.km * 12)}{t("分", " min")}
                  </span>
                  <span
                    style={{
                      fontSize: 10, fontFamily: "var(--font-heading)", fontWeight: 600,
                      padding: "2px 8px", borderRadius: 20,
                      background: "#F5F0FF", color: "#7B68C8",
                    }}
                  >
                    {t(TYPE_LABEL[i % TYPE_LABEL.length].split(" / ")[0], TYPE_LABEL[i % TYPE_LABEL.length].split(" / ")[1])}
                  </span>
                </div>

                {/* Specialty tags */}
                <div className="flex flex-wrap gap-1.5" style={{ marginTop: 8 }}>
                  {SPECIALTIES.slice(0, 3 + (i % 2)).map((s) => (
                    <span
                      key={s.en}
                      style={{
                        background: "#FAFAF8",
                        border: "1px solid #EDE8E4",
                        color: "#8A8A8A",
                        borderRadius: 20,
                        padding: "2px 8px",
                        fontSize: 10,
                      }}
                    >
                      {t(s.jp, s.en)}
                    </span>
                  ))}
                  <span
                    style={{
                      background: "#E8F5EE",
                      color: "#6BAF92",
                      borderRadius: 20,
                      padding: "2px 8px",
                      fontSize: 10,
                      fontFamily: "var(--font-heading)", fontWeight: 600,
                    }}
                  >
                    {t("保険対応", "Insurance OK")}
                  </span>
                </div>

                {/* Hours */}
                <div className="flex items-center gap-1" style={{ marginTop: 8, fontSize: 11, color: "#8A8A8A" }}>
                  <Clock size={11} />
                  {t("月-金 9:00-18:00", "Mon–Fri 9–6pm")}
                </div>

                {/* Actions */}
                <div className="flex gap-2" style={{ marginTop: 12 }}>
                  <button
                    onClick={() => openMaps(c.en)}
                    className="flex items-center justify-center gap-1.5"
                    style={{
                      flex: "0 0 60%", height: 40, borderRadius: 12,
                      background: "var(--color-primary)",
                      color: "#fff", fontSize: 13, fontFamily: "var(--font-heading)", fontWeight: 600,
                      boxShadow: "0 4px 12px rgba(91,155,213,0.3)",
                    }}
                  >
                    <Navigation size={14} /> {t("道案内", "Directions")}
                  </button>
                  <a
                    href="tel:+81000000000"
                    className="flex items-center justify-center gap-1.5 flex-1"
                    style={{
                      height: 40, borderRadius: 12,
                      background: "#E8F5EE", border: "1px solid #B8D4C0",
                      color: "#6BAF92", fontSize: 13, fontFamily: "var(--font-heading)", fontWeight: 600,
                    }}
                  >
                    <Phone size={14} /> {t("電話", "Call")}
                  </a>
                </div>
              </div>
            </div>
          );
        })}

        <div className="flex justify-center" style={{ padding: "8px 16px 16px" }}>
          <button
            className="flex items-center gap-2"
            style={{
              background: "#FFFFFF",
              border: "1.5px solid #E8829A",
              color: "#E8829A",
              borderRadius: 20,
              padding: "10px 24px",
              fontSize: 13,
              fontFamily: "var(--font-heading)", fontWeight: 600,
            }}
          >
             {t("もっと見る", "Load More")}
          </button>
        </div>
      </div>

      {/* ── Filter bottom sheet ────────────────────────────── */}
      {filter && (
        <div className="fixed inset-0 z-50 flex items-end" style={{ background: "rgba(0,0,0,0.5)" }} onClick={() => setFilter(false)}>
          <motion.div
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            className="w-full max-w-md mx-auto"
            style={{ background: "#FAFAF8", maxHeight: "85vh", overflowY: "auto", borderRadius: "28px 28px 0 0", padding: 20 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ width: 48, height: 5, borderRadius: 999, background: "#EDE8E4", margin: "0 auto 16px" }} />
            <div className="flex items-center justify-between">
              <div style={{ fontSize: 20, fontFamily: "var(--font-heading)", fontWeight: 600, color: "#2C2C2C" }}>
                {t("絞り込み", "Filter")}
              </div>
              <button
                onClick={() => { setMinStars(0); setDistance(5); setOpenOnly(false); setEmOnly(false); setSpecSel({}); }}
                style={{ fontSize: 13, fontFamily: "var(--font-heading)", fontWeight: 600, color: "#E8829A" }}
              >
                {t("リセット", "Reset")}
              </button>
            </div>

            {/* Distance */}
            <div style={{ marginTop: 20 }}>
              <div className="flex items-center justify-between" style={{ marginBottom: 8 }}>
                <span style={{ fontSize: 13, fontFamily: "var(--font-heading)", fontWeight: 600, color: "#2C2C2C" }}>{t("距離", "Distance")}</span>
                <span style={{ fontSize: 12, fontFamily: "var(--font-heading)", fontWeight: 600, color: "#E8829A", background: "#FFF0F5", padding: "2px 10px", borderRadius: 20 }}>{distance}km</span>
              </div>
              <input
                type="range" min={1} max={10} step={1}
                value={distance}
                onChange={(e) => setDistance(parseInt(e.target.value))}
                className="w-full"
                style={{ accentColor: "#E8829A" }}
              />
              <div className="flex justify-between" style={{ fontSize: 10, color: "#C4B8B4", marginTop: 2 }}>
                <span>1km</span><span>3km</span><span>5km</span><span>10km</span>
              </div>
            </div>

            {/* Rating */}
            <div style={{ marginTop: 20 }}>
              <div style={{ fontSize: 13, fontFamily: "var(--font-heading)", fontWeight: 600, color: "#2C2C2C", marginBottom: 8 }}>{t("評価", "Rating")}</div>
              <div className="flex gap-2">
                {[5, 4, 3].map((n) => {
                  const sel = minStars === n;
                  return (
                    <button
                      key={n}
                      onClick={() => setMinStars(n)}
                      className="flex items-center gap-1 flex-1 justify-center"
                      style={{
                        background: sel ? "#FFF8DC" : "#fff",
                        border: `1.5px solid ${sel ? "#D4A843" : "#EDE8E4"}`,
                        borderRadius: 12, padding: "10px 0",
                        fontSize: 12, fontFamily: "var(--font-heading)", fontWeight: 600,
                        color: sel ? "#D4A843" : "#8A8A8A",
                      }}
                    >
                      <Star size={12} fill={sel ? "#D4A843" : "none"} /> {n}.0+
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Toggles */}
            <div style={{ marginTop: 20 }} className="space-y-3">
              {[
                { label: t("営業中のみ", "Open Now Only"), val: openOnly, set: setOpenOnly, color: "#E8829A" },
                { label: t("24時間対応", "24H Emergency Only"), val: emOnly, set: setEmOnly, color: "#E53935" },
              ].map((tg) => (
                <label key={tg.label} className="flex items-center justify-between" style={{ background: "#fff", borderRadius: 14, padding: "12px 14px", border: "1px solid #EDE8E4" }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: "#2C2C2C" }}>{tg.label}</span>
                  <button
                    type="button"
                    onClick={() => tg.set(!tg.val)}
                    className="relative"
                    style={{
                      width: 44, height: 24, borderRadius: 999,
                      background: tg.val ? tg.color : "#EDE8E4",
                      transition: "background 0.18s",
                    }}
                  >
                    <span
                      style={{
                        position: "absolute", top: 2, left: tg.val ? 22 : 2,
                        width: 20, height: 20, borderRadius: "50%",
                        background: "#fff", boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
                        transition: "left 0.18s",
                      }}
                    />
                  </button>
                </label>
              ))}
            </div>

            {/* Specialization */}
            <div style={{ marginTop: 20 }}>
              <div style={{ fontSize: 13, fontFamily: "var(--font-heading)", fontWeight: 600, color: "#2C2C2C", marginBottom: 8 }}>{t("専門分野", "Specialization")}</div>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { jp: "歯科", en: "Dental" },
                  { jp: "外科", en: "Surgery" },
                  { jp: "皮膚科", en: "Derm" },
                  { jp: "内科", en: "Internal" },
                  { jp: "眼科", en: "Eye" },
                  { jp: "整形", en: "Ortho" },
                ].map((s) => {
                  const sel = specSel[s.en];
                  return (
                    <button
                      key={s.en}
                      onClick={() => setSpecSel((x) => ({ ...x, [s.en]: !x[s.en] }))}
                      style={{
                        background: sel ? "#FFF0F5" : "#fff",
                        border: `1.5px solid ${sel ? "#E8829A" : "#EDE8E4"}`,
                        color: sel ? "#E8829A" : "#8A8A8A",
                        fontFamily: "var(--font-heading)", fontWeight: 600, fontSize: 12,
                        borderRadius: 12, padding: "10px 0",
                      }}
                    >
                      {t(s.jp, s.en)}
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              onClick={() => setFilter(false)}
              className="w-full flex items-center justify-center gap-2"
              style={{
                marginTop: 24, marginBottom: 8,
                background: "var(--color-primary)",
                color: "#fff", borderRadius: 16,
                padding: "14px 0", fontSize: 14, fontFamily: "var(--font-heading)", fontWeight: 600,
                boxShadow: "0 6px 16px rgba(232,130,154,0.35)",
              }}
            >
              {t("適用する", "Apply Filters")} · {filtered.length}{t("件", " results")}
            </button>
            <button onClick={() => setFilter(false)} className="w-full flex items-center justify-center gap-1" style={{ fontSize: 12, color: "#8A8A8A", padding: "8px 0" }}>
              <X size={12} /> {t("キャンセル", "Cancel")}
            </button>
          </motion.div>
        </div>
      )}
    </AppShell>
  );
}
