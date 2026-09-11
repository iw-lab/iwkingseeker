'use client';

import { useEffect, useState, useMemo, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { Maximize, Minimize, Lock, Crosshair, ArrowRightLeft, Trophy, Crown, Swords, Zap, ShieldX, Target } from 'lucide-react';
import { useFullscreen } from '@/hooks/useFullscreen';
import { cn } from '@/lib/utils';
import { DISPLAY_CHANNEL } from '@/lib/displayChannel';
import type { DisplayState } from '@/lib/displayChannel';
import WhackAMole from '@/components/game/quiz-modes/WhackAMole';
import MatchingPairs from '@/components/game/quiz-modes/MatchingPairs';
import StudentCard from '@/components/game/StudentCard';
import TeamEmoji from '@/components/game/TeamEmoji';
import SmartText from '@/components/game/SmartText';
import { seededRandom } from '@/lib/seededRandom';

/* ──────────────────────────────────────
   Scoreboard (props-driven, no Zustand)
   ────────────────────────────────────── */

function DisplayScoreBoard({ teamA, teamB, currentAttacker, targetScore }: {
  teamA: DisplayState['teamA'];
  teamB: DisplayState['teamB'];
  currentAttacker: DisplayState['currentAttacker'];
  targetScore: number;
}) {
  return (
    <div className="flex items-center justify-between w-full glass-strong rounded-2xl px-2 py-2 relative overflow-hidden">
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

      <DisplayTeamScore
        name={teamA.name} score={teamA.score} team="team_a"
        isActive={currentAttacker === 'team_a'}
        colorClass="text-blue-400" glowClass="glow-blue" glassBg="glass-blue"
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

      <DisplayTeamScore
        name={teamB.name} score={teamB.score} team="team_b"
        isActive={currentAttacker === 'team_b'}
        colorClass="text-amber-400" glowClass="glow-amber" glassBg="glass-amber"
        targetScore={targetScore}
      />
    </div>
  );
}

function DisplayTeamScore({ name, score, team, isActive, colorClass, glowClass, glassBg, targetScore }: {
  name: string; score: number; team: 'team_a' | 'team_b'; isActive: boolean;
  colorClass: string; glowClass: string; glassBg: string; targetScore: number;
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

/* ──────────────────────────────────────
   Read-only Timer (props-driven)
   ────────────────────────────────────── */

function DisplayTimer({ seconds, isActive, size = 70 }: {
  seconds: number; isActive: boolean; size?: number;
}) {
  const [timeLeft, setTimeLeft] = useState(seconds);
  const prevActiveRef = useRef(isActive);
  const radius = (size - 10) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = timeLeft / seconds;
  const strokeDashoffset = circumference * (1 - progress);

  useEffect(() => {
    if (isActive && !prevActiveRef.current) {
      setTimeLeft(seconds);
    }
    prevActiveRef.current = isActive;
  }, [isActive, seconds]);

  useEffect(() => {
    setTimeLeft(seconds);
  }, [seconds]);

  useEffect(() => {
    if (!isActive || timeLeft <= 0) return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => Math.max(prev - 1, 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  const isWarning = timeLeft <= 5;
  const isCritical = timeLeft <= 3;
  const color = timeLeft > seconds * 0.5 ? '#22c55e' : timeLeft > seconds * 0.25 ? '#eab308' : '#ef4444';
  const glowColor = timeLeft > seconds * 0.5 ? 'rgba(34,197,94,0.3)' : timeLeft > seconds * 0.25 ? 'rgba(234,179,8,0.3)' : 'rgba(239,68,68,0.5)';

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
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

/* ──────────────────────────────────────
   Quiz option style helpers
   ────────────────────────────────────── */

const STYLE_COLORS = [
  { bg: 'bg-red-600/80 hover:bg-red-500/90 border-red-400/40', glow: 'hover:shadow-red-500/20 hover:shadow-lg', label: 'A' },
  { bg: 'bg-blue-600/80 hover:bg-blue-500/90 border-blue-400/40', glow: 'hover:shadow-blue-500/20 hover:shadow-lg', label: 'B' },
  { bg: 'bg-green-600/80 hover:bg-green-500/90 border-green-400/40', glow: 'hover:shadow-green-500/20 hover:shadow-lg', label: 'C' },
  { bg: 'bg-yellow-600/80 hover:bg-yellow-500/90 border-yellow-400/40', glow: 'hover:shadow-yellow-500/20 hover:shadow-lg', label: 'D' },
];

const STYLE_EMOJIS = ['🔴', '🔵', '🟢', '🟡'];

type QuizStyle = 'grid' | 'list' | 'bigcard' | 'speed' | 'whack' | 'cards';

/* ──────────────────────────────────────
   Phase-specific display sections
   ────────────────────────────────────── */

function WaitingScreen() {
  return (
    <div className="flex flex-col items-center justify-center gap-6 h-full">
      <motion.div
        className="p-8 rounded-full glass-strong"
        animate={{ scale: [1, 1.05, 1], boxShadow: ['0 0 20px rgba(147,51,234,0.2)', '0 0 40px rgba(147,51,234,0.3)', '0 0 20px rgba(147,51,234,0.2)'] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <Crown className="w-20 h-20 text-purple-400" style={{ filter: 'drop-shadow(0 0 12px rgba(147,51,234,0.5))' }} />
      </motion.div>
      <h2
        className="text-4xl font-extrabold text-white" data-display-font
      >
        게임 화면에 연결하는 중...
      </h2>
      <p className="text-gray-400 text-lg">선생님 화면에서 게임을 시작하면 자동으로 표시됩니다</p>
      <div className="flex gap-2">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="w-3 h-3 rounded-full bg-purple-500"
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.3 }}
          />
        ))}
      </div>
    </div>
  );
}

function SetupWaiting() {
  return (
    <div className="flex flex-col items-center justify-center gap-6">
      <motion.div
        className="p-6 rounded-full glass-strong"
        animate={{ rotate: [0, 360] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
      >
        <Swords className="w-16 h-16 text-purple-400" />
      </motion.div>
      <h2
        className="text-5xl font-black text-white" data-display-font
      >
        게임 준비 중...
      </h2>
      <p className="text-gray-400 text-lg">잠시만 기다려 주세요</p>
    </div>
  );
}

function KingSelectWaiting({ teamName }: { teamName: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-8">
      <motion.div
        className="relative p-8 rounded-full glass-strong"
        style={{ boxShadow: '0 0 40px rgba(250,204,21,0.15)' }}
        animate={{ scale: [1, 1.06, 1] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <Lock className="w-20 h-20 text-yellow-400" style={{ filter: 'drop-shadow(0 0 15px rgba(250,204,21,0.5))' }} />
        <motion.div
          className="absolute inset-0 rounded-full border-2 border-yellow-500/30"
          animate={{ scale: [1, 1.25], opacity: [0.5, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
      </motion.div>
      <h2
        className="text-5xl font-black text-gradient-gold text-center" data-display-font
      >
        왕을 선택하는 중입니다...
      </h2>
      <motion.p
        className="text-2xl text-yellow-300/80 font-bold"
        animate={{ opacity: [0.6, 1, 0.6] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        {teamName} 팀이 비밀리에 왕을 고르고 있습니다
      </motion.p>
      <div className="flex gap-2 mt-2">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="w-4 h-4 rounded-full bg-yellow-500"
            animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.2, 0.8] }}
            transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.3 }}
          />
        ))}
      </div>
    </div>
  );
}

function DisplayRPS({ teamAName, teamBName, channelRef }: {
  teamAName: string;
  teamBName: string;
  channelRef: React.RefObject<BroadcastChannel | null>;
}) {
  const [selecting, setSelecting] = useState(false);

  const pickWinner = (winner: 'team_a' | 'team_b') => {
    if (selecting) return;
    setSelecting(true);
    channelRef.current?.postMessage({ type: 'action', action: 'rps-winner', value: winner });
  };

  return (
    <div className="flex flex-col items-center justify-center gap-8">
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
        <motion.button
          className="group flex flex-col items-center gap-4 px-16 py-10 glass-blue rounded-2xl transition-all hover:bg-blue-500/15 cursor-pointer disabled:opacity-50"
          onClick={() => pickWinner('team_a')}
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
            {teamAName}
          </span>
          <div className="flex items-center gap-2 text-yellow-400 opacity-0 group-hover:opacity-100 transition-opacity">
            <Crown className="w-5 h-5" style={{ filter: 'drop-shadow(0 0 4px rgba(250,204,21,0.5))' }} />
            <span className="font-semibold">승리!</span>
          </div>
        </motion.button>

        <motion.span
          className="text-4xl font-extrabold text-gradient-fire" data-display-font
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ repeat: Infinity, duration: 2 }}
        >
          VS
        </motion.span>

        <motion.button
          className="group flex flex-col items-center gap-4 px-16 py-10 glass-amber rounded-2xl transition-all hover:bg-amber-500/15 cursor-pointer disabled:opacity-50"
          onClick={() => pickWinner('team_b')}
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
            {teamBName}
          </span>
          <div className="flex items-center gap-2 text-yellow-400 opacity-0 group-hover:opacity-100 transition-opacity">
            <Crown className="w-5 h-5" style={{ filter: 'drop-shadow(0 0 4px rgba(250,204,21,0.5))' }} />
            <span className="font-semibold">승리!</span>
          </div>
        </motion.button>
      </div>

      <p className="text-sm text-gray-500 mt-4">선공팀이 먼저 퀴즈를 풀 수 있습니다</p>
    </div>
  );
}

function DisplayQuiz({ state, channelRef }: { state: DisplayState; channelRef: React.RefObject<BroadcastChannel | null> }) {
  const q = state.currentQuestion;
  if (!q) return null;

  const sendAnswer = (answer: string) => {
    channelRef.current?.postMessage({ type: 'action', action: 'answer', value: answer });
  };

  const attackerName = state.currentAttacker === 'team_a' ? state.teamA.name : state.teamB.name;
  const isOX = q.question_type === 'ox';
  const options = q.options ?? [];

  const quizStyle: QuizStyle = (() => {
    const isFourChoice = q.question_type === 'multiple_choice' && (q.options?.length ?? 0) === 4;
    const styles: QuizStyle[] = isFourChoice
      ? ['grid', 'whack', 'list', 'bigcard', 'cards', 'speed']
      : ['grid', 'list', 'bigcard', 'speed'];
    return styles[state.totalQuestionsAsked % styles.length]!;
  })();
  const styleLabel = isOX
    ? 'OX'
    : quizStyle === 'grid'
    ? '4지선다'
    : quizStyle === 'list'
    ? '리스트'
    : quizStyle === 'bigcard'
    ? '카드'
    : quizStyle === 'speed'
    ? '스피드'
    : quizStyle === 'whack'
    ? '🔨 두더지'
    : '🃏 뒤집기';

  return (
    <div className="flex flex-col gap-4 w-full h-full">
      {/* Top bar */}
      <div className="flex items-center justify-between w-full">
        <motion.div
          className={cn(
            'flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-lg glass',
            state.currentAttacker === 'team_a' ? 'text-blue-400 glass-blue' : 'text-amber-400 glass-amber'
          )}
          animate={{ scale: [1, 1.03, 1] }}
          transition={{ repeat: Infinity, duration: 2 }}
        >
          <TeamEmoji team={state.currentAttacker} size={28} />
          <span>공격: {attackerName}</span>
        </motion.div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-purple-400/60 glass px-2 py-1 rounded-lg">{styleLabel}</span>
          <DisplayTimer key={q.id} seconds={state.timerSeconds} isActive={true} size={70} />
        </div>
      </div>

      {/* Question card */}
      <motion.div
        className="w-full glass-strong rounded-2xl p-6 relative overflow-hidden"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        key={q.id + '-q'}
      >
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 opacity-60" />
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <p className="text-sm text-purple-400/80 mb-2 font-medium">
              {q.subject}
              {q.unit ? <> &middot; {q.unit}</> : null}
            </p>
            <h3 className="reading-text text-4xl md:text-5xl text-white leading-relaxed">
              <SmartText text={q.question_text} />
            </h3>
          </div>
          {quizStyle === 'speed' && !isOX && (
            <motion.div
              className="shrink-0 flex items-center gap-1 text-yellow-400"
              animate={{ scale: [1, 1.15, 1] }}
              transition={{ repeat: Infinity, duration: 0.8 }}
            >
              <Zap className="w-8 h-8" />
              <span className="text-xl font-semibold">SPEED</span>
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* Answer options — 터치 가능 (전자칠판 대응) */}
      {isOX ? (
        <div className="flex gap-6 w-full justify-center flex-1 items-center">
          {['O', 'X'].map((choice) => (
            <motion.button
              key={choice}
              onClick={() => sendAnswer(choice)}
              className={cn(
                'w-40 h-40 rounded-full text-8xl font-black border-4 flex items-center justify-center cursor-pointer',
                choice === 'O'
                  ? 'bg-blue-600/70 hover:bg-blue-500/80 border-blue-400/40'
                  : 'bg-red-600/70 hover:bg-red-500/80 border-red-400/40',
              )}
              whileHover={{ scale: 1.15 }}
              whileTap={{ scale: 0.9 }}
            >
              {choice}
            </motion.button>
          ))}
        </div>
      ) : quizStyle === 'grid' ? (
        <div className="grid grid-cols-2 gap-3 w-full flex-1">
          {options.map((option, i) => {
            const style = STYLE_COLORS[i]!;
            return (
              <motion.button
                key={i}
                onClick={() => sendAnswer(option)}
                className={cn(
                  'relative p-6 rounded-xl border reading-text text-left text-2xl md:text-3xl text-white cursor-pointer',
                  style.bg, style.glow,
                )}
                initial={{ x: i % 2 === 0 ? -30 : 30, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: i * 0.08 }}
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                <span className="mr-4 text-4xl font-extrabold opacity-40">{style.label}</span>
                <span className="reading-text"><SmartText text={option} /></span>
              </motion.button>
            );
          })}
        </div>
      ) : quizStyle === 'list' ? (
        <div className="flex flex-col gap-3 w-full flex-1 justify-center">
          {options.map((option, i) => {
            const style = STYLE_COLORS[i]!;
            return (
              <motion.button
                key={i}
                onClick={() => sendAnswer(option)}
                className={cn(
                  'flex items-center gap-4 px-8 py-5 rounded-2xl border reading-text text-left text-2xl md:text-3xl text-white cursor-pointer',
                  style.bg, style.glow,
                )}
                initial={{ x: -60, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: i * 0.12, type: 'spring', stiffness: 200 }}
                whileHover={{ scale: 1.01, x: 8 }}
                whileTap={{ scale: 0.98 }}
              >
                <span className="text-4xl">{STYLE_EMOJIS[i]}</span>
                <span className="reading-text flex-1"><SmartText text={option} /></span>
              </motion.button>
            );
          })}
        </div>
      ) : quizStyle === 'whack' ? (
        <WhackAMole
          options={options}
          correctAnswer=""
          selectedAnswer={null}
          showResult={false}
          isCorrect={false}
          onAnswer={sendAnswer}
        />
      ) : quizStyle === 'cards' ? (
        <MatchingPairs
          options={options}
          correctAnswer=""
          selectedAnswer={null}
          showResult={false}
          isCorrect={false}
          onAnswer={sendAnswer}
        />
      ) : quizStyle === 'bigcard' ? (
        <div className="grid grid-cols-2 gap-4 w-full flex-1">
          {options.map((option, i) => {
            const style = STYLE_COLORS[i]!;
            return (
              <motion.button
                key={i}
                onClick={() => sendAnswer(option)}
                className={cn(
                  'relative flex flex-col items-center justify-center rounded-2xl border-2 reading-text text-center text-2xl md:text-3xl text-white cursor-pointer',
                  style.bg, style.glow,
                )}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: i * 0.1, type: 'spring' }}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                <span className="text-5xl mb-2 opacity-30">{style.label}</span>
                <span className="reading-text px-4 leading-snug"><SmartText text={option} /></span>
              </motion.button>
            );
          })}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 w-full flex-1">
          {options.map((option, i) => {
            const style = STYLE_COLORS[i]!;
            return (
              <motion.button
                key={i}
                onClick={() => sendAnswer(option)}
                className={cn(
                  'relative flex items-center gap-4 px-6 py-5 rounded-xl border reading-text text-left text-2xl md:text-3xl text-white cursor-pointer',
                  style.bg, style.glow,
                )}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: i * 0.05 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <span className="text-4xl font-extrabold opacity-50 shrink-0 w-12 text-center">{i + 1}</span>
                <span className="reading-text flex-1"><SmartText text={option} /></span>
              </motion.button>
            );
          })}
        </div>
      )}

      {/* 결과/해설 오버레이 — 교사 화면 state 기반 */}
      {state.quizResult && (
        <DisplayQuizResult
          isCorrect={state.quizResult.isCorrect}
          selectedAnswer={state.quizResult.selectedAnswer}
          correctAnswer={state.quizResult.correctAnswer}
          explanation={state.quizResult.explanation}
        />
      )}
    </div>
  );
}

function DisplayQuizResult({
  isCorrect,
  correctAnswer,
  explanation,
}: {
  isCorrect: boolean;
  selectedAnswer: string;
  correctAnswer: string;
  explanation: string | null;
}) {
  return (
    <>
      {/* Full-screen overlay */}
      <div className="fixed inset-0 z-40 flex items-center justify-center pointer-events-none">
        <div
          className="absolute inset-0"
          style={{ background: isCorrect ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.12)' }}
        />
        <div
          className={cn(
            'relative text-8xl font-black px-16 py-10 rounded-3xl',
            isCorrect
              ? 'bg-gradient-to-br from-green-500 to-emerald-600 text-white glow-green'
              : 'bg-gradient-to-br from-red-500 to-rose-600 text-white glow-red'
          )} data-display-font
        >
          {isCorrect ? '정답!' : '오답!'}
        </div>
      </div>
      {/* Bottom explanation card */}
      <div
        className={cn(
          'absolute left-4 right-4 bottom-4 rounded-xl p-4 border z-50',
          isCorrect ? 'bg-green-950/80 border-green-500/40' : 'bg-red-950/80 border-red-500/40'
        )}
        style={{ boxShadow: isCorrect ? '0 0 20px rgba(34,197,94,0.2)' : '0 0 20px rgba(239,68,68,0.2)' }}
      >
        {!isCorrect && (
          <p className="text-base mb-2 flex items-center gap-2 flex-wrap">
            <span className="text-red-300 font-semibold">오답!</span>
            <span className="text-gray-300">정답은</span>
            <span className="px-2 py-0.5 bg-green-600/80 rounded-md text-white font-semibold">
              <SmartText text={correctAnswer} />
            </span>
            <span className="text-gray-300">입니다.</span>
          </p>
        )}
        {explanation && (
          <p className="text-sm text-gray-100 leading-relaxed">
            ✨ <SmartText text={explanation} />
          </p>
        )}
      </div>
    </>
  );
}

function DisplayWrongAnswer({ state }: { state: DisplayState }) {
  const attackerName = state.currentAttacker === 'team_a' ? state.teamA.name : state.teamB.name;
  const attackerColor = state.currentAttacker === 'team_a' ? 'text-blue-400' : 'text-amber-400';
  const isWrongKing = state.lastGuessResult === 'not_found';

  return (
    <div className="flex flex-col items-center justify-center gap-6">
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 15 }}
      >
        <div className="p-6 rounded-full glass-strong" style={{ boxShadow: isWrongKing ? '0 0 30px rgba(239,68,68,0.3)' : '0 0 30px rgba(147,51,234,0.3)' }}>
          {isWrongKing ? <ShieldX className="w-16 h-16 text-red-400" /> : <ArrowRightLeft className="w-16 h-16 text-purple-400" />}
        </div>
      </motion.div>
      <motion.h2
        className="text-5xl font-black text-white" data-display-font
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        {isWrongKing ? '왕이 아닙니다!' : '공수 교대!'}
      </motion.h2>
      {isWrongKing && state.lastGuessedStudent && (
        <motion.div
          className="glass rounded-xl px-6 py-3"
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.35 }}
        >
          <p className="text-xl text-gray-300">
            <span className="text-white font-semibold">{state.lastGuessedStudent}</span>
            <span className="text-gray-400"> 학생은 왕이 아닙니다.</span>
          </p>
        </motion.div>
      )}
      <motion.div
        className="flex items-center gap-4 glass-strong rounded-2xl px-8 py-4"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <TeamEmoji team={state.currentAttacker} size={56} />
        <div>
          <p className="text-gray-400 text-lg">다음 공격</p>
          <p className={`text-3xl font-extrabold ${attackerColor}`}>{attackerName}</p>
        </div>
      </motion.div>
      <motion.div
        className="flex gap-1 mt-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
      >
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="w-3 h-3 rounded-full bg-purple-500"
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 1, repeat: Infinity, delay: i * 0.3 }}
          />
        ))}
      </motion.div>
    </div>
  );
}

function DisplayKingGuess({ state, channelRef }: {
  state: DisplayState;
  channelRef: React.RefObject<BroadcastChannel | null>;
}) {
  const [selected, setSelected] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState(false);

  const targetTeam = state.currentAttacker === 'team_a' ? 'team_b' : 'team_a';
  const targetTeamData = targetTeam === 'team_a' ? state.teamA : state.teamB;
  const revealed = targetTeam === 'team_a' ? state.revealedA : state.revealedB;
  const kingSelector = targetTeam === 'team_a' ? state.kingSelectorA : state.kingSelectorB;
  const attackerName = state.currentAttacker === 'team_a' ? state.teamA.name : state.teamB.name;
  const attackerColor = state.currentAttacker === 'team_a' ? 'text-blue-400' : 'text-amber-400';

  const unrevealed = targetTeamData.students.filter((s) => !revealed.includes(s));

  const handleConfirm = () => {
    if (!selected || confirmed) return;
    setConfirmed(true);
    channelRef.current?.postMessage({ type: 'action', action: 'king-guess', value: selected });
  };

  return (
    <div className="flex flex-col items-center gap-6 w-full">
      <motion.div
        className="flex items-center gap-3"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
      >
        <motion.div
          animate={{ rotate: [0, 360] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
        >
          <Crosshair className="w-8 h-8 text-yellow-400" />
        </motion.div>
        <h2
          className="text-4xl font-extrabold text-white" data-display-font
        >
          정답! 상대팀의 왕을 지목하세요!
        </h2>
      </motion.div>

      <motion.p
        className="text-gray-400"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        <span className={attackerColor}>{attackerName}</span>
        , {targetTeamData.name}의 왕은 누구일까요?
        {unrevealed.length < targetTeamData.students.length && (
          <span className="ml-2 text-gray-500 text-sm">
            (남은 후보: {unrevealed.length}명)
          </span>
        )}
      </motion.p>

      {kingSelector && (
        <motion.div
          className="flex items-center gap-2 glass rounded-xl px-5 py-2.5"
          style={{ boxShadow: '0 0 15px rgba(168,85,247,0.15)' }}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, type: 'spring' }}
        >
          <span className="text-2xl">🕵️</span>
          <span className="text-purple-300 font-bold text-lg">
            <span className="text-white">{kingSelector}</span> 학생이 왕을 뽑았습니다
          </span>
        </motion.div>
      )}

      <div className="flex flex-wrap justify-center gap-3">
        {targetTeamData.students.map((student, i) => {
          const isRevealed = revealed.includes(student);
          return (
            <motion.div
              key={student}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.15 + i * 0.04 }}
            >
              <StudentCard
                name={student}
                teamColor={targetTeam === 'team_a' ? 'blue' : 'amber'}
                size="lg"
                isRevealed={isRevealed}
                isSelected={selected === student}
                isDisabled={isRevealed || confirmed}
                onClick={() => !isRevealed && !confirmed && setSelected(student)}
              />
            </motion.div>
          );
        })}
      </div>

      <motion.button
        className="flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white rounded-2xl font-semibold text-xl disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-shadow hover:shadow-lg hover:shadow-red-500/20" data-display-font
        onClick={handleConfirm}
        disabled={!selected || confirmed}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <Target className="w-6 h-6" />
        이 학생이 왕이다!
      </motion.button>
    </div>
  );
}

function DisplayRoundResult({ state, channelRef }: {
  state: DisplayState;
  channelRef: React.RefObject<BroadcastChannel | null>;
}) {
  if (state.lastGuessResult === 'found') {
    const handleContinue = () => {
      channelRef.current?.postMessage({ type: 'action', action: 'next-round' });
    };
    return (
      <div className="flex flex-col items-center gap-6">
        <motion.div
          className="relative"
          animate={{ scale: [0.8, 1], rotate: [-30, 0], y: [-20, 0] }}
          transition={{ type: 'spring', stiffness: 180, damping: 12 }}
        >
          <span className="text-[120px] block" style={{ filter: 'drop-shadow(0 0 40px rgba(250,204,21,0.5))' }}>
            👑
          </span>
        </motion.div>
        <h2
          className="text-5xl font-black text-gradient-gold" data-display-font
        >
          왕을 찾았다!
        </h2>
        <div
          className="glass-strong rounded-2xl px-8 py-4"
          style={{ boxShadow: '0 0 30px rgba(250,204,21,0.15)' }}
        >
          <p className="text-2xl text-white font-bold text-center">
            <span className="text-yellow-400">{state.lastGuessedStudent}</span> 학생이 왕이었습니다!
          </p>
        </div>
        <motion.button
          onClick={handleContinue}
          className="mt-2 px-10 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white rounded-2xl font-extrabold text-2xl cursor-pointer transition-shadow hover:shadow-lg hover:shadow-purple-500/30" data-display-font
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          animate={{ boxShadow: ['0 0 0px rgba(168,85,247,0)', '0 0 25px rgba(168,85,247,0.5)', '0 0 0px rgba(168,85,247,0)'] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          계속하기 →
        </motion.button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-6">
      <motion.div
        className="relative"
        initial={{ scale: 0, rotate: -15 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 200 }}
      >
        <div className="p-6 rounded-full glass-strong glow-red">
          <ShieldX className="w-16 h-16 text-red-400" />
        </div>
        <motion.div
          className="absolute inset-0 rounded-full border-2 border-red-500/30"
          animate={{ scale: [1, 1.2], opacity: [0.6, 0] }}
          transition={{ duration: 1, repeat: 2 }}
        />
      </motion.div>
      <h2
        className="text-3xl font-extrabold text-gray-300" data-display-font
      >
        왕이 아닙니다!
      </h2>
      <motion.div
        className="glass rounded-xl px-6 py-3"
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <p className="text-lg text-gray-400">
          <span className="text-white font-semibold">{state.lastGuessedStudent}</span> 학생은 왕이 아닙니다.
        </p>
      </motion.div>
    </div>
  );
}

function DisplayGameOver({ state }: { state: DisplayState }) {
  const winner: 'team_a' | 'team_b' = state.teamA.score >= state.targetScore ? 'team_a' : 'team_b';
  const winnerData = winner === 'team_a' ? state.teamA : state.teamB;
  const winnerGradient = winner === 'team_a' ? 'from-blue-400 to-cyan-400' : 'from-amber-400 to-yellow-400';
  const winnerGlow = winner === 'team_a' ? 'glow-blue' : 'glow-amber';

  const accuracy = state.totalQuestionsAsked > 0
    ? Math.round((state.totalCorrect / state.totalQuestionsAsked) * 100)
    : 0;

  const confettiParticles = useMemo(() => {
    const colors = ['#fbbf24', '#ef4444', '#8b5cf6', '#3b82f6', '#10b981', '#f97316', '#ec4899', '#06b6d4'];
    return Array.from({ length: 60 }, (_, i) => ({
      id: i,
      x: seededRandom(i * 7 + 1) * 100,
      delay: seededRandom(i * 7 + 2) * 3,
      duration: 2 + seededRandom(i * 7 + 3) * 3,
      color: colors[i % colors.length]!,
      size: 4 + seededRandom(i * 7 + 4) * 8,
      rotation: seededRandom(i * 7 + 5) * 720 - 360,
      drift: (seededRandom(i * 7 + 6) - 0.5) * 150,
      shape: i % 3 === 0 ? 'circle' as const : 'rect' as const,
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
              left: `${p.x}%`, top: '-20px',
              width: p.size,
              height: p.shape === 'circle' ? p.size : p.size * 1.5,
              backgroundColor: p.color,
              boxShadow: `0 0 ${p.size / 2}px ${p.color}40`,
            }}
            animate={{ y: ['0vh', '110vh'], rotate: [0, p.rotation], x: [0, p.drift] }}
            transition={{ duration: p.duration, delay: p.delay, repeat: Infinity, ease: 'linear' }}
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
      >
        <Trophy className="w-28 h-28 text-yellow-400" style={{ filter: 'drop-shadow(0 0 30px rgba(250,204,21,0.4))' }} />
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
        <div className="flex items-center justify-center gap-6 mb-6">
          <div className="text-center">
            <p className="text-sm text-gray-400">{state.teamA.name}</p>
            <motion.p
              className="text-4xl font-extrabold text-blue-400 score-badge"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 1.0, type: 'spring' }}
            >
              {state.teamA.score}
            </motion.p>
          </div>
          <div className="flex flex-col items-center">
            <Crown className="w-5 h-5 text-yellow-400/50" />
            <span className="text-lg text-gray-600 font-bold">:</span>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-400">{state.teamB.name}</p>
            <motion.p
              className="text-4xl font-extrabold text-amber-400 score-badge"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 1.1, type: 'spring' }}
            >
              {state.teamB.score}
            </motion.p>
          </div>
        </div>
        <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent mb-5" />
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: '총 라운드', value: state.roundHistory.length, color: 'text-purple-400' },
            { label: '총 문제 수', value: state.totalQuestionsAsked, color: 'text-white' },
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
    </div>
  );
}

/* ──────────────────────────────────────
   Main Display Page
   ────────────────────────────────────── */

export default function DisplayPage() {
  const [gameState, setGameState] = useState<DisplayState | null>(null);
  const { isFullscreen, toggleFullscreen } = useFullscreen();
  const channelRef = useRef<BroadcastChannel | null>(null);

  // Listen to BroadcastChannel from teacher page
  useEffect(() => {
    const channel = new BroadcastChannel(DISPLAY_CHANNEL);
    channelRef.current = channel;
    channel.onmessage = (e: MessageEvent) => {
      if (e.data?.type === 'state') {
        setGameState(e.data.state as DisplayState);
      }
    };

    // Request initial state from teacher page
    const reqChannel = new BroadcastChannel(DISPLAY_CHANNEL);
    reqChannel.postMessage({ type: 'request-state' });
    reqChannel.close();

    return () => { channel.close(); channelRef.current = null; };
  }, []);

  // Auto fullscreen on first user interaction
  useEffect(() => {
    const handler = () => {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(() => {});
      }
      window.removeEventListener('click', handler);
    };
    window.addEventListener('click', handler);
    return () => window.removeEventListener('click', handler);
  }, []);

  // F11 keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'F11') { e.preventDefault(); toggleFullscreen(); }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleFullscreen]);

  const phase = gameState?.phase;
  const showScoreboard = gameState && !['SETUP', 'TEAM_SPLIT', 'GAME_OVER', 'WRONG_ANSWER'].includes(phase!);

  const renderPhase = useCallback(() => {
    if (!gameState) return <WaitingScreen />;

    switch (gameState.phase) {
      case 'SETUP':
      case 'TEAM_SPLIT':
        return <SetupWaiting />;
      case 'KING_SELECT_A':
        return <KingSelectWaiting teamName={gameState.teamA.name} />;
      case 'KING_SELECT_B':
        return <KingSelectWaiting teamName={gameState.teamB.name} />;
      case 'RPS':
        return <DisplayRPS teamAName={gameState.teamA.name} teamBName={gameState.teamB.name} channelRef={channelRef} />;
      case 'QUIZ':
        return <DisplayQuiz state={gameState} channelRef={channelRef} />;
      case 'WRONG_ANSWER':
        return <DisplayWrongAnswer state={gameState} />;
      case 'GUESS_KING':
        return <DisplayKingGuess state={gameState} channelRef={channelRef} />;
      case 'ROUND_RESULT':
        return <DisplayRoundResult state={gameState} channelRef={channelRef} />;
      case 'NEW_ROUND':
        return <SetupWaiting />;
      case 'GAME_OVER':
        return <DisplayGameOver state={gameState} />;
      default:
        return <WaitingScreen />;
    }
  }, [gameState]);

  return (
    <div className="h-screen bg-mesh bg-mesh-animated flex flex-col relative noise-overlay overflow-hidden">
      {/* Top bar */}
      <div className="relative z-10 flex items-center justify-between px-3 py-1 shrink-0">
        {showScoreboard ? (
          <motion.div className="flex-1" initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
            <DisplayScoreBoard
              teamA={gameState!.teamA}
              teamB={gameState!.teamB}
              currentAttacker={gameState!.currentAttacker}
              targetScore={gameState!.targetScore}
            />
          </motion.div>
        ) : (
          <div className="flex-1" />
        )}

        <div className="flex items-center gap-1 ml-2">
          <motion.button
            onClick={toggleFullscreen}
            className="p-2 glass rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
            title={isFullscreen ? '전체화면 종료' : '전체화면'}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
          </motion.button>
        </div>
      </div>

      {/* Main content — AnimatePresence 제거: 백그라운드 탭 opacity 고착 방지 */}
      <div className="relative z-10 flex-1 flex px-3 pb-2 min-h-0">
        <div
          key={phase ?? 'waiting'}
          className="w-full h-full flex items-center justify-center"
        >
          {renderPhase()}
        </div>
      </div>

      {/* Display mode badge */}
      <div className="fixed bottom-2 right-2 z-50">
        <span className="text-[10px] text-gray-700/40 glass px-2 py-1 rounded">
          학생 화면
        </span>
      </div>
    </div>
  );
}
