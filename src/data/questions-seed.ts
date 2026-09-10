import { sanitizeQuestions } from '@/lib/questionSanitizer';
import { normalizeUnit } from '@/lib/curriculumAliases';
import { seedPart1 } from './seed-part1';
import { seedPart2 } from './seed-part2';
import { seed2022Grade3 } from './seed-2022-grade3';
import { seed2022Grade4 } from './seed-2022-grade4';
import { seed2022Grade5 } from './seed-2022-grade5';
import { seed2022Grade6 } from './seed-2022-grade6';
import { seed2022Grade5MathS1 } from './seed-2022-grade5-math-s1';
import { seed2022Grade5MathS2 } from './seed-2022-grade5-math-s2';
import { seed2022Grade5Science } from './seed-2022-grade5-science';
import { seed2022Grade5Social } from './seed-2022-grade5-social';
// 2022 개정에서 5학년 2학기 사회는 한국사다([6사04]~[6사06]).
// 단원을 새로 세우고 보니 두 단원이 23·24문항뿐이라 증량했다.
import { seed2022Grade5History } from './seed-2022-grade5-history';
// 6학년 사회도 2022 개정 단원으로 갈리면서 세계지리·지구촌 단원이 12·17·31문항만 남았다.
import { seed2022Grade6World } from './seed-2022-grade6-world';
import { seed2022Grade5EnglishS1a } from './seed-2022-grade5-english-s1a';
import { seed2022Grade5EnglishS1b } from './seed-2022-grade5-english-s1b';
import { seed2022Grade5EnglishS2a } from './seed-2022-grade5-english-s2a';
import { seed2022Grade5EnglishS2b } from './seed-2022-grade5-english-s2b';
import { seed2022Grade5MathHard } from './seed-2022-grade5-math-hard';
import { seed2022Grade5EnglishHard } from './seed-2022-grade5-english-hard';
import { seed2022Grade5OtherHard } from './seed-2022-grade5-other-hard';
import { seed2022Grade5MathHard2 } from './seed-2022-grade5-math-hard2';
import { seed2022Grade5EnglishHard2 } from './seed-2022-grade5-english-hard2';
import { seed2022Grade5OtherHard2 } from './seed-2022-grade5-other-hard2';
// 2022 개정 국어 1학기 (2학기는 교과서 미출간으로 추후 추가)
import { seed2022Grade5Korean1sU12 } from './seed-2022-grade5-korean-1s-u12';
import { seed2022Grade5Korean1sU34 } from './seed-2022-grade5-korean-1s-u34';
import { seed2022Grade5Korean1sU56 } from './seed-2022-grade5-korean-1s-u56';
// v2 확장 — 5학년 콘텐츠 2배 증량
import { seedGrade5V2Math } from './seed-grade5-v2-math';
import { seedGrade5V2Science } from './seed-grade5-v2-science';
import { seedGrade5V2English } from './seed-grade5-v2-english';
import { seedGrade5V2Others } from './seed-grade5-v2-others';
import { seedGrade5V3Korean } from './seed-grade5-v3-korean';
import { seedGrade5V3Social } from './seed-grade5-v3-social';
import { seedGrade5V3Science } from './seed-grade5-v3-science';
// v4 — OX 제거 보완 + 5학년 4지선다 추가 팩
import { seedGrade5V4Extra } from './seed-grade5-v4-extra';
// v5 — 5학년 도덕 4단원 보강 팩 (단원당 15문제 4지선다)
import { seedGrade5V5Moral } from './seed-grade5-v5-moral';
// v6 — 3·4·6학년 부족 단원 보강 팩 (단원당 6문제 4지선다)
import { seedGrade3V6aFill } from './seed-grade3-v6a-fill';
import { seedGrade3V6bFill } from './seed-grade3-v6b-fill';
import { seedGrade4V6Fill } from './seed-grade4-v6-fill';
import { seedGrade6V6Fill } from './seed-grade6-v6-fill';
// v7 — 3학년 단원당 30개 증량 팩
import { seedGrade3V7KoreanA } from './seed-grade3-v7-korean-a';
import { seedGrade3V7KoreanB } from './seed-grade3-v7-korean-b';
import { seedGrade3V7MathA } from './seed-grade3-v7-math-a';
import { seedGrade3V7MathB } from './seed-grade3-v7-math-b';
import { seedGrade3V7ScienceA } from './seed-grade3-v7-science-a';
import { seedGrade3V7ScienceB } from './seed-grade3-v7-science-b';
import { seedGrade3V7English } from './seed-grade3-v7-english';
import { seedGrade3V7Social } from './seed-grade3-v7-social';
import { seedGrade3V7Moral } from './seed-grade3-v7-moral';
// v7 재구성 — 4학년 전과목을 성취기준 정합 단원 4지선다로 전면 교체
import { seedGrade4V7Science } from './seed-grade4-v7-science';
import { seedGrade4V7Math } from './seed-grade4-v7-math';
import { seedGrade4V7Korean } from './seed-grade4-v7-korean';
import { seedGrade4V7English } from './seed-grade4-v7-english';
import { seedGrade4V7Social } from './seed-grade4-v7-social';
import { seedGrade4V7Moral } from './seed-grade4-v7-moral';

// v7 재구성 — 6학년 전과목을 성취기준 정합 단원 4지선다로 전면 교체
import { seedGrade6V7Math } from './seed-grade6-v7-math';
import { seedGrade6V7Social } from './seed-grade6-v7-social';
import { seedGrade6V7Science } from './seed-grade6-v7-science';
import { seedGrade6V7Korean } from './seed-grade6-v7-korean';
import { seedGrade6V7English } from './seed-grade6-v7-english';
import { seedGrade6V7Moral } from './seed-grade6-v7-moral';

// v9 증량 — 3·4·6학년을 단원당 60문항 이상으로 (수학은 전 문항 계산 검증)
import { seedV9Math } from './seed-v9-math';
import { seedV9Korean } from './seed-v9-korean';
import { seedV9Science } from './seed-v9-science';
import { seedV9English } from './seed-v9-english';
import { seedV9Grade5 } from './seed-v9-grade5';
import { seedV9Fill } from './seed-v9-fill';

// v10 증량 — 보충 단원 11개를 단원당 60문항 이상으로 (OX는 게임에 안 나오므로 전부 4지선다)
import { seedV10Supplement } from './seed-v10-supplement';

// v8 재구성 — 3학년 전과목을 4·6학년과 균형화(성취기준 정합 단원 4지선다)
import { seedGrade3V8Korean } from './seed-grade3-v8-korean';
import { seedGrade3V8Math } from './seed-grade3-v8-math';
import { seedGrade3V8Social } from './seed-grade3-v8-social';
import { seedGrade3V8Science } from './seed-grade3-v8-science';
import { seedGrade3V8English } from './seed-grade3-v8-english';
import { seedGrade3V8Moral } from './seed-grade3-v8-moral';

export interface QuestionSeed {
  grade: number;
  subject: string;
  unit: string;
  unit_code: string | null;
  question_type: 'multiple_choice' | 'ox' | 'fill_blank' | 'short_answer';
  question_text: string;
  options: string[] | null;
  correct_answer: string;
  explanation: string | null;
  difficulty: number;
}

const baseQuestions: QuestionSeed[] = [
  // ============================================================
  // 3학년 국어
  // ============================================================
  { grade: 3, subject: '국어', unit: '1. 재미가 톡톡톡', unit_code: '[4국01-01]', question_type: 'multiple_choice', question_text: '시를 읽고 느낌을 표현할 때 가장 적절한 방법은?', options: ['소리 내어 읽기', '빠르게 외우기', '글자만 보기', '눈 감고 듣기'], correct_answer: '소리 내어 읽기', explanation: '시를 소리 내어 읽으면 리듬과 느낌을 더 잘 느낄 수 있습니다.', difficulty: 1 },
  { grade: 3, subject: '국어', unit: '1. 재미가 톡톡톡', unit_code: '[4국01-01]', question_type: 'ox', question_text: '동시에는 반복되는 말이 들어갈 수 있다.', options: ['O', 'X'], correct_answer: 'O', explanation: '동시에서 같은 말을 반복하면 리듬감이 생기고 재미를 더합니다.', difficulty: 1 },
  { grade: 3, subject: '국어', unit: '1. 재미가 톡톡톡', unit_code: '[4국01-01]', question_type: 'multiple_choice', question_text: '다음 중 흉내내는 말(의성어)은?', options: ['졸졸', '빨간', '높은', '넓은'], correct_answer: '졸졸', explanation: '졸졸은 물이 흐르는 소리를 흉내 낸 의성어입니다.', difficulty: 1 },
  { grade: 3, subject: '국어', unit: '2. 문단의 짜임', unit_code: '[4국03-02]', question_type: 'multiple_choice', question_text: '문단의 중심 문장은 보통 어디에 있나요?', options: ['문단의 처음이나 끝', '문단의 한가운데만', '다른 문단에', '제목 옆에'], correct_answer: '문단의 처음이나 끝', explanation: '중심 문장은 문단의 핵심 내용을 담고 있으며, 보통 문단의 처음이나 끝에 위치합니다.', difficulty: 2 },
  { grade: 3, subject: '국어', unit: '2. 문단의 짜임', unit_code: '[4국03-02]', question_type: 'ox', question_text: '하나의 문단에는 하나의 중심 생각이 담겨 있다.', options: ['O', 'X'], correct_answer: 'O', explanation: '문단은 하나의 중심 생각을 전달하기 위해 여러 문장이 모인 것입니다.', difficulty: 1 },
  { grade: 3, subject: '국어', unit: '2. 문단의 짜임', unit_code: '[4국03-02]', question_type: 'short_answer', question_text: '문단에서 중심 생각을 뒷받침하는 문장을 무엇이라 하나요?', options: null, correct_answer: '뒷받침 문장', explanation: '뒷받침 문장은 중심 문장의 내용을 자세히 설명하거나 예를 드는 문장입니다.', difficulty: 2 },
  { grade: 3, subject: '국어', unit: '3. 알맞은 높임 표현', unit_code: '[4국04-04]', question_type: 'multiple_choice', question_text: '"할머니, 밥 먹어."를 높임말로 바르게 고치면?', options: ['할머니, 진지 잡수세요.', '할머니, 밥 먹으세요.', '할머니, 밥 드세요.', '할머니, 진지 먹어요.'], correct_answer: '할머니, 진지 잡수세요.', explanation: '"밥"은 "진지"로, "먹다"는 "잡수시다"로 바꾸는 것이 올바른 높임 표현입니다.', difficulty: 2 },
  { grade: 3, subject: '국어', unit: '3. 알맞은 높임 표현', unit_code: '[4국04-04]', question_type: 'ox', question_text: '"선생님이 말했다."는 높임 표현이 바르게 쓰인 것이다.', options: ['O', 'X'], correct_answer: 'X', explanation: '"말했다"를 "말씀하셨다"로 고쳐야 올바른 높임 표현입니다.', difficulty: 1 },
  { grade: 3, subject: '국어', unit: '3. 알맞은 높임 표현', unit_code: '[4국04-04]', question_type: 'short_answer', question_text: '"이"를 높여서 부를 때 쓰는 말은?', options: null, correct_answer: '치아', explanation: '신체 부위를 높여 말할 때 "이"는 "치아"로 표현합니다.', difficulty: 2 },
  { grade: 3, subject: '국어', unit: '4. 내 마음을 편지에 담아', unit_code: '[4국03-03]', question_type: 'multiple_choice', question_text: '편지를 쓸 때 반드시 포함해야 하는 것이 아닌 것은?', options: ['그림', '받는 사람', '쓴 날짜', '보내는 사람'], correct_answer: '그림', explanation: '편지에는 받는 사람, 인사말, 본문, 쓴 날짜, 보내는 사람이 들어갑니다.', difficulty: 1 },
  { grade: 3, subject: '국어', unit: '4. 내 마음을 편지에 담아', unit_code: '[4국03-03]', question_type: 'ox', question_text: '편지의 첫머리에는 받는 사람에 대한 인사말을 쓴다.', options: ['O', 'X'], correct_answer: 'O', explanation: '편지는 받는 사람에 대한 인사말로 시작하는 것이 예의입니다.', difficulty: 1 },
  { grade: 3, subject: '국어', unit: '5. 중요한 내용을 적어요', unit_code: '[4국01-03]', question_type: 'multiple_choice', question_text: '이야기를 듣고 중요한 내용을 적을 때 가장 좋은 방법은?', options: ['핵심 낱말을 적는다', '모든 것을 받아쓴다', '그림으로 그린다', '외워서 나중에 적는다'], correct_answer: '핵심 낱말을 적는다', explanation: '중요한 내용을 메모할 때는 핵심이 되는 낱말이나 짧은 문장으로 적는 것이 좋습니다.', difficulty: 2 },
  { grade: 3, subject: '국어', unit: '6. 작품을 읽고 느낌을 나눠요', unit_code: '[4국05-03]', question_type: 'multiple_choice', question_text: '이야기를 읽고 느낌을 나눌 때 적절하지 않은 것은?', options: ['정답만 말하기', '인상 깊은 장면 말하기', '등장인물에 대해 이야기하기', '비슷한 경험 나누기'], correct_answer: '정답만 말하기', explanation: '작품 감상은 정답이 있는 것이 아니라, 다양한 느낌과 생각을 나누는 것입니다.', difficulty: 2 },

  // ============================================================
  // 3학년 수학
  // ============================================================
  { grade: 3, subject: '수학', unit: '1. 덧셈과 뺄셈', unit_code: '[4수01-01]', question_type: 'multiple_choice', question_text: '356 + 278 의 계산 결과는?', options: ['634', '624', '534', '644'], correct_answer: '634', explanation: '일의 자리: 6+8=14(4를 쓰고 1 올림), 십의 자리: 5+7+1=13(3을 쓰고 1 올림), 백의 자리: 3+2+1=6', difficulty: 2 },
  { grade: 3, subject: '수학', unit: '1. 덧셈과 뺄셈', unit_code: '[4수01-01]', question_type: 'multiple_choice', question_text: '500 - 237 의 계산 결과는?', options: ['263', '273', '363', '237'], correct_answer: '263', explanation: '500에서 237을 빼면 263입니다. 받아내림을 주의해야 합니다.', difficulty: 2 },
  { grade: 3, subject: '수학', unit: '1. 덧셈과 뺄셈', unit_code: '[4수01-01]', question_type: 'ox', question_text: '423 + 189 = 612 이다.', options: ['O', 'X'], correct_answer: 'O', explanation: '423 + 189 = 612 입니다.', difficulty: 1 },
  { grade: 3, subject: '수학', unit: '2. 평면도형', unit_code: '[4수02-03]', question_type: 'multiple_choice', question_text: '선분으로만 둘러싸인 도형을 무엇이라 하나요?', options: ['다각형', '원', '곡선', '반원'], correct_answer: '다각형', explanation: '선분으로만 둘러싸인 도형을 다각형이라 합니다.', difficulty: 1 },
  { grade: 3, subject: '수학', unit: '2. 평면도형', unit_code: '[4수02-03]', question_type: 'ox', question_text: '삼각형은 꼭짓점이 4개이다.', options: ['O', 'X'], correct_answer: 'X', explanation: '삼각형은 꼭짓점이 3개, 변이 3개입니다.', difficulty: 1 },
  { grade: 3, subject: '수학', unit: '2. 평면도형', unit_code: '[4수02-03]', question_type: 'short_answer', question_text: '원의 중심에서 원 위의 한 점까지의 거리를 무엇이라 하나요?', options: null, correct_answer: '반지름', explanation: '원의 중심에서 원 위의 한 점까지의 거리를 반지름이라 합니다.', difficulty: 1 },
  { grade: 3, subject: '수학', unit: '3. 나눗셈', unit_code: '[4수01-02]', question_type: 'multiple_choice', question_text: '12 ÷ 3 의 결과는?', options: ['4', '3', '6', '9'], correct_answer: '4', explanation: '12를 3으로 똑같이 나누면 4입니다. 3 × 4 = 12', difficulty: 1 },
  { grade: 3, subject: '수학', unit: '3. 나눗셈', unit_code: '[4수01-02]', question_type: 'multiple_choice', question_text: '56 ÷ 7 의 결과는?', options: ['8', '7', '9', '6'], correct_answer: '8', explanation: '7 × 8 = 56이므로 56 ÷ 7 = 8입니다.', difficulty: 2 },
  { grade: 3, subject: '수학', unit: '3. 나눗셈', unit_code: '[4수01-02]', question_type: 'ox', question_text: '0 ÷ 5 = 0 이다.', options: ['O', 'X'], correct_answer: 'O', explanation: '0을 어떤 수로 나누어도 0입니다.', difficulty: 1 },
  { grade: 3, subject: '수학', unit: '4. 곱셈', unit_code: '[4수01-03]', question_type: 'multiple_choice', question_text: '23 × 4 의 결과는?', options: ['92', '82', '96', '84'], correct_answer: '92', explanation: '20 × 4 = 80, 3 × 4 = 12, 80 + 12 = 92', difficulty: 2 },
  { grade: 3, subject: '수학', unit: '4. 곱셈', unit_code: '[4수01-03]', question_type: 'short_answer', question_text: '15 × 6 은 얼마인가요?', options: null, correct_answer: '90', explanation: '10 × 6 = 60, 5 × 6 = 30, 60 + 30 = 90', difficulty: 2 },
  { grade: 3, subject: '수학', unit: '5. 길이와 시간', unit_code: '[4수03-01]', question_type: 'multiple_choice', question_text: '1km는 몇 m인가요?', options: ['1000m', '100m', '10m', '10000m'], correct_answer: '1000m', explanation: '1km = 1000m입니다.', difficulty: 1 },
  { grade: 3, subject: '수학', unit: '5. 길이와 시간', unit_code: '[4수03-01]', question_type: 'ox', question_text: '1시간은 100분이다.', options: ['O', 'X'], correct_answer: 'X', explanation: '1시간은 60분입니다.', difficulty: 1 },
  { grade: 3, subject: '수학', unit: '5. 길이와 시간', unit_code: '[4수03-01]', question_type: 'multiple_choice', question_text: '2시간 30분은 몇 분인가요?', options: ['150분', '130분', '230분', '120분'], correct_answer: '150분', explanation: '2시간 = 120분, 120분 + 30분 = 150분', difficulty: 2 },
  { grade: 3, subject: '수학', unit: '6. 분수와 소수', unit_code: '[4수01-09]', question_type: 'multiple_choice', question_text: '피자를 4조각으로 똑같이 나누었을 때 1조각은 전체의 얼마인가요?', options: ['1/4', '1/2', '1/3', '4/1'], correct_answer: '1/4', explanation: '전체를 4로 똑같이 나눈 것 중 1이므로 1/4입니다.', difficulty: 1 },
  { grade: 3, subject: '수학', unit: '6. 분수와 소수', unit_code: '[4수01-09]', question_type: 'ox', question_text: '0.1은 1/10과 같다.', options: ['O', 'X'], correct_answer: 'O', explanation: '소수 0.1은 분수 1/10과 같습니다.', difficulty: 2 },

  // ============================================================
  // 3학년 사회
  // ============================================================
  { grade: 3, subject: '사회', unit: '1. 우리 고장의 모습', unit_code: '[4사01-01]', question_type: 'multiple_choice', question_text: '우리 고장의 모습을 나타낸 그림을 무엇이라 하나요?', options: ['지도', '달력', '일기장', '신문'], correct_answer: '지도', explanation: '지도는 땅의 모습을 일정한 약속에 따라 줄여서 그린 것입니다.', difficulty: 1 },
  { grade: 3, subject: '사회', unit: '1. 우리 고장의 모습', unit_code: '[4사01-01]', question_type: 'ox', question_text: '지도에서 위쪽은 항상 북쪽을 나타낸다.', options: ['O', 'X'], correct_answer: 'O', explanation: '일반적으로 지도에서 위쪽은 북쪽을 나타냅니다.', difficulty: 1 },
  { grade: 3, subject: '사회', unit: '1. 우리 고장의 모습', unit_code: '[4사01-01]', question_type: 'short_answer', question_text: '지도에서 실제 거리를 줄인 비율을 무엇이라 하나요?', options: null, correct_answer: '축척', explanation: '축척은 지도에서 실제 거리를 줄인 비율을 나타냅니다.', difficulty: 3 },
  { grade: 3, subject: '사회', unit: '2. 우리가 알아보는 고장 이야기', unit_code: '[4사02-01]', question_type: 'multiple_choice', question_text: '우리 고장의 옛이야기를 알 수 있는 방법이 아닌 것은?', options: ['미래 예측하기', '어르신께 여쭤보기', '향토 박물관 방문', '고장의 책 읽기'], correct_answer: '미래 예측하기', explanation: '고장의 옛이야기는 어르신, 박물관, 지역 역사 책 등을 통해 알 수 있습니다.', difficulty: 1 },
  { grade: 3, subject: '사회', unit: '2. 우리가 알아보는 고장 이야기', unit_code: '[4사02-01]', question_type: 'ox', question_text: '모든 고장에는 그 고장만의 특별한 이야기가 있다.', options: ['O', 'X'], correct_answer: 'O', explanation: '각 고장은 고유한 역사와 문화를 가지고 있어 특별한 이야기가 전해집니다.', difficulty: 1 },
  { grade: 3, subject: '사회', unit: '3. 교통과 통신 수단의 변화', unit_code: '[4사03-03]', question_type: 'multiple_choice', question_text: '다음 중 가장 오래된 통신 수단은?', options: ['봉화', '전화', '인터넷', '텔레비전'], correct_answer: '봉화', explanation: '봉화는 옛날 산 위에서 불과 연기로 소식을 전하던 통신 수단입니다.', difficulty: 1 },
  { grade: 3, subject: '사회', unit: '3. 교통과 통신 수단의 변화', unit_code: '[4사03-03]', question_type: 'multiple_choice', question_text: '옛날 사람들이 주로 이용한 교통수단은?', options: ['말과 가마', '자동차', '비행기', '지하철'], correct_answer: '말과 가마', explanation: '옛날에는 자동차가 없어서 말, 가마, 배 등을 교통수단으로 이용했습니다.', difficulty: 1 },
  { grade: 3, subject: '사회', unit: '3. 교통과 통신 수단의 변화', unit_code: '[4사03-03]', question_type: 'ox', question_text: '인터넷은 편지보다 더 빠르게 소식을 전할 수 있다.', options: ['O', 'X'], correct_answer: 'O', explanation: '인터넷은 세계 어디든 즉시 소식을 전할 수 있는 빠른 통신 수단입니다.', difficulty: 1 },

  // ============================================================
  // 3학년 과학
  // ============================================================
  { grade: 3, subject: '과학', unit: '1. 우리 생활과 물질', unit_code: '[4과01-01]', question_type: 'multiple_choice', question_text: '다음 중 고체가 아닌 것은?', options: ['우유', '돌', '나무', '유리'], correct_answer: '우유', explanation: '우유는 액체입니다. 고체는 모양과 부피가 일정한 물질입니다.', difficulty: 1 },
  { grade: 3, subject: '과학', unit: '1. 우리 생활과 물질', unit_code: '[4과01-01]', question_type: 'ox', question_text: '액체는 담는 그릇에 따라 모양이 변한다.', options: ['O', 'X'], correct_answer: 'O', explanation: '액체는 담는 그릇의 모양에 따라 모양이 변하지만 부피는 일정합니다.', difficulty: 1 },
  { grade: 3, subject: '과학', unit: '1. 우리 생활과 물질', unit_code: '[4과01-01]', question_type: 'multiple_choice', question_text: '물질의 세 가지 상태가 아닌 것은?', options: ['진공', '고체', '액체', '기체'], correct_answer: '진공', explanation: '물질의 세 가지 상태는 고체, 액체, 기체입니다.', difficulty: 2 },
  { grade: 3, subject: '과학', unit: '2. 동물의 한살이', unit_code: '[4과02-01]', question_type: 'multiple_choice', question_text: '배추흰나비의 한살이 순서로 올바른 것은?', options: ['알→애벌레→번데기→어른벌레', '알→번데기→애벌레→어른벌레', '애벌레→알→번데기→어른벌레', '번데기→알→애벌레→어른벌레'], correct_answer: '알→애벌레→번데기→어른벌레', explanation: '배추흰나비는 알, 애벌레, 번데기, 어른벌레의 과정을 거칩니다. 이를 완전 탈바꿈이라 합니다.', difficulty: 2 },
  { grade: 3, subject: '과학', unit: '2. 동물의 한살이', unit_code: '[4과02-01]', question_type: 'ox', question_text: '개구리는 번데기 과정을 거친다.', options: ['O', 'X'], correct_answer: 'X', explanation: '개구리는 알→올챙이→개구리의 과정을 거치며, 번데기 과정이 없습니다.', difficulty: 2 },
  { grade: 3, subject: '과학', unit: '3. 자석의 이용', unit_code: '[4과04-01]', question_type: 'multiple_choice', question_text: '자석에 붙는 물질은?', options: ['철', '나무', '유리', '종이'], correct_answer: '철', explanation: '자석은 철, 니켈, 코발트 등의 금속에 붙습니다.', difficulty: 1 },
  { grade: 3, subject: '과학', unit: '3. 자석의 이용', unit_code: '[4과04-01]', question_type: 'ox', question_text: '자석의 같은 극끼리는 서로 밀어낸다.', options: ['O', 'X'], correct_answer: 'O', explanation: '자석의 같은 극(N-N, S-S)끼리는 밀어내고, 다른 극(N-S)끼리는 끌어당깁니다.', difficulty: 1 },
  { grade: 3, subject: '과학', unit: '3. 자석의 이용', unit_code: '[4과04-01]', question_type: 'short_answer', question_text: '자석에서 자석의 힘이 가장 센 부분을 무엇이라 하나요?', options: null, correct_answer: '극', explanation: '자석의 양 끝부분을 극이라 하며, 이곳에서 자석의 힘이 가장 셉니다.', difficulty: 2 },
  { grade: 3, subject: '과학', unit: '4. 지구의 모습', unit_code: '[4과07-01]', question_type: 'multiple_choice', question_text: '지구의 모양은?', options: ['둥근 공 모양', '네모 모양', '삼각형 모양', '평평한 판 모양'], correct_answer: '둥근 공 모양', explanation: '지구는 둥근 공 모양입니다. 우주에서 보면 동그란 모습을 확인할 수 있습니다.', difficulty: 1 },
  { grade: 3, subject: '과학', unit: '4. 지구의 모습', unit_code: '[4과07-01]', question_type: 'ox', question_text: '지구 표면의 대부분은 바다로 이루어져 있다.', options: ['O', 'X'], correct_answer: 'O', explanation: '지구 표면의 약 70%는 바다(물)로 이루어져 있습니다.', difficulty: 1 },
  { grade: 3, subject: '과학', unit: '5. 지표의 변화', unit_code: '[4과08-01]', question_type: 'multiple_choice', question_text: '흐르는 물에 의해 땅이 깎이는 현상을 무엇이라 하나요?', options: ['침식', '퇴적', '풍화', '증발'], correct_answer: '침식', explanation: '침식은 흐르는 물이나 바람에 의해 지표면이 깎이는 현상입니다.', difficulty: 2 },
  { grade: 3, subject: '과학', unit: '5. 지표의 변화', unit_code: '[4과08-01]', question_type: 'ox', question_text: '강 상류에서는 침식 작용이 활발하다.', options: ['O', 'X'], correct_answer: 'O', explanation: '강 상류는 물의 흐름이 빨라 침식 작용이 활발합니다.', difficulty: 2 },

  // ============================================================
  // 3학년 영어
  // ============================================================
  { grade: 3, subject: '영어', unit: '1. Hello!', unit_code: '[4영01-01]', question_type: 'multiple_choice', question_text: '"안녕!"을 영어로 바르게 말한 것은?', options: ['Hello!', 'Goodbye!', 'Thank you!', 'Sorry!'], correct_answer: 'Hello!', explanation: '"Hello!"는 영어로 "안녕!"이라는 인사말입니다.', difficulty: 1 },
  { grade: 3, subject: '영어', unit: '1. Hello!', unit_code: '[4영01-01]', question_type: 'ox', question_text: '"My name is Tom."은 "내 이름은 Tom이야."라는 뜻이다.', options: ['O', 'X'], correct_answer: 'O', explanation: '"My name is ~"는 "내 이름은 ~이야"라는 자기소개 표현입니다.', difficulty: 1 },
  { grade: 3, subject: '영어', unit: '2. What Is It?', unit_code: '[4영02-01]', question_type: 'multiple_choice', question_text: '"What is it?" 에 대한 알맞은 대답은?', options: ['It is a book.', 'I am fine.', 'Yes, it is.', 'I like it.'], correct_answer: 'It is a book.', explanation: '"What is it?"은 "그것은 무엇이니?"라는 뜻으로, "It is a ~"로 답합니다.', difficulty: 1 },
  { grade: 3, subject: '영어', unit: '3. I Like Apples', unit_code: '[4영03-01]', question_type: 'multiple_choice', question_text: '"나는 사과를 좋아해."를 영어로 바르게 말한 것은?', options: ['I like apples.', 'I am apples.', 'I have apples.', 'I eat apples.'], correct_answer: 'I like apples.', explanation: '"I like ~"는 "나는 ~을 좋아해"라는 뜻입니다.', difficulty: 1 },
  { grade: 3, subject: '영어', unit: '3. I Like Apples', unit_code: '[4영03-01]', question_type: 'ox', question_text: '"I don\'t like milk."는 "나는 우유를 좋아해."라는 뜻이다.', options: ['O', 'X'], correct_answer: 'X', explanation: '"I don\'t like ~"는 "나는 ~을 좋아하지 않아"라는 뜻입니다.', difficulty: 1 },
  { grade: 3, subject: '영어', unit: '4. How Old Are You?', unit_code: '[4영04-01]', question_type: 'multiple_choice', question_text: '"How old are you?"에 대한 알맞은 대답은?', options: ['I am nine.', 'I am fine.', 'I am a student.', 'I am from Korea.'], correct_answer: 'I am nine.', explanation: '"How old are you?"는 나이를 묻는 표현으로, 숫자로 나이를 말합니다.', difficulty: 1 },

  // ============================================================
  // 3학년 도덕
  // ============================================================
  { grade: 3, subject: '도덕', unit: '1. 나와 너, 우리 함께', unit_code: '[4도01-01]', question_type: 'multiple_choice', question_text: '친구와 사이좋게 지내기 위해 가장 중요한 것은?', options: ['서로 존중하기', '항상 양보하기', '같은 옷 입기', '매일 선물하기'], correct_answer: '서로 존중하기', explanation: '친구 사이에서는 서로의 마음과 생각을 존중하는 것이 가장 중요합니다.', difficulty: 1 },
  { grade: 3, subject: '도덕', unit: '1. 나와 너, 우리 함께', unit_code: '[4도01-01]', question_type: 'ox', question_text: '친구가 실수했을 때 놀리는 것은 올바른 행동이다.', options: ['O', 'X'], correct_answer: 'X', explanation: '친구가 실수했을 때는 놀리지 않고 격려해 주는 것이 올바른 행동입니다.', difficulty: 1 },
  { grade: 3, subject: '도덕', unit: '2. 우리 모두 소중해요', unit_code: '[4도02-01]', question_type: 'multiple_choice', question_text: '다음 중 자신을 소중히 여기는 행동은?', options: ['건강을 관리한다', '다른 사람과 비교한다', '자신을 비하한다', '잘못만 생각한다'], correct_answer: '건강을 관리한다', explanation: '자신을 소중히 여기는 것은 건강을 관리하고, 자신의 장점을 인정하는 것입니다.', difficulty: 1 },
  { grade: 3, subject: '도덕', unit: '3. 생명을 존중해요', unit_code: '[4도03-01]', question_type: 'multiple_choice', question_text: '생명을 존중하는 행동이 아닌 것은?', options: ['꽃을 함부로 꺾기', '동물 돌보기', '나무 심기', '쓰레기 줍기'], correct_answer: '꽃을 함부로 꺾기', explanation: '생명을 존중한다는 것은 동식물의 생명을 소중히 여기고 보호하는 것입니다.', difficulty: 1 },
  { grade: 3, subject: '도덕', unit: '3. 생명을 존중해요', unit_code: '[4도03-01]', question_type: 'ox', question_text: '모든 생명은 소중하다.', options: ['O', 'X'], correct_answer: 'O', explanation: '크든 작든 모든 생명은 소중하며 존중받아야 합니다.', difficulty: 1 },

  // ============================================================
  // 4학년 국어
  // ============================================================
  { grade: 4, subject: '국어', unit: '1. 생각과 느낌을 나눠요', unit_code: '[4국05-01]', question_type: 'multiple_choice', question_text: '시를 읽고 생각이나 느낌을 나눌 때 적절하지 않은 것은?', options: ['정답만 맞추기', '떠오르는 장면 말하기', '비슷한 경험 나누기', '마음에 드는 표현 찾기'], correct_answer: '정답만 맞추기', explanation: '시의 감상에는 정답이 없으며, 다양한 느낌을 자유롭게 나누는 것이 중요합니다.', difficulty: 1 },
  { grade: 4, subject: '국어', unit: '1. 생각과 느낌을 나눠요', unit_code: '[4국05-01]', question_type: 'ox', question_text: '같은 시를 읽고도 사람마다 다른 느낌을 받을 수 있다.', options: ['O', 'X'], correct_answer: 'O', explanation: '사람마다 경험과 생각이 다르기 때문에 같은 작품을 읽고도 다른 느낌을 받을 수 있습니다.', difficulty: 1 },
  { grade: 4, subject: '국어', unit: '2. 내용을 간추려요', unit_code: '[4국02-02]', question_type: 'multiple_choice', question_text: '글의 내용을 간추릴 때 포함해야 할 것은?', options: ['중심 내용', '모든 세부 사항', '글쓴이의 나이', '글의 글자 수'], correct_answer: '중심 내용', explanation: '글을 간추릴 때는 중심 내용을 파악하여 핵심만 정리합니다.', difficulty: 2 },
  { grade: 4, subject: '국어', unit: '3. 느낌을 살려 말해요', unit_code: '[4국01-06]', question_type: 'multiple_choice', question_text: '발표할 때 듣는 사람을 고려하여 해야 할 것은?', options: ['알맞은 목소리 크기로 말하기', '아주 빠르게 말하기', '혼잣말처럼 말하기', '바닥을 보면서 말하기'], correct_answer: '알맞은 목소리 크기로 말하기', explanation: '발표할 때는 듣는 사람이 잘 들을 수 있도록 알맞은 목소리와 빠르기로 말해야 합니다.', difficulty: 1 },
  { grade: 4, subject: '국어', unit: '4. 이야기 속 세상', unit_code: '[4국05-02]', question_type: 'multiple_choice', question_text: '이야기의 구성 요소가 아닌 것은?', options: ['글자 크기', '인물', '사건', '배경'], correct_answer: '글자 크기', explanation: '이야기는 인물, 사건, 배경으로 구성됩니다.', difficulty: 1 },
  { grade: 4, subject: '국어', unit: '5. 의견이 드러나는 글', unit_code: '[4국03-04]', question_type: 'multiple_choice', question_text: '의견이 드러나는 글에서 가장 중요한 것은?', options: ['주장과 근거', '예쁜 글씨', '긴 문장', '어려운 낱말'], correct_answer: '주장과 근거', explanation: '의견이 드러나는 글은 자신의 주장과 그것을 뒷받침하는 근거가 있어야 합니다.', difficulty: 2 },
  { grade: 4, subject: '국어', unit: '6. 회의를 해요', unit_code: '[4국01-07]', question_type: 'ox', question_text: '회의에서는 다른 사람의 의견을 끝까지 들어야 한다.', options: ['O', 'X'], correct_answer: 'O', explanation: '회의에서는 다른 사람의 의견을 존중하고 끝까지 경청해야 합니다.', difficulty: 1 },

  // ============================================================
  // 4학년 수학
  // ============================================================
  { grade: 4, subject: '수학', unit: '1. 큰 수', unit_code: '[4수01-04]', question_type: 'multiple_choice', question_text: '10000이 10개이면 얼마인가요?', options: ['100000', '10000', '1000000', '10001'], correct_answer: '100000', explanation: '10000이 10개이면 100000(십만)입니다.', difficulty: 1 },
  { grade: 4, subject: '수학', unit: '1. 큰 수', unit_code: '[4수01-04]', question_type: 'short_answer', question_text: '35000을 읽으면?', options: null, correct_answer: '삼만 오천', explanation: '35000은 "삼만 오천"으로 읽습니다.', difficulty: 1 },
  { grade: 4, subject: '수학', unit: '1. 큰 수', unit_code: '[4수01-04]', question_type: 'ox', question_text: '1억은 1000만의 10배이다.', options: ['O', 'X'], correct_answer: 'O', explanation: '1억 = 10000만 = 1000만 × 10', difficulty: 2 },
  { grade: 4, subject: '수학', unit: '2. 각도', unit_code: '[4수02-04]', question_type: 'multiple_choice', question_text: '직각은 몇 도인가요?', options: ['90도', '45도', '180도', '360도'], correct_answer: '90도', explanation: '직각은 90도입니다.', difficulty: 1 },
  { grade: 4, subject: '수학', unit: '2. 각도', unit_code: '[4수02-04]', question_type: 'ox', question_text: '삼각형 세 각의 크기의 합은 180도이다.', options: ['O', 'X'], correct_answer: 'O', explanation: '삼각형의 세 각의 크기의 합은 항상 180도입니다.', difficulty: 2 },
  { grade: 4, subject: '수학', unit: '3. 곱셈과 나눗셈', unit_code: '[4수01-05]', question_type: 'multiple_choice', question_text: '24 × 13 의 결과는?', options: ['312', '302', '322', '212'], correct_answer: '312', explanation: '24 × 13 = 24 × 10 + 24 × 3 = 240 + 72 = 312', difficulty: 2 },
  { grade: 4, subject: '수학', unit: '3. 곱셈과 나눗셈', unit_code: '[4수01-05]', question_type: 'multiple_choice', question_text: '84 ÷ 4 의 결과는?', options: ['21', '22', '20', '24'], correct_answer: '21', explanation: '84 ÷ 4 = 21 (4 × 21 = 84)', difficulty: 2 },
  { grade: 4, subject: '수학', unit: '4. 삼각형', unit_code: '[4수02-05]', question_type: 'multiple_choice', question_text: '세 변의 길이가 모두 같은 삼각형은?', options: ['정삼각형', '이등변삼각형', '직각삼각형', '예각삼각형'], correct_answer: '정삼각형', explanation: '세 변의 길이가 모두 같은 삼각형을 정삼각형이라 합니다.', difficulty: 1 },
  { grade: 4, subject: '수학', unit: '4. 삼각형', unit_code: '[4수02-05]', question_type: 'ox', question_text: '이등변삼각형은 두 변의 길이가 같은 삼각형이다.', options: ['O', 'X'], correct_answer: 'O', explanation: '이등변삼각형은 두 변의 길이가 같은 삼각형입니다.', difficulty: 1 },
  { grade: 4, subject: '수학', unit: '5. 혼합 계산', unit_code: '[4수01-06]', question_type: 'multiple_choice', question_text: '8 + 4 × 3 의 계산 결과는?', options: ['20', '36', '24', '15'], correct_answer: '20', explanation: '곱셈을 먼저 계산합니다. 4 × 3 = 12, 8 + 12 = 20', difficulty: 2 },
  { grade: 4, subject: '수학', unit: '5. 혼합 계산', unit_code: '[4수01-06]', question_type: 'ox', question_text: '(5 + 3) × 2 = 16 이다.', options: ['O', 'X'], correct_answer: 'O', explanation: '괄호 안을 먼저 계산합니다. (5+3) = 8, 8 × 2 = 16', difficulty: 1 },
  { grade: 4, subject: '수학', unit: '6. 막대그래프', unit_code: '[4수05-01]', question_type: 'multiple_choice', question_text: '막대그래프에서 가장 긴 막대가 나타내는 것은?', options: ['가장 큰 수량', '가장 작은 수량', '평균', '합계'], correct_answer: '가장 큰 수량', explanation: '막대그래프에서 막대가 길수록 큰 수량을 나타냅니다.', difficulty: 1 },
  { grade: 4, subject: '수학', unit: '7. 규칙 찾기', unit_code: '[4수04-01]', question_type: 'multiple_choice', question_text: '2, 5, 8, 11, □ 에서 □에 알맞은 수는?', options: ['14', '13', '12', '15'], correct_answer: '14', explanation: '3씩 증가하는 규칙입니다. 11 + 3 = 14', difficulty: 1 },
  { grade: 4, subject: '수학', unit: '8. 분수의 덧셈과 뺄셈', unit_code: '[4수01-08]', question_type: 'multiple_choice', question_text: '3/7 + 2/7 의 결과는?', options: ['5/7', '5/14', '1', '6/7'], correct_answer: '5/7', explanation: '분모가 같은 분수의 덧셈은 분자끼리 더합니다. 3+2=5, 답은 5/7', difficulty: 1 },
  { grade: 4, subject: '수학', unit: '9. 사각형', unit_code: '[4수02-06]', question_type: 'multiple_choice', question_text: '네 각이 모두 직각인 사각형은?', options: ['직사각형', '마름모', '평행사변형', '사다리꼴'], correct_answer: '직사각형', explanation: '네 각이 모두 직각(90도)인 사각형을 직사각형이라 합니다.', difficulty: 1 },
  { grade: 4, subject: '수학', unit: '10. 다각형', unit_code: '[4수02-07]', question_type: 'multiple_choice', question_text: '변이 5개인 다각형은?', options: ['오각형', '사각형', '육각형', '팔각형'], correct_answer: '오각형', explanation: '변이 5개인 다각형을 오각형이라 합니다.', difficulty: 1 },

  // ============================================================
  // 4학년 사회
  // ============================================================
  { grade: 4, subject: '사회', unit: '1. 지역의 위치와 특성', unit_code: '[4사01-02]', question_type: 'multiple_choice', question_text: '우리나라를 이루는 가장 큰 행정 구역 단위는?', options: ['도/특별시/광역시', '시/군/구', '읍/면/동', '리/통'], correct_answer: '도/특별시/광역시', explanation: '우리나라의 가장 큰 행정 구역은 도, 특별시, 광역시, 특별자치시, 특별자치도입니다.', difficulty: 2 },
  { grade: 4, subject: '사회', unit: '1. 지역의 위치와 특성', unit_code: '[4사01-02]', question_type: 'ox', question_text: '산이 많은 지역의 사람들은 주로 논농사를 짓는다.', options: ['O', 'X'], correct_answer: 'X', explanation: '산이 많은 지역에서는 밭농사나 목축업을 주로 합니다. 논농사는 평야 지역에서 합니다.', difficulty: 2 },
  { grade: 4, subject: '사회', unit: '2. 우리 지역의 어제와 오늘', unit_code: '[4사02-02]', question_type: 'multiple_choice', question_text: '우리 지역의 역사를 알 수 있는 것이 아닌 것은?', options: ['미래 일기', '옛날 사진', '문화재', '향토 박물관'], correct_answer: '미래 일기', explanation: '지역의 역사는 옛날 사진, 문화재, 박물관 등을 통해 알 수 있습니다.', difficulty: 1 },
  { grade: 4, subject: '사회', unit: '3. 지역의 공공 기관과 주민 참여', unit_code: '[4사03-01]', question_type: 'multiple_choice', question_text: '다음 중 공공 기관이 아닌 것은?', options: ['마트', '소방서', '경찰서', '주민센터'], correct_answer: '마트', explanation: '공공 기관은 모든 주민을 위해 일하는 곳으로, 소방서, 경찰서, 주민센터 등이 있습니다.', difficulty: 1 },
  { grade: 4, subject: '사회', unit: '4. 촌락과 도시의 생활 모습', unit_code: '[4사04-01]', question_type: 'multiple_choice', question_text: '촌락의 특징이 아닌 것은?', options: ['높은 건물이 많다', '논과 밭이 많다', '인구가 적다', '자연환경이 많다'], correct_answer: '높은 건물이 많다', explanation: '높은 건물이 많은 것은 도시의 특징입니다. 촌락은 논밭이 많고 자연환경이 풍부합니다.', difficulty: 1 },

  // ============================================================
  // 4학년 과학
  // ============================================================
  { grade: 4, subject: '과학', unit: '1. 식물의 한살이', unit_code: '[4과02-02]', question_type: 'multiple_choice', question_text: '씨가 싹트기 위해 필요한 조건이 아닌 것은?', options: ['빛', '물', '적당한 온도', '공기'], correct_answer: '빛', explanation: '씨가 싹트는 데는 물, 적당한 온도, 공기가 필요하며, 빛은 싹이 튼 후 자라는 데 필요합니다.', difficulty: 2 },
  { grade: 4, subject: '과학', unit: '1. 식물의 한살이', unit_code: '[4과02-02]', question_type: 'ox', question_text: '한해살이 식물은 한 해 동안 싹이 트고, 자라고, 꽃이 피고, 열매를 맺는다.', options: ['O', 'X'], correct_answer: 'O', explanation: '한해살이 식물(예: 강낭콩, 해바라기)은 한 해 안에 한살이를 마칩니다.', difficulty: 1 },
  { grade: 4, subject: '과학', unit: '2. 물의 상태 변화', unit_code: '[4과03-01]', question_type: 'multiple_choice', question_text: '물이 끓어서 수증기가 되는 현상은?', options: ['증발', '응결', '융해', '승화'], correct_answer: '증발', explanation: '물(액체)이 열을 받아 수증기(기체)로 변하는 것을 증발이라 합니다.', difficulty: 1 },
  { grade: 4, subject: '과학', unit: '2. 물의 상태 변화', unit_code: '[4과03-01]', question_type: 'ox', question_text: '물이 얼면 부피가 줄어든다.', options: ['O', 'X'], correct_answer: 'X', explanation: '물이 얼면 부피가 늘어납니다. 이것이 겨울에 수도관이 터지는 이유입니다.', difficulty: 2 },
  { grade: 4, subject: '과학', unit: '3. 그림자와 거울', unit_code: '[4과05-01]', question_type: 'multiple_choice', question_text: '그림자가 생기는 이유는?', options: ['빛이 직진하기 때문', '빛이 꺾이기 때문', '빛이 사라지기 때문', '빛이 나뉘기 때문'], correct_answer: '빛이 직진하기 때문', explanation: '빛은 직진하는 성질이 있어, 물체에 가려진 뒤쪽에 그림자가 생깁니다.', difficulty: 2 },
  { grade: 4, subject: '과학', unit: '4. 화산과 지진', unit_code: '[4과09-01]', question_type: 'multiple_choice', question_text: '화산이 분출할 때 나오지 않는 것은?', options: ['바닷물', '용암', '화산재', '화산 가스'], correct_answer: '바닷물', explanation: '화산이 분출하면 용암, 화산재, 화산 가스 등이 나옵니다.', difficulty: 1 },
  { grade: 4, subject: '과학', unit: '4. 화산과 지진', unit_code: '[4과09-01]', question_type: 'ox', question_text: '지진이 일어나면 책상 밑으로 들어가 몸을 보호해야 한다.', options: ['O', 'X'], correct_answer: 'O', explanation: '지진 시 튼튼한 책상 밑에 들어가 몸을 보호하는 것이 안전합니다.', difficulty: 1 },
  { grade: 4, subject: '과학', unit: '5. 물의 여행', unit_code: '[4과03-02]', question_type: 'multiple_choice', question_text: '물의 순환 과정에서 바닷물이 하늘로 올라가는 현상은?', options: ['증발', '강수', '흡수', '유출'], correct_answer: '증발', explanation: '바닷물이 태양열에 의해 수증기가 되어 하늘로 올라가는 것을 증발이라 합니다.', difficulty: 2 },
  { grade: 4, subject: '과학', unit: '6. 식물의 생활', unit_code: '[4과02-03]', question_type: 'multiple_choice', question_text: '식물이 자라는 데 꼭 필요한 것이 아닌 것은?', options: ['음악', '햇빛', '물', '흙'], correct_answer: '음악', explanation: '식물은 햇빛, 물, 흙(양분), 공기가 있어야 자랄 수 있습니다.', difficulty: 1 },

  // ============================================================
  // 4학년 영어
  // ============================================================
  { grade: 4, subject: '영어', unit: '1. I Have a Pencil', unit_code: '[4영02-02]', question_type: 'multiple_choice', question_text: '"나는 연필을 가지고 있어."를 영어로?', options: ['I have a pencil.', 'I am a pencil.', 'I like a pencil.', 'I want a pencil.'], correct_answer: 'I have a pencil.', explanation: '"I have ~"는 "나는 ~을 가지고 있어"라는 뜻입니다.', difficulty: 1 },
  { grade: 4, subject: '영어', unit: "2. Let's Play Soccer", unit_code: '[4영03-02]', question_type: 'multiple_choice', question_text: '"Let\'s play soccer."의 뜻은?', options: ['축구하자.', '축구를 좋아해.', '축구를 봐.', '축구를 싫어해.'], correct_answer: '축구하자.', explanation: '"Let\'s ~"는 "~하자"라고 제안하는 표현입니다.', difficulty: 1 },
  { grade: 4, subject: '영어', unit: "3. It's Under the Table", unit_code: '[4영04-02]', question_type: 'multiple_choice', question_text: '"Where is my bag?"의 뜻은?', options: ['내 가방은 어디에 있니?', '이것은 내 가방이야.', '내 가방을 좋아해.', '내 가방은 크다.'], correct_answer: '내 가방은 어디에 있니?', explanation: '"Where is ~?"는 "~은 어디에 있니?"라고 위치를 묻는 표현입니다.', difficulty: 1 },
  { grade: 4, subject: '영어', unit: '4. Do You Like Music?', unit_code: '[4영03-03]', question_type: 'multiple_choice', question_text: '"Do you like music?" 에 대한 긍정 대답은?', options: ['Yes, I do.', 'Yes, I am.', 'Yes, it is.', 'Yes, I can.'], correct_answer: 'Yes, I do.', explanation: '"Do you ~?"로 물으면 "Yes, I do." 또는 "No, I don\'t."로 답합니다.', difficulty: 1 },
  { grade: 4, subject: '영어', unit: "5. How's the Weather?", unit_code: '[4영05-01]', question_type: 'multiple_choice', question_text: '날씨가 맑을 때 영어로 뭐라고 하나요?', options: ['It\'s sunny.', 'It\'s rainy.', 'It\'s snowy.', 'It\'s cloudy.'], correct_answer: 'It\'s sunny.', explanation: 'sunny는 "맑은"이라는 뜻입니다.', difficulty: 1 },

  // ============================================================
  // 4학년 도덕
  // ============================================================
  { grade: 4, subject: '도덕', unit: '1. 참된 아름다움을 찾아서', unit_code: '[4도01-02]', question_type: 'multiple_choice', question_text: '참된 아름다움은 무엇일까요?', options: ['마음이 바른 것', '외모가 예쁜 것', '옷이 비싼 것', '키가 큰 것'], correct_answer: '마음이 바른 것', explanation: '참된 아름다움은 외모보다 마음이 바르고 착한 것에 있습니다.', difficulty: 1 },
  { grade: 4, subject: '도덕', unit: '2. 공정한 생활', unit_code: '[4도02-02]', question_type: 'multiple_choice', question_text: '공정하게 행동하는 것은?', options: ['규칙을 지키기', '친한 친구만 도와주기', '시험에서 답 베끼기', '줄 안 서고 새치기하기'], correct_answer: '규칙을 지키기', explanation: '공정함은 모든 사람에게 같은 규칙을 적용하고 지키는 것입니다.', difficulty: 1 },
  { grade: 4, subject: '도덕', unit: '2. 공정한 생활', unit_code: '[4도02-02]', question_type: 'ox', question_text: '놀이를 할 때 규칙을 정하고 지키는 것은 공정한 행동이다.', options: ['O', 'X'], correct_answer: 'O', explanation: '규칙을 정하고 모두가 지키는 것이 공정한 생활의 기본입니다.', difficulty: 1 },
  { grade: 4, subject: '도덕', unit: '3. 아름다운 사람이 되는 길', unit_code: '[4도03-02]', question_type: 'multiple_choice', question_text: '아름다운 사람이 되기 위해 가장 중요한 것은?', options: ['남을 배려하는 마음', '비싼 물건 갖기', '공부만 잘하기', '외모 꾸미기'], correct_answer: '남을 배려하는 마음', explanation: '아름다운 사람은 남을 배려하고 돕는 따뜻한 마음을 가진 사람입니다.', difficulty: 1 },

  // ============================================================
  // 5학년 수학
  // ============================================================
  { grade: 5, subject: '수학', unit: '1. 자연수의 혼합 계산', unit_code: '[6수01-01]', question_type: 'multiple_choice', question_text: '25 + 3 × 4 의 계산 결과는?', options: ['37', '112', '100', '28'], correct_answer: '37', explanation: '곱셈을 먼저 계산합니다. 3 × 4 = 12, 25 + 12 = 37', difficulty: 1 },
  { grade: 5, subject: '수학', unit: '1. 자연수의 혼합 계산', unit_code: '[6수01-01]', question_type: 'ox', question_text: '36 ÷ 4 + 2 × 5 = 19 이다.', options: ['O', 'X'], correct_answer: 'O', explanation: '36 ÷ 4 = 9, 2 × 5 = 10, 9 + 10 = 19', difficulty: 2 },
  { grade: 5, subject: '수학', unit: '1. 자연수의 혼합 계산', unit_code: '[6수01-01]', question_type: 'multiple_choice', question_text: '(15 - 3) × 2 + 8 의 결과는?', options: ['32', '28', '26', '34'], correct_answer: '32', explanation: '(15-3)=12, 12×2=24, 24+8=32', difficulty: 2 },
  { grade: 5, subject: '수학', unit: '2. 약수와 배수', unit_code: '[6수01-02]', question_type: 'multiple_choice', question_text: '12의 약수가 아닌 것은?', options: ['5', '1', '4', '6'], correct_answer: '5', explanation: '12의 약수는 1, 2, 3, 4, 6, 12입니다. 5는 12의 약수가 아닙니다.', difficulty: 1 },
  { grade: 5, subject: '수학', unit: '2. 약수와 배수', unit_code: '[6수01-02]', question_type: 'multiple_choice', question_text: '6과 8의 최소공배수는?', options: ['24', '48', '12', '16'], correct_answer: '24', explanation: '6의 배수: 6,12,18,24... / 8의 배수: 8,16,24... → 최소공배수는 24', difficulty: 2 },
  { grade: 5, subject: '수학', unit: '2. 약수와 배수', unit_code: '[6수01-02]', question_type: 'short_answer', question_text: '12와 18의 최대공약수는?', options: null, correct_answer: '6', explanation: '12의 약수: 1,2,3,4,6,12 / 18의 약수: 1,2,3,6,9,18 → 최대공약수는 6', difficulty: 2 },
  { grade: 5, subject: '수학', unit: '3. 대응 관계', unit_code: '[6수04-01]', question_type: 'multiple_choice', question_text: 'x가 1, 2, 3일 때 y가 3, 6, 9이면, x와 y의 관계는?', options: ['y = x × 3', 'y = x + 3', 'y = x × 2', 'y = x + 2'], correct_answer: 'y = x × 3', explanation: '1×3=3, 2×3=6, 3×3=9이므로 y = x × 3입니다.', difficulty: 2 },
  { grade: 5, subject: '수학', unit: '4. 약분과 통분', unit_code: '[6수01-03]', question_type: 'multiple_choice', question_text: '6/12을 약분하면?', options: ['1/2', '2/3', '3/6', '1/3'], correct_answer: '1/2', explanation: '6과 12의 최대공약수 6으로 나누면 1/2입니다.', difficulty: 1 },
  { grade: 5, subject: '수학', unit: '4. 약분과 통분', unit_code: '[6수01-03]', question_type: 'ox', question_text: '2/3와 4/6은 크기가 같은 분수이다.', options: ['O', 'X'], correct_answer: 'O', explanation: '4/6을 약분하면 2/3이므로 크기가 같습니다.', difficulty: 1 },
  { grade: 5, subject: '수학', unit: '5. 분수의 덧셈과 뺄셈', unit_code: '[6수01-04]', question_type: 'multiple_choice', question_text: '1/3 + 1/4 의 결과는?', options: ['7/12', '2/7', '1/7', '5/12'], correct_answer: '7/12', explanation: '통분하면 4/12 + 3/12 = 7/12', difficulty: 2 },
  { grade: 5, subject: '수학', unit: '6. 다각형의 둘레와 넓이', unit_code: '[6수02-01]', question_type: 'multiple_choice', question_text: '가로 5cm, 세로 3cm인 직사각형의 넓이는?', options: ['15cm²', '16cm²', '8cm²', '20cm²'], correct_answer: '15cm²', explanation: '직사각형의 넓이 = 가로 × 세로 = 5 × 3 = 15cm²', difficulty: 1 },
  { grade: 5, subject: '수학', unit: '7. 수의 범위와 어림하기', unit_code: '[6수01-05]', question_type: 'multiple_choice', question_text: '378을 백의 자리에서 반올림하면?', options: ['400', '300', '380', '370'], correct_answer: '400', explanation: '백의 자리 아래 78에서 7≥5이므로 올림하여 400', difficulty: 2 },
  { grade: 5, subject: '수학', unit: '8. 분수의 곱셈', unit_code: '[6수01-06]', question_type: 'multiple_choice', question_text: '2/3 × 3/4 의 결과는?', options: ['1/2', '6/7', '5/12', '2/4'], correct_answer: '1/2', explanation: '(2×3)/(3×4) = 6/12 = 1/2', difficulty: 2 },
  { grade: 5, subject: '수학', unit: '9. 합동과 대칭', unit_code: '[6수02-02]', question_type: 'multiple_choice', question_text: '모양과 크기가 완전히 같은 두 도형의 관계는?', options: ['합동', '대칭', '닮음', '평행'], correct_answer: '합동', explanation: '모양과 크기가 완전히 같은 두 도형을 합동이라 합니다.', difficulty: 1 },
  { grade: 5, subject: '수학', unit: '9. 합동과 대칭', unit_code: '[6수02-02]', question_type: 'ox', question_text: '선대칭 도형은 대칭축을 기준으로 접으면 완전히 겹친다.', options: ['O', 'X'], correct_answer: 'O', explanation: '선대칭 도형은 대칭축을 중심으로 반으로 접으면 완전히 겹칩니다.', difficulty: 1 },
  { grade: 5, subject: '수학', unit: '10. 소수의 곱셈', unit_code: '[6수01-07]', question_type: 'multiple_choice', question_text: '0.3 × 0.4 의 결과는?', options: ['0.12', '1.2', '0.7', '0.012'], correct_answer: '0.12', explanation: '3 × 4 = 12, 소수점 아래 자릿수의 합 = 2, 따라서 0.12', difficulty: 2 },

  // 5학년 국어: 2022 개정 국정교과서 → seed-2022-grade5-korean-1s-*.ts 파일에서 제공

  // 5학년 사회: 2022 개정 → seed-2022-grade5-social.ts 에서 제공

  // ============================================================
  // 5학년 과학
  // ============================================================
  { grade: 5, subject: '과학', unit: '1. 과학자는 어떻게 탐구할까요', unit_code: '[6과01-01]', question_type: 'multiple_choice', question_text: '과학적 탐구 과정의 올바른 순서는?', options: ['문제 인식→가설→실험→결론', '실험→문제 인식→결론→가설', '결론→가설→실험→문제 인식', '가설→결론→문제 인식→실험'], correct_answer: '문제 인식→가설→실험→결론', explanation: '과학 탐구는 문제를 인식하고, 가설을 세우고, 실험하고, 결론을 내리는 순서입니다.', difficulty: 2 },
  { grade: 5, subject: '과학', unit: '2. 온도와 열', unit_code: '[6과03-01]', question_type: 'multiple_choice', question_text: '다음 중 열이 전달되는 방법이 아닌 것은?', options: ['증발', '전도', '대류', '복사'], correct_answer: '증발', explanation: '열이 전달되는 세 가지 방법은 전도, 대류, 복사입니다.', difficulty: 2 },
  { grade: 5, subject: '과학', unit: '2. 온도와 열', unit_code: '[6과03-01]', question_type: 'ox', question_text: '온도가 높은 물체에서 낮은 물체로 열이 이동한다.', options: ['O', 'X'], correct_answer: 'O', explanation: '열은 항상 온도가 높은 곳에서 낮은 곳으로 이동합니다.', difficulty: 1 },
  { grade: 5, subject: '과학', unit: '3. 태양계와 별', unit_code: '[6과07-01]', question_type: 'multiple_choice', question_text: '태양계에서 가장 큰 행성은?', options: ['목성', '토성', '지구', '화성'], correct_answer: '목성', explanation: '목성은 태양계에서 가장 큰 행성입니다.', difficulty: 1 },
  { grade: 5, subject: '과학', unit: '3. 태양계와 별', unit_code: '[6과07-01]', question_type: 'ox', question_text: '태양은 행성이다.', options: ['O', 'X'], correct_answer: 'X', explanation: '태양은 행성이 아니라 항성(스스로 빛을 내는 별)입니다.', difficulty: 1 },
  { grade: 5, subject: '과학', unit: '3. 태양계와 별', unit_code: '[6과07-01]', question_type: 'short_answer', question_text: '태양에서 세 번째로 가까운 행성은?', options: null, correct_answer: '지구', explanation: '태양에서 가까운 순서: 수성, 금성, 지구, 화성...', difficulty: 1 },
  { grade: 5, subject: '과학', unit: '4. 용해와 용액', unit_code: '[6과04-01]', question_type: 'multiple_choice', question_text: '소금이 물에 녹는 현상을 무엇이라 하나요?', options: ['용해', '증발', '응결', '융해'], correct_answer: '용해', explanation: '물질이 액체에 녹아 골고루 섞이는 현상을 용해라 합니다.', difficulty: 1 },
  { grade: 4, subject: '과학', unit: '4. 다양한 생물과 우리 생활', unit_code: '[6과02-01]', question_type: 'multiple_choice', question_text: '곰팡이나 버섯은 어떤 생물에 해당하나요?', options: ['균류', '식물', '동물', '세균'], correct_answer: '균류', explanation: '곰팡이, 버섯 등은 균류에 속합니다.', difficulty: 2 },
  { grade: 6, subject: '과학', unit: '2. 물체의 운동', unit_code: '[6과06-01]', question_type: 'multiple_choice', question_text: '물체의 빠르기를 나타내는 것은?', options: ['속력', '무게', '부피', '온도'], correct_answer: '속력', explanation: '속력은 단위 시간 동안 물체가 이동한 거리로, 물체의 빠르기를 나타냅니다.', difficulty: 1 },
  { grade: 6, subject: '과학', unit: '2. 물체의 운동', unit_code: '[6과06-01]', question_type: 'ox', question_text: '같은 시간 동안 더 많이 이동한 물체가 더 빠르다.', options: ['O', 'X'], correct_answer: 'O', explanation: '같은 시간 동안 이동 거리가 길수록 속력이 빠른 것입니다.', difficulty: 1 },

  // ============================================================
  // 5학년 영어
  // ============================================================
  { grade: 5, subject: '영어', unit: '1. Hello, How Are You?', unit_code: '[6영01-01]', question_type: 'multiple_choice', question_text: '"How are you?"에 대한 적절한 대답은?', options: ["I'm fine, thank you.", "I'm 10 years old.", 'My name is Tom.', 'I like pizza.'], correct_answer: "I'm fine, thank you.", explanation: '"How are you?"는 안부를 묻는 인사말로, "I\'m fine, thank you."가 적절한 대답입니다.', difficulty: 1 },
  { grade: 5, subject: '영어', unit: '2. What Day Is It?', unit_code: '[6영02-01]', question_type: 'multiple_choice', question_text: '"What day is it today?"에 대한 대답으로 알맞은 것은?', options: ["It's Monday.", "It's sunny.", "It's 3 o'clock.", "It's my birthday."], correct_answer: "It's Monday.", explanation: '요일을 묻는 질문에는 요일로 답합니다.', difficulty: 1 },
  { grade: 5, subject: '영어', unit: '3. How Many Apples?', unit_code: '[6영03-01]', question_type: 'multiple_choice', question_text: '"How many"는 무엇을 물어보는 표현인가요?', options: ['수량(개수)', '가격', '색깔', '크기'], correct_answer: '수량(개수)', explanation: '"How many"는 셀 수 있는 것의 수량을 물어보는 표현입니다.', difficulty: 1 },
  { grade: 5, subject: '영어', unit: '4. I Like Spring', unit_code: '[6영04-01]', question_type: 'multiple_choice', question_text: 'spring, summer, fall, winter 중 "가을"은?', options: ['fall', 'spring', 'summer', 'winter'], correct_answer: 'fall', explanation: 'spring=봄, summer=여름, fall=가을, winter=겨울입니다.', difficulty: 1 },
  { grade: 5, subject: '영어', unit: '5. Where Is My Bag?', unit_code: '[6영05-01]', question_type: 'multiple_choice', question_text: '"on the desk"의 뜻은?', options: ['책상 위에', '책상 아래에', '책상 옆에', '책상 안에'], correct_answer: '책상 위에', explanation: '"on"은 "~위에"라는 뜻의 전치사입니다.', difficulty: 1 },
  { grade: 5, subject: '영어', unit: '6. What Time Is It?', unit_code: '[6영06-01]', question_type: 'multiple_choice', question_text: '시계가 3시를 가리킬 때 영어로?', options: ["It's three o'clock.", "It's third.", "It's three.", "It's the third."], correct_answer: "It's three o'clock.", explanation: '시각을 말할 때 "It\'s ~ o\'clock."으로 표현합니다.', difficulty: 1 },
  { grade: 5, subject: '영어', unit: '7. She Is My Mom', unit_code: '[6영07-01]', question_type: 'multiple_choice', question_text: '"She is my sister."의 뜻은?', options: ['그녀는 내 언니(여동생)야.', '그녀는 내 엄마야.', '그녀는 내 친구야.', '그녀는 선생님이야.'], correct_answer: '그녀는 내 언니(여동생)야.', explanation: 'sister는 자매(언니, 여동생)를 뜻합니다.', difficulty: 1 },
  { grade: 5, subject: '영어', unit: '8. I Can Swim', unit_code: '[6영08-01]', question_type: 'multiple_choice', question_text: '"I can swim."의 뜻은?', options: ['나는 수영할 수 있어.', '나는 수영을 좋아해.', '나는 수영을 해야 해.', '나는 수영을 원해.'], correct_answer: '나는 수영할 수 있어.', explanation: '"can"은 "~할 수 있다"라는 능력을 나타내는 조동사입니다.', difficulty: 1 },

  // ============================================================
  // 5학년 도덕
  // ============================================================
  { grade: 5, subject: '도덕', unit: '1. 도덕적 상상력, 나를 돌아보다', unit_code: '[6도01-01]', question_type: 'ox', question_text: '도덕적 상상력이란 다른 사람의 입장에서 생각해보는 것이다.', options: ['O', 'X'], correct_answer: 'O', explanation: '도덕적 상상력은 타인의 처지를 상상하고, 도덕적 결과를 예측하는 능력입니다.', difficulty: 1 },
  { grade: 5, subject: '도덕', unit: '1. 도덕적 상상력, 나를 돌아보다', unit_code: '[6도01-01]', question_type: 'multiple_choice', question_text: '자기 행동을 스스로 돌아보는 것을 무엇이라 하나요?', options: ['자기 성찰', '자기 과시', '자기 비하', '자기 변명'], correct_answer: '자기 성찰', explanation: '자기 성찰은 자신의 행동과 마음을 돌아보고 반성하는 것입니다.', difficulty: 2 },
  { grade: 5, subject: '도덕', unit: '2. 내 안의 소중한 친구, 자존감', unit_code: '[6도02-01]', question_type: 'multiple_choice', question_text: '자존감이 높은 사람의 특징은?', options: ['자신의 가치를 인정한다', '다른 사람만 칭찬한다', '항상 자기가 최고라고 한다', '실패하면 포기한다'], correct_answer: '자신의 가치를 인정한다', explanation: '자존감은 자신을 소중하게 여기고 자신의 가치를 인정하는 마음입니다.', difficulty: 1 },
  { grade: 5, subject: '도덕', unit: '3. 긍정의 힘으로 극복하기', unit_code: '[6도03-01]', question_type: 'ox', question_text: '어려운 일을 만났을 때 긍정적으로 생각하면 극복에 도움이 된다.', options: ['O', 'X'], correct_answer: 'O', explanation: '긍정적 사고는 어려움을 극복하는 데 큰 힘이 됩니다.', difficulty: 1 },
  { grade: 5, subject: '도덕', unit: '4. 함께 만들어가는 사이버 세상', unit_code: '[6도04-01]', question_type: 'multiple_choice', question_text: '인터넷을 바르게 사용하는 방법이 아닌 것은?', options: ['악성 댓글 달기', '개인 정보 보호하기', '저작권 지키기', '바른 말 사용하기'], correct_answer: '악성 댓글 달기', explanation: '인터넷에서도 현실과 마찬가지로 바른 말을 사용하고 남을 존중해야 합니다.', difficulty: 1 },

  // ============================================================
  // 6학년 수학
  // ============================================================
  { grade: 6, subject: '수학', unit: '1. 분수의 나눗셈', unit_code: '[6수01-08]', question_type: 'multiple_choice', question_text: '3/4 ÷ 1/2 의 결과는?', options: ['3/2', '3/8', '1/2', '2/3'], correct_answer: '3/2', explanation: '분수의 나눗셈은 나누는 수를 뒤집어 곱합니다. 3/4 × 2/1 = 6/4 = 3/2', difficulty: 2 },
  { grade: 6, subject: '수학', unit: '1. 분수의 나눗셈', unit_code: '[6수01-08]', question_type: 'ox', question_text: '분수의 나눗셈은 나누는 분수의 역수를 곱하면 된다.', options: ['O', 'X'], correct_answer: 'O', explanation: '분수의 나눗셈은 나누는 수의 분모와 분자를 바꿔(역수) 곱셈으로 계산합니다.', difficulty: 1 },
  { grade: 6, subject: '수학', unit: '2. 각기둥과 각뿔', unit_code: '[6수02-03]', question_type: 'multiple_choice', question_text: '밑면이 삼각형인 각기둥의 면의 수는?', options: ['5개', '4개', '6개', '3개'], correct_answer: '5개', explanation: '삼각기둥은 밑면 2개 + 옆면 3개 = 5개의 면을 가집니다.', difficulty: 2 },
  { grade: 6, subject: '수학', unit: '2. 각기둥과 각뿔', unit_code: '[6수02-03]', question_type: 'ox', question_text: '각뿔의 옆면은 모두 삼각형이다.', options: ['O', 'X'], correct_answer: 'O', explanation: '각뿔의 옆면은 꼭짓점에서 만나는 삼각형입니다.', difficulty: 1 },
  { grade: 6, subject: '수학', unit: '3. 소수의 나눗셈', unit_code: '[6수01-09]', question_type: 'multiple_choice', question_text: '7.2 ÷ 0.6 의 결과는?', options: ['12', '1.2', '0.12', '120'], correct_answer: '12', explanation: '7.2 ÷ 0.6 = 72 ÷ 6 = 12 (소수점을 같이 옮겨 계산)', difficulty: 2 },
  { grade: 6, subject: '수학', unit: '4. 비와 비율', unit_code: '[6수05-01]', question_type: 'multiple_choice', question_text: '남학생 12명, 여학생 8명일 때 남학생과 여학생의 비는?', options: ['3 : 2', '12 : 20', '2 : 3', '4 : 3'], correct_answer: '3 : 2', explanation: '12 : 8을 4로 나누면 3 : 2', difficulty: 2 },
  { grade: 6, subject: '수학', unit: '4. 비와 비율', unit_code: '[6수05-01]', question_type: 'short_answer', question_text: '20의 25%는 얼마인가요?', options: null, correct_answer: '5', explanation: '20 × 25/100 = 20 × 0.25 = 5', difficulty: 2 },
  { grade: 6, subject: '수학', unit: '5. 원의 넓이', unit_code: '[6수02-04]', question_type: 'multiple_choice', question_text: '반지름이 3cm인 원의 넓이는? (원주율=3)', options: ['27cm²', '18cm²', '9cm²', '36cm²'], correct_answer: '27cm²', explanation: '원의 넓이 = 원주율 × 반지름 × 반지름 = 3 × 3 × 3 = 27cm²', difficulty: 2 },
  { grade: 6, subject: '수학', unit: '6. 직육면체의 부피와 겉넓이', unit_code: '[6수02-05]', question_type: 'multiple_choice', question_text: '가로 2, 세로 3, 높이 4cm인 직육면체의 부피는?', options: ['24cm³', '20cm³', '12cm³', '9cm³'], correct_answer: '24cm³', explanation: '직육면체의 부피 = 가로 × 세로 × 높이 = 2 × 3 × 4 = 24cm³', difficulty: 1 },
  { grade: 6, subject: '수학', unit: '7. 여러 가지 그래프', unit_code: '[6수05-02]', question_type: 'multiple_choice', question_text: '전체에서 각 부분이 차지하는 비율을 나타내기에 좋은 그래프는?', options: ['원그래프', '막대그래프', '꺾은선그래프', '그림그래프'], correct_answer: '원그래프', explanation: '원그래프는 전체에서 각 부분이 차지하는 비율을 한눈에 보여줍니다.', difficulty: 2 },
  { grade: 6, subject: '수학', unit: '8. 비례식과 비례배분', unit_code: '[6수05-03]', question_type: 'multiple_choice', question_text: '2 : 3 = □ : 12 에서 □에 알맞은 수는?', options: ['8', '6', '9', '4'], correct_answer: '8', explanation: '외항의 곱 = 내항의 곱: 2 × 12 = 3 × □, □ = 24 ÷ 3 = 8', difficulty: 2 },
  { grade: 6, subject: '수학', unit: '9. 원기둥, 원뿔, 구', unit_code: '[6수02-06]', question_type: 'ox', question_text: '원기둥의 두 밑면은 서로 합동이다.', options: ['O', 'X'], correct_answer: 'O', explanation: '원기둥의 두 밑면은 크기와 모양이 같은(합동인) 원입니다.', difficulty: 1 },
  { grade: 6, subject: '수학', unit: '10. 경우의 수', unit_code: '[6수05-04]', question_type: 'multiple_choice', question_text: '동전 1개를 던질 때 경우의 수는?', options: ['2가지', '1가지', '3가지', '4가지'], correct_answer: '2가지', explanation: '동전을 던지면 앞면 또는 뒷면이 나오므로 경우의 수는 2가지입니다.', difficulty: 1 },
  { grade: 6, subject: '수학', unit: '10. 경우의 수', unit_code: '[6수05-04]', question_type: 'multiple_choice', question_text: '주사위 1개를 던질 때 경우의 수는?', options: ['6가지', '4가지', '12가지', '3가지'], correct_answer: '6가지', explanation: '주사위는 1~6의 눈이 있으므로 경우의 수는 6가지입니다.', difficulty: 1 },

  // ============================================================
  // 6학년 국어
  // ============================================================
  { grade: 6, subject: '국어', unit: '1. 비유하는 표현', unit_code: '[6국05-04]', question_type: 'multiple_choice', question_text: '"내 마음은 호수"에 사용된 비유법은?', options: ['은유법', '직유법', '의인법', '과장법'], correct_answer: '은유법', explanation: '"~은 ~이다"처럼 직접 빗대어 표현하는 것을 은유법이라 합니다.', difficulty: 2 },
  { grade: 6, subject: '국어', unit: '1. 비유하는 표현', unit_code: '[6국05-04]', question_type: 'multiple_choice', question_text: '"구름이 솜처럼 하얗다"에서 사용된 비유법은?', options: ['직유법', '은유법', '의인법', '대조법'], correct_answer: '직유법', explanation: '"~처럼", "~같이"를 사용하여 빗대는 것을 직유법이라 합니다.', difficulty: 1 },
  { grade: 6, subject: '국어', unit: '1. 비유하는 표현', unit_code: '[6국05-04]', question_type: 'ox', question_text: '의인법은 사람이 아닌 것을 사람처럼 표현하는 방법이다.', options: ['O', 'X'], correct_answer: 'O', explanation: '의인법은 동물, 식물, 사물 등을 사람처럼 표현하는 비유법입니다.', difficulty: 1 },
  { grade: 6, subject: '국어', unit: '2. 이야기를 간추려요', unit_code: '[6국02-02]', question_type: 'multiple_choice', question_text: '이야기를 간추릴 때 빠져서는 안 되는 것은?', options: ['사건의 흐름', '등장인물의 옷 색깔', '정확한 날씨', '배경의 세부 묘사'], correct_answer: '사건의 흐름', explanation: '이야기를 간추릴 때는 중요한 사건의 흐름을 빠뜨리지 않아야 합니다.', difficulty: 2 },
  { grade: 6, subject: '국어', unit: '3. 짜임새 있게 구성해요', unit_code: '[6국03-02]', question_type: 'multiple_choice', question_text: '글의 짜임에서 처음-가운데-끝의 역할이 아닌 것은?', options: ['그림 넣기', '글감 소개', '내용 전개', '마무리'], correct_answer: '그림 넣기', explanation: '글의 짜임은 처음(글감 소개), 가운데(내용 전개), 끝(마무리)으로 구성됩니다.', difficulty: 1 },
  { grade: 6, subject: '국어', unit: '4. 효과적으로 발표해요', unit_code: '[6국01-05]', question_type: 'ox', question_text: '발표할 때 자료를 활용하면 듣는 사람의 이해를 도울 수 있다.', options: ['O', 'X'], correct_answer: 'O', explanation: '그래프, 사진, 영상 등의 자료를 활용하면 발표 내용을 효과적으로 전달할 수 있습니다.', difficulty: 1 },
  { grade: 6, subject: '국어', unit: '5. 글에 담긴 생각과 비평', unit_code: '[6국02-07]', question_type: 'multiple_choice', question_text: '글을 비평적으로 읽는다는 것은?', options: ['글의 내용을 따져보며 읽기', '빠르게 읽기', '소리 내어 읽기', '외우면서 읽기'], correct_answer: '글의 내용을 따져보며 읽기', explanation: '비평적 읽기는 글의 내용이 타당한지, 근거가 적절한지 따져보며 읽는 것입니다.', difficulty: 2 },
  { grade: 6, subject: '국어', unit: '6. 타당성을 생각하며 토론해요', unit_code: '[6국01-06]', question_type: 'multiple_choice', question_text: '토론에서 가장 중요한 것은?', options: ['근거를 들어 주장하기', '큰 목소리로 말하기', '상대를 무시하기', '빨리 말하기'], correct_answer: '근거를 들어 주장하기', explanation: '토론에서는 자신의 주장을 타당한 근거를 들어 설득력 있게 말해야 합니다.', difficulty: 2 },
  { grade: 6, subject: '국어', unit: '7. 우리말을 가꾸어요', unit_code: '[6국04-05]', question_type: 'multiple_choice', question_text: '우리말을 바르게 사용하는 방법이 아닌 것은?', options: ['외래어만 사용하기', '맞춤법 지키기', '표준어 사용하기', '바른 높임말 쓰기'], correct_answer: '외래어만 사용하기', explanation: '우리말을 가꾸기 위해서는 맞춤법을 지키고, 적절한 우리말 표현을 사용해야 합니다.', difficulty: 1 },
  { grade: 6, subject: '국어', unit: '8. 인물의 삶을 찾아서', unit_code: '[6국05-05]', question_type: 'multiple_choice', question_text: '전기문의 특징은?', options: ['실제 인물의 삶을 다룬 글', '상상의 이야기', '과학 실험 보고서', '일기장'], correct_answer: '실제 인물의 삶을 다룬 글', explanation: '전기문은 실제 인물의 삶과 업적을 사실에 기초하여 쓴 글입니다.', difficulty: 1 },

  // ============================================================
  // 6학년 사회
  // ============================================================
  { grade: 6, subject: '사회', unit: '1. 우리나라의 정치 발전', unit_code: '[6사01-01]', question_type: 'multiple_choice', question_text: '대한민국은 어떤 정치 체제인가요?', options: ['민주주의', '왕정', '군주제', '독재'], correct_answer: '민주주의', explanation: '대한민국은 국민이 주인인 민주주의 국가입니다.', difficulty: 1 },
  { grade: 6, subject: '사회', unit: '1. 우리나라의 정치 발전', unit_code: '[6사01-01]', question_type: 'ox', question_text: '대한민국 헌법은 국민의 기본권을 보장하고 있다.', options: ['O', 'X'], correct_answer: 'O', explanation: '대한민국 헌법은 국민의 자유와 권리를 보장합니다.', difficulty: 1 },
  { grade: 6, subject: '사회', unit: '1. 우리나라의 정치 발전', unit_code: '[6사01-01]', question_type: 'multiple_choice', question_text: '국가 권력을 입법, 행정, 사법으로 나누는 것을 무엇이라 하나요?', options: ['삼권분립', '민주주의', '지방자치', '직접민주주의'], correct_answer: '삼권분립', explanation: '삼권분립은 권력 남용을 막기 위해 국가 권력을 셋으로 나누는 것입니다.', difficulty: 2 },
  { grade: 6, subject: '사회', unit: '2. 우리나라의 경제 발전', unit_code: '[6사02-01]', question_type: 'multiple_choice', question_text: '1960~70년대 우리나라의 경제 성장을 이끈 정책은?', options: ['경제 개발 5개년 계획', '새마을 운동만', '한류 수출', '인터넷 산업'], correct_answer: '경제 개발 5개년 계획', explanation: '정부의 경제 개발 5개년 계획으로 한국은 빠른 경제 성장을 이루었습니다.', difficulty: 2 },
  { grade: 6, subject: '사회', unit: '3. 세계 여러 나라의 자연과 문화', unit_code: '[6사03-01]', question_type: 'multiple_choice', question_text: '세계에서 가장 넓은 대륙은?', options: ['아시아', '아프리카', '유럽', '북아메리카'], correct_answer: '아시아', explanation: '아시아는 세계에서 가장 넓은 대륙으로, 면적이 약 4400만 km²입니다.', difficulty: 1 },
  { grade: 6, subject: '사회', unit: '3. 세계 여러 나라의 자연과 문화', unit_code: '[6사03-01]', question_type: 'ox', question_text: '세계에는 다양한 기후와 문화가 있다.', options: ['O', 'X'], correct_answer: 'O', explanation: '세계 여러 나라는 위치에 따라 다양한 기후와 문화를 가지고 있습니다.', difficulty: 1 },
  { grade: 6, subject: '사회', unit: '4. 통일 한국의 미래와 지구촌의 평화', unit_code: '[6사04-01]', question_type: 'multiple_choice', question_text: '남한과 북한이 통일해야 하는 이유가 아닌 것은?', options: ['전쟁을 일으키기 위해', '이산가족 문제 해결', '평화 통일의 실현', '민족의 동질성 회복'], correct_answer: '전쟁을 일으키기 위해', explanation: '통일은 평화적 방법으로 이루어져야 하며, 이산가족 문제 해결 등의 이유가 있습니다.', difficulty: 1 },

  // ============================================================
  // 6학년 과학
  // ============================================================
  { grade: 6, subject: '과학', unit: '1. 과학자처럼 탐구해 볼까요', unit_code: '[6과01-01]', question_type: 'multiple_choice', question_text: '실험에서 하나만 다르게 하고 나머지는 같게 하는 것을 무엇이라 하나요?', options: ['변인 통제', '가설 설정', '결론 도출', '자료 수집'], correct_answer: '변인 통제', explanation: '변인 통제는 실험에서 알아보려는 것만 다르게 하고, 나머지 조건은 같게 하는 것입니다.', difficulty: 2 },
  { grade: 6, subject: '과학', unit: '2. 지구와 달의 운동', unit_code: '[6과07-02]', question_type: 'multiple_choice', question_text: '낮과 밤이 생기는 이유는?', options: ['지구의 자전', '지구의 공전', '달의 자전', '태양의 이동'], correct_answer: '지구의 자전', explanation: '지구가 하루에 한 바퀴 자전하기 때문에 낮과 밤이 바뀝니다.', difficulty: 1 },
  { grade: 6, subject: '과학', unit: '2. 지구와 달의 운동', unit_code: '[6과07-02]', question_type: 'ox', question_text: '지구가 태양 주위를 도는 것을 공전이라 한다.', options: ['O', 'X'], correct_answer: 'O', explanation: '공전은 지구가 태양 주위를 1년에 한 바퀴 도는 것입니다.', difficulty: 1 },
  { grade: 6, subject: '과학', unit: '3. 여러 가지 기체', unit_code: '[6과04-02]', question_type: 'multiple_choice', question_text: '우리가 숨을 쉴 때 필요한 기체는?', options: ['산소', '이산화탄소', '질소', '수소'], correct_answer: '산소', explanation: '사람은 호흡할 때 산소를 들이마시고 이산화탄소를 내뱉습니다.', difficulty: 1 },
  { grade: 6, subject: '과학', unit: '3. 여러 가지 기체', unit_code: '[6과04-02]', question_type: 'ox', question_text: '공기 중에서 가장 많은 기체는 산소이다.', options: ['O', 'X'], correct_answer: 'X', explanation: '공기 중 가장 많은 기체는 질소(약 78%)이고, 산소는 약 21%입니다.', difficulty: 2 },
  { grade: 6, subject: '과학', unit: '4. 식물의 구조와 기능', unit_code: '[6과02-02]', question_type: 'multiple_choice', question_text: '식물에서 물과 양분을 운반하는 부분은?', options: ['줄기', '꽃', '열매', '뿌리털'], correct_answer: '줄기', explanation: '줄기 속의 관(물관, 체관)을 통해 물과 양분이 식물 전체로 운반됩니다.', difficulty: 1 },
  { grade: 6, subject: '과학', unit: '4. 식물의 구조와 기능', unit_code: '[6과02-02]', question_type: 'ox', question_text: '잎에서는 광합성이 일어난다.', options: ['O', 'X'], correct_answer: 'O', explanation: '식물의 잎에서 햇빛, 물, 이산화탄소를 이용하여 양분을 만드는 광합성이 일어납니다.', difficulty: 1 },
  { grade: 6, subject: '과학', unit: '5. 빛과 렌즈', unit_code: '[6과05-02]', question_type: 'multiple_choice', question_text: '볼록 렌즈로 종이에 햇빛을 모으면 어떻게 되나요?', options: ['종이가 탈 수 있다', '종이가 어두워진다', '아무 변화 없다', '종이가 차가워진다'], correct_answer: '종이가 탈 수 있다', explanation: '볼록 렌즈는 빛을 한 점에 모으므로 열이 집중되어 종이가 탈 수 있습니다.', difficulty: 1 },
  { grade: 6, subject: '과학', unit: '5. 빛과 렌즈', unit_code: '[6과05-02]', question_type: 'ox', question_text: '빛은 유리를 통과할 수 있다.', options: ['O', 'X'], correct_answer: 'O', explanation: '유리는 투명한 물질로 빛이 통과할 수 있습니다.', difficulty: 1 },
  { grade: 6, subject: '과학', unit: '6. 전기의 이용', unit_code: '[6과06-02]', question_type: 'multiple_choice', question_text: '전기 회로에서 전구에 불이 켜지려면 필요한 것은?', options: ['전지, 전선, 전구의 연결', '전지만', '전선만', '스위치만'], correct_answer: '전지, 전선, 전구의 연결', explanation: '전기 회로는 전지, 전선, 전구가 끊어지지 않게 연결되어야 전류가 흐릅니다.', difficulty: 1 },
  { grade: 6, subject: '과학', unit: '6. 전기의 이용', unit_code: '[6과06-02]', question_type: 'ox', question_text: '전구 두 개를 직렬연결하면 병렬연결보다 더 밝다.', options: ['O', 'X'], correct_answer: 'X', explanation: '직렬연결하면 전류가 나뉘어 각 전구의 밝기가 어두워집니다. 병렬연결이 더 밝습니다.', difficulty: 2 },
  { grade: 6, subject: '과학', unit: '6. 전기의 이용', unit_code: '[6과06-02]', question_type: 'short_answer', question_text: '전기가 흐르는 길을 무엇이라 하나요?', options: null, correct_answer: '전기 회로', explanation: '전기가 흐르는 길을 전기 회로라 합니다.', difficulty: 1 },

  // ============================================================
  // 6학년 영어
  // ============================================================
  { grade: 6, subject: '영어', unit: '1. What Grade Are You In?', unit_code: '[6영01-02]', question_type: 'multiple_choice', question_text: '"What grade are you in?"에 대한 알맞은 대답은?', options: ["I'm in the sixth grade.", "I'm fine.", "I'm 12.", 'I like school.'], correct_answer: "I'm in the sixth grade.", explanation: '학년을 묻는 질문에는 "I\'m in the ~ grade."로 답합니다.', difficulty: 1 },
  { grade: 6, subject: '영어', unit: '2. Is This Your Cap?', unit_code: '[6영02-02]', question_type: 'multiple_choice', question_text: '"Is this your cap?" 에 대한 긍정 대답은?', options: ['Yes, it is.', 'Yes, I am.', 'Yes, I do.', 'Yes, I can.'], correct_answer: 'Yes, it is.', explanation: '"Is this ~?"로 물으면 "Yes, it is." 또는 "No, it isn\'t."로 답합니다.', difficulty: 1 },
  { grade: 6, subject: '영어', unit: '3. What Are You Doing?', unit_code: '[6영03-02]', question_type: 'multiple_choice', question_text: '"What are you doing?"의 뜻은?', options: ['너 지금 뭐 하고 있니?', '너 무엇을 좋아하니?', '너 어디 가니?', '너 누구니?'], correct_answer: '너 지금 뭐 하고 있니?', explanation: '"What are you doing?"은 현재 하고 있는 행동을 묻는 표현입니다.', difficulty: 1 },
  { grade: 6, subject: '영어', unit: '4. When Is Your Birthday?', unit_code: '[6영04-02]', question_type: 'multiple_choice', question_text: 'March를 한국어로?', options: ['3월', '5월', '1월', '8월'], correct_answer: '3월', explanation: 'March는 영어로 3월입니다.', difficulty: 1 },
  { grade: 6, subject: '영어', unit: '5. How Much Is It?', unit_code: '[6영05-02]', question_type: 'multiple_choice', question_text: '"How much is it?"은 무엇을 묻는 표현인가요?', options: ['가격', '나이', '시간', '날씨'], correct_answer: '가격', explanation: '"How much is it?"은 "그것은 얼마입니까?"라는 가격을 묻는 표현입니다.', difficulty: 1 },
  { grade: 6, subject: '영어', unit: '6. I Want to Be a Chef', unit_code: '[6영06-02]', question_type: 'multiple_choice', question_text: '"I want to be a doctor."의 뜻은?', options: ['나는 의사가 되고 싶어.', '나는 의사를 좋아해.', '나는 의사야.', '나는 의사를 만났어.'], correct_answer: '나는 의사가 되고 싶어.', explanation: '"I want to be ~"는 "나는 ~이 되고 싶다"라는 장래 희망을 말하는 표현입니다.', difficulty: 1 },

  // ============================================================
  // 6학년 도덕
  // ============================================================
  { grade: 6, subject: '도덕', unit: '1. 내가 할 수 있는 것과 할 수 없는 것', unit_code: '[6도01-02]', question_type: 'multiple_choice', question_text: '자신이 할 수 있는 것과 없는 것을 구별하는 것이 중요한 이유는?', options: ['현실적인 목표를 세울 수 있어서', '항상 포기하기 위해서', '남과 비교하기 위해서', '변명하기 위해서'], correct_answer: '현실적인 목표를 세울 수 있어서', explanation: '자신의 능력을 파악하면 현실적인 목표를 세우고 꾸준히 노력할 수 있습니다.', difficulty: 2 },
  { grade: 6, subject: '도덕', unit: '2. 마음을 열면 보이는 것들', unit_code: '[6도02-02]', question_type: 'ox', question_text: '편견은 다른 사람을 공정하게 대하는 것을 방해한다.', options: ['O', 'X'], correct_answer: 'O', explanation: '편견은 사실이 아닌 생각으로 사람을 판단하는 것으로, 공정함을 방해합니다.', difficulty: 1 },
  { grade: 6, subject: '도덕', unit: '2. 마음을 열면 보이는 것들', unit_code: '[6도02-02]', question_type: 'multiple_choice', question_text: '다양성을 존중한다는 것은?', options: ['서로의 다름을 인정하는 것', '모두 같아지는 것', '다른 점을 무시하는 것', '자기만 옳다고 생각하는 것'], correct_answer: '서로의 다름을 인정하는 것', explanation: '다양성 존중은 사람마다 다른 생각, 문화, 개성을 인정하고 받아들이는 것입니다.', difficulty: 1 },
  { grade: 6, subject: '도덕', unit: '3. 함께 꿈꾸는 우리 사회', unit_code: '[6도03-02]', question_type: 'multiple_choice', question_text: '정의로운 사회를 만들기 위해 가장 필요한 것은?', options: ['공정한 규칙과 법', '많은 돈', '강한 군대', '넓은 땅'], correct_answer: '공정한 규칙과 법', explanation: '정의로운 사회는 모든 사람에게 공정한 규칙과 법이 적용되는 사회입니다.', difficulty: 2 },
  { grade: 6, subject: '도덕', unit: '4. 세계 속의 우리', unit_code: '[6도04-02]', question_type: 'multiple_choice', question_text: '세계 시민으로서 가져야 할 태도가 아닌 것은?', options: ['자기 나라만 생각하기', '다른 문화 존중하기', '환경 보호하기', '평화를 위해 노력하기'], correct_answer: '자기 나라만 생각하기', explanation: '세계 시민은 자국뿐 아니라 전 세계의 평화와 발전을 위해 노력하는 사람입니다.', difficulty: 1 },
  { grade: 6, subject: '도덕', unit: '4. 세계 속의 우리', unit_code: '[6도04-02]', question_type: 'ox', question_text: '지구촌 문제(환경, 빈곤 등)를 해결하기 위해 국제 협력이 필요하다.', options: ['O', 'X'], correct_answer: 'O', explanation: '환경 오염, 빈곤 등 지구촌 문제는 한 나라만으로 해결할 수 없으며 국제 협력이 필수입니다.', difficulty: 1 },

  // 추가 보충 문제 — 3학년
  { grade: 3, subject: '수학', unit: '1. 덧셈과 뺄셈', unit_code: '[4수01-01]', question_type: 'multiple_choice', question_text: '247 + 365 의 결과는?', options: ['612', '602', '512', '622'], correct_answer: '612', explanation: '7+5=12(2쓰고 올림), 4+6+1=11(1쓰고 올림), 2+3+1=6', difficulty: 2 },
  { grade: 3, subject: '수학', unit: '4. 곱셈', unit_code: '[4수01-03]', question_type: 'ox', question_text: '7 × 8 = 54 이다.', options: ['O', 'X'], correct_answer: 'X', explanation: '7 × 8 = 56입니다.', difficulty: 1 },
  { grade: 3, subject: '수학', unit: '6. 분수와 소수', unit_code: '[4수01-09]', question_type: 'multiple_choice', question_text: '1/2 과 크기가 같은 분수는?', options: ['2/4', '1/4', '3/4', '1/3'], correct_answer: '2/4', explanation: '1/2 = 2/4 (분자와 분모에 같은 수 2를 곱함)', difficulty: 2 },
  { grade: 3, subject: '과학', unit: '2. 동물의 한살이', unit_code: '[4과02-01]', question_type: 'short_answer', question_text: '알에서 태어나지 않고 어미 뱃속에서 자라서 태어나는 것을 무엇이라 하나요?', options: null, correct_answer: '태생', explanation: '어미의 몸속에서 자라서 태어나는 것을 태생이라 합니다.', difficulty: 3 },
  { grade: 3, subject: '과학', unit: '5. 지표의 변화', unit_code: '[4과08-01]', question_type: 'multiple_choice', question_text: '강 하류에서 주로 일어나는 작용은?', options: ['퇴적', '침식', '풍화', '화산 활동'], correct_answer: '퇴적', explanation: '강 하류는 물의 흐름이 느려 운반된 모래와 흙이 쌓이는 퇴적 작용이 활발합니다.', difficulty: 2 },
  { grade: 3, subject: '국어', unit: '5. 중요한 내용을 적어요', unit_code: '[4국01-03]', question_type: 'ox', question_text: '메모할 때는 모든 내용을 빠짐없이 적어야 한다.', options: ['O', 'X'], correct_answer: 'X', explanation: '메모는 핵심 내용만 간단히 적는 것입니다.', difficulty: 1 },
  { grade: 3, subject: '사회', unit: '1. 우리 고장의 모습', unit_code: '[4사01-01]', question_type: 'multiple_choice', question_text: '지도에서 땅의 높낮이를 나타내는 선을 무엇이라 하나요?', options: ['등고선', '경계선', '적도', '경도선'], correct_answer: '등고선', explanation: '등고선은 지도에서 같은 높이의 점을 이은 선으로, 땅의 높낮이를 나타냅니다.', difficulty: 3 },
  { grade: 3, subject: '영어', unit: '1. Hello!', unit_code: '[4영01-01]', question_type: 'short_answer', question_text: '"잘 가!"를 영어로 하면?', options: null, correct_answer: 'Goodbye', explanation: '"Goodbye"는 영어로 "잘 가, 안녕(헤어질 때)"이라는 인사말입니다.', difficulty: 1 },

  // 추가 보충 문제 — 4학년
  { grade: 4, subject: '수학', unit: '2. 각도', unit_code: '[4수02-04]', question_type: 'multiple_choice', question_text: '180도보다 크고 360도보다 작은 각을 무엇이라 하나요?', options: ['둔각', '직각', '예각', '평각'], correct_answer: '둔각', explanation: '90도보다 크고 180도보다 작은 각이 둔각인데, 문제 범위 내에서 180도 이상은 우각입니다. 초등에서는 90도 이상~180도 미만을 둔각이라 합니다.', difficulty: 3 },
  { grade: 4, subject: '수학', unit: '3. 곱셈과 나눗셈', unit_code: '[4수01-05]', question_type: 'short_answer', question_text: '96 ÷ 8 의 결과는?', options: null, correct_answer: '12', explanation: '8 × 12 = 96이므로, 96 ÷ 8 = 12', difficulty: 1 },
  { grade: 4, subject: '수학', unit: '8. 분수의 덧셈과 뺄셈', unit_code: '[4수01-08]', question_type: 'multiple_choice', question_text: '5/8 - 2/8 의 결과는?', options: ['3/8', '3/16', '7/8', '7/16'], correct_answer: '3/8', explanation: '분모가 같으므로 분자만 빼면 5-2=3, 답은 3/8', difficulty: 1 },
  { grade: 4, subject: '과학', unit: '3. 그림자와 거울', unit_code: '[4과05-01]', question_type: 'ox', question_text: '거울에 비친 모습은 좌우가 바뀌어 보인다.', options: ['O', 'X'], correct_answer: 'O', explanation: '평면 거울에 비친 모습은 좌우가 바뀌어 보입니다.', difficulty: 1 },
  { grade: 4, subject: '과학', unit: '2. 물의 상태 변화', unit_code: '[4과03-01]', question_type: 'short_answer', question_text: '물이 어는 온도(어는점)는 몇 도인가요?', options: null, correct_answer: '0도', explanation: '물은 0°C에서 얼기 시작합니다.', difficulty: 1 },
  { grade: 4, subject: '사회', unit: '3. 지역의 공공 기관과 주민 참여', unit_code: '[4사03-01]', question_type: 'ox', question_text: '도서관은 모든 주민이 이용할 수 있는 공공시설이다.', options: ['O', 'X'], correct_answer: 'O', explanation: '도서관, 공원, 체육관 등은 모든 주민이 이용할 수 있는 공공시설입니다.', difficulty: 1 },
  { grade: 4, subject: '영어', unit: '1. I Have a Pencil', unit_code: '[4영02-02]', question_type: 'ox', question_text: '"I have a cat."은 "나는 고양이를 가지고 있어."라는 뜻이다.', options: ['O', 'X'], correct_answer: 'O', explanation: '"I have a ~"는 "나는 ~을 가지고 있어"라는 뜻입니다.', difficulty: 1 },
  { grade: 4, subject: '도덕', unit: '1. 참된 아름다움을 찾아서', unit_code: '[4도01-02]', question_type: 'ox', question_text: '겉모습이 화려한 것만이 참된 아름다움이다.', options: ['O', 'X'], correct_answer: 'X', explanation: '참된 아름다움은 외모보다 마음씨와 행동에 있습니다.', difficulty: 1 },

  // 추가 보충 문제 — 5학년
  { grade: 5, subject: '수학', unit: '2. 약수와 배수', unit_code: '[6수01-02]', question_type: 'ox', question_text: '1은 모든 자연수의 약수이다.', options: ['O', 'X'], correct_answer: 'O', explanation: '1은 어떤 자연수에도 나누어 떨어지므로 모든 자연수의 약수입니다.', difficulty: 1 },
  { grade: 5, subject: '수학', unit: '5. 분수의 덧셈과 뺄셈', unit_code: '[6수01-04]', question_type: 'short_answer', question_text: '2/5 + 1/5 은 얼마인가요?', options: null, correct_answer: '3/5', explanation: '분모가 같으므로 분자만 더합니다. 2+1=3, 답은 3/5', difficulty: 1 },
  { grade: 5, subject: '수학', unit: '6. 다각형의 둘레와 넓이', unit_code: '[6수02-01]', question_type: 'multiple_choice', question_text: '한 변이 6cm인 정사각형의 둘레는?', options: ['24cm', '36cm', '12cm', '18cm'], correct_answer: '24cm', explanation: '정사각형의 둘레 = 한 변 × 4 = 6 × 4 = 24cm', difficulty: 1 },
  { grade: 5, subject: '수학', unit: '10. 소수의 곱셈', unit_code: '[6수01-07]', question_type: 'short_answer', question_text: '1.5 × 4 의 결과는?', options: null, correct_answer: '6', explanation: '15 × 4 = 60, 소수점 한 자리이므로 6.0 = 6', difficulty: 1 },
  { grade: 5, subject: '과학', unit: '4. 용해와 용액', unit_code: '[6과04-01]', question_type: 'ox', question_text: '온도가 높을수록 물에 녹는 설탕의 양은 많아진다.', options: ['O', 'X'], correct_answer: 'O', explanation: '대부분의 고체 물질은 물의 온도가 높아질수록 더 많이 녹습니다.', difficulty: 2 },
  { grade: 4, subject: '과학', unit: '4. 다양한 생물과 우리 생활', unit_code: '[6과02-01]', question_type: 'ox', question_text: '세균은 맨눈으로 볼 수 없다.', options: ['O', 'X'], correct_answer: 'O', explanation: '세균은 매우 작아서 현미경으로만 관찰할 수 있습니다.', difficulty: 1 },
  // 추가 보충 문제 — 6학년
  { grade: 6, subject: '수학', unit: '1. 분수의 나눗셈', unit_code: '[6수01-08]', question_type: 'multiple_choice', question_text: '2/5 ÷ 1/3 의 결과는?', options: ['6/5', '2/15', '1/5', '3/10'], correct_answer: '6/5', explanation: '2/5 × 3/1 = 6/5', difficulty: 2 },
  { grade: 6, subject: '수학', unit: '3. 소수의 나눗셈', unit_code: '[6수01-09]', question_type: 'short_answer', question_text: '4.8 ÷ 1.2 의 결과는?', options: null, correct_answer: '4', explanation: '48 ÷ 12 = 4', difficulty: 1 },
  { grade: 6, subject: '수학', unit: '5. 원의 넓이', unit_code: '[6수02-04]', question_type: 'ox', question_text: '원주율은 지름에 대한 원주의 비율이다.', options: ['O', 'X'], correct_answer: 'O', explanation: '원주율 = 원주 ÷ 지름 ≈ 3.14', difficulty: 2 },
  { grade: 6, subject: '수학', unit: '6. 직육면체의 부피와 겉넓이', unit_code: '[6수02-05]', question_type: 'short_answer', question_text: '한 변이 3cm인 정육면체의 부피는?', options: null, correct_answer: '27cm³', explanation: '정육면체 부피 = 한 변 × 한 변 × 한 변 = 3 × 3 × 3 = 27cm³', difficulty: 2 },
  { grade: 6, subject: '수학', unit: '8. 비례식과 비례배분', unit_code: '[6수05-03]', question_type: 'multiple_choice', question_text: '600원을 2:3으로 비례배분하면 적은 쪽의 금액은?', options: ['240원', '300원', '360원', '200원'], correct_answer: '240원', explanation: '전체 비율 2+3=5, 600÷5=120, 적은 쪽: 120×2=240원', difficulty: 2 },
  { grade: 6, subject: '과학', unit: '2. 지구와 달의 운동', unit_code: '[6과07-02]', question_type: 'multiple_choice', question_text: '계절이 바뀌는 이유는?', options: ['지구의 공전과 자전축 기울기', '달의 공전', '태양의 크기 변화', '지구와 달의 거리 변화'], correct_answer: '지구의 공전과 자전축 기울기', explanation: '지구가 기울어진 채로 태양 주위를 공전하기 때문에 계절이 바뀝니다.', difficulty: 3 },
  { grade: 6, subject: '과학', unit: '4. 식물의 구조와 기능', unit_code: '[6과02-02]', question_type: 'short_answer', question_text: '뿌리에서 흡수한 물이 이동하는 관을 무엇이라 하나요?', options: null, correct_answer: '물관', explanation: '물관은 뿌리에서 흡수한 물과 무기양분을 잎까지 운반하는 관입니다.', difficulty: 2 },
  { grade: 6, subject: '사회', unit: '2. 우리나라의 경제 발전', unit_code: '[6사02-01]', question_type: 'ox', question_text: '한강의 기적은 우리나라의 빠른 경제 성장을 비유한 말이다.', options: ['O', 'X'], correct_answer: 'O', explanation: '"한강의 기적"은 1960~80년대 대한민국의 놀라운 경제 성장을 이르는 말입니다.', difficulty: 1 },
  { grade: 6, subject: '국어', unit: '2. 이야기를 간추려요', unit_code: '[6국02-02]', question_type: 'ox', question_text: '이야기를 간추릴 때 등장인물의 대사를 모두 적어야 한다.', options: ['O', 'X'], correct_answer: 'X', explanation: '이야기를 간추릴 때는 핵심 사건 위주로 요약하고, 모든 대사를 옮길 필요는 없습니다.', difficulty: 1 },
  { grade: 6, subject: '영어', unit: '3. What Are You Doing?', unit_code: '[6영03-02]', question_type: 'multiple_choice', question_text: '"I am reading a book."의 뜻은?', options: ['나는 책을 읽고 있어.', '나는 책을 좋아해.', '나는 책이 있어.', '나는 책을 샀어.'], correct_answer: '나는 책을 읽고 있어.', explanation: '"I am ~ing"는 "나는 ~하는 중이야"라는 현재 진행형 표현입니다.', difficulty: 1 },
  { grade: 6, subject: '도덕', unit: '1. 내가 할 수 있는 것과 할 수 없는 것', unit_code: '[6도01-02]', question_type: 'ox', question_text: '노력하면 불가능한 것도 가능하게 될 수 있지만, 한계를 인정하는 것도 중요하다.', options: ['O', 'X'], correct_answer: 'O', explanation: '노력은 중요하지만, 현실적인 한계를 인정하고 지혜롭게 대처하는 것도 성장의 일부입니다.', difficulty: 2 },
];

// 4학년 전과목은 v7 파일을 유일 소스로 사용한다.
// (기존에 seed-2022-grade4·seed-part1/2·v6-fill 등 여러 곳에 흩어져 있고
//  2015 개정 잔재 단원이 섞여 있던 4학년 문항은 아래 filter에서 모두 제외하고,
//  성취기준 정합 단원의 4지선다로 재구성한 v7 6과목으로 대체한다.)
const legacyMerged: QuestionSeed[] = [
  ...baseQuestions, ...seedPart1, ...seedPart2,
  ...seed2022Grade3, ...seed2022Grade4, ...seed2022Grade5, ...seed2022Grade6,
  ...seed2022Grade5MathS1, ...seed2022Grade5MathS2,
  ...seed2022Grade5Science, ...seed2022Grade5Social,
  ...seed2022Grade5EnglishS1a, ...seed2022Grade5EnglishS1b,
  ...seed2022Grade5EnglishS2a, ...seed2022Grade5EnglishS2b,
  ...seed2022Grade5MathHard,
  ...seed2022Grade5EnglishHard, ...seed2022Grade5OtherHard,
  ...seed2022Grade5MathHard2,
  ...seed2022Grade5EnglishHard2, ...seed2022Grade5OtherHard2,
  ...seed2022Grade5Korean1sU12, ...seed2022Grade5Korean1sU34, ...seed2022Grade5Korean1sU56,
  ...seedGrade5V2Math, ...seedGrade5V2Science, ...seedGrade5V2English, ...seedGrade5V2Others,
  ...seedGrade5V3Korean, ...seedGrade5V3Social, ...seedGrade5V3Science,
  ...seedGrade5V4Extra,
  ...seedGrade5V5Moral,
  ...seedGrade3V6aFill, ...seedGrade3V6bFill, ...seedGrade4V6Fill, ...seedGrade6V6Fill,
  ...seedGrade3V7KoreanA, ...seedGrade3V7KoreanB, ...seedGrade3V7MathA, ...seedGrade3V7MathB,
  ...seedGrade3V7ScienceA, ...seedGrade3V7ScienceB, ...seedGrade3V7English, ...seedGrade3V7Social, ...seedGrade3V7Moral,
].filter((q) => q.grade !== 3 && q.grade !== 4 && q.grade !== 6);

// 중복 제거 후 통합 (v7/v8 3·4·6학년 6과목을 앞에 두어 우선 채택)
const seen = new Set<string>();
const mergedSeed: QuestionSeed[] = [
  ...seed2022Grade5History, ...seed2022Grade6World,
  ...seedV9Math, ...seedV9Korean, ...seedV9Science, ...seedV9English, ...seedV9Grade5, ...seedV9Fill,
  ...seedV10Supplement,
  ...seedGrade3V8Korean, ...seedGrade3V8Math, ...seedGrade3V8Social,
  ...seedGrade3V8Science, ...seedGrade3V8English, ...seedGrade3V8Moral,
  ...seedGrade4V7Science, ...seedGrade4V7Math, ...seedGrade4V7Korean,
  ...seedGrade4V7English, ...seedGrade4V7Social, ...seedGrade4V7Moral,
  ...seedGrade6V7Math, ...seedGrade6V7Social, ...seedGrade6V7Science,
  ...seedGrade6V7Korean, ...seedGrade6V7English, ...seedGrade6V7Moral,
  ...legacyMerged,
].filter((q) => {
  const key = `${q.grade}-${q.subject}-${q.question_text}`;
  if (seen.has(key)) return false;
  seen.add(key);
  return true;
});

/**
 * 정합성 계층 통과본만 외부로 나간다.
 * — 정답과 값이 같은 보기(복수 정답)를 제거하고, 보기를 4개로 맞추고,
 *   구조적으로 출제 불가한 문항은 폐기한다. 상세는 lib/questionSanitizer.ts.
 * 감사 스크립트(`npm run audit:questions`)가 잔여 CRIT을 0으로 강제한다.
 */
// 단원명·학년 정합화를 정합성 계층보다 먼저 돌린다.
// (중복 판정 키가 학년+과목+발문이라, 학년이 옮겨진 뒤 다시 dedup해야
//  같은 문항이 두 학년에 남지 않는다.)
const normalizedSeen = new Set<string>();
const normalizedSeed: QuestionSeed[] = mergedSeed
  .map((q) => {
    const n = normalizeUnit(q.grade, q.subject, q.unit, q.question_text);
    return n.grade === q.grade && n.unit === q.unit ? q : { ...q, grade: n.grade, unit: n.unit };
  })
  .filter((q) => {
    const key = `${q.grade}-${q.subject}-${q.question_text}`;
    if (normalizedSeen.has(key)) return false;
    normalizedSeen.add(key);
    return true;
  });

const sanitized = sanitizeQuestions(normalizedSeed);
export const questionSeedSanitizeSummary = sanitized.summary;
export const questionsSeed: QuestionSeed[] = sanitized.questions;
