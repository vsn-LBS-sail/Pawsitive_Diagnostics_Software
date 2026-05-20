import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import PhoneFrame from "@/components/PhoneFrame";
import dogImg from "@/assets/fluffy-dog.png";
import { PawLogo } from "@/components/PawLogo";

export const Route = createFileRoute("/")({ component: Splash });

const petals = [
  { top: "8%", left: "6%", size: 32, delay: 0 },
  { top: "22%", right: "8%", size: 24, delay: 3 },
  { top: "55%", left: "4%", size: 40, delay: 6 },
  { top: "70%", right: "5%", size: 28, delay: 9 },
  { bottom: "12%", left: "12%", size: 22, delay: 12 },
];

function Petal({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
      <path
        d="M20 4 C28 12, 32 22, 20 36 C8 22, 12 12, 20 4 Z"
        fill="rgba(244,63,114,0.06)"
      />
    </svg>
  );
}

function Splash() {
  const nav = useNavigate();

  return (
    <PhoneFrame>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        style={{
          position: "relative",
          minHeight: "100vh",
          height: "100dvh",
          background:
            "linear-gradient(180deg, #EAF4F9 0%, #D6E9F3 50%, #EAF4F9 100%)",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        {/* Sakura petals */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.8 }}
          style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
        >
          {petals.map((p, i) => (
            <motion.div
              key={i}
              animate={{ rotate: 360 }}
              transition={{ duration: 20, ease: "linear", repeat: Infinity, delay: p.delay }}
              style={{
                position: "absolute",
                top: p.top,
                left: p.left,
                right: p.right,
                bottom: p.bottom,
              }}
            >
              <Petal size={p.size} />
            </motion.div>
          ))}
        </motion.div>

        {/* TOP — 0-18% */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5, ease: "easeOut" }}
          style={{
            height: "18%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 6,
            position: "relative",
            zIndex: 2,
          }}
        >
          <div style={{ transform: "rotate(-15deg)" }}>
            <PawLogo size={48} color="#447F98" />
          </div>
          <div style={{ fontSize: 20, fontFamily: "var(--font-heading)", fontWeight: 600, color: "#1A1A2E", letterSpacing: "-0.02em" }}>
            Pawsitive Diagnostics
          </div>
          <div style={{ fontSize: 12, fontWeight: 400, color: "#9CA3AF", letterSpacing: "0.15em" }}>
            ポジティブ診断
          </div>
          <div style={{ width: 40, height: 1, background: "rgba(68,127,152,0.3)", marginTop: 4 }} />
        </motion.div>

        {/* DOG — 18-65% */}
        <div
          style={{
            height: "47%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
            zIndex: 2,
          }}
        >
          <motion.div
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.7, ease: [0.34, 1.56, 0.64, 1] }}
            style={{
              width: "55%",
              display: "flex",
              justifyContent: "center",
              background: "transparent",
              border: "none",
              boxShadow: "none",
              borderRadius: 0,
              padding: 0,
            }}
          >
            <motion.img
              src={dogImg}
              alt="Fluffy companion"
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 3.5, ease: "easeInOut", repeat: Infinity, delay: 1.5 }}
              style={{
                width: "100%",
                height: "auto",
                objectFit: "contain",
                display: "block",
                background: "transparent",
              }}
            />
          </motion.div>
        </div>

        {/* SPEECH BUBBLE — 65-75% */}
        <div
          style={{
            height: "10%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
            zIndex: 2,
          }}
        >
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.9, duration: 0.4, type: "spring", stiffness: 200, damping: 14 }}
            style={{
              position: "relative",
              background: "#fff",
              borderRadius: 20,
              padding: "8px 18px",
              boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
              textAlign: "center",
            }}
          >
            <div
              style={{
                position: "absolute",
                top: -6,
                left: "50%",
                transform: "translateX(-50%) rotate(45deg)",
                width: 12,
                height: 12,
                background: "#fff",
                boxShadow: "-2px -2px 4px rgba(0,0,0,0.04)",
              }}
            />
            <div style={{ fontSize: 13, color: "#374151", fontWeight: 500 }}>
              わんちゃんの健康を守ります 
            </div>
            <div style={{ fontSize: 11, color: "#9CA3AF", marginTop: 2 }}>
              Protecting your dog's health
            </div>
          </motion.div>
        </div>

        {/* CTA — 75-88% */}
        <div
          style={{
            height: "13%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 12,
            position: "relative",
            zIndex: 2,
          }}
        >
          <motion.button
            initial={{ y: 20, opacity: 0 }}
            animate={{
              y: 0,
              opacity: 1,
              boxShadow: [
                "0 8px 28px rgba(68,127,152,0.4)",
                "0 8px 40px rgba(68,127,152,0.6)",
                "0 8px 28px rgba(68,127,152,0.4)",
              ],
            }}
            transition={{
              y: { delay: 1.1, duration: 0.4 },
              opacity: { delay: 1.1, duration: 0.4 },
              boxShadow: { duration: 2, repeat: Infinity, ease: "easeInOut", delay: 1.5 },
            }}
            whileTap={{ scale: 0.97 }}
            onClick={() => nav({ to: "/language" })}
            style={{
              width: "78%",
              height: 52,
              borderRadius: 50,
              border: "none",
              background: "#447F98",
              color: "#fff",
              fontSize: 16,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            はじめる / Get Started
          </motion.button>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.3, duration: 0.3 }}
            style={{ textAlign: "center" }}
          >
            <div style={{ fontSize: 11, color: "#9CA3AF" }}>
              すでにアカウントをお持ちですか？ / Already have an account?
            </div>
            <button
              onClick={() => nav({ to: "/auth" })}
              style={{
                background: "none",
                border: "none",
                fontSize: 13,
                color: "#447F98",
                fontWeight: 600,
                cursor: "pointer",
                marginTop: 2,
              }}
            >
              ログイン / Login
            </button>
          </motion.div>
        </div>

        {/* DOTS — 88-100% */}
        <div
          style={{
            height: "12%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 6,
            position: "relative",
            zIndex: 2,
          }}
        >
          <span style={{ width: 20, height: 8, borderRadius: 50, background: "#447F98" }} />
          <span style={{ width: 8, height: 8, borderRadius: 50, background: "#A8CCD8" }} />
          <span style={{ width: 8, height: 8, borderRadius: 50, background: "#A8CCD8" }} />
        </div>
      </motion.div>
    </PhoneFrame>
  );
}
