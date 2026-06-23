import { cardTemplates, type CardTemplateId, type TemplateMovableLayout } from "./cardData";

export type SharedCardPayload = {
  v: 1;
  name: string;
  month: number;
  day: number;
  templateId: CardTemplateId;
  headline: string;
  body: string;
  layout: TemplateMovableLayout;
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

export function decodeCardLink(encoded: string): SharedCardPayload | null {
  try {
    const data = JSON.parse(fromBase64Url(encoded));

    if (
      !data ||
      typeof data !== "object" ||
      data.v !== 1 ||
      typeof data.name !== "string" ||
      typeof data.month !== "number" ||
      typeof data.day !== "number" ||
      typeof data.headline !== "string" ||
      typeof data.body !== "string" ||
      typeof data.photoScale !== "number" ||
      !data.layout ||
      typeof data.layout !== "object" ||
      !cardTemplates.some((template) => template.id === data.templateId)
    ) {
      return null;
    }

    return data as SharedCardPayload;
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
