'use client';

import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/stores/gameStore';
import Timer from './Timer';
import { playCorrectSound, playWrongSound } from '@/lib/sounds';
import { speak, stopSpeaking, warmUpVoices } from '@/lib/tts';
import { cn } from '@/lib/utils';
import { Sparkles, Zap, HelpCircle, Volume2 } from 'lucide-react';
import WhackAMole from './quiz-modes/WhackAMole';
import MatchingPairs from './quiz-modes/MatchingPairs';
import BalloonPop from './quiz-modes/BalloonPop';
import TreasureBox from './quiz-modes/TreasureBox';
import LadderClimb from './quiz-modes/LadderClimb';
import SmartText from './SmartText';
import TeamEmoji from './TeamEmoji';

/**
 * 문제 표시 스타일:
 * 'grid'     — 2x2 격자 (클래식)
 * 'list'     — 세로 리스트 (순서대로 등장)
 * 'bigcard'  — 큰 카드 (한 줄씩 크게)
 * 'speed'    — 스피드 퀴즈 (번호 대형)
 * 'whack'    — 두더지 잡기
 * 'cards'    — 카드 뒤집기 (타이밍)
 * 'balloon'  — 풍선 터뜨리기
 * 'treasure' — 보물 상자 열기
 * 'ladder'   — 사다리 타기
 */
type QuizStyle =
  | 'grid'
  | 'list'
  | 'bigcard'
  | 'speed'
  | 'whack'
  | 'cards'
  | 'balloon'
  | 'treasure'
  | 'ladder';

const STYLE_COLORS = [
  { bg: 'bg-red-600/80 hover:bg-red-500/90 border-red-400/40', glow: 'hover:shadow-red-500/20 hover:shadow-lg', label: 'A' },
  { bg: 'bg-blue-600/80 hover:bg-blue-500/90 border-blue-400/40', glow: 'hover:shadow-blue-500/20 hover:shadow-lg', label: 'B' },
  { bg: 'bg-green-600/80 hover:bg-green-500/90 border-green-400/40', glow: 'hover:shadow-green-500/20 hover:shadow-lg', label: 'C' },
  { bg: 'bg-yellow-600/80 hover:bg-yellow-500/90 border-yellow-400/40', glow: 'hover:shadow-yellow-500/20 hover:shadow-lg', label: 'D' },
];

const STYLE_EMOJIS = ['🔴', '🔵', '🟢', '🟡'];

function getChosung(str: string): string {
  const cho = ['ㄱ','ㄲ','ㄴ','ㄷ','ㄸ','ㄹ','ㅁ','ㅂ','ㅃ','ㅅ','ㅆ','ㅇ','ㅈ','ㅉ','ㅊ','ㅋ','ㅌ','ㅍ','ㅎ'];
  return [...str].map((ch) => {
    const code = ch.charCodeAt(0) - 0xAC00;
    if (code < 0 || code > 11171) return ch;
    return cho[Math.floor(code / 588)] ?? ch;
  }).join('');
}

function ResultOverlay({ isCorrect }: { isCorrect: boolean }) {
  const particles = useMemo(() =>
    isCorrect
      ? Array.from({ length: 24 }, (_, i) => ({
          id: i,
          x: (Math.random() - 0.5) * 500,
          y: (Math.random() - 0.5) * 500,
          delay: Math.random() * 0.3,
          size: 4 + Math.random() * 10,
          color: ['#fbbf24', '#22c55e', '#3b82f6', '#a855f7', '#ec4899'][i % 5],
        }))
      : [],
    [isCorrect]
  );

  return (
    <motion.div
      className="fixed inset-0 z-40 flex items-center justify-center pointer-events-none"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="absolute inset-0"
        style={{ background: isCorrect ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)' }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      />
      <motion.div
        className={cn(
          'relative text-8xl font-black px-16 py-10 rounded-3xl',
          isCorrect
            ? 'bg-gradient-to-br from-green-500 to-emerald-600 text-white glow-green'
            : 'bg-gradient-to-br from-red-500 to-rose-600 text-white glow-red'
        )}
        style={{ fontFamily: "var(--font-heading), 'Black Han Sans', sans-serif" }}
        initial={{ scale: 0, rotate: -10 }}
        animate={{ scale: 1, rotate: 0 }}
        exit={{ scale: 0, rotate: 10 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      >
        {isCorrect ? '정답!' : '오답!'}
        {isCorrect && <Sparkles className="absolute -top-5 -right-5 w-12 h-12 text-yellow-300" />}
      </motion.div>
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full"
          style={{ width: p.size, height: p.size, backgroundColor: p.color, left: '50%', top: '50%' }}
          initial={{ x: 0, y: 0, opacity: 1 }}
          animate={{ x: p.x, y: p.y, opacity: 0 }}
          transition={{ duration: 1, delay: p.delay, ease: 'easeOut' }}
        />
      ))}
    </motion.div>
  );
}

export default function QuizDisplay() {
  const { currentQuestion, currentAttacker, teamA, teamB, timerSeconds, submitAnswer, totalQuestionsAsked, setQuizResult } = useGameStore();
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [showHint, setShowHint] = useState(false);

  const attackerName = currentAttacker === 'team_a' ? teamA.name : teamB.name;

  // 문제마다 다른 스타일 - 문제 번호 기반으로 순환
  // 게임 스타일(whack/wheel/cards)은 4지선다일 때만 의미가 있음
  const quizStyle: QuizStyle = useMemo(() => {
    const isFourChoice =
      currentQuestion?.question_type === 'multiple_choice' &&
      (currentQuestion?.options?.length ?? 0) === 4;
    const styles: QuizStyle[] = isFourChoice
      ? ['grid', 'whack', 'balloon', 'list', 'treasure', 'bigcard', 'cards', 'ladder', 'speed']
      : ['grid', 'list', 'bigcard', 'speed'];
    return styles[totalQuestionsAsked % styles.length]!;
  }, [totalQuestionsAsked, currentQuestion]);

  // 초성 힌트
  const chosungHint = useMemo(() => {
    if (!currentQuestion) return '';
    return getChosung(currentQuestion.correct_answer);
  }, [currentQuestion]);

  // 학생 화면(display)에서 터치한 답을 수신
  useEffect(() => {
    const handler = (e: Event) => {
      const answer = (e as CustomEvent).detail;
      if (answer && typeof answer === 'string') handleAnswer(answer);
    };
    window.addEventListener('display-answer', handler);
    return () => window.removeEventListener('display-answer', handler);
  });

  // TTS: 새 문제가 뜨면 자동으로 읽어줌
  useEffect(() => {
    warmUpVoices();
  }, []);
  useEffect(() => {
    if (currentQuestion?.question_text && !showResult) {
      // 살짝 딜레이 (페이즈 전환 사운드와 겹치지 않게)
      const t = setTimeout(() => {
        speak(currentQuestion.question_text);
      }, 350);
      return () => {
        clearTimeout(t);
        stopSpeaking();
      };
    }
  }, [currentQuestion?.id, currentQuestion?.question_text, showResult]);

  const handleAnswer = useCallback(
    (answer: string) => {
      if (showResult || !currentQuestion) return;
      const correct = answer === currentQuestion.correct_answer;
      setSelectedAnswer(answer);
      setIsCorrect(correct);
      setShowResult(true);
      setShowHint(false);
      // 학생 화면에도 결과 공개
      setQuizResult({ selectedAnswer: answer, isCorrect: correct });
      // TTS 읽기 중이면 중단
      stopSpeaking();

      if (correct) {
        playCorrectSound();
        setTimeout(() => {
          setSelectedAnswer(null);
          setShowResult(false);
          setQuizResult(null);
          submitAnswer(answer, true);
        }, 2000);
      } else {
        playWrongSound();
        setTimeout(() => {
          setShowResult(false);
          setSelectedAnswer(null);
          setQuizResult(null);
          submitAnswer(answer, false);
        }, 2000);
      }
    },
    [showResult, currentQuestion, submitAnswer, setQuizResult]
  );

  const handleTimeUp = useCallback(() => {
    if (!showResult) handleAnswer('__timeout__');
  }, [showResult, handleAnswer]);

  if (!currentQuestion) return null;

  const q = currentQuestion!;
  const isOX = q.question_type === 'ox';
  const options = q.options ?? [];
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
    : quizStyle === 'balloon'
    ? '🎈 풍선'
    : quizStyle === 'treasure'
    ? '🗝️ 보물상자'
    : quizStyle === 'ladder'
    ? '🪜 사다리'
    : '🃏 뒤집기';

  return (
    <div className="flex flex-col gap-4 w-full h-full">
      {/* Top bar */}
      <div className="flex items-center justify-between w-full">
        <motion.div
          className={cn(
            'flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-lg glass',
            currentAttacker === 'team_a' ? 'text-blue-400 glass-blue' : 'text-amber-400 glass-amber'
          )}
          animate={{ scale: [1, 1.03, 1] }}
          transition={{ repeat: Infinity, duration: 2 }}
        >
          <TeamEmoji team={currentAttacker} size={28} />
          <span>공격: {attackerName}</span>
        </motion.div>

        <div className="flex items-center gap-3">
          {/* 스타일 뱃지 */}
          <span className="text-xs text-purple-400/60 glass px-2 py-1 rounded-lg">
            {styleLabel}
          </span>
          {/* 문제 다시 읽어주기 */}
          {!showResult && (
            <motion.button
              onClick={() => speak(q.question_text)}
              className="flex items-center gap-1 px-3 py-1.5 glass text-sky-400/80 hover:text-sky-300 rounded-lg text-sm transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              title="문제 읽어주기"
            >
              <Volume2 className="w-4 h-4" />
              읽기
            </motion.button>
          )}
          {/* 초성 힌트 버튼 */}
          {!isOX && !showHint && !showResult && (
            <motion.button
              onClick={() => setShowHint(true)}
              className="flex items-center gap-1 px-3 py-1.5 glass text-yellow-400/70 hover:text-yellow-400 rounded-lg text-sm transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <HelpCircle className="w-4 h-4" />
              힌트
            </motion.button>
          )}
          <Timer key={q.id} seconds={timerSeconds} isActive={!showResult} onTimeUp={handleTimeUp} size={70} />
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
              {q.subject} &middot; {q.unit}
            </p>
            <h3 className="text-4xl md:text-5xl font-bold text-white leading-relaxed">
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
              <span className="text-xl font-black">SPEED</span>
            </motion.div>
          )}
        </div>
        {/* 초성 힌트 */}
        {showHint && (
          <motion.p
            className="mt-3 text-xl text-yellow-400/80 font-mono tracking-widest"
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
          >
            힌트: [ {chosungHint} ]
          </motion.p>
        )}
      </motion.div>

      {/* Answer options */}
      {isOX ? (
        <div className="flex gap-6 w-full justify-center flex-1 items-center">
          {['O', 'X'].map((choice) => {
            const isThisCorrect = choice === q.correct_answer;
            const isThisSelected = choice === selectedAnswer;
            return (
              <motion.button
                key={choice}
                className={cn(
                  'w-40 h-40 rounded-full text-8xl font-black border-4 transition-all',
                  showResult && isThisCorrect ? 'bg-green-600 border-green-400 glow-green'
                    : showResult && isThisSelected && !isCorrect ? 'bg-red-600/80 border-red-400 glow-red'
                    : choice === 'O' ? 'bg-blue-600/70 hover:bg-blue-500/80 border-blue-400/40 hover:shadow-lg hover:shadow-blue-500/20'
                    : 'bg-red-600/70 hover:bg-red-500/80 border-red-400/40 hover:shadow-lg hover:shadow-red-500/20',
                  showResult && 'pointer-events-none'
                )}
                onClick={() => handleAnswer(choice)}
                whileHover={!showResult ? { scale: 1.15 } : {}}
                whileTap={!showResult ? { scale: 0.9 } : {}}
              >
                {choice}
              </motion.button>
            );
          })}
        </div>
      ) : quizStyle === 'grid' ? (
        /* 클래식 2x2 격자 */
        <div className="grid grid-cols-2 gap-3 w-full flex-1">
          {options.map((option, i) => {
            const style = STYLE_COLORS[i]!;
            const isThisCorrect = option === q.correct_answer;
            const isThisSelected = option === selectedAnswer;
            return (
              <motion.button
                key={i}
                className={cn(
                  'relative p-6 rounded-xl border text-left text-2xl md:text-3xl font-bold text-white transition-all overflow-hidden',
                  showResult && isThisCorrect ? 'bg-green-600 border-green-400/60 ring-2 ring-green-400/40 glow-green'
                    : showResult && isThisSelected && !isCorrect ? 'bg-red-600/80 border-red-400/40 glow-red'
                    : `${style.bg} ${style.glow}`,
                  showResult && 'pointer-events-none'
                )}
                onClick={() => handleAnswer(option)}
                whileHover={!showResult ? { scale: 1.02, y: -2 } : {}}
                whileTap={!showResult ? { scale: 0.98 } : {}}
                initial={{ x: i % 2 === 0 ? -30 : 30, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: i * 0.08 }}
              >
                <span className="mr-4 text-4xl font-black opacity-40">{style.label}</span>
                <SmartText text={option} />
              </motion.button>
            );
          })}
        </div>
      ) : quizStyle === 'list' ? (
        /* 세로 리스트 — 순서대로 슬라이드 */
        <div className="flex flex-col gap-3 w-full flex-1 justify-center">
          {options.map((option, i) => {
            const style = STYLE_COLORS[i]!;
            const isThisCorrect = option === q.correct_answer;
            const isThisSelected = option === selectedAnswer;
            return (
              <motion.button
                key={i}
                className={cn(
                  'flex items-center gap-4 px-8 py-5 rounded-2xl border text-left text-2xl md:text-3xl font-bold text-white transition-all',
                  showResult && isThisCorrect ? 'bg-green-600 border-green-400/60 ring-2 ring-green-400/40 glow-green'
                    : showResult && isThisSelected && !isCorrect ? 'bg-red-600/80 border-red-400/40 glow-red'
                    : `${style.bg} ${style.glow}`,
                  showResult && 'pointer-events-none'
                )}
                onClick={() => handleAnswer(option)}
                whileHover={!showResult ? { scale: 1.01, x: 8 } : {}}
                whileTap={!showResult ? { scale: 0.98 } : {}}
                initial={{ x: -60, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: i * 0.12, type: 'spring', stiffness: 200 }}
              >
                <span className="text-4xl">{STYLE_EMOJIS[i]}</span>
                <span className="flex-1"><SmartText text={option} /></span>
              </motion.button>
            );
          })}
        </div>
      ) : quizStyle === 'whack' ? (
        <WhackAMole
          options={options}
          correctAnswer={q.correct_answer}
          selectedAnswer={selectedAnswer}
          showResult={showResult}
          isCorrect={isCorrect}
          onAnswer={handleAnswer}
        />
      ) : quizStyle === 'cards' ? (
        <MatchingPairs
          options={options}
          correctAnswer={q.correct_answer}
          selectedAnswer={selectedAnswer}
          showResult={showResult}
          isCorrect={isCorrect}
          onAnswer={handleAnswer}
        />
      ) : quizStyle === 'balloon' ? (
        <BalloonPop
          options={options}
          correctAnswer={q.correct_answer}
          selectedAnswer={selectedAnswer}
          showResult={showResult}
          isCorrect={isCorrect}
          onAnswer={handleAnswer}
        />
      ) : quizStyle === 'treasure' ? (
        <TreasureBox
          options={options}
          correctAnswer={q.correct_answer}
          selectedAnswer={selectedAnswer}
          showResult={showResult}
          isCorrect={isCorrect}
          onAnswer={handleAnswer}
        />
      ) : quizStyle === 'ladder' ? (
        <LadderClimb
          options={options}
          correctAnswer={q.correct_answer}
          selectedAnswer={selectedAnswer}
          showResult={showResult}
          isCorrect={isCorrect}
          onAnswer={handleAnswer}
        />
      ) : quizStyle === 'bigcard' ? (
        /* 빅카드 — 큰 카드 2x2지만 더 두꺼운 스타일 */
        <div className="grid grid-cols-2 gap-4 w-full flex-1">
          {options.map((option, i) => {
            const style = STYLE_COLORS[i]!;
            const isThisCorrect = option === q.correct_answer;
            const isThisSelected = option === selectedAnswer;
            return (
              <motion.button
                key={i}
                className={cn(
                  'relative flex flex-col items-center justify-center rounded-2xl border-2 text-center text-2xl md:text-3xl font-black text-white transition-all',
                  showResult && isThisCorrect ? 'bg-green-600 border-green-400 ring-4 ring-green-400/30 glow-green'
                    : showResult && isThisSelected && !isCorrect ? 'bg-red-600/80 border-red-400 glow-red'
                    : `${style.bg} ${style.glow}`,
                  showResult && 'pointer-events-none'
                )}
                onClick={() => handleAnswer(option)}
                whileHover={!showResult ? { scale: 1.03 } : {}}
                whileTap={!showResult ? { scale: 0.97 } : {}}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: i * 0.1, type: 'spring' }}
              >
                <span className="text-5xl mb-2 opacity-30">{style.label}</span>
                <span className="px-4 leading-snug"><SmartText text={option} /></span>
              </motion.button>
            );
          })}
        </div>
      ) : (
        /* 스피드 — 번호 대형 + 긴급한 느낌 */
        <div className="grid grid-cols-2 gap-3 w-full flex-1">
          {options.map((option, i) => {
            const style = STYLE_COLORS[i]!;
            const isThisCorrect = option === q.correct_answer;
            const isThisSelected = option === selectedAnswer;
            return (
              <motion.button
                key={i}
                className={cn(
                  'relative flex items-center gap-4 px-6 py-5 rounded-xl border text-left text-2xl md:text-3xl font-bold text-white transition-all',
                  showResult && isThisCorrect ? 'bg-green-600 border-green-400/60 ring-2 ring-green-400/40 glow-green'
                    : showResult && isThisSelected && !isCorrect ? 'bg-red-600/80 border-red-400/40 glow-red'
                    : `${style.bg} ${style.glow}`,
                  showResult && 'pointer-events-none'
                )}
                onClick={() => handleAnswer(option)}
                whileHover={!showResult ? { scale: 1.02 } : {}}
                whileTap={!showResult ? { scale: 0.98 } : {}}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: i * 0.05 }}
              >
                <span className="text-4xl font-black opacity-50 shrink-0 w-12 text-center">{i + 1}</span>
                <span className="flex-1"><SmartText text={option} /></span>
              </motion.button>
            );
          })}
        </div>
      )}

      {/* Result overlay */}
      <AnimatePresence>{showResult && <ResultOverlay isCorrect={isCorrect} />}</AnimatePresence>

      {/* Explanation — 정답/오답 모두 표시 */}
      {showResult && (q.explanation || !isCorrect) && (
        <div
          className={cn(
            'w-full rounded-xl p-4 border',
            isCorrect
              ? 'bg-green-950/40 border-green-500/30'
              : 'bg-red-950/40 border-red-500/30'
          )}
          style={{ boxShadow: isCorrect ? '0 0 20px rgba(34,197,94,0.15)' : '0 0 20px rgba(239,68,68,0.15)' }}
        >
          {!isCorrect && (
            <p className="text-base mb-2 flex items-center gap-2">
              <span className="text-red-300 font-bold">오답!</span>
              <span className="text-gray-400">정답은</span>
              <span className="px-2 py-0.5 bg-green-600/80 rounded-md text-white font-bold">
                <SmartText text={q.correct_answer} />
              </span>
              <span className="text-gray-400">입니다.</span>
            </p>
          )}
          {q.explanation && (
            <p className="text-sm text-gray-200 flex items-start gap-2 leading-relaxed">
              <Sparkles className="w-4 h-4 text-yellow-400 shrink-0 mt-0.5" />
              <SmartText text={q.explanation} />
            </p>
          )}
        </div>
      )}

      {/* Teacher hint */}
      <div className="fixed bottom-2 left-2 z-50">
        <details className="cursor-pointer select-none">
          <summary className="text-[10px] text-gray-700/50 hover:text-gray-500">hint</summary>
          <p className="text-[11px] text-gray-500 bg-gray-900/95 px-2.5 py-1.5 rounded-lg mt-0.5 backdrop-blur-sm">
            {q.correct_answer}
          </p>
        </details>
      </div>
    </div>
  );
}
