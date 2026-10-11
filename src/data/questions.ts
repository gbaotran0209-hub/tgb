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
 * Quy tắc tính điểm Phần II (Trắc nghiệm Đúng / Sai - Tối đa 3,0 điểm cho 3 câu):
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
      'Bước 2: Áp dụng quy luật trong một chu kì: Từ trái sang phải theo chiều tăng dần của điện tích hạt nhân (Z tăng từ 11 đến 17), lực hút giữa hạt nhân và các electron lớp ngoài cùng tăng dần.',
      'Bước 3: Do số lớp electron không đổi (đều bằng 3 lớp) nhưng lực hút hạt nhân tăng nên bán kính nguyên tử giảm dần từ Na đến Cl.',
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
      'Bước 3: Sự tăng số lớp electron là yếu tố quyết định làm khoảng cách từ hạt nhân tới lớp electron ngoài cùng tăng lên.',
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
      'Bước 3: So sánh T (chu kì 4, 4 lớp electron, đứng đầu chu kì ở nhóm IA) với X (chu kì 3, 3 lớp electron): T có nhiều lớp electron hơn và nằm ở nhóm IA nên bán kính T > X.',
    ],
    conclusion: 'Thứ tự bán kính nguyên tử giảm dần: T > X > Y (tức K > Mg > S).',
  },
];

/**
 * PHẦN I. TRẮC NGHIỆM NHIỀU PHƯƠNG ÁN LỰA CHỌN (7,0 ĐIỂM)
 * - a) Thông hiểu: Câu 1 -> Câu 8
 * - b) Vận dụng: Câu 9 -> Câu 15
 * - c) Vận dụng cao: Câu 16 -> Câu 21
 */
export const QUIZ_QUESTIONS: QuizQuestion[] = [
  // ==================== a) THÔNG HIỂU (Câu 1 - 8) ====================
  {
    id: 1,
    level: 'Thông hiểu',
    sectionCode: 'a',
    topic: 'Khái niệm bán kính nguyên tử',
    question: 'Bán kính nguyên tử được xác định gần đúng bằng',
    options: [
      'Khoảng cách từ hạt nhân đến electron ngoài cùng.',
      'Một nửa khoảng cách giữa hai hạt nhân của hai nguyên tử giống nhau liên kết với nhau.',
      'Khoảng cách từ hạt nhân đến lớp electron thứ nhất.',
      'Khoảng cách giữa hai electron ngoài cùng.',
    ],
    correctIndex: 1,
    explanation:
      'Bán kính nguyên tử được xác định gần đúng bằng một nửa khoảng cách trung bình giữa hai hạt nhân của hai nguyên tử giống nhau liên kết với nhau (hoặc gần nhau nhất trong chất rắn đơn chất).',
  },
  {
    id: 2,
    level: 'Thông hiểu',
    sectionCode: 'a',
    topic: 'Quy luật trong một chu kì',
    question: 'Trong một chu kì, khi đi từ trái sang phải, bán kính nguyên tử nhìn chung',
    options: ['Tăng dần.', 'Giảm dần.', 'Không đổi.', 'Tăng rồi giảm.'],
    correctIndex: 1,
    explanation:
      'Trong một chu kì, khi đi từ trái sang phải theo chiều tăng dần của điện tích hạt nhân, bán kính nguyên tử nhìn chung giảm dần.',
  },
  {
    id: 3,
    level: 'Thông hiểu',
    sectionCode: 'a',
    topic: 'Quy luật trong một nhóm A',
    question: 'Trong một nhóm A, khi đi từ trên xuống dưới, bán kính nguyên tử nhìn chung',
    options: [
      'Giảm dần do điện tích hạt nhân tăng.',
      'Không đổi do số electron hóa trị không đổi.',
      'Tăng dần do số lớp electron tăng.',
      'Giảm dần do lực hút hạt nhân tăng.',
    ],
    correctIndex: 2,
    explanation:
      'Trong một nhóm A, khi đi từ trên xuống dưới, bán kính nguyên tử nhìn chung tăng dần do số lớp electron tăng lên.',
  },
  {
    id: 4,
    level: 'Thông hiểu',
    sectionCode: 'a',
    topic: 'Giải thích quy luật trong chu kì',
    question: 'Nguyên nhân chủ yếu khiến bán kính nguyên tử giảm trong một chu kì là',
    options: [
      'Số lớp electron tăng lên.',
      'Điện tích hạt nhân tăng, lực hút electron mạnh hơn trong khi số lớp electron không đổi.',
      'Số proton giảm dần.',
      'Số electron hóa trị giảm dần.',
    ],
    correctIndex: 1,
    explanation:
      'Trong cùng một chu kì, số lớp electron không đổi nhưng điện tích hạt nhân tăng dần dẫn đến lực hút giữa hạt nhân với các electron lớp ngoài cùng mạnh hơn, làm bán kính nguyên tử giảm.',
  },
  {
    id: 5,
    level: 'Thông hiểu',
    sectionCode: 'a',
    topic: 'So sánh bán kính trong chu kì 3',
    question:
      'Các nguyên tử Na, Mg, Al cùng thuộc chu kì 3. Thứ tự bán kính nguyên tử giảm dần là',
    options: ['Na > Mg > Al.', 'Al > Mg > Na.', 'Mg > Na > Al.', 'Na > Al > Mg.'],
    correctIndex: 0,
    explanation:
      'Na (Z = 11), Mg (Z = 12), Al (Z = 13) cùng thuộc chu kì 3. Đi từ trái sang phải theo chiều Z tăng, bán kính nguyên tử giảm dần: Na > Mg > Al.',
  },
  {
    id: 6,
    level: 'Thông hiểu',
    sectionCode: 'a',
    topic: 'So sánh bán kính trong nhóm IA',
    question:
      'Các nguyên tử Li, Na, K cùng thuộc nhóm IA. Thứ tự bán kính nguyên tử tăng dần là',
    options: ['K < Na < Li.', 'Li < Na < K.', 'Na < Li < K.', 'Li < K < Na.'],
    correctIndex: 1,
    explanation:
      'Li, Na, K cùng thuộc nhóm IA. Đi từ trên xuống dưới (Li → Na → K), số lớp electron tăng dần (2 → 3 → 4 lớp) nên bán kính nguyên tử tăng dần: Li < Na < K.',
  },
  {
    id: 7,
    level: 'Thông hiểu',
    sectionCode: 'a',
    topic: 'Đặc điểm nguyên tử cùng chu kì',
    question: 'Hai nguyên tử thuộc cùng một chu kì có cùng số',
    options: ['Proton.', 'Electron hóa trị.', 'Lớp electron.', 'Neutron.'],
    correctIndex: 2,
    explanation:
      'Chu kì là dãy các nguyên tố mà nguyên tử của chúng có cùng số lớp electron (Số thứ tự chu kì = Số lớp electron).',
  },
  {
    id: 8,
    level: 'Thông hiểu',
    sectionCode: 'a',
    topic: 'Đặc điểm nguyên tử cùng nhóm A',
    question: 'Hai nguyên tử thuộc cùng một nhóm A thường có cùng số',
    options: ['Lớp electron.', 'Proton.', 'Electron hóa trị.', 'Neutron.'],
    correctIndex: 2,
    explanation:
      'Nguyên tử các nguyên tố trong cùng một nhóm A có cùng số electron hóa trị (bằng số thứ tự của nhóm A, trừ He).',
  },

  // ==================== b) VẬN DỤNG (Câu 9 - 15) ====================
  {
    id: 9,
    level: 'Vận dụng',
    sectionCode: 'b',
    topic: 'So sánh bán kính theo số hiệu nguyên tử Z (Chu kì 2)',
    question:
      'Cho các nguyên tố O (Z = 8), F (Z = 9), N (Z = 7). Thứ tự bán kính nguyên tử giảm dần là',
    options: ['F > O > N.', 'N > O > F.', 'O > N > F.', 'N > F > O.'],
    correctIndex: 1,
    explanation:
      'N (Z = 7), O (Z = 8), F (Z = 9) đều có 2 lớp electron (cùng thuộc chu kì 2). Theo chiều tăng điện tích hạt nhân Z (7 < 8 < 9), bán kính nguyên tử giảm dần: N > O > F.',
  },
  {
    id: 10,
    level: 'Vận dụng',
    sectionCode: 'b',
    topic: 'So sánh bán kính theo số hiệu nguyên tử Z (Nhóm IIA)',
    question:
      'Cho các nguyên tố Be (Z = 4), Mg (Z = 12), Ca (Z = 20). Thứ tự bán kính nguyên tử giảm dần là',
    options: ['Be > Mg > Ca.', 'Mg > Ca > Be.', 'Ca > Mg > Be.', 'Ca > Be > Mg.'],
    correctIndex: 2,
    explanation:
      'Be (chu kì 2), Mg (chu kì 3), Ca (chu kì 4) cùng thuộc nhóm IIA. Từ trên xuống dưới bán kính tăng dần (Be < Mg < Ca), nên thứ tự bán kính giảm dần là: Ca > Mg > Be.',
  },
  {
    id: 11,
    level: 'Vận dụng',
    sectionCode: 'b',
    topic: 'Giải thích so sánh bán kính Na và Cl',
    question: 'Xét Na (Z = 11) và Cl (Z = 17). Nhận định nào đúng?',
    options: [
      'Na có bán kính nhỏ hơn Cl vì Na có ít electron hơn.',
      'Na có bán kính lớn hơn Cl vì chúng cùng chu kì và điện tích hạt nhân của Na nhỏ hơn.',
      'Na và Cl có bán kính bằng nhau vì có cùng số lớp electron.',
      'Cl có bán kính lớn hơn Na vì có nhiều proton hơn.',
    ],
    correctIndex: 1,
    explanation:
      'Na (Z = 11) và Cl (Z = 17) cùng thuộc chu kì 3 (đều có 3 lớp electron). Vì điện tích hạt nhân của Na nhỏ hơn Cl nên lực hút của hạt nhân với electron ngoài cùng ở Na yếu hơn, do đó Na có bán kính lớn hơn Cl.',
  },
  {
    id: 12,
    level: 'Vận dụng',
    sectionCode: 'b',
    topic: 'So sánh bán kính theo số lớp electron trong nhóm A',
    question:
      'Nguyên tử X có 3 lớp electron, nguyên tử Y có 4 lớp electron và cả hai thuộc cùng nhóm A. So sánh bán kính nguyên tử X và Y.',
    options: [
      'X > Y.',
      'X < Y.',
      'X = Y.',
      'Không thể dự đoán theo quy luật biến đổi trong nhóm.',
    ],
    correctIndex: 1,
    explanation:
      'Trong cùng một nhóm A, nguyên tử có số lớp electron nhiều hơn thì có bán kính lớn hơn. Vì X có 3 lớp electron còn Y có 4 lớp electron nên bán kính X < Y.',
  },
  {
    id: 13,
    level: 'Vận dụng',
    sectionCode: 'b',
    topic: 'So sánh bán kính ba nguyên tố X, Y, Z cùng chu kì',
    question:
      'Ba nguyên tố X, Y, Z thuộc cùng chu kì và có số hiệu nguyên tử lần lượt là 11, 13, 16. Thứ tự bán kính tăng dần là',
    options: ['X < Y < Z.', 'Z < Y < X.', 'Y < X < Z.', 'X < Z < Y.'],
    correctIndex: 1,
    explanation:
      'Trong cùng một chu kì (chu kì 3), điện tích hạt nhân tăng theo thứ tự X (Z = 11) < Y (Z = 13) < Z (Z = 16) nên bán kính giảm dần X > Y > Z. Vậy thứ tự bán kính tăng dần là: Z < Y < X.',
  },
  {
    id: 14,
    level: 'Vận dụng',
    sectionCode: 'b',
    topic: 'Giải thích bản chất biến đổi từ Li đến Ne',
    question: 'Giải thích vì sao bán kính nguyên tử giảm dần từ Li đến Ne.',
    options: [
      'Các nguyên tử mất dần lớp electron.',
      'Số lớp electron giảm dần.',
      'Điện tích hạt nhân tăng, trong khi electron được thêm vào cùng lớp chính nên lực hút hiệu dụng của hạt nhân tăng.',
      'Số proton giảm còn số electron không đổi.',
    ],
    correctIndex: 2,
    explanation:
      'Từ Li đến Ne (chu kì 2), điện tích hạt nhân tăng dần trong khi các electron mới chỉ được điền thêm vào cùng lớp electron thứ 2 (n = 2), làm lực hút hiệu dụng của hạt nhân lên lớp vỏ tăng nên bán kính giảm dần.',
  },
  {
    id: 15,
    level: 'Vận dụng',
    sectionCode: 'b',
    topic: 'Phản biện nhận định về bán kính của K và Na',
    question:
      'Một học sinh cho rằng: “K có bán kính nhỏ hơn Na vì K có điện tích hạt nhân lớn hơn”. Nhận định nào phù hợp nhất?',
    options: [
      'Đúng, vì điện tích hạt nhân luôn quyết định hoàn toàn bán kính.',
      'Sai, vì K có thêm một lớp electron so với Na nên bán kính K lớn hơn.',
      'Đúng, vì K có nhiều electron hơn.',
      'Sai, vì Na có nhiều lớp electron hơn K.',
    ],
    correctIndex: 1,
    explanation:
      'Na (chu kì 3, 3 lớp e) và K (chu kì 4, 4 lớp e) cùng thuộc nhóm IA. Khi đi từ Na đến K, việc tăng thêm một lớp electron khiến electron ngoài cùng ở xa hạt nhân hơn, làm bán kính K lớn hơn Na.',
  },

  // ==================== c) VẬN DỤNG CAO (Câu 16 - 21) ====================
  {
    id: 16,
    level: 'Vận dụng cao',
    sectionCode: 'c',
    topic: 'So sánh bán kính các nguyên tố khác chu kì và nhóm',
    question:
      'Nguyên tử X có Z = 12, nguyên tử Y có Z = 16 và nguyên tử T có Z = 19. Thứ tự bán kính nguyên tử giảm dần là',
    options: ['Y > X > T.', 'X > T > Y.', 'T > X > Y.', 'T > Y > X.'],
    correctIndex: 2,
    explanation:
      'X (Z = 12, Mg: chu kì 3, nhóm IIA), Y (Z = 16, S: chu kì 3, nhóm VIA), T (Z = 19, K: chu kì 4, nhóm IA). Trong chu kì 3: X > Y. Còn T ở đầu chu kì 4 (4 lớp e, nhóm IA) nên có bán kính lớn hơn X. Vậy thứ tự giảm dần là: T > X > Y.',
  },
  {
    id: 17,
    level: 'Vận dụng cao',
    sectionCode: 'c',
    topic: 'So sánh tổng quát hai nguyên tố nhóm IA và VIIA cùng chu kì',
    question:
      'Hai nguyên tố X và Y thuộc cùng chu kì. X nằm ở nhóm IA, Y nằm ở nhóm VIIA. Phát biểu nào đúng?',
    options: [
      'Bán kính Y lớn hơn X vì Y có nhiều electron hơn.',
      'Bán kính X lớn hơn Y do bán kính nhìn chung giảm từ trái sang phải trong một chu kì.',
      'Bán kính X bằng Y vì có cùng số lớp electron.',
      'Không thể so sánh vì chưa biết chu kì cụ thể.',
    ],
    correctIndex: 1,
    explanation:
      'Trong cùng một chu kì, X ở nhóm IA (đứng đầu chu kì, bên trái) còn Y ở nhóm VIIA (bên phải). Do bán kính nguyên tử giảm dần từ trái sang phải trong một chu kì nên bán kính của X luôn lớn hơn Y.',
  },
  {
    id: 18,
    level: 'Vận dụng cao',
    sectionCode: 'c',
    topic: 'Xác định nguyên tố dựa vào quy luật bán kính trong chu kì 3',
    question:
      'Một nguyên tố X thuộc chu kì 3 có bán kính nguyên tử lớn hơn Mg. X có thể là nguyên tố nào trong các nguyên tố sau?',
    options: ['Al.', 'Si.', 'Na.', 'Cl.'],
    correctIndex: 2,
    explanation:
      'Trong chu kì 3, bán kính nguyên tử giảm dần từ trái sang phải. Vì Na (Z = 11, nhóm IA) đứng trước Mg (Z = 12, nhóm IIA) nên Na có bán kính nguyên tử lớn hơn Mg (còn Al, Si, Cl đứng sau Mg nên có bán kính nhỏ hơn Mg).',
  },
  {
    id: 19,
    level: 'Vận dụng cao',
    sectionCode: 'c',
    topic: 'So sánh bán kính từ cấu hình electron lớp ngoài cùng',
    question:
      'Cho các nguyên tố có cấu hình electron lớp ngoài cùng: X: 2s¹; Y: 3s¹; Z: 3s²; T: 2p⁵. Thứ tự bán kính giảm dần nào phù hợp?',
    options: [
      'Y > Z > X > T.',
      'Y > Z > T > X.',
      'X > Y > Z > T.',
      'T > Z > Y > X.',
    ],
    correctIndex: 0,
    explanation:
      'X (2s¹: Li, chu kì 2, nhóm IA); Y (3s¹: Na, chu kì 3, nhóm IA); Z (3s²: Mg, chu kì 3, nhóm IIA); T (2p⁵: F, chu kì 2, nhóm VIIA). Cùng chu kì 3: Y > Z. Cùng chu kì 2: X > T. Vì Y, Z có 3 lớp e (nhóm IA, IIA) nên lớn hơn X, T (2 lớp e). Vậy thứ tự bán kính giảm dần là: Y > Z > X > T.',
  },
  {
    id: 20,
    level: 'Vận dụng cao',
    sectionCode: 'c',
    topic: 'Phản biện khoa học về các yếu tố quyết định bán kính nguyên tử',
    question:
      'Một học sinh kết luận: “Nguyên tử có nhiều electron hơn thì luôn có bán kính lớn hơn”. Cách phản biện nào chính xác nhất?',
    options: [
      'Đúng, vì electron quyết định toàn bộ kích thước nguyên tử.',
      'Sai, vì bán kính chỉ phụ thuộc số neutron.',
      'Sai, vì bán kính còn phụ thuộc số lớp electron và lực hút hiệu dụng của hạt nhân; trong cùng chu kì, nguyên tử nhiều electron hơn thường có bán kính nhỏ hơn.',
      'Đúng, miễn là các nguyên tử trung hòa.',
    ],
    correctIndex: 2,
    explanation:
      'Kết luận trên là sai. Kích thước nguyên tử phụ thuộc vào cả số lớp electron và lực hút hiệu dụng của hạt nhân; trong cùng một chu kì từ trái sang phải, nguyên tử có nhiều electron hơn nhưng số lớp electron không đổi và điện tích hạt nhân tăng mạnh nên bán kính nguyên tử lại nhỏ hơn.',
  },
  {
    id: 21,
    level: 'Vận dụng cao',
    sectionCode: 'c',
    topic: 'So sánh bán kính 4 nguyên tố kim loại kiềm và kiềm thổ (Chu kì 3 & 4)',
    question:
      'Xét các nguyên tố Na (Z = 11), Mg (Z = 12), K (Z = 19), Ca (Z = 20). Thứ tự bán kính giảm dần nào phù hợp với quy luật tuần hoàn?',
    options: [
      'Na > Mg > K > Ca.',
      'K > Ca > Na > Mg.',
      'Ca > K > Mg > Na.',
      'K > Na > Ca > Mg.',
    ],
    correctIndex: 1,
    explanation:
      'Ở chu kì 4 (4 lớp e): K (Z = 19, nhóm IA) > Ca (Z = 20, nhóm IIA). Ở chu kì 3 (3 lớp e): Na (Z = 11, nhóm IA) > Mg (Z = 12, nhóm IIA). Vì K, Ca có 4 lớp electron và thuộc nhóm kim loại đầu chu kì nên lớn hơn Na, Mg (3 lớp electron). Do đó thứ tự giảm dần là: K > Ca > Na > Mg (227 pm > 197 pm > 186 pm > 160 pm).',
  },
];

/**
 * PHẦN II. TRẮC NGHIỆM ĐÚNG / SAI (3,0 ĐIỂM)
 * - Gồm 3 câu (mỗi câu có 4 ý a, b, c, d)
 * - Điểm mỗi câu: Đúng 1 ý = 0,1đ; Đúng 2 ý = 0,25đ; Đúng 3 ý = 0,5đ; Đúng 4 ý = 1,0đ.
 */
export const TRUE_FALSE_QUESTIONS: TrueFalseQuestion[] = [
  {
    id: 1,
    title: 'Câu 1 (Đúng / Sai)',
    topic: 'Quy luật biến đổi bán kính nguyên tử trong bảng tuần hoàn',
    stem: '1. Xét các phát biểu về sự biến đổi bán kính nguyên tử trong bảng tuần hoàn:',
    statements: [
      {
        id: 'a',
        text: 'Trong một chu kì, bán kính nguyên tử nhìn chung giảm dần từ trái sang phải.',
        isTrue: true,
        explanation:
          'Đúng. Trong một chu kì, khi đi từ trái sang phải, điện tích hạt nhân tăng trong khi số lớp electron không đổi nên lực hút hạt nhân tăng, làm bán kính nguyên tử nhìn chung giảm dần.',
      },
      {
        id: 'b',
        text: 'Trong một nhóm A, bán kính nguyên tử nhìn chung giảm dần từ trên xuống dưới.',
        isTrue: false,
        explanation:
          'Sai. Trong một nhóm A, khi đi từ trên xuống dưới, số lớp electron tăng dần nên bán kính nguyên tử nhìn chung tăng dần.',
      },
      {
        id: 'c',
        text: 'Các nguyên tử thuộc cùng một chu kì có cùng số lớp electron.',
        isTrue: true,
        explanation:
          'Đúng. Các nguyên tố trong cùng một chu kì có số lớp electron bằng nhau và bằng số thứ tự của chu kì đó.',
      },
      {
        id: 'd',
        text: 'Điện tích hạt nhân tăng dần là một trong những nguyên nhân làm bán kính nguyên tử giảm trong một chu kì.',
        isTrue: true,
        explanation:
          'Đúng. Điện tích hạt nhân tăng làm lực hút giữa hạt nhân và các electron lớp ngoài cùng mạnh hơn (khi số lớp electron không đổi), khiến bán kính nguyên tử giảm.',
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
        text: 'Bán kính nguyên tử giảm dần theo thứ tự Na > Mg > Al.',
        isTrue: true,
        explanation:
          'Đúng. Na, Mg, Al cùng thuộc chu kì 3; theo chiều điện tích hạt nhân tăng dần (11 < 12 < 13), bán kính nguyên tử giảm dần: Na > Mg > Al.',
      },
      {
        id: 'b',
        text: 'Bán kính nguyên tử của K nhỏ hơn bán kính nguyên tử của Na.',
        isTrue: false,
        explanation:
          'Sai. Na (chu kì 3) và K (chu kì 4) cùng thuộc nhóm IA; đi từ trên xuống dưới bán kính tăng dần nên bán kính của K lớn hơn Na.',
      },
      {
        id: 'c',
        text: 'Nguyên tử K có nhiều lớp electron hơn nguyên tử Na.',
        isTrue: true,
        explanation:
          'Đúng. Nguyên tử K (Z = 19, chu kì 4) có 4 lớp electron, nhiều hơn nguyên tử Na (Z = 11, chu kì 3) có 3 lớp electron.',
      },
      {
        id: 'd',
        text: 'Bán kính nguyên tử của Mg lớn hơn bán kính nguyên tử của K.',
        isTrue: false,
        explanation:
          'Sai. Ta có K > Na > Mg nên bán kính nguyên tử của Mg (160 pm) nhỏ hơn bán kính nguyên tử của K (227 pm).',
      },
    ],
  },
  {
    id: 3,
    title: 'Câu 3 (Đúng / Sai)',
    topic: 'Vận dụng so sánh bán kính ba nguyên tố X (Z = 9), Y (Z = 12), Z (Z = 19)',
    stem: '3. Cho các nguyên tố X, Y, Z có số hiệu nguyên tử lần lượt là 9, 12, 19.',
    statements: [
      {
        id: 'a',
        text: 'Nguyên tử X có 2 lớp electron và thuộc chu kì 2.',
        isTrue: true,
        explanation:
          'Đúng. Nguyên tố X (Z = 9, Fluorine: 1s²2s²2p⁵) có 2 lớp electron nên thuộc chu kì 2.',
      },
      {
        id: 'b',
        text: 'Bán kính nguyên tử tăng dần theo thứ tự X < Y < Z.',
        isTrue: true,
        explanation:
          'Đúng. X (F, chu kì 2, nhóm VIIA, 2 lớp e) < Y (Mg, chu kì 3, nhóm IIA, 3 lớp e) < Z (K, chu kì 4, nhóm IA, 4 lớp e). Vậy thứ tự tăng dần là X < Y < Z.',
      },
      {
        id: 'c',
        text: 'Nguyên tử Y có bán kính lớn hơn nguyên tử Z vì Y có điện tích hạt nhân nhỏ hơn.',
        isTrue: false,
        explanation:
          'Sai. Nguyên tử Z (K, Z = 19) có 4 lớp electron và nằm ở nhóm IA nên có bán kính lớn hơn nguyên tử Y (Mg, Z = 12, có 3 lớp electron).',
      },
      {
        id: 'd',
        text: 'Nguyên tử Z có bán kính lớn nhất trong ba nguyên tử X, Y, Z.',
        isTrue: true,
        explanation:
          'Đúng. Vì thứ tự bán kính là X < Y < Z nên nguyên tử Z (K, 4 lớp electron, nhóm IA) có bán kính lớn nhất trong ba nguyên tử.',
      },
    ],
  },
];
