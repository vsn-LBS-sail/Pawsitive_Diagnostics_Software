import { useLocation, useNavigate } from "@tanstack/react-router";
import { Home, MapPin, Bot, HeartPulse, Users, type LucideIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { useT } from "@/context/LanguageContext";

type Tab = {
  Icon: LucideIcon;
  labelEn: string;
  labelJp: string;
  route: string;
  isCenter?: boolean;
};

const TABS: Tab[] = [
  { Icon: Home, labelEn: "Home", labelJp: "ホーム", route: "/home" },
  { Icon: MapPin, labelEn: "Map", labelJp: "地図", route: "/map" },
  { Icon: Bot, labelEn: "AI", labelJp: "AI", route: "/ai", isCenter: true },
  { Icon: HeartPulse, labelEn: "Clinics", labelJp: "クリニック", route: "/clinics" },
  { Icon: Users, labelEn: "Community", labelJp: "コミュニティ", route: "/community" },
];

const ACCENT = "#FFFFFF";
const INACTIVE = "rgba(255,255,255,0.6)";
const AI_COLOR = "#447F98";

export default function BottomNav() {
  const loc = useLocation();
  const navigate = useNavigate();
  const t = useT();
  const [bouncing, setBouncing] = useState<string | null>(null);

  const isActive = (route: string) =>
    loc.pathname === route || loc.pathname.startsWith(route + "/");

  const handleTap = (route: string) => {
    setBouncing(route);
    // TODO: Add haptic feedback on native
    setTimeout(() => setBouncing(null), 220);
    if (loc.pathname !== route) navigate({ to: route });
  };

  // Label: prefer English (shorter); use Japanese when in JP mode
  const lbl = (tab: Tab) => t(tab.labelJp, tab.labelEn);
  const isJp = t("a", "b") === "a";

  return (
    <nav
      aria-label="Primary"
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 0,
        height: 64,
        background: "var(--bg-bottomnav)",
        borderTop: "1px solid var(--border-subtle)",
        boxShadow: "var(--shadow-nav)",
        paddingBottom: "max(8px, env(safe-area-inset-bottom))",
        zIndex: 100,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-around",
      }}
    >
      {TABS.map((tab) => {
        const active = isActive(tab.route);
        const { Icon } = tab;
        const bouncingNow = bouncing === tab.route;

        if (tab.isCenter) {
          return (
            <button
              key={tab.route}
              onClick={() => handleTap(tab.route)}
              className="flex flex-col items-center justify-end"
              style={{ flex: 1, height: "100%", cursor: "pointer", gap: 4 }}
              aria-label={lbl(tab)}
              aria-current={active ? "page" : undefined}
            >
              <div
                className="ai-center-pulse"
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: "50%",
                  background: "#B9D8E1",
                  border: "3px solid #D6E9F3",
                  boxShadow: active
                    ? "0 6px 20px rgba(185,216,225,0.5)"
                    : "0 4px 16px rgba(185,216,225,0.4)",
                  marginTop: -20,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transform: `scale(${active ? 1.05 : 1}) ${bouncingNow ? "scale(1.15)" : ""}`,
                  transition: "transform 0.2s ease, box-shadow 0.2s ease",
                  color: "#447F98",
                }}
              >
                <Bot size={24} strokeWidth={2} />
              </div>
              <span
                style={{
                  fontSize: isJp ? 9 : 10,
                  color: AI_COLOR,
                  fontWeight: active ? 700 : 500,
                  lineHeight: 1,
                  marginBottom: 4,
                }}
              >
                {lbl(tab)}
              </span>
            </button>
          );
        }

        return (
          <button
            key={tab.route}
            onClick={() => handleTap(tab.route)}
            className="flex flex-col items-center justify-center relative"
            style={{ flex: 1, height: "100%", cursor: "pointer", gap: 3 }}
            aria-label={lbl(tab)}
            aria-current={active ? "page" : undefined}
          >
            <span
              style={{
                position: "absolute",
                top: 6,
                width: 4,
                height: 4,
                borderRadius: "50%",
                background: ACCENT,
                transform: active ? "scale(1)" : "scale(0)",
                transition: "transform 0.2s ease",
              }}
            />
            <Icon
              size={22}
              strokeWidth={1.8}
              style={{
                color: active ? ACCENT : INACTIVE,
                transform: bouncingNow ? "scale(1.2)" : "scale(1)",
                transition: "transform 0.2s ease, color 0.2s ease",
              }}
            />
            <span
              style={{
                fontSize: isJp ? 9 : 10,
                color: active ? ACCENT : INACTIVE,
                fontWeight: 500,
                lineHeight: 1,
                transition: "color 0.2s ease",
              }}
            >
              {lbl(tab)}
            </span>
          </button>
        );
      })}

      <style>{`
        @keyframes ai-center-pulse {
          0%, 100% { box-shadow: 0 4px 16px rgba(123,104,200,0.4); }
          50% { box-shadow: 0 4px 22px rgba(123,104,200,0.55); }
        }
        .ai-center-pulse {
          animation: ai-center-pulse 3s ease-in-out infinite;
        }
      `}</style>
    </nav>
  );
}
