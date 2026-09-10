'use client';

let bgmCtx: AudioContext | null = null;
let currentNodes: { stop: () => void }[] = [];
let bgmPlaying = false;
let bgmVolume = 0.12;

function getBgmContext(): AudioContext {
  if (!bgmCtx) {
    bgmCtx = new AudioContext();
  }
  if (bgmCtx.state === 'suspended') {
    bgmCtx.resume();
  }
  return bgmCtx;
}

function stopAll() {
  currentNodes.forEach((n) => { try { n.stop(); } catch {} });
  currentNodes = [];
  bgmPlaying = false;
}

// 퀴즈 BGM: 긴장감 있는 루프
function createQuizBgm() {
  const ctx = getBgmContext();
  const masterGain = ctx.createGain();
  masterGain.gain.setValueAtTime(bgmVolume, ctx.currentTime);
  masterGain.connect(ctx.destination);

  // 베이스 드론 (저음 패드)
  const bass = ctx.createOscillator();
  const bassGain = ctx.createGain();
  bass.type = 'sine';
  bass.frequency.setValueAtTime(65, ctx.currentTime); // C2
  bassGain.gain.setValueAtTime(0.3, ctx.currentTime);
  bass.connect(bassGain);
  bassGain.connect(masterGain);
  bass.start();

  // LFO로 베이스 볼륨 움직임
  const lfo = ctx.createOscillator();
  const lfoGain = ctx.createGain();
  lfo.type = 'sine';
  lfo.frequency.setValueAtTime(0.25, ctx.currentTime); // 4초 주기
  lfoGain.gain.setValueAtTime(0.1, ctx.currentTime);
  lfo.connect(lfoGain);
  lfoGain.connect(bassGain.gain);
  lfo.start();

  // 미드 패드 (코드 느낌)
  const chordNotes = [130.81, 155.56, 196]; // C3, Eb3, G3 (Cm)
  const chordOscs = chordNotes.map((freq) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    osc.connect(gain);
    gain.connect(masterGain);
    osc.start();
    return osc;
  });

  // 하이 틱 (리듬감) - 8비트 펄스
  const tickInterval = setInterval(() => {
    if (!bgmPlaying) return;
    const now = ctx.currentTime;
    const tick = ctx.createOscillator();
    const tickGain = ctx.createGain();
    tick.type = 'sine';
    tick.frequency.setValueAtTime(880, now);
    tickGain.gain.setValueAtTime(0.02 * (bgmVolume / 0.12), now);
    tickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
    tick.connect(tickGain);
    tickGain.connect(ctx.destination);
    tick.start(now);
    tick.stop(now + 0.06);
  }, 500);

  // 코드 체인지 (8초마다 Cm → Ab → Fm → G7)
  const chordProgressions = [
    [130.81, 155.56, 196],    // Cm
    [207.65, 261.63, 311.13], // Ab
    [174.61, 220, 261.63],    // Fm
    [196, 246.94, 293.66],    // G
  ];
  let chordIdx = 0;
  const chordInterval = setInterval(() => {
    if (!bgmPlaying) return;
    chordIdx = (chordIdx + 1) % chordProgressions.length;
    const chord = chordProgressions[chordIdx]!;
    chordOscs.forEach((osc, i) => {
      osc.frequency.setValueAtTime(chord[i]!, ctx.currentTime);
    });
  }, 8000);

  bgmPlaying = true;

  const stopFn = {
    stop: () => {
      clearInterval(tickInterval);
      clearInterval(chordInterval);
      const fadeTime = ctx.currentTime + 0.5;
      masterGain.gain.linearRampToValueAtTime(0, fadeTime);
      setTimeout(() => {
        try { bass.stop(); lfo.stop(); chordOscs.forEach((o) => o.stop()); } catch {}
      }, 600);
    },
  };
  currentNodes.push(stopFn);
  return stopFn;
}

// 왕 선택 BGM: 미스터리한 느낌
function createKingBgm() {
  const ctx = getBgmContext();
  const masterGain = ctx.createGain();
  masterGain.gain.setValueAtTime(bgmVolume * 0.8, ctx.currentTime);
  masterGain.connect(ctx.destination);

  // 딥 드론
  const drone = ctx.createOscillator();
  const droneGain = ctx.createGain();
  drone.type = 'sine';
  drone.frequency.setValueAtTime(55, ctx.currentTime); // A1
  droneGain.gain.setValueAtTime(0.25, ctx.currentTime);
  drone.connect(droneGain);
  droneGain.connect(masterGain);
  drone.start();

  // 미스터리 패드
  const pad = ctx.createOscillator();
  const padGain = ctx.createGain();
  const padFilter = ctx.createBiquadFilter();
  pad.type = 'sawtooth';
  pad.frequency.setValueAtTime(110, ctx.currentTime);
  padFilter.type = 'lowpass';
  padFilter.frequency.setValueAtTime(300, ctx.currentTime);
  padFilter.Q.setValueAtTime(2, ctx.currentTime);
  padGain.gain.setValueAtTime(0.06, ctx.currentTime);
  pad.connect(padGain);
  padGain.connect(padFilter);
  padFilter.connect(masterGain);
  pad.start();

  // 슬로우 LFO 필터 스윕
  const lfo = ctx.createOscillator();
  const lfoGain = ctx.createGain();
  lfo.type = 'sine';
  lfo.frequency.setValueAtTime(0.1, ctx.currentTime);
  lfoGain.gain.setValueAtTime(200, ctx.currentTime);
  lfo.connect(lfoGain);
  lfoGain.connect(padFilter.frequency);
  lfo.start();

  // 랜덤 하이 벨 사운드
  const bellInterval = setInterval(() => {
    if (!bgmPlaying) return;
    const now = ctx.currentTime;
    const bell = ctx.createOscillator();
    const bellGain = ctx.createGain();
    const notes = [880, 1046.5, 1174.66, 1318.51];
    bell.type = 'sine';
    bell.frequency.setValueAtTime(notes[Math.floor(Math.random() * notes.length)]!, now);
    bellGain.gain.setValueAtTime(0.015 * (bgmVolume / 0.12), now);
    bellGain.gain.exponentialRampToValueAtTime(0.001, now + 1.5);
    bell.connect(bellGain);
    bellGain.connect(ctx.destination);
    bell.start(now);
    bell.stop(now + 1.6);
  }, 3000 + Math.random() * 2000);

  bgmPlaying = true;

  const stopFn = {
    stop: () => {
      clearInterval(bellInterval);
      const fadeTime = ctx.currentTime + 0.5;
      masterGain.gain.linearRampToValueAtTime(0, fadeTime);
      setTimeout(() => {
        try { drone.stop(); pad.stop(); lfo.stop(); } catch {}
      }, 600);
    },
  };
  currentNodes.push(stopFn);
  return stopFn;
}

export type BgmType = 'quiz' | 'king' | 'none';

/**
 * 배경음은 실패해도 게임이 멈추면 안 된다 — sounds.ts 의 safeSound 와 같은 이유다.
 * (AudioContext 는 자동재생 정책·기기에 따라 언제든 던질 수 있는 자원이다.)
 */
export function playBgm(type: BgmType) {
  try {
    stopAll();
    if (type === 'none') return;
    if (type === 'quiz') createQuizBgm();
    if (type === 'king') createKingBgm();
  } catch (err) {
    if (process.env.NODE_ENV !== 'production') console.warn('[bgm] 재생 실패 — 게임은 계속됩니다', err);
  }
}

export function stopBgm() {
  try {
    stopAll();
  } catch {
    /* 정지 실패는 무시 — 다음 재생에서 다시 정리된다 */
  }
}

export function setBgmVolume(vol: number) {
  bgmVolume = Math.max(0, Math.min(1, vol));
}

export function isBgmPlaying(): boolean {
  return bgmPlaying;
}
