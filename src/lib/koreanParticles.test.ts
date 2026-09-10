import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { resolveParticles, hasFinalConsonant } from './koreanParticles';

describe('조사 자동 선택', () => {
  it('한글 받침 유무로 은/는을 고른다', () => {
    assert.equal(resolveParticles('사과은(는) 과일이다'), '사과는 과일이다');
    assert.equal(resolveParticles('수박은(는) 과일이다'), '수박은 과일이다');
  });

  it('을/를, 이/가, 과/와도 고른다', () => {
    assert.equal(resolveParticles('사과을(를) 먹다'), '사과를 먹다');
    assert.equal(resolveParticles('수박을(를) 먹다'), '수박을 먹다');
    assert.equal(resolveParticles('바다이(가) 넓다'), '바다가 넓다');
    assert.equal(resolveParticles('산이(가) 높다'), '산이 높다');
    assert.equal(resolveParticles('사과와(과) 배'), '사과와 배');
    assert.equal(resolveParticles('수박와(과) 배'), '수박과 배');
  });

  it('분수는 "분모분의 분자"로 읽어 분자로 판정한다', () => {
    // 3/5 → "오 분의 삼" → 삼(받침 ㅁ) → 은
    assert.equal(resolveParticles('3/5은(는) 진분수인가요?'), '3/5은 진분수인가요?');
    // 2/9 → "구 분의 이" → 이(받침 없음) → 는
    assert.equal(resolveParticles('2/9은(는) 진분수인가요?'), '2/9는 진분수인가요?');
    // 7/4 → "사 분의 칠" → 칠(받침 ㄹ) → 은
    assert.equal(resolveParticles('7/4은(는) 가분수인가요?'), '7/4은 가분수인가요?');
  });

  it('숫자는 한글 읽기로 판정한다', () => {
    assert.equal(resolveParticles('학생 3은(는)'), '학생 3은');   // 삼
    assert.equal(resolveParticles('학생 4은(는)'), '학생 4는');   // 사
    assert.equal(resolveParticles('학생 6을(를)'), '학생 6을');   // 육
  });

  it('알파벳은 한 글자일 때만 글자 이름으로 판정한다', () => {
    assert.equal(resolveParticles('L을(를) 고르시오'), 'L을 고르시오');   // 엘 → ㄹ 받침
    assert.equal(resolveParticles('A을(를) 고르시오'), 'A를 고르시오');   // 에이 → 받침 없음
  });

  it('영어 낱말은 한글 표기를 만들 수 없으므로 손대지 않는다', () => {
    // apple→애플(ㄹ 받침), potato→포테이토(없음)처럼 철자로는 알 수 없다.
    // 틀린 조사를 넣느니 원문을 그대로 두는 쪽이 안전하다.
    assert.equal(resolveParticles('"apple"은(는)'), '"apple"은(는)');
    assert.equal(resolveParticles('"potato"은(는)'), '"potato"은(는)');
  });

  it('으로/로는 ㄹ 받침 뒤에서 로가 된다', () => {
    assert.equal(resolveParticles('연필으로(로) 쓰다'), '연필로 쓰다');
    assert.equal(resolveParticles('붓으로(로) 쓰다'), '붓으로 쓰다');
    assert.equal(resolveParticles('가위으로(로) 자르다'), '가위로 자르다');
  });

  it('(이)다 · (이)라는 꼴도 해소한다', () => {
    assert.equal(resolveParticles('이것은 전화기(이)야.'), '이것은 전화기야.');
    assert.equal(resolveParticles('이것은 연필(이)야.'), '이것은 연필이야.');
  });

  it('판정할 수 없으면 원문을 그대로 둔다', () => {
    assert.equal(resolveParticles('※은(는) 무엇인가'), '※은(는) 무엇인가');
    assert.equal(hasFinalConsonant('※'), null);
  });

  it('한 문장에 여러 개가 있어도 각각 판정한다', () => {
    assert.equal(
      resolveParticles('사과은(는) 배을(를) 좋아한다'),
      '사과는 배를 좋아한다'
    );
  });

  it('괄호가 없는 문자열은 건드리지 않는다', () => {
    const s = '사과는 과일이다';
    assert.equal(resolveParticles(s), s);
  });
});
