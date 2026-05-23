import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Eye, EyeOff, Mail, Lock, User, PawPrint, Check, ArrowLeft, ChevronRight, Heart, Plus, Stethoscope } from "lucide-react";
import { useT } from "@/context/LanguageContext";
import { HeroIllustration } from "@/routes/language";
import AppShell from "@/components/AppShell";
import { PawLogo } from "@/components/PawLogo";

export const Route = createFileRoute("/auth")({ component: Auth });

type Role = "owner" | "clinic";
const ROLE_KEY = "pawsitive_user_role";

function Auth() {
  const t = useT();
  const [role, setRole] = useState<Role | null>(null);
  const [tab, setTab] = useState<"login" | "signup">("login");
  const nav = useNavigate();

  const selectRole = (r: Role) => {
    setRole(r);
    if (typeof window !== "undefined") localStorage.setItem(ROLE_KEY, r);
  };

  return (
    <AppShell hideTopBar hideBottomNav>
      <div className="min-h-screen flex flex-col" style={{ background: "#FAFAF8" }}>
        <HeroIllustration compact />

        <div
          className="flex-1 -mt-6 w-full px-6 pb-10 pt-7"
          style={{
            background: "#FFFFFF",
            borderRadius: "32px 32px 0 0",
            boxShadow: "0 -8px 32px rgba(0,0,0,0.06)",
          }}
        >
          <div className="mx-auto mb-5 rounded-full" style={{ width: 32, height: 4, background: "#E8E0DC" }} />

          {role === null ? (
            <RoleSelect onSelect={selectRole} t={t} />
          ) : (
            <LoginForm
              role={role}
              tab={tab}
              setTab={setTab}
              onBack={() => setRole(null)}
              onSubmit={() => nav({ to: "/onboarding/welcome" })}
              t={t}
            />
          )}

          <Link to="/language" className="block text-center text-[11px] mt-5" style={{ color: "#C4B8B4" }}>
            ← {t("言語選択へ戻る", "Back to language")}
          </Link>
        </div>
      </div>
    </AppShell>
  );
}

/* ──────────────────────── Role selection ──────────────────────── */

function RoleSelect({ onSelect, t }: { onSelect: (r: Role) => void; t: (jp: string, en: string) => string }) {
  return (
    <div className="mt-2">
      <h2 className="text-center font-bold" style={{ fontSize: 22, color: "#1A1A2E" }}>
        {t("ご利用の方をお選びください", "Who's signing in?")}
      </h2>
      <p className="text-center mt-1 mb-6" style={{ fontSize: 13, color: "#8A8A8A" }}>
        {t("ログインの種類を選んでください", "Choose your login type")}
      </p>

      <RoleCard
        onClick={() => onSelect("owner")}
        accent="#447F98"
        accentSoftBorder="#EAF4F9"
        iconBg="#EAF4F9"
        shadow="0 4px 16px rgba(68,127,152,0.15)"
        icon={
          <div className="relative" style={{ width: 32, height: 32 }}>
            <PawPrint size={28} style={{ color: "#447F98", position: "absolute", top: 0, left: 2 }} strokeWidth={2} />
            <Heart size={12} fill="#A8CCD8" style={{ color: "#A8CCD8", position: "absolute", bottom: -2, right: -2 }} />
          </div>
        }
        titleJp="いぬの家族"
        titleEn="Pet Family"
        subJp="犬の飼い主の方"
        subEn="For dog owners"
      />

      {/* OR divider */}
      <div className="flex items-center gap-3" style={{ margin: "14px 4px" }}>
        <div style={{ flex: 1, height: 1, background: "#F3F4F6" }} />
        <div style={{ fontSize: 12, color: "#D1D5DB", fontWeight: 500 }}>{t("または", "or")}</div>
        <div style={{ flex: 1, height: 1, background: "#F3F4F6" }} />
      </div>

      <RoleCard
        onClick={() => onSelect("clinic")}
        accent="#38BDF8"
        accentSoftBorder="#E0F2FE"
        iconBg="#F0F9FF"
        shadow="0 4px 16px rgba(14,165,233,0.08)"
        icon={
          <div className="relative flex items-center justify-center" style={{ width: 32, height: 32 }}>
            <Plus size={24} strokeWidth={2.6} style={{ color: "#38BDF8" }} />
            <Stethoscope size={14} style={{ color: "#7DD3FC", position: "absolute", bottom: -4, right: -4 }} strokeWidth={2} />
          </div>
        }
        titleJp="どうぶつ病院"
        titleEn="Animal Clinic"
        subJp="獣医・クリニックの方"
        subEn="For vets & clinics"
      />
    </div>
  );
}

function RoleCard({
  onClick, accent, accentSoftBorder, iconBg, shadow, icon, titleJp, titleEn, subJp, subEn,
}: {
  onClick: () => void;
  accent: string;
  accentSoftBorder: string;
  iconBg: string;
  shadow: string;
  icon: React.ReactNode;
  titleJp: string; titleEn: string; subJp: string; subEn: string;
}) {
  const [pressed, setPressed] = useState(false);
  return (
    <button
      onClick={onClick}
      onPointerDown={() => setPressed(true)}
      onPointerUp={() => setPressed(false)}
      onPointerLeave={() => setPressed(false)}
      className="w-full flex items-center gap-4 text-left transition-all"
      style={{
        background: "#FFFFFF",
        border: `1.5px solid ${pressed ? accent : accentSoftBorder}`,
        borderRadius: 20,
        padding: 20,
        boxShadow: shadow,
        transform: pressed ? "scale(0.98)" : "scale(1)",
      }}
    >
      <div
        className="shrink-0 flex items-center justify-center"
        style={{ width: 64, height: 64, borderRadius: 16, background: iconBg }}
      >
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div style={{ fontSize: 18, fontFamily: "var(--font-heading)", fontWeight: 600, color: "#1A1A2E", lineHeight: 1.2 }}>
          {titleJp}
        </div>
        <div style={{ fontSize: 14, fontWeight: 500, color: accent, marginTop: 2 }}>
          {titleEn}
        </div>
        <div style={{ fontSize: 12, color: "#9CA3AF", marginTop: 6 }}>
          {subEn} · {subJp}
        </div>
      </div>
      <ChevronRight size={16} style={{ color: "#D1D5DB" }} />
    </button>
  );
}


/* ──────────────────────── Chibi SVG doodles ──────────────────────── */

function OwnerDoodle() {
  // Person hugging a dog - warm pastel chibi style
  return (
    <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Person head */}
      <circle cx="22" cy="20" r="9" fill="#FCD9C2" stroke="#5C3A2E" strokeWidth="1.4" />
      {/* Hair */}
      <path d="M14 18c0-6 4-10 8-10s8 4 8 9c-2-2-5-3-8-3s-6 1-8 4z" fill="#5C3A2E" />
      {/* Person body */}
      <path d="M10 52c0-8 5-14 12-14s12 6 12 14" fill="#A8CCD8" stroke="#5C3A2E" strokeWidth="1.4" strokeLinejoin="round" />
      {/* Person eyes */}
      <circle cx="19" cy="21" r="1.1" fill="#2C2C2C" />
      <circle cx="25" cy="21" r="1.1" fill="#2C2C2C" />
      {/* Smile */}
      <path d="M20 25c1 1 3 1 4 0" stroke="#2C2C2C" strokeWidth="1.2" strokeLinecap="round" fill="none" />
      {/* Cheek blush */}
      <circle cx="17" cy="24" r="1.3" fill="#EAF4F9" opacity="0.7" />
      <circle cx="27" cy="24" r="1.3" fill="#EAF4F9" opacity="0.7" />

      {/* Dog body */}
      <ellipse cx="46" cy="46" rx="13" ry="10" fill="#F0C896" stroke="#5C3A2E" strokeWidth="1.4" />
      {/* Dog head */}
      <circle cx="48" cy="32" r="10" fill="#F0C896" stroke="#5C3A2E" strokeWidth="1.4" />
      {/* Ears */}
      <path d="M40 27c-2-3-2-7 0-8 2 0 4 3 4 6z" fill="#C4813A" stroke="#5C3A2E" strokeWidth="1.2" strokeLinejoin="round" />
      <path d="M56 27c2-3 2-7 0-8-2 0-4 3-4 6z" fill="#C4813A" stroke="#5C3A2E" strokeWidth="1.2" strokeLinejoin="round" />
      {/* Dog eyes */}
      <circle cx="45" cy="32" r="1.2" fill="#2C2C2C" />
      <circle cx="51" cy="32" r="1.2" fill="#2C2C2C" />
      {/* Dog nose */}
      <ellipse cx="48" cy="36" rx="1.6" ry="1.2" fill="#2C2C2C" />
      {/* Dog smile */}
      <path d="M46 38c1 1 3 1 4 0" stroke="#2C2C2C" strokeWidth="1.1" strokeLinecap="round" fill="none" />
      {/* Collar */}
      <path d="M38 42c4 2 16 2 20 0" stroke="#447F98" strokeWidth="2" strokeLinecap="round" fill="none" />
    </svg>
  );
}

function ClinicDoodle() {
  // Vet in white coat with a calm dog
  return (
    <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Vet head */}
      <circle cx="22" cy="20" r="9" fill="#FCD9C2" stroke="#3E5B58" strokeWidth="1.4" />
      {/* Hair */}
      <path d="M14 18c0-6 4-10 8-10s8 4 8 9c-2-2-5-3-8-3s-6 1-8 4z" fill="#3E5B58" />
      {/* White coat body */}
      <path d="M10 52c0-8 5-14 12-14s12 6 12 14" fill="#FFFFFF" stroke="#3E5B58" strokeWidth="1.4" strokeLinejoin="round" />
      {/* Coat lapel */}
      <path d="M22 38l-4 8M22 38l4 8" stroke="#3E5B58" strokeWidth="1.2" strokeLinecap="round" />
      {/* Stethoscope */}
      <path d="M17 40c-1 4 0 8 5 9" stroke="#7BB5B0" strokeWidth="1.6" fill="none" strokeLinecap="round" />
      <circle cx="22" cy="49" r="1.8" fill="#7BB5B0" />
      {/* Medical cross badge */}
      <rect x="26" y="42" width="5" height="5" rx="1" fill="#A8CCD8" />
      <path d="M28.5 43.2v2.6M27.2 44.5h2.6" stroke="#FFFFFF" strokeWidth="0.9" strokeLinecap="round" />
      {/* Vet eyes */}
      <circle cx="19" cy="21" r="1.1" fill="#2C2C2C" />
      <circle cx="25" cy="21" r="1.1" fill="#2C2C2C" />
      <path d="M20 25c1 1 3 1 4 0" stroke="#2C2C2C" strokeWidth="1.2" strokeLinecap="round" fill="none" />
      <circle cx="17" cy="24" r="1.3" fill="#EAF4F9" opacity="0.7" />
      <circle cx="27" cy="24" r="1.3" fill="#EAF4F9" opacity="0.7" />

      {/* Calm dog sitting */}
      <ellipse cx="48" cy="48" rx="11" ry="8" fill="#E8D5C0" stroke="#3E5B58" strokeWidth="1.4" />
      <circle cx="48" cy="34" r="9" fill="#E8D5C0" stroke="#3E5B58" strokeWidth="1.4" />
      {/* Floppy ears */}
      <path d="M41 30c-2 2-2 6 0 8 2-1 3-3 3-6z" fill="#B89878" stroke="#3E5B58" strokeWidth="1.2" strokeLinejoin="round" />
      <path d="M55 30c2 2 2 6 0 8-2-1-3-3-3-6z" fill="#B89878" stroke="#3E5B58" strokeWidth="1.2" strokeLinejoin="round" />
      {/* Eyes - closed/calm */}
      <path d="M44 34c1 1 2 1 3 0" stroke="#2C2C2C" strokeWidth="1.2" strokeLinecap="round" fill="none" />
      <path d="M49 34c1 1 2 1 3 0" stroke="#2C2C2C" strokeWidth="1.2" strokeLinecap="round" fill="none" />
      <ellipse cx="48" cy="37" rx="1.4" ry="1.1" fill="#2C2C2C" />
      <path d="M46 39c1 1 3 1 4 0" stroke="#2C2C2C" strokeWidth="1.1" strokeLinecap="round" fill="none" />
    </svg>
  );
}

/* ──────────────────────── Login form ──────────────────────── */

function LoginForm({
  role, tab, setTab, onBack, onSubmit, t,
}: {
  role: Role;
  tab: "login" | "signup";
  setTab: (t: "login" | "signup") => void;
  onBack: () => void;
  onSubmit: () => void;
  t: (jp: string, en: string) => string;
}) {
  const isOwner = role === "owner";
  const accent = isOwner ? "#447F98" : "#2C3E50";
  const accentBg = isOwner ? "#EAF4F9" : "#E5ECEF";
  const roleJp = isOwner ? "いぬの家族" : "どうぶつ病院";
  const roleEn = isOwner ? "Pet Family" : "Animal Clinic";

  return (
    <div>
      {/* Page paw logo */}
      <div className="flex justify-center mb-3">
        <PawLogo size={64} color="#447F98" />
      </div>
      {/* Header with back + role badge */}
      <div className="flex items-center gap-3 mb-4">
        <button
          onClick={onBack}
          aria-label="Back"
          className="w-10 h-10 rounded-full flex items-center justify-center active:scale-95 transition-transform"
          style={{ background: "#FAFAF8", border: "1.5px solid #EDE8E4" }}
        >
          <ArrowLeft className="w-5 h-5" style={{ color: "#2C2C2C" }} />
        </button>
        <div
          className="flex items-center gap-2 rounded-full pl-1 pr-3 py-1"
          style={{ background: accentBg }}
        >
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center"
            style={{ background: "#FFFFFF" }}
          >
            <div style={{ transform: "scale(0.55)", transformOrigin: "center" }}>
              {isOwner ? <OwnerDoodle /> : <ClinicDoodle />}
            </div>
          </div>
          <div className="leading-tight">
            <div className="font-bold" style={{ fontSize: 13, color: "#2C2C2C" }}>{roleJp}</div>
            <div className="font-semibold" style={{ fontSize: 11, color: accent }}>{roleEn}</div>
          </div>
        </div>
      </div>

      {/* Tab switcher */}
      <div className="relative flex p-1 rounded-xl" style={{ background: "#F5F0EC" }}>
        {(["login", "signup"] as const).map((tb) => {
          const active = tab === tb;
          return (
            <button
              key={tb}
              onClick={() => setTab(tb)}
              className="flex-1 h-10 rounded-[10px] transition-all"
              style={{
                background: active ? "#FFFFFF" : "transparent",
                color: active ? accent : "#8A8A8A",
                fontWeight: active ? 700 : 500,
                fontSize: 16,
                boxShadow: active ? "0 2px 8px rgba(0,0,0,0.08)" : "none",
              }}
            >
              {tb === "login" ? t("ログイン", "Login") : t("登録", "Sign Up")}
            </button>
          );
        })}
      </div>

      {tab === "login" ? (
        <div className="mt-6 space-y-3">
          <JField icon={<Mail className="w-4 h-4" />} placeholder={t("メールアドレス", "Email")} type="email" autoComplete="email" />
          <PasswordField placeholder={t("パスワード", "Password")} />
          <div className="flex justify-end">
            <button className="text-[13px]" style={{ color: accent }}>{t("パスワードを忘れた？", "Forgot Password?")}</button>
          </div>
          <PrimaryButton accent={accent} onClick={onSubmit}>
            {t("ログイン", "Login")}
          </PrimaryButton>

          <Divider label={t("または", "OR")} />
          <SocialButtons />
          <p className="text-center mt-4" style={{ fontSize: 13, color: "#8A8A8A" }}>
            {t("アカウントをお持ちでない？", "Don't have an account?")}{" "}
            <button onClick={() => setTab("signup")} className="font-semibold" style={{ color: accent }}>
              {t("登録", "Sign Up")} →
            </button>
          </p>
        </div>
      ) : (
        <div className="mt-6 space-y-3">
          <JField icon={<User className="w-4 h-4" />} placeholder={t("お名前", "Your Name")} autoComplete="name" />
          <JField icon={<Mail className="w-4 h-4" />} placeholder={t("メールアドレス", "Email")} type="email" autoComplete="email" />
          <PasswordField placeholder={t("パスワード", "Password")} />
          <PasswordField placeholder={t("パスワード確認", "Confirm Password")} />

          <TermsCheckbox accent={accent} label={t("利用規約に同意します", "I agree to Terms")} />

          <PrimaryButton accent={accent} onClick={onSubmit}>
            {t("アカウント作成", "Create Account")}
          </PrimaryButton>

          <Divider label={t("または", "OR")} />
          <SocialButtons />

          <p className="text-center mt-4" style={{ fontSize: 13, color: "#8A8A8A" }}>
            {t("すでにアカウントをお持ちですか？", "Already have account?")}{" "}
            <button onClick={() => setTab("login")} className="font-semibold" style={{ color: accent }}>
              {t("ログイン", "Login")} →
            </button>
          </p>
        </div>
      )}
    </div>
  );
}

/* ──────────────────────── Reusable inputs ──────────────────────── */

export function JField({
  icon, placeholder, type = "text", autoComplete, right, value, onChange,
}: {
  icon: React.ReactNode; placeholder: string; type?: string; autoComplete?: string; right?: React.ReactNode;
  value?: string; onChange?: (v: string) => void;
}) {
  const [internal, setInternal] = useState("");
  const controlled = value !== undefined;
  const val = controlled ? value! : internal;
  const setVal = (v: string) => {
    if (!controlled) setInternal(v);
    onChange?.(v);
  };
  const [focus, setFocus] = useState(false);
  const active = focus || val.length > 0;
  return (
    <div
      className="relative h-[56px] rounded-[14px] flex items-center px-4 transition-all"
      style={{
        background: focus ? "#FFFFFF" : "#FAFAF8",
        border: `1.5px solid ${focus ? "#447F98" : "#EDE8E4"}`,
        boxShadow: focus ? "0 0 0 3px rgba(68,127,152,0.15)" : "none",
      }}
    >
      <span className="mr-3" style={{ color: focus ? "#447F98" : "#C4B8B4" }}>{icon}</span>
      <div className="relative flex-1">
        <label
          className="absolute left-0 pointer-events-none transition-all"
          style={{
            top: active ? -18 : "50%",
            transform: active ? "translateY(0)" : "translateY(-50%)",
            fontSize: active ? 12 : 16,
            color: active ? "#447F98" : "#C4B8B4",
          }}
        >
          {placeholder}
        </label>
        <input
          type={type}
          autoComplete={autoComplete}
          value={val}
          onChange={(e) => setVal(e.target.value)}
          onFocus={() => setFocus(true)}
          onBlur={() => setFocus(false)}
          className="w-full bg-transparent outline-none"
          style={{ color: "#2C2C2C", fontSize: 16 }}
        />
      </div>
      {right}
    </div>
  );
}

function PasswordField({ placeholder }: { placeholder: string }) {
  const [show, setShow] = useState(false);
  return (
    <JField
      icon={<Lock className="w-4 h-4" />}
      placeholder={placeholder}
      type={show ? "text" : "password"}
      autoComplete="current-password"
      right={
        <button onClick={() => setShow(!show)} style={{ color: "#C4B8B4" }}>
          {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      }
    />
  );
}

export function PrimaryButton({ children, onClick, accent = "#447F98" }: { children: React.ReactNode; onClick?: () => void; accent?: string }) {
  const darker = accent === "#7BB5B0" ? "#5C9590" : "#C86882";
  return (
    <button
      onClick={onClick}
      className="w-full h-[56px] rounded-[14px] text-white font-bold flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
      style={{
        fontSize: 17,
        background: "#447F98",
        boxShadow: `0 8px 20px ${accent}59`,
      }}
    >
      <PawPrint className="w-4 h-4" strokeWidth={2.2} />
      {children}
    </button>
  );
}

function Divider({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 my-4">
      <div className="flex-1 h-px" style={{ background: "#EDE8E4" }} />
      <span className="text-[13px]" style={{ color: "#C4B8B4" }}>{label}</span>
      <div className="flex-1 h-px" style={{ background: "#EDE8E4" }} />
    </div>
  );
}

function SocialButtons() {
  return (
    <div className="space-y-2">
      <button
        className="w-full h-12 rounded-[14px] text-white font-bold flex items-center justify-center gap-3"
        style={{ background: "#06C755", boxShadow: "0 4px 12px rgba(6,199,85,0.25)", fontSize: 15 }}
      >
        <span className="w-5 h-5 rounded-[4px] bg-white text-[#06C755] text-xs font-black flex items-center justify-center">L</span>
        LINEでログイン / Login with LINE
      </button>
      <button
        className="w-full h-12 rounded-[14px] flex items-center justify-center gap-3"
        style={{ background: "#FFFFFF", border: "1.5px solid #EDE8E4", color: "#2C2C2C", fontSize: 15 }}
      >
        <span className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-black"
          style={{ background: "conic-gradient(from 0deg,#EA4335,#FBBC05,#34A853,#4285F4)", color: "white" }}>G</span>
        Googleでログイン / Login with Google
      </button>
      <button
        className="w-full h-12 rounded-[14px] text-white flex items-center justify-center gap-3"
        style={{ background: "#000000", fontSize: 15 }}
      >
        <span className="text-base"></span>
        Appleでログイン / Login with Apple
      </button>
    </div>
  );
}

function TermsCheckbox({ label, accent }: { label: string; accent: string }) {
  const [on, setOn] = useState(false);
  return (
    <label className="flex items-start gap-2 mt-1 cursor-pointer">
      <button
        onClick={() => setOn(!on)}
        className="mt-0.5 w-[20px] h-[20px] rounded-[6px] flex items-center justify-center transition-all"
        style={{
          background: on ? accent : "#FFFFFF",
          border: on ? "none" : "1.5px solid #EDE8E4",
        }}
      >
        {on && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
      </button>
      <span style={{ fontSize: 13, color: "#8A8A8A" }}>
        <span className="underline" style={{ color: accent }}>利用規約</span>{" "}{label}
      </span>
    </label>
  );
}
