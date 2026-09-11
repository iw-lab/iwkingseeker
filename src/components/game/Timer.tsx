'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { playCountdownTick, playTimerWarning } from '@/lib/sounds';

interface TimerProps {
  seconds: number;
  isActive: boolean;
  onTimeUp: () => void;
  size?: number;
}

export default function Timer({ seconds, isActive, onTimeUp, size = 80 }: TimerProps) {
  const [timeLeft, setTimeLeft] = useState(seconds);
  const firedRef = useRef(false);
  const radius = (size - 10) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = timeLeft / seconds;
  const strokeDashoffset = circumference * (1 - progress);

  // 「prop이 바뀌면 state를 맞춘다」는 렌더 중에 조정한다.
  // 이펙트에서 setState 하면 리셋이 한 프레임 늦어 이전 시간이 한 번 그려지고,
  // react-hooks/set-state-in-effect 에도 걸린다.
  const [prev, setPrev] = useState({ seconds, isActive });
  if (prev.seconds !== seconds || prev.isActive !== isActive) {
    const restarted = prev.seconds !== seconds || (isActive && !prev.isActive);
    setPrev({ seconds, isActive });
    if (restarted) setTimeLeft(seconds);
  }

  // 카운트다운
  useEffect(() => {
    if (!isActive) return;

    if (timeLeft <= 0) {
      // 한 번 활성화에 onTimeUp 은 한 번만. (ref 쓰기는 이펙트 안이라 허용된다)
      if (!firedRef.current) {
        firedRef.current = true;
        onTimeUp();
      }
      return;
    }

    firedRef.current = false;
    const interval = setInterval(() => {
      setTimeLeft((p) => {
        const next = p - 1;
        if (next <= 5 && next > 0) playCountdownTick();
        if (next === 3) playTimerWarning();
        return next;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isActive, timeLeft, onTimeUp]);

  const isWarning = timeLeft <= 5;
  const isCritical = timeLeft <= 3;

  const color = timeLeft > seconds * 0.5
    ? '#22c55e'
    : timeLeft > seconds * 0.25
      ? '#eab308'
      : '#ef4444';

  const glowColor = timeLeft > seconds * 0.5
    ? 'rgba(34,197,94,0.3)'
    : timeLeft > seconds * 0.25
      ? 'rgba(234,179,8,0.3)'
      : 'rgba(239,68,68,0.5)';

  return (
    <div
      className="relative inline-flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      <motion.div
        className="absolute inset-0 rounded-full"
        animate={isWarning ? {
          boxShadow: [`0 0 10px ${glowColor}`, `0 0 25px ${glowColor}`, `0 0 10px ${glowColor}`],
        } : { boxShadow: `0 0 8px ${glowColor}` }}
        transition={isWarning ? { duration: 0.5, repeat: Infinity } : { duration: 1 }}
      />
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="5" />
        <motion.circle
          cx={size / 2} cy={size / 2} r={radius} fill="none"
          stroke={color} strokeWidth="5" strokeLinecap="round"
          strokeDasharray={circumference}
          animate={{ strokeDashoffset }}
          transition={{ duration: 0.5, ease: 'linear' }}
          style={{ filter: `drop-shadow(0 0 6px ${glowColor})` }}
        />
      </svg>
      <motion.span
        className="absolute font-semibold text-white"
        style={{ fontSize: size * 0.3, textShadow: isWarning ? `0 0 10px ${glowColor}` : undefined }}
        animate={isCritical ? { scale: [1, 1.3, 1] } : isWarning ? { scale: [1, 1.15, 1] } : {}}
        transition={{ duration: isCritical ? 0.3 : 0.5 }}
      >
        {timeLeft}
      </motion.span>
      {isCritical && (
        <motion.div
          className="absolute inset-0 rounded-full border-2 border-red-500/50"
          animate={{ scale: [1, 1.3], opacity: [0.8, 0] }}
          transition={{ duration: 0.8, repeat: Infinity }}
        />
      )}
    </div>
  );
}
