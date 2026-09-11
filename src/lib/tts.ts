'use client';

let preferredKoVoice: SpeechSynthesisVoice | null = null;

function pickKoreanVoice(): SpeechSynthesisVoice | null {
  if (preferredKoVoice) return preferredKoVoice;
  if (typeof window === 'undefined' || !window.speechSynthesis) return null;
  const voices = window.speechSynthesis.getVoices();
  const korean = voices.filter((v) => v.lang?.toLowerCase().startsWith('ko'));
  if (korean.length === 0) return null;
  // 맥의 Yuna(고품질), 구글/마이크로소프트 한국어 음성 우선
  const priority = korean.find((v) => /yuna|google|microsoft|premium|natural/i.test(v.name));
  preferredKoVoice = priority ?? korean[0]!;
  return preferredKoVoice;
}

export function speak(text: string, opts?: { rate?: number; pitch?: number; volume?: number }) {
  if (typeof window === 'undefined' || !window.speechSynthesis) return;
  if (!text || !text.trim()) return;
  // 현재 읽기 중이면 중단
  try {
    window.speechSynthesis.cancel();
  } catch {
    /* noop */
  }

  const u = new SpeechSynthesisUtterance(text);
  u.lang = 'ko-KR';
  u.rate = opts?.rate ?? 1.05;
  u.pitch = opts?.pitch ?? 1;
  u.volume = opts?.volume ?? 1;
  const voice = pickKoreanVoice();
  if (voice) u.voice = voice;

  try {
    window.speechSynthesis.speak(u);
  } catch (err) {
    // 읽어 주기가 안 되는 기기여도 문제는 화면에 그대로 떠 있어야 한다
    if (process.env.NODE_ENV !== 'production') console.warn('[tts] 읽기 실패', err);
  }
}

export function stopSpeaking() {
  if (typeof window === 'undefined' || !window.speechSynthesis) return;
  try {
    window.speechSynthesis.cancel();
  } catch {
    /* noop */
  }
}

export function isTTSAvailable(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window;
}

// 브라우저가 voices를 async로 로드할 때 대비
export function warmUpVoices() {
  if (typeof window === 'undefined' || !window.speechSynthesis) return;
  const loadVoices = () => {
    pickKoreanVoice();
  };
  loadVoices();
  window.speechSynthesis.onvoiceschanged = loadVoices;
}
