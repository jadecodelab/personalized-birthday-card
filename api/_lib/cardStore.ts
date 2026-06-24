// Deliberately dependency-free and isolated from src/ - this gets bundled by
// Vercel's own function build, separately from the Vite app, so importing
// anything outside plain fetch/JSON risks the two builds resolving modules
// differently.

const UPSTASH_URL = process.env.UPSTASH_REDIS_REST_URL;
const UPSTASH_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;

const RATE_LIMIT_PER_MINUTE = 10;

function assertConfigured(): { url: string; token: string } {
  if (!UPSTASH_URL || !UPSTASH_TOKEN) {
    throw new Error(
      "UPSTASH_REDIS_REST_URL/UPSTASH_REDIS_REST_TOKEN are not set.",
    );
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

const ID_ALPHABET =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

function generateShortId(length = 10): string {
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);

  let id = "";

  for (const byte of bytes) {
    id += ID_ALPHABET[byte % ID_ALPHABET.length];
  }

  return id;
}

export async function saveCard(payload: unknown): Promise<string> {
  const id = generateShortId();

  await redisRequest(`/set/card:${id}`, JSON.stringify(payload));

  return id;
}

export async function loadCard(id: string): Promise<unknown | null> {
  const raw = await redisRequest(`/get/card:${id}`);

  return typeof raw === "string" ? JSON.parse(raw) : null;
}

// A single INCR+EXPIRE pair reuses the same Redis instance as storage, no
// new infrastructure - rejects once an IP has made more than
// RATE_LIMIT_PER_MINUTE POSTs within the current 60s bucket.
export async function checkRateLimit(ip: string): Promise<boolean> {
  const minuteBucket = Math.floor(Date.now() / 60_000);
  const key = `rl:${ip}:${minuteBucket}`;

  const count = (await redisRequest(`/incr/${key}`)) as number;

  if (count === 1) {
    await redisRequest(`/expire/${key}/60`);
  }

  return count <= RATE_LIMIT_PER_MINUTE;
}
