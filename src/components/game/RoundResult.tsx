'use client';

import { useEffect } from 'react';
import { useTimedAdvance } from '@/hooks/useTimedAdvance';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/stores/gameStore';
import CrownAnimation from './CrownAnimation';
import { playKingFoundSound, playWrongSound } from '@/lib/sounds';
import { pickQuestion } from '@/lib/questionPicker';
import { ShieldX, ArrowRight, ArrowRightLeft } from 'lucide-react';
import TeamEmoji from './TeamEmoji';

export default function RoundResult() {
  const {
    lastGuessResult,
    lastGuessedStudent,
    startNewRound,
    setPhase,
    setCurrentQuestion,
    questionPool,
    usedQuestionIds,
    currentAttacker,
    teamA,
    teamB,
    phase,
  } = useGameStore();

  const nextAttackerName = currentAttacker === 'team_a' ? teamA.name : teamB.name;
  const nextAttackerColor = currentAttacker === 'team_a' ? 'text-blue-400' : 'text-amber-400';

  useEffect(() => {
    if (lastGuessResult === 'found') {
      playKingFoundSound();
    } else if (lastGuessResult === 'not_found') {
      playWrongSound();
    }
  }, [lastGuessResult]);

  const handleNext = () => {
    // store guessKing에서 이미 새 문제 로드됨 — phase만 전환
    if (!useGameStore.getState().currentQuestion) {
      const next = pickQuestion(questionPool, usedQuestionIds);
      if (next) setCurrentQuestion(next);
    }
    setPhase('QUIZ');
  };

  // 왕 지목 오답 시 3.5초 후 자동 진행.
  // 가려진 탭에서 setTimeout 이 늦어도 반드시 넘어가도록 훅이 세 겹으로 막는다.
  useTimedAdvance(
    lastGuessResult === 'not_found' && phase === 'ROUND_RESULT',
    3500,
    handleNext
  );

  if (lastGuessResult === 'found' && phase !== 'GAME_OVER') {
    return (
      <AnimatePresence>
        <CrownAnimation
          studentName={lastGuessedStudent ?? ''}
          onComplete={() => startNewRound()}
        />
      </AnimatePresence>
    );
  }

  return (
    <motion.div
      className="flex flex-col items-center gap-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {/* Not found animation */}
      <motion.div
        className="relative"
        initial={{ scale: 0, rotate: -15 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 200 }}
      >
        <div className="p-6 rounded-full glass-strong glow-red">
          <ShieldX className="w-16 h-16 text-red-400" />
        </div>

        {/* Shake effect ring */}
        <motion.div
          className="absolute inset-0 rounded-full border-2 border-red-500/30"
          animate={{ scale: [1, 1.2], opacity: [0.6, 0] }}
          transition={{ duration: 1, repeat: 2 }}
        />
      </motion.div>

      <h2
        className="text-3xl font-extrabold text-gray-300" data-display-font
      >
        왕이 아닙니다!
      </h2>

      <motion.div
        className="glass rounded-xl px-6 py-3"
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <p className="text-lg text-gray-400">
          <span className="text-white font-semibold">{lastGuessedStudent}</span> 학생은 왕이 아닙니다.
        </p>
      </motion.div>

      {/* 공수 교대 안내 */}
      <motion.div
        className="flex items-center gap-3 glass-strong rounded-2xl px-6 py-3"
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        <ArrowRightLeft className="w-6 h-6 text-purple-400" />
        <span className="text-gray-400">공격권이</span>
        <TeamEmoji team={currentAttacker} size={36} />
        <span className={`text-2xl font-extrabold ${nextAttackerColor}`}>{nextAttackerName}</span>
        <span className="text-gray-400">에게!</span>
      </motion.div>

      <motion.button
        className="flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white rounded-2xl font-semibold text-lg transition-shadow hover:shadow-lg hover:shadow-purple-500/20" data-display-font
        onClick={handleNext}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        다음 문제로
        <ArrowRight className="w-5 h-5" />
      </motion.button>

      <motion.p
        className="text-xs text-gray-500"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
      >
        (4초 후 자동 진행)
      </motion.p>
    </motion.div>
  );
}
