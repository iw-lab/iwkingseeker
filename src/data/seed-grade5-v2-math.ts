import type { QuestionSeed } from './questions-seed';

/** grade 5 수학 v2 — 프로그래밍 방식 생성 (기존 ~1,580개의 2배 확장용) */

const out: QuestionSeed[] = [];
const push = (q: Omit<QuestionSeed, 'grade' | 'subject'>) =>
  out.push({ grade: 5, subject: '수학', ...q });

const shuffle4 = (correct: string, distractors: string[]): string[] => {
  // 오답 중복 제거(계산식 우연 충돌 방지) + 정답과 동일 오답 제거
  const uniq: string[] = [];
  for (const d of distractors) {
    if (d !== correct && !uniq.includes(d)) uniq.push(d);
    if (uniq.length === 3) break;
  }
  // 3개 미만이면 숫자 접두를 증분해 대체 오답 생성(단위 접미 유지)
  const m = /^(-?\d+(?:\.\d+)?)(.*)$/.exec(correct);
  let pad = 1;
  while (uniq.length < 3) {
    const cand = m ? `${Number(m[1]) + pad}${m[2]}` : `${correct}(오답${pad})`;
    if (cand !== correct && !uniq.includes(cand)) uniq.push(cand);
    pad++;
    if (pad > 50) { uniq.push(`${correct}·${uniq.length}`); }
  }
  const opts = [correct, ...uniq];
  // deterministic rotation so correct 위치가 다양하게 분포
  const idx = (correct.length + (distractors[0]?.length ?? 1)) % 4;
  return [...opts.slice(idx), ...opts.slice(0, idx)];
};

const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));
const divisors = (n: number): number[] => {
  const arr: number[] = [];
  for (let i = 1; i <= n; i++) if (n % i === 0) arr.push(i);
  return arr;
};
const isPrime = (n: number): boolean => {
  if (n < 2) return false;
  for (let i = 2; i * i <= n; i++) if (n % i === 0) return false;
  return true;
};

// ============================================================
// 1. 자연수의 혼합 계산
// ============================================================
{
  const unit = '1. 자연수의 혼합 계산';
  // (a+b)×c
  for (let a = 2; a <= 12; a++) {
    for (let b = 3; b <= 9; b += 2) {
      const c = ((a + b) % 5) + 2;
      const ans = (a + b) * c;
      push({
        unit,
        unit_code: null,
        question_type: 'multiple_choice',
        question_text: `(${a}+${b})×${c}의 계산 결과는?`,
        options: shuffle4(`${ans}`, [`${ans + c}`, `${ans - c}`, `${a + b * c}`]),
        correct_answer: `${ans}`,
        explanation: `괄호 안을 먼저 계산합니다. ${a}+${b}=${a + b}, ${a + b}×${c}=${ans}`,
        difficulty: 2,
      });
    }
  }
  // a÷b+c×d
  for (let b = 2; b <= 9; b++) {
    for (let k = 2; k <= 8; k++) {
      const a = b * k;
      const c = ((a + b) % 4) + 2;
      const d = (b % 5) + 2;
      const ans = a / b + c * d;
      push({
        unit,
        unit_code: null,
        question_type: 'multiple_choice',
        question_text: `${a}÷${b}+${c}×${d}의 계산 결과는?`,
        options: shuffle4(`${ans}`, [`${ans + 2}`, `${ans - 2}`, `${(a / b + c) * d}`]),
        correct_answer: `${ans}`,
        explanation: `곱셈·나눗셈을 먼저 계산합니다. ${a}÷${b}=${a / b}, ${c}×${d}=${c * d}, ${a / b}+${c * d}=${ans}`,
        difficulty: 2,
      });
    }
  }
  // 100-a×(b+c)
  for (let a = 2; a <= 9; a++) {
    for (let b = 1; b <= 7; b++) {
      const c = b + 2;
      const base = 50 + a * 5;
      const ans = base - a * (b + c);
      if (ans < 0) continue;
      push({
        unit,
        unit_code: null,
        question_type: 'multiple_choice',
        question_text: `${base}-${a}×(${b}+${c})의 계산 결과는?`,
        options: shuffle4(`${ans}`, [`${ans + a}`, `${ans - a}`, `${base - a * b + c}`]),
        correct_answer: `${ans}`,
        explanation: `괄호: ${b}+${c}=${b + c}, 곱셈: ${a}×${b + c}=${a * (b + c)}, 뺄셈: ${base}-${a * (b + c)}=${ans}`,
        difficulty: 2,
      });
    }
  }
}

// ============================================================
// 2. 약수와 배수
// ============================================================
{
  const unit = '2. 약수와 배수';
  for (let n = 6; n <= 60; n++) {
    const divs = divisors(n);
    push({
      unit,
      unit_code: null,
      question_type: 'multiple_choice',
      question_text: `${n}의 약수의 개수는?`,
      options: shuffle4(`${divs.length}개`, [
        `${divs.length + 1}개`,
        `${divs.length - 1 || divs.length + 2}개`,
        `${divs.length + 2}개`,
      ]),
      correct_answer: `${divs.length}개`,
      explanation: `${n}의 약수: ${divs.join(', ')} — 총 ${divs.length}개`,
      difficulty: 2,
    });
  }
  for (let n = 4; n <= 30; n++) {
    push({
      unit,
      unit_code: null,
      question_type: 'ox',
      question_text: `${n}은 소수이다.`,
      options: ['O', 'X'],
      correct_answer: isPrime(n) ? 'O' : 'X',
      explanation: isPrime(n)
        ? `${n}은 1과 ${n}만 약수로 가지므로 소수입니다.`
        : `${n}의 약수는 ${divisors(n).join(', ')}이므로 소수가 아닙니다.`,
      difficulty: 2,
    });
  }
  for (let a = 6; a <= 36; a += 2) {
    for (let b = a + 2; b <= a + 18; b += 4) {
      const g = gcd(a, b);
      push({
        unit,
        unit_code: null,
        question_type: 'multiple_choice',
        question_text: `${a}와 ${b}의 최대공약수는?`,
        options: shuffle4(`${g}`, [`${g * 2}`, `${g + 1}`, `${g - 1 || g + 3}`]),
        correct_answer: `${g}`,
        explanation: `${a}=${divisors(a).join('×?')}, ${b}=${divisors(b).join('×?')}. 공통 약수 중 가장 큰 값은 ${g}`,
        difficulty: 2,
      });
    }
  }
  for (let m = 3; m <= 12; m++) {
    const cnt = Math.floor(100 / m);
    push({
      unit,
      unit_code: null,
      question_type: 'short_answer',
      question_text: `1부터 100까지의 자연수 중 ${m}의 배수는 몇 개인가요?`,
      options: null,
      correct_answer: `${cnt}`,
      explanation: `100÷${m}=${Math.floor(100 / m)} — ${cnt}개`,
      difficulty: 2,
    });
  }
}

// ============================================================
// 3. 규칙과 대응
// ============================================================
{
  const unit = '3. 규칙과 대응';
  for (let a = 2; a <= 7; a++) {
    for (let b = 0; b <= 9; b++) {
      for (let x = 1; x <= 6; x++) {
        const y = a * x + b;
        push({
          unit,
          unit_code: null,
          question_type: 'short_answer',
          question_text: `y=${a}x+${b}일 때, x=${x}이면 y는?`,
          options: null,
          correct_answer: `${y}`,
          explanation: `${a}×${x}+${b}=${a * x}+${b}=${y}`,
          difficulty: 2,
        });
      }
    }
  }
}

// ============================================================
// 4. 약분과 통분
// ============================================================
{
  const unit = '4. 약분과 통분';
  for (let n = 2; n <= 20; n++) {
    for (let d = n + 1; d <= 24; d++) {
      const g = gcd(n, d);
      if (g <= 1) continue;
      push({
        unit,
        unit_code: null,
        question_type: 'short_answer',
        question_text: `${n}/${d}을 기약분수로 나타내면?`,
        options: null,
        correct_answer: `${n / g}/${d / g}`,
        explanation: `분자·분모의 최대공약수 ${g}로 나눕니다. ${n}/${d}=${n / g}/${d / g}`,
        difficulty: 2,
      });
    }
  }
}

// ============================================================
// 5. 분수의 덧셈과 뺄셈
// ============================================================
{
  const unit = '5. 분수의 덧셈과 뺄셈';
  // 같은 분모
  for (let d = 3; d <= 12; d++) {
    for (let a = 1; a < d; a++) {
      for (let b = 1; b < d - a; b++) {
        const sum = a + b;
        const g = gcd(sum, d);
        push({
          unit,
          unit_code: null,
          question_type: 'short_answer',
          question_text: `${a}/${d} + ${b}/${d}은 얼마인가요? (기약분수)`,
          options: null,
          correct_answer: g === 1 ? `${sum}/${d}` : `${sum / g}/${d / g}`,
          explanation: `분모가 같으므로 분자끼리: ${a}+${b}=${sum}, 답 ${sum}/${d}${g > 1 ? `=${sum / g}/${d / g}` : ''}`,
          difficulty: 2,
        });
      }
    }
  }
  // 다른 분모
  for (let d1 = 2; d1 <= 6; d1++) {
    for (let d2 = d1 + 1; d2 <= 8; d2++) {
      for (let a = 1; a < d1; a++) {
        for (let b = 1; b < d2; b++) {
          const lcm = (d1 * d2) / gcd(d1, d2);
          const numer = a * (lcm / d1) + b * (lcm / d2);
          const g = gcd(numer, lcm);
          push({
            unit,
            unit_code: null,
            question_type: 'short_answer',
            question_text: `${a}/${d1} + ${b}/${d2}은 얼마인가요? (기약분수)`,
            options: null,
            correct_answer: g === 1 ? `${numer}/${lcm}` : `${numer / g}/${lcm / g}`,
            explanation: `통분 후 계산: 공통분모 ${lcm}, 결과 ${numer}/${lcm}${g > 1 ? ` = ${numer / g}/${lcm / g}` : ''}`,
            difficulty: 3,
          });
        }
      }
    }
  }
}

// ============================================================
// 6. 다각형의 둘레와 넓이
// ============================================================
{
  const unit = '6. 다각형의 둘레와 넓이';
  // 직사각형 둘레/넓이
  for (let w = 2; w <= 15; w++) {
    for (let h = 2; h <= 15; h++) {
      if (w === h) continue;
      push({
        unit,
        unit_code: null,
        question_type: 'short_answer',
        question_text: `가로 ${w}cm, 세로 ${h}cm 직사각형의 넓이는? (단위 포함)`,
        options: null,
        correct_answer: `${w * h}cm²`,
        explanation: `직사각형의 넓이 = 가로×세로 = ${w}×${h} = ${w * h}cm²`,
        difficulty: 1,
      });
    }
  }
  // 정사각형 둘레
  for (let s = 2; s <= 20; s++) {
    push({
      unit,
      unit_code: null,
      question_type: 'short_answer',
      question_text: `한 변이 ${s}cm인 정사각형의 둘레는? (단위 포함)`,
      options: null,
      correct_answer: `${s * 4}cm`,
      explanation: `정사각형 둘레 = 한 변×4 = ${s}×4 = ${s * 4}cm`,
      difficulty: 1,
    });
  }
  // 삼각형 넓이
  for (let b = 2; b <= 14; b += 2) {
    for (let h = 2; h <= 14; h += 2) {
      push({
        unit,
        unit_code: null,
        question_type: 'short_answer',
        question_text: `밑변 ${b}cm, 높이 ${h}cm 삼각형의 넓이는? (단위 포함)`,
        options: null,
        correct_answer: `${(b * h) / 2}cm²`,
        explanation: `삼각형 넓이 = (밑변×높이)÷2 = (${b}×${h})÷2 = ${(b * h) / 2}cm²`,
        difficulty: 2,
      });
    }
  }
  // 평행사변형 넓이
  for (let b = 3; b <= 12; b++) {
    for (let h = 3; h <= 12; h++) {
      push({
        unit,
        unit_code: null,
        question_type: 'short_answer',
        question_text: `밑변 ${b}cm, 높이 ${h}cm 평행사변형의 넓이는? (단위 포함)`,
        options: null,
        correct_answer: `${b * h}cm²`,
        explanation: `평행사변형 넓이 = 밑변×높이 = ${b}×${h} = ${b * h}cm²`,
        difficulty: 2,
      });
    }
  }
}

// ============================================================
// 7. 소수의 곱셈
// ============================================================
{
  const unit = '7. 소수의 곱셈';
  // a.b × n
  for (let a = 1; a <= 9; a++) {
    for (let b = 1; b <= 9; b++) {
      for (let n = 2; n <= 8; n++) {
        const value = a + b / 10;
        const result = Math.round(value * n * 10) / 10;
        push({
          unit,
          unit_code: null,
          question_type: 'short_answer',
          question_text: `${a}.${b} × ${n}의 계산 결과는?`,
          options: null,
          correct_answer: `${result}`,
          explanation: `${a}.${b}×${n}=${result} (자연수처럼 곱한 뒤 소수점 위치 맞춤)`,
          difficulty: 2,
        });
      }
    }
  }
  // a × b.c
  for (let a = 2; a <= 9; a++) {
    for (let b = 1; b <= 9; b++) {
      for (let c = 1; c <= 9; c++) {
        const value = b + c / 10;
        const result = Math.round(a * value * 10) / 10;
        push({
          unit,
          unit_code: null,
          question_type: 'ox',
          question_text: `${a} × ${b}.${c} = ${result}이다.`,
          options: ['O', 'X'],
          correct_answer: 'O',
          explanation: `${a}×${b}.${c}=${result}`,
          difficulty: 2,
        });
      }
    }
  }
}

// ============================================================
// 8. 합동과 대칭
// ============================================================
{
  const unit = '8. 합동과 대칭';
  const topics = [
    { q: '두 도형의 모양과 크기가 같으면 합동이다.', a: 'O' },
    { q: '합동인 두 도형의 대응변의 길이는 같다.', a: 'O' },
    { q: '합동인 두 도형의 대응각의 크기는 다르다.', a: 'X' },
    { q: '선대칭도형은 한 직선을 기준으로 접으면 완전히 겹쳐진다.', a: 'O' },
    { q: '원은 선대칭도형이다.', a: 'O' },
    { q: '점대칭도형은 한 점을 중심으로 180도 돌리면 처음과 완전히 겹쳐진다.', a: 'O' },
    { q: '정사각형은 선대칭이면서 점대칭도형이다.', a: 'O' },
    { q: '평행사변형은 선대칭도형이다.', a: 'X' },
    { q: '정삼각형은 대칭축이 3개이다.', a: 'O' },
    { q: '직사각형은 대칭축이 2개이다.', a: 'O' },
    { q: '마름모는 대칭축이 4개이다.', a: 'X' },
    { q: '원의 대칭축은 무수히 많다.', a: 'O' },
    { q: '합동인 두 도형은 넓이가 같다.', a: 'O' },
    { q: '정오각형은 점대칭도형이다.', a: 'X' },
    { q: '정육각형은 선대칭이면서 점대칭도형이다.', a: 'O' },
  ];
  for (const t of topics) {
    push({
      unit,
      unit_code: null,
      question_type: 'ox',
      question_text: t.q,
      options: ['O', 'X'],
      correct_answer: t.a,
      explanation: t.a === 'O' ? '맞는 설명입니다.' : '틀린 설명입니다.',
      difficulty: 2,
    });
  }
}

// ============================================================
// 9. 분수의 곱셈
// ============================================================
{
  const unit = '9. 분수의 곱셈';
  // (a/b) × n
  for (let b = 2; b <= 10; b++) {
    for (let a = 1; a < b; a++) {
      for (let n = 2; n <= 9; n++) {
        const num = a * n;
        const g = gcd(num, b);
        const final = g === 1 ? `${num}/${b}` : b / g === 1 ? `${num / g}` : `${num / g}/${b / g}`;
        push({
          unit,
          unit_code: null,
          question_type: 'short_answer',
          question_text: `${a}/${b} × ${n}은 얼마인가요? (기약분수)`,
          options: null,
          correct_answer: final,
          explanation: `분자에 ${n}을 곱합니다: ${a * n}/${b}${g > 1 ? ` = ${final}` : ''}`,
          difficulty: 2,
        });
      }
    }
  }
  // (a/b) × (c/d)
  for (let b = 2; b <= 6; b++) {
    for (let d = 2; d <= 6; d++) {
      for (let a = 1; a < b; a++) {
        for (let c = 1; c < d; c++) {
          const num = a * c;
          const den = b * d;
          const g = gcd(num, den);
          const final = g === 1 ? `${num}/${den}` : den / g === 1 ? `${num / g}` : `${num / g}/${den / g}`;
          push({
            unit,
            unit_code: null,
            question_type: 'short_answer',
            question_text: `${a}/${b} × ${c}/${d}은 얼마인가요? (기약분수)`,
            options: null,
            correct_answer: final,
            explanation: `분자×분자, 분모×분모: ${num}/${den}${g > 1 ? ` = ${final}` : ''}`,
            difficulty: 2,
          });
        }
      }
    }
  }
}

// ============================================================
// 10. 직육면체와 정육면체
// ============================================================
{
  const unit = '10. 직육면체와 정육면체';
  const facts = [
    { q: '직육면체의 면은 몇 개인가요?', a: '6', e: '직육면체는 6개의 면을 가집니다.' },
    { q: '직육면체의 모서리는 몇 개인가요?', a: '12', e: '직육면체는 12개의 모서리를 가집니다.' },
    { q: '직육면체의 꼭짓점은 몇 개인가요?', a: '8', e: '직육면체는 8개의 꼭짓점을 가집니다.' },
    { q: '정육면체의 모든 면의 모양은?', a: '정사각형', e: '정육면체는 여섯 면이 모두 정사각형입니다.' },
    { q: '직육면체에서 마주 보는 면의 쌍은 몇 쌍?', a: '3쌍', e: '직육면체에는 평행한 면이 3쌍 있습니다.' },
  ];
  for (const f of facts) {
    push({
      unit,
      unit_code: null,
      question_type: 'short_answer',
      question_text: f.q,
      options: null,
      correct_answer: f.a,
      explanation: f.e,
      difficulty: 1,
    });
  }
  for (let s = 2; s <= 15; s++) {
    push({
      unit,
      unit_code: null,
      question_type: 'short_answer',
      question_text: `한 모서리가 ${s}cm인 정육면체의 모든 모서리 길이의 합은? (단위 포함)`,
      options: null,
      correct_answer: `${s * 12}cm`,
      explanation: `정육면체 모서리는 12개. ${s}×12=${s * 12}cm`,
      difficulty: 2,
    });
  }
}

// ============================================================
// 11. 평균과 가능성
// ============================================================
{
  const unit = '11. 평균과 가능성';
  // 3 numbers avg
  for (let a = 4; a <= 30; a += 2) {
    for (let b = a + 2; b <= 40; b += 4) {
      for (let c = b + 2; c <= 50; c += 6) {
        if ((a + b + c) % 3 !== 0) continue;
        const avg = (a + b + c) / 3;
        push({
          unit,
          unit_code: null,
          question_type: 'short_answer',
          question_text: `세 수 ${a}, ${b}, ${c}의 평균은?`,
          options: null,
          correct_answer: `${avg}`,
          explanation: `합 ${a + b + c}을 개수 3으로 나누면 ${avg}`,
          difficulty: 2,
        });
      }
    }
  }
  // 5 numbers avg
  for (let k = 10; k <= 30; k++) {
    const nums = [k, k + 2, k + 4, k + 6, k + 8];
    const avg = nums.reduce((s, x) => s + x, 0) / 5;
    push({
      unit,
      unit_code: null,
      question_type: 'short_answer',
      question_text: `다섯 수 ${nums.join(', ')}의 평균은?`,
      options: null,
      correct_answer: `${avg}`,
      explanation: `합 ${nums.reduce((s, x) => s + x, 0)}을 5로 나누면 ${avg}`,
      difficulty: 2,
    });
  }
  // 가능성 OX
  const chance = [
    { q: '주사위를 던져 7이 나올 가능성은 0이다.', a: 'O' },
    { q: '동전을 던져 앞면이 나올 가능성은 1/2이다.', a: 'O' },
    { q: '주사위를 던져 1부터 6 사이 수가 나올 가능성은 1이다.', a: 'O' },
    { q: '빨간 공만 들어있는 주머니에서 파란 공을 꺼낼 가능성은 1이다.', a: 'X' },
    { q: '가능성이 1이면 반드시 일어난다는 뜻이다.', a: 'O' },
  ];
  for (const c of chance) {
    push({
      unit,
      unit_code: null,
      question_type: 'ox',
      question_text: c.q,
      options: ['O', 'X'],
      correct_answer: c.a,
      explanation: c.a === 'O' ? '맞는 설명입니다.' : '틀린 설명입니다.',
      difficulty: 2,
    });
  }
}

// ============================================================
// 12. 직육면체의 부피와 겉넓이
// ============================================================
{
  const unit = '12. 직육면체의 부피와 겉넓이';
  for (let w = 2; w <= 10; w++) {
    for (let h = 2; h <= 10; h++) {
      for (let d = 2; d <= 10; d++) {
        push({
          unit,
          unit_code: null,
          question_type: 'short_answer',
          question_text: `가로 ${w}cm, 세로 ${h}cm, 높이 ${d}cm 직육면체의 부피는? (단위 포함)`,
          options: null,
          correct_answer: `${w * h * d}cm³`,
          explanation: `부피 = 가로×세로×높이 = ${w}×${h}×${d} = ${w * h * d}cm³`,
          difficulty: 2,
        });
      }
    }
  }
  for (let s = 2; s <= 15; s++) {
    push({
      unit,
      unit_code: null,
      question_type: 'short_answer',
      question_text: `한 모서리가 ${s}cm인 정육면체의 부피는? (단위 포함)`,
      options: null,
      correct_answer: `${s * s * s}cm³`,
      explanation: `정육면체 부피 = 한 모서리³ = ${s}³ = ${s * s * s}cm³`,
      difficulty: 2,
    });
    push({
      unit,
      unit_code: null,
      question_type: 'short_answer',
      question_text: `한 모서리가 ${s}cm인 정육면체의 겉넓이는? (단위 포함)`,
      options: null,
      correct_answer: `${6 * s * s}cm²`,
      explanation: `정육면체 겉넓이 = 한 면 넓이×6 = ${s}²×6 = ${6 * s * s}cm²`,
      difficulty: 2,
    });
  }
}

export const seedGrade5V2Math: QuestionSeed[] = out;
