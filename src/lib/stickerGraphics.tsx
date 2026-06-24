import type { ReactNode } from "react";

// The actual artwork for each sticker, shared between the live draggable
// card (CardPreview) and the static preview shown in the picker, so the
// picker always shows exactly what adding a sticker will look like.
export const stickerGraphicViewBox: Record<string, string> = {
  cake: "0 0 140 140",
  flowers: "0 0 150 150",
  balloons: "0 0 140 160",
  gift: "0 0 140 140",
};

// A single free-floating balloon, in the same style as the "balloons"
// sticker above, for the envelope-reveal celebration burst (which needs one
// balloon per piece, recolored per the card's gift-wrap palette, rather than
// the sticker's fixed two-balloon pair).
export function BalloonGraphic({ color }: { color: string }) {
  return (
    <svg className="balloon-graphic" viewBox="0 0 60 86" aria-hidden="true">
      <ellipse cx="30" cy="32" rx="22" ry="28" fill={color} />
      <circle cx="22" cy="20" r="6" fill="#fffaf0" opacity="0.55" />
      <path d="M25 58h10l-5 9z" fill={color} />
      <path
        d="M30 67c-5 6 4 11 0 19"
        fill="none"
        stroke="rgb(255 255 255 / 0.4)"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

export const stickerGraphicContent: Record<string, ReactNode> = {
  cake: (
    <>
      <path
        d="M24 113c12 8 80 8 92 0"
        fill="none"
        stroke="#7a3155"
        strokeLinecap="round"
        strokeWidth="8"
      />
      <rect x="34" y="72" width="72" height="36" rx="8" fill="#ff7aa8" />
      <path
        d="M34 82c8-8 15 8 23 0s15 8 23 0 15 8 26 0v14H34z"
        fill="#fff1f6"
      />
      <rect x="46" y="50" width="48" height="26" rx="7" fill="#ffd15c" />
      <path
        d="M46 60c7-7 12 7 18 0s12 7 18 0 8 5 12 0v12H46z"
        fill="#fff7cf"
      />
      <rect x="66" y="28" width="8" height="22" rx="3" fill="#4db6e8" />
      <path d="M70 14c10 12-1 18-1 18s-11-7 1-18z" fill="#ffcf3f" />
      <circle cx="50" cy="92" r="3" fill="#ffffff" />
      <circle cx="69" cy="94" r="3" fill="#ffffff" />
      <circle cx="88" cy="92" r="3" fill="#ffffff" />
    </>
  ),
  flowers: (
    <>
      <path
        d="M71 134c-2-28 3-50 12-72"
        fill="none"
        stroke="#277b73"
        strokeLinecap="round"
        strokeWidth="7"
      />
      <path d="M73 104c-20-8-31-22-32-42 22 3 34 16 32 42z" fill="#59c6a4" />
      <path d="M84 92c19-8 31-20 36-38-22 1-36 13-36 38z" fill="#74d6bc" />
      <circle cx="76" cy="54" r="10" fill="#ffcf3f" />
      <circle cx="76" cy="31" r="17" fill="#ff8fb3" />
      <circle cx="100" cy="54" r="17" fill="#ff8fb3" />
      <circle cx="76" cy="77" r="17" fill="#ff8fb3" />
      <circle cx="52" cy="54" r="17" fill="#ff8fb3" />
      <circle cx="76" cy="54" r="15" fill="#fff7cf" />
    </>
  ),
  balloons: (
    <>
      <path
        d="M50 68c-9 30 14 52 2 84M90 72c4 28-16 48-9 80"
        fill="none"
        stroke="#7a3155"
        strokeLinecap="round"
        strokeWidth="4"
      />
      <ellipse cx="48" cy="46" rx="27" ry="35" fill="#4d9de0" />
      <ellipse cx="91" cy="48" rx="27" ry="35" fill="#ff6b94" />
      <path d="M43 78h12l-6 11z" fill="#4d9de0" />
      <path d="M86 80h12l-6 11z" fill="#ff6b94" />
      <circle cx="39" cy="32" r="7" fill="#ffffff" opacity="0.72" />
      <circle cx="82" cy="34" r="7" fill="#ffffff" opacity="0.72" />
    </>
  ),
  gift: (
    <>
      <rect x="29" y="60" width="82" height="56" rx="8" fill="#31c6b4" />
      <rect x="62" y="60" width="16" height="56" fill="#ffcf3f" />
      <rect x="22" y="48" width="96" height="20" rx="7" fill="#ff6b94" />
      <rect x="63" y="48" width="14" height="20" fill="#ffcf3f" />
      <path
        d="M68 48c-22-2-28-20-16-27 12-7 18 15 18 27"
        fill="none"
        stroke="#ffcf3f"
        strokeLinecap="round"
        strokeWidth="8"
      />
      <path
        d="M73 48c22-2 28-20 16-27-12-7-18 15-18 27"
        fill="none"
        stroke="#ffcf3f"
        strokeLinecap="round"
        strokeWidth="8"
      />
    </>
  ),
};
