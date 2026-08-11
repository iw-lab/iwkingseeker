'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '@/stores/gameStore';
import StudentCard from './StudentCard';
import { playButtonClick, playKingSelectSuspense } from '@/lib/sounds';
import { Target, Crosshair, Heart } from 'lucide-react';

export default function KingGuess() {
  const {
    currentAttacker,
    teamA,
    teamB,
    revealedA,
    revealedB,
    kingSelectorA,
    kingSelectorB,
    guessKing,
  } = useGameStore();
  const [selected, setSelected] = useState<string | null>(null);
  const [isSuspense, setIsSuspense] = useState(false);
  const suspenseStartRef = useRef<number | null>(null);

  /**
   * 두근두근 연출이 끝나면 결과로 넘어간다 — 그런데 그 진행을 setTimeout에만
   * 맡기면 안 된다. 크롬은 가려진 탭의 타이머를 최소 1초로, 5분 뒤에는 1분에
   * 한 번까지 늦춘다. 교사가 학생 화면(프로젝터 창)을 앞으로 꺼내 교사 창이
   * 가려지면 왕 지목이 그대로 멈춘다(실측: 12초가 지나도 진행 안 됨).
   *
   * 그래서 세 겹으로 막는다.
   *  1) 원래의 setTimeout (정상 상황)
   *  2) visibility 복귀 시 즉시 정산
   *  3) 1초 간격 워치독 — 스로틀되더라도 결국 발화해 스스로 풀린다
   * 여기에 더해 화면에는 "결과 보기" 버튼을 띄워 교사가 언제든 넘길 수 있게 한다.
   */
  const resolveGuess = useCallback(() => {
    if (!selected) return;
    if (useGameStore.getState().phase !== 'GUESS_KING') return;
    guessKing(selected);
  }, [selected, guessKing]);

  useEffect(() => {
    if (!isSuspense || !selected) return;
    const onVisible = () => {
      if (document.visibilityState === 'visible') resolveGuess();
    };
    document.addEventListener('visibilitychange', onVisible);
    const watchdog = window.setInterval(() => {
      const started = suspenseStartRef.current;
      if (started && Date.now() - started >= 2400) resolveGuess();
    }, 1000);
    return () => {
      document.removeEventListener('visibilitychange', onVisible);
      window.clearInterval(watchdog);
    };
  }, [isSuspense, selected, resolveGuess]);

  const targetTeam = currentAttacker === 'team_a' ? 'team_b' : 'team_a';
  const targetTeamData = targetTeam === 'team_a' ? teamA : teamB;
  const revealed = targetTeam === 'team_a' ? revealedA : revealedB;
  const kingSelector = targetTeam === 'team_a' ? kingSelectorA : kingSelectorB;
  const attackerName = currentAttacker === 'team_a' ? teamA.name : teamB.name;
  const attackerColor = currentAttacker === 'team_a' ? 'text-blue-400' : 'text-amber-400';

  const handleSelect = (student: string) => {
    if (isSuspense) return;
    playButtonClick();
    setSelected(student);
  };

  const handleConfirm = () => {
    if (!selected || isSuspense) return;
    suspenseStartRef.current = Date.now();
    setIsSuspense(true);
    playKingSelectSuspense();
    setTimeout(() => playKingSelectSuspense(), 1100);
    setTimeout(() => {
      guessKing(selected);
    }, 2400);
  };

  const unrevealed = targetTeamData.students.filter((s) => !revealed.includes(s));

  return (
    <div className="flex flex-col items-center gap-6 w-full w-full">
      {/* Header */}
      <motion.div
        className="flex items-center gap-3"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
      >
        <motion.div
          animate={{ rotate: [0, 360] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
        >
          <Crosshair className="w-8 h-8 text-yellow-400" />
        </motion.div>
        <h2
          className="text-4xl font-black text-white"
          style={{ fontFamily: "var(--font-heading), 'Black Han Sans', sans-serif" }}
        >
          정답! 상대팀의 왕을 지목하세요!
        </h2>
      </motion.div>

      <motion.p
        className="text-gray-400"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        <span className={attackerColor}>{attackerName}</span>
        , {targetTeamData.name}의 왕은 누구일까요?
        {unrevealed.length < targetTeamData.students.length && (
          <span className="ml-2 text-gray-500 text-sm">
            (남은 후보: {unrevealed.length}명)
          </span>
        )}
      </motion.p>

      {/* 왕을 뽑은 사람 힌트 */}
      {kingSelector && (
        <motion.div
          className="flex items-center gap-2 glass rounded-xl px-5 py-2.5"
          style={{ boxShadow: '0 0 15px rgba(168,85,247,0.15)' }}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, type: 'spring' }}
        >
          <span className="text-2xl">🕵️</span>
          <span className="text-purple-300 font-bold text-lg">
            <span className="text-white">{kingSelector}</span> 학생이 왕을 뽑았습니다
          </span>
        </motion.div>
      )}

      {/* Student grid */}
      <div className="flex flex-wrap justify-center gap-3">
        {targetTeamData.students.map((student, i) => {
          const isRevealed = revealed.includes(student);
          const isTarget = isSuspense && selected === student;
          const isDimmed = isSuspense && selected !== student;
          return (
            <motion.div
              key={student}
              initial={{ scale: 0, opacity: 0 }}
              animate={
                isTarget
                  ? {
                      scale: [1, 1.08, 1, 1.1, 1, 1.12, 1, 1.15, 1.2],
                      x: [0, -2, 2, -3, 3, -3, 3, -4, 0],
                      rotate: [0, -1, 1, -1.5, 1.5, -2, 2, -2, 0],
                      opacity: 1,
                    }
                  : isDimmed
                    ? { scale: 0.92, opacity: 0.35 }
                    : { scale: 1, opacity: 1 }
              }
              transition={
                isTarget
                  ? { duration: 2.2, ease: 'easeInOut', times: [0, 0.15, 0.25, 0.4, 0.5, 0.65, 0.75, 0.9, 1] }
                  : isDimmed
                    ? { duration: 0.4 }
                    : { delay: 0.15 + i * 0.04 }
              }
              style={
                isTarget
                  ? { filter: 'drop-shadow(0 0 20px rgba(250,204,21,0.7))' }
                  : undefined
              }
            >
              <StudentCard
                name={student}
                teamColor={targetTeam === 'team_a' ? 'blue' : 'amber'}
                size="lg"
                isRevealed={isRevealed}
                isSelected={selected === student}
                isDisabled={isRevealed || isSuspense}
                onClick={() => !isRevealed && handleSelect(student)}
              />
            </motion.div>
          );
        })}
      </div>

      {/* 두근두근 서스펜스 오버레이 — CSS 애니메이션으로 백그라운드 탭에서도 표시 */}
      {isSuspense && (
        <div
          className="flex items-center gap-3 px-6 py-3 rounded-2xl bg-red-950/40 border border-red-500/40 suspense-fadein"
          style={{ boxShadow: '0 0 30px rgba(239,68,68,0.3)' }}
        >
          <Heart className="w-7 h-7 text-red-400 fill-red-400 heartbeat-pulse" />
          <span
            className="text-2xl font-black text-red-200 heartbeat-text"
            style={{ fontFamily: "var(--font-heading), 'Black Han Sans', sans-serif" }}
          >
            두근... 두근...
          </span>
          <Heart
            className="w-7 h-7 text-red-400 fill-red-400 heartbeat-pulse"
            style={{ animationDelay: '0.1s' }}
          />
        </div>
      )}

      {/* Confirm button */}
      <motion.button
        className="flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white rounded-2xl font-black text-xl disabled:opacity-40 disabled:cursor-not-allowed transition-shadow hover:shadow-lg hover:shadow-red-500/20"
        style={{ fontFamily: "var(--font-heading), 'Black Han Sans', sans-serif" }}
        onClick={handleConfirm}
        disabled={!selected || isSuspense}
        whileHover={!isSuspense ? { scale: 1.05 } : {}}
        whileTap={!isSuspense ? { scale: 0.95 } : {}}
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <Target className="w-6 h-6" />
        {isSuspense ? '결과 공개 중...' : '이 학생이 왕이다!'}
      </motion.button>

      {/* 연출이 멈춰도 수업이 멈추지 않도록 하는 수동 탈출구.
          (WrongAnswer 의 "다음 문제 →" 와 같은 안전망) */}
      {isSuspense && (
        <button
          onClick={resolveGuess}
          className="px-6 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-gray-200 text-base font-bold transition-colors"
        >
          결과 바로 보기 →
        </button>
      )}
    </div>
  );
}
