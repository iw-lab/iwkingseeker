'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { Crown, Search, Layers, CheckSquare, Square, FolderPlus, Shuffle, X, AlertCircle } from 'lucide-react';
import { GRADES, SUBJECTS, CURRICULUM_UNITS, QUESTION_TYPE_LABELS, getUnitsFor, getUnitSemester, type Semester } from '@/lib/constants';
import type { QuestionType } from '@/lib/constants';
import { getSupplementaryUnits } from '@/lib/curriculumAliases';
import { saveQuestionSet, type SetQuestion } from '@/lib/questionSets';
import { addCustomQuestions } from '@/lib/customQuestions';
import SmartText from '@/components/game/SmartText';

interface SeedQuestion {
  grade: number;
  subject: string;
  unit: string;
  question_type: string;
  question_text: string;
  options: string[] | null;
  correct_answer: string;
  explanation: string | null;
  difficulty: number;
}

const PAGE_SIZE = 50;

/** 문항을 가리키는 안정적인 키 — seed에는 id가 없어 내용으로 식별한다 */
const keyOf = (q: SeedQuestion) => `${q.grade}|${q.subject}|${q.question_text}`;

export default function QuestionsPage() {
  const [questions, setQuestions] = useState<SeedQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [grade, setGrade] = useState<number>(5);
  const [subject, setSubject] = useState<string>('수학');
  const [unit, setUnit] = useState<string>('');
  /** 학기 좁히기 — null 이면 전체 */
  const [semester, setSemester] = useState<Semester | null>(null);
  const [search, setSearch] = useState('');
  const [visible, setVisible] = useState(PAGE_SIZE);

  const [selected, setSelected] = useState<Map<string, SeedQuestion>>(new Map());
  const [panel, setPanel] = useState<'none' | 'set' | 'move'>('none');
  const [setName, setSetName] = useState('');
  const [author, setAuthor] = useState('');
  const [moveGrade, setMoveGrade] = useState<number>(5);
  const [moveSubject, setMoveSubject] = useState<string>('수학');
  const [moveUnit, setMoveUnit] = useState<string>('');
  const [message, setMessage] = useState<{ kind: 'ok' | 'error'; text: string } | null>(null);
  const messageTimer = useRef<number | undefined>(undefined);

  const notify = useCallback((kind: 'ok' | 'error', text: string) => {
    setMessage({ kind, text });
    window.clearTimeout(messageTimer.current);
    messageTimer.current = window.setTimeout(() => setMessage(null), 4000);
  }, []);

  useEffect(() => () => window.clearTimeout(messageTimer.current), []);

  useEffect(() => {
    let cancelled = false;
    import('@/data/questions-seed')
      .then(({ questionsSeed }) => {
        if (cancelled) return;
        setQuestions(questionsSeed);
        setLoading(false);
      })
      .catch(() => {
        if (cancelled) return;
        setLoadError(true);
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const unitsForGrade = useCallback(
    (g: number, s: string) => [...(CURRICULUM_UNITS[String(g)]?.[s] ?? []), ...getSupplementaryUnits(g, s)],
    []
  );

  // 학기를 고르면 그 학기 단원 + 보충(학기 없음)만 남긴다
  const units = useMemo(
    () => [...getUnitsFor(grade, subject, semester), ...getSupplementaryUnits(grade, subject)],
    [grade, subject, semester]
  );
  const supplementary = useMemo(() => new Set(getSupplementaryUnits(grade, subject)), [grade, subject]);

  const countsByUnit = useMemo(() => {
    const map = new Map<string, number>();
    for (const q of questions) {
      if (q.grade !== grade || q.subject !== subject) continue;
      map.set(q.unit, (map.get(q.unit) ?? 0) + 1);
    }
    return map;
  }, [questions, grade, subject]);

  const filtered = useMemo(() => {
    const needle = search.trim();
    return questions.filter((q) => {
      if (q.grade !== grade) return false;
      if (q.subject !== subject) return false;
      if (unit && q.unit !== unit) return false;
      // 단원을 안 골랐어도 학기를 골랐으면 그 학기 문항만 (보충 단원은 남긴다)
      if (!unit && semester !== null) {
        const sem = getUnitSemester(grade, subject, q.unit);
        if (sem !== null && sem !== semester) return false;
      }
      if (needle && !q.question_text.includes(needle) && !q.correct_answer.includes(needle)) return false;
      return true;
    });
  }, [questions, grade, subject, unit, semester, search]);

  useEffect(() => setVisible(PAGE_SIZE), [grade, subject, unit, semester, search]);

  useEffect(() => {
    if (unit && !units.includes(unit)) setUnit('');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [semester, grade, subject]);

  const shown = filtered.slice(0, visible);
  const allShownSelected = shown.length > 0 && shown.every((q) => selected.has(keyOf(q)));

  const toggle = (q: SeedQuestion) => {
    setSelected((prev) => {
      const next = new Map(prev);
      const k = keyOf(q);
      if (next.has(k)) next.delete(k);
      else next.set(k, q);
      return next;
    });
  };

  const toggleAllShown = () => {
    setSelected((prev) => {
      const next = new Map(prev);
      if (allShownSelected) shown.forEach((q) => next.delete(keyOf(q)));
      else shown.forEach((q) => next.set(keyOf(q), q));
      return next;
    });
  };

  const toSetQuestion = (q: SeedQuestion, over: Partial<SetQuestion> = {}): SetQuestion => ({
    grade: q.grade,
    subject: q.subject,
    unit: q.unit,
    question_type: q.question_type as SetQuestion['question_type'],
    question_text: q.question_text,
    options: q.options,
    correct_answer: q.correct_answer,
    explanation: q.explanation,
    difficulty: q.difficulty,
    source: 'bank',
    ...over,
  });

  const handleSaveSet = () => {
    const picked = [...selected.values()];
    if (picked.length === 0) return;
    const grades = new Set(picked.map((q) => q.grade));
    const subjects = new Set(picked.map((q) => q.subject));
    const unitsPicked = new Set(picked.map((q) => q.unit));
    try {
      saveQuestionSet({
        name: setName.trim() || `${grade}학년 ${subject} 선택 문제`,
        author: author.trim(),
        grade: grades.size === 1 ? [...grades][0]! : null,
        subject: subjects.size === 1 ? [...subjects][0]! : null,
        unit: unitsPicked.size === 1 ? [...unitsPicked][0]! : null,
        questions: picked.map((q) => toSetQuestion(q)),
      });
      notify('ok', `${picked.length}문항을 세트로 저장했습니다. "문제 세트"에서 공유할 수 있습니다.`);
      setSelected(new Map());
      setPanel('none');
      setSetName('');
    } catch (e) {
      notify('error', e instanceof Error ? e.message : '세트를 저장하지 못했습니다.');
    }
  };

  const handleMoveUnit = () => {
    const picked = [...selected.values()];
    if (picked.length === 0 || !moveUnit) return;
    try {
      // 한 번의 읽기·쓰기로 묶는다(낱개 저장은 수백 개 복사 시 화면이 멈춘다)
      addCustomQuestions(
        picked.map((q) => ({
          grade: moveGrade,
          subject: moveSubject,
          unit: moveUnit,
          question_type: q.question_type as SetQuestion['question_type'],
          question_text: q.question_text,
          options: q.options,
          correct_answer: q.correct_answer,
          explanation: q.explanation,
          difficulty: q.difficulty,
        }))
      );
      notify(
        'ok',
        `${picked.length}문항을 ${moveGrade}학년 ${moveSubject} "${moveUnit}" 단원의 내 문제로 복사했습니다.`
      );
      setSelected(new Map());
      setPanel('none');
    } catch (e) {
      notify('error', e instanceof Error ? e.message : '복사하지 못했습니다.');
    }
  };

  const difficultyLabel = (d: number) => (d === 1 ? '쉬움' : d === 2 ? '보통' : '어려움');
  const difficultyColor = (d: number) =>
    d === 1 ? 'text-green-400 bg-green-400/10' : d === 2 ? 'text-yellow-400 bg-yellow-400/10' : 'text-red-400 bg-red-400/10';

  const moveUnits = unitsForGrade(moveGrade, moveSubject);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1a0a2e] to-[#0d0520] pb-28">
      <header className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
        <Link href="/" className="flex items-center gap-2">
          <Crown className="w-7 h-7 text-yellow-400" />
          <span className="text-xl font-semibold text-white" data-display-font>
            킹시커
          </span>
        </Link>
        <nav className="flex items-center gap-4">
          <Link href="/questions/sets" className="text-gray-400 hover:text-white text-sm font-medium">
            문제 세트
          </Link>
          <Link href="/questions/create" className="text-gray-400 hover:text-white text-sm font-medium">
            내 문제 만들기
          </Link>
          <Link href="/game/setup" className="text-gray-400 hover:text-white text-sm font-medium">
            새 게임
          </Link>
        </nav>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex flex-wrap items-baseline justify-between gap-3 mb-2">
          <h1 className="text-3xl font-extrabold text-white" data-display-font>
            문제 은행
          </h1>
          <Link
            href="/questions/sets"
            className="inline-flex items-center gap-2 text-sm text-purple-300 hover:text-purple-200 font-semibold"
          >
            <Layers className="w-4 h-4" /> 내 문제 세트 / 공유
          </Link>
        </div>
        <p className="text-gray-500 text-sm mb-6">
          문제를 골라 세트로 저장하면 그 문제들만 게임에 낼 수 있고, 다른 선생님께 공유할 수도 있습니다.
        </p>

        {message && (
          <div
            role="status"
            className={`mb-5 flex items-start gap-2 rounded-xl px-4 py-3 text-sm ${
              message.kind === 'ok'
                ? 'bg-green-500/10 text-green-300 border border-green-500/30'
                : 'bg-red-500/10 text-red-300 border border-red-500/30'
            }`}
          >
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
            <span>{message.text}</span>
          </div>
        )}

        {loading ? (
          <p className="py-20 text-center text-gray-500">문제 은행을 불러오는 중…</p>
        ) : loadError ? (
          <p className="py-20 text-center text-red-400">문제 은행을 불러오지 못했습니다. 새로고침해 주세요.</p>
        ) : (
          <>
            <div className="flex flex-wrap gap-3 mb-4">
              <div className="flex gap-1">
                {GRADES.map((g) => (
                  <button
                    key={g}
                    onClick={() => { setGrade(g); setUnit(''); }}
                    aria-pressed={grade === g}
                    className={`px-3 py-1.5 rounded-lg text-sm font-semibold ${
                      grade === g ? 'bg-purple-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                    }`}
                  >
                    {g}학년
                  </button>
                ))}
              </div>

              <div className="flex gap-1">
                {SUBJECTS.map((s) => (
                  <button
                    key={s}
                    onClick={() => { setSubject(s); setUnit(''); }}
                    aria-pressed={subject === s}
                    className={`px-3 py-1.5 rounded-lg text-sm font-semibold ${
                      subject === s ? 'bg-purple-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>

              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="문제·정답 검색…"
                  aria-label="문제 검색"
                  className="pl-9 pr-4 py-1.5 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm outline-none focus:ring-1 focus:ring-purple-500"
                />
              </div>
            </div>

            <div className="flex gap-1 mb-2">
              {([null, 1, 2] as const).map((sem) => (
                <button
                  key={String(sem)}
                  onClick={() => setSemester(sem)}
                  aria-pressed={semester === sem}
                  className={`px-3 py-1 rounded text-xs font-semibold ${
                    semester === sem ? 'bg-purple-600 text-white' : 'bg-gray-800 text-gray-500 hover:bg-gray-700'
                  }`}
                >
                  {sem === null ? '학기 전체' : `${sem}학기`}
                </button>
              ))}
            </div>

            {units.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-5">
                <button
                  onClick={() => setUnit('')}
                  className={`px-2 py-1 rounded text-xs font-medium ${!unit ? 'bg-purple-600 text-white' : 'bg-gray-800 text-gray-500 hover:bg-gray-700'}`}
                >
                  전체
                </button>
                {units.map((u) => (
                  <button
                    key={u}
                    onClick={() => setUnit(u)}
                    title={supplementary.has(u) ? '교과서 단원 밖 보충·심화 묶음' : undefined}
                    className={`px-2 py-1 rounded text-xs font-medium ${
                      unit === u
                        ? 'bg-purple-600 text-white'
                        : supplementary.has(u)
                          ? 'bg-amber-900/30 text-amber-300/80 hover:bg-amber-900/50'
                          : 'bg-gray-800 text-gray-500 hover:bg-gray-700'
                    }`}
                  >
                    {supplementary.has(u) && '＋ '}
                    {u}
                    <span className="ml-1 opacity-60">{countsByUnit.get(u) ?? 0}</span>
                  </button>
                ))}
              </div>
            )}

            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-gray-500">{filtered.length.toLocaleString()}개 문제</p>
              {shown.length > 0 && (
                <button
                  onClick={toggleAllShown}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-purple-300 hover:text-purple-200"
                >
                  {allShownSelected ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
                  화면에 보이는 {shown.length}개 {allShownSelected ? '선택 해제' : '모두 선택'}
                </button>
              )}
            </div>

            <ul className="flex flex-col gap-3">
              {shown.map((q) => {
                const k = keyOf(q);
                const isSelected = selected.has(k);
                return (
                  <li key={k}>
                    <label
                      className={`flex items-start gap-3 rounded-xl border p-4 cursor-pointer transition-colors ${
                        isSelected
                          ? 'bg-purple-600/10 border-purple-500/50'
                          : 'bg-gray-800/60 border-gray-700/50 hover:border-gray-600'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggle(q)}
                        className="mt-1 w-5 h-5 accent-purple-500 shrink-0"
                        aria-label={`${q.question_text} 선택`}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <span className="text-xs text-gray-500">{q.unit || '단원 없음'}</span>
                          <span className={`text-xs px-1.5 py-0.5 rounded ${difficultyColor(q.difficulty)}`}>
                            {difficultyLabel(q.difficulty)}
                          </span>
                          <span className="text-xs text-gray-600">
                            {QUESTION_TYPE_LABELS[q.question_type as QuestionType]}
                          </span>
                        </div>
                        <p className="text-white font-medium"><SmartText text={q.question_text} /></p>
                        {q.options && (
                          <div className="flex flex-wrap gap-2 mt-2">
                            {q.options.map((opt, j) => (
                              <span
                                key={`${k}-opt-${j}`}
                                className={`text-xs px-2 py-1 rounded ${
                                  opt === q.correct_answer
                                    ? 'bg-green-600/20 text-green-400 border border-green-600/30'
                                    : 'bg-gray-700/50 text-gray-400'
                                }`}
                              >
                                <SmartText text={opt} />
                              </span>
                            ))}
                          </div>
                        )}
                        {q.explanation && <p className="text-xs text-gray-500 mt-2">💡 <SmartText text={q.explanation} /></p>}
                      </div>
                      <span className="text-xs text-green-400 font-semibold whitespace-nowrap">정답: <SmartText text={q.correct_answer} /></span>
                    </label>
                  </li>
                );
              })}
            </ul>

            {filtered.length > visible && (
              <div className="flex justify-center py-6">
                <button
                  onClick={() => setVisible((v) => v + PAGE_SIZE)}
                  className="px-6 py-2.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-200 text-sm font-semibold"
                >
                  {Math.min(PAGE_SIZE, filtered.length - visible)}개 더 보기 (남은 {(filtered.length - visible).toLocaleString()}개)
                </button>
              </div>
            )}
            {filtered.length === 0 && <p className="py-16 text-center text-gray-600">조건에 맞는 문제가 없습니다.</p>}
          </>
        )}
      </main>

      {/* 선택 도구막대 */}
      {/* 도구막대는 애니메이션 없이 즉시 표시한다. initial={{y:80}} 로 두면
          백그라운드 탭에서 rAF가 멈춰 화면 밖에 고착되고, 교사가 "세트로 저장"을
          누를 수 없게 된다(설정 화면에서 실제로 재현된 고착과 같은 원인). */}
      {selected.size > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-30 border-t border-purple-500/30 bg-[#160a26]/95 backdrop-blur px-6 py-4">
            <div className="max-w-6xl mx-auto">
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-white font-semibold">{selected.size}문항 선택됨</span>
                <button
                  onClick={() => setSelected(new Map())}
                  className="inline-flex items-center gap-1 text-xs text-gray-400 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" /> 선택 해제
                </button>
                <div className="flex-1" />
                <button
                  onClick={() => setPanel(panel === 'move' ? 'none' : 'move')}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-700 hover:bg-gray-600 text-white text-sm font-semibold"
                >
                  <Shuffle className="w-4 h-4" /> 다른 단원으로 복사
                </button>
                <button
                  onClick={() => setPanel(panel === 'set' ? 'none' : 'set')}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-sm font-semibold"
                >
                  <FolderPlus className="w-4 h-4" /> 문제 세트로 저장
                </button>
              </div>

              {panel === 'set' && (
                <div className="mt-4 flex flex-wrap items-end gap-3">
                  <label className="flex flex-col gap-1 flex-1 min-w-[220px]">
                    <span className="text-xs text-gray-400 font-semibold">세트 이름</span>
                    <input
                      value={setName}
                      onChange={(e) => setSetName(e.target.value)}
                      placeholder={`${grade}학년 ${subject} 선택 문제`}
                      className="px-3 py-2 rounded-xl bg-gray-900 border border-gray-700 text-white text-sm outline-none focus:ring-1 focus:ring-purple-500"
                    />
                  </label>
                  <label className="flex flex-col gap-1 w-44">
                    <span className="text-xs text-gray-400 font-semibold">만든이 (공유 시 표시)</span>
                    <input
                      value={author}
                      onChange={(e) => setAuthor(e.target.value)}
                      placeholder="예: 5학년 2반 김교사"
                      className="px-3 py-2 rounded-xl bg-gray-900 border border-gray-700 text-white text-sm outline-none focus:ring-1 focus:ring-purple-500"
                    />
                  </label>
                  <button
                    onClick={handleSaveSet}
                    className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-sm font-semibold"
                  >
                    저장
                  </button>
                </div>
              )}

              {panel === 'move' && (
                <div className="mt-4 flex flex-wrap items-end gap-3">
                  <label className="flex flex-col gap-1">
                    <span className="text-xs text-gray-400 font-semibold">학년</span>
                    <select
                      value={moveGrade}
                      onChange={(e) => { setMoveGrade(Number(e.target.value)); setMoveUnit(''); }}
                      className="px-3 py-2 rounded-xl bg-gray-900 border border-gray-700 text-white text-sm outline-none"
                    >
                      {GRADES.map((g) => (
                        <option key={g} value={g}>{g}학년</option>
                      ))}
                    </select>
                  </label>
                  <label className="flex flex-col gap-1">
                    <span className="text-xs text-gray-400 font-semibold">과목</span>
                    <select
                      value={moveSubject}
                      onChange={(e) => { setMoveSubject(e.target.value); setMoveUnit(''); }}
                      className="px-3 py-2 rounded-xl bg-gray-900 border border-gray-700 text-white text-sm outline-none"
                    >
                      {SUBJECTS.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </label>
                  <label className="flex flex-col gap-1 flex-1 min-w-[240px]">
                    <span className="text-xs text-gray-400 font-semibold">옮길 단원</span>
                    <select
                      value={moveUnit}
                      onChange={(e) => setMoveUnit(e.target.value)}
                      className="px-3 py-2 rounded-xl bg-gray-900 border border-gray-700 text-white text-sm outline-none"
                    >
                      <option value="">단원을 고르세요</option>
                      {moveUnits.map((u) => (
                        <option key={u} value={u}>{u}</option>
                      ))}
                    </select>
                  </label>
                  <button
                    onClick={handleMoveUnit}
                    disabled={!moveUnit}
                    className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:bg-gray-700 disabled:text-gray-500 text-white text-sm font-semibold"
                  >
                    복사
                  </button>
                  <p className="w-full text-xs text-gray-500">
                    원본은 그대로 두고 “내 문제”로 복사합니다. 복사한 문제는 그 단원을 고르면 게임에 함께 나옵니다.
                  </p>
                </div>
              )}
            </div>
        </div>
      )}
    </div>
  );
}
