import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useLanguage, type Language } from "@/context/LanguageContext";
import { PawPrint } from "lucide-react";
import { PawLogo } from "@/components/PawLogo";
import PhoneFrame from "@/components/PhoneFrame";

export const Route = createFileRoute("/language")({ component: LanguagePicker });

const opts: { id: Language; flag: string; jp: string; en: string; subJp: string; subEn: string }[] = [
  { id: "english", flag: "", jp: "English Only", en: "English", subJp: "英語のみ", subEn: "English only" },
  { id: "japanese", flag: "", jp: "日本語のみ", en: "Japanese Only", subJp: "日本語", subEn: "Japanese only" },
  { id: "mixed", flag: "", jp: "ミックス", en: "Mixed", subJp: "英語・日本語", subEn: "English + Japanese" },
];

function LanguagePicker() {
  const { language, setLanguage } = useLanguage();
  const [sel, setSel] = useState<Language>(language);
  const nav = useNavigate();
  const choose = () => { setLanguage(sel); nav({ to: "/auth" }); };

  return (
    <PhoneFrame>
    <div className="min-h-screen flex flex-col" style={{ background: "#FAFAF8" }}>
      <HeroIllustration />
      <div className="flex-1 px-6 pb-8 w-full">
        <h1 className="text-base font-semibold text-center mt-2" style={{ color: "#2C2C2C" }}>
          言語を選択してください<br/>
          <span className="text-xs font-normal" style={{ color: "#8A8A8A" }}>Please select your language</span>
        </h1>
        <div className="mt-6 space-y-3">
          {opts.map((o) => {
            const selected = sel === o.id;
            return (
              <button
                key={o.id}
                onClick={() => setSel(o.id)}
                className="w-full h-16 rounded-2xl flex items-center justify-between px-5 transition-all"
                style={{
                  background: selected ? "#FFFAFB" : "#FFFFFF",
                  border: selected ? "2px solid #447F98" : "2px solid transparent",
                  borderLeft: selected ? "4px solid #447F98" : "2px solid transparent",
                  boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
                }}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{o.flag}</span>
                  <div className="text-left">
                    <div className="text-[15px] font-semibold" style={{ color: "#2C2C2C" }}>{o.jp}</div>
                    <div className="text-[12px]" style={{ color: "#8A8A8A" }}>{o.en} · {o.subJp}</div>
                  </div>
                </div>
                <div
                  className="w-[22px] h-[22px] rounded-full flex items-center justify-center"
                  style={{
                    background: selected ? "#447F98" : "#FFFFFF",
                    border: selected ? "none" : "1.5px solid #EDE8E4",
                  }}
                >
                  {selected && <span className="w-2 h-2 rounded-full bg-white" />}
                </div>
              </button>
            );
          })}
        </div>
        <button
          onClick={choose}
          className="w-full mt-8 h-[52px] rounded-[14px] text-white font-bold text-[16px] flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
          style={{
            background: "var(--color-primary)",
            boxShadow: "0 8px 20px rgba(68,127,152,0.35)",
          }}
        >
          <PawPrint className="w-4 h-4" strokeWidth={2.2} />
          続ける / Continue →
        </button>
      </div>
    </div>
    </PhoneFrame>
  );
}

export function HeroIllustration({ compact = false }: { compact?: boolean }) {
  const H = compact ? 220 : 260;
  const logo = compact ? 56 : 72;
  const titleSize = compact ? 22 : 24;
  const jpSize = compact ? 13 : 14;
  const tagSize = compact ? 11 : 12;
  return (
    <div
      className="relative w-full overflow-hidden"
      style={{
        height: H,
        background: "linear-gradient(160deg, #EAF4F9 0%, #E5ECEF 50%, #D6E9F3 100%)",
      }}
    >
      <div
        className="absolute -top-16 -right-16 rounded-full"
        style={{ width: 200, height: 200, background: "#A8CCD8", opacity: 0.5, filter: "blur(40px)" }}
      />
      <svg className="absolute top-3 left-3" width="90" height="60" viewBox="0 0 90 60" style={{ opacity: 0.25 }}>
        <path d="M2 8 Q 30 18, 60 12 T 88 22" stroke="#4A7FA5" strokeWidth="1.2" fill="none" />
        <circle cx="20" cy="14" r="4" fill="#FFB7C5" />
        <circle cx="20" cy="14" r="4" fill="#A8CCD8" />
        <circle cx="38" cy="16" r="3" fill="#D6E9F3" />
        <circle cx="55" cy="12" r="3.5" fill="#A8CCD8" />
        <circle cx="72" cy="18" r="3" fill="#B9D8E1" />
      </svg>
      {[
        { l: "20%", t: "30%", s: 8, c: "#A8CCD8", d: 0 },
        { l: "70%", t: "20%", s: 10, c: "#D6E9F3", d: 1 },
        { l: "85%", t: "55%", s: 6, c: "#A8CCD8", d: 2 },
        { l: "15%", t: "65%", s: 9, c: "#B9D8E1", d: 3 },
        { l: "55%", t: "75%", s: 7, c: "#D6E9F3", d: 1.5 },
      ].map((p, i) => (
        <div
          key={i}
          className="absolute rounded-full"
          style={{
            left: p.l, top: p.t, width: p.s, height: p.s * 1.4,
            background: p.c, transform: `rotate(${i * 35}deg)`,
            animation: `petalFall 10s ease-in-out ${p.d}s infinite`,
          }}
        />
      ))}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div
          className="rounded-full bg-white flex items-center justify-center"
          style={{ width: logo, height: logo, border: "2px solid var(--color-bg-card-elevated)", boxShadow: "0 8px 24px rgba(68,127,152,0.2)" }}
        >
          <PawLogo size={logo * 0.55} color="var(--color-primary)" />
        </div>
        <div className="mt-2 font-bold leading-none" style={{ color: "#2C2C2C", fontSize: titleSize, letterSpacing: "0.05em" }}>
          Pawsitive Diagnostics
        </div>
        <div className="mt-1" style={{ color: "#8A8A8A", fontSize: jpSize, letterSpacing: "0.05em" }}>ポジティブ</div>
        <div className="mt-1.5 italic text-center" style={{ color: "#8A8A8A", fontSize: tagSize }}>
          あなたの愛犬を、もっと近くに。<br/>
          <span className="not-italic">Closer to your beloved dog.</span>
        </div>
      </div>
    </div>
  );
}
