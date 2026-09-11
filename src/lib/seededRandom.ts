/**
 * 렌더 중 `Math.random()`을 부르면 두 가지가 깨진다.
 *  - 서버 렌더 결과와 클라이언트 렌더 결과가 달라져 하이드레이션이 어긋난다.
 *  - React Compiler의 purity 규칙(react-hooks/purity)에 걸린다.
 *
 * 색종이·반짝임처럼 "무작위처럼 보이기만 하면 되는" 장식용 값은 인덱스로
 * 결정론적으로 만든다. sin 기반 해시라 분포가 고르고 값은 항상 [0, 1) 이다.
 */
export function seededRandom(seed: number): number {
  const x = Math.sin(seed * 12.9898 + 78.233) * 43758.5453;
  return x - Math.floor(x);
}
