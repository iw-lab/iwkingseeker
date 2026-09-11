const nlen = (s: string) => String(s).replace(/\s/g, '').length;

/**
 * 낱말·표현 짝에서 자동 생성하는 문항의 오답 후보 순서를 정한다.
 *
 * 회전(seed)으로 문항마다 조합을 분산시키되, **정답보다 긴 후보가 풀에 있으면
 * 반드시 앞 3개 안에 하나를 넣는다.** 정답만 유독 긴 보기로 남으면 내용을 몰라도
 * "제일 긴 것"을 찍어서 맞힐 수 있기 때문이다(실측: 그런 문항의 적중률 52%).
 *
 * 호출부는 반환값을 그대로 넘기고 3개 자르기는 기존대로 둔다.
 */
export function orderDistractors(pool: readonly string[], answer: string, seed: number): string[] {
  if (pool.length === 0) return [...pool];
  const n = ((seed % pool.length) + pool.length) % pool.length;
  const rotated = [...pool.slice(n), ...pool.slice(0, n)];
  const answerLen = nlen(answer);
  const idx = rotated.findIndex((x) => nlen(x) > answerLen);
  if (idx > 2) {
    const [longer] = rotated.splice(idx, 1);
    rotated.unshift(longer);
  }
  return rotated;
}
