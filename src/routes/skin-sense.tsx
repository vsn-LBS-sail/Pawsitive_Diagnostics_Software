import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState, useEffect, type CSSProperties, type ReactNode } from "react";
import { Camera, Image as ImageIcon, Sparkles, Send, Droplet, Layers, Palette, Flame, ChevronDown, ChevronUp, RotateCcw } from "lucide-react";
import AppShell, { TopBar } from "@/components/AppShell";
import { SenseBanner } from "@/components/SenseBanner";
import { useLanguage, useT } from "@/context/LanguageContext";

export const Route = createFileRoute("/skin-sense")({ component: SkinSensePage });

/* ---------- Pink palette ---------- */
const C = {
  primary: "#5BAFD6",
  deep: "#2C4A6E",
  mid: "#5BAFD6",
  soft: "#D6EAF5",
  pale: "#EAF2F8",
  accent: "#7EC8E3",
  muted: "#D6EAF5",
  sakura: "#EAF2F8",
  white: "#FFFFFF",
  text: "#1A2E40",
  text2: "#6B8FA8",
  text3: "#6B8FA8",
  ok: "#16A34A",
  mild: "#D97706",
  mod: "#EA580C",
  sev: "#DC2626",
};

/* ---------- Bilingual helper ---------- */
function Bi({ jp, en, jpStyle, enStyle, as: As = "div" }: {
  jp: ReactNode; en: ReactNode; jpStyle?: CSSProperties; enStyle?: CSSProperties; as?: "div" | "span";
}) {
  const { language } = useLanguage();
  if (language === "english") return <As style={enStyle ?? jpStyle}>{en}</As>;
  if (language === "japanese") return <As style={jpStyle}>{jp}</As>;
  return (<><As style={jpStyle}>{jp}</As><As style={enStyle}>{en}</As></>);
}

/* ---------- Card wrapper ---------- */
function PinkCard({ children, style }: { children: ReactNode; style?: CSSProperties }) {
  return (
    <div style={{
      background: C.white,
      borderRadius: 16,
      boxShadow: "0 2px 12px rgba(91, 175, 214, 0.10)",
      padding: 20,
      marginBottom: 14,
      overflow: "hidden",
      boxSizing: "border-box",
      width: "100%",
      ...style,
    }}>{children}</div>
  );
}

function Label({ jp, en }: { jp: string; en: string }) {
  const t = useT();
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: C.primary }} />
      <span style={{ fontSize: 11, color: C.text2, fontFamily: "var(--font-heading)", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase" }}>
        {t(jp, en)}
      </span>
    </div>
  );
}

/* ---------- Severity helpers ---------- */
type Severity = "normal" | "mild" | "moderate" | "severe";
const SEV: Record<Severity, { color: string; bg: string; jp: string; en: string }> = {
  normal:   { color: C.ok,  bg: "#DCFCE7", jp: "正常",   en: "Normal" },
  mild:     { color: C.mild,bg: "#FEF3C7", jp: "軽度",   en: "Mild" },
  moderate: { color: C.mod, bg: "#FFEDD5", jp: "中度",   en: "Moderate" },
  severe:   { color: C.sev, bg: "#FEE2E2", jp: "重度",   en: "Severe" },
};

/* ---------- History ---------- */
const HISTORY = [
  { date: "2025-05-12", jpDate: "2025年5月12日", jp: "正常", en: "Normal", score: 94, sev: "normal" as Severity, tags: [{ jp: "正常な色素", en: "Normal Pigment" }, { jp: "健康な質感", en: "Healthy Texture" }] },
  { date: "2025-04-28", jpDate: "2025年4月28日", jp: "軽い乾燥", en: "Mild Dryness", score: 78, sev: "mild" as Severity, tags: [{ jp: "軽度乾燥", en: "Slight Dryness" }] },
  { date: "2025-04-10", jpDate: "2025年4月10日", jp: "正常", en: "Normal", score: 91, sev: "normal" as Severity, tags: [{ jp: "良好な水分", en: "Good Hydration" }] },
];

/* ---------- AI chat canned responses ---------- */
const AI_RESPONSES = [
  { jp: "現在の所見では深刻な兆候は見られません。スコアは94で健康範囲内です。", en: "Based on current findings, no serious signs detected. Score 94 is within healthy range." },
  { jp: "保湿シャンプーを週1回使用し、加湿器で湿度50-60%を保つことをおすすめします。", en: "Use a moisturising shampoo weekly and keep humidity at 50-60% with a humidifier." },
  { jp: "現状の所見では獣医受診の緊急性はありませんが、2週間以上変化がなければ相談を。", en: "No urgent vet visit needed currently. Consult a vet if no change after 2 weeks." },
  { jp: "ブラッシングと栄養バランス、オメガ3サプリで健康な皮膚を保てます。", en: "Brushing, balanced nutrition, and omega-3 supplements help maintain healthy skin." },
];

const QUICK_QS = [
  { jp: "これは深刻ですか？", en: "Is this serious?" },
  { jp: "どう治療しますか？", en: "How to treat?" },
  { jp: "獣医に行くべき？", en: "Should I see a vet?" },
  { jp: "予防方法は？", en: "How to prevent?" },
];

/* ---------- Main page ---------- */
function SkinSensePage() {
  const t = useT();
  const [photo, setPhoto] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [done, setDone] = useState(false);
  const cameraRef = useRef<HTMLInputElement>(null);
  const galleryRef = useRef<HTMLInputElement>(null);

  function onFile(file: File | undefined) {
    if (!file) return;
    setPhoto(URL.createObjectURL(file));
    setDone(false);
  }
  function analyze() {
    setAnalyzing(true);
    setTimeout(() => { setAnalyzing(false); setDone(true); }, 1500);
  }

  return (
    <AppShell
      noPadding
      renderTopBar={({ menuOpen, onMenuClick }) => (
        <TopBar showBack backTo="/home" menuOpen={menuOpen} onMenuClick={onMenuClick} />
      )}
    >
      <style>{`
        @keyframes ssLive { 0%,100%{transform:scale(1);opacity:1} 50%{transform:scale(1.4);opacity:.5} }
        @keyframes ssPetal { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        @keyframes ssScan { 0%{top:0} 50%{top:calc(100% - 2px)} 100%{top:0} }
        @keyframes ssIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        @keyframes ssPulse { 0%,100%{box-shadow:0 6px 20px rgba(232,160,191,.4)} 50%{box-shadow:0 6px 28px rgba(232,160,191,.65)} }
        @keyframes ssDot { 0%,80%,100%{transform:translateY(0);opacity:.4} 40%{transform:translateY(-6px);opacity:1} }
        .ss-in { animation: ssIn 380ms cubic-bezier(.2,.7,.2,1) both; }
      `}</style>

      <div style={{ background: "#FEF6FA", minHeight: "100%", paddingBottom: 110 }}>
        {/* ---- HERO ---- */}
        <SenseBanner
          subtitleJp="スキンセンス AI"
          titleEn="SkinSense AI"
          descriptorJp="皮膚健康診断"
          descriptorEn="Skin health analysis"
          bgGradient="linear-gradient(135deg,#FFF5F7 0%,#FCE7F3 100%)"
          kanji="皮"
          kanjiColor="rgba(236,72,153,0.06)"
          subtitleColor="#C98BA8"
        />

        {/* ---- Stats card below banner ---- */}
        <div style={{ padding: "0 16px", position: "relative", zIndex: 2, marginTop: -36 }}>
          <div style={{
            background: "#FFFFFF",
            borderRadius: 20,
            boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
            padding: "16px 20px",
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
          }}>
            {[
              { label: t("皮膚スコア", "SKIN SCORE"), value: "94", color: "#C98BA8" },
              { label: t("最終スキャン", "LAST SCAN"), value: t("5月12日", "May 12"), color: C.text },
              { label: t("状態", "CONDITION"), value: t("正常", "Normal"), color: C.ok },
            ].map((s, i) => (
              <div key={i} style={{
                textAlign: "center",
                borderLeft: i === 0 ? "none" : `1px solid ${C.soft}`,
                padding: "0 4px",
              }}>
                <div style={{ fontSize: 9, color: C.text3, fontFamily: "var(--font-heading)", fontWeight: 600, letterSpacing: "0.08em", marginBottom: 4 }}>
                  {s.label}
                </div>
                <div style={{ fontSize: 18, fontFamily: "var(--font-heading)", fontWeight: 600, color: s.color }}>{s.value}</div>
              </div>
            ))}
          </div>
        </div>


        {/* ---- Content ---- */}
        <div style={{ padding: "16px", marginTop: 16 }}>
          {/* ===== SECTION 2: SCAN ===== */}
          <PinkCard>
            <Label jp="皮膚スキャン" en="Skin Scan" />

            {!photo ? (
              <div style={{
                position: "relative",
                background: "var(--color-primary)",
                border: `1.5px dashed ${C.accent}`,
                borderRadius: 20,
                height: 180,
                display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                overflow: "hidden",
              }}>
                {/* scanning line */}
                <div style={{
                  position: "absolute", left: 0, right: 0, height: 1.5,
                  background: "linear-gradient(90deg, transparent, rgba(245,189,212,0.55), transparent)",
                  animation: "ssScan 2.5s ease-in-out infinite",
                }} />
                {/* Viewfinder */}
                <div style={{
                  width: 80, height: 80, borderRadius: "50%",
                  border: "1px solid rgba(245,189,212,0.3)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  position: "relative",
                }}>
                  <div style={{
                    position: "absolute", width: 65, height: 65, borderRadius: "50%",
                    border: "1px solid rgba(245,189,212,0.15)",
                  }} />
                  <Camera size={28} color="#C98BA8" strokeWidth={1.6} />
                </div>
                <Bi
                  jp="愛犬の皮膚を撮影してください"
                  en="Capture your dog's skin"
                  jpStyle={{ fontSize: 13, color: "#374151", fontWeight: 500, marginTop: 12, textAlign: "center" }}
                  enStyle={{ fontSize: 11, color: C.text3, marginTop: 4, textAlign: "center" }}
                />
                <Bi
                  jp="AIが皮膚の状態を瞬時に診断します"
                  en="AI diagnoses skin condition instantly"
                  jpStyle={{ fontSize: 11, color: C.text3, marginTop: 6, textAlign: "center" }}
                  enStyle={{ fontSize: 11, color: C.text3, marginTop: 6, textAlign: "center" }}
                />
              </div>
            ) : (
              <div style={{ position: "relative", borderRadius: 20, overflow: "hidden" }}>
                <img src={photo} alt="upload" style={{ width: "100%", aspectRatio: "4/3", objectFit: "cover", display: "block" }} />
                <button
                  onClick={() => { setPhoto(null); setDone(false); }}
                  style={{
                    position: "absolute", top: 10, right: 10,
                    background: "rgba(255,255,255,0.95)", color: "#6B3A52",
                    border: "none", borderRadius: 50, padding: "6px 12px",
                    fontSize: 11, fontFamily: "var(--font-heading)", fontWeight: 600, display: "flex", alignItems: "center", gap: 4,
                    boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                  }}
                >
                  <RotateCcw size={11} /> {t("再撮影", "Retake")}
                </button>
              </div>
            )}

            {/* Hidden file inputs */}
            <input ref={cameraRef} type="file" accept="image/*" capture="environment" hidden
              onChange={(e) => onFile(e.target.files?.[0] ?? undefined)} />
            <input ref={galleryRef} type="file" accept="image/*" hidden
              onChange={(e) => onFile(e.target.files?.[0] ?? undefined)} />

            {!photo ? (
              <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
                <button
                  onClick={() => cameraRef.current?.click()}
                  style={{
                    flex: 1, padding: "10px 0", borderRadius: 50,
                    border: `1.5px solid #C98BA8`, color: "#C98BA8", background: "#fff",
                    fontSize: 13, fontWeight: 500, display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                  }}
                >
                  <Camera size={14} /> {t("カメラ", "Camera")}
                </button>
                <button
                  onClick={() => galleryRef.current?.click()}
                  style={{
                    flex: 1, padding: "10px 0", borderRadius: 50,
                    background: "var(--color-primary)", color: "#6B3A52",
                    border: "none", fontSize: 13, fontWeight: 600,
                    boxShadow: "0 4px 14px rgba(232,160,191,0.3)",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                  }}
                >
                  <ImageIcon size={14} /> {t("ギャラリー", "Gallery")}
                </button>
              </div>
            ) : (
              <button
                onClick={analyze}
                disabled={analyzing}
                style={{
                  marginTop: 14, width: "100%", padding: "14px 0", borderRadius: 50,
                  background: "var(--color-primary)", color: "#6B3A52",
                  border: "none", fontSize: 15, fontWeight: 600,
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                  animation: analyzing ? "none" : "ssPulse 2s ease-in-out infinite",
                  opacity: analyzing ? 0.7 : 1,
                }}
              >
                <Sparkles size={16} />
                {analyzing ? t("分析中...", "Analyzing...") : t("AIで診断する", "Analyze with AI")}
              </button>
            )}
          </PinkCard>

          {/* ===== SECTION 3: DIAGNOSIS RESULT ===== */}
          {done && photo && (
            <PinkCard style={{ animation: "ssIn 400ms cubic-bezier(.2,.7,.2,1) both" }}>
              <Label jp="診断結果" en="Diagnosis Result" />

              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <img src={photo} alt="result" style={{ width: 60, height: 60, borderRadius: 16, objectFit: "cover", flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <Bi
                    jp="正常"
                    en="Normal"
                    jpStyle={{ fontSize: 16, fontFamily: "var(--font-heading)", fontWeight: 600, color: C.text }}
                    enStyle={{ fontSize: 13, fontWeight: 600, color: C.text2 }}
                  />
                  <div style={{ fontSize: 12, color: "#C98BA8", marginTop: 2, fontWeight: 600 }}>
                    {t("信頼度 96%", "Confidence 96%")}
                  </div>
                </div>
                <ScoreRing value={94} />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 14 }}>
                <Metric icon={<Droplet size={16} />} iconBg="#DBEAFE" iconColor="#2563EB"
                  jp="水分量" en="Hydration" value="82%" />
                <Metric icon={<Layers size={16} />} iconBg="#DCFCE7" iconColor={C.ok}
                  jp="質感" en="Texture" value={t("正常", "Normal")} />
                <Metric icon={<Palette size={16} />} iconBg="#FEF3C7" iconColor={C.mild}
                  jp="色素" en="Pigmentation" value={t("健康", "Healthy")} />
                <Metric icon={<Flame size={16} />} iconBg="#FEE2E2" iconColor={C.sev}
                  jp="炎症" en="Inflammation" value={t("なし", "None")} />
              </div>

              <DetailedGuide />
            </PinkCard>
          )}

          {/* ===== SECTION 4: AI CHAT ===== */}
          <AIChat />

          {/* ===== SECTION 5: HISTORY ===== */}
          <PinkCard>
            <Label jp="分析履歴" en="Analysis History" />
            <div>
              {HISTORY.map((h, i) => {
                const s = SEV[h.sev];
                return (
                  <div key={h.date} style={{
                    display: "flex", alignItems: "center", gap: 12,
                    padding: "12px 0",
                    borderTop: i === 0 ? "none" : `1px solid ${C.soft}`,
                  }}>
                    <div style={{
                      width: 48, height: 48, borderRadius: "50%", flexShrink: 0,
                      background: "var(--color-primary)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      <PawIcon color="#E8B4CC" size={22} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <Bi jp={h.jp} en={h.en}
                        jpStyle={{ fontSize: 14, fontWeight: 600, color: C.text }}
                        enStyle={{ fontSize: 11, color: C.text2, marginTop: 1 }}
                      />
                      <div style={{ fontSize: 11, color: C.text3, marginTop: 3 }}>{t(h.jpDate, h.date)}</div>
                      <div style={{ display: "flex", gap: 4, marginTop: 5, flexWrap: "wrap" }}>
                        {h.tags.map((tag, ti) => (
                          <span key={ti} style={{
                            background: C.soft, color: "#6B3A52",
                            fontSize: 9, fontWeight: 600, borderRadius: 50,
                            padding: "2px 8px",
                          }}>{t(tag.jp, tag.en)}</span>
                        ))}
                      </div>
                    </div>
                    <div style={{ textAlign: "right", flexShrink: 0 }}>
                      <div style={{ fontSize: 22, fontFamily: "var(--font-heading)", fontWeight: 600, color: "#C98BA8", lineHeight: 1 }}>{h.score}</div>
                      <span style={{
                        display: "inline-block", marginTop: 4, padding: "3px 8px",
                        borderRadius: 50, background: s.bg, color: s.color,
                        fontSize: 10, fontFamily: "var(--font-heading)", fontWeight: 600,
                      }}>{t(s.jp, s.en)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
            <button style={{
              width: "100%", marginTop: 10, padding: "8px 0", border: "none", background: "transparent",
              color: "#C98BA8", fontSize: 13, fontWeight: 600,
            }}>
              {t("履歴をすべて見る ›", "View Full History ›")}
            </button>
          </PinkCard>

          {/* ===== SECTION 6: AI INSIGHT ===== */}
          <AIInsight />
        </div>
      </div>
    </AppShell>
  );
}

/* ---------- Sub components ---------- */

function ScoreRing({ value }: { value: number }) {
  const r = 20, c = 2 * Math.PI * r;
  const off = c - (value / 100) * c;
  return (
    <svg width={52} height={52} viewBox="0 0 52 52">
      <defs>
        <linearGradient id="ssRing" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#F0A8C4" />
          <stop offset="100%" stopColor="#F5BDD4" />
        </linearGradient>
      </defs>
      <circle cx={26} cy={26} r={r} fill="none" stroke={C.soft} strokeWidth={5} />
      <circle cx={26} cy={26} r={r} fill="none" stroke="url(#ssRing)" strokeWidth={5}
        strokeDasharray={c} strokeDashoffset={off} strokeLinecap="round"
        transform="rotate(-90 26 26)" />
      <text x={26} y={30} textAnchor="middle" fontSize={14} fontWeight={800} fill="#C98BA8">{value}</text>
    </svg>
  );
}

function Metric({ icon, iconBg, iconColor, jp, en, value }: {
  icon: ReactNode; iconBg: string; iconColor: string; jp: string; en: string; value: string;
}) {
  const t = useT();
  return (
    <div style={{
      background: C.pale, borderRadius: 14, padding: 12,
      display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center",
    }}>
      <div style={{
        width: 32, height: 32, borderRadius: "50%", background: iconBg, color: iconColor,
        display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 6,
      }}>{icon}</div>
      <div style={{ fontSize: 10, color: C.text3, fontWeight: 600 }}>{t(jp, en)}</div>
      <div style={{ fontSize: 13, color: C.text, fontFamily: "var(--font-heading)", fontWeight: 600, marginTop: 2 }}>{value}</div>
    </div>
  );
}

function DetailedGuide() {
  const t = useT();
  const [open, setOpen] = useState(false);
  return (
    <div style={{ marginTop: 14 }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          width: "100%", padding: "12px 14px", borderRadius: 14,
          background: C.pale, border: `1px solid ${C.soft}`,
          display: "flex", alignItems: "center", justifyContent: "space-between",
          color: "#6B3A52", fontSize: 12, fontFamily: "var(--font-heading)", fontWeight: 600, letterSpacing: "0.06em",
        }}
      >
        <span>● {t("詳細ガイド", "DETAILED GUIDE")}</span>
        {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </button>
      {open && (
        <div style={{ padding: "14px 4px 4px", display: "grid", gap: 12 }}>
          <GuideRow titleJp="この状態の意味" titleEn="What it means"
            jp="現在の皮膚は健康な範囲内です。色素・水分・質感ともに正常値を示しています。"
            en="Skin is within healthy range. Pigment, hydration and texture all show normal values." />
          <GuideRow titleJp="考えられる要因" titleEn="Possible causes"
            jp="バランスの良い食事と適切なケアが維持されています。"
            en="Balanced diet and proper care are being maintained." />
          <GuideRow titleJp="推奨ケア" titleEn="Recommended care"
            jp="現在のケアを継続し、週1回のスキャンで経過観察を続けてください。"
            en="Continue current care and monitor with weekly scans." />
          <GuideRow titleJp="獣医に相談すべき時" titleEn="When to see a vet"
            jp="赤み、強い痒み、脱毛、2週間以上続く変化が見られた場合。"
            en="If redness, intense itching, hair loss, or changes lasting over 2 weeks appear." />
        </div>
      )}
    </div>
  );
}

function GuideRow({ titleJp, titleEn, jp, en }: { titleJp: string; titleEn: string; jp: string; en: string }) {
  return (
    <div>
      <Bi jp={titleJp} en={titleEn}
        jpStyle={{ fontSize: 12, fontFamily: "var(--font-heading)", fontWeight: 600, color: "#6B3A52" }}
        enStyle={{ fontSize: 10, color: C.text3, marginTop: 1 }}
      />
      <Bi jp={jp} en={en}
        jpStyle={{ fontSize: 12, color: "#374151", lineHeight: 1.6, marginTop: 4 }}
        enStyle={{ fontSize: 11, color: C.text2, lineHeight: 1.55, marginTop: 4 }}
      />
    </div>
  );
}

/* ---------- AI Chat ---------- */
type ChatMsg = { role: "ai" | "user"; jp: string; en: string };

function AIChat() {
  const t = useT();
  const [messages, setMessages] = useState<ChatMsg[]>([
    { role: "ai",
      jp: "こんにちは！皮膚の状態について何でも質問してください。",
      en: "Hello! Feel free to ask me anything about your dog's skin condition." },
  ]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, typing]);

  function sendText(jp: string, en: string) {
    setMessages((m) => [...m, { role: "user", jp, en }]);
    setTyping(true);
    setTimeout(() => {
      const r = AI_RESPONSES[Math.floor(Math.random() * AI_RESPONSES.length)];
      setMessages((m) => [...m, { role: "ai", jp: r.jp, en: r.en }]);
      setTyping(false);
    }, 1000);
  }

  function handleSend() {
    const v = input.trim();
    if (!v) return;
    sendText(v, v);
    setInput("");
  }

  return (
    <PinkCard>
      <Label jp="AIに質問する" en="Ask AI" />
      <Bi jp="皮膚に関する質問をどうぞ" en="Ask anything about skin health"
        jpStyle={{ fontSize: 12, color: C.text3, marginBottom: 10 }}
        enStyle={{ fontSize: 12, color: C.text3, marginBottom: 10 }}
      />

      {/* Quick chips */}
      <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 4, marginBottom: 10 }}>
        {QUICK_QS.map((q, i) => (
          <button key={i}
            onClick={() => sendText(q.jp, q.en)}
            style={{
              flexShrink: 0, background: "#FEF0F6", border: "1px solid #F5BDD4",
              color: "#9B5B76", borderRadius: 50, padding: "6px 14px",
              fontSize: 12, fontWeight: 500, whiteSpace: "nowrap",
            }}
          >{t(q.jp, q.en)}</button>
        ))}
      </div>

      {/* Messages */}
      <div ref={scrollRef} style={{
        height: 200, overflowY: "auto", background: C.pale, borderRadius: 16, padding: 12,
        display: "flex", flexDirection: "column", gap: 10,
      }}>
        {messages.map((m, i) => (
          <div key={i} style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start" }}>
            {m.role === "ai" ? (
              <div style={{
                background: "#fff", padding: "10px 14px", maxWidth: "82%",
                borderRadius: "16px 16px 16px 4px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 4, marginBottom: 4 }}>
                  <PawIcon color="#E8B4CC" size={12} />
                  <span style={{ fontSize: 10, color: "#E8B4CC", fontFamily: "var(--font-heading)", fontWeight: 600 }}>AI</span>
                </div>
                <Bi jp={m.jp} en={m.en}
                  jpStyle={{ fontSize: 13, color: "#374151", lineHeight: 1.6 }}
                  enStyle={{ fontSize: 12, color: C.text2, lineHeight: 1.55, marginTop: 2 }}
                />
              </div>
            ) : (
              <div style={{
                background: "var(--color-primary)", color: "#6B3A52",
                padding: "10px 14px", maxWidth: "82%",
                borderRadius: "16px 16px 4px 16px",
                fontSize: 13, lineHeight: 1.5,
              }}>{t(m.jp, m.en)}</div>
            )}
          </div>
        ))}
        {typing && (
          <div style={{ display: "flex" }}>
            <div style={{
              background: "#fff", padding: "12px 16px", borderRadius: "16px 16px 16px 4px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.06)", display: "flex", gap: 4,
            }}>
              {[0, 1, 2].map((i) => (
                <span key={i} style={{
                  width: 6, height: 6, borderRadius: "50%", background: C.primary,
                  animation: `ssDot 1.2s ease-in-out ${i * 0.15}s infinite`,
                }} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div style={{
        marginTop: 10, display: "flex", alignItems: "center", gap: 6,
        background: "#fff", border: `1.5px solid ${C.soft}`, borderRadius: 50,
        padding: "6px 6px 6px 16px",
      }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") handleSend(); }}
          placeholder={t("質問を入力...", "Type your question...")}
          style={{
            flex: 1, border: "none", outline: "none", background: "transparent",
            fontSize: 13, color: "#374151", minWidth: 0,
          }}
        />
        <button onClick={handleSend} aria-label="Send" style={{
          width: 36, height: 36, borderRadius: "50%", border: "none",
          background: "var(--color-primary)", color: "#6B3A52",
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: "0 2px 8px rgba(232,160,191,0.3)", flexShrink: 0,
        }}><Send size={16} /></button>
      </div>
    </PinkCard>
  );
}

/* ---------- AI Insight ---------- */
function AIInsight() {
  const t = useT();
  return (
    <div style={{
      position: "relative",
      background: "#2C4A6E",
      borderRadius: 16, padding: 22, overflow: "hidden",
      boxShadow: "0 2px 12px rgba(91, 175, 214, 0.10)",
    }}>
      {/* sakura watermarks */}
      {[
        { top: 14, right: 22, size: 26, dur: 26 },
        { top: 70, right: 80, size: 18, dur: 30 },
        { bottom: 16, right: 30, size: 22, dur: 24 },
      ].map((p, i) => (
        <svg key={i} width={p.size} height={p.size} viewBox="0 0 24 24" aria-hidden style={{
          position: "absolute", top: p.top, right: p.right, bottom: p.bottom,
          opacity: 0.5, animation: `ssPetal ${p.dur}s linear infinite`,
        }}>
          <path d="M12 2c2 3 5 5 5 9s-3 7-5 11c-2-4-5-7-5-11s3-6 5-9z" fill="rgba(255,255,255,0.06)" />
        </svg>
      ))}

      <div style={{ position: "relative" }}>
        <div style={{
          fontSize: 11, color: "#FFFFFF", fontFamily: "var(--font-heading)", fontWeight: 600, letterSpacing: "0.1em",
        }}>AI INSIGHT</div>
        <div style={{ height: 1, background: "rgba(255,255,255,0.15)", margin: "10px 0 14px" }} />

        <Bi
          jp="ワンちゃんの皮膚は現在健康な状態です。前回のチェックから3ポイント改善しています。引き続き定期的なケアを続けてください。"
          en="Skin condition is healthy. Improved by 3 points since last check. Continue regular care."
          jpStyle={{ fontSize: 14, color: "#fff", lineHeight: 1.8 }}
          enStyle={{ fontSize: 13, color: "rgba(255,255,255,0.7)", lineHeight: 1.7, marginTop: 6 }}
        />

        <div style={{ marginTop: 14 }}>
          <span style={{
            display: "inline-block", background: "rgba(255,255,255,0.15)",
            color: "#fff", borderRadius: 50, padding: "6px 14px",
            fontSize: 12, fontWeight: 500,
          }}>
            💡 {t("週1回のスキャンを推奨", "Weekly scan recommended")}
          </span>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 16 }}>
          <span style={{
            display: "inline-flex", alignItems: "center", gap: 5,
            background: "rgba(34,197,94,0.25)", color: "#BBF7D0",
            borderRadius: 50, padding: "4px 10px",
            fontSize: 11, fontFamily: "var(--font-heading)", fontWeight: 600,
          }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#4ADE80" }} />
            {t("健康な皮膚 ✓", "Healthy skin ✓")}
          </span>
          <span style={{ fontSize: 11, color: "rgba(255,255,255,0.5)" }}>
            {t("更新 14:32", "Updated 14:32")}
          </span>
        </div>
      </div>
    </div>
  );
}

/* ---------- Tiny paw icon ---------- */
function PawIcon({ color, size = 16 }: { color: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color} aria-hidden>
      <ellipse cx="6" cy="9" rx="2" ry="2.6" />
      <ellipse cx="10" cy="6" rx="2" ry="2.6" />
      <ellipse cx="14" cy="6" rx="2" ry="2.6" />
      <ellipse cx="18" cy="9" rx="2" ry="2.6" />
      <path d="M12 11c-3.2 0-5.6 2.4-5.6 5 0 1.8 1.4 3 3.4 3 1 0 1.4-.4 2.2-.4s1.2.4 2.2.4c2 0 3.4-1.2 3.4-3 0-2.6-2.4-5-5.6-5z" />
    </svg>
  );
}
