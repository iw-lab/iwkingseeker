/**
 * 주관식/빈칸 문제를 객관식(4지선다)으로 자동 변환.
 *
 * 핵심 원칙 — "터무니없는 오답"을 만들지 않는다:
 *  1) 정답의 형태(정수·소수·분수·단위·영어·한글개념어)를 분류하고,
 *     오답은 반드시 같은 형태에서만 만든다. (예: "반지름" 정답에 "90"·"삼만 오천"이 섞이지 않음)
 *  2) 실제 오답은 같은 학년·과목·"단원" 정답을 1순위로, 같은 과목을 2순위로 쓴다.
 *     (다른 단원·다른 과목 어휘 혼입 최소화)
 *  3) 숫자 계열은 정답과 같은 형식(단위/소수 자리수/분모)을 보존한 근접 오답을 생성한다.
 *  4) 그럴듯한 오답을 최소 2개(=3지선다) 못 모으면 더미("보기 2")를 넣지 않고
 *     그 문제를 변환 실패로 처리해 게임 풀에서 제외한다.
 */

import { shuffleArray } from './utils';

interface RawQuestion {
  question_type: string;
  correct_answer: string;
  options: string[] | null;
  subject?: string;
  grade?: number;
  unit?: string;
  [key: string]: unknown;
}

type AnswerShape =
  | 'integer'
  | 'decimal'
  | 'fraction'
  | 'unit'
  | 'english'
  | 'korean'
  | 'other';

const RE_INT = /^-?\d+$/;
const RE_DEC = /^-?\d+\.\d+$/;
// "3/4", "7/12", "1과 2/6" 등 (대분수 포함)
const RE_FRACTION = /^(?:\d+\s*과\s*)?\d+\s*\/\s*\d+$/;
// "90도", "32cm", "27cm³", "0개" 등 (숫자 + 단위)
const RE_UNIT = /^(-?\d+(?:\.\d+)?)\s*([^\d\s][^\d]*)$/;
const RE_ENGLISH = /^[A-Za-z][A-Za-z\s'.,!?-]*$/;
const RE_KOREAN = /[가-힣]/;

function classify(raw: string): AnswerShape {
  const s = raw.trim();
  if (RE_INT.test(s)) return 'integer';
  if (RE_DEC.test(s)) return 'decimal';
  if (RE_FRACTION.test(s)) return 'fraction';
  if (RE_UNIT.test(s)) return 'unit';
  if (RE_ENGLISH.test(s)) return 'english';
  if (RE_KOREAN.test(s)) return 'korean';
  return 'other';
}

function decimalsOf(s: string): number {
  const m = s.trim().match(/\.(\d+)$/);
  return m ? m[1].length : 0;
}

/** 같은 형태(shape)의 실제 정답 후보가 정답과 "그럴듯하게" 비슷한지 */
function isCompatible(answer: string, cand: string, shape: AnswerShape): boolean {
  if (cand === answer) return false;
  switch (shape) {
    case 'english':
      // 영어는 단어/짧은 구. 길이 편차는 관대하게.
      return cand.length <= 40 && Math.abs(cand.length - answer.length) <= Math.max(5, answer.length);
    case 'korean':
    case 'other': {
      if (cand.length > 30) return false;
      const tol = Math.max(2, Math.ceil(answer.length * 0.6));
      return Math.abs(cand.length - answer.length) <= tol;
    }
    case 'unit': {
      const a = answer.match(RE_UNIT);
      const c = cand.match(RE_UNIT);
      return !!a && !!c && a[2].trim() === c[2].trim(); // 같은 단위만
    }
    case 'decimal':
      return decimalsOf(cand) === decimalsOf(answer); // 같은 소수 자리수
    case 'integer':
    case 'fraction':
      return true;
    default:
      return false;
  }
}

/** 정수 근접 오답 */
function integerVariants(correct: number, need: number): string[] {
  const out = new Set<string>();
  const base = Math.max(1, Math.abs(correct));
  let offsets: number[];
  if (base < 10) offsets = [1, 2, 3, 4, -1, -2, -3, -4];
  else if (base < 100) offsets = [1, 2, 3, 5, 10, -1, -2, -3, -5, -10];
  else offsets = [5, 10, 15, 20, 25, -5, -10, -15, -20, -25];

  for (const o of shuffleArray(offsets)) {
    if (out.size >= need) break;
    const w = correct + o;
    if (w === correct) continue;
    if (correct >= 0 && w < 0) continue; // 양수 정답엔 음수 오답 배제(정답이 혼자 튐 방지)
    out.add(String(w));
  }
  // 그래도 부족하면 더 넓은 양수 범위에서 보충
  let guard = 0;
  while (out.size < need && guard < 50) {
    guard++;
    const w = correct + (guard + 1) * (guard % 2 === 0 ? 1 : -1);
    if (w !== correct && (correct < 0 || w >= 0)) out.add(String(w));
  }
  return [...out];
}

/** 소수 근접 오답 (자리수 보존) */
function decimalVariants(correct: number, decimals: number, need: number): string[] {
  const out = new Set<string>();
  const step = Math.pow(10, -decimals);
  const mults = [1, 2, 3, 5, -1, -2, -3, -5, 10, -10];
  for (const k of shuffleArray(mults)) {
    if (out.size >= need) break;
    const w = +(correct + k * step).toFixed(decimals);
    if (w === correct) continue;
    if (correct >= 0 && w < 0) continue;
    out.add(w.toFixed(decimals));
  }
  return [...out];
}

/** 단위 포함 오답 (숫자만 변형, 단위 보존) — "90도" → "80도","100도","45도" */
function unitVariants(answer: string, need: number): string[] {
  const m = answer.match(RE_UNIT);
  if (!m) return [];
  const numStr = m[1];
  const unit = m[2];
  const decimals = decimalsOf(numStr);
  const num = parseFloat(numStr);
  const nums = decimals > 0
    ? decimalVariants(num, decimals, need)
    : integerVariants(num, need);
  return nums.map((n) => `${n}${unit}`);
}

/** 분수 근접 오답 (분모 보존, 분자 변형) — "3/4" → "1/4","2/4"는 약분 위험 → 분자만 ±1,±2 */
function fractionVariants(answer: string, need: number): string[] {
  const m = answer.match(/^(\d+\s*과\s*)?(\d+)\s*\/\s*(\d+)$/);
  if (!m) return [];
  const prefix = m[1] ? m[1].replace(/\s+/g, ' ').trim() + ' ' : '';
  const numer = parseInt(m[2], 10);
  const denom = parseInt(m[3], 10);
  const out = new Set<string>();
  for (const d of shuffleArray([1, 2, 3, -1, -2, -3])) {
    if (out.size >= need) break;
    const n = numer + d;
    if (n <= 0 || n === numer) continue;
    out.add(`${prefix}${n}/${denom}`);
  }
  return [...out];
}

/** 정답의 shape에 맞는 수치/형식 변형 오답 (텍스트형은 빈 배열) */
function syntheticVariants(answer: string, shape: AnswerShape, need: number): string[] {
  if (need <= 0) return [];
  switch (shape) {
    case 'integer':
      return integerVariants(parseInt(answer, 10), need);
    case 'decimal':
      return decimalVariants(parseFloat(answer), decimalsOf(answer), need);
    case 'unit':
      return unitVariants(answer, need);
    case 'fraction':
      return fractionVariants(answer, need);
    default:
      return []; // 영어/한글 개념어는 임의 생성하지 않음(터무니없어짐)
  }
}

const MIN_OPTIONS = 3; // 정답 1 + 오답 2 (3지선다)까지 허용, 그 미만이면 변환 실패
const MAX_OPTIONS = 4;

/**
 * 정답 + 오답 후보로 객관식 보기를 만든다.
 * @returns 정답 포함 3~4개의 보기. 그럴듯한 오답이 부족하면 null(=변환 실패).
 */
function buildOptions(
  answer: string,
  unitPool: string[],
  subjectPool: string[]
): string[] | null {
  const shape = classify(answer);
  const opts = new Set<string>([answer]);

  // 1순위: 같은 단원, 2순위: 같은 과목 — 같은 shape & 호환되는 실제 정답만
  for (const pool of [unitPool, subjectPool]) {
    if (opts.size >= MAX_OPTIONS) break;
    for (const cand of shuffleArray(pool)) {
      if (opts.size >= MAX_OPTIONS) break;
      const c = cand.trim();
      if (opts.has(c)) continue;
      if (classify(c) !== shape) continue;
      if (!isCompatible(answer, c, shape)) continue;
      opts.add(c);
    }
  }

  // 보충: 숫자 계열은 같은 형식의 근접 오답을 생성
  if (opts.size < MAX_OPTIONS) {
    for (const v of syntheticVariants(answer, shape, MAX_OPTIONS - opts.size + 2)) {
      if (opts.size >= MAX_OPTIONS) break;
      if (!opts.has(v)) opts.add(v);
    }
  }

  if (opts.size < MIN_OPTIONS) return null; // 더미 금지 → 변환 실패로 제외
  return shuffleArray([...opts]);
}

/**
 * 문제 배열을 게임용 객관식으로 변환.
 *  - 이미 객관식(multiple_choice)·OX는 그대로 둔다.
 *  - 주관식/빈칸은 객관식으로 변환하되, 그럴듯한 오답을 못 만들면 결과에서 제외한다.
 */
export function convertToMultipleChoice<T extends RawQuestion>(questions: T[]): T[] {
  // 정답 인덱스: 단원 단위 / 과목 단위
  const byUnit: Record<string, string[]> = {};
  const bySubject: Record<string, string[]> = {};
  for (const q of questions) {
    const ans = q.correct_answer?.trim();
    if (!ans) continue;
    const uKey = `${q.grade ?? ''}|${q.subject ?? ''}|${q.unit ?? ''}`;
    const sKey = `${q.grade ?? ''}|${q.subject ?? ''}`;
    (byUnit[uKey] ??= []).push(ans);
    (bySubject[sKey] ??= []).push(ans);
  }

  const result: T[] = [];
  for (const q of questions) {
    // 이미 객관식이면 그대로 (seed 객관식은 품질이 보장됨)
    if (q.question_type === 'multiple_choice') {
      result.push(q);
      continue;
    }
    // OX는 변환하지 않고 원형 유지 (pickQuestion에서 자동 출제 제외)
    if (q.question_type === 'ox') {
      result.push(q);
      continue;
    }

    const answer = q.correct_answer.trim();
    if (!answer) continue; // 정답 없는 문제는 제외

    const uKey = `${q.grade ?? ''}|${q.subject ?? ''}|${q.unit ?? ''}`;
    const sKey = `${q.grade ?? ''}|${q.subject ?? ''}`;
    const options = buildOptions(answer, byUnit[uKey] ?? [], bySubject[sKey] ?? []);

    if (!options) continue; // 변환 실패 → 게임 풀에서 제외 (품질 우선)

    result.push({
      ...q,
      question_type: 'multiple_choice',
      options,
      correct_answer: answer, // 보기와 정답 문자열을 일치시킴(앞뒤 공백 차이로 인한 오판정 방지)
    });
  }
  return result;
}
