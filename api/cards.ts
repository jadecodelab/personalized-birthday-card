import type { VercelRequest, VercelResponse } from "@vercel/node";
import { checkRateLimit, loadCard, saveCard } from "./_lib/cardStore";

// Mirrors src/lib/cardLink.ts's decodeCardLink validation. Duplicated
// rather than imported - this file is bundled separately from src/ by
// Vercel's function build, and cardStore.ts is kept free of any
// cross-root imports for the same reason (see its own comment).
const KNOWN_TEMPLATE_IDS = ["elegant", "playful", "bold", "photo"];

// Generous headroom over the loosened ~320,000-character photo cap in
// photoCompression.ts, for the rest of the payload's fields.
const MAX_PAYLOAD_LENGTH = 400_000;

function isValidPayloadShape(data: unknown): boolean {
  if (!data || typeof data !== "object") {
    return false;
  }

  const candidate = data as Record<string, unknown>;

  return (
    candidate.v === 1 &&
    typeof candidate.name === "string" &&
    typeof candidate.month === "number" &&
    typeof candidate.day === "number" &&
    typeof candidate.headline === "string" &&
    typeof candidate.body === "string" &&
    typeof candidate.photoScale === "number" &&
    Boolean(candidate.layout) &&
    typeof candidate.layout === "object" &&
    Array.isArray(candidate.activeStickers) &&
    typeof candidate.templateId === "string" &&
    KNOWN_TEMPLATE_IDS.includes(candidate.templateId)
  );
}

function getClientIp(req: VercelRequest): string {
  const header = req.headers["x-vercel-forwarded-for"] ?? req.headers["x-real-ip"];
  const value = Array.isArray(header) ? header[0] : header;

  return value ?? "unknown";
}

async function handlePost(req: VercelRequest, res: VercelResponse) {
  try {
    const withinLimit = await checkRateLimit(getClientIp(req));

    if (!withinLimit) {
      res.status(429).json({ error: "Too many requests." });
      return;
    }

    // Vercel's Node runtime already parses a JSON request body into
    // req.body - re-stringify just to measure its real serialized size.
    const payload = req.body;
    const serialized = JSON.stringify(payload) ?? "";

    if (serialized.length > MAX_PAYLOAD_LENGTH) {
      res.status(413).json({ error: "Card is too large." });
      return;
    }

    if (!isValidPayloadShape(payload)) {
      res.status(400).json({ error: "Invalid card data." });
      return;
    }

    const id = await saveCard(payload);

    res.status(201).json({ id });
  } catch {
    res.status(500).json({ error: "Could not create the link." });
  }
}

async function handleGet(req: VercelRequest, res: VercelResponse) {
  try {
    const id = typeof req.query.id === "string" ? req.query.id : null;

    if (!id) {
      res.status(400).json({ error: "Missing id." });
      return;
    }

    const payload = await loadCard(id);

    if (!payload) {
      res.status(404).json({ error: "Card not found." });
      return;
    }

    res.status(200).json(payload);
  } catch {
    res.status(500).json({ error: "Could not load the card." });
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === "POST") {
    await handlePost(req, res);
    return;
  }

  if (req.method === "GET") {
    await handleGet(req, res);
    return;
  }

  res.status(405).json({ error: "Method not allowed." });
}
