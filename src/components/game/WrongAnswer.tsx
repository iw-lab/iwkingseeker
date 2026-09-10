'use client';

import { useCallback } from 'react';
import { useTimedAdvance } from '@/hooks/useTimedAdvance';
import { motion } from 'framer-motion';
import { useGameStore } from '@/stores/gameStore';
import { ArrowRightLeft, ShieldX } from 'lucide-react';
import TeamEmoji from './TeamEmoji';

export default function WrongAnswer() {
  const { currentAttacker, teamA, teamB, setPhase, lastGuessResult, lastGuessedStudent } = useGameStore();

  const attackerName = currentAttacker === 'team_a' ? teamA.name : teamB.name;
  const attackerColor = currentAttacker === 'team_a' ? 'text-blue-400' : 'text-amber-400';

  const isWrongKing = lastGuessResult === 'not_found';
  const autoDelay = isWrongKing ? 3500 : 2000;

  // 전에는 setTimeout + visibility 두 겹이었다. 탭이 **계속 가려진 채**면
  // 복귀 이벤트가 오지 않아 그대로 멈춘다 — 훅이 워치독 한 겹을 더 얹는다.
  const advance = useCallback(() => setPhase('QUIZ'), [setPhase]);
  useTimedAdvance(true, autoDelay, advance);

  return (
    <div className="flex flex-col items-center justify-center gap-6">
      <motion.div
        animate={{ scale: [0.8, 1], rotate: [-180, 0] }}
        transition={{ type: 'spring', stiffness: 200, damping: 15 }}
      >
        <div
          className="p-6 rounded-full glass-strong"
          style={{ boxShadow: isWrongKing ? '0 0 30px rgba(239,68,68,0.3)' : '0 0 30px rgba(147,51,234,0.3)' }}
        >
          {isWrongKing ? (
            <ShieldX className="w-16 h-16 text-red-400" />
          ) : (
            <ArrowRightLeft className="w-16 h-16 text-purple-400" />
          )}
        </div>
      </motion.div>

      <h2
        className="text-5xl font-black text-white" data-display-font
      >
        {isWrongKing ? '왕이 아닙니다!' : '공수 교대!'}
      </h2>

      {isWrongKing && lastGuessedStudent && (
        <div className="glass rounded-xl px-6 py-3">
          <p className="text-xl text-gray-300">
            <span className="text-white font-semibold">{lastGuessedStudent}</span>
            <span className="text-gray-400"> 학생은 왕이 아닙니다.</span>
          </p>
        </div>
      )}

      <div className="flex items-center gap-4 glass-strong rounded-2xl px-8 py-4">
        <TeamEmoji team={currentAttacker} size={56} />
        <div>
          <p className="text-gray-400 text-lg">다음 공격</p>
          <p className={`text-3xl font-extrabold ${attackerColor}`}>{attackerName}</p>
        </div>
      </div>

      <button
        onClick={() => setPhase('QUIZ')}
        className="mt-2 px-6 py-2 glass rounded-xl text-sm text-gray-300 hover:text-white hover:bg-white/10 transition-colors"
      >
        다음 문제 →
      </button>

      <motion.div
        className="flex gap-1 mt-2"
        animate={{ opacity: [0.3, 1, 0.3] }}
        transition={{ duration: 1, repeat: Infinity }}
      >
        {[0, 1, 2].map((i) => (
          <div key={i} className="w-3 h-3 rounded-full bg-purple-500" />
        ))}
      </motion.div>
    </div>
  );
}
