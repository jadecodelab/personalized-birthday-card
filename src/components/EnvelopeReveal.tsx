import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { isMuted, playSound, toggleMuted, type SoundCue } from "../lib/sound";
import { BalloonGraphic } from "../lib/stickerGraphics";

type EnvelopeRevealProps = {
  recipientName: string;
  children: ReactNode;
};

// "arrival" is the resting/replay-reset state - the envelope itself still
// plays its own entrance animation there, it's just not "closed and inert."
// Every later phase is reached once and then stays reached (see
// hasReachedPhase) so animations gated on a later phase don't get cut off
// when the phase class moves on to the next name.
type RevealPhase =
  | "arrival"
  | "interaction"
  | "opening"
  | "revealing"
  | "celebrating"
  | "ballooning"
  | "message"
  | "ending";

const PHASE_ORDER: RevealPhase[] = [
  "arrival",
  "interaction",
  "opening",
  "revealing",
  "celebrating",
  "ballooning",
  "message",
  "ending",
];

function hasReachedPhase(current: RevealPhase, target: RevealPhase) {
  return PHASE_ORDER.indexOf(current) >= PHASE_ORDER.indexOf(target);
}

// Every phase after "interaction" fires this many ms after the tap (t0).
// Interaction itself fires synchronously on tap, at delay 0. Kept as one
// table instead of nested callbacks so the whole sequence can be read and
// retimed in one place rather than chased through control flow.
const PHASE_TIMING: Record<Exclude<RevealPhase, "arrival" | "interaction">, number> = {
  opening: 420,
  revealing: 2320,
  celebrating: 3680,
  ballooning: 4400,
  message: 5600,
  ending: 7600,
};

const PHASE_SOUND: Partial<Record<RevealPhase, SoundCue>> = {
  interaction: "rustle",
  opening: "open",
  celebrating: "chime",
  message: "sparkle",
  ending: "melody",
};

// A reduced-motion recipient still gets the full named sequence, just
// compressed into two calm beats instead of eight timed/animated ones.
const REDUCED_MOTION_MESSAGE_DELAY_MS = 500;
const REDUCED_MOTION_ENDING_DELAY_MS = 2200;

const GOLD = "#d9b66b";
const ROSE_GOLD = "#e3b6ab";
const CREAM = "#f7ecd9";
const BLUSH = "#f1c8c0";
const BRONZE = "#b8895f";
const CONFETTI_PALETTE = [GOLD, ROSE_GOLD, CREAM, BLUSH, BRONZE];

type ConfettiTier = 1 | 2 | 3;

const CONFETTI_TIERS: Array<{ tier: ConfettiTier; count: number; durationMultiplier: number }> = [
  { tier: 1, count: 10, durationMultiplier: 1.3 },
  { tier: 2, count: 14, durationMultiplier: 1.0 },
  { tier: 3, count: 10, durationMultiplier: 0.8 },
];

type ConfettiPieceConfig = {
  tier: ConfettiTier;
  left: string;
  color: string;
  width: string;
  height: string;
  stagger: string;
  burstX: string;
  driftX: string;
  fallY: string;
  rotate: string;
  duration: string;
};

// A small seeded PRNG (not Math.random) so the burst layout is reproducible
// across renders/replays instead of reshuffling every time the component
// remounts.
function createSeededRandom(seed: number) {
  let value = seed;

  return () => {
    value = (value * 9301 + 49297) % 233280;
    return value / 233280;
  };
}

function buildConfettiPieces(): ConfettiPieceConfig[] {
  const random = createSeededRandom(7);
  const pieces: ConfettiPieceConfig[] = [];

  for (const { tier, count, durationMultiplier } of CONFETTI_TIERS) {
    for (let i = 0; i < count; i += 1) {
      pieces.push({
        tier,
        left: `${Math.round(2 + random() * 94)}%`,
        color: CONFETTI_PALETTE[Math.floor(random() * CONFETTI_PALETTE.length)],
        width: `${7 + Math.round(random() * 6)}px`,
        height: `${12 + Math.round(random() * 8)}px`,
        stagger: `${Math.round(random() * 480)}ms`,
        burstX: `${Math.round((random() - 0.5) * 28)}px`,
        driftX: `${Math.round((random() - 0.5) * 92)}px`,
        fallY: `${520 + Math.round(random() * 130)}px`,
        rotate: `${Math.round((random() - 0.5) * 920)}deg`,
        duration: `${((3.2 + random() * 0.9) * durationMultiplier).toFixed(2)}s`,
      });
    }
  }

  return pieces;
}

const CONFETTI_PIECES = buildConfettiPieces();

type BalloonPieceConfig = {
  left: string;
  color: string;
  stagger: string;
  drift: string;
  tilt: string;
  scale: number;
  duration: string;
};

// Two per side, confined to the outer ~18% margins (left: 0-18%, right:
// 82-100%) so balloons never cross into the card's central column where the
// photo/message live.
const BALLOON_PIECES: BalloonPieceConfig[] = [
  { left: "0%", color: GOLD, stagger: "0ms", drift: "16px", tilt: "6deg", scale: 1, duration: "2.6s" },
  { left: "10%", color: CREAM, stagger: "650ms", drift: "-14px", tilt: "-5deg", scale: 0.84, duration: "2.3s" },
  { left: "89%", color: ROSE_GOLD, stagger: "300ms", drift: "-16px", tilt: "-6deg", scale: 1, duration: "2.7s" },
  { left: "79%", color: BLUSH, stagger: "850ms", drift: "14px", tilt: "5deg", scale: 0.84, duration: "2.4s" },
];

function SpeakerIcon({ muted }: { muted: boolean }) {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
      <path d="M4 9.5v5h3.2L12 18.5v-13L7.2 9.5H4Z" fill="currentColor" />
      {muted ? (
        <path
          d="M15.5 9.5l5 5m0-5l-5 5"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          fill="none"
        />
      ) : (
        <path
          d="M15.8 8.5a5 5 0 0 1 0 7M18.3 6a8.5 8.5 0 0 1 0 12"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          fill="none"
        />
      )}
    </svg>
  );
}

export default function EnvelopeReveal({
  recipientName,
  children,
}: EnvelopeRevealProps) {
  const [phase, setPhase] = useState<RevealPhase>("arrival");
  const [muted, setMutedState] = useState(() => isMuted());

  function handleToggleMute() {
    setMutedState(toggleMuted());
  }

  // Tracks every in-flight setTimeout from the current sequence so a replay
  // can cancel anything still pending from the previous one instead of
  // letting both run.
  const pendingTimeoutIds = useRef<number[]>([]);

  useEffect(() => {
    return () => {
      pendingTimeoutIds.current.forEach((id) => window.clearTimeout(id));
    };
  }, []);

  function clearPendingTimeouts() {
    pendingTimeoutIds.current.forEach((id) => window.clearTimeout(id));
    pendingTimeoutIds.current = [];
  }

  function scheduleTimeout(callback: () => void, delay: number) {
    const id = window.setTimeout(callback, delay);
    pendingTimeoutIds.current.push(id);
  }

  function handleOpen() {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (prefersReducedMotion) {
      setPhase("message");
      playSound("chime");
      scheduleTimeout(() => playSound("melody"), REDUCED_MOTION_MESSAGE_DELAY_MS);
      scheduleTimeout(() => setPhase("ending"), REDUCED_MOTION_ENDING_DELAY_MS);
      return;
    }

    setPhase("interaction");
    playSound("rustle");

    (Object.keys(PHASE_TIMING) as Array<keyof typeof PHASE_TIMING>).forEach((nextPhase) => {
      scheduleTimeout(() => {
        setPhase(nextPhase);
        const cue = PHASE_SOUND[nextPhase];

        if (cue) {
          playSound(cue);
        }
      }, PHASE_TIMING[nextPhase]);
    });
  }

  // Resets to "arrival" and waits two animation frames before reopening, so
  // the browser actually repaints the closed envelope in between - without
  // that gap, React batches both state changes into one render and the CSS
  // phase-triggered animations never restart, since their trigger never
  // visibly toggled off.
  function handleReplay() {
    clearPendingTimeouts();
    setPhase("arrival");
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(handleOpen);
    });
  }

  const reachedAttributes: Record<string, string> = {};

  for (const target of PHASE_ORDER.slice(1)) {
    if (hasReachedPhase(phase, target)) {
      reachedAttributes[`data-reached-${target}`] = "";
    }
  }

  return (
    <div className="envelope-reveal-wrapper" {...reachedAttributes}>
      <div className={`envelope-reveal envelope-reveal--${phase}`}>
        <button
          type="button"
          className="mute-toggle-button"
          onClick={handleToggleMute}
          aria-pressed={muted}
          aria-label={muted ? "Unmute sound" : "Mute sound"}
        >
          <SpeakerIcon muted={muted} />
        </button>
        <div className="arrival-particles" aria-hidden="true">
          <span className="arrival-particle arrival-particle--one" />
          <span className="arrival-particle arrival-particle--two" />
          <span className="arrival-particle arrival-particle--three" />
          <span className="arrival-particle arrival-particle--four" />
        </div>
        <div className="reveal-glow" aria-hidden="true" />
        <div
          className="envelope-reveal-card"
          aria-hidden={!hasReachedPhase(phase, "revealing")}
        >
          {children}
        </div>
        <button
          type="button"
          className="envelope"
          onClick={handleOpen}
          disabled={phase !== "arrival"}
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
              data-tier={piece.tier}
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
                  "--balloon-stagger": piece.stagger,
                  "--balloon-drift": piece.drift,
                  "--balloon-tilt": piece.tilt,
                  "--balloon-scale": piece.scale,
                  "--balloon-duration": piece.duration,
                } as CSSProperties
              }
            >
              <span className="balloon-sway">
                <BalloonGraphic color={piece.color} />
              </span>
            </span>
          ))}
        </div>
      </div>
      {hasReachedPhase(phase, "ending") && (
        <button
          type="button"
          className="envelope-replay-button"
          onClick={handleReplay}
        >
          Watch it open again
        </button>
      )}
    </div>
  );
}
