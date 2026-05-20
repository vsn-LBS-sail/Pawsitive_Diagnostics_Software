import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useCallback, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Camera, Image as ImageIcon, RotateCcw, Loader2 } from "lucide-react";
import PhoneFrame from "@/components/PhoneFrame";
import DogAvatar from "@/components/DogAvatar";
import { Stepper, TopBar } from "@/routes/onboarding.avatar";
import { useT } from "@/context/LanguageContext";
import { usePet } from "@/context/PetContext";
import { generateAvatar } from "@/lib/avatar.functions";
import type { BreedKey, EarStyle, EyeStyle } from "@/components/DogAvatar";

export const Route = createFileRoute("/onboarding/dog")({ component: Step2 });

type SheetTarget = null | "dog" | "owner";

function Step2() {
  const nav = useNavigate();
  const t = useT();
  const { pet, updatePet } = usePet();
  const runGenerate = useServerFn(generateAvatar);

  // Raw uploaded previews (local object URLs)
  const [dogRawUrl, setDogRawUrl] = useState<string | null>(null);
  const [dogRawFile, setDogRawFile] = useState<File | null>(null);
  const [ownerRawUrl, setOwnerRawUrl] = useState<string | null>(null);
  const [ownerRawFile, setOwnerRawFile] = useState<File | null>(null);

  // Final generated avatars
  const [dogAvatarUrl, setDogAvatarUrl] = useState<string | null>(pet.dogPhotoUrl);
  const [ownerAvatarUrl, setOwnerAvatarUrl] = useState<string | null>(pet.ownerPhotoUrl);

  const [generating, setGenerating] = useState(false);
  const [sheet, setSheet] = useState<SheetTarget>(null);

  const dogCamRef = useRef<HTMLInputElement>(null);
  const dogGalRef = useRef<HTMLInputElement>(null);
  const ownerCamRef = useRef<HTMLInputElement>(null);
  const ownerGalRef = useRef<HTMLInputElement>(null);

  const fileToBase64 = (file: File) =>
    new Promise<{ base64: string; mime: string }>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        const [meta, b64] = result.split(",");
        const mime = /data:(.*?);base64/.exec(meta)?.[1] || file.type || "image/jpeg";
        resolve({ base64: b64, mime });
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const handleDogFile = (file: File | undefined) => {
    if (!file) return;
    setDogRawFile(file);
    setDogRawUrl(URL.createObjectURL(file));
    setDogAvatarUrl(null);
  };

  const handleOwnerFile = (file: File | undefined) => {
    if (!file) return;
    setOwnerRawFile(file);
    setOwnerRawUrl(URL.createObjectURL(file));
    setOwnerAvatarUrl(null);
  };

  const resetDog = () => {
    setDogRawUrl(null);
    setDogRawFile(null);
    setDogAvatarUrl(null);
    updatePet({ dogPhotoUrl: null });
    openSheet("dog");
  };

  const resetOwner = () => {
    setOwnerRawUrl(null);
    setOwnerRawFile(null);
    setOwnerAvatarUrl(null);
    updatePet({ ownerPhotoUrl: null });
    openSheet("owner");
  };

  const openSheet = (target: "dog" | "owner") => setSheet(target);
  const closeSheet = () => setSheet(null);

  const triggerCamera = () => {
    if (sheet === "dog") dogCamRef.current?.click();
    else if (sheet === "owner") ownerCamRef.current?.click();
    closeSheet();
  };
  const triggerGallery = () => {
    if (sheet === "dog") dogGalRef.current?.click();
    else if (sheet === "owner") ownerGalRef.current?.click();
    closeSheet();
  };

  const canGenerate = !!dogRawFile && !generating;

  const onGenerate = useCallback(async () => {
    if (!dogRawFile) return;
    setGenerating(true);
    try {
      const dogPayload = await fileToBase64(dogRawFile);
      let ownerPayload = undefined;
      if (ownerRawFile) {
        ownerPayload = await fileToBase64(ownerRawFile);
      }

      const res = await runGenerate({
        data: {
          dogImageBase64: dogPayload.base64,
          dogImageMime: dogPayload.mime,
          ownerImageBase64: ownerPayload?.base64,
          ownerImageMime: ownerPayload?.mime,
        },
      });

      setDogAvatarUrl(res.dogAvatarUrl);
      if (res.ownerAvatarUrl) {
        setOwnerAvatarUrl(res.ownerAvatarUrl);
      }

      updatePet({
        dogPhotoUrl: res.dogAvatarUrl,
        ownerPhotoUrl: res.ownerAvatarUrl || null,
        avatarStatus: "ready",
        path: "A",
      });

      nav({ to: "/onboarding/avatar" });
    } catch (e) {
      console.error("Avatar generation failed:", e);
      toast.error(
        t(
          "アバターの生成に失敗しました — もう一度お試しください。",
          "Avatar generation failed — please try again.",
        ),
      );
    } finally {
      setGenerating(false);
    }
  }, [dogRawFile, ownerRawFile, runGenerate, updatePet, nav, t]);

  const onBuildOwn = () => {
    updatePet({ path: "B" });
    nav({ to: "/onboarding/avatar" });
  };


  return (
    <PhoneFrame>
      <div
        className="min-h-screen pb-32"
        style={{ background: "var(--color-bg-app)", fontFamily: "'Nunito','Quicksand',system-ui,sans-serif" }}
      >
        <div className="px-6 pt-4">
          <TopBar to="/onboarding/welcome" />
          <Stepper current={1} path={pet.path} />

          <h1 className="text-[22px] font-extrabold text-center mt-2" style={{ color: "#3B2A23" }}>
            {t("写真を追加", "Add Your Photos")}
          </h1>
          <p className="text-center text-[13px] mt-2 leading-relaxed" style={{ color: "#8A766C" }}>
            {t(
              "ワンちゃんとあなたの写真をアップロード。美しいイラストのアートコンビに変身させます ",
              "Upload photos of your dog and yourself. We'll transform them into a beautiful illustrated art duo "
            )}
          </p>

          {/* Upload pair */}
          <div className="grid grid-cols-2 gap-3 mt-6">
            <UploadCard
              label={t("ワンちゃん", "Your Dog")}
              placeholderEmoji=""
              imageUrl={dogRawUrl}
              loading={false}
              onTap={() => openSheet("dog")}
              onRetake={resetDog}
            />
            <UploadCard
              label={t("オーナー", "You (Owner)")}
              placeholderEmoji=""
              imageUrl={ownerRawUrl}
              loading={false}
              onTap={() => openSheet("owner")}
              onRetake={resetOwner}
            />
          </div>

          {/* Hidden file inputs */}
          <input ref={dogCamRef} type="file" accept="image/*" capture="environment"
            className="hidden" onChange={(e) => handleDogFile(e.target.files?.[0])} />
          <input ref={dogGalRef} type="file" accept="image/*"
            className="hidden" onChange={(e) => handleDogFile(e.target.files?.[0])} />
          <input ref={ownerCamRef} type="file" accept="image/*" capture="user"
            className="hidden" onChange={(e) => handleOwnerFile(e.target.files?.[0])} />
          <input ref={ownerGalRef} type="file" accept="image/*"
            className="hidden" onChange={(e) => handleOwnerFile(e.target.files?.[0])} />

          {/* Avatar preview field (transparent, no frame) */}
          <AvatarPreview
            generating={generating}
            dogAvatarUrl={dogAvatarUrl}
            ownerAvatarUrl={ownerAvatarUrl}
          />


          {/* Skip / fallback */}
          <div
            className="mt-5 p-4 rounded-2xl flex items-center gap-3"
            style={{ background: "#FFFFFF", boxShadow: "0 2px 10px rgba(0,0,0,0.04)" }}
          >
            <DogAvatar
              breed={(pet.breed as BreedKey) || "shiba"}
              furColor={pet.avatar.furColor}
              earStyle={pet.avatar.earStyle as EarStyle}
              eyeStyle={pet.avatar.eyeStyle as EyeStyle}
              collarColor={pet.avatar.collarColor}
              size={56}
              ring={false}
            />
            <div className="flex-1">
              <div className="text-[12px] font-bold" style={{ color: "#3B2A23" }}>
                 {t("自分で作りたい？", "Prefer to build it yourself?")}
              </div>
              <div className="text-[10px] mt-0.5 leading-snug" style={{ color: "#A38B82" }}>
                {t(
                  "写真をスキップしてアバターをカスタマイズ。",
                  "Skip photos and customise your avatar"
                )}
              </div>
            </div>
            <button
              onClick={onBuildOwn}
              className="text-[11px] font-bold px-3 py-1.5 rounded-full"
              style={{ background: "var(--color-bg-card-elevated)", color: "#E8678A", border: "1.5px solid #E8678A" }}
            >
              {t("自分で作る", "Build My Own")} →
            </button>
          </div>
        </div>

        {/* Bottom CTA */}
        <div
          className="fixed bottom-0 inset-x-0 mx-auto p-4"
          style={{
            maxWidth: 430,
            background: "linear-gradient(to top, var(--color-bg-app), rgba(245,237,232,0.9) 70%, transparent)",
          }}
        >
          <button
            onClick={onGenerate}
            disabled={!canGenerate}
            className="w-full h-14 rounded-full text-[15px] font-bold transition-all flex items-center justify-center gap-2"
            style={{
              background: canGenerate && !generating
                ? "#E8678A"
                : "#E5D5CC",
              color: "#FFFFFF",
              boxShadow: canGenerate && !generating
                ? "0 8px 24px rgba(232,103,138,0.35)"
                : "none",
              opacity: !dogRawFile ? 0.55 : 1,
              cursor: !dogRawFile || generating ? "not-allowed" : "pointer",
            }}
          >
            {generating ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                {t("アバターを作成中...", "Creating your avatars...")}
              </>
            ) : (
              <>{t("ポーズを生成", "Generate Poses")} →</>
            )}
          </button>
        </div>


        <style>{`
          @keyframes pulseGlow {
            0%,100% { box-shadow: 0 8px 24px rgba(232,103,138,0.35); }
            50% { box-shadow: 0 8px 32px rgba(232,103,138,0.6), 0 0 0 6px rgba(232,103,138,0.08); }
          }
          @keyframes shimmer {
            0% { background-position: -200% 0; }
            100% { background-position: 200% 0; }
          }
          @keyframes sheetUp {
            from { transform: translateY(100%); }
            to { transform: translateY(0); }
          }
          @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        `}</style>
      </div>

      {/* Bottom sheet */}
      {sheet && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center"
          style={{ background: "rgba(0,0,0,0.35)", animation: "fadeIn 0.2s ease" }}
          onClick={closeSheet}
        >
          <div
            className="w-full"
            style={{
              maxWidth: 430,
              background: "#FFFFFF",
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              animation: "sheetUp 0.28s cubic-bezier(.2,.9,.3,1.2)",
              paddingBottom: 28,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-center pt-3 pb-2">
              <span style={{ width: 40, height: 4, borderRadius: 2, background: "#E5D5CC" }} />
            </div>
            <div className="px-5 pt-2 pb-2 text-[12px] font-bold" style={{ color: "#A38B82" }}>
              {sheet === "dog"
                ? t("ワンちゃんの写真を選ぶ", "Choose dog photo")
                : t("あなたの写真を選ぶ", "Choose your photo")}
            </div>
            <SheetRow
              icon={<Camera className="w-5 h-5" />}
              label={
                sheet === "dog"
                  ? t("ワンちゃんを撮影 ", "Take my dog's photo ")
                  : t("セルフィーを撮る ", "Take a selfie ")
              }
              onClick={triggerCamera}
            />
            <SheetRow
              icon={<ImageIcon className="w-5 h-5" />}
              label={t("ギャラリーから選ぶ", "Choose from gallery")}
              onClick={triggerGallery}
            />
            <button
              onClick={closeSheet}
              className="w-full text-center py-4 text-[14px] font-medium"
              style={{ color: "#A38B82" }}
            >
              {t("キャンセル", "Cancel")}
            </button>
          </div>
        </div>
      )}
    </PhoneFrame>
  );
}

function SheetRow({
  icon, label, onClick,
}: { icon: React.ReactNode; label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-4 px-6 py-4 text-left transition-colors"
      style={{ color: "#3B2A23" }}
    >
      <span
        className="flex items-center justify-center"
        style={{
          width: 40, height: 40, borderRadius: 999,
          background: "var(--color-bg-card-elevated)", color: "#E8678A",
        }}
      >
        {icon}
      </span>
      <span className="text-[15px] font-bold">{label}</span>
    </button>
  );
}

function UploadCard({
  label, placeholderEmoji, imageUrl, loading, onTap, onRetake,
}: {
  label: string;
  placeholderEmoji: string;
  imageUrl: string | null;
  loading: boolean;
  onTap: () => void;
  onRetake: () => void;
}) {
  const t = useT();
  const hasImage = !!imageUrl && !loading;

  return (
    <div className="flex flex-col items-center">
      <button
        onClick={onTap}
        className="w-full aspect-square rounded-3xl overflow-hidden flex items-center justify-center transition-all relative"
        style={{
          background: hasImage ? "#FFFFFF" : "#FFFAF7",
          border: hasImage
            ? "2px solid #E8678A"
            : "2px dashed #E5C8B8",
          boxShadow: hasImage
            ? "0 8px 20px rgba(232,103,138,0.18)"
            : "0 2px 10px rgba(0,0,0,0.04)",
        }}
      >
        {imageUrl && (
          <img
            src={imageUrl}
            alt={label}
            className="w-full h-full object-cover"
            style={{ borderRadius: 22 }}
          />
        )}
        {loading && (
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(90deg, rgba(245,237,232,0.6) 0%, rgba(255,240,245,0.85) 50%, rgba(245,237,232,0.6) 100%)",
              backgroundSize: "200% 100%",
              animation: "shimmer 1.4s linear infinite",
            }}
          />
        )}
        {!loading && !imageUrl && (
          <div className="flex flex-col items-center">
            <div className="text-[44px] leading-none">{placeholderEmoji}</div>
            <div
              className="text-[11px] font-medium mt-2 px-2 text-center"
              style={{ color: "#A38B82" }}
            >
              {t("タップして写真をアップロード", "Tap to upload photo")}
            </div>
          </div>
        )}
      </button>
      <div className="text-[12px] font-bold mt-2" style={{ color: "#3B2A23" }}>
        {label}
      </div>
      {hasImage && (
        <button
          onClick={onRetake}
          className="mt-1 flex items-center gap-1 text-[10px] font-medium"
          style={{ color: "#E8678A" }}
        >
          <RotateCcw className="w-3 h-3" />
          {t("撮り直し", "Retake")}
        </button>
      )}
    </div>
  );
}

/* ============================================================ */
/*  Animation Display Field                                     */
/* ============================================================ */

/* ============================================================ */
/*  Avatar Preview — generated avatars on transparent background */
/* ============================================================ */

function AvatarPreview({
  generating,
  dogAvatarUrl,
  ownerAvatarUrl,
}: {
  generating: boolean;
  dogAvatarUrl: string | null;
  ownerAvatarUrl: string | null;
}) {
  const t = useT();
  const hasResult = !!dogAvatarUrl || !!ownerAvatarUrl;

  if (!generating && !hasResult) return null;

  return (
    <div
      className="mt-5 flex flex-col items-center justify-center"
      style={{ minHeight: 220 }}
    >
      {generating && (
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin" style={{ color: "#E8678A" }} />
          <div className="text-[13px] font-bold" style={{ color: "#3B2A23" }}>
            {t("アバターを作成中...", "Creating your avatars...")}
          </div>
        </div>
      )}
      {!generating && hasResult && (
        <div className="flex flex-col items-center gap-4">
          <div className="flex items-end justify-center gap-4">
            {dogAvatarUrl && (
              <img
                src={dogAvatarUrl}
                alt="Dog avatar"
                style={{
                  width: 150,
                  height: 150,
                  objectFit: "contain",
                  background: "#FFFFFF",
                  borderRadius: "16px",
                }}
              />
            )}
            {ownerAvatarUrl && (
              <img
                src={ownerAvatarUrl}
                alt="Owner avatar"
                style={{
                  width: 150,
                  height: 150,
                  objectFit: "contain",
                  background: "#FFFFFF",
                  borderRadius: "16px",
                }}
              />
            )}
          </div>
          <div className="flex items-center justify-center gap-2">
            <span
              style={{
                width: 8, height: 8, borderRadius: "50%",
                background: "#22C55E", boxShadow: "0 0 0 4px rgba(34,197,94,0.15)",
              }}
            />
            <span className="text-[12px] font-bold" style={{ color: "#16A34A" }}>
               {t("アバターができました！", "Your avatars are ready!")}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

/* ============================================================ */
/*  Legacy Animation Display Field (unused, kept for reference)  */
/* ============================================================ */

type GhibliState =
  | { kind: "idle" }
  | { kind: "converting"; rawUrl: string; progress: number }
  | { kind: "done"; ghibliUrl: string; palette: unknown }
  | { kind: "error"; message: string; rawFile: File | null };

type DogPalette = {
  fur?: string;
  furDeep?: string;
  earInner?: string;
  chest?: string;
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function AnimationField({
  state,
  onRetake,
  onRetry,
}: {
  state: GhibliState;
  onRetake: () => void;
  onRetry: () => void;
}) {
  const t = useT();


  return (
    <div className="mt-5">
      <div
        className="relative overflow-hidden"
        style={{
          minHeight: 240,
          borderRadius: 24,
          background: "#FFFFFF",
          border: "1px solid #F4C0D1",
          boxShadow: "0 4px 18px rgba(232,103,138,0.06)",
        }}
      >
        {state.kind === "idle" && <PawBot />}

        {state.kind === "converting" && (
          <div className="absolute inset-0 flex items-center justify-center">
            <img
              src={state.rawUrl}
              alt="Uploading"
              style={{
                width: 168, height: 168, objectFit: "cover",
                borderRadius: 20,
                boxShadow: "0 0 0 4px var(--color-bg-card-elevated), 0 10px 28px rgba(232,103,138,0.18)",
              }}
            />
            <div
              className="absolute"
              style={{
                width: 168, height: 168, borderRadius: 20,
                background:
                  "linear-gradient(110deg, rgba(255,255,255,0) 30%, rgba(255,255,255,0.55) 50%, rgba(255,255,255,0) 70%)",
                backgroundSize: "200% 100%",
                animation: "afShimmer 1.6s linear infinite",
                pointerEvents: "none",
              }}
            />
          </div>
        )}

        {state.kind === "done" && (
          <div className="absolute inset-0 flex items-center justify-center">
            <img
              src={state.ghibliUrl}
              alt="Art avatar dog"
              style={{
                width: 200, height: 200, objectFit: "cover",
                borderRadius: 24,
                boxShadow: "0 0 0 4px var(--color-bg-card-elevated), 0 12px 30px rgba(232,103,138,0.22)",
                animation: "afBreathe 3.6s ease-in-out infinite",
              }}
            />
            <button
              onClick={onRetake}
              className="absolute z-10"
              style={{
                bottom: 12, left: "50%", transform: "translateX(-50%)",
                fontSize: 11, color: "#E8678A", fontWeight: 600,
              }}
            >
              ↺ {t("撮り直し", "Retake")}
            </button>
          </div>
        )}

        {state.kind === "error" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-6 text-center">
            <div style={{ fontSize: 36 }}></div>
            <div className="text-[13px] font-bold" style={{ color: "#3B2A23" }}>
              {t("変換に失敗しました。再試行しますか？", "Conversion failed. Try again?")}
            </div>
            <div className="text-[10px]" style={{ color: "#A38B82" }}>{state.message}</div>
            <button
              onClick={onRetry}
              className="mt-1 px-4 py-2 rounded-full text-[12px] font-bold"
              style={{
                background: "#447F98",
                color: "#fff",
                boxShadow: "0 6px 14px rgba(232,103,138,0.3)",
              }}
            >
              ↺ {t("再試行", "Retry")}
            </button>
          </div>
        )}

        <style>{`
          @keyframes afSlideIn {
            0% { transform: translateX(-40%); opacity: 0; }
            100% { transform: translateX(0); opacity: 1; }
          }
          @keyframes afBreathe {
            0%,100% { transform: scale(1); }
            50% { transform: scale(1.02); }
          }
          @keyframes afShimmer {
            0% { background-position: -100% 0; }
            100% { background-position: 200% 0; }
          }
        `}</style>
      </div>

      {/* Status bar below field */}
      {state.kind === "converting" && (
        <div className="mt-3">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-bold" style={{ color: "#E8678A" }}>
              {t(" アート風に変換中...", " Applying art magic...")}
            </span>
            <span className="text-[10px] font-bold" style={{ color: "#A38B82" }}>
              {Math.round(state.progress)}%
            </span>
          </div>
          <div
            style={{
              height: 6, borderRadius: 999,
              background: "#FCE4EC", overflow: "hidden",
            }}
          >
            <div
              style={{
                width: `${state.progress}%`,
                height: "100%",
                background: "var(--color-bg-card)",
                borderRadius: 999,
                transition: "width 0.4s ease",
              }}
            />
          </div>
        </div>
      )}
      {state.kind === "done" && (
        <div className="mt-3 flex items-center justify-center gap-2">
          <span
            style={{
              width: 8, height: 8, borderRadius: "50%",
              background: "#22C55E", boxShadow: "0 0 0 4px rgba(34,197,94,0.15)",
            }}
          />
          <span className="text-[12px] font-bold" style={{ color: "#16A34A" }}>
             {t("アートアバターができました！", "Your art avatar is ready!")}
          </span>
        </div>
      )}
    </div>
  );
}

/* ============================================================ */
/*  PawBot — the Pawsitive Diagnostics mascot                   */
/* ============================================================ */

function PawBot({ palette }: { palette?: DogPalette }) {
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      {/* Ground line */}
      <div
        style={{
          position: "absolute", bottom: 40, left: 30, right: 30, height: 1,
          background: "linear-gradient(90deg,transparent,#F4C0D1,transparent)",
        }}
      />

      {/* Floating heart (sit phase) */}
      <svg width="14" height="14" viewBox="0 0 14 14"
        style={{
          position: "absolute", top: "50%", left: "50%",
          marginLeft: -7, marginTop: -70,
          animation: "pbHeart 4s ease-out infinite",
          opacity: 0,
        }}
      >
        <path d="M7 12 C2 8 0 5 2 3 C4 1 6 3 7 4 C8 3 10 1 12 3 C14 5 12 8 7 12 Z" fill="#F48BA9" />
      </svg>

      {/* Speed lines (run phase) */}
      <div
        style={{
          position: "absolute", top: "50%", left: 20, marginTop: -6,
          width: 30, height: 24,
          animation: "pbSpeed 4s linear infinite",
          opacity: 0,
        }}
      >
        {[0, 8, 16].map((y) => (
          <span key={y} style={{
            position: "absolute", top: y, left: 0,
            width: 22, height: 2, borderRadius: 2, background: "#F4C0D1",
          }} />
        ))}
      </div>

      {/* Star bursts (spin phase) */}
      {[0, 90, 180, 270].map((deg) => (
        <span
          key={deg}
          style={{
            position: "absolute", top: "50%", left: "50%",
            width: 10, height: 10, marginLeft: -5, marginTop: -5,
            transform: `rotate(${deg}deg) translateY(-50px)`,
            animation: "pbStar 4s ease-out infinite",
            opacity: 0,
          }}
        >
          <svg width="10" height="10" viewBox="0 0 10 10">
            <path d="M5 0 L6 4 L10 5 L6 6 L5 10 L4 6 L0 5 L4 4 Z" fill="#FFCC4D" />
          </svg>
        </span>
      ))}

      {/* Dust puffs (land phase) */}
      {[-1, 1].map((dir) => (
        <span key={dir}
          style={{
            position: "absolute", bottom: 34, left: "50%",
            marginLeft: dir * 18 - 4,
            width: 8, height: 8, borderRadius: "50%",
            background: "#EFE6E0",
            animation: "pbDust 4s ease-out infinite",
            opacity: 0,
          }}
        />
      ))}

      {/* PawBot body — translated/scaled across timeline */}
      <div
        style={{
          position: "absolute", top: "50%", left: "50%",
          width: 110, height: 110, marginLeft: -55, marginTop: -55,
          animation: "pbMove 4s cubic-bezier(0.34,1.56,0.64,1) infinite",
        }}
      >
        <div
          style={{
            width: "100%", height: "100%",
            animation: "pbSpin 4s cubic-bezier(0.34,1.56,0.64,1) infinite",
            transformOrigin: "50% 50%",
          }}
        >
          <PawBotSVG palette={palette} />
        </div>
      </div>

      <style>{`
        /* Master movement: run → leap → spin → land squish → sit → joy hop */
        @keyframes pbMove {
          0%   { transform: translateX(-90px) translateY(0) scale(1,1); }
          25%  { transform: translateX(60px)  translateY(0) scale(1,1); }      /* end run */
          32%  { transform: translateX(64px)  translateY(-46px) scale(1,1); }  /* leap apex */
          52%  { transform: translateX(20px)  translateY(-40px) scale(1,1); }  /* spin done */
          60%  { transform: translateX(0)     translateY(0) scale(1.3,0.7); }  /* land squish */
          65%  { transform: translateX(0)     translateY(0) scale(1,1); }
          85%  { transform: translateX(0)     translateY(0) scale(1,1); }      /* sitting */
          90%  { transform: translateX(0)     translateY(-12px) scale(1,1); }  /* joy hop */
          95%  { transform: translateX(0)     translateY(0) scale(1.05,0.95); }
          100% { transform: translateX(-90px) translateY(0) scale(1,1); }
        }
        @keyframes pbSpin {
          0%, 32% { transform: rotate(0deg); }
          52%     { transform: rotate(360deg); }
          100%    { transform: rotate(360deg); }
        }
        @keyframes pbHeart {
          0%, 70% { opacity: 0; transform: translateY(0); }
          75% { opacity: 1; transform: translateY(-4px); }
          88% { opacity: 0; transform: translateY(-28px); }
          100% { opacity: 0; }
        }
        @keyframes pbSpeed {
          0% { opacity: 0; transform: translateX(0); }
          5% { opacity: 1; }
          20% { opacity: 0.8; transform: translateX(-14px); }
          26%, 100% { opacity: 0; }
        }
        @keyframes pbStar {
          0%, 34% { opacity: 0; }
          42% { opacity: 1; }
          52% { opacity: 0; }
          100% { opacity: 0; }
        }
        @keyframes pbDust {
          0%, 58% { opacity: 0; transform: scale(0.4); }
          62% { opacity: 1; transform: scale(1.3); }
          70% { opacity: 0; transform: scale(1.8); }
          100% { opacity: 0; }
        }
        /* Body parts */
        @keyframes pbTail {
          0%, 65% { transform: rotate(-15deg); }
          70% { transform: rotate(35deg); }
          74% { transform: rotate(-25deg); }
          78% { transform: rotate(35deg); }
          82% { transform: rotate(-25deg); }
          86% { transform: rotate(35deg); }
          90% { transform: rotate(-15deg); }
          100% { transform: rotate(-15deg); }
        }
        @keyframes pbHead {
          0%, 65% { transform: rotate(0deg); }
          72% { transform: rotate(-15deg); }
          80% { transform: rotate(15deg); }
          88% { transform: rotate(0deg); }
          100% { transform: rotate(0deg); }
        }
        /* Legs alternate during run, tuck during jump */
        @keyframes pbLegA {
          0%   { transform: rotate(-28deg); }
          8%   { transform: rotate(28deg); }
          16%  { transform: rotate(-28deg); }
          25%  { transform: rotate(20deg); }
          32%  { transform: translateY(3px) rotate(35deg); }
          52%  { transform: translateY(3px) rotate(35deg); }
          60%  { transform: rotate(0deg); }
          100% { transform: rotate(0deg); }
        }
        @keyframes pbLegB {
          0%   { transform: rotate(28deg); }
          8%   { transform: rotate(-28deg); }
          16%  { transform: rotate(28deg); }
          25%  { transform: rotate(-20deg); }
          32%  { transform: translateY(3px) rotate(-35deg); }
          52%  { transform: translateY(3px) rotate(-35deg); }
          60%  { transform: rotate(0deg); }
          100% { transform: rotate(0deg); }
        }
        @keyframes pbEar {
          0% { transform: rotate(0deg); }
          12% { transform: rotate(-18deg); }
          25% { transform: rotate(-12deg); }
          32% { transform: rotate(-25deg); }
          60% { transform: rotate(0deg); }
          88% { transform: rotate(-6deg); }
          92% { transform: rotate(6deg); }
          100% { transform: rotate(0deg); }
        }
        /* Eyes close to happy arcs during spin + sit */
        @keyframes pbEye {
          0%, 25% { transform: scaleY(1); }
          30% { transform: scaleY(0.15); }
          52% { transform: scaleY(0.15); }
          58% { transform: scaleY(1); }
          70% { transform: scaleY(1); }
          75% { transform: scaleY(0.2); }
          90% { transform: scaleY(0.2); }
          95% { transform: scaleY(1); }
          100% { transform: scaleY(1); }
        }
        @keyframes pbTongue {
          0%, 25% { opacity: 1; transform: translateY(0); }
          30%, 60% { opacity: 0; }
          65% { opacity: 1; }
          100% { opacity: 1; }
        }
      `}</style>
    </div>
  );
}

function PawBotSVG({ palette }: { palette?: DogPalette }) {
  const FUR = palette?.fur ?? "#C17D4A";
  const FUR_DEEP = palette?.furDeep ?? "#A66838";
  const EAR_INNER = palette?.earInner ?? "#E8A878";
  const CHEST = palette?.chest ?? "#F5E6C8";
  const BLUSH = "#F4A8B8";
  const COLLAR = "#E8678A";
  const COLLAR_DEEP = "#C84A6E";
  const OUTLINE = "#2B1810";
  const IRIS = "#5A3010";
  return (
    <svg viewBox="0 0 100 100" width="100%" height="100%" style={{ overflow: "visible" }}>
      {/* ===== BODY (small, chubby) ===== */}
      {/* Tail (right side, fluffy curled) */}
      <g style={{ transformOrigin: "70px 75px", animation: "pbTail 4s ease-in-out infinite" }}>
        <path
          d="M70 76 Q82 72 84 64 Q85 58 80 58 Q77 60 78 64 Q76 68 72 70 Z"
          fill={FUR}
          stroke={OUTLINE}
          strokeWidth="2.5"
          strokeLinejoin="round"
        />
      </g>

      {/* Back legs */}
      <g style={{ transformOrigin: "40px 80px", animation: "pbLegA 4s ease-in-out infinite" }}>
        <rect x="36" y="78" width="9" height="12" rx="4.5"
          fill={FUR} stroke={OUTLINE} strokeWidth="2.5" strokeLinejoin="round" />
      </g>
      <g style={{ transformOrigin: "60px 80px", animation: "pbLegB 4s ease-in-out infinite" }}>
        <rect x="55" y="78" width="9" height="12" rx="4.5"
          fill={FUR_DEEP} stroke={OUTLINE} strokeWidth="2.5" strokeLinejoin="round" />
      </g>

      {/* Body */}
      <ellipse cx="50" cy="74" rx="18" ry="11"
        fill={FUR} stroke={OUTLINE} strokeWidth="2.5" />
      {/* Chest patch */}
      <ellipse cx="50" cy="76" rx="10" ry="6" fill={CHEST} />

      {/* Collar (Pawsitive brand) */}
      <path d="M36 66 Q50 70 64 66 L64 70 Q50 74 36 70 Z"
        fill={COLLAR} stroke={OUTLINE} strokeWidth="2.5" strokeLinejoin="round" />
      {/* Collar tag */}
      <circle cx="50" cy="73" r="4" fill={COLLAR_DEEP} stroke={OUTLINE} strokeWidth="2" />
      {/* Paw print on tag */}
      <g fill="var(--color-bg-card-elevated)">
        <circle cx="50" cy="74" r="1.3" />
        <circle cx="48" cy="71.5" r="0.7" />
        <circle cx="50" cy="71" r="0.7" />
        <circle cx="52" cy="71.5" r="0.7" />
      </g>

      {/* Front legs */}
      <g style={{ transformOrigin: "44px 82px", animation: "pbLegB 4s ease-in-out infinite" }}>
        <rect x="40" y="80" width="8" height="11" rx="4"
          fill={FUR} stroke={OUTLINE} strokeWidth="2.5" strokeLinejoin="round" />
      </g>
      <g style={{ transformOrigin: "56px 82px", animation: "pbLegA 4s ease-in-out infinite" }}>
        <rect x="52" y="80" width="8" height="11" rx="4"
          fill={FUR_DEEP} stroke={OUTLINE} strokeWidth="2.5" strokeLinejoin="round" />
      </g>

      {/* ===== HEAD (large, ~60% of total height) ===== */}
      <g style={{ transformOrigin: "50px 38px", animation: "pbHead 4s ease-in-out infinite" }}>
        {/* Ears */}
        <g style={{ transformOrigin: "32px 22px", animation: "pbEar 4s ease-in-out infinite" }}>
          <path d="M28 28 Q24 8 36 14 L38 28 Z"
            fill={FUR} stroke={OUTLINE} strokeWidth="2.5" strokeLinejoin="round" />
          <path d="M30 24 Q28 14 34 18 L36 26 Z" fill={EAR_INNER} />
        </g>
        <g style={{ transformOrigin: "68px 22px", animation: "pbEar 4s ease-in-out infinite", animationDelay: "0.05s" }}>
          <path d="M72 28 Q76 8 64 14 L62 28 Z"
            fill={FUR} stroke={OUTLINE} strokeWidth="2.5" strokeLinejoin="round" />
          <path d="M70 24 Q72 14 66 18 L64 26 Z" fill={EAR_INNER} />
        </g>

        {/* Round head */}
        <circle cx="50" cy="38" r="22" fill={FUR} stroke={OUTLINE} strokeWidth="2.5" />

        {/* Forehead cream diamond/star mark */}
        <path d="M50 22 L52 26 L50 30 L48 26 Z" fill={CHEST} stroke={OUTLINE} strokeWidth="1.5" strokeLinejoin="round" />

        {/* Cheek blush */}
        <circle cx="36" cy="44" r="4" fill={BLUSH} opacity="0.75" />
        <circle cx="64" cy="44" r="4" fill={BLUSH} opacity="0.75" />

        {/* Eyes — big, dominant */}
        <g style={{ transformOrigin: "42px 38px", animation: "pbEye 4s ease-in-out infinite" }}>
          <circle cx="42" cy="38" r="5" fill="#FFFFFF" stroke={OUTLINE} strokeWidth="2.5" />
          <circle cx="42" cy="38.5" r="3" fill={IRIS} />
          <circle cx="42" cy="39" r="1.4" fill={OUTLINE} />
          <circle cx="40.8" cy="36.8" r="1" fill="#FFFFFF" />
        </g>
        <g style={{ transformOrigin: "58px 38px", animation: "pbEye 4s ease-in-out infinite" }}>
          <circle cx="58" cy="38" r="5" fill="#FFFFFF" stroke={OUTLINE} strokeWidth="2.5" />
          <circle cx="58" cy="38.5" r="3" fill={IRIS} />
          <circle cx="58" cy="39" r="1.4" fill={OUTLINE} />
          <circle cx="56.8" cy="36.8" r="1" fill="#FFFFFF" />
        </g>

        {/* Tiny nose */}
        <ellipse cx="50" cy="46" rx="1.8" ry="1.4" fill={OUTLINE} />

        {/* Small open smile with one tooth */}
        <path d="M46 50 Q50 54 54 50"
          fill="none" stroke={OUTLINE} strokeWidth="2" strokeLinecap="round" />
        <rect x="49.2" y="50.2" width="1.6" height="2" rx="0.4" fill="#FFFFFF" stroke={OUTLINE} strokeWidth="0.7" />

        {/* Tongue (visible during run phase) */}
        <path
          d="M53 51 Q56 54 57 50 Z"
          fill={BLUSH} stroke={OUTLINE} strokeWidth="1.2" strokeLinejoin="round"
          style={{ animation: "pbTongue 4s ease-in-out infinite", transformOrigin: "55px 51px" }}
        />
      </g>
    </svg>
  );
}
