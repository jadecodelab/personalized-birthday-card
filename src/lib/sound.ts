let audioContext: AudioContext | null = null;

function getAudioContext() {
  if (!audioContext) {
    audioContext = new AudioContext();
  }

  if (audioContext.state === "suspended") {
    audioContext.resume();
  }

  return audioContext;
}

function playTone(
  context: AudioContext,
  frequency: number,
  startTime: number,
  duration: number,
  options: { gain?: number; waveform?: OscillatorType } = {},
) {
  const { gain = 0.25, waveform = "sine" } = options;
  const oscillator = context.createOscillator();
  const gainNode = context.createGain();

  oscillator.type = waveform;
  oscillator.frequency.value = frequency;

  gainNode.gain.setValueAtTime(0, startTime);
  gainNode.gain.linearRampToValueAtTime(gain, startTime + 0.02);
  gainNode.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

  oscillator.connect(gainNode);
  gainNode.connect(context.destination);

  oscillator.start(startTime);
  oscillator.stop(startTime + duration);
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
// invalid. Synthesized rather than using an audio file, same as the open
// chime it replaces: no asset to license, nothing to load.
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

export function playBirthdayTune() {
  try {
    const context = getAudioContext();
    const startTime = context.currentTime;
    let time = startTime;

    for (const [frequency, duration] of HAPPY_BIRTHDAY_MELODY) {
      playTone(context, frequency, time, duration * 0.8, {
        gain: 0.22,
        waveform: "triangle",
      });
      time += duration;
    }

    // A simple root/fifth "oom-pah" bass pulse under the melody for a
    // fuller, more festive feel than a single bare melody line.
    const totalDuration = time - startTime;
    let bassTime = startTime;
    let isRoot = true;

    while (bassTime < startTime + totalDuration) {
      playTone(context, isRoot ? BASS_ROOT : BASS_FIFTH, bassTime, QUARTER * 0.8, {
        gain: 0.1,
        waveform: "sine",
      });
      bassTime += QUARTER;
      isRoot = !isRoot;
    }
  } catch {
    // Web Audio isn't available in this browser - the envelope still opens silently.
  }
}
