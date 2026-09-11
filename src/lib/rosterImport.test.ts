import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { deflateRawSync } from 'node:zlib';
import {
  extractName,
  looksLikeName,
  pickNamesFromGrid,
  pickNamesFromLines,
  hasKoreanSurname,
  sheetXmlToGrid,
  parseDelimited,
  parseRosterFile,
} from './rosterImport';

/** 테스트용 최소 ZIP. 항목마다 저장(0)/Deflate(8)를 섞어 두 경로를 모두 태운다. */
function makeZip(files: Record<string, string>): Uint8Array {
  const enc = new TextEncoder();
  const locals: Uint8Array[] = [];
  const centrals: Uint8Array[] = [];
  let offset = 0;
  let i = 0;

  for (const [name, content] of Object.entries(files)) {
    const nameBytes = enc.encode(name);
    const raw = enc.encode(content);
    const deflate = i++ % 2 === 0;
    const data = deflate ? new Uint8Array(deflateRawSync(raw)) : raw;
    const method = deflate ? 8 : 0;

    const local = new Uint8Array(30 + nameBytes.length + data.length);
    const lv = new DataView(local.buffer);
    lv.setUint32(0, 0x04034b50, true);
    lv.setUint16(8, method, true);
    lv.setUint32(18, data.length, true);
    lv.setUint32(22, raw.length, true);
    lv.setUint16(26, nameBytes.length, true);
    local.set(nameBytes, 30);
    local.set(data, 30 + nameBytes.length);
    locals.push(local);

    const central = new Uint8Array(46 + nameBytes.length);
    const cv = new DataView(central.buffer);
    cv.setUint32(0, 0x02014b50, true);
    cv.setUint16(10, method, true);
    cv.setUint32(20, data.length, true);
    cv.setUint32(24, raw.length, true);
    cv.setUint16(28, nameBytes.length, true);
    cv.setUint32(42, offset, true);
    central.set(nameBytes, 46);
    centrals.push(central);

    offset += local.length;
  }

  const centralSize = centrals.reduce((s, c) => s + c.length, 0);
  const eocd = new Uint8Array(22);
  const ev = new DataView(eocd.buffer);
  ev.setUint32(0, 0x06054b50, true);
  ev.setUint16(8, centrals.length, true);
  ev.setUint16(10, centrals.length, true);
  ev.setUint32(12, centralSize, true);
  ev.setUint32(16, offset, true);

  const total = offset + centralSize + eocd.length;
  const out = new Uint8Array(total);
  let p = 0;
  for (const b of [...locals, ...centrals, eocd]) {
    out.set(b, p);
    p += b.length;
  }
  return out;
}

describe('학급 명부 불러오기', () => {
  test('이름처럼 생긴 값만 통과시킨다', () => {
    assert.equal(looksLikeName('김민수'), true);
    assert.equal(looksLikeName('남궁민수'), true);
    assert.equal(looksLikeName('이름'), false, '머리글은 이름이 아니다');
    assert.equal(looksLikeName('번호'), false);
    assert.equal(looksLikeName('3'), false);
    assert.equal(looksLikeName('남'), false, '성별 한 글자는 이름이 아니다');
  });

  test('성씨로 한국인 이름 여부를 가린다', () => {
    assert.equal(hasKoreanSurname('김민수'), true);
    assert.equal(hasKoreanSurname('남궁현'), true, '두 글자 성씨');
    assert.equal(hasKoreanSurname('접수번호'), false);
    assert.equal(hasKoreanSurname('프로젝트명'), false);
  });

  test('번호가 붙은 칸에서도 이름을 집어낸다', () => {
    assert.equal(extractName('1. 김민수'), '김민수');
    assert.equal(extractName('12번 이영희'), '이영희');
    assert.equal(extractName('3 박철수 남'), '박철수');
    assert.equal(extractName('  정수진  '), '정수진');
    assert.equal(extractName('2026-03-02'), null);
    assert.equal(extractName(''), null);
  });

  test('번호 열이 아니라 이름 열을 고른다', () => {
    const grid = [
      ['번호', '이름', '성별'],
      ['1', '김민수', '남'],
      ['2', '이영희', '여'],
      ['3', '박철수', '남'],
    ];
    const { names, column } = pickNamesFromGrid(grid);
    assert.equal(column, 1);
    assert.deepEqual(names, ['김민수', '이영희', '박철수']);
  });

  test('같은 이름이 두 번 나와도 한 번만 넣는다', () => {
    assert.deepEqual(
      pickNamesFromLines(['김민수', '김민수', '이영희', '박철수', '이영희']),
      ['김민수', '이영희', '박철수']
    );
  });

  test('시트 XML을 공유 문자열과 함께 표로 읽는다', () => {
    const shared = ['이름', '김민수', '이영희'];
    const xml =
      '<sheetData>' +
      '<row r="1"><c r="A1" t="s"><v>0</v></c></row>' +
      '<row r="2"><c r="A2" t="s"><v>1</v></c><c r="B2"><v>7</v></c></row>' +
      '<row r="3"><c r="A3" t="s"><v>2</v></c></row>' +
      '</sheetData>';
    assert.deepEqual(sheetXmlToGrid(xml, shared), [['이름'], ['김민수', '7'], ['이영희']]);
  });

  test('빈 칸이 건너뛰어져 있어도 열 위치가 밀리지 않는다', () => {
    const xml = '<row r="1"><c r="A1" t="inlineStr"><is><t>1</t></is></c><c r="C1" t="inlineStr"><is><t>김민수</t></is></c></row>';
    assert.deepEqual(sheetXmlToGrid(xml, []), [['1', '', '김민수']]);
  });

  test('실제 xlsx(ZIP) 파일을 끝까지 읽는다', async () => {
    const shared =
      '<sst><si><t>번호</t></si><si><t>이름</t></si><si><t>김민수</t></si><si><t>이영희</t></si><si><t>박철수</t></si><si><t>정수진</t></si></sst>';
    const sheet =
      '<worksheet><sheetData>' +
      '<row><c r="A1"><v>0</v></c><c r="B1" t="s"><v>1</v></c></row>' +
      '<row><c r="A1"><v>1</v></c><c r="B2" t="s"><v>2</v></c></row>' +
      '<row><c r="A3"><v>2</v></c><c r="B3" t="s"><v>3</v></c></row>' +
      '<row><c r="A4"><v>3</v></c><c r="B4" t="s"><v>4</v></c></row>' +
      '<row><c r="A5"><v>4</v></c><c r="B5" t="s"><v>5</v></c></row>' +
      '</sheetData></worksheet>';
    const zip = makeZip({ 'xl/sharedStrings.xml': shared, 'xl/worksheets/sheet1.xml': sheet });
    const file = new File([zip as BlobPart], 'roster.xlsx');
    const result = await parseRosterFile(file);
    assert.deepEqual(result.names, ['김민수', '이영희', '박철수', '정수진']);
    assert.match(result.detail, /엑셀/);
  });

  test('hwpx 본문에서 이름을 모은다', async () => {
    const section =
      '<hs:sec><hp:p><hp:run><hp:t>3학년 2반 명렬표</hp:t></hp:run></hp:p>' +
      '<hp:p><hp:run><hp:t>번호</hp:t></hp:run></hp:p>' +
      '<hp:p><hp:run><hp:t>이름</hp:t></hp:run></hp:p>' +
      '<hp:p><hp:run><hp:t>1</hp:t></hp:run></hp:p>' +
      '<hp:p><hp:run><hp:t>김민수</hp:t></hp:run></hp:p>' +
      '<hp:p><hp:run><hp:t>2</hp:t></hp:run></hp:p>' +
      '<hp:p><hp:run><hp:t>이영희</hp:t></hp:run></hp:p>' +
      '<hp:p><hp:run><hp:t>3</hp:t></hp:run></hp:p>' +
      '<hp:p><hp:run><hp:t>박철수</hp:t></hp:run></hp:p>' +
      '<hp:p><hp:run><hp:t>4</hp:t></hp:run></hp:p>' +
      '<hp:p><hp:run><hp:t>정수진</hp:t></hp:run></hp:p></hs:sec>';
    const zip = makeZip({ 'Contents/section0.xml': section, 'mimetype': 'application/hwp+zip' });
    const result = await parseRosterFile(new File([zip as BlobPart], 'roster.hwpx'));
    assert.deepEqual(result.names, ['김민수', '이영희', '박철수', '정수진']);
  });

  test('명부가 아닌 서식 문서에서는 아무도 집어 오지 않는다', () => {
    // 실측: 공모전 제출 서식에서 «접수번호·팀명·프로젝트명·내용»이 학생으로 잡혔다
    assert.deepEqual(pickNamesFromLines(['접수번호', '팀명', '프로젝트명', '내용', '미지정']), []);
  });

  test('성씨가 흔치 않아도 명부로 확인되면 함께 넘긴다', () => {
    const names = pickNamesFromLines(['김민수', '이영희', '박철수', '빙그레']);
    assert.deepEqual(names, ['김민수', '이영희', '박철수', '빙그레']);
  });

  test('CSV는 이름 열만 추린다', async () => {
    const csv = '번호,이름,성별\n1,김민수,남\n2,이영희,여\n3,박철수,남\n';
    const result = await parseRosterFile(new File([csv], 'roster.csv'));
    assert.deepEqual(result.names, ['김민수', '이영희', '박철수']);
  });

  test('탭으로 나뉜 붙여넣기도 읽는다', () => {
    assert.deepEqual(parseDelimited('1\t김민수\n2\t이영희'), [['1', '김민수'], ['2', '이영희']]);
  });

  test('옛 엑셀(.xls)은 이유를 알려 주고 거절한다', async () => {
    await assert.rejects(
      () => parseRosterFile(new File([new Uint8Array([0xd0, 0xcf, 0x11, 0xe0, 0, 0, 0, 0]) as BlobPart], 'old.xls')),
      /HWP|xlsx/
    );
  });
});
