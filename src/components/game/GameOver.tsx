'use client';

import { useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '@/stores/gameStore';
import { playVictoryFanfare } from '@/lib/sounds';
import { Trophy, RotateCcw, Home, Crown } from 'lucide-react';
import Link from 'next/link';
import TeamEmoji from './TeamEmoji';

export default function GameOver() {
  const {
    teamA,
    teamB,
    targetScore,
    totalQuestionsAsked,
    totalCorrect,
    roundHistory,
    resetGame,
  } = useGameStore();

  const winner: 'team_a' | 'team_b' = teamA.score >= targetScore ? 'team_a' : 'team_b';
  const winnerData = winner === 'team_a' ? teamA : teamB;
  const loserData = winner === 'team_a' ? teamB : teamA;
  const winnerGradient = winner === 'team_a' ? 'from-blue-400 to-cyan-400' : 'from-amber-400 to-yellow-400';
  const winnerGlow = winner === 'team_a' ? 'glow-blue' : 'glow-amber';

  const accuracy = totalQuestionsAsked > 0
    ? Math.round((totalCorrect / totalQuestionsAsked) * 100)
    : 0;

  useEffect(() => {
    playVictoryFanfare();
  }, []);

  const confettiParticles = useMemo(() => {
    const colors = ['#fbbf24', '#ef4444', '#8b5cf6', '#3b82f6', '#10b981', '#f97316', '#ec4899', '#06b6d4'];
    return Array.from({ length: 60 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      delay: Math.random() * 3,
      duration: 2 + Math.random() * 3,
      color: colors[i % colors.length]!,
      size: 4 + Math.random() * 8,
      rotation: Math.random() * 720 - 360,
      drift: (Math.random() - 0.5) * 150,
      shape: i % 3 === 0 ? 'circle' : 'rect',
    }));
  }, []);

  return (
    <div className="relative flex flex-col items-center gap-8 w-full overflow-hidden min-h-screen justify-center">
      {/* Confetti */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {confettiParticles.map((p) => (
          <motion.div
            key={p.id}
            className={p.shape === 'circle' ? 'absolute rounded-full' : 'absolute rounded-sm'}
            style={{
              left: `${p.x}%`,
              top: '-20px',
              width: p.size,
              height: p.shape === 'circle' ? p.size : p.size * 1.5,
              backgroundColor: p.color,
              boxShadow: `0 0 ${p.size / 2}px ${p.color}40`,
            }}
            animate={{
              y: ['0vh', '110vh'],
              rotate: [0, p.rotation],
              x: [0, p.drift],
            }}
            transition={{
              duration: p.duration,
              delay: p.delay,
              repeat: Infinity,
              ease: 'linear',
            }}
          />
        ))}
      </div>

      {/* Ambient glow */}
      <div className="fixed inset-0 pointer-events-none">
        <div
          className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full"
          style={{
            background: winner === 'team_a'
              ? 'radial-gradient(circle, rgba(59,130,246,0.1), transparent 70%)'
              : 'radial-gradient(circle, rgba(245,158,11,0.1), transparent 70%)',
          }}
        />
      </div>

      {/* Trophy */}
      <motion.div
        initial={{ scale: 0, rotate: -30 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 200, delay: 0.3 }}
        className="relative"
      >
        <Trophy
          className="w-28 h-28 text-yellow-400"
          style={{ filter: 'drop-shadow(0 0 30px rgba(250,204,21,0.4))' }}
        />
        <motion.div
          className="absolute -inset-4 rounded-full"
          animate={{ boxShadow: ['0 0 20px rgba(250,204,21,0.2)', '0 0 40px rgba(250,204,21,0.4)', '0 0 20px rgba(250,204,21,0.2)'] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      </motion.div>

      {/* Winner announcement */}
      <motion.div
        className="text-center"
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.6 }}
      >
        <motion.div
          className="flex justify-center mb-4"
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <TeamEmoji team={winner} size={96} />
        </motion.div>
        <h1
          className={`text-6xl md:text-7xl font-black bg-gradient-to-r ${winnerGradient} bg-clip-text text-transparent`}
          data-display-font
          style={{ WebkitTextFillColor: 'transparent' }}
        >
          {winnerData.name} 승리!
        </h1>
      </motion.div>

      {/* Stats panel */}
      <motion.div
        className={`glass-strong rounded-2xl p-8 w-full max-w-2xl ${winnerGlow}`}
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.9 }}
      >
        {/* Score comparison */}
        <div className="flex items-center justify-center gap-6 mb-6">
          <div className="text-center">
            <p className="text-sm text-gray-400">{teamA.name}</p>
            <motion.p
              className="text-4xl font-extrabold text-blue-400 score-badge"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 1.0, type: 'spring' }}
            >
              {teamA.score}
            </motion.p>
          </div>
          <div className="flex flex-col items-center">
            <Crown className="w-5 h-5 text-yellow-400/50" />
            <span className="text-lg text-gray-600 font-bold">:</span>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-400">{teamB.name}</p>
            <motion.p
              className="text-4xl font-extrabold text-amber-400 score-badge"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 1.1, type: 'spring' }}
            >
              {teamB.score}
            </motion.p>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent mb-5" />

        {/* Stats grid */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: '총 라운드', value: roundHistory.length, color: 'text-purple-400' },
            { label: '총 문제 수', value: totalQuestionsAsked, color: 'text-white' },
            { label: '정답률', value: `${accuracy}%`, color: 'text-green-400' },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              className="text-center glass rounded-xl py-3"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 1.2 + i * 0.1 }}
            >
              <p className="text-[11px] text-gray-500 uppercase tracking-wider">{stat.label}</p>
              <p className={`text-xl font-semibold ${stat.color}`}>{stat.value}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Action buttons */}
      <motion.div
        className="flex gap-4"
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 1.5 }}
      >
        <motion.button
          className="flex items-center gap-2 px-7 py-3.5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white rounded-xl font-semibold transition-shadow hover:shadow-lg hover:shadow-purple-500/20"
          onClick={resetGame}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <RotateCcw className="w-5 h-5" />
          새 게임
        </motion.button>
        <Link href="/dashboard">
          <motion.div
            className="flex items-center gap-2 px-7 py-3.5 glass hover:bg-white/10 text-white rounded-xl font-semibold cursor-pointer transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Home className="w-5 h-5" />
            대시보드
          </motion.div>
        </Link>
      </motion.div>
    </div>
  );
}
