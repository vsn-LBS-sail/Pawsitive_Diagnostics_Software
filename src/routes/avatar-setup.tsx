import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { ArrowLeft, Check, Download, Sparkles } from "lucide-react";
import KawaiiDog, { type EarType, type EyeStyle } from "@/components/KawaiiDog";

export const Route = createFileRoute("/avatar-setup")({
  component: AvatarSetupFlow,
});

/* ────────────────────────────────────────────────────────────────────────
 *  Avatar Setup — onboarding flow for Pawsitive Diagnostics
 *  ────────────────────────────────────────────────────────────────────────
 *  Backend pipeline (for Step 2 → Step 3, documented for integration):
 *    1. Photo upload → Replicate API
 *         model: cjwbw/animegan2-pytorch (or Ghibli LoRA)
 *         returns: Ghibli-style PNG
 *    2. PNG → background vectorisation worker (vtracer, Python/Rust):
 *         colormode=color, filter_speckle=4, color_precision=6,
 *         layer_difference=16, mode=spline, corner_threshold=60,
 *         segment_length=4.0  →  clean multi-colour SVG
 *    3. SVG → Firebase Storage / S3 at avatars/{user_id}/pose_{pose_id}.svg
 *    4. user.avatarStatus = "ready"
 *    5. App listens via Firebase onSnapshot / WebSocket; shimmer card swaps
 *       in the crisp SVG once ready. SVG is reused for profile picture,
 *       sticker pack, dashboard mascot (reacts to health alerts), and
 *       shared social health-report cards.
 * ──────────────────────────────────────────────────────────────────────── */

const ROSE = "var(--color-primary)";
const ROSE_SOFT = "var(--color-border-card)";
const CREAM = "var(--color-bg-app)";
const PINK_BG = "var(--color-bg-card)";
const TEXT = "var(--color-text-primary)";
const MUTED = "var(--color-text-secondary)";

const FONT = "var(--font-body)";

type Screen = "welcome" | 1 | 2 | 3;

type AvatarState = {
  breed: string;
  furColor: string;
  earType: EarType;
  eyeStyle: EyeStyle;
  collarColor: string;
  dogPhotoUploaded: boolean;
  ownerPhotoUploaded: boolean;
  avatarSvgUrl: string | null;
  selectedPose: number | null;
  avatarStatus: "default" | "customised" | "pending" | "ready";
};

const BREEDS: { name: string; emoji: string; fur: string }[] = [
  { name: "Shiba Inu", emoji: "", fur: "#c17d4a" },
  { name: "Toy Poodle", emoji: "", fur: "#d4b896" },
  { name: "Chihuahua", emoji: "", fur: "#c8a070" },
  { name: "Pomeranian", emoji: "", fur: "#d4934e" },
  { name: "Golden Retriever", emoji: "", fur: "#d4a248" },
];

const FUR_COLORS = ["#c17d4a", "#e8c88a", "#f0ede8", "#2a2018", "#9a968e", "#c8941a"];
const COLLAR_COLORS = ["var(--color-primary)", "#7b6fd4", "#2db894", "#4a9fd4", "#c8941a", "#d44a4a"];
const EARS: EarType[] = ["upright", "floppy", "round"];
const EAR_LABELS: Record<EarType, string> = { upright: "Upright", floppy: "Floppy", round: "Round" };
const EYE_GLYPHS = ["oo", "uu", "**", "©©"];

function AvatarSetupFlow() {
  const [screen, setScreen] = useState<Screen>("welcome");
  const [avatar, setAvatar] = useState<AvatarState>({
    breed: "Shiba Inu",
    furColor: "#c17d4a",
    earType: "upright",
    eyeStyle: 0,
    collarColor: "var(--color-primary)",
    dogPhotoUploaded: false,
    ownerPhotoUploaded: false,
    avatarSvgUrl: null,
    selectedPose: null,
    avatarStatus: "default",
  });

  const update = (patch: Partial<AvatarState>) => setAvatar((a) => ({ ...a, ...patch }));

  return (
    <div
      style={{
        minHeight: "100vh",
        background: CREAM,
        color: TEXT,
        fontFamily: FONT,
        display: "flex",
        justifyContent: "center",
      }}
    >
      <div style={{ width: "100%", maxWidth: 430, position: "relative" }}>
        <div key={String(screen)} style={{ animation: "fadeSlide .35s ease both" }}>
          {screen === "welcome" && <Welcome onStart={() => setScreen(1)} avatar={avatar} />}
          {screen === 1 && (
            <Step1
              avatar={avatar}
              update={update}
              onBack={() => setScreen("welcome")}
              onNext={() => {
                update({ avatarStatus: "customised" });
                setScreen(2);
              }}
            />
          )}
          {screen === 2 && (
            <Step2
              avatar={avatar}
              update={update}
              onBack={() => setScreen(1)}
              onNext={() => {
                update({ avatarStatus: "ready" });
                setScreen(3);
              }}
            />
          )}
          {screen === 3 && (
            <Step3
              avatar={avatar}
              update={update}
              onBack={() => setScreen(2)}
            />
          )}
        </div>
      </div>
      <style>{`
        @keyframes fadeSlide { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: none; } }
        @keyframes pop { 0% { transform: scale(.85); } 60% { transform: scale(1.12); } 100% { transform: scale(1); } }
        @keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
        @keyframes spring { 0% { transform: scale(.7); opacity: 0; } 60% { transform: scale(1.08); opacity: 1; } 100% { transform: scale(1); } }
      `}</style>
    </div>
  );
}

/* ───────────────────────────── Welcome ───────────────────────────── */

function Welcome({ onStart, avatar }: { onStart: () => void; avatar: AvatarState }) {
  return (
    <div style={{ padding: "32px 24px 40px", textAlign: "center" }}>
      <Brand />

      <div style={{ position: "relative", display: "inline-block", marginTop: 48 }}>
        <div
          style={{
            width: 220, height: 220, borderRadius: "50%",
            background: "#fff",
            border: `4px solid ${PINK_BG}`,
            boxShadow: "0 12px 40px rgba(232,103,138,0.18)",
            display: "flex", alignItems: "center", justifyContent: "center",
            overflow: "hidden",
          }}
        >
          <KawaiiDog
            furColor={avatar.furColor}
            earType={avatar.earType}
            eyeStyle={avatar.eyeStyle}
            collarColor={avatar.collarColor}
            size={210}
          />
        </div>
        <div
          style={{
            position: "absolute", bottom: 8, right: 4,
            width: 48, height: 48, borderRadius: "50%",
            background: "var(--color-primary)",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 4px 12px rgba(255,183,74,0.5)",
            fontSize: 22,
          }}
        >
          
        </div>
      </div>

      <h1 style={{ fontSize: 28, fontFamily: "var(--font-heading)", fontWeight: 600, margin: "32px 0 8px", color: TEXT }}>
        Welcome to Pawsitive Diagnostics!
      </h1>
      <p style={{ fontSize: 15, color: MUTED, margin: "0 12px 32px", lineHeight: 1.5 }}>
        Create your dog's avatar and get started with smart health monitoring.
      </p>

      <PrimaryButton onClick={onStart}> Create My Dog's Avatar</PrimaryButton>

      <button
        onClick={onStart}
        style={{
          marginTop: 18, background: "none", border: "none",
          color: MUTED, fontSize: 14, textDecoration: "underline",
          fontFamily: FONT, cursor: "pointer",
        }}
      >
        Skip for now
      </button>
    </div>
  );
}

function Brand() {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
      <div style={{ fontSize: 28 }}></div>
      <div style={{ fontSize: 26, fontFamily: "var(--font-heading)", fontWeight: 600, letterSpacing: -0.5, color: TEXT, position: "relative" }}>
        Pawsit<span style={{ position: "relative" }}>
          i
          <span style={{
            position: "absolute", top: -2, left: 2,
            width: 7, height: 7, borderRadius: "50%", background: ROSE,
          }} />
        </span>ve
      </div>
    </div>
  );
}

/* ───────────────────── Shared: Top nav with stepper ───────────────────── */

function StepNav({ step, label, onBack }: { step: 1 | 2 | 3; label: string; onBack: () => void }) {
  return (
    <div style={{ padding: "20px 20px 8px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <button
          onClick={onBack}
          aria-label="Back"
          style={{
            width: 40, height: 40, borderRadius: "50%",
            background: PINK_BG, border: "none", cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: ROSE,
          }}
        >
          <ArrowLeft size={20} />
        </button>

        <div style={{ display: "flex", alignItems: "center", gap: 0 }}>
          {[1, 2, 3].map((n, i) => {
            const completed = n < step;
            const active = n === step;
            const bg = completed ? ROSE_SOFT : active ? ROSE : "#e8e0db";
            const color = completed || active ? "#fff" : "#a89c95";
            return (
              <div key={n} style={{ display: "flex", alignItems: "center" }}>
                <div
                  style={{
                    width: 30, height: 30, borderRadius: "50%",
                    background: bg, color, fontFamily: "var(--font-heading)", fontWeight: 600, fontSize: 13,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    boxShadow: active ? `0 0 0 4px ${PINK_BG}` : "none",
                    transition: "all .25s",
                  }}
                >
                  {completed ? <Check size={14} strokeWidth={3} /> : n}
                </div>
                {i < 2 && (
                  <div
                    style={{
                      width: 26, height: 3, borderRadius: 2,
                      background: n < step ? ROSE_SOFT : "#e8e0db",
                      margin: "0 4px",
                    }}
                  />
                )}
              </div>
            );
          })}
        </div>

        <div style={{ width: 40, height: 40 }} />
      </div>
      <p style={{ textAlign: "center", fontSize: 12, color: MUTED, marginTop: 8 }}>
        Step {step} of 3 · {label}
      </p>
    </div>
  );
}

/* ─────────────────────────── Step 1 ─────────────────────────── */

function Step1({
  avatar, update, onBack, onNext,
}: {
  avatar: AvatarState; update: (p: Partial<AvatarState>) => void;
  onBack: () => void; onNext: () => void;
}) {
  const customRef = useRef<HTMLDivElement>(null);

  return (
    <div style={{ paddingBottom: 120 }}>
      <StepNav step={1} label="Dog Avatar" onBack={onBack} />

      <h2 style={{ textAlign: "center", fontSize: 22, fontFamily: "var(--font-heading)", fontWeight: 600, margin: "8px 16px 16px" }}>
        Create Your Dog's Avatar
      </h2>

      {/* Live preview */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
        <button
          onClick={() => customRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })}
          style={{
            width: 160, height: 160, borderRadius: "50%",
            background: "#fff",
            border: `4px solid ${ROSE}`,
            boxShadow: "0 10px 30px rgba(232,103,138,0.2)",
            cursor: "pointer", padding: 0, overflow: "hidden",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}
          aria-label="Tap to customise"
        >
          <KawaiiDog
            furColor={avatar.furColor}
            earType={avatar.earType}
            eyeStyle={avatar.eyeStyle}
            collarColor={avatar.collarColor}
            size={152}
          />
        </button>
        <p style={{ marginTop: 10, fontSize: 13, color: MUTED }}> Tap to customise</p>
      </div>

      {/* Breed selector */}
      <SectionTitle>Breed</SectionTitle>
      <div
        style={{
          display: "flex", gap: 10, overflowX: "auto",
          padding: "4px 20px 12px", scrollSnapType: "x mandatory",
        }}
      >
        {BREEDS.map((b) => {
          const sel = avatar.breed === b.name;
          return (
            <button
              key={b.name}
              onClick={() => update({ breed: b.name, furColor: b.fur })}
              style={{
                flex: "0 0 auto", scrollSnapAlign: "start",
                width: 92, padding: "12px 6px",
                borderRadius: 18,
                background: sel ? PINK_BG : "#fff",
                border: sel ? `2px solid ${ROSE}` : "2px solid transparent",
                boxShadow: sel ? "0 4px 14px rgba(232,103,138,0.2)" : "0 2px 8px rgba(0,0,0,0.05)",
                cursor: "pointer", fontFamily: FONT,
                animation: sel ? "pop .35s ease" : undefined,
              }}
            >
              <div style={{ fontSize: 28 }}>{b.emoji}</div>
              <div style={{ fontSize: 11, fontFamily: "var(--font-heading)", fontWeight: 600, marginTop: 4, color: TEXT, lineHeight: 1.2 }}>
                {b.name}
              </div>
            </button>
          );
        })}
      </div>

      {/* Customise panel */}
      <div
        ref={customRef}
        style={{
          margin: "16px 16px 0",
          background: "#fff", borderRadius: 24, padding: 20,
          boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
        }}
      >
        <h3 style={{ fontSize: 16, fontFamily: "var(--font-heading)", fontWeight: 600, margin: 0 }}>Customise</h3>

        <Label>Fur Colour</Label>
        <Row>
          {FUR_COLORS.map((c) => (
            <Swatch key={c} color={c} selected={avatar.furColor === c} onClick={() => update({ furColor: c })} />
          ))}
        </Row>

        <Label>Ears</Label>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginTop: 8 }}>
          {EARS.map((e) => {
            const sel = avatar.earType === e;
            return (
              <button
                key={e}
                onClick={() => update({ earType: e })}
                style={{
                  height: 44, borderRadius: 999,
                  background: sel ? PINK_BG : "#faf5f2",
                  border: sel ? `2px solid ${ROSE}` : "2px solid #f0e6e0",
                  color: sel ? ROSE : TEXT,
                  fontWeight: 600, fontSize: 14, fontFamily: FONT,
                  cursor: "pointer",
                }}
              >
                {EAR_LABELS[e]}
              </button>
            );
          })}
        </div>

        <Label>Eyes</Label>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8, marginTop: 8 }}>
          {EYE_GLYPHS.map((g, i) => {
            const sel = avatar.eyeStyle === i;
            return (
              <button
                key={g}
                onClick={() => update({ eyeStyle: i as EyeStyle })}
                style={{
                  height: 48, borderRadius: 14,
                  background: sel ? PINK_BG : "#faf5f2",
                  border: sel ? `2px solid ${ROSE}` : "2px solid #f0e6e0",
                  color: sel ? ROSE : TEXT,
                  fontWeight: 600, fontSize: 16, fontFamily: FONT,
                  cursor: "pointer",
                }}
                aria-label={`Eye style ${i + 1}`}
              >
                {g}
              </button>
            );
          })}
        </div>

        <Label>Collar Colour</Label>
        <Row>
          {COLLAR_COLORS.map((c) => (
            <Swatch key={c} color={c} selected={avatar.collarColor === c} onClick={() => update({ collarColor: c })} />
          ))}
        </Row>
      </div>

      <p style={{ textAlign: "center", fontSize: 12, color: MUTED, margin: "16px 0 0" }}>
        You can change this later
      </p>

      <BottomBar>
        <PrimaryButton onClick={onNext}> Next →</PrimaryButton>
      </BottomBar>
    </div>
  );
}

/* ─────────────────────────── Step 2 ─────────────────────────── */

function Step2({
  avatar, update, onBack, onNext,
}: {
  avatar: AvatarState; update: (p: Partial<AvatarState>) => void;
  onBack: () => void; onNext: () => void;
}) {
  return (
    <div style={{ paddingBottom: 120 }}>
      <StepNav step={2} label="Photos" onBack={onBack} />

      <div style={{ padding: "8px 20px 0", textAlign: "center" }}>
        <h2 style={{ fontSize: 22, fontFamily: "var(--font-heading)", fontWeight: 600, margin: "8px 0 6px" }}>Add Your Photos</h2>
        <p style={{ fontSize: 14, color: MUTED, lineHeight: 1.5, margin: 0 }}>
          Upload photos of your dog and yourself. We'll transform them into a beautiful illustrated art duo 
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, padding: "20px" }}>
        <UploadCard
          label="Your Dog"
          emoji=""
          uploaded={avatar.dogPhotoUploaded}
          onUpload={() => update({ dogPhotoUploaded: true })}
        />
        <UploadCard
          label="You (Owner)"
          emoji=""
          uploaded={avatar.ownerPhotoUploaded}
          onUpload={() => update({ ownerPhotoUploaded: true })}
        />
      </div>

      <div style={{ margin: "0 20px", background: PINK_BG, borderRadius: 18, padding: 16 }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
          <div style={{ fontSize: 22 }}></div>
          <div style={{ fontSize: 13, color: TEXT, lineHeight: 1.5 }}>
            <b>How it works:</b> Your photos are sent to an illustration AI model. The result is a soft,
            painterly anime illustration — not a realistic photo. Best results with clear, well-lit face shots.
          </div>
        </div>
      </div>

      <div
        style={{
          margin: "12px 20px 0",
          background: "#fff5e8",
          border: "1.5px dashed #e8a96a",
          borderRadius: 14,
          padding: 12,
          fontSize: 11.5,
          color: "#7a4f24",
          lineHeight: 1.55,
          fontFamily: "'Quicksand', monospace",
        }}
      >
        <b>Integration:</b> Replicate API → <code>animegan2-pytorch</code> model. Returns illustrated PNG.
        PNG is silently converted to SVG in the background using <code>vtracer</code> (color mode, spline
        curves) for crisp rendering at all sizes. SVG is stored and served back to the app.
      </div>

      <div style={{ margin: "20px 20px 0" }}>
        <p style={{ fontSize: 13, color: MUTED, fontFamily: "var(--font-heading)", fontWeight: 600, margin: "0 0 10px" }}>
          Or skip & use your avatar
        </p>
        <div
          style={{
            display: "flex", alignItems: "center", gap: 12,
            background: "#fff", padding: 12, borderRadius: 16,
            boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
          }}
        >
          <div
            style={{
              width: 56, height: 56, borderRadius: "50%",
              background: PINK_BG, overflow: "hidden",
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <KawaiiDog
              furColor={avatar.furColor}
              earType={avatar.earType}
              eyeStyle={avatar.eyeStyle}
              collarColor={avatar.collarColor}
              size={56}
              showCollar={false}
            />
          </div>
          <p style={{ fontSize: 12, color: MUTED, margin: 0, lineHeight: 1.5 }}>
            Your customised dog avatar will be used as a fallback for your sticker pack.
          </p>
        </div>
      </div>

      <BottomBar>
        <PrimaryButton onClick={onNext}>
          <Sparkles size={18} style={{ marginRight: 6 }} /> Generate Poses →
        </PrimaryButton>
      </BottomBar>
    </div>
  );
}

function UploadCard({ label, emoji, uploaded, onUpload }: {
  label: string; emoji: string; uploaded: boolean; onUpload: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const handle = () => {
    if (uploaded) return;
    setLoading(true);
    setTimeout(() => { setLoading(false); onUpload(); }, 900);
  };
  return (
    <button
      onClick={handle}
      style={{
        aspectRatio: "1 / 1",
        background: uploaded ? PINK_BG : "#fff",
        border: uploaded ? `2px solid ${ROSE}` : "2px dashed #e8c5cf",
        borderRadius: 20,
        cursor: "pointer", fontFamily: FONT,
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        padding: 12, position: "relative", overflow: "hidden",
      }}
    >
      {loading ? (
        <div
          style={{
            width: "80%", height: "80%", borderRadius: 14,
            background: "linear-gradient(90deg, #f7e3eb 0%, #fff 50%, #f7e3eb 100%)",
            backgroundSize: "200% 100%",
            animation: "shimmer 1.2s linear infinite",
          }}
        />
      ) : uploaded ? (
        <>
          <div
            style={{
              width: "80%", height: "70%", borderRadius: 14,
              background: `linear-gradient(135deg, #ffd1dc, #c8e6f0)`,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 44,
            }}
          >
            {emoji}
          </div>
          <div style={{ fontSize: 12, color: ROSE, fontFamily: "var(--font-heading)", fontWeight: 600, marginTop: 8 }}>
            ✓ {label}
          </div>
        </>
      ) : (
        <>
          <div style={{ fontSize: 48 }}>{emoji}</div>
          <div style={{ fontSize: 13, fontFamily: "var(--font-heading)", fontWeight: 600, color: TEXT, marginTop: 8 }}>{label}</div>
          <div style={{ fontSize: 11, color: MUTED, marginTop: 2 }}>Tap to upload photo</div>
        </>
      )}
    </button>
  );
}

/* ─────────────────────────── Step 3 ─────────────────────────── */

type Pose = {
  id: number;
  name: string;
  emoji: string;
  bg: string;
  tag: "Solo" | "Duo";
  featured?: boolean;
};

const POSES: Pose[] = [
  { id: 0, name: "Pure joy!", emoji: "", bg: "var(--color-bg-card)", tag: "Solo", featured: true },
  { id: 1, name: "Ball time", emoji: "", bg: "#fff5d6", tag: "Solo" },
  { id: 2, name: "Nap mode", emoji: "", bg: "#e3f0fa", tag: "Solo" },
  { id: 3, name: "Walk together", emoji: "", bg: "#e3f5e6", tag: "Duo" },
  { id: 4, name: "Cuddle time", emoji: "", bg: "var(--color-bg-card)", tag: "Duo" },
  { id: 5, name: "Adventure!", emoji: "", bg: "#fff5d6", tag: "Duo" },
];

function Step3({
  avatar, update, onBack,
}: {
  avatar: AvatarState; update: (p: Partial<AvatarState>) => void; onBack: () => void;
}) {
  const nav = useNavigate();
  const selected = POSES.find((p) => p.id === avatar.selectedPose) ?? POSES[0];

  const featured = POSES[0];
  const rest = POSES.slice(1);

  return (
    <div style={{ paddingBottom: 120 }}>
      <StepNav step={3} label="Sticker Pack" onBack={onBack} />

      <div style={{ padding: "8px 20px 0", textAlign: "center" }}>
        <h2 style={{ fontSize: 22, fontFamily: "var(--font-heading)", fontWeight: 600, margin: "8px 0 6px" }}>Your Avatar Sticker Pack</h2>
        <p style={{ fontSize: 14, color: MUTED, lineHeight: 1.5, margin: 0 }}>
          Your avatar duo across different moods and moments 
        </p>
      </div>

      {/* Set as profile bar */}
      <div
        style={{
          margin: "16px 20px",
          background: "#fff", borderRadius: 18, padding: 12,
          display: "flex", alignItems: "center", gap: 12,
          boxShadow: "0 2px 12px rgba(0,0,0,0.05)",
        }}
      >
        <div
          style={{
            width: 48, height: 48, borderRadius: "50%",
            background: selected.bg, display: "flex",
            alignItems: "center", justifyContent: "center",
            fontSize: 24, flexShrink: 0,
          }}
        >
          {selected.emoji}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, fontFamily: "var(--font-heading)", fontWeight: 600, color: TEXT }}>Set as profile picture</div>
          <div style={{ fontSize: 11, color: MUTED, marginTop: 2 }}>Tap any pose below</div>
        </div>
        <button
          style={{
            background: ROSE, color: "#fff", border: "none",
            padding: "8px 16px", borderRadius: 999,
            fontWeight: 600, fontSize: 13, fontFamily: FONT, cursor: "pointer",
          }}
        >
          Set ✓
        </button>
      </div>

      {/* Featured card */}
      <div style={{ padding: "0 20px" }}>
        <PoseCard
          pose={featured}
          selected={avatar.selectedPose === featured.id}
          onSelect={() => update({ selectedPose: featured.id })}
          variant="featured"
        />
      </div>

      {/* Grid */}
      <div
        style={{
          display: "grid", gridTemplateColumns: "1fr 1fr",
          gap: 12, padding: "12px 20px 0",
        }}
      >
        {rest.map((p) => (
          <PoseCard
            key={p.id}
            pose={p}
            selected={avatar.selectedPose === p.id}
            onSelect={() => update({ selectedPose: p.id })}
          />
        ))}
      </div>

      <BottomBar>
        <PrimaryButton onClick={() => nav({ to: "/home" })}>
           Done! Go to Dashboard →
        </PrimaryButton>
      </BottomBar>
    </div>
  );
}

function PoseCard({
  pose, selected, onSelect, variant = "grid",
}: {
  pose: Pose; selected: boolean; onSelect: () => void; variant?: "grid" | "featured";
}) {
  const tagBg = pose.tag === "Solo" ? "#ffb74a" : ROSE;
  return (
    <button
      onClick={onSelect}
      style={{
        position: "relative", padding: 0, border: "none",
        background: "transparent", cursor: "pointer", fontFamily: FONT,
        textAlign: "left",
        animation: selected ? "spring .35s cubic-bezier(.34,1.56,.64,1)" : undefined,
      }}
    >
      <div
        style={{
          borderRadius: 20, overflow: "hidden", background: "#fff",
          boxShadow: selected
            ? `0 0 0 3px ${ROSE}, 0 8px 24px rgba(232,103,138,0.25)`
            : "0 4px 14px rgba(0,0,0,0.06)",
          transition: "box-shadow .25s",
        }}
      >
        <div
          style={{
            position: "relative",
            background: pose.bg,
            aspectRatio: variant === "featured" ? "16 / 9" : "1 / 1",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: variant === "featured" ? 76 : 52,
          }}
        >
          {pose.emoji}
          <div
            style={{
              position: "absolute", top: 10, right: 10,
              width: 32, height: 32, borderRadius: "50%",
              background: "rgba(255,255,255,0.85)",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
            }}
          >
            <Download size={15} color={TEXT} />
          </div>
        </div>
        <div
          style={{
            padding: "10px 12px", display: "flex",
            alignItems: "center", justifyContent: "space-between", gap: 8,
          }}
        >
          <span style={{ fontFamily: "var(--font-heading)", fontWeight: 600, fontSize: 13, color: TEXT }}>{pose.name}</span>
          <span
            style={{
              fontSize: 10, fontFamily: "var(--font-heading)", fontWeight: 600, color: "#fff",
              background: tagBg, padding: "3px 8px", borderRadius: 999,
            }}
          >
            {pose.tag === "Solo" ? " Solo" : " Duo"}
          </span>
        </div>
      </div>
    </button>
  );
}

/* ───────────────────────── Reusable bits ───────────────────────── */

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 style={{ fontSize: 14, fontFamily: "var(--font-heading)", fontWeight: 600, color: TEXT, margin: "20px 20px 6px" }}>
      {children}
    </h3>
  );
}
function Label({ children }: { children: React.ReactNode }) {
  return <div style={{ fontSize: 12, fontFamily: "var(--font-heading)", fontWeight: 600, color: MUTED, marginTop: 16 }}>{children}</div>;
}
function Row({ children }: { children: React.ReactNode }) {
  return <div style={{ display: "flex", gap: 12, marginTop: 8, flexWrap: "wrap" }}>{children}</div>;
}
function Swatch({ color, selected, onClick }: { color: string; selected: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      aria-label={color}
      style={{
        width: selected ? 38 : 34, height: selected ? 38 : 34,
        borderRadius: "50%", background: color, border: "none", cursor: "pointer",
        boxShadow: selected
          ? `0 0 0 3px #fff, 0 0 0 5px ${ROSE}, 0 4px 10px rgba(0,0,0,0.15)`
          : "0 2px 6px rgba(0,0,0,0.15)",
        transition: "all .2s",
        animation: selected ? "pop .35s ease" : undefined,
      }}
    />
  );
}

function PrimaryButton({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        width: "100%", padding: "16px 20px",
        background: `linear-gradient(135deg, ${ROSE} 0%, #f08aa8 100%)`,
        color: "#fff", border: "none", borderRadius: 999,
        fontWeight: 600, fontSize: 16, fontFamily: FONT,
        cursor: "pointer", display: "flex",
        alignItems: "center", justifyContent: "center",
        boxShadow: "0 8px 20px rgba(232,103,138,0.35)",
        transition: "transform .15s, box-shadow .2s",
      }}
      onMouseDown={(e) => (e.currentTarget.style.transform = "scale(0.97)")}
      onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
      onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
    >
      {children}
    </button>
  );
}

function BottomBar({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        position: "fixed", bottom: 0, left: 0, right: 0,
        display: "flex", justifyContent: "center", pointerEvents: "none",
      }}
    >
      <div
        style={{
          width: "100%", maxWidth: 430, padding: "20px",
          background: `linear-gradient(to top, ${CREAM} 60%, transparent)`,
          pointerEvents: "auto",
        }}
      >
        {children}
      </div>
    </div>
  );
}
