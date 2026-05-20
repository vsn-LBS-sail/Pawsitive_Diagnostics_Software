import type { ReactNode, CSSProperties } from "react";

export default function PhoneFrame({ children, innerStyle }: { children: ReactNode; innerStyle?: CSSProperties }) {
  return (
    <div
      style={{
        background: "#E8E0D8",
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-start",
      }}
    >
      <div
        style={{
          position: "relative",
          overflow: "hidden",
          width: "100%",
          maxWidth: 430,
          minHeight: "100vh",
          background: "#FAFAF8",
          boxShadow: "0 0 60px rgba(0,0,0,0.15)",
          ...innerStyle,
        }}
      >
        {children}
      </div>
    </div>
  );
}
