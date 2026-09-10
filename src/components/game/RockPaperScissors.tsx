'use client';

import { motion } from 'framer-motion';
import { useGameStore } from '@/stores/gameStore';
import { playRPSReveal, playRPSBeat } from '@/lib/sounds';
import { Crown, Zap } from 'lucide-react';
import { useState } from 'react';
import TeamEmoji from './TeamEmoji';

export default function RockPaperScissors() {
  const { teamA, teamB, setRPSResult } = useGameStore();
  const [selecting, setSelecting] = useState(false);

  const handleSelectWinner = (winner: 'team_a' | 'team_b') => {
    if (selecting) return;
    setSelecting(true);
    playRPSBeat();

    setTimeout(() => {
      playRPSReveal();
      setRPSResult(winner);
    }, 400);
  };

  return (
    <div className="flex flex-col items-center gap-10 w-full">
      <motion.div
        className="flex items-center gap-3"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
      >
        <Zap className="w-8 h-8 text-yellow-400" />
        <h2
          className="text-5xl font-black text-white" data-display-font
        >
          가위바위보!
        </h2>
        <Zap className="w-8 h-8 text-yellow-400" />
      </motion.div>

      <motion.p
        className="text-xl text-gray-300"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        양 팀 대표가 직접 가위바위보를 한 뒤, 이긴 팀을 선택하세요
      </motion.p>

      <div className="flex items-center gap-8">
        {/* Team A */}
        <motion.button
          className="group flex flex-col items-center gap-4 px-16 py-10 glass-blue rounded-2xl transition-all hover:bg-blue-500/15"
          onClick={() => handleSelectWinner('team_a')}
          whileHover={{ scale: 1.05, y: -4 }}
          whileTap={{ scale: 0.95 }}
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          disabled={selecting}
        >
          <motion.div
            animate={{ rotate: [0, -5, 5, 0] }}
            transition={{ repeat: Infinity, duration: 3 }}
          >
            <TeamEmoji team="team_a" size={110} />
          </motion.div>
          <span
            className="text-3xl font-extrabold text-blue-400" data-display-font
          >
            {teamA.name}
          </span>
          <div className="flex items-center gap-2 text-yellow-400 opacity-0 group-hover:opacity-100 transition-opacity">
            <Crown className="w-5 h-5" style={{ filter: 'drop-shadow(0 0 4px rgba(250,204,21,0.5))' }} />
            <span className="font-semibold">승리!</span>
          </div>
        </motion.button>

        {/* VS */}
        <motion.div
          className="flex flex-col items-center gap-2"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.4 }}
        >
          <motion.span
            className="text-4xl font-extrabold text-gradient-fire" data-display-font
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ repeat: Infinity, duration: 2 }}
          >
            VS
          </motion.span>
        </motion.div>

        {/* Team B */}
        <motion.button
          className="group flex flex-col items-center gap-4 px-16 py-10 glass-amber rounded-2xl transition-all hover:bg-amber-500/15"
          onClick={() => handleSelectWinner('team_b')}
          whileHover={{ scale: 1.05, y: -4 }}
          whileTap={{ scale: 0.95 }}
          initial={{ x: 50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          disabled={selecting}
        >
          <motion.div
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ repeat: Infinity, duration: 3 }}
          >
            <TeamEmoji team="team_b" size={110} />
          </motion.div>
          <span
            className="text-3xl font-extrabold text-amber-400" data-display-font
          >
            {teamB.name}
          </span>
          <div className="flex items-center gap-2 text-yellow-400 opacity-0 group-hover:opacity-100 transition-opacity">
            <Crown className="w-5 h-5" style={{ filter: 'drop-shadow(0 0 4px rgba(250,204,21,0.5))' }} />
            <span className="font-semibold">승리!</span>
          </div>
        </motion.button>
      </div>

      <motion.p
        className="text-sm text-gray-500 mt-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
      >
        선공팀이 먼저 퀴즈를 풀 수 있습니다
      </motion.p>
    </div>
  );
}
