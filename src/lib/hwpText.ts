/**
 * 바이너리 한글 문서(.hwp, HWP 5.0)에서 글자만 뽑아낸다.
 *
 * .hwpx 는 ZIP+XML이라 쉽지만, 학교에서 도는 명부는 아직 대부분 구형 .hwp 다.
 * 구조는 CFB(복합 문서) 컨테이너 + 섹션별 raw-deflate 스트림 + 태그 레코드다.
 * 서식·표 구조는 버리고 문단 텍스트만 줄 단위로 모은다 — 명부에서 필요한 건
 * 이름 문자열뿐이고, 표의 각 칸도 문단으로 들어 있어 한 줄씩 떨어진다.
 */
import { inflateRaw } from './officeUnzip';

const CFB_SIGNATURE = [0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1];
const END_OF_CHAIN = 0xfffffffe;
const HWPTAG_PARA_TEXT = 0x43; // HWPTAG_BEGIN(0x10) + 51

/** 1글자만 차지하는 제어 문자. 10·13은 줄바꿈, 나머지는 버린다. */
const ONE_CHAR_CONTROLS = new Set([0, 10, 13, 24, 25, 26, 27, 28, 29, 30, 31]);

interface DirEntry {
  name: string;
  type: number;
  start: number;
  size: number;
}

export function isHwpFile(buffer: ArrayBuffer): boolean {
  const b = new Uint8Array(buffer);
  return CFB_SIGNATURE.every((v, i) => b[i] === v);
}

function readCfb(buffer: ArrayBuffer) {
  const view = new DataView(buffer);
  const sectorSize = 1 << view.getUint16(0x1e, true);
  const miniSectorSize = 1 << view.getUint16(0x20, true);
  const numFatSectors = view.getUint32(0x2c, true);
  const firstDirSector = view.getUint32(0x30, true);
  const miniCutoff = view.getUint32(0x38, true);
  const firstMiniFat = view.getUint32(0x3c, true);
  const firstDifat = view.getUint32(0x44, true);
  const numDifat = view.getUint32(0x48, true);

  const sectorOffset = (s: number) => 512 + s * sectorSize;
  const perSector = sectorSize / 4;

  // DIFAT: 헤더 안 109개 + (아주 큰 파일이면) 추가 섹터
  const fatSectors: number[] = [];
  for (let i = 0; i < 109 && fatSectors.length < numFatSectors; i++) {
    const s = view.getUint32(0x4c + i * 4, true);
    if (s <= END_OF_CHAIN - 1) fatSectors.push(s);
  }
  let difat = firstDifat;
  for (let n = 0; n < numDifat && difat < END_OF_CHAIN; n++) {
    const base = sectorOffset(difat);
    for (let i = 0; i < perSector - 1 && fatSectors.length < numFatSectors; i++) {
      const s = view.getUint32(base + i * 4, true);
      if (s <= END_OF_CHAIN - 1) fatSectors.push(s);
    }
    difat = view.getUint32(base + (perSector - 1) * 4, true);
  }

  const fat: number[] = [];
  for (const s of fatSectors) {
    const base = sectorOffset(s);
    for (let i = 0; i < perSector; i++) fat.push(view.getUint32(base + i * 4, true));
  }

  const chain = (start: number) => {
    const out: number[] = [];
    let cur = start;
    // fat 이 깨진 파일에서 무한 루프에 빠지지 않도록 길이로 막는다.
    while (cur < END_OF_CHAIN && out.length <= fat.length) {
      out.push(cur);
      cur = fat[cur] ?? END_OF_CHAIN;
    }
    return out;
  };

  const readChain = (start: number, size: number) => {
    const bytes = new Uint8Array(buffer);
    const out = new Uint8Array(size);
    let written = 0;
    for (const s of chain(start)) {
      if (written >= size) break;
      const take = Math.min(sectorSize, size - written);
      out.set(bytes.subarray(sectorOffset(s), sectorOffset(s) + take), written);
      written += take;
    }
    return out;
  };

  // 디렉터리 항목 — 적록 트리를 타지 않고 전부 훑는다(이름만 필요하다).
  const entries: DirEntry[] = [];
  for (const s of chain(firstDirSector)) {
    for (let i = 0; i < sectorSize / 128; i++) {
      const base = sectorOffset(s) + i * 128;
      const nameLen = view.getUint16(base + 0x40, true);
      if (nameLen < 2) continue;
      let name = '';
      for (let c = 0; c < nameLen / 2 - 1; c++) name += String.fromCharCode(view.getUint16(base + c * 2, true));
      entries.push({
        name,
        type: view.getUint8(base + 0x42),
        start: view.getUint32(base + 0x74, true),
        size: view.getUint32(base + 0x78, true),
      });
    }
  }

  // 작은 스트림은 루트 항목이 들고 있는 "미니 스트림" 안에 미니FAT 체인으로 들어간다.
  const root = entries.find((e) => e.type === 5);
  const miniStream = root && root.size > 0 ? readChain(root.start, root.size) : new Uint8Array(0);
  const miniFat: number[] = [];
  for (const s of chain(firstMiniFat)) {
    const base = sectorOffset(s);
    for (let i = 0; i < perSector; i++) miniFat.push(view.getUint32(base + i * 4, true));
  }

  const readEntry = (e: DirEntry) => {
    if (e.size >= miniCutoff) return readChain(e.start, e.size);
    const out = new Uint8Array(e.size);
    let written = 0;
    let cur = e.start;
    while (cur < END_OF_CHAIN && written < e.size) {
      const take = Math.min(miniSectorSize, e.size - written);
      out.set(miniStream.subarray(cur * miniSectorSize, cur * miniSectorSize + take), written);
      written += take;
      cur = miniFat[cur] ?? END_OF_CHAIN;
    }
    return out;
  };

  return { entries, readEntry };
}

function recordsToText(section: Uint8Array): string[] {
  const view = new DataView(section.buffer, section.byteOffset, section.byteLength);
  const lines: string[] = [];
  let p = 0;
  while (p + 4 <= section.byteLength) {
    const header = view.getUint32(p, true);
    const tag = header & 0x3ff;
    let size = (header >> 20) & 0xfff;
    p += 4;
    if (size === 0xfff) {
      if (p + 4 > section.byteLength) break;
      size = view.getUint32(p, true);
      p += 4;
    }
    if (p + size > section.byteLength) break;

    if (tag === HWPTAG_PARA_TEXT) {
      let text = '';
      for (let i = 0; i + 1 < size; ) {
        const ch = view.getUint16(p + i, true);
        if (ch === 10 || ch === 13) {
          text += '\n';
          i += 2;
        } else if (ONE_CHAR_CONTROLS.has(ch)) {
          i += 2;
        } else if (ch < 32) {
          i += 16; // 확장·인라인 컨트롤은 8글자(16바이트)를 차지한다
        } else {
          text += String.fromCharCode(ch);
          i += 2;
        }
      }
      lines.push(...text.split('\n'));
    }
    p += size;
  }
  return lines;
}

/** .hwp 바이트 → 문단 텍스트 줄 목록 */
export async function extractHwpLines(buffer: ArrayBuffer): Promise<string[]> {
  const { entries, readEntry } = readCfb(buffer);

  const fileHeader = entries.find((e) => e.name === 'FileHeader');
  if (!fileHeader) throw new Error('한글 문서(HWP 5.0)가 아닙니다');
  const head = readEntry(fileHeader);
  const flags = new DataView(head.buffer, head.byteOffset, head.byteLength).getUint32(36, true);
  const compressed = (flags & 1) !== 0;
  if ((flags & 2) !== 0) throw new Error('암호가 걸린 한글 문서는 읽을 수 없습니다');

  const sections = entries
    .filter((e) => e.type === 2 && /^Section\d+$/.test(e.name))
    .sort((a, b) => Number(a.name.slice(7)) - Number(b.name.slice(7)));
  if (sections.length === 0) throw new Error('본문을 찾지 못했습니다');

  const lines: string[] = [];
  for (const s of sections) {
    const raw = readEntry(s);
    lines.push(...recordsToText(compressed ? await inflateRaw(raw, true) : raw));
  }
  return lines;
}
