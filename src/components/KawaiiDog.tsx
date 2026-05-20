/**
 * Kawaii / anime-style parametric dog SVG.
 * All visual traits are driven by props so the avatar updates live as the
 * user customises breed, fur, ears, eyes, and collar in the Avatar Setup flow.
 */
export type EarType = "upright" | "floppy" | "round";
export type EyeStyle = 0 | 1 | 2 | 3; // round | droopy | sparkle | cool

type Props = {
  furColor?: string;
  earType?: EarType;
  eyeStyle?: EyeStyle;
  collarColor?: string;
  size?: number;
  showCollar?: boolean;
  showBlush?: boolean;
};

export default function KawaiiDog({
  furColor = "#c17d4a",
  earType = "upright",
  eyeStyle = 0,
  collarColor = "var(--color-primary)",
  size = 160,
  showCollar = true,
  showBlush = true,
}: Props) {
  const innerEar = shade(furColor, -20);
  const muzzle = tint(furColor, 35);
  const eyeDark = "#1a1410";

  return (
    <svg viewBox="0 0 200 200" width={size} height={size} style={{ display: "block" }}>
      <defs>
        <radialGradient id="kd-bg" cx="50%" cy="42%" r="62%">
          <stop offset="0%" stopColor="var(--color-bg-app)" />
          <stop offset="100%" stopColor="var(--color-bg-card-elevated)" />
        </radialGradient>
      </defs>

      {/* Ears (behind head) */}
      {earType === "upright" && (
        <g>
          <path d="M55 70 L48 28 L82 60 Z" fill={furColor} />
          <path d="M55 65 L52 38 L74 58 Z" fill={innerEar} opacity="0.7" />
          <path d="M145 70 L152 28 L118 60 Z" fill={furColor} />
          <path d="M145 65 L148 38 L126 58 Z" fill={innerEar} opacity="0.7" />
        </g>
      )}
      {earType === "floppy" && (
        <g>
          <ellipse cx="52" cy="100" rx="20" ry="36" fill={furColor} transform="rotate(-15 52 100)" />
          <ellipse cx="148" cy="100" rx="20" ry="36" fill={furColor} transform="rotate(15 148 100)" />
          <ellipse cx="52" cy="108" rx="10" ry="22" fill={innerEar} opacity="0.6" transform="rotate(-15 52 108)" />
          <ellipse cx="148" cy="108" rx="10" ry="22" fill={innerEar} opacity="0.6" transform="rotate(15 148 108)" />
        </g>
      )}
      {earType === "round" && (
        <g>
          <circle cx="56" cy="68" r="26" fill={furColor} />
          <circle cx="144" cy="68" r="26" fill={furColor} />
          <circle cx="56" cy="72" r="14" fill={innerEar} opacity="0.75" />
          <circle cx="144" cy="72" r="14" fill={innerEar} opacity="0.75" />
        </g>
      )}

      {/* Head */}
      <ellipse cx="100" cy="108" rx="62" ry="58" fill={furColor} />

      {/* Muzzle */}
      <ellipse cx="100" cy="138" rx="34" ry="22" fill={muzzle} />

      {/* Blush */}
      {showBlush && (
        <>
          <ellipse cx="56" cy="130" rx="11" ry="7" fill="#ff9fb5" opacity="0.55" />
          <ellipse cx="144" cy="130" rx="11" ry="7" fill="#ff9fb5" opacity="0.55" />
        </>
      )}

      {/* Eyes */}
      <Eyes style={eyeStyle} color={eyeDark} />

      {/* Nose */}
      <ellipse cx="100" cy="128" rx="7" ry="5.5" fill="#1a1410" />
      <ellipse cx="98" cy="126" rx="2" ry="1.3" fill="#fff" opacity="0.7" />

      {/* Mouth */}
      <path d="M100 134 L100 142" stroke="#1a1410" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M92 144 Q100 152 108 144" stroke="#1a1410" strokeWidth="1.8" fill="none" strokeLinecap="round" />
      {/* Tongue */}
      <path d="M97 148 Q100 154 103 148 Z" fill="#ff6f87" />

      {/* Collar */}
      {showCollar && (
        <g>
          <rect x="40" y="168" width="120" height="14" rx="7" fill={collarColor} />
          <circle cx="100" cy="186" r="7" fill={collarColor} />
          <circle cx="100" cy="186" r="3.5" fill="#fff" opacity="0.85" />
        </g>
      )}
    </svg>
  );
}

function Eyes({ style, color }: { style: EyeStyle; color: string }) {
  const lx = 78, rx = 122, y = 108;
  if (style === 0) {
    // round cute oo
    return (
      <g>
        {[lx, rx].map((cx) => (
          <g key={cx}>
            <circle cx={cx} cy={y} r="9" fill={color} />
            <circle cx={cx + 3} cy={y - 3} r="2.8" fill="#fff" />
            <circle cx={cx - 2.5} cy={y + 3} r="1.4" fill="#fff" opacity="0.8" />
          </g>
        ))}
      </g>
    );
  }
  if (style === 1) {
    // droopy uu — half-closed downward arcs
    return (
      <g stroke={color} strokeWidth="3.5" fill="none" strokeLinecap="round">
        <path d={`M${lx - 9} ${y - 2} Q${lx} ${y + 8} ${lx + 9} ${y - 2}`} />
        <path d={`M${rx - 9} ${y - 2} Q${rx} ${y + 8} ${rx + 9} ${y - 2}`} />
      </g>
    );
  }
  if (style === 2) {
    // sparkle ** — star eyes
    return (
      <g>
        {[lx, rx].map((cx) => (
          <g key={cx}>
            <circle cx={cx} cy={y} r="9" fill={color} />
            <path d={`M${cx} ${y - 7} L${cx + 2} ${y - 2} L${cx + 7} ${y} L${cx + 2} ${y + 2} L${cx} ${y + 7} L${cx - 2} ${y + 2} L${cx - 7} ${y} L${cx - 2} ${y - 2} Z`} fill="#fff" />
            <circle cx={cx} cy={y} r="1.6" fill="#ffd966" />
          </g>
        ))}
      </g>
    );
  }
  // cool ©© — sunglasses
  return (
    <g>
      <rect x={lx - 14} y={y - 7} width="28" height="14" rx="6" fill={color} />
      <rect x={rx - 14} y={y - 7} width="28" height="14" rx="6" fill={color} />
      <rect x={lx + 14} y={y - 1} width="8" height="3" fill={color} />
      <rect x={lx - 11} y={y - 4} width="6" height="3" rx="1" fill="#fff" opacity="0.5" />
      <rect x={rx - 11} y={y - 4} width="6" height="3" rx="1" fill="#fff" opacity="0.5" />
    </g>
  );
}

function clamp(n: number) { return Math.max(0, Math.min(255, n)); }
function shade(hex: string, pct: number) {
  const { r, g, b } = hexToRgb(hex);
  const f = 1 + pct / 100;
  return rgbToHex(clamp(r * f), clamp(g * f), clamp(b * f));
}
function tint(hex: string, amount: number) {
  const { r, g, b } = hexToRgb(hex);
  return rgbToHex(clamp(r + amount), clamp(g + amount), clamp(b + amount));
}
function hexToRgb(hex: string) {
  const h = hex.replace("#", "");
  return {
    r: parseInt(h.slice(0, 2), 16),
    g: parseInt(h.slice(2, 4), 16),
    b: parseInt(h.slice(4, 6), 16),
  };
}
function rgbToHex(r: number, g: number, b: number) {
  const to = (n: number) => Math.round(n).toString(16).padStart(2, "0");
  return `#${to(r)}${to(g)}${to(b)}`;
}
