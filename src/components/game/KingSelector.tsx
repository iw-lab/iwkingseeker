'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/stores/gameStore';
import StudentCard from './StudentCard';
import { playKingSelectSuspense, playTeamSelect } from '@/lib/sounds';
import { EyeOff, Crown, Check, Lock, User, ArrowRight } from 'lucide-react';
import { useTimedAdvance } from '@/hooks/useTimedAdvance';

interface KingSelectorProps {
  selectingTeam: 'team_a' | 'team_b';
}

export default function KingSelector({ selectingTeam }: KingSelectorProps) {
  const { teamA, teamB, selectKing, setPhase } = useGameStore();
  const [step, setStep] = useState<'identify' | 'select' | 'confirmed'>('identify');
  const [selectorName, setSelectorName] = useState<string | null>(null);
  const [selectedKing, setSelectedKing] = useState<string | null>(null);

  const selectingTeamData = selectingTeam === 'team_a' ? teamA : teamB;
  const teamColor = selectingTeam === 'team_a' ? 'blue' : 'amber';
  const teamColorClass = selectingTeam === 'team_a' ? 'text-blue-400' : 'text-amber-400';

  useEffect(() => {
    playKingSelectSuspense();
  }, []);

  const handleIdentify = (student: string) => {
    playTeamSelect();
    setSelectorName(student);
  };

  const handleIdentifyConfirm = () => {
    if (!selectorName) return;
    setStep('select');
  };

  const handleSelect = (student: string) => {
    playTeamSelect();
    setSelectedKing(student);
  };

  const handleConfirm = () => {
    if (!selectedKing || !selectorName) return;
    selectKing(selectingTeam, selectedKing, selectorName);
    setStep('confirmed');
  };

  // "왕이 선택되었습니다!"를 2초 보여 준 뒤 다음 단계로.
  // setTimeout 하나에만 맡기면 가려진 탭에서 여기서 멈춘다(실측) — 훅이 세 겹으로 막는다.
  const advance = useCallback(() => {
    setPhase(selectingTeam === 'team_a' ? 'KING_SELECT_B' : 'RPS');
  }, [selectingTeam, setPhase]);
  const advanceNow = useTimedAdvance(step === 'confirmed', 2000, advance);

  // 확인 완료 화면
  if (step === 'confirmed') {
    return (
      <motion.div
        className="flex flex-col items-center gap-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <motion.div
          className="p-6 rounded-full glass-strong glow-yellow"
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 200 }}
        >
          <Crown
            className="w-16 h-16 text-yellow-400"
            style={{ filter: 'drop-shadow(0 0 15px rgba(250,204,21,0.5))' }}
          />
        </motion.div>
        <h2
          className="text-3xl font-extrabold text-gradient-gold" data-display-font
        >
          왕이 선택되었습니다!
        </h2>
        <div className="flex items-center gap-2 text-gray-400">
          <Lock className="w-4 h-4" />
          <p>다른 학생들은 누가 왕인지 모릅니다</p>
        </div>
        {/* 자동 전환이 늦어도 교사가 직접 넘길 수 있어야 한다 */}
        <button
          onClick={advanceNow}
          className="flex items-center gap-2 px-6 py-3 rounded-xl glass border border-white/10 text-gray-300 hover:text-white hover:bg-white/10 font-semibold"
        >
          바로 넘어가기
          <ArrowRight className="w-4 h-4" />
        </button>
      </motion.div>
    );
  }

  // 1단계: 나는 누구인가요?
  if (step === 'identify') {
    return (
      <div className="flex flex-col items-center gap-6 w-full">
        <motion.div
          className="flex items-center gap-3 glass rounded-xl px-6 py-3"
          style={{ boxShadow: '0 0 20px rgba(250,204,21,0.1)' }}
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
        >
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
          >
            <EyeOff className="w-6 h-6 text-yellow-400" />
          </motion.div>
          <span className="text-yellow-300 font-bold text-lg">
            다른 학생들은 눈을 감아주세요!
          </span>
        </motion.div>

        <motion.div
          className="flex items-center gap-3"
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <User className="w-8 h-8 text-purple-400" />
          <h2
            className="text-3xl font-extrabold text-white text-center" data-display-font
          >
            <span className={teamColorClass}>{selectingTeamData.name}</span>
            {' '}대표 학생!
            <br />
            나는 누구인가요?
          </h2>
        </motion.div>

        <div className="flex flex-wrap justify-center gap-3">
          <AnimatePresence>
            {selectingTeamData.students.map((student, i) => (
              <motion.div
                key={student}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.3 + i * 0.05 }}
              >
                <StudentCard
                  name={student}
                  teamColor={teamColor}
                  size="lg"
                  isSelected={selectorName === student}
                  onClick={() => handleIdentify(student)}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        <motion.button
          className="flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-2xl font-semibold text-xl disabled:opacity-40 disabled:cursor-not-allowed transition-shadow hover:shadow-lg hover:shadow-purple-500/20" data-display-font
          onClick={handleIdentifyConfirm}
          disabled={!selectorName}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <Check className="w-6 h-6" />
          나야!
        </motion.button>
      </div>
    );
  }

  // 2단계: 왕을 선택하세요
  return (
    <div className="flex flex-col items-center gap-6 w-full">
      <motion.div
        className="flex items-center gap-3 glass rounded-xl px-6 py-3"
        style={{ boxShadow: '0 0 20px rgba(250,204,21,0.1)' }}
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
      >
        <motion.div
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
        >
          <EyeOff className="w-6 h-6 text-yellow-400" />
        </motion.div>
        <span className="text-yellow-300 font-bold text-lg">
          다른 학생들은 눈을 감아주세요!
        </span>
      </motion.div>

      <motion.h2
        className="text-3xl font-extrabold text-white text-center" data-display-font
        initial={{ y: -10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <span className={teamColorClass}>{selectorName}</span> 학생!
        <br />
        우리 팀의 왕을 선택하세요 👑
      </motion.h2>

      <div className="flex flex-wrap justify-center gap-3">
        <AnimatePresence>
          {selectingTeamData.students.map((student, i) => (
            <motion.div
              key={student}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.3 + i * 0.05 }}
            >
              <StudentCard
                name={student}
                teamColor={teamColor}
                size="lg"
                isSelected={selectedKing === student}
                showCrown={selectedKing === student}
                onClick={() => handleSelect(student)}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <motion.button
        className="flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-yellow-600 to-amber-600 hover:from-yellow-500 hover:to-amber-500 text-white rounded-2xl font-semibold text-xl disabled:opacity-40 disabled:cursor-not-allowed transition-shadow hover:shadow-lg hover:shadow-yellow-500/20" data-display-font
        onClick={handleConfirm}
        disabled={!selectedKing}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <Check className="w-6 h-6" />
        왕 선택 완료!
      </motion.button>
    </div>
  );
}
