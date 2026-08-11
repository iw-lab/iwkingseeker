'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useGameStore } from '@/stores/gameStore';
import { SUBJECTS, CURRICULUM_UNITS, TARGET_SCORES, TIMER_OPTIONS, TEAM_DEFAULTS, GRADE_BANDS, NATIONAL_SUBJECTS, type GradeBandKey } from '@/lib/constants';
import { splitIntoTeams, shuffleArray } from '@/lib/utils';
import { playButtonClick, playPhaseTransition } from '@/lib/sounds';
import { convertToMultipleChoice } from '@/lib/questionConverter';
import { getCustomQuestionsFiltered, toRuntimeQuestion } from '@/lib/customQuestions';
import { getSupplementaryUnits } from '@/lib/curriculumAliases';
import { getQuestionSets, toRuntimeQuestions, type QuestionSet } from '@/lib/questionSets';
import { Crown, ChevronRight, Users, BookOpen, Settings, Play, Save, FolderOpen, Trash2, Check, Gamepad2, Layers } from 'lucide-react';

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
  // 출제 방식 — 단원 전체(random) vs 교사가 직접 고른 문제 세트(set)
  const [sourceMode, setSourceMode] = useState<'unit' | 'set'>('unit');
  const [questionSets, setQuestionSets] = useState<QuestionSet[]>([]);
  const [selectedSetId, setSelectedSetId] = useState<string | null>(null);

  useEffect(() => {
    setSavedClasses(getSavedClasses());
    const sets = getQuestionSets();
    setQuestionSets(sets);
    // "이 세트로 게임" 링크로 들어온 경우 바로 그 세트를 고른 상태로 시작한다.
    // (정적 export라 useSearchParams 대신 location을 직접 읽는다 — Suspense 경계 불필요)
    const requested = new URLSearchParams(window.location.search).get('set');
    if (requested && sets.some((s) => s.id === requested)) {
      setSelectedSetId(requested);
      setSourceMode('set');
    }
  }, []);

  const selectedSet = questionSets.find((s) => s.id === selectedSetId) ?? null;
  /** 시작을 막은 이유 — 아무 반응 없이 멈추면 교사가 원인을 알 수 없다 */
  const [startError, setStartError] = useState<string | null>(null);

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

  // 교사가 고를 수 있는 단원 = 교과서 단원 + 보충·심화 묶음
  // (보충은 교과서 단원이 아니지만 문항이 실제로 있는 어휘·속담·문장패턴 등이다.
  //  전에는 목록에 없어 4,787문항이 어느 단원을 골라도 나오지 않았다.)
  const gradesForUnits = isNational ? [subGrade] : [...band.grades];
  const textbookUnits = [
    ...new Set(gradesForUnits.flatMap((g) => CURRICULUM_UNITS[String(g)]?.[subject] ?? [])),
  ];
  const extraUnits = [...new Set(gradesForUnits.flatMap((g) => getSupplementaryUnits(g, subject)))];
  const units = [...textbookUnits, ...extraUnits];

  /** 게임을 시작할 수 있는 상태인지 — 버튼 비활성 조건과 시작 조건을 한 곳에서 판단 */
  const canStart =
    students.length >= 4 && (sourceMode === 'set' ? !!selectedSet && selectedSet.questions.length > 0 : !!unit);

  const handleStart = async () => {
    if (!canStart) return;
    playPhaseTransition();

    const [teamAStudents, teamBStudents] = splitIntoTeams(students);

    // 교사가 고른 문제 세트로 시작하는 경로 — 그 문항만 낸다.
    if (sourceMode === 'set' && selectedSet) {
      // 오답 후보는 전체 문제 은행에서 끌어온다. 세트 안 문항만으로는 후보가
      // 모자라 주관식이 통째로 탈락하고 빈 풀로 게임이 시작될 수 있다(실측).
      const { questionsSeed: bank } = await import('@/data/questions-seed');
      const pool = shuffleArray(convertToMultipleChoice(toRuntimeQuestions(selectedSet), bank));
      if (pool.length === 0) {
        setStartError(
          `"${selectedSet.name}" 세트에는 게임에 낼 수 있는 문제가 없습니다. ` +
            '문제 은행에서 4지선다 문항을 더 넣어 세트를 다시 만들어 주세요.'
        );
        return;
      }
      setStartError(null);
      setQuestionPool(pool);
      initGame({
        grade: selectedSet.grade ?? grade,
        subject: selectedSet.subject ?? subject,
        unit: selectedSet.unit ?? selectedSet.name,
        targetScore,
        timerSeconds,
        teamAName,
        teamBName,
        teamAStudents,
        teamBStudents,
      });
      router.push('/game/play');
      return;
    }

    const { questionsSeed } = await import('@/data/questions-seed');
    const gradesInBand = isNational ? [subGrade] : [...band.grades];
    // 1순위: 선택한 단원 문제 (학년군 범위)
    const unitQuestions = questionsSeed.filter(
      (q) => gradesInBand.includes(q.grade) && q.subject === subject && q.unit === unit
    );
    // 예전에는 문항이 50개 미만이면 같은 과목의 "다른 단원" 문제를 채워 넣었다.
    // 그러면 교사가 고른 단원과 실제 출제 단원이 어긋난다(실측: 보충 단원 선택
    // 시 최대 18문항이 타 단원에서 섞여 들어옴). 지금은 모든 교과서 단원이
    // 60문항 이상이라 채워 넣을 이유가 없어졌고, 문항이 적은 단원은 타 단원을
    // 섞는 대신 pickQuestion이 같은 단원 안에서 재출제하도록 둔다.
    const filtered = unitQuestions;
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
    const converted = convertToMultipleChoice(merged, questionsSeed);
    const pool = shuffleArray(converted);

    if (pool.length === 0) {
      setStartError(`"${unit}" 단원에서 낼 수 있는 문제를 찾지 못했습니다. 다른 단원을 골라 주세요.`);
      return;
    }
    setStartError(null);
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
          {/* 단계 전환에 AnimatePresence(mode="wait")를 쓰지 않는다.
              Framer Motion은 rAF 기반이라 탭이 백그라운드로 가면 exit 애니메이션이
              끝나지 않고, mode="wait"는 exit가 끝나야 다음 단계를 마운트한다
              → 교사가 다른 창을 보다 돌아오면 "다음"이 먹지 않는 고착이 생긴다.
              (게임 화면은 커밋 4c8739e에서 같은 이유로 이미 제거했다.) */}
            {step === 1 && (
              <div
                key="step1"
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
              </div>
            )}

            {step === 2 && (
              <div
                key="step2"
                className="flex flex-col gap-6"
              >
                <h2 className="text-3xl font-black text-white">학년군 / 과목 / 단원</h2>

                <div>
                  <label className="text-lg text-gray-400 block mb-3 font-medium">출제 방식</label>
                  <div className="flex gap-3">
                    <motion.button
                      onClick={() => { playButtonClick(); setSourceMode('unit'); }}
                      aria-pressed={sourceMode === 'unit'}
                      className={`flex-1 py-4 rounded-2xl font-black text-xl transition-all ${
                        sourceMode === 'unit'
                          ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white glow-purple'
                          : 'glass text-gray-400 hover:bg-white/5'
                      }`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      단원에서 자동 출제
                    </motion.button>
                    <motion.button
                      onClick={() => { playButtonClick(); setSourceMode('set'); }}
                      aria-pressed={sourceMode === 'set'}
                      className={`flex-1 py-4 rounded-2xl font-black text-xl transition-all flex items-center justify-center gap-2 ${
                        sourceMode === 'set'
                          ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white glow-purple'
                          : 'glass text-gray-400 hover:bg-white/5'
                      }`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Layers className="w-5 h-5" /> 내가 고른 문제 세트
                    </motion.button>
                  </div>
                </div>

                {sourceMode === 'set' ? (
                  <div>
                    <label className="text-lg text-gray-400 block mb-3 font-medium">문제 세트 선택</label>
                    {questionSets.length === 0 ? (
                      <div className="glass rounded-2xl p-6 text-center">
                        <p className="text-gray-400 text-lg mb-3">저장된 문제 세트가 없습니다.</p>
                        <Link
                          href="/questions"
                          className="inline-block px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold"
                        >
                          문제 은행에서 문제 고르러 가기
                        </Link>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-72 overflow-y-auto pr-2">
                        {questionSets.map((qs) => (
                          <motion.button
                            key={qs.id}
                            onClick={() => { playButtonClick(); setSelectedSetId(qs.id); }}
                            aria-pressed={selectedSetId === qs.id}
                            className={`text-left px-6 py-4 rounded-2xl transition-all ${
                              selectedSetId === qs.id
                                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white glow-purple'
                                : 'glass text-gray-400 hover:bg-white/5'
                            }`}
                            whileHover={{ x: 4 }}
                          >
                            <span className="block font-bold text-lg">
                              {selectedSetId === qs.id && <Check className="w-5 h-5 inline-block mr-2" />}
                              {qs.name}
                            </span>
                            <span className="block text-sm opacity-70 mt-1">
                              {qs.questions.length}문항
                              {qs.author ? ` · ${qs.author}` : ''}
                            </span>
                          </motion.button>
                        ))}
                      </div>
                    )}
                    <Link
                      href="/questions/sets"
                      className="mt-3 inline-flex items-center gap-2 text-sm text-purple-300 hover:text-purple-200 underline underline-offset-4"
                    >
                      문제 세트 관리 · 공유받기
                    </Link>
                  </div>
                ) : (
                <>
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

                </>
                )}

                <motion.button
                  onClick={() => handleStepChange(3)}
                  disabled={sourceMode === 'set' ? !selectedSet : !unit}
                  className="w-full py-5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 disabled:from-gray-700 disabled:to-gray-700 disabled:text-gray-500 text-white font-black text-2xl rounded-2xl"
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                >
                  다음
                </motion.button>
              </div>
            )}

            {step === 3 && (
              <div
                key="step3"
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
              </div>
            )}

            {step === 4 && (
              <div
                key="step4"
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
                    {/* 세트 모드에서는 학년군·과목·단원 선택 UI가 뜨지 않으므로
                        로컬 state가 아니라 실제 고른 세트의 값을 보여 준다. */}
                    {sourceMode === 'set' ? (
                      <>
                        <span className="text-gray-500">문제 세트</span>
                        <span className="text-white font-bold text-base leading-relaxed">
                          {selectedSet ? `${selectedSet.name} (${selectedSet.questions.length}문항)` : '선택 안 됨'}
                        </span>
                        <span className="text-gray-500">범위</span>
                        <span className="text-white font-bold text-base leading-relaxed">
                          {selectedSet
                            ? [selectedSet.grade ? `${selectedSet.grade}학년` : null, selectedSet.subject, selectedSet.unit]
                                .filter(Boolean)
                                .join(' · ') || '여러 학년·과목'
                            : '-'}
                        </span>
                      </>
                    ) : (
                      <>
                        <span className="text-gray-500">학년군/과목</span>
                        <span className="text-white font-bold">{band.label} {subject}{isNational ? ` (${subGrade}학년)` : ''}</span>
                        <span className="text-gray-500">단원</span>
                        <span className="text-white font-bold text-base leading-relaxed">{unit}</span>
                      </>
                    )}
                    <span className="text-gray-500">목표 점수</span>
                    <span className="text-white font-bold">{targetScore}점</span>
                    <span className="text-gray-500">제한 시간</span>
                    <span className="text-white font-bold">{timerSeconds}초</span>
                  </div>
                </div>

                {startError && (
                  <p role="alert" className="rounded-2xl bg-red-500/10 border border-red-500/30 px-5 py-4 text-lg text-red-200">
                    {startError}
                  </p>
                )}

                <motion.button
                  onClick={handleStart}
                  disabled={!canStart}
                  className="w-full py-6 bg-gradient-to-r from-purple-600 via-purple-500 to-pink-600 hover:from-purple-500 hover:via-purple-400 hover:to-pink-500 disabled:from-gray-700 disabled:via-gray-700 disabled:to-gray-700 disabled:text-gray-500 text-white rounded-2xl font-black text-3xl transition-shadow hover:shadow-lg hover:shadow-purple-500/20 flex items-center justify-center gap-4"
                  style={{ fontFamily: "var(--font-heading), sans-serif" }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Gamepad2 className="w-9 h-9" />
                  게임 시작!
                </motion.button>
              </div>
            )}
        </div>
      </div>
    </div>
  );
}
