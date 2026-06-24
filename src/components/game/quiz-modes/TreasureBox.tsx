'use client';

import { useState } from 'react';
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

const CHEST_COLORS = [
  'from-amber-600 to-amber-900 border-amber-400',
  'from-rose-600 to-rose-900 border-rose-400',
  'from-indigo-600 to-indigo-900 border-indigo-400',
  'from-emerald-600 to-emerald-900 border-emerald-400',
];

export default function TreasureBox({
  options,
  correctAnswer,
  selectedAnswer,
  showResult,
  isCorrect,
  onAnswer,
}: Props) {
  const [opened, setOpened] = useState<Record<number, boolean>>({});

  const handleOpen = (option: string, i: number) => {
    if (showResult) return;
    setOpened((p) => ({ ...p, [i]: true }));
    setTimeout(() => onAnswer(option), 350);
  };

  return (
    <div className="flex-1 w-full flex flex-col items-center justify-center gap-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-5 w-full max-w-5xl px-2">
        {options.map((option, i) => {
          const color = CHEST_COLORS[i % CHEST_COLORS.length]!;
          const isThisCorrect = option === correctAnswer;
          const isThisSelected = option === selectedAnswer;
          const isOpen = opened[i] || showResult;
          const hue =
            showResult && isThisCorrect
              ? 'from-green-500 to-green-800 border-green-300'
              : showResult && isThisSelected && !isCorrect
              ? 'from-red-600 to-red-900 border-red-300'
              : color;

          return (
            <motion.button
              key={i}
              onClick={() => handleOpen(option, i)}
              disabled={showResult}
              className={cn(
                'relative aspect-square rounded-3xl border-4 bg-gradient-to-b shadow-2xl overflow-hidden cursor-pointer select-none',
                hue,
                showResult && 'pointer-events-none'
              )}
              whileHover={!showResult && !isOpen ? { scale: 1.05, y: -4 } : {}}
              whileTap={!showResult ? { scale: 0.95 } : {}}
              initial={{ y: 30, opacity: 0, rotate: i % 2 === 0 ? -4 : 4 }}
              animate={{ y: 0, opacity: 1, rotate: 0 }}
              transition={{ delay: i * 0.1, type: 'spring', stiffness: 200 }}
            >
              {/* 상자 본체 장식 */}
              <div className="absolute top-0 left-0 right-0 h-1/3 bg-black/20 border-b-4 border-black/30" />
              <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-yellow-500 border-4 border-yellow-700 shadow-inner" />

              {/* 닫혔을 때 — 큰 ? */}
              <AnimatePresence>
                {!isOpen && (
                  <motion.div
                    key="closed"
                    className="absolute inset-0 flex flex-col items-center justify-end pb-4"
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <span className="text-6xl md:text-7xl font-black text-white/80 drop-shadow-lg">?</span>
                    <span className="mt-1 text-xs md:text-sm text-white/60 font-bold">상자 {i + 1}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* 열렸을 때 — 보기 내용 */}
              <AnimatePresence>
                {isOpen && (
                  <motion.div
                    key="open"
                    className="absolute inset-0 flex flex-col items-center justify-center p-3 text-center"
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ type: 'spring', stiffness: 260, damping: 18 }}
                  >
                    <span className="text-3xl md:text-4xl mb-1">
                      {showResult && isThisCorrect ? '🏆' : showResult && isThisSelected && !isCorrect ? '💥' : '✨'}
                    </span>
                    <span className="text-xl md:text-2xl font-black text-white leading-tight px-1 drop-shadow-md">
                      {option}
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          );
        })}
      </div>
      <div className="text-center text-base text-amber-300/90 font-bold">
        🗝️ 보물 상자 하나를 열어라! 정답이 들어있는 상자는?
      </div>
    </div>
  );
}
