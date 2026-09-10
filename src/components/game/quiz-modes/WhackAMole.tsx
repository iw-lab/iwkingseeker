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

const MOLE_COLORS = [
  'from-rose-500 to-rose-800 border-rose-300',
  'from-sky-500 to-sky-800 border-sky-300',
  'from-emerald-500 to-emerald-800 border-emerald-300',
  'from-amber-400 to-amber-700 border-amber-200',
];

export default function WhackAMole({
  options,
  correctAnswer,
  selectedAnswer,
  showResult,
  isCorrect,
  onAnswer,
}: Props) {
  const [ups, setUps] = useState<boolean[]>(() => options.map((_, i) => i % 2 === 0));

  useEffect(() => {
    if (showResult) {
      setUps(options.map(() => true));
      return;
    }
    const intervals: ReturnType<typeof setTimeout>[] = [];
    const scheduleToggle = (i: number, delay: number) => {
      intervals.push(
        setTimeout(() => {
          setUps((prev) => {
            const next = [...prev];
            next[i] = !next[i];
            return next;
          });
          scheduleToggle(i, 1200 + Math.random() * 1600);
        }, delay)
      );
    };
    options.forEach((_, i) => scheduleToggle(i, 300 + i * 450 + Math.random() * 600));
    return () => intervals.forEach(clearTimeout);
  }, [options, showResult]);

  return (
    <div className="flex-1 w-full flex flex-col gap-4 justify-end pb-4">
      <div className="grid grid-cols-2 gap-6 w-full px-4">
        {options.map((option, i) => {
          const isUp = ups[i] ?? false;
          const isThisCorrect = option === correctAnswer;
          const isThisSelected = option === selectedAnswer;
          const colorClass =
            showResult && isThisCorrect
              ? 'from-green-400 to-green-700 border-green-200'
              : showResult && isThisSelected && !isCorrect
              ? 'from-red-500 to-red-800 border-red-200'
              : MOLE_COLORS[i] ?? MOLE_COLORS[0];

          return (
            <div
              key={i}
              className="relative h-44 flex items-end justify-center select-none"
            >
              {/* Grass rim */}
              <div className="absolute bottom-0 w-full h-14 rounded-[50%] bg-gradient-to-b from-green-700 via-green-900 to-stone-900 border-t-4 border-green-500/60" />
              {/* Hole */}
              <div className="absolute bottom-2 w-44 h-10 rounded-[50%] bg-gradient-to-b from-stone-900 to-black shadow-inner" />

              <AnimatePresence>
                {isUp && (
                  <motion.button
                    key={`mole-${i}-${option}`}
                    onClick={() => !showResult && onAnswer(option)}
                    disabled={showResult}
                    className={cn(
                      'absolute bottom-4 w-36 h-32 rounded-[48%_48%_42%_42%] border-4 bg-gradient-to-b text-white font-semibold shadow-2xl flex flex-col items-center justify-center text-xl px-3 text-center leading-tight cursor-pointer',
                      colorClass,
                      showResult && 'pointer-events-none'
                    )}
                    initial={{ y: 80, opacity: 0, scale: 0.9 }}
                    animate={{ y: 0, opacity: 1, scale: 1 }}
                    exit={{ y: 80, opacity: 0, scale: 0.9 }}
                    transition={{ type: 'spring', stiffness: 260, damping: 18 }}
                    whileHover={!showResult ? { scale: 1.06, y: -4 } : {}}
                    whileTap={!showResult ? { scale: 0.94, y: 4 } : {}}
                  >
                    <div className="flex gap-2 mb-1">
                      <span className="w-2 h-2 rounded-full bg-black/80" />
                      <span className="w-2 h-2 rounded-full bg-black/80" />
                    </div>
                    <span className="px-1">{option}</span>
                  </motion.button>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
      <div className="text-center text-base text-green-300/90 font-semibold">
        🔨 정답 두더지를 때려라!
      </div>
    </div>
  );
}
