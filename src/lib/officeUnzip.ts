/**
 * 브라우저 내장 `DecompressionStream` 만으로 ZIP을 푼다.
 *
 * .xlsx 와 .hwpx 는 둘 다 XML을 담은 ZIP이다. 이것 하나 때문에 압축 라이브러리를
 * 새로 들이면 번들도 커지고 공급망도 늘어난다. 필요한 건 "저장(0)·Deflate(8)로
 * 압축된 작은 파일 몇 개 읽기"뿐이라 표준 API로 충분하다.
 */

const EOCD_SIG = 0x06054b50;
const CEN_SIG = 0x02014b50;
const LOC_SIG = 0x04034b50;

/**
 * raw deflate 해제.
 *
 * `tolerateTrailingJunk` 는 .hwp 용이다. HWP 섹션 스트림은 압축이 끝난 뒤에도
 * 스트림 크기를 맞추려고 남는 바이트가 붙어 있어서, 그대로 넣으면
 * "Trailing junk found after the end of the compressed stream" 로 죽는다(실측).
 * 그 시점에 이미 필요한 데이터는 다 나왔으므로 받은 만큼을 돌려준다.
 */
async function inflateRaw(data: Uint8Array, tolerateTrailingJunk = false): Promise<Uint8Array> {
  const ds = new DecompressionStream('deflate-raw');
  const writer = ds.writable.getWriter();
  void writer.write(data as BufferSource).catch(() => {});
  void writer.close().catch(() => {});

  const reader = ds.readable.getReader();
  const chunks: Uint8Array[] = [];
  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      if (value) chunks.push(value);
    }
  } catch (e) {
    if (!tolerateTrailingJunk || chunks.length === 0) throw e;
  }

  const total = chunks.reduce((n, c) => n + c.length, 0);
  const out = new Uint8Array(total);
  let at = 0;
  for (const c of chunks) {
    out.set(c, at);
    at += c.length;
  }
  return out;
}

/** ZIP 바이트 → { 경로: 내용 }. 압축 방식 0(저장)·8(deflate)만 다룬다. */
export async function unzip(buffer: ArrayBuffer): Promise<Map<string, Uint8Array>> {
  const view = new DataView(buffer);
  const bytes = new Uint8Array(buffer);

  // EOCD 는 파일 끝에 있고 주석이 붙을 수 있어 뒤에서부터 찾는다(주석 최대 64KB).
  let eocd = -1;
  const from = Math.max(0, bytes.length - 66_000);
  for (let i = bytes.length - 22; i >= from; i--) {
    if (view.getUint32(i, true) === EOCD_SIG) {
      eocd = i;
      break;
    }
  }
  if (eocd < 0) throw new Error('ZIP 형식이 아닙니다');

  const count = view.getUint16(eocd + 10, true);
  let offset = view.getUint32(eocd + 16, true);
  if (offset === 0xffffffff) throw new Error('ZIP64 파일은 지원하지 않습니다');

  const decoder = new TextDecoder();
  const out = new Map<string, Uint8Array>();

  for (let n = 0; n < count; n++) {
    if (view.getUint32(offset, true) !== CEN_SIG) break;
    const method = view.getUint16(offset + 10, true);
    const compressedSize = view.getUint32(offset + 20, true);
    const nameLen = view.getUint16(offset + 28, true);
    const extraLen = view.getUint16(offset + 30, true);
    const commentLen = view.getUint16(offset + 32, true);
    const localOffset = view.getUint32(offset + 42, true);
    const name = decoder.decode(bytes.subarray(offset + 46, offset + 46 + nameLen));
    offset += 46 + nameLen + extraLen + commentLen;

    if (name.endsWith('/')) continue;
    if (view.getUint32(localOffset, true) !== LOC_SIG) continue;
    // 로컬 헤더의 이름·엑스트라 길이는 중앙 디렉터리 값과 다를 수 있어 다시 읽는다.
    const localNameLen = view.getUint16(localOffset + 26, true);
    const localExtraLen = view.getUint16(localOffset + 28, true);
    const start = localOffset + 30 + localNameLen + localExtraLen;
    const raw = bytes.subarray(start, start + compressedSize);

    if (method === 0) out.set(name, raw);
    else if (method === 8) out.set(name, await inflateRaw(raw));
    // 그 밖의 방식(bzip2 등)은 오피스 문서가 쓰지 않는다 — 조용히 건너뛴다.
  }
  return out;
}

export { inflateRaw };
