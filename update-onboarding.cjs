const fs = require('fs');

const fileDetails = 'src/routes/onboarding.details.tsx';
const fileOwner = 'src/routes/onboarding.owner-info.tsx';
const fileAvatar = 'src/routes/onboarding.avatar.tsx';

// 1. Update Stepper in onboarding.avatar.tsx
let avatarContent = fs.readFileSync(fileAvatar, 'utf8');
avatarContent = avatarContent.replace(
  /const bg = completed \? "#F4A3B8" : active \? "#E8678A" : "transparent";/g,
  'const bg = completed ? "#447F98" : active ? "#447F98" : "#FFFFFF";'
);
avatarContent = avatarContent.replace(
  /const border = completed \|\| active \? "none" : "2px solid #EDE8E4";/g,
  'const border = completed || active ? "none" : "2px solid #A8CCD8";'
);
avatarContent = avatarContent.replace(
  /const color = completed \|\| active \? "#FFFFFF" : "#C4B8B4";/g,
  'const color = completed || active ? "#FFFFFF" : "#A8CCD8";'
);
avatarContent = avatarContent.replace(
  /boxShadow: active \? "0 0 0 4px rgba\\(232,103,138,0\.18\\)" : "none",/g,
  'boxShadow: active ? "0 0 0 4px rgba(68,127,152,0.18)" : "none",'
);
avatarContent = avatarContent.replace(
  /background: n < current \? "#F4A3B8" : "#EDE8E4",/g,
  'background: n < current ? "#447F98" : "#A8CCD8",'
);
fs.writeFileSync(fileAvatar, avatarContent);


// 2. Update PillButton in onboarding.details.tsx and onboarding.owner-info.tsx
const pillOld = `function PillButton({
  children, selected, onClick, small,
}: { children: React.ReactNode; selected: boolean; onClick: () => void; small?: boolean }) {
  return (
    <button
      onClick={onClick}
      className="rounded-full font-bold transition-all w-full text-center"
      style={{
        padding: small ? "10px 8px" : "12px 14px",
        fontSize: small ? 12 : 14,
        background: selected ? "linear-gradient(135deg,#E8678A,#F48BA9)" : "#FFFFFF",
        color: selected ? "#FFFFFF" : "#8A766C",
        border: selected ? "1.5px solid transparent" : "1.5px solid #E5D5CC",
        boxShadow: selected ? "0 4px 12px rgba(232,103,138,0.25)" : "none",
      }}
    >
      {children}
    </button>
  );
}`;

const pillOldDetails = `function PillButton({
  children, selected, onClick, small,
}: { children: React.ReactNode; selected: boolean; onClick: () => void; small?: boolean }) {
  return (
    <button
      onClick={onClick}
      className="rounded-full font-bold transition-all"
      style={{
        padding: small ? "10px 8px" : "12px 14px",
        fontSize: small ? 12 : 14,
        background: selected ? "linear-gradient(135deg,#E8678A,#F48BA9)" : "#FFFFFF",
        color: selected ? "#FFFFFF" : "#8A766C",
        border: selected ? "1.5px solid transparent" : "1.5px solid #E5D5CC",
        boxShadow: selected ? "0 4px 12px rgba(232,103,138,0.25)" : "none",
      }}
    >
      {children}
    </button>
  );
}`;

const pillNew = `function PillButton({
  children, selected, onClick, small,
}: { children: React.ReactNode; selected: boolean; onClick: () => void; small?: boolean }) {
  return (
    <button
      onClick={onClick}
      className="rounded-full font-bold transition-all flex items-center justify-center gap-2 w-full"
      style={{
        padding: small ? "10px 8px" : "12px 14px",
        fontSize: small ? 12 : 14,
        background: selected ? "#EAF4F9" : "#FFFFFF",
        color: selected ? "#447F98" : "#2C3E50",
        border: selected ? "2px solid #447F98" : "2px solid #EAF4F9",
        boxShadow: "none",
      }}
    >
      {selected && <Check size={16} strokeWidth={3} style={{ color: "#447F98" }} />}
      {children}
    </button>
  );
}`;

let detailsContent = fs.readFileSync(fileDetails, 'utf8');
detailsContent = detailsContent.replace(pillOldDetails, pillNew);

// Add Check import to details
if (!detailsContent.includes('Check')) {
  detailsContent = detailsContent.replace('} from "lucide-react";', ', Check } from "lucide-react";');
  if (!detailsContent.includes('Check }')) {
     detailsContent = detailsContent.replace('import { useState } from "react";', 'import { useState } from "react";\nimport { Check } from "lucide-react";');
  }
}

// Update ToggleSwitch and UnitToggle in details
const toggleOld = `function ToggleSwitch({ on, onClick }: { on: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      aria-pressed={on}
      style={{
        width: 44,
        height: 26,
        borderRadius: 999,
        background: on ? "linear-gradient(135deg,#E8678A,#F48BA9)" : "#E5D5CC",
        position: "relative",
        transition: "background 0.2s ease",
        flexShrink: 0,
      }}
    >
      <span
        style={{
          position: "absolute",
          top: 3,
          left: on ? 21 : 3,
          width: 20,
          height: 20,
          borderRadius: "50%",
          background: "#FFFFFF",
          boxShadow: "0 1px 4px rgba(0,0,0,0.2)",
          transition: "left 0.2s ease",
        }}
      />
    </button>
  );
}`;

const toggleNew = `function ToggleSwitch({ on, onClick }: { on: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      aria-pressed={on}
      style={{
        width: 44,
        height: 26,
        borderRadius: 999,
        background: on ? "#447F98" : "#EAF4F9",
        position: "relative",
        transition: "background 0.2s ease",
        flexShrink: 0,
      }}
    >
      <span
        style={{
          position: "absolute",
          top: 3,
          left: on ? 21 : 3,
          width: 20,
          height: 20,
          borderRadius: "50%",
          background: "#FFFFFF",
          boxShadow: "0 1px 4px rgba(0,0,0,0.2)",
          transition: "left 0.2s ease",
        }}
      />
    </button>
  );
}`;

const unitOld = `function UnitToggle({
  children, selected, onClick,
}: { children: React.ReactNode; selected: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="rounded-lg text-[12px] font-bold transition-all"
      style={{
        padding: "8px 12px",
        background: selected ? "#FFF0F5" : "#FFFFFF",
        color: selected ? "#E8678A" : "#A38B82",
        border: selected ? "1.5px solid #E8678A" : "1.5px solid #E5D5CC",
      }}
    >
      {children}
    </button>
  );
}`;

const unitNew = `function UnitToggle({
  children, selected, onClick,
}: { children: React.ReactNode; selected: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="rounded-lg text-[12px] font-bold transition-all flex items-center gap-1 justify-center"
      style={{
        padding: "8px 12px",
        background: selected ? "#EAF4F9" : "#FFFFFF",
        color: selected ? "#447F98" : "#2C3E50",
        border: selected ? "2px solid #447F98" : "2px solid #EAF4F9",
      }}
    >
      {selected && <Check size={14} strokeWidth={3} style={{ color: "#447F98" }} />}
      {children}
    </button>
  );
}`;

detailsContent = detailsContent.replace(toggleOld, toggleNew).replace(unitOld, unitNew);

// Apply inputs global styles in details
detailsContent = detailsContent.replace(/borderBottom: nameError \? "2px solid #E53935" : "2px solid #F4C0D1"/g, 'border: nameError ? "2px solid #E53935" : "2px solid #EAF4F9", borderRadius: 12');
detailsContent = detailsContent.replace(/borderBottom: "2px solid #F4C0D1"/g, 'border: "2px solid #EAF4F9", borderRadius: 12');
detailsContent = detailsContent.replace(/borderBottom: "1.5px solid #F4C0D1"/g, 'border: "2px solid #EAF4F9", borderRadius: 12');
detailsContent = detailsContent.replace(/e\.currentTarget\.style\.borderBottom = "2px solid #E8678A"/g, 'e.currentTarget.style.border = "2px solid #447F98"');
detailsContent = detailsContent.replace(/e\.currentTarget\.style\.borderBottom = "2px solid #F4C0D1"/g, 'e.currentTarget.style.border = "2px solid #EAF4F9"');
detailsContent = detailsContent.replace(/style={{ borderBottom: "2px solid #F4C0D1", padding: "8px 2px" }}/g, 'style={{ border: "2px solid #EAF4F9", borderRadius: 12, padding: "8px 12px" }}');

fs.writeFileSync(fileDetails, detailsContent);

// 3. Update owner-info
let ownerContent = fs.readFileSync(fileOwner, 'utf8');
ownerContent = ownerContent.replace(pillOld, pillNew);

// Add Check import to owner-info
if (!ownerContent.includes('Check')) {
  ownerContent = ownerContent.replace('User, Upload, Camera', 'User, Upload, Camera, Check');
}

// Apply inputs global styles in owner-info
ownerContent = ownerContent.replace(/borderBottom: nameError \? "2px solid #E53935" : "2px solid #F4C0D1"/g, 'border: nameError ? "2px solid #E53935" : "2px solid #EAF4F9", borderRadius: 12');
ownerContent = ownerContent.replace(/borderBottom: contactError \? "2px solid #E53935" : "2px solid #F4C0D1"/g, 'border: contactError ? "2px solid #E53935" : "2px solid #EAF4F9", borderRadius: 12');
ownerContent = ownerContent.replace(/borderBottom: "2px solid #F4C0D1"/g, 'border: "2px solid #EAF4F9", borderRadius: 12');
ownerContent = ownerContent.replace(/e\.currentTarget\.style\.borderBottom = "2px solid #E8678A"/g, 'e.currentTarget.style.border = "2px solid #447F98"');
ownerContent = ownerContent.replace(/e\.currentTarget\.style\.borderBottom = "2px solid #F4C0D1"/g, 'e.currentTarget.style.border = "2px solid #EAF4F9"');

fs.writeFileSync(fileOwner, ownerContent);

console.log("Done updating onboarding files.");
