import type { QuestionSeed } from './questions-seed';

/**
 * v9 수학 증량 팩 — 3·4·6학년 전 단원을 단원당 60문항 이상으로 끌어올린다.
 *
 * 모든 정답은 코드가 계산한다(손으로 적지 않는다). 오답은 "그 학년 아이가
 * 실제로 저지르는 실수"에서 만든다 — 자리올림 누락, 나머지와 몫 혼동,
 * 단위 환산 자릿수 착오처럼. 무작위 수를 섞으면 변별력이 사라진다.
 *
 * 보기 정합성(정답과 값이 같은 보기 금지, 중복 금지)은 questionSanitizer가
 * 최종적으로 한 번 더 강제하지만, 여기서도 값 기준으로 걸러 내보낸다.
 */

const out: QuestionSeed[] = [];

/** 값이 같은 보기가 섞이지 않도록 쓰는 정규화 키 (sanitizer와 같은 규칙의 축소판) */
function vkey(s: string): string {
  const t = s.trim().replace(/\s+/g, '');
  const frac = /^(-?\d+)\/(\d+)$/.exec(t);
  if (frac && Number(frac[2]) !== 0) return `#${Number(frac[1]) / Number(frac[2])}`;
  if (/^-?\d+(\.\d+)?$/.test(t)) return `#${Number(t)}`;
  const unit = /^(-?\d+(?:\.\d+)?)(\D.*)$/.exec(t);
  if (unit) return `#${Number(unit[1])}|${unit[2]}`;
  return `=${t}`;
}

interface Add {
  grade: number;
  unit: string;
  unit_code?: string | null;
  text: string;
  answer: string;
  wrong: string[];
  why: string;
  difficulty?: number;
}

/**
 * 문항 하나를 추가한다.
 * 오답 후보 중 정답과 값이 겹치거나 서로 겹치는 것을 버리고 앞에서 3개를 쓴다.
 * 3개를 못 채우면 문항 자체를 버린다 — 억지 보기를 넣지 않는다.
 */
function add({ grade, unit, unit_code = null, text, answer, wrong, why, difficulty = 2 }: Add) {
  const seen = new Set([vkey(answer)]);
  const picked: string[] = [];
  for (const w of wrong) {
    const k = vkey(w);
    if (seen.has(k)) continue;
    seen.add(k);
    picked.push(w);
    if (picked.length === 3) break;
  }
  if (picked.length < 3) return;
  // 정답 위치는 발문 길이로 결정론적으로 회전시킨다(항상 1번 방지).
  const opts = [answer, ...picked];
  const r = text.length % 4;
  out.push({
    grade,
    subject: '수학',
    unit,
    unit_code,
    question_type: 'multiple_choice',
    question_text: text,
    options: [...opts.slice(r), ...opts.slice(0, r)],
    correct_answer: answer,
    explanation: why,
    difficulty,
  });
}

const N = (n: number) => String(n);

// ════════════════════════════════════════════════════════════
// 3학년
// ════════════════════════════════════════════════════════════

// 1. 덧셈과 뺄셈 — 세 자리 수, 받아올림·받아내림
{
  const unit = '1. 덧셈과 뺄셈';
  const code = '[4수01-01]';
  const pairs: Array<[number, number]> = [
    [347, 285], [426, 397], [538, 264], [619, 173], [275, 486],
    [704, 158], [283, 549], [365, 278], [492, 319], [187, 634],
  ];
  for (const [a, b] of pairs) {
    add({
      grade: 3, unit, unit_code: code,
      text: `${a} + ${b}는 얼마인가요?`,
      answer: N(a + b),
      // 받아올림을 빠뜨렸을 때 나오는 값들
      wrong: [N(a + b - 100), N(a + b - 10), N(a + b + 10), N(a + b + 100)],
      why: `일의 자리부터 더하며 받아올림을 잊지 않습니다. ${a}+${b}=${a + b}`,
      difficulty: 1,
    });
    add({
      grade: 3, unit, unit_code: code,
      text: `${a + b} - ${b}는 얼마인가요?`,
      answer: N(a),
      wrong: [N(a - 100), N(a + 10), N(a - 10), N(a + 100)],
      why: `뺄셈은 덧셈의 반대입니다. ${a}+${b}=${a + b}이므로 ${a + b}-${b}=${a}`,
      difficulty: 2,
    });
    add({
      grade: 3, unit, unit_code: code,
      text: `어떤 수에 ${b}를 더했더니 ${a + b}가 되었습니다. 어떤 수는?`,
      answer: N(a),
      wrong: [N(a + b + b), N(a - 10), N(b), N(a + 10)],
      why: `더하기의 반대인 빼기로 구합니다. ${a + b}-${b}=${a}`,
      difficulty: 3,
    });
  }
}

// 2. 평면도형
{
  const unit = '2. 평면도형';
  const code = '[4수02-01]';
  const facts: Array<[string, string, string[], string]> = [
    ['한 점에서 시작해 한쪽으로 끝없이 늘인 곧은 선을 무엇이라고 하나요?', '반직선', ['선분', '직선', '곡선'], '반직선은 시작점이 하나이고 한쪽으로만 끝없이 늘어납니다.'],
    ['두 점을 곧게 이은 선을 무엇이라고 하나요?', '선분', ['반직선', '직선', '각'], '선분은 두 점을 곧게 이은, 양끝이 있는 선입니다.'],
    ['선분을 양쪽으로 끝없이 늘인 곧은 선은?', '직선', ['선분', '반직선', '변'], '직선은 양쪽 모두 끝없이 늘어나는 곧은 선입니다.'],
    ['한 점에서 그은 두 반직선으로 이루어진 도형은?', '각', ['원', '삼각형', '선분'], '각은 한 점(꼭짓점)에서 그은 두 반직선으로 이루어집니다.'],
    ['종이를 반듯하게 두 번 접었을 때 생기는 각처럼, 반듯한 각을 무엇이라고 하나요?', '직각', ['예각', '둔각', '평각'], '직각은 네모 모서리처럼 반듯한 각입니다.'],
    ['네 각이 모두 직각인 사각형을 무엇이라고 하나요?', '직사각형', ['평행사변형', '마름모', '사다리꼴'], '네 각이 모두 직각인 사각형이 직사각형입니다.'],
    ['네 각이 모두 직각이고 네 변의 길이가 모두 같은 사각형은?', '정사각형', ['직사각형', '마름모', '사다리꼴'], '정사각형은 직사각형이면서 네 변의 길이까지 같습니다.'],
    ['한 각이 직각인 삼각형을 무엇이라고 하나요?', '직각삼각형', ['정삼각형', '이등변삼각형', '둔각삼각형'], '직각이 하나 있는 삼각형이 직각삼각형입니다.'],
    ['직사각형에서 마주 보는 두 변의 길이는 어떠한가요?', '서로 같다', ['서로 다르다', '항상 두 배이다', '알 수 없다'], '직사각형은 마주 보는 두 변의 길이가 서로 같습니다.'],
    ['정사각형은 직사각형이라고 할 수 있나요?', '있다 — 네 각이 모두 직각이기 때문', ['없다 — 네 변의 길이가 같아서', '없다 — 네 각의 크기가 달라서', '경우에 따라 다르게 볼 수 있다'], '정사각형도 네 각이 모두 직각이므로 직사각형에 포함됩니다.'],
  ];
  for (const [text, answer, wrong, why] of facts) {
    add({ grade: 3, unit, unit_code: code, text, answer, wrong, why, difficulty: 2 });
  }
  for (const side of [4, 6, 7, 9, 12, 15]) {
    add({
      grade: 3, unit, unit_code: code,
      text: `한 변의 길이가 ${side}cm인 정사각형의 네 변의 길이의 합은?`,
      answer: `${side * 4}cm`,
      wrong: [`${side * 2}cm`, `${side * side}cm`, `${side * 3}cm`, `${side * 4 + side}cm`],
      why: `정사각형은 네 변이 모두 같으므로 ${side}×4=${side * 4}(cm)입니다.`,
      difficulty: 2,
    });
  }
  for (const [w, h] of [[5, 3], [8, 4], [10, 6], [12, 7], [9, 5], [15, 8]] as Array<[number, number]>) {
    add({
      grade: 3, unit, unit_code: code,
      text: `가로 ${w}cm, 세로 ${h}cm인 직사각형의 네 변의 길이의 합은?`,
      answer: `${(w + h) * 2}cm`,
      wrong: [`${w + h}cm`, `${w * h}cm`, `${(w + h) * 2 + 2}cm`, `${w * 2 + h}cm`],
      why: `(가로+세로)×2 = (${w}+${h})×2 = ${(w + h) * 2}(cm)`,
      difficulty: 2,
    });
  }
}

// 3. 나눗셈 — 곱셈구구 범위
{
  const unit = '3. 나눗셈';
  const code = '[4수01-06]';
  for (const [total, group] of [[24, 4], [35, 5], [42, 6], [56, 7], [63, 9], [48, 8], [27, 3], [54, 6], [72, 8], [45, 5]] as Array<[number, number]>) {
    const q = total / group;
    add({
      grade: 3, unit, unit_code: code,
      text: `사탕 ${total}개를 ${group}명에게 똑같이 나누어 주면 한 명이 몇 개씩 받나요?`,
      answer: `${q}개`,
      wrong: [`${q + 1}개`, `${q - 1}개`, `${total - group}개`, `${group}개`],
      why: `${total}÷${group}=${q}이므로 한 명이 ${q}개씩 받습니다.`,
      difficulty: 1,
    });
    add({
      grade: 3, unit, unit_code: code,
      text: `${total} ÷ ${group}의 몫은 얼마인가요?`,
      answer: N(q),
      wrong: [N(q + 1), N(q - 1), N(total - group), N(group)],
      why: `${group}×${q}=${total}이므로 몫은 ${q}입니다.`,
      difficulty: 1,
    });
    add({
      grade: 3, unit, unit_code: code,
      text: `${group} × □ = ${total} 일 때 □에 알맞은 수는?`,
      answer: N(q),
      wrong: [N(q + 1), N(q - 1), N(total), N(total - group)],
      why: `곱셈과 나눗셈은 반대입니다. ${total}÷${group}=${q}`,
      difficulty: 2,
    });
  }
}

// 4. 곱셈 — (두 자리)×(한 자리)
{
  const unit = '4. 곱셈';
  const code = '[4수01-05]';
  const pairs: Array<[number, number]> = [
    [23, 4], [36, 3], [47, 5], [58, 6], [64, 7], [72, 8], [85, 3], [96, 4], [39, 7], [28, 9], [53, 6], [17, 8],
  ];
  for (const [a, b] of pairs) {
    const ans = a * b;
    const tens = Math.floor(a / 10) * 10 * b;
    add({
      grade: 3, unit, unit_code: code,
      text: `${a} × ${b}는 얼마인가요?`,
      answer: N(ans),
      // 자리올림 누락(십의 자리만/일의 자리만 곱함)에서 나오는 값
      wrong: [N(tens + (a % 10)), N(ans - 10), N(ans + 10), N((a % 10) * b + Math.floor(a / 10) * b)],
      why: `${a}×${b} = ${Math.floor(a / 10)}0×${b} + ${a % 10}×${b} = ${tens}+${(a % 10) * b} = ${ans}`,
      difficulty: 2,
    });
  }
}

// 5. 길이와 시간
{
  const unit = '5. 길이와 시간';
  const code = '[4수03-01]';
  for (const cm of [3, 7, 12, 25, 48, 60]) {
    add({
      grade: 3, unit, unit_code: code,
      text: `${cm}cm는 몇 mm인가요?`,
      answer: `${cm * 10}mm`,
      wrong: [`${cm * 100}mm`, `${cm}mm`, `${cm * 10 + 10}mm`, `${Math.round(cm / 10)}mm`],
      why: `1cm=10mm이므로 ${cm}cm=${cm * 10}mm입니다.`,
      difficulty: 1,
    });
  }
  for (const km of [2, 5, 8, 13, 24]) {
    add({
      grade: 3, unit, unit_code: code,
      text: `${km}km는 몇 m인가요?`,
      answer: `${km * 1000}m`,
      wrong: [`${km * 100}m`, `${km * 10}m`, `${km * 1000 + 100}m`, `${km}m`],
      why: `1km=1000m이므로 ${km}km=${km * 1000}m입니다.`,
      difficulty: 1,
    });
  }
  for (const [m, s] of [[3, 40], [5, 25], [8, 15], [12, 30], [7, 50]] as Array<[number, number]>) {
    add({
      grade: 3, unit, unit_code: code,
      text: `${m}분 ${s}초는 모두 몇 초인가요?`,
      answer: `${m * 60 + s}초`,
      wrong: [`${m * 100 + s}초`, `${m * 60}초`, `${m + s}초`, `${m * 60 + s + 60}초`],
      why: `1분=60초이므로 ${m}×60+${s}=${m * 60 + s}(초)입니다.`,
      difficulty: 2,
    });
  }
  for (const [h1, m1, add1] of [[2, 40, 35], [3, 25, 50], [1, 55, 20], [4, 15, 55], [6, 30, 45]] as Array<[number, number, number]>) {
    const total = h1 * 60 + m1 + add1;
    add({
      grade: 3, unit, unit_code: code,
      text: `${h1}시간 ${m1}분에 ${add1}분을 더하면 몇 시간 몇 분인가요?`,
      answer: `${Math.floor(total / 60)}시간 ${total % 60}분`,
      wrong: [
        `${h1}시간 ${m1 + add1}분`,
        `${Math.floor(total / 60) + 1}시간 ${total % 60}분`,
        `${Math.floor(total / 60)}시간 ${(total % 60) + 10}분`,
        `${Math.floor(total / 60) - 1}시간 ${total % 60}분`,
      ],
      why: `${m1}+${add1}=${m1 + add1}(분)이고 60분은 1시간이 되므로 ${Math.floor(total / 60)}시간 ${total % 60}분입니다.`,
      difficulty: 3,
    });
  }
}

// 6. 분수와 소수
{
  const unit = '6. 분수와 소수';
  const code = '[4수01-10]';
  for (const [n, d] of [[1, 4], [2, 5], [3, 8], [1, 2], [3, 10], [7, 10], [4, 9], [5, 6]] as Array<[number, number]>) {
    add({
      grade: 3, unit, unit_code: code,
      text: `전체를 똑같이 ${d}로 나눈 것 중 ${n}을 분수로 나타내면?`,
      answer: `${n}/${d}`,
      wrong: [`${d}/${n}`, `${n}/${d + 1}`, `${n + 1}/${d}`, `${n}/${d - 1}`],
      why: `똑같이 나눈 수가 분모, 그중 세는 수가 분자입니다. → ${n}/${d}`,
      difficulty: 1,
    });
  }
  for (const [n, dec] of [[3, '0.3'], [7, '0.7'], [9, '0.9'], [4, '0.4'], [6, '0.6']] as Array<[number, string]>) {
    add({
      grade: 3, unit, unit_code: code,
      text: `0.1이 ${n}개이면 얼마인가요?`,
      answer: dec,
      wrong: [`0.0${n}`, `${n}`, `${n}.0`, `${(n / 10 + 0.1).toFixed(1)}`],
      why: `0.1이 ${n}개이면 ${dec}입니다.`,
      difficulty: 1,
    });
  }
  for (const [a, b] of [['0.5', '0.7'], ['0.3', '0.9'], ['0.8', '0.4'], ['0.2', '0.6']] as Array<[string, string]>) {
    const bigger = Number(a) > Number(b) ? a : b;
    add({
      grade: 3, unit, unit_code: code,
      text: `${a}와 ${b} 중 더 큰 수는?`,
      answer: bigger,
      wrong: [Number(a) > Number(b) ? b : a, '두 수는 같다', '비교할 수 없다'],
      why: `소수점 아래 숫자를 비교하면 ${bigger}이 더 큽니다.`,
      difficulty: 1,
    });
  }
  for (const d of [2, 4, 5, 8, 10]) {
    add({
      grade: 3, unit, unit_code: code,
      text: `분모가 ${d}인 분수 중 1과 크기가 같은 분수는?`,
      answer: `${d}/${d}`,
      wrong: [`1/${d}`, `${d - 1}/${d}`, `${d + 1}/${d}`, `${d}/1`],
      why: `분자와 분모가 같은 분수는 1과 크기가 같습니다.`,
      difficulty: 2,
    });
  }
}

// 7. 곱셈(2학기)
{
  const unit = '7. 곱셈(2학기)';
  const code = '[4수01-05]';
  for (const [a, b] of [[213, 4], [325, 3], [428, 6], [507, 5], [634, 7], [156, 8]] as Array<[number, number]>) {
    add({
      grade: 3, unit, unit_code: code,
      text: `${a} × ${b}는 얼마인가요?`,
      answer: N(a * b),
      wrong: [N(a * b - 100), N(a * b + 100), N(a * b - 10), N(a * b + 1000)],
      why: `${a}×${b}=${a * b}`,
      difficulty: 2,
    });
  }
  for (const [a, b] of [[23, 14], [36, 21], [45, 32], [58, 13], [27, 45], [64, 25]] as Array<[number, number]>) {
    const ans = a * b;
    add({
      grade: 3, unit, unit_code: code,
      text: `${a} × ${b}는 얼마인가요?`,
      answer: N(ans),
      // 십의 자리 곱을 한 칸 밀지 않는 흔한 실수
      wrong: [N(a * (b % 10) + a * Math.floor(b / 10)), N(ans - 100), N(ans + 100), N(ans - a)],
      why: `${a}×${b % 10}=${a * (b % 10)}, ${a}×${Math.floor(b / 10)}0=${a * Math.floor(b / 10) * 10}. 합하면 ${ans}입니다.`,
      difficulty: 3,
    });
  }
}

// 8. 나눗셈(2학기) — 나머지가 있는 나눗셈
{
  const unit = '8. 나눗셈(2학기)';
  const code = '[4수01-07]';
  for (const [a, b] of [[47, 5], [58, 7], [73, 6], [85, 9], [64, 3], [92, 8], [37, 4], [79, 6]] as Array<[number, number]>) {
    const q = Math.floor(a / b);
    const r = a % b;
    add({
      grade: 3, unit, unit_code: code,
      text: `${a} ÷ ${b}의 몫과 나머지는?`,
      answer: `몫 ${q}, 나머지 ${r}`,
      wrong: [`몫 ${r}, 나머지 ${q}`, `몫 ${q + 1}, 나머지 ${r}`, `몫 ${q}, 나머지 ${r + 1}`, `몫 ${q - 1}, 나머지 ${r}`],
      why: `${b}×${q}=${b * q}이고 ${a}-${b * q}=${r}이므로 몫 ${q}, 나머지 ${r}입니다.`,
      difficulty: 2,
    });
    add({
      grade: 3, unit, unit_code: code,
      text: `색종이 ${a}장을 ${b}명에게 똑같이 나누어 줄 때 남는 색종이는 몇 장인가요?`,
      answer: `${r}장`,
      wrong: [`${q}장`, `${r + 1}장`, `0장`, `${b - r}장`],
      why: `${a}÷${b}는 몫 ${q}, 나머지 ${r}이므로 ${r}장이 남습니다.`,
      difficulty: 2,
    });
  }
  add({
    grade: 3, unit, unit_code: code,
    text: '나눗셈에서 나머지는 나누는 수와 비교해 어떠해야 하나요?',
    answer: '나누는 수보다 항상 작아야 한다',
    wrong: ['나누는 수보다 반드시 커야 한다', '나누는 수와 정확히 같아야 한다', '나눗셈의 몫보다 작아야 한다'],
    why: '나머지가 나누는 수보다 크거나 같으면 몫을 더 크게 잡을 수 있습니다.',
    difficulty: 3,
  });
}

// 9. 원
{
  const unit = '9. 원';
  const code = '[4수02-02]';
  const facts: Array<[string, string, string[], string]> = [
    ['원을 그릴 때 컴퍼스의 침을 꽂는 점을 무엇이라고 하나요?', '원의 중심', ['반지름', '지름', '원주'], '컴퍼스 침을 꽂는 점이 원의 중심입니다.'],
    ['원의 중심에서 원 위의 한 점까지 이은 선분은?', '반지름', ['지름', '현', '중심각'], '원의 중심과 원 위의 점을 이은 선분이 반지름입니다.'],
    ['원의 중심을 지나며 원 위의 두 점을 이은 선분은?', '지름', ['반지름', '변', '높이'], '원의 중심을 지나는 가장 긴 선분이 지름입니다.'],
    ['한 원에서 지름은 반지름의 몇 배인가요?', '2배', ['3배', '4배', '반(1/2)'], '지름은 반지름 두 개를 이은 길이와 같습니다.'],
    ['한 원에서 반지름의 길이는 어떠한가요?', '모두 같다', ['모두 다르다', '두 가지뿐이다', '중심에서 멀수록 길다'], '한 원에서 반지름은 모두 같은 길이입니다.'],
  ];
  for (const [text, answer, wrong, why] of facts) add({ grade: 3, unit, unit_code: code, text, answer, wrong, why });
  for (const r of [3, 5, 7, 8, 12, 15, 20, 25]) {
    add({
      grade: 3, unit, unit_code: code,
      text: `반지름이 ${r}cm인 원의 지름은 몇 cm인가요?`,
      answer: `${r * 2}cm`,
      wrong: [`${r}cm`, `${r * 4}cm`, `${r * 2 + 1}cm`, `${Math.round(r / 2)}cm`],
      why: `지름=반지름×2이므로 ${r}×2=${r * 2}(cm)입니다.`,
      difficulty: 1,
    });
    add({
      grade: 3, unit, unit_code: code,
      text: `지름이 ${r * 2}cm인 원의 반지름은 몇 cm인가요?`,
      answer: `${r}cm`,
      wrong: [`${r * 2}cm`, `${r * 4}cm`, `${r + 1}cm`, `${r - 1}cm`],
      why: `반지름=지름÷2이므로 ${r * 2}÷2=${r}(cm)입니다.`,
      difficulty: 1,
    });
  }
}

// 10. 분수 — 진분수·가분수·대분수
{
  const unit = '10. 분수';
  const code = '[4수01-11]';
  for (const [n, d] of [[3, 5], [7, 4], [2, 9], [11, 6], [5, 8], [9, 7], [4, 11], [13, 5]] as Array<[number, number]>) {
    const kind = n < d ? '진분수' : '가분수';
    add({
      grade: 3, unit, unit_code: code,
      text: `${n}/${d}은(는) 진분수인가요, 가분수인가요?`,
      answer: kind,
      wrong: [n < d ? '가분수' : '진분수', '대분수', '자연수'],
      why: n < d ? '분자가 분모보다 작으면 진분수입니다.' : '분자가 분모와 같거나 크면 가분수입니다.',
      difficulty: 1,
    });
  }
  for (const [w, n, d] of [[1, 2, 3], [2, 1, 4], [3, 3, 5], [1, 5, 6], [2, 3, 7], [4, 1, 2]] as Array<[number, number, number]>) {
    const imp = w * d + n;
    add({
      grade: 3, unit, unit_code: code,
      text: `대분수 ${w}과 ${n}/${d}을(를) 가분수로 나타내면?`,
      answer: `${imp}/${d}`,
      wrong: [`${w * n}/${d}`, `${imp + 1}/${d}`, `${w + n}/${d}`, `${imp - 1}/${d}`],
      why: `자연수 부분을 분수로 바꿔 더합니다. ${w}×${d}+${n}=${imp} → ${imp}/${d}`,
      difficulty: 2,
    });
    add({
      grade: 3, unit, unit_code: code,
      text: `가분수 ${imp}/${d}을(를) 대분수로 나타내면?`,
      answer: `${w}과 ${n}/${d}`,
      wrong: [`${w + 1}과 ${n}/${d}`, `${w}과 ${n + 1}/${d}`, `${n}과 ${w}/${d}`, `${w - 1}과 ${n}/${d}`],
      why: `${imp}÷${d}는 몫 ${w}, 나머지 ${n}이므로 ${w}과 ${n}/${d}입니다.`,
      difficulty: 2,
    });
  }
  for (const [total, parts, take] of [[12, 3, 2], [20, 4, 3], [18, 6, 5], [24, 8, 3], [15, 5, 4]] as Array<[number, number, number]>) {
    add({
      grade: 3, unit, unit_code: code,
      text: `${total}의 ${take}/${parts}은 얼마인가요?`,
      answer: N((total / parts) * take),
      wrong: [N(total / parts), N(total - take), N((total / parts) * (parts - take)), N(total * take)],
      why: `${total}을 ${parts}묶음으로 나누면 한 묶음은 ${total / parts}, ${take}묶음은 ${(total / parts) * take}입니다.`,
      difficulty: 3,
    });
  }
}

// 11. 들이와 무게
{
  const unit = '11. 들이와 무게';
  const code = '[4수03-05]';
  for (const l of [2, 3, 5, 7, 12]) {
    add({
      grade: 3, unit, unit_code: code,
      text: `${l}L는 몇 mL인가요?`,
      answer: `${l * 1000}mL`,
      wrong: [`${l * 100}mL`, `${l * 10}mL`, `${l}mL`, `${l * 1000 + 100}mL`],
      why: `1L=1000mL이므로 ${l}L=${l * 1000}mL입니다.`,
      difficulty: 1,
    });
  }
  for (const [l, ml] of [[2, 300], [3, 750], [1, 450], [5, 80], [4, 600]] as Array<[number, number]>) {
    add({
      grade: 3, unit, unit_code: code,
      text: `${l}L ${ml}mL는 모두 몇 mL인가요?`,
      answer: `${l * 1000 + ml}mL`,
      wrong: [`${l * 100 + ml}mL`, `${l + ml}mL`, `${l * 1000}mL`, `${l * 1000 + ml + 100}mL`],
      why: `${l}L=${l * 1000}mL이므로 모두 ${l * 1000 + ml}mL입니다.`,
      difficulty: 2,
    });
  }
  for (const kg of [2, 4, 6, 9, 15]) {
    add({
      grade: 3, unit, unit_code: code,
      text: `${kg}kg은 몇 g인가요?`,
      answer: `${kg * 1000}g`,
      wrong: [`${kg * 100}g`, `${kg * 10}g`, `${kg}g`, `${kg * 1000 + 100}g`],
      why: `1kg=1000g이므로 ${kg}kg=${kg * 1000}g입니다.`,
      difficulty: 1,
    });
  }
  add({
    grade: 3, unit, unit_code: code,
    text: '1t(톤)은 몇 kg인가요?',
    answer: '1000kg',
    wrong: ['100kg', '10kg', '10000kg'],
    why: '1t=1000kg입니다.',
    difficulty: 2,
  });
}

// 12. 자료의 정리
{
  const unit = '12. 자료의 정리';
  const code = '[4수04-01]';
  const facts: Array<[string, string, string[], string]> = [
    ['자료를 종류별로 세어 수로 나타낸 것을 무엇이라고 하나요?', '표', ['그림그래프', '막대그래프', '꺾은선그래프'], '자료를 세어 수로 정리한 것이 표입니다.'],
    ['자료의 수를 그림의 크기와 개수로 나타낸 그래프는?', '그림그래프', ['막대그래프', '표', '띠그래프'], '그림그래프는 그림의 크기와 개수로 수를 나타냅니다.'],
    ['그림그래프에서 가장 먼저 정해야 하는 것은?', '그림 한 개가 나타내는 수', ['그래프에 붙일 제목', '조사에 참여한 사람 수', '그림에 칠할 색깔'], '단위를 정해야 그림의 개수를 정할 수 있습니다.'],
    ['표에서 합계는 무엇을 나타내나요?', '각 항목의 수를 모두 더한 값', ['수가 가장 많은 항목의 수', '표에 들어 있는 항목의 개수', '항목별 수를 고르게 나눈 값'], '합계는 모든 항목의 수를 더한 것입니다.'],
    ['자료를 표로 정리하면 좋은 점은?', '항목별 수를 한눈에 알 수 있다', ['그림이 훨씬 예쁘게 보인다', '조사할 자료의 양이 늘어난다', '따로 조사를 하지 않아도 된다'], '표는 항목별 수와 합계를 정확히 보여 줍니다.'],
  ];
  for (const [text, answer, wrong, why] of facts) add({ grade: 3, unit, unit_code: code, text, answer, wrong, why });
  for (const [a, b, c] of [[12, 8, 15], [23, 17, 9], [31, 24, 18], [7, 14, 26], [19, 22, 11], [26, 13, 20]] as Array<[number, number, number]>) {
    const sum = a + b + c;
    add({
      grade: 3, unit, unit_code: code,
      text: `표에서 사과 ${a}개, 배 ${b}개, 감 ${c}개를 조사했습니다. 합계는 몇 개인가요?`,
      answer: `${sum}개`,
      wrong: [`${sum - 10}개`, `${sum + 10}개`, `${Math.max(a, b, c)}개`, `${sum - a}개`],
      why: `${a}+${b}+${c}=${sum}(개)`,
      difficulty: 1,
    });
    add({
      grade: 3, unit, unit_code: code,
      text: `사과 ${a}개, 배 ${b}개, 감 ${c}개 중 가장 많은 과일은 몇 개인가요?`,
      answer: `${Math.max(a, b, c)}개`,
      wrong: [`${Math.min(a, b, c)}개`, `${a + b + c}개`, `${[a, b, c].sort((x, y) => y - x)[1]}개`],
      why: `${a}, ${b}, ${c} 중 가장 큰 수는 ${Math.max(a, b, c)}입니다.`,
      difficulty: 1,
    });
  }
}

// ════════════════════════════════════════════════════════════
// 4학년
// ════════════════════════════════════════════════════════════

// 1. 큰 수
{
  const unit = '1. 큰 수';
  const code = '[4수01-02]';
  const bigs: Array<[string, string, string[], string]> = [
    ['10000이 5개, 1000이 3개인 수는?', '53000', ['5300', '530000', '50300'], '10000이 5개면 50000, 1000이 3개면 3000이므로 53000입니다.'],
    ['1억은 1000만이 몇 개인 수인가요?', '10개', ['100개', '1000개', '10000개'], '1000만이 10개 모이면 1억입니다.'],
    ['1조는 1억이 몇 개인 수인가요?', '10000개', ['100개', '1000개', '100000개'], '1억이 10000개 모이면 1조입니다.'],
    ['숫자 7이 나타내는 값이 가장 큰 수는?', '73254', ['37254', '32754', '32574'], '만의 자리에 있는 7이 70000을 나타내어 가장 큽니다.'],
    ['1000만의 10배는 얼마인가요?', '1억', ['100만', '10억', '1조'], '1000만을 10배 하면 1억입니다.'],
  ];
  for (const [text, answer, wrong, why] of bigs) add({ grade: 4, unit, unit_code: code, text, answer, wrong, why });
  for (const [start, step, times] of [[3000, 1000, 4], [25000, 10000, 3], [120000, 100000, 2], [4500, 100, 5], [68000, 1000, 6]] as Array<[number, number, number]>) {
    const end = start + step * times;
    add({
      grade: 4, unit, unit_code: code,
      text: `${start.toLocaleString()}부터 ${step.toLocaleString()}씩 ${times}번 뛰어 센 수는?`,
      answer: end.toLocaleString(),
      wrong: [(start + step * (times - 1)).toLocaleString(), (start + step * (times + 1)).toLocaleString(), (start + step).toLocaleString(), (start * times).toLocaleString()],
      why: `${start.toLocaleString()} + ${step.toLocaleString()}×${times} = ${end.toLocaleString()}`,
      difficulty: 2,
    });
  }
  for (const [a, b] of [[45230, 45320], [128000, 127999], [3040000, 3400000], [98765, 98756]] as Array<[number, number]>) {
    add({
      grade: 4, unit, unit_code: code,
      text: `${a.toLocaleString()}와(과) ${b.toLocaleString()} 중 더 큰 수는?`,
      answer: Math.max(a, b).toLocaleString(),
      wrong: [Math.min(a, b).toLocaleString(), '두 수는 같다', '비교할 수 없다'],
      why: `높은 자리부터 차례로 비교하면 ${Math.max(a, b).toLocaleString()}이(가) 더 큽니다.`,
      difficulty: 2,
    });
  }
}

// 2. 각도
{
  const unit = '2. 각도';
  const code = '[4수02-03]';
  for (const deg of [35, 48, 72, 88, 95, 110, 135, 168]) {
    add({
      grade: 4, unit, unit_code: code,
      text: `${deg}°는 예각인가요, 둔각인가요?`,
      answer: deg < 90 ? '예각' : '둔각',
      wrong: [deg < 90 ? '둔각' : '예각', '직각', '평각'],
      why: deg < 90 ? '0°보다 크고 직각(90°)보다 작으면 예각입니다.' : '직각(90°)보다 크고 180°보다 작으면 둔각입니다.',
      difficulty: 1,
    });
  }
  for (const [a, b] of [[35, 47], [62, 28], [115, 40], [78, 56], [95, 63], [130, 25]] as Array<[number, number]>) {
    add({
      grade: 4, unit, unit_code: code,
      text: `${a}° + ${b}°는 몇 도인가요?`,
      answer: `${a + b}°`,
      wrong: [`${a + b - 10}°`, `${a + b + 10}°`, `${Math.abs(a - b)}°`, `${a + b - 1}°`],
      why: `각도끼리 더합니다. ${a}+${b}=${a + b}(°)`,
      difficulty: 1,
    });
  }
  for (const [x, y] of [[45, 60], [70, 35], [52, 83], [38, 91], [64, 47]] as Array<[number, number]>) {
    const third = 180 - x - y;
    add({
      grade: 4, unit, unit_code: code,
      text: `삼각형의 두 각이 ${x}°, ${y}°일 때 나머지 한 각은?`,
      answer: `${third}°`,
      wrong: [`${third + 10}°`, `${third - 10}°`, `${360 - x - y}°`, `${x + y}°`],
      why: `삼각형 세 각의 합은 180°입니다. 180-${x}-${y}=${third}(°)`,
      difficulty: 2,
    });
  }
  for (const [a, b, c] of [[80, 95, 100], [70, 110, 85], [90, 60, 130], [120, 75, 65]] as Array<[number, number, number]>) {
    const fourth = 360 - a - b - c;
    add({
      grade: 4, unit, unit_code: code,
      text: `사각형의 세 각이 ${a}°, ${b}°, ${c}°일 때 나머지 한 각은?`,
      answer: `${fourth}°`,
      wrong: [`${fourth + 10}°`, `${fourth - 10}°`, `${180 - a - b - c + 180}°`.replace('--', ''), `${a + b + c}°`],
      why: `사각형 네 각의 합은 360°입니다. 360-${a}-${b}-${c}=${fourth}(°)`,
      difficulty: 2,
    });
  }
  add({ grade: 4, unit, unit_code: code, text: '삼각형 세 각의 크기의 합은?', answer: '180°', wrong: ['90°', '360°', '270°'], why: '어떤 삼각형이든 세 각의 합은 180°입니다.', difficulty: 1 });
  add({ grade: 4, unit, unit_code: code, text: '사각형 네 각의 크기의 합은?', answer: '360°', wrong: ['180°', '270°', '540°'], why: '사각형은 삼각형 두 개로 나뉘므로 180°×2=360°입니다.', difficulty: 1 });
}

// 3. 곱셈과 나눗셈
{
  const unit = '3. 곱셈과 나눗셈';
  const code = '[4수01-08]';
  for (const [a, b] of [[213, 24], [345, 13], [426, 31], [507, 22], [168, 45], [239, 16]] as Array<[number, number]>) {
    add({
      grade: 4, unit, unit_code: code,
      text: `${a} × ${b}는 얼마인가요?`,
      answer: N(a * b),
      wrong: [N(a * (b % 10) + a * Math.floor(b / 10)), N(a * b - 1000), N(a * b + 1000), N(a * b - a)],
      why: `${a}×${b % 10}=${a * (b % 10)}, ${a}×${Math.floor(b / 10)}0=${a * Math.floor(b / 10) * 10} → 합 ${a * b}`,
      difficulty: 3,
    });
  }
  for (const [a, b] of [[276, 12], [432, 18], [585, 15], [714, 21], [368, 23], [925, 25]] as Array<[number, number]>) {
    const q = Math.floor(a / b);
    const r = a % b;
    add({
      grade: 4, unit, unit_code: code,
      text: `${a} ÷ ${b}의 몫은 얼마인가요?`,
      answer: N(q),
      wrong: [N(q + 1), N(q - 1), N(r), N(q + 10)],
      why: r === 0 ? `${b}×${q}=${a}이므로 몫은 ${q}입니다.` : `${b}×${q}=${b * q}, 나머지 ${r}이므로 몫은 ${q}입니다.`,
      difficulty: 3,
    });
  }
}

// 4. 삼각형
{
  const unit = '4. 삼각형';
  const code = '[4수02-04]';
  const facts: Array<[string, string, string[], string]> = [
    ['두 변의 길이가 같은 삼각형을 무엇이라고 하나요?', '이등변삼각형', ['정삼각형', '직각삼각형', '둔각삼각형'], '두 변의 길이가 같으면 이등변삼각형입니다.'],
    ['세 변의 길이가 모두 같은 삼각형은?', '정삼각형', ['이등변삼각형', '직각삼각형', '예각삼각형'], '세 변이 모두 같은 삼각형이 정삼각형입니다.'],
    ['정삼각형의 한 각의 크기는 몇 도인가요?', '60°', ['45°', '90°', '30°'], '180°÷3=60°입니다.'],
    ['이등변삼각형에서 길이가 같은 두 변에 마주 보는 두 각은?', '크기가 서로 같다', ['크기가 서로 다르다', '항상 직각이다', '합이 90°이다'], '이등변삼각형의 두 밑각은 크기가 같습니다.'],
    ['세 각이 모두 예각인 삼각형을 무엇이라고 하나요?', '예각삼각형', ['둔각삼각형', '직각삼각형', '정삼각형'], '세 각이 모두 90°보다 작으면 예각삼각형입니다.'],
    ['한 각이 둔각인 삼각형은?', '둔각삼각형', ['예각삼각형', '직각삼각형', '이등변삼각형'], '90°보다 큰 각이 하나 있으면 둔각삼각형입니다.'],
    ['정삼각형은 이등변삼각형이라고 할 수 있나요?', '있다 — 두 변이 같은 조건을 만족하기 때문', ['없다 — 세 변의 길이가 모두 같아서', '없다 — 세 각의 크기가 서로 달라서', '경우에 따라 다르다고 할 수 있다'], '세 변이 같으면 두 변도 같으므로 이등변삼각형에 포함됩니다.'],
    ['삼각형에서 직각은 최대 몇 개까지 있을 수 있나요?', '1개', ['2개', '3개', '0개'], '직각이 두 개면 각의 합이 180°를 넘어 삼각형이 될 수 없습니다.'],
  ];
  for (const [text, answer, wrong, why] of facts) add({ grade: 4, unit, unit_code: code, text, answer, wrong, why });
  for (const [side, base] of [[7, 5], [9, 4], [12, 8], [6, 10], [15, 9]] as Array<[number, number]>) {
    add({
      grade: 4, unit, unit_code: code,
      text: `길이가 같은 두 변이 ${side}cm이고 나머지 한 변이 ${base}cm인 이등변삼각형의 세 변의 길이의 합은?`,
      answer: `${side * 2 + base}cm`,
      wrong: [`${side + base}cm`, `${side * 3}cm`, `${side * 2 + base + 2}cm`, `${side * base}cm`],
      why: `${side}+${side}+${base}=${side * 2 + base}(cm)`,
      difficulty: 2,
    });
  }
  for (const s of [4, 6, 8, 11, 14]) {
    add({
      grade: 4, unit, unit_code: code,
      text: `한 변이 ${s}cm인 정삼각형의 세 변의 길이의 합은?`,
      answer: `${s * 3}cm`,
      wrong: [`${s * 2}cm`, `${s * 4}cm`, `${s * 3 + s}cm`, `${s}cm`],
      why: `정삼각형은 세 변이 같으므로 ${s}×3=${s * 3}(cm)입니다.`,
      difficulty: 1,
    });
  }
  for (const [a] of [[70], [45], [80], [35], [55]] as Array<[number]>) {
    add({
      grade: 4, unit, unit_code: code,
      text: `이등변삼각형의 두 밑각이 각각 ${a}°일 때 꼭지각의 크기는?`,
      answer: `${180 - a * 2}°`,
      wrong: [`${a}°`, `${180 - a}°`, `${180 - a * 2 + 10}°`, `${a * 2}°`],
      why: `180-${a}-${a}=${180 - a * 2}(°)`,
      difficulty: 3,
    });
  }
}

// 5. 혼합 계산
{
  const unit = '5. 혼합 계산';
  const code = '[4수01-09]';
  for (const [a, b, c] of [[12, 3, 4], [20, 5, 6], [36, 4, 7], [45, 9, 3], [24, 6, 8], [56, 7, 5]] as Array<[number, number, number]>) {
    add({
      grade: 4, unit, unit_code: code,
      text: `${a} ÷ ${b} × ${c}를 계산하면?`,
      answer: N((a / b) * c),
      wrong: [N(a / (b * c)), N((a / b) * c + c), N(a * b * c), N((a / b) + c)],
      why: `곱셈과 나눗셈은 앞에서부터. ${a}÷${b}=${a / b}, ${a / b}×${c}=${(a / b) * c}`,
      difficulty: 2,
    });
    add({
      grade: 4, unit, unit_code: code,
      text: `${a} + ${b} × ${c}를 계산하면?`,
      answer: N(a + b * c),
      wrong: [N((a + b) * c), N(a + b + c), N(a * b + c), N(a + b * c + c)],
      why: `곱셈을 먼저 합니다. ${b}×${c}=${b * c}, ${a}+${b * c}=${a + b * c}`,
      difficulty: 2,
    });
    add({
      grade: 4, unit, unit_code: code,
      text: `(${a} + ${b}) × ${c}를 계산하면?`,
      answer: N((a + b) * c),
      wrong: [N(a + b * c), N((a + b) * c - c), N(a * c + b), N((a + b) + c)],
      why: `괄호 안을 먼저 계산합니다. ${a}+${b}=${a + b}, ${a + b}×${c}=${(a + b) * c}`,
      difficulty: 2,
    });
  }
  add({
    grade: 4, unit, unit_code: code,
    text: '덧셈·뺄셈·곱셈·나눗셈이 섞인 식에서 계산 순서로 옳은 것은?',
    answer: '괄호 → 곱셈·나눗셈 → 덧셈·뺄셈',
    wrong: ['왼쪽에서 오른쪽으로만', '덧셈·뺄셈 → 곱셈·나눗셈', '괄호 → 덧셈·뺄셈 → 곱셈·나눗셈'],
    why: '괄호를 먼저, 그다음 곱셈·나눗셈, 마지막에 덧셈·뺄셈을 합니다.',
    difficulty: 2,
  });
}

// 6. 막대그래프
{
  const unit = '6. 막대그래프';
  const code = '[4수04-02]';
  const facts: Array<[string, string, string[], string]> = [
    ['막대그래프에서 막대의 길이는 무엇을 나타내나요?', '자료의 수(크기)', ['조사한 자료의 종류', '자료를 조사한 날짜', '조사에 참여한 사람 수'], '막대가 길수록 그 항목의 수가 많다는 뜻입니다.'],
    ['막대그래프를 그릴 때 가장 먼저 할 일은?', '가로와 세로에 무엇을 나타낼지 정하기', ['그린 막대를 색칠하기', '그래프 제목을 예쁘게 쓰기', '막대를 길게 늘여 그리기'], '축에 무엇을 나타낼지 먼저 정해야 눈금을 정할 수 있습니다.'],
    ['막대그래프의 눈금 한 칸의 크기를 정할 때 기준은?', '가장 큰 자료의 수', ['가장 작은 자료의 수', '항목의 개수', '조사한 날짜'], '가장 큰 값이 들어가도록 눈금을 정해야 합니다.'],
    ['막대그래프가 표보다 좋은 점은?', '많고 적음을 한눈에 비교할 수 있다', ['각 항목의 정확한 수를 알 수 있다', '조사할 자료의 양이 늘어난다', '자료를 조사하기가 훨씬 쉬워진다'], '막대 길이로 크기를 바로 비교할 수 있습니다.'],
    ['막대그래프에서 막대의 방향은 어떻게 그릴 수 있나요?', '가로 또는 세로 모두 가능하다', ['반드시 세로로만 그려야 한다', '반드시 가로로만 그려야 한다', '반드시 대각선으로만 그려야 한다'], '가로 막대그래프와 세로 막대그래프 모두 쓸 수 있습니다.'],
  ];
  for (const [text, answer, wrong, why] of facts) add({ grade: 4, unit, unit_code: code, text, answer, wrong, why });
  for (const [unitVal, cells] of [[2, 7], [5, 6], [10, 4], [3, 9], [20, 5], [4, 8]] as Array<[number, number]>) {
    add({
      grade: 4, unit, unit_code: code,
      text: `막대그래프의 눈금 한 칸이 ${unitVal}명일 때, 막대가 ${cells}칸이면 몇 명인가요?`,
      answer: `${unitVal * cells}명`,
      wrong: [`${unitVal + cells}명`, `${cells}명`, `${unitVal * cells + unitVal}명`, `${unitVal * (cells - 1)}명`],
      why: `${unitVal}×${cells}=${unitVal * cells}(명)`,
      difficulty: 2,
    });
    add({
      grade: 4, unit, unit_code: code,
      text: `눈금 한 칸이 ${unitVal}명인 막대그래프에서 ${unitVal * cells}명은 몇 칸으로 나타내나요?`,
      answer: `${cells}칸`,
      wrong: [`${cells + 1}칸`, `${cells - 1}칸`, `${unitVal}칸`, `${unitVal * cells}칸`],
      why: `${unitVal * cells}÷${unitVal}=${cells}(칸)`,
      difficulty: 2,
    });
  }
}

// 7. 규칙 찾기
{
  const unit = '7. 규칙 찾기';
  const code = '[4수04-03]';
  for (const [start, step] of [[3, 4], [7, 5], [12, 6], [20, 8], [5, 7], [15, 9], [2, 11], [30, 12]] as Array<[number, number]>) {
    const seq = [start, start + step, start + step * 2, start + step * 3];
    add({
      grade: 4, unit, unit_code: code,
      text: `${seq.join(', ')}, □ … 다음에 올 수는?`,
      answer: N(start + step * 4),
      wrong: [N(start + step * 3 + step + 1), N(start + step * 3 + step - 1), N(start + step * 5), N(start * 4)],
      why: `${step}씩 커지는 규칙이므로 ${start + step * 3}+${step}=${start + step * 4}입니다.`,
      difficulty: 2,
    });
  }
  for (const [start, ratio] of [[2, 2], [3, 3], [1, 5], [2, 4]] as Array<[number, number]>) {
    const seq = [start, start * ratio, start * ratio ** 2, start * ratio ** 3];
    add({
      grade: 4, unit, unit_code: code,
      text: `${seq.join(', ')}, □ … 다음에 올 수는?`,
      answer: N(start * ratio ** 4),
      wrong: [N(start * ratio ** 3 + ratio), N(start * ratio ** 5), N(start * ratio ** 3 * 2), N(start * ratio ** 4 + 1)],
      why: `${ratio}배씩 커지는 규칙이므로 ${start * ratio ** 3}×${ratio}=${start * ratio ** 4}입니다.`,
      difficulty: 3,
    });
  }
  for (const [a, b] of [[5, 3], [7, 4], [9, 6], [12, 5]] as Array<[number, number]>) {
    add({
      grade: 4, unit, unit_code: code,
      text: `한 층에 의자가 ${a}개씩 놓여 있습니다. ${b}층까지 놓인 의자는 모두 몇 개인가요?`,
      answer: `${a * b}개`,
      wrong: [`${a + b}개`, `${a * b - a}개`, `${a * (b + 1)}개`, `${a * b + b}개`],
      why: `${a}×${b}=${a * b}(개)`,
      difficulty: 2,
    });
  }
}

// 8. 분수의 덧셈과 뺄셈 (동분모)
{
  const unit = '8. 분수의 덧셈과 뺄셈';
  const code = '[4수01-12]';
  for (const [d, a, b] of [[7, 2, 3], [9, 4, 3], [5, 1, 3], [11, 5, 4], [8, 3, 2], [13, 6, 5], [6, 1, 4], [10, 3, 6]] as Array<[number, number, number]>) {
    add({
      grade: 4, unit, unit_code: code,
      text: `${a}/${d} + ${b}/${d}을 계산하면?`,
      answer: `${a + b}/${d}`,
      wrong: [`${a + b}/${d * 2}`, `${a + b + 1}/${d}`, `${a * b}/${d}`, `${a + b - 1}/${d}`],
      why: `분모가 같으면 분자끼리 더합니다. ${a}+${b}=${a + b} → ${a + b}/${d}`,
      difficulty: 1,
    });
    add({
      grade: 4, unit, unit_code: code,
      text: `${a + b}/${d} - ${b}/${d}을 계산하면?`,
      answer: `${a}/${d}`,
      wrong: [`${a}/${d * 2}`, `${a + 1}/${d}`, `${b}/${d}`, `${a - 1 > 0 ? a - 1 : a + 2}/${d}`],
      why: `분모가 같으면 분자끼리 뺍니다. ${a + b}-${b}=${a} → ${a}/${d}`,
      difficulty: 1,
    });
  }
  for (const [w1, n1, w2, n2, d] of [[1, 2, 2, 3, 7], [3, 1, 1, 4, 9], [2, 3, 1, 2, 8], [4, 2, 2, 5, 11]] as Array<[number, number, number, number, number]>) {
    const num = n1 + n2;
    const carry = Math.floor(num / d);
    add({
      grade: 4, unit, unit_code: code,
      text: `${w1}과 ${n1}/${d} + ${w2}과 ${n2}/${d}을 계산하면?`,
      answer: carry > 0 ? `${w1 + w2 + carry}과 ${num % d}/${d}` : `${w1 + w2}과 ${num}/${d}`,
      wrong: [
        `${w1 + w2}과 ${num}/${d}${carry > 0 ? '' : ' (가분수)'}`,
        `${w1 + w2 + 1}과 ${num % d}/${d}`,
        `${w1 * w2}과 ${num}/${d}`,
        `${w1 + w2}과 ${num}/${d * 2}`,
      ],
      why: `자연수끼리, 분수끼리 더합니다. ${n1}+${n2}=${num}/${d}${carry > 0 ? `이고 ${d}/${d}=1이므로 자연수로 올립니다.` : '입니다.'}`,
      difficulty: 3,
    });
  }
}

// 9. 사각형
{
  const unit = '9. 사각형';
  const code = '[4수02-05]';
  const facts: Array<[string, string, string[], string]> = [
    ['두 직선이 만나서 이루는 각이 직각일 때 두 직선의 관계는?', '수직', ['평행', '대칭', '합동'], '직각으로 만나면 두 직선은 서로 수직입니다.'],
    ['한 직선에 수직인 두 직선은 서로 어떤 관계인가요?', '평행하다', ['수직이다', '만난다', '합동이다'], '같은 직선에 수직인 두 직선은 서로 평행합니다.'],
    ['평행한 두 직선 사이의 거리는 어떠한가요?', '어디에서 재어도 같다', ['가운데가 가장 짧다', '끝이 가장 짧다', /* */ '잴 수 없다'], '평행선 사이의 거리는 항상 일정합니다.'],
    ['평행한 변이 한 쌍이라도 있는 사각형을 무엇이라고 하나요?', '사다리꼴', ['마름모', '직사각형', '정사각형'], '평행한 변이 한 쌍만 있어도 사다리꼴입니다.'],
    ['마주 보는 두 쌍의 변이 서로 평행한 사각형은?', '평행사변형', ['사다리꼴', '마름모', '삼각형'], '두 쌍의 변이 평행하면 평행사변형입니다.'],
    ['네 변의 길이가 모두 같은 사각형은?', '마름모', ['직사각형', '사다리꼴', '평행사변형'], '네 변이 모두 같은 사각형이 마름모입니다.'],
    ['평행사변형에서 마주 보는 두 각의 크기는?', '서로 같다', ['서로 다르다', '합이 90°이다', '항상 직각이다'], '평행사변형은 마주 보는 각의 크기가 같습니다.'],
    ['평행사변형에서 이웃한 두 각의 합은?', '180°', ['90°', '360°', '270°'], '평행선의 성질로 이웃한 두 각의 합은 180°입니다.'],
    ['정사각형은 마름모라고 할 수 있나요?', '있다 — 네 변의 길이가 모두 같기 때문', ['없다 — 각이 직각이라서', '없다 — 마름모는 기울어져야 해서', '경우에 따라 다르다'], '정사각형도 네 변이 모두 같으므로 마름모에 포함됩니다.'],
    ['평행사변형은 사다리꼴이라고 할 수 있나요?', '있다 — 평행한 변이 있기 때문', ['없다 — 평행한 변이 두 쌍이라서', '없다 — 각이 달라서', '경우에 따라 다르다'], '평행한 변이 한 쌍이라도 있으면 사다리꼴이므로 포함됩니다.'],
  ];
  for (const [text, answer, wrong, why] of facts) add({ grade: 4, unit, unit_code: code, text, answer, wrong, why });
  for (const [a, b] of [[7, 5], [9, 6], [12, 8], [15, 4], [11, 9]] as Array<[number, number]>) {
    add({
      grade: 4, unit, unit_code: code,
      text: `이웃한 두 변이 ${a}cm, ${b}cm인 평행사변형의 네 변의 길이의 합은?`,
      answer: `${(a + b) * 2}cm`,
      wrong: [`${a + b}cm`, `${a * b}cm`, `${a * 4}cm`, `${(a + b) * 2 + 2}cm`],
      why: `평행사변형은 마주 보는 변이 같으므로 (${a}+${b})×2=${(a + b) * 2}(cm)입니다.`,
      difficulty: 2,
    });
  }
  for (const s of [6, 8, 11, 14]) {
    add({
      grade: 4, unit, unit_code: code,
      text: `한 변이 ${s}cm인 마름모의 네 변의 길이의 합은?`,
      answer: `${s * 4}cm`,
      wrong: [`${s * 2}cm`, `${s * 3}cm`, `${s * s}cm`, `${s * 4 + s}cm`],
      why: `마름모는 네 변이 모두 같으므로 ${s}×4=${s * 4}(cm)입니다.`,
      difficulty: 1,
    });
  }
}

// 10. 다각형
{
  const unit = '10. 다각형';
  const code = '[4수02-06]';
  const names: Array<[number, string]> = [[5, '오각형'], [6, '육각형'], [7, '칠각형'], [8, '팔각형'], [9, '구각형'], [10, '십각형']];
  for (const [n, name] of names) {
    const others = names.filter(([m]) => m !== n).map(([, x]) => x);
    add({
      grade: 4, unit, unit_code: code,
      text: `변이 ${n}개인 다각형의 이름은?`,
      answer: name,
      wrong: others,
      why: `변의 수가 ${n}개이면 ${name}입니다.`,
      difficulty: 1,
    });
    const diag = (n * (n - 3)) / 2;
    add({
      grade: 4, unit, unit_code: code,
      text: `${name}에 그을 수 있는 대각선은 모두 몇 개인가요?`,
      answer: `${diag}개`,
      wrong: [`${n}개`, `${diag + n}개`, `${diag - 1}개`, `${diag + 1}개`],
      why: `한 꼭짓점에서 ${n - 3}개씩 그을 수 있고 두 번 세지 않도록 나눕니다. ${n}×${n - 3}÷2=${diag}(개)`,
      difficulty: 3,
    });
  }
  add({
    grade: 4, unit, unit_code: code,
    text: '변의 길이가 모두 같고 각의 크기도 모두 같은 다각형을 무엇이라고 하나요?',
    answer: '정다각형',
    wrong: ['다각형', '사다리꼴', '대각선'],
    why: '변과 각이 모두 같은 다각형이 정다각형입니다.',
    difficulty: 1,
  });
  add({
    grade: 4, unit, unit_code: code,
    text: '다각형에서 이웃하지 않는 두 꼭짓점을 이은 선분을 무엇이라고 하나요?',
    answer: '대각선',
    wrong: ['변', '높이', '반지름'],
    why: '이웃하지 않는 두 꼭짓점을 이은 선분이 대각선입니다.',
    difficulty: 1,
  });
  for (const [n, name] of names) {
    add({
      grade: 4, unit, unit_code: code,
      text: `한 변이 5cm인 정${name.replace('각형', '')}각형의 모든 변의 길이의 합은?`,
      answer: `${5 * n}cm`,
      wrong: [`${5 * (n - 1)}cm`, `${5 * (n + 1)}cm`, `${5 + n}cm`, `${5 * n + 5}cm`],
      why: `정다각형은 변이 모두 같으므로 5×${n}=${5 * n}(cm)입니다.`,
      difficulty: 2,
    });
  }
}

// ════════════════════════════════════════════════════════════
// 6학년
// ════════════════════════════════════════════════════════════

const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));
function reduce(n: number, d: number): string {
  const g = gcd(n, d);
  const rn = n / g;
  const rd = d / g;
  if (rd === 1) return String(rn);
  if (rn > rd) return `${Math.floor(rn / rd)}과 ${rn % rd}/${rd}`;
  return `${rn}/${rd}`;
}

// 1. 분수의 나눗셈
{
  const unit = '1. 분수의 나눗셈';
  const code = '[6수01-02]';
  for (const [n, d, k] of [[4, 5, 2], [6, 7, 3], [9, 10, 3], [8, 9, 4], [6, 11, 2], [10, 13, 5], [9, 14, 3], [8, 15, 4]] as Array<[number, number, number]>) {
    add({
      grade: 6, unit, unit_code: code,
      text: `${n}/${d} ÷ ${k}을 계산하면?`,
      answer: reduce(n, d * k),
      wrong: [reduce(n * k, d), `${n}/${d + k}`, reduce(n + k, d), `${n * k}/${d * k}`],
      why: `자연수로 나누는 것은 분모에 곱하는 것과 같습니다. ${n}/(${d}×${k}) = ${reduce(n, d * k)}`,
      difficulty: 2,
    });
  }
  for (const [a, b, c, e] of [[3, 4, 1, 2], [2, 3, 4, 5], [5, 6, 2, 3], [3, 8, 1, 4], [7, 9, 2, 3], [4, 5, 3, 10]] as Array<[number, number, number, number]>) {
    add({
      grade: 6, unit, unit_code: code,
      text: `${a}/${b} ÷ ${c}/${e}을 계산하면?`,
      answer: reduce(a * e, b * c),
      wrong: [reduce(a * c, b * e), reduce(a + c, b + e), `${a * e}/${b * c + 1}`, reduce(b * c, a * e)],
      why: `나누는 분수를 뒤집어 곱합니다. ${a}/${b} × ${e}/${c} = ${reduce(a * e, b * c)}`,
      difficulty: 3,
    });
  }
  add({
    grade: 6, unit, unit_code: code,
    text: '분수의 나눗셈을 곱셈으로 바꿀 때 어떻게 하나요?',
    answer: '나누는 분수의 분자와 분모를 바꿔 곱한다',
    wrong: ['나누어지는 분수를 뒤집어 곱한다', '두 분수를 모두 뒤집어 곱한다', '분모끼리, 분자끼리 나눈다'],
    why: '÷(c/d) = ×(d/c) 입니다.',
    difficulty: 2,
  });
}

// 2. 각기둥과 각뿔
{
  const unit = '2. 각기둥과 각뿔';
  const code = '[6수02-03]';
  const prisms: Array<[number, string]> = [[3, '삼각기둥'], [4, '사각기둥'], [5, '오각기둥'], [6, '육각기둥'], [8, '팔각기둥']];
  for (const [n, name] of prisms) {
    add({
      grade: 6, unit, unit_code: code,
      text: `${name}의 면은 모두 몇 개인가요?`,
      answer: `${n + 2}개`,
      wrong: [`${n}개`, `${n + 1}개`, `${n * 2}개`, `${n + 3}개`],
      why: `옆면 ${n}개와 두 밑면을 더해 ${n + 2}개입니다.`,
      difficulty: 2,
    });
    add({
      grade: 6, unit, unit_code: code,
      text: `${name}의 모서리는 모두 몇 개인가요?`,
      answer: `${n * 3}개`,
      wrong: [`${n * 2}개`, `${n + 2}개`, `${n * 3 + 1}개`, `${n * 4}개`],
      why: `두 밑면의 변 ${n * 2}개와 옆모서리 ${n}개를 더해 ${n * 3}개입니다.`,
      difficulty: 3,
    });
    add({
      grade: 6, unit, unit_code: code,
      text: `${name}의 꼭짓점은 모두 몇 개인가요?`,
      answer: `${n * 2}개`,
      wrong: [`${n}개`, `${n + 2}개`, `${n * 2 + 1}개`, `${n * 3}개`],
      why: `밑면 두 개의 꼭짓점을 합해 ${n}×2=${n * 2}개입니다.`,
      difficulty: 2,
    });
  }
  const pyramids: Array<[number, string]> = [[3, '삼각뿔'], [4, '사각뿔'], [5, '오각뿔'], [6, '육각뿔']];
  for (const [n, name] of pyramids) {
    add({
      grade: 6, unit, unit_code: code,
      text: `${name}의 면은 모두 몇 개인가요?`,
      answer: `${n + 1}개`,
      wrong: [`${n}개`, `${n + 2}개`, `${n * 2}개`, `${n + 3}개`],
      why: `옆면 ${n}개와 밑면 1개를 더해 ${n + 1}개입니다.`,
      difficulty: 2,
    });
    add({
      grade: 6, unit, unit_code: code,
      text: `${name}의 꼭짓점은 모두 몇 개인가요?`,
      answer: `${n + 1}개`,
      wrong: [`${n}개`, `${n * 2}개`, `${n + 2}개`, `${n * 2 + 1}개`],
      why: `밑면 꼭짓점 ${n}개와 위 꼭짓점 1개를 더해 ${n + 1}개입니다.`,
      difficulty: 2,
    });
  }
  add({ grade: 6, unit, unit_code: code, text: '각기둥에서 두 밑면은 서로 어떤 관계인가요?', answer: '평행하고 합동이다', wrong: ['수직이고 합동이다', '평행하지만 크기가 다르다', '만나고 합동이다'], why: '각기둥의 두 밑면은 서로 평행하며 모양과 크기가 같습니다.', difficulty: 2 });
  add({ grade: 6, unit, unit_code: code, text: '각기둥의 옆면은 어떤 모양인가요?', answer: '직사각형', wrong: ['삼각형', '사다리꼴', '원'], why: '각기둥의 옆면은 모두 직사각형입니다.', difficulty: 1 });
  add({ grade: 6, unit, unit_code: code, text: '각뿔의 옆면은 어떤 모양인가요?', answer: '삼각형', wrong: ['직사각형', '사다리꼴', '오각형'], why: '각뿔의 옆면은 모두 삼각형입니다.', difficulty: 1 });
}

// 3. 소수의 나눗셈
{
  const unit = '3. 소수의 나눗셈';
  const code = '[6수01-05]';
  for (const [a, b] of [[4.8, 4], [7.2, 6], [9.6, 8], [5.5, 5], [8.4, 7], [12.6, 3], [15.5, 5], [6.3, 9]] as Array<[number, number]>) {
    const ans = Number((a / b).toFixed(4));
    add({
      grade: 6, unit, unit_code: code,
      text: `${a} ÷ ${b}를 계산하면?`,
      answer: String(ans),
      wrong: [String(Number((ans * 10).toFixed(4))), String(Number((ans / 10).toFixed(4))), String(Number((ans + 0.1).toFixed(4))), String(Number((a * b).toFixed(4)))],
      why: `${a}÷${b}=${ans}. 소수점 위치를 몫에 그대로 내려 찍습니다.`,
      difficulty: 2,
    });
  }
  for (const [a, b] of [[3.6, 0.4], [4.8, 0.6], [7.5, 0.5], [2.4, 0.8], [9.9, 1.1], [6.4, 0.2]] as Array<[number, number]>) {
    const ans = Number((a / b).toFixed(4));
    add({
      grade: 6, unit, unit_code: code,
      text: `${a} ÷ ${b}를 계산하면?`,
      answer: String(ans),
      wrong: [String(Number((ans / 10).toFixed(4))), String(Number((ans * 10).toFixed(4))), String(Number((ans + 1).toFixed(4))), String(Number((a * b).toFixed(4)))],
      why: `두 수에 같은 수를 곱해 나누는 수를 자연수로 만듭니다. ${a * 10}÷${Math.round(b * 10)}=${ans}`,
      difficulty: 3,
    });
  }
}

// 4. 비와 비율
{
  const unit = '4. 비와 비율';
  const code = '[6수04-01]';
  for (const [a, b] of [[3, 4], [2, 5], [7, 10], [9, 20], [12, 25], [6, 15], [8, 40], [14, 35]] as Array<[number, number]>) {
    const pct = (a / b) * 100;
    add({
      grade: 6, unit, unit_code: code,
      text: `비 ${a}:${b}에서 비율을 백분율로 나타내면?`,
      answer: `${Number(pct.toFixed(2))}%`,
      wrong: [`${Number((pct / 10).toFixed(2))}%`, `${Number((pct * 10).toFixed(2))}%`, `${Number((pct + 10).toFixed(2))}%`, `${a + b}%`],
      why: `${a}÷${b}=${Number((a / b).toFixed(4))}, ×100 하면 ${Number(pct.toFixed(2))}%입니다.`,
      difficulty: 2,
    });
    add({
      grade: 6, unit, unit_code: code,
      text: `${a}:${b}에서 기준량은 무엇인가요?`,
      answer: N(b),
      wrong: [N(a), N(a + b), N(b - a)],
      why: `비 ${a}:${b}에서 뒤에 오는 ${b}가 기준량, 앞의 ${a}가 비교하는 양입니다.`,
      difficulty: 2,
    });
  }
  add({ grade: 6, unit, unit_code: code, text: '비율을 구하는 식으로 옳은 것은?', answer: '비교하는 양 ÷ 기준량', wrong: ['기준량 ÷ 비교하는 양', '비교하는 양 × 기준량', '기준량 - 비교하는 양'], why: '비율 = (비교하는 양)÷(기준량)입니다.', difficulty: 1 });
  for (const [total, part] of [[200, 50], [300, 90], [500, 125], [400, 160], [250, 75]] as Array<[number, number]>) {
    add({
      grade: 6, unit, unit_code: code,
      text: `전체 ${total}명 중 ${part}명이 안경을 썼다면 안경 쓴 학생의 비율은 몇 %인가요?`,
      answer: `${(part / total) * 100}%`,
      wrong: [`${((part / total) * 100) / 10}%`, `${(part / total) * 100 + 10}%`, `${part}%`, `${total - part}%`],
      why: `${part}÷${total}=${part / total}, ×100=${(part / total) * 100}%`,
      difficulty: 2,
    });
  }
}

// 5. 원의 넓이
{
  const unit = '5. 원의 넓이';
  const code = '[6수02-08]';
  for (const r of [2, 3, 4, 5, 6, 7, 8, 10, 12, 15]) {
    add({
      grade: 6, unit, unit_code: code,
      text: `반지름이 ${r}cm인 원의 넓이는? (원주율 3.14)`,
      answer: `${Number((r * r * 3.14).toFixed(2))}cm²`,
      wrong: [
        `${Number((2 * r * 3.14).toFixed(2))}cm²`,
        `${Number((r * r * 3.14 * 2).toFixed(2))}cm²`,
        `${Number((r * 3.14).toFixed(2))}cm²`,
        `${r * r}cm²`,
      ],
      why: `원의 넓이=반지름×반지름×원주율=${r}×${r}×3.14=${Number((r * r * 3.14).toFixed(2))}(cm²)`,
      difficulty: 2,
    });
    add({
      grade: 6, unit, unit_code: code,
      text: `반지름이 ${r}cm인 원의 원주는? (원주율 3.14)`,
      answer: `${Number((2 * r * 3.14).toFixed(2))}cm`,
      wrong: [
        `${Number((r * 3.14).toFixed(2))}cm`,
        `${Number((r * r * 3.14).toFixed(2))}cm`,
        `${Number((2 * r * 3.14 + 3.14).toFixed(2))}cm`,
        `${r * 2}cm`,
      ],
      why: `원주=지름×원주율=${r * 2}×3.14=${Number((2 * r * 3.14).toFixed(2))}(cm)`,
      difficulty: 2,
    });
  }
  add({ grade: 6, unit, unit_code: code, text: '원주율은 무엇을 나타내나요?', answer: '원주를 지름으로 나눈 값', wrong: ['원주를 반지름으로 나눈 값', '넓이를 지름으로 나눈 값', '지름을 원주로 나눈 값'], why: '(원주)÷(지름)이 항상 일정하며 이 값이 원주율입니다.', difficulty: 2 });
}

// 7. 여러 가지 그래프
{
  const unit = '7. 여러 가지 그래프';
  const code = '[6수04-02]';
  const facts: Array<[string, string, string[], string]> = [
    ['전체에 대한 각 부분의 비율을 띠 모양으로 나타낸 그래프는?', '띠그래프', ['원그래프', '막대그래프', '꺾은선그래프'], '전체를 하나의 띠로 보고 비율만큼 나눈 것이 띠그래프입니다.'],
    ['전체를 원으로 보고 비율만큼 나눈 그래프는?', '원그래프', ['띠그래프', '막대그래프', '그림그래프'], '원 전체를 100%로 보고 나눈 그래프가 원그래프입니다.'],
    ['시간에 따라 변하는 모습을 나타내기에 가장 알맞은 그래프는?', '꺾은선그래프', ['원그래프', '띠그래프', '그림그래프'], '변화의 흐름을 보여 주는 데는 꺾은선그래프가 알맞습니다.'],
    ['항목별 많고 적음을 비교하기에 알맞은 그래프는?', '막대그래프', ['꺾은선그래프', '원그래프', '띠그래프'], '막대의 길이로 크기를 비교합니다.'],
    ['띠그래프와 원그래프의 공통점은?', '전체에 대한 비율을 나타낸다', ['시간의 변화를 나타낸다', '실제 수를 그대로 나타낸다', '항목의 개수를 나타낸다'], '둘 다 전체를 100%로 보고 부분의 비율을 보여 줍니다.'],
    ['원그래프에서 모든 항목의 백분율을 더하면?', '100%', ['90%', '180%', '360%'], '전체를 100%로 나누었으므로 합은 100%입니다.'],
  ];
  for (const [text, answer, wrong, why] of facts) add({ grade: 6, unit, unit_code: code, text, answer, wrong, why });
  for (const [pct, total] of [[25, 200], [40, 350], [15, 400], [60, 250], [35, 500], [20, 180], [45, 300], [12, 600]] as Array<[number, number]>) {
    add({
      grade: 6, unit, unit_code: code,
      text: `전체 ${total}명 중 ${pct}%는 몇 명인가요?`,
      answer: `${(total * pct) / 100}명`,
      wrong: [`${(total * pct) / 1000}명`, `${((total * pct) / 100) * 2}명`, `${pct}명`, `${total - pct}명`],
      why: `${total}×${pct}÷100=${(total * pct) / 100}(명)`,
      difficulty: 2,
    });
  }
  for (const [a, b, c] of [[30, 25, 20], [45, 20, 15], [50, 30, 10], [35, 35, 15]] as Array<[number, number, number]>) {
    add({
      grade: 6, unit, unit_code: code,
      text: `원그래프에서 세 항목이 ${a}%, ${b}%, ${c}%일 때 나머지 항목은 몇 %인가요?`,
      answer: `${100 - a - b - c}%`,
      wrong: [`${100 - a - b - c + 5}%`, `${a + b + c}%`, `${100 - a - b - c - 5}%`, `${360 - a - b - c}%`],
      why: `전체는 100%이므로 100-${a}-${b}-${c}=${100 - a - b - c}(%)`,
      difficulty: 2,
    });
  }
}

// 8. 비례식과 비례배분
{
  const unit = '8. 비례식과 비례배분';
  const code = '[6수04-03]';
  for (const [a, b, c] of [[2, 3, 8], [4, 5, 12], [3, 7, 9], [5, 6, 20], [7, 4, 21], [6, 11, 18]] as Array<[number, number, number]>) {
    const d = (b * c) / a;
    if (!Number.isInteger(d)) continue;
    add({
      grade: 6, unit, unit_code: code,
      text: `${a} : ${b} = ${c} : □ 일 때 □에 알맞은 수는?`,
      answer: N(d),
      wrong: [N(d + b), N(d - b), N((a * c) / b), N(c + b)],
      why: `외항의 곱과 내항의 곱은 같습니다. ${a}×□=${b}×${c} → □=${d}`,
      difficulty: 3,
    });
  }
  for (const [total, r1, r2] of [[100, 2, 3], [120, 1, 5], [90, 4, 5], [140, 3, 4], [80, 3, 5], [150, 2, 3]] as Array<[number, number, number]>) {
    const first = (total * r1) / (r1 + r2);
    if (!Number.isInteger(first)) continue;
    add({
      grade: 6, unit, unit_code: code,
      text: `사탕 ${total}개를 ${r1}:${r2}로 나누면 앞사람은 몇 개를 받나요?`,
      answer: `${first}개`,
      wrong: [`${total - first}개`, `${first + 10}개`, `${total / 2}개`, `${first - 10}개`],
      why: `전체를 ${r1 + r2}묶음으로 보면 한 묶음은 ${total / (r1 + r2)}개, ${r1}묶음은 ${first}개입니다.`,
      difficulty: 3,
    });
  }
  add({ grade: 6, unit, unit_code: code, text: '비례식에서 외항의 곱과 내항의 곱은 어떤 관계인가요?', answer: '서로 같다', wrong: ['외항의 곱이 더 크다', '내항의 곱이 더 크다', '관계가 없다'], why: 'a:b=c:d이면 a×d=b×c입니다.', difficulty: 2 });
  for (const [a, b] of [[6, 9], [8, 12], [10, 15], [14, 21], [12, 18]] as Array<[number, number]>) {
    const g = gcd(a, b);
    add({
      grade: 6, unit, unit_code: code,
      text: `${a} : ${b}을 가장 간단한 자연수의 비로 나타내면?`,
      answer: `${a / g} : ${b / g}`,
      wrong: [`${a} : ${b}`, `${a / g + 1} : ${b / g}`, `${b / g} : ${a / g}`, `${a / g} : ${b / g + 1}`],
      why: `두 수를 최대공약수 ${g}로 나눕니다. → ${a / g}:${b / g}`,
      difficulty: 2,
    });
  }
}

// 9. 원기둥, 원뿔, 구
{
  const unit = '9. 원기둥, 원뿔, 구';
  const code = '[6수02-09]';
  const facts: Array<[string, string, string[], string]> = [
    ['직사각형 종이를 한 변을 축으로 한 바퀴 돌리면 어떤 입체도형이 되나요?', '원기둥', ['원뿔', '구', '각기둥'], '직사각형을 한 변 기준으로 돌리면 원기둥이 만들어집니다.'],
    ['직각삼각형을 한 변을 축으로 돌리면 어떤 입체도형이 되나요?', '원뿔', ['원기둥', '구', '각뿔'], '직각삼각형을 돌리면 원뿔이 만들어집니다.'],
    ['반원을 지름을 축으로 돌리면 어떤 입체도형이 되나요?', '구', ['원기둥', '원뿔', '원'], '반원을 지름 기준으로 돌리면 구가 만들어집니다.'],
    ['원기둥의 두 밑면은 어떤 모양인가요?', '원', ['직사각형', '삼각형', '타원'], '원기둥의 밑면은 서로 합동인 두 원입니다.'],
    ['원기둥의 전개도에서 옆면은 어떤 모양인가요?', '직사각형', ['원', '삼각형', '사다리꼴'], '원기둥의 옆면을 펼치면 직사각형이 됩니다.'],
    ['원뿔에서 꼭짓점과 밑면인 원 위의 한 점을 이은 선분을 무엇이라고 하나요?', '모선', ['높이', '반지름', '지름'], '꼭짓점과 밑면 둘레의 점을 이은 선분이 모선입니다.'],
    ['구의 중심에서 구의 겉면의 한 점까지 이은 선분은?', '구의 반지름', ['모선', '지름', '높이'], '구의 중심에서 겉면까지의 거리가 구의 반지름입니다.'],
    ['구를 어느 방향에서 보아도 보이는 모양은?', '원', ['타원', '삼각형', '방향마다 다르다'], '구는 어느 방향에서 보아도 원으로 보입니다.'],
    ['원기둥에 꼭짓점은 몇 개 있나요?', '0개', ['1개', '2개', '4개'], '원기둥에는 뾰족한 꼭짓점이 없습니다.'],
    ['원뿔의 꼭짓점은 몇 개인가요?', '1개', ['0개', '2개', '3개'], '원뿔에는 꼭짓점이 하나 있습니다.'],
  ];
  for (const [text, answer, wrong, why] of facts) add({ grade: 6, unit, unit_code: code, text, answer, wrong, why });
  for (const r of [3, 5, 7, 9, 12]) {
    add({
      grade: 6, unit, unit_code: code,
      text: `밑면의 반지름이 ${r}cm인 원기둥의 전개도에서 옆면 직사각형의 가로 길이는? (원주율 3.14)`,
      answer: `${Number((2 * r * 3.14).toFixed(2))}cm`,
      wrong: [`${Number((r * 3.14).toFixed(2))}cm`, `${r * 2}cm`, `${Number((r * r * 3.14).toFixed(2))}cm`, `${r}cm`],
      why: `옆면의 가로는 밑면의 원주와 같습니다. ${r * 2}×3.14=${Number((2 * r * 3.14).toFixed(2))}(cm)`,
      difficulty: 3,
    });
  }
}

// 10. 경우의 수
{
  const unit = '10. 경우의 수';
  const code = '[6수04-04]';
  for (const [a, b] of [[3, 4], [2, 5], [4, 6], [5, 3], [6, 2], [7, 3], [4, 4], [5, 5]] as Array<[number, number]>) {
    add({
      grade: 6, unit, unit_code: code,
      text: `윗옷 ${a}벌과 바지 ${b}벌로 만들 수 있는 옷차림은 모두 몇 가지인가요?`,
      answer: `${a * b}가지`,
      wrong: [`${a + b}가지`, `${a * b - a}가지`, `${a * b + 1}가지`, `${Math.max(a, b)}가지`],
      why: `윗옷 하나마다 바지 ${b}가지가 가능하므로 ${a}×${b}=${a * b}(가지)입니다.`,
      difficulty: 2,
    });
  }
  const dice: Array<[string, number]> = [
    ['주사위 한 개를 던질 때 나올 수 있는 경우의 수는?', 6],
    ['동전 한 개를 던질 때 나올 수 있는 경우의 수는?', 2],
    ['주사위 한 개를 던져 짝수가 나오는 경우의 수는?', 3],
    ['주사위 한 개를 던져 3보다 큰 수가 나오는 경우의 수는?', 3],
    ['동전 두 개를 동시에 던질 때 나올 수 있는 경우의 수는?', 4],
    ['주사위 두 개를 던질 때 나올 수 있는 모든 경우의 수는?', 36],
  ];
  for (const [text, n] of dice) {
    add({
      grade: 6, unit, unit_code: code,
      text,
      answer: `${n}가지`,
      wrong: [`${n + 1}가지`, `${n - 1}가지`, `${n * 2}가지`, `${Math.max(1, Math.floor(n / 2))}가지`],
      why: `가능한 경우를 빠짐없이 세면 ${n}가지입니다.`,
      difficulty: 2,
    });
  }
  for (const n of [3, 4, 5]) {
    const fact = [1, 1, 2, 6, 24, 120][n]!;
    add({
      grade: 6, unit, unit_code: code,
      text: `서로 다른 ${n}명을 한 줄로 세우는 방법은 모두 몇 가지인가요?`,
      answer: `${fact}가지`,
      wrong: [`${n}가지`, `${n * n}가지`, `${fact + n}가지`, `${fact / n}가지`],
      why: `${Array.from({ length: n }, (_, i) => n - i).join('×')}=${fact}(가지)`,
      difficulty: 3,
    });
  }
}

// ── 60문항 미만으로 남은 단원 보충 (감사 스크립트가 지목한 단원만) ──
{
  // 3학년 4. 곱셈 / 7. 곱셈(2학기)
  for (const [a, b] of [[34, 6], [45, 7], [62, 8], [78, 9], [26, 5], [93, 4], [57, 3], [41, 9], [69, 6], [84, 7], [37, 5], [52, 8]] as Array<[number, number]>) {
    add({
      grade: 3, unit: '4. 곱셈', unit_code: '[4수01-05]',
      text: `한 상자에 ${a}개씩 들어 있는 구슬 ${b}상자에는 모두 몇 개가 들어 있나요?`,
      answer: `${a * b}개`,
      wrong: [`${a + b}개`, `${a * b - 10}개`, `${a * b + 10}개`, `${Math.floor(a / 10) * 10 * b + (a % 10)}개`],
      why: `${a}×${b}=${a * b}(개)`,
      difficulty: 2,
    });
  }
  for (const [a, b] of [[142, 6], [253, 7], [364, 8], [475, 9], [186, 5], [297, 4], [318, 3], [429, 6], [531, 7], [648, 2], [759, 3], [864, 5]] as Array<[number, number]>) {
    add({
      grade: 3, unit: '7. 곱셈(2학기)', unit_code: '[4수01-05]',
      text: `${a} × ${b}의 값은 얼마인가요?`,
      answer: N(a * b),
      wrong: [N(a * b - 100), N(a * b + 100), N(a * b - 10), N(a * b + 10)],
      why: `${a}×${b}=${a * b}`,
      difficulty: 3,
    });
  }
  // 3학년 8. 나눗셈(2학기)
  for (const [a, b] of [[68, 5], [91, 7], [54, 4], [83, 6], [76, 9], [95, 8]] as Array<[number, number]>) {
    const q = Math.floor(a / b), r = a % b;
    add({
      grade: 3, unit: '8. 나눗셈(2학기)', unit_code: '[4수01-07]',
      text: `${a}개를 한 봉지에 ${b}개씩 담으면 몇 봉지가 되고 몇 개가 남나요?`,
      answer: `${q}봉지, ${r}개 남음`,
      wrong: [`${q + 1}봉지, ${r}개 남음`, `${q}봉지, ${r + 1}개 남음`, `${r}봉지, ${q}개 남음`, `${q - 1}봉지, ${r}개 남음`],
      why: `${a}÷${b}는 몫 ${q}, 나머지 ${r}입니다.`,
      difficulty: 2,
    });
  }
  // 3학년 9. 원
  for (const [r1, r2] of [[3, 5], [4, 7], [6, 9], [8, 12], [10, 15], [5, 11]] as Array<[number, number]>) {
    add({
      grade: 3, unit: '9. 원', unit_code: '[4수02-02]',
      text: `반지름이 ${r1}cm인 원과 ${r2}cm인 원 중 더 큰 원의 지름은 몇 cm인가요?`,
      answer: `${Math.max(r1, r2) * 2}cm`,
      wrong: [`${Math.min(r1, r2) * 2}cm`, `${Math.max(r1, r2)}cm`, `${(r1 + r2) * 2}cm`, `${Math.max(r1, r2) * 2 + 2}cm`],
      why: `반지름이 클수록 원이 큽니다. ${Math.max(r1, r2)}×2=${Math.max(r1, r2) * 2}(cm)`,
      difficulty: 2,
    });
  }
  // 3학년 11. 들이와 무게
  for (const [a, b] of [[1200, 1], [2500, 2], [3400, 3], [4750, 4], [5080, 5], [6900, 6]] as Array<[number, number]>) {
    add({
      grade: 3, unit: '11. 들이와 무게', unit_code: '[4수03-05]',
      text: `${a}mL는 몇 L 몇 mL인가요?`,
      answer: `${b}L ${a - b * 1000}mL`,
      wrong: [`${b + 1}L ${a - b * 1000}mL`, `${b}L ${a - b * 1000 + 100}mL`, `${a}L`, `${b}L`],
      why: `1000mL가 1L이므로 ${a}mL=${b}L ${a - b * 1000}mL입니다.`,
      difficulty: 2,
    });
    add({
      grade: 3, unit: '11. 들이와 무게', unit_code: '[4수03-05]',
      text: `${a}g은 몇 kg 몇 g인가요?`,
      answer: `${b}kg ${a - b * 1000}g`,
      wrong: [`${b + 1}kg ${a - b * 1000}g`, `${b}kg ${a - b * 1000 + 100}g`, `${a}kg`, `${b}kg`],
      why: `1000g이 1kg이므로 ${a}g=${b}kg ${a - b * 1000}g입니다.`,
      difficulty: 2,
    });
  }
  // 3학년 12. 자료의 정리
  for (const [big, small, count] of [[10, 1, 34], [10, 1, 52], [100, 10, 260], [10, 1, 47], [100, 10, 430], [10, 1, 68]] as Array<[number, number, number]>) {
    add({
      grade: 3, unit: '12. 자료의 정리', unit_code: '[4수04-01]',
      text: `그림그래프에서 큰 그림이 ${big}개, 작은 그림이 ${small}개를 나타냅니다. ${count}을(를) 나타내려면 큰 그림과 작은 그림이 각각 몇 개 필요한가요?`,
      answer: `큰 그림 ${Math.floor(count / big)}개, 작은 그림 ${(count % big) / small}개`,
      wrong: [
        `큰 그림 ${Math.floor(count / big) + 1}개, 작은 그림 ${(count % big) / small}개`,
        `큰 그림 ${(count % big) / small}개, 작은 그림 ${Math.floor(count / big)}개`,
        `큰 그림 ${Math.floor(count / big)}개, 작은 그림 ${(count % big) / small + 1}개`,
        `큰 그림 ${count}개, 작은 그림 0개`,
      ],
      why: `${count} = ${big}×${Math.floor(count / big)} + ${small}×${(count % big) / small}`,
      difficulty: 3,
    });
  }
  // 3학년 2. 평면도형
  for (const [w, h] of [[7, 4], [11, 6], [13, 9], [6, 6]] as Array<[number, number]>) {
    add({
      grade: 3, unit: '2. 평면도형', unit_code: '[4수02-01]',
      text: `네 변의 길이의 합이 ${(w + h) * 2}cm이고 가로가 ${w}cm인 직사각형의 세로는 몇 cm인가요?`,
      answer: `${h}cm`,
      wrong: [`${w}cm`, `${h + 2}cm`, `${h - 1}cm`, `${(w + h) * 2 - w}cm`],
      why: `(가로+세로)=${(w + h) * 2}÷2=${w + h}(cm)이므로 세로는 ${w + h}-${w}=${h}(cm)입니다.`,
      difficulty: 3,
    });
  }
  // 3학년 6. 분수와 소수
  for (const [n, d] of [[3, 7], [5, 9], [2, 11], [4, 13]] as Array<[number, number]>) {
    add({
      grade: 3, unit: '6. 분수와 소수', unit_code: '[4수01-10]',
      text: `${n}/${d}과 ${n + 1}/${d} 중 더 큰 분수는?`,
      answer: `${n + 1}/${d}`,
      wrong: [`${n}/${d}`, '두 분수는 같다', '비교할 수 없다'],
      why: `분모가 같으면 분자가 큰 쪽이 큽니다.`,
      difficulty: 2,
    });
  }
  // 3학년 5. 길이와 시간
  for (const [km, m] of [[3, 400], [5, 250], [7, 80], [12, 600]] as Array<[number, number]>) {
    add({
      grade: 3, unit: '5. 길이와 시간', unit_code: '[4수03-01]',
      text: `${km}km ${m}m는 모두 몇 m인가요?`,
      answer: `${km * 1000 + m}m`,
      wrong: [`${km * 100 + m}m`, `${km + m}m`, `${km * 1000}m`, `${km * 1000 + m + 100}m`],
      why: `${km}km=${km * 1000}m이므로 모두 ${km * 1000 + m}m입니다.`,
      difficulty: 2,
    });
  }
  // 4학년 1. 큰 수
  for (const [n, label] of [[52340000, '오천이백삼십사만'], [130000000, '일억 삼천만'], [7050000, '칠백오만'], [4200000000, '사십이억']] as Array<[number, string]>) {
    add({
      grade: 4, unit: '1. 큰 수', unit_code: '[4수01-02]',
      text: `${n.toLocaleString()}을 우리말로 바르게 읽은 것은?`,
      answer: label,
      wrong: ['오백이십삼만 사천', '일천삼백만', '칠십오만', '사백이십억'].filter((x) => x !== label).slice(0, 3),
      why: `${n.toLocaleString()}은 ${label}이라고 읽습니다.`,
      difficulty: 3,
    });
  }
  // 4학년 3. 곱셈과 나눗셈
  for (const [a, b] of [[384, 16], [672, 24], [810, 27], [945, 35], [528, 22], [703, 19]] as Array<[number, number]>) {
    const q = Math.floor(a / b), r = a % b;
    add({
      grade: 4, unit: '3. 곱셈과 나눗셈', unit_code: '[4수01-08]',
      text: `${a} ÷ ${b}의 몫과 나머지를 바르게 구한 것은?`,
      answer: `몫 ${q}, 나머지 ${r}`,
      wrong: [`몫 ${q + 1}, 나머지 ${r}`, `몫 ${q}, 나머지 ${r + 1}`, `몫 ${r}, 나머지 ${q}`, `몫 ${q - 1}, 나머지 ${r}`],
      why: `${b}×${q}=${b * q}, ${a}-${b * q}=${r}`,
      difficulty: 3,
    });
  }
  // 6학년 3. 소수의 나눗셈
  for (const [a, b] of [[8.4, 0.7], [5.6, 0.8], [10.5, 1.5], [7.2, 2.4]] as Array<[number, number]>) {
    const ans = Number((a / b).toFixed(4));
    add({
      grade: 6, unit: '3. 소수의 나눗셈', unit_code: '[6수01-05]',
      text: `길이 ${a}m인 끈을 ${b}m씩 자르면 몇 도막이 되나요?`,
      answer: `${ans}도막`,
      wrong: [`${Number((ans + 1).toFixed(4))}도막`, `${Number((ans - 1).toFixed(4))}도막`, `${Number((a * b).toFixed(4))}도막`, `${Number((ans * 10).toFixed(4))}도막`],
      why: `${a}÷${b}=${ans}(도막)`,
      difficulty: 3,
    });
  }
  // 6학년 9. 원기둥, 원뿔, 구
  for (const [r, h] of [[3, 8], [5, 10], [7, 6], [4, 12]] as Array<[number, number]>) {
    add({
      grade: 6, unit: '9. 원기둥, 원뿔, 구', unit_code: '[6수02-09]',
      text: `밑면의 반지름이 ${r}cm, 높이가 ${h}cm인 원기둥의 전개도에서 옆면 직사각형의 넓이는? (원주율 3.14)`,
      answer: `${Number((2 * r * 3.14 * h).toFixed(2))}cm²`,
      wrong: [
        `${Number((r * 3.14 * h).toFixed(2))}cm²`,
        `${Number((r * r * 3.14 * h).toFixed(2))}cm²`,
        `${Number((2 * r * 3.14 + h).toFixed(2))}cm²`,
        `${r * h}cm²`,
      ],
      why: `옆면의 가로는 원주 ${Number((2 * r * 3.14).toFixed(2))}cm, 세로는 높이 ${h}cm이므로 넓이는 ${Number((2 * r * 3.14 * h).toFixed(2))}cm²입니다.`,
      difficulty: 3,
    });
  }
}

export const seedV9Math: QuestionSeed[] = out;
