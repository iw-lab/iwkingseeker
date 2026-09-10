/**
 * 조사 자동 선택 — "사과을(를)" 같은 미해소 표기를 "사과를"로 바꾼다.
 *
 * 왜 필요한가: 문항을 템플릿으로 찍어 내면서 앞말의 받침을 따지지 않고
 * "을(를)"을 그대로 남긴 문항이 1,717건 있다(발문 869 · 해설 799 · 보기 352 · 정답 120).
 * 전자칠판에 "3/5은(는) 진분수인가요?"가 그대로 뜬다 — 국어를 가르치는 앱에서
 * 가장 눈에 띄는 결함이다. 시드 파일 수십 개를 고치는 대신 정합성 계층에서 한 번에 푼다.
 *
 * 판정 규칙
 *  - 한글 음절: 종성이 있으면 받침 있음. (유니코드 (code-0xAC00)%28 !== 0)
 *  - 숫자: 마지막 자리의 한글 읽기로 판정 (0영 1일 2이 3삼 4사 5오 6육 7칠 8팔 9구).
 *  - 분수 a/b: 한국어는 "b분의 a"로 읽으므로 **분자**의 마지막 자리로 판정한다.
 *    예) 3/5 → "오 분의 삼" → 삼(받침 ㅁ) → "3/5은"
 *  - 알파벳: 글자 이름의 한글 읽기로 판정 (a에이 b비 … l엘 m엠 …).
 *  - 판정할 수 없으면 원문을 그대로 둔다 — 틀린 조사를 넣느니 그대로 두는 편이 낫다.
 */

/** 받침이 있는 것으로 읽는 숫자 = 0(영) 1(일) 3(삼) 6(육) 7(칠) 8(팔) */
const DIGIT_HAS_FINAL: Record<string, boolean> = {
  '0': true, '1': true, '2': false, '3': true, '4': false,
  '5': false, '6': true, '7': true, '8': true, '9': false,
};

/** 알파벳 이름을 한글로 읽었을 때 받침이 있는가 (엘·엠·엔·알 등) */
const ALPHA_HAS_FINAL: Record<string, boolean> = {
  a: false, b: false, c: false, d: false, e: false, f: true,  // 에프
  g: false, h: false, i: false, j: false, k: false, l: true,  // 엘
  m: true, n: true, o: false, p: false, q: false, r: true,    // 엠 엔 알
  s: true, t: false, u: false, v: false, w: false, x: true,   // 에스 엑스
  y: false, z: false,
};

/** 받침이 'ㄹ'인가 — '으로/로' 판정에만 쓴다 */
function finalIsRieul(ch: string): boolean {
  const code = ch.charCodeAt(0);
  if (code >= 0xac00 && code <= 0xd7a3) return (code - 0xac00) % 28 === 8; // 종성 ㄹ
  if (ch === '1' || ch === '7' || ch === '8') return true;                 // 일·칠·팔
  if (/[lr]/i.test(ch)) return true;                                       // 엘·알
  return false;
}

/**
 * 앞말에 받침이 있는지 판정한다. 판정 불가면 null.
 * `before`는 조사 바로 앞까지의 문자열 전체 — 뒤에서부터 훑는다.
 */
export function hasFinalConsonant(before: string): boolean | null {
  // 괄호·따옴표·공백은 건너뛰고 실제 낱말의 끝을 찾는다
  const trimmed = before.replace(/[\s"'“”‘’)\]}]+$/, '');
  if (!trimmed) return null;

  // 분수는 "분모분의 분자"로 읽으므로 분자로 판정한다 (3/5 → "오 분의 삼")
  const frac = trimmed.match(/(\d+)\s*\/\s*(\d+)$/);
  if (frac) {
    const numerator = frac[1]!;
    return DIGIT_HAS_FINAL[numerator[numerator.length - 1]!] ?? null;
  }

  const last = trimmed[trimmed.length - 1]!;
  const code = last.charCodeAt(0);

  if (code >= 0xac00 && code <= 0xd7a3) return (code - 0xac00) % 28 !== 0; // 한글 음절
  if (/\d/.test(last)) return DIGIT_HAS_FINAL[last] ?? null;

  // 알파벳은 **한 글자일 때만** 글자 이름으로 판정한다("L은/는").
  // 낱말(apple→애플, potato→포테이토)은 한글 표기를 기계적으로 만들 수 없어
  // 잘못된 조사를 넣느니 원문을 그대로 둔다. (실측: 조사 앞에 오는 영어 낱말 0건)
  if (/[a-zA-Z]/.test(last)) {
    const isSingleLetter = /(^|[^a-zA-Z])[a-zA-Z]$/.test(trimmed);
    return isSingleLetter ? (ALPHA_HAS_FINAL[last.toLowerCase()] ?? null) : null;
  }
  return null; // 기호·한자 등은 판정하지 않는다
}

/** "A(B)" 꼴로 적힌 조사 쌍 — 앞이 받침 있을 때 쓰는 것을 with, 없을 때를 without 에 둔다 */
const PAIRS: Array<{ re: RegExp; withFinal: string; without: string }> = [
  { re: /은\(는\)/g, withFinal: '은', without: '는' },
  { re: /는\(은\)/g, withFinal: '은', without: '는' },
  { re: /을\(를\)/g, withFinal: '을', without: '를' },
  { re: /를\(을\)/g, withFinal: '을', without: '를' },
  { re: /이\(가\)/g, withFinal: '이', without: '가' },
  { re: /가\(이\)/g, withFinal: '이', without: '가' },
  { re: /과\(와\)/g, withFinal: '과', without: '와' },
  { re: /와\(과\)/g, withFinal: '과', without: '와' },
  { re: /이나\(나\)/g, withFinal: '이나', without: '나' },
  { re: /이라\(라\)/g, withFinal: '이라', without: '라' },
  { re: /이란\(란\)/g, withFinal: '이란', without: '란' },
  { re: /아\(야\)/g, withFinal: '아', without: '야' },
  { re: /야\(아\)/g, withFinal: '아', without: '야' },
];

/** '(이)다' · '(이)야' 처럼 앞에 괄호가 붙는 꼴 */
const OPTIONAL_I: Array<{ re: RegExp; withFinal: string; without: string }> = [
  { re: /\(이\)다/g, withFinal: '이다', without: '다' },
  { re: /\(이\)야/g, withFinal: '이야', without: '야' },
  { re: /\(이\)라는/g, withFinal: '이라는', without: '라는' },
  { re: /\(이\)라고/g, withFinal: '이라고', without: '라고' },
  { re: /\(이\)라/g, withFinal: '이라', without: '라' },
  { re: /\(를\)/g, withFinal: '을', without: '를' },
];

/** '으로/로'는 받침 ㄹ 뒤에서 '로'가 된다 — 다른 조사와 규칙이 다르다 */
const RO_PAIRS: RegExp[] = [/으로\(로\)/g, /로\(으로\)/g];

/**
 * 문자열 안의 미해소 조사를 모두 해소한다.
 * 판정할 수 없는 자리는 원문 그대로 남긴다.
 */
export function resolveParticles(input: string): string {
  if (!input || !input.includes('(')) return input;
  let out = input;

  const apply = (re: RegExp, pick: (before: string) => string | null) => {
    out = out.replace(re, (match, offset: number, whole: string) => {
      const chosen = pick(whole.slice(0, offset));
      return chosen ?? match;
    });
  };

  for (const { re, withFinal, without } of PAIRS) {
    apply(re, (before) => {
      const f = hasFinalConsonant(before);
      return f === null ? null : f ? withFinal : without;
    });
  }
  for (const { re, withFinal, without } of OPTIONAL_I) {
    apply(re, (before) => {
      const f = hasFinalConsonant(before);
      return f === null ? null : f ? withFinal : without;
    });
  }
  for (const re of RO_PAIRS) {
    apply(re, (before) => {
      const f = hasFinalConsonant(before);
      if (f === null) return null;
      if (!f) return '로';
      const trimmed = before.replace(/[\s"'“”‘’)\]}]+$/, '');
      const last = trimmed[trimmed.length - 1];
      return last && finalIsRieul(last) ? '로' : '으로';
    });
  }
  return out;
}
