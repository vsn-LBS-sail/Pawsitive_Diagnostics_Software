export type DogPalette = {
  fur: string;
  furDeep: string;
  earInner: string;
  chest: string;
};

const toHex = (n: number) => n.toString(16).padStart(2, "0");
const rgb = (r: number, g: number, b: number) => `#${toHex(r)}${toHex(g)}${toHex(b)}`;

const shade = (r: number, g: number, b: number, k: number) =>
  rgb(
    Math.max(0, Math.min(255, Math.round(r * k))),
    Math.max(0, Math.min(255, Math.round(g * k))),
    Math.max(0, Math.min(255, Math.round(b * k)))
  );

/**
 * Sample the center region of a (Ghibli) dog image and return a palette
 * the PawBot SVG can use to recolor itself: dominant fur tone + variations.
 */
export function extractDogColors(imageUrl: string): Promise<DogPalette> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      try {
        const W = 64;
        const H = 64;
        const canvas = document.createElement("canvas");
        canvas.width = W;
        canvas.height = H;
        const ctx = canvas.getContext("2d");
        if (!ctx) return reject(new Error("No 2d context"));
        ctx.drawImage(img, 0, 0, W, H);
        // Sample inner 50% (avoid background)
        const x0 = Math.floor(W * 0.25);
        const y0 = Math.floor(H * 0.25);
        const data = ctx.getImageData(x0, y0, W / 2, H / 2).data;

        const buckets = new Map<string, { r: number; g: number; b: number; n: number }>();
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i], g = data[i + 1], b = data[i + 2], a = data[i + 3];
          if (a < 200) continue;
          // Skip near-white/black/gray pixels (background / outline)
          const max = Math.max(r, g, b), min = Math.min(r, g, b);
          const sat = max === 0 ? 0 : (max - min) / max;
          const lum = (r + g + b) / 3;
          if (lum < 35 || lum > 235) continue;
          if (sat < 0.12) continue;
          // Quantize into 24-step buckets
          const key = `${r >> 5}-${g >> 5}-${b >> 5}`;
          const cur = buckets.get(key) ?? { r: 0, g: 0, b: 0, n: 0 };
          cur.r += r; cur.g += g; cur.b += b; cur.n += 1;
          buckets.set(key, cur);
        }

        if (buckets.size === 0) {
          // Fallback to defaults if nothing usable
          return resolve({
            fur: "#C17D4A",
            furDeep: "#A66838",
            earInner: "#E8A878",
            chest: "#F5E6C8",
          });
        }

        const top = [...buckets.values()]
          .sort((a, b) => b.n - a.n)[0];
        const r = Math.round(top.r / top.n);
        const g = Math.round(top.g / top.n);
        const b = Math.round(top.b / top.n);

        resolve({
          fur: rgb(r, g, b),
          furDeep: shade(r, g, b, 0.78),
          earInner: shade(r, g, b, 1.25),
          chest: shade(r, g, b, 1.45),
        });
      } catch (e) {
        reject(e);
      }
    };
    img.onerror = () => reject(new Error("Image load failed"));
    img.src = imageUrl;
  });
}
