// 분수 빗금 표시 정적 가드 — 문제 은행의 문제·보기·정답·해설 글이 SmartText(분수 쌓기)를 거친 뒤에도 «3/4» 빗금으로 남는지 센다.
// SmartText.tsx 의 정규식을 그대로 읽어 쓴다(복사 아님). 못 쌓은 빗금이 있거나 쌓은 분수가 0 이면 FAIL.
// 실행: node --no-warnings --import ./scripts/register-ts.mjs scripts/check-frac-display.mjs
import fs from 'node:fs';
const src = fs.readFileSync(new URL('../src/components/game/SmartText.tsx', import.meta.url), 'utf8');
const grab = (n) => src.match(new RegExp('const ' + n + ' = String\\.raw`([^`]*)`'))[1];
const ARITH0 = grab('ARITH'); const SPACED = grab('SPACED').replace('${ARITH}', ARITH0).replace('${ARITH}', ARITH0);
const MIXED = grab('MIXED'), OPraw = grab('OP'), LETTER0 = grab('LETTER'), NUM = grab('NUM');
const OP = OPraw; const LETTER = LETTER0.replace('${OP}', OP).replace('${OP}', OP);
const re = new RegExp(`${MIXED}|${SPACED}|${LETTER}|${NUM}`, 'g');
const SLASH = new RegExp(String.raw`(?:(?<![\w.\/:])\d{1,6}|\))\s*\/\s*(?:\d{1,6}(?![\w\/])|\(|[a-z](?![A-Za-z]))|(?<![\w.\/:])[a-z]\s*\/\s*(?:\d{1,6}(?![\w\/])|\()`);
const { questionsSeed } = await import('../src/data/questions-seed.ts');
let n = 0, left = new Map(), stacked = 0;
for (const q of questionsSeed) for (const f of [q.question_text, q.correct_answer, q.explanation, ...(q.options ?? [])]) {
  if (typeof f !== 'string' || !f.includes('/')) continue; n++;
  const m = f.match(re); stacked += m?.length ?? 0;
  const rest = f.replace(re, '\u0000').replace(/\s\/\s/g, ' | '); if (SLASH.test(rest)) left.set(f.slice(0, 60), 1);
}
const bad = left.size > 0 || stacked < 1;
console.log(bad ? 'FAIL 분수 빗금' : 'PASS 분수 빗금', '· 문항', questionsSeed.length, '빗금 포함 글', n, '쌓는 분수', stacked, '못 쌓은', left.size, [...left.keys()].slice(0, 8));
process.exit(bad ? 1 : 0);
