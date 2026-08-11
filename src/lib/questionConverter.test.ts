import { test } from 'node:test';
import assert from 'node:assert/strict';
import { convertToMultipleChoice } from './questionConverter';
import { valueKey } from './questionSanitizer';

const q = (over: Record<string, unknown> = {}): {
  id: string;
  grade: number;
  subject: string;
  unit: string;
  unit_code: string | null;
  question_type: string;
  question_text: string;
  options: string[] | null;
  correct_answer: string;
  explanation: string | null;
  difficulty: number;
  used_count: number;
  created_at: string;
} => ({
  id: 'q1',
  grade: 5,
  subject: '수학',
  unit: '4. 약분과 통분',
  unit_code: null,
  question_type: 'short_answer',
  question_text: '8/16을 기약분수로 나타내면?',
  options: null,
  correct_answer: '1/2',
  explanation: null,
  difficulty: 2,
  used_count: 0,
  created_at: '',
  ...over,
});

test('변환된 문항에 값이 같은 보기가 둘 이상 오지 않는다', () => {
  // 오답 후보에 정답과 값이 같은 표기(5/10 = 1/2)를 일부러 섞는다
  const pool = [
    q(),
    q({ id: 'q2', question_text: 'a', correct_answer: '5/10' }),
    q({ id: 'q3', question_text: 'b', correct_answer: '2/3' }),
    q({ id: 'q4', question_text: 'c', correct_answer: '3/4' }),
    q({ id: 'q5', question_text: 'd', correct_answer: '1/3' }),
  ];
  for (const converted of convertToMultipleChoice(pool)) {
    if (converted.question_type !== 'multiple_choice' || !converted.options) continue;
    const keys = converted.options.map(valueKey);
    assert.equal(
      new Set(keys).size,
      keys.length,
      `값이 같은 보기가 함께 나옴: ${converted.question_text} ${JSON.stringify(converted.options)}`
    );
    assert.ok(converted.options.includes(converted.correct_answer));
  }
});

test('단위 표기 차이(70cm² vs 70 cm²)도 같은 값으로 걸러진다', () => {
  const pool = [
    q({ question_text: '넓이는?', correct_answer: '70cm²' }),
    q({ id: 'q2', question_text: 'x', correct_answer: '70 cm²' }),
    q({ id: 'q3', question_text: 'y', correct_answer: '20cm²' }),
    q({ id: 'q4', question_text: 'z', correct_answer: '96cm²' }),
    q({ id: 'q5', question_text: 'w', correct_answer: '35cm²' }),
  ];
  const first = convertToMultipleChoice(pool)[0]!;
  const keys = first.options!.map(valueKey);
  assert.equal(new Set(keys).size, keys.length);
});

test('오답 후보를 외부 풀에서 끌어올 수 있다 (작은 세트 구제)', () => {
  const tiny = [q({ question_type: 'short_answer', question_text: '태양계의 중심은?', correct_answer: '태양' })];
  assert.equal(convertToMultipleChoice(tiny).length, 0, '후보가 없으면 변환 실패가 정상');

  const bank = [
    q({ id: 'b1', subject: '과학', unit: '태양계와 별', question_text: 'b1', correct_answer: '지구' }),
    q({ id: 'b2', subject: '과학', unit: '태양계와 별', question_text: 'b2', correct_answer: '금성' }),
    q({ id: 'b3', subject: '과학', unit: '태양계와 별', question_text: 'b3', correct_answer: '화성' }),
  ];
  const tinyScience = [
    q({ subject: '과학', unit: '태양계와 별', question_text: '태양계의 중심은?', correct_answer: '태양' }),
  ];
  const out = convertToMultipleChoice(tinyScience, bank);
  assert.equal(out.length, 1);
  assert.ok(out[0]!.options!.length >= 3);
  assert.ok(out[0]!.options!.includes('태양'));
});

test('이미 객관식인 문항은 보기 내용이 보존된다(순서만 섞임)', () => {
  const mc = q({ question_type: 'multiple_choice', options: ['1/2', '2/3', '3/4', '1/3'], correct_answer: '1/2' });
  const out = convertToMultipleChoice([mc])[0]!;
  assert.deepEqual([...out.options!].sort(), ['1/2', '1/3', '2/3', '3/4']);
});
