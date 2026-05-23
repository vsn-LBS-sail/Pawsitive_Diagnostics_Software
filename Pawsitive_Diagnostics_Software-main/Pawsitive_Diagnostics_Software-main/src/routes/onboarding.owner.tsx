import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Download, Check } from "lucide-react";
import AppShell from "@/components/AppShell";
import { Stepper, TopBar } from "@/routes/onboarding.avatar";
import { PrimaryButton } from "@/routes/auth";
import { useT } from "@/context/LanguageContext";
import { usePet } from "@/context/PetContext";
import DogAvatar from "@/components/DogAvatar";
import type { BreedKey, EarStyle, EyeStyle } from "@/components/DogAvatar";

export const Route = createFileRoute("/onboarding/owner")({ component: Step3 });

type PoseTag = "solo" | "duo";
type Pose = {
  id: number;
  jp: string;
  en: string;
  bg: string;
  tag: PoseTag;
  emoji: string;
  featured?: boolean;
};

const POSES: Pose[] = [
  { id: 0, jp: "純粋な喜び！", en: "Pure joy!",       bg: "#FDEDF2", tag: "solo", emoji: "", featured: true },
  { id: 1, jp: "ボールタイム", en: "Ball time",       bg: "#FFF7D6", tag: "solo", emoji: "" },
  { id: 2, jp: "おやすみモード", en: "Nap mode",      bg: "#E0EEFB", tag: "solo", emoji: "" },
  { id: 3, jp: "一緒にお散歩", en: "Walk together",   bg: "#E2F4E4", tag: "duo",  emoji: "" },
  { id: 4, jp: "ぎゅーっと",   en: "Cuddle time",     bg: "#FDEDF2", tag: "duo",  emoji: "" },
  { id: 5, jp: "冒険だ！",     en: "Adventure!",      bg: "#FFF7D6", tag: "duo",  emoji: "" },
];

function Step3() {
  const nav = useNavigate();
  const t = useT();
  const { pet, updatePet } = usePet();
  const [selected, setSelected] = useState<number>(pet.selectedPose ?? 0);

  const selectPose = (id: number) => {
    setSelected(id);
    updatePet({ selectedPose: id });
  };

  const sel = POSES.find((p) => p.id === selected) ?? POSES[0];

  return (
    <AppShell hideTopBar hideBottomNav>
      <div
        className="min-h-screen pb-32"
        style={{ background: "#F5EDE8", fontFamily: "'Nunito','Quicksand',system-ui,sans-serif" }}
      >
        <div className="px-6 pt-4">
          <TopBar to={pet.path === "B" ? "/onboarding/avatar" : "/onboarding/dog"} />
          <Stepper current={3} path={pet.path} />

          <h1 className="text-[22px] font-extrabold text-center mt-2" style={{ color: "#3B2A23" }}>
            {t("アバターステッカーパック", "Your Avatar Sticker Pack")}
          </h1>
          <p className="text-center text-[13px] mt-2 leading-relaxed" style={{ color: "#8A766C" }}>
            {t(
              "色々な気分と瞬間のアバターコンビ ",
              "Your avatar duo across different moods and moments "
            )}
          </p>

          {/* Set as profile bar */}
          <div
            className="mt-5 p-3 rounded-3xl flex items-center gap-3"
            style={{ background: "#FFFFFF", boxShadow: "0 2px 14px rgba(0,0,0,0.05)" }}
          >
            <div
              className="rounded-full flex items-center justify-center text-[26px]"
              style={{
                width: 52, height: 52,
                background: sel.bg,
                border: "2px solid #E8678A",
              }}
            >
              {sel.emoji}
            </div>
            <div className="flex-1">
              <div className="text-[13px] font-bold" style={{ color: "#3B2A23" }}>
                {t("プロフィール写真に設定", "Set as profile picture")}
              </div>
              <div className="text-[10px] mt-0.5" style={{ color: "#A38B82" }}>
                {t("下のポーズをタップ", "Tap any pose below")}
              </div>
            </div>
            <button
              className="flex items-center gap-1 px-4 py-2 rounded-full text-[12px] font-bold"
              style={{
                background: "#447F98",
                color: "#FFF",
                boxShadow: "0 4px 12px rgba(232,103,138,0.3)",
              }}
            >
              {t("設定", "Set")} <Check className="w-3.5 h-3.5" strokeWidth={3} />
            </button>
          </div>

          {/* Featured pose */}
          {POSES.filter((p) => p.featured).map((p) => (
            <PoseFeatured
              key={p.id}
              pose={p}
              selected={selected === p.id}
              onSelect={() => selectPose(p.id)}
              pet={pet}
            />
          ))}

          {/* Grid */}
          <div className="grid grid-cols-2 gap-3 mt-3">
            {POSES.filter((p) => !p.featured).map((p) => (
              <PoseCard
                key={p.id}
                pose={p}
                selected={selected === p.id}
                onSelect={() => selectPose(p.id)}
                pet={pet}
              />
            ))}
          </div>
        </div>

        {/* Bottom CTA */}
        <div
          className="fixed bottom-0 inset-x-0 mx-auto p-4"
          style={{
            maxWidth: 430,
            background: "linear-gradient(to top, #F5EDE8, rgba(245,237,232,0.9) 70%, transparent)",
          }}
        >
          <PrimaryButton onClick={() => nav({ to: "/onboarding/details" })}>
            {t("次へ", "Next")} → 
          </PrimaryButton>
        </div>
      </div>
    </AppShell>
  );
}

function PoseFeatured({
  pose, selected, onSelect, pet,
}: { pose: Pose; selected: boolean; onSelect: () => void; pet: ReturnType<typeof usePet>["pet"] }) {
  const t = useT();
  return (
    <button
      onClick={onSelect}
      className="w-full mt-4 rounded-3xl relative overflow-hidden transition-all"
      style={{
        background: pose.bg,
        aspectRatio: "16/9",
        boxShadow: selected
          ? "0 0 0 3px #E8678A, 0 10px 24px rgba(232,103,138,0.25)"
          : "0 4px 14px rgba(0,0,0,0.06)",
      }}
    >
      <div className="absolute inset-0 flex items-center justify-center">
        <DogAvatar
          breed={(pet.breed as BreedKey) || "shiba"}
          furColor={pet.avatar.furColor}
          earStyle={pet.avatar.earStyle as EarStyle}
          eyeStyle="happy"
          collarColor={pet.avatar.collarColor}
          size={130}
          ring={false}
        />
      </div>
      <span
        className="absolute top-3 left-3 text-[10px] font-bold px-2.5 py-1 rounded-full"
        style={{ background: "rgba(255,255,255,0.9)", color: "#D67A35" }}
      >
         {t("ソロ", "Solo")}
      </span>
      <DownloadBtn />
      <div
        className="absolute bottom-0 inset-x-0 px-4 py-2"
        style={{
          background: "linear-gradient(to top, rgba(255,255,255,0.95), rgba(255,255,255,0))",
        }}
      >
        <div className="text-[15px] font-extrabold" style={{ color: "#3B2A23" }}>
          {t(pose.jp, pose.en)}
        </div>
      </div>
    </button>
  );
}

function PoseCard({
  pose, selected, onSelect, pet,
}: { pose: Pose; selected: boolean; onSelect: () => void; pet: ReturnType<typeof usePet>["pet"] }) {
  const t = useT();
  const tagColors =
    pose.tag === "solo"
      ? { bg: "#FFE9D6", fg: "#D67A35" }
      : { bg: "#FFE0EA", fg: "#E8678A" };
  return (
    <button
      onClick={onSelect}
      className="rounded-3xl relative overflow-hidden transition-all"
      style={{
        background: pose.bg,
        aspectRatio: "1 / 1",
        boxShadow: selected
          ? "0 0 0 3px #E8678A, 0 6px 18px rgba(232,103,138,0.25)"
          : "0 2px 10px rgba(0,0,0,0.05)",
      }}
    >
      <div className="absolute inset-0 flex items-center justify-center">
        {pose.tag === "solo" ? (
          <DogAvatar
            breed={(pet.breed as BreedKey) || "shiba"}
            furColor={pet.avatar.furColor}
            earStyle={pet.avatar.earStyle as EarStyle}
            eyeStyle={pet.avatar.eyeStyle as EyeStyle}
            collarColor={pet.avatar.collarColor}
            size={86}
            ring={false}
          />
        ) : (
          <div className="flex items-end gap-1">
            <div className="text-[36px] leading-none">{pose.emoji}</div>
            <DogAvatar
              breed={(pet.breed as BreedKey) || "shiba"}
              furColor={pet.avatar.furColor}
              size={62}
              ring={false}
              showCollar={false}
            />
          </div>
        )}
      </div>
      <DownloadBtn />
      <div
        className="absolute bottom-0 inset-x-0 px-3 py-2 flex items-center justify-between"
        style={{ background: "linear-gradient(to top, rgba(255,255,255,0.95), rgba(255,255,255,0))" }}
      >
        <span className="text-[11px] font-extrabold" style={{ color: "#3B2A23" }}>
          {t(pose.jp, pose.en)}
        </span>
        <span
          className="text-[8px] font-bold px-1.5 py-0.5 rounded-full"
          style={{ background: tagColors.bg, color: tagColors.fg }}
        >
          {pose.tag === "solo" ? t("ソロ", "Solo") : t("デュオ", "Duo")}
        </span>
      </div>
    </button>
  );
}

function DownloadBtn() {
  return (
    <span
      className="absolute top-2.5 right-2.5 flex items-center justify-center"
      style={{
        width: 28, height: 28, borderRadius: 999,
        background: "rgba(255,255,255,0.9)",
        boxShadow: "0 1px 4px rgba(0,0,0,0.1)",
      }}
    >
      <Download className="w-3.5 h-3.5" color="#3B2A23" />
    </span>
  );
}
