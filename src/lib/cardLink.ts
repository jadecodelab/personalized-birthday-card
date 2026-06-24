import {
  cardTemplates,
  type CardTemplateId,
  type MovableItemId,
  type TemplateMovableLayout,
} from "./cardData";

export type SharedCardPayload = {
  v: 1;
  name: string;
  month: number;
  day: number;
  templateId: CardTemplateId;
  headline: string;
  body: string;
  layout: TemplateMovableLayout;
  activeStickers: MovableItemId[];
  photoScale: number;
  photoDataUrl: string | null;
};

function toBase64Url(text: string) {
  const base64 = btoa(unescape(encodeURIComponent(text)));

  return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(encoded: string) {
  const base64 = encoded.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);

  return decodeURIComponent(escape(atob(padded)));
}

export function encodeCardLink(payload: SharedCardPayload) {
  return toBase64Url(JSON.stringify(payload));
}

// Shared by decodeCardLink (fragment links) and fetchCardById (short links)
// - both receive untrusted data and need the same shape check.
function isValidSharedCardPayload(data: unknown): data is SharedCardPayload {
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
    cardTemplates.some((template) => template.id === candidate.templateId)
  );
}

export function decodeCardLink(encoded: string): SharedCardPayload | null {
  try {
    const data = JSON.parse(fromBase64Url(encoded));

    return isValidSharedCardPayload(data) ? data : null;
  } catch {
    return null;
  }
}

export function buildCardShareUrl(payload: SharedCardPayload) {
  // The encoded payload (photo included) can run well past typical server
  // header-size limits, so it travels in the URL fragment, which browsers
  // never send to the server, rather than the query string.
  return `${window.location.origin}/card#d=${encodeCardLink(payload)}`;
}

// Stores the payload server-side via POST /api/cards and returns a short
// link (/c/<id>) instead of inlining the whole card into the URL - see
// api/cards.ts. Throws on any failure; callers already have try/catch
// around link creation (CreatePage.tsx's handleCreateCardLink).
export async function createShortCardLink(payload: SharedCardPayload) {
  const response = await fetch("/api/cards", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`Could not create the link (${response.status}).`);
  }

  const { id } = (await response.json()) as { id: string };

  return `${window.location.origin}/c/${id}`;
}

// Fetches a short-link card by id (ShortCardPage.tsx). Returns null for a
// missing/expired id or a malformed response, same "fail quietly to null"
// shape as decodeCardLink, rather than throwing for the everyday case of a
// stale link.
export async function fetchCardById(id: string): Promise<SharedCardPayload | null> {
  try {
    const response = await fetch(`/api/cards?id=${encodeURIComponent(id)}`);

    if (!response.ok) {
      return null;
    }

    const data = await response.json();

    return isValidSharedCardPayload(data) ? data : null;
  } catch {
    return null;
  }
}
