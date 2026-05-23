import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import AppShell from "@/components/AppShell";
import { HamburgerButton } from "@/components/SideDrawer";
import { useState, useRef, useEffect, useCallback } from "react";
import {
  Camera,
  Mic,
  Send,
  Heart,
  Activity,
  MapPin,
  AlertTriangle,
  MoreHorizontal,
  Syringe,
  Thermometer,
  Moon,
  UtensilsCrossed,
  FileHeart,
  Phone,
  Navigation,
  Calendar,
  Check,
  X,
  ChevronRight,
  Star,
} from "lucide-react";
import { useT, useLanguage } from "@/context/LanguageContext";
import { usePet } from "@/context/PetContext";
import DogAvatar from "@/components/DogAvatar";
import { motion, AnimatePresence } from "framer-motion";
import { detectIntent, type Intent } from "@/utils/chatResponses";
import { CLINICS as NEARBY_CLINICS, VACCINE_RECORDS } from "@/lib/mock";

export const Route = createFileRoute("/ai")({ component: AI });

type CardType =
  | "health"
  | "emergencyConfirm"
  | "emergencyAction"
  | "findVet"
  | "vaccines"
  | "healthFollowup";

type Msg = {
  id: number;
  from: "user" | "ai";
  jp: string;
  en: string;
  card?: CardType;
  time?: string;
};

function nowTime() {
  const d = new Date();
  return `${d.getHours().toString().padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}`;
}

const QUICK: { jp: string; en: string; icon: typeof Heart; color: string; bg: string; intent: Intent; pulse?: boolean }[] = [
  { jp: "健康確認", en: "Health Check", icon: Heart, color: "#E8829A", bg: "#FFF0F5", intent: "healthCheck" },
  { jp: "ワクチン", en: "Vaccines", icon: Syringe, color: "#6BAF92", bg: "#E8F5EE", intent: "vaccines" },
  { jp: "近くの獣医", en: "Find Vet", icon: MapPin, color: "#5B9BD5", bg: "#E8F2FF", intent: "findVet" },
  { jp: "緊急", en: "Emergency", icon: AlertTriangle, color: "#E53935", bg: "#FFF0F0", intent: "emergency", pulse: true },
];

const SUGGESTIONS = [
  { jp: " うちの犬の健康状態を教えて", en: " Tell me my dog's health status", color: "#E8829A" },
  { jp: " 次のワクチンはいつ？", en: " When is the next vaccine?", color: "#6BAF92" },
  { jp: " 近くの動物病院を探して", en: " Find nearby animal hospital", color: "#5B9BD5" },
];

const PAW_PATTERN =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' width='48' height='48' viewBox='0 0 48 48'><g fill='%23E8829A' fill-opacity='0.025'><circle cx='12' cy='14' r='2.2'/><circle cx='18' cy='10' r='1.6'/><circle cx='8' cy='10' r='1.6'/><circle cx='15' cy='18' r='1.6'/><ellipse cx='13' cy='22' rx='3.6' ry='3'/></g></svg>`,
  );

function AI() {
  const t = useT();
  const { language } = useLanguage();
  const { pet } = usePet();
  const navigate = useNavigate();
  const name = pet.name || (language === "japanese" ? "ワンちゃん" : "your dog");
  const suffix = language === "english" ? "" : "ちゃん";

  const [msgs, setMsgs] = useState<Msg[]>([
    {
      id: 1,
      from: "ai",
      jp: `こんにちは！${name}${suffix}の健康についてお手伝いします `,
      en: `Hi! I'm here to help with ${name}'s health `,
      time: nowTime(),
    },
  ]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [focused, setFocused] = useState(false);
  const [sosActive, setSosActive] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const idRef = useRef(100);
  const inputRef = useRef<HTMLInputElement>(null);

  const nextId = () => ++idRef.current;

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [msgs, typing]);

  const pushUser = (jp: string, en: string) => {
    setMsgs((m) => [...m, { id: nextId(), from: "user", jp, en, time: nowTime() }]);
  };
  const pushAi = (jp: string, en: string, card?: CardType) => {
    setMsgs((m) => [...m, { id: nextId(), from: "ai", jp, en, time: nowTime(), card }]);
  };

  const withTyping = (delay: number, fn: () => void) => {
    setTyping(true);
    setTimeout(() => {
      setTyping(false);
      fn();
    }, delay);
  };

  // ===== Intent flows =====

  const runEmergency = useCallback(() => {
    withTyping(900, () => {
      pushAi(
        "緊急事態ですか？SOSを起動しますか？",
        "Is this an emergency? Do you want to activate SOS?",
        "emergencyConfirm",
      );
    });
  }, []);

  const runFindVet = useCallback(() => {
    withTyping(800, () => {
      pushAi("近くの動物病院を検索しています... ", "Searching for nearby clinics... ");
      setTimeout(() => {
        pushAi("", "", "findVet");
        setTimeout(() => {
          pushAi(
            "クリニックページに詳細があります。お役に立てますか？",
            "The clinics page has more details. Can I help with anything else? ",
          );
        }, 900);
      }, 500);
    });
  }, []);

  const runVaccines = useCallback(() => {
    withTyping(900, () => {
      pushAi(
        `${name}${suffix}のワクチン記録を確認しています `,
        `Checking ${name}'s vaccine records `,
      );
      setTimeout(() => {
        pushAi("", "", "vaccines");
        setTimeout(() => {
          pushAi(
            "フィラリアのワクチンが期限切れです！早めに動物病院へ行くことをおすすめします ",
            "Heartworm vaccine is overdue! Please visit a vet soon ",
          );
        }, 900);
      }, 500);
    });
  }, [name, suffix]);

  const runHealthCheck = useCallback(() => {
    withTyping(900, () => {
      pushAi(
        `${name}${suffix}の健康状態を確認しています... `,
        `Checking ${name}'s health status... `,
      );
      setTimeout(() => {
        pushAi(`${name}${suffix}の健康サマリーです `, `Here's ${name}'s health summary `, "health");
        setTimeout(() => {
          pushAi("", "", "healthFollowup");
        }, 700);
      }, 500);
    });
  }, [name, suffix]);

  const runGeneral = useCallback(
    (text: string) => {
      const m = text.toLowerCase();
      withTyping(1000, () => {
        if (/food|eat|diet|食事|ごはん/.test(m)) {
          const w = pet.weight ?? 8;
          pushAi(
            `${name}${suffix}の体重${w}kgに適した1日の食事量は約${Math.round(w * 30)}gです。バランスの良い食事を心がけましょう `,
            `For a ${w}kg dog like ${name}, the recommended daily food is about ${Math.round(w * 30)}g. Keep a balanced diet `,
          );
        } else if (/walk|exercise|散歩|運動/.test(m)) {
          pushAi("今日の運動データ：2,340歩 · 1.8km · 目標の80% ", "Today's activity: 2,340 steps · 1.8km · 80% of goal ");
        } else if (/temperature|fever|体温|熱/.test(m)) {
          pushAi("現在の体温は38.5℃ — 正常範囲内です ", "Current temperature is 38.5°C — within normal range ");
        } else if (/sleep|tired|眠/.test(m)) {
          pushAi("昨夜の睡眠は7.5時間、質は良好です ", "Last night's sleep was 7.5 hours, quality is good ");
        } else {
          pushAi(
            "わんちゃんについて何でも聞いてください！健康チェック、ワクチン、クリニック検索などお手伝いできます ",
            "Feel free to ask anything about your dog! I can help with health checks, vaccines, finding clinics and more ",
          );
        }
      });
    },
    [name, suffix, pet.weight],
  );

  const dispatchIntent = (intent: Intent, text: string) => {
    switch (intent) {
      case "emergency":
        return runEmergency();
      case "findVet":
        return runFindVet();
      case "vaccines":
        return runVaccines();
      case "healthCheck":
        return runHealthCheck();
      default:
        return runGeneral(text);
    }
  };

  const send = (text?: string) => {
    const v = (text ?? input).trim();
    if (!v) return;
    pushUser(v, v);
    setInput("");
    dispatchIntent(detectIntent(v), v);
  };

  const sendChip = (q: (typeof QUICK)[number]) => {
    const jp = q.jp;
    const en = q.en;
    setMsgs((m) => [...m, { id: nextId(), from: "user", jp, en, time: nowTime() }]);
    dispatchIntent(q.intent, en);
  };

  // ===== Card action handlers =====

  const onEmergencyYes = () => {
    pushUser("はい、SOS", "Yes, SOS");
    withTyping(700, () => {
      pushAi(" SOS を起動しています...", " Activating SOS...");
      setSosActive(true);
      setTimeout(() => {
        pushAi("", "", "emergencyAction");
        setTimeout(() => {
          pushAi(
            "SOSが送信されました。助けが来るまで落ち着いてください ",
            "SOS has been sent. Please stay calm until help arrives ",
          );
        }, 900);
      }, 800);
    });
  };
  const onEmergencyNo = () => {
    pushUser("いいえ", "No");
    withTyping(500, () => {
      pushAi(
        "わかりました。何かあればいつでも呼んでください ",
        "Understood. Call me anytime if you need help ",
      );
    });
  };

  const goClinics = () => {
    withTyping(500, () => {
      pushAi("クリニックページに移動します... ", "Taking you to clinics... ");
      setTimeout(() => navigate({ to: "/clinics" }), 600);
    });
  };
  const goReport = () => {
    withTyping(500, () => {
      pushAi("レポートページに移動します... ", "Taking you to your report... ");
      setTimeout(() => navigate({ to: "/report" }), 600);
    });
  };
  const focusInput = () => inputRef.current?.focus();

  const pickText = (m: Msg) => {
    if (language === "english") return m.en;
    if (language === "japanese") return m.jp;
    return null;
  };

  return (
    <AppShell
      fullHeight
      noPadding
      renderTopBar={({ menuOpen, onMenuClick }) => (
        <div
          style={{
            flexShrink: 0,
            background: "#FFFFFF",
            boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
            padding: "10px 14px",
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          <HamburgerButton isOpen={menuOpen} onClick={onMenuClick} />
          <div className="relative shrink-0">
            <div
              className="flex items-center justify-center overflow-hidden"
              style={{
                width: 40,
                height: 40,
                borderRadius: "50%",
                background: "var(--color-primary)",
                border: "2px solid #C8C0F0",
                boxShadow: "0 4px 10px rgba(123,104,200,0.2)",
              }}
            >
              <DogAvatar breed="shiba" size={36} ring={false} showCollar={false} eyeStyle="sparkle" />
            </div>
            <div
              style={{
                position: "absolute", right: -1, bottom: -1, width: 11, height: 11,
                borderRadius: "50%", background: "#6BAF92", border: "2px solid #FFFFFF",
              }}
            />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-baseline gap-1.5 truncate">
              <span style={{ fontSize: 14, fontFamily: "var(--font-heading)", fontWeight: 600, color: "#2C2C2C" }}>ポジティブAI</span>
              <span style={{ fontSize: 11, color: "#8A8A8A" }}>Pawsitive AI</span>
            </div>
            <div className="flex items-center gap-1 mt-0.5">
              <span className="relative inline-block" style={{ width: 5, height: 5 }}>
                <span className="absolute inset-0 rounded-full" style={{ background: "#6BAF92" }} />
                <span className="absolute inset-0 rounded-full pulse-dot" style={{ background: "#6BAF92" }} />
              </span>
              <span style={{ fontSize: 10, color: "#6BAF92", fontWeight: 600 }}>{t("オンライン", "Online")}</span>
              <span style={{ fontSize: 10, color: "#C4B8B4" }}>·</span>
              <span style={{ fontSize: 10, color: "#8A8A8A" }}>{t("獣医監修", "Vet-supervised")}</span>
            </div>
          </div>
          <button
            className={`shrink-0 flex items-center justify-center ${sosActive ? "sos-pulse" : ""}`}
            style={{
              padding: "0 12px", height: 32, borderRadius: 16,
              background: "#E53935", color: "#FFFFFF",
              fontFamily: "var(--font-heading)", fontWeight: 600, fontSize: 11, letterSpacing: "0.05em",
              boxShadow: "0 4px 10px rgba(229,57,53,0.35)",
            }}
            aria-label="SOS"
          >
            SOS
          </button>
        </div>
      )}
    >
      <div
        style={{
          flex: 1,
          minHeight: 0,
          display: "flex",
          flexDirection: "column",
          background: `url("${PAW_PATTERN}") repeat, #FAFAF8`,
        }}
      >
        {/* CHAT */}
        <div ref={scrollRef} className="px-4 pt-3 space-y-3" style={{ flex: 1, minHeight: 0, overflowY: "auto", overflowX: "hidden" }}>
          <div className="flex items-center justify-center my-3">
            <div
              style={{
                fontSize: 11,
                color: "#E8829A",
                background: "rgba(232,130,154,0.1)",
                border: "1px solid rgba(232,130,154,0.2)",
                padding: "4px 16px",
                borderRadius: 20,
                fontWeight: 600,
              }}
            >
              {t("今日", "Today")}
            </div>
          </div>


          <AnimatePresence initial={false}>
            {msgs.map((m) => {
              const isUser = m.from === "user";
              const txt = pickText(m);
              const hasCard = !!m.card;
              const hasText = !!(m.jp || m.en);
              return (
                <motion.div
                  key={m.id}
                  initial={{ opacity: 0, x: isUser ? 20 : -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                  className={`flex gap-2 ${isUser ? "justify-end" : "justify-start items-end"}`}
                >
                  {!isUser && (
                    <div
                      className="shrink-0 overflow-hidden flex items-center justify-center"
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: "50%",
                        background: "var(--color-primary)",
                        border: "1.5px solid #C8C0F0",
                      }}
                    >
                      <DogAvatar breed="shiba" size={26} ring={false} showCollar={false} />
                    </div>
                  )}

                  <div className={`flex flex-col ${isUser ? "items-end max-w-[75%]" : "items-start max-w-[85%] w-full"}`}>
                    {hasText && (
                      <div
                        style={{
                          padding: "12px 16px",
                          borderRadius: isUser ? "20px 20px 4px 20px" : "4px 20px 20px 20px",
                          background: isUser
                            ? "linear-gradient(135deg, #E8829A, #C86882)"
                            : "#FFFFFF",
                          color: isUser ? "#FFFFFF" : "#2C2C2C",
                          fontSize: 15,
                          lineHeight: 1.45,
                          boxShadow: isUser
                            ? "0 4px 12px rgba(232,130,154,0.3)"
                            : "0 2px 12px rgba(0,0,0,0.07)",
                          border: isUser ? "none" : "1px solid #F0ECE8",
                          borderLeft: isUser ? "none" : "3px solid #7B68C8",
                          marginBottom: hasCard ? 8 : 0,
                        }}
                      >
                        {txt !== null ? (
                          txt
                        ) : (
                          <>
                            <span className="block">{m.jp}</span>
                            <span className="block mt-0.5" style={{ fontSize: 12, opacity: 0.75 }}>
                              {m.en}
                            </span>
                          </>
                        )}
                      </div>
                    )}

                    {m.card === "health" && <HealthCard t={t} />}
                    {m.card === "healthFollowup" && (
                      <FollowupChips t={t} onReport={goReport} onClinic={runFindVet} onAsk={focusInput} />
                    )}
                    {m.card === "emergencyConfirm" && (
                      <EmergencyConfirmCard t={t} onYes={onEmergencyYes} onNo={onEmergencyNo} />
                    )}
                    {m.card === "emergencyAction" && <EmergencyActionCard t={t} />}
                    {m.card === "findVet" && <FindVetCard t={t} onAll={goClinics} />}
                    {m.card === "vaccines" && (
                      <VaccinesCard t={t} onBook={goClinics} onReport={goReport} />
                    )}

                    <div
                      className={`flex items-center gap-1 mt-1 px-1 ${isUser ? "justify-end" : "justify-start"}`}
                      style={{ fontSize: 10, color: "#C4B8B4" }}
                    >
                      <span>{m.time}</span>
                      {isUser && <span style={{ color: "#6BAF92", fontFamily: "var(--font-heading)", fontWeight: 600 }}>✓✓</span>}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {msgs.length <= 1 && (
            <WelcomeState t={t} language={language} onPick={(s) => setInput(s)} />
          )}

          {typing && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-2 items-end">
              <div
                className="shrink-0 overflow-hidden"
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: "50%",
                  background: "var(--color-primary)",
                  border: "1.5px solid #C8C0F0",
                }}
              >
                <DogAvatar breed="shiba" size={26} ring={false} showCollar={false} />
              </div>
              <div
                className="flex items-center gap-2"
                style={{
                  padding: "12px 16px",
                  borderRadius: "4px 20px 20px 20px",
                  background: "#FFFFFF",
                  border: "1px solid #F0ECE8",
                  borderLeft: "3px solid #7B68C8",
                  boxShadow: "0 2px 12px rgba(0,0,0,0.07)",
                }}
              >
                <div className="flex items-center gap-1">
                  {[0, 1, 2].map((i) => (
                    <span
                      key={i}
                      className="block rounded-full"
                      style={{
                        width: 6,
                        height: 6,
                        background: "#7B68C8",
                        animation: `typingBounce 1.2s ${i * 0.15}s infinite ease-in-out`,
                      }}
                    />
                  ))}
                </div>
                <span style={{ fontSize: 10, color: "#8A8A8A", fontStyle: "italic" }}>
                  {t("考え中...", "Thinking...")}
                </span>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* COMPOSER */}
      <div style={{ flexShrink: 0 }}>
        <div style={{ background: "#FFFFFF", borderTop: "1px solid #F0ECE8", padding: "10px 16px" }}>
          <div className="flex gap-2 overflow-x-auto scrollbar-hide">
            {QUICK.map((q) => {
              const Icon = q.icon;
              return (
                <button
                  key={q.en}
                  onClick={() => sendChip(q)}
                  className={`shrink-0 flex items-center gap-1.5 transition-transform active:scale-95 ${q.pulse ? "pulse-soft" : ""}`}
                  style={{
                    height: 36,
                    border: `1.5px solid ${q.color}`,
                    background: q.bg,
                    color: q.color,
                    fontSize: 12,
                    fontFamily: "var(--font-heading)", fontWeight: 600,
                    padding: "0 14px",
                    borderRadius: 20,
                    whiteSpace: "nowrap",
                    boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
                  }}
                >
                  <Icon size={12} strokeWidth={2.5} />
                  {language === "english" ? q.en : q.jp}
                </button>
              );
            })}
          </div>
        </div>

        <div
          style={{
            background: "#FFFFFF",
            borderTop: "1px solid #F0ECE8",
            padding: "10px 16px 20px",
            boxShadow: "0 -4px 20px rgba(0,0,0,0.05)",
          }}
        >
          <div className="flex items-center gap-2">
            <button
              className="shrink-0 flex items-center justify-center"
              style={{ width: 40, height: 40, borderRadius: "50%", background: "#F5F0FF", boxShadow: "0 2px 8px rgba(123,104,200,0.15)" }}
              aria-label="Camera"
            >
              <Camera size={18} color="#7B68C8" />
            </button>
            <button
              className="shrink-0 flex items-center justify-center"
              style={{ width: 40, height: 40, borderRadius: "50%", background: "#E8F5EE", boxShadow: "0 2px 8px rgba(107,175,146,0.15)" }}
              aria-label="Mic"
            >
              <Mic size={18} color="#6BAF92" />
            </button>
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              onKeyDown={(e) => e.key === "Enter" && send()}
              className="flex-1 outline-none"
              style={{
                height: 44,
                background: "#FAFAF8",
                border: focused ? "1.5px solid #7B68C8" : "1.5px solid #EDE8E4",
                borderRadius: 20,
                padding: "0 16px",
                fontSize: 14,
                color: "#2C2C2C",
                boxShadow: focused ? "0 0 0 3px rgba(123,104,200,0.1)" : "none",
                transition: "all 0.2s",
              }}
              placeholder={t("メッセージを入力...", "Type a message...")}
            />
            <button
              onClick={() => send()}
              disabled={!input.trim()}
              className="shrink-0 flex items-center justify-center transition-all active:scale-90"
              style={{
                width: 44,
                height: 44,
                borderRadius: "50%",
                background: input.trim() ? "linear-gradient(135deg, #7B68C8, #9B88D8)" : "#C4B8B4",
                color: "#FFFFFF",
                boxShadow: input.trim() ? "0 4px 12px rgba(123,104,200,0.3)" : "none",
              }}
              aria-label="Send"
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes typingBounce {
          0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
          30% { transform: translateY(-5px); opacity: 1; }
        }
        .pulse-soft { animation: pulseSoft 2s infinite; }
        @keyframes pulseSoft {
          0%, 100% { box-shadow: 0 2px 6px rgba(229,57,53,0.15); }
          50% { box-shadow: 0 2px 14px rgba(229,57,53,0.4); }
        }
        .sos-pulse { animation: sosPulse 1.2s infinite; }
        @keyframes sosPulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(229,57,53,0.6); }
          50% { box-shadow: 0 0 0 10px rgba(229,57,53,0); }
        }
        .em-glow { animation: emGlow 1.6s infinite; }
        @keyframes emGlow {
          0%, 100% { box-shadow: 0 0 0 0 rgba(229,57,53,0.35); }
          50% { box-shadow: 0 0 0 6px rgba(229,57,53,0); }
        }
        .overdue-pulse { animation: overduePulse 1.6s infinite; }
        @keyframes overduePulse {
          0%, 100% { background: #FFF0F0; }
          50% { background: #FFE0E0; }
        }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </AppShell>
  );
}

function WelcomeState({
  t,
  language,
  onPick,
}: {
  t: (jp: string, en: string) => string;
  language: string;
  onPick: (s: string) => void;
}) {
  return (
    <div className="flex flex-col items-center text-center pt-4 pb-4">
      <div style={{ fontSize: 13, color: "#8A8A8A", marginBottom: 10 }}>
        {t("クイック質問", "Quick questions")}
      </div>
      <div className="w-full space-y-2">
        {SUGGESTIONS.map((s, i) => (
          <button
            key={i}
            onClick={() => onPick(language === "english" ? s.en : s.jp)}
            className="w-full text-left transition-transform active:scale-[0.98]"
            style={{
              background: "#FFFFFF",
              borderRadius: 16,
              padding: "12px 16px",
              boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
              borderLeft: `3px solid ${s.color}`,
              fontSize: 13,
              color: "#2C2C2C",
            }}
          >
            {language === "english" ? s.en : s.jp}
          </button>
        ))}
      </div>
    </div>
  );
}

// ========== Action Cards ==========

function EmergencyConfirmCard({
  t,
  onYes,
  onNo,
}: {
  t: (jp: string, en: string) => string;
  onYes: () => void;
  onNo: () => void;
}) {
  return (
    <div
      className="w-full em-glow"
      style={{
        background: "var(--color-primary)",
        border: "2px solid #E53935",
        borderLeft: "4px solid #E53935",
        borderRadius: 20,
        padding: 16,
      }}
    >
      <div className="flex items-center gap-2 mb-2">
        <AlertTriangle size={18} color="#E53935" strokeWidth={2.5} />
        <span style={{ fontSize: 13, fontFamily: "var(--font-heading)", fontWeight: 600, color: "#E53935" }}>
          {t("緊急サポート", "Emergency Support")}
        </span>
      </div>
      <div style={{ fontSize: 13, color: "#2C2C2C", marginBottom: 12, lineHeight: 1.5 }}>
        {t("SOSボタンを起動しますか？", "Do you want to activate SOS?")}
      </div>
      <div className="flex gap-2">
        <button
          onClick={onYes}
          className="flex items-center justify-center gap-1.5 active:scale-95 transition-transform"
          style={{
            flex: "0 0 60%",
            height: 44,
            background: "#E53935",
            color: "#FFFFFF",
            borderRadius: 12,
            fontSize: 14,
            fontFamily: "var(--font-heading)", fontWeight: 600,
            boxShadow: "0 4px 12px rgba(229,57,53,0.35)",
          }}
        >
          <Check size={16} strokeWidth={3} />
          {t("はい、SOS", "YES, SOS")}
        </button>
        <button
          onClick={onNo}
          className="flex items-center justify-center gap-1.5 active:scale-95 transition-transform"
          style={{
            flex: 1,
            height: 44,
            background: "#F5F5F5",
            color: "#8A8A8A",
            borderRadius: 12,
            fontSize: 14,
          }}
        >
          <X size={16} />
          {t("いいえ", "No")}
        </button>
      </div>
    </div>
  );
}

function EmergencyActionCard({ t }: { t: (jp: string, en: string) => string }) {
  const c = NEARBY_CLINICS.find((x) => x.em) ?? NEARBY_CLINICS[0];
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(c.en)}`;
  return (
    <div
      className="w-full"
      style={{
        background: "#FFFFFF",
        border: "1.5px solid #E53935",
        borderLeft: "4px solid #E53935",
        borderRadius: 20,
        padding: 14,
        boxShadow: "0 4px 16px rgba(229,57,53,0.15)",
      }}
    >
      <div className="flex items-center gap-2 mb-2">
        <Phone size={16} color="#E53935" strokeWidth={2.5} />
        <span style={{ fontSize: 12, fontFamily: "var(--font-heading)", fontWeight: 600, color: "#E53935", letterSpacing: "0.05em" }}>
          {t("緊急連絡", "EMERGENCY CALL")}
        </span>
      </div>
      <div style={{ fontSize: 11, color: "#8A8A8A", marginBottom: 8 }}>
        {t("最寄りの24時間動物病院", "Nearest 24H Animal Hospital")}
      </div>
      <div
        style={{
          background: "#FFF8F8",
          borderRadius: 12,
          padding: 10,
          marginBottom: 10,
          border: "1px solid #FFE0E0",
        }}
      >
        <div style={{ fontSize: 14, fontFamily: "var(--font-heading)", fontWeight: 600, color: "#2C2C2C" }}>{t(c.jp, c.en)}</div>
        <div className="flex items-center gap-2 mt-1" style={{ fontSize: 11, color: "#6A6A6A" }}>
          <span className="flex items-center gap-0.5">
            <Star size={10} fill="#D4A843" color="#D4A843" />
            {c.rating}
          </span>
          <span>·</span>
          <span>{c.km}km</span>
          <span>·</span>
          <span style={{ color: "#E53935", fontFamily: "var(--font-heading)", fontWeight: 600 }}>Open 24H</span>
        </div>
      </div>
      <div className="flex gap-2">
        <a
          href={`tel:${c.phone}`}
          className="flex items-center justify-center gap-1.5 active:scale-95 transition-transform"
          style={{
            flex: 1,
            height: 44,
            background: "#E53935",
            color: "#FFFFFF",
            borderRadius: 12,
            fontSize: 13,
            fontFamily: "var(--font-heading)", fontWeight: 600,
            boxShadow: "0 4px 12px rgba(229,57,53,0.35)",
          }}
        >
          <Phone size={14} />
          {t("今すぐ電話", "Call Now")}
        </a>
        <a
          href={mapsUrl}
          target="_blank"
          rel="noreferrer"
          className="flex items-center justify-center gap-1.5 active:scale-95 transition-transform"
          style={{
            flex: 1,
            height: 44,
            background: "#FFF0F0",
            color: "#E53935",
            border: "1.5px solid #E53935",
            borderRadius: 12,
            fontSize: 13,
            fontFamily: "var(--font-heading)", fontWeight: 600,
          }}
        >
          <Navigation size={14} />
          {t("道案内", "Directions")}
        </a>
      </div>
    </div>
  );
}

function FindVetCard({ t, onAll }: { t: (jp: string, en: string) => string; onAll: () => void }) {
  return (
    <div
      className="w-full"
      style={{
        background: "var(--color-primary)",
        border: "1.5px solid #C8E0F8",
        borderLeft: "4px solid #5B9BD5",
        borderRadius: 20,
        padding: 14,
      }}
    >
      <div className="flex items-center gap-2 mb-1">
        <MapPin size={16} color="#5B9BD5" strokeWidth={2.5} />
        <span style={{ fontSize: 12, fontFamily: "var(--font-heading)", fontWeight: 600, color: "#5B9BD5", letterSpacing: "0.05em" }}>
          {t("近くのクリニック", "NEARBY CLINICS")}
        </span>
      </div>
      <div style={{ fontSize: 11, color: "#6A6A6A", marginBottom: 10 }}>
        {t("あなたの近くに 24 件のクリニックがあります", "24 clinics found near you")}
      </div>
      <div className="space-y-1.5 mb-3">
        {NEARBY_CLINICS.map((c, i) => {
          const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(c.en)}`;
          return (
            <a
              key={i}
              href={mapsUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 active:scale-[0.99] transition-transform"
              style={{
                background: "#FFFFFF",
                borderRadius: 10,
                padding: "8px 10px",
                border: "1px solid #E0EEF8",
              }}
            >
              <Star size={11} fill="#D4A843" color="#D4A843" />
              <span style={{ fontSize: 13, fontFamily: "var(--font-heading)", fontWeight: 600, color: "#2C2C2C", flex: 1 }}>{t(c.jp, c.en)}</span>
              <span style={{ fontSize: 12, color: "#5B9BD5", fontWeight: 600 }}>{c.km}km</span>
              <ChevronRight size={14} color="#5B9BD5" />
            </a>
          );
        })}
      </div>
      <button
        onClick={onAll}
        className="w-full flex items-center justify-center gap-1.5 active:scale-[0.98] transition-transform"
        style={{
          height: 44,
          background: "var(--color-primary)",
          color: "#FFFFFF",
          borderRadius: 12,
          fontSize: 13,
          fontFamily: "var(--font-heading)", fontWeight: 600,
          boxShadow: "0 4px 12px rgba(91,155,213,0.3)",
        }}
      >
        <MapPin size={14} />
        {t("クリニック一覧を見る", "View All Clinics")} →
      </button>
    </div>
  );
}

function VaccinesCard({
  t,
  onBook,
  onReport,
}: {
  t: (jp: string, en: string) => string;
  onBook: () => void;
  onReport: () => void;
}) {
  return (
    <div
      className="w-full"
      style={{
        background: "#FFFFFF",
        border: "1.5px solid #B8D4C0",
        borderLeft: "4px solid #6BAF92",
        borderRadius: 20,
        overflow: "hidden",
      }}
    >
      <div style={{ height: 6, background: "var(--color-bg-card)" }} />
      <div className="p-3.5">
        <div className="flex items-center gap-2 mb-2">
          <Syringe size={16} color="#6BAF92" strokeWidth={2.5} />
          <span style={{ fontSize: 12, fontFamily: "var(--font-heading)", fontWeight: 600, color: "#6BAF92", letterSpacing: "0.05em" }}>
            {t("ワクチン記録", "VACCINE RECORDS")}
          </span>
        </div>
        <div className="space-y-1.5 mb-3">
          {VACCINE_RECORDS.map((v, i) => {
            const overdue = v.status === "overdue";
            return (
              <div
                key={i}
                className={overdue ? "overdue-pulse" : ""}
                style={{
                  borderRadius: 10,
                  padding: "8px 10px",
                  background: overdue ? "#FFF0F0" : "#F4FAF6",
                  border: `1px solid ${overdue ? "#FFD0D0" : "#D8E8DC"}`,
                }}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    {overdue ? (
                      <AlertTriangle size={12} color="#E53935" />
                    ) : (
                      <Check size={12} color="#6BAF92" strokeWidth={3} />
                    )}
                    <span style={{ fontSize: 13, fontFamily: "var(--font-heading)", fontWeight: 600, color: "#2C2C2C" }}>{t(v.jp, v.en)}</span>
                  </div>
                  {overdue ? (
                    <span style={{ fontSize: 10, fontFamily: "var(--font-heading)", fontWeight: 600, color: "#E53935" }}>
                      {t("期限切れ", "OVERDUE")}
                    </span>
                  ) : null}
                </div>
                <div style={{ fontSize: 10, color: "#8A8A8A", marginTop: 2, paddingLeft: 18 }}>
                  {overdue
                    ? t("すぐに接種が必要です", "Vaccination needed soon")
                    : `${t("次回", "Next")}: ${v.date}`}
                </div>
              </div>
            );
          })}
        </div>
        <div className="flex gap-2">
          <button
            onClick={onBook}
            className="flex items-center justify-center gap-1.5 active:scale-95 transition-transform"
            style={{
              flex: 1,
              height: 42,
              background: "#6BAF92",
              color: "#FFFFFF",
              borderRadius: 12,
              fontSize: 12,
              fontFamily: "var(--font-heading)", fontWeight: 600,
              boxShadow: "0 4px 10px rgba(107,175,146,0.3)",
            }}
          >
            <Calendar size={13} />
            {t("予約する", "Book")}
          </button>
          <button
            onClick={onReport}
            className="flex items-center justify-center gap-1.5 active:scale-95 transition-transform"
            style={{
              flex: 1,
              height: 42,
              background: "#F0F9F4",
              color: "#6BAF92",
              border: "1px solid #6BAF92",
              borderRadius: 12,
              fontSize: 12,
              fontFamily: "var(--font-heading)", fontWeight: 600,
            }}
          >
            <FileHeart size={13} />
            {t("全記録", "Full Report")} →
          </button>
        </div>
      </div>
    </div>
  );
}

function FollowupChips({
  t,
  onReport,
  onClinic,
  onAsk,
}: {
  t: (jp: string, en: string) => string;
  onReport: () => void;
  onClinic: () => void;
  onAsk: () => void;
}) {
  const chips = [
    { jp: " 詳細レポート", en: " Full Report", color: "#7B68C8", bg: "#F0ECFF", onClick: onReport },
    { jp: " クリニック", en: " Find Clinic", color: "#5B9BD5", bg: "#E8F2FF", onClick: onClinic },
    { jp: " 質問する", en: " Ask Question", color: "#E8829A", bg: "#FFF0F5", onClick: onAsk },
  ];
  return (
    <div className="flex flex-wrap gap-1.5">
      {chips.map((c, i) => (
        <button
          key={i}
          onClick={c.onClick}
          className="active:scale-95 transition-transform"
          style={{
            background: c.bg,
            color: c.color,
            fontSize: 11,
            fontFamily: "var(--font-heading)", fontWeight: 600,
            padding: "6px 12px",
            borderRadius: 16,
            border: `1px solid ${c.color}40`,
          }}
        >
          {t(c.jp, c.en)}
        </button>
      ))}
    </div>
  );
}

function HealthCard({ t }: { t: (jp: string, en: string) => string }) {
  const metrics = [
    { jp: "体温", en: "Temp", value: "38.5°C", pct: 80, color: "#D4714E", bg: "#FFF0EC", Icon: Thermometer },
    { jp: "運動", en: "Activity", value: "2,340歩", pct: 90, color: "#5B9BD5", bg: "#E8F2FF", Icon: Activity },
    { jp: "睡眠", en: "Sleep", value: "7.5h", pct: 75, color: "#7B68C8", bg: "#F0ECFF", Icon: Moon },
    { jp: "食事", en: "Diet", value: t("良好", "Good"), pct: 85, color: "#D4A843", bg: "#FFF8DC", Icon: UtensilsCrossed },
  ];

  const points = [22, 18, 20, 14, 16, 10, 8];
  const path = points.map((y, i) => `${i === 0 ? "M" : "L"} ${i * 10} ${y}`).join(" ");

  return (
    <div
      className="w-full"
      style={{
        background: "#FFFFFF",
        borderRadius: 20,
        boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
        border: "1px solid #F0ECE8",
        overflow: "hidden",
      }}
    >
      <div style={{ height: 6, background: "linear-gradient(90deg, #E8829A, #7B68C8, #6BAF92)" }} />
      <div className="flex items-center justify-between px-4 pt-3 pb-2">
        <div className="flex items-center gap-1.5">
          <Activity size={16} color="#7B68C8" strokeWidth={2.5} />
          <span style={{ fontSize: 11, color: "#8A8A8A", fontFamily: "var(--font-heading)", fontWeight: 600, letterSpacing: "0.08em" }}>
            {t("健康スコア", "HEALTH SCORE")}
          </span>
        </div>
        <span
          style={{
            background: "#E8F5EE",
            border: "1px solid #B8D4C0",
            color: "#6BAF92",
            fontSize: 11,
            fontFamily: "var(--font-heading)", fontWeight: 600,
            padding: "3px 10px",
            borderRadius: 20,
          }}
        >
          ✓ {t("良好", "Good")}
        </span>
      </div>
      <div className="flex items-end justify-between px-4 pb-3">
        <div>
          <div style={{ fontSize: 42, fontFamily: "var(--font-heading)", fontWeight: 600, color: "#2C2C2C", lineHeight: 1, letterSpacing: "-0.02em" }}>
            87
            <span style={{ fontSize: 18, color: "#8A8A8A", fontWeight: 600 }}>/100</span>
          </div>
          <div style={{ fontSize: 12, color: "#6BAF92", marginTop: 2 }}>
            {t("全体的に健康です", "Overall healthy")}
          </div>
        </div>
        <svg width="60" height="30" viewBox="0 -2 65 30" fill="none">
          <path d={path} stroke="#6BAF92" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="60" cy="8" r="2.5" fill="#6BAF92" />
        </svg>
      </div>
      <div style={{ height: 1, background: "#F5F0EC" }} />
      <div className="grid grid-cols-2 gap-2 p-3">
        {metrics.map((m, i) => {
          const Icon = m.Icon;
          return (
            <div
              key={i}
              style={{
                background: m.bg,
                borderRadius: 12,
                padding: 10,
                height: 70,
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
              }}
            >
              <div className="flex items-center gap-1.5">
                <Icon size={14} color={m.color} strokeWidth={2.5} />
                <span style={{ fontSize: 10, color: "#6A6A6A", fontWeight: 600 }}>{t(m.jp, m.en)}</span>
              </div>
              <div>
                <div style={{ fontSize: 14, fontFamily: "var(--font-heading)", fontWeight: 600, color: "#2C2C2C" }}>{m.value}</div>
                <div
                  className="relative w-full overflow-hidden"
                  style={{ height: 4, borderRadius: 2, background: "rgba(0,0,0,0.08)", marginTop: 4 }}
                >
                  <div style={{ width: `${m.pct}%`, height: "100%", background: m.color, borderRadius: 2 }} />
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <Link
        to="/report"
        className="flex items-center justify-center gap-1.5 w-full transition-opacity active:opacity-90"
        style={{
          background: "var(--color-primary)",
          color: "#FFFFFF",
          height: 40,
          fontSize: 13,
          fontFamily: "var(--font-heading)", fontWeight: 600,
          borderRadius: "0 0 20px 20px",
        }}
      >
        <FileHeart size={14} />
        {t("フルレポートを見る", "View Full Report")} →
      </Link>
    </div>
  );
}
