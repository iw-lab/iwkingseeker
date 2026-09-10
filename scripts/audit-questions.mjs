/**
 * 문제 은행 전수 감사 — `npm run audit:questions`
 *
 * 정합성 계층(lib/questionSanitizer.ts)을 통과한 최종 문제 풀을 검사하고,
 * CRITICAL이 하나라도 남아 있으면 exit 1로 빌드를 막는다.
 * 또한 교사가 실제로 선택하게 되는 "단원별 출제 가능 문항 수"를 함께 보고한다.
 *
 * Node 의 TypeScript 타입 스트리핑 + scripts/register-ts.mjs 로 소스를 그대로 import 한다.
 */
import { dirname, resolve as presolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = presolve(dirname(fileURLToPath(import.meta.url)), '..');
const SRC = presolve(ROOT, 'src');

const { questionsSeed, questionSeedSanitizeSummary } = await import(pathToFileURL(presolve(SRC, 'data/questions-seed.ts')).href);
const { valueKey, normText } = await import(pathToFileURL(presolve(SRC, 'lib/questionSanitizer.ts')).href);
const { CURRICULUM_UNITS, SUBJECTS, GRADE_BANDS, NATIONAL_SUBJECTS } = await import(pathToFileURL(presolve(SRC, 'lib/constants.ts')).href);
const { getSupplementaryUnits } = await import(pathToFileURL(presolve(SRC, 'lib/curriculumAliases.ts')).href);
const { convertToMultipleChoice } = await import(pathToFileURL(presolve(SRC, 'lib/questionConverter.ts')).href);

/** 교사가 화면에서 실제로 고를 수 있는 단원 = 교과서 단원 + 보충·심화 */
const selectableUnits = (grade, subject) => [
  ...(CURRICULUM_UNITS[String(grade)]?.[subject] ?? []),
  ...getSupplementaryUnits(grade, subject),
];

const MIN_PLAYABLE_PER_UNIT = Number(process.env.MIN_PER_UNIT ?? 30);

/**
 * 실제 게임에서 출제 가능한 문항 수.
 * setup 화면과 같은 경로를 태운다 — 주관식·빈칸은 questionConverter가
 * 객관식으로 바꾸고(그럴듯한 오답을 못 만들면 탈락), OX는 pickQuestion이 제외한다.
 */
function playableCount(pool) {
  // setup 화면과 동일하게 전체 은행을 오답 후보로 넘긴다(2번째 인자를 빼면 실제보다 적게 나온다).
  return convertToMultipleChoice(pool, questionsSeed).filter((q) => q.question_type === 'multiple_choice').length;
}

const findings = [];
const record = (severity, code, q, detail = '') =>
  findings.push({ severity, code, detail, grade: q?.grade, subject: q?.subject, unit: q?.unit, text: q?.question_text });

/** 붙여 쓰기도 허용되는 본용언+보조 용언 꼴 (한글 맞춤법 제47항) */
const RE_AUX_VERB = /(만하다|척하다|체하다|듯하다|법하다|성싶다|어 보다|아 보다|어 주다|아 주다|어 드리다|어 버리다|아 버리다|어 두다|아 두다|어 놓다|아 놓다|어 가다|아 가다|어 오다|아 오다|고 싶다|고 있다|고 말다)/;

const seenText = new Map();

for (const q of questionsSeed) {
  const answer = normText(q.correct_answer);

  if (!answer) record('CRIT', 'EMPTY_ANSWER', q);
  if (!normText(q.question_text)) record('CRIT', 'EMPTY_TEXT', q);
  if (!SUBJECTS.includes(q.subject)) record('HIGH', 'BAD_SUBJECT', q, q.subject);
  if (!Number.isInteger(q.difficulty) || q.difficulty < 1 || q.difficulty > 3)
    record('HIGH', 'BAD_DIFFICULTY', q, String(q.difficulty));
  if (!q.explanation || !String(q.explanation).trim()) record('MED', 'NO_EXPLANATION', q);

  const known = selectableUnits(q.grade, q.subject);
  if (known.length && !known.includes(q.unit))
    record('HIGH', 'UNIT_NOT_SELECTABLE', q, q.unit);

  const key = `${q.grade}|${q.subject}|${normText(q.question_text)}`;
  const prev = seenText.get(key);
  if (prev) {
    record(
      normText(prev.correct_answer) === answer ? 'MED' : 'CRIT',
      normText(prev.correct_answer) === answer ? 'DUPLICATE_QUESTION' : 'CONTRADICTORY_DUPLICATE',
      q,
      `이전 정답=${prev.correct_answer} / 현재 정답=${answer}`
    );
  } else {
    seenText.set(key, q);
  }

  if (q.question_type === 'multiple_choice') {
    const opts = q.options;
    if (!Array.isArray(opts)) {
      record('CRIT', 'MC_NO_OPTIONS', q);
      continue;
    }
    if (opts.length < 3) record('CRIT', 'MC_TOO_FEW_OPTIONS', q, String(opts.length));
    else if (opts.length !== 4) record('MED', 'MC_OPT_COUNT', q, String(opts.length));

    if (!opts.some((o) => normText(o) === answer))
      record('CRIT', 'ANSWER_NOT_IN_OPTIONS', q, JSON.stringify(opts));

    const keys = opts.map(valueKey);
    const answerKey = valueKey(answer);
    if (keys.filter((k) => k === answerKey).length > 1)
      record('CRIT', 'MULTIPLE_CORRECT_OPTIONS', q, JSON.stringify(opts));
    if (new Set(keys).size !== keys.length)
      record('HIGH', 'EQUIVALENT_DISTRACTORS', q, JSON.stringify(opts));
    if (opts.some((o) => /^보기\s*\d+$/.test(normText(o)) || /오답\d/.test(String(o))))
      record('HIGH', 'DUMMY_OPTION', q, JSON.stringify(opts));

    // 한글 맞춤법 제47항: 본용언+보조 용언은 띄어 쓰는 것이 원칙이나 붙여 쓰는 것도 허용된다.
    // 따라서 정답이 "먹을 만하다"인데 "먹을만하다"를 오답으로 두면 정답이 둘이 된다.
    // valueKey는 띄어쓰기를 내용으로 보므로(띄어쓰기 문항 때문에) 이 경우를 잡지 못한다.
    // 붙여 쓴 형태가 오답에 들어 있을 때만 걸러 오탐을 줄인다.
    if (RE_AUX_VERB.test(answer) && /\s/.test(answer)) {
      const joined = answer.replace(/\s+/g, '');
      if (opts.some((o) => normText(o) !== answer && normText(o).replace(/\s+/g, '') === joined && !/\s/.test(normText(o))))
        record('CRIT', 'AUX_SPACING_BOTH_VALID', q, JSON.stringify(opts));
    }
  } else if (q.question_type === 'ox') {
    if (!['O', 'X'].includes(answer)) record('CRIT', 'OX_BAD_ANSWER', q, answer);
  }
}

// 찍기 취약도 — "제일 긴 보기"만 골라도 맞는 비율.
// 정답만 길고 오답은 짧게 쓰면 내용을 몰라도 정답이 보인다. 기준선은 25%.
// 게임의 보기 섞기는 순서만 바꾸므로 이 취약점은 섞어도 그대로 남는다.
function longestOnly(opts) {
  const lens = opts.map((o) => normText(o).length);
  const mx = Math.max(...lens);
  if (lens.filter((l) => l === mx).length !== 1) return null; // 최장이 여럿이면 찍을 수 없다
  return normText(opts[lens.indexOf(mx)]);
}
const guessStats = { total: 0, hit: 0, byUnit: new Map() };
for (const q of questionsSeed) {
  if (q.question_type !== 'multiple_choice' || !Array.isArray(q.options) || q.options.length !== 4) continue;
  const pick = longestOnly(q.options);
  if (pick === null) continue;
  const key = `${q.grade}|${q.subject}|${q.unit}`;
  const e = guessStats.byUnit.get(key) ?? { n: 0, hit: 0 };
  e.n++; guessStats.total++;
  if (pick === normText(q.correct_answer)) { e.hit++; guessStats.hit++; }
  guessStats.byUnit.set(key, e);
}

// 교사가 실제로 고르는 단원 단위 커버리지 (setup 화면 로직과 동일하게 계산)
const coverage = [];
for (const band of GRADE_BANDS) {
  for (const subject of SUBJECTS) {
    const isNational = NATIONAL_SUBJECTS.includes(subject);
    const gradeSets = isNational ? band.grades.map((g) => [g]) : [[...band.grades]];
    for (const grades of gradeSets) {
      const units = isNational
        ? selectableUnits(grades[0], subject)
        : band.grades.flatMap((g) => selectableUnits(g, subject));
      for (const unit of new Set(units)) {
        const pool = questionsSeed.filter(
          (q) => grades.includes(q.grade) && q.subject === subject && q.unit === unit
        );
        coverage.push({ grades: grades.join('·'), subject, unit, total: pool.length, playable: playableCount(pool) });
      }
    }
  }
}

const bySeverity = {};
const byCode = {};
for (const f of findings) {
  bySeverity[f.severity] = (bySeverity[f.severity] ?? 0) + 1;
  byCode[f.code] = (byCode[f.code] ?? 0) + 1;
}

console.log('━━━ 문제 은행 감사 ━━━');
console.log(`정합성 계층: 입력 ${questionSeedSanitizeSummary.total} → 채택 ${questionSeedSanitizeSummary.kept} (폐기 ${questionSeedSanitizeSummary.dropped})`);
const fixed = Object.entries(questionSeedSanitizeSummary.byCode).sort((a, b) => b[1] - a[1]);
if (fixed.length) console.log('  계층이 처리한 항목:', fixed.map(([k, v]) => `${k}=${v}`).join(' '));

const gradeRows = [3, 4, 5, 6].map((g) => {
  const cells = SUBJECTS.map((s) => `${s} ${questionsSeed.filter((q) => q.grade === g && q.subject === s).length}`);
  return `  ${g}학년  ${cells.join(' | ')}`;
});
console.log('\n학년·과목별 문항 수');
gradeRows.forEach((r) => console.log(r));

const thin = coverage.filter((c) => c.playable < MIN_PLAYABLE_PER_UNIT).sort((a, b) => a.playable - b.playable);
console.log(`\n단원 커버리지: ${coverage.length}단원 중 ${thin.length}단원이 출제 가능 문항 ${MIN_PLAYABLE_PER_UNIT}개 미만`);
thin.slice(0, Number(process.env.THIN_LIMIT ?? 40)).forEach((c) => console.log(`  ${String(c.playable).padStart(3)} / ${String(c.total).padStart(3)}  ${c.grades}학년 ${c.subject} | ${c.unit}`));
if (thin.length > Number(process.env.THIN_LIMIT ?? 40)) console.log(`  … 외 ${thin.length - Number(process.env.THIN_LIMIT ?? 40)}단원`);

const gRate = guessStats.total ? (100 * guessStats.hit / guessStats.total) : 0;
const skewUnits = [...guessStats.byUnit.entries()]
  .filter(([, e]) => e.n >= 15 && 100 * e.hit / e.n >= 70)
  .sort((a, b) => b[1].hit / b[1].n - a[1].hit / a[1].n);
console.log(`\n찍기 취약도 — "제일 긴 보기" 적중률 ${gRate.toFixed(1)}% (기준선 25%, 대상 ${guessStats.total.toLocaleString()}문항)`);
console.log(`  ${gRate < 35 ? '✅ 정상' : gRate < 50 ? '⚠ 주의' : '❌ 내용을 몰라도 절반 이상 맞힌다'}`);
console.log(`  70% 이상인 단원: ${skewUnits.length}개`);
skewUnits.slice(0, Number(process.env.GUESS_LIMIT ?? 10)).forEach(([k, e]) =>
  console.log(`    ${(100 * e.hit / e.n).toFixed(0).padStart(3)}%  (${e.hit}/${e.n})  ${k.replace(/\|/g, ' ')}`));

console.log(`\n발견: ${findings.length}건 ${JSON.stringify(bySeverity)}`);
Object.entries(byCode)
  .sort((a, b) => b[1] - a[1])
  .forEach(([code, n]) => console.log(`  ${code}: ${n}`));

if (process.env.DUMP_MED) {
  console.log('\n— MED 상세 —');
  findings.filter((f) => f.severity === 'MED').forEach((f) =>
    console.log(`  [${f.code}] ${f.grade}학년 ${f.subject} | ${f.unit}\n     ${f.text}\n     ${f.detail ?? ''}`)
  );
}

const crit = findings.filter((f) => f.severity === 'CRIT');
if (crit.length) {
  console.log('\n❌ CRITICAL 상세 (최대 30건)');
  crit.slice(0, 30).forEach((f) =>
    console.log(`  [${f.code}] ${f.grade}학년 ${f.subject} | ${f.unit}\n     ${f.text}\n     ${f.detail}`)
  );
  process.exit(1);
}
console.log('\n✅ CRITICAL 0건');
