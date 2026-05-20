import { useEffect, useRef, useState } from "react";
import { Check } from "lucide-react";
import { toast } from "sonner";
import { useLanguage, type Language } from "@/context/LanguageContext";

const OPTIONS: { value: Language; flag: string; code: string; title: string; sub: string; toast: string }[] = [
  { value: "english", flag: "", code: "EN", title: "English Only", sub: "English", toast: "Language changed to English ✓" },
  { value: "japanese", flag: "", code: "JP", title: "日本語 Only", sub: "Japanese", toast: "言語を日本語に変更しました ✓" },
  { value: "mixed", flag: "", code: "MX", title: "Mixed", sub: "EN + JP", toast: "言語: Mixed に変更しました ✓" },
];

export default function LanguageSwitcher({ variant = "pill" }: { variant?: "pill" | "panel" }) {
  const { language, setLanguage } = useLanguage();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const current = OPTIONS.find((o) => o.value === language) ?? OPTIONS[2];

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const pick = (opt: typeof OPTIONS[number]) => {
    setLanguage(opt.value);
    setOpen(false);
    toast(opt.toast, {
      position: "bottom-center",
      style: { background: "#1A2F5A", color: "#fff", border: "none" },
      duration: 2000,
    });
  };

  if (variant === "panel") {
    return (
      <div className="bg-card rounded-2xl shadow-card overflow-hidden border border-border">
        {OPTIONS.map((opt, i) => {
          const selected = opt.value === language;
          return (
            <button
              key={opt.value}
              onClick={() => pick(opt)}
              className={`w-full flex items-center gap-3 px-4 h-14 text-left transition-colors ${
                selected ? "bg-sakura-soft" : "hover:bg-muted"
              } ${i > 0 ? "border-t border-border" : ""}`}
            >
              <span className="text-xl">{opt.flag}</span>
              <div className="flex-1">
                <div className="text-sm font-bold text-foreground">{opt.title}</div>
                <div className="text-[11px] text-muted-foreground">{opt.sub}</div>
              </div>
              {selected && <Check className="w-4 h-4 text-primary" />}
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center"
        style={{
          height: 28,
          padding: "6px 14px",
          borderRadius: 20,
          background: "#F0EEF8",
          color: "#7B68C8",
          fontSize: 12,
          fontFamily: "var(--font-heading)", fontWeight: 600,
          letterSpacing: "0.02em",
          gap: 4,
        }}
        aria-label="Change language"
      >
        <span>{current.code}</span>
      </button>
      {open && (
        <div className="absolute right-0 top-9 w-56 bg-card rounded-xl shadow-card border border-border overflow-hidden z-50">
          {OPTIONS.map((opt, i) => {
            const selected = opt.value === language;
            return (
              <button
                key={opt.value}
                onClick={() => pick(opt)}
                className={`w-full flex items-center gap-3 px-3 h-11 text-left transition-colors ${
                  selected ? "bg-sakura-soft" : "hover:bg-muted"
                } ${i > 0 ? "border-t border-border" : ""}`}
              >
                <span className="text-lg">{opt.flag}</span>
                <div className="flex-1">
                  <div className="text-[13px] font-bold text-foreground leading-tight">{opt.title}</div>
                  <div className="text-[10px] text-muted-foreground leading-tight">{opt.sub}</div>
                </div>
                {selected && <Check className="w-4 h-4 text-primary" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
