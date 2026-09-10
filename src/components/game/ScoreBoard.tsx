'use client';

import { motion } from 'framer-motion';
import { useGameStore } from '@/stores/gameStore';
import { cn } from '@/lib/utils';
import { Swords } from 'lucide-react';
import TeamEmoji from './TeamEmoji';

export default function ScoreBoard() {
  const { teamA, teamB, currentAttacker, targetScore } = useGameStore();

  return (
    <div className="flex items-center justify-between w-full glass-strong rounded-2xl px-2 py-2 relative overflow-hidden">
      {/* Animated border glow */}
      <motion.div
        className="absolute inset-0 rounded-2xl pointer-events-none"
        animate={{
          boxShadow: [
            '0 0 10px rgba(147,51,234,0.1), inset 0 0 10px rgba(147,51,234,0.05)',
            '0 0 15px rgba(147,51,234,0.15), inset 0 0 15px rgba(147,51,234,0.08)',
            '0 0 10px rgba(147,51,234,0.1), inset 0 0 10px rgba(147,51,234,0.05)',
          ],
        }}
        transition={{ duration: 3, repeat: Infinity }}
      />

      <TeamScore
        name={teamA.name}
        score={teamA.score}
        team="team_a"
        isActive={currentAttacker === 'team_a'}
        colorClass="text-blue-400"
        glowClass="glow-blue"
        glassBg="glass-blue"
        targetScore={targetScore}
      />

      <div className="flex flex-col items-center mx-4 relative">
        <motion.div
          className="p-2 rounded-full bg-white/5"
          animate={{ rotate: [0, 360] }}
          transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
        >
          <Swords className="w-5 h-5 text-gray-500" />
        </motion.div>
        <span className="text-[10px] text-gray-600 mt-1">목표 {targetScore}점</span>
      </div>

      <TeamScore
        name={teamB.name}
        score={teamB.score}
        team="team_b"
        isActive={currentAttacker === 'team_b'}
        colorClass="text-amber-400"
        glowClass="glow-amber"
        glassBg="glass-amber"
        targetScore={targetScore}
      />
    </div>
  );
}

function TeamScore({
  name,
  score,
  team,
  isActive,
  colorClass,
  glowClass,
  glassBg,
  targetScore,
}: {
  name: string;
  score: number;
  team: 'team_a' | 'team_b';
  isActive: boolean;
  colorClass: string;
  glowClass: string;
  glassBg: string;
  targetScore: number;
}) {
  return (
    <motion.div
      className={cn(
        'flex-1 relative flex items-center gap-3 px-4 py-3 rounded-xl transition-all overflow-hidden',
        isActive ? glassBg : 'bg-white/[0.02]',
        isActive && glowClass,
      )}
      animate={isActive ? { scale: [1, 1.01, 1] } : { scale: 1 }}
      transition={{ repeat: isActive ? Infinity : 0, duration: 2 }}
    >
      {/* Active indicator shimmer */}
      {isActive && (
        <motion.div
          className="absolute inset-0 pointer-events-none shimmer"
          style={{ background: 'transparent' }}
        />
      )}

      <motion.div
        className="relative z-10 flex items-center justify-center"
        animate={isActive ? { scale: [1, 1.1, 1] } : {}}
        transition={{ repeat: isActive ? Infinity : 0, duration: 1.5 }}
      >
        <TeamEmoji team={team} size={40} />
      </motion.div>

      <div className="flex flex-col relative z-10">
        <span className={cn('text-xl font-bold', colorClass)}>{name}</span>
        <div className="flex items-center gap-1 mt-0.5">
          {Array.from({ length: targetScore }).map((_, i) => (
            <motion.div
              key={i}
              className={cn(
                'w-2.5 h-2.5 rounded-full transition-colors',
                i < score ? 'bg-yellow-400' : 'bg-white/10'
              )}
              style={i < score ? { boxShadow: '0 0 6px rgba(250,204,21,0.5)' } : undefined}
              animate={i === score - 1 && i >= 0 ? { scale: [1, 1.4, 1] } : {}}
              transition={{ duration: 0.5 }}
            />
          ))}
        </div>
      </div>

      {/* 점수는 애니메이션으로 감싸지 않는다.
          AnimatePresence(mode="wait")로 감싸면 점수가 바뀔 때 이전 숫자의 exit
          애니메이션이 끝나야 새 숫자가 마운트되는데, Framer Motion은 rAF 기반이라
          탭이 백그라운드면 그 애니메이션이 끝나지 않는다.
          실측: 스토어 점수는 1인데 전자칠판에는 0이 그대로 떠 있었다.
          교실에서 점수가 틀리게 보이는 것보다 나쁜 것은 없으므로 즉시 반영한다. */}
      <div className="ml-auto relative z-10">
        <span
          key={score}
          className={cn('text-5xl font-black score-badge score-pop', colorClass)} data-display-font
        >
          {score}
        </span>
      </div>

      {isActive && (
        <motion.div
          className="absolute -top-0.5 left-1/2 -translate-x-1/2 z-20"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <span className="text-[10px] bg-gradient-to-r from-yellow-500 to-amber-500 text-black px-2 py-0.5 rounded-full font-semibold tracking-wider">
            ATTACK
          </span>
        </motion.div>
      )}
    </motion.div>
  );
}
