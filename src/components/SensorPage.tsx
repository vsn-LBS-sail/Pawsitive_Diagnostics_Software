import { useState, type ReactNode, type CSSProperties } from "react";
import AppShell, { TopBar } from "@/components/AppShell";
import { useLanguage, useT } from "@/context/LanguageContext";
import { SenseBanner } from "@/components/SenseBanner";

/**
 * Premium Japanese health-tech IoT design system for all sense pages.
 * Soft, minimal, trustworthy. Sakura pink accents on a warm off-white canvas.
 */
export const SP = {
  // Backgrounds
  page: "#FAFAF9",
  card: "#FFFFFF",
  // Text
  sumi: "#1A1A2E",          // primary deep navy
  ink: "#4B5563",           // Japanese body
  usuzumi: "#6B7280",       // secondary
  muted: "#9CA3AF",          // tertiary
  divider: "#F3F4F6",
  // Rose / sakura accent
  rose: "#F43F72",
  roseSoft: "#FF6B8A",
  roseTint: "#FFF0F3",
  roseFaint: "rgba(244,63,114,0.08)",
  // Status
  ok: "#16A34A", okDot: "#22C55E", okBg: "#F0FDF4",
  warn: "#D97706", warnDot: "#F59E0B", warnBg: "#FFFBEB",
  danger: "#E11D48", dangerDot: "#F43F72", dangerBg: "#FFF1F2",
  // Legacy alias (kept so existing components compile without changes)
  sakura: "#F43F72",
  matcha: "#6BAF92",
  yuzu: "#D4A843",
  fuji: "#7B68C8",
  momiji: "#D4714E",
  sora: "#5B9BD5",
};

export const CARD_SHADOW = "0 2px 20px rgba(0,0,0,0.055)";
export const SAKURA_HEADER = "linear-gradient(180deg,#FFF5F7 0%,#FFE8EF 100%)";

export function SensorPage({
  titleJp,
  titleEn,
  subtitleJp,
  descriptorJp,
  descriptorEn,
  bannerGradient,
  bannerKanji,
  bannerKanjiColor,
  bannerSubtitleColor,
  // legacy props (kept for backward compatibility)
  heroGradient: _heroGradient,
  kanji: _kanji,
  accent: _accent,
  children,
}: {
  titleJp: string;
  titleEn: string;
  subtitleJp?: string;
  descriptorJp?: string;
  descriptorEn?: string;
  bannerGradient?: string;
  bannerKanji?: string;
  bannerKanjiColor?: string;
  bannerSubtitleColor?: string;
  heroGradient?: string;
  kanji?: string;
  headerGradient?: string;
  accent?: string;
  children: ReactNode;
}) {
  return (
    <AppShell
      noPadding
      renderTopBar={({ menuOpen, onMenuClick }) => (
        <TopBar showBack backTo="/home" menuOpen={menuOpen} onMenuClick={onMenuClick} />
      )}
    >
      <style>{`
        @keyframes spCardIn { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
        .sp-stack > * {
          opacity: 0;
          animation: spCardIn 380ms cubic-bezier(.2,.7,.2,1) forwards;
        }
        .sp-stack > *:nth-child(1){animation-delay:60ms}
        .sp-stack > *:nth-child(2){animation-delay:160ms}
        .sp-stack > *:nth-child(3){animation-delay:260ms}
        .sp-stack > *:nth-child(4){animation-delay:360ms}
        .sp-stack > *:nth-child(5){animation-delay:460ms}
        .sp-stack > *:nth-child(6){animation-delay:560ms}
        @keyframes spDraw { from{stroke-dashoffset:var(--dash)} to{stroke-dashoffset:0} }
        @keyframes spBarGrow { from{transform:scaleY(0)} to{transform:scaleY(1)} }
        @keyframes spCountFade { from{opacity:0;transform:translateY(4px)} to{opacity:1;transform:translateY(0)} }
      `}</style>

      <div style={{ background: SP.page, minHeight: "100%", paddingBottom: 100 }}>
        <SenseBanner
          subtitleJp={subtitleJp ?? titleJp}
          titleEn={titleEn}
          descriptorJp={descriptorJp ?? ""}
          descriptorEn={descriptorEn ?? ""}
          bgGradient={bannerGradient ?? "linear-gradient(135deg,#FFF5F7 0%,#FCE7F3 100%)"}
          kanji={bannerKanji ?? "心"}
          kanjiColor={bannerKanjiColor ?? "rgba(236,72,153,0.07)"}
          subtitleColor={bannerSubtitleColor ?? "#C98BA8"}
        />

        {/* Content */}
        <div className="sp-stack" style={{ padding: "16px" }}>
          {children}
        </div>
      </div>
    </AppShell>
  );
}

/**
 * Standard floating white card. The `accent` prop is kept for backward
 * compatibility but is no longer rendered — cards are clean white with a soft
 * shadow, no borders.
 */
export function Card({
  accent: _accent,
  children,
  style,
}: {
  accent?: string;
  children: ReactNode;
  style?: React.CSSProperties;
}) {
  return (
    <div
      style={{
        background: SP.card,
        borderRadius: 22,
        boxShadow: CARD_SHADOW,
        padding: 20,
        marginBottom: 14,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

export function TimeTabs({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const tabs = ["1d", "1w", "1m"];
  return (
    <div
      className="flex"
      style={{
        background: SP.divider,
        borderRadius: 50,
        padding: 4,
        gap: 4,
        marginBottom: 14,
      }}
    >
      {tabs.map((tab) => {
        const active = value === tab;
        return (
          <button
            key={tab}
            onClick={() => onChange(tab)}
            style={{
              flex: 1,
              height: 32,
              borderRadius: 50,
              fontSize: 13,
              fontWeight: active ? 600 : 500,
              background: active ? SP.rose : "transparent",
              color: active ? "#FFFFFF" : SP.muted,
              letterSpacing: "0.04em",
              transition: "all 200ms ease",
            }}
          >
            {tab.toUpperCase()}
          </button>
        );
      })}
    </div>
  );
}

export function useTimeTab() {
  return useState<string>("1d");
}

export function BL({ jp, en }: { jp: string; en: string }) {
  return (
    <Bi
      jp={jp}
      en={en}
      jpStyle={{ fontSize: 13, fontWeight: 600, color: SP.sumi, lineHeight: 1.2 }}
      enStyle={{ fontSize: 10, color: SP.usuzumi, marginTop: 1 }}
    />
  );
}

/**
 * Small uppercase rose-pink label with a 2px dot. Use at the top of every card.
 */
export function SectionLabel({ jp, en }: { jp: string; en: string }) {
  const t = useT();
  return (
    <div
      className="flex items-center"
      style={{
        gap: 6,
        marginBottom: 12,
      }}
    >
      <span style={{ width: 5, height: 5, borderRadius: "50%", background: SP.rose, flexShrink: 0 }} />
      <span
        style={{
          fontSize: 11,
          color: SP.rose,
          fontWeight: 600,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
        }}
      >
        {t(jp, en)}
      </span>
    </div>
  );
}

/**
 * AI Insight card — the ONLY card in the system with a left border.
 * 3px rose-pink translucent stripe on the left edge.
 */
export function AIInsightCard({
  jp,
  en,
  timestampJp = "今日 14:32",
  timestampEn = "Today 14:32",
}: {
  jp: string;
  en: string;
  timestampJp?: string;
  timestampEn?: string;
}) {
  const t = useT();
  return (
    <div
      style={{
        background: SP.card,
        borderRadius: 22,
        padding: 20,
        marginBottom: 14,
        boxShadow: CARD_SHADOW,
        borderLeft: "3px solid rgba(244,63,114,0.3)",
      }}
    >
      <div className="flex items-center" style={{ gap: 6 }}>
        <span style={{ color: SP.rose, fontSize: 13, lineHeight: 1 }}>✦</span>
        <span
          style={{
            fontSize: 11,
            color: SP.rose,
            fontWeight: 600,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
          }}
        >
          {t("AI インサイト", "AI Insight")}
        </span>
      </div>
      <div style={{ height: 1, background: SP.divider, margin: "10px 0 12px" }} />
      <Bi
        jp={jp}
        en={en}
        jpStyle={{ fontSize: 13, color: SP.ink, lineHeight: 1.7 }}
        enStyle={{ fontSize: 13, color: SP.ink, lineHeight: 1.7 }}
      />
      <div style={{ fontSize: 11, color: SP.muted, marginTop: 12 }}>
        {t(`最終更新 ${timestampJp}`, `Last updated: ${timestampEn}`)}
      </div>
    </div>
  );
}

/**
 * Status badge using the global system. Variant determines color + dot.
 */
export function StatusBadge({
  jp,
  en,
  variant = "ok",
}: {
  jp: string;
  en: string;
  variant?: "ok" | "warn" | "danger";
}) {
  const t = useT();
  const map = {
    ok: { bg: SP.okBg, color: SP.ok, dot: SP.okDot },
    warn: { bg: SP.warnBg, color: SP.warn, dot: SP.warnDot },
    danger: { bg: SP.dangerBg, color: SP.danger, dot: SP.dangerDot },
  }[variant];
  return (
    <span
      className="inline-flex items-center"
      style={{
        gap: 6,
        background: map.bg,
        color: map.color,
        borderRadius: 50,
        padding: "4px 12px",
        fontSize: 12,
        fontWeight: 600,
      }}
    >
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: map.dot }} />
      {t(jp, en)}
    </span>
  );
}

/**
 * Bilingual text that honours the global language switcher.
 *  - english  → renders only `en`
 *  - japanese → renders only `jp`
 *  - mixed    → JP on top, EN below in smaller style
 */
export function Bi({
  jp,
  en,
  jpStyle,
  enStyle,
  as: As = "div",
}: {
  jp: ReactNode;
  en: ReactNode;
  jpStyle?: CSSProperties;
  enStyle?: CSSProperties;
  as?: "div" | "span";
}) {
  const { language } = useLanguage();
  if (language === "english") return <As style={enStyle ?? jpStyle}>{en}</As>;
  if (language === "japanese") return <As style={jpStyle}>{jp}</As>;
  return (
    <>
      <As style={jpStyle}>{jp}</As>
      <As style={enStyle}>{en}</As>
    </>
  );
}
