import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  encodeShareCode,
  decodeShareCode,
  importSetJson,
  exportSetJson,
  validateSetQuestions,
  type QuestionSet,
} from './questionSets';

const sampleSet = (): QuestionSet => ({
  id: 'set-test',
  name: '5학년 약분과 통분 핵심 10제',
  author: '김선생',
  grade: 5,
  subject: '수학',
  unit: '4. 약분과 통분',
  questions: [
    {
      grade: 5,
      subject: '수학',
      unit: '4. 약분과 통분',
      question_type: 'multiple_choice',
      question_text: '6/12을 기약분수로 나타내면?',
      options: ['1/2', '2/3', '1/3', '3/4'],
      correct_answer: '1/2',
      explanation: '분자와 분모를 6으로 나눕니다.',
      difficulty: 2,
      source: 'bank',
    },
    {
      grade: 5,
      subject: '수학',
      unit: '4. 약분과 통분',
      question_type: 'ox',
      question_text: '기약분수는 더 이상 약분할 수 없다.',
      options: ['O', 'X'],
      correct_answer: 'O',
      explanation: null,
      difficulty: 1,
      source: 'custom',
    },
  ],
  created_at: '2026-01-01T00:00:00.000Z',
  updated_at: '2026-01-01T00:00:00.000Z',
});

test('공유 코드 왕복 — 내용이 그대로 복원된다', async () => {
  const set = sampleSet();
  const code = await encodeShareCode(set);
  assert.ok(code.startsWith('KS1.'), `접두가 없음: ${code.slice(0, 12)}`);

  const { set: back, skipped, error } = await decodeShareCode(code);
  assert.equal(error, undefined);
  assert.equal(skipped, 0);
  assert.equal(back?.name, set.name);
  assert.equal(back?.author, set.author);
  assert.equal(back?.unit, set.unit);
  assert.equal(back?.questions.length, 2);
  assert.equal(back?.questions[0]!.correct_answer, '1/2');
});

test('공유 코드는 압축되어 원본 JSON보다 짧다', async () => {
  const set = sampleSet();
  // 같은 문항을 늘리면 압축 이득이 뚜렷해진다
  set.questions = Array.from({ length: 30 }, (_, i) => ({
    ...set.questions[0]!,
    question_text: `${i}번 문제: ${i * 6}/${i * 12 || 12}을 기약분수로 나타내면?`,
  }));
  const code = await encodeShareCode(set);
  assert.ok(code.length < exportSetJson(set).length, `압축 효과 없음 ${code.length}`);
});

test('공유 코드 앞뒤 공백·줄바꿈이 섞여도 읽는다 (메신저 복사 대비)', async () => {
  const code = await encodeShareCode(sampleSet());
  const messy = `  ${code.slice(0, 20)}\n${code.slice(20)}  `;
  const { set, error } = await decodeShareCode(messy);
  assert.equal(error, undefined);
  assert.equal(set?.questions.length, 2);
});

test('킹시커 코드가 아니면 사람이 읽을 수 있는 오류를 준다', async () => {
  const { set, error } = await decodeShareCode('그냥 아무 텍스트');
  assert.equal(set, null);
  assert.match(error!, /공유 코드/);
});

test('코드가 잘려도 던지지 않고 오류로 알린다', async () => {
  const code = await encodeShareCode(sampleSet());
  const { set, error } = await decodeShareCode(code.slice(0, code.length - 12));
  assert.equal(set, null);
  assert.ok(error);
});

test('깨진 문항은 걸러지고 나머지는 살아남는다', () => {
  const { questions, skipped } = validateSetQuestions([
    null,
    { grade: 99, subject: '수학', unit: 'x', question_text: 'a', correct_answer: 'b' },
    { grade: 5, subject: '수학', unit: '4. 약분과 통분', question_type: 'multiple_choice', question_text: '2+2는?', options: ['4', '5', '6', '7'], correct_answer: '4', difficulty: 2 },
  ]);
  assert.equal(questions.length, 1);
  assert.equal(skipped, 2);
});

test('가져오기도 정합성 계층을 통과한다 — 복수 정답 보기가 제거된다', () => {
  const { set } = importSetJson(
    JSON.stringify({
      v: 1,
      name: '외부 세트',
      questions: [
        {
          grade: 5,
          subject: '수학',
          unit: '4. 약분과 통분',
          question_type: 'multiple_choice',
          question_text: '6/12을 약분하면?',
          options: ['1/2', '3/6', '2/3', '1/3'],
          correct_answer: '1/2',
          difficulty: 2,
        },
      ],
    })
  );
  const opts = set!.questions[0]!.options!;
  assert.ok(!opts.includes('3/6'), `동치 보기가 남음: ${JSON.stringify(opts)}`);
  assert.ok(opts.includes('1/2'));
});

test('기존 "내 문제" 배열 파일도 그대로 가져올 수 있다', () => {
  const { set, error } = importSetJson(
    JSON.stringify([
      {
        grade: 3,
        subject: '수학',
        unit: '3. 나눗셈',
        question_type: 'multiple_choice',
        question_text: '12 ÷ 4는?',
        options: ['3', '4', '2', '6'],
        correct_answer: '3',
        difficulty: 1,
      },
    ])
  );
  assert.equal(error, undefined);
  assert.equal(set?.questions.length, 1);
});

test('내보낸 JSON은 다시 가져올 수 있다', () => {
  const json = exportSetJson(sampleSet());
  const { set, error } = importSetJson(json);
  assert.equal(error, undefined);
  assert.equal(set?.questions.length, 2);
  assert.equal(set?.name, '5학년 약분과 통분 핵심 10제');
});
