import { createFileRoute, useNavigate } from "@tanstack/react-router";
import AppShell from "@/components/AppShell";
import DogAvatar from "@/components/DogAvatar";
import { useState } from "react";
import {
  Navigation, AlertTriangle, Phone, Shield, History, Crosshair,
  Plus, Minus, Satellite, ChevronRight, Stethoscope,
} from "lucide-react";
import { useT } from "@/context/LanguageContext";
import { usePet, displayName } from "@/context/PetContext";
import { BREED_KEY_BY_JP, type BreedKey } from "@/components/DogAvatar";

export const Route = createFileRoute("/map")({ component: MapScreen });

function MapScreen() {
  const t = useT();
  const navigate = useNavigate();
  const { pet } = usePet();
  const dogName = displayName(pet, t("ワンちゃん", "My Dog"));
  const breedKey: BreedKey = (BREED_KEY_BY_JP[pet.breedJp] ?? (pet.breed as BreedKey)) || "shiba";

  const [lost, setLost] = useState(false);
  const [safeZone, setSafeZone] = useState(true);
  const [radius, setRadius] = useState<100 | 200 | 500 | 1000>(200);
  const [mapType, setMapType] = useState<"map" | "satellite">("map");

  const openDirections = () => {
    const addr = encodeURIComponent("1-2-3 Jinnan, Shibuya, Tokyo");
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${addr}`, "_blank");
  };

  return (
    <AppShell titleJp="位置情報" titleEn="Location" noPadding>
      <style>{`
        @keyframes mapPulse { 0%,100% { transform: scale(1); opacity: 1 } 50% { transform: scale(1.3); opacity: .6 } }
        @keyframes safeRotate { to { transform: translate(-50%,-50%) rotate(360deg) } }
        @keyframes greenPulse { 0%,100% { transform: scale(1); opacity: 1 } 50% { transform: scale(1.6); opacity: .4 } }
        @keyframes borderPulse { 0%,100% { box-shadow: 0 0 0 0 rgba(229,57,53,.5) } 50% { box-shadow: 0 0 0 8px rgba(229,57,53,0) } }
        .map-pulse-ring { animation: mapPulse 2s ease-in-out infinite; }
        .safe-rotate { animation: safeRotate 60s linear infinite; }
        .green-pulse::before { content:""; position:absolute; inset:0; border-radius:9999px; background:#6BAF92; animation: greenPulse 1.6s ease-in-out infinite; }
      `}</style>

      {/* LIVE STATUS BAR */}
      <div style={{ margin: "8px 16px", padding: "10px 16px", background: "#FFFFFF", borderRadius: 16, boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="relative inline-block green-pulse" style={{ width: 8, height: 8, borderRadius: "50%", background: "#6BAF92" }} />
            <span style={{ fontSize: 13, fontFamily: "var(--font-heading)", fontWeight: 600, color: "#2C2C2C" }}>{t("ライブ追跡中", "Live Tracking")}</span>
          </div>
          <div className="flex items-center gap-1.5" style={{ color: "#6BAF92" }}>
            <Satellite size={14} />
            <span style={{ fontSize: 12, fontWeight: 600 }}>GPS ✓</span>
          </div>
        </div>
        <div style={{ fontSize: 11, color: "#8A8A8A", marginTop: 2 }}>
          {t("最終更新: たった今", "Last updated: Just now")}
        </div>
      </div>

      {/* MAP CARD */}
      <div style={{ margin: "12px 16px", borderRadius: 24, overflow: "hidden", height: 320, position: "relative", boxShadow: "0 8px 32px rgba(0,0,0,0.1)", background: "#E8EEF4" }}>
        {/* Base watercolor map */}
        <div className="absolute inset-0" style={{
          background: `
            linear-gradient(135deg, rgba(200,220,234,0.6) 0%, transparent 30%),
            linear-gradient(135deg, transparent 60%, rgba(200,220,234,0.5) 60%, rgba(200,220,234,0.5) 68%, transparent 68%),
            repeating-linear-gradient(90deg, transparent 0 58px, rgba(255,255,255,0.85) 58px 60px, transparent 60px 140px, rgba(255,255,255,0.9) 140px 144px),
            repeating-linear-gradient(0deg, transparent 0 50px, rgba(255,255,255,0.8) 50px 52px, transparent 52px 110px, rgba(255,255,255,0.9) 110px 114px),
            repeating-linear-gradient(45deg, transparent 0 100px, rgba(255,255,255,0.4) 100px 102px),
            #E8EEF4
          `,
        }} />
        {/* City blocks */}
        <div className="absolute" style={{ left: 20, top: 30, width: 60, height: 40, background: "#EEF3F8", borderRadius: 3 }} />
        <div className="absolute" style={{ left: 90, top: 25, width: 80, height: 50, background: "#E8EDF2", borderRadius: 3 }} />
        <div className="absolute" style={{ left: 200, top: 40, width: 70, height: 60, background: "#EEF3F8", borderRadius: 3 }} />
        <div className="absolute" style={{ left: 30, top: 120, width: 90, height: 50, background: "#E8EDF2", borderRadius: 3 }} />
        <div className="absolute" style={{ left: 180, top: 180, width: 100, height: 60, background: "#EEF3F8", borderRadius: 3 }} />
        <div className="absolute" style={{ left: 50, top: 240, width: 70, height: 50, background: "#E8EDF2", borderRadius: 3 }} />
        {/* Parks */}
        <div className="absolute" style={{ left: 140, top: 90, width: 50, height: 50, background: "#D4E8D4", borderRadius: 12 }} />
        <div className="absolute" style={{ right: 30, top: 130, width: 60, height: 40, background: "#D4E8D4", borderRadius: 12 }} />
        <div className="absolute" style={{ left: 25, bottom: 30, width: 45, height: 45, background: "#D4E8D4", borderRadius: 14 }} />
        {/* Map labels */}
        <span className="absolute" style={{ left: 30, top: 80, fontSize: 9, color: "#8A9AAA", opacity: 0.4 }}>渋谷区</span>
        <span className="absolute" style={{ left: 150, top: 110, fontSize: 9, color: "#8A9AAA", opacity: 0.4 }}>公園</span>
        <span className="absolute" style={{ right: 40, top: 200, fontSize: 9, color: "#8A9AAA", opacity: 0.4 }}>駅</span>
        <span className="absolute" style={{ left: 200, bottom: 60, fontSize: 9, color: "#8A9AAA", opacity: 0.4 }}>神南</span>

        {/* Collar GPS badge top-left */}
        <div className="absolute" style={{ top: 12, left: 12, background: "#FFFFFF", padding: "5px 10px", borderRadius: 12, fontSize: 11, color: "#6BAF92", fontFamily: "var(--font-heading)", fontWeight: 600, boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}>
           {t("カラーGPS", "Collar GPS")}
        </div>

        {/* Map type toggle top-left lower */}
        <div className="absolute flex" style={{ top: 48, left: 12, background: "rgba(255,255,255,0.85)", backdropFilter: "blur(8px)", borderRadius: 14, padding: 3, fontSize: 11, fontWeight: 600 }}>
          {(["map", "satellite"] as const).map(m => (
            <button key={m} onClick={() => setMapType(m)} style={{
              padding: "4px 10px", borderRadius: 12,
              background: mapType === m ? "#E8829A" : "transparent",
              color: mapType === m ? "#fff" : "#8A8A8A",
            }}>
              {m === "map" ? t("地図", "Map") : t("衛星", "Satellite")}
            </button>
          ))}
        </div>

        {/* Zoom controls top-right */}
        <div className="absolute" style={{ top: 12, right: 12, background: "rgba(255,255,255,0.9)", backdropFilter: "blur(8px)", borderRadius: 12, boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
          <button className="flex items-center justify-center" style={{ width: 36, height: 36, color: "#2C2C2C" }}><Plus size={16} /></button>
          <div style={{ height: 1, background: "#EDE8E4" }} />
          <button className="flex items-center justify-center" style={{ width: 36, height: 36, color: "#2C2C2C" }}><Minus size={16} /></button>
        </div>

        {/* My location button bottom-right */}
        <button className="absolute flex items-center justify-center" style={{ bottom: 14, right: 12, width: 40, height: 40, borderRadius: "50%", background: "rgba(255,255,255,0.9)", backdropFilter: "blur(8px)", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
          <Crosshair size={20} style={{ color: "#5B9BD5" }} />
        </button>

        {/* Safe zone circle */}
        {safeZone && (
          <div className="absolute" style={{
            left: "50%", top: "50%", width: 180, height: 180,
            transform: "translate(-50%,-50%)",
            borderRadius: "50%",
            background: "rgba(107,175,146,0.06)",
          }}>
            <div className="absolute inset-0 safe-rotate" style={{
              borderRadius: "50%",
              border: "2px dashed #6BAF92",
            }} />
            <div className="absolute" style={{ left: "50%", top: -10, transform: "translateX(-50%)", background: "#FFFFFF", border: "1px solid #6BAF92", color: "#6BAF92", fontSize: 10, fontFamily: "var(--font-heading)", fontWeight: 600, padding: "2px 8px", borderRadius: 20, whiteSpace: "nowrap" }}>
              {t("安全ゾーン", "Safe Zone")}
            </div>
          </div>
        )}

        {/* Activity trail dots */}
        {[{x:38,y:62,s:5},{x:42,y:58,s:4.5},{x:45,y:55,s:4},{x:47,y:52,s:3.5},{x:48,y:50,s:3}].map((d,i)=>(
          <div key={i} className="absolute" style={{ left: `${d.x}%`, top: `${d.y}%`, width: d.s, height: d.s, borderRadius: "50%", background: `rgba(232,130,154,${0.4-i*0.06})` }} />
        ))}

        {/* Owner marker */}
        <div className="absolute" style={{ left: "33%", top: "66%", transform: "translate(-50%,-50%)" }}>
          <div className="absolute" style={{ left: "50%", top: "50%", transform: "translate(-50%,-50%)", width: 40, height: 40, borderRadius: "50%", background: "rgba(91,155,213,0.15)", border: "1px dashed rgba(91,155,213,0.4)" }} />
          <div className="relative flex items-center justify-center" style={{ width: 16, height: 16, borderRadius: "50%", background: "#5B9BD5", border: "3px solid white", boxShadow: "0 2px 8px rgba(91,155,213,0.4)" }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#fff" }} />
          </div>
          <div className="absolute" style={{ left: "50%", top: -22, transform: "translateX(-50%)", background: "#E8F2FF", border: "1px solid #5B9BD5", color: "#5B9BD5", fontSize: 10, fontFamily: "var(--font-heading)", fontWeight: 600, padding: "2px 8px", borderRadius: 20, whiteSpace: "nowrap" }}>
            {t("あなた", "You")}
          </div>
          <div className="absolute" style={{ left: "50%", top: 18, transform: "translateX(-50%)", fontSize: 9, color: "#8A8A8A", whiteSpace: "nowrap" }}>
            {t("精度: ±5m", "±5m")}
          </div>
        </div>

        {/* Dog marker center */}
        <div className="absolute" style={{ left: "50%", top: "50%", transform: "translate(-50%,-50%)" }}>
          {/* Pulse ring */}
          <div className="absolute map-pulse-ring" style={{ left: "50%", top: "50%", transform: "translate(-50%,-50%)", width: 48, height: 48, borderRadius: "50%", background: "rgba(232,130,154,0.15)", border: "2px solid rgba(232,130,154,0.4)" }} />
          {/* Middle */}
          <div className="absolute" style={{ left: "50%", top: "50%", transform: "translate(-50%,-50%)", width: 32, height: 32, borderRadius: "50%", background: "rgba(232,130,154,0.25)", border: "2px solid #E8829A" }} />
          {/* Inner */}
          <div className="relative flex items-center justify-center" style={{ width: 20, height: 20, borderRadius: "50%", background: "var(--color-primary)", boxShadow: "0 4px 12px rgba(232,130,154,0.5)" }}>
            <span style={{ color: "#fff", fontSize: 10 }}></span>
          </div>
          {/* Pin tip */}
          <div className="absolute" style={{ left: "50%", top: 20, transform: "translateX(-50%)", width: 0, height: 0, borderLeft: "4px solid transparent", borderRight: "4px solid transparent", borderTop: "6px solid #C86882" }} />
          {/* Name tag */}
          <div className="absolute" style={{ left: "50%", top: -26, transform: "translateX(-50%)", background: "#FFFFFF", border: "1px solid #FFD0DC", color: "#E8829A", fontSize: 11, fontFamily: "var(--font-heading)", fontWeight: 600, padding: "3px 8px", borderRadius: 20, whiteSpace: "nowrap", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
            {dogName} 
          </div>
        </div>

        {/* Attribution */}
        <div className="absolute" style={{ bottom: 4, right: 8, fontSize: 8, color: "#8A8A8A" }}>
          © OpenStreetMap / 地図データ
        </div>
      </div>

      {/* DOG INFO CARD */}
      <div style={{ margin: "0 16px 12px", background: "#FFFFFF", borderRadius: 20, boxShadow: "0 4px 16px rgba(0,0,0,0.07)", borderLeft: "4px solid #E8829A", overflow: "hidden" }}>
        <div style={{ height: 6, background: "var(--color-bg-card)" }} />
        <div style={{ padding: 14 }}>
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3 flex-1 min-w-0">
              <DogAvatar breed={breedKey} furColor={pet.avatar.furColor} collarColor={pet.avatar.collarColor} size={44} ring />
              <div className="min-w-0">
                <div style={{ fontSize: 17, fontFamily: "var(--font-heading)", fontWeight: 600, color: "#2C2C2C" }}>{dogName}</div>
                <div style={{ fontSize: 12, color: "#8A8A8A", marginTop: 1 }}>
                  {t("東京都渋谷区神南1-2-3", "1-2-3 Jinnan, Shibuya, Tokyo")}
                </div>
                <div className="flex items-center gap-1.5 mt-1">
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#6BAF92" }} />
                  <span style={{ fontSize: 12, color: "#6BAF92", fontWeight: 600 }}>{t("今移動中", "Moving now")}</span>
                </div>
              </div>
            </div>
            <span style={{ background: "#FFF0F5", border: "1px solid #FFD0DC", color: "#E8829A", fontSize: 13, fontFamily: "var(--font-heading)", fontWeight: 600, padding: "4px 12px", borderRadius: 20 }}>0.3km</span>
          </div>

          <div className="flex items-center gap-2 mt-3" style={{ fontSize: 11, color: "#8A8A8A" }}>
            <span> {t("移動中", "Moving")}</span>
            <span>·</span>
            <span> {t("渋谷区", "Shibuya")}</span>
            <span>·</span>
            <span> {t("たった今", "Just now")}</span>
            <span>·</span>
            <span> {t("4分", "4 min")}</span>
          </div>

          <button onClick={openDirections} className="w-full flex items-center justify-center gap-2 mt-3" style={{ height: 48, borderRadius: 14, background: "var(--color-primary)", color: "#fff", fontFamily: "var(--font-heading)", fontWeight: 600, fontSize: 14, boxShadow: "0 6px 16px rgba(91,155,213,0.3)" }}>
            <Navigation size={16} />
            {t("道案内", "Get Directions")}
          </button>
        </div>
      </div>

      {/* SAFE ZONE CARD */}
      <div style={{ margin: "0 16px 12px", background: "#FFFFFF", borderRadius: 20, boxShadow: "0 4px 16px rgba(0,0,0,0.07)", borderLeft: "4px solid #6BAF92", overflow: "hidden" }}>
        <div style={{ height: 6, background: "var(--color-bg-card)" }} />
        <div style={{ padding: 14 }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield size={20} style={{ color: "#6BAF92" }} />
              <span style={{ fontSize: 15, fontFamily: "var(--font-heading)", fontWeight: 600, color: "#2C2C2C" }}>{t("安全ゾーン", "Safe Zone")}</span>
            </div>
            <Toggle on={safeZone} onChange={setSafeZone} activeColor="#6BAF92" />
          </div>
          {safeZone && (
            <div className="mt-2">
              <div style={{ fontSize: 12, color: "#8A8A8A" }}>
                {t(`${radius < 1000 ? radius + "m" : "1km"} 半径で通知`, `Notify within ${radius < 1000 ? radius + "m" : "1km"} radius`)}
              </div>
              <div className="flex gap-2 mt-2">
                {([100,200,500,1000] as const).map(r => (
                  <button key={r} onClick={() => setRadius(r)} style={{
                    padding: "5px 12px", borderRadius: 20, fontSize: 11, fontWeight: 600,
                    background: radius === r ? "#6BAF92" : "#F5F5F5",
                    color: radius === r ? "#fff" : "#8A8A8A",
                  }}>{r < 1000 ? `${r}m` : "1km"}</button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* LOST MODE CARD */}
      <div style={{
        margin: "0 16px 12px",
        background: lost ? "linear-gradient(135deg, #FFF0F0, #FFE8E8)" : "#FFFFFF",
        borderRadius: 20,
        boxShadow: "0 4px 16px rgba(0,0,0,0.07)",
        border: lost ? "2px solid #E53935" : "none",
        borderLeft: `4px solid ${lost ? "#E53935" : "#C4B8B4"}`,
        animation: lost ? "borderPulse 1.6s infinite" : undefined,
        padding: 14,
      }}>
        <div className="flex items-center justify-between">
          <div className="flex items-start gap-2 flex-1">
            <AlertTriangle size={20} style={{ color: lost ? "#E53935" : "#C4B8B4", marginTop: 2 }} className={lost ? "animate-pulse" : ""} />
            <div>
              <div style={{ fontSize: 15, fontFamily: "var(--font-heading)", fontWeight: 600, color: lost ? "#E53935" : "#2C2C2C" }}>
                {lost ? ` ${t("迷子モード起動中", "Lost Mode ACTIVE")}` : t("迷子モード", "Lost Mode")}
              </div>
              <div style={{ fontSize: 12, color: lost ? "#E53935" : "#8A8A8A", marginTop: 2 }}>
                {lost ? t("緊急追跡中...", "Emergency tracking active...") : t("紛失時の緊急追跡", "Emergency tracking if lost")}
              </div>
            </div>
          </div>
          <Toggle on={lost} onChange={setLost} activeColor="#E53935" />
        </div>
        {lost && (
          <div className="mt-3 space-y-2">
            <a href="tel:+81000000000" className="w-full flex items-center justify-center gap-2" style={{ height: 44, borderRadius: 12, background: "var(--color-primary)", color: "#fff", fontFamily: "var(--font-heading)", fontWeight: 600, fontSize: 13 }}>
              <Phone size={14} /> {t("獣医に通知", "Notify Vet")}
            </a>
            <button className="w-full flex items-center justify-center gap-2" style={{ height: 44, borderRadius: 12, background: "var(--color-primary)", color: "#fff", fontFamily: "var(--font-heading)", fontWeight: 600, fontSize: 13 }}>
               {t("SOS起動", "Activate SOS")}
            </button>
          </div>
        )}
      </div>

      {/* LOCATION HISTORY */}
      <div style={{ margin: "0 16px 12px", background: "#FFFFFF", borderRadius: 20, boxShadow: "0 4px 16px rgba(0,0,0,0.07)", borderLeft: "4px solid #7B68C8", padding: 14 }}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <History size={18} style={{ color: "#7B68C8" }} />
            <span style={{ fontSize: 14, fontFamily: "var(--font-heading)", fontWeight: 600, color: "#2C2C2C" }}>{t("移動履歴", "Location History")}</span>
          </div>
          <span style={{ fontSize: 11, fontWeight: 600, color: "#7B68C8", background: "#F0ECFF", padding: "3px 10px", borderRadius: 20 }}>{t("今日", "Today")}</span>
        </div>

        {[
          { time: "14:30", jp: "代々木公園", en: "Yoyogi Park", dist: "+1.2km", color: "#D4A843" },
          { time: "12:15", jp: "渋谷駅周辺", en: "Near Shibuya Stn", dist: "+0.5km", color: "#5B9BD5" },
          { time: "09:00", jp: "自宅", en: "Home", dist: t("出発地", "Start"), color: "#6BAF92" },
        ].map((h, i) => (
          <div key={i} className="flex items-center gap-3" style={{ padding: "8px 0", borderTop: i === 0 ? "none" : "1px solid #F5F0EC" }}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: h.color, flexShrink: 0 }} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span style={{ fontSize: 12, color: "#8A8A8A" }}> {h.time}</span>
                <span style={{ fontSize: 13, fontFamily: "var(--font-heading)", fontWeight: 600, color: "#2C2C2C" }}> {t(h.jp, h.en)}</span>
              </div>
            </div>
            <span style={{ fontSize: 11, color: "#E8829A", fontWeight: 600 }}>{h.dist}</span>
          </div>
        ))}

        <button className="flex items-center gap-1 mt-2" style={{ fontSize: 12, color: "#7B68C8", fontWeight: 600 }}>
          {t("全履歴を見る", "View Full History")} <ChevronRight size={14} />
        </button>
      </div>

      {/* NEARBY CLINIC */}
      <button onClick={() => navigate({ to: "/clinics" })} className="w-full flex items-center gap-3" style={{ margin: "0 16px 24px", width: "calc(100% - 32px)", background: "var(--color-primary)", border: "1px solid #C8E0F8", borderRadius: 20, padding: 14, textAlign: "left" }}>
        <div className="flex items-center justify-center" style={{ width: 40, height: 40, borderRadius: "50%", background: "#FFFFFF" }}>
          <Stethoscope size={20} style={{ color: "#5B9BD5" }} />
        </div>
        <div className="flex-1 min-w-0">
          <div style={{ fontSize: 14, fontFamily: "var(--font-heading)", fontWeight: 600, color: "#1A3C5E" }}>
            {t("最寄りの動物病院", "Nearest Animal Hospital")}
          </div>
          <div style={{ fontSize: 12, color: "#5B9BD5", marginTop: 2 }}>
             {t("渋谷動物病院", "Shibuya Animal Hosp.")} · 0.8km · 4.6 · 24H
          </div>
        </div>
        <div className="flex items-center justify-center" style={{ width: 36, height: 36, borderRadius: "50%", background: "#5B9BD5", color: "#fff", flexShrink: 0 }}>
          <ChevronRight size={18} />
        </div>
      </button>
    </AppShell>
  );
}

function Toggle({ on, onChange, activeColor = "#6BAF92" }: { on: boolean; onChange: (v: boolean) => void; activeColor?: string }) {
  return (
    <button onClick={() => onChange(!on)} style={{
      width: 48, height: 28, borderRadius: 999, position: "relative", transition: "background .3s",
      background: on ? activeColor : "#EDE8E4",
    }}>
      <span style={{
        position: "absolute", top: 3, left: on ? 23 : 3, width: 22, height: 22, borderRadius: "50%",
        background: "#fff", transition: "left .3s", boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
      }} />
    </button>
  );
}
