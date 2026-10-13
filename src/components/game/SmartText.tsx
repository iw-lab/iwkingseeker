// @gb-frac v1 — 분수를 «위아래로 쌓아» 보여 준다(초등 교과서 표기). 화면에 «3/4»·«x/360»·«(n−2)/n» 을 글자 그대로 찍지 않는다.
// 정본 = ~/.claude/skills/game-builder/kit/frac/frac.js — 이 파일은 React 용 사본(문자식 분수까지 쌓는다 · 숫자 분수 동작은 정본과 같다).
// 문제·보기·정답·해설을 화면에 찍는 곳은 모두 <SmartText text=… /> 를 거친다. 진행 칸(«3/10 문제»)은 SmartText 를 쓰지 않고 data-frac-ok 를 단다.
'use client';

import React from 'react';

interface Props {
  text: string;
  className?: string;
}

// 대분수: «1과 1/6»·«2와 1/4». 뒤에 «중·사이» 가 오면 두 수를 나열한 것이라 대분수가 아니다.
const MIXED = String.raw`(?<![\w./])(\d{1,4})(?:[과와] | )(\d{1,4})\/(\d{1,4})(?![\w/])(?!\s*(?:중|사이))`;
// 문자식 분수: «x/360»·«(n−2)/n»·«k/(x−p)»·«√3/2». 한쪽이 문자·√·π·괄호묶음이어야 한다(숫자뿐인 건 NUM 이).
const OP = String.raw`\((?:[^()\/]|\([^()\/]*\)){1,40}\)|[0-9]*[A-Za-z√π][A-Za-z0-9√π]*|\d{1,4}`;
const LETTER = String.raw`(?<![\w./])(${OP})\/(${OP})(?![\w/])`;
const NUM = String.raw`(?<![\w./])(\d{1,4})\/(\d{1,4})(?![\w/])`;
// 식으로 쓴 분수: «(5 × 2) / 5 = …»·«2×3 / 3×4 = …»·«12÷6 / 18÷6 = …» — 슬래시 앞뒤에 공백이 있고 뒤에 «=» 가 오는 것만(목록 구분자 « / » 는 제외).
const ARITH = String.raw`\d+(?:\s*[×÷*+\-−]\s*\d+)+`;
const SPACED = String.raw`(?<![\w./])(\((?:[^()\/]){1,24}\)|${ARITH})\s\/\s(${ARITH}|\d{1,4})(?=\s*=)`;
const strip = (t: string) => (/^\(.*\)$/.test(t) ? t.slice(1, -1) : t);

type Part = { s: string } | { w?: string; n: string; d: string };

export function splitFrac(text: string): Part[] {
  const re = new RegExp(`${MIXED}|${SPACED}|${LETTER}|${NUM}`, 'g');
  const out: Part[] = [];
  let last = 0;
  for (let m = re.exec(text); m; m = re.exec(text)) {
    let part: Part;
    if (m[1] !== undefined) part = { w: m[1], n: m[2]!, d: m[3]! };
    else if (m[4] !== undefined) part = { n: strip(m[4]), d: strip(m[5]!) };
    else if (m[6] !== undefined) {
      part = /^\d+$/.test(m[6]) && /^\d+$/.test(m[7]!) ? { n: m[6], d: m[7]! } : { n: strip(m[6]), d: strip(m[7]!) };
    } else part = { n: m[8]!, d: m[9]! };
    if (m.index > last) out.push({ s: text.slice(last, m.index) });
    out.push(part);
    last = re.lastIndex;
  }
  if (last < text.length) out.push({ s: text.slice(last) });
  return out;
}

function Fraction({ num, den }: { num: string; den: string }) {
  return (
    <span
      className="frac inline-flex flex-col items-center align-middle mx-1 leading-none"
      role="img"
      aria-label={`${den}분의 ${num}`}
      style={{ fontSize: '0.85em', verticalAlign: '-0.25em' }}
    >
      <span className="frac-n border-b-2 border-current px-1.5 pb-0.5">{num}</span>
      <span className="hidden">/</span>
      <span className="frac-d px-1.5 pt-0.5">{den}</span>
    </span>
  );
}

export default function SmartText({ text, className }: Props) {
  const parts = splitFrac(String(text ?? ''));
  return (
    <span className={className}>
      {parts.map((p, i) => {
        if ('s' in p) {
          // 분수가 아닌 « / » (목록 구분자: «12의 약수: 1,2,3 / 18의 약수: …») 는 따로 떼어 분수 탐침이 오인하지 않게 표시한다.
          const bits = p.s.split(/(\s\/\s)/);
          return (
            <React.Fragment key={i}>
              {bits.map((t, j) => (/^\s\/\s$/.test(t) ? <span key={j} data-frac-ok>{t}</span> : <React.Fragment key={j}>{t}</React.Fragment>))}
            </React.Fragment>
          );
        }
        if (p.w !== undefined) {
          return <span key={i} className="whitespace-nowrap">{p.w}<Fraction num={p.n} den={p.d} /></span>;
        }
        return <Fraction key={i} num={p.n} den={p.d} />;
      })}
    </span>
  );
}
