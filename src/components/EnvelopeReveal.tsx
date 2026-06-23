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

// Two small clusters near the card's left/right edges rather than confetti
// raining across the full width - a "burst from both sides," not a downpour.
const CONFETTI_PIECES = [
  { left: "2%", color: "#ff6b94", width: "7px", height: "12px", stagger: "0ms", burstX: "-16px", driftX: "-26px", fallY: "300px", rotate: "380deg", duration: "1.9s" },
  { left: "8%", color: "#ffcf3f", width: "10px", height: "16px", stagger: "90ms", burstX: "-12px", driftX: "-18px", fallY: "340px", rotate: "300deg", duration: "2.1s" },
  { left: "14%", color: "#31c6b4", width: "6px", height: "10px", stagger: "40ms", burstX: "-18px", driftX: "-22px", fallY: "280px", rotate: "420deg", duration: "1.8s" },
  { left: "4%", color: "#4d9de0", width: "9px", height: "14px", stagger: "160ms", burstX: "-10px", driftX: "-16px", fallY: "330px", rotate: "340deg", duration: "2.0s" },
  { left: "18%", color: "#ff8fb3", width: "8px", height: "13px", stagger: "70ms", burstX: "-14px", driftX: "-24px", fallY: "310px", rotate: "400deg", duration: "2.2s" },
  { left: "11%", color: "#59c6a4", width: "11px", height: "17px", stagger: "200ms", burstX: "-20px", driftX: "-20px", fallY: "350px", rotate: "360deg", duration: "1.9s" },
  { left: "92%", color: "#ff6b94", width: "7px", height: "12px", stagger: "20ms", burstX: "16px", driftX: "26px", fallY: "300px", rotate: "-380deg", duration: "1.9s" },
  { left: "86%", color: "#ffcf3f", width: "10px", height: "16px", stagger: "110ms", burstX: "12px", driftX: "18px", fallY: "340px", rotate: "-300deg", duration: "2.1s" },
  { left: "80%", color: "#31c6b4", width: "6px", height: "10px", stagger: "60ms", burstX: "18px", driftX: "22px", fallY: "280px", rotate: "-420deg", duration: "1.8s" },
  { left: "96%", color: "#4d9de0", width: "9px", height: "14px", stagger: "180ms", burstX: "10px", driftX: "16px", fallY: "330px", rotate: "-340deg", duration: "2.0s" },
  { left: "82%", color: "#ff8fb3", width: "8px", height: "13px", stagger: "50ms", burstX: "14px", driftX: "24px", fallY: "310px", rotate: "-400deg", duration: "2.2s" },
  { left: "89%", color: "#ffd15c", width: "11px", height: "17px", stagger: "220ms", burstX: "20px", driftX: "20px", fallY: "350px", rotate: "-360deg", duration: "1.9s" },
];

// Anchored at the bottom corners, not spread across the whole width, so they
// rise past the card's edges instead of drifting over the message/photo.
const BALLOON_PIECES = [
  { left: "-2%", color: "#ff6b94", stagger: "0ms", drift: "18px", tilt: "9deg", duration: "5.2s" },
  { left: "6%", color: "#ffd15c", stagger: "550ms", drift: "-14px", tilt: "-8deg", duration: "5.8s" },
  { left: "92%", color: "#4d9de0", stagger: "250ms", drift: "-16px", tilt: "-9deg", duration: "5.6s" },
  { left: "98%", color: "#ff8fb3", stagger: "800ms", drift: "14px", tilt: "8deg", duration: "5.0s" },
  { left: "12%", color: "#59c6a4", stagger: "1100ms", drift: "16px", tilt: "10deg", duration: "5.4s" },
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
      playBirthdayTune();
      setPhase("open");
      return;
    }

    setPhase("anticipating");
    window.setTimeout(() => {
      playBirthdayTune();
      setPhase("open");
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
