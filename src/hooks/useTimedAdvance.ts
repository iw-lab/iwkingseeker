'use client';

import { useCallback, useEffect, useRef } from 'react';

/**
 * "잠깐 보여 주고 다음 단계로 넘어가는" 연출을 **한 번은 반드시** 끝내 주는 훅.
 *
 * 왜 필요한가 — 이 프로젝트에서 다섯 번 반복된 사고 유형이다.
 * 크롬은 가려진 탭의 타이머를 최소 1초로, 오래 가려져 있으면 1분에 한 번까지
 * 늦춘다. 교사가 학생 화면(프로젝터 창)을 앞으로 꺼내면 교사 창이 가려지므로,
 * `setTimeout` 하나에만 기댄 단계 전환은 그 자리에서 멈춘다. 교실에서는
 * "화면이 안 넘어간다"로 나타나고, 수업이 멈춘다.
 *
 * 그래서 세 겹으로 막는다.
 *   1) 원래의 setTimeout — 정상 상황에서 제일 정확하다
 *   2) visibility 복귀 — 탭이 다시 보이는 순간 경과 시간을 정산한다
 *   3) 1초 간격 워치독 — 스로틀되어도 결국 발화해 스스로 풀린다
 *
 * 셋 중 무엇이 먼저 오든 `fire` 는 **활성화 한 번에 한 번만** 불린다.
 * (그래도 사람이 누를 수 있는 수동 버튼을 화면에 함께 두는 편이 좋다 —
 *  자동 장치가 다 실패해도 교사가 수업을 이어갈 수 있어야 한다.)
 */
export function useTimedAdvance(active: boolean, delayMs: number, fire: () => void) {
  const firedRef = useRef(false);
  const startRef = useRef(0);
  const fireRef = useRef(fire);
  // 렌더 중 ref를 쓰면 react-hooks/refs 에 걸린다. fireOnce 는 타이머·이벤트에서만
  // 불리므로(= 이펙트가 돈 뒤) 이펙트에서 최신 fire 를 넣어 주면 충분하다.
  useEffect(() => {
    fireRef.current = fire;
  });

  const fireOnce = useCallback(() => {
    if (firedRef.current) return;
    firedRef.current = true;
    fireRef.current();
  }, []);

  useEffect(() => {
    if (!active) {
      firedRef.current = false;
      return;
    }
    firedRef.current = false;
    startRef.current = Date.now();

    const timer = window.setTimeout(fireOnce, delayMs);

    const onVisible = () => {
      if (document.visibilityState !== 'visible') return;
      if (Date.now() - startRef.current >= delayMs) fireOnce();
    };
    document.addEventListener('visibilitychange', onVisible);

    // 워치독 간격은 남은 시간보다 촘촘하게, 그러나 1초보다 잦지 않게.
    const watchdog = window.setInterval(() => {
      if (Date.now() - startRef.current >= delayMs) fireOnce();
    }, Math.max(1000, Math.min(delayMs, 2000)));

    return () => {
      window.clearTimeout(timer);
      window.clearInterval(watchdog);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [active, delayMs, fireOnce]);

  /** 수동 버튼용 — 지금 바로 넘긴다 */
  return fireOnce;
}
