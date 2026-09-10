'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/stores/gameStore';
import StudentCard from './StudentCard';
import { shuffleArray } from '@/lib/utils';
import { playShuffleSound, playButtonClick } from '@/lib/sounds';
import { Shuffle, Check, ArrowLeftRight, Save, FolderOpen, Trash2 } from 'lucide-react';
import TeamEmoji from './TeamEmoji';

interface SavedTeam {
  name: string;
  teamAName: string;
  teamBName: string;
  teamA: string[];
  teamB: string[];
}

const TEAM_STORAGE_KEY = 'kingseeker_teams';

function getSavedTeams(): SavedTeam[] {
  if (typeof window === 'undefined') return [];
  try {
    const data = localStorage.getItem(TEAM_STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function saveTeamsToStorage(teams: SavedTeam[]) {
  localStorage.setItem(TEAM_STORAGE_KEY, JSON.stringify(teams));
}

export default function TeamSplitter() {
  const { teamA, teamB, setPhase, initGame, grade, subject, unit, targetScore, timerSeconds } = useGameStore();
  const [localTeamA, setLocalTeamA] = useState<string[]>(teamA.students);
  const [localTeamB, setLocalTeamB] = useState<string[]>(teamB.students);
  const [teamAName, setTeamAName] = useState(teamA.name);
  const [teamBName, setTeamBName] = useState(teamB.name);
  const [savedTeams, setSavedTeams] = useState<SavedTeam[]>([]);
  const [saveName, setSaveName] = useState('');
  const [showSave, setShowSave] = useState(false);

  useEffect(() => {
    setSavedTeams(getSavedTeams());
  }, []);

  const handleShuffle = () => {
    playShuffleSound();
    const all = [...localTeamA, ...localTeamB];
    const shuffled = shuffleArray(all);
    const mid = Math.ceil(shuffled.length / 2);
    setLocalTeamA(shuffled.slice(0, mid));
    setLocalTeamB(shuffled.slice(mid));
  };

  const moveToTeamB = (student: string) => {
    playButtonClick();
    setLocalTeamA((prev) => prev.filter((s) => s !== student));
    setLocalTeamB((prev) => [...prev, student]);
  };

  const moveToTeamA = (student: string) => {
    playButtonClick();
    setLocalTeamB((prev) => prev.filter((s) => s !== student));
    setLocalTeamA((prev) => [...prev, student]);
  };

  const handleSaveTeam = () => {
    if (!saveName.trim()) return;
    const updated = savedTeams.filter((t) => t.name !== saveName.trim());
    updated.push({
      name: saveName.trim(),
      teamAName,
      teamBName,
      teamA: localTeamA,
      teamB: localTeamB,
    });
    saveTeamsToStorage(updated);
    setSavedTeams(updated);
    setSaveName('');
    setShowSave(false);
    playButtonClick();
  };

  const handleLoadTeam = (team: SavedTeam) => {
    playButtonClick();
    setLocalTeamA(team.teamA);
    setLocalTeamB(team.teamB);
    setTeamAName(team.teamAName);
    setTeamBName(team.teamBName);
  };

  const handleDeleteTeam = (name: string) => {
    const updated = savedTeams.filter((t) => t.name !== name);
    saveTeamsToStorage(updated);
    setSavedTeams(updated);
  };

  const handleConfirm = () => {
    if (localTeamA.length < 2 || localTeamB.length < 2) return;
    initGame({
      grade,
      subject,
      unit,
      targetScore,
      timerSeconds,
      teamAName,
      teamBName,
      teamAStudents: localTeamA,
      teamBStudents: localTeamB,
    });
    setPhase('KING_SELECT_A');
  };

  return (
    <div className="flex flex-col gap-3 w-full h-full">
      {/* Header row */}
      <div className="flex items-center justify-between">
        <motion.h2
          className="text-4xl font-extrabold text-white" data-display-font
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
        >
          팀을 나누세요!
        </motion.h2>

        <div className="flex items-center gap-2">
          {/* 저장된 팀 불러오기 */}
          {savedTeams.length > 0 && (
            <div className="flex items-center gap-1">
              <FolderOpen className="w-5 h-5 text-gray-500" />
              {savedTeams.map((t) => (
                <div key={t.name} className="flex items-center">
                  <button
                    onClick={() => handleLoadTeam(t)}
                    className="px-3 py-1.5 glass hover:bg-purple-500/20 text-purple-300 rounded-lg text-sm font-semibold transition-colors"
                  >
                    {t.name}
                  </button>
                  <button
                    onClick={() => handleDeleteTeam(t.name)}
                    className="p-1 text-gray-600 hover:text-red-400"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <motion.button
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white rounded-xl font-semibold text-lg"
            onClick={handleShuffle}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Shuffle className="w-5 h-5" />
            랜덤
          </motion.button>
        </div>
      </div>

      {/* Team panels - fill remaining space */}
      <div className="grid grid-cols-[1fr_40px_1fr] gap-2 flex-1 min-h-0">
        {/* Team A */}
        <motion.div
          className="glass-blue rounded-2xl p-4 flex flex-col"
          initial={{ x: -30, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
        >
          <div className="flex items-center gap-3 mb-3">
            <TeamEmoji team="team_a" size={44} />
            <input
              value={teamAName}
              onChange={(e) => setTeamAName(e.target.value)}
              className="bg-transparent text-2xl font-extrabold text-blue-400 border-b-2 border-blue-600/50 outline-none w-full focus:border-blue-400 transition-colors"
            />
            <span className="text-xl text-blue-500/70 font-bold shrink-0">{localTeamA.length}명</span>
          </div>
          <div className="flex flex-wrap gap-2 flex-1 content-start overflow-y-auto">
            <AnimatePresence mode="popLayout">
              {localTeamA.map((student) => (
                <motion.div
                  key={student}
                  layout
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                >
                  <StudentCard
                    name={student}
                    teamColor="blue"
                    size="lg"
                    onClick={() => moveToTeamB(student)}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Arrow */}
        <div className="flex items-center justify-center">
          <motion.div
            className="p-2 rounded-full glass"
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ repeat: Infinity, duration: 2 }}
          >
            <ArrowLeftRight className="w-6 h-6 text-gray-500" />
          </motion.div>
        </div>

        {/* Team B */}
        <motion.div
          className="glass-amber rounded-2xl p-4 flex flex-col"
          initial={{ x: 30, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
        >
          <div className="flex items-center gap-3 mb-3">
            <TeamEmoji team="team_b" size={44} />
            <input
              value={teamBName}
              onChange={(e) => setTeamBName(e.target.value)}
              className="bg-transparent text-2xl font-extrabold text-amber-400 border-b-2 border-amber-600/50 outline-none w-full focus:border-amber-400 transition-colors"
            />
            <span className="text-xl text-amber-500/70 font-bold shrink-0">{localTeamB.length}명</span>
          </div>
          <div className="flex flex-wrap gap-2 flex-1 content-start overflow-y-auto">
            <AnimatePresence mode="popLayout">
              {localTeamB.map((student) => (
                <motion.div
                  key={student}
                  layout
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                >
                  <StudentCard
                    name={student}
                    teamColor="amber"
                    size="lg"
                    onClick={() => moveToTeamA(student)}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>

      {/* Bottom bar */}
      <div className="flex items-center justify-between">
        <p className="text-gray-500 text-sm">클릭하면 반대 팀으로 이동</p>

        <div className="flex items-center gap-3">
          {/* 팀 저장 */}
          {showSave ? (
            <div className="flex items-center gap-2">
              <input
                value={saveName}
                onChange={(e) => setSaveName(e.target.value)}
                placeholder="팀 이름 (예: 1모둠)"
                className="px-3 py-2 glass rounded-lg text-white text-sm outline-none focus:ring-1 focus:ring-purple-500/50 w-36 placeholder:text-gray-600"
                autoFocus
                onKeyDown={(e) => e.key === 'Enter' && handleSaveTeam()}
              />
              <button
                onClick={handleSaveTeam}
                disabled={!saveName.trim()}
                className="px-3 py-2 glass hover:bg-green-500/20 text-green-400 rounded-lg text-sm font-semibold disabled:opacity-30"
              >
                저장
              </button>
              <button
                onClick={() => setShowSave(false)}
                className="px-3 py-2 glass hover:bg-red-500/20 text-gray-400 rounded-lg text-sm"
              >
                취소
              </button>
            </div>
          ) : (
            <motion.button
              className="flex items-center gap-2 px-4 py-2.5 glass hover:bg-green-500/10 text-green-400 rounded-xl font-semibold text-sm transition-colors"
              onClick={() => setShowSave(true)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Save className="w-4 h-4" />
              팀 저장
            </motion.button>
          )}

          <motion.button
            className="flex items-center gap-2 px-8 py-3.5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white rounded-2xl font-semibold text-xl disabled:opacity-40 disabled:cursor-not-allowed" data-display-font
            onClick={handleConfirm}
            disabled={localTeamA.length < 2 || localTeamB.length < 2}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Check className="w-6 h-6" />
            팀 확정!
          </motion.button>
        </div>
      </div>
    </div>
  );
}
