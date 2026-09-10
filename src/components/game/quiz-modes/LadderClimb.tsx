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

const COLUMN_COLORS = [
  'from-rose-500 to-rose-800 border-rose-300',
  'from-sky-500 to-sky-800 border-sky-300',
  'from-emerald-500 to-emerald-800 border-emerald-300',
  'from-amber-400 to-amber-700 border-amber-200',
];

const HEADERS = ['🔴', '🔵', '🟢', '🟡'];

export default function LadderClimb({
  options,
  correctAnswer,
  selectedAnswer,
  showResult,
  isCorrect,
  onAnswer,
}: Props) {
  const [climbing, setClimbing] = useState<number | null>(null);

  const handlePick = (i: number) => {
    if (showResult || climbing !== null) return;
    setClimbing(i);
    setTimeout(() => onAnswer(options[i]!), 850);
  };

  return (
    <div className="flex-1 w-full flex flex-col">
      <div className="relative flex-1 w-full grid grid-cols-4 gap-3 px-2 pt-2 pb-1">
        {options.map((option, i) => {
          const color = COLUMN_COLORS[i % COLUMN_COLORS.length]!;
          const isThisCorrect = option === correctAnswer;
          const isThisSelected = option === selectedAnswer;
          const isClimbing = climbing === i;
          const revealColor =
            showResult && isThisCorrect
              ? 'from-green-500 to-green-800 border-green-300'
              : showResult && isThisSelected && !isCorrect
              ? 'from-red-500 to-red-800 border-red-300'
              : color;

          return (
            <motion.button
              key={i}
              onClick={() => handlePick(i)}
              disabled={showResult || climbing !== null}
              className={cn(
                'relative flex flex-col items-center justify-between py-3 rounded-2xl border-4 bg-gradient-to-b cursor-pointer select-none overflow-hidden min-h-[320px]',
                revealColor,
                (showResult || (climbing !== null && !isClimbing)) && 'pointer-events-none'
              )}
              whileHover={!showResult && climbing === null ? { scale: 1.04, y: -6 } : {}}
              whileTap={!showResult && climbing === null ? { scale: 0.96 } : {}}
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: i * 0.08, type: 'spring', stiffness: 200 }}
            >
              {/* 상단 — 깃발 (도착지) */}
              <div className="relative flex flex-col items-center">
                <span className="text-4xl md:text-5xl drop-shadow-lg">🏁</span>
                <span className="mt-1 text-2xl font-extrabold">{HEADERS[i]}</span>
              </div>

              {/* 사다리 — 세로선 + 가로선 */}
              <div className="absolute inset-x-0 top-20 bottom-20 flex justify-center pointer-events-none">
                <div className="relative w-20">
                  <div className="absolute left-2 top-0 bottom-0 w-1 bg-white/30" />
                  <div className="absolute right-2 top-0 bottom-0 w-1 bg-white/30" />
                  {[0, 1, 2, 3, 4].map((k) => (
                    <div
                      key={k}
                      className="absolute left-2 right-2 h-1 bg-white/30"
                      style={{ top: `${10 + k * 20}%` }}
                    />
                  ))}
                </div>
              </div>

              {/* 등산가 */}
              <AnimatePresence>
                {!showResult && (
                  <motion.div
                    key="climber"
                    className="absolute left-1/2 -translate-x-1/2 text-4xl z-10"
                    initial={{ bottom: 40 }}
                    animate={isClimbing ? { bottom: 260 } : { bottom: 40 }}
                    transition={{ duration: 0.8, ease: 'easeInOut' }}
                  >
                    🧗
                  </motion.div>
                )}
              </AnimatePresence>

              {/* 하단 — 보기 답 */}
              <div className="relative w-full px-2 text-center">
                <div className="text-xl md:text-2xl font-extrabold text-white leading-tight drop-shadow-md px-1">
                  {option}
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>
      <div className="text-center text-base text-indigo-300/90 font-semibold mt-2">
        🪜 사다리를 올라가 정답 칸을 골라라!
      </div>
    </div>
  );
}
