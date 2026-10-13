export type QuizDifficultyLevel = 'Thông hiểu' | 'Vận dụng' | 'Vận dụng cao';

export interface QuizQuestion {
  id: number;
  level: QuizDifficultyLevel;
  sectionCode: 'a' | 'b' | 'c';
  topic: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface TrueFalseStatement {
  id: 'a' | 'b' | 'c' | 'd';
  text: string;
  isTrue: boolean;
  explanation: string;
}

export interface TrueFalseQuestion {
  id: number;
  title: string;
  topic: string;
  stem: string;
  statements: [
    TrueFalseStatement,
    TrueFalseStatement,
    TrueFalseStatement,
    TrueFalseStatement,
  ];
}

export interface WorkedExample {
  id: number;
  title: string;
  level: string;
  problem: string;
  steps: string[];
  conclusion: string;
}

/**
 * Quy tắc tính điểm Phần II (Trắc nghiệm Đúng / Sai - Tối đa 2,0 điểm cho 2 câu):
 * - Đúng 1 ý trong 1 câu: 0,1 điểm
 * - Đúng 2 ý trong 1 câu: 0,25 điểm
 * - Đúng 3 ý trong 1 câu: 0,5 điểm
 * - Đúng 4 ý trong 1 câu: 1,0 điểm
 */
export function getTrueFalseQuestionScore(correctCount: number): number {
  switch (correctCount) {
    case 4:
      return 1.0;
    case 3:
      return 0.5;
    case 2:
      return 0.25;
    case 1:
      return 0.1;
    default:
      return 0;
  }
}

export const WORKED_EXAMPLES: WorkedExample[] = [
  {
    id: 1,
    title: 'Ví dụ 1: So sánh bán kính các nguyên tố trong cùng một chu kì',
    level: 'Thông hiểu',
    problem:
      'Sắp xếp các nguyên tố sau theo chiều bán kính nguyên tử giảm dần: Na (Z = 11), Mg (Z = 12), Al (Z = 13), Si (Z = 14), Cl (Z = 17).',
    steps: [
      'Bước 1: Xác định vị trí: Các nguyên tố Na, Mg, Al, Si, Cl đều có 3 lớp electron nên cùng thuộc Chu kì 3.',
      'Bước 2: Áp dụng quy luật trong một chu kì: Đi từ trái sang phải theo chiều tăng dần của điện tích hạt nhân (Z tăng từ 11 đến 17), lực hút giữa hạt nhân với các electron lớp ngoài cùng tăng dần.',
      'Bước 3: Do số lớp electron không đổi (cùng 3 lớp) nhưng lực hút hạt nhân tăng nên bán kính nguyên tử giảm dần từ Na đến Cl.',
    ],
    conclusion:
      'Thứ tự bán kính giảm dần: Na > Mg > Al > Si > Cl (186 pm > 160 pm > 143 pm > 117 pm > 99 pm).',
  },
  {
    id: 2,
    title: 'Ví dụ 2: So sánh bán kính các nguyên tố trong cùng một nhóm A',
    level: 'Thông hiểu',
    problem:
      'Sắp xếp các nguyên tố kim loại kiềm nhóm IA: Li (Z = 3), Na (Z = 11), K (Z = 19), Rb (Z = 37), Cs (Z = 55) theo chiều bán kính nguyên tử tăng dần.',
    steps: [
      'Bước 1: Xác định vị trí: Li (chu kì 2), Na (chu kì 3), K (chu kì 4), Rb (chu kì 5), Cs (chu kì 6) đều thuộc nhóm IA.',
      'Bước 2: Áp dụng quy luật trong một nhóm A: Khi đi từ trên xuống dưới, số lớp electron tăng dần (từ 2 lớp ở Li lên 6 lớp ở Cs).',
      'Bước 3: Sự gia tăng số lớp electron là yếu tố quyết định làm khoảng cách từ hạt nhân tới lớp electron ngoài cùng tăng lên.',
    ],
    conclusion:
      'Thứ tự bán kính tăng dần: Li < Na < K < Rb < Cs (152 pm < 186 pm < 227 pm < 248 pm < 265 pm).',
  },
  {
    id: 3,
    title: 'Ví dụ 3: So sánh bán kính các nguyên tố khác chu kì và khác nhóm A (Phương pháp bắc cầu)',
    level: 'Vận dụng cao',
    problem:
      'Cho các nguyên tố: X (Z = 12), Y (Z = 16) và T (Z = 19). Hãy sắp xếp các nguyên tố theo chiều bán kính nguyên tử giảm dần.',
    steps: [
      'Bước 1: Xác định vị trí từng nguyên tố: X là Mg (Z = 12, chu kì 3, nhóm IIA); Y là S (Z = 16, chu kì 3, nhóm VIA); T là K (Z = 19, chu kì 4, nhóm IA).',
      'Bước 2: So sánh X và Y cùng thuộc chu kì 3: Vì Z(X) = 12 < Z(Y) = 16 nên bán kính X > Y.',
      'Bước 3: So sánh T (chu kì 4, 4 lớp electron, đầu chu kì nhóm IA) với X (chu kì 3, 3 lớp electron): T có nhiều lớp electron hơn và ở nhóm IA nên bán kính T > X.',
    ],
    conclusion: 'Thứ tự bán kính nguyên tử giảm dần: T > X > Y (tức K > Mg > S).',
  },
];

/**
 * PHẦN I. TRẮC NGHIỆM NHIỀU PHƯƠNG ÁN LỰA CHỌN (8,0 ĐIỂM - 8 CÂU x 1,0 ĐIỂM / CÂU)
 * - a) Thông hiểu: Câu 1 -> Câu 4
 * - b) Vận dụng: Câu 5 -> Câu 8
 */
export const QUIZ_QUESTIONS: QuizQuestion[] = [
  // ==================== a) THÔNG HIỂU (Câu 1 - 4) ====================
  {
    id: 1,
    level: 'Thông hiểu',
    sectionCode: 'a',
    topic: 'Khái niệm bán kính nguyên tử',
    question: 'Bán kính nguyên tử được định nghĩa gần đúng bằng',
    options: [
      'A. Khoảng cách từ hạt nhân đến electron ngoài cùng.',
      'B. Một nửa khoảng cách giữa hai hạt nhân của hai nguyên tử giống nhau liên kết với nhau.',
      'C. Khoảng cách từ hạt nhân đến lớp electron thứ nhất.',
      'D. Khoảng cách giữa hai electron ngoài cùng.',
    ],
    correctIndex: 1,
    explanation:
      'Bán kính nguyên tử được định nghĩa gần đúng bằng một nửa khoảng cách trung bình giữa hai hạt nhân của hai nguyên tử giống nhau liên kết với nhau (hoặc gần nhau nhất trong đơn chất). Công thức thực nghiệm: r = d / 2.',
  },
  {
    id: 2,
    level: 'Thông hiểu',
    sectionCode: 'a',
    topic: 'Quy luật trong một chu kì',
    question: 'Trong một chu kì, khi đi từ trái sang phải, bán kính nguyên tử nhìn chung',
    options: ['A. Tăng dần.', 'B. Giảm dần.', 'C. Không đổi.', 'D. Tăng rồi giảm.'],
    correctIndex: 1,
    explanation:
      'Trong một chu kì, khi đi từ trái sang phải theo chiều tăng dần của điện tích hạt nhân, số lớp electron không đổi trong khi điện tích hạt nhân tăng dần, hút các electron mạnh hơn làm bán kính nguyên tử nhìn chung giảm dần.',
  },
  {
    id: 3,
    level: 'Thông hiểu',
    sectionCode: 'a',
    topic: 'Quy luật trong một nhóm A',
    question: 'Trong một nhóm A, khi đi từ trên xuống dưới, bán kính nguyên tử nhìn chung',
    options: [
      'A. Giảm dần do điện tích hạt nhân tăng.',
      'B. Không đổi do số electron hóa trị không đổi.',
      'C. Tăng dần do số lớp electron tăng.',
      'D. Giảm dần do lực hút hạt nhân tăng.',
    ],
    correctIndex: 2,
    explanation:
      'Trong một nhóm A, khi đi từ trên xuống dưới, bán kính nguyên tử nhìn chung tăng dần do số lớp electron tăng lên, electron ngoài cùng xa hạt nhân hơn.',
  },
  {
    id: 4,
    level: 'Thông hiểu',
    sectionCode: 'a',
    topic: 'Nguyên nhân biến đổi bán kính trong chu kì',
    question: 'Nguyên nhân chủ yếu khiến bán kính nguyên tử giảm trong một chu kì là',
    options: [
      'A. Số lớp electron tăng lên.',
      'B. Điện tích hạt nhân tăng, lực hút electron mạnh hơn trong khi số lớp electron không đổi.',
      'C. Số proton giảm dần.',
      'D. Số electron hóa trị giảm dần.',
    ],
    correctIndex: 1,
    explanation:
      'Trong cùng một chu kì, số lớp electron không đổi nhưng điện tích hạt nhân tăng dần làm tăng lực giữ của hạt nhân đối với các electron lớp ngoài cùng mạnh hơn, kéo chúng lại gần hạt nhân hơn, làm bán kính nguyên tử giảm.',
  },

  // ==================== b) VẬN DỤNG (Câu 5 - 8) ====================
  {
    id: 5,
    level: 'Vận dụng',
    sectionCode: 'b',
    topic: 'So sánh bán kính Na (Z = 11) và Cl (Z = 17)',
    question: 'Xét Na (Z = 11) và Cl (Z = 17). Nhận định nào sau đây là đúng?',
    options: [
      'A. Na có bán kính nhỏ hơn Cl vì Na có ít electron hơn.',
      'B. Na có bán kính lớn hơn Cl vì cùng chu kì và điện tích hạt nhân của Na nhỏ hơn.',
      'C. Na và Cl có bán kính bằng nhau vì cùng số lớp electron.',
      'D. Cl có bán kính lớn hơn Na vì có nhiều proton hơn.',
    ],
    correctIndex: 1,
    explanation:
      'Na (Z = 11) và Cl (Z = 17) cùng thuộc chu kì 3 (cùng có 3 lớp electron). Vì điện tích hạt nhân của Na nhỏ hơn Cl (+11 < +17) nên lực hút hạt nhân ở Na yếu hơn, làm bán kính Na (186 pm) lớn hơn Cl (99 pm).',
  },
  {
    id: 6,
    level: 'Vận dụng',
    sectionCode: 'b',
    topic: 'So sánh bán kính hai nguyên tố cùng nhóm A theo số lớp e',
    question:
      'Nguyên tử X có 3 lớp electron, nguyên tử Y có 4 lớp electron và cả hai thuộc cùng một nhóm A. So sánh bán kính nguyên tử X và Y.',
    options: [
      'A. X > Y.',
      'B. X < Y.',
      'C. X = Y.',
      'D. Không thể kết luận theo quy luật biến đổi trong nhóm.',
    ],
    correctIndex: 1,
    explanation:
      'Trong cùng một nhóm A, đi từ trên xuống dưới số lớp electron tăng dần, electron lớp ngoài cùng càng xa hạt nhân nên bán kính nguyên tử tăng dần. Do X có 3 lớp electron và Y có 4 lớp electron nên bán kính X < Y.',
  },
  {
    id: 7,
    level: 'Vận dụng',
    sectionCode: 'b',
    topic: 'Bản chất bán kính từ Li đến Ne',
    question: 'Giải thích vì sao bán kính nguyên tử giảm từ Li đến Ne.',
    options: [
      'A. Các nguyên tử bị mất lớp electron.',
      'B. Số lớp electron giảm dần.',
      'C. Điện tích hạt nhân tăng dần, trong khi electron chỉ được thêm vào cùng lớp thứ hai khiến lực hút hạt nhân tăng mạnh.',
      'D. Số proton giảm nên giữ electron không đổi.',
    ],
    correctIndex: 2,
    explanation:
      'Từ Li đến Ne (chu kì 2), điện tích hạt nhân tăng dần (+3 đến +10) trong khi các electron chỉ phân bố thêm vào cùng lớp thứ hai (n = 2), làm cho lực hút hạt nhân đối với electron lớp ngoài cùng tăng dần, kéo các electron sát hạt nhân hơn khiến bán kính giảm dần.',
  },
  {
    id: 8,
    level: 'Vận dụng',
    sectionCode: 'b',
    topic: 'Phản biện nhận định về bán kính của K và Na',
    question:
      'Một học sinh cho rằng: Bán kính của K nhỏ hơn Na vì K có điện tích hạt nhân lớn hơn. Nhận định này đúng hay sai?',
    options: [
      'A. Đúng, vì điện tích hạt nhân luôn quyết định hoàn toàn bán kính.',
      'B. Sai, vì K có nhiều lớp electron hơn so với Na nên bán kính K lớn hơn.',
      'C. Đúng, vì K có nhiều electron hơn.',
      'D. Sai, vì Na có nhiều lớp electron hơn K.',
    ],
    correctIndex: 1,
    explanation:
      'Na (chu kì 3, 3 lớp electron) và K (chu kì 4, 4 lớp electron) cùng thuộc nhóm IA. Khi đi từ Na xuống K, yếu tố tăng thêm 1 lớp electron có ảnh hưởng vượt trội so với sự tăng điện tích hạt nhân, khiến bán kính của K (227 pm) lớn hơn Na (186 pm). Do đó nhận định của học sinh là Sai.',
  },
];

/**
 * PHẦN II. TRẮC NGHIỆM ĐÚNG / SAI (2,0 ĐIỂM - 2 CÂU x 1,0 ĐIỂM / CÂU)
 * - Câu 1: Xét các phát biểu về bán kính nguyên tử trong bảng tuần hoàn
 * - Câu 2: Cho các nguyên tố Na (Z = 11), Mg (Z = 12), Al (Z = 13), K (Z = 19)
 */
export const TRUE_FALSE_QUESTIONS: TrueFalseQuestion[] = [
  {
    id: 1,
    title: 'Câu 1 (Đúng / Sai)',
    topic: 'Quy luật biến đổi bán kính nguyên tử trong bảng tuần hoàn',
    stem: '1. Xét các phát biểu về bán kính nguyên tử trong bảng tuần hoàn:',
    statements: [
      {
        id: 'a',
        text: 'a) Trong một chu kì, bán kính nguyên tử nhìn chung giảm từ trái sang phải.',
        isTrue: true,
        explanation:
          'Đúng. Trong một chu kì, khi đi từ trái sang phải, điện tích hạt nhân tăng trong khi số lớp electron không đổi, lực hút hạt nhân tăng làm bán kính nguyên tử nhìn chung giảm dần.',
      },
      {
        id: 'b',
        text: 'b) Trong một nhóm A, bán kính nguyên tử nhìn chung giảm từ trên xuống dưới.',
        isTrue: false,
        explanation:
          'Sai. Trong một nhóm A, khi đi từ trên xuống dưới, số lớp electron tăng dần làm bán kính nguyên tử nhìn chung TĂNG DẦN (chứ không phải giảm dần).',
      },
      {
        id: 'c',
        text: 'c) Các nguyên tử thuộc cùng một chu kì có cùng số lớp electron.',
        isTrue: true,
        explanation:
          'Đúng. Các nguyên tử trong cùng một chu kì có số lớp electron bằng nhau và bằng số thứ tự chu kì.',
      },
      {
        id: 'd',
        text: 'd) Điện tích hạt nhân tăng dần là một trong những nguyên nhân khiến bán kính nguyên tử giảm trong một chu kì.',
        isTrue: true,
        explanation:
          'Đúng. Điện tích hạt nhân tăng làm tăng lực hút của hạt nhân đối với các electron lớp ngoài cùng mạnh hơn (khi số lớp electron không đổi), khiến bán kính nguyên tử giảm.',
      },
    ],
  },
  {
    id: 2,
    title: 'Câu 2 (Đúng / Sai)',
    topic: 'So sánh bán kính nguyên tử và số lớp electron của Na, Mg, Al, K',
    stem: '2. Cho các nguyên tố Na (Z = 11), Mg (Z = 12), Al (Z = 13), K (Z = 19).',
    statements: [
      {
        id: 'a',
        text: 'a) Bán kính nguyên tử giảm dần theo thứ tự Na > Mg > Al.',
        isTrue: true,
        explanation:
          'Đúng. Na, Mg, Al cùng thuộc chu kì 3; theo chiều điện tích hạt nhân tăng dần (11 < 12 < 13), bán kính nguyên tử giảm dần: Na (186 pm) > Mg (160 pm) > Al (143 pm).',
      },
      {
        id: 'b',
        text: 'b) Bán kính nguyên tử của K nhỏ hơn bán kính nguyên tử của Na.',
        isTrue: false,
        explanation:
          'Sai. Na (chu kì 3, 3 lớp e) và K (chu kì 4, 4 lớp e) cùng thuộc nhóm IA; đi từ trên xuống dưới bán kính tăng dần, nên bán kính của K (227 pm) LỚN HƠN bán kính của Na (186 pm).',
      },
      {
        id: 'c',
        text: 'c) Nguyên tử K có nhiều lớp electron hơn nguyên tử Na.',
        isTrue: true,
        explanation:
          'Đúng. Nguyên tử K (Z = 19, chu kì 4) có 4 lớp electron, nhiều hơn nguyên tử Na (Z = 11, chu kì 3) có 3 lớp electron.',
      },
      {
        id: 'd',
        text: 'd) Bán kính nguyên tử của Mg lớn hơn bán kính nguyên tử của K.',
        isTrue: false,
        explanation:
          'Sai. Ta có K (chu kì 4, nhóm IA: 227 pm) > Na (chu kì 3, nhóm IA: 186 pm) > Mg (chu kì 3, nhóm IIA: 160 pm). Do đó bán kính nguyên tử của Mg nhỏ hơn bán kính của K.',
      },
    ],
  },
];
