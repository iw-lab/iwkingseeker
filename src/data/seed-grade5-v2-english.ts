import type { QuestionSeed } from './questions-seed';

const out: QuestionSeed[] = [];
const push = (q: Omit<QuestionSeed, 'grade' | 'subject'>) =>
  out.push({ grade: 5, subject: '영어', ...q });

/** 초등 5학년 수준 기본 어휘 × 문형 패턴으로 대량 생성 */

interface Word {
  en: string;
  ko: string;
  cat?: 'animal' | 'food' | 'object' | 'color' | 'verb' | 'adj' | 'body' | 'place' | 'job' | 'weather' | 'number';
}

const words: Word[] = [
  { en: 'apple', ko: '사과', cat: 'food' },
  { en: 'banana', ko: '바나나', cat: 'food' },
  { en: 'orange', ko: '오렌지', cat: 'food' },
  { en: 'grape', ko: '포도', cat: 'food' },
  { en: 'strawberry', ko: '딸기', cat: 'food' },
  { en: 'watermelon', ko: '수박', cat: 'food' },
  { en: 'peach', ko: '복숭아', cat: 'food' },
  { en: 'lemon', ko: '레몬', cat: 'food' },
  { en: 'tomato', ko: '토마토', cat: 'food' },
  { en: 'potato', ko: '감자', cat: 'food' },
  { en: 'carrot', ko: '당근', cat: 'food' },
  { en: 'onion', ko: '양파', cat: 'food' },
  { en: 'bread', ko: '빵', cat: 'food' },
  { en: 'rice', ko: '쌀', cat: 'food' },
  { en: 'milk', ko: '우유', cat: 'food' },
  { en: 'water', ko: '물', cat: 'food' },
  { en: 'juice', ko: '주스', cat: 'food' },
  { en: 'cheese', ko: '치즈', cat: 'food' },
  { en: 'egg', ko: '달걀', cat: 'food' },
  { en: 'chicken', ko: '닭(닭고기)', cat: 'food' },
  { en: 'pizza', ko: '피자', cat: 'food' },
  { en: 'hamburger', ko: '햄버거', cat: 'food' },
  { en: 'cake', ko: '케이크', cat: 'food' },
  { en: 'candy', ko: '사탕', cat: 'food' },
  { en: 'chocolate', ko: '초콜릿', cat: 'food' },
  { en: 'ice cream', ko: '아이스크림', cat: 'food' },
  { en: 'cookie', ko: '쿠키', cat: 'food' },
  { en: 'salad', ko: '샐러드', cat: 'food' },
  { en: 'soup', ko: '수프', cat: 'food' },
  { en: 'noodles', ko: '국수', cat: 'food' },
  { en: 'dog', ko: '개', cat: 'animal' },
  { en: 'cat', ko: '고양이', cat: 'animal' },
  { en: 'rabbit', ko: '토끼', cat: 'animal' },
  { en: 'bird', ko: '새', cat: 'animal' },
  { en: 'fish', ko: '물고기', cat: 'animal' },
  { en: 'horse', ko: '말', cat: 'animal' },
  { en: 'cow', ko: '소', cat: 'animal' },
  { en: 'pig', ko: '돼지', cat: 'animal' },
  { en: 'sheep', ko: '양', cat: 'animal' },
  { en: 'chicken', ko: '닭', cat: 'animal' },
  { en: 'duck', ko: '오리', cat: 'animal' },
  { en: 'tiger', ko: '호랑이', cat: 'animal' },
  { en: 'lion', ko: '사자', cat: 'animal' },
  { en: 'bear', ko: '곰', cat: 'animal' },
  { en: 'fox', ko: '여우', cat: 'animal' },
  { en: 'wolf', ko: '늑대', cat: 'animal' },
  { en: 'monkey', ko: '원숭이', cat: 'animal' },
  { en: 'elephant', ko: '코끼리', cat: 'animal' },
  { en: 'giraffe', ko: '기린', cat: 'animal' },
  { en: 'zebra', ko: '얼룩말', cat: 'animal' },
  { en: 'panda', ko: '판다', cat: 'animal' },
  { en: 'snake', ko: '뱀', cat: 'animal' },
  { en: 'frog', ko: '개구리', cat: 'animal' },
  { en: 'turtle', ko: '거북이', cat: 'animal' },
  { en: 'mouse', ko: '쥐', cat: 'animal' },
  { en: 'red', ko: '빨간색', cat: 'color' },
  { en: 'blue', ko: '파란색', cat: 'color' },
  { en: 'yellow', ko: '노란색', cat: 'color' },
  { en: 'green', ko: '초록색', cat: 'color' },
  { en: 'white', ko: '흰색', cat: 'color' },
  { en: 'black', ko: '검은색', cat: 'color' },
  { en: 'pink', ko: '분홍색', cat: 'color' },
  { en: 'purple', ko: '보라색', cat: 'color' },
  { en: 'brown', ko: '갈색', cat: 'color' },
  { en: 'gray', ko: '회색', cat: 'color' },
  { en: 'orange', ko: '주황색', cat: 'color' },
  { en: 'book', ko: '책', cat: 'object' },
  { en: 'pencil', ko: '연필', cat: 'object' },
  { en: 'pen', ko: '펜', cat: 'object' },
  { en: 'eraser', ko: '지우개', cat: 'object' },
  { en: 'ruler', ko: '자', cat: 'object' },
  { en: 'bag', ko: '가방', cat: 'object' },
  { en: 'desk', ko: '책상', cat: 'object' },
  { en: 'chair', ko: '의자', cat: 'object' },
  { en: 'window', ko: '창문', cat: 'object' },
  { en: 'door', ko: '문', cat: 'object' },
  { en: 'clock', ko: '시계', cat: 'object' },
  { en: 'computer', ko: '컴퓨터', cat: 'object' },
  { en: 'phone', ko: '전화기', cat: 'object' },
  { en: 'camera', ko: '카메라', cat: 'object' },
  { en: 'umbrella', ko: '우산', cat: 'object' },
  { en: 'ball', ko: '공', cat: 'object' },
  { en: 'doll', ko: '인형', cat: 'object' },
  { en: 'robot', ko: '로봇', cat: 'object' },
  { en: 'bike', ko: '자전거', cat: 'object' },
  { en: 'car', ko: '자동차', cat: 'object' },
  { en: 'bus', ko: '버스', cat: 'object' },
  { en: 'train', ko: '기차', cat: 'object' },
  { en: 'ship', ko: '배', cat: 'object' },
  { en: 'airplane', ko: '비행기', cat: 'object' },
  { en: 'run', ko: '달리다', cat: 'verb' },
  { en: 'walk', ko: '걷다', cat: 'verb' },
  { en: 'jump', ko: '뛰다', cat: 'verb' },
  { en: 'sing', ko: '노래하다', cat: 'verb' },
  { en: 'dance', ko: '춤추다', cat: 'verb' },
  { en: 'read', ko: '읽다', cat: 'verb' },
  { en: 'write', ko: '쓰다', cat: 'verb' },
  { en: 'eat', ko: '먹다', cat: 'verb' },
  { en: 'drink', ko: '마시다', cat: 'verb' },
  { en: 'sleep', ko: '자다', cat: 'verb' },
  { en: 'play', ko: '놀다', cat: 'verb' },
  { en: 'study', ko: '공부하다', cat: 'verb' },
  { en: 'swim', ko: '수영하다', cat: 'verb' },
  { en: 'fly', ko: '날다', cat: 'verb' },
  { en: 'cook', ko: '요리하다', cat: 'verb' },
  { en: 'clean', ko: '청소하다', cat: 'verb' },
  { en: 'wash', ko: '씻다', cat: 'verb' },
  { en: 'open', ko: '열다', cat: 'verb' },
  { en: 'close', ko: '닫다', cat: 'verb' },
  { en: 'see', ko: '보다', cat: 'verb' },
  { en: 'hear', ko: '듣다', cat: 'verb' },
  { en: 'like', ko: '좋아하다', cat: 'verb' },
  { en: 'love', ko: '사랑하다', cat: 'verb' },
  { en: 'want', ko: '원하다', cat: 'verb' },
  { en: 'need', ko: '필요하다', cat: 'verb' },
  { en: 'help', ko: '돕다', cat: 'verb' },
  { en: 'make', ko: '만들다', cat: 'verb' },
  { en: 'go', ko: '가다', cat: 'verb' },
  { en: 'come', ko: '오다', cat: 'verb' },
  { en: 'stop', ko: '멈추다', cat: 'verb' },
  { en: 'big', ko: '큰', cat: 'adj' },
  { en: 'small', ko: '작은', cat: 'adj' },
  { en: 'long', ko: '긴', cat: 'adj' },
  { en: 'short', ko: '짧은', cat: 'adj' },
  { en: 'tall', ko: '키 큰', cat: 'adj' },
  { en: 'fast', ko: '빠른', cat: 'adj' },
  { en: 'slow', ko: '느린', cat: 'adj' },
  { en: 'hot', ko: '뜨거운', cat: 'adj' },
  { en: 'cold', ko: '차가운', cat: 'adj' },
  { en: 'happy', ko: '행복한', cat: 'adj' },
  { en: 'sad', ko: '슬픈', cat: 'adj' },
  { en: 'angry', ko: '화난', cat: 'adj' },
  { en: 'tired', ko: '피곤한', cat: 'adj' },
  { en: 'hungry', ko: '배고픈', cat: 'adj' },
  { en: 'thirsty', ko: '목마른', cat: 'adj' },
  { en: 'new', ko: '새로운', cat: 'adj' },
  { en: 'old', ko: '오래된', cat: 'adj' },
  { en: 'good', ko: '좋은', cat: 'adj' },
  { en: 'bad', ko: '나쁜', cat: 'adj' },
  { en: 'beautiful', ko: '아름다운', cat: 'adj' },
  { en: 'smart', ko: '똑똑한', cat: 'adj' },
  { en: 'kind', ko: '친절한', cat: 'adj' },
  { en: 'head', ko: '머리', cat: 'body' },
  { en: 'face', ko: '얼굴', cat: 'body' },
  { en: 'eye', ko: '눈', cat: 'body' },
  { en: 'ear', ko: '귀', cat: 'body' },
  { en: 'nose', ko: '코', cat: 'body' },
  { en: 'mouth', ko: '입', cat: 'body' },
  { en: 'tooth', ko: '치아', cat: 'body' },
  { en: 'hair', ko: '머리카락', cat: 'body' },
  { en: 'neck', ko: '목', cat: 'body' },
  { en: 'arm', ko: '팔', cat: 'body' },
  { en: 'hand', ko: '손', cat: 'body' },
  { en: 'finger', ko: '손가락', cat: 'body' },
  { en: 'leg', ko: '다리', cat: 'body' },
  { en: 'foot', ko: '발', cat: 'body' },
  { en: 'knee', ko: '무릎', cat: 'body' },
  { en: 'school', ko: '학교', cat: 'place' },
  { en: 'home', ko: '집', cat: 'place' },
  { en: 'park', ko: '공원', cat: 'place' },
  { en: 'library', ko: '도서관', cat: 'place' },
  { en: 'hospital', ko: '병원', cat: 'place' },
  { en: 'museum', ko: '박물관', cat: 'place' },
  { en: 'store', ko: '가게', cat: 'place' },
  { en: 'restaurant', ko: '식당', cat: 'place' },
  { en: 'church', ko: '교회', cat: 'place' },
  { en: 'market', ko: '시장', cat: 'place' },
  { en: 'bank', ko: '은행', cat: 'place' },
  { en: 'post office', ko: '우체국', cat: 'place' },
  { en: 'zoo', ko: '동물원', cat: 'place' },
  { en: 'farm', ko: '농장', cat: 'place' },
  { en: 'beach', ko: '해변', cat: 'place' },
  { en: 'mountain', ko: '산', cat: 'place' },
  { en: 'river', ko: '강', cat: 'place' },
  { en: 'sea', ko: '바다', cat: 'place' },
  { en: 'city', ko: '도시', cat: 'place' },
  { en: 'country', ko: '나라(시골)', cat: 'place' },
  { en: 'teacher', ko: '선생님', cat: 'job' },
  { en: 'doctor', ko: '의사', cat: 'job' },
  { en: 'nurse', ko: '간호사', cat: 'job' },
  { en: 'farmer', ko: '농부', cat: 'job' },
  { en: 'cook', ko: '요리사', cat: 'job' },
  { en: 'singer', ko: '가수', cat: 'job' },
  { en: 'artist', ko: '예술가', cat: 'job' },
  { en: 'pilot', ko: '조종사', cat: 'job' },
  { en: 'police officer', ko: '경찰관', cat: 'job' },
  { en: 'firefighter', ko: '소방관', cat: 'job' },
  { en: 'scientist', ko: '과학자', cat: 'job' },
  { en: 'engineer', ko: '공학자', cat: 'job' },
  { en: 'writer', ko: '작가', cat: 'job' },
  { en: 'driver', ko: '운전자', cat: 'job' },
  { en: 'student', ko: '학생', cat: 'job' },
  { en: 'sunny', ko: '화창한', cat: 'weather' },
  { en: 'cloudy', ko: '흐린', cat: 'weather' },
  { en: 'rainy', ko: '비오는', cat: 'weather' },
  { en: 'snowy', ko: '눈오는', cat: 'weather' },
  { en: 'windy', ko: '바람 부는', cat: 'weather' },
  { en: 'foggy', ko: '안개 낀', cat: 'weather' },
  { en: 'warm', ko: '따뜻한', cat: 'weather' },
  { en: 'cool', ko: '시원한', cat: 'weather' },
  { en: 'one', ko: '하나', cat: 'number' },
  { en: 'two', ko: '둘', cat: 'number' },
  { en: 'three', ko: '셋', cat: 'number' },
  { en: 'four', ko: '넷', cat: 'number' },
  { en: 'five', ko: '다섯', cat: 'number' },
  { en: 'six', ko: '여섯', cat: 'number' },
  { en: 'seven', ko: '일곱', cat: 'number' },
  { en: 'eight', ko: '여덟', cat: 'number' },
  { en: 'nine', ko: '아홉', cat: 'number' },
  { en: 'ten', ko: '열', cat: 'number' },
  { en: 'eleven', ko: '열하나', cat: 'number' },
  { en: 'twelve', ko: '열둘', cat: 'number' },
  { en: 'twenty', ko: '스물', cat: 'number' },
  { en: 'thirty', ko: '서른', cat: 'number' },
  { en: 'hundred', ko: '백', cat: 'number' },
];

const unit = '기본 어휘';
// Unique by english word for korean-to-english
const byEn = new Map<string, Word>();
const byKo = new Map<string, Word>();
for (const w of words) {
  if (!byEn.has(w.en)) byEn.set(w.en, w);
  if (!byKo.has(w.ko)) byKo.set(w.ko, w);
}

// Template 1: "XXX의 영어 단어는?" — short_answer
for (const w of byKo.values()) {
  push({
    unit,
    unit_code: null,
    question_type: 'short_answer',
    question_text: `"${w.ko}"을(를) 영어로 쓰면?`,
    options: null,
    correct_answer: w.en,
    explanation: `"${w.ko}"의 영어 단어는 ${w.en}입니다.`,
    difficulty: 1,
  });
}

// Template 2: "XXX의 뜻은?" — multiple_choice
const koList = Array.from(byKo.keys());
for (const w of byEn.values()) {
  // pick 3 distractors different from correct ko
  const distractors: string[] = [];
  for (const k of koList) {
    if (k !== w.ko && distractors.length < 3) {
      if ((k.length + w.en.length + distractors.length) % 3 === 0) distractors.push(k);
    }
  }
  while (distractors.length < 3) {
    for (const k of koList) {
      if (k !== w.ko && !distractors.includes(k)) {
        distractors.push(k);
        if (distractors.length === 3) break;
      }
    }
  }
  const opts = [w.ko, ...distractors];
  push({
    unit,
    unit_code: null,
    question_type: 'multiple_choice',
    question_text: `"${w.en}"의 뜻은?`,
    options: opts,
    correct_answer: w.ko,
    explanation: `${w.en}의 뜻은 "${w.ko}"입니다.`,
    difficulty: 1,
  });
}

// Template 3: OX — "XXX는 YYY를 뜻한다."
let cnt = 0;
for (const w of byEn.values()) {
  const isCorrect = cnt % 2 === 0;
  const wrongKo = isCorrect ? w.ko : koList[(cnt * 7) % koList.length]!;
  // ensure wrongKo differs when !isCorrect
  const shownKo = isCorrect ? w.ko : wrongKo === w.ko ? koList[(cnt * 13 + 3) % koList.length]! : wrongKo;
  push({
    unit,
    unit_code: null,
    question_type: 'ox',
    // 영어 낱말 뒤 조사는 한글 표기를 알아야 정할 수 있어(apple→애플/potato→포테이토)
    // 기계로 해소되지 않는다. 조사가 필요 없는 "~의 뜻은" 꼴로 쓴다.
    question_text: `"${w.en}"의 뜻은 "${shownKo}"이다.`,
    options: ['O', 'X'],
    correct_answer: shownKo === w.ko ? 'O' : 'X',
    explanation: `${w.en}의 뜻은 "${w.ko}"입니다.`,
    difficulty: 1,
  });
  cnt++;
}

/* ────────────────────────────────────────────────────────────────
 * 문형 생성 보조표
 *
 * 이 파일은 어휘 목록 × 문형 템플릿으로 문항을 대량 생성한다.
 * 예전에는 낱말을 사전형 그대로 문형에 끼워 넣어서 영어도 한국어도 비문이 나왔다:
 *   "Can you run?" → 보기 4개가 전부 "너는 달리다 수 있니?" 꼴
 *   "I like apple." (가산명사 단수 무관사) · "This is a eraser." (모음 앞 a)
 * 활용형·복수형·관사는 규칙만으로 안전하게 만들 수 없으므로 표로 못박는다.
 * ──────────────────────────────────────────────────────────────── */

/** 모음 소리로 시작해 관사가 an 인 낱말 */
const AN_WORDS = new Set(['eraser', 'umbrella', 'airplane', 'artist', 'engineer', 'orange', 'onion', 'apple', 'egg', 'elephant', 'ice cream']);
const article = (en: string) => (AN_WORDS.has(en) ? 'an' : 'a');

/** 셀 수 없는 음식 — "I like ~"에서 복수로 만들지 않는다 */
const UNCOUNTABLE = new Set(['bread', 'rice', 'milk', 'water', 'juice', 'cheese', 'chicken', 'pizza', 'ice cream', 'soup', 'chocolate', 'candy', 'salad', 'cake', 'noodles']);

/** 불규칙 복수 — 나머지는 아래 규칙으로 만든다 */
const IRREGULAR_PLURAL: Record<string, string> = {
  fish: 'fish', sheep: 'sheep', mouse: 'mice', wolf: 'wolves',
  potato: 'potatoes', tomato: 'tomatoes', peach: 'peaches', fox: 'foxes',
  strawberry: 'strawberries',
};
function plural(en: string): string {
  if (UNCOUNTABLE.has(en)) return en;
  const irr = IRREGULAR_PLURAL[en];
  if (irr) return irr;
  if (/[^aeiou]y$/.test(en)) return en.slice(0, -1) + 'ies';
  if (/(s|sh|ch|x|z)$/.test(en)) return en + 'es';
  return en + 's';
}

/**
 * 동사의 한국어 활용형.
 *   can  = "~ㄹ 수 있니?"  (걷다→걸을, 돕다→도울 처럼 불규칙이 있어 규칙으로 못 만든다)
 *   ing  = "~고 있니?"
 *   noun = "~는 것을 좋아하니?"  (놀다→노는 처럼 ㄹ 탈락이 있다)
 *   gi   = "~기 싫어하니?"
 * Can you ~? 로 물을 수 없는 동사(like·love·want·need)는 애초에 넣지 않는다.
 */
const VERB_FORMS: Record<string, { can: string; ing: string; noun: string; gi: string }> = {
  '달리다': { can: '달릴', ing: '달리고', noun: '달리는', gi: '달리기' },
  '걷다': { can: '걸을', ing: '걷고', noun: '걷는', gi: '걷기' },
  '뛰다': { can: '뛸', ing: '뛰고', noun: '뛰는', gi: '뛰기' },
  '노래하다': { can: '노래할', ing: '노래하고', noun: '노래하는', gi: '노래하기' },
  '춤추다': { can: '춤출', ing: '춤추고', noun: '춤추는', gi: '춤추기' },
  '읽다': { can: '읽을', ing: '읽고', noun: '읽는', gi: '읽기' },
  '쓰다': { can: '쓸', ing: '쓰고', noun: '쓰는', gi: '쓰기' },
  '먹다': { can: '먹을', ing: '먹고', noun: '먹는', gi: '먹기' },
  '마시다': { can: '마실', ing: '마시고', noun: '마시는', gi: '마시기' },
  '자다': { can: '잘', ing: '자고', noun: '자는', gi: '자기' },
  '놀다': { can: '놀', ing: '놀고', noun: '노는', gi: '놀기' },
  '공부하다': { can: '공부할', ing: '공부하고', noun: '공부하는', gi: '공부하기' },
  '수영하다': { can: '수영할', ing: '수영하고', noun: '수영하는', gi: '수영하기' },
  '날다': { can: '날', ing: '날고', noun: '나는', gi: '날기' },
  '요리하다': { can: '요리할', ing: '요리하고', noun: '요리하는', gi: '요리하기' },
  '청소하다': { can: '청소할', ing: '청소하고', noun: '청소하는', gi: '청소하기' },
  '씻다': { can: '씻을', ing: '씻고', noun: '씻는', gi: '씻기' },
  '열다': { can: '열', ing: '열고', noun: '여는', gi: '열기' },
  '닫다': { can: '닫을', ing: '닫고', noun: '닫는', gi: '닫기' },
  '보다': { can: '볼', ing: '보고', noun: '보는', gi: '보기' },
  '듣다': { can: '들을', ing: '듣고', noun: '듣는', gi: '듣기' },
  '돕다': { can: '도울', ing: '돕고', noun: '돕는', gi: '돕기' },
  '만들다': { can: '만들', ing: '만들고', noun: '만드는', gi: '만들기' },
  '가다': { can: '갈', ing: '가고', noun: '가는', gi: '가기' },
  '오다': { can: '올', ing: '오고', noun: '오는', gi: '오기' },
  '멈추다': { can: '멈출', ing: '멈추고', noun: '멈추는', gi: '멈추기' },
};

// Template 4: I like ___ sentence
{
  const sentenceUnit = '문장 패턴';
  for (const w of byEn.values()) {
    if (w.cat === 'food' || w.cat === 'animal') {
      push({
        unit: sentenceUnit,
        unit_code: null,
        question_type: 'short_answer',
        question_text: `"나는 ${w.ko}을(를) 좋아해."를 영어로 쓰면? (I like ~)`,
        options: null,
        correct_answer: `I like ${plural(w.en)}.`,
        explanation: UNCOUNTABLE.has(w.en)
          ? `셀 수 없는 것은 그대로 씁니다 — "I like ${w.en}."`
          : `좋아하는 것을 두루 말할 때는 복수로 씁니다 — "I like ${plural(w.en)}."`,
        difficulty: 2,
      });
    }
  }
  // Can you ~? / Yes, I can.
  const verbs = Array.from(byEn.values()).filter((w) => w.cat === 'verb');
  for (const v of verbs) {
    const f = VERB_FORMS[v.ko];
    if (!f) continue; // like·love·want·need 는 "Can you ~?"로 물을 수 없다
    push({
      unit: sentenceUnit,
      unit_code: null,
      question_type: 'multiple_choice',
      question_text: `"Can you ${v.en}?"의 뜻은?`,
      options: [
        `너는 ${f.can} 수 있니?`,
        `너는 ${f.noun} 것을 좋아하니?`,
        `너는 ${f.ing} 있니?`,
        `너는 ${f.gi} 싫어하니?`,
      ],
      correct_answer: `너는 ${f.can} 수 있니?`,
      explanation: `"Can you ~?"는 "~할 수 있니?"처럼 능력을 묻는 표현입니다.`,
      difficulty: 2,
    });
  }
  // How's the weather?
  const weathers = Array.from(byEn.values()).filter((w) => w.cat === 'weather');
  for (const w of weathers) {
    push({
      unit: sentenceUnit,
      unit_code: null,
      question_type: 'short_answer',
      question_text: `"날씨가 ${w.ko}."를 영어로 쓰면? (It's ~)`,
      options: null,
      correct_answer: `It's ${w.en}.`,
      explanation: `날씨를 표현할 때 "It's + 날씨 형용사."를 씁니다.`,
      difficulty: 2,
    });
  }
  // This is a ~
  const objs = Array.from(byEn.values()).filter((w) => w.cat === 'object');
  for (const o of objs) {
    push({
      unit: sentenceUnit,
      unit_code: null,
      question_type: 'short_answer',
      question_text: `"이것은 ${o.ko}(이)야."를 영어로 쓰면? (This is ~)`,
      options: null,
      correct_answer: `This is ${article(o.en)} ${o.en}.`,
      explanation: `모음 소리로 시작하면 an, 아니면 a 를 씁니다 — "This is ${article(o.en)} ${o.en}."`,
      difficulty: 2,
    });
  }
  // He/She is a ~ (job)
  const jobs = Array.from(byEn.values()).filter((w) => w.cat === 'job');
  for (const j of jobs) {
    push({
      unit: sentenceUnit,
      unit_code: null,
      question_type: 'short_answer',
      question_text: `"그는 ${j.ko}(이)야."를 영어로 쓰면? (He is ~)`,
      options: null,
      correct_answer: `He is ${article(j.en)} ${j.en}.`,
      explanation: `모음 소리로 시작하면 an 을 씁니다 — "He is ${article(j.en)} ${j.en}."`,
      difficulty: 2,
    });
  }
}

export const seedGrade5V2English: QuestionSeed[] = out;
