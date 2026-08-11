/**
 * 단원명 정합화 — seed 데이터에 흩어져 있는 단원 표기를 정본으로 모은다.
 *
 * 배경(실측): 전수 검사에서 18,449문항 중 4,787문항의 `unit` 문자열이
 * `CURRICULUM_UNITS`(교사가 화면에서 고르는 목록)에 없었다. 원인은 세 가지다.
 *   1) 번호만 다른 같은 단원   — 5학년 수학 `7. 소수의 곱셈` vs 정본 `10. 소수의 곱셈`
 *   2) 학년이 잘못 붙은 단원   — 5학년에 들어 있던 `직육면체의 부피와 겉넓이`(6학년 성취기준)
 *   3) 교과서 단원이 아닌 보충 — `사자성어와 고사성어`, 영어 `기본 어휘` 등
 *
 * 1·2는 여기서 정본으로 옮기고, 3은 `SUPPLEMENTARY_UNITS`로 정식 등록해
 * 교사가 화면에서 고를 수 있게 만든다(그전에는 어느 단원을 골라도 나오지
 * 않고 "문항 부족 시 보충" 경로로만 섞여 들어갔다).
 */

export interface UnitAlias {
  /** 옮겨 갈 학년. 생략하면 학년은 그대로 둔다. */
  grade?: number;
  /** 옮겨 갈 단원명 */
  unit: string;
}

type AliasTable = Record<string, Record<string, Record<string, UnitAlias>>>;

/** `[학년][과목][원본 단원명] → 정본` */
export const UNIT_ALIASES: AliasTable = {
  '5': {
    수학: {
      // 번호 표기만 다른 동일 단원
      '7. 소수의 곱셈': { unit: '10. 소수의 곱셈' },
      '9. 분수의 곱셈': { unit: '8. 분수의 곱셈' },
      '5. 분수의 곱셈': { unit: '8. 분수의 곱셈' },
      '3. 규칙과 대응': { unit: '3. 대응 관계' },
      '11. 평균과 가능성': { unit: '12. 평균과 가능성' },
      '6. 평균과 가능성': { unit: '12. 평균과 가능성' },
      '8. 합동과 대칭': { unit: '9. 합동과 대칭' },
      '10. 직육면체와 정육면체': { unit: '11. 직육면체' },
      // 6학년 성취기준([6수03-06] 부피·겉넓이)이 5학년에 붙어 있던 문항
      '12. 직육면체의 부피와 겉넓이': { grade: 6, unit: '6. 직육면체의 부피와 겉넓이' },
    },
    과학: {
      '우리 몸의 구조와 기능': { unit: '4. 우리 몸의 구조와 기능' },
      '빛의 성질': { unit: '2. 빛의 성질' },
      '용해와 용액': { unit: '3. 용해와 용액' },
      '2. 용해와 용액': { unit: '3. 용해와 용액' },
      '4. 용해와 용액': { unit: '3. 용해와 용액' },
      '날씨와 우리 생활': { unit: '6. 날씨와 우리 생활' },
      '4. 날씨와 우리 생활': { unit: '6. 날씨와 우리 생활' },
      '자원과 에너지': { unit: '8. 자원과 에너지' },
      '지구의 자원과 환경': { unit: '8. 자원과 에너지' },
      '온도와 열': { unit: '7. 열과 우리 생활' },
      '2. 온도와 열': { unit: '7. 열과 우리 생활' },
      // 학년이 잘못 붙은 문항 — 성취기준상 6학년/4학년 내용
      '물체의 빠르기': { grade: 6, unit: '2. 물체의 운동' },
      '산과 염기': { grade: 6, unit: '1. 산과 염기' },
      '5. 산과 염기': { grade: 6, unit: '1. 산과 염기' },
      '지구와 달의 운동': { grade: 6, unit: '4. 지구의 자전과 계절 변화' },
      '생물과 환경': { grade: 4, unit: '6. 생물과 환경' },
      '3. 생물과 환경': { grade: 4, unit: '6. 생물과 환경' },
      '다양한 생물과 우리 생활': { grade: 4, unit: '4. 다양한 생물과 우리 생활' },
      // 교과서 단원 밖 보충
      '1. 태양계와 별': { unit: '태양계와 별' },
      '3. 태양계와 별': { unit: '태양계와 별' },
      '1. 과학자는 어떻게 탐구할까요': { unit: '과학 탐구 방법' },
    },
    사회: {
      '국토와 지리': { unit: '1. 우리나라 국토여행' },
      '우리나라의 국토': { unit: '1. 우리나라 국토여행' },
      '1. 국토와 우리 생활': { unit: '1. 우리나라 국토여행' },
      '민주주의와 정치': { unit: '3. 법과 인권의 보장' },
      '인권과 민주주의': { unit: '3. 법과 인권의 보장' },
      '2. 인권 존중과 정의로운 사회': { unit: '3. 법과 인권의 보장' },
      '우리나라의 역사 사건': { unit: '우리나라의 역사 인물과 사건' },
      '우리나라의 역사 인물': { unit: '우리나라의 역사 인물과 사건' },
      '3. 우리나라의 경제 발전': { unit: '우리나라의 경제' },
    },
    국어: {
      // 2015 개정 잔재 단원 → 2022 개정 정본으로
      '6. 토의하여 해결해요': { unit: '5. 의논하며 토의해요' },
      '3. 글을 요약해요': { unit: '4. 대상을 설명해요' },
      '5. 글쓴이의 주장': { unit: '독해와 글의 짜임' },
      '9. 여러 가지 매체 자료': { unit: '독해와 글의 짜임' },
      // 표기가 갈린 보충 단원 통합
      '관용 표현과 속담': { unit: '속담과 관용 표현' },
      '속담 심화': { unit: '속담과 관용 표현' },
      맞춤법: { unit: '바른 낱말과 표현' },
      문법: { unit: '품사' },
    },
    영어: {
      // 원본 데이터에 역슬래시가 그대로 들어간 표기 오류
      "10. Let\\'s Go Camping": { unit: "10. Let's Go Camping" },
      '기본 표현과 어휘': { unit: '기본 어휘' },
      // 3·4학년용 단원명이 5학년에 붙어 있던 문항 → 어휘 보충으로 통합
      '1. Hello, How Are You?': { unit: '기본 어휘' },
      '2. What Day Is It?': { unit: '기본 어휘' },
      '3. How Many Apples?': { unit: '기본 어휘' },
      '4. I Like Spring': { unit: '기본 어휘' },
      '5. Where Is My Bag?': { unit: '기본 어휘' },
      '6. What Time Is It?': { unit: '기본 어휘' },
      '7. She Is My Mom': { unit: '기본 어휘' },
      '8. I Can Swim': { unit: '기본 어휘' },
    },
  },
};

/**
 * 교과서 단원은 아니지만 수업에 바로 쓰는 보충·심화 묶음.
 * 교사가 단원 목록에서 "보충·심화"로 따로 골라 쓸 수 있다.
 */
export const SUPPLEMENTARY_UNITS: Record<string, Record<string, string[]>> = {
  '5': {
    국어: [
      '사자성어와 고사성어',
      '속담과 관용 표현',
      '한자어의 뜻',
      '반대말',
      '낱말의 뜻',
      '낱말의 관계',
      '품사',
      '높임 표현',
      '문장의 호응',
      '띄어쓰기',
      '바른 낱말과 표현',
      '문학 용어와 표현법',
      '독해와 글의 짜임',
    ],
    사회: ['우리나라의 역사 인물과 사건', '우리나라의 경제'],
    과학: ['태양계와 별', '과학 탐구 방법'],
    영어: ['기본 어휘', '문장 패턴'],
    도덕: ['바르게 살아가는 우리'],
  },
};

/** 해당 학년·과목의 보충 단원 목록 (없으면 빈 배열) */
export function getSupplementaryUnits(grade: number | string, subject: string): string[] {
  return SUPPLEMENTARY_UNITS[String(grade)]?.[subject] ?? [];
}

/** 어떤 단원이 보충·심화 묶음인지 */
export function isSupplementaryUnit(grade: number | string, subject: string, unit: string): boolean {
  return getSupplementaryUnits(grade, subject).includes(unit);
}

/**
 * 문항 하나의 (학년, 단원)을 정본으로 옮긴다.
 * 별칭 표에 없으면 원본을 그대로 돌려준다(순수 함수).
 */
export function normalizeUnit(
  grade: number,
  subject: string,
  unit: string
): { grade: number; subject: string; unit: string } {
  const alias = UNIT_ALIASES[String(grade)]?.[subject]?.[unit];
  if (!alias) return { grade, subject, unit };
  return { grade: alias.grade ?? grade, subject, unit: alias.unit };
}
