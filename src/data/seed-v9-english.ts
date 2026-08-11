import type { QuestionSeed } from './questions-seed';

/**
 * v9 영어 증량 팩 — 3~6학년 교과서 단원별 핵심 표현·어휘 보강.
 *
 * 초등 영어는 "문장을 통째로 익히는" 단원 구성이라, 문항도 단원의 핵심
 * 표현(Key expression)과 그 단원에서 쓰는 낱말을 묻는다.
 * 오답은 같은 단원·같은 품사에서 뽑아 낸다 — 엉뚱한 품사를 섞으면
 * 뜻을 몰라도 소거법으로 풀려 변별력이 사라진다.
 */

const out: QuestionSeed[] = [];

interface UnitSpec {
  grade: number;
  unit: string;
  /**
   * 성취기준 코드는 공식 문서로 확인된 것만 넣는다.
   * 확인되지 않은 코드를 적어 두면 교사가 그 코드를 믿고 수업 계획을 세우게
   * 되므로, 모르는 것은 비워 두는 편이 낫다(교차검증에서 지적된 사항).
   */
  code: string | null;
  /** 단원 핵심 표현: [영어 표현, 우리말 뜻] */
  expressions: Array<[string, string]>;
  /** 단원 낱말: [영어, 우리말] — 같은 갈래끼리 모아 오답으로 쓴다 */
  words: Array<[string, string]>;
  /** 대화 완성: [질문, 알맞은 대답, 어울리지 않는 대답 3개] */
  dialogs?: Array<[string, string, [string, string, string]]>;
}

function build(spec: UnitSpec) {
  const { grade, unit, code, expressions, words, dialogs = [] } = spec;
  const push = (text: string, answer: string, wrong: string[], why: string, difficulty = 2) => {
    const picked = wrong.filter((w) => w !== answer).slice(0, 3);
    if (picked.length < 3) return;
    const opts = [answer, ...picked];
    const r = text.length % 4;
    out.push({
      grade,
      subject: '영어',
      unit,
      unit_code: code,
      question_type: 'multiple_choice',
      question_text: text,
      options: [...opts.slice(r), ...opts.slice(0, r)],
      correct_answer: answer,
      explanation: why,
      difficulty,
    });
  };

  // 표현 → 뜻 / 뜻 → 표현
  expressions.forEach(([en, ko], i) => {
    const otherKo = expressions.filter((_, j) => j !== i).map(([, k]) => k);
    const otherEn = expressions.filter((_, j) => j !== i).map(([e]) => e);
    push(`"${en}"의 우리말 뜻으로 알맞은 것은?`, ko, rotate(otherKo, i), `"${en}"은(는) "${ko}"라는 뜻입니다.`, 2);
    push(`"${ko}"를 영어로 바르게 나타낸 것은?`, en, rotate(otherEn, i + 1), `"${ko}"는 "${en}"입니다.`, 2);
  });

  // 낱말 → 뜻 / 뜻 → 낱말
  words.forEach(([en, ko], i) => {
    const otherKo = words.filter((_, j) => j !== i).map(([, k]) => k);
    const otherEn = words.filter((_, j) => j !== i).map(([e]) => e);
    push(`낱말 "${en}"의 뜻은?`, ko, rotate(otherKo, i), `"${en}"은(는) "${ko}"입니다.`, 1);
    push(`"${ko}"에 해당하는 영어 낱말은?`, en, rotate(otherEn, i + 2), `"${ko}"는 영어로 "${en}"입니다.`, 1);
  });

  // 대화 완성
  dialogs.forEach(([q, a, w]) => {
    push(`A: ${q}  B: ______  빈칸에 알맞은 말은?`, a, [...w], `"${q}"에는 "${a}"로 답하는 것이 자연스럽습니다.`, 3);
  });
}

/** 오답 후보를 문항마다 다르게 돌려 같은 조합이 반복되지 않게 한다 */
function rotate(arr: string[], by: number): string[] {
  if (arr.length === 0) return arr;
  const n = ((by % arr.length) + arr.length) % arr.length;
  return [...arr.slice(n), ...arr.slice(0, n)];
}

// ──────────── 3학년 ────────────

build({
  grade: 3, unit: "1. Hello! I'm Mina", code: null,
  expressions: [
    ['Hello!', '안녕!'], ['Good morning.', '좋은 아침이에요.'], ["I'm Mina.", '나는 미나야.'],
    ['Nice to meet you.', '만나서 반가워.'], ['Goodbye.', '안녕히 가세요.'], ['See you.', '또 봐.'],
    ['How are you?', '어떻게 지내니?'], ["I'm fine, thank you.", '잘 지내, 고마워.'],
  ],
  words: [['hello', '안녕'], ['name', '이름'], ['friend', '친구'], ['teacher', '선생님'], ['morning', '아침'], ['school', '학교']],
  dialogs: [
    ['Hello, my name is Tom.', "Hi, I'm Mina.", ['It is a cat.', 'I like apples.', "It's Monday."]],
    ['Nice to meet you.', 'Nice to meet you, too.', ['I am seven.', 'It is red.', 'I can swim.']],
  ],
});

build({
  grade: 3, unit: '2. What Is It?', code: null,
  expressions: [
    ['What is it?', '그것은 무엇이니?'], ["It's a book.", '그것은 책이야.'], ['Is it a cat?', '그것은 고양이니?'],
    ['Yes, it is.', '응, 맞아.'], ['No, it is not.', '아니, 아니야.'], ['Look at this.', '이것 좀 봐.'],
  ],
  words: [['book', '책'], ['pencil', '연필'], ['eraser', '지우개'], ['ruler', '자'], ['bag', '가방'], ['chair', '의자'], ['desk', '책상'], ['ball', '공']],
  dialogs: [
    ['What is it?', "It's a pencil.", ['I am fine.', 'She is my mom.', 'It is Monday.']],
    ['Is it a ball?', 'Yes, it is.', ['I am nine.', 'I like milk.', 'It is sunny.']],
  ],
});

build({
  grade: 3, unit: '3. I Like Apples', code: null,
  expressions: [
    ['I like apples.', '나는 사과를 좋아해.'], ["I don't like milk.", '나는 우유를 좋아하지 않아.'],
    ['Do you like pizza?', '너는 피자를 좋아하니?'], ['Yes, I do.', '응, 좋아해.'], ["No, I don't.", '아니, 좋아하지 않아.'],
  ],
  words: [['apple', '사과'], ['banana', '바나나'], ['milk', '우유'], ['bread', '빵'], ['orange', '오렌지'], ['water', '물'], ['egg', '달걀'], ['rice', '밥']],
  dialogs: [
    ['Do you like bananas?', 'Yes, I do.', ['It is a book.', 'I am ten.', 'She is tall.']],
    ['What do you like?', 'I like apples.', ['It is Tuesday.', 'I can run.', 'It is under the table.']],
  ],
});

build({
  grade: 3, unit: '4. How Old Are You?', code: null,
  expressions: [
    ['How old are you?', '너는 몇 살이니?'], ["I'm ten years old.", '나는 열 살이야.'],
    ['Happy birthday!', '생일 축하해!'], ['How many candles?', '초가 몇 개니?'],
  ],
  words: [['one', '하나'], ['two', '둘'], ['three', '셋'], ['four', '넷'], ['five', '다섯'], ['six', '여섯'], ['seven', '일곱'], ['eight', '여덟'], ['nine', '아홉'], ['ten', '열']],
  dialogs: [
    ['How old are you?', "I'm nine years old.", ['I like apples.', 'It is a dog.', 'It is Friday.']],
  ],
});

build({
  grade: 3, unit: '5. I Can Swim', code: null,
  expressions: [
    ['I can swim.', '나는 수영할 수 있어.'], ["I can't skate.", '나는 스케이트를 못 타.'],
    ['Can you jump?', '너는 뛸 수 있니?'], ['Yes, I can.', '응, 할 수 있어.'], ["No, I can't.", '아니, 못 해.'],
  ],
  words: [['swim', '수영하다'], ['run', '달리다'], ['jump', '뛰다'], ['sing', '노래하다'], ['dance', '춤추다'], ['skate', '스케이트를 타다'], ['ride', '타다'], ['fly', '날다']],
  dialogs: [
    ['Can you sing?', 'Yes, I can.', ['It is a cat.', 'I am ten.', 'It is red.']],
  ],
});

build({
  grade: 3, unit: '6. How Many Cats?', code: null,
  expressions: [
    ['How many cats?', '고양이가 몇 마리니?'], ['Three cats.', '고양이 세 마리.'],
    ['How many books do you have?', '너는 책을 몇 권 가지고 있니?'], ['I have two books.', '나는 책 두 권이 있어.'],
  ],
  words: [['cat', '고양이'], ['dog', '개'], ['bird', '새'], ['fish', '물고기'], ['rabbit', '토끼'], ['horse', '말'], ['cow', '소'], ['pig', '돼지']],
  dialogs: [
    ['How many dogs?', 'Five dogs.', ['I like dogs.', 'It is a dog.', 'Yes, I can.']],
  ],
});

// ──────────── 4학년 ────────────

build({
  grade: 4, unit: '1. I Have a Pencil', code: null,
  expressions: [
    ['I have a pencil.', '나는 연필이 있어.'], ['Do you have a ruler?', '너는 자가 있니?'],
    ['Yes, I do.', '응, 있어.'], ["No, I don't.", '아니, 없어.'], ["I don't have an eraser.", '나는 지우개가 없어.'],
  ],
  words: [['pencil', '연필'], ['eraser', '지우개'], ['ruler', '자'], ['crayon', '크레용'], ['glue', '풀'], ['scissors', '가위'], ['notebook', '공책'], ['pencil case', '필통']],
  dialogs: [['Do you have a crayon?', 'Yes, I do.', ['It is Monday.', 'I am fine.', 'It is a cat.']]],
});

build({
  grade: 4, unit: "2. Let's Play Soccer", code: null,
  expressions: [
    ["Let's play soccer.", '축구 하자.'], ['Sounds good.', '좋아.'], ["Sorry, I can't.", '미안, 안 돼.'],
    ["Let's go together.", '같이 가자.'], ['That sounds fun.', '재미있겠다.'],
  ],
  words: [['soccer', '축구'], ['baseball', '야구'], ['basketball', '농구'], ['badminton', '배드민턴'], ['tennis', '테니스'], ['swimming', '수영']],
  dialogs: [["Let's play badminton.", 'Sounds good.', ['It is a ball.', 'I am ten.', 'It is sunny.']]],
});

build({
  grade: 4, unit: "3. It's Under the Table", code: null,
  expressions: [
    ["It's under the table.", '그것은 탁자 아래에 있어.'], ["Where is my bag?", '내 가방은 어디에 있니?'],
    ["It's on the desk.", '그것은 책상 위에 있어.'], ["It's in the box.", '그것은 상자 안에 있어.'],
  ],
  words: [['on', '~ 위에'], ['in', '~ 안에'], ['under', '~ 아래에'], ['table', '탁자'], ['box', '상자'], ['bed', '침대'], ['sofa', '소파'], ['door', '문']],
  dialogs: [['Where is my cap?', "It's on the bed.", ['I like caps.', 'Yes, I can.', 'I am ten.']]],
});

build({
  grade: 4, unit: '4. Do You Like Music?', code: null,
  expressions: [
    ['Do you like music?', '너는 음악을 좋아하니?'], ['Yes, I like music.', '응, 나는 음악을 좋아해.'],
    ['What subject do you like?', '너는 어떤 과목을 좋아하니?'], ['I like P.E.', '나는 체육을 좋아해.'],
  ],
  words: [['music', '음악'], ['math', '수학'], ['science', '과학'], ['art', '미술'], ['P.E.', '체육'], ['Korean', '국어'], ['English', '영어'], ['history', '역사']],
  dialogs: [['What subject do you like?', 'I like art.', ['It is a book.', 'I am fine.', 'It is Monday.']]],
});

build({
  grade: 4, unit: "5. How's the Weather?", code: null,
  expressions: [
    ["How's the weather?", '날씨가 어떠니?'], ["It's sunny.", '날씨가 맑아.'], ["It's rainy.", '비가 와.'],
    ["It's snowy.", '눈이 와.'], ["It's windy.", '바람이 불어.'], ["It's cloudy.", '흐려.'],
  ],
  words: [['sunny', '맑은'], ['rainy', '비 오는'], ['snowy', '눈 오는'], ['windy', '바람 부는'], ['cloudy', '흐린'], ['hot', '더운'], ['cold', '추운'], ['warm', '따뜻한']],
  dialogs: [["How's the weather?", "It's cloudy.", ['I am ten.', 'It is a cat.', 'Yes, I do.']]],
});

build({
  grade: 4, unit: '6. What Day Is It Today?', code: null,
  expressions: [
    ['What day is it today?', '오늘은 무슨 요일이니?'], ["It's Monday.", '월요일이야.'],
    ['See you tomorrow.', '내일 봐.'], ['Have a nice day.', '좋은 하루 보내.'],
  ],
  words: [['Monday', '월요일'], ['Tuesday', '화요일'], ['Wednesday', '수요일'], ['Thursday', '목요일'], ['Friday', '금요일'], ['Saturday', '토요일'], ['Sunday', '일요일'], ['today', '오늘']],
  dialogs: [['What day is it today?', "It's Friday.", ['I am nine.', 'It is a dog.', 'I like music.']]],
});

// ──────────── 6학년 ────────────

build({
  grade: 6, unit: '1. What Grade Are You In?', code: null,
  expressions: [
    ['What grade are you in?', '너는 몇 학년이니?'], ["I'm in the sixth grade.", '나는 6학년이야.'],
    ['Which class are you in?', '너는 몇 반이니?'], ["I'm in class three.", '나는 3반이야.'],
    ['Where are you from?', '너는 어디에서 왔니?'], ["I'm from Korea.", '나는 한국에서 왔어.'],
  ],
  words: [['grade', '학년'], ['class', '반'], ['student', '학생'], ['classmate', '반 친구'], ['country', '나라'], ['school', '학교']],
  dialogs: [['What grade are you in?', "I'm in the sixth grade.", ['I like math.', 'It is rainy.', 'I have a pen.']]],
});

build({
  grade: 6, unit: '2. Is This Your Cap?', code: null,
  expressions: [
    ['Is this your cap?', '이것은 네 모자니?'], ['Yes, it is mine.', '응, 내 것이야.'],
    ["No, it's not mine.", '아니, 내 것이 아니야.'], ['Whose bag is this?', '이것은 누구의 가방이니?'],
    ["It's Mina's.", '미나의 것이야.'],
  ],
  words: [['cap', '모자'], ['glove', '장갑'], ['scarf', '목도리'], ['jacket', '재킷'], ['umbrella', '우산'], ['wallet', '지갑'], ['mine', '나의 것'], ['yours', '너의 것']],
  dialogs: [['Whose umbrella is this?', "It's mine.", ['I am in grade six.', 'It is sunny.', 'I like it.']]],
});

build({
  grade: 6, unit: '3. What Are You Doing?', code: null,
  expressions: [
    ['What are you doing?', '너는 무엇을 하고 있니?'], ["I'm reading a book.", '나는 책을 읽고 있어.'],
    ["I'm watching TV.", '나는 TV를 보고 있어.'], ["I'm doing my homework.", '나는 숙제를 하고 있어.'],
    ["I'm listening to music.", '나는 음악을 듣고 있어.'],
  ],
  words: [['read', '읽다'], ['watch', '보다'], ['listen', '듣다'], ['write', '쓰다'], ['cook', '요리하다'], ['clean', '청소하다'], ['study', '공부하다'], ['play', '놀다']],
  dialogs: [['What are you doing?', "I'm cooking dinner.", ['It is Monday.', 'I am twelve.', 'It is mine.']]],
});

build({
  grade: 6, unit: '4. When Is Your Birthday?', code: null,
  expressions: [
    ['When is your birthday?', '네 생일은 언제니?'], ["It's May 5th.", '5월 5일이야.'],
    ['What is the date today?', '오늘은 며칠이니?'], ["It's June 10th.", '6월 10일이야.'],
  ],
  words: [['January', '1월'], ['February', '2월'], ['March', '3월'], ['April', '4월'], ['May', '5월'], ['June', '6월'], ['July', '7월'], ['August', '8월'], ['September', '9월'], ['October', '10월'], ['November', '11월'], ['December', '12월']],
  dialogs: [['When is your birthday?', "It's March 3rd.", ['I am fine.', 'It is a cap.', 'I like it.']]],
});

build({
  grade: 6, unit: '5. How Much Is It?', code: null,
  expressions: [
    ['How much is it?', '그것은 얼마니?'], ["It's five dollars.", '5달러야.'],
    ['May I help you?', '도와드릴까요?'], ["I'll take it.", '그것으로 할게요.'],
    ["That's too expensive.", '너무 비싸요.'],
  ],
  words: [['price', '가격'], ['dollar', '달러'], ['expensive', '비싼'], ['cheap', '싼'], ['buy', '사다'], ['sell', '팔다'], ['money', '돈'], ['change', '거스름돈']],
  dialogs: [['How much is this cap?', "It's ten dollars.", ['It is Monday.', 'I am twelve.', 'Yes, I can.']]],
});

build({
  grade: 6, unit: '6. I Want to Be a Chef', code: null,
  expressions: [
    ['I want to be a chef.', '나는 요리사가 되고 싶어.'], ['What do you want to be?', '너는 무엇이 되고 싶니?'],
    ['I want to be a scientist.', '나는 과학자가 되고 싶어.'], ['Why do you want to be a doctor?', '너는 왜 의사가 되고 싶니?'],
  ],
  words: [['chef', '요리사'], ['doctor', '의사'], ['teacher', '선생님'], ['scientist', '과학자'], ['pilot', '조종사'], ['singer', '가수'], ['writer', '작가'], ['nurse', '간호사'], ['firefighter', '소방관'], ['police officer', '경찰관']],
  dialogs: [['What do you want to be?', 'I want to be a pilot.', ['It is five dollars.', 'It is May 5th.', 'I am reading.']]],
});

export const seedV9English: QuestionSeed[] = out;
