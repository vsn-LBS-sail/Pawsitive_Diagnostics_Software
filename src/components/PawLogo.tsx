export function PawLogo({ size = 32, color = "#E87090" }: { size?: number; color?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      aria-hidden
      style={{ display: "block", transform: "rotate(-15deg)" }}
    >
      {/* Toe pads */}
      <ellipse cx="22" cy="38" rx="11" ry="14" fill={color} />
      <ellipse cx="42" cy="22" rx="11" ry="15" fill={color} />
      <ellipse cx="64" cy="22" rx="11" ry="15" fill={color} />
      <ellipse cx="82" cy="38" rx="11" ry="14" fill={color} />
      {/* Main pad */}
      <path
        d="M30 70 C30 55 40 47 52 47 C64 47 74 55 74 70 C74 84 64 92 52 92 C40 92 30 84 30 70 Z"
        fill={color}
      />
      {/* Heartbeat / ECG line across pad */}
      <path
        d="M36 70 L44 70 L48 60 L52 80 L56 64 L60 74 L68 70"
        stroke="#FFFFFF"
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}

export default PawLogo;
