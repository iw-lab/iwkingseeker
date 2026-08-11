'use client';

import { MotionGlobalConfig } from 'framer-motion';

/**
 * 숨은 탭·가려진 창에서 framer-motion 애니메이션이 얼어붙는 것을 막는다.
 *
 * 브라우저는 보이지 않는 탭에서 requestAnimationFrame을 멈춘다. framer-motion은
 * rAF로 값을 보간하므로, 그 상태에서 마운트된 요소는 `initial`(보통 opacity 0)에서
 * 진행이 멈춘 채 남는다. 즉 "안 보이는 상태"가 화면에 고정된다.
 *
 * 실측(2026-08-11): 팀 나누기 화면의 학생 카드가 opacity 0.162에서 4초 뒤에도 그대로였다.
 * 전자칠판용 display 창을 프로젝터에 띄우고 교사가 노트북 탭을 보고 있으면
 * 교실 화면이 비어 보이는, 수업을 멈추는 종류의 버그다.
 * 같은 원인으로 게임 단계 전환·점수 표시·왕 지목이 각각 한 번씩 고장 났었다.
 *
 * 해결: 숨어 있는 동안에는 애니메이션을 건너뛰고 최종 상태로 즉시 그린다.
 * `skipAnimations`는 애니메이션이 "시작될 때" 읽히므로, 컴포넌트가 마운트되기 전
 * (클라이언트 번들 평가 시점)에 값을 정해 두어야 한다 — 그래서 모듈 최상단에서 실행한다.
 */
function syncSkipAnimations() {
  MotionGlobalConfig.skipAnimations = document.visibilityState === 'hidden';
}

if (typeof document !== 'undefined') {
  syncSkipAnimations();
  document.addEventListener('visibilitychange', syncSkipAnimations);
}

export function MotionVisibilityGuard() {
  return null;
}
