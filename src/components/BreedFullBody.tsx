import type { BreedKey } from "@/components/DogAvatar";

type Props = { breed: BreedKey; height?: number };

/**
 * Full-body cute flat-style dog illustrations per breed.
 * Drawn on a 200x200 viewBox, sitting/standing 3/4 view.
 * Soft pink/cream palette to match app theme.
 */
export default function BreedFullBody({ breed, height = 160 }: Props) {
  const C = getColors(breed);
  return (
    <svg viewBox="0 0 200 200" height={height} width={height} style={{ display: "block", overflow: "visible" }}>
      {/* soft ground shadow */}
      <ellipse cx="100" cy="184" rx="58" ry="6" fill="#000" opacity="0.08" />
      {renderBreed(breed, C)}
    </svg>
  );
}

type Palette = {
  fur: string;
  furDeep: string;
  belly: string;
  ear: string;
  nose: string;
  collar: string;
};

function getColors(breed: BreedKey): Palette {
  const base: Record<BreedKey, Partial<Palette>> = {
    golden:     { fur: "#E8B96A", furDeep: "#C89A4E", belly: "#F5DDA6", ear: "#B8843C" },
    shiba:      { fur: "#D69354", furDeep: "#A86A2E", belly: "#F5E1C8", ear: "#8E5320" },
    poodle:     { fur: "#F5E2C8", furDeep: "#D9C09E", belly: "#FFF1DC", ear: "#C8A878" },
    chihuahua:  { fur: "#D9B084", furDeep: "#B0875A", belly: "#F2DCBE", ear: "#8E6238" },
    pomeranian: { fur: "#F2C878", furDeep: "#D6A248", belly: "#FFE6B0", ear: "#B88030" },
    frenchie:   { fur: "#B8A89E", furDeep: "#857168", belly: "#EDE2DC", ear: "#6E5A50" },
    yorkie:     { fur: "#7A5238", furDeep: "#4E3220", belly: "#C49A6A", ear: "#3A2418" },
    dachshund:  { fur: "#8A4E22", furDeep: "#5E3210", belly: "#D69A60", ear: "#4A2810" },
    mixed:      { fur: "#D69354", furDeep: "#A86A2E", belly: "#F5E1C8", ear: "#8E5320" },
  };
  return {
    nose: "#2A1E18",
    collar: "#E8829A",
    fur: "#D69354",
    furDeep: "#A86A2E",
    belly: "#F5E1C8",
    ear: "#8E5320",
    ...base[breed],
  };
}

function renderBreed(breed: BreedKey, C: Palette) {
  // Common pieces composed per breed for variety.
  switch (breed) {
    case "dachshund":
      return <Dachshund C={C} />;
    case "frenchie":
      return <Frenchie C={C} />;
    case "poodle":
      return <Poodle C={C} />;
    case "pomeranian":
      return <Pomeranian C={C} />;
    case "yorkie":
      return <Yorkie C={C} />;
    case "chihuahua":
      return <Chihuahua C={C} />;
    case "shiba":
      return <Shiba C={C} />;
    case "golden":
    case "mixed":
    default:
      return <Golden C={C} />;
  }
}

/* --- Shared face features --- */
function Face({ cx, cy, C, scale = 1 }: { cx: number; cy: number; C: Palette; scale?: number }) {
  const s = scale;
  return (
    <g transform={`translate(${cx} ${cy}) scale(${s})`}>
      {/* eyes */}
      <circle cx={-10} cy={-2} r="2.6" fill="#1A1410" />
      <circle cx={10} cy={-2} r="2.6" fill="#1A1410" />
      <circle cx={-9} cy={-3} r="0.9" fill="#fff" />
      <circle cx={11} cy={-3} r="0.9" fill="#fff" />
      {/* blush */}
      <circle cx={-14} cy={6} r="3.5" fill="#FFB7C5" opacity="0.55" />
      <circle cx={14} cy={6} r="3.5" fill="#FFB7C5" opacity="0.55" />
      {/* muzzle */}
      <ellipse cx={0} cy={10} rx="11" ry="8" fill={C.belly} />
      {/* nose */}
      <ellipse cx={0} cy={6} rx="3.2" ry="2.4" fill={C.nose} />
      {/* mouth */}
      <path d="M0 8 L0 12 M-4 14 Q0 17 4 14" stroke={C.nose} strokeWidth="1.3" fill="none" strokeLinecap="round" />
      {/* tongue */}
      <path d="M-2 15 Q0 19 2 15 Z" fill="#FF6F87" />
    </g>
  );
}

function Collar({ cx, cy, w, C }: { cx: number; cy: number; w: number; C: Palette }) {
  return (
    <g>
      <rect x={cx - w / 2} y={cy} width={w} height="6" rx="3" fill={C.collar} />
      <circle cx={cx} cy={cy + 7} r="3" fill="#FFD24C" stroke={C.collar} strokeWidth="1" />
    </g>
  );
}

function Tail({ d, C, wag = true, width = 5 }: { d: string; C: Palette; wag?: boolean; width?: number }) {
  return (
    <g style={{ transformOrigin: "150px 130px", animation: wag ? "tailWag 1.2s ease-in-out infinite" : undefined }}>
      <path d={d} stroke={C.fur} strokeWidth={width} strokeLinecap="round" fill="none" />
    </g>
  );
}

/* --- Breeds --- */

function Golden({ C }: { C: Palette }) {
  return (
    <g>
      {/* tail */}
      <Tail d="M150 130 Q175 110 168 88" C={C} width={8} />
      {/* hind legs */}
      <ellipse cx="120" cy="160" rx="18" ry="22" fill={C.fur} />
      <rect x="108" y="160" width="22" height="18" rx="6" fill={C.fur} />
      {/* body */}
      <ellipse cx="100" cy="130" rx="48" ry="32" fill={C.fur} />
      {/* chest fluff */}
      <ellipse cx="72" cy="138" rx="14" ry="18" fill={C.belly} />
      {/* front legs */}
      <rect x="62" y="142" width="12" height="36" rx="6" fill={C.fur} />
      <rect x="80" y="146" width="12" height="32" rx="6" fill={C.fur} />
      {/* paws */}
      <ellipse cx="68" cy="180" rx="8" ry="4" fill={C.furDeep} />
      <ellipse cx="86" cy="180" rx="8" ry="4" fill={C.furDeep} />
      <ellipse cx="119" cy="180" rx="11" ry="4" fill={C.furDeep} />
      {/* head */}
      <ellipse cx="70" cy="92" rx="34" ry="30" fill={C.fur} />
      {/* floppy ears */}
      <ellipse cx="48" cy="86" rx="11" ry="22" fill={C.ear} transform="rotate(-12 48 86)" />
      <ellipse cx="92" cy="86" rx="11" ry="22" fill={C.ear} transform="rotate(12 92 86)" />
      {/* face */}
      <Face cx={70} cy={94} C={C} />
      {/* collar */}
      <Collar cx={70} cy={120} w={36} C={C} />
    </g>
  );
}

function Shiba({ C }: { C: Palette }) {
  return (
    <g>
      {/* curly tail */}
      <g style={{ transformOrigin: "150px 110px", animation: "tailWag 1.2s ease-in-out infinite" }}>
        <path d="M150 115 Q172 100 162 80 Q150 70 144 84" stroke={C.fur} strokeWidth="9" fill="none" strokeLinecap="round" />
        <path d="M150 115 Q172 100 162 80 Q150 70 144 84" stroke={C.belly} strokeWidth="3" fill="none" strokeLinecap="round" />
      </g>
      {/* body */}
      <ellipse cx="100" cy="130" rx="46" ry="30" fill={C.fur} />
      <ellipse cx="78" cy="140" rx="18" ry="20" fill={C.belly} />
      {/* legs */}
      <rect x="62" y="142" width="12" height="36" rx="5" fill={C.fur} />
      <rect x="82" y="146" width="12" height="32" rx="5" fill={C.fur} />
      <rect x="118" y="146" width="12" height="32" rx="5" fill={C.fur} />
      <rect x="134" y="146" width="12" height="32" rx="5" fill={C.fur} />
      <ellipse cx="68" cy="180" rx="8" ry="4" fill={C.furDeep} />
      <ellipse cx="88" cy="180" rx="8" ry="4" fill={C.furDeep} />
      <ellipse cx="124" cy="180" rx="8" ry="4" fill={C.furDeep} />
      <ellipse cx="140" cy="180" rx="8" ry="4" fill={C.furDeep} />
      {/* head */}
      <ellipse cx="68" cy="92" rx="30" ry="28" fill={C.fur} />
      {/* upright triangle ears */}
      <path d="M46 70 L52 50 L60 72 Z" fill={C.fur} />
      <path d="M76 72 L86 52 L92 74 Z" fill={C.fur} />
      <path d="M50 70 L54 58 L58 71 Z" fill={C.ear} />
      <path d="M80 72 L86 60 L90 73 Z" fill={C.ear} />
      {/* shiba cream patch */}
      <ellipse cx="68" cy="104" rx="22" ry="10" fill={C.belly} />
      <Face cx={68} cy={94} C={C} />
      <Collar cx={68} cy={120} w={34} C={C} />
    </g>
  );
}

function Poodle({ C }: { C: Palette }) {
  // Lots of fluffy circle puffs
  const puff = (cx: number, cy: number, r: number) => <circle cx={cx} cy={cy} r={r} fill={C.fur} />;
  return (
    <g>
      <Tail d="M150 130 Q170 110 166 90" C={C} width={4} />
      <circle cx="166" cy="86" r="9" fill={C.fur} />
      {/* hind */}
      {puff(128, 162, 22)}
      {/* body puffs */}
      {puff(100, 130, 30)}
      {puff(80, 138, 22)}
      {puff(115, 120, 20)}
      {/* legs */}
      <rect x="68" y="148" width="10" height="30" rx="5" fill={C.fur} />
      <rect x="86" y="150" width="10" height="28" rx="5" fill={C.fur} />
      <circle cx="73" cy="178" r="8" fill={C.fur} />
      <circle cx="91" cy="178" r="8" fill={C.fur} />
      <circle cx="128" cy="178" r="9" fill={C.fur} />
      {/* head */}
      <circle cx="72" cy="90" r="28" fill={C.fur} />
      {/* top puff */}
      <circle cx="72" cy="60" r="14" fill={C.fur} />
      {/* floppy fluffy ears */}
      <circle cx="44" cy="100" r="14" fill={C.fur} />
      <circle cx="100" cy="100" r="14" fill={C.fur} />
      <Face cx={72} cy={94} C={C} scale={0.95} />
      <Collar cx={72} cy={118} w={32} C={C} />
    </g>
  );
}

function Pomeranian({ C }: { C: Palette }) {
  // Round fluffy ball
  return (
    <g>
      <g style={{ transformOrigin: "150px 120px", animation: "tailWag 1s ease-in-out infinite" }}>
        <circle cx="156" cy="108" r="14" fill={C.fur} />
      </g>
      {/* body — big fluff */}
      <circle cx="110" cy="135" r="42" fill={C.fur} />
      {/* fluffy edge */}
      {[[72,120,9],[78,150,9],[92,168,9],[120,172,10],[148,168,9],[156,148,9],[148,118,9]].map(([x,y,r],i)=>(
        <circle key={i} cx={x as number} cy={y as number} r={r as number} fill={C.fur} />
      ))}
      {/* legs peek */}
      <rect x="92" y="160" width="10" height="20" rx="5" fill={C.furDeep} />
      <rect x="118" y="160" width="10" height="20" rx="5" fill={C.furDeep} />
      <ellipse cx="97" cy="180" rx="7" ry="3" fill={C.furDeep} />
      <ellipse cx="123" cy="180" rx="7" ry="3" fill={C.furDeep} />
      {/* head fluff */}
      <circle cx="72" cy="92" r="32" fill={C.fur} />
      {[[48,80,8],[50,108,8],[72,60,9],[96,80,8],[96,108,8]].map(([x,y,r],i)=>(
        <circle key={i} cx={x as number} cy={y as number} r={r as number} fill={C.fur} />
      ))}
      {/* small ears */}
      <path d="M52 68 L58 54 L66 70 Z" fill={C.ear} />
      <path d="M78 70 L86 56 L92 70 Z" fill={C.ear} />
      <Face cx={72} cy={96} C={C} scale={0.9} />
      <Collar cx={72} cy={120} w={30} C={C} />
    </g>
  );
}

function Chihuahua({ C }: { C: Palette }) {
  // Small body, BIG ears, big eyes
  return (
    <g>
      <Tail d="M140 130 Q160 118 156 100" C={C} width={4} />
      {/* body small */}
      <ellipse cx="105" cy="140" rx="35" ry="24" fill={C.fur} />
      <ellipse cx="88" cy="146" rx="14" ry="14" fill={C.belly} />
      {/* legs thin */}
      <rect x="78" y="152" width="8" height="28" rx="4" fill={C.fur} />
      <rect x="94" y="154" width="8" height="26" rx="4" fill={C.fur} />
      <rect x="118" y="154" width="8" height="26" rx="4" fill={C.fur} />
      <rect x="132" y="152" width="8" height="28" rx="4" fill={C.fur} />
      <ellipse cx="82" cy="180" rx="6" ry="3" fill={C.furDeep} />
      <ellipse cx="98" cy="180" rx="6" ry="3" fill={C.furDeep} />
      <ellipse cx="122" cy="180" rx="6" ry="3" fill={C.furDeep} />
      <ellipse cx="136" cy="180" rx="6" ry="3" fill={C.furDeep} />
      {/* head — apple shape, large */}
      <circle cx="72" cy="98" r="30" fill={C.fur} />
      {/* huge upright bat ears */}
      <path d="M44 78 L36 38 L62 70 Z" fill={C.fur} />
      <path d="M82 70 L106 38 L98 78 Z" fill={C.fur} />
      <path d="M47 74 L42 50 L58 70 Z" fill="#FFB7C5" opacity="0.7" />
      <path d="M85 70 L100 50 L96 74 Z" fill="#FFB7C5" opacity="0.7" />
      {/* big eyes — override face */}
      <g transform="translate(72 100)">
        <circle cx={-12} cy={-4} r="4" fill="#1A1410" />
        <circle cx={12} cy={-4} r="4" fill="#1A1410" />
        <circle cx={-11} cy={-5} r="1.4" fill="#fff" />
        <circle cx={13} cy={-5} r="1.4" fill="#fff" />
        <circle cx={-16} cy={6} r="3.5" fill="#FFB7C5" opacity="0.55" />
        <circle cx={16} cy={6} r="3.5" fill="#FFB7C5" opacity="0.55" />
        <ellipse cx={0} cy={10} rx="9" ry="6" fill={C.belly} />
        <ellipse cx={0} cy={6} rx="2.6" ry="2" fill={C.nose} />
        <path d="M0 8 L0 11 M-3 13 Q0 16 3 13" stroke={C.nose} strokeWidth="1.2" fill="none" strokeLinecap="round" />
      </g>
      <Collar cx={72} cy={124} w={26} C={C} />
    </g>
  );
}

function Frenchie({ C }: { C: Palette }) {
  return (
    <g>
      <g style={{ transformOrigin: "146px 130px", animation: "tailWag 1.4s ease-in-out infinite" }}>
        <path d="M146 128 Q156 124 158 116" stroke={C.fur} strokeWidth="7" fill="none" strokeLinecap="round" />
      </g>
      {/* stout body */}
      <ellipse cx="105" cy="140" rx="44" ry="30" fill={C.fur} />
      <ellipse cx="88" cy="148" rx="20" ry="18" fill={C.belly} />
      {/* short stubby legs */}
      <rect x="72" y="160" width="14" height="20" rx="6" fill={C.fur} />
      <rect x="92" y="162" width="14" height="18" rx="6" fill={C.fur} />
      <rect x="120" y="162" width="14" height="18" rx="6" fill={C.fur} />
      <rect x="140" y="160" width="14" height="20" rx="6" fill={C.fur} />
      {/* head — square */}
      <rect x="44" y="74" width="58" height="50" rx="22" fill={C.fur} />
      {/* bat ears upright rounded */}
      <path d="M46 72 Q40 48 56 50 Q60 64 60 76 Z" fill={C.fur} />
      <path d="M100 72 Q106 48 90 50 Q86 64 86 76 Z" fill={C.fur} />
      <path d="M50 70 Q48 58 56 60 Z" fill="#FFB7C5" opacity="0.6" />
      <path d="M96 70 Q98 58 90 60 Z" fill="#FFB7C5" opacity="0.6" />
      {/* face wrinkle */}
      <path d="M58 110 Q73 116 88 110" stroke={C.furDeep} strokeWidth="1.2" fill="none" />
      <Face cx={73} cy={100} C={C} scale={0.95} />
      <Collar cx={73} cy={126} w={40} C={C} />
    </g>
  );
}

function Yorkie({ C }: { C: Palette }) {
  return (
    <g>
      <Tail d="M150 130 Q166 116 162 96" C={C} width={6} />
      {/* body — long hair */}
      <ellipse cx="105" cy="135" rx="46" ry="28" fill={C.belly} />
      <path d="M62 135 Q100 168 150 135 L148 162 Q100 178 64 162 Z" fill={C.fur} />
      {/* legs peek */}
      <rect x="80" y="158" width="10" height="22" rx="5" fill={C.belly} />
      <rect x="120" y="158" width="10" height="22" rx="5" fill={C.belly} />
      <ellipse cx="85" cy="180" rx="7" ry="3" fill={C.furDeep} />
      <ellipse cx="125" cy="180" rx="7" ry="3" fill={C.furDeep} />
      {/* head */}
      <ellipse cx="70" cy="96" rx="28" ry="28" fill={C.fur} />
      {/* hair flop over forehead */}
      <path d="M44 86 Q70 60 96 86 Q92 70 70 64 Q48 70 44 86 Z" fill={C.furDeep} />
      {/* top knot bow */}
      <circle cx="70" cy="62" r="5" fill="#E8829A" />
      <path d="M64 62 L58 58 L60 66 Z" fill="#E8829A" />
      <path d="M76 62 L82 58 L80 66 Z" fill="#E8829A" />
      {/* small ears */}
      <path d="M48 80 L52 64 L60 80 Z" fill={C.fur} />
      <path d="M80 80 L88 64 L92 80 Z" fill={C.fur} />
      {/* muzzle area lighter */}
      <ellipse cx="70" cy="104" rx="14" ry="10" fill={C.belly} />
      <Face cx={70} cy={102} C={C} scale={0.9} />
      <Collar cx={70} cy={126} w={28} C={C} />
    </g>
  );
}

function Dachshund({ C }: { C: Palette }) {
  // Long body, very short legs
  return (
    <g>
      <Tail d="M168 138 Q186 126 182 110" C={C} width={5} />
      {/* long body */}
      <rect x="48" y="120" width="124" height="36" rx="18" fill={C.fur} />
      <rect x="58" y="130" width="104" height="22" rx="11" fill={C.belly} />
      {/* short legs */}
      <rect x="60" y="152" width="10" height="22" rx="5" fill={C.fur} />
      <rect x="80" y="152" width="10" height="22" rx="5" fill={C.fur} />
      <rect x="138" y="152" width="10" height="22" rx="5" fill={C.fur} />
      <rect x="158" y="152" width="10" height="22" rx="5" fill={C.fur} />
      <ellipse cx="65" cy="176" rx="6" ry="3" fill={C.furDeep} />
      <ellipse cx="85" cy="176" rx="6" ry="3" fill={C.furDeep} />
      <ellipse cx="143" cy="176" rx="6" ry="3" fill={C.furDeep} />
      <ellipse cx="163" cy="176" rx="6" ry="3" fill={C.furDeep} />
      {/* long snouty head */}
      <ellipse cx="44" cy="110" rx="26" ry="22" fill={C.fur} />
      {/* long muzzle */}
      <ellipse cx="22" cy="118" rx="14" ry="8" fill={C.belly} />
      <ellipse cx="14" cy="118" rx="3" ry="2.4" fill={C.nose} />
      {/* long floppy ear */}
      <ellipse cx="50" cy="102" rx="10" ry="20" fill={C.ear} transform="rotate(-20 50 102)" />
      {/* eye */}
      <circle cx="44" cy="106" r="2.6" fill="#1A1410" />
      <circle cx="45" cy="105" r="0.9" fill="#fff" />
      <circle cx="34" cy="116" r="3" fill="#FFB7C5" opacity="0.55" />
      <path d="M14 121 L14 124 M11 126 Q14 128 17 126" stroke={C.nose} strokeWidth="1.1" fill="none" strokeLinecap="round" />
      <Collar cx={60} cy={130} w={24} C={C} />
    </g>
  );
}
