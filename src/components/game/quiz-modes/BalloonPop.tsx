'use client';

import { useEffect, useRef, useState } from 'react';
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

const BALLOON_COLORS = [
  'from-rose-400 to-rose-700 border-rose-200',
  'from-sky-400 to-sky-700 border-sky-200',
  'from-emerald-400 to-emerald-700 border-emerald-200',
  'from-amber-300 to-amber-600 border-amber-100',
];

interface BalloonState {
  x: number; // 0~100 (%)
  driftSpeed: number; // 수평 흔들림 속도
  vx: number; // 수평 drift 방향
  floatOffset: number; // 수직 흔들림 시작 위상
}

export default function BalloonPop({
  options,
  correctAnswer,
  selectedAnswer,
  showResult,
  isCorrect,
  onAnswer,
}: Props) {
  const [states, setStates] = useState<BalloonState[]>(() =>
    options.map((_, i) => ({
      x: 15 + (i * 70) / Math.max(1, options.length - 1),
      driftSpeed: 0.15 + Math.random() * 0.2,
      vx: Math.random() > 0.5 ? 1 : -1,
      floatOffset: Math.random() * Math.PI * 2,
    }))
  );
  const [popped, setPopped] = useState<Record<string, boolean>>({});
  const rafRef = useRef<number | null>(null);

  // 풍선이 좌우로 떠다니는 애니메이션
  useEffect(() => {
    if (showResult) return;
    let last = performance.now();
    const tick = (now: number) => {
      const dt = (now - last) / 1000;
      last = now;
      setStates((prev) =>
        prev.map((s) => {
          let nx = s.x + s.vx * s.driftSpeed * dt * 10;
          let nvx = s.vx;
          if (nx < 10) {
            nx = 10;
            nvx = 1;
          } else if (nx > 90) {
            nx = 90;
            nvx = -1;
          }
          return { ...s, x: nx, vx: nvx };
        })
      );
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [showResult]);

  const handlePop = (option: string) => {
    if (showResult) return;
    setPopped((p) => ({ ...p, [option]: true }));
    setTimeout(() => onAnswer(option), 220);
  };

  return (
    <div className="flex-1 w-full flex flex-col">
      <div className="relative flex-1 w-full overflow-hidden rounded-2xl bg-gradient-to-b from-sky-900/40 via-sky-950/30 to-indigo-950/50 border-2 border-sky-500/20">
        {/* 구름 장식 */}
        <div className="absolute top-4 left-8 text-4xl opacity-40">☁️</div>
        <div className="absolute top-12 right-12 text-3xl opacity-30">☁️</div>
        <div className="absolute top-24 left-1/3 text-5xl opacity-20">☁️</div>

        {options.map((option, i) => {
          const s = states[i]!;
          const colorClass = BALLOON_COLORS[i % BALLOON_COLORS.length]!;
          const isThisCorrect = option === correctAnswer;
          const isThisSelected = option === selectedAnswer;
          const isPopped = popped[option];
          const revealColor =
            showResult && isThisCorrect
              ? 'from-green-400 to-green-700 border-green-200'
              : showResult && isThisSelected && !isCorrect
              ? 'from-red-500 to-red-800 border-red-200'
              : colorClass;

          return (
            <motion.div
              key={i}
              className="absolute"
              style={{ left: `${s.x}%`, top: `${20 + (i % 2) * 35}%`, transform: 'translate(-50%, 0)' }}
              animate={{
                y: [0, -14, 0, 12, 0],
              }}
              transition={{
                repeat: Infinity,
                duration: 3.5 + (i % 3) * 0.6,
                ease: 'easeInOut',
                delay: s.floatOffset,
              }}
            >
              <AnimatePresence>
                {!isPopped && (
                  <motion.button
                    key="balloon"
                    onClick={() => handlePop(option)}
                    disabled={showResult}
                    className={cn(
                      'relative w-32 h-40 md:w-36 md:h-44 rounded-[50%] border-4 bg-gradient-to-b shadow-2xl flex items-center justify-center text-xl md:text-2xl font-black text-white px-3 text-center leading-tight cursor-pointer select-none',
                      revealColor,
                      showResult && 'pointer-events-none'
                    )}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 2.5, opacity: 0, rotate: 20 }}
                    transition={{ type: 'spring', stiffness: 200, damping: 16 }}
                    whileHover={!showResult ? { scale: 1.08 } : {}}
                    whileTap={!showResult ? { scale: 0.92 } : {}}
                  >
                    {/* 풍선 하이라이트 */}
                    <span className="absolute top-3 left-5 w-4 h-6 rounded-full bg-white/40 blur-sm" />
                    <span className="relative z-10 drop-shadow-md">{option}</span>
                    {/* 풍선 꼬리 */}
                    <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 w-1 h-5 bg-white/60" />
                    <span className="absolute -bottom-7 left-1/2 -translate-x-1/2 w-3 h-3 border-2 border-white/60 rounded-sm rotate-45" />
                  </motion.button>
                )}
              </AnimatePresence>
              {/* 터진 후 파편 */}
              {isPopped && (
                <motion.div
                  className="absolute inset-0 flex items-center justify-center text-5xl pointer-events-none"
                  initial={{ opacity: 1, scale: 0.5 }}
                  animate={{ opacity: 0, scale: 2 }}
                  transition={{ duration: 0.4 }}
                >
                  💥
                </motion.div>
              )}
            </motion.div>
          );
        })}
      </div>
      <div className="text-center text-base text-sky-300/90 font-bold mt-3">
        🎈 정답 풍선을 터뜨려라!
      </div>
    </div>
  );
}
