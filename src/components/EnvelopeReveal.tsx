import { useState, type CSSProperties, type ReactNode } from "react";
import { playBirthdayTune } from "../lib/sound";

type EnvelopeRevealProps = {
  recipientName: string;
  children: ReactNode;
};

type RevealPhase = "closed" | "anticipating" | "open";

// Gives the tap a beat to register as "something is about to happen" before
// the envelope actually moves - skipped entirely for prefers-reduced-motion,
// since a silent pause with nothing animating reads as lag, not anticipation.
const ANTICIPATION_PAUSE_MS = 450;

// How long after the open phase starts the card has finished sliding in and
// settling (matches the CSS: 0.65s transition-delay + 1s duration on
// .envelope-reveal-card). The music waits this long, plus a further pause,
// so it starts once the recipient can actually see the card.
const CARD_SETTLE_MS = 1650;
const MUSIC_DELAY_AFTER_CARD_MS = 3000;

// Spread across the whole preview section (the confetti layer itself is
// enlarged well past the card's own box in CSS), not just two edge clusters,
// so it visibly rains across the full panel rather than staying confined to
// a narrow column. Slower, bigger pieces for visibility.
const CONFETTI_PIECES = [
  { left: "2%", color: "#ff6b94", width: "9px", height: "15px", stagger: "0ms", burstX: "-12px", driftX: "-46px", fallY: "560px", rotate: "420deg", duration: "3.4s" },
  { left: "9%", color: "#ffcf3f", width: "12px", height: "19px", stagger: "180ms", burstX: "14px", driftX: "38px", fallY: "600px", rotate: "-380deg", duration: "3.8s" },
  { left: "16%", color: "#31c6b4", width: "8px", height: "13px", stagger: "60ms", burstX: "-10px", driftX: "-30px", fallY: "520px", rotate: "460deg", duration: "3.2s" },
  { left: "23%", color: "#4d9de0", width: "11px", height: "17px", stagger: "300ms", burstX: "12px", driftX: "44px", fallY: "640px", rotate: "-420deg", duration: "4.0s" },
  { left: "30%", color: "#ff8fb3", width: "7px", height: "12px", stagger: "120ms", burstX: "-14px", driftX: "-36px", fallY: "580px", rotate: "500deg", duration: "3.6s" },
  { left: "37%", color: "#ffd15c", width: "13px", height: "20px", stagger: "400ms", burstX: "10px", driftX: "32px", fallY: "560px", rotate: "-360deg", duration: "3.5s" },
  { left: "44%", color: "#59c6a4", width: "9px", height: "15px", stagger: "40ms", burstX: "-12px", driftX: "-42px", fallY: "620px", rotate: "440deg", duration: "3.9s" },
  { left: "51%", color: "#ff6b94", width: "10px", height: "16px", stagger: "260ms", burstX: "14px", driftX: "40px", fallY: "590px", rotate: "-480deg", duration: "3.7s" },
  { left: "58%", color: "#4d9de0", width: "8px", height: "13px", stagger: "150ms", burstX: "-10px", driftX: "-34px", fallY: "550px", rotate: "400deg", duration: "3.3s" },
  { left: "65%", color: "#ffcf3f", width: "12px", height: "19px", stagger: "350ms", burstX: "16px", driftX: "46px", fallY: "650px", rotate: "-440deg", duration: "4.1s" },
  { left: "72%", color: "#31c6b4", width: "7px", height: "12px", stagger: "80ms", burstX: "-14px", driftX: "-38px", fallY: "570px", rotate: "520deg", duration: "3.5s" },
  { left: "78%", color: "#ff8fb3", width: "11px", height: "17px", stagger: "220ms", burstX: "12px", driftX: "36px", fallY: "600px", rotate: "-400deg", duration: "3.8s" },
  { left: "84%", color: "#ffd15c", width: "9px", height: "15px", stagger: "20ms", burstX: "-10px", driftX: "-30px", fallY: "530px", rotate: "460deg", duration: "3.2s" },
  { left: "90%", color: "#59c6a4", width: "10px", height: "16px", stagger: "290ms", burstX: "14px", driftX: "42px", fallY: "610px", rotate: "-420deg", duration: "3.9s" },
  { left: "96%", color: "#ff6b94", width: "8px", height: "13px", stagger: "440ms", burstX: "-12px", driftX: "-36px", fallY: "580px", rotate: "480deg", duration: "3.6s" },
  { left: "5%", color: "#4d9de0", width: "12px", height: "19px", stagger: "330ms", burstX: "10px", driftX: "32px", fallY: "540px", rotate: "-360deg", duration: "3.4s" },
  { left: "26%", color: "#ffd15c", width: "9px", height: "15px", stagger: "100ms", burstX: "-14px", driftX: "-44px", fallY: "630px", rotate: "440deg", duration: "4.0s" },
  { left: "47%", color: "#31c6b4", width: "11px", height: "17px", stagger: "470ms", burstX: "12px", driftX: "38px", fallY: "560px", rotate: "-460deg", duration: "3.5s" },
  { left: "69%", color: "#ff8fb3", width: "8px", height: "13px", stagger: "200ms", burstX: "-10px", driftX: "-32px", fallY: "590px", rotate: "400deg", duration: "3.7s" },
  { left: "93%", color: "#ffcf3f", width: "10px", height: "16px", stagger: "380ms", burstX: "16px", driftX: "40px", fallY: "550px", rotate: "-440deg", duration: "3.3s" },
];

// Just two large balloons, one per side, instead of a small crowd - they're
// the closing beat of the sequence, not background filler.
const BALLOON_PIECES = [
  { left: "6%", color: "#ff6b94", stagger: "0ms", drift: "22px", tilt: "8deg", duration: "7s" },
  { left: "90%", color: "#4d9de0", stagger: "250ms", drift: "-20px", tilt: "-8deg", duration: "7.3s" },
];

export default function EnvelopeReveal({
  recipientName,
  children,
}: EnvelopeRevealProps) {
  const [phase, setPhase] = useState<RevealPhase>("closed");

  function handleOpen() {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (prefersReducedMotion) {
      setPhase("open");
      window.setTimeout(playBirthdayTune, MUSIC_DELAY_AFTER_CARD_MS);
      return;
    }

    setPhase("anticipating");
    window.setTimeout(() => {
      setPhase("open");
      window.setTimeout(
        playBirthdayTune,
        CARD_SETTLE_MS + MUSIC_DELAY_AFTER_CARD_MS,
      );
    }, ANTICIPATION_PAUSE_MS);
  }

  return (
    <div
      className={`envelope-reveal envelope-reveal--${phase}`}
    >
      <div className="envelope-reveal-card" aria-hidden={phase !== "open"}>
        {children}
      </div>
      <button
        type="button"
        className="envelope"
        onClick={handleOpen}
        disabled={phase !== "closed"}
        aria-label={`Open the birthday card for ${recipientName}`}
      >
        <span className="envelope-back" aria-hidden="true" />
        <span className="envelope-flap" aria-hidden="true">
          <span className="envelope-seal" aria-hidden="true" />
        </span>
        <span className="envelope-front" aria-hidden="true">
          <span className="envelope-to">To: {recipientName}</span>
          <span className="envelope-prompt">Tap to open</span>
        </span>
      </button>
      <div className="confetti-burst" aria-hidden="true">
        {CONFETTI_PIECES.map((piece, index) => (
          <span
            key={index}
            className="confetti-piece"
            style={
              {
                "--piece-left": piece.left,
                "--piece-color": piece.color,
                "--piece-width": piece.width,
                "--piece-height": piece.height,
                "--piece-stagger": piece.stagger,
                "--piece-burst-x": piece.burstX,
                "--piece-drift-x": piece.driftX,
                "--piece-fall-y": piece.fallY,
                "--piece-rotate": piece.rotate,
                "--piece-duration": piece.duration,
              } as CSSProperties
            }
          />
        ))}
      </div>
      <div className="balloon-burst" aria-hidden="true">
        {BALLOON_PIECES.map((piece, index) => (
          <span
            key={index}
            className="balloon-piece"
            style={
              {
                "--balloon-left": piece.left,
                "--balloon-color": piece.color,
                "--balloon-stagger": piece.stagger,
                "--balloon-drift": piece.drift,
                "--balloon-tilt": piece.tilt,
                "--balloon-duration": piece.duration,
              } as CSSProperties
            }
          />
        ))}
      </div>
    </div>
  );
}
