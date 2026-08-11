/**
 * Node 내장 TypeScript 타입 스트리핑으로 src/*.ts 를 그대로 실행하기 위한 resolve 훅.
 * Next.js/tsconfig 의 확장자 생략 import 와 `@/` alias 를 .ts 로 풀어 준다.
 * 사용: node --import ./scripts/register-ts.mjs <script|--test ...>
 */
import { existsSync } from 'node:fs';
import { dirname, resolve as presolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const SRC = presolve(dirname(fileURLToPath(import.meta.url)), '..', 'src');
const EXTS = ['.ts', '.tsx', '/index.ts'];

export async function resolve(specifier, context, next) {
  const tryPaths = [];
  if (specifier.startsWith('.') && !/\.(ts|tsx|mjs|cjs|js|json)$/.test(specifier)) {
    const base = context.parentURL ? dirname(fileURLToPath(context.parentURL)) : process.cwd();
    tryPaths.push(...EXTS.map((e) => presolve(base, specifier + e)));
  } else if (specifier.startsWith('@/')) {
    tryPaths.push(...EXTS.map((e) => presolve(SRC, specifier.slice(2) + e)));
  }
  for (const p of tryPaths) {
    if (existsSync(p)) return next(pathToFileURL(p).href, context);
  }
  return next(specifier, context);
}
