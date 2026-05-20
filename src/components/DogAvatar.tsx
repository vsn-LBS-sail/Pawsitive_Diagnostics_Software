import { useEffect, useRef } from "react";

export type BreedKey = "shiba" | "poodle" | "chihuahua" | "pomeranian" | "golden" | "dachshund" | "frenchie" | "yorkie" | "mixed";
export type EarStyle = "upright" | "floppy" | "round";
export type EyeStyle = "round" | "happy" | "sparkle" | "soft";

export const BREED_DEFAULTS: Record<BreedKey, { fur: string; ear: EarStyle }> = {
  shiba: { fur: "#C4813A", ear: "upright" },
  poodle: { fur: "#F5D5A0", ear: "floppy" },
  chihuahua: { fur: "#D4A87A", ear: "round" },
  pomeranian: { fur: "#F2C878", ear: "round" },
  golden: { fur: "#D4A843", ear: "floppy" },
  dachshund: { fur: "#7A4A2A", ear: "floppy" },
  frenchie: { fur: "#9A8A80", ear: "round" },
  yorkie: { fur: "#5A4030", ear: "floppy" },
  mixed: { fur: "#C4813A", ear: "upright" },
};

export const BREED_KEY_BY_JP: Record<string, BreedKey> = {
  "柴犬": "shiba",
  "トイプードル": "poodle",
  "チワワ": "chihuahua",
  "ポメラニアン": "pomeranian",
  "ゴールデンレトリバー": "golden",
  "ミニチュアダックスフンド": "dachshund",
  "フレンチブルドッグ": "frenchie",
  "ヨークシャーテリア": "yorkie",
  "ミックス犬": "mixed",
};

type Props = {
  breed?: BreedKey;
  furColor?: string;
  earStyle?: EarStyle;
  eyeStyle?: EyeStyle;
  collarColor?: string;
  size?: number;
  showCollar?: boolean;
  showCheeks?: boolean;
  ring?: boolean;
  onTap?: () => void;
};

/**
 * Pure SVG kawaii dog face. No emojis, no text, scales 32–200px.
 * viewBox is 100x100 — all coordinates are unitless and scale with `size`.
 */
export default function DogAvatar({
  breed = "shiba",
  furColor,
  earStyle,
  eyeStyle = "round",
  collarColor = "var(--color-primary)",
  size = 160,
  showCollar = true,
  showCheeks = true,
  ring = true,
  onTap,
}: Props) {
  const fur = furColor ?? BREED_DEFAULTS[breed].fur;
  const ear = earStyle ?? BREED_DEFAULTS[breed].ear;
  const innerEar = "#E8A8A0";
  const noseDark = "#2C2C2C";
  const mouthBrown = "#8B5C2A";
  const isDark = isDarkColor(fur);
  const eyeColor = isDark ? "#1A1A1A" : "#2C2C2C";

  const wrapRef = useRef<HTMLDivElement>(null);
  const prevBreed = useRef(breed);
  useEffect(() => {
    if (prevBreed.current !== breed && wrapRef.current) {
      wrapRef.current.animate(
        [{ transform: "rotate(0)" }, { transform: "rotate(360deg)" }],
        { duration: 400, easing: "cubic-bezier(.34,1.56,.64,1)" }
      );
      prevBreed.current = breed;
    }
  }, [breed]);

  const handleTap = () => {
    if (wrapRef.current) {
      wrapRef.current.animate(
        [
          { transform: "rotate(0)" },
          { transform: "rotate(-5deg)" },
          { transform: "rotate(5deg)" },
          { transform: "rotate(-3deg)" },
          { transform: "rotate(3deg)" },
          { transform: "rotate(0)" },
        ],
        { duration: 500, easing: "ease-in-out" }
      );
    }
    onTap?.();
  };

  // Fluffy halo for fluffy breeds
  const fluffy = breed === "pomeranian" || breed === "poodle";

  return (
    <div
      ref={wrapRef}
      onClick={handleTap}
      className="inline-block shrink-0"
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: "#FFFFFF",
        border: ring ? "3px solid var(--color-border-card)" : "none",
        boxShadow: ring ? "0 8px 32px rgba(68,127,152,0.25)" : "none",
        overflow: "hidden",
        cursor: onTap ? "pointer" : "default",
        animation: "dogPop .4s cubic-bezier(.34,1.56,.64,1)",
      }}
    >
      <svg viewBox="0 0 100 100" width="100%" height="100%" style={{ display: "block" }}>
        <defs>
          <radialGradient id={`bg-${size}`} cx="50%" cy="40%" r="60%">
            <stop offset="0%" stopColor="var(--color-bg-app)" />
            <stop offset="100%" stopColor="var(--color-bg-card-elevated)" />
          </radialGradient>
        </defs>
        <rect width="100" height="100" fill={`url(#bg-${size})`} />

        {/* Fluffy halo */}
        {fluffy && (
          <g style={{ transition: "fill .3s ease" }}>
            {[18, 30, 42, 55, 68, 80, 25, 75, 50].map((cx, i) => (
              <circle
                key={i}
                cx={cx}
                cy={i < 6 ? 32 : 26}
                r={i < 6 ? 9 : 7}
                fill={fur}
                opacity={0.95}
              />
            ))}
          </g>
        )}

        {/* Ears */}
        {ear === "upright" && (
          <g style={{ transition: "fill .3s ease" }}>
            <g transform="translate(20 18) rotate(-10)">
              <path d="M0 30 L8 0 L16 30 Z" fill={fur} />
              <path d="M4 26 L8 10 L12 26 Z" fill={innerEar} />
            </g>
            <g transform="translate(64 18) rotate(10)">
              <path d="M0 30 L8 0 L16 30 Z" fill={fur} />
              <path d="M4 26 L8 10 L12 26 Z" fill={innerEar} />
            </g>
          </g>
        )}
        {ear === "floppy" && (
          <g style={{ transition: "fill .3s ease" }}>
            <rect x="14" y="30" width="16" height="32" rx="8" fill={fur} />
            <rect x="70" y="30" width="16" height="32" rx="8" fill={fur} />
            <rect x="18" y="38" width="8" height="18" rx="4" fill={innerEar} opacity="0.7" />
            <rect x="74" y="38" width="8" height="18" rx="4" fill={innerEar} opacity="0.7" />
          </g>
        )}
        {ear === "round" && (
          <g style={{ transition: "fill .3s ease" }}>
            <circle cx="22" cy="32" r="13" fill={fur} />
            <circle cx="78" cy="32" r="13" fill={fur} />
            <circle cx="22" cy="34" r="7" fill={innerEar} opacity="0.8" />
            <circle cx="78" cy="34" r="7" fill={innerEar} opacity="0.8" />
          </g>
        )}

        {/* Head */}
        <circle cx="50" cy="55" r="32" fill={fur} style={{ transition: "fill .3s ease" }} />

        {/* Shiba cream patch */}
        {breed === "shiba" && (
          <ellipse cx="50" cy="74" rx="22" ry="11" fill="#F5E6D0" />
        )}
        {/* Golden lighter muzzle */}
        {(breed === "golden" || breed === "poodle") && (
          <ellipse cx="50" cy="72" rx="18" ry="9" fill="#FFFFFF" opacity="0.35" />
        )}

        {/* Cheek blush */}
        {showCheeks && (
          <>
            <circle cx="28" cy="64" r="6" fill="#A8CCD8" opacity="0.6" />
            <circle cx="72" cy="64" r="6" fill="#A8CCD8" opacity="0.6" />
          </>
        )}

        {/* Eyebrows */}
        <path d="M33 44 Q38 41 43 44" stroke="#8B5C2A" strokeWidth="1.2" fill="none" strokeLinecap="round" opacity="0.5" />
        <path d="M57 44 Q62 41 67 44" stroke="#8B5C2A" strokeWidth="1.2" fill="none" strokeLinecap="round" opacity="0.5" />

        {/* Eyes */}
        {eyeStyle === "happy" ? (
          <>
            <path d="M33 52 Q38 57 43 52" stroke={eyeColor} strokeWidth="2.5" fill="none" strokeLinecap="round" />
            <path d="M57 52 Q62 57 67 52" stroke={eyeColor} strokeWidth="2.5" fill="none" strokeLinecap="round" />
          </>
        ) : eyeStyle === "sparkle" ? (
          <>
            <Eye cx={38} cy={53} color={eyeColor} sparkle />
            <Eye cx={62} cy={53} color={eyeColor} sparkle />
          </>
        ) : (
          <>
            <Eye cx={38} cy={53} color={eyeColor} />
            <Eye cx={62} cy={53} color={eyeColor} />
          </>
        )}

        {/* Nose (inverted heart) */}
        <g>
          <circle cx="47" cy="65" r="3" fill={noseDark} />
          <circle cx="53" cy="65" r="3" fill={noseDark} />
          <path d="M44 66 L56 66 L50 73 Z" fill={noseDark} />
          <circle cx="48.5" cy="64" r="0.8" fill="#FFFFFF" opacity="0.8" />
        </g>

        {/* Mouth */}
        <path d="M44 76 Q50 80 56 76" stroke={mouthBrown} strokeWidth="1.6" fill="none" strokeLinecap="round" />
        <path d="M50 73 L50 76" stroke={mouthBrown} strokeWidth="1.4" strokeLinecap="round" />

        {/* Collar */}
        {showCollar && (
          <g style={{ transition: "fill .3s ease" }}>
            <rect x="22" y="84" width="56" height="9" rx="4.5" fill={collarColor} />
            <circle cx="50" cy="88.5" r="3.2" fill="#FFFFFF" opacity="0.9" />
            <circle cx="50" cy="88.5" r="1.6" fill={collarColor} />
          </g>
        )}
      </svg>
      <style>{`@keyframes dogPop { 0% { transform: scale(.5); opacity: 0; } 100% { transform: scale(1); opacity: 1; } }`}</style>
    </div>
  );
}

function Eye({ cx, cy, color, sparkle }: { cx: number; cy: number; color: string; sparkle?: boolean }) {
  return (
    <g>
      <circle cx={cx} cy={cy} r="5" fill={color} />
      <circle cx={cx + 1.6} cy={cy - 1.6} r="1.6" fill="#FFFFFF" />
      {sparkle && <circle cx={cx - 1.5} cy={cy + 1.5} r="0.8" fill="#FFFFFF" opacity="0.8" />}
    </g>
  );
}

function isDarkColor(hex: string) {
  const c = hex.replace("#", "");
  const r = parseInt(c.slice(0, 2), 16);
  const g = parseInt(c.slice(2, 4), 16);
  const b = parseInt(c.slice(4, 6), 16);
  return (r * 299 + g * 587 + b * 114) / 1000 < 90;
}
