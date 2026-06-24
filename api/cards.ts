// Deliberately a single, self-contained file: no imports from elsewhere
// under api/ and no external type packages (@vercel/node etc). Two
// consecutive deploys crashed with a generic FUNCTION_INVOCATION_FAILED
// before any of this file's own error handling ran, which points at
// something failing during Vercel's build/bundle step rather than at
// request-handling time - most likely the _lib subfolder import or the
// @vercel/node type-only import. Removing both possible causes at once
// rather than guessing further. Only plain fetch/crypto/process.env, all
// real Node.js runtime globals, are used below.

type ApiRequest = {
  method?: string;
  headers: Record<string, string | string[] | undefined>;
  body: unknown;
  query: Record<string, string | string[] | undefined>;
};

type ApiResponse = {
  status: (code: number) => ApiResponse;
  json: (body: unknown) => void;
};

const UPSTASH_URL = process.env.UPSTASH_REDIS_REST_URL;
const UPSTASH_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;

const RATE_LIMIT_PER_MINUTE = 10;
const MAX_PAYLOAD_LENGTH = 400_000;
const KNOWN_TEMPLATE_IDS = ["elegant", "playful", "bold", "photo"];
const ID_ALPHABET =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

function assertConfigured(): { url: string; token: string } {
  if (!UPSTASH_URL || !UPSTASH_TOKEN) {
    throw new Error("UPSTASH_REDIS_REST_URL/UPSTASH_REDIS_REST_TOKEN are not set.");
  }

  return { url: UPSTASH_URL, token: UPSTASH_TOKEN };
}

async function redisRequest(path: string, body?: string): Promise<unknown> {
  const { url, token } = assertConfigured();

  const response = await fetch(`${url}${path}`, {
    method: body === undefined ? "GET" : "POST",
    headers: { Authorization: `Bearer ${token}` },
    body,
  });

  if (!response.ok) {
    throw new Error(`Upstash request failed: ${response.status}`);
  }

  const data = (await response.json()) as { result: unknown };

  return data.result;
}

function generateShortId(length = 10): string {
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);

  let id = "";

  for (const byte of bytes) {
    id += ID_ALPHABET[byte % ID_ALPHABET.length];
  }

  return id;
}

async function saveCard(payload: unknown): Promise<string> {
  const id = generateShortId();

  await redisRequest(`/set/card:${id}`, JSON.stringify(payload));

  return id;
}

async function loadCard(id: string): Promise<unknown | null> {
  const raw = await redisRequest(`/get/card:${id}`);

  return typeof raw === "string" ? JSON.parse(raw) : null;
}

// A single INCR+EXPIRE pair reuses the same Redis instance as storage, no
// new infrastructure - rejects once an IP has made more than
// RATE_LIMIT_PER_MINUTE POSTs within the current 60s bucket.
async function checkRateLimit(ip: string): Promise<boolean> {
  const minuteBucket = Math.floor(Date.now() / 60_000);
  const key = `rl:${ip}:${minuteBucket}`;

  const count = (await redisRequest(`/incr/${key}`)) as number;

  if (count === 1) {
    await redisRequest(`/expire/${key}/60`);
  }

  return count <= RATE_LIMIT_PER_MINUTE;
}

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

function getClientIp(req: ApiRequest): string {
  const header = req.headers["x-vercel-forwarded-for"] ?? req.headers["x-real-ip"];
  const value = Array.isArray(header) ? header[0] : header;

  return value ?? "unknown";
}

async function handlePost(req: ApiRequest, res: ApiResponse) {
  try {
    const withinLimit = await checkRateLimit(getClientIp(req));

    if (!withinLimit) {
      res.status(429).json({ error: "Too many requests." });
      return;
    }

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
  } catch (error) {
    res.status(500).json({ error: "Could not create the link.", detail: String(error) });
  }
}

async function handleGet(req: ApiRequest, res: ApiResponse) {
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
  } catch (error) {
    res.status(500).json({ error: "Could not load the card.", detail: String(error) });
  }
}

export default async function handler(req: ApiRequest, res: ApiResponse) {
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
