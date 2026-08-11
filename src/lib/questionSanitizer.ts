/**
 * 문제 정합성 계층 — "정답이 두 개인 문제"를 구조적으로 차단한다.
 *
 * 배경(실측): 18,449문항 전수 검사에서 4지선다 보기에 정답과 값이 같은
 * 다른 표기(예: `6/12을 약분하면?` → 보기 `1/2`, `3/6`)가 섞인 문항이
 * 다수 발견됐다. 프로그래밍 방식 생성기가 오답을 "문자열이 다르면 OK"로만
 * 걸러 생긴 결함이라, 개별 문항을 고치는 대신 값 기준(value key)으로
 * 판정하는 공통 계층을 두어 재발을 막는다.
 *
 * 원칙
 *  1) 정답과 "값이 같은" 보기는 문자열이 달라도 오답이 될 수 없다 → 제거 후 대체.
 *  2) 보기를 못 채우면 더미를 넣지 않고 문항을 폐기한다(품질 우선).
 *  3) 판정은 순수 함수 — 같은 입력에 같은 출력(테스트·감사 스크립트 공용).
 */

export type SanitizeSeverity = 'CRIT' | 'HIGH' | 'MED' | 'LOW';

export interface SanitizeIssue {
  code: string;
  severity: SanitizeSeverity;
  detail: string;
}

interface SanitizableQuestion {
  grade?: number;
  subject?: string;
  unit?: string;
  question_type: string;
  question_text: string;
  options: string[] | null;
  correct_answer: string;
  explanation?: string | null;
  difficulty?: number;
}

/** 공백 정규화 (보기·정답 비교의 기준) */
export function normText(s: unknown): string {
  return String(s ?? '').trim().replace(/\s+/g, ' ');
}

const RE_PLAIN_NUM = /^-?\d+(?:\.\d+)?$/;
const RE_FRACTION = /^(-?\d+)\s*\/\s*(\d+)$/;
/** 대분수 — "1과 2/6", "1와 2/6", 그리고 공백만으로 쓴 "2 1/3" */
const RE_MIXED = /^(-?\d+)\s*(?:과|와|\s)\s*(\d+)\s*\/\s*(\d+)$/;
const RE_NUM_UNIT = /^(-?\d+(?:\.\d+)?)\s*(\S.*)$/;
/** 분수 + 단위 — "1/2컵", "3/4 L" */
const RE_FRACTION_UNIT = /^(-?\d+)\s*\/\s*(\d+)\s*([^\d\s/].*)$/;
/** 선행 0을 생략한 소수 — ".5" */
const RE_BARE_DECIMAL = /^(-?)\.(\d+)$/;

/**
 * 보기의 "값"을 나타내는 키. 표기가 달라도 값이 같으면 같은 키가 나온다.
 *  - `1/2`, `3/6`, `0.5` → 동일 키
 *  - `90도`, `90 도` → 동일 키 (단위 포함 비교)
 *  - 숫자로 해석되지 않는 문자열은 공백 정규화한 텍스트 자체가 키
 */
export function valueKey(raw: unknown): string {
  const spaced = normText(raw);
  if (!spaced) return '';

  // 공백이 의미를 갖는 유일한 경우 = 대분수("2 1/3"). 공백을 먼저 지우면
  // "21/3"(=7)으로 읽혀 전혀 다른 값이 되므로 여기서 먼저 판정한다.
  const spacedMixed = RE_MIXED.exec(spaced);
  if (spacedMixed) {
    const whole = Number(spacedMixed[1]);
    const denom = Number(spacedMixed[3]);
    if (denom !== 0) {
      const frac = Number(spacedMixed[2]) / denom;
      // 부호 판정은 값이 아니라 표기로 한다. Number("-0") < 0 은 false라
      // "-0 1/2" 가 +0.5 로 뒤집힌다.
      const negative = spacedMixed[1].startsWith('-');
      return `#${roundKey(negative ? -(Math.abs(whole) + frac) : whole + frac)}`;
    }
  }

  const s = spaced.replace(/\s+/g, '');
  const mixed = RE_MIXED.exec(s);
  if (mixed) {
    const whole = Number(mixed[1]);
    const denom = Number(mixed[3]);
    if (denom !== 0) {
      const frac = Number(mixed[2]) / denom;
      const negative = mixed[1].startsWith('-');
      return `#${roundKey(negative ? -(Math.abs(whole) + frac) : whole + frac)}`;
    }
  }

  const frac = RE_FRACTION.exec(s);
  if (frac) {
    const denom = Number(frac[2]);
    if (denom !== 0) return `#${roundKey(Number(frac[1]) / denom)}`;
  }

  if (RE_PLAIN_NUM.test(s)) return `#${roundKey(Number(s))}`;

  // ".5" 처럼 정수부를 생략한 소수도 0.5 와 같은 값이다.
  const bare = RE_BARE_DECIMAL.exec(s);
  if (bare) return `#${roundKey(Number(`${bare[1]}0.${bare[2]}`))}`;

  // "1/2컵" 은 "0.5컵" 과 같은 값 — 단위가 같을 때만 비교한다.
  const fracUnit = RE_FRACTION_UNIT.exec(s);
  if (fracUnit) {
    const denom = Number(fracUnit[2]);
    if (denom !== 0) return `#${roundKey(Number(fracUnit[1]) / denom)}|${fracUnit[3]}`;
  }

  const withUnit = RE_NUM_UNIT.exec(s);
  if (withUnit) {
    // 단위가 붙은 값은 "같은 단위"일 때만 값 비교가 성립한다.
    const unit = withUnit[2];
    // 단위 자리에 또 다른 수식(예: "3/4")이 오면 숫자 비교 대상이 아니다.
    if (!/\d/.test(unit)) return `#${roundKey(Number(withUnit[1]))}|${unit}`;
  }

  // 텍스트는 공백을 지우지 않고 하나로 모으기만 한다.
  // 띄어쓰기 문항에서는 공백 자체가 정답과 오답을 가르는 내용이라
  // (`할 수 있다` vs `할수있다`), 공백을 지우면 보기가 전부 같아져
  // 문항이 통째로 폐기된다(실측: 5학년 국어 띄어쓰기 20문항 중 10개 손실).
  return `=${spaced}`;
}

/** 부동소수 오차로 1/3 ≠ 0.333… 을 같다고 오판하지 않도록 유효자리 제한 */
function roundKey(v: number): string {
  if (!Number.isFinite(v)) return 'NaN';
  return Number(v.toPrecision(10)).toString();
}

/** 같은 표기 형태(정수/소수/분수/단위/그 외)인지 — 대체 오답 생성에 사용 */
function shapeOf(s: string): 'integer' | 'decimal' | 'fraction' | 'unit' | 'text' {
  const spaced = normText(s);
  if (RE_MIXED.test(spaced)) return 'fraction';
  const t = spaced.replace(/\s+/g, '');
  if (/^-?\d+$/.test(t)) return 'integer';
  if (/^-?\d+\.\d+$/.test(t)) return 'decimal';
  if (RE_FRACTION.test(t) || RE_MIXED.test(t)) return 'fraction';
  const u = RE_NUM_UNIT.exec(t);
  if (u && !/\d/.test(u[2])) return 'unit';
  return 'text';
}

function decimalsOf(s: string): number {
  const m = /\.(\d+)$/.exec(normText(s));
  return m ? m[1].length : 0;
}

/**
 * 기존 보기와 값이 겹치지 않는 대체 오답을 만든다.
 * 텍스트형은 임의 생성이 터무니없어지므로 만들지 않는다(=null).
 */
function makeReplacement(answer: string, taken: Set<string>): string | null {
  const shape = shapeOf(answer);
  const spaced = normText(answer);
  // 대분수는 공백이 의미를 가지므로 원문 표기를 유지한 채 판정한다.
  const a = RE_MIXED.test(spaced) ? spaced : spaced.replace(/\s+/g, '');

  const candidates: string[] = [];
  if (shape === 'integer') {
    const n = Number(a);
    for (const d of [1, 2, 3, 4, 5, 10, -1, -2, -3, -4, -5, -10]) {
      const w = n + d;
      if (w !== n && (n < 0 || w >= 0)) candidates.push(String(w));
    }
  } else if (shape === 'decimal') {
    const n = Number(a);
    const dec = decimalsOf(a);
    const step = Math.pow(10, -dec);
    for (const k of [1, 2, 3, 5, -1, -2, -3, -5, 10, -10]) {
      const w = Number((n + k * step).toFixed(dec));
      if (w !== n && (n < 0 || w >= 0)) candidates.push(w.toFixed(dec));
    }
  } else if (shape === 'fraction') {
    const mixed = RE_MIXED.exec(a);
    const frac = RE_FRACTION.exec(a);
    if (frac) {
      const num = Number(frac[1]);
      const den = Number(frac[2]);
      const answerIsProper = num < den;
      // 진분수 정답에는 진분수 오답만, 가분수 정답에는 가분수 오답만 낸다.
      // 값이 1이나 정수가 되는 보기(4/4, 6/2)는 초등 눈에도 "답이 아님"이
      // 뻔해 변별력이 없으므로 제외한다.
      const ok = (n2: number, d2: number) =>
        n2 > 0 && d2 > 1 && n2 % d2 !== 0 && n2 < d2 === answerIsProper;
      for (const d of [1, 2, 3, -1, -2, -3]) {
        const n2 = num + d;
        if (n2 !== num && ok(n2, den)) candidates.push(`${n2}/${den}`);
      }
      for (const d of [1, 2, -1, -2]) {
        const den2 = den + d;
        if (den2 !== den && ok(num, den2)) candidates.push(`${num}/${den2}`);
      }
    } else if (mixed) {
      const whole = Number(mixed[1]);
      const num = Number(mixed[2]);
      const den = Number(mixed[3]);
      // 원문 표기법(과/와/공백)을 그대로 유지해야 보기끼리 형식이 튀지 않는다.
      const sep = /과/.test(a) ? '과 ' : /와/.test(a) ? '와 ' : ' ';
      for (const d of [1, 2, -1, -2]) {
        if (whole + d > 0) candidates.push(`${whole + d}${sep}${num}/${den}`);
      }
      for (const d of [1, 2, -1]) {
        if (num + d > 0 && num + d < den) candidates.push(`${whole}${sep}${num + d}/${den}`);
      }
    }
  } else if (shape === 'unit') {
    const u = RE_NUM_UNIT.exec(a)!;
    const n = Number(u[1]);
    const unit = u[2];
    const dec = decimalsOf(u[1]);
    const step = dec > 0 ? Math.pow(10, -dec) : 1;
    for (const k of [1, 2, 3, 5, 10, -1, -2, -3, -5, -10]) {
      const w = Number((n + k * step).toFixed(dec));
      if (w !== n && (n < 0 || w >= 0)) candidates.push(`${dec > 0 ? w.toFixed(dec) : w}${unit}`);
    }
  }

  for (const c of candidates) {
    if (!taken.has(valueKey(c))) return c;
  }
  return null;
}

/**
 * "다음 중 ~인 것은?" 형태 — 보기 중 조건을 만족하는 것을 고르는 문항.
 *
 * 이런 문항에 형식만 맞춘 오답을 합성하면 그 오답이 조건을 우연히 만족해
 * 정답이 둘이 될 수 있다(실측: `다음 중 1보다 작은 분수는?` 정답 2/5에
 * 3/5가 합성되어 둘 다 정답이 됨). 그래서 이 형태에는 합성을 하지 않고
 * 보기 3개로 남긴다.
 */
const RE_SELECTION_STEM =
  /다음\s*중|보기\s*중|것은\s*[?？]|고르시오|고르세요|고르시요|골라\s*(쓰|보|봅)|찾으시오|찾으세요|것을\s*(고르|찾)|알맞은\s*것|옳은\s*것|바른\s*것|맞는\s*것|아닌\s*것|해당하[는지]/;

export function isSelectionStyle(questionText: string): boolean {
  return RE_SELECTION_STEM.test(questionText);
}

export interface SanitizeResult<T> {
  question: T | null;
  issues: SanitizeIssue[];
}

const MIN_OPTIONS = 3;
const TARGET_OPTIONS = 4;

/**
 * 문항 하나를 정합화한다.
 * @returns question=null 이면 구조적으로 출제 불가(폐기 대상)
 */
export function sanitizeQuestion<T extends SanitizableQuestion>(input: T): SanitizeResult<T> {
  const issues: SanitizeIssue[] = [];
  const push = (code: string, severity: SanitizeSeverity, detail = '') =>
    issues.push({ code, severity, detail });

  const question_text = normText(input.question_text);
  const correct_answer = normText(input.correct_answer);

  if (!question_text) {
    push('EMPTY_TEXT', 'CRIT');
    return { question: null, issues };
  }
  if (!correct_answer) {
    push('EMPTY_ANSWER', 'CRIT', question_text);
    return { question: null, issues };
  }
  if (question_text !== String(input.question_text)) push('TEXT_WS', 'LOW');

  const difficulty =
    Number.isInteger(input.difficulty) && (input.difficulty as number) >= 1 && (input.difficulty as number) <= 3
      ? (input.difficulty as number)
      : 2;
  if (difficulty !== input.difficulty) push('BAD_DIFFICULTY', 'MED', String(input.difficulty));

  const base = { ...input, question_text, correct_answer, difficulty } as T;

  if (input.question_type === 'ox') {
    const up = correct_answer.toUpperCase();
    if (up !== 'O' && up !== 'X') {
      push('OX_BAD_ANSWER', 'CRIT', correct_answer);
      return { question: null, issues };
    }
    const opts = Array.isArray(input.options) ? input.options.map(normText) : [];
    if (opts.join(',') !== 'O,X') push('OX_BAD_OPTIONS', 'LOW', JSON.stringify(input.options));
    return { question: { ...base, options: ['O', 'X'], correct_answer: up }, issues };
  }

  if (input.question_type !== 'multiple_choice') {
    // 주관식·빈칸은 보기를 갖지 않는다. questionConverter가 게임 시점에 변환한다.
    return { question: { ...base, options: null }, issues };
  }

  if (!Array.isArray(input.options)) {
    push('MC_NO_OPTIONS', 'CRIT', question_text);
    return { question: null, issues };
  }

  const answerKey = valueKey(correct_answer);
  const kept: string[] = [correct_answer];
  const takenKeys = new Set<string>([answerKey]);
  let answerSeen = false;
  let equivRemoved = 0;
  let dupRemoved = 0;

  for (const rawOpt of input.options) {
    const opt = normText(rawOpt);
    if (!opt) {
      dupRemoved++;
      continue;
    }
    const key = valueKey(opt);
    if (key === answerKey) {
      // 정답 자신 또는 정답과 값이 같은 다른 표기.
      if (opt === correct_answer && !answerSeen) answerSeen = true;
      else equivRemoved++;
      continue;
    }
    if (takenKeys.has(key)) {
      dupRemoved++;
      continue;
    }
    takenKeys.add(key);
    kept.push(opt);
  }

  if (!answerSeen) {
    // 정답 문자열이 보기 안에 없었다 — 값이 같은 표기가 있었다면 표기 차이,
    // 아예 없었다면 데이터 오류. 어느 쪽이든 정답을 보기에 넣어 클릭 가능하게 만든다.
    push(equivRemoved > 0 ? 'ANSWER_FORM_MISMATCH' : 'ANSWER_NOT_IN_OPTIONS', 'CRIT', question_text);
  }
  if (equivRemoved > 0) push('EQUIV_TO_ANSWER_REMOVED', 'CRIT', `${equivRemoved}개`);
  if (dupRemoved > 0) push('DUP_OPTION_REMOVED', 'HIGH', `${dupRemoved}개`);

  // 부족한 보기를 같은 형태의 안전한 오답으로 보충
  // (선택형 발문은 합성이 제2의 정답을 만들 수 있어 보충하지 않는다)
  const allowSynthetic = !isSelectionStyle(question_text);
  let guard = 0;
  while (allowSynthetic && kept.length < TARGET_OPTIONS && guard < TARGET_OPTIONS * 4) {
    guard++;
    const rep = makeReplacement(correct_answer, takenKeys);
    if (!rep) break;
    takenKeys.add(valueKey(rep));
    kept.push(rep);
    // 합성 오답은 "형식만 맞고 뜻은 검증되지 않은" 보기다.
    // 개념형 문항(예: "다음 중 기약분수인 것은?")에서는 우연히 또 다른
    // 정답이 될 수 있으므로 감사 스크립트가 사람 눈으로 확인하도록 남긴다.
    push('SYNTHETIC_OPTION_ADDED', 'MED', rep);
  }

  if (kept.length < MIN_OPTIONS) {
    push('MC_TOO_FEW_OPTIONS', 'CRIT', `${kept.length}개 — 폐기`);
    return { question: null, issues };
  }
  if (kept.length < TARGET_OPTIONS) push('MC_OPT_COUNT', 'MED', `${kept.length}개`);

  // kept[0]은 항상 정답이므로, 그대로 두면 문제 목록 화면에서 "1번이 정답"이
  // 된다. 문항 텍스트 해시로 결정론적 회전을 걸어 위치를 분산시킨다.
  // (게임 화면은 questionConverter가 매 판 다시 섞으므로 여기서는 감사
  //  스크립트가 재현 가능하도록 난수를 쓰지 않는다.)
  return { question: { ...base, options: rotate(kept, hash(question_text) % kept.length) }, issues };
}

function rotate<T>(arr: T[], by: number): T[] {
  const n = ((by % arr.length) + arr.length) % arr.length;
  return n === 0 ? arr : [...arr.slice(n), ...arr.slice(0, n)];
}

/** FNV-1a 32bit — 결정론적이고 분포가 고른 작은 해시 */
function hash(s: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

export interface SanitizeSummary {
  total: number;
  kept: number;
  dropped: number;
  byCode: Record<string, number>;
}

/** 배열 전체를 정합화. 폐기된 문항은 결과에서 빠진다. */
export function sanitizeQuestions<T extends SanitizableQuestion>(
  list: readonly T[]
): { questions: T[]; summary: SanitizeSummary } {
  const questions: T[] = [];
  const byCode: Record<string, number> = {};
  let dropped = 0;

  for (const q of list) {
    const { question, issues } = sanitizeQuestion(q);
    for (const i of issues) byCode[i.code] = (byCode[i.code] ?? 0) + 1;
    if (question) questions.push(question);
    else dropped++;
  }

  return {
    questions,
    summary: { total: list.length, kept: questions.length, dropped, byCode },
  };
}
