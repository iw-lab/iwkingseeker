import type { Question } from '@/types';

export interface StoredCustomQuestion {
  id: string;
  grade: number;
  subject: string;
  unit: string;
  question_type: 'multiple_choice' | 'ox' | 'fill_blank' | 'short_answer';
  question_text: string;
  options: string[] | null;
  correct_answer: string;
  explanation: string | null;
  difficulty: number;
  created_at: string;
}

const STORAGE_KEY = 'kingseeker_custom_questions';

export function getCustomQuestions(): StoredCustomQuestion[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveCustomQuestions(list: StoredCustomQuestion[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

export function addCustomQuestion(q: Omit<StoredCustomQuestion, 'id' | 'created_at'>): StoredCustomQuestion {
  const list = getCustomQuestions();
  const created: StoredCustomQuestion = {
    ...q,
    id: `custom-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
    created_at: new Date().toISOString(),
  };
  list.push(created);
  saveCustomQuestions(list);
  return created;
}

export function updateCustomQuestion(id: string, patch: Partial<StoredCustomQuestion>) {
  const list = getCustomQuestions().map((q) => (q.id === id ? { ...q, ...patch } : q));
  saveCustomQuestions(list);
}

export function deleteCustomQuestion(id: string) {
  saveCustomQuestions(getCustomQuestions().filter((q) => q.id !== id));
}

export function getCustomQuestionsFiltered(grade: number, subject: string, unit: string): StoredCustomQuestion[] {
  return getCustomQuestions().filter(
    (q) => q.grade === grade && q.subject === subject && q.unit === unit
  );
}

/** Convert stored custom question to runtime Question shape used by the game. */
export function toRuntimeQuestion(c: StoredCustomQuestion): Question {
  return {
    id: c.id,
    grade: c.grade,
    subject: c.subject,
    unit: c.unit,
    unit_code: null,
    question_type: c.question_type,
    question_text: c.question_text,
    options: c.options,
    correct_answer: c.correct_answer,
    explanation: c.explanation,
    difficulty: c.difficulty,
    used_count: 0,
    created_at: c.created_at,
  };
}

export function exportCustomQuestionsJson(): string {
  return JSON.stringify(getCustomQuestions(), null, 2);
}

export function importCustomQuestionsJson(json: string): { added: number; skipped: number; error?: string } {
  try {
    const parsed = JSON.parse(json);
    if (!Array.isArray(parsed)) return { added: 0, skipped: 0, error: '배열 형식이 아닙니다.' };
    const existing = getCustomQuestions();
    const usedIds = new Set(existing.map((q) => q.id));
    let seq = 0;
    const genId = (): string => {
      let id: string;
      do {
        id = `custom-${Date.now().toString(36)}-${(seq++).toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
      } while (usedIds.has(id));
      usedIds.add(id);
      return id;
    };

    const toAdd: StoredCustomQuestion[] = [];
    let skipped = 0;

    for (const q of parsed) {
      if (!q || typeof q !== 'object') { skipped++; continue; }

      const text = typeof q.question_text === 'string' ? q.question_text.trim() : '';
      const answer = typeof q.correct_answer === 'string'
        ? q.correct_answer.trim()
        : q.correct_answer != null ? String(q.correct_answer).trim() : '';
      // 문제/정답이 비면 무효
      if (!text || !answer) { skipped++; continue; }

      const grade = Number(q.grade);
      if (![3, 4, 5, 6].includes(grade)) { skipped++; continue; }

      const qtype: StoredCustomQuestion['question_type'] =
        ['multiple_choice', 'ox', 'fill_blank', 'short_answer'].includes(q.question_type)
          ? q.question_type
          : 'multiple_choice';

      let options: string[] | null = null;
      let correct = answer;

      if (qtype === 'multiple_choice') {
        // 빈 보기 제거 + 중복 제거
        const rawArr: string[] = Array.isArray(q.options)
          ? (q.options as unknown[]).map((x) => String(x).trim())
          : [];
        const uniq = [...new Set(rawArr)].filter((s) => s.length > 0);
        // 선택지 2개 미만이거나 정답이 보기에 없으면 무효(게임에서 정답 클릭 불가 방지)
        if (uniq.length < 2 || !uniq.includes(correct)) { skipped++; continue; }
        options = uniq;
      } else if (qtype === 'ox') {
        const up = answer.toUpperCase();
        if (up !== 'O' && up !== 'X') { skipped++; continue; }
        options = ['O', 'X'];
        correct = up;
      } else {
        options = null; // fill_blank / short_answer
      }

      toAdd.push({
        id: genId(),
        grade,
        subject: String(q.subject || '기타'),
        unit: String(q.unit || '기타'),
        question_type: qtype,
        question_text: text,
        options,
        correct_answer: correct,
        explanation: q.explanation ? String(q.explanation).trim() : null,
        difficulty: [1, 2, 3].includes(Number(q.difficulty)) ? Number(q.difficulty) : 2,
        created_at: typeof q.created_at === 'string' ? q.created_at : new Date().toISOString(),
      });
    }

    saveCustomQuestions([...existing, ...toAdd]);
    return { added: toAdd.length, skipped };
  } catch (e) {
    return { added: 0, skipped: 0, error: e instanceof Error ? e.message : '파싱 실패' };
  }
}
