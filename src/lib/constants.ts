export const APP_NAME = 'KingSeeker';
export const APP_NAME_KO = '킹시커';
export const APP_SUBTITLE = '왕을 찾아라! 교실 퀴즈 배틀';

export const GRADES = [3, 4, 5, 6] as const;
export type Grade = (typeof GRADES)[number];

export const GRADE_BANDS = [
  { key: '3-4', label: '3-4학년군', grades: [3, 4] as const },
  { key: '5-6', label: '5-6학년군', grades: [5, 6] as const },
] as const;
export type GradeBandKey = (typeof GRADE_BANDS)[number]['key'];

export const NATIONAL_SUBJECTS: readonly string[] = ['국어', '도덕'];

export const SUBJECTS = ['국어', '수학', '사회', '과학', '영어', '도덕'] as const;
export type Subject = (typeof SUBJECTS)[number];

export const QUESTION_TYPES = ['multiple_choice', 'ox', 'fill_blank', 'short_answer'] as const;
export type QuestionType = (typeof QUESTION_TYPES)[number];

export const QUESTION_TYPE_LABELS: Record<QuestionType, string> = {
  multiple_choice: '4지선다',
  ox: 'O/X',
  fill_blank: '빈칸 채우기',
  short_answer: '단답형',
};

export const TEAM_DEFAULTS = {
  A: { name: '청룡', emoji: '🐲', color: 'blue' as const },
  B: { name: '백호', emoji: '🐯', color: 'amber' as const },
};

export const TARGET_SCORES = [1, 2, 3, 4, 5] as const;
export const TIMER_OPTIONS = [10, 15, 20, 30, 45, 60] as const;

export const RPS_OPTIONS = ['rock', 'paper', 'scissors'] as const;
export type RPSChoice = (typeof RPS_OPTIONS)[number];

export const RPS_LABELS: Record<RPSChoice, string> = {
  rock: '✊ 바위',
  paper: '✋ 보',
  scissors: '✌️ 가위',
};

export const RPS_EMOJI: Record<RPSChoice, string> = {
  rock: '✊',
  paper: '✋',
  scissors: '✌️',
};

/**
 * 교육과정 단원 — **학기까지 함께** 담는다.
 *
 * 왜 학기가 필요했나: 전에는 학년·과목별로 단원을 한 줄로 늘어놓기만 했다.
 * 그래서 5학년 담임이 2학기에 사회 수업을 하려고 들어와도 1학기 지리 단원과
 * 2학기 역사 단원이 구분 없이 한 목록에 섞여 나왔고, 학년군(5-6) 묶음에서는
 * 6학년 단원까지 함께 떴다. 교사가 "지금 가르치는 단원"을 찾는 데 시간이 걸린다.
 *
 * 사회는 2022 개정 교육과정 5~6학년군 12개 대주제를 그대로 따른다
 * ([6사01] ~ [6사12], 학기당 3개). 5학년 2학기 전체가 한국사다 —
 * (1) 선사~고려  (2) 조선~개항기  (3) 일제강점기~6·25.
 * 근거: 교육부 고시 2022-33호 사회과 교육과정 + 2026학년도 검정 교과서 목차.
 * GPT·Gemini 두 계열 교차확인에서 12개 단원명·학기 배치가 모두 일치했다(2026-09-10).
 *
 * 다른 과목의 학기 배정은 교과서 단원 순서를 반으로 나눈 값이다(수학은 실제
 * 교과서 편제와 일치함을 확인했다). 배정이 어긋나도 교사가 단원을 못 찾는 일은
 * 없도록, 화면의 학기 고르개는 기본값이 '전체'다 — 학기는 좁혀 주는 장치이지
 * 숨기는 장치가 아니다.
 */
export const CURRICULUM_BY_SEMESTER: Record<string, Record<string, { 1: string[]; 2: string[] }>> = {
  '3': {
    '국어': {
      1: ["1. 작품을 보고 느낌을 나누어요", "2. 중심 생각을 찾아요", "3. 자신의 경험을 글로 써요", "4. 감동을 나타내요"],
      2: ["5. 바르게 대화해요", "6. 마음을 담아 글을 써요", "7. 글을 읽고 소개해요", "8. 글의 흐름을 생각해요"],
    },
    '수학': {
      1: ["1. 덧셈과 뺄셈", "2. 평면도형", "3. 나눗셈", "4. 곱셈", "5. 길이와 시간", "6. 분수와 소수"],
      2: ["7. 곱셈(2학기)", "8. 나눗셈(2학기)", "9. 원", "10. 분수", "11. 들이와 무게", "12. 자료의 정리"],
    },
    '사회': {
      1: ["1. 우리가 사는 곳", "2. 일상에서 만나는 과거"],
      2: ["3. 가족의 모습과 역할 변화", "4. 다양한 삶의 모습"],
    },
    '과학': {
      1: ["1. 힘과 우리 생활", "2. 동물의 생활", "3. 식물의 생활", "4. 생물의 한살이"],
      2: ["5. 물질의 성질", "6. 지구와 바다", "7. 소리의 성질", "8. 안전한 과학탐구와 건강한 생활"],
    },
    '영어': {
      1: ["1. Hello! I'm Mina", "2. What Is It?", "3. I Like Apples"],
      2: ["4. How Old Are You?", "5. I Can Swim", "6. How Many Cats?"],
    },
    '도덕': {
      1: ["1. 나와 너, 우리 함께", "2. 우리 모두 소중해요"],
      2: ["3. 함께 어울려 살아요", "4. 생명을 존중해요"],
    },
  },
  '4': {
    '국어': {
      1: ["1. 생각과 느낌을 나눠요", "2. 내용을 간추려요", "3. 느낌을 살려 말해요", "4. 이야기 속 세상"],
      2: ["5. 의견이 드러나는 글", "6. 회의를 해요", "7. 사실과 의견을 구별해요", "8. 이어질 이야기를 상상해요"],
    },
    '수학': {
      1: ["1. 큰 수", "2. 각도", "3. 곱셈과 나눗셈", "4. 삼각형", "5. 혼합 계산"],
      2: ["6. 막대그래프", "7. 규칙 찾기", "8. 분수의 덧셈과 뺄셈", "9. 사각형", "10. 다각형"],
    },
    '사회': {
      1: ["1. 지역의 위치와 특성", "2. 우리 지역의 어제와 오늘"],
      2: ["3. 지역의 공공 기관과 주민 참여", "4. 촌락과 도시의 생활 모습"],
    },
    '과학': {
      1: ["1. 자석의 이용", "2. 물의 상태 변화", "3. 땅의 변화", "4. 다양한 생물과 우리 생활"],
      2: ["5. 밤하늘 관찰", "6. 생물과 환경", "7. 기체의 성질", "8. 기후변화와 우리 생활"],
    },
    '영어': {
      1: ["1. I Have a Pencil", "2. Let's Play Soccer", "3. It's Under the Table"],
      2: ["4. Do You Like Music?", "5. How's the Weather?", "6. What Day Is It Today?"],
    },
    '도덕': {
      1: ["1. 자신을 소중히 여기며", "2. 공정한 생활"],
      2: ["3. 함께하는 디지털 세상", "4. 생명의 소중함"],
    },
  },
  '5': {
    '국어': {
      1: ["1. 대화를 나누어요", "2. 체험한 일을 글로 써요", "3. 발표하고 질문해요"],
      2: ["4. 대상을 설명해요", "5. 의논하며 토의해요", "6. 작품을 즐겨요"],
    },
    '수학': {
      1: ["1. 자연수의 혼합 계산", "2. 약수와 배수", "3. 대응 관계", "4. 약분과 통분", "5. 분수의 덧셈과 뺄셈", "6. 다각형의 둘레와 넓이"],
      2: ["7. 수의 범위와 어림하기", "8. 분수의 곱셈", "9. 합동과 대칭", "10. 소수의 곱셈", "11. 직육면체", "12. 평균과 가능성"],
    },
    '사회': {
      1: ["1. 우리나라 국토 여행", "2. 우리나라 지리 탐구", "3. 법과 인권의 보장"],
      2: ["1. 유적과 유물로 살펴본 옛 사람들의 생활", "2. 달라지는 시대, 변화하는 생활 모습", "3. 식민 통치와 저항, 전쟁이 바꾼 사회와 생활"],
    },
    '과학': {
      1: ["1. 지층과 화석", "2. 빛의 성질", "3. 용해와 용액", "4. 우리 몸의 구조와 기능"],
      2: ["5. 혼합물의 분리", "6. 날씨와 우리 생활", "7. 열과 우리 생활", "8. 자원과 에너지"],
    },
    '영어': {
      1: ["1. Where Are You From?", "2. Where Are You?", "3. What Do You Do on Saturday?", "4. Can I Feed the Parrot?", "5. Whose Sock Is This?", "6. What's Your Favorite Subject?", "7. What Time Do You Get Up?", "8. What Will You Do This Summer?"],
      2: ["9. How Was Your Vacation?", "10. Let's Go Camping", "11. What Does He Look Like?", "12. Where Is the Toy Shop?", "13. How Much Are the Glasses?", "14. What Do You Want to Be?", "15. There Is a Table in the Living Room", "16. What Season Do You Like?"],
    },
    '도덕': {
      1: ["1. 도덕적 상상력, 나를 돌아보다", "2. 내 안의 소중한 친구, 자존감"],
      2: ["3. 긍정의 힘으로 극복하기", "4. 함께 만들어가는 사이버 세상"],
    },
  },
  '6': {
    '국어': {
      1: ["1. 비유하는 표현", "2. 이야기를 간추려요", "3. 짜임새 있게 구성해요", "4. 효과적으로 발표해요"],
      2: ["5. 글에 담긴 생각과 비평", "6. 타당성을 생각하며 토론해요", "7. 우리말을 가꾸어요", "8. 인물의 삶을 찾아서"],
    },
    '수학': {
      1: ["1. 분수의 나눗셈", "2. 각기둥과 각뿔", "3. 소수의 나눗셈", "4. 비와 비율", "5. 원의 넓이"],
      2: ["6. 직육면체의 부피와 겉넓이", "7. 여러 가지 그래프", "8. 비례식과 비례배분", "9. 원기둥, 원뿔, 구", "10. 경우의 수"],
    },
    '사회': {
      1: ["1. 평화 통일을 위한 노력, 민주화와 산업화", "2. 민주주의와 시민 참여", "3. 지구, 대륙 그리고 국가들"],
      2: ["1. 세계의 자연환경", "2. 시장경제와 국가 간 거래", "3. 지구촌 사람들"],
    },
    '과학': {
      1: ["1. 산과 염기", "2. 물체의 운동", "3. 식물의 구조와 기능", "4. 지구의 자전과 계절 변화"],
      2: ["5. 물질의 변화", "6. 전기의 이용", "7. 과학과 진로"],
    },
    '영어': {
      1: ["1. What Grade Are You In?", "2. Is This Your Cap?", "3. What Are You Doing?"],
      2: ["4. When Is Your Birthday?", "5. How Much Is It?", "6. I Want to Be a Chef"],
    },
    '도덕': {
      1: ["1. 내가 할 수 있는 것과 할 수 없는 것", "2. 마음을 열면 보이는 것들"],
      2: ["3. 함께 꿈꾸는 우리 사회", "4. 세계 속의 우리"],
    },
  },
};

export const SEMESTERS = [1, 2] as const;
export type Semester = (typeof SEMESTERS)[number];

/** 학년·과목의 전체 단원 (1학기 → 2학기 순서). 학기 구분이 필요 없는 화면이 쓴다. */
export const CURRICULUM_UNITS: Record<string, Record<string, string[]>> = Object.fromEntries(
  Object.entries(CURRICULUM_BY_SEMESTER).map(([grade, subjects]) => [
    grade,
    Object.fromEntries(
      Object.entries(subjects).map(([subject, bySem]) => [subject, [...bySem[1], ...bySem[2]]])
    ),
  ])
);

/** 이 단원이 몇 학기 단원인가. 표에 없으면 null(보충 단원 등). */
export function getUnitSemester(grade: number | string, subject: string, unit: string): Semester | null {
  const bySem = CURRICULUM_BY_SEMESTER[String(grade)]?.[subject];
  if (!bySem) return null;
  if (bySem[1].includes(unit)) return 1;
  if (bySem[2].includes(unit)) return 2;
  return null;
}

/** 학년·과목·학기의 단원 목록 (학기를 안 주면 전체) */
export function getUnitsFor(grade: number | string, subject: string, semester?: Semester | null): string[] {
  const bySem = CURRICULUM_BY_SEMESTER[String(grade)]?.[subject];
  if (!bySem) return [];
  if (semester === 1 || semester === 2) return bySem[semester];
  return [...bySem[1], ...bySem[2]];
}
