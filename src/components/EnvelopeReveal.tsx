import { useState, type ReactNode } from "react";
import { playOpenChime } from "../lib/sound";

type EnvelopeRevealProps = {
  recipientName: string;
  children: ReactNode;
};

export default function EnvelopeReveal({
  recipientName,
  children,
}: EnvelopeRevealProps) {
  const [isOpen, setIsOpen] = useState(false);

  function handleOpen() {
    playOpenChime();
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
    </div>
  );
}
