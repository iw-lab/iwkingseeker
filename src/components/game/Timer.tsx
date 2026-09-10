'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
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
  const prevActiveRef = useRef(isActive);
  const firedRef = useRef(false);
  const radius = (size - 10) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = timeLeft / seconds;
  const strokeDashoffset = circumference * (1 - progress);

  // isActive가 false→true로 바뀌면 타이머 풀 리셋
  useEffect(() => {
    if (isActive && !prevActiveRef.current) {
      setTimeLeft(seconds);
      firedRef.current = false;
    }
    prevActiveRef.current = isActive;
  }, [isActive, seconds]);

  // 컴포넌트 마운트 시에도 리셋
  useEffect(() => {
    setTimeLeft(seconds);
    firedRef.current = false;
  }, [seconds]);

  // 카운트다운
  useEffect(() => {
    if (!isActive || timeLeft <= 0) {
      if (timeLeft <= 0 && isActive && !firedRef.current) {
        firedRef.current = true;
        onTimeUp();
      }
      return;
    }

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        const next = prev - 1;
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
