'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { seededRandom } from '@/lib/seededRandom';

interface CrownAnimationProps {
  studentName: string;
  onComplete?: () => void;
}

export default function CrownAnimation({ studentName, onComplete }: CrownAnimationProps) {
  const particles = useMemo(() => {
    const colors = ['#fbbf24', '#f59e0b', '#ef4444', '#8b5cf6', '#3b82f6', '#10b981', '#ec4899'];
    return Array.from({ length: 40 }, (_, i) => ({
      id: i,
      angle: (i / 40) * Math.PI * 2,
      distance: 150 + seededRandom(i * 7 + 1) * 250,
      color: colors[i % colors.length]!,
      size: 4 + seededRandom(i * 7 + 2) * 10,
      delay: seededRandom(i * 7 + 3) * 0.6,
      duration: 1 + seededRandom(i * 7 + 4) * 0.5,
    }));
  }, []);

  const sparkles = useMemo(() =>
    Array.from({ length: 15 }, (_, i) => ({
      id: i,
      x: (seededRandom(i * 7 + 5) - 0.5) * 500,
      y: (seededRandom(i * 7 + 6) - 0.5) * 400,
      delay: 0.5 + seededRandom(i * 7 + 7) * 1,
      size: 2 + seededRandom(i * 7 + 8) * 4,
    })),
    []
  );

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Backdrop with radial gradient */}
      <motion.div
        className="absolute inset-0"
        style={{ background: 'radial-gradient(circle at center, rgba(250,204,21,0.08) 0%, rgba(0,0,0,0.85) 70%)' }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      />

      {/* Light rays */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center pointer-events-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.15 }}
        transition={{ delay: 0.3 }}
      >
        {Array.from({ length: 8 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 bg-gradient-to-t from-transparent via-yellow-400 to-transparent"
            style={{
              height: '300px',
              transform: `rotate(${i * 45}deg)`,
              transformOrigin: 'bottom center',
              bottom: '50%',
            }}
            initial={{ scaleY: 0 }}
            animate={{ scaleY: 1 }}
            transition={{ delay: 0.3 + i * 0.05, duration: 0.5 }}
          />
        ))}
      </motion.div>

      <div className="flex flex-col items-center gap-6 relative">
        {/* Crown */}
        <motion.div
          className="relative"
          initial={{ scale: 0, rotate: -180, y: -50 }}
          animate={{ scale: 1, rotate: 0, y: 0 }}
          transition={{ type: 'spring', stiffness: 180, damping: 12, delay: 0.2 }}
        >
          <span
            className="text-[140px] block"
            style={{ filter: 'drop-shadow(0 0 40px rgba(250,204,21,0.5))' }}
          >
            👑
          </span>

          {/* Crown glow ring */}
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            animate={{ rotate: 360 }}
            transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
          >
            <div
              className="w-40 h-40 rounded-full"
              style={{
                background: 'conic-gradient(from 0deg, transparent, rgba(250,204,21,0.3), transparent, rgba(250,204,21,0.3), transparent)',
              }}
            />
          </motion.div>
        </motion.div>

        {/* Title */}
        <motion.h2
          className="text-5xl font-black text-gradient-gold" data-display-font
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          왕을 찾았다!
        </motion.h2>

        {/* Student name */}
        <motion.div
          className="glass-strong rounded-2xl px-8 py-4"
          initial={{ y: 30, opacity: 0, scale: 0.8 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          transition={{ delay: 0.9 }}
          style={{ boxShadow: '0 0 30px rgba(250,204,21,0.15)' }}
        >
          <p className="text-2xl text-white font-bold text-center">
            <span className="text-yellow-400">{studentName}</span> 학생이 왕이었습니다!
          </p>
        </motion.div>

        {/* Continue button */}
        <motion.button
          className="mt-6 px-8 py-3 bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-400 hover:to-amber-400 text-black font-semibold rounded-xl text-lg transition-shadow hover:shadow-lg hover:shadow-yellow-500/30" data-display-font
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 1.5 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onComplete}
        >
          계속하기
        </motion.button>
      </div>

      {/* Explosion particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden flex items-center justify-center">
        {particles.map((p) => (
          <motion.div
            key={p.id}
            className="absolute rounded-full"
            style={{
              width: p.size,
              height: p.size,
              backgroundColor: p.color,
              boxShadow: `0 0 ${p.size}px ${p.color}`,
            }}
            initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
            animate={{
              x: Math.cos(p.angle) * p.distance,
              y: Math.sin(p.angle) * p.distance,
              opacity: 0,
              scale: 0.3,
            }}
            transition={{
              duration: p.duration,
              delay: p.delay + 0.3,
              ease: 'easeOut',
            }}
          />
        ))}

        {/* Delayed sparkles */}
        {sparkles.map((s) => (
          <motion.div
            key={`sparkle-${s.id}`}
            className="absolute rounded-full bg-yellow-300"
            style={{ width: s.size, height: s.size }}
            initial={{ x: s.x, y: s.y, opacity: 0, scale: 0 }}
            animate={{ opacity: [0, 1, 0], scale: [0, 1.5, 0] }}
            transition={{ delay: s.delay, duration: 0.6 }}
          />
        ))}
      </div>
    </motion.div>
  );
}
