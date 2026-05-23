export const PREFECTURES = [
  "北海道","青森県","岩手県","宮城県","秋田県","山形県","福島県","茨城県","栃木県","群馬県",
  "埼玉県","千葉県","東京都","神奈川県","新潟県","富山県","石川県","福井県","山梨県","長野県",
  "岐阜県","静岡県","愛知県","三重県","滋賀県","京都府","大阪府","兵庫県","奈良県","和歌山県",
  "鳥取県","島根県","岡山県","広島県","山口県","徳島県","香川県","愛媛県","高知県","福岡県",
  "佐賀県","長崎県","熊本県","大分県","宮崎県","鹿児島県","沖縄県",
];

export const BREEDS = [
  { jp: "柴犬", en: "Shiba Inu", rank: 1, size: "small" },
  { jp: "トイプードル", en: "Toy Poodle", rank: 2, size: "small" },
  { jp: "チワワ", en: "Chihuahua", rank: 3, size: "small" },
  { jp: "ポメラニアン", en: "Pomeranian", rank: 4, size: "small" },
  { jp: "ゴールデンレトリバー", en: "Golden Retriever", rank: 5, size: "large" },
  { jp: "ミニチュアダックスフンド", en: "Mini Dachshund", rank: 6, size: "small" },
  { jp: "フレンチブルドッグ", en: "French Bulldog", rank: 7, size: "medium" },
  { jp: "ヨークシャーテリア", en: "Yorkshire Terrier", rank: 8, size: "small" },
  { jp: "ミックス犬", en: "Mixed", rank: 9, size: "medium" },
];

export const DAILY_FACTS = [
  { jp: "犬は鼻紋で個体識別できます。人間の指紋のように一頭ごとに違います。", en: "Dogs have unique nose prints, like human fingerprints." },
  { jp: "柴犬は日本最古の犬種の一つで、縄文時代から存在していました。", en: "The Shiba Inu is one of Japan's oldest breeds, dating to the Jomon era." },
  { jp: "犬の平均体温は38.3〜39.2℃で、人間より少し高めです。", en: "A dog's normal body temperature is 38.3–39.2°C, higher than humans." },
  { jp: "犬は約1万種類の匂いを嗅ぎ分けられます。", en: "Dogs can distinguish around 10,000 different scents." },
  { jp: "ワンちゃんも夢を見ます。レム睡眠中に足を動かすことがあります。", en: "Dogs dream too — they twitch during REM sleep." },
];

export const CLINICS = [
  { jp: "渋谷動物病院", en: "Shibuya Animal Hospital", rating: 4.6, km: 0.8, open: true, em: true, phone: "+81-3-1234-5678" },
  { jp: "原宿ペットクリニック", en: "Harajuku Pet Clinic", rating: 4.4, km: 1.2, open: true, em: false, phone: "+81-3-2345-6789" },
  { jp: "新宿24時間動物医療センター", en: "Shinjuku 24h Animal Medical", rating: 4.8, km: 2.1, open: true, em: true, phone: "+81-3-3456-7890" },
  { jp: "代々木さくら獣医", en: "Yoyogi Sakura Vet", rating: 4.2, km: 2.6, open: false, em: false, phone: "+81-3-4567-8901" },
  { jp: "目黒プレミアム動物病院", en: "Meguro Premium Animal Hospital", rating: 4.7, km: 3.4, open: true, em: false, phone: "+81-3-5678-9012" },
];

export type VaccineStatus = "ok" | "soon" | "overdue";
export const VACCINE_RECORDS: { jp: string; en: string; date: string; status: VaccineStatus }[] = [
  { jp: "狂犬病", en: "Rabies", date: "2025/04/15", status: "ok" },
  { jp: "混合ワクチン", en: "Combination", date: "2025/03/02", status: "ok" },
  { jp: "フィラリア", en: "Heartworm", date: "2026/01/20", status: "ok" },
  { jp: "ノミ・マダニ", en: "Flea & Tick", date: "2026/06", status: "soon" },
];

export const LAST_VET_VISIT = {
  clinicJp: "渋谷動物病院",
  clinicEn: "Shibuya Animal Hospital",
  dateJp: "2026年4月20日",
  dateEn: "Apr 20, 2026",
  resultJp: "健康診断: 異常なし ✓",
  resultEn: "Health check: All clear ✓",
};

export const REPORT_CHART_DATA = {
  score:  [82, 85, 83, 87, 86, 88, 87],
  temp:   [38.3, 38.6, 38.4, 38.8, 38.5, 38.7, 38.5],
  steps:  [1800, 2600, 2400, 2200, 2000, 2800, 3100],
  sleep:  [7.2, 8.1, 7.5, 6.8, 7.9, 8.4, 7.5],
};

export const POSTS = [
  { id: "1", user: "ハナちゃんママ", breed: "柴犬", time: "3時間前", titleJp: "柴犬の体温が少し高いのですが", titleEn: "My Shiba's temp seems high", flair: "健康", up: 47, com: 12 },
  { id: "2", user: "Tokyo Dog Lover", breed: "トイプードル", time: "5時間前", titleJp: "東京でおすすめの獣医さん", titleEn: "Recommended vet in Tokyo?", flair: "獣医Q&A", up: 23, com: 34 },
  { id: "3", user: "ポメ太郎", breed: "ポメラニアン", time: "昨日", titleJp: "うちの子の毎日の散歩ルーティン", titleEn: "My dog's daily walk routine", flair: "日常", up: 89, com: 6 },
  { id: "4", user: "迷子サポート", breed: "ミックス犬", time: "2時間前", titleJp: "渋谷で黒い柴犬を見かけませんでしたか", titleEn: "Did you see a black Shiba in Shibuya?", flair: "迷子", up: 156, com: 28 },
];
