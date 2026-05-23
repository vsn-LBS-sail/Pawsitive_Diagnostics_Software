import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type Language = "english" | "japanese" | "mixed";

type Ctx = {
  language: Language;
  setLanguage: (l: Language) => void;
};

const LanguageContext = createContext<Ctx>({ language: "mixed", setLanguage: () => {} });

const KEY = "appLanguage";

// Migration from earlier short codes
function normalize(v: string | null): Language {
  if (v === "english" || v === "japanese" || v === "mixed") return v;
  if (v === "en") return "english";
  if (v === "jp") return "japanese";
  if (v === "mix") return "mixed";
  return "mixed";
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLangState] = useState<Language>("mixed");

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored =
      localStorage.getItem(KEY) ??
      localStorage.getItem("preferredLanguage") ??
      localStorage.getItem("wancare-lang");
    setLangState(normalize(stored));
  }, []);

  const setLanguage = (l: Language) => {
    setLangState(l);
    if (typeof window !== "undefined") {
      localStorage.setItem(KEY, l);
      localStorage.setItem("preferredLanguage", l);
    }
  };

  return <LanguageContext.Provider value={{ language, setLanguage }}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  return useContext(LanguageContext);
}

/** Inline bilingual text. Renders one or both languages depending on mode. */
export function T({
  jp,
  en,
  className = "",
  as: As = "span",
  enClassName = "",
}: {
  jp: string;
  en: string;
  className?: string;
  enClassName?: string;
  as?: "span" | "div";
}) {
  const { language } = useLanguage();
  if (language === "english") return <As className={className}>{en}</As>;
  if (language === "japanese") return <As className={className}>{jp}</As>;
  return (
    <As className={className}>
      <span className="block">{jp}</span>
      <span className={`block text-[0.75em] opacity-70 font-normal ${enClassName}`}>{en}</span>
    </As>
  );
}

/** String helper for places that need a plain string (placeholders, titles, attrs). */
export function useT() {
  const { language } = useLanguage();
  return (jp: string, en: string) => {
    if (language === "english") return en;
    if (language === "japanese") return jp;
    return `${jp} / ${en}`;
  };
}
