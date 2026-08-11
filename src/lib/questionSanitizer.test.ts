import { test } from 'node:test';
import assert from 'node:assert/strict';
import { valueKey, sanitizeQuestion, sanitizeQuestions, isSelectionStyle } from './questionSanitizer';

const mc = (over: Record<string, unknown> = {}) => ({
  grade: 5,
  subject: '수학',
  unit: '4. 약분과 통분',
  unit_code: null,
  question_type: 'multiple_choice',
  question_text: '6/12을 약분하면?',
  options: ['1/2', '2/3', '3/6', '1/3'],
  correct_answer: '1/2',
  explanation: '분자와 분모를 6으로 나눕니다.',
  difficulty: 2,
  ...over,
});

test('valueKey — 표기가 달라도 값이 같으면 같은 키', () => {
  assert.equal(valueKey('1/2'), valueKey('3/6'));
  assert.equal(valueKey('1/2'), valueKey('0.5'));
  assert.equal(valueKey('90도'), valueKey('90 도'));
  assert.equal(valueKey('9'), valueKey('9.0'));
});

test('valueKey — 대분수의 공백은 값의 일부다 (2 1/3 ≠ 21/3)', () => {
  assert.notEqual(valueKey('2 1/3'), valueKey('21/3'));
  assert.equal(valueKey('2 1/3'), valueKey('2과 1/3'));
  assert.equal(valueKey('21/3'), valueKey('7'));
});

test('valueKey — 값이 다르면 다른 키', () => {
  assert.notEqual(valueKey('1/2'), valueKey('1/3'));
  assert.notEqual(valueKey('90도'), valueKey('90cm'));
  assert.notEqual(valueKey('사과'), valueKey('바나나'));
});

test('정답과 값이 같은 보기는 제거된다 (복수 정답 차단)', () => {
  const { question, issues } = sanitizeQuestion(mc());
  assert.ok(question);
  assert.ok(!question.options!.includes('3/6'), '동치 보기 3/6이 남아 있으면 안 됨');
  assert.ok(question.options!.includes('1/2'), '정답은 반드시 보기에 있어야 함');
  assert.equal(new Set(question.options!.map(valueKey)).size, question.options!.length);
  assert.ok(issues.some((i) => i.code === 'EQUIV_TO_ANSWER_REMOVED'));
});

test('제거 후에도 보기는 4개로 채워진다', () => {
  const { question } = sanitizeQuestion(mc());
  assert.equal(question!.options!.length, 4);
});

test('완전 중복 보기 제거', () => {
  const { question } = sanitizeQuestion(
    mc({ question_text: '2+3은?', options: ['5', '5', '6', '7'], correct_answer: '5' })
  );
  assert.deepEqual([...new Set(question!.options!)], question!.options);
  assert.equal(question!.options!.length, 4);
});

test('선택형 발문에는 오답을 합성하지 않는다 (제2 정답 방지)', () => {
  assert.ok(isSelectionStyle('다음 중 1보다 작은 분수는?'));
  const { question } = sanitizeQuestion(
    mc({
      question_text: '다음 중 1보다 작은 분수는?',
      options: ['2/5', '5/2', '6/3', '4/10'], // 4/10 == 2/5 → 제거되어 3개만 남음
      correct_answer: '2/5',
    })
  );
  assert.equal(question!.options!.length, 3);
  assert.ok(question!.options!.includes('2/5'));
});

test('진분수 정답에는 진분수 오답만 합성된다 (4/4 같은 보기 금지)', () => {
  const { question } = sanitizeQuestion(
    mc({ question_text: '2/3 × 3/4 의 값은?', options: ['1/2', '2/4'], correct_answer: '1/2' })
  );
  for (const o of question!.options!) {
    const [n, d] = o.split('/').map(Number);
    if (Number.isFinite(n) && Number.isFinite(d)) {
      assert.ok(n < d, `가분수/정수 보기가 생성됨: ${o}`);
      assert.notEqual(n % d, 0, `정수값 보기가 생성됨: ${o}`);
    }
  }
});

test('정답이 보기에 아예 없으면 정답을 넣고 CRIT로 보고한다', () => {
  const { question, issues } = sanitizeQuestion(
    mc({ question_text: '7×8은?', options: ['54', '55', '58'], correct_answer: '56' })
  );
  assert.ok(question!.options!.includes('56'));
  assert.ok(issues.some((i) => i.code === 'ANSWER_NOT_IN_OPTIONS' && i.severity === 'CRIT'));
});

test('보기를 3개도 못 채우는 문항은 폐기된다', () => {
  const { question } = sanitizeQuestion(
    mc({ question_text: '가장 알맞은 것은?', options: ['사과'], correct_answer: '사과' })
  );
  assert.equal(question, null);
});

test('OX 문항은 보기가 O/X로 고정된다', () => {
  const { question } = sanitizeQuestion(
    mc({ question_type: 'ox', question_text: '1은 소수이다.', options: null, correct_answer: 'x' })
  );
  assert.deepEqual(question!.options, ['O', 'X']);
  assert.equal(question!.correct_answer, 'X');
});

test('주관식/빈칸은 보기를 갖지 않는다', () => {
  const { question } = sanitizeQuestion(
    mc({ question_type: 'short_answer', options: ['1/2'], correct_answer: '1/2' })
  );
  assert.equal(question!.options, null);
});

test('멱등성 — 한 번 정합화한 결과를 다시 넣어도 변하지 않는다', () => {
  const once = sanitizeQuestion(mc()).question!;
  const twice = sanitizeQuestion(once).question!;
  assert.deepEqual(twice.options, once.options);
  assert.equal(twice.correct_answer, once.correct_answer);
});

test('정답 위치가 항상 1번이 되지 않는다', () => {
  const list = Array.from({ length: 40 }, (_, i) =>
    mc({ question_text: `${i}번 문제: ${i}+1은?`, options: [`${i + 1}`, `${i + 2}`, `${i + 3}`, `${i + 4}`], correct_answer: `${i + 1}` })
  );
  const { questions } = sanitizeQuestions(list);
  const firstIsAnswer = questions.filter((q) => q.options![0] === q.correct_answer).length;
  assert.ok(firstIsAnswer < questions.length * 0.6, `정답이 1번에 몰림: ${firstIsAnswer}/${questions.length}`);
});

test('요약 통계가 입력·채택·폐기를 맞게 센다', () => {
  const { questions, summary } = sanitizeQuestions([mc(), mc({ question_text: '', correct_answer: '1' })]);
  assert.equal(summary.total, 2);
  assert.equal(summary.kept, 1);
  assert.equal(summary.dropped, 1);
  assert.equal(questions.length, 1);
});

test('띄어쓰기 문항 — 공백만 다른 보기는 서로 다른 보기로 남는다', () => {
  assert.notEqual(valueKey('할 수 있다'), valueKey('할수있다'));
  const { question } = sanitizeQuestion({
    grade: 5,
    subject: '국어',
    unit: '띄어쓰기',
    unit_code: null,
    question_type: 'multiple_choice',
    question_text: "의존 명사 '수'가 들어간 문장의 띄어쓰기로 바른 것은?",
    options: ['할 수 있다', '할수있다', '할수 있다', '할 수있다'],
    correct_answer: '할 수 있다',
    explanation: null,
    difficulty: 2,
  });
  assert.ok(question, '띄어쓰기 문항이 폐기되면 안 됨');
  assert.equal(question.options!.length, 4);
});

test('공백 개수 차이만 있는 표기는 여전히 같은 보기로 본다', () => {
  assert.equal(valueKey('할  수   있다'), valueKey('할 수 있다'));
});
