import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

/**
 * Generate a flat, illustrated avatar from a user-uploaded photo using
 * Replicate. Two-step pipeline:
 *   1. Background removal (851-labs/background-remover, rembg-style)
 *   2. Stylisation into a colourful cartoon avatar (stability-ai/sdxl img2img)
 *
 * The REPLICATE_API_KEY is read inside the handler so it stays server-side.
 */

type ReplicatePrediction = {
  id: string;
  status: "starting" | "processing" | "succeeded" | "failed" | "canceled";
  output: unknown;
  error?: string | null;
  urls?: { get?: string };
};

async function runReplicate(
  model: string,
  input: Record<string, unknown>,
  key: string,
  version?: string
): Promise<unknown> {
  const url = version 
    ? "https://api.replicate.com/v1/predictions" 
    : `https://api.replicate.com/v1/models/${model}/predictions`;

  const start = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
      Prefer: "wait=60",
    },
    body: JSON.stringify(version ? { version, input } : { input }),
  });

  if (!start.ok) {
    const text = await start.text();
    throw new Error(`Replicate ${model} request failed: ${start.status} ${text}`);
  }

  let pred = (await start.json()) as ReplicatePrediction;
  const getUrl =
    pred.urls?.get ?? `https://api.replicate.com/v1/predictions/${pred.id}`;
  const startedAt = Date.now();

  while (
    pred.status !== "succeeded" &&
    pred.status !== "failed" &&
    pred.status !== "canceled"
  ) {
    if (Date.now() - startedAt > 120_000) {
      throw new Error(`Replicate ${model} timed out`);
    }
    await new Promise((r) => setTimeout(r, 1500));
    const poll = await fetch(getUrl, {
      headers: { Authorization: `Bearer ${key}` },
    });
    pred = (await poll.json()) as ReplicatePrediction;
  }

  if (pred.status !== "succeeded") {
    throw new Error(`Replicate ${model} ${pred.status}: ${pred.error ?? "unknown error"}`);
  }
  return pred.output;
}

function firstImageUrl(out: unknown): string | null {
  if (typeof out === "string") return out;
  if (Array.isArray(out) && out.length > 0 && typeof out[0] === "string") return out[0];
  if (out && typeof out === "object") {
    const o = out as Record<string, unknown>;
    if (typeof o.image === "string") return o.image;
    if (typeof o.output === "string") return o.output;
  }
  return null;
}

export const generateAvatar = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z
      .object({
        dogImageBase64: z.string().min(1),
        dogImageMime: z.string().default("image/jpeg"),
        ownerImageBase64: z.string().optional(),
        ownerImageMime: z.string().optional(),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    const key = process.env.REPLICATE_API_KEY;
    if (!key) throw new Error("Missing REPLICATE_API_KEY");

    const prompt =
      "3D animated avatar style of img, like Pixar, Disney, Memoji, vibrant colors, expressive, high quality, digital 3D render, character design, plain background";

    const processAvatar = async (base64: string, mime: string) => {
      const dataUrl = `data:${mime};base64,${base64}`;

      // Step 1 — 3D animated avatar stylisation (photomaker)
      const styleOut = await runReplicate(
        "tencentarc/photomaker",
        {
          input_image: dataUrl,
          prompt,
          negative_prompt:
            "photo, realistic, 2d, flat, blurry, dark, scary, text, watermark, frame, border, deformed, ugly",
          num_steps: 30,
          style_name: "(No style)",
          num_outputs: 1,
          guidance_scale: 5,
        },
        key,
      );
      const styledUrl = firstImageUrl(styleOut);
      if (!styledUrl) throw new Error("Stylisation returned no image");

      // Step 2 — background removal
      const bgOut = await runReplicate(
        "lucataco/remove-bg",
        { image: styledUrl },
        key,
        "95fcc2a26d3899cd6c2691c900465aaeff466285"
      );
      const cleanUrl = firstImageUrl(bgOut);
      if (!cleanUrl) throw new Error("Background removal returned no image");

      return cleanUrl;
    };

    const dogAvatarUrl = await processAvatar(data.dogImageBase64, data.dogImageMime);

    let ownerAvatarUrl: string | null = null;
    if (data.ownerImageBase64 && data.ownerImageMime) {
      ownerAvatarUrl = await processAvatar(data.ownerImageBase64, data.ownerImageMime);
    }

    return { dogAvatarUrl, ownerAvatarUrl };
  });
