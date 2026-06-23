import { useState, type CSSProperties, type ReactNode } from "react";
import { playBirthdayTune } from "../lib/sound";

type EnvelopeRevealProps = {
  recipientName: string;
  children: ReactNode;
};

const CONFETTI_PIECES = [
  { left: "6%", color: "#ff6b94", delay: "0ms", rotate: "420deg" },
  { left: "14%", color: "#ffcf3f", delay: "60ms", rotate: "600deg" },
  { left: "22%", color: "#31c6b4", delay: "20ms", rotate: "480deg" },
  { left: "30%", color: "#4d9de0", delay: "120ms", rotate: "660deg" },
  { left: "38%", color: "#ff8fb3", delay: "40ms", rotate: "540deg" },
  { left: "46%", color: "#ffd15c", delay: "100ms", rotate: "420deg" },
  { left: "54%", color: "#59c6a4", delay: "10ms", rotate: "600deg" },
  { left: "62%", color: "#ff6b94", delay: "80ms", rotate: "480deg" },
  { left: "70%", color: "#4d9de0", delay: "140ms", rotate: "660deg" },
  { left: "78%", color: "#ffcf3f", delay: "30ms", rotate: "540deg" },
  { left: "86%", color: "#31c6b4", delay: "90ms", rotate: "420deg" },
  { left: "94%", color: "#ff8fb3", delay: "50ms", rotate: "600deg" },
  { left: "10%", color: "#ffd15c", delay: "160ms", rotate: "480deg" },
  { left: "50%", color: "#59c6a4", delay: "180ms", rotate: "660deg" },
  { left: "66%", color: "#ff6b94", delay: "70ms", rotate: "540deg" },
  { left: "90%", color: "#4d9de0", delay: "150ms", rotate: "420deg" },
];

export default function EnvelopeReveal({
  recipientName,
  children,
}: EnvelopeRevealProps) {
  const [isOpen, setIsOpen] = useState(false);

  function handleOpen() {
    playBirthdayTune();
    setIsOpen(true);
  }

  return (
    <div
      className={`envelope-reveal ${isOpen ? "envelope-reveal--open" : ""}`}
    >
      <div className="envelope-reveal-card" aria-hidden={!isOpen}>
        {children}
      </div>
      <button
        type="button"
        className="envelope"
        onClick={handleOpen}
        disabled={isOpen}
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
                "--piece-delay": piece.delay,
                "--piece-rotate": piece.rotate,
              } as CSSProperties
            }
          />
        ))}
      </div>
    </div>
  );
}
