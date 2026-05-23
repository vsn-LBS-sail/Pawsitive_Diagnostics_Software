import { useLocation, useNavigate } from "@tanstack/react-router";
import { Home, MapPin, Bot, HeartPulse, Users, Activity, X, type LucideIcon } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { useT } from "@/context/LanguageContext";
import { usePet } from "@/context/PetContext";
import { BREEDS } from "@/lib/mock";
import DogAvatar, { BREED_KEY_BY_JP } from "@/components/DogAvatar";

type Tab = {
  Icon: LucideIcon;
  labelEn: string;
  labelJp: string;
  route: string;
  isCenter?: boolean;
};

const TABS: Tab[] = [
  { Icon: Home, labelEn: "Home", labelJp: "ホーム", route: "/home" },
  { Icon: Activity, labelEn: "Report", labelJp: "レポート", route: "/report" },
  { Icon: MapPin, labelEn: "Map", labelJp: "地図", route: "/map" },
  { Icon: Bot, labelEn: "AI", labelJp: "AI", route: "/ai", isCenter: true },
  { Icon: HeartPulse, labelEn: "Clinics", labelJp: "クリニック", route: "/clinics" },
  { Icon: Users, labelEn: "Community", labelJp: "コミュニティ", route: "/community" },
];

function ProfileSheet({ onClose }: { onClose: () => void }) {
  const t = useT();
  const { pet, updatePet } = usePet();
  const [name, setName] = useState(pet.name);
  const [breedJp, setBreedJp] = useState(pet.breedJp);
  const [age, setAge] = useState<string>(pet.age != null ? String(pet.age) : "");
  const [weight, setWeight] = useState<string>(pet.weight != null ? String(pet.weight) : "");

  const save = () => {
    const b = BREEDS.find((x) => x.jp === breedJp);
    updatePet({
      name: name.trim(),
      breedJp,
      breedEn: b?.en ?? pet.breedEn,
      breed: BREED_KEY_BY_JP[breedJp] ?? pet.breed,
      age: age ? Number(age) : null,
      weight: weight ? Number(weight) : null,
    });
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center"
      style={{ background: "rgba(44,44,44,0.4)" }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md flex flex-col"
        style={{ background: "#FFFFFF", borderRadius: "32px 32px 0 0", boxShadow: "0 -8px 32px rgba(0,0,0,0.1)", maxHeight: "85vh" }}
      >
        <div className="mx-auto mt-3 mb-2 rounded-full" style={{ width: 32, height: 4, background: "#E8E0DC" }} />

        {/* Avatar preview */}
        <div className="flex flex-col items-center" style={{ paddingTop: 8, paddingBottom: 12 }}>
          <DogAvatar
            breed={pet.breed as any}
            furColor={pet.avatar.furColor}
            earStyle={pet.avatar.earStyle as any}
            eyeStyle={pet.avatar.eyeStyle as any}
            collarColor={pet.avatar.collarColor}
            size={80}
            ring
          />
          {pet.name?.trim() && (
            <div style={{ marginTop: 8, fontSize: 15, fontWeight: 600, color: "#2C2C2C" }}>{pet.name}</div>
          )}
        </div>

        <div className="px-5 pb-3 flex items-center justify-between">
          <h3 className="text-[15px] font-semibold" style={{ color: "#2C2C2C" }}>{t("プロフィール編集", "Edit Profile")}</h3>
          <button onClick={onClose}><X className="w-5 h-5" style={{ color: "#8A8A8A" }} /></button>
        </div>
        <div className="px-5 pb-4 space-y-3 overflow-y-auto">
          <SheetField label={t("名前", "Name")}>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t("例: ハナ", "e.g. Hana")}
              className="w-full h-[48px] rounded-[12px] px-4 text-[15px] outline-none"
              style={{ background: "#FAFAF8", border: "1.5px solid #EDE8E4", color: "#2C2C2C" }}
            />
          </SheetField>
          <SheetField label={t("犬種", "Breed")}>
            <select
              value={breedJp}
              onChange={(e) => setBreedJp(e.target.value)}
              className="w-full h-[48px] rounded-[12px] px-3 text-[15px] outline-none"
              style={{ background: "#FAFAF8", border: "1.5px solid #EDE8E4", color: "#2C2C2C" }}
            >
              {BREEDS.map((b) => (
                <option key={b.jp} value={b.jp}>{b.jp} / {b.en}</option>
              ))}
            </select>
          </SheetField>
          <div className="grid grid-cols-2 gap-3">
            <SheetField label={t("年齢", "Age")}>
              <input
                value={age} onChange={(e) => setAge(e.target.value)} type="number" placeholder="3"
                className="w-full h-[48px] rounded-[12px] px-4 text-[15px] outline-none"
                style={{ background: "#FAFAF8", border: "1.5px solid #EDE8E4", color: "#2C2C2C" }}
              />
            </SheetField>
            <SheetField label={t("体重 (kg)", "Weight (kg)")}>
              <input
                value={weight} onChange={(e) => setWeight(e.target.value)} type="number" placeholder="8.5"
                className="w-full h-[48px] rounded-[12px] px-4 text-[15px] outline-none"
                style={{ background: "#FAFAF8", border: "1.5px solid #EDE8E4", color: "#2C2C2C" }}
              />
            </SheetField>
          </div>
        </div>
        <div className="px-5 pb-5 pt-2 space-y-2" style={{ borderTop: "1px solid #F5F0EC" }}>
          <button
            onClick={save}
            className="w-full h-12 rounded-2xl text-white text-[15px] font-bold"
            style={{ background: "var(--color-primary)", boxShadow: "0 6px 18px rgba(232,130,154,0.35)" }}
          >
            {t("保存", "Save Changes")}
          </button>
          <button onClick={onClose} className="w-full h-10 text-[13px] font-medium" style={{ color: "#8A8A8A" }}>
            {t("キャンセル", "Cancel")}
          </button>
        </div>
      </div>
    </div>
  );
}

function SheetField({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <div className="text-[12px] font-semibold mb-1.5" style={{ color: "#2C2C2C" }}>{label}</div>
      {children}
    </div>
  );
}

const ACCENT = "#FFFFFF";
const INACTIVE = "rgba(255,255,255,0.6)";
const AI_COLOR = "#447F98";

export default function BottomNav() {
  const loc = useLocation();
  const navigate = useNavigate();
  const t = useT();
  const { pet } = usePet();
  const [bouncing, setBouncing] = useState<string | null>(null);
  const [profileOpen, setProfileOpen] = useState(false);

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
      {profileOpen && <ProfileSheet onClose={() => setProfileOpen(false)} />}

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

      {/* Profile avatar button */}
      <button
        onClick={() => setProfileOpen(true)}
        className="flex flex-col items-center justify-center"
        style={{ flex: 1, height: "100%", cursor: "pointer", gap: 3 }}
        aria-label={t("プロフィール", "Profile")}
      >
        <div style={{
          width: 28,
          height: 28,
          borderRadius: "50%",
          overflow: "hidden",
          border: `2px solid ${profileOpen ? "#FFFFFF" : "rgba(255,255,255,0.5)"}`,
          transition: "border-color 0.2s ease",
          flexShrink: 0,
        }}>
          <DogAvatar
            breed={pet.breed as any}
            furColor={pet.avatar.furColor}
            earStyle={pet.avatar.earStyle as any}
            eyeStyle={pet.avatar.eyeStyle as any}
            collarColor={pet.avatar.collarColor}
            size={28}
            ring={false}
            showCollar={false}
            showCheeks={false}
          />
        </div>
        <span style={{ fontSize: 10, color: profileOpen ? ACCENT : INACTIVE, fontWeight: 500, lineHeight: 1, transition: "color 0.2s ease" }}>
          {t("プロフィール", "Profile")}
        </span>
      </button>

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
