import { useEffect } from "react";
import { useLocation, useNavigate } from "@tanstack/react-router";
import { Home, MapPin, Bot, HeartPulse, Users, FileHeart, BookOpen, Settings, ChevronRight } from "lucide-react";
import { useT } from "@/context/LanguageContext";
import { usePet, displayName } from "@/context/PetContext";
import logoUrl from "@/assets/logo.png";

type Item = {
  route: string;
  Icon: typeof Home;
  iconBg: string;
  iconColor: string;
  labelJp: string;
  labelEn: string;
  subJp: string;
  subEn: string;
};

const MAIN_ITEMS: Item[] = [
  { route: "/home", Icon: Home, iconBg: "#FFE4EC", iconColor: "#E8829A", labelJp: "ホーム", labelEn: "Home", subJp: "ダッシュボード", subEn: "Dashboard" },
  { route: "/map", Icon: MapPin, iconBg: "#E8F2FF", iconColor: "#5B9BD5", labelJp: "地図", labelEn: "Map", subJp: "位置トラッカー", subEn: "Location Tracker" },
  { route: "/ai", Icon: Bot, iconBg: "#F0ECFF", iconColor: "#7B68C8", labelJp: "AIアシスタント", labelEn: "AI Assistant", subJp: "AIチャット", subEn: "Pawsitive Diagnostics AI" },
  { route: "/clinics", Icon: HeartPulse, iconBg: "#D6EEFF", iconColor: "#5B9BD5", labelJp: "クリニック", labelEn: "Clinics", subJp: "獣医を探す", subEn: "Find Vets" },
  { route: "/community", Icon: Users, iconBg: "#FFF3CC", iconColor: "#D4A843", labelJp: "コミュニティ", labelEn: "Community", subJp: "犬の家族", subEn: "Dog Families" },
];

const SECONDARY_ITEMS: Item[] = [
  { route: "/report", Icon: FileHeart, iconBg: "#E8F5EE", iconColor: "#6BAF92", labelJp: "健康レポート", labelEn: "Health Report", subJp: "詳細レポート", subEn: "Detailed Report" },
  { route: "/breeds", Icon: BookOpen, iconBg: "#FFF0F5", iconColor: "#E8829A", labelJp: "犬種図鑑", labelEn: "Breed Guide", subJp: "犬種百科", subEn: "Encyclopedia" },
];

const SETTINGS_ITEM: Item = { route: "/settings", Icon: Settings, iconBg: "#F5F5F5", iconColor: "#8A8A8A", labelJp: "設定", labelEn: "Settings", subJp: "設定", subEn: "Preferences" };

function greeting(t: (jp: string, en: string) => string) {
  const h = new Date().getHours();
  if (h < 11) return t("おはようございます！", "Good morning!");
  if (h < 17) return t("こんにちは！", "Good afternoon!");
  if (h < 21) return t("こんばんは！", "Good evening!");
  return t("おやすみなさい！", "Good night!");
}

export default function SideDrawer({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const loc = useLocation();
  const navigate = useNavigate();
  const t = useT();
  const { pet } = usePet();

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  const isActive = (route: string) => loc.pathname === route || loc.pathname.startsWith(route + "/");

  const handleNav = (route: string) => {
    onClose();
    setTimeout(() => navigate({ to: route }), 150);
  };

  const BOTTOM_NAV_ROUTES = new Set(["/home", "/map", "/ai", "/clinics", "/community"]);

  const renderItem = (it: Item, idx: number) => {
    const active = isActive(it.route);
    const inBottomNav = BOTTOM_NAV_ROUTES.has(it.route);
    const { Icon } = it;
    return (
      <button
        key={it.route}
        onClick={() => handleNav(it.route)}
        className="w-full flex items-center text-left relative"
        style={{
          height: 52,
          padding: "0 20px",
          gap: 14,
          background: active ? "linear-gradient(90deg, var(--bg-card-sakura), transparent)" : "transparent",
          borderLeft: active ? "3px solid var(--accent-sakura)" : "3px solid transparent",
          opacity: isOpen ? 1 : 0,
          transform: isOpen ? "translateX(0)" : "translateX(-20px)",
          transition: `opacity 0.3s ease ${idx * 30}ms, transform 0.3s ease ${idx * 30}ms, background 0.15s`,
        }}
      >
        <div
          className="flex items-center justify-center shrink-0"
          style={{ width: 36, height: 36, borderRadius: 10, background: active ? "#FFE4EC" : it.iconBg }}
        >
          <Icon size={18} strokeWidth={2} style={{ color: it.iconColor }} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center" style={{ gap: 6 }}>
            <div style={{ fontSize: 15, fontWeight: 600, color: active ? "var(--accent-sakura)" : "var(--text-primary)", lineHeight: 1.2 }}>
              {t(it.labelJp, it.labelEn)}
            </div>
            {inBottomNav && (
              <span
                title={t("下のナビからアクセス可能", "Quick access from bottom nav")}
                style={{
                  fontSize: 9,
                  color: "var(--text-muted-soft)",
                  background: "var(--border-subtle)",
                  borderRadius: 6,
                  padding: "1px 5px",
                  lineHeight: 1.2,
                }}
              >
                ↓
              </span>
            )}
          </div>
          <div style={{ fontSize: 11, color: "var(--text-secondary)", marginTop: 2 }}>
            {t(it.subJp, it.subEn)}
          </div>
        </div>
        {active ? (
          <span className="pulse" style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--accent-sakura)" }} />
        ) : (
          <ChevronRight size={14} style={{ color: "var(--text-placeholder)" }} />
        )}
      </button>
    );
  };

  const SectionLabel = ({ jp, en }: { jp: string; en: string }) => (
    <div
      style={{
        padding: "4px 20px 6px",
        fontSize: 10,
        fontWeight: 600,
        letterSpacing: "0.08em",
        color: "var(--text-muted-soft)",
        textTransform: "uppercase",
      }}
    >
      {t(jp, en)}
    </div>
  );

  const Divider = () => <div style={{ height: 1, background: "var(--border-subtle)", margin: "8px 20px" }} />;

  const name = displayName(pet, t("ワンちゃん", "My Dog"));

  return (
    <>
      {/* Overlay */}
      <div
        onClick={onClose}
        aria-hidden={!isOpen}
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          background: "rgba(0,0,0,0.4)",
          backdropFilter: "blur(4px)",
          WebkitBackdropFilter: "blur(4px)",
          opacity: isOpen ? 1 : 0,
          pointerEvents: isOpen ? "auto" : "none",
          transition: "opacity 0.3s ease",
          zIndex: 998,
        }}
      />
      {/* Drawer */}
      <aside
        role="dialog"
        aria-label="Navigation"
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          bottom: 0,
          width: "min(280px, 80%)",
          background: "var(--bg-drawer)",
          boxShadow: "8px 0 32px rgba(0,0,0,0.25)",
          transform: isOpen ? "translateX(0)" : "translateX(-100%)",
          transition: isOpen
            ? "transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)"
            : "transform 0.25s ease",
          zIndex: 999,
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Top */}
        <div
          className="relative overflow-hidden"
          style={{
            height: 180,
            background: "var(--bg-drawer-hero)",
            padding: "20px",
          }}
        >
          {/* decorative petals */}
          <span style={{ position: "absolute", top: 18, right: 60, width: 10, height: 14, borderRadius: "50% 50% 50% 50% / 60% 60% 40% 40%", background: "#FFB7C5", opacity: 0.3, transform: "rotate(20deg)" }} />
          <span style={{ position: "absolute", top: 70, right: 30, width: 8, height: 12, borderRadius: "50%", background: "#FFB7C5", opacity: 0.3, transform: "rotate(-30deg)" }} />
          <span style={{ position: "absolute", top: 120, left: 50, width: 9, height: 13, borderRadius: "50%", background: "#FFB7C5", opacity: 0.3, transform: "rotate(45deg)" }} />
          <span style={{ position: "absolute", top: -20, right: -20, width: 100, height: 100, borderRadius: "50%", background: "#FFD4E8", opacity: 0.2, filter: "blur(20px)" }} />

          <div className="flex items-center gap-3 relative">
            <div
              className="flex items-center justify-center overflow-hidden"
              style={{
                width: 48, height: 48, borderRadius: "50%",
                background: "#FAF8F5", border: "2px solid #E8829A",
                boxShadow: "0 4px 16px rgba(232,130,154,0.2)",
              }}
            >
              <img src={logoUrl} alt="Pawsitive Diagnostics logo" style={{ width: 32, height: 32, objectFit: "contain" }} />
            </div>
            <div>
              <div style={{ fontSize: 20, fontFamily: "var(--font-heading)", fontWeight: 600, color: "var(--text-primary)", lineHeight: 1 }}>Pawsitive Diagnostics</div>
              <div style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: 4 }}>ポジティブ</div>
            </div>
          </div>

          <div style={{ position: "absolute", bottom: 16, left: 20, right: 20 }}>
            <div className="flex items-center gap-2">
              <div
                className="flex items-center justify-center"
                style={{ width: 32, height: 32, borderRadius: "50%", background: "#fff", border: "1.5px solid #E8829A", fontSize: 16 }}
              >
                
              </div>
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, color: "#E8829A" }}>
                  {t(`${name}のせかい`, `${name}'s World`)} 
                </div>
                <div style={{ fontSize: 11, color: "var(--text-secondary)", marginTop: 1 }}>{greeting(t)}</div>
              </div>
            </div>
          </div>
        </div>

        <div style={{ height: 1, background: "var(--border-subtle)" }} />

        {/* Nav items (scrollable) */}
        <div className="flex-1 overflow-y-auto" style={{ padding: "12px 0" }}>
          <SectionLabel jp="メインメニュー" en="Main" />
          {MAIN_ITEMS.map((it, i) => renderItem(it, i))}
          <Divider />
          <SectionLabel jp="その他" en="More" />
          {SECONDARY_ITEMS.map((it, i) => renderItem(it, MAIN_ITEMS.length + i))}
          {renderItem(SETTINGS_ITEM, MAIN_ITEMS.length + SECONDARY_ITEMS.length)}
        </div>

        {/* Bottom */}
        <div style={{ marginTop: "auto" }}>
          <div style={{ margin: 12, padding: 12, background: "var(--bg-elevated)", borderRadius: 16 }}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div
                  className="flex items-center justify-center"
                  style={{ width: 28, height: 28, borderRadius: "50%", background: "var(--bg-card)", border: "1.5px solid var(--accent-sakura)", fontSize: 14 }}
                >
                  
                </div>
                <div>
                  <div style={{ fontSize: 13, fontFamily: "var(--font-heading)", fontWeight: 600, color: "var(--text-primary)", lineHeight: 1 }}>{name}</div>
                  <div className="flex items-center gap-1" style={{ marginTop: 3 }}>
                    <span className="pulse" style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--accent-matcha)" }} />
                    <span style={{ fontSize: 11, color: "var(--accent-matcha)" }}>{t("首輪接続中", "Collar Connected")}</span>
                  </div>
                </div>
              </div>
              <div style={{ fontSize: 11, color: "var(--accent-sakura)", fontWeight: 600 }}>87/100 ✦</div>
            </div>
          </div>

          <button
            className="pulse-red"
            style={{
              display: "block",
              margin: "0 12px 12px",
              width: "calc(100% - 24px)",
              height: 44,
              background: "#E53935",
              color: "#fff",
              fontFamily: "var(--font-heading)", fontWeight: 600,
              borderRadius: 12,
              boxShadow: "0 4px 12px rgba(229,57,53,0.3)",
              fontSize: 14,
            }}
          >
             SOS {t("緊急", "Emergency")}
          </button>

          <div style={{ textAlign: "center", fontSize: 9, color: "var(--text-placeholder)", paddingBottom: 8 }}>
            Pawsitive Diagnostics v1.0 · ポジティブ
          </div>
        </div>
      </aside>
    </>
  );
}

export function HamburgerButton({ isOpen, onClick }: { isOpen: boolean; onClick: () => void }) {
  const lineBase: React.CSSProperties = {
    width: 20, height: 2, background: "#fff", borderRadius: 2,
    transition: "transform 0.3s ease, opacity 0.3s ease",
    transformOrigin: "center",
  };
  return (
    <button
      onClick={onClick}
      aria-label="Open menu"
      aria-expanded={isOpen}
      className="flex items-center justify-center shrink-0"
      style={{
        width: 40,
        height: 40,
        background: "transparent",
        border: "none",
      }}
    >
      <span className="flex flex-col" style={{ gap: 4 }}>
        <span style={{ ...lineBase, transform: isOpen ? "rotate(45deg) translate(4px, 4px)" : "none" }} />
        <span style={{ ...lineBase, opacity: isOpen ? 0 : 1, transform: isOpen ? "scaleX(0)" : "none" }} />
        <span style={{ ...lineBase, transform: isOpen ? "rotate(-45deg) translate(4px, -4px)" : "none" }} />
      </span>
    </button>
  );
}
