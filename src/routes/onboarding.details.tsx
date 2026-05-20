import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Check } from "lucide-react";
import PhoneFrame from "@/components/PhoneFrame";
import DogAvatar, { type BreedKey, type EarStyle, type EyeStyle } from "@/components/DogAvatar";
import { Stepper, TopBar } from "@/routes/onboarding.avatar";
import { useT } from "@/context/LanguageContext";
import { usePet } from "@/context/PetContext";
import { BREEDS } from "@/lib/mock";

export const Route = createFileRoute("/onboarding/details")({ component: Step4 });

const TOP5 = BREEDS.slice(0, 5);

function Step4() {
  const nav = useNavigate();
  const t = useT();
  const { pet, updatePet } = usePet();

  const [name, setName] = useState(pet.name ?? "");
  const initialBreedIsTop = TOP5.some((b) => b.jp === pet.breedJp);
  const [breedSelect, setBreedSelect] = useState<string>(
    initialBreedIsTop ? pet.breedJp : pet.breedJp ? "__other__" : (TOP5[0].jp)
  );
  const [breedOther, setBreedOther] = useState<string>(initialBreedIsTop ? "" : (pet.breedJp || ""));
  const [years, setYears] = useState<string>(pet.dogAge.years ? String(pet.dogAge.years) : "");
  const [months, setMonths] = useState<string>(pet.dogAge.months ? String(pet.dogAge.months) : "");
  const [gender, setGender] = useState<"male" | "female" | null>(pet.gender);
  const [weight, setWeight] = useState<string>(pet.dogWeight.value != null ? String(pet.dogWeight.value) : "");
  const [weightUnit, setWeightUnit] = useState<"kg" | "lbs">(pet.dogWeight.unit);
  const [vacc, setVacc] = useState<"yes" | "partial" | "unsure" | null>(pet.vaccinationStatus);
  const [conditions, setConditions] = useState(pet.healthConditions ?? "");
  const [vetName, setVetName] = useState(pet.vetName ?? "");
  const [collarId, setCollarId] = useState(pet.collarId ?? "");
  const [strayMon, setStrayMon] = useState<boolean>(pet.isStrayMonitoring);

  const [nameError, setNameError] = useState(false);
  const [shake, setShake] = useState(false);

  const breedKey: BreedKey = (pet.breed as BreedKey) || "shiba";

  const finalBreedJp = breedSelect === "__other__" ? breedOther.trim() : breedSelect;
  const finalBreedEn =
    breedSelect === "__other__"
      ? breedOther.trim()
      : (BREEDS.find((b) => b.jp === breedSelect)?.en ?? breedSelect);

  const validate = (): boolean => {
    const ok = name.trim().length > 0 && finalBreedJp.length > 0;
    if (!name.trim()) {
      setNameError(true);
      setShake(true);
      setTimeout(() => setShake(false), 500);
    }
    return ok;
  };

  const buildPatch = () => ({
    name: name.trim(),
    breedJp: finalBreedJp,
    breedEn: finalBreedEn,
    gender,
    dogAge: {
      years: Number(years) || 0,
      months: Number(months) || 0,
    },
    age: Number(years) || null,
    dogWeight: {
      value: weight ? Number(weight) : null,
      unit: weightUnit,
    },
    weight: weight ? Number(weight) : null,
    vaccinationStatus: vacc,
    vaccinated: vacc === "yes",
    healthConditions: conditions,
    vetName,
    collarId,
    isStrayMonitoring: strayMon,
    justCompletedOnboarding: true,
  });

  const onDone = () => {
    if (!validate()) return;
    updatePet(buildPatch());
    nav({ to: "/onboarding/owner-info" });
  };

  const onSkip = () => {
    if (!name.trim()) {
      // skip still requires name
      setNameError(true);
      setShake(true);
      setTimeout(() => setShake(false), 500);
      return;
    }
    updatePet({
      name: name.trim(),
      breedJp: finalBreedJp || pet.breedJp,
      breedEn: finalBreedEn || pet.breedEn,
      justCompletedOnboarding: true,
    });
    nav({ to: "/home" });
  };

  return (
    <PhoneFrame>
      <div
        className="min-h-screen pb-40"
        style={{ background: "var(--color-bg-app)", fontFamily: "'Nunito','Quicksand',system-ui,sans-serif" }}
      >
        <div className="px-6 pt-4">
          <TopBar to="/onboarding/owner" />
          <Stepper current={4} path={pet.path} />

          {/* Small breathing mascot */}
          <div className="flex justify-center mt-1" style={{ animation: "dgBreathe 3.6s ease-in-out infinite" }}>
            <DogAvatar
              breed={breedKey}
              furColor={pet.avatar.furColor}
              earStyle={pet.avatar.earStyle as EarStyle}
              eyeStyle={(pet.avatar.eyeStyle as EyeStyle) || "happy"}
              collarColor={pet.avatar.collarColor}
              size={80}
              ring={false}
            />
          </div>

          <h1 className="text-[22px] font-extrabold text-center mt-3" style={{ color: "#3B2A23" }}>
            {t("ワンちゃんのこと教えて ", "Tell Us About Your Dog ")}
          </h1>
          <p className="text-center text-[13px] mt-2 leading-relaxed" style={{ color: "#8A766C" }}>
            {t(
              "あなたの体験をパーソナライズし、ワンちゃんをより良く見守るために",
              "Help us personalise your experience and monitor your dog better."
            )}
          </p>

          {/* White form card */}
          <div
            className="mt-5 p-5 rounded-[24px]"
            style={{ background: "#B9D8E1", boxShadow: "0 4px 22px rgba(0,0,0,0.06)" }}
          >
            <SectionLabel>{t("基本情報", "Basic Info")}</SectionLabel>

            {/* Name */}
            <FieldLabel required>{t("ワンちゃんの名前", "Dog's Name")}</FieldLabel>
            <input
              value={name}
              onChange={(e) => { setName(e.target.value); if (nameError) setNameError(false); }}
              placeholder={t("ワンちゃんの名前は？", "What's your dog's name?")}
              className="w-full bg-white outline-none transition-all"
              style={{
                fontFamily: "'Nunito',sans-serif",
                fontSize: 16,
                color: "#3B2A23",
                padding: "10px 2px",
                border: nameError ? "2px solid #E53935" : "2px solid #EAF4F9", borderRadius: 12,
                animation: shake ? "dgShake 0.4s ease-in-out" : "none",
              }}
              onFocus={(e) => { if (!nameError) e.currentTarget.style.border = "2px solid #447F98"; }}
              onBlur={(e) => { if (!nameError) e.currentTarget.style.border = "2px solid #EAF4F9"; }}
            />
            {nameError && (
              <div className="text-[11px] mt-1" style={{ color: "#E53935" }}>
                {t("ワンちゃんの名前を入力してください", "Please enter your dog's name")}
              </div>
            )}

            {/* Breed */}
            <div className="mt-5">
              <FieldLabel required>{t("犬種", "Breed")}</FieldLabel>
              <select
                value={breedSelect}
                onChange={(e) => setBreedSelect(e.target.value)}
                className="w-full bg-white outline-none"
                style={{
                  fontFamily: "'Nunito',sans-serif",
                  fontSize: 15,
                  color: "#3B2A23",
                  padding: "10px 2px",
                  border: "2px solid #EAF4F9", borderRadius: 12,
                }}
              >
                {TOP5.map((b) => (
                  <option key={b.jp} value={b.jp}>
                    {b.jp} / {b.en}
                  </option>
                ))}
                <option value="__other__">{t("その他（入力）", "Other (type below)")}</option>
              </select>
              {breedSelect === "__other__" && (
                <input
                  value={breedOther}
                  onChange={(e) => setBreedOther(e.target.value)}
                  placeholder={t("犬種を入力", "Type breed")}
                  className="w-full bg-white outline-none mt-2"
                  style={{
                    fontFamily: "'Nunito',sans-serif",
                    fontSize: 15,
                    color: "#3B2A23",
                    padding: "8px 2px",
                    border: "2px solid #EAF4F9", borderRadius: 12,
                  }}
                />
              )}
            </div>

            {/* Age */}
            <div className="mt-5">
              <FieldLabel>{t("年齢", "Age")}</FieldLabel>
              <div className="grid grid-cols-2 gap-3 mt-1">
                <NumberField
                  value={years} onChange={setYears}
                  min={0} max={20} placeholder="0"
                  suffix={t("歳", "Years")}
                />
                <NumberField
                  value={months} onChange={setMonths}
                  min={0} max={11} placeholder="0"
                  suffix={t("ヶ月", "Months")}
                />
              </div>
            </div>

            {/* Gender */}
            <div className="mt-5">
              <FieldLabel>{t("性別", "Gender")}</FieldLabel>
              <div className="grid grid-cols-2 gap-3 mt-1">
                <PillButton selected={gender === "male"} onClick={() => setGender("male")}>
                   {t("男の子", "Boy")}
                </PillButton>
                <PillButton selected={gender === "female"} onClick={() => setGender("female")}>
                   {t("女の子", "Girl")}
                </PillButton>
              </div>
            </div>

            {/* Weight */}
            <div className="mt-5">
              <FieldLabel>{t("体重", "Weight")}</FieldLabel>
              <div className="flex gap-2 mt-1 items-stretch">
                <input
                  type="number"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  placeholder={t("体重を入力", "Enter weight")}
                  className="flex-1 bg-white outline-none"
                  style={{
                    fontFamily: "'Nunito',sans-serif",
                    fontSize: 15,
                    color: "#3B2A23",
                    padding: "10px 2px",
                    border: "2px solid #EAF4F9", borderRadius: 12,
                  }}
                />
                <div className="flex gap-1">
                  <UnitToggle selected={weightUnit === "kg"} onClick={() => setWeightUnit("kg")}>kg</UnitToggle>
                  <UnitToggle selected={weightUnit === "lbs"} onClick={() => setWeightUnit("lbs")}>lbs</UnitToggle>
                </div>
              </div>
            </div>

            {/* Health */}
            <SectionLabel>{t("健康とケア", "Health & Care")}</SectionLabel>

            <FieldLabel>{t("予防接種は済んでいますか？", "Is your dog vaccinated?")}</FieldLabel>
            <div className="grid grid-cols-3 gap-2 mt-1">
              <PillButton small selected={vacc === "yes"} onClick={() => setVacc("yes")}>
                 {t("完了", "Yes, fully")}
              </PillButton>
              <PillButton small selected={vacc === "partial"} onClick={() => setVacc("partial")}>
                 {t("一部", "Partially")}
              </PillButton>
              <PillButton small selected={vacc === "unsure"} onClick={() => setVacc("unsure")}>
                 {t("不明", "Not sure")}
              </PillButton>
            </div>

            <div className="mt-5">
              <FieldLabel optional>{t("健康上の問題", "Any known health conditions?")}</FieldLabel>
              <textarea
                value={conditions}
                onChange={(e) => setConditions(e.target.value)}
                placeholder={t(
                  "例：アレルギー、関節の問題、心臓の状態...なければ空欄でOK",
                  "E.g. allergies, joint issues, heart condition... or leave blank if none"
                )}
                className="w-full bg-white outline-none mt-1 rounded-xl p-3 transition-all"
                style={{
                  fontFamily: "'Nunito',sans-serif",
                  fontSize: 14,
                  color: "#3B2A23",
                  minHeight: 80,
                  border: "1.5px solid #F4C0D1",
                  resize: "vertical",
                }}
                onFocus={(e) => e.currentTarget.style.border = "1.5px solid #E8678A"}
                onBlur={(e) => e.currentTarget.style.border = "1.5px solid #F4C0D1"}
              />
            </div>

            <div className="mt-5">
              <FieldLabel optional>{t("獣医の名前", "Vet's Name")}</FieldLabel>
              <input
                value={vetName}
                onChange={(e) => setVetName(e.target.value)}
                placeholder={t("あなたの獣医の名前", "Your vet's name")}
                className="w-full bg-white outline-none mt-1"
                style={{
                  fontFamily: "'Nunito',sans-serif",
                  fontSize: 15,
                  color: "#3B2A23",
                  padding: "10px 2px",
                  border: "2px solid #EAF4F9", borderRadius: 12,
                }}
              />
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
             {t("次へ", "Next")} →
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
          @keyframes dgBreathe {
            0%,100% { transform: scale(1); }
            50% { transform: scale(1.05); }
          }
          @keyframes dgShake {
            0%,100% { transform: translateX(0); }
            20% { transform: translateX(-6px); }
            40% { transform: translateX(6px); }
            60% { transform: translateX(-4px); }
            80% { transform: translateX(4px); }
          }
        `}</style>
      </div>
    </PhoneFrame>
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

function NumberField({
  value, onChange, min, max, placeholder, suffix,
}: { value: string; onChange: (v: string) => void; min: number; max: number; placeholder: string; suffix: string }) {
  return (
    <div className="flex items-center gap-2" style={{ border: "2px solid #EAF4F9", borderRadius: 12, padding: "8px 2px" }}>
      <input
        type="number"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="flex-1 bg-white outline-none"
        style={{ fontFamily: "'Nunito',sans-serif", fontSize: 15, color: "#3B2A23" }}
      />
      <span className="text-[11px] font-bold" style={{ color: "#A38B82" }}>{suffix}</span>
    </div>
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

function UnitToggle({
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
}

function ToggleSwitch({ on, onClick }: { on: boolean; onClick: () => void }) {
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
}
