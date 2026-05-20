import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import DogAvatar from "@/components/DogAvatar";
import PhoneFrame from "@/components/PhoneFrame";
import { PrimaryButton } from "@/routes/auth";
import { PawLogo } from "@/components/PawLogo";
import { useT } from "@/context/LanguageContext";

export const Route = createFileRoute("/onboarding/welcome")({ component: Welcome });

function Welcome() {
  const nav = useNavigate();
  const t = useT();

  return (
    <PhoneFrame>
      <div
        className="min-h-screen flex flex-col px-6 pt-10 pb-10"
        style={{ background: "var(--color-bg-app)" }}
      >
        {/* Logo */}
        <div className="flex flex-col items-center gap-2">
          <PawLogo size={56} color="var(--color-primary)" />
          <div className="text-[22px] font-extrabold tracking-tight" style={{ color: "var(--color-text-primary)", fontFamily: "var(--font-display)" }}>
            Pawsit<span style={{ position: "relative" }}>
              i
              <span
                style={{
                  position: "absolute",
                  top: -2, left: 2,
                  width: 6, height: 6,
                  background: "var(--color-primary)",
                  borderRadius: 999,
                }}
              />
            </span>ve Diagnostics</div>
        </div>

        {/* Avatar */}
        <div className="flex-1 flex flex-col items-center justify-center mt-8">
          <div className="relative">
            <div
              className="rounded-full flex items-center justify-center"
              style={{
                width: 200, height: 200,
                background: "var(--color-bg-card-elevated)",
                boxShadow: "0 10px 30px rgba(68,127,152,0.18), inset 0 0 0 3px rgba(255,255,255,0.7)",
              }}
            >
              <DogAvatar breed="shiba" size={170} ring={false} />
            </div>
          </div>

          <h1
            className="text-center mt-8 text-[26px] font-extrabold leading-tight"
            style={{ color: "var(--color-text-primary)", fontFamily: "var(--font-heading)" }}
          >
            {t("Pawsitive Diagnosticsへようこそ！", "Welcome to Pawsitive Diagnostics!")}
          </h1>
          <p
            className="text-center mt-3 text-[14px] leading-relaxed max-w-[300px]"
            style={{ color: "var(--color-text-secondary)" }}
          >
            {t(
              "ワンちゃんのアバターを作って、スマート健康モニタリングを始めましょう。",
              "Create your dog's avatar and get started with smart health monitoring."
            )}
          </p>
        </div>

        {/* CTA */}
        <div className="mt-8">
          <PrimaryButton onClick={() => nav({ to: "/onboarding/dog" })}>
             {t("マイドッグのアバターを作る", "Create My Dog's Avatar")}
          </PrimaryButton>
          <div className="text-center mt-4">
            <Link
              to="/onboarding/details"
              className="text-[13px] underline"
              style={{ color: "var(--color-text-muted)" }}
            >
              {t("今はスキップ", "Skip for now")}
            </Link>
          </div>
        </div>
      </div>
    </PhoneFrame>
  );
}

