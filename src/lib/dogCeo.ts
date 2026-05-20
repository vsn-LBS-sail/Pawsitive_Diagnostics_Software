/**
 * Dog CEO API integration — verified breed photos with 24h localStorage cache.
 * https://dog.ceo/dog-api/
 */

export const dogCeoBreedMap: Record<string, string | null> = {
  // Japanese Breeds
  "Shiba Inu": "shiba",
  "Akita Inu": "akita",
  "Japanese Spitz": "spitz-japanese",
  "Japanese Chin": "japanesechi",
  // Toy & Small
  "Toy Poodle": "poodle-toy",
  "Miniature Poodle": "poodle-miniature",
  "Standard Poodle": "poodle-standard",
  "Chihuahua": "chihuahua",
  "Pomeranian": "pomeranian",
  "Maltese": "maltese",
  "Yorkshire Terrier": "terrier-yorkshire",
  "Papillon": "papillon",
  "Lhasa Apso": "lhasa",
  "Shih Tzu": "shihtzu",
  "Pekingese": "pekinese",
  "Havanese": "havanese",
  "Bichon Frise": "bichon",
  "Affenpinscher": "affenpinscher",
  "Brussels Griffon": "brabancon",
  "Italian Greyhound": "greyhound-italian",
  "Miniature Pinscher": "pinscher-miniature",
  // Medium
  "Mini Dachshund": "dachshund",
  "Standard Dachshund": "dachshund",
  "Kaninchen Dachshund": "dachshund",
  "Beagle": "beagle",
  "French Bulldog": "bulldog-french",
  "English Bulldog": "bulldog-english",
  "Corgi": "corgi-cardigan",
  "Shetland Sheepdog": "sheepdog-shetland",
  "Border Collie": "collie-border",
  "Australian Shepherd": "australian-shepherd",
  "Cocker Spaniel": "spaniel-cocker",
  "Springer Spaniel": "springer-english",
  "Basset Hound": "basset",
  "Cairn Terrier": "terrier-cairn",
  "Scottish Terrier": "terrier-scottish",
  "West Highland White Terrier": "terrier-westhighland",
  "Miniature Schnauzer": "schnauzer-miniature",
  "Basenji": "basenji",
  "Skye Terrier": "terrier-skye",
  "Welsh Terrier": "terrier-welsh",
  "Boston Terrier": "bullterrier-staffordshire",
  "Pug": "pug",
  // Large
  "Golden Retriever": "retriever-golden",
  "Labrador Retriever": "retriever-labrador",
  "German Shepherd": "germanshepherd",
  "Siberian Husky": "husky",
  "Alaskan Malamute": "malamute",
  "Samoyed": "samoyed",
  "Bernese Mountain Dog": "mountain-bernese",
  "Great Pyrenees": "pyrenees",
  "Irish Setter": "setter-irish",
  "Doberman": "doberman",
  "Rottweiler": "rottweiler",
  "Boxer": "boxer",
  "Weimaraner": "weimaraner",
  "Dalmatian": "dalmatian",
  "Afghan Hound": "hound-afghan",
  "Great Dane": "dane-great",
  "Saint Bernard": "stbernard",
  "Newfoundland": "newfoundland",
  "Tosa Inu": "mastiff-tibetan",
  // Working & Sporting
  "Belgian Malinois": "malinois",
  "Bloodhound": "hound-blood",
  "Greyhound": "greyhound-italian",
  "Whippet": "whippet",
  "Vizsla": "vizsla",
  "Brittany": "brittany",
  "Flat-Coated Retriever": "retriever-flatcoated",
  "Chesapeake Bay Retriever": "retriever-chesapeake",
  "Australian Cattle Dog": "cattledog-australian",
  // Rare & Unique
  "Chinese Crested": "chihuahua",
  "Norwegian Elkhound": "elkhound-norwegian",
  "Finnish Spitz": "spitz-finnish",
  "American Eskimo Dog": "eskimo",
  "Leonberger": "leonberg",
  "Lagotto Romagnolo": "lagotto",
  "Bouvier des Flandres": "bouvier",
  "Goldendoodle": "retriever-golden",
  "Labradoodle": "retriever-labrador",
  "Maltipoo": "maltese",
  "Schnoodle": "schnauzer-miniature",
  "Cavalier King Charles Spaniel": "spaniel-cocker",
  // Mixed / no match
  "Mixed Breed": null,
};

const FALLBACK =
  "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=400&q=80&auto=format&fit=crop";

const CACHE_KEY = "breed_images";
const TTL_MS = 24 * 60 * 60 * 1000;

type CacheEntry = { url: string; ts: number };
type Cache = Record<string, CacheEntry>;

function readCache(): Cache {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(CACHE_KEY);
    if (!raw) return {};
    const c = JSON.parse(raw) as Cache;
    const now = Date.now();
    let dirty = false;
    for (const k of Object.keys(c)) {
      if (!c[k] || now - c[k].ts > TTL_MS) {
        delete c[k];
        dirty = true;
      }
    }
    if (dirty) window.localStorage.setItem(CACHE_KEY, JSON.stringify(c));
    return c;
  } catch {
    return {};
  }
}

function writeCache(key: string, url: string) {
  if (typeof window === "undefined") return;
  try {
    const c = readCache();
    c[key] = { url, ts: Date.now() };
    window.localStorage.setItem(CACHE_KEY, JSON.stringify(c));
  } catch {
    /* quota / disabled */
  }
}

export function hasBreedSlug(en: string): boolean {
  return !!dogCeoBreedMap[en];
}

export function getCachedImage(en: string): string | null {
  const c = readCache();
  const e = c[en];
  if (!e) return null;
  if (Date.now() - e.ts > TTL_MS) return null;
  return e.url;
}

export function setCachedImage(en: string, url: string) {
  writeCache(en, url);
}

export async function fetchBreedImage(en: string): Promise<string> {
  const slug = dogCeoBreedMap[en];
  if (!slug) return FALLBACK;
  try {
    const res = await fetch(`https://dog.ceo/api/breed/${slug}/images/random`);
    const data = await res.json();
    if (data?.status === "success" && typeof data.message === "string") {
      return data.message;
    }
    return FALLBACK;
  } catch {
    return FALLBACK;
  }
}

export async function fetchMultipleBreedImages(
  en: string,
  count = 3,
): Promise<string[]> {
  const slug = dogCeoBreedMap[en];
  if (!slug) return [];
  try {
    const res = await fetch(
      `https://dog.ceo/api/breed/${slug}/images/random/${count}`,
    );
    const data = await res.json();
    if (data?.status === "success" && Array.isArray(data.message)) {
      return data.message as string[];
    }
    return [];
  } catch {
    return [];
  }
}
