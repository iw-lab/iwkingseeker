'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Crown,
  Plus,
  Trash2,
  Pencil,
  Save,
  X,
  ArrowLeft,
  BookOpen,
  Download,
  Upload,
  Sparkles,
} from 'lucide-react';
import { GRADES, SUBJECTS, CURRICULUM_BY_SEMESTER, QUESTION_TYPE_LABELS } from '@/lib/constants';
import {
  getCustomQuestions,
  addCustomQuestion,
  updateCustomQuestion,
  deleteCustomQuestion,
  exportCustomQuestionsJson,
  importCustomQuestionsJson,
  type StoredCustomQuestion,
} from '@/lib/customQuestions';
import { cn } from '@/lib/utils';

type QuestionType = StoredCustomQuestion['question_type'];

interface FormState {
  grade: number;
  subject: string;
  unit: string;
  question_type: QuestionType;
  question_text: string;
  options: string[];
  correct_answer: string;
  explanation: string;
  difficulty: number;
}

const EMPTY_FORM: FormState = {
  grade: 5,
  subject: '수학',
  unit: '',
  question_type: 'multiple_choice',
  question_text: '',
  options: ['', '', '', ''],
  correct_answer: '',
  explanation: '',
  difficulty: 2,
};

/** 작성 중인 내용이 있는지 — 빈 폼과 비교해 "버릴 게 있나"를 판단한다 */
function isFormDirty(f: FormState): boolean {
  return (
    f.question_text.trim() !== '' ||
    f.correct_answer.trim() !== '' ||
    f.explanation.trim() !== '' ||
    f.unit.trim() !== '' ||
    f.options.some((o) => o.trim() !== '' && o.trim() !== 'O' && o.trim() !== 'X')
  );
}

const DRAFT_KEY = 'kingseeker_question_draft_v1';

export default function CustomQuestionCreatorPage() {
  const [list, setList] = useState<StoredCustomQuestion[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [filterGrade, setFilterGrade] = useState<number | 'all'>('all');
  const [filterSubject, setFilterSubject] = useState<string>('all');
  const [toast, setToast] = useState<string | null>(null);
  /** 닫기를 눌렀는데 작성 중인 내용이 있을 때만 뜨는 확인 단계 */
  const [confirmClose, setConfirmClose] = useState(false);

  useEffect(() => {
    setList(getCustomQuestions());
  }, []);

  // 초안 자동저장 — 실수로 닫거나 새로고침해도 쓰던 문제가 남는다.
  // (기존에는 오버레이를 한 번 잘못 누르면 입력 전체가 그 자리에서 사라졌다.)
  useEffect(() => {
    if (!showForm || editingId) return;
    const t = setTimeout(() => {
      try {
        if (isFormDirty(form)) localStorage.setItem(DRAFT_KEY, JSON.stringify(form));
        else localStorage.removeItem(DRAFT_KEY);
      } catch {
        /* 저장소가 막혀 있어도 작성은 계속돼야 한다 */
      }
    }, 600);
    return () => clearTimeout(t);
  }, [form, showForm, editingId]);

  // ESC로 닫기 — 작성 중이면 확인 단계를 거친다
  useEffect(() => {
    if (!showForm) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      e.preventDefault();
      if (isFormDirty(form)) setConfirmClose(true);
      else discardForm();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showForm, form]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2200);
  };

  // 단원 고르개는 학기별로 묶어 보여 준다 — 교사가 지금 학기를 먼저 본다
  const unitsBySemester = CURRICULUM_BY_SEMESTER[String(form.grade)]?.[form.subject] ?? { 1: [], 2: [] };
  const units = [...unitsBySemester[1], ...unitsBySemester[2]];

  const filtered = useMemo(() => {
    return list.filter((q) => {
      if (filterGrade !== 'all' && q.grade !== filterGrade) return false;
      if (filterSubject !== 'all' && q.subject !== filterSubject) return false;
      return true;
    });
  }, [list, filterGrade, filterSubject]);

  const groupedBySubject = useMemo(() => {
    const map = new Map<string, StoredCustomQuestion[]>();
    for (const q of filtered) {
      const key = `${q.grade}학년 · ${q.subject}`;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(q);
    }
    return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b, 'ko'));
  }, [filtered]);

  /** 저장에 성공했을 때만 부르는 정리 — 초안도 함께 지운다 */
  const resetForm = () => {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setShowForm(false);
    setConfirmClose(false);
    try {
      localStorage.removeItem(DRAFT_KEY);
    } catch {
      /* noop */
    }
  };

  /** 작성 중인 내용을 버리고 닫는다(확인을 이미 거친 뒤) */
  const discardForm = () => {
    resetForm();
  };

  /** 닫기 요청 — 쓰던 내용이 있으면 바로 닫지 않고 물어본다 */
  const requestClose = () => {
    if (isFormDirty(form)) {
      setConfirmClose(true);
      return;
    }
    discardForm();
  };

  const startCreate = () => {
    let draft: FormState | null = null;
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<FormState>;
        if (parsed && typeof parsed.question_text === 'string') {
          draft = { ...EMPTY_FORM, ...parsed, options: Array.isArray(parsed.options) ? parsed.options : EMPTY_FORM.options };
        }
      }
    } catch {
      draft = null;
    }
    setForm(draft ?? EMPTY_FORM);
    setEditingId(null);
    setConfirmClose(false);
    setShowForm(true);
    if (draft) showToast('저장하지 않고 닫았던 문제를 이어서 씁니다.');
  };

  const startEdit = (q: StoredCustomQuestion) => {
    setForm({
      grade: q.grade,
      subject: q.subject,
      unit: q.unit,
      question_type: q.question_type,
      question_text: q.question_text,
      options: q.options ?? (q.question_type === 'ox' ? ['O', 'X'] : ['', '', '', '']),
      correct_answer: q.correct_answer,
      explanation: q.explanation ?? '',
      difficulty: q.difficulty,
    });
    setEditingId(q.id);
    setConfirmClose(false);
    setShowForm(true);
  };

  const handleSubmit = () => {
    if (!form.question_text.trim()) {
      showToast('문제 내용을 입력하세요.');
      return;
    }
    if (!form.correct_answer.trim()) {
      showToast('정답을 입력하세요.');
      return;
    }
    if (form.question_type === 'multiple_choice') {
      // 저장 시 trim하므로 검증도 trim 기준으로 일관되게 비교
      const filledOptions = form.options.map((o) => o.trim()).filter(Boolean);
      if (filledOptions.length < 2) {
        showToast('4지선다는 선택지를 2개 이상 입력해야 합니다.');
        return;
      }
      if (!filledOptions.includes(form.correct_answer.trim())) {
        showToast('정답이 선택지 중에 없습니다.');
        return;
      }
    }
    if (form.question_type === 'ox' && !['O', 'X'].includes(form.correct_answer.trim().toUpperCase())) {
      showToast("OX 문제의 정답은 O 또는 X 여야 합니다.");
      return;
    }

    const options =
      form.question_type === 'ox'
        ? ['O', 'X']
        : form.question_type === 'multiple_choice'
        ? form.options.map((o) => o.trim()).filter(Boolean)
        : null;

    const payload: Omit<StoredCustomQuestion, 'id' | 'created_at'> = {
      grade: form.grade,
      subject: form.subject,
      unit: form.unit.trim(),
      question_type: form.question_type,
      question_text: form.question_text.trim(),
      options,
      correct_answer: form.correct_answer.trim(),
      explanation: form.explanation.trim() || null,
      difficulty: form.difficulty,
    };

    if (editingId) {
      updateCustomQuestion(editingId, payload);
      showToast('문제가 수정됐습니다.');
    } else {
      addCustomQuestion(payload);
      showToast('문제가 추가됐습니다.');
    }
    setList(getCustomQuestions());
    resetForm();
  };

  const handleDelete = (id: string) => {
    if (!confirm('이 문제를 삭제할까요?')) return;
    deleteCustomQuestion(id);
    setList(getCustomQuestions());
    showToast('삭제됐습니다.');
  };

  const handleExport = () => {
    const data = exportCustomQuestionsJson();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `kingseeker-custom-questions-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('내보내기 완료!');
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const json = String(reader.result ?? '');
      const result = importCustomQuestionsJson(json);
      if (result.error) {
        showToast(`가져오기 실패: ${result.error}`);
      } else {
        setList(getCustomQuestions());
        showToast(
          result.skipped > 0
            ? `${result.added}개 가져옴 · ${result.skipped}개 건너뜀(형식 오류)`
            : `${result.added}개 문제를 가져왔습니다.`
        );
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="min-h-screen bg-mesh bg-mesh-animated overflow-x-hidden relative noise-overlay">
      {/* Header */}
      <header className="relative z-10 flex items-center justify-between px-4 md:px-8 py-4 flex-wrap gap-3">
        <Link href="/" className="flex items-center gap-2 text-white hover:text-purple-300 transition-colors">
          <ArrowLeft className="w-5 h-5" />
          <Crown className="w-6 h-6 text-yellow-400" />
          <span className="text-lg font-bold">KingSeeker</span>
        </Link>
        <div className="flex items-center gap-2">
          <label className="cursor-pointer">
            <input type="file" accept="application/json" onChange={handleImport} className="hidden" />
            <span className="flex items-center gap-1.5 px-3 py-2 glass rounded-lg text-sm text-gray-300 hover:text-white hover:bg-white/10 transition-colors">
              <Upload className="w-4 h-4" />
              불러오기
            </span>
          </label>
          <button
            onClick={handleExport}
            className="flex items-center gap-1.5 px-3 py-2 glass rounded-lg text-sm text-gray-300 hover:text-white hover:bg-white/10 transition-colors"
          >
            <Download className="w-4 h-4" />
            내보내기
          </button>
          <Link
            href="/game/setup"
            className="flex items-center gap-1.5 px-3 py-2 glass-strong rounded-lg text-sm font-semibold text-white hover:bg-white/15 transition-colors"
          >
            게임 시작
          </Link>
        </div>
      </header>

      <main className="relative z-10 max-w-5xl mx-auto px-4 pb-20">
        <div className="flex items-center gap-3 mt-4 mb-2">
          <BookOpen className="w-7 h-7 text-purple-400" />
          <h1
            className="text-3xl md:text-4xl font-extrabold text-gradient-gold" data-display-font
          >
            내 문제 만들기
          </h1>
        </div>
        <p className="text-gray-400 text-sm md:text-base mb-6">
          직접 만든 문제는 이 기기에 저장되고, 게임 설정에서 학년·과목·단원이 일치하면 자동으로 풀에 포함됩니다.
        </p>

        {/* Filters + Create button */}
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400">학년</span>
            <select
              value={filterGrade}
              onChange={(e) => setFilterGrade(e.target.value === 'all' ? 'all' : Number(e.target.value))}
              className="px-3 py-2 glass rounded-lg text-sm text-white bg-transparent border border-white/10"
            >
              <option value="all" className="bg-slate-900">전체</option>
              {GRADES.map((g) => (
                <option key={g} value={g} className="bg-slate-900">
                  {g}학년
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400">과목</span>
            <select
              value={filterSubject}
              onChange={(e) => setFilterSubject(e.target.value)}
              className="px-3 py-2 glass rounded-lg text-sm text-white bg-transparent border border-white/10"
            >
              <option value="all" className="bg-slate-900">전체</option>
              {SUBJECTS.map((s) => (
                <option key={s} value={s} className="bg-slate-900">
                  {s}
                </option>
              ))}
            </select>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <span className="text-xs text-purple-300/80">
              총 <b className="text-white">{list.length}</b>개 · 보이는 문제 <b className="text-white">{filtered.length}</b>개
            </span>
            <button
              onClick={startCreate}
              className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg font-semibold text-white shadow-lg hover:brightness-110 transition-all"
            >
              <Plus className="w-4 h-4" />새 문제
            </button>
          </div>
        </div>

        {/* Question List */}
        {list.length === 0 ? (
          <div className="glass rounded-2xl p-12 text-center text-gray-400">
            <Sparkles className="w-10 h-10 mx-auto mb-3 text-purple-400/60" />
            <p className="text-lg font-bold text-gray-300 mb-2">아직 만든 문제가 없어요</p>
            <p className="text-sm">
              &lsquo;새 문제&rsquo; 버튼을 눌러 우리 반만의 특별한 문제를 만들어 보세요.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            {groupedBySubject.map(([group, items]) => (
              <div key={group}>
                <h2 className="text-sm font-semibold text-purple-300 mb-2">{group} · {items.length}문제</h2>
                <div className="flex flex-col gap-2">
                  {items.map((q) => (
                    <div
                      key={q.id}
                      className="glass rounded-xl p-4 flex items-start gap-3 group hover:bg-white/[0.06] transition-colors"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1.5">
                          <span className="text-[10px] px-2 py-0.5 bg-purple-500/20 text-purple-300 rounded">
                            {QUESTION_TYPE_LABELS[q.question_type]}
                          </span>
                          <span className="text-[10px] px-2 py-0.5 bg-white/5 text-gray-400 rounded">
                            {q.unit || '단원 없음'}
                          </span>
                          <span className="text-[10px] px-2 py-0.5 bg-yellow-500/20 text-yellow-300 rounded">
                            난이도 {q.difficulty}
                          </span>
                        </div>
                        <p className="text-white font-medium text-sm md:text-base leading-snug break-words">
                          {q.question_text}
                        </p>
                        {q.options && q.question_type === 'multiple_choice' && (
                          <p className="text-xs text-gray-500 mt-1 truncate">
                            {q.options.map((o) => (o === q.correct_answer ? `✓ ${o}` : o)).join(' · ')}
                          </p>
                        )}
                        {q.question_type !== 'multiple_choice' && (
                          <p className="text-xs text-green-400 mt-1">정답: {q.correct_answer}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => startEdit(q)}
                          className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                          title="수정"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(q.id)}
                          className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                          title="삭제"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Modal form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            className="fixed inset-0 z-50 flex items-start md:items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={requestClose}
          >
            <motion.div
              className="relative glass-strong rounded-2xl w-full max-w-2xl my-8 p-6 border border-white/10"
              initial={{ y: 30, opacity: 0, scale: 0.96 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 20, opacity: 0, scale: 0.96 }}
              onClick={(e) => e.stopPropagation()}
            >
              {confirmClose && (
                <div className="absolute inset-0 z-10 rounded-2xl bg-slate-950/90 backdrop-blur-sm flex flex-col items-center justify-center gap-4 p-6 text-center">
                  <p className="text-lg font-semibold text-white">작성 중인 문제를 버릴까요?</p>
                  <p className="text-sm text-gray-400">
                    지금 닫아도 초안은 저장돼 있어, 다음에 &lsquo;새 문제&rsquo;를 열면 이어서 쓸 수 있어요.
                  </p>
                  <div className="flex gap-2 w-full max-w-xs">
                    <button
                      onClick={() => setConfirmClose(false)}
                      className="flex-1 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold"
                    >
                      계속 쓰기
                    </button>
                    <button
                      onClick={() => {
                        setConfirmClose(false);
                        setForm(EMPTY_FORM);
                        setEditingId(null);
                        setShowForm(false);
                      }}
                      className="flex-1 py-3 rounded-xl glass border border-white/10 text-gray-300 hover:text-white font-semibold"
                    >
                      닫기
                    </button>
                  </div>
                </div>
              )}
              <button
                onClick={requestClose}
                aria-label="닫기"
                className="absolute top-3 right-3 p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
              <h2
                className="text-2xl font-extrabold text-white mb-5" data-display-font
              >
                {editingId ? '문제 수정' : '새 문제 만들기'}
              </h2>

              <div className="grid grid-cols-3 gap-3 mb-4">
                <Field label="학년">
                  <select
                    value={form.grade}
                    onChange={(e) => setForm((f) => ({ ...f, grade: Number(e.target.value), unit: '' }))}
                    className="input-field"
                  >
                    {GRADES.map((g) => (
                      <option key={g} value={g} className="bg-slate-900">
                        {g}학년
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="과목">
                  <select
                    value={form.subject}
                    onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value, unit: '' }))}
                    className="input-field"
                  >
                    {SUBJECTS.map((s) => (
                      <option key={s} value={s} className="bg-slate-900">
                        {s}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="난이도">
                  <select
                    value={form.difficulty}
                    onChange={(e) => setForm((f) => ({ ...f, difficulty: Number(e.target.value) }))}
                    className="input-field"
                  >
                    <option value={1} className="bg-slate-900">1 · 쉬움</option>
                    <option value={2} className="bg-slate-900">2 · 보통</option>
                    <option value={3} className="bg-slate-900">3 · 어려움</option>
                  </select>
                </Field>
              </div>

              <Field label="단원 (선택 사항 — 비워 두면 '단원 없음'으로 저장됩니다)">
                <select
                  value={units.includes(form.unit) || form.unit === '' ? form.unit : '__custom__'}
                  onChange={(e) => {
                    const v = e.target.value;
                    setForm((f) => ({ ...f, unit: v === '__custom__' ? (units.includes(f.unit) ? '' : f.unit) : v }));
                  }}
                  className="input-field"
                >
                  <option value="" className="bg-slate-900">
                    단원 없음 (건너뛰기)
                  </option>
                  {([1, 2] as const).map((sem) =>
                    unitsBySemester[sem].length > 0 ? (
                      <optgroup key={sem} label={`${sem}학기`}>
                        {unitsBySemester[sem].map((u) => (
                          <option key={u} value={u} className="bg-slate-900">
                            {u}
                          </option>
                        ))}
                      </optgroup>
                    ) : null
                  )}
                  <option value="__custom__" className="bg-slate-900">
                    직접 입력…
                  </option>
                </select>
                {!units.includes(form.unit) && form.unit !== '' && (
                  <input
                    value={form.unit}
                    onChange={(e) => setForm((f) => ({ ...f, unit: e.target.value }))}
                    placeholder="단원 이름을 직접 입력"
                    className="input-field mt-2"
                  />
                )}
              </Field>

              <Field label="문제 유형">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {(['multiple_choice', 'ox', 'fill_blank', 'short_answer'] as const).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() =>
                        setForm((f) => ({
                          ...f,
                          question_type: t,
                          options: t === 'ox' ? ['O', 'X'] : t === 'multiple_choice' ? (f.options.length === 4 ? f.options : ['', '', '', '']) : f.options,
                          correct_answer: t === 'ox' ? 'O' : f.correct_answer,
                        }))
                      }
                      className={cn(
                        'py-2 px-3 rounded-lg text-sm font-semibold border transition-all',
                        form.question_type === t
                          ? 'bg-purple-600/30 border-purple-400 text-white'
                          : 'glass border-white/10 text-gray-400 hover:text-white'
                      )}
                    >
                      {QUESTION_TYPE_LABELS[t]}
                    </button>
                  ))}
                </div>
              </Field>

              <Field label="문제">
                <textarea
                  value={form.question_text}
                  onChange={(e) => setForm((f) => ({ ...f, question_text: e.target.value }))}
                  placeholder="예) 2022 개정 교육과정에서 분수의 덧셈을 처음 배우는 학년은?"
                  rows={2}
                  className="input-field resize-none"
                />
              </Field>

              {form.question_type === 'multiple_choice' && (
                <Field label="선택지 (정답을 그대로 아래 '정답'에 입력)">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {form.options.map((opt, i) => (
                      <input
                        key={i}
                        value={opt}
                        onChange={(e) => {
                          const next = [...form.options];
                          next[i] = e.target.value;
                          setForm((f) => ({ ...f, options: next }));
                        }}
                        placeholder={`선택지 ${i + 1}`}
                        className="input-field"
                      />
                    ))}
                  </div>
                </Field>
              )}

              <Field label={form.question_type === 'ox' ? '정답 (O 또는 X)' : '정답'}>
                {form.question_type === 'ox' ? (
                  <div className="flex gap-2">
                    {['O', 'X'].map((v) => (
                      <button
                        key={v}
                        type="button"
                        onClick={() => setForm((f) => ({ ...f, correct_answer: v }))}
                        className={cn(
                          'w-20 h-12 rounded-lg font-extrabold text-2xl border transition-all',
                          form.correct_answer === v
                            ? v === 'O'
                              ? 'bg-blue-600/40 border-blue-400 text-white'
                              : 'bg-red-600/40 border-red-400 text-white'
                            : 'glass border-white/10 text-gray-400 hover:text-white'
                        )}
                      >
                        {v}
                      </button>
                    ))}
                  </div>
                ) : (
                  <input
                    value={form.correct_answer}
                    onChange={(e) => setForm((f) => ({ ...f, correct_answer: e.target.value }))}
                    placeholder="정답을 입력하세요"
                    className="input-field"
                  />
                )}
              </Field>

              <Field label="해설 (선택)">
                <textarea
                  value={form.explanation}
                  onChange={(e) => setForm((f) => ({ ...f, explanation: e.target.value }))}
                  placeholder="정답을 맞히면 학생에게 보여줄 해설"
                  rows={2}
                  className="input-field resize-none"
                />
              </Field>

              <div className="flex gap-2 mt-5">
                <button
                  onClick={requestClose}
                  className="flex-1 py-3 rounded-xl glass border border-white/10 text-gray-300 hover:text-white hover:bg-white/10 font-semibold"
                >
                  취소
                </button>
                <button
                  onClick={handleSubmit}
                  className="flex-1 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold flex items-center justify-center gap-2 hover:brightness-110"
                >
                  <Save className="w-4 h-4" />
                  {editingId ? '수정 완료' : '문제 저장'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[60] px-5 py-3 rounded-xl glass-strong text-white font-semibold text-sm shadow-xl border border-white/10"
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx>{`
        .input-field {
          width: 100%;
          padding: 0.625rem 0.875rem;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 0.5rem;
          color: white;
          font-size: 0.875rem;
          outline: none;
          transition: border-color 0.15s, background 0.15s;
        }
        .input-field:focus {
          border-color: rgba(168, 85, 247, 0.6);
          background: rgba(255, 255, 255, 0.05);
        }
      `}</style>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mb-3">
      <label className="block text-xs text-gray-400 mb-1 font-semibold">{label}</label>
      {children}
    </div>
  );
}
