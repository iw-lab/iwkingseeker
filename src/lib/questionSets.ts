/**
 * 문제 세트 — 교사가 직접 고른 문항 묶음.
 *
 * 왜 필요한가
 *  - 단원 전체를 무작위로 내는 것 말고, "오늘 수업에서 쓸 문제"만 골라 내고 싶다.
 *  - 문제 은행 문항을 다른 단원에서 쓰고 싶다(단원 재지정).
 *  - 만든 세트를 옆 반 선생님에게 그대로 넘기고 싶다(파일·공유 코드).
 *
 * 저장은 localStorage. 세트는 문항의 "스냅샷"을 담는다 — 원본 seed가 바뀌어도
 * 세트에 담긴 문제가 흔들리지 않게 하기 위해서다.
 */

import type { Question } from '@/types';
import { sanitizeQuestion } from '@/lib/questionSanitizer';

export interface SetQuestion {
  grade: number;
  subject: string;
  unit: string;
  question_type: 'multiple_choice' | 'ox' | 'fill_blank' | 'short_answer';
  question_text: string;
  options: string[] | null;
  correct_answer: string;
  explanation: string | null;
  difficulty: number;
  /** 문제 은행에서 가져온 문항인지 (교사가 직접 만든 것과 구분) */
  source?: 'bank' | 'custom';
}

export interface QuestionSet {
  id: string;
  name: string;
  /** 세트를 만든 사람 표기 — 공유했을 때 출처를 남긴다 */
  author: string;
  grade: number | null;
  subject: string | null;
  unit: string | null;
  questions: SetQuestion[];
  created_at: string;
  updated_at: string;
}

const STORAGE_KEY = 'kingseeker_question_sets';

/** 공유 코드 접두 — 버전이 올라가면 숫자를 올린다 */
const SHARE_PREFIX = 'KS1.';

/**
 * 가져오기 한도 — 남이 만든 코드/파일은 신뢰할 수 없다.
 * 압축된 코드는 작아도 풀면 거대해질 수 있어(압축 폭탄), 푼 뒤 크기와
 * 문항 수를 모두 제한한다. 한도를 넘으면 파싱조차 하지 않는다.
 */
const MAX_DECODED_BYTES = 4 * 1024 * 1024; // 4MB
const MAX_SET_QUESTIONS = 3000;
const MAX_SHARE_CODE_CHARS = 2 * 1024 * 1024;

function readRaw(): QuestionSet[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as QuestionSet[]).filter(isValidSet) : [];
  } catch {
    return [];
  }
}

function isValidSet(s: unknown): s is QuestionSet {
  if (!s || typeof s !== 'object') return false;
  const v = s as Partial<QuestionSet>;
  return typeof v.id === 'string' && typeof v.name === 'string' && Array.isArray(v.questions);
}

/**
 * 저장된 세트도 읽을 때 문항 정합성을 다시 확인한다.
 * 스키마가 바뀌거나 예전 버전이 남긴 데이터가 그대로 게임에 들어가
 * 보기 개수가 어긋나는 일을 막는다(가져오기 경로에만 검증이 있으면 비일관).
 */
function withValidatedQuestions(set: QuestionSet): QuestionSet {
  const { questions } = validateSetQuestions(set.questions);
  return questions.length === set.questions.length ? set : { ...set, questions };
}

export function getQuestionSets(): QuestionSet[] {
  return readRaw()
    .map(withValidatedQuestions)
    .sort((a, b) => (b.updated_at ?? '').localeCompare(a.updated_at ?? ''));
}

export function getQuestionSet(id: string): QuestionSet | null {
  const found = readRaw().find((s) => s.id === id);
  return found ? withValidatedQuestions(found) : null;
}

function persist(sets: QuestionSet[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sets));
  } catch (e) {
    // localStorage 용량 초과(보통 5MB) — 조용히 실패하면 교사가 저장된 줄 안다.
    throw new Error(
      e instanceof Error && e.name === 'QuotaExceededError'
        ? '저장 공간이 가득 찼습니다. 오래된 문제 세트를 지운 뒤 다시 시도해 주세요.'
        : '문제 세트를 저장하지 못했습니다.'
    );
  }
}

function newId(): string {
  return `set-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export function saveQuestionSet(
  input: Omit<QuestionSet, 'id' | 'created_at' | 'updated_at'> & { id?: string }
): QuestionSet {
  const sets = readRaw();
  const now = new Date().toISOString();
  const existingIndex = input.id ? sets.findIndex((s) => s.id === input.id) : -1;

  const set: QuestionSet = {
    id: input.id ?? newId(),
    name: input.name.trim() || '이름 없는 세트',
    author: input.author?.trim() ?? '',
    grade: input.grade ?? null,
    subject: input.subject ?? null,
    unit: input.unit ?? null,
    questions: input.questions,
    created_at: existingIndex >= 0 ? sets[existingIndex]!.created_at : now,
    updated_at: now,
  };

  if (existingIndex >= 0) sets[existingIndex] = set;
  else sets.push(set);
  persist(sets);
  return set;
}

export function deleteQuestionSet(id: string) {
  persist(readRaw().filter((s) => s.id !== id));
}

/** 세트 문항 → 게임이 쓰는 Question 형태 */
export function toRuntimeQuestions(set: QuestionSet): Question[] {
  return set.questions.map((q, i) => ({
    id: `set-${set.id}-${i}`,
    grade: q.grade,
    subject: q.subject,
    unit: q.unit,
    unit_code: null,
    question_type: q.question_type,
    question_text: q.question_text,
    options: q.options,
    correct_answer: q.correct_answer,
    explanation: q.explanation,
    difficulty: q.difficulty,
    used_count: 0,
    created_at: set.created_at,
  }));
}

// ────────────────────────────────────────────────────────────
// 공유 — 파일(JSON)과 공유 코드(짧은 텍스트) 두 경로
// ────────────────────────────────────────────────────────────

interface SharePayload {
  v: 1;
  name: string;
  author: string;
  grade: number | null;
  subject: string | null;
  unit: string | null;
  questions: SetQuestion[];
}

function toPayload(set: QuestionSet): SharePayload {
  return {
    v: 1,
    name: set.name,
    author: set.author,
    grade: set.grade,
    subject: set.subject,
    unit: set.unit,
    questions: set.questions,
  };
}

function bytesToBase64Url(bytes: Uint8Array): string {
  let bin = '';
  // 인자 개수 제한(스택 오버플로)을 피하려고 청크로 나눠 붙인다.
  const CHUNK = 0x8000;
  for (let i = 0; i < bytes.length; i += CHUNK) {
    bin += String.fromCharCode(...bytes.subarray(i, i + CHUNK));
  }
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function base64UrlToBytes(s: string): Uint8Array {
  const b64 = s.replace(/-/g, '+').replace(/_/g, '/');
  const pad = b64.length % 4 === 0 ? '' : '='.repeat(4 - (b64.length % 4));
  const bin = atob(b64 + pad);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

async function deflate(bytes: Uint8Array): Promise<Uint8Array> {
  const stream = new Response(new Blob([bytes as BlobPart]).stream().pipeThrough(new CompressionStream('deflate-raw')));
  return new Uint8Array(await stream.arrayBuffer());
}

async function inflate(bytes: Uint8Array): Promise<Uint8Array> {
  const stream = new Blob([bytes as BlobPart]).stream().pipeThrough(new DecompressionStream('deflate-raw'));
  const reader = stream.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  // 스트리밍으로 읽으면서 한도를 넘는 순간 중단한다.
  // 다 받은 뒤 크기를 재면 이미 메모리를 다 쓴 뒤라 늦다.
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    total += value.byteLength;
    if (total > MAX_DECODED_BYTES) {
      await reader.cancel();
      throw new Error('TOO_LARGE');
    }
    chunks.push(value);
  }
  const out = new Uint8Array(total);
  let offset = 0;
  for (const c of chunks) {
    out.set(c, offset);
    offset += c.byteLength;
  }
  return out;
}

/**
 * 세트를 메신저로 붙여넣을 수 있는 한 줄 코드로 만든다.
 * 압축(deflate-raw) → base64url. 압축 API가 없는 환경에서는 압축 없이 담는다.
 */
export async function encodeShareCode(set: QuestionSet): Promise<string> {
  const json = JSON.stringify(toPayload(set));
  const raw = new TextEncoder().encode(json);
  if (typeof CompressionStream === 'undefined') return `${SHARE_PREFIX}r.${bytesToBase64Url(raw)}`;
  return `${SHARE_PREFIX}z.${bytesToBase64Url(await deflate(raw))}`;
}

export interface DecodeResult {
  set: Omit<QuestionSet, 'id' | 'created_at' | 'updated_at'> | null;
  /** 정합성 검사에서 걸러진 문항 수 */
  skipped: number;
  error?: string;
}

/** 공유 코드를 세트로 되돌린다. 형식이 깨졌으면 error를 담아 돌려준다. */
export async function decodeShareCode(code: string): Promise<DecodeResult> {
  const trimmed = code.trim().replace(/\s+/g, '');
  if (!trimmed.startsWith(SHARE_PREFIX)) {
    return { set: null, skipped: 0, error: '킹시커 공유 코드가 아닙니다. (KS1. 으로 시작해야 합니다)' };
  }
  if (trimmed.length > MAX_SHARE_CODE_CHARS) {
    return { set: null, skipped: 0, error: '공유 코드가 너무 깁니다. 문제를 나누어 여러 세트로 공유해 주세요.' };
  }
  const body = trimmed.slice(SHARE_PREFIX.length);
  const mode = body.slice(0, 2);
  const data = body.slice(2);
  if (mode !== 'z.' && mode !== 'r.') {
    return { set: null, skipped: 0, error: '공유 코드 형식을 알 수 없습니다.' };
  }

  if (mode === 'z.' && typeof DecompressionStream === 'undefined') {
    return {
      set: null,
      skipped: 0,
      error: '이 브라우저는 압축된 공유 코드를 열 수 없습니다. 최신 크롬·엣지에서 다시 시도하거나 파일로 받아 주세요.',
    };
  }

  let json: string;
  try {
    const bytes = base64UrlToBytes(data);
    if (mode === 'r.' && bytes.byteLength > MAX_DECODED_BYTES) throw new Error('TOO_LARGE');
    const raw = mode === 'z.' ? await inflate(bytes) : bytes;
    json = new TextDecoder().decode(raw);
  } catch (e) {
    return {
      set: null,
      skipped: 0,
      error:
        e instanceof Error && e.message === 'TOO_LARGE'
          ? '공유 코드에 담긴 문제가 너무 많습니다. 나누어 공유해 주세요.'
          : '공유 코드가 손상되었습니다. 코드 전체를 복사했는지 확인해 주세요.',
    };
  }

  let payload: SharePayload;
  try {
    payload = JSON.parse(json);
  } catch {
    return { set: null, skipped: 0, error: '공유 코드의 내용을 읽지 못했습니다.' };
  }
  if (!payload || payload.v !== 1 || !Array.isArray(payload.questions)) {
    return { set: null, skipped: 0, error: '지원하지 않는 공유 코드 버전입니다.' };
  }
  if (payload.questions.length > MAX_SET_QUESTIONS) {
    return {
      set: null,
      skipped: 0,
      error: `한 번에 가져올 수 있는 문항은 ${MAX_SET_QUESTIONS.toLocaleString()}개까지입니다.`,
    };
  }

  const { questions, skipped } = validateSetQuestions(payload.questions);
  if (questions.length === 0) {
    return { set: null, skipped, error: '가져올 수 있는 문항이 없습니다.' };
  }

  return {
    set: {
      name: String(payload.name ?? '가져온 세트').slice(0, 80),
      author: String(payload.author ?? '').slice(0, 40),
      grade: typeof payload.grade === 'number' ? payload.grade : null,
      subject: payload.subject ? String(payload.subject) : null,
      unit: payload.unit ? String(payload.unit) : null,
      questions,
    },
    skipped,
  };
}

/**
 * 외부에서 들어온 문항을 신뢰하지 않고 전부 검사한다.
 * 남의 기기에서 만들어진 데이터라 형식이 깨져 있을 수 있고,
 * 깨진 문항 하나가 수업 중 게임을 멈추게 하면 안 된다.
 */
export function validateSetQuestions(input: unknown[]): { questions: SetQuestion[]; skipped: number } {
  const questions: SetQuestion[] = [];
  let skipped = 0;

  for (const raw of input) {
    if (!raw || typeof raw !== 'object') {
      skipped++;
      continue;
    }
    const q = raw as Record<string, unknown>;
    const type = String(q.question_type ?? 'multiple_choice');
    if (!['multiple_choice', 'ox', 'fill_blank', 'short_answer'].includes(type)) {
      skipped++;
      continue;
    }

    const candidate = {
      grade: Number(q.grade),
      subject: String(q.subject ?? '').trim(),
      unit: String(q.unit ?? '').trim(),
      question_type: type as SetQuestion['question_type'],
      question_text: String(q.question_text ?? ''),
      options: Array.isArray(q.options) ? q.options.map((o) => String(o)) : null,
      correct_answer: String(q.correct_answer ?? ''),
      explanation: q.explanation == null ? null : String(q.explanation),
      difficulty: Number(q.difficulty),
      source: q.source === 'bank' ? ('bank' as const) : ('custom' as const),
    };

    if (![3, 4, 5, 6].includes(candidate.grade) || !candidate.subject || !candidate.unit) {
      skipped++;
      continue;
    }

    // 게임 화면과 같은 정합성 계층을 통과해야 세트에 들어간다.
    const { question } = sanitizeQuestion(candidate);
    if (!question) {
      skipped++;
      continue;
    }
    questions.push(question as SetQuestion);
  }

  return { questions, skipped };
}

/** 파일로 내보낼 JSON 문자열 */
export function exportSetJson(set: QuestionSet): string {
  return JSON.stringify(toPayload(set), null, 2);
}

/** 파일에서 읽은 JSON 문자열 → 세트 */
export function importSetJson(json: string): DecodeResult {
  let parsed: unknown;
  try {
    parsed = JSON.parse(json);
  } catch {
    return { set: null, skipped: 0, error: 'JSON 형식이 아닙니다.' };
  }

  // 세트 파일이거나, 기존 "내 문제" 배열이거나 둘 다 받아 준다.
  const payload = Array.isArray(parsed)
    ? { v: 1 as const, name: '가져온 문제', author: '', grade: null, subject: null, unit: null, questions: parsed }
    : (parsed as SharePayload);

  if (!payload || !Array.isArray(payload.questions)) {
    return { set: null, skipped: 0, error: '문항 목록을 찾지 못했습니다.' };
  }
  if (payload.questions.length > MAX_SET_QUESTIONS) {
    return {
      set: null,
      skipped: 0,
      error: `한 번에 가져올 수 있는 문항은 ${MAX_SET_QUESTIONS.toLocaleString()}개까지입니다.`,
    };
  }

  const { questions, skipped } = validateSetQuestions(payload.questions);
  if (questions.length === 0) return { set: null, skipped, error: '가져올 수 있는 문항이 없습니다.' };

  return {
    set: {
      name: String(payload.name ?? '가져온 세트').slice(0, 80),
      author: String(payload.author ?? '').slice(0, 40),
      grade: typeof payload.grade === 'number' ? payload.grade : null,
      subject: payload.subject ?? null,
      unit: payload.unit ?? null,
      questions,
    },
    skipped,
  };
}
