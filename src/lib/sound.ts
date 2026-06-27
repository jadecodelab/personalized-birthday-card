export type SoundCue = "rustle" | "open" | "chime" | "sparkle" | "melody";

// Drop a real file at any of these paths (e.g. public/sounds/chime.mp3) and
// playSound() picks it up automatically with no code change - the synthesis
// functions below are the fallback for whichever cues don't have a file yet,
// not a placeholder to be deleted once files exist.
const SOUND_FILES: Record<SoundCue, string> = {
  rustle: "/sounds/rustle.mp3",
  open: "/sounds/open.mp3",
  chime: "/sounds/chime.mp3",
  sparkle: "/sounds/sparkle.mp3",
  melody: "/sounds/melody.mp3",
};

const MUTE_STORAGE_KEY = "birthday-card-sound-muted";

function loadMutedPreference(): boolean {
  try {
    return window.localStorage.getItem(MUTE_STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

let muted = loadMutedPreference();

let audioContext: AudioContext | null = null;
let masterGain: GainNode | null = null;

function getAudioContext() {
  if (!audioContext) {
    audioContext = new AudioContext();
    masterGain = audioContext.createGain();
    masterGain.gain.value = muted ? 0 : 1;
    masterGain.connect(audioContext.destination);
  }

  if (audioContext.state === "suspended") {
    audioContext.resume();
  }

  return audioContext;
}

// Every synthesized sound connects here instead of straight to
// context.destination, so toggling mute can silence anything already
// playing (e.g. mid-way through the ~60s melody) by zeroing one gain
// node, rather than needing to track and stop every individual
// oscillator/buffer source in flight. getAudioContext() always creates
// masterGain alongside audioContext, so it's never null once called.
function getMasterGain(): GainNode {
  getAudioContext();
  return masterGain as GainNode;
}

function withAudioContext(run: (context: AudioContext) => void) {
  try {
    run(getAudioContext());
  } catch {
    // Web Audio isn't available in this browser - stay silent rather than throwing.
  }
}

export function isMuted(): boolean {
  return muted;
}

export function setMuted(value: boolean): void {
  muted = value;

  try {
    window.localStorage.setItem(MUTE_STORAGE_KEY, value ? "1" : "0");
  } catch {
    // Storage unavailable (private browsing, etc.) - mute still works for this session.
  }

  if (masterGain) {
    masterGain.gain.value = value ? 0 : 1;
  }

  for (const audio of Object.values(activeAudioElements)) {
    if (audio) {
      audio.muted = value;
    }
  }
}

export function toggleMuted(): boolean {
  setMuted(!muted);
  return muted;
}

// Stops anything currently audible: pauses/rewinds every tracked file-based
// cue, and - since synthesized cues are made of oscillators/buffer sources
// with no individual handles to call .stop() on - cuts them off by swapping
// in a fresh masterGain disconnected from the old one, rather than the
// destination. Anything already scheduled keeps running silently into the
// detached old node instead of leaking into the new mix.
export function stopAllSounds(): void {
  for (const cue of Object.keys(activeAudioElements) as SoundCue[]) {
    const audio = activeAudioElements[cue];

    if (audio) {
      audio.pause();
      audio.currentTime = 0;
      delete activeAudioElements[cue];
    }
  }

  if (audioContext && masterGain) {
    masterGain.disconnect();
    masterGain = audioContext.createGain();
    masterGain.gain.value = muted ? 0 : 1;
    masterGain.connect(audioContext.destination);
  }
}

function createNoiseBuffer(context: AudioContext, durationSeconds: number) {
  const buffer = context.createBuffer(
    1,
    Math.ceil(context.sampleRate * durationSeconds),
    context.sampleRate,
  );
  const data = buffer.getChannelData(0);

  for (let i = 0; i < data.length; i += 1) {
    data[i] = Math.random() * 2 - 1;
  }

  return buffer;
}

// A short band-/high-passed noise burst - paper texture and whoosh transients
// are noise, not tones, so an oscillator can't produce them convincingly.
function playNoiseBurst(
  context: AudioContext,
  startTime: number,
  options: {
    duration?: number;
    gain?: number;
    filterFrequency?: number;
    filterType?: BiquadFilterType;
    sweepTo?: number;
  } = {},
) {
  const {
    duration = 0.3,
    gain = 0.16,
    filterFrequency = 1800,
    filterType = "bandpass",
    sweepTo,
  } = options;

  const source = context.createBufferSource();
  source.buffer = createNoiseBuffer(context, duration);

  const filter = context.createBiquadFilter();
  filter.type = filterType;
  filter.frequency.setValueAtTime(filterFrequency, startTime);

  if (sweepTo) {
    filter.frequency.exponentialRampToValueAtTime(sweepTo, startTime + duration);
  }

  const gainNode = context.createGain();
  gainNode.gain.setValueAtTime(0, startTime);
  gainNode.gain.linearRampToValueAtTime(gain, startTime + 0.02);
  gainNode.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

  source.connect(filter);
  filter.connect(gainNode);
  gainNode.connect(getMasterGain());

  source.start(startTime);
  source.stop(startTime + duration + 0.02);
}

// Two slightly detuned sine partials through a filter that closes over the
// note's life - a cheap approximation of a music-box/bell pluck (the real
// thing is a Karplus-Strong delay line, but this gets the "soft metallic
// decay" character without a custom DSP loop).
function playPluck(
  context: AudioContext,
  frequency: number,
  startTime: number,
  options: { gain?: number; brightness?: number; decay?: number } = {},
) {
  const { gain = 0.18, brightness = 2600, decay = 1.1 } = options;

  const fundamental = context.createOscillator();
  const overtone = context.createOscillator();
  const filter = context.createBiquadFilter();
  const gainNode = context.createGain();

  fundamental.type = "sine";
  overtone.type = "sine";
  fundamental.frequency.value = frequency;
  overtone.frequency.value = frequency * 2.005;

  filter.type = "lowpass";
  filter.frequency.setValueAtTime(brightness, startTime);
  filter.frequency.exponentialRampToValueAtTime(
    Math.max(frequency * 1.5, 300),
    startTime + decay,
  );

  gainNode.gain.setValueAtTime(0, startTime);
  gainNode.gain.linearRampToValueAtTime(gain, startTime + 0.012);
  gainNode.gain.exponentialRampToValueAtTime(0.0001, startTime + decay);

  fundamental.connect(filter);
  overtone.connect(filter);
  filter.connect(gainNode);
  gainNode.connect(getMasterGain());

  fundamental.start(startTime);
  overtone.start(startTime);
  fundamental.stop(startTime + decay + 0.05);
  overtone.stop(startTime + decay + 0.05);
}

function playRustle(context: AudioContext, startTime: number) {
  playNoiseBurst(context, startTime, {
    duration: 0.26,
    gain: 0.12,
    filterFrequency: 3200,
    filterType: "highpass",
  });
}

function playWhoosh(context: AudioContext, startTime: number) {
  playNoiseBurst(context, startTime, {
    duration: 0.5,
    gain: 0.13,
    filterFrequency: 2400,
    filterType: "bandpass",
    sweepTo: 600,
  });

  const oscillator = context.createOscillator();
  const gainNode = context.createGain();

  oscillator.type = "sine";
  oscillator.frequency.setValueAtTime(420, startTime);
  oscillator.frequency.exponentialRampToValueAtTime(140, startTime + 0.55);

  gainNode.gain.setValueAtTime(0, startTime);
  gainNode.gain.linearRampToValueAtTime(0.1, startTime + 0.05);
  gainNode.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.6);

  oscillator.connect(gainNode);
  gainNode.connect(getMasterGain());
  oscillator.start(startTime);
  oscillator.stop(startTime + 0.65);
}

function playChime(context: AudioContext, startTime: number) {
  const notes = [523.25, 659.25, 783.99]; // C5, E5, G5

  notes.forEach((frequency, index) => {
    playPluck(context, frequency, startTime + index * 0.1, {
      gain: 0.17,
      brightness: 2600,
      decay: 1.2,
    });
  });
}

function playSparkle(context: AudioContext, startTime: number) {
  const notes = [1046.5, 1318.51, 1567.98]; // C6, E6, G6

  notes.forEach((frequency, index) => {
    playPluck(context, frequency, startTime + index * 0.07, {
      gain: 0.1,
      brightness: 4200,
      decay: 0.7,
    });
  });
}

const NOTE = {
  C4: 261.63,
  D4: 293.66,
  E4: 329.63,
  F4: 349.23,
  G4: 392.0,
  A4: 440.0,
  Bb4: 466.16,
  C5: 523.25,
};

const EIGHTH = 0.11;
const QUARTER = 0.22;
const HALF = 0.44;

const BASS_ROOT = 130.81; // C3
const BASS_FIFTH = 196.0; // G3

// A short, recognizable rendition of "Happy Birthday to You" - public domain
// since the 2015 US court ruling that Warner/Chappell's copyright claim was
// invalid. Synthesized rather than using an audio file, same as every other
// cue here: no asset to license, nothing to load, until a real melody.mp3
// is dropped in.
const HAPPY_BIRTHDAY_MELODY: Array<[frequency: number, duration: number]> = [
  [NOTE.C4, EIGHTH],
  [NOTE.C4, EIGHTH],
  [NOTE.D4, QUARTER],
  [NOTE.C4, QUARTER],
  [NOTE.F4, QUARTER],
  [NOTE.E4, HALF],

  [NOTE.C4, EIGHTH],
  [NOTE.C4, EIGHTH],
  [NOTE.D4, QUARTER],
  [NOTE.C4, QUARTER],
  [NOTE.G4, QUARTER],
  [NOTE.F4, HALF],

  [NOTE.C4, EIGHTH],
  [NOTE.C4, EIGHTH],
  [NOTE.C5, QUARTER],
  [NOTE.A4, QUARTER],
  [NOTE.F4, QUARTER],
  [NOTE.E4, QUARTER],
  [NOTE.D4, HALF],

  [NOTE.Bb4, EIGHTH],
  [NOTE.Bb4, EIGHTH],
  [NOTE.A4, QUARTER],
  [NOTE.F4, QUARTER],
  [NOTE.G4, QUARTER],
  [NOTE.F4, HALF],
];

// Lead voice as two oscillators a few cents apart instead of one bare
// triangle wave - the slight beating between them is what makes a synth
// voice sound like an instrument instead of a single thin tone.
function playMelodyNote(
  context: AudioContext,
  frequency: number,
  startTime: number,
  duration: number,
  gain: number,
) {
  [-4, 4].forEach((detuneCents) => {
    const oscillator = context.createOscillator();
    const gainNode = context.createGain();

    oscillator.type = "triangle";
    oscillator.frequency.value = frequency;
    oscillator.detune.value = detuneCents;

    gainNode.gain.setValueAtTime(0, startTime);
    gainNode.gain.linearRampToValueAtTime(gain, startTime + 0.02);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

    oscillator.connect(gainNode);
    gainNode.connect(getMasterGain());
    oscillator.start(startTime);
    oscillator.stop(startTime + duration);
  });
}

function playBassNote(
  context: AudioContext,
  frequency: number,
  startTime: number,
  duration: number,
) {
  const oscillator = context.createOscillator();
  const gainNode = context.createGain();

  oscillator.type = "sine";
  oscillator.frequency.value = frequency;

  gainNode.gain.setValueAtTime(0, startTime);
  gainNode.gain.linearRampToValueAtTime(0.1, startTime + 0.02);
  gainNode.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

  oscillator.connect(gainNode);
  gainNode.connect(getMasterGain());
  oscillator.start(startTime);
  oscillator.stop(startTime + duration);
}

function playBirthdayTune(context: AudioContext, startTime: number) {
  let time = startTime;

  for (const [frequency, duration] of HAPPY_BIRTHDAY_MELODY) {
    playMelodyNote(context, frequency, time, duration * 0.8, 0.2);
    time += duration;
  }

  // A simple root/fifth "oom-pah" bass pulse under the melody for a fuller,
  // more festive feel than a single bare melody line.
  const totalDuration = time - startTime;
  let bassTime = startTime;
  let isRoot = true;

  while (bassTime < startTime + totalDuration) {
    playBassNote(context, isRoot ? BASS_ROOT : BASS_FIFTH, bassTime, QUARTER * 0.8);
    bassTime += QUARTER;
    isRoot = !isRoot;
  }
}

const SYNTH_FALLBACKS: Record<SoundCue, () => void> = {
  rustle: () => withAudioContext((context) => playRustle(context, context.currentTime)),
  open: () => withAudioContext((context) => playWhoosh(context, context.currentTime)),
  chime: () => withAudioContext((context) => playChime(context, context.currentTime)),
  sparkle: () => withAudioContext((context) => playSparkle(context, context.currentTime)),
  melody: () => withAudioContext((context) => playBirthdayTune(context, context.currentTime)),
};

// Tries a real file first (silently, since most cues won't have one until
// real assets are sourced - see PROJECT_JOURNAL), falls back to synthesis on
// any load/playback failure, and never throws even if Audio/Web Audio are
// both unavailable.
// Keeps exactly one live reference per cue so an actively-playing element
// can't become eligible for garbage collection just because the function
// that created it returned - a real risk for melody's ~60s runtime, even if
// browsers usually (not guaranteed) keep playing media alive regardless.
const activeAudioElements: Partial<Record<SoundCue, HTMLAudioElement>> = {};

export function playSound(cue: SoundCue) {
  if (muted) {
    return;
  }

  try {
    const audio = new Audio(SOUND_FILES[cue]);

    activeAudioElements[cue] = audio;

    let fellBack = false;

    const useFallback = () => {
      if (fellBack) {
        return;
      }

      fellBack = true;
      SYNTH_FALLBACKS[cue]();
    };

    // Only a failure to *start* playback should trigger the synthesized
    // fallback. Once "playing" fires, stop listening for "error" - a
    // transient network hiccup partway through a long file (far more likely
    // over ~60s than ~1s) would otherwise layer the synthesized version on
    // top of audio that had already started correctly.
    audio.addEventListener("error", useFallback, { once: true });
    audio.addEventListener(
      "playing",
      () => audio.removeEventListener("error", useFallback),
      { once: true },
    );
    audio.play()?.catch(useFallback);
  } catch {
    SYNTH_FALLBACKS[cue]();
  }
}
