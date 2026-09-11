/**
 * 학급 명부 파일(엑셀·한글·CSV)에서 학생 이름만 뽑아낸다.
 *
 * 교사가 가진 명부는 형식이 제각각이다 — 번호·이름·성별이 섞인 표, 머리글 유무,
 * 시트가 여러 개, 표 밖의 안내 문구까지. 그래서 "이름처럼 생긴 값이 가장 많이 모인
 * 열(또는 줄)"을 골라내는 방식으로 처리한다. 완벽한 서식 해석 대신, 틀렸을 때
 * 교사가 textarea 에서 바로 고칠 수 있게 결과를 편집 가능한 텍스트로 돌려준다.
 */
import { unzip } from './officeUnzip';
import { extractHwpLines, isHwpFile } from './hwpText';

export interface RosterResult {
  names: string[];
  /** 사람이 읽을 출처 설명 — "엑셀 3번째 열" 처럼 무엇을 골랐는지 알려 준다 */
  detail: string;
}

/** 명부에서 이름 칸이 아닌 것이 거의 확실한 말들 */
const HEADER_WORDS = new Set([
  '이름', '성명', '학생', '학생명', '성 명', '번호', '연번', '순번', '학번', '성별',
  '학년', '반', '학급', '생년월일', '생일', '주소', '연락처', '전화', '전화번호',
  '비고', '담임', '계', '합계', '소계', '남', '여', '남자', '여자', '구분', '비 고',
]);

const GENDER_WORDS = new Set(['남', '여', '남자', '여자', 'M', 'F']);

const KOREAN_NAME = /^[가-힣]{2,5}$/;

/**
 * 흔한 한국 성씨. "이름처럼 생겼는지"만 보면 폼 문서의 «접수번호·프로젝트명·미지정»
 * 같은 말까지 학생으로 끌고 온다(실측). 성씨로 한 번 거르면 그 문서가 «명부인지»를
 * 꽤 정확히 가릴 수 있다. 다만 성씨 목록에 없는 학생을 빠뜨리면 그 아이만 게임에서
 * 빠지므로, 성씨는 «명부 여부 판정»에만 쓰고 실제 수집은 모양만 보고 한다.
 */
const SURNAMES = new Set([
  '김', '이', '박', '최', '정', '강', '조', '윤', '장', '임', '한', '오', '서', '신', '권',
  '황', '안', '송', '류', '유', '전', '홍', '고', '문', '양', '손', '배', '백', '허', '남',
  '심', '노', '하', '곽', '성', '차', '주', '우', '구', '민', '유', '나', '진', '지', '엄',
  '채', '원', '천', '방', '공', '현', '함', '변', '염', '여', '추', '도', '소', '석', '선',
  '설', '마', '길', '연', '위', '표', '명', '기', '반', '왕', '금', '옥', '육', '인', '맹',
  '제', '모', '탁', '국', '어', '은', '편', '용',
]);
const COMPOUND_SURNAMES = ['남궁', '제갈', '선우', '황보', '사공', '서문', '독고', '동방'];

/** 한국인 이름으로 보이는가 — 성씨까지 맞는지 본다 */
export function hasKoreanSurname(name: string): boolean {
  if (!KOREAN_NAME.test(name)) return false;
  if (COMPOUND_SURNAMES.some((c) => name.startsWith(c) && name.length >= 3)) return true;
  return SURNAMES.has(name[0]!);
}

/** 명부로 볼 최소 인원 — 게임 자체가 4명부터라 이보다 적으면 명부가 아니라고 본다 */
const ROSTER_MIN = 3;
const LATIN_NAME = /^[A-Za-z][A-Za-z.'-]*(?: [A-Za-z][A-Za-z.'-]*){0,2}$/;

/** "3", "1.", "10번" 처럼 앞에 붙은 번호를 떼어 낸다 */
const LEADING_INDEX = /^\s*\d{1,3}\s*[.)번:\-]?\s*/;

export function looksLikeName(raw: string): boolean {
  const s = raw.trim();
  if (!s || HEADER_WORDS.has(s)) return false;
  if (KOREAN_NAME.test(s)) return true;
  return s.length >= 2 && s.length <= 24 && LATIN_NAME.test(s);
}

/** 셀 하나에서 이름을 끄집어낸다. "1 김민수" 같은 칸도 살린다. */
export function extractName(raw: string): string | null {
  const s = String(raw ?? '').replace(/\s+/g, ' ').trim();
  if (!s) return null;
  if (looksLikeName(s)) return s;
  const stripped = s.replace(LEADING_INDEX, '').trim();
  if (stripped !== s && looksLikeName(stripped)) return stripped;
  // "1 김민수 남" 처럼 한 칸에 번호·성별이 같이 들어간 경우만 건진다.
  // "한글 토큰이 하나뿐이면 이름"으로 넓히면 "3학년 2반 명렬표" 같은 제목 줄에서
  // "명렬표"를 학생으로 집어 온다(실측). 그래서 허용 모양을 못 박는다.
  const tokens = stripped.split(' ').filter(Boolean);
  const candidate = tokens[0] ?? '';
  if (!KOREAN_NAME.test(candidate) || HEADER_WORDS.has(candidate)) return null;
  if (tokens.length === 1) return candidate;
  if (tokens.length === 2 && GENDER_WORDS.has(tokens[1]!)) return candidate;
  return null;
}

function dedupe(names: string[]): string[] {
  const seen = new Set<string>();
  return names.filter((n) => (seen.has(n) ? false : (seen.add(n), true)));
}

/**
 * 표에서 이름 열을 고른다. 이름처럼 생긴 칸이 가장 많은 열을 쓰고,
 * 같으면 왼쪽 열을 쓴다(명부는 대개 번호 다음이 이름이다).
 */
export function pickNamesFromGrid(grid: string[][]): { names: string[]; column: number } {
  const width = grid.reduce((m, row) => Math.max(m, row.length), 0);
  let best = { score: 0, column: -1, names: [] as string[] };
  for (let c = 0; c < width; c++) {
    const names: string[] = [];
    for (const row of grid) {
      const got = extractName(row[c] ?? '');
      if (got) names.push(got);
    }
    // 열 선택은 «성씨까지 맞는 이름» 수로 한다. 번호 열·비고 열이 이기지 않는다.
    const score = names.filter(hasKoreanSurname).length;
    if (score > best.score) best = { score, column: c, names };
  }
  if (best.score < ROSTER_MIN) return { names: [], column: -1 };
  return { names: dedupe(best.names), column: best.column };
}

export function pickNamesFromLines(lines: string[]): string[] {
  const all = dedupe(lines.map(extractName).filter((n): n is string => n !== null));
  // 명부가 맞다고 판단되면 성씨 목록에 없는 학생도 함께 넘긴다(빠뜨리는 쪽이 더 나쁘다).
  return all.filter(hasKoreanSurname).length >= ROSTER_MIN ? all : [];
}

// ──────────────── 형식별 읽기 ────────────────

const XML_ENTITIES: Record<string, string> = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'" };

function unescapeXml(s: string): string {
  return s.replace(/&(#x?[0-9a-fA-F]+|[a-z]+);/g, (m, code: string) => {
    if (code.startsWith('#x') || code.startsWith('#X')) return String.fromCodePoint(parseInt(code.slice(2), 16));
    if (code.startsWith('#')) return String.fromCodePoint(Number(code.slice(1)));
    return XML_ENTITIES[code] ?? m;
  });
}

/** DOMParser 없이 정규식으로 읽는다 — 브라우저와 테스트(node)에서 똑같이 돈다. */
function textOfTags(xml: string, tag: string): string[] {
  const out: string[] = [];
  const re = new RegExp(`<${tag}(?:\\s[^>]*)?>([\\s\\S]*?)</${tag}>`, 'g');
  for (const m of xml.matchAll(re)) out.push(unescapeXml(m[1]!));
  return out;
}

function columnToIndex(ref: string): number {
  const letters = ref.match(/^[A-Z]+/)?.[0] ?? 'A';
  let n = 0;
  for (const ch of letters) n = n * 26 + (ch.charCodeAt(0) - 64);
  return n - 1;
}

export function sheetXmlToGrid(sheetXml: string, sharedStrings: string[]): string[][] {
  const grid: string[][] = [];
  for (const rowMatch of sheetXml.matchAll(/<row(?:\s[^>]*)?>([\s\S]*?)<\/row>/g)) {
    const row: string[] = [];
    for (const cell of rowMatch[1]!.matchAll(/<c\s([^>]*?)(\/>|>([\s\S]*?)<\/c>)/g)) {
      const attrs = cell[1]!;
      const body = cell[3] ?? '';
      const ref = /r="([A-Z]+\d+)"/.exec(attrs)?.[1];
      const type = /t="([^"]+)"/.exec(attrs)?.[1];
      let value = '';
      if (type === 's') {
        const idx = Number(textOfTags(body, 'v')[0] ?? '-1');
        value = sharedStrings[idx] ?? '';
      } else if (type === 'inlineStr') {
        value = textOfTags(body, 't').join('');
      } else {
        value = textOfTags(body, 'v')[0] ?? '';
      }
      const at = ref ? columnToIndex(ref) : row.length;
      row[at] = value;
    }
    grid.push(Array.from(row, (v) => v ?? ''));
  }
  return grid;
}

async function readXlsx(buffer: ArrayBuffer): Promise<RosterResult> {
  const files = await unzip(buffer);
  const decoder = new TextDecoder();
  const sharedXml = files.get('xl/sharedStrings.xml');
  const sharedStrings = sharedXml
    ? textOfTags(decoder.decode(sharedXml), 'si').map((si) => textOfTags(si, 't').join(''))
    : [];

  const sheetPaths = [...files.keys()]
    .filter((p) => /^xl\/worksheets\/sheet\d+\.xml$/.test(p))
    .sort((a, b) => Number(a.match(/\d+/)![0]) - Number(b.match(/\d+/)![0]));
  if (sheetPaths.length === 0) throw new Error('엑셀 시트를 찾지 못했습니다');

  // 시트가 여러 개면 이름이 가장 많이 잡힌 시트를 쓴다(명부가 몇 번째인지 알 수 없다).
  let best: RosterResult = { names: [], detail: '' };
  for (const path of sheetPaths) {
    const grid = sheetXmlToGrid(decoder.decode(files.get(path)!), sharedStrings);
    const { names, column } = pickNamesFromGrid(grid);
    if (names.length > best.names.length) {
      const sheetNo = path.match(/\d+/)![0];
      best = { names, detail: `엑셀 ${sheetNo}번째 시트의 ${column + 1}번째 열` };
    }
  }
  return best;
}

async function readHwpx(buffer: ArrayBuffer): Promise<RosterResult> {
  const files = await unzip(buffer);
  const decoder = new TextDecoder();
  const sections = [...files.keys()].filter((p) => /Contents\/section\d+\.xml$/i.test(p)).sort();
  if (sections.length === 0) throw new Error('한글 문서 본문을 찾지 못했습니다');
  const lines: string[] = [];
  for (const path of sections) {
    const xml = decoder.decode(files.get(path)!);
    // 문단(<hp:p>) 하나가 표의 한 칸이기도 하다 — 문단 단위로 줄을 만든다.
    for (const para of xml.split(/<hp:p[\s>]/).slice(1)) {
      lines.push(textOfTags(para, 'hp:t').join(''));
    }
  }
  return { names: pickNamesFromLines(lines), detail: '한글 문서(hwpx) 본문' };
}

export function parseDelimited(text: string): string[][] {
  return text
    .split(/\r?\n/)
    .filter((line) => line.trim())
    .map((line) => (line.includes('\t') ? line.split('\t') : line.split(',')).map((c) => c.replace(/^"|"$/g, '').trim()));
}

async function readText(file: File): Promise<RosterResult> {
  const text = await file.text();
  const grid = parseDelimited(text);
  const { names, column } = pickNamesFromGrid(grid);
  return { names, detail: grid.some((r) => r.length > 1) ? `${column + 1}번째 열` : '텍스트 줄' };
}

/** 명부 파일 하나를 읽어 학생 이름 목록으로 돌려준다. */
export async function parseRosterFile(file: File): Promise<RosterResult> {
  const name = file.name.toLowerCase();
  if (name.endsWith('.csv') || name.endsWith('.txt') || name.endsWith('.tsv')) return readText(file);

  const buffer = await file.arrayBuffer();
  if (isHwpFile(buffer)) {
    return { names: pickNamesFromLines(await extractHwpLines(buffer)), detail: '한글 문서(hwp) 본문' };
  }
  if (name.endsWith('.hwpx')) return readHwpx(buffer);
  if (name.endsWith('.xlsx') || name.endsWith('.xlsm')) return readXlsx(buffer);
  if (name.endsWith('.xls')) {
    throw new Error('옛 엑셀(.xls)은 읽을 수 없습니다 — 엑셀에서 .xlsx 로 다시 저장해 주세요');
  }
  // 확장자가 없거나 낯설면 ZIP인지 보고 판단한다
  const head = new Uint8Array(buffer, 0, 2);
  if (head[0] === 0x50 && head[1] === 0x4b) {
    return name.includes('hwp') ? readHwpx(buffer) : readXlsx(buffer);
  }
  return readText(file);
}
