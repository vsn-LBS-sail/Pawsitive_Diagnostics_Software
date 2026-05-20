import { Link } from "@tanstack/react-router";
import { Bell, ArrowLeft } from "lucide-react";
import { PawLogo } from "@/components/PawLogo";
import { motion } from "framer-motion";
import { useState, useEffect, type ReactNode } from "react";
import { T, useT } from "@/context/LanguageContext";
import SideDrawer, { HamburgerButton } from "@/components/SideDrawer";
import BottomNav from "@/components/BottomNav";

export function TopBar({
  titleJp,
  titleEn,
  onMenuClick,
  menuOpen = false,
  showBack = false,
  backTo = "/home",
}: {
  titleJp?: string;
  titleEn?: string;
  onMenuClick?: () => void;
  menuOpen?: boolean;
  showBack?: boolean;
  backTo?: string;
}) {
  const [sosOpen, setSosOpen] = useState(false);
  const t = useT();
  const showTitle = Boolean(titleJp || titleEn);
  return (
    <>
      <header className="sticky top-0 z-40" style={{ background: "var(--bg-topbar)" }}>
        <div className="flex items-center justify-between" style={{ padding: "0 16px", height: 60, gap: 10 }}>
          <div className="flex items-center" style={{ gap: 8 }}>
            {onMenuClick && <HamburgerButton isOpen={menuOpen} onClick={onMenuClick} />}
            {showBack && (
              <Link
                to={backTo}
                aria-label="Back"
                className="flex items-center justify-center"
                style={{ width: 36, height: 36, borderRadius: "50%", color: "#fff" }}
              >
                <ArrowLeft size={22} strokeWidth={2} />
              </Link>
            )}
            <Link
              to="/settings"
              className="flex items-center justify-center"
              style={{ height: 42, background: "transparent" }}
              aria-label="Profile"
            >
              <PawLogo size={28} color="#FFFFFF" />
            </Link>
          </div>
          {showTitle ? (
            <div className="text-sm font-bold truncate flex-1 text-center" style={{ color: "#fff", letterSpacing: "0.02em" }}>
              {t(titleJp ?? "", titleEn ?? "")}
            </div>
          ) : (
            <div className="flex-1" />
          )}
          <div className="flex items-center" style={{ gap: 0 }}>
            <button
              className="flex items-center justify-center"
              style={{ width: 36, height: 36, margin: "0 4px 0 8px", color: "#fff" }}
              aria-label={t("通知", "Notifications")}
            >
              <Bell size={22} strokeWidth={1.75} />
            </button>
            <button
              onClick={() => setSosOpen(true)}
              className="pulse-red font-bold flex items-center"
              style={{
                background: "#E53935",
                color: "#fff",
                borderRadius: 20,
                padding: "8px 14px",
                fontSize: 13,
                boxShadow: "0 4px 12px rgba(229,57,53,0.4)",
              }}
            >
              SOS
            </button>
          </div>
        </div>
      </header>
      {sosOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center p-4" onClick={() => setSosOpen(false)}>
          <motion.div
            initial={{ y: 100, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
            className="bg-card rounded-2xl p-6 w-full max-w-sm shadow-card"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold text-destructive"> <T jp="緊急" en="Emergency"/></h3>
            <p className="text-sm text-muted-foreground mt-1">{t("最寄りの24時間獣医に連絡します", "Contact the nearest 24h vet")}</p>
            <div className="mt-4 space-y-2">
              <button className="w-full bg-destructive text-destructive-foreground rounded-xl py-3 font-bold"> {t("今すぐ電話", "Call Now")}</button>
              <button className="w-full bg-muted rounded-xl py-3 font-medium"> {t("迷子モードを起動", "Activate Lost Mode")}</button>
              <button onClick={() => setSosOpen(false)} className="w-full text-sm text-muted-foreground py-2">{t("キャンセル", "Cancel")}</button>
            </div>
          </motion.div>
        </div>
      )}
    </>
  );
}

export default function AppShell({
  children,
  titleJp,
  titleEn,
  hideTopBar = false,
  noPadding = false,
  fullHeight = false,
  hideBottomNav = false,
  renderTopBar,
}: {
  children: ReactNode;
  titleJp?: string;
  titleEn?: string;
  hideTopBar?: boolean;
  noPadding?: boolean;
  fullHeight?: boolean;
  hideBottomNav?: boolean;
  renderTopBar?: (ctx: { menuOpen: boolean; onMenuClick: () => void }) => ReactNode;
}) {
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (localStorage.getItem("wancare-theme") === "dark") document.documentElement.classList.add("dark");
  }, []);

  // Swipe-from-left to open
  useEffect(() => {
    let startX = 0;
    let tracking = false;
    const onStart = (e: TouchEvent) => {
      const x = e.touches[0]?.clientX ?? 0;
      if (!menuOpen && x < 20) { tracking = true; startX = x; }
    };
    const onMove = (e: TouchEvent) => {
      if (!tracking) return;
      const dx = (e.touches[0]?.clientX ?? 0) - startX;
      if (dx > 60) { setMenuOpen(true); tracking = false; }
    };
    const onEnd = () => { tracking = false; };
    window.addEventListener("touchstart", onStart, { passive: true });
    window.addEventListener("touchmove", onMove, { passive: true });
    window.addEventListener("touchend", onEnd);
    return () => {
      window.removeEventListener("touchstart", onStart);
      window.removeEventListener("touchmove", onMove);
      window.removeEventListener("touchend", onEnd);
    };
  }, [menuOpen]);

  const onMenuClick = () => setMenuOpen((o) => !o);

  return (
    <div
      style={{
        background: "var(--bg-outside)",
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-start",
      }}
    >
      <div
        style={{
          position: "relative",
          overflow: "hidden",
          width: "100%",
          maxWidth: 430,
          height: "100dvh",
          background: "var(--bg-page)",
          boxShadow: "0 0 40px rgba(0,0,0,0.15)",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {renderTopBar
          ? renderTopBar({ menuOpen, onMenuClick })
          : !hideTopBar && (
              <TopBar
                titleJp={titleJp}
                titleEn={titleEn}
                onMenuClick={onMenuClick}
                menuOpen={menuOpen}
              />
            )}
        <main
          className={noPadding ? "" : "px-4 py-4"}
          style={
            fullHeight
              ? {
                  flex: 1,
                  minHeight: 0,
                  overflow: "hidden",
                  display: "flex",
                  flexDirection: "column",
                  paddingBottom: hideBottomNav ? 0 : 64,
                }
              : {
                  flex: 1,
                  minHeight: 0,
                  overflowY: "auto",
                  overflowX: "hidden",
                  WebkitOverflowScrolling: "touch",
                  paddingBottom: hideBottomNav ? undefined : 80,
                }
          }
        >
          {children}
        </main>
        <SideDrawer isOpen={menuOpen} onClose={() => setMenuOpen(false)} />
        {!hideBottomNav && <BottomNav />}
      </div>
    </div>
  );
}
