export interface QuizQuestion {
  id: number;
  level: 'Cơ bản (Dễ)' | 'Thông hiểu' | 'Vận dụng';
  topic: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface WorkedExample {
  id: number;
  title: string;
  level: string;
  problem: string;
  steps: string[];
  conclusion: string;
}

export const WORKED_EXAMPLES: WorkedExample[] = [
  {
    id: 1,
    title: 'Ví dụ 1: So sánh bán kính các nguyên tố trong cùng một chu kì',
    level: 'Cơ bản',
    problem:
      'Sắp xếp các nguyên tố sau theo chiều bán kính nguyên tử giảm dần: Na (Z = 11), Mg (Z = 12), Al (Z = 13), Si (Z = 14), Cl (Z = 17).',
    steps: [
      'Bước 1: Xác định vị trí: Các nguyên tố Na, Mg, Al, Si, Cl đều có 3 lớp electron nên cùng thuộc Chu kì 3.',
      'Bước 2: Áp dụng quy luật trong một chu kì: Từ trái sang phải theo chiều tăng dần của điện tích hạt nhân (Z tăng từ 11 đến 17), lực hút giữa hạt nhân và các electron lớp ngoài cùng tăng dần.',
      'Bước 3: Do số lớp electron không đổi (đều bằng 3 lớp) nhưng lực hút hạt nhân tăng nên bán kính nguyên tử giảm dần từ Na đến Cl.',
    ],
    conclusion: 'Thứ tự bán kính giảm dần: R(Na) > R(Mg) > R(Al) > R(Si) > R(Cl) (186 pm > 160 pm > 143 pm > 117 pm > 99 pm).',
  },
  {
    id: 2,
    title: 'Ví dụ 2: So sánh bán kính các nguyên tố trong cùng một nhóm A',
    level: 'Cơ bản',
    problem:
      'Sắp xếp các nguyên tố kim loại kiềm nhóm IA: Li (Z = 3), Na (Z = 11), K (Z = 19), Rb (Z = 37), Cs (Z = 55) theo chiều bán kính nguyên tử tăng dần.',
    steps: [
      'Bước 1: Xác định vị trí: Li (chu kì 2), Na (chu kì 3), K (chu kì 4), Rb (chu kì 5), Cs (chu kì 6) đều thuộc nhóm IA.',
      'Bước 2: Áp dụng quy luật trong một nhóm A: Khi đi từ trên xuống dưới, số lớp electron tăng dần (từ 2 lớp ở Li lên 6 lớp ở Cs).',
      'Bước 3: Sự tăng số lớp electron là yếu tố quyết định làm khoảng cách từ hạt nhân tới lớp electron ngoài cùng tăng lên.',
    ],
    conclusion: 'Thứ tự bán kính tăng dần: R(Li) < R(Na) < R(K) < R(Rb) < R(Cs) (152 pm < 186 pm < 227 pm < 248 pm < 265 pm).',
  },
  {
    id: 3,
    title: 'Ví dụ 3: So sánh bán kính các nguyên tố khác chu kì và khác nhóm A (Phương pháp bắc cầu)',
    level: 'Vận dụng',
    problem:
      'Cho các nguyên tố: F (Z = 9), O (Z = 8), Na (Z = 11), K (Z = 19). Hãy sắp xếp các nguyên tố theo chiều bán kính nguyên tử tăng dần.',
    steps: [
      'Bước 1: Xác định vị trí từng nguyên tố: O (chu kì 2, nhóm VIA), F (chu kì 2, nhóm VIIA), Na (chu kì 3, nhóm IA), K (chu kì 4, nhóm IA).',
      'Bước 2: So sánh nhóm nguyên tố ở chu kì 2: O và F cùng thuộc chu kì 2, vì Z(O) = 8 < Z(F) = 9 nên R(F) < R(O).',
      'Bước 3: So sánh nhóm nguyên tố ở nhóm IA: Na (chu kì 3) và K (chu kì 4) cùng thuộc nhóm IA nên R(Na) < R(K).',
      'Bước 4: Bắc cầu giữa chu kì 2 và chu kì 3: Na ở đầu chu kì 3 (3 lớp e, nhóm IA) có bán kính lớn hơn tất cả các nguyên tố ở chu kì 2 (chỉ có 2 lớp e), nên R(O) < R(Na).',
    ],
    conclusion: 'Thứ tự bán kính nguyên tử tăng dần: R(F) < R(O) < R(Na) < R(K) (64 pm < 66 pm < 186 pm < 227 pm).',
  },
];

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 1,
    level: 'Cơ bản (Dễ)',
    topic: 'Quy luật trong một chu kì',
    question:
      'Trong một chu kì của bảng tuần hoàn, khi đi từ trái sang phải theo chiều tăng dần của điện tích hạt nhân, bán kính nguyên tử của các nguyên tố nhóm A biến đổi như thế nào?',
    options: [
      'Tăng dần',
      'Giảm dần',
      'Không thay đổi',
      'Tăng rồi sau đó giảm dần',
    ],
    correctIndex: 1,
    explanation:
      'Trong một chu kì, từ trái sang phải theo chiều tăng điện tích hạt nhân (Z), số lớp electron không đổi nhưng lực hút của hạt nhân với electron lớp ngoài cùng tăng nên bán kính nguyên tử giảm dần.',
  },
  {
    id: 2,
    level: 'Cơ bản (Dễ)',
    topic: 'Quy luật trong một nhóm A',
    question:
      'Trong một nhóm A của bảng tuần hoàn, theo chiều từ trên xuống dưới (chiều tăng của điện tích hạt nhân), bán kính nguyên tử của các nguyên tố biến đổi như thế nào?',
    options: [
      'Giảm dần do điện tích hạt nhân tăng',
      'Tăng dần do số lớp electron tăng lên',
      'Không đổi vì có cùng số electron lớp ngoài cùng',
      'Giảm dần rồi tăng dần',
    ],
    correctIndex: 1,
    explanation:
      'Trong một nhóm A, đi từ trên xuống dưới, số lớp electron tăng dần (mỗi chu kì tăng thêm 1 lớp electron) nên bán kính nguyên tử tăng dần.',
  },
  {
    id: 3,
    level: 'Cơ bản (Dễ)',
    topic: 'Khái niệm bán kính nguyên tử',
    question:
      'Phát biểu nào sau đây nêu đúng khái niệm về bán kính nguyên tử theo chương trình Hóa học 10?',
    options: [
      'Là khoảng cách từ tâm hạt nhân đến lớp electron trong cùng của nguyên tử',
      'Là khoảng cách từ tâm hạt nhân đến electron ở lớp ngoài cùng của nguyên tử',
      'Là đường kính của hạt nhân nguyên tử tính bằng đơn vị picomet (pm)',
      'Là tổng khoảng cách của tất cả các lớp electron cộng lại',
    ],
    correctIndex: 1,
    explanation:
      'Bán kính nguyên tử là khoảng cách từ tâm hạt nhân đến lớp electron ngoài cùng. Thực nghiệm thường xác định bằng một nửa khoảng cách tâm giữa hai nguyên tử gần nhau nhất trong phân tử hoặc tinh thể.',
  },
  {
    id: 4,
    level: 'Cơ bản (Dễ)',
    topic: 'Vị trí nguyên tố trong bảng tuần hoàn',
    question:
      'Nguyên tố Aluminium (Nhôm, Al) có số hiệu nguyên tử Z = 13 và cấu hình electron là 1s² 2s² 2p⁶ 3s² 3p¹. Vị trí của Al trong bảng tuần hoàn là:',
    options: [
      'Ô số 13, chu kì 3, nhóm IIIA',
      'Ô số 13, chu kì 3, nhóm IIIB',
      'Ô số 13, chu kì 2, nhóm IIIA',
      'Ô số 3, chu kì 3, nhóm IA',
    ],
    correctIndex: 0,
    explanation:
      'Al có Z = 13 → ở ô số 13; có 3 lớp electron → thuộc chu kì 3; là nguyên tố p có 3 electron lớp ngoài cùng (3s² 3p¹) → thuộc nhóm IIIA.',
  },
  {
    id: 5,
    level: 'Thông hiểu',
    topic: 'Giải thích quy luật biến đổi',
    question:
      'Vì sao khi đi từ trái sang phải trong cùng một chu kì, bán kính nguyên tử lại giảm dần?',
    options: [
      'Vì số lớp electron giảm dần từ trái sang phải',
      'Vì số lớp electron không đổi nhưng điện tích hạt nhân tăng, làm lực hút giữa hạt nhân với các electron lớp ngoài cùng tăng lên',
      'Vì khối lượng nguyên tử giảm dần làm đám mây electron co lại',
      'Vì số neutron trong hạt nhân giảm dần',
    ],
    correctIndex: 1,
    explanation:
      'Các nguyên tố trong cùng một chu kì có cùng số lớp electron. Khi Z tăng từ trái sang phải, lực hút tĩnh điện giữa hạt nhân và electron lớp ngoài cùng mạnh hơn, kéo lớp vỏ lại gần hạt nhân hơn làm bán kính giảm.',
  },
  {
    id: 6,
    level: 'Thông hiểu',
    topic: 'Vị trí nguyên tố nhóm B',
    question:
      'Nguyên tố Iron (Sắt, Fe) có số hiệu nguyên tử Z = 26, cấu hình electron là [Ar] 3d⁶ 4s². Vị trí chính xác của Fe trong bảng tuần hoàn là:',
    options: [
      'Ô số 26, chu kì 4, nhóm IIA',
      'Ô số 26, chu kì 4, nhóm VIIIB',
      'Ô số 26, chu kì 4, nhóm VIB',
      'Ô số 26, chu kì 3, nhóm VIIIB',
    ],
    correctIndex: 1,
    explanation:
      'Fe có Z = 26 → ô số 26; có 4 lớp electron → chu kì 4; là nguyên tố họ d có tổng electron hóa trị (3d⁶ 4s²) là 6 + 2 = 8 electron → thuộc nhóm VIIIB (cột 8).',
  },
  {
    id: 7,
    level: 'Thông hiểu',
    topic: 'So sánh bán kính cùng chu kì',
    question:
      'Cho các nguyên tố thuộc chu kì 2: Li (Z = 3), Be (Z = 4), C (Z = 6), O (Z = 8), F (Z = 9). Nguyên tố nào có bán kính nguyên tử nhỏ nhất?',
    options: [
      'Lithium (Li)',
      'Beryllium (Be)',
      'Oxygen (O)',
      'Fluorine (F)',
    ],
    correctIndex: 3,
    explanation:
      'Trong chu kì 2, từ Li (Z = 3) đến F (Z = 9), bán kính nguyên tử giảm dần theo chiều tăng điện tích hạt nhân. Do đó F (Z = 9) có bán kính nhỏ nhất (64 pm).',
  },
  {
    id: 8,
    level: 'Thông hiểu',
    topic: 'So sánh bán kính cùng nhóm A',
    question:
      'Trong nhóm halogen (nhóm VIIA) gồm: F (Z = 9), Cl (Z = 17), Br (Z = 35), I (Z = 53), thứ tự bán kính nguyên tử đúng là:',
    options: [
      'R(F) > R(Cl) > R(Br) > R(I)',
      'R(F) < R(Cl) < R(Br) < R(I)',
      'R(Cl) < R(F) < R(Br) < R(I)',
      'R(I) < R(Br) < R(F) < R(Cl)',
    ],
    correctIndex: 1,
    explanation:
      'Các nguyên tố F, Cl, Br, I cùng thuộc nhóm VIIA. Đi từ trên xuống dưới (F → Cl → Br → I), số lớp electron tăng từ 2 lên 5 lớp nên bán kính nguyên tử tăng dần: R(F) < R(Cl) < R(Br) < R(I).',
  },
  {
    id: 9,
    level: 'Thông hiểu',
    topic: 'Cực trị bán kính trong một chu kì',
    question:
      'Không tính khí hiếm, trong mỗi chu kì (từ chu kì 2 đến chu kì 6), nguyên tố có bán kính nguyên tử lớn nhất luôn thuộc nhóm nào?',
    options: [
      'Nhóm VIIA (Halogen)',
      'Nhóm IIA (Kim loại kiềm thổ)',
      'Nhóm IA (Kim loại kiềm)',
      'Nhóm IVA',
    ],
    correctIndex: 2,
    explanation:
      'Trong một chu kì, bán kính nguyên tử giảm dần từ trái sang phải. Vì vậy nguyên tố đứng đầu chu kì (Kim loại kiềm - Nhóm IA) luôn có bán kính nguyên tử lớn nhất trong chu kì đó.',
  },
  {
    id: 10,
    level: 'Vận dụng',
    topic: 'So sánh bán kính khác chu kì và nhóm',
    question:
      'Cho các nguyên tố: Na (Z = 11), Mg (Z = 12), K (Z = 19). Thứ tự sắp xếp theo chiều bán kính nguyên tử tăng dần là:',
    options: [
      'Mg < Na < K',
      'Na < Mg < K',
      'K < Na < Mg',
      'Mg < K < Na',
    ],
    correctIndex: 0,
    explanation:
      'Na (Z = 11) và Mg (Z = 12) cùng thuộc chu kì 3 nên R(Mg) < R(Na). Na (chu kì 3) và K (chu kì 4) cùng thuộc nhóm IA nên R(Na) < R(K). Vậy R(Mg) < R(Na) < R(K) (160 pm < 186 pm < 227 pm).',
  },
  {
    id: 11,
    level: 'Vận dụng',
    topic: 'So sánh bán kính bằng phương pháp bắc cầu',
    question:
      'Cho 4 nguyên tố: F (Z = 9), Si (Z = 14), P (Z = 15), Cl (Z = 17). Dãy các nguyên tố được sắp xếp theo chiều bán kính nguyên tử giảm dần là:',
    options: [
      'Si > P > Cl > F',
      'F > Cl > P > Si',
      'Cl > P > Si > F',
      'Si > Cl > P > F',
    ],
    correctIndex: 0,
    explanation:
      'Si (Z=14), P (Z=15), Cl (Z=17) cùng thuộc chu kì 3 nên chiều giảm bán kính là R(Si) > R(P) > R(Cl). Còn Cl (chu kì 3) và F (chu kì 2) cùng thuộc nhóm VIIA nên R(Cl) > R(F). Vậy: Si > P > Cl > F.',
  },
  {
    id: 12,
    level: 'Vận dụng',
    topic: 'So sánh bán kính 4 nguyên tố bất kỳ',
    question:
      'Cho các nguyên tố: Li (Z = 3), N (Z = 7), O (Z = 8), Na (Z = 11). Thứ tự tăng dần bán kính nguyên tử của các nguyên tố trên là:',
    options: [
      'O < N < Li < Na',
      'Li < N < O < Na',
      'Na < Li < N < O',
      'O < Li < N < Na',
    ],
    correctIndex: 0,
    explanation:
      'Li (Z=3), N (Z=7), O (Z=8) cùng thuộc chu kì 2 nên R(O) < R(N) < R(Li). Li (chu kì 2) và Na (chu kì 3) cùng thuộc nhóm IA nên R(Li) < R(Na). Kết hợp lại: O < N < Li < Na.',
  },
  {
    id: 13,
    level: 'Vận dụng',
    topic: 'Liên hệ cấu hình electron và bán kính',
    question:
      'Cho ba nguyên tố X, Y, T có cấu hình electron lần lượt là: X: 1s² 2s² 2p⁶ 3s¹; Y: 1s² 2s² 2p⁶ 3s² 3p¹; T: 1s² 2s² 2p⁶ 3s² 3p⁵. Nhận xét nào sau đây đúng?',
    options: [
      'Bán kính nguyên tử: R(X) > R(Y) > R(T)',
      'Bán kính nguyên tử: R(T) > R(Y) > R(X)',
      'Cả 3 nguyên tố đều là kim loại thuộc nhóm A',
      'X, Y, T thuộc 3 chu kì khác nhau',
    ],
    correctIndex: 0,
    explanation:
      'X là Na (Z=11), Y là Al (Z=13), T là Cl (Z=17). Cả 3 đều có 3 lớp electron (cùng thuộc chu kì 3). Theo chiều Z tăng (11 < 13 < 17), bán kính giảm dần: R(X) > R(Y) > R(T).',
  },
  {
    id: 14,
    level: 'Vận dụng',
    topic: 'Liên hệ bán kính nguyên tử và tính kim loại - phi kim',
    question:
      'Khi bán kính nguyên tử của các nguyên tố nhóm IA tăng dần từ Li đến Cs, khả năng nhường electron lớp ngoài cùng và tính kim loại biến đổi như thế nào?',
    options: [
      'Bán kính càng lớn, electron ngoài cùng liên kết với hạt nhân càng yếu nên càng dễ nhường electron, tính kim loại tăng dần',
      'Bán kính càng lớn, lực hút hạt nhân càng mạnh nên càng khó nhường electron, tính kim loại giảm dần',
      'Bán kính tăng nhưng tính kim loại không đổi vì đều có 1 electron lớp ngoài cùng',
      'Bán kính tăng làm tính phi kim tăng dần từ Li đến Cs',
    ],
    correctIndex: 0,
    explanation:
      'Trong nhóm IA từ Li đến Cs, bán kính nguyên tử tăng dần làm lực hút giữa hạt nhân với electron hóa trị 1s/ns¹ giảm, nguyên tử càng dễ nhường electron nên tính kim loại tăng dần.',
  },
  {
    id: 15,
    level: 'Vận dụng',
    topic: 'Xác định vị trí và so sánh tổng hợp',
    question:
      'Nguyên tố R có cấu hình electron lớp ngoài cùng là 4s¹ (biết các phân lớp bên trong đã bão hòa với Z = 19). So sánh bán kính của R với Ca (Z = 20), Na (Z = 11) và Mg (Z = 12):',
    options: [
      'R(Mg) < R(Na) < R(Ca) < R(R)',
      'R(Mg) < R(Ca) < R(Na) < R(R)',
      'R(Ca) < R(R) < R(Mg) < R(Na)',
      'R(R) > R(Ca) và R(R) > R(Na) > R(Mg)',
    ],
    correctIndex: 3,
    explanation:
      'R là Kali (K, Z = 19, chu kì 4, nhóm IA, bán kính 227 pm). K và Ca (Z = 20, 197 pm) cùng chu kì 4 nên R(K) > R(Ca). K và Na (Z = 11, 186 pm) cùng nhóm IA nên R(K) > R(Na). Na và Mg (Z = 12, 160 pm) cùng chu kì 3 nên R(Na) > R(Mg). Do đó R(K) lớn nhất, và R(K) > R(Na) > R(Mg).',
  },
  {
    id: 16,
    level: 'Vận dụng',
    topic: 'So sánh bán kính nguyên tử và ion',
    question:
      'Khi nguyên tử kim loại Natri (Na, Z = 11) nhường 1 electron lớp ngoài cùng để tạo thành cation Na⁺, bán kính của ion Na⁺ so với nguyên tử Na thay đổi như thế nào?',
    options: [
      'R(Na⁺) < R(Na) vì ion Na⁺ giảm đi 1 lớp electron và lực hút hạt nhân lên các electron còn lại mạnh hơn',
      'R(Na⁺) > R(Na) vì ion mang điện tích dương nên đẩy các lớp vỏ ra xa',
      'R(Na⁺) = R(Na) vì điện tích hạt nhân Z = 11 không thay đổi',
      'R(Na⁺) lớn gấp đôi R(Na)',
    ],
    correctIndex: 0,
    explanation:
      'Nguyên tử Na (2, 8, 1) có 3 lớp electron (R = 186 pm). Khi nhường 1e tạo Na⁺ (2, 8), số lớp electron giảm còn 2 lớp trong khi điện tích hạt nhân vẫn là +11, nên bán kính giảm mạnh xuống còn 102 pm: R(Na⁺) < R(Na).',
  },
  {
    id: 17,
    level: 'Vận dụng',
    topic: 'Bán kính dãy ion đẳng electron',
    question:
      'Cho các hạt vi mô có cùng cấu hình electron 1s² 2s² 2p⁶ (đều có 10 electron): O²⁻ (Z = 8), F⁻ (Z = 9), Na⁺ (Z = 11), Mg²⁺ (Z = 12). Thứ tự bán kính giảm dần đúng là:',
    options: [
      'Mg²⁺ > Na⁺ > F⁻ > O²⁻',
      'O²⁻ > F⁻ > Na⁺ > Mg²⁺',
      'Na⁺ > Mg²⁺ > O²⁻ > F⁻',
      'F⁻ > O²⁻ > Na⁺ > Mg²⁺',
    ],
    correctIndex: 1,
    explanation:
      'Với các ion có cùng số electron (10e, 2 lớp e), hạt nào có điện tích hạt nhân (+Z) càng lớn thì hút lớp vỏ electron càng mạnh làm bán kính càng nhỏ. Do Z tăng: 8 < 9 < 11 < 12 nên bán kính giảm dần: R(O²⁻) > R(F⁻) > R(Na⁺) > R(Mg²⁺).',
  },
  {
    id: 18,
    level: 'Thông hiểu',
    topic: 'Liên hệ bán kính với độ âm điện & tính kim loại - phi kim',
    question:
      'Trong một chu kì, khi đi từ trái sang phải theo chiều tăng điện tích hạt nhân, sự biến đổi nào sau đây là ĐÚNG khi liên hệ giữa bán kính nguyên tử, độ âm điện và tính kim loại - phi kim?',
    options: [
      'Bán kính nguyên tử giảm dần → Độ âm điện tăng dần → Tính kim loại giảm dần, tính phi kim tăng dần',
      'Bán kính nguyên tử giảm dần → Độ âm điện giảm dần → Tính kim loại tăng dần, tính phi kim giảm dần',
      'Bán kính nguyên tử tăng dần → Độ âm điện tăng dần → Tính phi kim tăng dần',
      'Bán kính nguyên tử giảm dần → Độ âm điện không đổi → Tính kim loại tăng dần',
    ],
    correctIndex: 0,
    explanation:
      'Trong một chu kì (trái → phải): Bán kính nguyên tử giảm dần và điện tích hạt nhân tăng làm khả năng hút electron (độ âm điện) tăng dần → nguyên tử càng khó nhường e (tính kim loại giảm) và càng dễ nhận e (tính phi kim tăng).',
  },
];
