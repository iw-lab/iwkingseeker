'use client';

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    audioCtx = new AudioContext();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

function createReverb(ctx: AudioContext, duration = 1.5, decay = 2): ConvolverNode {
  const convolver = ctx.createConvolver();
  const rate = ctx.sampleRate;
  const length = rate * duration;
  const impulse = ctx.createBuffer(2, length, rate);
  for (let channel = 0; channel < 2; channel++) {
    const data = impulse.getChannelData(channel);
    for (let i = 0; i < length; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, decay);
    }
  }
  convolver.buffer = impulse;
  return convolver;
}

function createDistortion(ctx: AudioContext, amount = 50): WaveShaperNode {
  const shaper = ctx.createWaveShaper();
  const samples = 44100;
  const curve = new Float32Array(samples);
  const deg = Math.PI / 180;
  for (let i = 0; i < samples; i++) {
    const x = (i * 2) / samples - 1;
    curve[i] = ((3 + amount) * x * 20 * deg) / (Math.PI + amount * Math.abs(x));
  }
  shaper.curve = curve;
  shaper.oversample = '4x';
  return shaper;
}

interface ToneOptions {
  frequency: number;
  duration: number;
  type?: OscillatorType;
  volume?: number;
  delay?: number;
  pan?: number;
  detune?: number;
  attack?: number;
  release?: number;
  reverb?: boolean;
  reverbDuration?: number;
  filterFreq?: number;
  filterType?: BiquadFilterType;
  harmonics?: number[];
}

function playRichTone(options: ToneOptions) {
  const ctx = getAudioContext();
  const {
    frequency,
    duration,
    type = 'sine',
    volume = 0.3,
    delay = 0,
    pan = 0,
    detune = 0,
    attack = 0.01,
    release = 0.1,
    reverb = false,
    reverbDuration = 1.0,
    filterFreq,
    filterType = 'lowpass',
    harmonics,
  } = options;

  const startTime = ctx.currentTime + delay;
  const gainNode = ctx.createGain();
  const panner = ctx.createStereoPanner();

  panner.pan.setValueAtTime(pan, startTime);

  let lastNode: AudioNode = gainNode;
  gainNode.connect(panner);

  if (filterFreq) {
    const filter = ctx.createBiquadFilter();
    filter.type = filterType;
    filter.frequency.setValueAtTime(filterFreq, startTime);
    filter.Q.setValueAtTime(1, startTime);
    panner.connect(filter);
    lastNode = filter;
    if (reverb) {
      const rev = createReverb(ctx, reverbDuration);
      const dryGain = ctx.createGain();
      const wetGain = ctx.createGain();
      dryGain.gain.setValueAtTime(0.7, startTime);
      wetGain.gain.setValueAtTime(0.3, startTime);
      filter.connect(dryGain);
      filter.connect(rev);
      rev.connect(wetGain);
      dryGain.connect(ctx.destination);
      wetGain.connect(ctx.destination);
    } else {
      filter.connect(ctx.destination);
    }
  } else if (reverb) {
    const rev = createReverb(ctx, reverbDuration);
    const dryGain = ctx.createGain();
    const wetGain = ctx.createGain();
    dryGain.gain.setValueAtTime(0.7, startTime);
    wetGain.gain.setValueAtTime(0.3, startTime);
    panner.connect(dryGain);
    panner.connect(rev);
    rev.connect(wetGain);
    dryGain.connect(ctx.destination);
    wetGain.connect(ctx.destination);
  } else {
    panner.connect(ctx.destination);
  }

  // ADSR envelope
  gainNode.gain.setValueAtTime(0, startTime);
  gainNode.gain.linearRampToValueAtTime(volume, startTime + attack);
  gainNode.gain.setValueAtTime(volume, startTime + duration - release);
  gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

  // Main oscillator
  const osc = ctx.createOscillator();
  osc.type = type;
  osc.frequency.setValueAtTime(frequency, startTime);
  if (detune) osc.detune.setValueAtTime(detune, startTime);
  osc.connect(gainNode);
  osc.start(startTime);
  osc.stop(startTime + duration + 0.1);

  // Harmonics (overtones for richer timbre)
  if (harmonics && harmonics.length > 0) {
    harmonics.forEach((ratio, i) => {
      const harmOsc = ctx.createOscillator();
      const harmGain = ctx.createGain();
      harmOsc.type = type;
      harmOsc.frequency.setValueAtTime(frequency * ratio, startTime);
      harmGain.gain.setValueAtTime(0, startTime);
      harmGain.gain.linearRampToValueAtTime(volume * (0.3 / (i + 1)), startTime + attack);
      harmGain.gain.setValueAtTime(volume * (0.3 / (i + 1)), startTime + duration - release);
      harmGain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
      harmOsc.connect(harmGain);
      harmGain.connect(panner);
      harmOsc.start(startTime);
      harmOsc.stop(startTime + duration + 0.1);
    });
  }
}

function playChord(notes: ToneOptions[]) {
  notes.forEach((note) => playRichTone(note));
}

// ========== EXPORTED SOUND EFFECTS ==========

function playCorrectSoundUnsafe() {
  // Bright, triumphant two-note chime with harmonics and reverb
  playChord([
    { frequency: 523.25, duration: 0.2, type: 'sine', volume: 0.25, reverb: true, reverbDuration: 0.8, harmonics: [2, 3], attack: 0.005 },
    { frequency: 659.25, duration: 0.15, type: 'sine', volume: 0.15, delay: 0.08, reverb: true, reverbDuration: 0.8, pan: -0.3, harmonics: [2] },
    { frequency: 783.99, duration: 0.4, type: 'sine', volume: 0.25, delay: 0.15, reverb: true, reverbDuration: 1.0, harmonics: [2, 3, 4], attack: 0.005 },
    // Sparkle layer
    { frequency: 1567.98, duration: 0.15, type: 'sine', volume: 0.08, delay: 0.18, pan: 0.5 },
    { frequency: 2093, duration: 0.1, type: 'sine', volume: 0.05, delay: 0.22, pan: -0.5 },
  ]);
}

function playWrongSoundUnsafe() {
  // Dark, dissonant buzz with low rumble
  playChord([
    { frequency: 200, duration: 0.15, type: 'sawtooth', volume: 0.12, filterFreq: 800, attack: 0.005 },
    { frequency: 190, duration: 0.15, type: 'sawtooth', volume: 0.12, delay: 0.02, pan: 0.3, filterFreq: 700 },
    { frequency: 150, duration: 0.35, type: 'sawtooth', volume: 0.1, delay: 0.12, filterFreq: 500, release: 0.2 },
    { frequency: 100, duration: 0.3, type: 'triangle', volume: 0.15, delay: 0.1, filterFreq: 300 },
  ]);
}

function playKingFoundSoundUnsafe() {
  // Majestic royal fanfare with chord progression
  const baseDelay = 0;
  playChord([
    // First chord: C major
    { frequency: 523.25, duration: 0.2, type: 'sine', volume: 0.2, delay: baseDelay, reverb: true, reverbDuration: 1.5, harmonics: [2, 3] },
    { frequency: 659.25, duration: 0.2, type: 'sine', volume: 0.15, delay: baseDelay, reverb: true, pan: 0.3 },
    // Second: E
    { frequency: 659.25, duration: 0.2, type: 'sine', volume: 0.2, delay: 0.18, reverb: true, harmonics: [2, 3] },
    { frequency: 783.99, duration: 0.2, type: 'sine', volume: 0.15, delay: 0.18, reverb: true, pan: -0.3 },
    // Third: G
    { frequency: 783.99, duration: 0.2, type: 'sine', volume: 0.2, delay: 0.36, reverb: true, harmonics: [2, 3] },
    { frequency: 987.77, duration: 0.2, type: 'sine', volume: 0.15, delay: 0.36, reverb: true, pan: 0.3 },
    // Grand finale: High C with full chord
    { frequency: 1046.5, duration: 0.7, type: 'sine', volume: 0.25, delay: 0.55, reverb: true, reverbDuration: 2.0, harmonics: [2, 3, 4] },
    { frequency: 783.99, duration: 0.7, type: 'sine', volume: 0.15, delay: 0.55, reverb: true, pan: -0.5 },
    { frequency: 659.25, duration: 0.7, type: 'sine', volume: 0.12, delay: 0.55, reverb: true, pan: 0.5 },
    // Sparkle accents
    { frequency: 2093, duration: 0.15, type: 'sine', volume: 0.06, delay: 0.6, pan: 0.7 },
    { frequency: 2637, duration: 0.12, type: 'sine', volume: 0.04, delay: 0.65, pan: -0.7 },
    { frequency: 3135.96, duration: 0.1, type: 'sine', volume: 0.03, delay: 0.7, pan: 0.5 },
  ]);
}

function playCountdownTickUnsafe() {
  const ctx = getAudioContext();
  const now = ctx.currentTime;

  // Crisp percussive tick with subtle resonance
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  const filter = ctx.createBiquadFilter();

  osc.type = 'sine';
  osc.frequency.setValueAtTime(1200, now);
  osc.frequency.exponentialRampToValueAtTime(800, now + 0.03);

  filter.type = 'bandpass';
  filter.frequency.setValueAtTime(1000, now);
  filter.Q.setValueAtTime(5, now);

  gain.gain.setValueAtTime(0.15, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

  osc.connect(gain);
  gain.connect(filter);
  filter.connect(ctx.destination);
  osc.start(now);
  osc.stop(now + 0.1);

  // Sub click for punch
  const sub = ctx.createOscillator();
  const subGain = ctx.createGain();
  sub.type = 'triangle';
  sub.frequency.setValueAtTime(400, now);
  subGain.gain.setValueAtTime(0.08, now);
  subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
  sub.connect(subGain);
  subGain.connect(ctx.destination);
  sub.start(now);
  sub.stop(now + 0.06);
}

function playTimerWarningUnsafe() {
  // Urgent triple beep with rising pitch
  [0, 0.15, 0.3].forEach((delay, i) => {
    playRichTone({
      frequency: 880 + i * 100,
      duration: 0.1,
      type: 'square',
      volume: 0.12 + i * 0.03,
      delay,
      filterFreq: 2000 + i * 500,
      attack: 0.005,
      release: 0.05,
    });
    // Sub layer
    playRichTone({
      frequency: 440 + i * 50,
      duration: 0.08,
      type: 'triangle',
      volume: 0.06,
      delay: delay + 0.01,
    });
  });
}

function playVictoryFanfareUnsafe() {
  // Grand orchestral victory with layered chords
  const melody: ToneOptions[] = [
    // Opening: C-E (third)
    { frequency: 523.25, duration: 0.25, type: 'sine', volume: 0.2, delay: 0, reverb: true, reverbDuration: 2, harmonics: [2, 3] },
    { frequency: 659.25, duration: 0.25, type: 'sine', volume: 0.15, delay: 0, reverb: true, pan: 0.3 },
    // E-G
    { frequency: 659.25, duration: 0.25, type: 'sine', volume: 0.2, delay: 0.22, reverb: true, harmonics: [2, 3] },
    { frequency: 783.99, duration: 0.25, type: 'sine', volume: 0.15, delay: 0.22, reverb: true, pan: -0.3 },
    // G-B
    { frequency: 783.99, duration: 0.25, type: 'sine', volume: 0.2, delay: 0.44, reverb: true, harmonics: [2, 3] },
    { frequency: 987.77, duration: 0.25, type: 'sine', volume: 0.15, delay: 0.44, reverb: true, pan: 0.3 },
    // High C - triumphant hold
    { frequency: 1046.5, duration: 0.3, type: 'sine', volume: 0.22, delay: 0.66, reverb: true, harmonics: [2, 3] },
    { frequency: 783.99, duration: 0.3, type: 'sine', volume: 0.12, delay: 0.66, reverb: true, pan: -0.4 },
    // Brief rest then grand finale
    { frequency: 783.99, duration: 0.2, type: 'sine', volume: 0.18, delay: 1.0, reverb: true, harmonics: [2] },
    // Final C major chord - full spread
    { frequency: 1046.5, duration: 0.9, type: 'sine', volume: 0.25, delay: 1.15, reverb: true, reverbDuration: 3, harmonics: [2, 3, 4] },
    { frequency: 783.99, duration: 0.9, type: 'sine', volume: 0.18, delay: 1.15, reverb: true, pan: -0.5 },
    { frequency: 659.25, duration: 0.9, type: 'sine', volume: 0.15, delay: 1.15, reverb: true, pan: 0.5 },
    { frequency: 523.25, duration: 0.9, type: 'sine', volume: 0.12, delay: 1.15, reverb: true, pan: 0 },
    // Sparkle shower
    { frequency: 2093, duration: 0.15, type: 'sine', volume: 0.05, delay: 1.2, pan: 0.6 },
    { frequency: 2637, duration: 0.12, type: 'sine', volume: 0.04, delay: 1.3, pan: -0.6 },
    { frequency: 3135.96, duration: 0.1, type: 'sine', volume: 0.03, delay: 1.4, pan: 0.4 },
    { frequency: 3520, duration: 0.08, type: 'sine', volume: 0.02, delay: 1.5, pan: -0.4 },
  ];
  playChord(melody);
}

function playRPSBeatUnsafe() {
  // Deep, punchy drum-like beat
  const ctx = getAudioContext();
  const now = ctx.currentTime;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(150, now);
  osc.frequency.exponentialRampToValueAtTime(50, now + 0.15);
  gain.gain.setValueAtTime(0.35, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(now);
  osc.stop(now + 0.25);

  // Noise burst for attack
  const bufferSize = ctx.sampleRate * 0.05;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
  }
  const noise = ctx.createBufferSource();
  noise.buffer = buffer;
  const noiseGain = ctx.createGain();
  const noiseFilter = ctx.createBiquadFilter();
  noiseFilter.type = 'highpass';
  noiseFilter.frequency.setValueAtTime(500, now);
  noiseGain.gain.setValueAtTime(0.1, now);
  noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
  noise.connect(noiseGain);
  noiseGain.connect(noiseFilter);
  noiseFilter.connect(ctx.destination);
  noise.start(now);
}

function playRPSRevealUnsafe() {
  // Dramatic reveal with rising sweep
  playChord([
    { frequency: 400, duration: 0.08, type: 'square', volume: 0.1, filterFreq: 2000, attack: 0.005 },
    { frequency: 600, duration: 0.08, type: 'square', volume: 0.12, delay: 0.06, filterFreq: 2500 },
    { frequency: 900, duration: 0.2, type: 'sine', volume: 0.15, delay: 0.12, reverb: true, reverbDuration: 0.8, harmonics: [2] },
    { frequency: 1200, duration: 0.15, type: 'sine', volume: 0.08, delay: 0.15, pan: 0.5 },
  ]);
}

function playButtonClickUnsafe() {
  // Subtle, satisfying click with depth
  const ctx = getAudioContext();
  const now = ctx.currentTime;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(800, now);
  osc.frequency.exponentialRampToValueAtTime(500, now + 0.04);
  gain.gain.setValueAtTime(0.08, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(now);
  osc.stop(now + 0.08);
}

function playPhaseTransitionUnsafe() {
  // Whoosh + chime for phase changes
  const ctx = getAudioContext();
  const now = ctx.currentTime;

  // Whoosh: filtered noise sweep
  const bufferSize = ctx.sampleRate * 0.3;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = (Math.random() * 2 - 1) * Math.sin((i / bufferSize) * Math.PI);
  }
  const noise = ctx.createBufferSource();
  noise.buffer = buffer;
  const noiseGain = ctx.createGain();
  const noiseFilter = ctx.createBiquadFilter();
  noiseFilter.type = 'bandpass';
  noiseFilter.frequency.setValueAtTime(500, now);
  noiseFilter.frequency.exponentialRampToValueAtTime(4000, now + 0.15);
  noiseFilter.frequency.exponentialRampToValueAtTime(500, now + 0.3);
  noiseFilter.Q.setValueAtTime(2, now);
  noiseGain.gain.setValueAtTime(0.06, now);
  noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
  noise.connect(noiseGain);
  noiseGain.connect(noiseFilter);
  noiseFilter.connect(ctx.destination);
  noise.start(now);

  // Chime
  playRichTone({
    frequency: 1046.5,
    duration: 0.3,
    type: 'sine',
    volume: 0.08,
    delay: 0.1,
    reverb: true,
    reverbDuration: 1.0,
    harmonics: [2],
  });
}

function playTeamSelectUnsafe() {
  // Satisfying selection confirmation
  playChord([
    { frequency: 440, duration: 0.12, type: 'sine', volume: 0.12, attack: 0.005 },
    { frequency: 554.37, duration: 0.12, type: 'sine', volume: 0.08, delay: 0.06, pan: 0.3 },
    { frequency: 659.25, duration: 0.2, type: 'sine', volume: 0.15, delay: 0.12, reverb: true, reverbDuration: 0.5, harmonics: [2] },
  ]);
}

function playKingSelectSuspenseUnsafe() {
  // Mysterious, suspenseful tone for king selection
  playChord([
    { frequency: 220, duration: 0.8, type: 'sine', volume: 0.1, reverb: true, reverbDuration: 2, harmonics: [2, 3], release: 0.4 },
    { frequency: 277.18, duration: 0.8, type: 'sine', volume: 0.08, pan: 0.4, reverb: true, release: 0.4 },
    { frequency: 329.63, duration: 0.8, type: 'sine', volume: 0.06, pan: -0.4, reverb: true, release: 0.4 },
    // High shimmer
    { frequency: 1760, duration: 0.4, type: 'sine', volume: 0.03, delay: 0.3, pan: 0.6, reverb: true },
  ]);
}

function playShuffleSoundUnsafe() {
  // Quick shuffle/whoosh effect
  const delays = [0, 0.04, 0.08, 0.12, 0.16];
  delays.forEach((delay, i) => {
    playRichTone({
      frequency: 600 + i * 200,
      duration: 0.05,
      type: 'sine',
      volume: 0.06,
      delay,
      pan: (i % 2 === 0 ? 1 : -1) * 0.5,
      filterFreq: 2000 + i * 300,
    });
  });
}

function playScoreUpUnsafe() {
  // Celebratory score increase
  playChord([
    { frequency: 523.25, duration: 0.1, type: 'sine', volume: 0.15, attack: 0.005 },
    { frequency: 659.25, duration: 0.1, type: 'sine', volume: 0.12, delay: 0.08 },
    { frequency: 783.99, duration: 0.15, type: 'sine', volume: 0.15, delay: 0.16, harmonics: [2] },
    { frequency: 1046.5, duration: 0.25, type: 'sine', volume: 0.18, delay: 0.24, reverb: true, reverbDuration: 0.8, harmonics: [2, 3] },
  ]);
}

function playHoverSoundUnsafe() {
  playRichTone({
    frequency: 700,
    duration: 0.03,
    type: 'sine',
    volume: 0.04,
    attack: 0.005,
    release: 0.02,
  });
}

/**
 * 🔴 소리가 실패해도 **게임 진행은 절대 멈추지 않는다.**
 *
 * 예전에는 각 소리 함수가 그대로 던졌다. 그런데 이 함수들은 게임 상태를 바꾸는
 * 핸들러 한가운데에서 불린다 — 예를 들어 가위바위보 승자 선택은
 * `setSelecting(true) → playRPSBeat() → setTimeout(setRPSResult)` 순서라,
 * 가운데 소리에서 예외가 나면 `selecting` 이 true 로 굳은 채 다음 단계가
 * 예약되지 않아 **화면이 그 자리에서 영영 멈춘다**(2026-09-10 브라우저 실측으로 재현).
 *
 * AudioContext 는 자동재생 정책·기기·브라우저에 따라 언제든 실패할 수 있는 자원이다.
 * 그래서 "소리는 있으면 좋은 것"으로 취급하고 여기서 전부 삼킨다.
 */
function safeSound<T extends (...args: never[]) => void>(fn: T, label: string): T {
  return ((...args: Parameters<T>) => {
    try {
      fn(...args);
    } catch (err) {
      if (process.env.NODE_ENV !== 'production') {
        console.warn(`[sound] ${label} 실패 — 게임은 계속됩니다`, err);
      }
    }
  }) as T;
}

export const playCorrectSound = safeSound(playCorrectSoundUnsafe, 'playCorrectSound');
export const playWrongSound = safeSound(playWrongSoundUnsafe, 'playWrongSound');
export const playKingFoundSound = safeSound(playKingFoundSoundUnsafe, 'playKingFoundSound');
export const playCountdownTick = safeSound(playCountdownTickUnsafe, 'playCountdownTick');
export const playTimerWarning = safeSound(playTimerWarningUnsafe, 'playTimerWarning');
export const playVictoryFanfare = safeSound(playVictoryFanfareUnsafe, 'playVictoryFanfare');
export const playRPSBeat = safeSound(playRPSBeatUnsafe, 'playRPSBeat');
export const playRPSReveal = safeSound(playRPSRevealUnsafe, 'playRPSReveal');
export const playButtonClick = safeSound(playButtonClickUnsafe, 'playButtonClick');
export const playPhaseTransition = safeSound(playPhaseTransitionUnsafe, 'playPhaseTransition');
export const playTeamSelect = safeSound(playTeamSelectUnsafe, 'playTeamSelect');
export const playKingSelectSuspense = safeSound(playKingSelectSuspenseUnsafe, 'playKingSelectSuspense');
export const playShuffleSound = safeSound(playShuffleSoundUnsafe, 'playShuffleSound');
export const playScoreUp = safeSound(playScoreUpUnsafe, 'playScoreUp');
export const playHoverSound = safeSound(playHoverSoundUnsafe, 'playHoverSound');
