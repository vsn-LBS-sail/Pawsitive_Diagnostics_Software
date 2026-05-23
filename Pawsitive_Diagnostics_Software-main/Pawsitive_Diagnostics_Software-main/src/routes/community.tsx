import { createFileRoute } from "@tanstack/react-router";
import AppShell from "@/components/AppShell";
import { POSTS as SEED_POSTS } from "@/lib/mock";
import { useMemo, useState, useRef } from "react";
import {
  PenLine,
  ArrowUp,
  MessageCircle,
  Share2,
  Bookmark,
  Flame,
  PawPrint,
  FileText,
  Users as UsersIcon,
  X,
  Camera,
  Image as ImageIcon,
  MapPin,
  Send,
  Link as LinkIcon,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useT, useLanguage } from "@/context/LanguageContext";
import { toast } from "sonner";

export const Route = createFileRoute("/community")({ component: Community });

// ── Flair → colour theme ───────────────────────────────────────
type Theme = {
  key: string;
  jp: string;
  en: string;
  accent: string;
  soft: string;
  ring: string;
  gradFrom: string;
  gradTo: string;
  emoji: string;
};

const FLAIR_THEMES: Record<string, Theme> = {
  健康: { key: "健康", jp: "健康", en: "Health", accent: "#6BAF92", soft: "#E8F5EE", ring: "#C8E5D7", gradFrom: "#6BAF92", gradTo: "#A8D4BE", emoji: "" },
  "獣医Q&A": { key: "獣医Q&A", jp: "獣医Q&A", en: "Vet Q&A", accent: "#5B9BD5", soft: "#E8F2FF", ring: "#C8E0F8", gradFrom: "#5B9BD5", gradTo: "#8BBDE8", emoji: "" },
  迷子: { key: "迷子", jp: "迷子", en: "Lost", accent: "#D4A843", soft: "#FFF8DC", ring: "#F0E4A0", gradFrom: "#D4A843", gradTo: "#E8C470", emoji: "" },
  日常: { key: "日常", jp: "日常", en: "Daily", accent: "#E8829A", soft: "#FFF0F5", ring: "#FFD0DC", gradFrom: "#E8829A", gradTo: "#F0A8B8", emoji: "" },
  しつけ: { key: "しつけ", jp: "しつけ", en: "Training", accent: "#7B68C8", soft: "#F0ECFF", ring: "#DDD4F8", gradFrom: "#7B68C8", gradTo: "#9B88D8", emoji: "" },
};

function themeFor(flair: string): Theme {
  return FLAIR_THEMES[flair] ?? FLAIR_THEMES["日常"];
}

// ── Categories ────────────────────────────────────────────────
type Cat = { jp: string; en: string; emoji: string; accent: string; soft: string; gradFrom?: string; gradTo?: string };
const CATS: Cat[] = [
  { jp: "すべて", en: "All", emoji: "", accent: "#FFFFFF", soft: "linear-gradient(135deg,#E8829A,#C86882)", gradFrom: "#E8829A", gradTo: "#C86882" },
  { jp: "柴犬部", en: "Shiba Club", emoji: "", accent: "#E8829A", soft: "#FFF0F3" },
  { jp: "プードル部", en: "Poodle Club", emoji: "", accent: "#7B68C8", soft: "#F5F0FF" },
  { jp: "迷子情報", en: "Lost Pets", emoji: "", accent: "#D4A843", soft: "#FFF3CC" },
  { jp: "獣医Q&A", en: "Vet Q&A", emoji: "", accent: "#6BAF92", soft: "#E8F5EE" },
  { jp: "東京", en: "Tokyo", emoji: "", accent: "#5B9BD5", soft: "#E8F2FF" },
  { jp: "大阪", en: "Osaka", emoji: "", accent: "#E8829A", soft: "#FFF0F3" },
];

// Predicate for a post given a category index
function matchesCat(p: PostT, idx: number): boolean {
  switch (idx) {
    case 0: return true;
    case 1: return p.breed === "柴犬";
    case 2: return p.breed.includes("プードル") || p.breed.toLowerCase().includes("poodle");
    case 3: return p.flair === "迷子";
    case 4: return p.flair === "獣医Q&A";
    case 5: return (p.location ?? "").includes("東京") || (p.location ?? "").toLowerCase().includes("tokyo");
    case 6: return (p.location ?? "").includes("大阪") || (p.location ?? "").toLowerCase().includes("osaka");
    default: return true;
  }
}

// ── Username → avatar colour ──────────────────────────────────
function avatarPalette(name: string) {
  const c = (name?.trim()?.[0] ?? "A").toUpperCase().charCodeAt(0);
  if (c >= 65 && c <= 68) return { bg: "#FFE4EC", fg: "#C45478" };
  if (c >= 69 && c <= 72) return { bg: "#EDE0FF", fg: "#6B57B8" };
  if (c >= 73 && c <= 76) return { bg: "#D6EEFF", fg: "#3F7BB8" };
  if (c >= 77 && c <= 80) return { bg: "#FFF3CC", fg: "#A88128" };
  if (c >= 81 && c <= 84) return { bg: "#D4F0E8", fg: "#3F8C72" };
  if (c >= 85 && c <= 90) return { bg: "#FFE8D6", fg: "#B8784A" };
  const palettes = [
    { bg: "#FFE4EC", fg: "#C45478" },
    { bg: "#EDE0FF", fg: "#6B57B8" },
    { bg: "#D6EEFF", fg: "#3F7BB8" },
    { bg: "#FFF3CC", fg: "#A88128" },
    { bg: "#D4F0E8", fg: "#3F8C72" },
    { bg: "#FFE8D6", fg: "#B8784A" },
  ];
  return palettes[c % palettes.length];
}

const BREED_EMOJI: Record<string, string> = {
  柴犬: "", トイプードル: "", チワワ: "", ポメラニアン: "",
  ゴールデンレトリバー: "", ミニチュアダックスフンド: "",
  フレンチブルドッグ: "", ヨークシャーテリア: "", ミックス犬: "",
};

// ── Post / Comment data shapes ────────────────────────────────
type PostT = {
  id: string;
  user: string;
  breed: string;
  time: string;
  titleJp: string;
  titleEn: string;
  body?: string;
  flair: string;
  up: number;
  com: number;
  images?: string[];
  location?: string;
  isNew?: boolean;
};

type CommentT = {
  id: string;
  user: string;
  time: string;
  text: string;
  up: number;
};

// Tags available for posting
const TAGS: { key: string; jp: string; en: string }[] = [
  { key: "健康", jp: "健康", en: "Health" },
  { key: "日常", jp: "日常", en: "Daily" },
  { key: "迷子", jp: "迷子", en: "Lost" },
  { key: "獣医Q&A", jp: "獣医Q&A", en: "VetQA" },
  { key: "しつけ", jp: "しつけ", en: "Tips" },
];

// Current logged-in user (mock)
const ME = { user: "あなた", userEn: "You", breed: "柴犬" };

function Community() {
  const t = useT();
  const { language } = useLanguage();
  const [sub, setSub] = useState(0);
  const [open, setOpen] = useState<string | null>(null);
  const [upvoted, setUpvoted] = useState<Record<string, boolean>>({});
  const [bookmarked, setBookmarked] = useState<Record<string, boolean>>({});
  const [burst, setBurst] = useState<string | null>(null);
  const [posts, setPosts] = useState<PostT[]>(() => SEED_POSTS as PostT[]);
  const [composeOpen, setComposeOpen] = useState(false);
  const [shareFor, setShareFor] = useState<string | null>(null);

  // Comments per post id
  const [commentsByPost, setCommentsByPost] = useState<Record<string, CommentT[]>>(() => ({
    "1": [
      { id: "c1", user: "ハナちゃんママ", time: "2時間前", text: "うちの子も同じでした！獣医に行ったら熱があると言われました。", up: 8 },
      { id: "c2", user: "Tokyo Dog Lover", time: "1時間前", text: "すぐに獣医に連れて行ってあげてください！", up: 12 },
    ],
  }));

  const post = posts.find((p) => p.id === open) ?? null;
  const trending = useMemo(() => posts.slice().sort((a, b) => b.up - a.up).slice(0, 4), [posts]);
  const filtered = useMemo(() => posts.filter((p) => matchesCat(p, sub)), [posts, sub]);

  function toggleUpvote(id: string) {
    setUpvoted((u) => ({ ...u, [id]: !u[id] }));
    setBurst(id);
    setTimeout(() => setBurst(null), 600);
  }

  function toggleBookmark(id: string) {
    setBookmarked((b) => {
      const next = { ...b, [id]: !b[id] };
      if (next[id]) toast(t("保存しました", "Saved to bookmarks"), { duration: 1500 });
      return next;
    });
  }

  async function sharePost(p: PostT) {
    const title = language === "english" ? p.titleEn : p.titleJp;
    const text = `${title} — Pawsitive Diagnostics Community`;
    if (typeof navigator !== "undefined" && (navigator as any).share) {
      try {
        await (navigator as any).share({ title, text, url: typeof window !== "undefined" ? window.location.href : "" });
        return;
      } catch {
        /* user cancelled — fall through */
        return;
      }
    }
    setShareFor(p.id);
  }

  function addPost(data: { titleJp: string; titleEn: string; body: string; flair: string; images: string[]; location: string }) {
    const newPost: PostT = {
      id: `n-${Date.now()}`,
      user: ME.user,
      breed: ME.breed,
      time: t("たった今", "Just now"),
      titleJp: data.titleJp,
      titleEn: data.titleEn || data.titleJp,
      body: data.body,
      flair: data.flair,
      up: 0,
      com: 0,
      images: data.images,
      location: data.location || undefined,
      isNew: true,
    };
    setPosts((arr) => [newPost, ...arr]);
    setComposeOpen(false);
    toast(t("投稿しました！", "Post published!"), {
      duration: 2500,
      style: { background: "#1A1A2E", color: "#fff", border: "none" },
    });
  }

  function addComment(postId: string, text: string) {
    const c: CommentT = { id: `c-${Date.now()}`, user: ME.user, time: t("たった今", "Just now"), text, up: 0 };
    setCommentsByPost((m) => ({ ...m, [postId]: [...(m[postId] ?? []), c] }));
    setPosts((arr) => arr.map((p) => (p.id === postId ? { ...p, com: p.com + 1 } : p)));
  }

  return (
    <AppShell noPadding>
      {/* ── Header Banner ─────────────────────────────────────── */}
      <div className="relative">
        <div
          className="relative overflow-hidden"
          style={{
            height: 120,
            background: "linear-gradient(135deg,#FFF0F5 0%,#F5F0FF 50%,#EEF5FF 100%)",
            borderRadius: "0 0 28px 28px",
          }}
        >
          <div style={{ position: "absolute", right: -20, top: -10, width: 120, height: 120, borderRadius: "50%", background: "#FFE4EC", opacity: 0.35, filter: "blur(20px)" }} />
          <svg width="64" height="56" viewBox="0 0 64 56" style={{ position: "absolute", right: 24, top: 22, opacity: 0.35 }}>
            <rect x="4" y="12" width="56" height="6" rx="2" fill="#FFD4E8" />
            <rect x="2" y="6" width="60" height="5" rx="2" fill="#FFD4E8" />
            <rect x="12" y="18" width="6" height="34" rx="2" fill="#FFD4E8" />
            <rect x="46" y="18" width="6" height="34" rx="2" fill="#FFD4E8" />
          </svg>
          {[
            { l: 60, t: 40, d: 0 },
            { l: 130, t: 18, d: 1.2 },
            { l: 200, t: 70, d: 2.4 },
            { l: 30, t: 80, d: 0.6 },
          ].map((p, i) => (
            <div
              key={i}
              style={{
                position: "absolute",
                left: p.l,
                top: p.t,
                width: 8,
                height: 12,
                background: "#FFB7C5",
                opacity: 0.5,
                borderRadius: "50% 50% 50% 50% / 60% 60% 40% 40%",
                animation: `petalFall 6s ${p.d}s ease-in-out infinite`,
              }}
            />
          ))}

          <div style={{ position: "absolute", left: 20, top: 20, right: 96 }}>
            <div style={{ fontSize: 13, color: "#E8829A", letterSpacing: "0.1em", fontWeight: 600 }}>コミュニティ</div>
            <div style={{ fontSize: 24, fontFamily: "var(--font-heading)", fontWeight: 600, color: "#2C2C2C", lineHeight: 1.1, marginTop: 2 }}>
              {t("コミュニティ", "Community")}
            </div>
            <div style={{ fontSize: 12, color: "#8A8A8A", marginTop: 6, display: "flex", alignItems: "center", gap: 4 }}>
              <PawPrint size={12} style={{ color: "#E8829A" }} />
              <span>{t("1,648 ワンちゃん家族", "1,648 dog families")}</span>
            </div>
          </div>
        </div>

        {/* Overlapping create button */}
        <button
          onClick={() => setComposeOpen(true)}
          className="flex items-center gap-2"
          style={{
            position: "absolute",
            left: "50%",
            bottom: -20,
            transform: "translateX(-50%)",
            background: "var(--color-primary)",
            color: "#fff",
            fontSize: 14,
            fontFamily: "var(--font-heading)", fontWeight: 600,
            borderRadius: 20,
            padding: "10px 24px",
            boxShadow: "0 6px 16px rgba(232,130,154,0.35)",
            whiteSpace: "nowrap",
          }}
        >
          <PenLine size={16} />
          {t("投稿する", "Create Post")}
        </button>
      </div>

      {/* ── Stats Bar ─────────────────────────────────────────── */}
      <div
        style={{
          background: "#FFFFFF",
          borderRadius: 16,
          margin: "32px 16px 8px",
          padding: "12px 20px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
          display: "grid",
          gridTemplateColumns: "1fr 1px 1fr 1px 1fr",
          alignItems: "center",
        }}
      >
        {[
          { icon: <UsersIcon size={14} style={{ color: "#E8829A" }} />, n: "1,648", jp: "メンバー", en: "Members" },
          { icon: <FileText size={14} style={{ color: "#7B68C8" }} />, n: "3,420", jp: "投稿", en: "Posts" },
          { icon: <PawPrint size={14} style={{ color: "#6BAF92" }} />, n: "892", jp: "ワンちゃん", en: "Dogs" },
        ].map((s, i, arr) => (
          <span key={s.en} style={{ display: "contents" }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 4 }}>
                {s.icon}
                <span style={{ fontSize: 18, fontFamily: "var(--font-heading)", fontWeight: 600, color: "#2C2C2C" }} className="tabular-nums">{s.n}</span>
              </div>
              <div style={{ fontSize: 10, color: "#8A8A8A", marginTop: 2 }}>{t(s.jp, s.en)}</div>
            </div>
            {i < arr.length - 1 && <div style={{ width: 1, height: 28, background: "#F0ECE8" }} />}
          </span>
        ))}
      </div>

      {/* ── Category chips ────────────────────────────────────── */}
      <div className="flex gap-2 overflow-x-auto scrollbar-hide" style={{ padding: "12px 16px", scrollSnapType: "x mandatory" }}>
        {CATS.map((c, i) => {
          const active = sub === i;
          const isAll = i === 0;
          const style: React.CSSProperties = active
            ? isAll
              ? { background: c.soft, color: "#fff", border: "1.5px solid transparent", boxShadow: "0 4px 12px rgba(232,130,154,0.35)" }
              : { background: c.soft, color: c.accent, border: `1.5px solid ${c.accent}`, boxShadow: `0 2px 8px ${c.accent}22` }
            : { background: "#FFFFFF", color: "#8A8A8A", border: "1.5px solid #EDE8E4", boxShadow: "0 2px 6px rgba(0,0,0,0.05)" };
          return (
            <button
              key={c.en}
              onClick={() => setSub(i)}
              className="shrink-0 flex items-center gap-1.5"
              style={{
                ...style,
                borderRadius: 20,
                padding: "8px 14px",
                height: 36,
                fontSize: 13,
                fontWeight: 600,
                scrollSnapAlign: "start",
                transition: "all 0.2s ease",
              }}
            >
              <span style={{ fontSize: 14 }}>{c.emoji}</span>
              <span>{t(c.jp, c.en)}</span>
            </button>
          );
        })}
      </div>

      {/* ── Trending row ─────────────────────────────────────── */}
      <div style={{ padding: "4px 16px 8px" }}>
        <div className="flex items-center justify-between" style={{ marginBottom: 8 }}>
          <div className="flex items-center gap-1.5" style={{ fontSize: 13, fontWeight: 600, color: "#2C2C2C" }}>
            <Flame size={14} style={{ color: "#E8829A" }} />
            {t("トレンド", "Trending")}
          </div>
          <button style={{ fontSize: 12, color: "#E8829A", fontWeight: 600 }}>
            {t("すべて見る →", "See all →")}
          </button>
        </div>
        <div className="flex gap-3 overflow-x-auto scrollbar-hide -mx-4 px-4">
          {trending.map((p) => {
            const th = themeFor(p.flair);
            return (
              <button
                key={p.id}
                onClick={() => setOpen(p.id)}
                className="shrink-0 text-left flex flex-col justify-between"
                style={{
                  width: 160,
                  height: 100,
                  borderRadius: 16,
                  padding: 12,
                  background: `linear-gradient(135deg, ${th.gradFrom}, ${th.gradTo})`,
                  boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                  color: "#fff",
                }}
              >
                <div style={{ fontSize: 12, fontFamily: "var(--font-heading)", fontWeight: 600, lineHeight: 1.3, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                  {language === "english" ? p.titleEn : p.titleJp}
                </div>
                <div className="flex items-center justify-between" style={{ fontSize: 10, opacity: 0.95 }}>
                  <span className="flex items-center gap-1">
                    <PawPrint size={10} />
                    {p.up}
                  </span>
                  <span style={{ background: "rgba(255,255,255,0.25)", padding: "2px 6px", borderRadius: 10, fontWeight: 600 }}>
                    #{language === "english" ? th.en : th.jp}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Feed ──────────────────────────────────────────────── */}
      <div style={{ paddingTop: 8, paddingBottom: 24 }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={sub}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
          >
            {filtered.length === 0 && (
              <div style={{ padding: "48px 16px", textAlign: "center" }}>
                <PawPrint size={32} style={{ color: "#D6CFCB", margin: "0 auto" }} />
                <div style={{ fontSize: 13, color: "#8A8A8A", marginTop: 10 }}>
                  {t("まだ投稿がありません", "No posts yet")}
                </div>
              </div>
            )}

            {filtered.map((p) => {
              const th = themeFor(p.flair);
              const pal = avatarPalette(p.user);
              const initial = p.user.trim()[0] ?? "?";
              const breedEmoji = BREED_EMOJI[p.breed] ?? "";
              const isLost = p.flair === "迷子";
              const up = p.up + (upvoted[p.id] ? 1 : 0);
              return (
                <motion.div
                  key={p.id}
                  layout
                  initial={p.isNew ? { opacity: 0, y: -16 } : false}
                  animate={{ opacity: 1, y: 0 }}
                  whileTap={{ scale: 0.99 }}
                  style={{
                    background: "#FFFFFF",
                    borderRadius: 20,
                    margin: "0 16px 12px",
                    boxShadow: "0 2px 20px rgba(0,0,0,0.06), 0 1px 4px rgba(0,0,0,0.04)",
                    borderLeft: `4px solid ${th.accent}`,
                    overflow: "hidden",
                    position: "relative",
                  }}
                >
                  <div style={{ height: 6, background: `linear-gradient(90deg, ${th.gradFrom}, ${th.gradTo})` }} />

                  <button onClick={() => setOpen(p.id)} className="w-full text-left" style={{ padding: 16 }}>
                    <div className="flex items-start gap-3">
                      <div
                        className="relative shrink-0 flex items-center justify-center"
                        style={{
                          width: 44,
                          height: 44,
                          borderRadius: "50%",
                          background: pal.bg,
                          border: `2px solid ${th.accent}`,
                          color: pal.fg,
                          fontSize: 16,
                          fontFamily: "var(--font-heading)", fontWeight: 600,
                        }}
                      >
                        {initial}
                        <span
                          style={{
                            position: "absolute",
                            bottom: -2,
                            right: -2,
                            fontSize: 10,
                            background: "#fff",
                            borderRadius: "50%",
                            width: 16,
                            height: 16,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            boxShadow: "0 1px 3px rgba(0,0,0,0.15)",
                          }}
                        >
                          {breedEmoji}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div style={{ fontSize: 14, fontFamily: "var(--font-heading)", fontWeight: 600, color: "#2C2C2C" }}>{p.user}</div>
                        <div className="flex items-center gap-1.5" style={{ marginTop: 3 }}>
                          <span
                            style={{
                              background: th.soft,
                              color: th.accent,
                              fontSize: 10,
                              fontWeight: 600,
                              borderRadius: 20,
                              padding: "2px 8px",
                            }}
                          >
                            {p.breed}
                          </span>
                          <span style={{ fontSize: 11, color: "#C4B8B4" }}>·</span>
                          <span style={{ fontSize: 11, color: "#C4B8B4" }}>{p.time}</span>
                        </div>
                      </div>
                      <div
                        className="flex items-center gap-1 shrink-0"
                        style={{
                          background: th.soft,
                          border: `1px solid ${th.ring}`,
                          borderRadius: 20,
                          padding: "4px 10px",
                          color: th.accent,
                          fontSize: 11,
                          fontFamily: "var(--font-heading)", fontWeight: 600,
                          boxShadow: `0 2px 6px ${th.accent}1f`,
                        }}
                      >
                        <span>#{language === "english" ? th.en : th.jp}</span>
                      </div>
                    </div>

                    {isLost && (
                      <div
                        className="pulse-red"
                        style={{
                          position: "absolute",
                          top: 14,
                          right: 14,
                          background: "#E53935",
                          color: "#fff",
                          fontSize: 10,
                          fontFamily: "var(--font-heading)", fontWeight: 600,
                          padding: "3px 8px",
                          borderRadius: 12,
                          letterSpacing: "0.05em",
                        }}
                      >
                        {t("迷子", "LOST")}
                      </div>
                    )}

                    <div
                      style={{
                        fontSize: 15,
                        fontWeight: 600,
                        color: "#2C2C2C",
                        lineHeight: 1.4,
                        margin: "10px 0 6px",
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                      }}
                    >
                      {language === "english" ? p.titleEn : p.titleJp}
                    </div>
                    {language === "mixed" && (
                      <div style={{ fontSize: 13, color: "#8A8A8A", lineHeight: 1.5 }}>{p.titleEn}</div>
                    )}
                  </button>

                  {/* Action bar */}
                  <div style={{ padding: "0 16px 14px" }}>
                    <div style={{ height: 1, background: "#F5F0EC", marginBottom: 12 }} />
                    <div className="flex items-center gap-2">
                      <motion.button
                        whileTap={{ scale: 1.08 }}
                        onClick={(e) => { e.stopPropagation(); toggleUpvote(p.id); }}
                        className="relative flex items-center gap-1.5"
                        style={{
                          background: upvoted[p.id] ? "#E8829A" : "#FFF0F5",
                          border: `1px solid ${upvoted[p.id] ? "#E8829A" : "#FFD0DC"}`,
                          borderRadius: 20,
                          padding: "6px 12px",
                          height: 32,
                          color: upvoted[p.id] ? "#fff" : "#E8829A",
                        }}
                      >
                        <ArrowUp size={14} fill={upvoted[p.id] ? "#fff" : "none"} />
                        <motion.span
                          key={up}
                          initial={{ scale: 1.3 }}
                          animate={{ scale: 1 }}
                          style={{ fontSize: 13, fontFamily: "var(--font-heading)", fontWeight: 600 }}
                        >
                          {up}
                        </motion.span>
                        <AnimatePresence>
                          {burst === p.id && (
                            <>
                              {[0, 1, 2].map((i) => (
                                <motion.span
                                  key={i}
                                  initial={{ y: 0, opacity: 1, x: 0 }}
                                  animate={{ y: -28 - i * 4, opacity: 0, x: (i - 1) * 10 }}
                                  exit={{ opacity: 0 }}
                                  transition={{ duration: 0.6 }}
                                  style={{ position: "absolute", left: "50%", top: 0, fontSize: 12, pointerEvents: "none" }}
                                />
                              ))}
                            </>
                          )}
                        </AnimatePresence>
                      </motion.button>

                      <button
                        onClick={(e) => { e.stopPropagation(); setOpen(p.id); }}
                        className="flex items-center gap-1.5"
                        style={{
                          background: "#EEF5FF",
                          border: "1px solid #C8E0F8",
                          borderRadius: 20,
                          padding: "6px 12px",
                          height: 32,
                          color: "#5B9BD5",
                        }}
                      >
                        <MessageCircle size={14} />
                        <span style={{ fontSize: 13, fontFamily: "var(--font-heading)", fontWeight: 600 }}>{p.com}</span>
                      </button>

                      <button
                        onClick={(e) => { e.stopPropagation(); sharePost(p); }}
                        aria-label="share"
                        className="flex items-center justify-center"
                        style={{
                          background: "#F5F5F5",
                          border: "1px solid #EDE8E4",
                          borderRadius: "50%",
                          width: 32,
                          height: 32,
                          color: "#8A8A8A",
                        }}
                      >
                        <Share2 size={14} />
                      </button>

                      <div className="flex-1" />

                      <motion.button
                        whileTap={{ scale: 1.2 }}
                        onClick={(e) => { e.stopPropagation(); toggleBookmark(p.id); }}
                        aria-label="bookmark"
                        className="flex items-center justify-center"
                        style={{
                          background: bookmarked[p.id] ? "#FEF3C7" : "#FFFBCC",
                          border: `1px solid ${bookmarked[p.id] ? "#F59E0B" : "#F0E4A0"}`,
                          borderRadius: "50%",
                          width: 32,
                          height: 32,
                          color: bookmarked[p.id] ? "#F59E0B" : "#D4A843",
                        }}
                      >
                        <Bookmark size={14} fill={bookmarked[p.id] ? "#F59E0B" : "none"} />
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </AnimatePresence>

        <div className="flex justify-center" style={{ padding: "8px 16px 16px" }}>
          <button
            className="flex items-center gap-2"
            style={{
              background: "#FFFFFF",
              border: "1.5px solid #E8829A",
              color: "#E8829A",
              borderRadius: 20,
              padding: "10px 24px",
              fontSize: 13,
              fontFamily: "var(--font-heading)", fontWeight: 600,
            }}
          >
            {t("もっと見る", "See More")}
          </button>
        </div>
      </div>

      {/* Floating compose button */}
      <button
        onClick={() => setComposeOpen(true)}
        aria-label={t("投稿する", "Create post")}
        className="flex items-center justify-center"
        style={{
          position: "fixed",
          right: 16,
          bottom: 80,
          width: 56,
          height: 56,
          borderRadius: "50%",
          background: "var(--color-primary)",
          color: "#fff",
          boxShadow: "0 8px 24px rgba(232,130,154,0.4)",
          zIndex: 30,
          animation: "pulseRed 2.4s infinite",
        }}
      >
        <PenLine size={22} />
      </button>

      {/* Post detail sheet */}
      <AnimatePresence>
        {post && (
          <PostDetailSheet
            post={post}
            onClose={() => setOpen(null)}
            comments={commentsByPost[post.id] ?? []}
            onAddComment={(txt) => addComment(post.id, txt)}
            upvoted={!!upvoted[post.id]}
            onUpvote={() => toggleUpvote(post.id)}
            bookmarked={!!bookmarked[post.id]}
            onBookmark={() => toggleBookmark(post.id)}
            onShare={() => sharePost(post)}
          />
        )}
      </AnimatePresence>

      {/* Compose sheet */}
      <AnimatePresence>
        {composeOpen && (
          <ComposeSheet onClose={() => setComposeOpen(false)} onSubmit={addPost} />
        )}
      </AnimatePresence>

      {/* Share fallback sheet */}
      <AnimatePresence>
        {shareFor && (
          <ShareSheet
            onClose={() => setShareFor(null)}
            onCopy={() => {
              const p = posts.find((x) => x.id === shareFor);
              const title = p ? (language === "english" ? p.titleEn : p.titleJp) : "";
              const url = typeof window !== "undefined" ? window.location.href : "";
              try {
                navigator.clipboard?.writeText(`${title} — ${url}`);
                toast(t("リンクをコピーしました", "Link copied"), { duration: 1500 });
              } catch {}
              setShareFor(null);
            }}
            onLine={() => {
              const p = posts.find((x) => x.id === shareFor);
              const title = p ? (language === "english" ? p.titleEn : p.titleJp) : "";
              const url = typeof window !== "undefined" ? window.location.href : "";
              const lineUrl = `https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`;
              if (typeof window !== "undefined") window.open(lineUrl, "_blank");
              setShareFor(null);
            }}
          />
        )}
      </AnimatePresence>
    </AppShell>
  );
}

// ═══════════════════════════════════════════════════════════════
// Post Detail Sheet
// ═══════════════════════════════════════════════════════════════
function PostDetailSheet({
  post,
  onClose,
  comments,
  onAddComment,
  upvoted,
  onUpvote,
  bookmarked,
  onBookmark,
  onShare,
}: {
  post: PostT;
  onClose: () => void;
  comments: CommentT[];
  onAddComment: (text: string) => void;
  upvoted: boolean;
  onUpvote: () => void;
  bookmarked: boolean;
  onBookmark: () => void;
  onShare: () => void;
}) {
  const t = useT();
  const { language } = useLanguage();
  const th = themeFor(post.flair);
  const pal = avatarPalette(post.user);
  const [text, setText] = useState("");

  function send() {
    const v = text.trim();
    if (!v) return;
    onAddComment(v);
    setText("");
  }

  const up = post.up + (upvoted ? 1 : 0);

  return (
    <div className="fixed inset-0 z-50 flex items-end" style={{ background: "rgba(0,0,0,0.5)" }} onClick={onClose}>
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 28, stiffness: 280 }}
        className="w-full max-w-md mx-auto flex flex-col"
        style={{ background: "#FAFAF8", height: "90vh", borderRadius: "28px 28px 0 0", overflow: "hidden" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ flex: 1, overflowY: "auto", padding: "12px 20px 16px" }}>
          <div style={{ width: 48, height: 5, borderRadius: 999, background: "#EDE8E4", margin: "0 auto 16px" }} />
          <div className="flex items-center gap-3">
            <div
              className="flex items-center justify-center"
              style={{ width: 44, height: 44, borderRadius: "50%", background: pal.bg, color: pal.fg, border: `2px solid ${th.accent}`, fontFamily: "var(--font-heading)", fontWeight: 600 }}
            >
              {post.user.trim()[0]}
            </div>
            <div className="flex-1 min-w-0">
              <div style={{ fontSize: 14, fontFamily: "var(--font-heading)", fontWeight: 600, color: "#2C2C2C" }}>{post.user}</div>
              <div style={{ fontSize: 11, color: "#C4B8B4" }}>
                {post.breed} · {post.time} · #{language === "english" ? th.en : th.jp}
              </div>
            </div>
            <button onClick={onClose} aria-label="close" style={{ width: 32, height: 32, borderRadius: "50%", background: "#F5F0EC", display: "flex", alignItems: "center", justifyContent: "center", color: "#8A8A8A" }}>
              <X size={16} />
            </button>
          </div>

          <h2 style={{ fontSize: 20, fontFamily: "var(--font-heading)", fontWeight: 600, color: "#2C2C2C", marginTop: 14, lineHeight: 1.3 }}>
            {language === "english" ? post.titleEn : post.titleJp}
          </h2>
          {language === "mixed" && <p style={{ fontSize: 12, color: "#8A8A8A", marginTop: 4 }}>{post.titleEn}</p>}

          {post.body && (
            <p style={{ fontSize: 14, color: "#3a3a3a", marginTop: 14, lineHeight: 1.6, whiteSpace: "pre-wrap" }}>{post.body}</p>
          )}

          {post.images && post.images.length > 0 && (
            <div className="grid grid-cols-2 gap-2" style={{ marginTop: 12 }}>
              {post.images.map((src, i) => (
                <img key={i} src={src} alt="" style={{ width: "100%", borderRadius: 12, aspectRatio: "1/1", objectFit: "cover" }} />
              ))}
            </div>
          )}

          {post.location && (
            <div className="inline-flex items-center gap-1" style={{ marginTop: 12, background: "#EEF5FF", color: "#5B9BD5", border: "1px solid #C8E0F8", borderRadius: 20, padding: "4px 10px", fontSize: 11, fontWeight: 600 }}>
              <MapPin size={12} />
              {post.location}
            </div>
          )}

          {/* Upvote / Share row */}
          <div className="flex items-center gap-2" style={{ marginTop: 16 }}>
            <button
              onClick={onUpvote}
              className="flex items-center gap-1.5"
              style={{
                background: upvoted ? "#E8829A" : "#FFF0F5",
                border: `1px solid ${upvoted ? "#E8829A" : "#FFD0DC"}`,
                color: upvoted ? "#fff" : "#E8829A",
                borderRadius: 20,
                padding: "6px 12px",
                height: 32,
              }}
            >
              <ArrowUp size={14} fill={upvoted ? "#fff" : "none"} />
              <span style={{ fontSize: 13, fontFamily: "var(--font-heading)", fontWeight: 600 }}>{up}</span>
            </button>
            <button
              onClick={onShare}
              aria-label="share"
              className="flex items-center justify-center"
              style={{ background: "#F5F5F5", border: "1px solid #EDE8E4", borderRadius: "50%", width: 32, height: 32, color: "#8A8A8A" }}
            >
              <Share2 size={14} />
            </button>
            <div className="flex-1" />
            <button
              onClick={onBookmark}
              aria-label="bookmark"
              className="flex items-center justify-center"
              style={{
                background: bookmarked ? "#FEF3C7" : "#FFFBCC",
                border: `1px solid ${bookmarked ? "#F59E0B" : "#F0E4A0"}`,
                borderRadius: "50%",
                width: 32,
                height: 32,
                color: bookmarked ? "#F59E0B" : "#D4A843",
              }}
            >
              <Bookmark size={14} fill={bookmarked ? "#F59E0B" : "none"} />
            </button>
          </div>

          {/* Comments */}
          <h3 style={{ marginTop: 22, fontSize: 13, fontFamily: "var(--font-heading)", fontWeight: 600, color: "#2C2C2C" }}>
            {t("コメント", "Comments")} ({comments.length})
          </h3>
          <div style={{ marginTop: 10 }} className="space-y-2">
            {comments.length === 0 && (
              <div style={{ fontSize: 12, color: "#8A8A8A", textAlign: "center", padding: "16px 0" }}>
                {t("最初のコメントを投稿しよう", "Be the first to comment")}
              </div>
            )}
            {comments.map((c) => {
              const cp = avatarPalette(c.user);
              return (
                <div key={c.id} style={{ background: "#fff", borderRadius: 14, padding: 12, boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
                  <div className="flex items-start gap-2">
                    <div className="flex items-center justify-center shrink-0" style={{ width: 36, height: 36, borderRadius: "50%", background: cp.bg, color: cp.fg, fontSize: 14, fontFamily: "var(--font-heading)", fontWeight: 600 }}>
                      {c.user.trim()[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <div style={{ fontSize: 12, fontFamily: "var(--font-heading)", fontWeight: 600, color: "#2C2C2C" }}>{c.user}</div>
                        <span style={{ fontSize: 11, color: "#C4B8B4" }}>· {c.time}</span>
                      </div>
                      <div style={{ fontSize: 13, color: "#374151", marginTop: 4, lineHeight: 1.5 }}>{c.text}</div>
                      <button className="flex items-center gap-1" style={{ marginTop: 6, color: "#8A8A8A", fontSize: 11, fontWeight: 600 }}>
                        <ArrowUp size={12} />
                        {c.up}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Comment input */}
        <div
          className="flex items-center gap-2"
          style={{
            padding: "10px 14px",
            background: "#fff",
            borderTop: "1px solid #F3F4F6",
          }}
        >
          <div className="flex items-center justify-center shrink-0" style={{ width: 32, height: 32, borderRadius: "50%", background: "#FFE4EC", color: "#C45478", fontSize: 13, fontFamily: "var(--font-heading)", fontWeight: 600 }}>
            {ME.user[0]}
          </div>
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") send(); }}
            placeholder={t("コメントを入力", "Write a comment...")}
            style={{
              flex: 1,
              background: "#F9F9F9",
              borderRadius: 50,
              padding: "8px 14px",
              fontSize: 13,
              border: "none",
              outline: "none",
              color: "#2C2C2C",
            }}
          />
          <button
            onClick={send}
            aria-label="send"
            disabled={!text.trim()}
            className="flex items-center justify-center"
            style={{
              width: 36,
              height: 36,
              borderRadius: "50%",
              background: text.trim() ? "linear-gradient(135deg,#E8829A,#C86882)" : "#F3F4F6",
              color: text.trim() ? "#fff" : "#C4B8B4",
              border: "none",
            }}
          >
            <Send size={14} />
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// Compose Sheet
// ═══════════════════════════════════════════════════════════════
function ComposeSheet({
  onClose,
  onSubmit,
}: {
  onClose: () => void;
  onSubmit: (data: { titleJp: string; titleEn: string; body: string; flair: string; images: string[]; location: string }) => void;
}) {
  const t = useT();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [catIdx, setCatIdx] = useState<number | null>(null);
  const [tagKey, setTagKey] = useState<string | null>(null);
  const [images, setImages] = useState<string[]>([]);
  const [location, setLocation] = useState("");
  const [shake, setShake] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);

  const canPost = title.trim().length > 0;

  function handleFiles(files: FileList | null) {
    if (!files) return;
    const arr: string[] = [];
    Array.from(files).slice(0, 4).forEach((f) => {
      arr.push(URL.createObjectURL(f));
    });
    setImages((s) => [...s, ...arr].slice(0, 4));
  }

  function submit() {
    if (!canPost) {
      setShake(true);
      setTimeout(() => setShake(false), 500);
      toast.error(t("タイトルを入力してください", "Please enter a title"));
      return;
    }
    const flair = tagKey ?? (catIdx === 3 ? "迷子" : catIdx === 4 ? "獣医Q&A" : "日常");
    onSubmit({
      titleJp: title.trim(),
      titleEn: title.trim(),
      body: body.trim(),
      flair,
      images,
      location,
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end" style={{ background: "rgba(0,0,0,0.5)" }} onClick={onClose}>
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 28, stiffness: 280 }}
        className="w-full max-w-md mx-auto flex flex-col"
        style={{ background: "#fff", height: "90vh", borderRadius: "24px 24px 0 0", overflow: "hidden" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* drag handle */}
        <div style={{ width: 40, height: 4, borderRadius: 999, background: "#E5E7EB", margin: "10px auto 6px" }} />

        {/* top bar */}
        <div className="flex items-center justify-between" style={{ padding: "8px 16px", borderBottom: "1px solid #F3F4F6" }}>
          <button onClick={onClose} style={{ fontSize: 14, color: "#8A8A8A" }}>{t("キャンセル", "Cancel")}</button>
          <div style={{ fontSize: 15, fontWeight: 600, color: "#1A1A2E" }}>{t("投稿を作成", "Create Post")}</div>
          <button
            onClick={submit}
            style={{
              fontSize: 14,
              fontFamily: "var(--font-heading)", fontWeight: 600,
              color: canPost ? "#F43F72" : "#C4B8B4",
              transition: "color 0.2s",
            }}
          >
            {t("投稿", "Post")}
          </button>
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: "14px 16px 24px" }}>
          {/* user info */}
          <div className="flex items-center gap-3" style={{ marginBottom: 14 }}>
            <div className="flex items-center justify-center" style={{ width: 40, height: 40, borderRadius: "50%", background: "#FFE4EC", color: "#C45478", fontSize: 16, fontFamily: "var(--font-heading)", fontWeight: 600 }}>
              {ME.user[0]}
            </div>
            <div>
              <div style={{ fontSize: 14, fontFamily: "var(--font-heading)", fontWeight: 600, color: "#1A1A2E" }}>{ME.user}</div>
              <div style={{ fontSize: 11, color: "#8A8A8A" }}>{ME.breed}</div>
            </div>
          </div>

          {/* category */}
          <div style={{ fontSize: 12, fontWeight: 600, color: "#8A8A8A", marginBottom: 6 }}>{t("カテゴリー", "Category")}</div>
          <div className="flex gap-2 overflow-x-auto scrollbar-hide" style={{ paddingBottom: 4 }}>
            {CATS.map((c, i) => {
              const active = catIdx === i;
              return (
                <button
                  key={c.en}
                  onClick={() => setCatIdx(i)}
                  className="shrink-0"
                  style={{
                    background: active ? "#F43F72" : "#F9F9F9",
                    color: active ? "#fff" : "#374151",
                    border: `1px solid ${active ? "#F43F72" : "#EDE8E4"}`,
                    borderRadius: 20,
                    padding: "6px 12px",
                    fontSize: 12,
                    fontWeight: 600,
                    whiteSpace: "nowrap",
                  }}
                >
                  {t(c.jp, c.en)}
                </button>
              );
            })}
          </div>

          {/* tag */}
          <div style={{ fontSize: 12, fontWeight: 600, color: "#8A8A8A", margin: "14px 0 6px" }}>{t("タグ", "Tag")}</div>
          <div className="flex gap-2 flex-wrap">
            {TAGS.map((tag) => {
              const active = tagKey === tag.key;
              return (
                <button
                  key={tag.key}
                  onClick={() => setTagKey(active ? null : tag.key)}
                  style={{
                    background: active ? "#F43F72" : "#FFF0F5",
                    color: active ? "#fff" : "#E8829A",
                    border: `1px solid ${active ? "#F43F72" : "#FFD0DC"}`,
                    borderRadius: 20,
                    padding: "5px 12px",
                    fontSize: 12,
                    fontWeight: 600,
                  }}
                >
                  #{tag.en}
                </button>
              );
            })}
          </div>

          {/* title */}
          <motion.div
            animate={shake ? { x: [0, -8, 8, -6, 6, 0] } : { x: 0 }}
            transition={{ duration: 0.4 }}
            style={{ marginTop: 18 }}
          >
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value.slice(0, 100))}
              placeholder={t("タイトルを入力", "Enter title...")}
              style={{
                width: "100%",
                fontSize: 18,
                fontWeight: 600,
                color: "#1A1A2E",
                border: "none",
                outline: "none",
                background: "transparent",
                padding: "8px 0",
              }}
            />
            <div className="flex justify-end" style={{ fontSize: 11, color: "#C4B8B4" }}>
              {title.length}/100
            </div>
          </motion.div>

          {/* body */}
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder={t("詳細を入力（任意）", "Add details (optional)...")}
            style={{
              width: "100%",
              minHeight: 120,
              fontSize: 14,
              color: "#374151",
              border: "none",
              outline: "none",
              background: "transparent",
              padding: "8px 0",
              resize: "vertical",
              fontFamily: "inherit",
            }}
          />

          {/* image thumbnails */}
          {images.length > 0 && (
            <div className="flex gap-2 flex-wrap" style={{ marginTop: 8 }}>
              {images.map((src, i) => (
                <div key={i} style={{ position: "relative", width: 80, height: 80 }}>
                  <img src={src} alt="" style={{ width: 80, height: 80, borderRadius: 12, objectFit: "cover" }} />
                  <button
                    onClick={() => setImages((arr) => arr.filter((_, idx) => idx !== i))}
                    aria-label="remove"
                    style={{
                      position: "absolute",
                      top: -6,
                      right: -6,
                      width: 22,
                      height: 22,
                      borderRadius: "50%",
                      background: "#1A1A2E",
                      color: "#fff",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* location pill */}
          {location && (
            <div className="inline-flex items-center gap-1" style={{ marginTop: 12, background: "#EEF5FF", color: "#5B9BD5", border: "1px solid #C8E0F8", borderRadius: 20, padding: "4px 10px", fontSize: 11, fontWeight: 600 }}>
              <MapPin size={12} />
              {location}
              <button onClick={() => setLocation("")} style={{ marginLeft: 4, color: "#5B9BD5" }}>
                <X size={11} />
              </button>
            </div>
          )}
        </div>

        {/* media attachment row */}
        <div style={{ borderTop: "1px solid #F3F4F6", padding: "10px 16px 14px", background: "#fff" }}>
          <div className="flex items-start justify-around">
            <input ref={cameraRef} type="file" accept="image/*" capture="environment" hidden onChange={(e) => handleFiles(e.target.files)} />
            <input ref={fileRef} type="file" accept="image/*" multiple hidden onChange={(e) => handleFiles(e.target.files)} />

            <button onClick={() => cameraRef.current?.click()} className="flex flex-col items-center gap-1">
              <span className="flex items-center justify-center" style={{ width: 36, height: 36, borderRadius: "50%", background: "#F9F9F9", color: "#8A8A8A" }}>
                <Camera size={16} />
              </span>
              <span style={{ fontSize: 10, color: "#9CA3AF" }}>{t("カメラ", "Camera")}</span>
            </button>

            <button onClick={() => fileRef.current?.click()} className="flex flex-col items-center gap-1">
              <span className="flex items-center justify-center" style={{ width: 36, height: 36, borderRadius: "50%", background: "#F9F9F9", color: "#8A8A8A" }}>
                <ImageIcon size={16} />
              </span>
              <span style={{ fontSize: 10, color: "#9CA3AF" }}>{t("画像", "Image")}</span>
            </button>

            <button
              onClick={() => setLocation(location ? "" : t("渋谷、東京", "Shibuya, Tokyo"))}
              className="flex flex-col items-center gap-1"
            >
              <span className="flex items-center justify-center" style={{ width: 36, height: 36, borderRadius: "50%", background: location ? "#EEF5FF" : "#F9F9F9", color: location ? "#5B9BD5" : "#8A8A8A" }}>
                <MapPin size={16} />
              </span>
              <span style={{ fontSize: 10, color: "#9CA3AF" }}>{t("場所", "Location")}</span>
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// Share fallback sheet
// ═══════════════════════════════════════════════════════════════
function ShareSheet({ onClose, onCopy, onLine }: { onClose: () => void; onCopy: () => void; onLine: () => void }) {
  const t = useT();
  return (
    <div className="fixed inset-0 z-50 flex items-end" style={{ background: "rgba(0,0,0,0.5)" }} onClick={onClose}>
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 28, stiffness: 280 }}
        className="w-full max-w-md mx-auto"
        style={{ background: "#fff", borderRadius: "24px 24px 0 0", padding: "12px 16px 24px" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ width: 40, height: 4, borderRadius: 999, background: "#E5E7EB", margin: "0 auto 12px" }} />
        <div style={{ fontSize: 14, fontFamily: "var(--font-heading)", fontWeight: 600, color: "#1A1A2E", textAlign: "center", marginBottom: 12 }}>
          {t("共有", "Share")}
        </div>
        <button
          onClick={onCopy}
          className="w-full flex items-center gap-3"
          style={{ padding: "12px 14px", borderRadius: 14, background: "#F9F9F9", marginBottom: 8 }}
        >
          <span className="flex items-center justify-center" style={{ width: 36, height: 36, borderRadius: "50%", background: "#FFF0F5", color: "#E8829A" }}>
            <LinkIcon size={16} />
          </span>
          <span style={{ fontSize: 14, fontWeight: 600, color: "#1A1A2E" }}>{t("リンクをコピー", "Copy link")}</span>
        </button>
        <button
          onClick={onLine}
          className="w-full flex items-center gap-3"
          style={{ padding: "12px 14px", borderRadius: 14, background: "#F9F9F9" }}
        >
          <span className="flex items-center justify-center" style={{ width: 36, height: 36, borderRadius: "50%", background: "#E8F5E8", color: "#06C755", fontFamily: "var(--font-heading)", fontWeight: 600, fontSize: 12 }}>
            LINE
          </span>
          <span style={{ fontSize: 14, fontWeight: 600, color: "#1A1A2E" }}>{t("LINEで共有", "Share on LINE")}</span>
        </button>
      </motion.div>
    </div>
  );
}
