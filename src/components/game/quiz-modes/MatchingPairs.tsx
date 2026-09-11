'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface Props {
  options: string[];
  correctAnswer: string;
  selectedAnswer: string | null;
  showResult: boolean;
  isCorrect: boolean;
  onAnswer: (answer: string) => void;
}

const CARD_BACK_COLORS = [
  'from-purple-600 to-indigo-900',
  'from-pink-600 to-rose-900',
  'from-cyan-600 to-blue-900',
  'from-amber-500 to-orange-900',
];

const CARD_FRONT_COLORS = [
  'from-rose-500 to-rose-700',
  'from-sky-500 to-sky-700',
  'from-emerald-500 to-emerald-700',
  'from-amber-400 to-amber-600',
];

export default function MatchingPairs({
  options,
  correctAnswer,
  selectedAnswer,
  showResult,
  isCorrect,
  onAnswer,
}: Props) {
  // 카드가 뒤집혀서 앞면(답)이 보이는지 — 두더지 잡기처럼 스스로 토글
  const [flipped, setFlipped] = useState<boolean[]>(() =>
    options.map((_, i) => i % 2 === 0)
  );

  useEffect(() => {
    // 결과 화면에서는 아래 렌더가 showResult 로 모두 앞면 처리하므로 state 를 건드리지 않는다.
    if (showResult) return;
    const timers: ReturnType<typeof setTimeout>[] = [];
    const scheduleToggle = (i: number, delay: number) => {
      timers.push(
        setTimeout(() => {
          setFlipped((prev) => {
            const next = [...prev];
            next[i] = !next[i];
            return next;
          });
          // 앞면일 때는 짧게(1.0~1.8초), 뒷면일 때는 좀 더 긴 대기(0.9~1.6초)
          scheduleToggle(i, 900 + Math.random() * 900);
        }, delay)
      );
    };
    options.forEach((_, i) =>
      scheduleToggle(i, 300 + i * 400 + Math.random() * 500)
    );
    return () => timers.forEach(clearTimeout);
  }, [options, showResult]);

  const handleClick = (option: string, i: number) => {
    if (showResult) return;
    // 뒤집힌(앞면) 카드만 선택 가능 — 두더지 잡기처럼 타이밍 요소
    if (!flipped[i]) return;
    onAnswer(option);
  };

  return (
    <div className="flex-1 w-full flex flex-col items-center justify-center gap-4">
      <div className="grid grid-cols-2 gap-5 w-full max-w-3xl">
        {options.map((option, i) => {
          const isFlipped = flipped[i] || showResult;
          const isThisCorrect = option === correctAnswer;
          const isThisSelected = option === selectedAnswer;

          return (
            <div key={i} className="relative h-40" style={{ perspective: '1000px' }}>
              <motion.div
                className="relative w-full h-full cursor-pointer select-none"
                style={{ transformStyle: 'preserve-3d' }}
                animate={{ rotateY: isFlipped ? 180 : 0 }}
                transition={{ duration: 0.5, type: 'spring', stiffness: 160, damping: 16 }}
                onClick={() => handleClick(option, i)}
                whileHover={!showResult && isFlipped ? { scale: 1.04, y: -4 } : {}}
                whileTap={!showResult && isFlipped ? { scale: 0.96 } : {}}
              >
                {/* Back */}
                <div
                  className={cn(
                    'absolute inset-0 rounded-2xl border-4 border-white/20 flex items-center justify-center text-7xl font-black text-white/80 shadow-2xl bg-gradient-to-br',
                    CARD_BACK_COLORS[i % CARD_BACK_COLORS.length]
                  )}
                  style={{ backfaceVisibility: 'hidden' }}
                >
                  ?
                </div>
                {/* Front */}
                <div
                  className={cn(
                    'absolute inset-0 rounded-2xl border-4 flex items-center justify-center text-3xl md:text-4xl font-extrabold text-white shadow-2xl px-4 text-center leading-tight bg-gradient-to-br',
                    showResult && isThisCorrect
                      ? 'from-green-400 to-green-700 border-green-200 ring-4 ring-green-300/40'
                      : showResult && isThisSelected && !isCorrect
                      ? 'from-red-500 to-red-800 border-red-200'
                      : `${CARD_FRONT_COLORS[i % CARD_FRONT_COLORS.length]} border-white/30`
                  )}
                  style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
                >
                  {option}
                </div>
                {/* 카드 앞면일 때 반짝이는 힌트 */}
                <AnimatePresence>
                  {!showResult && isFlipped && (
                    <motion.div
                      className="absolute -top-2 -right-2 z-10 w-8 h-8 rounded-full bg-yellow-300 border-2 border-yellow-500 flex items-center justify-center text-lg font-semibold text-yellow-900 shadow-lg"
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      exit={{ scale: 0 }}
                    >
                      !
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </div>
          );
        })}
      </div>
      <div className="text-center text-base text-purple-300/90 font-semibold">
        🃏 카드가 뒤집힐 때 빠르게 눌러 정답을 골라라!
      </div>
    </div>
  );
}
