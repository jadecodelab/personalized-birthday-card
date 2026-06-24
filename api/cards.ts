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

function getClientIp(request: Request): string {
  return (
    request.headers.get("x-vercel-forwarded-for") ??
    request.headers.get("x-real-ip") ??
    "unknown"
  );
}

export async function POST(request: Request): Promise<Response> {
  try {
    const withinLimit = await checkRateLimit(getClientIp(request));

    if (!withinLimit) {
      return Response.json({ error: "Too many requests." }, { status: 429 });
    }

    const rawBody = await request.text();

    if (rawBody.length > MAX_PAYLOAD_LENGTH) {
      return Response.json({ error: "Card is too large." }, { status: 413 });
    }

    const payload = JSON.parse(rawBody);

    if (!isValidPayloadShape(payload)) {
      return Response.json({ error: "Invalid card data." }, { status: 400 });
    }

    const id = await saveCard(payload);

    return Response.json({ id }, { status: 201 });
  } catch {
    return Response.json({ error: "Could not create the link." }, { status: 500 });
  }
}

export async function GET(request: Request): Promise<Response> {
  try {
    const id = new URL(request.url).searchParams.get("id");

    if (!id) {
      return Response.json({ error: "Missing id." }, { status: 400 });
    }

    const payload = await loadCard(id);

    if (!payload) {
      return Response.json({ error: "Card not found." }, { status: 404 });
    }

    return Response.json(payload, { status: 200 });
  } catch {
    return Response.json({ error: "Could not load the card." }, { status: 500 });
  }
}
