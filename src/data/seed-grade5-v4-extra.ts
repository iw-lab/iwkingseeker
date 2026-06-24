import type { QuestionSeed } from './questions-seed';

/**
 * grade 5 v4 확장 — 2022 개정 교육과정 5학년 핵심 단원 추가 문제 팩.
 * - OX 문제를 게임에서 제외한 만큼 4지선다 문제를 보강.
 * - 학년 수준(5학년)에 맞는 어휘/개념/난이도로 제한.
 */

const out: QuestionSeed[] = [];

const pushM = (q: Omit<QuestionSeed, 'grade' | 'subject'>) =>
  out.push({ grade: 5, subject: '수학', ...q });
const pushS = (q: Omit<QuestionSeed, 'grade' | 'subject'>) =>
  out.push({ grade: 5, subject: '과학', ...q });
const pushK = (q: Omit<QuestionSeed, 'grade' | 'subject'>) =>
  out.push({ grade: 5, subject: '국어', ...q });
const pushSoc = (q: Omit<QuestionSeed, 'grade' | 'subject'>) =>
  out.push({ grade: 5, subject: '사회', ...q });
const pushE = (q: Omit<QuestionSeed, 'grade' | 'subject'>) =>
  out.push({ grade: 5, subject: '영어', ...q });

const rotate = <T>(arr: T[], n: number): T[] => {
  const m = arr.length === 0 ? 0 : ((n % arr.length) + arr.length) % arr.length;
  return [...arr.slice(m), ...arr.slice(0, m)];
};

const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));

// =====================================================================
// 수학 (자연수 혼합계산 / 약수와 배수 / 약분과 통분 / 분수 사칙 / 다각형 둘레와 넓이)
// =====================================================================

// --- 자연수의 혼합 계산 (사칙 우선순위)
{
  const mix = [
    { a: 15, b: 3, c: 4, op1: '+', op2: '×' }, // 15+3×4
    { a: 20, b: 5, c: 2, op1: '-', op2: '×' },
    { a: 30, b: 6, c: 3, op1: '÷', op2: '+' },
    { a: 45, b: 9, c: 5, op1: '÷', op2: '-' },
    { a: 8, b: 4, c: 2, op1: '×', op2: '+' },
    { a: 24, b: 3, c: 5, op1: '÷', op2: '+' },
    { a: 50, b: 25, c: 5, op1: '-', op2: '÷' },
    { a: 18, b: 2, c: 3, op1: '+', op2: '×' },
    { a: 100, b: 20, c: 4, op1: '-', op2: '÷' },
    { a: 7, b: 6, c: 2, op1: '×', op2: '-' },
  ];
  const calc = (a: number, b: number, c: number, op1: string, op2: string) => {
    // 곱셈/나눗셈 우선 처리
    if (op2 === '×' || op2 === '÷') {
      const bc = op2 === '×' ? b * c : b / c;
      return op1 === '+' ? a + bc : op1 === '-' ? a - bc : op1 === '×' ? a * bc : a / bc;
    } else {
      const ab = op1 === '+' ? a + b : op1 === '-' ? a - b : op1 === '×' ? a * b : a / b;
      return op2 === '+' ? ab + c : op2 === '-' ? ab - c : op2 === '×' ? ab * c : ab / c;
    }
  };
  mix.forEach((m, i) => {
    const ans = calc(m.a, m.b, m.c, m.op1, m.op2);
    const wrongLeft = (m.op1 === '+' ? m.a + m.b : m.op1 === '-' ? m.a - m.b : m.op1 === '×' ? m.a * m.b : m.a / m.b);
    const wrong2 =
      m.op2 === '+'
        ? wrongLeft + m.c
        : m.op2 === '-'
        ? wrongLeft - m.c
        : m.op2 === '×'
        ? wrongLeft * m.c
        : wrongLeft / m.c;
    const dists = [wrong2, ans + 1, ans - 1, ans + 2, ans + 10].filter(
      (v) => v !== ans && Number.isFinite(v) && v >= 0
    );
    const uniq: number[] = [];
    for (const d of dists) if (!uniq.includes(d) && uniq.length < 3) uniq.push(d);
    const options = rotate([String(ans), ...uniq.map(String)], i);
    pushM({
      unit: '1. 자연수의 혼합 계산',
      unit_code: '[6수01-01]',
      question_type: 'multiple_choice',
      question_text: `${m.a} ${m.op1} ${m.b} ${m.op2} ${m.c} 의 값은?`,
      options,
      correct_answer: String(ans),
      explanation:
        '사칙 혼합 계산에서는 곱셈과 나눗셈을 먼저 계산한 뒤, 덧셈과 뺄셈을 왼쪽부터 차례로 계산합니다.',
      difficulty: 2,
    });
  });
}

// --- 약수와 배수 / 최대공약수·최소공배수
{
  const pairs: Array<[number, number]> = [
    [12, 18], [8, 12], [9, 15], [16, 24], [10, 25], [20, 30], [14, 21], [6, 9], [18, 24], [15, 20],
  ];
  pairs.forEach(([a, b], i) => {
    const g = gcd(a, b);
    const lcm = (a * b) / g;
    const distsG = [g + 1, g - 1, g + 2, g * 2].filter((v) => v !== g && v > 0);
    pushM({
      unit: '2. 약수와 배수',
      unit_code: '[6수01-02]',
      question_type: 'multiple_choice',
      question_text: `${a}과(와) ${b}의 최대공약수는?`,
      options: rotate([String(g), ...distsG.slice(0, 3).map(String)], i),
      correct_answer: String(g),
      explanation: `${a} = ${g} × ${a / g}, ${b} = ${g} × ${b / g} 이므로 최대공약수는 ${g}입니다.`,
      difficulty: 2,
    });
    const distsL = [lcm + a, lcm + b, lcm - g, Math.max(a, b) * 2].filter((v) => v !== lcm && v > 0);
    pushM({
      unit: '2. 약수와 배수',
      unit_code: '[6수01-02]',
      question_type: 'multiple_choice',
      question_text: `${a}과(와) ${b}의 최소공배수는?`,
      options: rotate([String(lcm), ...distsL.slice(0, 3).map(String)], i + 1),
      correct_answer: String(lcm),
      explanation: `(${a} × ${b}) ÷ 최대공약수(${g}) = ${lcm}입니다.`,
      difficulty: 2,
    });
  });
}

// --- 약분과 통분
{
  const fracs: Array<[number, number]> = [
    [6, 12], [9, 15], [8, 20], [10, 25], [12, 16], [14, 21], [18, 24], [15, 35],
  ];
  fracs.forEach(([n, d], i) => {
    const g = gcd(n, d);
    const ans = `${n / g}/${d / g}`;
    const distractors = [
      `${n - 1}/${d - 1}`,
      `${n}/${d / 2}`,
      `${n * 2}/${d}`,
      `${n}/${d - g}`,
    ].filter((s) => s !== ans);
    pushM({
      unit: '4. 약분과 통분',
      unit_code: '[6수01-05]',
      question_type: 'multiple_choice',
      question_text: `분수 ${n}/${d} 을(를) 기약분수로 나타내면?`,
      options: rotate([ans, ...distractors.slice(0, 3)], i),
      correct_answer: ans,
      explanation: `${n}과 ${d}의 최대공약수인 ${g}로 분자와 분모를 각각 나눕니다.`,
      difficulty: 2,
    });
  });
}

// --- 분수의 덧셈과 뺄셈 (같은 분모)
{
  const probs: Array<[number, number, number, number, '+' | '-']> = [
    [1, 5, 2, 5, '+'],
    [3, 7, 2, 7, '+'],
    [4, 9, 3, 9, '-'],
    [5, 8, 1, 8, '-'],
    [2, 6, 3, 6, '+'],
    [7, 10, 4, 10, '-'],
    [3, 11, 5, 11, '+'],
  ];
  probs.forEach(([a, d1, b, d2, op], i) => {
    const numerator = op === '+' ? a + b : a - b;
    const g = gcd(Math.max(1, Math.abs(numerator)), d1);
    const ans =
      numerator === 0 ? '0' : `${numerator / g}/${d1 / g}`;
    const wrongs = [
      `${a + b}/${d1 + d2}`,
      `${numerator}/${d1 * 2}`,
      `${numerator + 1}/${d1}`,
      `${Math.max(1, numerator - 1)}/${d1}`,
    ].filter((s) => s !== ans);
    pushM({
      unit: '5. 분수의 덧셈과 뺄셈',
      unit_code: '[6수01-07]',
      question_type: 'multiple_choice',
      question_text: `${a}/${d1} ${op} ${b}/${d2} 의 값은? (기약분수로 나타내세요)`,
      options: rotate([ans, ...wrongs.slice(0, 3)], i),
      correct_answer: ans,
      explanation: `분모가 같으므로 분자끼리 ${op === '+' ? '더하거나' : '빼서'} 계산한 뒤 약분합니다.`,
      difficulty: 2,
    });
  });
}

// --- 다각형의 둘레와 넓이
{
  // 직사각형 / 평행사변형 / 삼각형
  const rects: Array<[number, number]> = [[7, 4], [8, 5], [6, 9], [10, 3], [12, 5]];
  rects.forEach(([w, h], i) => {
    const area = w * h;
    const peri = 2 * (w + h);
    pushM({
      unit: '6. 다각형의 둘레와 넓이',
      unit_code: '[6수03-04]',
      question_type: 'multiple_choice',
      question_text: `가로 ${w}cm, 세로 ${h}cm 인 직사각형의 넓이는?`,
      options: rotate(
        [`${area}cm²`, `${peri}cm²`, `${w + h}cm²`, `${area - w}cm²`],
        i
      ),
      correct_answer: `${area}cm²`,
      explanation: '직사각형의 넓이 = 가로 × 세로.',
      difficulty: 1,
    });
    pushM({
      unit: '6. 다각형의 둘레와 넓이',
      unit_code: '[6수03-04]',
      question_type: 'multiple_choice',
      question_text: `가로 ${w}cm, 세로 ${h}cm 인 직사각형의 둘레는?`,
      options: rotate(
        [`${peri}cm`, `${area}cm`, `${w + h}cm`, `${w * h * 2}cm`],
        i + 1
      ),
      correct_answer: `${peri}cm`,
      explanation: '직사각형의 둘레 = (가로 + 세로) × 2.',
      difficulty: 1,
    });
  });
  const tris: Array<[number, number]> = [[6, 4], [8, 5], [10, 6], [12, 7]];
  tris.forEach(([b, h], i) => {
    const area = (b * h) / 2;
    pushM({
      unit: '6. 다각형의 둘레와 넓이',
      unit_code: '[6수03-05]',
      question_type: 'multiple_choice',
      question_text: `밑변 ${b}cm, 높이 ${h}cm 인 삼각형의 넓이는?`,
      options: rotate(
        [`${area}cm²`, `${b * h}cm²`, `${b + h}cm²`, `${area + 1}cm²`],
        i
      ),
      correct_answer: `${area}cm²`,
      explanation: '삼각형의 넓이 = 밑변 × 높이 ÷ 2.',
      difficulty: 2,
    });
  });
}

// --- 소수의 곱셈
{
  const sp: Array<[number, number]> = [
    [0.3, 5], [0.6, 4], [0.2, 8], [0.7, 3], [1.2, 5], [2.5, 4], [0.5, 6], [1.5, 2],
    [0.4, 7], [0.9, 3], [1.1, 4], [2.3, 2], [0.25, 4], [1.25, 4], [3.2, 3], [0.8, 5],
  ];
  sp.forEach(([a, b], i) => {
    const ans = Number((a * b).toFixed(2));
    const distractors = [a + b, a * b * 10, Number((a * b + 0.1).toFixed(2)), Number((a * b - 0.1).toFixed(2))].filter(
      (v) => v !== ans
    );
    pushM({
      unit: '7. 소수의 곱셈',
      unit_code: '[6수01-10]',
      question_type: 'multiple_choice',
      question_text: `${a} × ${b} 의 값은?`,
      options: rotate([String(ans), ...distractors.slice(0, 3).map(String)], i),
      correct_answer: String(ans),
      explanation: '소수를 자연수로 바꾸어 곱한 뒤 소수점 위치를 맞춥니다.',
      difficulty: 2,
    });
  });
}

// --- 분수×자연수
{
  const cases: Array<[number, number, number]> = [
    [1, 3, 6], [2, 5, 10], [3, 4, 8], [1, 6, 12], [2, 7, 14], [3, 5, 10], [4, 9, 3], [5, 8, 4],
    [1, 2, 7], [3, 10, 5], [2, 3, 9], [5, 6, 4],
  ];
  cases.forEach(([n, d, k], i) => {
    const num = n * k;
    const g = gcd(num, d);
    const ans = d / g === 1 ? `${num / g}` : `${num / g}/${d / g}`;
    const distractors = [
      `${n * k}/${d + k}`,
      `${n + k}/${d}`,
      `${n}/${d * k}`,
      `${n * k - 1}/${d}`,
    ].filter((s) => s !== ans);
    pushM({
      unit: '5. 분수의 곱셈',
      unit_code: '[6수01-06]',
      question_type: 'multiple_choice',
      question_text: `${n}/${d} × ${k} 의 값은? (기약분수 또는 자연수로)`,
      options: rotate([ans, ...distractors.slice(0, 3)], i),
      correct_answer: ans,
      explanation: '분수×자연수는 분자에 자연수를 곱한 뒤 약분합니다.',
      difficulty: 2,
    });
  });
}

// --- 대응관계 / 규칙과 대응
{
  const rules = [
    { desc: 'x의 값이 1일 때 y는 3, x=2일 때 y=6, x=3일 때 y=9입니다. x=10일 때 y는?', a: '30', d: ['13', '90', '10'], rule: 'y = 3 × x' },
    { desc: 'x=1→y=4, x=2→y=5, x=3→y=6 일 때, x=10이면 y는?', a: '13', d: ['40', '14', '10'], rule: 'y = x + 3' },
    { desc: 'x=1→y=1, x=2→y=4, x=3→y=9 일 때, x=5이면 y는?', a: '25', d: ['15', '20', '50'], rule: 'y = x × x' },
    { desc: 'x=2→y=1, x=4→y=2, x=6→y=3 일 때, x=20이면 y는?', a: '10', d: ['4', '40', '18'], rule: 'y = x ÷ 2' },
  ];
  rules.forEach((p, i) => {
    pushM({
      unit: '3. 규칙과 대응',
      unit_code: '[6수04-01]',
      question_type: 'multiple_choice',
      question_text: p.desc,
      options: rotate([p.a, ...p.d], i),
      correct_answer: p.a,
      explanation: `두 양 사이의 규칙을 찾아봅시다. (예: ${p.rule})`,
      difficulty: 2,
    });
  });
}

// --- 평균과 가능성
{
  const avgs = [
    { nums: [80, 90, 70, 100], desc: '시험 점수가 80점, 90점, 70점, 100점일 때 평균은?' },
    { nums: [5, 7, 9, 11], desc: '5, 7, 9, 11의 평균은?' },
    { nums: [10, 20, 30], desc: '10, 20, 30의 평균은?' },
    { nums: [60, 70, 80, 90, 100], desc: '60, 70, 80, 90, 100의 평균은?' },
    { nums: [2, 4, 6, 8, 10, 12], desc: '2, 4, 6, 8, 10, 12의 평균은?' },
  ];
  avgs.forEach((p, i) => {
    const sum = p.nums.reduce((a, b) => a + b, 0);
    const avg = sum / p.nums.length;
    const ans = Number.isInteger(avg) ? String(avg) : avg.toFixed(1);
    const dists = [String(sum), String(avg + 1), String(avg - 1), String(p.nums[0]!)];
    pushM({
      unit: '6. 평균과 가능성',
      unit_code: '[6수05-02]',
      question_type: 'multiple_choice',
      question_text: p.desc,
      options: rotate([ans, ...dists.filter((s) => s !== ans).slice(0, 3)], i),
      correct_answer: ans,
      explanation: '평균 = 자료의 합 ÷ 자료의 개수',
      difficulty: 2,
    });
  });
  const probs = [
    { q: '동전 한 개를 던질 때, 숫자 면이 나올 가능성은?', a: '반반이다', d: ['확실하다', '불가능하다', '가끔 그렇다'] },
    { q: '내일 아침 해가 동쪽에서 뜰 가능성은?', a: '확실하다', d: ['반반이다', '불가능하다', '알 수 없다'] },
    { q: '주머니에 빨간 공만 들어 있을 때, 파란 공을 꺼낼 가능성은?', a: '불가능하다', d: ['반반이다', '확실하다', '가끔'] },
  ];
  probs.forEach((p, i) => {
    pushM({
      unit: '6. 평균과 가능성',
      unit_code: '[6수05-02]',
      question_type: 'multiple_choice',
      question_text: p.q,
      options: rotate([p.a, ...p.d], i),
      correct_answer: p.a,
      explanation: '가능성은 "확실하다, 반반이다, 불가능하다" 등으로 표현할 수 있습니다.',
      difficulty: 1,
    });
  });
}

// =====================================================================
// 과학 (태양계와 별 / 용해와 용액 / 산과 염기 / 생물과 환경 / 날씨와 우리 생활)
// =====================================================================

// --- 태양계와 별
{
  const planets = [
    { q: '태양에서 가장 가까운 행성은?', a: '수성', d: ['금성', '지구', '화성'] },
    { q: '태양계에서 가장 큰 행성은?', a: '목성', d: ['토성', '해왕성', '천왕성'] },
    { q: '고리가 뚜렷하게 관찰되는 행성은?', a: '토성', d: ['목성', '금성', '수성'] },
    { q: '지구와 크기가 가장 비슷한 행성은?', a: '금성', d: ['화성', '수성', '목성'] },
    { q: '태양계에서 지구의 위성은?', a: '달', d: ['해', '별', '구름'] },
    { q: '밤하늘에서 움직이지 않는 것처럼 보이는 별은?', a: '북극성', d: ['시리우스', '베텔게우스', '직녀성'] },
    { q: '별자리 "북두칠성"에 속한 별은 몇 개?', a: '7개', d: ['5개', '6개', '9개'] },
    { q: '태양은 무엇에 속할까?', a: '별', d: ['행성', '위성', '혜성'] },
    { q: '태양계의 중심에 있는 것은?', a: '태양', d: ['지구', '달', '목성'] },
    { q: '지구가 태양을 한 바퀴 도는 데 걸리는 시간은?', a: '약 1년', d: ['약 1달', '약 1일', '약 7일'] },
  ];
  planets.forEach((p, i) => {
    pushS({
      unit: '1. 태양계와 별',
      unit_code: '[6과09-01]',
      question_type: 'multiple_choice',
      question_text: p.q,
      options: rotate([p.a, ...p.d], i),
      correct_answer: p.a,
      explanation: '태양계 구성원의 특징을 떠올려 봅시다.',
      difficulty: 2,
    });
  });
}

// --- 용해와 용액
{
  const items = [
    { q: '소금이 물에 녹아서 보이지 않게 되는 현상을 무엇이라 하나요?', a: '용해', d: ['증발', '응결', '침전'] },
    { q: '용액에서 물처럼 다른 물질을 녹이는 물질은?', a: '용매', d: ['용질', '혼합물', '결정'] },
    { q: '용액에서 녹아 들어가는 물질은?', a: '용질', d: ['용매', '기체', '앙금'] },
    { q: '같은 온도의 물에 설탕을 계속 넣으면 어떻게 되나요?', a: '어느 순간부터 더 이상 녹지 않는다', d: ['끝까지 계속 녹는다', '얼어버린다', '물이 늘어난다'] },
    { q: '물의 온도가 높아지면 설탕이 녹는 양은?', a: '대체로 많아진다', d: ['변화 없다', '오히려 줄어든다', '사라진다'] },
    { q: '용액의 진하기를 나타낼 때 사용하는 방법이 아닌 것은?', a: '냄새 맡기', d: ['전자저울 사용', '용질의 양 비교', '용액의 맛 비교'] },
    { q: '물 100g에 소금 20g을 녹였을 때, 소금물의 무게는?', a: '120g', d: ['100g', '20g', '80g'] },
    { q: '온도가 낮을수록 더 잘 녹는 것은?', a: '기체', d: ['고체(설탕)', '고체(소금)', '밀가루'] },
  ];
  items.forEach((p, i) => {
    pushS({
      unit: '2. 용해와 용액',
      unit_code: '[6과05-01]',
      question_type: 'multiple_choice',
      question_text: p.q,
      options: rotate([p.a, ...p.d], i),
      correct_answer: p.a,
      explanation: '용해와 용액의 성질을 떠올려 봅시다.',
      difficulty: 2,
    });
  });
}

// --- 산과 염기
{
  const items = [
    { q: '푸른색 리트머스 종이를 붉게 변화시키는 용액은?', a: '산성 용액', d: ['염기성 용액', '중성 용액', '기체 용액'] },
    { q: '붉은색 리트머스 종이를 푸르게 변화시키는 용액은?', a: '염기성 용액', d: ['산성 용액', '중성 용액', '기체 용액'] },
    { q: '다음 중 산성 용액에 해당하는 것은?', a: '식초', d: ['비눗물', '유리 세정제', '석회수'] },
    { q: '다음 중 염기성 용액에 해당하는 것은?', a: '비눗물', d: ['사이다', '식초', '레몬즙'] },
    { q: '페놀프탈레인 용액을 떨어뜨렸을 때 붉게 변하는 것은?', a: '염기성 용액', d: ['산성 용액', '중성 용액', '소금물'] },
    { q: '산성 용액에 염기성 용액을 섞으면 어떻게 되나요?', a: '성질이 약해진다', d: ['더 강해진다', '변화 없다', '얼어붙는다'] },
  ];
  items.forEach((p, i) => {
    pushS({
      unit: '5. 산과 염기',
      unit_code: '[6과05-03]',
      question_type: 'multiple_choice',
      question_text: p.q,
      options: rotate([p.a, ...p.d], i),
      correct_answer: p.a,
      explanation: '지시약의 색 변화와 대표 예시를 떠올려 봅시다.',
      difficulty: 2,
    });
  });
}

// --- 생물과 환경 (생태계)
{
  const items = [
    { q: '생태계에서 스스로 양분을 만드는 생물은?', a: '생산자', d: ['소비자', '분해자', '기생충'] },
    { q: '다른 생물을 먹이로 하여 살아가는 생물은?', a: '소비자', d: ['생산자', '분해자', '무생물'] },
    { q: '죽은 생물이나 배설물을 분해하는 생물은?', a: '분해자', d: ['생산자', '1차 소비자', '2차 소비자'] },
    { q: '생태계에서 "풀 → 메뚜기 → 개구리 → 뱀"은 무엇을 나타내나요?', a: '먹이 사슬', d: ['먹이 그물', '식물의 한살이', '생물의 분류'] },
    { q: '비생물 요소가 아닌 것은?', a: '식물', d: ['햇빛', '공기', '물'] },
    { q: '환경에 적응하여 계절에 따라 털갈이를 하는 동물이 아닌 것은?', a: '소나무', d: ['북극여우', '토끼', '눈토끼'] },
    { q: '생태계에서 생산자의 역할은?', a: '햇빛을 받아 양분을 만든다', d: ['동물을 잡아먹는다', '죽은 생물을 분해한다', '흙을 뭉친다'] },
  ];
  items.forEach((p, i) => {
    pushS({
      unit: '3. 생물과 환경',
      unit_code: '[6과03-01]',
      question_type: 'multiple_choice',
      question_text: p.q,
      options: rotate([p.a, ...p.d], i),
      correct_answer: p.a,
      explanation: '생태계 구성 요소(생산자, 소비자, 분해자)를 구분해 봅시다.',
      difficulty: 2,
    });
  });
}

// --- 날씨와 우리 생활
{
  const items = [
    { q: '습도를 측정하는 기구는?', a: '건습구 습도계', d: ['온도계', '풍향계', '우량계'] },
    { q: '이슬은 언제 생길까?', a: '밤이나 새벽에 기온이 낮아질 때', d: ['한낮에 햇빛이 강할 때', '바람이 셀 때', '비가 올 때'] },
    { q: '주로 여름철 우리나라에 영향을 주는 공기 덩어리는?', a: '따뜻하고 습한 공기', d: ['차갑고 건조한 공기', '차갑고 습한 공기', '따뜻하고 건조한 공기'] },
    { q: '고기압에서 저기압으로 공기가 이동하는 현상을 무엇이라 하나요?', a: '바람', d: ['비', '눈', '구름'] },
    { q: '바닷가에서 낮에 바닷가로 부는 바람은?', a: '해풍', d: ['육풍', '편서풍', '무역풍'] },
    { q: '일기 예보에서 기압을 낮은 곳을 나타내는 기호는?', a: '저(低)', d: ['고(高)', '중(中)', '풍(風)'] },
  ];
  items.forEach((p, i) => {
    pushS({
      unit: '4. 날씨와 우리 생활',
      unit_code: '[6과09-02]',
      question_type: 'multiple_choice',
      question_text: p.q,
      options: rotate([p.a, ...p.d], i),
      correct_answer: p.a,
      explanation: '일상 속 기상 현상을 떠올려 봅시다.',
      difficulty: 2,
    });
  });
}

// =====================================================================
// 사회 (국토와 우리 생활 / 인권과 헌법 / 우리 경제 / 근현대사)
// =====================================================================

{
  const items = [
    { q: '우리나라의 수도는?', a: '서울특별시', d: ['부산광역시', '인천광역시', '세종특별자치시'] },
    { q: '우리나라의 동쪽 끝에 있는 섬은?', a: '독도', d: ['제주도', '마라도', '울릉도'] },
    { q: '남북으로 가장 길게 뻗은 산맥은?', a: '태백산맥', d: ['소백산맥', '차령산맥', '노령산맥'] },
    { q: '한반도의 남쪽 끝 섬은?', a: '마라도', d: ['독도', '울릉도', '백령도'] },
    { q: '우리나라에서 가장 긴 강은?', a: '압록강', d: ['한강', '금강', '낙동강'] },
    { q: '기후가 온화하고 비가 많이 와 벼농사가 활발한 지역은?', a: '남부 평야', d: ['태백산맥 고산 지대', '한라산 정상', '사막 지역'] },
    { q: '우리나라가 4계절이 뚜렷한 이유는?', a: '중위도에 있고 대륙과 바다의 영향을 받기 때문에', d: ['적도 근처라서', '북극에 가까워서', '섬나라라서'] },
    { q: '인구가 가장 많이 모인 지역은?', a: '수도권', d: ['제주권', '강원권', '울릉권'] },
    { q: '산지가 많아 농경지보다 임야가 많은 지역은?', a: '강원도', d: ['전라남도', '충청남도', '제주특별자치도'] },
    { q: '지도에서 실제 거리를 줄인 비율을 나타내는 것은?', a: '축척', d: ['범례', '방위표', '등고선'] },
  ];
  items.forEach((p, i) => {
    pushSoc({
      unit: '1. 국토와 우리 생활',
      unit_code: '[6사01-01]',
      question_type: 'multiple_choice',
      question_text: p.q,
      options: rotate([p.a, ...p.d], i),
      correct_answer: p.a,
      explanation: '우리나라 국토의 특징을 떠올려 봅시다.',
      difficulty: 2,
    });
  });
}

{
  const items = [
    { q: '모든 사람이 태어날 때부터 당연히 누리는 권리를 무엇이라 하나요?', a: '인권', d: ['의무', '직업', '재산'] },
    { q: '국가의 최고 법으로, 국민의 권리와 의무를 정한 것은?', a: '헌법', d: ['조례', '규칙', '계약서'] },
    { q: '법을 만드는 일을 담당하는 기관은?', a: '국회', d: ['정부', '법원', '대통령실'] },
    { q: '법에 따라 재판을 하는 기관은?', a: '법원', d: ['국회', '정부', '경찰청'] },
    { q: '법을 집행하고 나라 살림을 맡는 기관은?', a: '정부', d: ['국회', '법원', '학교'] },
    { q: '우리나라 헌법이 보장하는 국민의 기본권이 아닌 것은?', a: '다른 사람의 재산을 빼앗을 권리', d: ['평등권', '자유권', '사회권'] },
    { q: '국가의 일을 국민이 직접 또는 대표자를 뽑아 결정하는 제도는?', a: '민주주의', d: ['독재', '왕정', '귀족 정치'] },
    { q: '18세 이상 국민이 선거에 참여할 수 있는 권리는?', a: '선거권', d: ['교육권', '근로권', '재산권'] },
  ];
  items.forEach((p, i) => {
    pushSoc({
      unit: '2. 인권 존중과 정의로운 사회',
      unit_code: '[6사02-01]',
      question_type: 'multiple_choice',
      question_text: p.q,
      options: rotate([p.a, ...p.d], i),
      correct_answer: p.a,
      explanation: '인권·헌법·삼권분립의 기본 개념을 떠올려 봅시다.',
      difficulty: 2,
    });
  });
}

{
  const items = [
    { q: '가계와 기업이 만나 물건과 서비스를 사고파는 장소를 무엇이라 하나요?', a: '시장', d: ['공장', '법원', '학교'] },
    { q: '가계가 돈을 벌기 위해 기업에서 일을 하는 것을 무엇이라 하나요?', a: '노동(근로)', d: ['소비', '저축', '투자'] },
    { q: '가격이 결정될 때 중요한 두 가지는?', a: '공급과 수요', d: ['세금과 법', '날씨와 계절', '친구와 가족'] },
    { q: '우리나라가 외국과 물건을 사고파는 것을 무엇이라 하나요?', a: '무역', d: ['환전', '저축', '증여'] },
    { q: '국내에서 생산한 물건을 다른 나라로 파는 것을 무엇이라 하나요?', a: '수출', d: ['수입', '유통', '보관'] },
    { q: '우리나라의 대표적인 수출품이 아닌 것은?', a: '화산재', d: ['반도체', '자동차', '휴대전화'] },
    { q: '정부가 경제 활동에서 하는 일이 아닌 것은?', a: '기업의 이익을 모두 가져간다', d: ['세금을 거둔다', '공공 서비스를 제공한다', '공정한 경쟁을 보장한다'] },
  ];
  items.forEach((p, i) => {
    pushSoc({
      unit: '3. 우리나라의 경제 발전',
      unit_code: '[6사03-01]',
      question_type: 'multiple_choice',
      question_text: p.q,
      options: rotate([p.a, ...p.d], i),
      correct_answer: p.a,
      explanation: '경제 주체와 시장·무역의 역할을 생각해 봅시다.',
      difficulty: 2,
    });
  });
}

// =====================================================================
// 국어 (관용 표현 / 속담 / 글의 구조 / 낱말의 관계 / 낱말 맞춤법)
// =====================================================================

{
  const idioms = [
    { q: '"발이 넓다"의 뜻은?', a: '아는 사람이 많다', d: ['키가 크다', '걸음이 빠르다', '신발이 크다'] },
    { q: '"귀가 얇다"의 뜻은?', a: '남의 말을 쉽게 믿는다', d: ['귀가 작다', '잘 듣지 못한다', '체력이 약하다'] },
    { q: '"손이 크다"의 뜻은?', a: '씀씀이가 후하다', d: ['실제로 손이 크다', '일을 잘한다', '돈이 많다'] },
    { q: '"입이 무겁다"의 뜻은?', a: '비밀을 잘 지킨다', d: ['말이 많다', '잘 먹지 않는다', '입이 크다'] },
    { q: '"눈이 높다"의 뜻은?', a: '기준이 까다롭다', d: ['키가 크다', '멀리 본다', '정직하다'] },
    { q: '"발 벗고 나서다"의 뜻은?', a: '적극적으로 나서서 돕다', d: ['맨발로 뛰다', '빨리 달리다', '집을 나서다'] },
    { q: '"바늘 도둑이 소도둑 된다"의 뜻은?', a: '작은 잘못을 고치지 않으면 큰 잘못을 저지르게 된다', d: ['바늘이 비싸다', '소가 바늘을 삼킨다', '도둑은 잡기 어렵다'] },
    { q: '"가는 말이 고와야 오는 말이 곱다"의 뜻은?', a: '내가 잘 대해야 상대도 잘 대한다', d: ['말은 빨리 해야 한다', '말수가 적어야 한다', '고운 말만 해야 한다'] },
    { q: '"소 잃고 외양간 고친다"의 뜻은?', a: '일이 잘못된 뒤에 손을 쓰면 소용없다', d: ['소를 잘 기른다', '외양간을 튼튼히 짓는다', '동물을 사랑한다'] },
    { q: '"티끌 모아 태산"의 뜻은?', a: '작은 것도 모이면 큰 것이 된다', d: ['티끌은 작다', '태산은 크다', '청소를 잘 해야 한다'] },
  ];
  idioms.forEach((p, i) => {
    pushK({
      unit: '관용 표현과 속담',
      unit_code: '[6국04-04]',
      question_type: 'multiple_choice',
      question_text: p.q,
      options: rotate([p.a, ...p.d], i),
      correct_answer: p.a,
      explanation: '관용 표현·속담은 글자 그대로의 뜻이 아니라 비유적인 뜻을 담고 있습니다.',
      difficulty: 2,
    });
  });
}

{
  const words = [
    { q: '다음 중 "기쁘다"와 뜻이 가장 비슷한 낱말은?', a: '즐겁다', d: ['슬프다', '무섭다', '힘들다'] },
    { q: '다음 중 "빠르다"와 뜻이 반대인 낱말은?', a: '느리다', d: ['가볍다', '크다', '멀다'] },
    { q: '다음 중 "가볍다"의 반대말은?', a: '무겁다', d: ['가깝다', '멀다', '튼튼하다'] },
    { q: '다음 중 "깨끗하다"와 뜻이 비슷한 낱말은?', a: '청결하다', d: ['지저분하다', '더럽다', '복잡하다'] },
    { q: '다음 중 "길다"의 반대말은?', a: '짧다', d: ['크다', '작다', '넓다'] },
    { q: '다음 중 "넓다"의 반대말은?', a: '좁다', d: ['짧다', '낮다', '얕다'] },
    { q: '다음 중 "높다"의 반대말은?', a: '낮다', d: ['얕다', '짧다', '좁다'] },
  ];
  words.forEach((p, i) => {
    pushK({
      unit: '낱말의 관계',
      unit_code: '[6국04-02]',
      question_type: 'multiple_choice',
      question_text: p.q,
      options: rotate([p.a, ...p.d], i),
      correct_answer: p.a,
      explanation: '뜻이 비슷한 낱말(유의어)과 반대되는 낱말(반의어)을 구분해 봅시다.',
      difficulty: 1,
    });
  });
}

{
  const orth = [
    { q: '맞춤법이 올바른 것은?', a: '설거지', d: ['설걷이', '설것지', '설것이'] },
    { q: '맞춤법이 올바른 것은?', a: '깨끗이', d: ['깨끗히', '깨끝이', '깨것이'] },
    { q: '맞춤법이 올바른 것은?', a: '며칠', d: ['몇일', '며일', '며칠이'] },
    { q: '맞춤법이 올바른 것은?', a: '됐어', d: ['됬어', '됏어', '댔어'] },
    { q: '맞춤법이 올바른 것은?', a: '바람', d: ['바램', '바람', '바램이'] },
    { q: '맞춤법이 올바른 것은?', a: '금세', d: ['금새', '금쎄', '금세히'] },
    { q: '맞춤법이 올바른 것은?', a: '왠지', d: ['웬지', '왼지', '웬일'] },
    { q: '"희망"의 뜻으로 바른 것은?', a: '앞일에 대한 기대와 바람', d: ['지나간 일', '오래된 친구', '좋은 음식'] },
  ];
  orth.forEach((p, i) => {
    pushK({
      unit: '바른 낱말과 표현',
      unit_code: '[6국04-01]',
      question_type: 'multiple_choice',
      question_text: p.q,
      options: rotate([p.a, ...p.d], i),
      correct_answer: p.a,
      explanation: '자주 틀리는 맞춤법은 정확히 구분하여 외워두면 좋습니다.',
      difficulty: 2,
    });
  });
}

// =====================================================================
// 영어 (기본 표현 — 학년 수준에 맞는 기초 어휘/문법)
// =====================================================================

{
  const eng = [
    { q: '"Hello, how are you?"에 대한 알맞은 답은?', a: "I'm fine, thank you.", d: ['My name is Tom.', 'Goodbye.', 'It is sunny.'] },
    { q: '"What is your name?"의 뜻으로 알맞은 것은?', a: '너의 이름은 무엇이니?', d: ['너는 몇 살이니?', '너는 어디에 사니?', '너는 무엇을 좋아하니?'] },
    { q: '숫자 "five"는 얼마?', a: '5', d: ['4', '6', '9'] },
    { q: '숫자 "twelve"는 얼마?', a: '12', d: ['20', '2', '11'] },
    { q: '"Monday"의 뜻은?', a: '월요일', d: ['일요일', '토요일', '수요일'] },
    { q: '"December"의 뜻은?', a: '12월', d: ['10월', '11월', '1월'] },
    { q: '"사과"를 영어로 쓰면?', a: 'apple', d: ['banana', 'orange', 'grape'] },
    { q: '"학교"를 영어로 쓰면?', a: 'school', d: ['store', 'park', 'house'] },
    { q: '"I like ___."에서 빈칸에 들어갈 수 있는 것은?', a: 'pizza', d: ['am', 'is', 'are'] },
    { q: '"How old are you?"의 의미는?', a: '너는 몇 살이니?', d: ['너는 어디 사니?', '너는 누구니?', '지금 몇 시니?'] },
    { q: '"Can you swim?"에 "그래, 할 수 있어"라고 답하려면?', a: 'Yes, I can.', d: ['No, I can.', 'Yes, I do.', 'No, I am.'] },
    { q: '다음 중 "동물"을 나타내는 단어가 아닌 것은?', a: 'desk', d: ['dog', 'cat', 'rabbit'] },
    { q: '"What time is it?"의 의미는?', a: '지금 몇 시입니까?', d: ['오늘 며칠입니까?', '오늘 날씨가 어떤가요?', '무엇을 먹었나요?'] },
    { q: '"Where is the book?" — "It is on the ___."에서 자연스러운 단어는?', a: 'desk', d: ['run', 'eat', 'play'] },
    { q: '"Thank you."에 대한 알맞은 답은?', a: "You're welcome.", d: ["I'm sorry.", 'Good night.', "Let's go."] },
  ];
  eng.forEach((p, i) => {
    pushE({
      unit: '기본 표현과 어휘',
      unit_code: null,
      question_type: 'multiple_choice',
      question_text: p.q,
      options: rotate([p.a, ...p.d], i),
      correct_answer: p.a,
      explanation: '5학년 수준의 기초 영어 표현을 익혀 봅시다.',
      difficulty: 2,
    });
  });
}

export const seedGrade5V4Extra: QuestionSeed[] = out;
