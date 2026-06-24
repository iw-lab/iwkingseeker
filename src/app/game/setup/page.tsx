'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useGameStore } from '@/stores/gameStore';
import { SUBJECTS, CURRICULUM_UNITS, TARGET_SCORES, TIMER_OPTIONS, TEAM_DEFAULTS, GRADE_BANDS, NATIONAL_SUBJECTS, type GradeBandKey } from '@/lib/constants';
import { splitIntoTeams, shuffleArray } from '@/lib/utils';
import { playButtonClick, playPhaseTransition } from '@/lib/sounds';
import { convertToMultipleChoice } from '@/lib/questionConverter';
import { getCustomQuestionsFiltered, toRuntimeQuestion } from '@/lib/customQuestions';
import { Crown, ChevronRight, Users, BookOpen, Settings, Play, Save, FolderOpen, Trash2, Check, Gamepad2 } from 'lucide-react';

interface SavedClass {
  name: string;
  students: string;
}

const STORAGE_KEY = 'kingseeker_classes';

function getSavedClasses(): SavedClass[] {
  if (typeof window === 'undefined') return [];
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function saveClasses(classes: SavedClass[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(classes));
}

type Step = 1 | 2 | 3 | 4;

export default function GameSetupPage() {
  const router = useRouter();
  const { initGame, setQuestionPool } = useGameStore();
  const [step, setStep] = useState<Step>(1);
  const [studentInput, setStudentInput] = useState('');
  const [gradeBand, setGradeBand] = useState<GradeBandKey>('5-6');
  const [subGrade, setSubGrade] = useState<number>(5);
  const [subject, setSubject] = useState<string>('수학');
  const [unit, setUnit] = useState<string>('');

  const band = GRADE_BANDS.find((b) => b.key === gradeBand)!;
  const isNational = NATIONAL_SUBJECTS.includes(subject);
  const grade = isNational ? subGrade : band.grades[0];
  const [targetScore, setTargetScore] = useState(3);
  const [timerSeconds, setTimerSeconds] = useState(30);
  const [teamAName, setTeamAName] = useState(TEAM_DEFAULTS.A.name);
  const [teamBName, setTeamBName] = useState(TEAM_DEFAULTS.B.name);
  const [savedClasses, setSavedClasses] = useState<SavedClass[]>([]);
  const [className, setClassName] = useState('');
  const [customCount, setCustomCount] = useState(0);

  useEffect(() => {
    setSavedClasses(getSavedClasses());
  }, []);

  useEffect(() => {
    if (!unit) {
      setCustomCount(0);
      return;
    }
    // 비국정 과목은 학년군(예: 5·6학년) 전체에서 커스텀 문제를 센다
    const gradesForCustom = isNational ? [subGrade] : [...band.grades];
    const total = gradesForCustom.reduce(
      (sum, g) => sum + getCustomQuestionsFiltered(g, subject, unit).length,
      0
    );
    setCustomCount(total);
  }, [gradeBand, subGrade, subject, unit, isNational, band.grades]);

  const handleStepChange = (newStep: Step) => {
    playButtonClick();
    setStep(newStep);
  };

  const handleSaveClass = () => {
    if (!className.trim() || !studentInput.trim()) return;
    const updated = savedClasses.filter((c) => c.name !== className.trim());
    updated.push({ name: className.trim(), students: studentInput });
    saveClasses(updated);
    setSavedClasses(updated);
    setClassName('');
  };

  const handleLoadClass = (cls: SavedClass) => {
    playButtonClick();
    setStudentInput(cls.students);
  };

  const handleDeleteClass = (name: string) => {
    const updated = savedClasses.filter((c) => c.name !== name);
    saveClasses(updated);
    setSavedClasses(updated);
  };

  const students = studentInput
    .split('\n')
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  const units = isNational
    ? (CURRICULUM_UNITS[String(subGrade)]?.[subject] ?? [])
    : band.grades.flatMap((g) => CURRICULUM_UNITS[String(g)]?.[subject] ?? []);

  const handleStart = async () => {
    if (students.length < 4 || !unit) return;
    playPhaseTransition();

    const [teamAStudents, teamBStudents] = splitIntoTeams(students);

    const { questionsSeed } = await import('@/data/questions-seed');
    const gradesInBand = isNational ? [subGrade] : [...band.grades];
    // 1순위: 선택한 단원 문제 (학년군 범위)
    const unitQuestions = questionsSeed.filter(
      (q) => gradesInBand.includes(q.grade) && q.subject === subject && q.unit === unit
    );
    // 2순위: 같은 학년군+과목의 다른 단원 문제 (풀이 적을 때 보충)
    const MIN_POOL = 50;
    let filtered = unitQuestions;
    if (unitQuestions.length < MIN_POOL) {
      const sameSubject = questionsSeed.filter(
        (q) => gradesInBand.includes(q.grade) && q.subject === subject && q.unit !== unit
      );
      const extra = shuffleArray(sameSubject).slice(0, MIN_POOL - unitQuestions.length);
      filtered = [...unitQuestions, ...extra];
    }
    const rawPool = filtered.map((q) => ({
      id: `seed-${Math.random().toString(36).slice(2, 10)}`,
      grade: q.grade,
      subject: q.subject,
      unit: q.unit,
      unit_code: q.unit_code,
      question_type: q.question_type as 'multiple_choice' | 'ox' | 'fill_blank' | 'short_answer',
      question_text: q.question_text,
      options: q.options,
      correct_answer: q.correct_answer,
      explanation: q.explanation,
      difficulty: q.difficulty,
      used_count: 0,
      created_at: new Date().toISOString(),
    }));

    // 내 문제(커스텀) 병합 — 비국정 과목은 학년군 전체 학년에서 수집
    const gradesForCustom = isNational ? [subGrade] : [...band.grades];
    const customRuntime = gradesForCustom.flatMap((g) =>
      getCustomQuestionsFiltered(g, subject, unit).map((c) => ({ ...toRuntimeQuestion(c) }))
    );

    // 주관식/빈칸 → 객관식 자동 변환 (그럴듯한 오답을 못 만들면 제외) + 셔플
    const merged = [...customRuntime, ...rawPool] as typeof rawPool;
    const converted = convertToMultipleChoice(merged);
    const pool = shuffleArray(converted);

    setQuestionPool(pool);
    initGame({
      grade,
      subject,
      unit,
      targetScore,
      timerSeconds,
      teamAName,
      teamBName,
      teamAStudents,
      teamBStudents,
    });
    router.push('/game/play');
  };

  const stepLabels = [
    { icon: <Users className="w-6 h-6" />, label: '학생' },
    { icon: <BookOpen className="w-6 h-6" />, label: '과목' },
    { icon: <Settings className="w-6 h-6" />, label: '설정' },
    { icon: <Play className="w-6 h-6" />, label: '시작' },
  ];

  return (
    <div className="min-h-screen bg-mesh bg-mesh-animated flex flex-col noise-overlay">
      {/* Header */}
      <header className="relative z-10 flex items-center gap-4 px-8 py-5 border-b border-white/5">
        <Crown className="w-10 h-10 text-yellow-400" style={{ filter: 'drop-shadow(0 0 6px rgba(250,204,21,0.3))' }} />
        <h1
          className="text-4xl font-black text-white"
          style={{ fontFamily: "var(--font-heading), sans-serif" }}
        >
          게임 설정
        </h1>
      </header>

      {/* Step indicator */}
      <div className="relative z-10 flex items-center justify-center gap-3 px-8 py-5">
        {stepLabels.map((s, i) => (
          <div key={i} className="flex items-center gap-3">
            <motion.button
              onClick={() => handleStepChange((i + 1) as Step)}
              className={`flex items-center gap-2 px-5 py-3 rounded-xl text-lg font-bold transition-all ${
                step === i + 1
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white glow-purple'
                  : step > i + 1
                    ? 'glass text-green-400'
                    : 'glass text-gray-500'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {step > i + 1 ? <Check className="w-6 h-6" /> : s.icon}
              {s.label}
            </motion.button>
            {i < 3 && <ChevronRight className="w-5 h-5 text-gray-600" />}
          </div>
        ))}
      </div>

      {/* Content - full width */}
      <div className="relative z-10 flex-1 flex items-start justify-center px-10 py-6">
        <div className="w-full">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ x: 50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -50, opacity: 0 }}
                className="flex flex-col gap-5"
              >
                <h2 className="text-3xl font-black text-white">학생 이름 입력</h2>

                {savedClasses.length > 0 && (
                  <div className="glass rounded-2xl p-4">
                    <p className="text-lg text-gray-400 mb-3 flex items-center gap-2">
                      <FolderOpen className="w-5 h-5" /> 저장된 학급
                    </p>
                    <div className="flex flex-wrap gap-3">
                      {savedClasses.map((cls) => (
                        <div key={cls.name} className="flex items-center gap-1">
                          <button
                            onClick={() => handleLoadClass(cls)}
                            className="px-5 py-2.5 glass hover:bg-purple-500/20 text-purple-300 rounded-xl text-lg font-bold transition-colors"
                          >
                            {cls.name}
                          </button>
                          <button
                            onClick={() => handleDeleteClass(cls.name)}
                            className="p-2 text-gray-600 hover:text-red-400 transition-colors"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <p className="text-gray-400 text-xl">한 줄에 한 명씩 입력하세요 (최소 4명)</p>
                <textarea
                  value={studentInput}
                  onChange={(e) => setStudentInput(e.target.value)}
                  placeholder={"김민수\n이영희\n박철수\n정수진\n..."}
                  className="w-full h-72 glass-strong rounded-2xl p-6 text-white text-2xl leading-relaxed resize-none focus:ring-2 focus:ring-purple-500/50 outline-none placeholder:text-gray-600"
                />

                <div className="flex items-center gap-3">
                  <p className="text-lg text-gray-500 flex-1">
                    현재 <span className="text-purple-400 font-bold text-xl">{students.length}</span>명 입력됨
                  </p>
                  <input
                    value={className}
                    onChange={(e) => setClassName(e.target.value)}
                    placeholder="학급 이름"
                    className="px-4 py-2.5 glass rounded-xl text-white text-lg outline-none focus:ring-1 focus:ring-purple-500/50 w-44 placeholder:text-gray-600"
                  />
                  <button
                    onClick={handleSaveClass}
                    disabled={!className.trim() || students.length < 1}
                    className="flex items-center gap-2 px-5 py-2.5 glass hover:bg-green-500/20 text-green-400 rounded-xl text-lg font-bold disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    <Save className="w-5 h-5" /> 저장
                  </button>
                </div>

                <motion.button
                  onClick={() => handleStepChange(2)}
                  disabled={students.length < 4}
                  className="w-full py-5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 disabled:from-gray-700 disabled:to-gray-700 disabled:text-gray-500 text-white font-black text-2xl rounded-2xl transition-all"
                  whileHover={students.length >= 4 ? { scale: 1.01 } : {}}
                  whileTap={students.length >= 4 ? { scale: 0.99 } : {}}
                >
                  다음
                </motion.button>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ x: 50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -50, opacity: 0 }}
                className="flex flex-col gap-6"
              >
                <h2 className="text-3xl font-black text-white">학년군 / 과목 / 단원</h2>

                <div>
                  <label className="text-lg text-gray-400 block mb-3 font-medium">학년군</label>
                  <div className="flex gap-3">
                    {GRADE_BANDS.map((b) => (
                      <motion.button
                        key={b.key}
                        onClick={() => { playButtonClick(); setGradeBand(b.key as GradeBandKey); setSubGrade(b.grades[0]); setUnit(''); }}
                        className={`flex-1 py-5 rounded-2xl font-black text-2xl transition-all ${
                          gradeBand === b.key
                            ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white glow-purple'
                            : 'glass text-gray-400 hover:bg-white/5'
                        }`}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        {b.label}
                      </motion.button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-lg text-gray-400 block mb-3 font-medium">과목</label>
                  <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                    {SUBJECTS.map((s) => (
                      <motion.button
                        key={s}
                        onClick={() => { playButtonClick(); setSubject(s); setUnit(''); }}
                        className={`py-4 rounded-2xl font-bold text-xl transition-all ${
                          subject === s
                            ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white glow-purple'
                            : 'glass text-gray-400 hover:bg-white/5'
                        }`}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        {s}
                      </motion.button>
                    ))}
                  </div>
                </div>

                {isNational && (
                  <div>
                    <label className="text-lg text-gray-400 block mb-3 font-medium">
                      학년 선택 <span className="text-xs text-yellow-400/70 ml-2">({subject} — 국정교과서)</span>
                    </label>
                    <div className="flex gap-3">
                      {band.grades.map((g) => (
                        <motion.button
                          key={g}
                          onClick={() => { playButtonClick(); setSubGrade(g); setUnit(''); }}
                          className={`flex-1 py-4 rounded-2xl font-black text-xl transition-all ${
                            subGrade === g
                              ? 'bg-gradient-to-r from-yellow-600 to-amber-600 text-white glow-amber'
                              : 'glass text-gray-400 hover:bg-white/5'
                          }`}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          {g}학년
                        </motion.button>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <div className="flex items-baseline justify-between mb-3">
                    <label className="text-lg text-gray-400 font-medium">단원</label>
                    {unit && customCount > 0 && (
                      <span className="text-xs px-2 py-1 bg-purple-500/20 text-purple-300 rounded-lg font-bold">
                        ✨ 내 문제 {customCount}개 포함
                      </span>
                    )}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-72 overflow-y-auto pr-2">
                    {units.map((u) => (
                      <motion.button
                        key={u}
                        onClick={() => { playButtonClick(); setUnit(u); }}
                        className={`text-left px-6 py-4 rounded-2xl font-medium text-lg transition-all ${
                          unit === u
                            ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white glow-purple'
                            : 'glass text-gray-400 hover:bg-white/5'
                        }`}
                        whileHover={{ x: 4 }}
                      >
                        {unit === u && <Check className="w-5 h-5 inline-block mr-2" />}
                        {u}
                      </motion.button>
                    ))}
                  </div>
                  <Link
                    href="/questions/create"
                    className="mt-3 inline-flex items-center gap-2 text-sm text-purple-300 hover:text-purple-200 underline underline-offset-4"
                  >
                    + 이 단원에 내 문제 만들기
                  </Link>
                </div>

                <motion.button
                  onClick={() => handleStepChange(3)}
                  disabled={!unit}
                  className="w-full py-5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 disabled:from-gray-700 disabled:to-gray-700 disabled:text-gray-500 text-white font-black text-2xl rounded-2xl"
                  whileHover={unit ? { scale: 1.01 } : {}}
                  whileTap={unit ? { scale: 0.99 } : {}}
                >
                  다음
                </motion.button>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ x: 50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -50, opacity: 0 }}
                className="flex flex-col gap-6"
              >
                <h2 className="text-3xl font-black text-white">게임 설정</h2>

                <div>
                  <label className="text-lg text-gray-400 block mb-3 font-medium">목표 점수</label>
                  <div className="flex gap-3">
                    {TARGET_SCORES.map((s) => (
                      <motion.button
                        key={s}
                        onClick={() => { playButtonClick(); setTargetScore(s); }}
                        className={`flex-1 py-5 rounded-2xl font-black text-2xl transition-all ${
                          targetScore === s
                            ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white glow-purple'
                            : 'glass text-gray-400 hover:bg-white/5'
                        }`}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        {s}점
                      </motion.button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-lg text-gray-400 block mb-3 font-medium">제한 시간</label>
                  <div className="flex flex-wrap gap-3">
                    {TIMER_OPTIONS.map((t) => (
                      <motion.button
                        key={t}
                        onClick={() => { playButtonClick(); setTimerSeconds(t); }}
                        className={`px-8 py-5 rounded-2xl font-black text-2xl transition-all ${
                          timerSeconds === t
                            ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white glow-purple'
                            : 'glass text-gray-400 hover:bg-white/5'
                        }`}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        {t}초
                      </motion.button>
                    ))}
                  </div>
                </div>

                <motion.button
                  onClick={() => handleStepChange(4)}
                  className="w-full py-5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-black text-2xl rounded-2xl"
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                >
                  다음
                </motion.button>
              </motion.div>
            )}

            {step === 4 && (
              <motion.div
                key="step4"
                initial={{ x: 50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -50, opacity: 0 }}
                className="flex flex-col gap-6"
              >
                <h2 className="text-3xl font-black text-white">팀 이름 설정</h2>

                <div className="grid grid-cols-2 gap-6">
                  <div className="glass-blue rounded-2xl p-8">
                    <span className="text-5xl">🐲</span>
                    <input
                      value={teamAName}
                      onChange={(e) => setTeamAName(e.target.value)}
                      className="mt-3 w-full bg-transparent text-3xl font-black text-blue-400 border-b-2 border-blue-600/50 outline-none focus:border-blue-400 transition-colors"
                    />
                  </div>
                  <div className="glass-amber rounded-2xl p-8">
                    <span className="text-5xl">🐯</span>
                    <input
                      value={teamBName}
                      onChange={(e) => setTeamBName(e.target.value)}
                      className="mt-3 w-full bg-transparent text-3xl font-black text-amber-400 border-b-2 border-amber-600/50 outline-none focus:border-amber-400 transition-colors"
                    />
                  </div>
                </div>

                <div className="glass-strong rounded-2xl p-6">
                  <h3 className="text-lg text-gray-400 mb-4 uppercase tracking-wider font-bold">게임 요약</h3>
                  <div className="grid grid-cols-2 gap-y-3 gap-x-6 text-xl">
                    <span className="text-gray-500">학생 수</span>
                    <span className="text-white font-bold">{students.length}명</span>
                    <span className="text-gray-500">학년군/과목</span>
                    <span className="text-white font-bold">{band.label} {subject}{isNational ? ` (${subGrade}학년)` : ''}</span>
                    <span className="text-gray-500">단원</span>
                    <span className="text-white font-bold text-base leading-relaxed">{unit}</span>
                    <span className="text-gray-500">목표 점수</span>
                    <span className="text-white font-bold">{targetScore}점</span>
                    <span className="text-gray-500">제한 시간</span>
                    <span className="text-white font-bold">{timerSeconds}초</span>
                  </div>
                </div>

                <motion.button
                  onClick={handleStart}
                  className="w-full py-6 bg-gradient-to-r from-purple-600 via-purple-500 to-pink-600 hover:from-purple-500 hover:via-purple-400 hover:to-pink-500 text-white rounded-2xl font-black text-3xl transition-shadow hover:shadow-lg hover:shadow-purple-500/20 flex items-center justify-center gap-4"
                  style={{ fontFamily: "var(--font-heading), sans-serif" }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Gamepad2 className="w-9 h-9" />
                  게임 시작!
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
