import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { User, Upload, Camera, Check } from "lucide-react";
import AppShell from "@/components/AppShell";
import { Stepper, TopBar } from "@/routes/onboarding.avatar";
import { useT } from "@/context/LanguageContext";
import { usePet } from "@/context/PetContext";

export const Route = createFileRoute("/onboarding/owner-info")({ component: Step5 });

function Step5() {
  const nav = useNavigate();
  const t = useT();
  const { pet, updatePet } = usePet();

  const [name, setName] = useState(pet.ownerName ?? "");
  const [gender, setGender] = useState<"Male" | "Female" | "Prefer not to say" | null>(pet.ownerGender);
  const [age, setAge] = useState<string>(pet.ownerAge ? String(pet.ownerAge) : "");
  const initialContact = pet.ownerContact ?? "";
  const isJapan = initialContact.startsWith("+81");
  const initialCode = isJapan ? "+81" : "+91";
  const initialNumber = isJapan ? initialContact.replace("+81", "").trim() : initialContact.replace("+91", "").trim();

  const [countryCode, setCountryCode] = useState<string>(initialCode);
  const [contact, setContact] = useState<string>(initialNumber);

  const [nameError, setNameError] = useState(false);
  const [genderError, setGenderError] = useState(false);
  const [contactError, setContactError] = useState(false);
  const [shake, setShake] = useState(false);

  const validate = (): boolean => {
    let ok = true;
    if (!name.trim()) {
      setNameError(true);
      ok = false;
    }
    if (!gender) {
      setGenderError(true);
      ok = false;
    }
    if (!contact.trim()) {
      setContactError(true);
      ok = false;
    }
    
    if (!ok) {
      setShake(true);
      setTimeout(() => setShake(false), 500);
    }
    return ok;
  };

  const onDone = () => {
    if (!validate()) return;
    
    updatePet({
      ownerName: name.trim(),
      ownerGender: gender,
      ownerAge: age ? Number(age) : null,
      ownerContact: `${countryCode} ${contact.trim()}`,
      justCompletedOnboarding: true,
    });
    nav({ to: "/home" });
  };

  const onSkip = () => {
    updatePet({
      justCompletedOnboarding: true,
    });
    nav({ to: "/home" });
  };

  return (
    <AppShell hideTopBar hideBottomNav>
      <div
        className="min-h-screen pb-40"
        style={{ background: "var(--color-bg-app)", fontFamily: "'Nunito','Quicksand',system-ui,sans-serif" }}
      >
        <div className="px-6 pt-4">
          <TopBar to="/onboarding/details" />
          <Stepper current={5} path={pet.path} />

          {/* User Icon */}
          <div className="flex justify-center mt-1">
            <div
              className="flex items-center justify-center rounded-full"
              style={{
                width: 80, height: 80,
                background: "var(--color-primary)",
                boxShadow: "0 8px 24px rgba(232,103,138,0.25)",
              }}
            >
              <User className="w-10 h-10 text-white" strokeWidth={2.5} />
            </div>
          </div>

          <h1 className="text-[22px] font-extrabold text-center mt-4" style={{ color: "#3B2A23" }}>
            {t("あなたのこと教えて", "Tell Us About You")}
          </h1>
          <p className="text-center text-[13px] mt-2 leading-relaxed" style={{ color: "#8A766C" }}>
            {t(
              "あなたとワンちゃんの体験をよりパーソナライズするために",
              "Help us personalise your experience for you and your pet."
            )}
          </p>

          {/* White form card */}
          <div
            className="mt-5 p-5 rounded-[24px]"
            style={{ background: "#B9D8E1", boxShadow: "0 4px 22px rgba(0,0,0,0.06)" }}
          >
            <SectionLabel>{t("個人情報", "PERSONAL INFO")}</SectionLabel>

            {/* Name */}
            <FieldLabel required>{t("お名前", "Your Name")}</FieldLabel>
            <input
              value={name}
              onChange={(e) => { setName(e.target.value); if (nameError) setNameError(false); }}
              placeholder={t("名前を入力", "Enter your name")}
              className="w-full bg-white outline-none transition-all"
              style={{
                fontFamily: "'Nunito',sans-serif",
                fontSize: 16,
                color: "#3B2A23",
                padding: "10px 2px",
                border: nameError ? "2px solid #E53935" : "2px solid #EAF4F9", borderRadius: 12,
                animation: shake && nameError ? "dgShake 0.4s ease-in-out" : "none",
              }}
              onFocus={(e) => { if (!nameError) e.currentTarget.style.border = "2px solid #447F98"; }}
              onBlur={(e) => { if (!nameError) e.currentTarget.style.border = "2px solid #EAF4F9"; }}
            />

            {/* Gender */}
            <div className="mt-6">
              <FieldLabel required>{t("性別", "Gender")}</FieldLabel>
              <div 
                className="grid grid-cols-1 gap-2 mt-2" 
                style={{ animation: shake && genderError ? "dgShake 0.4s ease-in-out" : "none" }}
              >
                <PillButton 
                  selected={gender === "Male"} 
                  onClick={() => { setGender("Male"); setGenderError(false); }}
                >
                  {t("男性", "Male")}
                </PillButton>
                <PillButton 
                  selected={gender === "Female"} 
                  onClick={() => { setGender("Female"); setGenderError(false); }}
                >
                  {t("女性", "Female")}
                </PillButton>
                <PillButton 
                  selected={gender === "Prefer not to say"} 
                  onClick={() => { setGender("Prefer not to say"); setGenderError(false); }}
                >
                  {t("回答しない", "Prefer not to say")}
                </PillButton>
              </div>
            </div>

            {/* Age */}
            <div className="mt-6">
              <FieldLabel optional>{t("年齢", "Age")}</FieldLabel>
              <input
                type="number"
                min={0}
                max={150}
                value={age}
                onChange={(e) => setAge(e.target.value)}
                placeholder={t("年齢を入力", "Your age")}
                className="w-full bg-white outline-none transition-all"
                style={{
                  fontFamily: "'Nunito',sans-serif",
                  fontSize: 16,
                  color: "#3B2A23",
                  padding: "10px 2px",
                  border: "2px solid #EAF4F9", borderRadius: 12,
                }}
                onFocus={(e) => { e.currentTarget.style.border = "2px solid #447F98"; }}
                onBlur={(e) => { e.currentTarget.style.border = "2px solid #EAF4F9"; }}
              />
            </div>

            {/* Contact */}
            <SectionLabel>{t("連絡先", "CONTACT")}</SectionLabel>

            <FieldLabel required>{t("電話番号", "Contact Number")}</FieldLabel>
            <div className="flex items-center gap-3 w-full mt-1">
              <select
                value={countryCode}
                onChange={(e) => setCountryCode(e.target.value)}
                className="bg-white outline-none transition-all cursor-pointer"
                style={{
                  width: "fit-content",
                  minWidth: "80px",
                  fontFamily: "'Nunito',sans-serif",
                  fontSize: 16,
                  color: "#3B2A23",
                  padding: "10px 2px",
                  border: "none",
                  border: "2px solid #EAF4F9", borderRadius: 12,
                }}
                onFocus={(e) => { e.currentTarget.style.border = "2px solid #447F98"; }}
                onBlur={(e) => { e.currentTarget.style.border = "2px solid #EAF4F9"; }}
              >
                <option value="+91">🇮🇳 +91</option>
                <option value="+81">🇯🇵 +81</option>
              </select>

              <input
                type="tel"
                value={contact}
                onChange={(e) => { setContact(e.target.value); if (contactError) setContactError(false); }}
                placeholder={countryCode === "+91" ? "XXXXX XXXXX" : "XX XXXX XXXX"}
                className="flex-1 bg-white outline-none transition-all"
                style={{
                  fontFamily: "'Nunito',sans-serif",
                  fontSize: 16,
                  color: "#3B2A23",
                  padding: "10px 2px",
                  border: contactError ? "2px solid #E53935" : "2px solid #EAF4F9", borderRadius: 12,
                  animation: shake && contactError ? "dgShake 0.4s ease-in-out" : "none",
                }}
                onFocus={(e) => { if (!contactError) e.currentTarget.style.border = "2px solid #447F98"; }}
                onBlur={(e) => { if (!contactError) e.currentTarget.style.border = "2px solid #EAF4F9"; }}
              />
            </div>


            {/* Profile Photo */}
            <div className="mt-6">
              <FieldLabel optional>{t("プロフィール写真", "Profile Photo")}</FieldLabel>
              <button
                className="w-full mt-2 rounded-2xl flex flex-col items-center justify-center transition-all"
                style={{
                  height: 120,
                  background: "#FFF8FB",
                  border: "2px dashed #F4C0D1",
                }}
              >
                <div 
                  className="w-10 h-10 rounded-full flex items-center justify-center mb-2"
                  style={{ background: "#FFE3E8" }}
                >
                  <Camera className="w-5 h-5" style={{ color: "#E8678A" }} />
                </div>
                <span className="text-[12px] font-medium" style={{ color: "#A38B82" }}>
                  {t("タップしてアップロード", "Tap to upload photo")}
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Bottom CTAs */}
        <div
          className="fixed bottom-0 inset-x-0 mx-auto p-4"
          style={{
            maxWidth: 430,
            background: "linear-gradient(to top, var(--color-bg-app), rgba(245,237,232,0.95) 70%, transparent)",
          }}
        >
          <button
            onClick={onDone}
            className="w-full h-14 rounded-full text-[15px] font-bold transition-all"
            style={{
              background: "#447F98",
              color: "#FFFFFF",
              boxShadow: "0 8px 24px rgba(232,103,138,0.35)",
            }}
          >
             {t("完了！ダッシュボードへ", "All Done! Meet Your Dashboard")} →
          </button>
          <button
            onClick={onSkip}
            className="w-full text-center mt-2 py-2 text-[13px] font-medium"
            style={{ color: "#A38B82" }}
          >
            {t("スキップ", "Skip for now")} →
          </button>
        </div>

        <style>{`
          @keyframes dgShake {
            0%,100% { transform: translateX(0); }
            20% { transform: translateX(-6px); }
            40% { transform: translateX(6px); }
            60% { transform: translateX(-4px); }
            80% { transform: translateX(4px); }
          }
        `}</style>
      </div>
    </AppShell>
  );
}

/* ───── Small helpers ───── */

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="mt-6 mb-3 text-[11px] font-bold"
      style={{ color: "#E8678A", letterSpacing: "0.15em", textTransform: "uppercase" }}
    >
      {children}
    </div>
  );
}

function FieldLabel({
  children, required, optional,
}: { children: React.ReactNode; required?: boolean; optional?: boolean }) {
  return (
    <label className="text-[12px] font-bold flex items-center gap-1" style={{ color: "#3B2A23" }}>
      {children}
      {required && <span style={{ color: "#E53935" }}>*</span>}
      {optional && <span className="font-normal" style={{ color: "#A38B82" }}>(optional)</span>}
    </label>
  );
}

function PillButton({
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
}
