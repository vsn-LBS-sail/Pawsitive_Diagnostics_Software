import { createFileRoute } from "@tanstack/react-router";
import AppShell from "@/components/AppShell";
import { useMemo, useState, useEffect, useCallback, type ComponentType, type CSSProperties, type ReactNode } from "react";
import Fuse, { type FuseResultMatch } from "fuse.js";
import {
  Search, SlidersHorizontal, BookOpen, ArrowRight, ArrowLeft, X,
  AlertTriangle, MessageCircle, Dog, Sparkles, Heart, Wind, Sun, Minus, Zap, Crown, Shuffle, RefreshCw,
  type LucideProps,
} from "lucide-react";
import { useT, useLanguage, T } from "@/context/LanguageContext";
import { POSTS } from "@/lib/mock";
import {
  fetchBreedImage, fetchMultipleBreedImages, getCachedImage, setCachedImage, hasBreedSlug,
} from "@/lib/dogCeo";

export const Route = createFileRoute("/breeds")({ component: Breeds });

type SizeKey = "toy" | "small" | "medium" | "large" | "various";
type Breed = {
  jp: string;
  en: string;
  kana: string;
  rank: number | null;
  size: SizeKey;
  sizeJp: string;
  sizeEn: string;
  originJp: string;
  originEn: string;
  flag: string;
  // Rich profile data
  groupJp: string;
  groupEn: string;
  temperamentJp: string;
  temperamentEn: string;
  lifeSpan: string;
  diagnosticNoteJp: string;
  diagnosticNoteEn: string;
  // Banner styling
  bannerBg: string;
  rankBg: string;
  sizeBg: string;
  sizeText: string;
  kanji: string;
  kanjiSize: number;
  kanjiColor: string;
  Icon: ComponentType<LucideProps>;
  iconColor: string;
  animateGradient?: boolean;
  image?: string;
  // Detail extras
  stats: { energy: number; friendly: number; train: number; groom: number };
  health: { jp: string; en: string; level: "watch" | "concern" }[];
};

const BREEDS: Breed[] = [
  {
    jp: "柴犬", en: "Shiba Inu", kana: "シバイヌ", rank: 1, size: "small", sizeJp: "小型", sizeEn: "Small",
    originJp: "日本", originEn: "Japan", flag: "",
    groupJp: "非スポーティング", groupEn: "Non-Sporting",
    temperamentJp: "警戒心が強い・忠実・自信家", temperamentEn: "Alert, Faithful, Confident",
    lifeSpan: "12-15 years",
    diagnosticNoteJp: "活動量が多いため、不安を隠す行動に注意したベースライン調整が必要。",
    diagnosticNoteEn: "High activity telemetry requires careful baseline adjustment for anxiety hiding behaviors.",
    image: "https://images.unsplash.com/photo-1579213838429-c981f6f52bdf?w=400&q=80&auto=format&fit=crop",
    bannerBg: "linear-gradient(135deg, #FF9966, #FF6B35)",
    rankBg: "#CC4400", sizeBg: "#FFF0DC", sizeText: "#CC5500",
    kanji: "柴", kanjiSize: 64, kanjiColor: "rgba(255,255,255,0.25)",
    Icon: Dog, iconColor: "rgba(255,255,255,0.65)",
    stats: { energy: 80, friendly: 70, train: 75, groom: 60 },
    health: [{ jp: "膝蓋骨脱臼", en: "Patellar Luxation", level: "watch" }, { jp: "アレルギー", en: "Allergies", level: "watch" }],
  },
  {
    jp: "シーズー", en: "Shih Tzu", kana: "シーズー", rank: 10, size: "toy", sizeJp: "超小型", sizeEn: "Toy",
    originJp: "チベット", originEn: "Tibet", flag: "",
    groupJp: "トイ", groupEn: "Toy",
    temperamentJp: "愛情深い・遊び好き・賢い", temperamentEn: "Affectionate, Playful, Clever",
    lifeSpan: "10-16 years",
    diagnosticNoteJp: "短頭種のため、BarkSense AIによる呼吸器トラッキングが必須。",
    diagnosticNoteEn: "Brachycephalic respiratory tracking required via BarkSense AI.",
    image: "https://images.unsplash.com/photo-1591768793355-74d04bb6608f?w=400&q=80&auto=format&fit=crop",
    bannerBg: "linear-gradient(135deg, #F4C7AB, #C99280)",
    rankBg: "#8C5A46", sizeBg: "#FFF1E6", sizeText: "#8C5A46",
    kanji: "獅", kanjiSize: 60, kanjiColor: "rgba(255,255,255,0.28)",
    Icon: Crown, iconColor: "rgba(255,255,255,0.65)",
    stats: { energy: 50, friendly: 85, train: 60, groom: 95 },
    health: [{ jp: "短頭種症候群", en: "Brachycephalic Syndrome", level: "concern" }, { jp: "眼疾患", en: "Eye Issues", level: "watch" }],
  },
  {
    jp: "シベリアンハスキー", en: "Siberian Husky", kana: "シベリアンハスキー", rank: 11, size: "large", sizeJp: "大型", sizeEn: "Large",
    originJp: "シベリア", originEn: "Siberia", flag: "",
    groupJp: "ワーキング", groupEn: "Working",
    temperamentJp: "社交的・友好的・穏やか", temperamentEn: "Outgoing, Friendly, Gentle",
    lifeSpan: "12-14 years",
    diagnosticNoteJp: "寒冷地仕様のため、サーマルセンサーで体温変動を監視し熱中症を防ぐ。",
    diagnosticNoteEn: "Thrives in cold environments; thermal sensors monitor internal temperature variations against dangerous overheating.",
    image: "https://images.unsplash.com/photo-1605568427561-40dd23c2acea?w=400&q=80&auto=format&fit=crop",
    bannerBg: "linear-gradient(135deg, #A8D0E8, #5A8FB8)",
    rankBg: "#2E6B8A", sizeBg: "#E8F2FA", sizeText: "#2E6B8A",
    kanji: "雪", kanjiSize: 64, kanjiColor: "rgba(255,255,255,0.28)",
    Icon: Wind, iconColor: "rgba(255,255,255,0.65)",
    stats: { energy: 95, friendly: 85, train: 70, groom: 70 },
    health: [{ jp: "熱中症", en: "Heat Stroke", level: "concern" }, { jp: "眼疾患", en: "Eye Issues", level: "watch" }],
  },
  {
    jp: "トイプードル", en: "Toy Poodle", kana: "トイプードル", rank: 2, size: "toy", sizeJp: "超小型", sizeEn: "Toy",
    originJp: "フランス", originEn: "France", flag: "",
    groupJp: "トイ", groupEn: "Toy",
    temperamentJp: "賢い・活発・愛情深い", temperamentEn: "Intelligent, Active, Affectionate",
    lifeSpan: "12-15 years",
    diagnosticNoteJp: "外耳炎の傾向あり。耳道の湿度・温度トレンドの定期確認を推奨。",
    diagnosticNoteEn: "Ear-canal humidity & temperature trends should be reviewed regularly to flag early otitis.",
    image: "https://images.unsplash.com/photo-1586671267731-da2cf3ceeb80?w=400&q=80&auto=format&fit=crop",
    bannerBg: "linear-gradient(135deg, #9B72CF, #7B52AF)",
    rankBg: "#6B3AAF", sizeBg: "#F5F0FF", sizeText: "#7B52AF",
    kanji: "プー", kanjiSize: 44, kanjiColor: "rgba(255,255,255,0.22)",
    Icon: Sparkles, iconColor: "rgba(255,255,255,0.65)",
    stats: { energy: 70, friendly: 90, train: 95, groom: 80 },
    health: [{ jp: "外耳炎", en: "Ear Infections", level: "watch" }],
  },
  {
    jp: "チワワ", en: "Chihuahua", kana: "チワワ", rank: 3, size: "toy", sizeJp: "超小型", sizeEn: "Tiny",
    originJp: "メキシコ", originEn: "Mexico", flag: "",
    groupJp: "トイ", groupEn: "Toy",
    temperamentJp: "勇敢・機敏・愛情深い", temperamentEn: "Bold, Alert, Devoted",
    lifeSpan: "14-16 years",
    diagnosticNoteJp: "気管虚脱の兆候を検知するため、咳と呼吸音の継続モニタリングが重要。",
    diagnosticNoteEn: "Continuous cough & airway-sound monitoring helps detect early tracheal collapse signs.",
    image: "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400&q=80&auto=format&fit=crop",
    bannerBg: "linear-gradient(135deg, #F6D365, #FDA085)",
    rankBg: "#E8820A", sizeBg: "#FFF8DC", sizeText: "#D4920A",
    kanji: "チ", kanjiSize: 64, kanjiColor: "rgba(255,255,255,0.28)",
    Icon: Heart, iconColor: "rgba(255,255,255,0.65)",
    stats: { energy: 60, friendly: 60, train: 55, groom: 40 },
    health: [{ jp: "気管虚脱", en: "Tracheal Collapse", level: "concern" }],
  },
  {
    jp: "ポメラニアン", en: "Pomeranian", kana: "ポメラニアン", rank: 4, size: "small", sizeJp: "小型", sizeEn: "Small",
    originJp: "ドイツ", originEn: "Germany", flag: "",
    groupJp: "トイ", groupEn: "Toy",
    temperamentJp: "活発・人懐っこい・知的", temperamentEn: "Lively, Friendly, Intelligent",
    lifeSpan: "12-16 years",
    diagnosticNoteJp: "気管虚脱に注意。吠え声パターンと呼吸変動を継続追跡。",
    diagnosticNoteEn: "Watch for tracheal weakness; continuously track bark patterns and breathing variability.",
    image: "https://images.unsplash.com/photo-1558788353-f76d92427f16?w=400&q=80&auto=format&fit=crop",
    bannerBg: "linear-gradient(135deg, #FFECD2, #FCB69F)",
    rankBg: "#C47040", sizeBg: "#FFF4EC", sizeText: "#C47040",
    kanji: "ポメ", kanjiSize: 42, kanjiColor: "rgba(180,90,40,0.22)",
    Icon: Wind, iconColor: "rgba(180,90,40,0.45)",
    stats: { energy: 75, friendly: 75, train: 65, groom: 85 },
    health: [{ jp: "気管虚脱", en: "Tracheal Collapse", level: "watch" }],
  },
  {
    jp: "ゴールデンレトリバー", en: "Golden Retriever", kana: "ゴールデンレトリバー", rank: 5, size: "large", sizeJp: "大型", sizeEn: "Large",
    originJp: "イギリス", originEn: "UK", flag: "",
    groupJp: "スポーティング", groupEn: "Sporting",
    temperamentJp: "知的・優しい・信頼できる", temperamentEn: "Intelligent, Kind, Trustworthy",
    lifeSpan: "10-12 years",
    diagnosticNoteJp: "早期関節症の素因あり。GaitSense AIが微細な歩行劣化を追跡。",
    diagnosticNoteEn: "High predisposition to early-stage arthritis; GaitSense AI tracks subtle mobility degradation.",
    image: "https://images.unsplash.com/photo-1633722715463-d30f4f325e24?w=400&q=80&auto=format&fit=crop",
    bannerBg: "linear-gradient(135deg, #F7971E, #FFD200)",
    rankBg: "#C48A00", sizeBg: "#FFF8DC", sizeText: "#C48A00",
    kanji: "金", kanjiSize: 64, kanjiColor: "rgba(255,255,255,0.25)",
    Icon: Sun, iconColor: "rgba(255,255,255,0.55)",
    stats: { energy: 90, friendly: 95, train: 90, groom: 70 },
    health: [{ jp: "股関節形成不全", en: "Hip Dysplasia", level: "concern" }, { jp: "熱中症", en: "Heat Stroke", level: "concern" }],
  },
  {
    jp: "ミニチュアダックス", en: "Mini Dachshund", kana: "ミニチュアダックスフンド", rank: 6, size: "small", sizeJp: "小型", sizeEn: "Small",
    originJp: "ドイツ", originEn: "Germany", flag: "",
    groupJp: "ハウンド", groupEn: "Hound",
    temperamentJp: "勇敢・好奇心旺盛・友好的", temperamentEn: "Spunky, Curious, Friendly",
    lifeSpan: "12-16 years",
    diagnosticNoteJp: "椎間板ヘルニアの高リスク。背中の姿勢と歩行を継続監視。",
    diagnosticNoteEn: "High IVDD risk; spine posture and gait require continuous monitoring.",
    image: "https://images.unsplash.com/photo-1612195583950-b8fd34c87093?w=400&q=80&auto=format&fit=crop",
    bannerBg: "linear-gradient(135deg, #C4714E, #A0522D)",
    rankBg: "#7A3A1E", sizeBg: "#FFF0DC", sizeText: "#A0522D",
    kanji: "ダックス", kanjiSize: 32, kanjiColor: "rgba(255,255,255,0.22)",
    Icon: Minus, iconColor: "rgba(255,255,255,0.55)",
    stats: { energy: 70, friendly: 75, train: 60, groom: 50 },
    health: [{ jp: "椎間板ヘルニア", en: "IVDD (Back Issues)", level: "concern" }],
  },
  {
    jp: "フレンチブルドッグ", en: "French Bulldog", kana: "フレンチブルドッグ", rank: 7, size: "small", sizeJp: "小型", sizeEn: "Small",
    originJp: "フランス", originEn: "France", flag: "",
    groupJp: "非スポーティング", groupEn: "Non-Sporting",
    temperamentJp: "順応性・遊び好き・賢い", temperamentEn: "Adaptable, Playful, Smart",
    lifeSpan: "10-12 years",
    diagnosticNoteJp: "突発的な咳パターンと呼吸異常を検知。",
    diagnosticNoteEn: "Prone to sudden respiratory cough patterns and breathing anomalies.",
    image: "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=400&q=80&auto=format&fit=crop",
    bannerBg: "linear-gradient(135deg, #4FACFE, #00F2FE)",
    rankBg: "#0080CC", sizeBg: "#E8F4FF", sizeText: "#0080CC",
    kanji: "フレブル", kanjiSize: 32, kanjiColor: "rgba(255,255,255,0.22)",
    Icon: Zap, iconColor: "rgba(255,255,255,0.55)",
    stats: { energy: 55, friendly: 85, train: 65, groom: 50 },
    health: [{ jp: "短頭種症候群", en: "Brachycephalic Syndrome", level: "concern" }],
  },
  {
    jp: "ヨークシャテリア", en: "Yorkshire Terrier", kana: "ヨークシャーテリア", rank: 8, size: "toy", sizeJp: "超小型", sizeEn: "Tiny",
    originJp: "イギリス", originEn: "UK", flag: "",
    groupJp: "トイ", groupEn: "Toy",
    temperamentJp: "勇敢・愛情深い・活発", temperamentEn: "Brave, Affectionate, Energetic",
    lifeSpan: "13-16 years",
    diagnosticNoteJp: "歯周病に注意。咀嚼パターンと口腔音の追跡を推奨。",
    diagnosticNoteEn: "Dental disease prone; chew patterns and oral sounds should be tracked.",
    image: "https://images.unsplash.com/photo-1516148806338-702cf5f65c41?w=400&q=80&auto=format&fit=crop",
    bannerBg: "linear-gradient(135deg, #A18CD1, #FBC2EB)",
    rankBg: "#7B52AF", sizeBg: "#F8F0FF", sizeText: "#7B52AF",
    kanji: "ヨーキー", kanjiSize: 32, kanjiColor: "rgba(255,255,255,0.24)",
    Icon: Crown, iconColor: "rgba(255,255,255,0.55)",
    stats: { energy: 70, friendly: 70, train: 75, groom: 90 },
    health: [{ jp: "歯周病", en: "Dental Issues", level: "watch" }],
  },
  {
    jp: "ミックス犬", en: "Mixed Breed", kana: "ミックスケン", rank: null, size: "various", sizeJp: "様々", sizeEn: "Various",
    originJp: "世界", originEn: "Global", flag: "",
    groupJp: "様々", groupEn: "Various",
    temperamentJp: "個体差あり・ユニーク", temperamentEn: "Varies, Unique to each dog",
    lifeSpan: "10-18 years",
    diagnosticNoteJp: "個体差が大きいため、Pawsitive AIが独自のベースラインを学習。",
    diagnosticNoteEn: "High individual variance; Pawsitive AI learns a personalized baseline per dog.",
    image: "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=400&q=80&auto=format&fit=crop",
    bannerBg: "linear-gradient(135deg, #FF9966, #9B72CF, #4FACFE, #F7971E)",
    rankBg: "#6BAF92", sizeBg: "linear-gradient(135deg,#FFE4D0,#E8D6FF,#D6EEFF,#FFF4CC)", sizeText: "#7B52AF",
    kanji: "∞", kanjiSize: 56, kanjiColor: "rgba(255,255,255,0.4)",
    Icon: Shuffle, iconColor: "rgba(255,255,255,0.55)",
    animateGradient: true,
    stats: { energy: 75, friendly: 85, train: 75, groom: 60 },
    health: [{ jp: "個体差あり", en: "Varies by mix", level: "watch" }],
  },
  {
    jp: "秋田犬", en: "Akita Inu", kana: "アキタイヌ", rank: 12, size: "large", sizeJp: "大型", sizeEn: "Large",
    originJp: "日本", originEn: "Japan", flag: "",
    groupJp: "ワーキング", groupEn: "Working",
    temperamentJp: "勇敢・忠実・威厳", temperamentEn: "Courageous, Loyal, Dignified",
    lifeSpan: "10-13 years",
    diagnosticNoteJp: "自己免疫疾患の傾向を継続モニタリング。早期検知で予後を改善。",
    diagnosticNoteEn: "Continuous monitoring for autoimmune conditions supports early detection and better outcomes.",
    image: "https://images.unsplash.com/photo-1583511655826-05700d52f4d9?w=400&q=80&auto=format&fit=crop",
    bannerBg: "linear-gradient(135deg, #A8C8E8, #4A7AAF)", rankBg: "#2E5A8A", sizeBg: "#E6EEF8", sizeText: "#2E5A8A",
    kanji: "秋", kanjiSize: 60, kanjiColor: "rgba(255,255,255,0.25)",
    Icon: Zap, iconColor: "rgba(255,255,255,0.65)",
    stats: { energy: 70, friendly: 55, train: 70, groom: 55 },
    health: [{ jp: "自己免疫疾患", en: "Autoimmune Conditions", level: "watch" }],
  },
  {
    jp: "北海道犬", en: "Hokkaido", kana: "ホッカイドウ", rank: 13, size: "medium", sizeJp: "中型", sizeEn: "Medium",
    originJp: "日本", originEn: "Japan", flag: "",
    groupJp: "ワーキング", groupEn: "Working",
    temperamentJp: "勇敢・忠実・警戒", temperamentEn: "Brave, Loyal, Alert",
    lifeSpan: "12-15 years",
    diagnosticNoteJp: "股関節形成不全の傾向を継続モニタリング。早期検知で予後を改善。",
    diagnosticNoteEn: "Continuous monitoring for hip dysplasia supports early detection and better outcomes.",
    image: "https://images.unsplash.com/photo-1591946614720-90a587da4a36?w=400&q=80&auto=format&fit=crop",
    bannerBg: "linear-gradient(135deg, #B5E0C8, #5AAF7A)", rankBg: "#2E7D4A", sizeBg: "#E6F5EC", sizeText: "#2E7D4A",
    kanji: "北", kanjiSize: 60, kanjiColor: "rgba(255,255,255,0.25)",
    Icon: Zap, iconColor: "rgba(255,255,255,0.65)",
    stats: { energy: 85, friendly: 55, train: 70, groom: 55 },
    health: [{ jp: "股関節形成不全", en: "Hip Dysplasia", level: "watch" }],
  },
  {
    jp: "甲斐犬", en: "Kai Ken", kana: "カイケン", rank: 14, size: "medium", sizeJp: "中型", sizeEn: "Medium",
    originJp: "日本", originEn: "Japan", flag: "",
    groupJp: "ワーキング", groupEn: "Working",
    temperamentJp: "賢い・忠実・敏捷", temperamentEn: "Smart, Loyal, Agile",
    lifeSpan: "12-15 years",
    diagnosticNoteJp: "アレルギーの傾向を継続モニタリング。早期検知で予後を改善。",
    diagnosticNoteEn: "Continuous monitoring for allergies supports early detection and better outcomes.",
    image: "https://images.unsplash.com/photo-1568572933382-74d440642117?w=400&q=80&auto=format&fit=crop",
    bannerBg: "linear-gradient(135deg, #B5E0C8, #5AAF7A)", rankBg: "#2E7D4A", sizeBg: "#E6F5EC", sizeText: "#2E7D4A",
    kanji: "甲", kanjiSize: 60, kanjiColor: "rgba(255,255,255,0.25)",
    Icon: Zap, iconColor: "rgba(255,255,255,0.65)",
    stats: { energy: 85, friendly: 55, train: 75, groom: 50 },
    health: [{ jp: "アレルギー", en: "Allergies", level: "watch" }],
  },
  {
    jp: "紀州犬", en: "Kishu Ken", kana: "キシュウケン", rank: 15, size: "medium", sizeJp: "中型", sizeEn: "Medium",
    originJp: "日本", originEn: "Japan", flag: "",
    groupJp: "ワーキング", groupEn: "Working",
    temperamentJp: "勇敢・物静か・忠実", temperamentEn: "Brave, Quiet, Devoted",
    lifeSpan: "11-13 years",
    diagnosticNoteJp: "皮膚疾患の傾向を継続モニタリング。早期検知で予後を改善。",
    diagnosticNoteEn: "Continuous monitoring for skin issues supports early detection and better outcomes.",
    image: "https://images.unsplash.com/photo-1517423440428-a5a00ad493e8?w=400&q=80&auto=format&fit=crop",
    bannerBg: "linear-gradient(135deg, #B5E0C8, #5AAF7A)", rankBg: "#2E7D4A", sizeBg: "#E6F5EC", sizeText: "#2E7D4A",
    kanji: "紀", kanjiSize: 60, kanjiColor: "rgba(255,255,255,0.25)",
    Icon: Zap, iconColor: "rgba(255,255,255,0.65)",
    stats: { energy: 80, friendly: 50, train: 70, groom: 50 },
    health: [{ jp: "皮膚疾患", en: "Skin Issues", level: "watch" }],
  },
  {
    jp: "四国犬", en: "Shikoku", kana: "シコク", rank: 16, size: "medium", sizeJp: "中型", sizeEn: "Medium",
    originJp: "日本", originEn: "Japan", flag: "",
    groupJp: "ワーキング", groupEn: "Working",
    temperamentJp: "敏捷・賢い・タフ", temperamentEn: "Agile, Smart, Tough",
    lifeSpan: "12-15 years",
    diagnosticNoteJp: "目疾患の傾向を継続モニタリング。早期検知で予後を改善。",
    diagnosticNoteEn: "Continuous monitoring for eye issues supports early detection and better outcomes.",
    image: "https://images.unsplash.com/photo-1561037404-61cd46aa615b?w=400&q=80&auto=format&fit=crop",
    bannerBg: "linear-gradient(135deg, #B5E0C8, #5AAF7A)", rankBg: "#2E7D4A", sizeBg: "#E6F5EC", sizeText: "#2E7D4A",
    kanji: "四", kanjiSize: 60, kanjiColor: "rgba(255,255,255,0.25)",
    Icon: Zap, iconColor: "rgba(255,255,255,0.65)",
    stats: { energy: 85, friendly: 55, train: 70, groom: 50 },
    health: [{ jp: "目疾患", en: "Eye Issues", level: "watch" }],
  },
  {
    jp: "日本スピッツ", en: "Japanese Spitz", kana: "ニホンスピッツ", rank: 17, size: "small", sizeJp: "小型", sizeEn: "Small",
    originJp: "日本", originEn: "Japan", flag: "",
    groupJp: "非スポーティング", groupEn: "Non-Sporting",
    temperamentJp: "活発・忠実・社交的", temperamentEn: "Lively, Devoted, Sociable",
    lifeSpan: "12-14 years",
    diagnosticNoteJp: "膝蓋骨脱臼の傾向を継続モニタリング。早期検知で予後を改善。",
    diagnosticNoteEn: "Continuous monitoring for patellar luxation supports early detection and better outcomes.",
    image: "https://images.unsplash.com/photo-1583511655826-05700d52f4d9?w=400&q=80&auto=format&fit=crop",
    bannerBg: "linear-gradient(135deg, #FFE0B5, #E89A5A)", rankBg: "#A55A1A", sizeBg: "#FFF1E0", sizeText: "#A55A1A",
    kanji: "白", kanjiSize: 60, kanjiColor: "rgba(255,255,255,0.25)",
    Icon: Heart, iconColor: "rgba(255,255,255,0.65)",
    stats: { energy: 70, friendly: 85, train: 80, groom: 80 },
    health: [{ jp: "膝蓋骨脱臼", en: "Patellar Luxation", level: "watch" }],
  },
  {
    jp: "狆", en: "Japanese Chin", kana: "チン", rank: 18, size: "toy", sizeJp: "超小型", sizeEn: "Toy",
    originJp: "日本", originEn: "Japan", flag: "",
    groupJp: "トイ", groupEn: "Toy",
    temperamentJp: "上品・愛情深い・賢い", temperamentEn: "Elegant, Loving, Smart",
    lifeSpan: "10-14 years",
    diagnosticNoteJp: "短頭種症候群の傾向を継続モニタリング。早期検知で予後を改善。",
    diagnosticNoteEn: "Continuous monitoring for brachycephalic syndrome supports early detection and better outcomes.",
    image: "https://images.unsplash.com/photo-1517849845537-4d257902454a?w=400&q=80&auto=format&fit=crop",
    bannerBg: "linear-gradient(135deg, #FFD3E0, #E8829A)", rankBg: "#C44A6A", sizeBg: "#FFE4EC", sizeText: "#C44A6A",
    kanji: "狆", kanjiSize: 60, kanjiColor: "rgba(255,255,255,0.25)",
    Icon: Crown, iconColor: "rgba(255,255,255,0.65)",
    stats: { energy: 40, friendly: 80, train: 60, groom: 70 },
    health: [{ jp: "短頭種症候群", en: "Brachycephalic Syndrome", level: "concern" }],
  },
  {
    jp: "土佐犬", en: "Tosa Inu", kana: "トサイヌ", rank: 19, size: "large", sizeJp: "大型", sizeEn: "Large",
    originJp: "日本", originEn: "Japan", flag: "",
    groupJp: "ワーキング", groupEn: "Working",
    temperamentJp: "威厳・忍耐・忠実", temperamentEn: "Dignified, Patient, Loyal",
    lifeSpan: "10-12 years",
    diagnosticNoteJp: "股関節形成不全の傾向を継続モニタリング。早期検知で予後を改善。",
    diagnosticNoteEn: "Continuous monitoring for hip dysplasia supports early detection and better outcomes.",
    image: "https://images.unsplash.com/photo-1605568427561-40dd23c2acea?w=400&q=80&auto=format&fit=crop",
    bannerBg: "linear-gradient(135deg, #A8C8E8, #4A7AAF)", rankBg: "#2E5A8A", sizeBg: "#E6EEF8", sizeText: "#2E5A8A",
    kanji: "土", kanjiSize: 60, kanjiColor: "rgba(255,255,255,0.25)",
    Icon: Zap, iconColor: "rgba(255,255,255,0.65)",
    stats: { energy: 60, friendly: 40, train: 60, groom: 40 },
    health: [{ jp: "股関節形成不全", en: "Hip Dysplasia", level: "concern" }],
  },
  {
    jp: "マルチーズ", en: "Maltese", kana: "マルチーズ", rank: 20, size: "toy", sizeJp: "超小型", sizeEn: "Toy",
    originJp: "マルタ", originEn: "Malta", flag: "",
    groupJp: "トイ", groupEn: "Toy",
    temperamentJp: "優しい・遊び好き・愛情深い", temperamentEn: "Gentle, Playful, Affectionate",
    lifeSpan: "12-15 years",
    diagnosticNoteJp: "歯周病の傾向を継続モニタリング。早期検知で予後を改善。",
    diagnosticNoteEn: "Continuous monitoring for dental issues supports early detection and better outcomes.",
    image: "https://images.unsplash.com/photo-1583337426008-2fef51aa841a?w=400&q=80&auto=format&fit=crop",
    bannerBg: "linear-gradient(135deg, #FFD3E0, #E8829A)", rankBg: "#C44A6A", sizeBg: "#FFE4EC", sizeText: "#C44A6A",
    kanji: "白", kanjiSize: 60, kanjiColor: "rgba(255,255,255,0.25)",
    Icon: Crown, iconColor: "rgba(255,255,255,0.65)",
    stats: { energy: 55, friendly: 85, train: 70, groom: 90 },
    health: [{ jp: "歯周病", en: "Dental Issues", level: "watch" }],
  },
  {
    jp: "パピヨン", en: "Papillon", kana: "パピヨン", rank: 21, size: "toy", sizeJp: "超小型", sizeEn: "Toy",
    originJp: "フランス", originEn: "France", flag: "",
    groupJp: "トイ", groupEn: "Toy",
    temperamentJp: "賢い・活発・友好的", temperamentEn: "Smart, Active, Friendly",
    lifeSpan: "13-15 years",
    diagnosticNoteJp: "膝蓋骨脱臼の傾向を継続モニタリング。早期検知で予後を改善。",
    diagnosticNoteEn: "Continuous monitoring for patellar luxation supports early detection and better outcomes.",
    image: "https://images.unsplash.com/photo-1620189507195-68309c04c4d0?w=400&q=80&auto=format&fit=crop",
    bannerBg: "linear-gradient(135deg, #FFD3E0, #E8829A)", rankBg: "#C44A6A", sizeBg: "#FFE4EC", sizeText: "#C44A6A",
    kanji: "蝶", kanjiSize: 60, kanjiColor: "rgba(255,255,255,0.25)",
    Icon: Crown, iconColor: "rgba(255,255,255,0.65)",
    stats: { energy: 75, friendly: 85, train: 90, groom: 75 },
    health: [{ jp: "膝蓋骨脱臼", en: "Patellar Luxation", level: "watch" }],
  },
  {
    jp: "イタリアングレーハウンド", en: "Italian Greyhound", kana: "イタリアングレーハウンド", rank: 22, size: "small", sizeJp: "小型", sizeEn: "Small",
    originJp: "イタリア", originEn: "Italy", flag: "",
    groupJp: "トイ", groupEn: "Toy",
    temperamentJp: "優しい・敏感・敏捷", temperamentEn: "Gentle, Sensitive, Agile",
    lifeSpan: "14-15 years",
    diagnosticNoteJp: "骨折リスクの傾向を継続モニタリング。早期検知で予後を改善。",
    diagnosticNoteEn: "Continuous monitoring for bone fragility supports early detection and better outcomes.",
    image: "https://images.unsplash.com/photo-1530041539828-114de669390e?w=400&q=80&auto=format&fit=crop",
    bannerBg: "linear-gradient(135deg, #FFE0B5, #E89A5A)", rankBg: "#A55A1A", sizeBg: "#FFF1E0", sizeText: "#A55A1A",
    kanji: "伊", kanjiSize: 60, kanjiColor: "rgba(255,255,255,0.25)",
    Icon: Crown, iconColor: "rgba(255,255,255,0.65)",
    stats: { energy: 80, friendly: 75, train: 65, groom: 30 },
    health: [{ jp: "骨折リスク", en: "Bone Fragility", level: "watch" }],
  },
  {
    jp: "ミニチュアピンシャー", en: "Miniature Pinscher", kana: "ミニチュアピンシャー", rank: 23, size: "toy", sizeJp: "超小型", sizeEn: "Toy",
    originJp: "ドイツ", originEn: "Germany", flag: "",
    groupJp: "トイ", groupEn: "Toy",
    temperamentJp: "勇敢・活発・好奇心", temperamentEn: "Fearless, Energetic, Curious",
    lifeSpan: "12-16 years",
    diagnosticNoteJp: "膝蓋骨脱臼の傾向を継続モニタリング。早期検知で予後を改善。",
    diagnosticNoteEn: "Continuous monitoring for patellar luxation supports early detection and better outcomes.",
    image: "https://images.unsplash.com/photo-1551717743-49959800b1f6?w=400&q=80&auto=format&fit=crop",
    bannerBg: "linear-gradient(135deg, #FFD3E0, #E8829A)", rankBg: "#C44A6A", sizeBg: "#FFE4EC", sizeText: "#C44A6A",
    kanji: "独", kanjiSize: 60, kanjiColor: "rgba(255,255,255,0.25)",
    Icon: Crown, iconColor: "rgba(255,255,255,0.65)",
    stats: { energy: 85, friendly: 60, train: 75, groom: 40 },
    health: [{ jp: "膝蓋骨脱臼", en: "Patellar Luxation", level: "watch" }],
  },
  {
    jp: "トイフォックステリア", en: "Toy Fox Terrier", kana: "トイフォックステリア", rank: 24, size: "toy", sizeJp: "超小型", sizeEn: "Toy",
    originJp: "アメリカ", originEn: "USA", flag: "",
    groupJp: "トイ", groupEn: "Toy",
    temperamentJp: "賢い・活発・忠実", temperamentEn: "Smart, Lively, Loyal",
    lifeSpan: "13-15 years",
    diagnosticNoteJp: "膝蓋骨脱臼の傾向を継続モニタリング。早期検知で予後を改善。",
    diagnosticNoteEn: "Continuous monitoring for patellar luxation supports early detection and better outcomes.",
    image: "https://images.unsplash.com/photo-1568393691080-fcd87bd66f72?w=400&q=80&auto=format&fit=crop",
    bannerBg: "linear-gradient(135deg, #FFD3E0, #E8829A)", rankBg: "#C44A6A", sizeBg: "#FFE4EC", sizeText: "#C44A6A",
    kanji: "狐", kanjiSize: 60, kanjiColor: "rgba(255,255,255,0.25)",
    Icon: Crown, iconColor: "rgba(255,255,255,0.65)",
    stats: { energy: 80, friendly: 75, train: 80, groom: 40 },
    health: [{ jp: "膝蓋骨脱臼", en: "Patellar Luxation", level: "watch" }],
  },
  {
    jp: "ラサアプソ", en: "Lhasa Apso", kana: "ラサアプソ", rank: 25, size: "small", sizeJp: "小型", sizeEn: "Small",
    originJp: "チベット", originEn: "Tibet", flag: "",
    groupJp: "非スポーティング", groupEn: "Non-Sporting",
    temperamentJp: "自信家・賢い・愛情深い", temperamentEn: "Confident, Smart, Affectionate",
    lifeSpan: "12-15 years",
    diagnosticNoteJp: "進行性網膜萎縮の傾向を継続モニタリング。早期検知で予後を改善。",
    diagnosticNoteEn: "Continuous monitoring for progressive retinal atrophy supports early detection and better outcomes.",
    image: "https://images.unsplash.com/photo-1546484959-f9a381d1330d?w=400&q=80&auto=format&fit=crop",
    bannerBg: "linear-gradient(135deg, #FFE0B5, #E89A5A)", rankBg: "#A55A1A", sizeBg: "#FFF1E0", sizeText: "#A55A1A",
    kanji: "蔵", kanjiSize: 60, kanjiColor: "rgba(255,255,255,0.25)",
    Icon: Heart, iconColor: "rgba(255,255,255,0.65)",
    stats: { energy: 55, friendly: 70, train: 55, groom: 90 },
    health: [{ jp: "進行性網膜萎縮", en: "Progressive Retinal Atrophy", level: "watch" }],
  },
  {
    jp: "ペキニーズ", en: "Pekingese", kana: "ペキニーズ", rank: 26, size: "toy", sizeJp: "超小型", sizeEn: "Toy",
    originJp: "中国", originEn: "China", flag: "",
    groupJp: "トイ", groupEn: "Toy",
    temperamentJp: "威厳・愛情深い・頑固", temperamentEn: "Dignified, Affectionate, Stubborn",
    lifeSpan: "12-14 years",
    diagnosticNoteJp: "短頭種症候群の傾向を継続モニタリング。早期検知で予後を改善。",
    diagnosticNoteEn: "Continuous monitoring for brachycephalic syndrome supports early detection and better outcomes.",
    image: "https://images.unsplash.com/photo-1583511655802-41f0036fdc7e?w=400&q=80&auto=format&fit=crop",
    bannerBg: "linear-gradient(135deg, #FFD3E0, #E8829A)", rankBg: "#C44A6A", sizeBg: "#FFE4EC", sizeText: "#C44A6A",
    kanji: "京", kanjiSize: 60, kanjiColor: "rgba(255,255,255,0.25)",
    Icon: Crown, iconColor: "rgba(255,255,255,0.65)",
    stats: { energy: 35, friendly: 65, train: 40, groom: 80 },
    health: [{ jp: "短頭種症候群", en: "Brachycephalic Syndrome", level: "concern" }],
  },
  {
    jp: "ハバニーズ", en: "Havanese", kana: "ハバニーズ", rank: 27, size: "toy", sizeJp: "超小型", sizeEn: "Toy",
    originJp: "キューバ", originEn: "Cuba", flag: "",
    groupJp: "トイ", groupEn: "Toy",
    temperamentJp: "愛情深い・遊び好き・知的", temperamentEn: "Affectionate, Playful, Intelligent",
    lifeSpan: "14-16 years",
    diagnosticNoteJp: "白内障の傾向を継続モニタリング。早期検知で予後を改善。",
    diagnosticNoteEn: "Continuous monitoring for cataracts supports early detection and better outcomes.",
    image: "https://images.unsplash.com/photo-1583511655802-41f0036fdc7e?w=400&q=80&auto=format&fit=crop",
    bannerBg: "linear-gradient(135deg, #FFD3E0, #E8829A)", rankBg: "#C44A6A", sizeBg: "#FFE4EC", sizeText: "#C44A6A",
    kanji: "哈", kanjiSize: 60, kanjiColor: "rgba(255,255,255,0.25)",
    Icon: Crown, iconColor: "rgba(255,255,255,0.65)",
    stats: { energy: 65, friendly: 90, train: 80, groom: 80 },
    health: [{ jp: "白内障", en: "Cataracts", level: "watch" }],
  },
  {
    jp: "ビションフリーゼ", en: "Bichon Frise", kana: "ビションフリーゼ", rank: 28, size: "toy", sizeJp: "超小型", sizeEn: "Toy",
    originJp: "フランス", originEn: "France", flag: "",
    groupJp: "非スポーティング", groupEn: "Non-Sporting",
    temperamentJp: "陽気・遊び好き・優しい", temperamentEn: "Cheerful, Playful, Gentle",
    lifeSpan: "12-15 years",
    diagnosticNoteJp: "アレルギーの傾向を継続モニタリング。早期検知で予後を改善。",
    diagnosticNoteEn: "Continuous monitoring for allergies supports early detection and better outcomes.",
    image: "https://images.unsplash.com/photo-1574158622682-e40e69881006?w=400&q=80&auto=format&fit=crop",
    bannerBg: "linear-gradient(135deg, #FFD3E0, #E8829A)", rankBg: "#C44A6A", sizeBg: "#FFE4EC", sizeText: "#C44A6A",
    kanji: "雪", kanjiSize: 60, kanjiColor: "rgba(255,255,255,0.25)",
    Icon: Heart, iconColor: "rgba(255,255,255,0.65)",
    stats: { energy: 65, friendly: 90, train: 75, groom: 90 },
    health: [{ jp: "アレルギー", en: "Allergies", level: "watch" }],
  },
  {
    jp: "アフェンピンシャー", en: "Affenpinscher", kana: "アフェンピンシャー", rank: 29, size: "toy", sizeJp: "超小型", sizeEn: "Toy",
    originJp: "ドイツ", originEn: "Germany", flag: "",
    groupJp: "トイ", groupEn: "Toy",
    temperamentJp: "勇敢・好奇心・活発", temperamentEn: "Fearless, Curious, Active",
    lifeSpan: "12-14 years",
    diagnosticNoteJp: "膝蓋骨脱臼の傾向を継続モニタリング。早期検知で予後を改善。",
    diagnosticNoteEn: "Continuous monitoring for patellar luxation supports early detection and better outcomes.",
    image: "https://images.unsplash.com/photo-1568572933382-74d440642117?w=400&q=80&auto=format&fit=crop",
    bannerBg: "linear-gradient(135deg, #FFD3E0, #E8829A)", rankBg: "#C44A6A", sizeBg: "#FFE4EC", sizeText: "#C44A6A",
    kanji: "猿", kanjiSize: 60, kanjiColor: "rgba(255,255,255,0.25)",
    Icon: Crown, iconColor: "rgba(255,255,255,0.65)",
    stats: { energy: 70, friendly: 65, train: 65, groom: 70 },
    health: [{ jp: "膝蓋骨脱臼", en: "Patellar Luxation", level: "watch" }],
  },
  {
    jp: "ブリュッセルグリフォン", en: "Brussels Griffon", kana: "ブリュッセルグリフォン", rank: 30, size: "toy", sizeJp: "超小型", sizeEn: "Toy",
    originJp: "ベルギー", originEn: "Belgium", flag: "",
    groupJp: "トイ", groupEn: "Toy",
    temperamentJp: "愛情深い・賢い・好奇心", temperamentEn: "Affectionate, Smart, Curious",
    lifeSpan: "12-15 years",
    diagnosticNoteJp: "短頭種症候群の傾向を継続モニタリング。早期検知で予後を改善。",
    diagnosticNoteEn: "Continuous monitoring for brachycephalic syndrome supports early detection and better outcomes.",
    image: "https://images.unsplash.com/photo-1574158622682-e40e69881006?w=400&q=80&auto=format&fit=crop",
    bannerBg: "linear-gradient(135deg, #FFD3E0, #E8829A)", rankBg: "#C44A6A", sizeBg: "#FFE4EC", sizeText: "#C44A6A",
    kanji: "白", kanjiSize: 60, kanjiColor: "rgba(255,255,255,0.25)",
    Icon: Crown, iconColor: "rgba(255,255,255,0.65)",
    stats: { energy: 65, friendly: 75, train: 75, groom: 70 },
    health: [{ jp: "短頭種症候群", en: "Brachycephalic Syndrome", level: "concern" }],
  },
  {
    jp: "スタンダードダックスフンド", en: "Standard Dachshund", kana: "スタンダードダックスフンド", rank: 31, size: "medium", sizeJp: "中型", sizeEn: "Medium",
    originJp: "ドイツ", originEn: "Germany", flag: "",
    groupJp: "ハウンド", groupEn: "Hound",
    temperamentJp: "勇敢・好奇心旺盛・忠実", temperamentEn: "Spunky, Curious, Loyal",
    lifeSpan: "12-16 years",
    diagnosticNoteJp: "椎間板ヘルニアの傾向を継続モニタリング。早期検知で予後を改善。",
    diagnosticNoteEn: "Continuous monitoring for ivdd supports early detection and better outcomes.",
    image: "https://images.unsplash.com/photo-1612195583950-b8fd34c87093?w=400&q=80&auto=format&fit=crop",
    bannerBg: "linear-gradient(135deg, #B5E0C8, #5AAF7A)", rankBg: "#2E7D4A", sizeBg: "#E6F5EC", sizeText: "#2E7D4A",
    kanji: "独", kanjiSize: 60, kanjiColor: "rgba(255,255,255,0.25)",
    Icon: Wind, iconColor: "rgba(255,255,255,0.65)",
    stats: { energy: 70, friendly: 75, train: 60, groom: 50 },
    health: [{ jp: "椎間板ヘルニア", en: "IVDD", level: "concern" }],
  },
  {
    jp: "ビーグル", en: "Beagle", kana: "ビーグル", rank: 32, size: "small", sizeJp: "小型", sizeEn: "Small",
    originJp: "イギリス", originEn: "UK", flag: "",
    groupJp: "ハウンド", groupEn: "Hound",
    temperamentJp: "陽気・好奇心・友好的", temperamentEn: "Merry, Curious, Friendly",
    lifeSpan: "12-15 years",
    diagnosticNoteJp: "肥満の傾向を継続モニタリング。早期検知で予後を改善。",
    diagnosticNoteEn: "Continuous monitoring for obesity supports early detection and better outcomes.",
    image: "https://images.unsplash.com/photo-1505628346881-b72b27e84530?w=400&q=80&auto=format&fit=crop",
    bannerBg: "linear-gradient(135deg, #FFE0B5, #E89A5A)", rankBg: "#A55A1A", sizeBg: "#FFF1E0", sizeText: "#A55A1A",
    kanji: "英", kanjiSize: 60, kanjiColor: "rgba(255,255,255,0.25)",
    Icon: Wind, iconColor: "rgba(255,255,255,0.65)",
    stats: { energy: 85, friendly: 90, train: 55, groom: 40 },
    health: [{ jp: "肥満", en: "Obesity", level: "watch" }],
  },
  {
    jp: "イングリッシュブルドッグ", en: "English Bulldog", kana: "イングリッシュブルドッグ", rank: 33, size: "medium", sizeJp: "中型", sizeEn: "Medium",
    originJp: "イギリス", originEn: "UK", flag: "",
    groupJp: "非スポーティング", groupEn: "Non-Sporting",
    temperamentJp: "勇敢・友好的・穏やか", temperamentEn: "Brave, Friendly, Calm",
    lifeSpan: "8-10 years",
    diagnosticNoteJp: "短頭種症候群の傾向を継続モニタリング。早期検知で予後を改善。",
    diagnosticNoteEn: "Continuous monitoring for brachycephalic syndrome supports early detection and better outcomes.",
    image: "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=400&q=80&auto=format&fit=crop",
    bannerBg: "linear-gradient(135deg, #B5E0C8, #5AAF7A)", rankBg: "#2E7D4A", sizeBg: "#E6F5EC", sizeText: "#2E7D4A",
    kanji: "英", kanjiSize: 60, kanjiColor: "rgba(255,255,255,0.25)",
    Icon: Heart, iconColor: "rgba(255,255,255,0.65)",
    stats: { energy: 40, friendly: 80, train: 55, groom: 50 },
    health: [{ jp: "短頭種症候群", en: "Brachycephalic Syndrome", level: "concern" }],
  },
  {
    jp: "コーギー", en: "Corgi", kana: "コーギー", rank: 34, size: "small", sizeJp: "小型", sizeEn: "Small",
    originJp: "イギリス", originEn: "UK", flag: "",
    groupJp: "ハーディング", groupEn: "Herding",
    temperamentJp: "賢い・活発・愛情深い", temperamentEn: "Smart, Active, Affectionate",
    lifeSpan: "12-13 years",
    diagnosticNoteJp: "椎間板ヘルニアの傾向を継続モニタリング。早期検知で予後を改善。",
    diagnosticNoteEn: "Continuous monitoring for ivdd supports early detection and better outcomes.",
    image: "https://images.unsplash.com/photo-1612536057832-2ff7ead58194?w=400&q=80&auto=format&fit=crop",
    bannerBg: "linear-gradient(135deg, #FFE0B5, #E89A5A)", rankBg: "#A55A1A", sizeBg: "#FFF1E0", sizeText: "#A55A1A",
    kanji: "柯", kanjiSize: 60, kanjiColor: "rgba(255,255,255,0.25)",
    Icon: Sparkles, iconColor: "rgba(255,255,255,0.65)",
    stats: { energy: 80, friendly: 85, train: 85, groom: 60 },
    health: [{ jp: "椎間板ヘルニア", en: "IVDD", level: "watch" }],
  },
  {
    jp: "シェットランドシープドッグ", en: "Shetland Sheepdog", kana: "シェットランドシープドッグ", rank: 35, size: "small", sizeJp: "小型", sizeEn: "Small",
    originJp: "イギリス", originEn: "UK", flag: "",
    groupJp: "ハーディング", groupEn: "Herding",
    temperamentJp: "賢い・優しい・敏感", temperamentEn: "Smart, Gentle, Sensitive",
    lifeSpan: "12-14 years",
    diagnosticNoteJp: "コリーアイの傾向を継続モニタリング。早期検知で予後を改善。",
    diagnosticNoteEn: "Continuous monitoring for collie eye supports early detection and better outcomes.",
    image: "https://images.unsplash.com/photo-1568393691080-fcd87bd66f72?w=400&q=80&auto=format&fit=crop",
    bannerBg: "linear-gradient(135deg, #FFE0B5, #E89A5A)", rankBg: "#A55A1A", sizeBg: "#FFF1E0", sizeText: "#A55A1A",
    kanji: "羊", kanjiSize: 60, kanjiColor: "rgba(255,255,255,0.25)",
    Icon: Sparkles, iconColor: "rgba(255,255,255,0.65)",
    stats: { energy: 85, friendly: 85, train: 95, groom: 80 },
    health: [{ jp: "コリーアイ", en: "Collie Eye", level: "watch" }],
  },
  {
    jp: "ボーダーコリー", en: "Border Collie", kana: "ボーダーコリー", rank: 36, size: "medium", sizeJp: "中型", sizeEn: "Medium",
    originJp: "イギリス", originEn: "UK", flag: "",
    groupJp: "ハーディング", groupEn: "Herding",
    temperamentJp: "非常に賢い・活発・働き者", temperamentEn: "Highly Intelligent, Energetic, Hardworking",
    lifeSpan: "12-15 years",
    diagnosticNoteJp: "股関節形成不全の傾向を継続モニタリング。早期検知で予後を改善。",
    diagnosticNoteEn: "Continuous monitoring for hip dysplasia supports early detection and better outcomes.",
    image: "https://images.unsplash.com/photo-1503256207526-0d5d80fa2f47?w=400&q=80&auto=format&fit=crop",
    bannerBg: "linear-gradient(135deg, #B5E0C8, #5AAF7A)", rankBg: "#2E7D4A", sizeBg: "#E6F5EC", sizeText: "#2E7D4A",
    kanji: "羊", kanjiSize: 60, kanjiColor: "rgba(255,255,255,0.25)",
    Icon: Sparkles, iconColor: "rgba(255,255,255,0.65)",
    stats: { energy: 100, friendly: 80, train: 100, groom: 60 },
    health: [{ jp: "股関節形成不全", en: "Hip Dysplasia", level: "watch" }],
  },
  {
    jp: "オーストラリアンシェパード", en: "Australian Shepherd", kana: "オーストラリアンシェパード", rank: 37, size: "medium", sizeJp: "中型", sizeEn: "Medium",
    originJp: "アメリカ", originEn: "USA", flag: "",
    groupJp: "ハーディング", groupEn: "Herding",
    temperamentJp: "賢い・活発・忠実", temperamentEn: "Smart, Energetic, Loyal",
    lifeSpan: "12-15 years",
    diagnosticNoteJp: "てんかんの傾向を継続モニタリング。早期検知で予後を改善。",
    diagnosticNoteEn: "Continuous monitoring for epilepsy supports early detection and better outcomes.",
    image: "https://images.unsplash.com/photo-1568572933382-74d440642117?w=400&q=80&auto=format&fit=crop",
    bannerBg: "linear-gradient(135deg, #B5E0C8, #5AAF7A)", rankBg: "#2E7D4A", sizeBg: "#E6F5EC", sizeText: "#2E7D4A",
    kanji: "豪", kanjiSize: 60, kanjiColor: "rgba(255,255,255,0.25)",
    Icon: Sparkles, iconColor: "rgba(255,255,255,0.65)",
    stats: { energy: 95, friendly: 85, train: 95, groom: 65 },
    health: [{ jp: "てんかん", en: "Epilepsy", level: "watch" }],
  },
  {
    jp: "スプリンガースパニエル", en: "Springer Spaniel", kana: "スプリンガースパニエル", rank: 38, size: "medium", sizeJp: "中型", sizeEn: "Medium",
    originJp: "イギリス", originEn: "UK", flag: "",
    groupJp: "スポーティング", groupEn: "Sporting",
    temperamentJp: "活発・友好的・賢い", temperamentEn: "Energetic, Friendly, Smart",
    lifeSpan: "12-14 years",
    diagnosticNoteJp: "外耳炎の傾向を継続モニタリング。早期検知で予後を改善。",
    diagnosticNoteEn: "Continuous monitoring for ear infections supports early detection and better outcomes.",
    image: "https://images.unsplash.com/photo-1568572933382-74d440642117?w=400&q=80&auto=format&fit=crop",
    bannerBg: "linear-gradient(135deg, #B5E0C8, #5AAF7A)", rankBg: "#2E7D4A", sizeBg: "#E6F5EC", sizeText: "#2E7D4A",
    kanji: "泉", kanjiSize: 60, kanjiColor: "rgba(255,255,255,0.25)",
    Icon: Sun, iconColor: "rgba(255,255,255,0.65)",
    stats: { energy: 90, friendly: 90, train: 85, groom: 70 },
    health: [{ jp: "外耳炎", en: "Ear Infections", level: "watch" }],
  },
  {
    jp: "コッカースパニエル", en: "Cocker Spaniel", kana: "コッカースパニエル", rank: 39, size: "medium", sizeJp: "中型", sizeEn: "Medium",
    originJp: "イギリス", originEn: "UK", flag: "",
    groupJp: "スポーティング", groupEn: "Sporting",
    temperamentJp: "優しい・賢い・愛情深い", temperamentEn: "Gentle, Smart, Affectionate",
    lifeSpan: "12-15 years",
    diagnosticNoteJp: "外耳炎の傾向を継続モニタリング。早期検知で予後を改善。",
    diagnosticNoteEn: "Continuous monitoring for ear infections supports early detection and better outcomes.",
    image: "https://images.unsplash.com/photo-1591768793355-74d04bb6608f?w=400&q=80&auto=format&fit=crop",
    bannerBg: "linear-gradient(135deg, #B5E0C8, #5AAF7A)", rankBg: "#2E7D4A", sizeBg: "#E6F5EC", sizeText: "#2E7D4A",
    kanji: "耳", kanjiSize: 60, kanjiColor: "rgba(255,255,255,0.25)",
    Icon: Sun, iconColor: "rgba(255,255,255,0.65)",
    stats: { energy: 75, friendly: 90, train: 80, groom: 80 },
    health: [{ jp: "外耳炎", en: "Ear Infections", level: "watch" }],
  },
  {
    jp: "バセットハウンド", en: "Basset Hound", kana: "バセットハウンド", rank: 40, size: "medium", sizeJp: "中型", sizeEn: "Medium",
    originJp: "フランス", originEn: "France", flag: "",
    groupJp: "ハウンド", groupEn: "Hound",
    temperamentJp: "のんびり・忠実・優しい", temperamentEn: "Easygoing, Loyal, Gentle",
    lifeSpan: "10-12 years",
    diagnosticNoteJp: "椎間板ヘルニアの傾向を継続モニタリング。早期検知で予後を改善。",
    diagnosticNoteEn: "Continuous monitoring for ivdd supports early detection and better outcomes.",
    image: "https://images.unsplash.com/photo-1505628346881-b72b27e84530?w=400&q=80&auto=format&fit=crop",
    bannerBg: "linear-gradient(135deg, #B5E0C8, #5AAF7A)", rankBg: "#2E7D4A", sizeBg: "#E6F5EC", sizeText: "#2E7D4A",
    kanji: "仏", kanjiSize: 60, kanjiColor: "rgba(255,255,255,0.25)",
    Icon: Wind, iconColor: "rgba(255,255,255,0.65)",
    stats: { energy: 50, friendly: 85, train: 55, groom: 40 },
    health: [{ jp: "椎間板ヘルニア", en: "IVDD", level: "watch" }],
  },
  {
    jp: "ウェルシュテリア", en: "Welsh Terrier", kana: "ウェルシュテリア", rank: 41, size: "medium", sizeJp: "中型", sizeEn: "Medium",
    originJp: "イギリス", originEn: "UK", flag: "",
    groupJp: "テリア", groupEn: "Terrier",
    temperamentJp: "活発・勇敢・友好的", temperamentEn: "Lively, Brave, Friendly",
    lifeSpan: "12-15 years",
    diagnosticNoteJp: "アレルギーの傾向を継続モニタリング。早期検知で予後を改善。",
    diagnosticNoteEn: "Continuous monitoring for allergies supports early detection and better outcomes.",
    image: "https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=400&q=80&auto=format&fit=crop",
    bannerBg: "linear-gradient(135deg, #B5E0C8, #5AAF7A)", rankBg: "#2E7D4A", sizeBg: "#E6F5EC", sizeText: "#2E7D4A",
    kanji: "威", kanjiSize: 60, kanjiColor: "rgba(255,255,255,0.25)",
    Icon: Sparkles, iconColor: "rgba(255,255,255,0.65)",
    stats: { energy: 85, friendly: 75, train: 75, groom: 70 },
    health: [{ jp: "アレルギー", en: "Allergies", level: "watch" }],
  },
  {
    jp: "ケアーンテリア", en: "Cairn Terrier", kana: "ケアーンテリア", rank: 42, size: "small", sizeJp: "小型", sizeEn: "Small",
    originJp: "イギリス", originEn: "UK", flag: "",
    groupJp: "テリア", groupEn: "Terrier",
    temperamentJp: "勇敢・陽気・賢い", temperamentEn: "Brave, Cheerful, Smart",
    lifeSpan: "13-15 years",
    diagnosticNoteJp: "門脈シャントの傾向を継続モニタリング。早期検知で予後を改善。",
    diagnosticNoteEn: "Continuous monitoring for liver shunt supports early detection and better outcomes.",
    image: "https://images.unsplash.com/photo-1567014543648-e4391c989aab?w=400&q=80&auto=format&fit=crop",
    bannerBg: "linear-gradient(135deg, #FFE0B5, #E89A5A)", rankBg: "#A55A1A", sizeBg: "#FFF1E0", sizeText: "#A55A1A",
    kanji: "岩", kanjiSize: 60, kanjiColor: "rgba(255,255,255,0.25)",
    Icon: Sparkles, iconColor: "rgba(255,255,255,0.65)",
    stats: { energy: 80, friendly: 80, train: 75, groom: 60 },
    health: [{ jp: "門脈シャント", en: "Liver Shunt", level: "watch" }],
  },
  {
    jp: "スコティッシュテリア", en: "Scottish Terrier", kana: "スコティッシュテリア", rank: 43, size: "small", sizeJp: "小型", sizeEn: "Small",
    originJp: "イギリス", originEn: "UK", flag: "",
    groupJp: "テリア", groupEn: "Terrier",
    temperamentJp: "威厳・独立心・忠実", temperamentEn: "Dignified, Independent, Loyal",
    lifeSpan: "11-13 years",
    diagnosticNoteJp: "膀胱がんの傾向を継続モニタリング。早期検知で予後を改善。",
    diagnosticNoteEn: "Continuous monitoring for bladder cancer supports early detection and better outcomes.",
    image: "https://images.unsplash.com/photo-1593134257782-e89567b7718a?w=400&q=80&auto=format&fit=crop",
    bannerBg: "linear-gradient(135deg, #FFE0B5, #E89A5A)", rankBg: "#A55A1A", sizeBg: "#FFF1E0", sizeText: "#A55A1A",
    kanji: "蘇", kanjiSize: 60, kanjiColor: "rgba(255,255,255,0.25)",
    Icon: Sparkles, iconColor: "rgba(255,255,255,0.65)",
    stats: { energy: 70, friendly: 55, train: 60, groom: 75 },
    health: [{ jp: "膀胱がん", en: "Bladder Cancer", level: "watch" }],
  },
  {
    jp: "ウェストハイランドホワイトテリア", en: "West Highland White Terrier", kana: "ウェストハイランドホワイトテリア", rank: 44, size: "small", sizeJp: "小型", sizeEn: "Small",
    originJp: "イギリス", originEn: "UK", flag: "",
    groupJp: "テリア", groupEn: "Terrier",
    temperamentJp: "陽気・忠実・自信家", temperamentEn: "Cheerful, Loyal, Confident",
    lifeSpan: "13-15 years",
    diagnosticNoteJp: "皮膚疾患の傾向を継続モニタリング。早期検知で予後を改善。",
    diagnosticNoteEn: "Continuous monitoring for skin issues supports early detection and better outcomes.",
    image: "https://images.unsplash.com/photo-1547038577-da80abbc4f19?w=400&q=80&auto=format&fit=crop",
    bannerBg: "linear-gradient(135deg, #FFE0B5, #E89A5A)", rankBg: "#A55A1A", sizeBg: "#FFF1E0", sizeText: "#A55A1A",
    kanji: "西", kanjiSize: 60, kanjiColor: "rgba(255,255,255,0.25)",
    Icon: Sparkles, iconColor: "rgba(255,255,255,0.65)",
    stats: { energy: 80, friendly: 80, train: 75, groom: 75 },
    health: [{ jp: "皮膚疾患", en: "Skin Issues", level: "watch" }],
  },
  {
    jp: "ミニチュアシュナウザー", en: "Miniature Schnauzer", kana: "ミニチュアシュナウザー", rank: 45, size: "small", sizeJp: "小型", sizeEn: "Small",
    originJp: "ドイツ", originEn: "Germany", flag: "",
    groupJp: "テリア", groupEn: "Terrier",
    temperamentJp: "賢い・友好的・活発", temperamentEn: "Smart, Friendly, Lively",
    lifeSpan: "12-15 years",
    diagnosticNoteJp: "膵炎の傾向を継続モニタリング。早期検知で予後を改善。",
    diagnosticNoteEn: "Continuous monitoring for pancreatitis supports early detection and better outcomes.",
    image: "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=400&q=80&auto=format&fit=crop",
    bannerBg: "linear-gradient(135deg, #FFE0B5, #E89A5A)", rankBg: "#A55A1A", sizeBg: "#FFF1E0", sizeText: "#A55A1A",
    kanji: "独", kanjiSize: 60, kanjiColor: "rgba(255,255,255,0.25)",
    Icon: Sparkles, iconColor: "rgba(255,255,255,0.65)",
    stats: { energy: 80, friendly: 80, train: 85, groom: 80 },
    health: [{ jp: "膵炎", en: "Pancreatitis", level: "watch" }],
  },
  {
    jp: "プチバセットグリフォンバンデーン", en: "PBGV", kana: "ピービージーブイ", rank: 46, size: "small", sizeJp: "小型", sizeEn: "Small",
    originJp: "フランス", originEn: "France", flag: "",
    groupJp: "ハウンド", groupEn: "Hound",
    temperamentJp: "陽気・活発・友好的", temperamentEn: "Happy, Lively, Friendly",
    lifeSpan: "14-16 years",
    diagnosticNoteJp: "目疾患の傾向を継続モニタリング。早期検知で予後を改善。",
    diagnosticNoteEn: "Continuous monitoring for eye issues supports early detection and better outcomes.",
    image: "https://images.unsplash.com/photo-1505628346881-b72b27e84530?w=400&q=80&auto=format&fit=crop",
    bannerBg: "linear-gradient(135deg, #FFE0B5, #E89A5A)", rankBg: "#A55A1A", sizeBg: "#FFF1E0", sizeText: "#A55A1A",
    kanji: "仏", kanjiSize: 60, kanjiColor: "rgba(255,255,255,0.25)",
    Icon: Wind, iconColor: "rgba(255,255,255,0.65)",
    stats: { energy: 80, friendly: 85, train: 65, groom: 60 },
    health: [{ jp: "目疾患", en: "Eye Issues", level: "watch" }],
  },
  {
    jp: "バセンジー", en: "Basenji", kana: "バセンジー", rank: 47, size: "small", sizeJp: "小型", sizeEn: "Small",
    originJp: "コンゴ", originEn: "Congo", flag: "",
    groupJp: "ハウンド", groupEn: "Hound",
    temperamentJp: "賢い・独立心・静か", temperamentEn: "Smart, Independent, Quiet",
    lifeSpan: "13-14 years",
    diagnosticNoteJp: "ファンコニ症候群の傾向を継続モニタリング。早期検知で予後を改善。",
    diagnosticNoteEn: "Continuous monitoring for fanconi syndrome supports early detection and better outcomes.",
    image: "https://images.unsplash.com/photo-1568572933382-74d440642117?w=400&q=80&auto=format&fit=crop",
    bannerBg: "linear-gradient(135deg, #FFE0B5, #E89A5A)", rankBg: "#A55A1A", sizeBg: "#FFF1E0", sizeText: "#A55A1A",
    kanji: "コ", kanjiSize: 60, kanjiColor: "rgba(255,255,255,0.25)",
    Icon: Wind, iconColor: "rgba(255,255,255,0.65)",
    stats: { energy: 85, friendly: 55, train: 55, groom: 40 },
    health: [{ jp: "ファンコニ症候群", en: "Fanconi Syndrome", level: "watch" }],
  },
  {
    jp: "スカイテリア", en: "Skye Terrier", kana: "スカイテリア", rank: 48, size: "small", sizeJp: "小型", sizeEn: "Small",
    originJp: "イギリス", originEn: "UK", flag: "",
    groupJp: "テリア", groupEn: "Terrier",
    temperamentJp: "勇敢・忠実・警戒", temperamentEn: "Brave, Loyal, Alert",
    lifeSpan: "12-14 years",
    diagnosticNoteJp: "椎間板ヘルニアの傾向を継続モニタリング。早期検知で予後を改善。",
    diagnosticNoteEn: "Continuous monitoring for ivdd supports early detection and better outcomes.",
    image: "https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=400&q=80&auto=format&fit=crop",
    bannerBg: "linear-gradient(135deg, #FFE0B5, #E89A5A)", rankBg: "#A55A1A", sizeBg: "#FFF1E0", sizeText: "#A55A1A",
    kanji: "空", kanjiSize: 60, kanjiColor: "rgba(255,255,255,0.25)",
    Icon: Sparkles, iconColor: "rgba(255,255,255,0.65)",
    stats: { energy: 60, friendly: 55, train: 60, groom: 80 },
    health: [{ jp: "椎間板ヘルニア", en: "IVDD", level: "watch" }],
  },
  {
    jp: "ラブラドールレトリバー", en: "Labrador Retriever", kana: "ラブラドールレトリバー", rank: 49, size: "large", sizeJp: "大型", sizeEn: "Large",
    originJp: "カナダ", originEn: "Canada", flag: "",
    groupJp: "スポーティング", groupEn: "Sporting",
    temperamentJp: "友好的・活発・賢い", temperamentEn: "Friendly, Active, Smart",
    lifeSpan: "10-12 years",
    diagnosticNoteJp: "股関節形成不全の傾向を継続モニタリング。早期検知で予後を改善。",
    diagnosticNoteEn: "Continuous monitoring for hip dysplasia supports early detection and better outcomes.",
    image: "https://images.unsplash.com/photo-1551717743-49959800b1f6?w=400&q=80&auto=format&fit=crop",
    bannerBg: "linear-gradient(135deg, #A8C8E8, #4A7AAF)", rankBg: "#2E5A8A", sizeBg: "#E6EEF8", sizeText: "#2E5A8A",
    kanji: "拉", kanjiSize: 60, kanjiColor: "rgba(255,255,255,0.25)",
    Icon: Sun, iconColor: "rgba(255,255,255,0.65)",
    stats: { energy: 90, friendly: 95, train: 90, groom: 40 },
    health: [{ jp: "股関節形成不全", en: "Hip Dysplasia", level: "concern" }],
  },
  {
    jp: "ジャーマンシェパード", en: "German Shepherd", kana: "ジャーマンシェパード", rank: 50, size: "large", sizeJp: "大型", sizeEn: "Large",
    originJp: "ドイツ", originEn: "Germany", flag: "",
    groupJp: "ハーディング", groupEn: "Herding",
    temperamentJp: "賢い・勇敢・忠実", temperamentEn: "Smart, Brave, Loyal",
    lifeSpan: "9-13 years",
    diagnosticNoteJp: "股関節形成不全の傾向を継続モニタリング。早期検知で予後を改善。",
    diagnosticNoteEn: "Continuous monitoring for hip dysplasia supports early detection and better outcomes.",
    image: "https://images.unsplash.com/photo-1589941013454-ec7d8f92b6a6?w=400&q=80&auto=format&fit=crop",
    bannerBg: "linear-gradient(135deg, #A8C8E8, #4A7AAF)", rankBg: "#2E5A8A", sizeBg: "#E6EEF8", sizeText: "#2E5A8A",
    kanji: "独", kanjiSize: 60, kanjiColor: "rgba(255,255,255,0.25)",
    Icon: Sparkles, iconColor: "rgba(255,255,255,0.65)",
    stats: { energy: 90, friendly: 75, train: 95, groom: 60 },
    health: [{ jp: "股関節形成不全", en: "Hip Dysplasia", level: "concern" }],
  },
  {
    jp: "アラスカンマラミュート", en: "Alaskan Malamute", kana: "アラスカンマラミュート", rank: 51, size: "large", sizeJp: "大型", sizeEn: "Large",
    originJp: "アメリカ", originEn: "USA", flag: "",
    groupJp: "ワーキング", groupEn: "Working",
    temperamentJp: "愛情深い・忠実・活発", temperamentEn: "Affectionate, Loyal, Active",
    lifeSpan: "10-14 years",
    diagnosticNoteJp: "股関節形成不全の傾向を継続モニタリング。早期検知で予後を改善。",
    diagnosticNoteEn: "Continuous monitoring for hip dysplasia supports early detection and better outcomes.",
    image: "https://images.unsplash.com/photo-1605568427561-40dd23c2acea?w=400&q=80&auto=format&fit=crop",
    bannerBg: "linear-gradient(135deg, #A8C8E8, #4A7AAF)", rankBg: "#2E5A8A", sizeBg: "#E6EEF8", sizeText: "#2E5A8A",
    kanji: "氷", kanjiSize: 60, kanjiColor: "rgba(255,255,255,0.25)",
    Icon: Zap, iconColor: "rgba(255,255,255,0.65)",
    stats: { energy: 90, friendly: 75, train: 60, groom: 70 },
    health: [{ jp: "股関節形成不全", en: "Hip Dysplasia", level: "concern" }],
  },
  {
    jp: "サモエド", en: "Samoyed", kana: "サモエド", rank: 52, size: "large", sizeJp: "大型", sizeEn: "Large",
    originJp: "ロシア", originEn: "Russia", flag: "",
    groupJp: "ワーキング", groupEn: "Working",
    temperamentJp: "友好的・活発・優しい", temperamentEn: "Friendly, Active, Gentle",
    lifeSpan: "12-14 years",
    diagnosticNoteJp: "股関節形成不全の傾向を継続モニタリング。早期検知で予後を改善。",
    diagnosticNoteEn: "Continuous monitoring for hip dysplasia supports early detection and better outcomes.",
    image: "https://images.unsplash.com/photo-1610041321420-a596dd14b0a8?w=400&q=80&auto=format&fit=crop",
    bannerBg: "linear-gradient(135deg, #A8C8E8, #4A7AAF)", rankBg: "#2E5A8A", sizeBg: "#E6EEF8", sizeText: "#2E5A8A",
    kanji: "白", kanjiSize: 60, kanjiColor: "rgba(255,255,255,0.25)",
    Icon: Zap, iconColor: "rgba(255,255,255,0.65)",
    stats: { energy: 80, friendly: 90, train: 75, groom: 90 },
    health: [{ jp: "股関節形成不全", en: "Hip Dysplasia", level: "watch" }],
  },
  {
    jp: "バーニーズマウンテンドッグ", en: "Bernese Mountain Dog", kana: "バーニーズマウンテンドッグ", rank: 53, size: "large", sizeJp: "大型", sizeEn: "Large",
    originJp: "スイス", originEn: "Switzerland", flag: "",
    groupJp: "ワーキング", groupEn: "Working",
    temperamentJp: "優しい・忠実・穏やか", temperamentEn: "Gentle, Loyal, Calm",
    lifeSpan: "7-10 years",
    diagnosticNoteJp: "がんリスクの傾向を継続モニタリング。早期検知で予後を改善。",
    diagnosticNoteEn: "Continuous monitoring for cancer risk supports early detection and better outcomes.",
    image: "https://images.unsplash.com/photo-1568572933382-74d440642117?w=400&q=80&auto=format&fit=crop",
    bannerBg: "linear-gradient(135deg, #A8C8E8, #4A7AAF)", rankBg: "#2E5A8A", sizeBg: "#E6EEF8", sizeText: "#2E5A8A",
    kanji: "山", kanjiSize: 60, kanjiColor: "rgba(255,255,255,0.25)",
    Icon: Zap, iconColor: "rgba(255,255,255,0.65)",
    stats: { energy: 60, friendly: 90, train: 75, groom: 75 },
    health: [{ jp: "がんリスク", en: "Cancer Risk", level: "concern" }],
  },
  {
    jp: "グレートピレニーズ", en: "Great Pyrenees", kana: "グレートピレニーズ", rank: 54, size: "large", sizeJp: "大型", sizeEn: "Large",
    originJp: "フランス", originEn: "France", flag: "",
    groupJp: "ワーキング", groupEn: "Working",
    temperamentJp: "穏やか・忠実・自信家", temperamentEn: "Calm, Loyal, Confident",
    lifeSpan: "10-12 years",
    diagnosticNoteJp: "股関節形成不全の傾向を継続モニタリング。早期検知で予後を改善。",
    diagnosticNoteEn: "Continuous monitoring for hip dysplasia supports early detection and better outcomes.",
    image: "https://images.unsplash.com/photo-1610041321420-a596dd14b0a8?w=400&q=80&auto=format&fit=crop",
    bannerBg: "linear-gradient(135deg, #A8C8E8, #4A7AAF)", rankBg: "#2E5A8A", sizeBg: "#E6EEF8", sizeText: "#2E5A8A",
    kanji: "峰", kanjiSize: 60, kanjiColor: "rgba(255,255,255,0.25)",
    Icon: Zap, iconColor: "rgba(255,255,255,0.65)",
    stats: { energy: 55, friendly: 75, train: 55, groom: 75 },
    health: [{ jp: "股関節形成不全", en: "Hip Dysplasia", level: "watch" }],
  },
  {
    jp: "アイリッシュセッター", en: "Irish Setter", kana: "アイリッシュセッター", rank: 55, size: "large", sizeJp: "大型", sizeEn: "Large",
    originJp: "アイルランド", originEn: "Ireland", flag: "",
    groupJp: "スポーティング", groupEn: "Sporting",
    temperamentJp: "活発・友好的・賢い", temperamentEn: "Active, Friendly, Smart",
    lifeSpan: "12-15 years",
    diagnosticNoteJp: "胃捻転の傾向を継続モニタリング。早期検知で予後を改善。",
    diagnosticNoteEn: "Continuous monitoring for bloat supports early detection and better outcomes.",
    image: "https://images.unsplash.com/photo-1551717743-49959800b1f6?w=400&q=80&auto=format&fit=crop",
    bannerBg: "linear-gradient(135deg, #A8C8E8, #4A7AAF)", rankBg: "#2E5A8A", sizeBg: "#E6EEF8", sizeText: "#2E5A8A",
    kanji: "愛", kanjiSize: 60, kanjiColor: "rgba(255,255,255,0.25)",
    Icon: Sun, iconColor: "rgba(255,255,255,0.65)",
    stats: { energy: 90, friendly: 90, train: 75, groom: 75 },
    health: [{ jp: "胃捻転", en: "Bloat", level: "watch" }],
  },
  {
    jp: "ドーベルマン", en: "Doberman", kana: "ドーベルマン", rank: 56, size: "large", sizeJp: "大型", sizeEn: "Large",
    originJp: "ドイツ", originEn: "Germany", flag: "",
    groupJp: "ワーキング", groupEn: "Working",
    temperamentJp: "忠実・勇敢・賢い", temperamentEn: "Loyal, Fearless, Smart",
    lifeSpan: "10-13 years",
    diagnosticNoteJp: "心筋症の傾向を継続モニタリング。早期検知で予後を改善。",
    diagnosticNoteEn: "Continuous monitoring for cardiomyopathy supports early detection and better outcomes.",
    image: "https://images.unsplash.com/photo-1589941013454-ec7d8f92b6a6?w=400&q=80&auto=format&fit=crop",
    bannerBg: "linear-gradient(135deg, #A8C8E8, #4A7AAF)", rankBg: "#2E5A8A", sizeBg: "#E6EEF8", sizeText: "#2E5A8A",
    kanji: "独", kanjiSize: 60, kanjiColor: "rgba(255,255,255,0.25)",
    Icon: Zap, iconColor: "rgba(255,255,255,0.65)",
    stats: { energy: 85, friendly: 70, train: 90, groom: 40 },
    health: [{ jp: "心筋症", en: "Cardiomyopathy", level: "concern" }],
  },
  {
    jp: "ロットワイラー", en: "Rottweiler", kana: "ロットワイラー", rank: 57, size: "large", sizeJp: "大型", sizeEn: "Large",
    originJp: "ドイツ", originEn: "Germany", flag: "",
    groupJp: "ワーキング", groupEn: "Working",
    temperamentJp: "勇敢・忠実・自信家", temperamentEn: "Brave, Loyal, Confident",
    lifeSpan: "9-10 years",
    diagnosticNoteJp: "股関節形成不全の傾向を継続モニタリング。早期検知で予後を改善。",
    diagnosticNoteEn: "Continuous monitoring for hip dysplasia supports early detection and better outcomes.",
    image: "https://images.unsplash.com/photo-1568572933382-74d440642117?w=400&q=80&auto=format&fit=crop",
    bannerBg: "linear-gradient(135deg, #A8C8E8, #4A7AAF)", rankBg: "#2E5A8A", sizeBg: "#E6EEF8", sizeText: "#2E5A8A",
    kanji: "独", kanjiSize: 60, kanjiColor: "rgba(255,255,255,0.25)",
    Icon: Zap, iconColor: "rgba(255,255,255,0.65)",
    stats: { energy: 75, friendly: 70, train: 85, groom: 40 },
    health: [{ jp: "股関節形成不全", en: "Hip Dysplasia", level: "concern" }],
  },
  {
    jp: "ボクサー", en: "Boxer", kana: "ボクサー", rank: 58, size: "large", sizeJp: "大型", sizeEn: "Large",
    originJp: "ドイツ", originEn: "Germany", flag: "",
    groupJp: "ワーキング", groupEn: "Working",
    temperamentJp: "遊び好き・忠実・活発", temperamentEn: "Playful, Loyal, Energetic",
    lifeSpan: "10-12 years",
    diagnosticNoteJp: "心臓疾患の傾向を継続モニタリング。早期検知で予後を改善。",
    diagnosticNoteEn: "Continuous monitoring for heart disease supports early detection and better outcomes.",
    image: "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=400&q=80&auto=format&fit=crop",
    bannerBg: "linear-gradient(135deg, #A8C8E8, #4A7AAF)", rankBg: "#2E5A8A", sizeBg: "#E6EEF8", sizeText: "#2E5A8A",
    kanji: "拳", kanjiSize: 60, kanjiColor: "rgba(255,255,255,0.25)",
    Icon: Zap, iconColor: "rgba(255,255,255,0.65)",
    stats: { energy: 85, friendly: 90, train: 80, groom: 40 },
    health: [{ jp: "心臓疾患", en: "Heart Disease", level: "concern" }],
  },
  {
    jp: "ワイマラナー", en: "Weimaraner", kana: "ワイマラナー", rank: 59, size: "large", sizeJp: "大型", sizeEn: "Large",
    originJp: "ドイツ", originEn: "Germany", flag: "",
    groupJp: "スポーティング", groupEn: "Sporting",
    temperamentJp: "賢い・活発・忠実", temperamentEn: "Smart, Active, Loyal",
    lifeSpan: "11-14 years",
    diagnosticNoteJp: "胃捻転の傾向を継続モニタリング。早期検知で予後を改善。",
    diagnosticNoteEn: "Continuous monitoring for bloat supports early detection and better outcomes.",
    image: "https://images.unsplash.com/photo-1551717743-49959800b1f6?w=400&q=80&auto=format&fit=crop",
    bannerBg: "linear-gradient(135deg, #A8C8E8, #4A7AAF)", rankBg: "#2E5A8A", sizeBg: "#E6EEF8", sizeText: "#2E5A8A",
    kanji: "銀", kanjiSize: 60, kanjiColor: "rgba(255,255,255,0.25)",
    Icon: Sun, iconColor: "rgba(255,255,255,0.65)",
    stats: { energy: 95, friendly: 80, train: 80, groom: 40 },
    health: [{ jp: "胃捻転", en: "Bloat", level: "watch" }],
  },
  {
    jp: "ダルメシアン", en: "Dalmatian", kana: "ダルメシアン", rank: 60, size: "large", sizeJp: "大型", sizeEn: "Large",
    originJp: "クロアチア", originEn: "Croatia", flag: "",
    groupJp: "非スポーティング", groupEn: "Non-Sporting",
    temperamentJp: "友好的・活発・賢い", temperamentEn: "Friendly, Active, Smart",
    lifeSpan: "11-13 years",
    diagnosticNoteJp: "難聴の傾向を継続モニタリング。早期検知で予後を改善。",
    diagnosticNoteEn: "Continuous monitoring for deafness supports early detection and better outcomes.",
    image: "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=400&q=80&auto=format&fit=crop",
    bannerBg: "linear-gradient(135deg, #A8C8E8, #4A7AAF)", rankBg: "#2E5A8A", sizeBg: "#E6EEF8", sizeText: "#2E5A8A",
    kanji: "斑", kanjiSize: 60, kanjiColor: "rgba(255,255,255,0.25)",
    Icon: Heart, iconColor: "rgba(255,255,255,0.65)",
    stats: { energy: 90, friendly: 80, train: 75, groom: 50 },
    health: [{ jp: "難聴", en: "Deafness", level: "watch" }],
  },
  {
    jp: "アフガンハウンド", en: "Afghan Hound", kana: "アフガンハウンド", rank: 61, size: "large", sizeJp: "大型", sizeEn: "Large",
    originJp: "アフガニスタン", originEn: "Afghanistan", flag: "",
    groupJp: "ハウンド", groupEn: "Hound",
    temperamentJp: "上品・独立心・敏感", temperamentEn: "Elegant, Independent, Aloof",
    lifeSpan: "12-14 years",
    diagnosticNoteJp: "白内障の傾向を継続モニタリング。早期検知で予後を改善。",
    diagnosticNoteEn: "Continuous monitoring for cataracts supports early detection and better outcomes.",
    image: "https://images.unsplash.com/photo-1620189507195-68309c04c4d0?w=400&q=80&auto=format&fit=crop",
    bannerBg: "linear-gradient(135deg, #A8C8E8, #4A7AAF)", rankBg: "#2E5A8A", sizeBg: "#E6EEF8", sizeText: "#2E5A8A",
    kanji: "阿", kanjiSize: 60, kanjiColor: "rgba(255,255,255,0.25)",
    Icon: Wind, iconColor: "rgba(255,255,255,0.65)",
    stats: { energy: 80, friendly: 55, train: 40, groom: 90 },
    health: [{ jp: "白内障", en: "Cataracts", level: "watch" }],
  },
  {
    jp: "グレートデーン", en: "Great Dane", kana: "グレートデーン", rank: 62, size: "large", sizeJp: "大型", sizeEn: "Large",
    originJp: "ドイツ", originEn: "Germany", flag: "",
    groupJp: "ワーキング", groupEn: "Working",
    temperamentJp: "友好的・忍耐・優しい", temperamentEn: "Friendly, Patient, Gentle",
    lifeSpan: "7-10 years",
    diagnosticNoteJp: "胃捻転の傾向を継続モニタリング。早期検知で予後を改善。",
    diagnosticNoteEn: "Continuous monitoring for bloat supports early detection and better outcomes.",
    image: "https://images.unsplash.com/photo-1583511655802-41f0036fdc7e?w=400&q=80&auto=format&fit=crop",
    bannerBg: "linear-gradient(135deg, #A8C8E8, #4A7AAF)", rankBg: "#2E5A8A", sizeBg: "#E6EEF8", sizeText: "#2E5A8A",
    kanji: "巨", kanjiSize: 60, kanjiColor: "rgba(255,255,255,0.25)",
    Icon: Zap, iconColor: "rgba(255,255,255,0.65)",
    stats: { energy: 60, friendly: 85, train: 75, groom: 40 },
    health: [{ jp: "胃捻転", en: "Bloat", level: "concern" }],
  },
  {
    jp: "セントバーナード", en: "Saint Bernard", kana: "セントバーナード", rank: 63, size: "large", sizeJp: "大型", sizeEn: "Large",
    originJp: "スイス", originEn: "Switzerland", flag: "",
    groupJp: "ワーキング", groupEn: "Working",
    temperamentJp: "穏やか・忠実・優しい", temperamentEn: "Calm, Devoted, Gentle",
    lifeSpan: "8-10 years",
    diagnosticNoteJp: "股関節形成不全の傾向を継続モニタリング。早期検知で予後を改善。",
    diagnosticNoteEn: "Continuous monitoring for hip dysplasia supports early detection and better outcomes.",
    image: "https://images.unsplash.com/photo-1610041321420-a596dd14b0a8?w=400&q=80&auto=format&fit=crop",
    bannerBg: "linear-gradient(135deg, #A8C8E8, #4A7AAF)", rankBg: "#2E5A8A", sizeBg: "#E6EEF8", sizeText: "#2E5A8A",
    kanji: "聖", kanjiSize: 60, kanjiColor: "rgba(255,255,255,0.25)",
    Icon: Zap, iconColor: "rgba(255,255,255,0.65)",
    stats: { energy: 50, friendly: 90, train: 65, groom: 60 },
    health: [{ jp: "股関節形成不全", en: "Hip Dysplasia", level: "concern" }],
  },
  {
    jp: "ニューファンドランド", en: "Newfoundland", kana: "ニューファンドランド", rank: 64, size: "large", sizeJp: "大型", sizeEn: "Large",
    originJp: "カナダ", originEn: "Canada", flag: "",
    groupJp: "ワーキング", groupEn: "Working",
    temperamentJp: "優しい・忠実・穏やか", temperamentEn: "Sweet, Devoted, Calm",
    lifeSpan: "9-10 years",
    diagnosticNoteJp: "心臓疾患の傾向を継続モニタリング。早期検知で予後を改善。",
    diagnosticNoteEn: "Continuous monitoring for heart disease supports early detection and better outcomes.",
    image: "https://images.unsplash.com/photo-1610041321420-a596dd14b0a8?w=400&q=80&auto=format&fit=crop",
    bannerBg: "linear-gradient(135deg, #A8C8E8, #4A7AAF)", rankBg: "#2E5A8A", sizeBg: "#E6EEF8", sizeText: "#2E5A8A",
    kanji: "海", kanjiSize: 60, kanjiColor: "rgba(255,255,255,0.25)",
    Icon: Zap, iconColor: "rgba(255,255,255,0.65)",
    stats: { energy: 55, friendly: 90, train: 75, groom: 70 },
    health: [{ jp: "心臓疾患", en: "Heart Disease", level: "concern" }],
  },
  {
    jp: "アイリッシュウルフハウンド", en: "Irish Wolfhound", kana: "アイリッシュウルフハウンド", rank: 65, size: "large", sizeJp: "大型", sizeEn: "Large",
    originJp: "アイルランド", originEn: "Ireland", flag: "",
    groupJp: "ハウンド", groupEn: "Hound",
    temperamentJp: "優しい・忍耐・尊厳", temperamentEn: "Gentle, Patient, Dignified",
    lifeSpan: "6-8 years",
    diagnosticNoteJp: "心臓疾患の傾向を継続モニタリング。早期検知で予後を改善。",
    diagnosticNoteEn: "Continuous monitoring for heart disease supports early detection and better outcomes.",
    image: "https://images.unsplash.com/photo-1620189507195-68309c04c4d0?w=400&q=80&auto=format&fit=crop",
    bannerBg: "linear-gradient(135deg, #A8C8E8, #4A7AAF)", rankBg: "#2E5A8A", sizeBg: "#E6EEF8", sizeText: "#2E5A8A",
    kanji: "狼", kanjiSize: 60, kanjiColor: "rgba(255,255,255,0.25)",
    Icon: Wind, iconColor: "rgba(255,255,255,0.65)",
    stats: { energy: 65, friendly: 85, train: 70, groom: 60 },
    health: [{ jp: "心臓疾患", en: "Heart Disease", level: "concern" }],
  },
  {
    jp: "スコティッシュディアハウンド", en: "Scottish Deerhound", kana: "スコティッシュディアハウンド", rank: 66, size: "large", sizeJp: "大型", sizeEn: "Large",
    originJp: "イギリス", originEn: "UK", flag: "",
    groupJp: "ハウンド", groupEn: "Hound",
    temperamentJp: "優しい・尊厳・友好的", temperamentEn: "Gentle, Dignified, Friendly",
    lifeSpan: "8-11 years",
    diagnosticNoteJp: "心臓疾患の傾向を継続モニタリング。早期検知で予後を改善。",
    diagnosticNoteEn: "Continuous monitoring for heart disease supports early detection and better outcomes.",
    image: "https://images.unsplash.com/photo-1620189507195-68309c04c4d0?w=400&q=80&auto=format&fit=crop",
    bannerBg: "linear-gradient(135deg, #A8C8E8, #4A7AAF)", rankBg: "#2E5A8A", sizeBg: "#E6EEF8", sizeText: "#2E5A8A",
    kanji: "鹿", kanjiSize: 60, kanjiColor: "rgba(255,255,255,0.25)",
    Icon: Wind, iconColor: "rgba(255,255,255,0.65)",
    stats: { energy: 75, friendly: 75, train: 60, groom: 55 },
    health: [{ jp: "心臓疾患", en: "Heart Disease", level: "watch" }],
  },
  {
    jp: "カニンヘンダックスフンド", en: "Kaninchen Dachshund", kana: "カニンヘンダックスフンド", rank: 67, size: "toy", sizeJp: "超小型", sizeEn: "Toy",
    originJp: "ドイツ", originEn: "Germany", flag: "",
    groupJp: "ハウンド", groupEn: "Hound",
    temperamentJp: "勇敢・好奇心・忠実", temperamentEn: "Spunky, Curious, Loyal",
    lifeSpan: "12-16 years",
    diagnosticNoteJp: "椎間板ヘルニアの傾向を継続モニタリング。早期検知で予後を改善。",
    diagnosticNoteEn: "Continuous monitoring for ivdd supports early detection and better outcomes.",
    image: "https://images.unsplash.com/photo-1612195583950-b8fd34c87093?w=400&q=80&auto=format&fit=crop",
    bannerBg: "linear-gradient(135deg, #FFD3E0, #E8829A)", rankBg: "#C44A6A", sizeBg: "#FFE4EC", sizeText: "#C44A6A",
    kanji: "兎", kanjiSize: 60, kanjiColor: "rgba(255,255,255,0.25)",
    Icon: Wind, iconColor: "rgba(255,255,255,0.65)",
    stats: { energy: 70, friendly: 75, train: 60, groom: 50 },
    health: [{ jp: "椎間板ヘルニア", en: "IVDD", level: "concern" }],
  },
  {
    jp: "ミニチュアプードル", en: "Miniature Poodle", kana: "ミニチュアプードル", rank: 68, size: "small", sizeJp: "小型", sizeEn: "Small",
    originJp: "フランス", originEn: "France", flag: "",
    groupJp: "非スポーティング", groupEn: "Non-Sporting",
    temperamentJp: "賢い・活発・愛情深い", temperamentEn: "Smart, Active, Affectionate",
    lifeSpan: "12-15 years",
    diagnosticNoteJp: "外耳炎の傾向を継続モニタリング。早期検知で予後を改善。",
    diagnosticNoteEn: "Continuous monitoring for ear infections supports early detection and better outcomes.",
    image: "https://images.unsplash.com/photo-1586671267731-da2cf3ceeb80?w=400&q=80&auto=format&fit=crop",
    bannerBg: "linear-gradient(135deg, #FFE0B5, #E89A5A)", rankBg: "#A55A1A", sizeBg: "#FFF1E0", sizeText: "#A55A1A",
    kanji: "仏", kanjiSize: 60, kanjiColor: "rgba(255,255,255,0.25)",
    Icon: Heart, iconColor: "rgba(255,255,255,0.65)",
    stats: { energy: 75, friendly: 85, train: 95, groom: 80 },
    health: [{ jp: "外耳炎", en: "Ear Infections", level: "watch" }],
  },
  {
    jp: "スタンダードプードル", en: "Standard Poodle", kana: "スタンダードプードル", rank: 69, size: "large", sizeJp: "大型", sizeEn: "Large",
    originJp: "フランス", originEn: "France", flag: "",
    groupJp: "非スポーティング", groupEn: "Non-Sporting",
    temperamentJp: "賢い・活発・忠実", temperamentEn: "Intelligent, Active, Loyal",
    lifeSpan: "12-15 years",
    diagnosticNoteJp: "胃捻転の傾向を継続モニタリング。早期検知で予後を改善。",
    diagnosticNoteEn: "Continuous monitoring for bloat supports early detection and better outcomes.",
    image: "https://images.unsplash.com/photo-1586671267731-da2cf3ceeb80?w=400&q=80&auto=format&fit=crop",
    bannerBg: "linear-gradient(135deg, #A8C8E8, #4A7AAF)", rankBg: "#2E5A8A", sizeBg: "#E6EEF8", sizeText: "#2E5A8A",
    kanji: "仏", kanjiSize: 60, kanjiColor: "rgba(255,255,255,0.25)",
    Icon: Heart, iconColor: "rgba(255,255,255,0.65)",
    stats: { energy: 85, friendly: 85, train: 95, groom: 80 },
    health: [{ jp: "胃捻転", en: "Bloat", level: "watch" }],
  },
  {
    jp: "キャバリアキングチャールズスパニエル", en: "Cavalier King Charles Spaniel", kana: "キャバリア", rank: 70, size: "small", sizeJp: "小型", sizeEn: "Small",
    originJp: "イギリス", originEn: "UK", flag: "",
    groupJp: "トイ", groupEn: "Toy",
    temperamentJp: "優しい・愛情深い・社交的", temperamentEn: "Gentle, Affectionate, Sociable",
    lifeSpan: "12-15 years",
    diagnosticNoteJp: "僧帽弁疾患の傾向を継続モニタリング。早期検知で予後を改善。",
    diagnosticNoteEn: "Continuous monitoring for mitral valve disease supports early detection and better outcomes.",
    image: "https://images.unsplash.com/photo-1591768793355-74d04bb6608f?w=400&q=80&auto=format&fit=crop",
    bannerBg: "linear-gradient(135deg, #FFE0B5, #E89A5A)", rankBg: "#A55A1A", sizeBg: "#FFF1E0", sizeText: "#A55A1A",
    kanji: "王", kanjiSize: 60, kanjiColor: "rgba(255,255,255,0.25)",
    Icon: Crown, iconColor: "rgba(255,255,255,0.65)",
    stats: { energy: 55, friendly: 95, train: 75, groom: 75 },
    health: [{ jp: "僧帽弁疾患", en: "Mitral Valve Disease", level: "concern" }],
  },
  {
    jp: "マルプー", en: "Maltipoo", kana: "マルプー", rank: 71, size: "toy", sizeJp: "超小型", sizeEn: "Toy",
    originJp: "アメリカ", originEn: "USA", flag: "",
    groupJp: "トイ", groupEn: "Toy",
    temperamentJp: "愛情深い・遊び好き・賢い", temperamentEn: "Affectionate, Playful, Smart",
    lifeSpan: "12-15 years",
    diagnosticNoteJp: "進行性網膜萎縮の傾向を継続モニタリング。早期検知で予後を改善。",
    diagnosticNoteEn: "Continuous monitoring for progressive retinal atrophy supports early detection and better outcomes.",
    image: "https://images.unsplash.com/photo-1583337426008-2fef51aa841a?w=400&q=80&auto=format&fit=crop",
    bannerBg: "linear-gradient(135deg, #FFD3E0, #E8829A)", rankBg: "#C44A6A", sizeBg: "#FFE4EC", sizeText: "#C44A6A",
    kanji: "米", kanjiSize: 60, kanjiColor: "rgba(255,255,255,0.25)",
    Icon: Crown, iconColor: "rgba(255,255,255,0.65)",
    stats: { energy: 65, friendly: 90, train: 80, groom: 80 },
    health: [{ jp: "進行性網膜萎縮", en: "Progressive Retinal Atrophy", level: "watch" }],
  },
  {
    jp: "ゴールデンドゥードル", en: "Goldendoodle", kana: "ゴールデンドゥードル", rank: 72, size: "large", sizeJp: "大型", sizeEn: "Large",
    originJp: "アメリカ", originEn: "USA", flag: "",
    groupJp: "スポーティング", groupEn: "Sporting",
    temperamentJp: "友好的・賢い・活発", temperamentEn: "Friendly, Smart, Active",
    lifeSpan: "10-15 years",
    diagnosticNoteJp: "股関節形成不全の傾向を継続モニタリング。早期検知で予後を改善。",
    diagnosticNoteEn: "Continuous monitoring for hip dysplasia supports early detection and better outcomes.",
    image: "https://images.unsplash.com/photo-1633722715463-d30f4f325e24?w=400&q=80&auto=format&fit=crop",
    bannerBg: "linear-gradient(135deg, #A8C8E8, #4A7AAF)", rankBg: "#2E5A8A", sizeBg: "#E6EEF8", sizeText: "#2E5A8A",
    kanji: "米", kanjiSize: 60, kanjiColor: "rgba(255,255,255,0.25)",
    Icon: Sun, iconColor: "rgba(255,255,255,0.65)",
    stats: { energy: 85, friendly: 95, train: 90, groom: 70 },
    health: [{ jp: "股関節形成不全", en: "Hip Dysplasia", level: "watch" }],
  },
  {
    jp: "ラブラドゥードル", en: "Labradoodle", kana: "ラブラドゥードル", rank: 73, size: "large", sizeJp: "大型", sizeEn: "Large",
    originJp: "オーストラリア", originEn: "Australia", flag: "",
    groupJp: "スポーティング", groupEn: "Sporting",
    temperamentJp: "友好的・賢い・活発", temperamentEn: "Friendly, Smart, Active",
    lifeSpan: "12-14 years",
    diagnosticNoteJp: "股関節形成不全の傾向を継続モニタリング。早期検知で予後を改善。",
    diagnosticNoteEn: "Continuous monitoring for hip dysplasia supports early detection and better outcomes.",
    image: "https://images.unsplash.com/photo-1551717743-49959800b1f6?w=400&q=80&auto=format&fit=crop",
    bannerBg: "linear-gradient(135deg, #A8C8E8, #4A7AAF)", rankBg: "#2E5A8A", sizeBg: "#E6EEF8", sizeText: "#2E5A8A",
    kanji: "豪", kanjiSize: 60, kanjiColor: "rgba(255,255,255,0.25)",
    Icon: Sun, iconColor: "rgba(255,255,255,0.65)",
    stats: { energy: 85, friendly: 95, train: 90, groom: 70 },
    health: [{ jp: "股関節形成不全", en: "Hip Dysplasia", level: "watch" }],
  },
  {
    jp: "シュナプー", en: "Schnoodle", kana: "シュナプー", rank: 74, size: "small", sizeJp: "小型", sizeEn: "Small",
    originJp: "アメリカ", originEn: "USA", flag: "",
    groupJp: "非スポーティング", groupEn: "Non-Sporting",
    temperamentJp: "賢い・遊び好き・愛情深い", temperamentEn: "Smart, Playful, Affectionate",
    lifeSpan: "10-15 years",
    diagnosticNoteJp: "白内障の傾向を継続モニタリング。早期検知で予後を改善。",
    diagnosticNoteEn: "Continuous monitoring for cataracts supports early detection and better outcomes.",
    image: "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=400&q=80&auto=format&fit=crop",
    bannerBg: "linear-gradient(135deg, #FFE0B5, #E89A5A)", rankBg: "#A55A1A", sizeBg: "#FFF1E0", sizeText: "#A55A1A",
    kanji: "米", kanjiSize: 60, kanjiColor: "rgba(255,255,255,0.25)",
    Icon: Heart, iconColor: "rgba(255,255,255,0.65)",
    stats: { energy: 75, friendly: 85, train: 85, groom: 75 },
    health: [{ jp: "白内障", en: "Cataracts", level: "watch" }],
  },
  {
    jp: "ベルジアンマリノア", en: "Belgian Malinois", kana: "ベルジアンマリノア", rank: 75, size: "large", sizeJp: "大型", sizeEn: "Large",
    originJp: "ベルギー", originEn: "Belgium", flag: "",
    groupJp: "ハーディング", groupEn: "Herding",
    temperamentJp: "賢い・警戒・働き者", temperamentEn: "Smart, Alert, Hardworking",
    lifeSpan: "14-16 years",
    diagnosticNoteJp: "股関節形成不全の傾向を継続モニタリング。早期検知で予後を改善。",
    diagnosticNoteEn: "Continuous monitoring for hip dysplasia supports early detection and better outcomes.",
    image: "https://images.unsplash.com/photo-1589941013454-ec7d8f92b6a6?w=400&q=80&auto=format&fit=crop",
    bannerBg: "linear-gradient(135deg, #A8C8E8, #4A7AAF)", rankBg: "#2E5A8A", sizeBg: "#E6EEF8", sizeText: "#2E5A8A",
    kanji: "白", kanjiSize: 60, kanjiColor: "rgba(255,255,255,0.25)",
    Icon: Sparkles, iconColor: "rgba(255,255,255,0.65)",
    stats: { energy: 100, friendly: 70, train: 95, groom: 50 },
    health: [{ jp: "股関節形成不全", en: "Hip Dysplasia", level: "watch" }],
  },
  {
    jp: "ブラッドハウンド", en: "Bloodhound", kana: "ブラッドハウンド", rank: 76, size: "large", sizeJp: "大型", sizeEn: "Large",
    originJp: "ベルギー", originEn: "Belgium", flag: "",
    groupJp: "ハウンド", groupEn: "Hound",
    temperamentJp: "優しい・忍耐・独立心", temperamentEn: "Gentle, Patient, Independent",
    lifeSpan: "10-12 years",
    diagnosticNoteJp: "胃捻転の傾向を継続モニタリング。早期検知で予後を改善。",
    diagnosticNoteEn: "Continuous monitoring for bloat supports early detection and better outcomes.",
    image: "https://images.unsplash.com/photo-1505628346881-b72b27e84530?w=400&q=80&auto=format&fit=crop",
    bannerBg: "linear-gradient(135deg, #A8C8E8, #4A7AAF)", rankBg: "#2E5A8A", sizeBg: "#E6EEF8", sizeText: "#2E5A8A",
    kanji: "血", kanjiSize: 60, kanjiColor: "rgba(255,255,255,0.25)",
    Icon: Wind, iconColor: "rgba(255,255,255,0.65)",
    stats: { energy: 70, friendly: 80, train: 55, groom: 40 },
    health: [{ jp: "胃捻転", en: "Bloat", level: "watch" }],
  },
  {
    jp: "グレーハウンド", en: "Greyhound", kana: "グレーハウンド", rank: 77, size: "large", sizeJp: "大型", sizeEn: "Large",
    originJp: "イギリス", originEn: "UK", flag: "",
    groupJp: "ハウンド", groupEn: "Hound",
    temperamentJp: "優しい・穏やか・敏捷", temperamentEn: "Gentle, Quiet, Athletic",
    lifeSpan: "10-13 years",
    diagnosticNoteJp: "骨肉腫の傾向を継続モニタリング。早期検知で予後を改善。",
    diagnosticNoteEn: "Continuous monitoring for osteosarcoma supports early detection and better outcomes.",
    image: "https://images.unsplash.com/photo-1530041539828-114de669390e?w=400&q=80&auto=format&fit=crop",
    bannerBg: "linear-gradient(135deg, #A8C8E8, #4A7AAF)", rankBg: "#2E5A8A", sizeBg: "#E6EEF8", sizeText: "#2E5A8A",
    kanji: "速", kanjiSize: 60, kanjiColor: "rgba(255,255,255,0.25)",
    Icon: Wind, iconColor: "rgba(255,255,255,0.65)",
    stats: { energy: 80, friendly: 85, train: 70, groom: 30 },
    health: [{ jp: "骨肉腫", en: "Osteosarcoma", level: "watch" }],
  },
  {
    jp: "ウィペット", en: "Whippet", kana: "ウィペット", rank: 78, size: "medium", sizeJp: "中型", sizeEn: "Medium",
    originJp: "イギリス", originEn: "UK", flag: "",
    groupJp: "ハウンド", groupEn: "Hound",
    temperamentJp: "優しい・愛情深い・敏捷", temperamentEn: "Gentle, Affectionate, Athletic",
    lifeSpan: "12-15 years",
    diagnosticNoteJp: "心臓疾患の傾向を継続モニタリング。早期検知で予後を改善。",
    diagnosticNoteEn: "Continuous monitoring for heart disease supports early detection and better outcomes.",
    image: "https://images.unsplash.com/photo-1530041539828-114de669390e?w=400&q=80&auto=format&fit=crop",
    bannerBg: "linear-gradient(135deg, #B5E0C8, #5AAF7A)", rankBg: "#2E7D4A", sizeBg: "#E6F5EC", sizeText: "#2E7D4A",
    kanji: "風", kanjiSize: 60, kanjiColor: "rgba(255,255,255,0.25)",
    Icon: Wind, iconColor: "rgba(255,255,255,0.65)",
    stats: { energy: 80, friendly: 85, train: 75, groom: 30 },
    health: [{ jp: "心臓疾患", en: "Heart Disease", level: "watch" }],
  },
  {
    jp: "ヴィズラ", en: "Vizsla", kana: "ヴィズラ", rank: 79, size: "medium", sizeJp: "中型", sizeEn: "Medium",
    originJp: "ハンガリー", originEn: "Hungary", flag: "",
    groupJp: "スポーティング", groupEn: "Sporting",
    temperamentJp: "愛情深い・活発・賢い", temperamentEn: "Affectionate, Energetic, Smart",
    lifeSpan: "12-15 years",
    diagnosticNoteJp: "てんかんの傾向を継続モニタリング。早期検知で予後を改善。",
    diagnosticNoteEn: "Continuous monitoring for epilepsy supports early detection and better outcomes.",
    image: "https://images.unsplash.com/photo-1568572933382-74d440642117?w=400&q=80&auto=format&fit=crop",
    bannerBg: "linear-gradient(135deg, #B5E0C8, #5AAF7A)", rankBg: "#2E7D4A", sizeBg: "#E6F5EC", sizeText: "#2E7D4A",
    kanji: "匈", kanjiSize: 60, kanjiColor: "rgba(255,255,255,0.25)",
    Icon: Sun, iconColor: "rgba(255,255,255,0.65)",
    stats: { energy: 95, friendly: 90, train: 85, groom: 40 },
    health: [{ jp: "てんかん", en: "Epilepsy", level: "watch" }],
  },
  {
    jp: "ブリタニー", en: "Brittany", kana: "ブリタニー", rank: 80, size: "medium", sizeJp: "中型", sizeEn: "Medium",
    originJp: "フランス", originEn: "France", flag: "",
    groupJp: "スポーティング", groupEn: "Sporting",
    temperamentJp: "活発・友好的・賢い", temperamentEn: "Energetic, Friendly, Smart",
    lifeSpan: "12-14 years",
    diagnosticNoteJp: "股関節形成不全の傾向を継続モニタリング。早期検知で予後を改善。",
    diagnosticNoteEn: "Continuous monitoring for hip dysplasia supports early detection and better outcomes.",
    image: "https://images.unsplash.com/photo-1568572933382-74d440642117?w=400&q=80&auto=format&fit=crop",
    bannerBg: "linear-gradient(135deg, #B5E0C8, #5AAF7A)", rankBg: "#2E7D4A", sizeBg: "#E6F5EC", sizeText: "#2E7D4A",
    kanji: "仏", kanjiSize: 60, kanjiColor: "rgba(255,255,255,0.25)",
    Icon: Sun, iconColor: "rgba(255,255,255,0.65)",
    stats: { energy: 90, friendly: 90, train: 85, groom: 55 },
    health: [{ jp: "股関節形成不全", en: "Hip Dysplasia", level: "watch" }],
  },
  {
    jp: "フラットコーテッドレトリバー", en: "Flat-Coated Retriever", kana: "フラットコーテッドレトリバー", rank: 81, size: "large", sizeJp: "大型", sizeEn: "Large",
    originJp: "イギリス", originEn: "UK", flag: "",
    groupJp: "スポーティング", groupEn: "Sporting",
    temperamentJp: "陽気・友好的・賢い", temperamentEn: "Cheerful, Friendly, Smart",
    lifeSpan: "8-10 years",
    diagnosticNoteJp: "がんリスクの傾向を継続モニタリング。早期検知で予後を改善。",
    diagnosticNoteEn: "Continuous monitoring for cancer risk supports early detection and better outcomes.",
    image: "https://images.unsplash.com/photo-1633722715463-d30f4f325e24?w=400&q=80&auto=format&fit=crop",
    bannerBg: "linear-gradient(135deg, #A8C8E8, #4A7AAF)", rankBg: "#2E5A8A", sizeBg: "#E6EEF8", sizeText: "#2E5A8A",
    kanji: "英", kanjiSize: 60, kanjiColor: "rgba(255,255,255,0.25)",
    Icon: Sun, iconColor: "rgba(255,255,255,0.65)",
    stats: { energy: 90, friendly: 95, train: 85, groom: 60 },
    health: [{ jp: "がんリスク", en: "Cancer Risk", level: "concern" }],
  },
  {
    jp: "チェサピークベイレトリバー", en: "Chesapeake Bay Retriever", kana: "チェサピークベイレトリバー", rank: 82, size: "large", sizeJp: "大型", sizeEn: "Large",
    originJp: "アメリカ", originEn: "USA", flag: "",
    groupJp: "スポーティング", groupEn: "Sporting",
    temperamentJp: "賢い・忠実・活発", temperamentEn: "Smart, Loyal, Active",
    lifeSpan: "10-13 years",
    diagnosticNoteJp: "股関節形成不全の傾向を継続モニタリング。早期検知で予後を改善。",
    diagnosticNoteEn: "Continuous monitoring for hip dysplasia supports early detection and better outcomes.",
    image: "https://images.unsplash.com/photo-1551717743-49959800b1f6?w=400&q=80&auto=format&fit=crop",
    bannerBg: "linear-gradient(135deg, #A8C8E8, #4A7AAF)", rankBg: "#2E5A8A", sizeBg: "#E6EEF8", sizeText: "#2E5A8A",
    kanji: "湾", kanjiSize: 60, kanjiColor: "rgba(255,255,255,0.25)",
    Icon: Sun, iconColor: "rgba(255,255,255,0.65)",
    stats: { energy: 90, friendly: 75, train: 85, groom: 55 },
    health: [{ jp: "股関節形成不全", en: "Hip Dysplasia", level: "watch" }],
  },
  {
    jp: "ノバスコシアダックトーリングレトリバー", en: "Nova Scotia Duck Tolling Retriever", kana: "トーリング", rank: 83, size: "medium", sizeJp: "中型", sizeEn: "Medium",
    originJp: "カナダ", originEn: "Canada", flag: "",
    groupJp: "スポーティング", groupEn: "Sporting",
    temperamentJp: "活発・賢い・友好的", temperamentEn: "Energetic, Smart, Friendly",
    lifeSpan: "12-14 years",
    diagnosticNoteJp: "自己免疫疾患の傾向を継続モニタリング。早期検知で予後を改善。",
    diagnosticNoteEn: "Continuous monitoring for autoimmune conditions supports early detection and better outcomes.",
    image: "https://images.unsplash.com/photo-1551717743-49959800b1f6?w=400&q=80&auto=format&fit=crop",
    bannerBg: "linear-gradient(135deg, #B5E0C8, #5AAF7A)", rankBg: "#2E7D4A", sizeBg: "#E6F5EC", sizeText: "#2E7D4A",
    kanji: "加", kanjiSize: 60, kanjiColor: "rgba(255,255,255,0.25)",
    Icon: Sun, iconColor: "rgba(255,255,255,0.65)",
    stats: { energy: 95, friendly: 85, train: 90, groom: 65 },
    health: [{ jp: "自己免疫疾患", en: "Autoimmune Conditions", level: "watch" }],
  },
  {
    jp: "チャイニーズクレステッド", en: "Chinese Crested", kana: "チャイニーズクレステッド", rank: 84, size: "toy", sizeJp: "超小型", sizeEn: "Toy",
    originJp: "中国", originEn: "China", flag: "",
    groupJp: "トイ", groupEn: "Toy",
    temperamentJp: "愛情深い・遊び好き・敏感", temperamentEn: "Affectionate, Playful, Sensitive",
    lifeSpan: "13-18 years",
    diagnosticNoteJp: "皮膚疾患の傾向を継続モニタリング。早期検知で予後を改善。",
    diagnosticNoteEn: "Continuous monitoring for skin issues supports early detection and better outcomes.",
    image: "https://images.unsplash.com/photo-1583511655826-05700d52f4d9?w=400&q=80&auto=format&fit=crop",
    bannerBg: "linear-gradient(135deg, #FFD3E0, #E8829A)", rankBg: "#C44A6A", sizeBg: "#FFE4EC", sizeText: "#C44A6A",
    kanji: "華", kanjiSize: 60, kanjiColor: "rgba(255,255,255,0.25)",
    Icon: Crown, iconColor: "rgba(255,255,255,0.65)",
    stats: { energy: 60, friendly: 80, train: 70, groom: 40 },
    health: [{ jp: "皮膚疾患", en: "Skin Issues", level: "watch" }],
  },
  {
    jp: "ショロイツクインクレ", en: "Xoloitzcuintli", kana: "ショロイツクインクレ", rank: 85, size: "medium", sizeJp: "中型", sizeEn: "Medium",
    originJp: "メキシコ", originEn: "Mexico", flag: "",
    groupJp: "非スポーティング", groupEn: "Non-Sporting",
    temperamentJp: "穏やか・忠実・賢い", temperamentEn: "Calm, Loyal, Smart",
    lifeSpan: "13-18 years",
    diagnosticNoteJp: "皮膚疾患の傾向を継続モニタリング。早期検知で予後を改善。",
    diagnosticNoteEn: "Continuous monitoring for skin issues supports early detection and better outcomes.",
    image: "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400&q=80&auto=format&fit=crop",
    bannerBg: "linear-gradient(135deg, #B5E0C8, #5AAF7A)", rankBg: "#2E7D4A", sizeBg: "#E6F5EC", sizeText: "#2E7D4A",
    kanji: "墨", kanjiSize: 60, kanjiColor: "rgba(255,255,255,0.25)",
    Icon: Heart, iconColor: "rgba(255,255,255,0.65)",
    stats: { energy: 75, friendly: 70, train: 75, groom: 30 },
    health: [{ jp: "皮膚疾患", en: "Skin Issues", level: "watch" }],
  },
  {
    jp: "アザワク", en: "Azawakh", kana: "アザワク", rank: 86, size: "large", sizeJp: "大型", sizeEn: "Large",
    originJp: "マリ", originEn: "Mali", flag: "",
    groupJp: "ハウンド", groupEn: "Hound",
    temperamentJp: "独立心・敏感・優しい", temperamentEn: "Independent, Aloof, Gentle",
    lifeSpan: "12-15 years",
    diagnosticNoteJp: "てんかんの傾向を継続モニタリング。早期検知で予後を改善。",
    diagnosticNoteEn: "Continuous monitoring for epilepsy supports early detection and better outcomes.",
    image: "https://images.unsplash.com/photo-1530041539828-114de669390e?w=400&q=80&auto=format&fit=crop",
    bannerBg: "linear-gradient(135deg, #A8C8E8, #4A7AAF)", rankBg: "#2E5A8A", sizeBg: "#E6EEF8", sizeText: "#2E5A8A",
    kanji: "沙", kanjiSize: 60, kanjiColor: "rgba(255,255,255,0.25)",
    Icon: Wind, iconColor: "rgba(255,255,255,0.65)",
    stats: { energy: 85, friendly: 55, train: 65, groom: 30 },
    health: [{ jp: "てんかん", en: "Epilepsy", level: "watch" }],
  },
  {
    jp: "カタランシープドッグ", en: "Catalan Sheepdog", kana: "カタランシープドッグ", rank: 87, size: "medium", sizeJp: "中型", sizeEn: "Medium",
    originJp: "スペイン", originEn: "Spain", flag: "",
    groupJp: "ハーディング", groupEn: "Herding",
    temperamentJp: "賢い・忠実・活発", temperamentEn: "Smart, Loyal, Active",
    lifeSpan: "12-14 years",
    diagnosticNoteJp: "股関節形成不全の傾向を継続モニタリング。早期検知で予後を改善。",
    diagnosticNoteEn: "Continuous monitoring for hip dysplasia supports early detection and better outcomes.",
    image: "https://images.unsplash.com/photo-1503256207526-0d5d80fa2f47?w=400&q=80&auto=format&fit=crop",
    bannerBg: "linear-gradient(135deg, #B5E0C8, #5AAF7A)", rankBg: "#2E7D4A", sizeBg: "#E6F5EC", sizeText: "#2E7D4A",
    kanji: "西", kanjiSize: 60, kanjiColor: "rgba(255,255,255,0.25)",
    Icon: Sparkles, iconColor: "rgba(255,255,255,0.65)",
    stats: { energy: 85, friendly: 80, train: 85, groom: 75 },
    health: [{ jp: "股関節形成不全", en: "Hip Dysplasia", level: "watch" }],
  },
  {
    jp: "ムーディ", en: "Mudi", kana: "ムーディ", rank: 88, size: "medium", sizeJp: "中型", sizeEn: "Medium",
    originJp: "ハンガリー", originEn: "Hungary", flag: "",
    groupJp: "ハーディング", groupEn: "Herding",
    temperamentJp: "賢い・活発・働き者", temperamentEn: "Smart, Active, Hardworking",
    lifeSpan: "12-14 years",
    diagnosticNoteJp: "股関節形成不全の傾向を継続モニタリング。早期検知で予後を改善。",
    diagnosticNoteEn: "Continuous monitoring for hip dysplasia supports early detection and better outcomes.",
    image: "https://images.unsplash.com/photo-1503256207526-0d5d80fa2f47?w=400&q=80&auto=format&fit=crop",
    bannerBg: "linear-gradient(135deg, #B5E0C8, #5AAF7A)", rankBg: "#2E7D4A", sizeBg: "#E6F5EC", sizeText: "#2E7D4A",
    kanji: "匈", kanjiSize: 60, kanjiColor: "rgba(255,255,255,0.25)",
    Icon: Sparkles, iconColor: "rgba(255,255,255,0.65)",
    stats: { energy: 95, friendly: 80, train: 90, groom: 55 },
    health: [{ jp: "股関節形成不全", en: "Hip Dysplasia", level: "watch" }],
  },
  {
    jp: "ラゴットロマニョーロ", en: "Lagotto Romagnolo", kana: "ラゴット", rank: 89, size: "medium", sizeJp: "中型", sizeEn: "Medium",
    originJp: "イタリア", originEn: "Italy", flag: "",
    groupJp: "スポーティング", groupEn: "Sporting",
    temperamentJp: "賢い・愛情深い・働き者", temperamentEn: "Smart, Affectionate, Hardworking",
    lifeSpan: "14-17 years",
    diagnosticNoteJp: "てんかんの傾向を継続モニタリング。早期検知で予後を改善。",
    diagnosticNoteEn: "Continuous monitoring for epilepsy supports early detection and better outcomes.",
    image: "https://images.unsplash.com/photo-1574158622682-e40e69881006?w=400&q=80&auto=format&fit=crop",
    bannerBg: "linear-gradient(135deg, #B5E0C8, #5AAF7A)", rankBg: "#2E7D4A", sizeBg: "#E6F5EC", sizeText: "#2E7D4A",
    kanji: "伊", kanjiSize: 60, kanjiColor: "rgba(255,255,255,0.25)",
    Icon: Sun, iconColor: "rgba(255,255,255,0.65)",
    stats: { energy: 80, friendly: 85, train: 90, groom: 80 },
    health: [{ jp: "てんかん", en: "Epilepsy", level: "watch" }],
  },
  {
    jp: "バーベット", en: "Barbet", kana: "バーベット", rank: 90, size: "medium", sizeJp: "中型", sizeEn: "Medium",
    originJp: "フランス", originEn: "France", flag: "",
    groupJp: "スポーティング", groupEn: "Sporting",
    temperamentJp: "愛情深い・賢い・友好的", temperamentEn: "Affectionate, Smart, Friendly",
    lifeSpan: "13-15 years",
    diagnosticNoteJp: "股関節形成不全の傾向を継続モニタリング。早期検知で予後を改善。",
    diagnosticNoteEn: "Continuous monitoring for hip dysplasia supports early detection and better outcomes.",
    image: "https://images.unsplash.com/photo-1574158622682-e40e69881006?w=400&q=80&auto=format&fit=crop",
    bannerBg: "linear-gradient(135deg, #B5E0C8, #5AAF7A)", rankBg: "#2E7D4A", sizeBg: "#E6F5EC", sizeText: "#2E7D4A",
    kanji: "仏", kanjiSize: 60, kanjiColor: "rgba(255,255,255,0.25)",
    Icon: Sun, iconColor: "rgba(255,255,255,0.65)",
    stats: { energy: 80, friendly: 90, train: 85, groom: 80 },
    health: [{ jp: "股関節形成不全", en: "Hip Dysplasia", level: "watch" }],
  },
  {
    jp: "ノルウェジアンルンデフンド", en: "Norwegian Lundehund", kana: "ルンデフンド", rank: 91, size: "small", sizeJp: "小型", sizeEn: "Small",
    originJp: "ノルウェー", originEn: "Norway", flag: "",
    groupJp: "非スポーティング", groupEn: "Non-Sporting",
    temperamentJp: "活発・警戒・忠実", temperamentEn: "Energetic, Alert, Loyal",
    lifeSpan: "12-14 years",
    diagnosticNoteJp: "消化器疾患の傾向を継続モニタリング。早期検知で予後を改善。",
    diagnosticNoteEn: "Continuous monitoring for digestive issues supports early detection and better outcomes.",
    image: "https://images.unsplash.com/photo-1568393691080-fcd87bd66f72?w=400&q=80&auto=format&fit=crop",
    bannerBg: "linear-gradient(135deg, #FFE0B5, #E89A5A)", rankBg: "#A55A1A", sizeBg: "#FFF1E0", sizeText: "#A55A1A",
    kanji: "北", kanjiSize: 60, kanjiColor: "rgba(255,255,255,0.25)",
    Icon: Heart, iconColor: "rgba(255,255,255,0.65)",
    stats: { energy: 80, friendly: 70, train: 60, groom: 55 },
    health: [{ jp: "消化器疾患", en: "Digestive Issues", level: "concern" }],
  },
  {
    jp: "ポーリッシュローランドシープドッグ", en: "Polish Lowland Sheepdog", kana: "ポーリッシュ", rank: 92, size: "medium", sizeJp: "中型", sizeEn: "Medium",
    originJp: "ポーランド", originEn: "Poland", flag: "",
    groupJp: "ハーディング", groupEn: "Herding",
    temperamentJp: "賢い・忠実・自信家", temperamentEn: "Smart, Loyal, Confident",
    lifeSpan: "12-15 years",
    diagnosticNoteJp: "股関節形成不全の傾向を継続モニタリング。早期検知で予後を改善。",
    diagnosticNoteEn: "Continuous monitoring for hip dysplasia supports early detection and better outcomes.",
    image: "https://images.unsplash.com/photo-1503256207526-0d5d80fa2f47?w=400&q=80&auto=format&fit=crop",
    bannerBg: "linear-gradient(135deg, #B5E0C8, #5AAF7A)", rankBg: "#2E7D4A", sizeBg: "#E6F5EC", sizeText: "#2E7D4A",
    kanji: "波", kanjiSize: 60, kanjiColor: "rgba(255,255,255,0.25)",
    Icon: Sparkles, iconColor: "rgba(255,255,255,0.65)",
    stats: { energy: 85, friendly: 80, train: 85, groom: 80 },
    health: [{ jp: "股関節形成不全", en: "Hip Dysplasia", level: "watch" }],
  },
  {
    jp: "スロバキアンラフハウンド", en: "Slovakian Rough Haired Pointer", kana: "スロバキアン", rank: 93, size: "medium", sizeJp: "中型", sizeEn: "Medium",
    originJp: "スロバキア", originEn: "Slovakia", flag: "",
    groupJp: "スポーティング", groupEn: "Sporting",
    temperamentJp: "賢い・活発・忠実", temperamentEn: "Smart, Active, Loyal",
    lifeSpan: "12-14 years",
    diagnosticNoteJp: "股関節形成不全の傾向を継続モニタリング。早期検知で予後を改善。",
    diagnosticNoteEn: "Continuous monitoring for hip dysplasia supports early detection and better outcomes.",
    image: "https://images.unsplash.com/photo-1551717743-49959800b1f6?w=400&q=80&auto=format&fit=crop",
    bannerBg: "linear-gradient(135deg, #B5E0C8, #5AAF7A)", rankBg: "#2E7D4A", sizeBg: "#E6F5EC", sizeText: "#2E7D4A",
    kanji: "斯", kanjiSize: 60, kanjiColor: "rgba(255,255,255,0.25)",
    Icon: Sun, iconColor: "rgba(255,255,255,0.65)",
    stats: { energy: 90, friendly: 80, train: 85, groom: 65 },
    health: [{ jp: "股関節形成不全", en: "Hip Dysplasia", level: "watch" }],
  },
  {
    jp: "アメリカンエスキモードッグ", en: "American Eskimo Dog", kana: "アメリカンエスキモー", rank: 94, size: "small", sizeJp: "小型", sizeEn: "Small",
    originJp: "アメリカ", originEn: "USA", flag: "",
    groupJp: "非スポーティング", groupEn: "Non-Sporting",
    temperamentJp: "賢い・活発・愛情深い", temperamentEn: "Smart, Active, Affectionate",
    lifeSpan: "13-15 years",
    diagnosticNoteJp: "進行性網膜萎縮の傾向を継続モニタリング。早期検知で予後を改善。",
    diagnosticNoteEn: "Continuous monitoring for progressive retinal atrophy supports early detection and better outcomes.",
    image: "https://images.unsplash.com/photo-1610041321420-a596dd14b0a8?w=400&q=80&auto=format&fit=crop",
    bannerBg: "linear-gradient(135deg, #FFE0B5, #E89A5A)", rankBg: "#A55A1A", sizeBg: "#FFF1E0", sizeText: "#A55A1A",
    kanji: "米", kanjiSize: 60, kanjiColor: "rgba(255,255,255,0.25)",
    Icon: Heart, iconColor: "rgba(255,255,255,0.65)",
    stats: { energy: 75, friendly: 80, train: 90, groom: 80 },
    health: [{ jp: "進行性網膜萎縮", en: "Progressive Retinal Atrophy", level: "watch" }],
  },
  {
    jp: "フィニッシュスピッツ", en: "Finnish Spitz", kana: "フィニッシュスピッツ", rank: 95, size: "medium", sizeJp: "中型", sizeEn: "Medium",
    originJp: "フィンランド", originEn: "Finland", flag: "",
    groupJp: "非スポーティング", groupEn: "Non-Sporting",
    temperamentJp: "活発・賢い・忠実", temperamentEn: "Lively, Smart, Loyal",
    lifeSpan: "13-15 years",
    diagnosticNoteJp: "股関節形成不全の傾向を継続モニタリング。早期検知で予後を改善。",
    diagnosticNoteEn: "Continuous monitoring for hip dysplasia supports early detection and better outcomes.",
    image: "https://images.unsplash.com/photo-1610041321420-a596dd14b0a8?w=400&q=80&auto=format&fit=crop",
    bannerBg: "linear-gradient(135deg, #B5E0C8, #5AAF7A)", rankBg: "#2E7D4A", sizeBg: "#E6F5EC", sizeText: "#2E7D4A",
    kanji: "芬", kanjiSize: 60, kanjiColor: "rgba(255,255,255,0.25)",
    Icon: Heart, iconColor: "rgba(255,255,255,0.65)",
    stats: { energy: 85, friendly: 75, train: 75, groom: 70 },
    health: [{ jp: "股関節形成不全", en: "Hip Dysplasia", level: "watch" }],
  },
  {
    jp: "ノルウェジアンエルクハウンド", en: "Norwegian Elkhound", kana: "エルクハウンド", rank: 96, size: "medium", sizeJp: "中型", sizeEn: "Medium",
    originJp: "ノルウェー", originEn: "Norway", flag: "",
    groupJp: "ハウンド", groupEn: "Hound",
    temperamentJp: "勇敢・忠実・友好的", temperamentEn: "Brave, Loyal, Friendly",
    lifeSpan: "12-15 years",
    diagnosticNoteJp: "進行性網膜萎縮の傾向を継続モニタリング。早期検知で予後を改善。",
    diagnosticNoteEn: "Continuous monitoring for progressive retinal atrophy supports early detection and better outcomes.",
    image: "https://images.unsplash.com/photo-1610041321420-a596dd14b0a8?w=400&q=80&auto=format&fit=crop",
    bannerBg: "linear-gradient(135deg, #B5E0C8, #5AAF7A)", rankBg: "#2E7D4A", sizeBg: "#E6F5EC", sizeText: "#2E7D4A",
    kanji: "北", kanjiSize: 60, kanjiColor: "rgba(255,255,255,0.25)",
    Icon: Wind, iconColor: "rgba(255,255,255,0.65)",
    stats: { energy: 85, friendly: 80, train: 75, groom: 65 },
    health: [{ jp: "進行性網膜萎縮", en: "Progressive Retinal Atrophy", level: "watch" }],
  },
  {
    jp: "アイスランディックシープドッグ", en: "Icelandic Sheepdog", kana: "アイスランディック", rank: 97, size: "medium", sizeJp: "中型", sizeEn: "Medium",
    originJp: "アイスランド", originEn: "Iceland", flag: "",
    groupJp: "ハーディング", groupEn: "Herding",
    temperamentJp: "友好的・活発・賢い", temperamentEn: "Friendly, Lively, Smart",
    lifeSpan: "12-14 years",
    diagnosticNoteJp: "股関節形成不全の傾向を継続モニタリング。早期検知で予後を改善。",
    diagnosticNoteEn: "Continuous monitoring for hip dysplasia supports early detection and better outcomes.",
    image: "https://images.unsplash.com/photo-1503256207526-0d5d80fa2f47?w=400&q=80&auto=format&fit=crop",
    bannerBg: "linear-gradient(135deg, #B5E0C8, #5AAF7A)", rankBg: "#2E7D4A", sizeBg: "#E6F5EC", sizeText: "#2E7D4A",
    kanji: "氷", kanjiSize: 60, kanjiColor: "rgba(255,255,255,0.25)",
    Icon: Sparkles, iconColor: "rgba(255,255,255,0.65)",
    stats: { energy: 85, friendly: 90, train: 85, groom: 75 },
    health: [{ jp: "股関節形成不全", en: "Hip Dysplasia", level: "watch" }],
  },
  {
    jp: "レオンベルガー", en: "Leonberger", kana: "レオンベルガー", rank: 98, size: "large", sizeJp: "大型", sizeEn: "Large",
    originJp: "ドイツ", originEn: "Germany", flag: "",
    groupJp: "ワーキング", groupEn: "Working",
    temperamentJp: "優しい・忠実・賢い", temperamentEn: "Gentle, Loyal, Smart",
    lifeSpan: "8-9 years",
    diagnosticNoteJp: "骨肉腫の傾向を継続モニタリング。早期検知で予後を改善。",
    diagnosticNoteEn: "Continuous monitoring for osteosarcoma supports early detection and better outcomes.",
    image: "https://images.unsplash.com/photo-1610041321420-a596dd14b0a8?w=400&q=80&auto=format&fit=crop",
    bannerBg: "linear-gradient(135deg, #A8C8E8, #4A7AAF)", rankBg: "#2E5A8A", sizeBg: "#E6EEF8", sizeText: "#2E5A8A",
    kanji: "獅", kanjiSize: 60, kanjiColor: "rgba(255,255,255,0.25)",
    Icon: Zap, iconColor: "rgba(255,255,255,0.65)",
    stats: { energy: 70, friendly: 90, train: 80, groom: 75 },
    health: [{ jp: "骨肉腫", en: "Osteosarcoma", level: "concern" }],
  },
  {
    jp: "パグ", en: "Pug", kana: "パグ", rank: 99, size: "small", sizeJp: "小型", sizeEn: "Small",
    originJp: "中国", originEn: "China", flag: "",
    groupJp: "トイ", groupEn: "Toy",
    temperamentJp: "愛情深い・遊び好き・穏やか", temperamentEn: "Affectionate, Playful, Even-tempered",
    lifeSpan: "12-15 years",
    diagnosticNoteJp: "短頭種症候群の傾向を継続モニタリング。早期検知で予後を改善。",
    diagnosticNoteEn: "Continuous monitoring for brachycephalic syndrome supports early detection and better outcomes.",
    image: "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=400&q=80&auto=format&fit=crop",
    bannerBg: "linear-gradient(135deg, #FFE0B5, #E89A5A)", rankBg: "#A55A1A", sizeBg: "#FFF1E0", sizeText: "#A55A1A",
    kanji: "巴", kanjiSize: 60, kanjiColor: "rgba(255,255,255,0.25)",
    Icon: Heart, iconColor: "rgba(255,255,255,0.65)",
    stats: { energy: 45, friendly: 90, train: 60, groom: 50 },
    health: [{ jp: "短頭種症候群", en: "Brachycephalic Syndrome", level: "concern" }],
  },
  {
    jp: "ボストンテリア", en: "Boston Terrier", kana: "ボストンテリア", rank: 100, size: "small", sizeJp: "小型", sizeEn: "Small",
    originJp: "アメリカ", originEn: "USA", flag: "",
    groupJp: "非スポーティング", groupEn: "Non-Sporting",
    temperamentJp: "友好的・賢い・活発", temperamentEn: "Friendly, Smart, Lively",
    lifeSpan: "11-13 years",
    diagnosticNoteJp: "短頭種症候群の傾向を継続モニタリング。早期検知で予後を改善。",
    diagnosticNoteEn: "Continuous monitoring for brachycephalic syndrome supports early detection and better outcomes.",
    image: "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=400&q=80&auto=format&fit=crop",
    bannerBg: "linear-gradient(135deg, #FFE0B5, #E89A5A)", rankBg: "#A55A1A", sizeBg: "#FFF1E0", sizeText: "#A55A1A",
    kanji: "波", kanjiSize: 60, kanjiColor: "rgba(255,255,255,0.25)",
    Icon: Heart, iconColor: "rgba(255,255,255,0.65)",
    stats: { energy: 70, friendly: 90, train: 80, groom: 55 },
    health: [{ jp: "短頭種症候群", en: "Brachycephalic Syndrome", level: "concern" }],
  },
  {
    jp: "オーストラリアンキャトルドッグ", en: "Australian Cattle Dog", kana: "オーストラリアンキャトルドッグ", rank: 101, size: "medium", sizeJp: "中型", sizeEn: "Medium",
    originJp: "オーストラリア", originEn: "Australia", flag: "",
    groupJp: "ハーディング", groupEn: "Herding",
    temperamentJp: "賢い・警戒・忠実", temperamentEn: "Smart, Alert, Loyal",
    lifeSpan: "12-16 years",
    diagnosticNoteJp: "進行性網膜萎縮の傾向を継続モニタリング。早期検知で予後を改善。",
    diagnosticNoteEn: "Continuous monitoring for progressive retinal atrophy supports early detection and better outcomes.",
    image: "https://images.unsplash.com/photo-1503256207526-0d5d80fa2f47?w=400&q=80&auto=format&fit=crop",
    bannerBg: "linear-gradient(135deg, #B5E0C8, #5AAF7A)", rankBg: "#2E7D4A", sizeBg: "#E6F5EC", sizeText: "#2E7D4A",
    kanji: "牛", kanjiSize: 60, kanjiColor: "rgba(255,255,255,0.25)",
    Icon: Sparkles, iconColor: "rgba(255,255,255,0.65)",
    stats: { energy: 100, friendly: 70, train: 90, groom: 50 },
    health: [{ jp: "進行性網膜萎縮", en: "Progressive Retinal Atrophy", level: "watch" }],
  },
];

/* ─────────────────────────────────────── Breed Image (with fallback) ─────────────────────────────────────── */

function useBreedImage(en: string) {
  const initial = typeof window !== "undefined" ? getCachedImage(en) : null;
  const [url, setUrl] = useState<string | null>(initial);
  const [loading, setLoading] = useState<boolean>(!initial && hasBreedSlug(en));

  const load = useCallback(
    async (skipCache = false) => {
      if (!hasBreedSlug(en)) {
        setUrl(null);
        setLoading(false);
        return;
      }
      if (!skipCache) {
        const c = getCachedImage(en);
        if (c) {
          setUrl(c);
          setLoading(false);
          return;
        }
      }
      setLoading(true);
      const u = await fetchBreedImage(en);
      setUrl(u);
      setCachedImage(en, u);
      setLoading(false);
    },
    [en],
  );

  useEffect(() => {
    void load();
  }, [load]);

  return { url, loading, refresh: () => void load(true) };
}

function BreedImage({
  breed, style, children, overlay = "linear-gradient(to bottom, rgba(0,0,0,0.10), rgba(0,0,0,0.45))",
  srcOverride, loading: loadingOverride,
}: {
  breed: Breed; style?: CSSProperties; children?: ReactNode; overlay?: string | false;
  srcOverride?: string | null; loading?: boolean;
}) {
  const [failed, setFailed] = useState(false);
  const src = srcOverride ?? breed.image ?? null;
  const showImage = !!src && !failed;
  return (
    <div style={{ position: "absolute", inset: 0, ...style }}>
      {/* Fallback layer: gradient + kanji (always present underneath) */}
      <div style={{
        position: "absolute", inset: 0,
        background: breed.bannerBg,
        backgroundSize: breed.animateGradient ? "300% 300%" : undefined,
        animation: breed.animateGradient ? "breedGradientShift 6s ease infinite" : undefined,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: breed.kanjiSize, fontFamily: "var(--font-heading)", fontWeight: 600, color: breed.kanjiColor,
        letterSpacing: "-0.02em", lineHeight: 1, userSelect: "none",
      }}>
        {!showImage && breed.kanji}
      </div>
      {showImage && (
        <img
          src={src}
          alt={breed.en}
          loading="lazy"
          onError={() => setFailed(true)}
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", display: "block" }}
        />
      )}
      {showImage && overlay && (
        <div style={{ position: "absolute", inset: 0, background: overlay, pointerEvents: "none" }} />
      )}
      {loadingOverride && (
        <div style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(110deg, rgba(255,228,236,0.6) 25%, rgba(255,245,248,0.9) 50%, rgba(255,228,236,0.6) 75%)",
          backgroundSize: "200% 100%",
          animation: "breedSkeletonShimmer 1.4s ease-in-out infinite",
          pointerEvents: "none",
        }} />
      )}
      {children}
    </div>
  );
}

/* ─────────────────────────────────────── Filter Chips ─────────────────────────────────────── */

type FilterKey = "all" | "toy" | "small" | "large" | "various" | "popular";
const FILTERS: { key: FilterKey; jp: string; en: string }[] = [
  { key: "all", jp: "すべて", en: "All" },
  { key: "toy", jp: "超小型", en: "Toy" },
  { key: "small", jp: "小型", en: "Small" },
  { key: "large", jp: "大型", en: "Large" },
  { key: "various", jp: "ミックス", en: "Mixed" },
  { key: "popular", jp: "人気順", en: "Popular" },
];

/* ─────────────────────────────────────── Page ─────────────────────────────────────── */

function Breeds() {
  const t = useT();
  const { language } = useLanguage();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<FilterKey>("all");
  const [openBreed, setOpenBreed] = useState<Breed | null>(null);
  const [focused, setFocused] = useState(false);

  const fuse = useMemo(
    () =>
      new Fuse(BREEDS, {
        threshold: 0.4,
        keys: [
          { name: "name_jp", getFn: (b) => b.jp },
          { name: "name_en", getFn: (b) => b.en },
          { name: "name_kana", getFn: (b) => b.kana },
          { name: "country_jp", getFn: (b) => b.originJp },
          { name: "country_en", getFn: (b) => b.originEn },
          { name: "size_jp", getFn: (b) => b.sizeJp },
          { name: "size_en", getFn: (b) => b.sizeEn },
          { name: "group_jp", getFn: (b) => b.groupJp },
          { name: "group_en", getFn: (b) => b.groupEn },
          { name: "temperament_jp", getFn: (b) => b.temperamentJp },
          { name: "temperament_en", getFn: (b) => b.temperamentEn },
          { name: "lifespan", getFn: (b) => b.lifeSpan },
          { name: "diagnostic_jp", getFn: (b) => b.diagnosticNoteJp },
          { name: "diagnostic_en", getFn: (b) => b.diagnosticNoteEn },
        ],
        includeScore: true,
        includeMatches: true,
        minMatchCharLength: 1,
        ignoreLocation: true,
      }),
    []
  );

  const q = query.trim();
  const hasQuery = q.length > 0;

  const { filtered, matchesByKey } = useMemo(() => {
    let list: Breed[] = BREEDS;
    const matches = new Map<string, readonly FuseResultMatch[]>();
    if (hasQuery) {
      const ql = q.toLowerCase();
      // 1) Prefix matches scoped to NAME fields (jp / en / kana) so partial
      //    phrases like "Shi" instantly float Shih Tzu / Shiba Inu to the top.
      const prefixFields = (b: Breed) => [b.jp, b.en, b.kana];
      const prefixHits: Breed[] = [];
      const prefixSet = new Set<string>();
      for (const b of BREEDS) {
        if (prefixFields(b).some((v) => v && v.toLowerCase().startsWith(ql))) {
          prefixHits.push(b);
          prefixSet.add(b.en);
        }
      }
      // 2) Fallback: out-of-order multi-word fuzzy match via Fuse.
      const tokens = ql.split(/\s+/).filter(Boolean);
      const fieldNames = [
        "name_jp", "name_en", "name_kana",
        "country_jp", "country_en", "size_jp", "size_en",
        "group_jp", "group_en", "temperament_jp", "temperament_en",
        "lifespan", "diagnostic_jp", "diagnostic_en",
      ] as const;
      const fuzzyResults =
        tokens.length > 1
          ? fuse.search({
              $and: tokens.map((tok) => ({
                $or: fieldNames.map((f) => ({ [f]: tok })),
              })),
            })
          : fuse.search(q);
      const fuzzyHits: Breed[] = [];
      fuzzyResults.forEach((r) => {
        if (r.matches) matches.set(r.item.en, r.matches);
        if (!prefixSet.has(r.item.en)) fuzzyHits.push(r.item);
      });
      list = [...prefixHits, ...fuzzyHits];
    }
    if (filter === "popular") {
      list = [...list].filter((b) => b.rank !== null).sort((a, b) => a.rank! - b.rank!);
    } else if (filter !== "all") {
      list = list.filter((b) => b.size === filter);
    }
    return { filtered: list, matchesByKey: matches };
  }, [filter, q, hasQuery, fuse]);

  const featured = BREEDS[0];
  const { url: featuredUrl, loading: featuredLoading } = useBreedImage(featured.en);

  return (
    <AppShell noPadding>
      {/* Local keyframes for animated mixed gradient */}
      <style>{`
        @keyframes breedGradientShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes breedSkeletonShimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
        @keyframes breedSpin {
          to { transform: rotate(360deg); }
        }
      `}</style>

      {/* HERO BANNER */}
      <div style={{
        position: "relative", height: 110, overflow: "hidden",
        background: "linear-gradient(135deg, #FFF0F5 0%, #F5F0FF 50%, #FFF8DC 100%)",
        borderRadius: "0 0 24px 24px",
      }}>
        <div style={{ position: "absolute", left: 20, top: 24 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, color: "#E8829A", fontSize: 13, letterSpacing: "0.1em", fontWeight: 600 }}>
            <BookOpen size={14} strokeWidth={2} />
            <span>犬種図鑑</span>
          </div>
          <div style={{ fontSize: 22, fontFamily: "var(--font-heading)", fontWeight: 600, color: "#2C2C2C", marginTop: 2, letterSpacing: "-0.01em" }}>
            {t("犬種図鑑", "Breed Encyclopedia")}
          </div>
          <div style={{ fontSize: 12, color: "#8A8A8A", marginTop: 2 }}>
            {t("200以上の犬種", "200+ breeds")}
          </div>
        </div>

        {/* Right: stacked size pills (small/medium/large suggestion) */}
        <div style={{ position: "absolute", right: 22, top: 32, display: "flex", flexDirection: "column", gap: 6, opacity: 0.5 }}>
          <div style={{ width: 20, height: 8, borderRadius: 4, background: "#FFB7C5", alignSelf: "flex-end" }} />
          <div style={{ width: 28, height: 8, borderRadius: 4, background: "#C8C0F0", alignSelf: "flex-end" }} />
          <div style={{ width: 36, height: 8, borderRadius: 4, background: "#A8D0E8", alignSelf: "flex-end" }} />
        </div>
      </div>

      {/* SEARCH BAR */}
      <div style={{ margin: "16px 16px 12px" }}>
        <div style={{
          display: "flex", alignItems: "center", gap: 10, height: 52,
          background: "#FFFFFF", borderRadius: 16, padding: "0 12px 0 16px",
          border: `1.5px solid ${focused ? "#E8829A" : "#EDE8E4"}`,
          boxShadow: focused ? "0 4px 20px rgba(232,130,154,0.18)" : "0 4px 16px rgba(0,0,0,0.06)",
          transition: "all 200ms",
        }}>
          <Search size={18} color="#E8829A" strokeWidth={2} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            placeholder={t("どんな犬種でも検索", "Search any breed")}
            className="flex-1 bg-transparent outline-none text-sm"
            style={{ color: "#2C2C2C" }}
          />
          {hasQuery ? (
            <button
              onClick={() => setQuery("")}
              aria-label="Clear search"
              style={{
                width: 28, height: 28, borderRadius: "50%", background: "#FFE4EC",
                display: "flex", alignItems: "center", justifyContent: "center",
                border: "none", cursor: "pointer",
              }}
            >
              <X size={14} color="#E8829A" strokeWidth={2.5} />
            </button>
          ) : (
            <div style={{
              width: 34, height: 34, borderRadius: "50%", background: "#F0ECFF",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <SlidersHorizontal size={16} color="#7B68C8" strokeWidth={2} />
            </div>
          )}
        </div>
      </div>

      {/* FILTER CHIPS — text only, no emoji */}
      <div className="scrollbar-hide" style={{ display: "flex", gap: 8, overflowX: "auto", padding: "4px 16px 8px" }}>
        {FILTERS.map((f) => {
          const sel = filter === f.key;
          return (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              style={{
                flexShrink: 0,
                height: 34, padding: "0 16px", borderRadius: 20, fontSize: 12, fontWeight: 600,
                background: sel ? "linear-gradient(135deg, #E8829A, #C86882)" : "#FFFFFF",
                border: sel ? "1.5px solid transparent" : "1.5px solid #EDE8E4",
                color: sel ? "#FFFFFF" : "#8A8A8A",
                boxShadow: sel ? "0 4px 12px rgba(232,130,154,0.28)" : "0 2px 6px rgba(0,0,0,0.04)",
                transition: "all 180ms",
                whiteSpace: "nowrap",
              }}
            >
              {t(f.jp, f.en)}
            </button>
          );
        })}
      </div>


      {/* RESULT COUNT */}
      {hasQuery && filtered.length > 0 && (
        <div style={{ padding: "10px 20px 0", fontSize: 12, fontFamily: "var(--font-heading)", fontWeight: 600, color: "#8A8A8A" }}>
          {language === "english"
            ? `${filtered.length} ${filtered.length === 1 ? "breed" : "breeds"} found`
            : language === "japanese"
            ? `${filtered.length}件の犬種`
            : `${filtered.length}件の犬種 / ${filtered.length} found`}
        </div>
      )}

      {/* RESULTS — rich single-column profile cards */}
      <div style={{ display: "flex", flexDirection: "column", gap: 14, padding: "12px 16px 24px" }}>
        {filtered.map((b) => (
          <BreedCard
            key={b.en}
            breed={b}
            onOpen={() => setOpenBreed(b)}
            language={language}
            t={t}
            matches={matchesByKey.get(b.en)}
          />
        ))}
        {filtered.length === 0 && (
          <div style={{ gridColumn: "1 / -1", display: "flex", flexDirection: "column", alignItems: "center", padding: "40px 20px", gap: 12 }}>
            <SadDog />
            <div style={{ fontSize: 15, fontFamily: "var(--font-heading)", fontWeight: 600, color: "#2C2C2C", textAlign: "center" }}>
              {t("見つかりませんでした", "No breeds found")}
            </div>
            <div style={{ fontSize: 12, color: "#8A8A8A", textAlign: "center" }}>
              {t("別のキーワードで試してください", "Try a different keyword")}
            </div>
            <button
              onClick={() => { setQuery(""); setFilter("all"); }}
              style={{
                marginTop: 4, height: 38, padding: "0 22px", borderRadius: 20,
                background: "var(--color-primary)",
                color: "white", fontSize: 12, fontFamily: "var(--font-heading)", fontWeight: 600, border: "none",
                boxShadow: "0 4px 12px rgba(232,130,154,0.32)", cursor: "pointer",
              }}
            >
              {t("すべて表示", "Show All")}
            </button>
          </div>
        )}
      </div>

      {openBreed && <BreedDetail breed={openBreed} onClose={() => setOpenBreed(null)} />}
    </AppShell>
  );
}

/* ─────────────────────────────────────── Highlight & Empty State ─────────────────────────────────────── */

function Highlight({
  text, matches, keyName,
}: { text: string; matches?: readonly FuseResultMatch[]; keyName: string }) {
  const m = matches?.find((x) => x.key === keyName);
  if (!m || !m.indices?.length) return <>{text}</>;
  // Merge & sort indices
  const ranges = [...m.indices].sort((a, b) => a[0] - b[0]);
  const out: ReactNode[] = [];
  let cursor = 0;
  ranges.forEach(([start, end], i) => {
    if (start > cursor) out.push(<span key={`p${i}`}>{text.slice(cursor, start)}</span>);
    out.push(
      <span key={`h${i}`} style={{ color: "#E8829A", background: "rgba(232,130,154,0.14)", borderRadius: 3, padding: "0 1px" }}>
        {text.slice(start, end + 1)}
      </span>
    );
    cursor = end + 1;
  });
  if (cursor < text.length) out.push(<span key="t">{text.slice(cursor)}</span>);
  return <>{out}</>;
}

function SadDog() {
  return (
    <svg width="84" height="84" viewBox="0 0 84 84" fill="none" aria-hidden>
      <ellipse cx="42" cy="74" rx="26" ry="4" fill="#F0E6E0" />
      <path d="M20 38 L14 22 L28 30 Z" fill="#C99280" />
      <path d="M64 38 L70 22 L56 30 Z" fill="#C99280" />
      <ellipse cx="42" cy="46" rx="26" ry="22" fill="#E8B8A0" />
      <ellipse cx="42" cy="56" rx="18" ry="14" fill="#F5D4C0" />
      <circle cx="33" cy="44" r="2.5" fill="#2C2C2C" />
      <circle cx="51" cy="44" r="2.5" fill="#2C2C2C" />
      <path d="M30 50 Q33 52 36 50" stroke="#7A4A3A" strokeWidth="1.2" strokeLinecap="round" fill="none" />
      <path d="M48 50 Q51 52 54 50" stroke="#7A4A3A" strokeWidth="1.2" strokeLinecap="round" fill="none" />
      <ellipse cx="42" cy="55" rx="3" ry="2" fill="#2C2C2C" />
      <path d="M37 62 Q42 58 47 62" stroke="#2C2C2C" strokeWidth="1.6" strokeLinecap="round" fill="none" />
      <circle cx="58" cy="36" r="1.2" fill="#7BB3E0" opacity="0.8" />
      <circle cx="61" cy="40" r="0.8" fill="#7BB3E0" opacity="0.6" />
    </svg>
  );
}

/* ─────────────────────────────────────── Card ─────────────────────────────────────── */

function BreedCard({ breed, onOpen, language, t, matches }: { breed: Breed; onOpen: () => void; language: string; t: (jp: string, en: string) => string; matches?: readonly FuseResultMatch[] }) {
  const Icon = breed.Icon;
  const primaryName = language === "english" ? breed.en : breed.jp;
  const primaryKey = language === "english" ? "name_en" : "name_jp";
  const showSecondary = language !== "japanese" && primaryName !== breed.en;
  const { url: imgUrl, loading: imgLoading, refresh: refreshImg } = useBreedImage(breed.en);

  const rows: { jp: string; en: string; valueJp: string; valueEn: string; keyJp?: string; keyEn?: string }[] = [
    { jp: "グループ", en: "GROUP", valueJp: breed.groupJp, valueEn: breed.groupEn, keyJp: "group_jp", keyEn: "group_en" },
    { jp: "原産国", en: "ORIGIN", valueJp: breed.originJp, valueEn: breed.originEn, keyJp: "country_jp", keyEn: "country_en" },
    { jp: "性格", en: "TEMPERAMENT", valueJp: breed.temperamentJp, valueEn: breed.temperamentEn, keyJp: "temperament_jp", keyEn: "temperament_en" },
    { jp: "寿命", en: "LIFE SPAN", valueJp: breed.lifeSpan, valueEn: breed.lifeSpan, keyJp: "lifespan", keyEn: "lifespan" },
  ];

  return (
    <button
      onClick={onOpen}
      style={{
        background: "#FFFFFF", borderRadius: 22, overflow: "hidden",
        boxShadow: "0 4px 16px rgba(0,0,0,0.06)", textAlign: "left",
        display: "flex", flexDirection: "column", border: "1px solid #EFEAE3",
      }}
    >
      {/* HERO BANNER */}
      <div style={{ position: "relative", height: 132, overflow: "hidden" }}>
        <BreedImage breed={breed} srcOverride={imgUrl} loading={imgLoading}>
          <Icon
            size={22}
            color="rgba(255,255,255,0.95)"
            strokeWidth={2}
            style={{ position: "absolute", top: 12, left: 12, filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.4))" }}
          />
          {breed.rank !== null && (
            <div style={{
              position: "absolute", top: 0, right: 0,
              background: breed.rankBg, color: "white",
              padding: "5px 12px", height: 28,
              fontSize: 11, fontFamily: "var(--font-heading)", fontWeight: 600,
              borderRadius: "0 22px 0 12px",
              display: "flex", alignItems: "center",
            }}>
              #{breed.rank}
            </div>
          )}
          {/* Name overlay */}
          <div style={{ position: "absolute", left: 14, right: 14, bottom: 12, color: "white" }}>
            <div style={{ fontSize: 20, fontFamily: "var(--font-heading)", fontWeight: 600, lineHeight: 1.1, letterSpacing: "-0.01em", textShadow: "0 1px 4px rgba(0,0,0,0.45)" }}>
              <Highlight text={primaryName} matches={matches} keyName={primaryKey} />
            </div>
            {showSecondary && (
              <div style={{ fontSize: 11, opacity: 0.9, marginTop: 2, textShadow: "0 1px 3px rgba(0,0,0,0.4)" }}>
                <Highlight text={breed.en} matches={matches} keyName="name_en" />
              </div>
            )}
          </div>
          {/* Size pill */}
          <span style={{
            position: "absolute", top: 12, right: 12,
            ...(breed.rank !== null ? { top: "auto", bottom: 12 } : {}),
            background: "rgba(255,255,255,0.92)", color: breed.sizeText,
            fontSize: 10, fontFamily: "var(--font-heading)", fontWeight: 600, padding: "4px 10px", borderRadius: 20,
            letterSpacing: "0.04em",
          }}>
            {t(breed.sizeJp, breed.sizeEn).toUpperCase()}
          </span>
          {/* Refresh button — fetches a new random photo */}
          {hasBreedSlug(breed.en) && (
            <span
              role="button"
              tabIndex={0}
              aria-label="Refresh photo"
              onClick={(e) => { e.stopPropagation(); refreshImg(); }}
              onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.stopPropagation(); refreshImg(); } }}
              style={{
                position: "absolute", bottom: 12, left: 12,
                width: 30, height: 30, borderRadius: "50%",
                background: "rgba(255,255,255,0.92)",
                display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow: "0 2px 8px rgba(0,0,0,0.18)", cursor: "pointer",
                zIndex: 3,
              }}
            >
              <RefreshCw
                size={14}
                color="#E8829A"
                strokeWidth={2.5}
                style={{ animation: imgLoading ? "breedSpin 0.9s linear infinite" : undefined }}
              />
            </span>
          )}
        </BreedImage>
      </div>

      {/* PROFILE BODY */}
      <div style={{ padding: "14px 16px 16px", display: "flex", flexDirection: "column", gap: 10 }}>
        {rows.map((r) => (
          <div key={r.en} style={{ display: "grid", gridTemplateColumns: "92px 1fr", gap: 10, alignItems: "baseline" }}>
            <div style={{
              fontSize: 9, fontFamily: "var(--font-heading)", fontWeight: 600, color: "#A89A8B",
              letterSpacing: "0.14em", textTransform: "uppercase",
            }}>
              {t(r.jp, r.en)}
            </div>
            <div style={{ fontSize: 12.5, color: "#2C2C2C", fontWeight: 600, lineHeight: 1.35 }}>
              {language === "japanese" ? (
                <Highlight text={r.valueJp} matches={matches} keyName={r.keyJp ?? ""} />
              ) : (
                <Highlight text={r.valueEn} matches={matches} keyName={r.keyEn ?? ""} />
              )}
            </div>
          </div>
        ))}

        {/* DIAGNOSTIC NOTE */}
        <div style={{
          marginTop: 4, padding: "10px 12px",
          background: "var(--color-primary)",
          border: "1px solid #F5D9D2", borderRadius: 12,
          display: "flex", gap: 10, alignItems: "flex-start",
        }}>
          <AlertTriangle size={14} color="#E8829A" strokeWidth={2.4} style={{ marginTop: 2, flexShrink: 0 }} />
          <div style={{ minWidth: 0 }}>
            <div style={{
              fontSize: 9, fontFamily: "var(--font-heading)", fontWeight: 600, color: "#C86882",
              letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 2,
            }}>
              {t("診断ノート", "Diagnostic Note")}
            </div>
            <div style={{ fontSize: 11.5, color: "#5A3D45", fontWeight: 500, lineHeight: 1.4 }}>
              {language === "japanese" ? (
                <Highlight text={breed.diagnosticNoteJp} matches={matches} keyName="diagnostic_jp" />
              ) : (
                <Highlight text={breed.diagnosticNoteEn} matches={matches} keyName="diagnostic_en" />
              )}
            </div>
          </div>
        </div>
      </div>
    </button>
  );
}

/* ─────────────────────────────────────── Detail Sheet ─────────────────────────────────────── */

function BreedDetail({ breed, onClose }: { breed: Breed; onClose: () => void }) {
  const t = useT();
  const { language } = useLanguage();
  const [animated, setAnimated] = useState(false);
  const Icon = breed.Icon;
  const { url: heroUrl, loading: heroLoading } = useBreedImage(breed.en);
  const [strip, setStrip] = useState<string[]>([]);
  const [stripLoading, setStripLoading] = useState(true);

  useEffect(() => {
    const id = requestAnimationFrame(() => setAnimated(true));
    return () => cancelAnimationFrame(id);
  }, []);

  useEffect(() => {
    let cancelled = false;
    setStripLoading(true);
    fetchMultipleBreedImages(breed.en, 3).then((imgs) => {
      if (!cancelled) {
        setStrip(imgs);
        setStripLoading(false);
      }
    });
    return () => { cancelled = true; };
  }, [breed.en]);

  const bars = [
    { jp: "エネルギー", en: "Energy", v: breed.stats.energy, color: "#E8829A" },
    { jp: "友好性", en: "Friendliness", v: breed.stats.friendly, color: "#6BAF92" },
    { jp: "訓練性", en: "Trainability", v: breed.stats.train, color: "#7B68C8" },
    { jp: "手入れ", en: "Grooming", v: breed.stats.groom, color: "#D4A843" },
  ];

  const relatedPosts = POSTS.slice(0, 3);

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 flex items-end justify-center"
      onClick={onClose}
    >
      <div
        className="w-full max-h-[92dvh] overflow-y-auto"
        style={{ background: "#FAFAF8", borderRadius: "24px 24px 0 0", maxWidth: 430 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* HERO BANNER */}
        <div style={{
          position: "relative", height: 240, overflow: "hidden",
          borderRadius: "24px 24px 0 0",
        }}>
          <BreedImage
            breed={breed}
            srcOverride={heroUrl}
            loading={heroLoading}
            overlay="linear-gradient(to bottom, rgba(0,0,0,0.10) 0%, rgba(0,0,0,0.10) 55%, rgba(0,0,0,0.55) 100%)"
          />

          <button onClick={onClose} style={{
            position: "absolute", top: 16, left: 16, width: 36, height: 36,
            borderRadius: "50%", background: "rgba(255,255,255,0.9)", backdropFilter: "blur(10px)",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)", zIndex: 2,
          }}>
            <ArrowLeft size={18} color="#2C2C2C" />
          </button>

          {breed.rank !== null && (
            <div style={{
              position: "absolute", top: 16, right: 16, zIndex: 2,
              background: breed.rankBg, color: "white",
              padding: "6px 12px", fontSize: 12, fontFamily: "var(--font-heading)", fontWeight: 600, borderRadius: 14,
              boxShadow: "0 2px 8px rgba(0,0,0,0.25)",
            }}>
              #{breed.rank} {t("人気", "Popular")}
            </div>
          )}

          <div className="w-12 h-1.5 rounded-full" style={{ position: "absolute", top: 8, left: "50%", transform: "translateX(-50%)", background: "rgba(255,255,255,0.55)", zIndex: 2 }} />
        </div>

        {/* PHOTO STRIP — 3 more breed images, horizontally scrollable */}
        {(stripLoading || strip.length > 0) && (
          <div
            className="scrollbar-hide"
            style={{
              display: "flex", gap: 10, overflowX: "auto",
              padding: "14px 16px 4px",
              scrollSnapType: "x mandatory",
            }}
          >
            {stripLoading
              ? [0, 1, 2].map((i) => (
                  <div
                    key={i}
                    style={{
                      flexShrink: 0, width: 132, height: 96, borderRadius: 14,
                      background: "linear-gradient(110deg, #FFE4EC 25%, #FFF5F8 50%, #FFE4EC 75%)",
                      backgroundSize: "200% 100%",
                      animation: "breedSkeletonShimmer 1.4s ease-in-out infinite",
                    }}
                  />
                ))
              : strip.map((u, i) => (
                  <img
                    key={u + i}
                    src={u}
                    alt={`${breed.en} ${i + 1}`}
                    loading="lazy"
                    style={{
                      flexShrink: 0, width: 132, height: 96, borderRadius: 14,
                      objectFit: "cover", scrollSnapAlign: "start",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                    }}
                  />
                ))}
          </div>
        )}


        {/* NAME */}
        <div style={{ padding: "20px 20px 8px" }}>
          <div style={{ fontSize: 24, fontFamily: "var(--font-heading)", fontWeight: 600, color: "#2C2C2C", letterSpacing: "-0.01em" }}>
            {language === "english" ? breed.en : breed.jp}
          </div>
          {language !== "japanese" && (
            <div style={{ fontSize: 14, color: "#8A8A8A", marginTop: 2 }}>{breed.en}</div>
          )}
          <div style={{ display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap" }}>
            <span style={{ background: breed.sizeBg, color: breed.sizeText, fontSize: 11, fontFamily: "var(--font-heading)", fontWeight: 600, padding: "5px 12px", borderRadius: 12 }}>
              {t(breed.sizeJp, breed.sizeEn)}
            </span>
            <span style={{ background: "#FFFFFF", border: "1px solid #EDE8E4", fontSize: 11, fontWeight: 600, color: "#2C2C2C", padding: "5px 10px", borderRadius: 12 }}>
              {breed.flag} {t(breed.originJp, breed.originEn)}
            </span>
          </div>
        </div>

        {/* STATS */}
        <div style={{ padding: "20px", margin: "12px 16px 0", background: "#FFFFFF", borderRadius: 20, boxShadow: "0 4px 16px rgba(0,0,0,0.05)" }}>
          <div style={{ fontSize: 14, fontFamily: "var(--font-heading)", fontWeight: 600, color: "#2C2C2C", marginBottom: 14 }}>
            {t("犬種特性", "Breed Traits")}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {bars.map((b) => (
              <div key={b.en}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}>
                  <span style={{ color: "#2C2C2C", fontWeight: 600 }}>{t(b.jp, b.en)}</span>
                  <span style={{ color: b.color, fontFamily: "var(--font-heading)", fontWeight: 600 }}>{b.v}%</span>
                </div>
                <div style={{ height: 8, background: "#F0ECE8", borderRadius: 4, overflow: "hidden" }}>
                  <div style={{
                    height: "100%", width: animated ? `${b.v}%` : "0%",
                    background: `linear-gradient(90deg, ${b.color}, ${b.color}CC)`,
                    borderRadius: 4, transition: "width 800ms cubic-bezier(0.4,0,0.2,1)",
                  }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* HEALTH */}
        <div style={{ padding: "20px", margin: "12px 16px 0", background: "#FFFFFF", borderRadius: 20, boxShadow: "0 4px 16px rgba(0,0,0,0.05)" }}>
          <div style={{ fontSize: 14, fontFamily: "var(--font-heading)", fontWeight: 600, color: "#2C2C2C", marginBottom: 12 }}>
            {t("健康注意事項", "Health Notes")}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {breed.health.map((h, i) => {
              const isConcern = h.level === "concern";
              return (
                <div key={i} style={{
                  display: "flex", alignItems: "center", gap: 10,
                  padding: "10px 12px", borderRadius: 12,
                  background: isConcern ? "#FFEEEC" : "#FFF8E0",
                  border: `1px solid ${isConcern ? "#F5C0BC" : "#F0DCA0"}`,
                }}>
                  <AlertTriangle size={16} color={isConcern ? "#E53935" : "#D4A843"} strokeWidth={2} />
                  <div style={{ fontSize: 12, color: "#2C2C2C", fontWeight: 600 }}>
                    {t(h.jp, h.en)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* COMMUNITY */}
        <div style={{ padding: "20px", margin: "12px 16px 24px", background: "#FFFFFF", borderRadius: 20, boxShadow: "0 4px 16px rgba(0,0,0,0.05)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
            <div style={{ fontSize: 14, fontFamily: "var(--font-heading)", fontWeight: 600, color: "#2C2C2C" }}>
              {t("コミュニティ投稿", "Community Posts")}
            </div>
            <a href="/community" style={{ fontSize: 11, color: "#E8829A", fontFamily: "var(--font-heading)", fontWeight: 600 }}>
              {t("もっと見る →", "See More →")}
            </a>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {relatedPosts.map((p) => (
              <div key={p.id} style={{ padding: "10px 12px", background: "#FAFAF8", borderRadius: 12, display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{
                  width: 32, height: 32, borderRadius: "50%",
                  background: breed.bannerBg,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  flexShrink: 0,
                  fontSize: 11, fontFamily: "var(--font-heading)", fontWeight: 600, color: "rgba(255,255,255,0.85)",
                }}>
                  {breed.kanji.slice(0, 1)}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12, fontFamily: "var(--font-heading)", fontWeight: 600, color: "#2C2C2C", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    <T jp={p.titleJp} en={p.titleEn} />
                  </div>
                  <div style={{ fontSize: 10, color: "#8A8A8A", marginTop: 2, display: "flex", gap: 8 }}>
                    <span>{p.user}</span>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 3 }}>
                      <MessageCircle size={10} /> {p.com}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
