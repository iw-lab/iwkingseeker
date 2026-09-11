import * as fs from 'node:fs';
import * as path from 'node:path';

const dataDir = path.resolve('src/data');
const files = fs.readdirSync(dataDir).filter((f) => f.endsWith('.ts'));

const issues: { file: string; line: number; issue: string; text: string }[] = [];
let total = 0;
let grade5Total = 0;
const seenKeys = new Map<string, { file: string; line: number }>();

for (const file of files) {
  const content = fs.readFileSync(path.join(dataDir, file), 'utf8');
  const lines = content.split('\n');
  lines.forEach((line, idx) => {
    const m = line.match(/\{\s*grade:\s*(\d+),/);
    if (!m) return;
    total++;
    const grade = parseInt(m[1]!);
    if (grade !== 5) return;
    grade5Total++;

    const subjectM = line.match(/subject:\s*'([^']+)'/);
    const unitM = line.match(/unit:\s*'([^']+)'/);
    const typeM = line.match(/question_type:\s*'([^']+)'/);
    const textM = line.match(/question_text:\s*'([^']*)'/);
    const optionsM = line.match(/options:\s*(\[[^\]]*\]|null)/);
    const correctM = line.match(/correct_answer:\s*'([^']*)'/);

    if (!textM || !correctM) return;
    const qText = textM[1]!;
    const correct = correctM[1]!;
    const subject = subjectM?.[1] ?? '';
    const unit = unitM?.[1] ?? '';
    const qType = typeM?.[1] ?? '';

    // Duplicate detection
    const key = `${grade}|${subject}|${qText}`;
    if (seenKeys.has(key)) {
      const prev = seenKeys.get(key)!;
      issues.push({
        file,
        line: idx + 1,
        issue: `중복: ${prev.file}:${prev.line}와 동일`,
        text: qText.slice(0, 50),
      });
    } else {
      seenKeys.set(key, { file, line: idx + 1 });
    }

    // correct_answer in options check
    if (optionsM && optionsM[1] !== 'null') {
      try {
        // Rough parse: extract quoted strings
        const opts = Array.from(optionsM[1]!.matchAll(/'([^']*)'/g)).map((m) => m[1]);
        if (opts.length > 0 && !opts.includes(correct)) {
          issues.push({
            file,
            line: idx + 1,
            issue: `correct_answer "${correct}"가 options에 없음: [${opts.join(',')}]`,
            text: qText.slice(0, 50),
          });
        }
      } catch {}
    }

    // OX type correct answer must be O or X
    if (qType === 'ox' && !['O', 'X'].includes(correct)) {
      issues.push({
        file,
        line: idx + 1,
        issue: `OX 문제인데 correct_answer가 "${correct}"`,
        text: qText.slice(0, 50),
      });
    }

    // Empty fields
    if (!qText.trim()) {
      issues.push({ file, line: idx + 1, issue: '빈 question_text', text: '' });
    }
    if (!correct.trim()) {
      issues.push({ file, line: idx + 1, issue: '빈 correct_answer', text: qText.slice(0, 50) });
    }
    if (!subject.trim() || !unit.trim()) {
      issues.push({ file, line: idx + 1, issue: '빈 subject/unit', text: qText.slice(0, 50) });
    }
  });
}

console.log(`총 문제 (파일 단위 스캔): ${total}`);
console.log(`5학년 문제: ${grade5Total}`);
console.log(`감지된 이슈: ${issues.length}`);
if (issues.length > 0) {
  console.log('\n상위 30개 이슈:');
  issues.slice(0, 30).forEach((i) => {
    console.log(`  [${i.file}:${i.line}] ${i.issue} — "${i.text}"`);
  });
  if (issues.length > 30) console.log(`  ... 및 ${issues.length - 30}개 더`);
}
