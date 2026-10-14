import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import {
  QUIZ_QUESTIONS,
  TRUE_FALSE_QUESTIONS,
  QuizQuestion,
  TrueFalseQuestion,
  QuizDifficultyLevel,
  getTrueFalseQuestionScore,
} from '../data/questions';
import {
  UserCheck,
  AlertCircle,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Award,
  LogOut,
  ClipboardCheck,
  Trophy,
  Download,
  Printer,
  Users,
  BarChart2,
  Trash2,
  Sparkles,
  ListChecks,
  CheckSquare,
  Send,
  HelpCircle,
  FileCheck2,
} from 'lucide-react';

export interface StudentProfile {
  fullName: string;
  className: string;
  rollNumber: string;
}

export interface StudentAttemptRecord {
  id: string;
  fullName: string;
  className: string;
  rollNumber: string;
  correctCount: number;
  totalQuestions: number;
  mcScore?: string;
  tfScore?: string;
  scoreOutOf10: string;
  gradeLabel: string;
  completedAt: string;
}

interface StudentQuizSectionProps {
  student: StudentProfile | null;
  onLoginStudent: (profile: StudentProfile) => void;
  onLogoutStudent: () => void;
}

type QuizFilterTab = 'ALL' | 'PART_1' | 'PART_2' | QuizDifficultyLevel;
type TrueFalseAnswerMap = Record<number, Partial<Record<'a' | 'b' | 'c' | 'd', boolean>>>;

const STORAGE_KEY_HISTORY = 'hoa10_student_quiz_history_v3';

function getGradeLabel(score: number): string {
  if (score >= 9.0) return 'Xuất sắc';
  if (score >= 8.0) return 'Giỏi';
  if (score >= 6.5) return 'Khá';
  if (score >= 5.0) return 'Đạt';
  return 'Cần cố gắng';
}

function formatScore(val: number): string {
  const rounded = Math.round(val * 100) / 100;
  if (Number.isInteger(rounded * 10)) {
    return rounded.toFixed(1);
  }
  return rounded.toFixed(2);
}

const DEMO_RECORDS: StudentAttemptRecord[] = [
  {
    id: 'demo-1',
    rollNumber: '07',
    fullName: 'Trần Minh Châu',
    className: '10A1',
    correctCount: 10,
    totalQuestions: 10,
    mcScore: '8.0',
    tfScore: '2.0',
    scoreOutOf10: '10.0',
    gradeLabel: 'Xuất sắc',
    completedAt: '08:15 hôm nay',
  },
  {
    id: 'demo-2',
    rollNumber: '14',
    fullName: 'Nguyễn Hoàng Hải',
    className: '10A1',
    correctCount: 9,
    totalQuestions: 10,
    mcScore: '7.0',
    tfScore: '1.75',
    scoreOutOf10: '8.75',
    gradeLabel: 'Giỏi',
    completedAt: '08:12 hôm nay',
  },
  {
    id: 'demo-3',
    rollNumber: '22',
    fullName: 'Lê Thu Phương',
    className: '10A1',
    correctCount: 9,
    totalQuestions: 10,
    mcScore: '7.0',
    tfScore: '1.5',
    scoreOutOf10: '8.5',
    gradeLabel: 'Giỏi',
    completedAt: '08:10 hôm nay',
  },
  {
    id: 'demo-4',
    rollNumber: '09',
    fullName: 'Đặng Quốc Khánh',
    className: '10A1',
    correctCount: 8,
    totalQuestions: 10,
    mcScore: '6.0',
    tfScore: '1.5',
    scoreOutOf10: '7.5',
    gradeLabel: 'Khá',
    completedAt: '08:08 hôm nay',
  },
  {
    id: 'demo-5',
    rollNumber: '31',
    fullName: 'Vũ Đức Thịnh',
    className: '10A1',
    correctCount: 8,
    totalQuestions: 10,
    mcScore: '6.0',
    tfScore: '1.25',
    scoreOutOf10: '7.25',
    gradeLabel: 'Khá',
    completedAt: '08:06 hôm nay',
  },
  {
    id: 'demo-6',
    rollNumber: '05',
    fullName: 'Hoàng Gia Bảo',
    className: '10A2',
    correctCount: 10,
    totalQuestions: 10,
    mcScore: '8.0',
    tfScore: '1.5',
    scoreOutOf10: '9.5',
    gradeLabel: 'Xuất sắc',
    completedAt: '08:14 hôm nay',
  },
  {
    id: 'demo-7',
    rollNumber: '18',
    fullName: 'Phạm Quốc Tuấn',
    className: '10A2',
    correctCount: 9,
    totalQuestions: 10,
    mcScore: '7.0',
    tfScore: '1.25',
    scoreOutOf10: '8.25',
    gradeLabel: 'Giỏi',
    completedAt: '08:05 hôm nay',
  },
  {
    id: 'demo-8',
    rollNumber: '12',
    fullName: 'Bùi Thanh Hà',
    className: '10A2',
    correctCount: 8,
    totalQuestions: 10,
    mcScore: '6.0',
    tfScore: '1.5',
    scoreOutOf10: '7.5',
    gradeLabel: 'Khá',
    completedAt: '08:02 hôm nay',
  },
];

export const StudentQuizSection: React.FC<StudentQuizSectionProps> = ({
  student,
  onLoginStudent,
  onLogoutStudent,
}) => {
  // Login Form state
  const [fullNameInput, setFullNameInput] = useState('');
  const [classNameInput, setClassNameInput] = useState('');
  const [rollNumberInput, setRollNumberInput] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);

  // Quiz state: Part I (Multiple Choice) & Part II (True/False)
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [tfAnswers, setTfAnswers] = useState<TrueFalseAnswerMap>({});
  
  // NEW CORE REQUIREMENT: Only show answers & explanations after submitting the quiz
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [showConfirmSubmitModal, setShowConfirmSubmitModal] = useState<boolean>(false);

  const [activeFilter, setActiveFilter] = useState<QuizFilterTab>('ALL');
  const [attemptHistory, setAttemptHistory] = useState<StudentAttemptRecord[]>(DEMO_RECORDS);
  const [savedCurrentAttempt, setSavedCurrentAttempt] = useState(false);
  const [leaderboardClassFilter, setLeaderboardClassFilter] = useState<string>('ALL');

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_HISTORY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setAttemptHistory(parsed);
        }
      }
    } catch {
      // Ignore storage errors
    }
  }, []);

  const saveHistoryToStorage = (records: StudentAttemptRecord[]) => {
    setAttemptHistory(records);
    try {
      localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(records));
    } catch {
      // Ignore storage error
    }
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = fullNameInput.trim();
    const trimmedClass = classNameInput.trim();
    const trimmedRoll = rollNumberInput.trim();
    const missingFields: string[] = [];

    if (!trimmedName) missingFields.push('Họ và tên');
    if (!trimmedClass) missingFields.push('Lớp');
    if (!trimmedRoll) missingFields.push('Số thứ tự');

    if (missingFields.length > 0) {
      setLoginError(
        `Không thể vào làm bài! Bạn chưa nhập: ${missingFields.join(', ')}. Vui lòng điền đầy đủ thông tin.`
      );
      return;
    }

    setLoginError(null);
    onLoginStudent({
      fullName: trimmedName,
      className: trimmedClass,
      rollNumber: trimmedRoll,
    });
  };

  const triggerCelebrationFireworks = useCallback(() => {
    const sgkColors = ['#38bdf8', '#f472b6', '#fbbf24', '#34d399', '#818cf8'];
    confetti({
      particleCount: 90,
      spread: 80,
      origin: { y: 0.6 },
      colors: sgkColors,
    });
    setTimeout(() => {
      confetti({
        particleCount: 60,
        angle: 60,
        spread: 55,
        origin: { x: 0.08, y: 0.65 },
        colors: sgkColors,
      });
      confetti({
        particleCount: 60,
        angle: 120,
        spread: 55,
        origin: { x: 0.92, y: 0.65 },
        colors: sgkColors,
      });
    }, 220);
    setTimeout(() => {
      confetti({
        particleCount: 75,
        spread: 100,
        startVelocity: 38,
        origin: { x: 0.5, y: 0.45 },
        colors: sgkColors,
      });
    }, 480);
  }, []);

  // Check if true/false question is complete (all 4 statements a, b, c, d answered)
  const isTrueFalseQuestionComplete = (
    qId: number,
    map: TrueFalseAnswerMap = tfAnswers
  ): boolean => {
    const entry = map[qId];
    if (!entry) return false;
    return (
      entry.a !== undefined &&
      entry.b !== undefined &&
      entry.c !== undefined &&
      entry.d !== undefined
    );
  };

  const countCompletedTrueFalseQuestions = (map: TrueFalseAnswerMap = tfAnswers): number => {
    return TRUE_FALSE_QUESTIONS.filter((tf) => isTrueFalseQuestionComplete(tf.id, map)).length;
  };

  // Student selects an option for Part I (can freely change answer before submitting)
  const handleSelectOption = (q: QuizQuestion, optionIdx: number) => {
    if (isSubmitted) return; // Locked after submitting
    setSelectedAnswers((prev) => ({
      ...prev,
      [q.id]: optionIdx,
    }));
  };

  // Student selects True or False for a statement in Part II (can freely change answer before submitting)
  const handleSelectTrueFalseStatement = (
    tfQuestion: TrueFalseQuestion,
    statementId: 'a' | 'b' | 'c' | 'd',
    choice: boolean
  ) => {
    if (isSubmitted) return; // Locked after submitting
    setTfAnswers((prev) => {
      const currentEntry = prev[tfQuestion.id] || {};
      return {
        ...prev,
        [tfQuestion.id]: {
          ...currentEntry,
          [statementId]: choice,
        },
      };
    });
  };

  // ==================== SCORING CALCULATIONS ====================
  // Phần I: 8.0 điểm (8 câu x 1.0 điểm/câu)
  const totalMcQuestions = QUIZ_QUESTIONS.length;
  const answeredMcCount = Object.keys(selectedAnswers).length;
  const correctMcCount = QUIZ_QUESTIONS.reduce((acc, q) => {
    return acc + (selectedAnswers[q.id] === q.correctIndex ? 1 : 0);
  }, 0);
  const rawMcPoints = Math.min(8.0, Math.round(correctMcCount * 1.0 * 100) / 100);

  // Phần II: Đúng / Sai 2,0 điểm (2 câu, mỗi câu 1,0 điểm: 1 ý = 0,1đ; 2 ý = 0,25đ; 3 ý = 0,5đ; 4 ý = 1,0đ)
  const totalTfQuestions = TRUE_FALSE_QUESTIONS.length;
  const answeredTfCount = countCompletedTrueFalseQuestions(tfAnswers);

  const tfQuestionResults = useMemo(() => {
    return TRUE_FALSE_QUESTIONS.map((tf) => {
      const entry = tfAnswers[tf.id] || {};
      const isComplete =
        entry.a !== undefined &&
        entry.b !== undefined &&
        entry.c !== undefined &&
        entry.d !== undefined;
      const selectedCount = (['a', 'b', 'c', 'd'] as const).filter(
        (k) => entry[k] !== undefined
      ).length;
      const correctSubCount = tf.statements.filter((st) => entry[st.id] === st.isTrue).length;
      const points = isComplete ? getTrueFalseQuestionScore(correctSubCount) : 0;
      return {
        id: tf.id,
        isComplete,
        selectedCount,
        correctSubCount,
        points,
      };
    });
  }, [tfAnswers]);

  const rawTfPoints = useMemo(() => {
    const sum = tfQuestionResults.reduce((acc, item) => acc + item.points, 0);
    return Math.min(2.0, Math.round(sum * 100) / 100);
  }, [tfQuestionResults]);

  const perfectTfCount = tfQuestionResults.filter(
    (item) => item.isComplete && item.correctSubCount === 4
  ).length;

  const totalCorrectStatementsInTf = tfQuestionResults.reduce(
    (acc, item) => acc + item.correctSubCount,
    0
  );

  // Tổng hợp toàn bài (Thang điểm 10 = Phần I (8đ) + Phần II (2đ))
  const totalQuestions = totalMcQuestions + totalTfQuestions;
  const answeredCount = answeredMcCount + answeredTfCount;
  const progressPercent = Math.round((answeredCount / totalQuestions) * 100);
  const correctCount = correctMcCount + perfectTfCount;
  const numericScore = Math.min(10.0, Math.round((rawMcPoints + rawTfPoints) * 100) / 100);
  const mcScoreStr = formatScore(rawMcPoints);
  const tfScoreStr = formatScore(rawTfPoints);
  const scoreOutOf10 = formatScore(numericScore);
  const currentGradeLabel = getGradeLabel(numericScore);

  // Action: Submit Quiz
  const handleConfirmSubmit = () => {
    setShowConfirmSubmitModal(false);
    setIsSubmitted(true);
    triggerCelebrationFireworks();
    // Scroll to the results banner smoothly
    setTimeout(() => {
      const bannerEl = document.getElementById('quiz-results-banner');
      if (bannerEl) {
        bannerEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  };

  // Reset quiz to retake test
  const handleResetQuiz = () => {
    setSelectedAnswers({});
    setTfAnswers({});
    setIsSubmitted(false);
    setShowConfirmSubmitModal(false);
    setSavedCurrentAttempt(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Skill diagnostic breakdown for Student Report Card
  const skillBreakdown = useMemo(() => {
    const groups = [
      {
        title: '1. Phần I - a) Thông hiểu (Câu 1 - 4)',
        correct: QUIZ_QUESTIONS.filter(
          (q) => q.sectionCode === 'a' && selectedAnswers[q.id] === q.correctIndex
        ).length,
        total: QUIZ_QUESTIONS.filter((q) => q.sectionCode === 'a').length,
        unit: 'câu',
      },
      {
        title: '2. Phần I - b) Vận dụng (Câu 5 - 8)',
        correct: QUIZ_QUESTIONS.filter(
          (q) => q.sectionCode === 'b' && selectedAnswers[q.id] === q.correctIndex
        ).length,
        total: QUIZ_QUESTIONS.filter((q) => q.sectionCode === 'b').length,
        unit: 'câu',
      },
      {
        title: '3. Phần II - Trắc nghiệm Đúng / Sai (2 câu)',
        correct: totalCorrectStatementsInTf,
        total: TRUE_FALSE_QUESTIONS.length * 4,
        unit: 'ý',
      },
    ];
    return groups.map((g) => ({
      ...g,
      pct: g.total > 0 ? Math.round((g.correct / g.total) * 100) : 0,
    }));
  }, [selectedAnswers, totalCorrectStatementsInTf]);

  const handleSaveScore = () => {
    if (!student || savedCurrentAttempt) return;
    const now = new Date();
    const formattedTime =
      now.toLocaleTimeString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit',
      }) +
      ' - ' +
      now.toLocaleDateString('vi-VN');

    const newRecord: StudentAttemptRecord = {
      id: `${Date.now()}`,
      fullName: student.fullName,
      className: student.className,
      rollNumber: student.rollNumber,
      correctCount,
      totalQuestions,
      mcScore: mcScoreStr,
      tfScore: tfScoreStr,
      scoreOutOf10,
      gradeLabel: currentGradeLabel,
      completedAt: formattedTime,
    };

    const updated = [newRecord, ...attemptHistory].slice(0, 30);
    saveHistoryToStorage(updated);
    setSavedCurrentAttempt(true);
    setLeaderboardClassFilter(student.className.toUpperCase());
    triggerCelebrationFireworks();
  };

  const handleLoadDemoRecords = () => {
    const existingIds = new Set(attemptHistory.map((r) => r.id));
    const merged = [
      ...attemptHistory,
      ...DEMO_RECORDS.filter((d) => !existingIds.has(d.id)),
    ];
    saveHistoryToStorage(merged);
  };

  const handleClearHistory = () => {
    saveHistoryToStorage([]);
  };

  const handleExportCSV = () => {
    if (attemptHistory.length === 0) return;
    const headers = [
      'STT',
      'Họ tên học sinh',
      'Lớp',
      'Điểm Trắc nghiệm (8đ)',
      'Điểm Đúng/Sai (2đ)',
      'Tổng điểm (Thang 10)',
      'Xếp loại',
      'Thời gian nộp bài',
    ];
    const rows = attemptHistory.map((item) => [
      `"${item.rollNumber.replace(/"/g, '""')}"`,
      `"${item.fullName.replace(/"/g, '""')}"`,
      `"${item.className.replace(/"/g, '""')}"`,
      item.mcScore ?? '-',
      item.tfScore ?? '-',
      item.scoreOutOf10,
      `"${(item.gradeLabel || getGradeLabel(Number(item.scoreOutOf10))).replace(/"/g, '""')}"`,
      `"${item.completedAt.replace(/"/g, '""')}"`,
    ]);
    const csvContent =
      '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'Bang_Diem_Hoa_10_Ban_Kinh_Nguyen_Tu.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const teacherStats = useMemo(() => {
    if (attemptHistory.length === 0) {
      return { count: 0, avgScore: '0.0', maxScore: '0.0', highAchievers: 0 };
    }
    const scores = attemptHistory.map((r) => parseFloat(r.scoreOutOf10) || 0);
    const sum = scores.reduce((a, b) => a + b, 0);
    const avg = (sum / scores.length).toFixed(1);
    const max = Math.max(...scores).toFixed(1);
    const highAchievers = scores.filter((s) => s >= 8.0).length;
    return {
      count: attemptHistory.length,
      avgScore: avg,
      maxScore: max,
      highAchievers,
    };
  }, [attemptHistory]);

  const availableClasses = useMemo(() => {
    const classSet = new Set<string>();
    attemptHistory.forEach((item) => {
      if (item.className.trim()) {
        classSet.add(item.className.trim().toUpperCase());
      }
    });
    return Array.from(classSet).sort();
  }, [attemptHistory]);

  const top5Leaderboard = useMemo(() => {
    const filtered =
      leaderboardClassFilter === 'ALL'
        ? attemptHistory
        : attemptHistory.filter(
            (item) => item.className.trim().toUpperCase() === leaderboardClassFilter
          );
    return [...filtered]
      .sort((a, b) => {
        const diff = (parseFloat(b.scoreOutOf10) || 0) - (parseFloat(a.scoreOutOf10) || 0);
        if (diff !== 0) return diff;
        return b.correctCount - a.correctCount;
      })
      .slice(0, 5);
  }, [attemptHistory, leaderboardClassFilter]);

  const showPart1 =
    activeFilter === 'ALL' ||
    activeFilter === 'PART_1' ||
    activeFilter === 'Thông hiểu' ||
    activeFilter === 'Vận dụng' ||
    activeFilter === 'Vận dụng cao';
  const showPart2 = activeFilter === 'ALL' || activeFilter === 'PART_2';

  const displayedMcQuestions: QuizQuestion[] = useMemo(() => {
    if (!showPart1) return [];
    if (activeFilter === 'ALL' || activeFilter === 'PART_1') {
      return QUIZ_QUESTIONS;
    }
    return QUIZ_QUESTIONS.filter((q) => q.level === activeFilter);
  }, [activeFilter, showPart1]);

  const thongHieuCount = QUIZ_QUESTIONS.filter((q) => q.level === 'Thông hiểu').length;
  const vanDungCount = QUIZ_QUESTIONS.filter((q) => q.level === 'Vận dụng').length;

  return (
    <div className="space-y-6">
      {!student ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-6 space-y-5">
              <div className="inline-flex items-center gap-2 text-xs font-extrabold text-sky-700">
                <Trophy className="w-4 h-4" />
                <span>
                  Đề Kiểm Tra Hóa 10 Chuẩn SGK • Thang Điểm 10 (8,0đ Trắc nghiệm + 2,0đ Đúng/Sai)
                </span>
              </div>
              <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-slate-900 leading-tight">
                Đăng nhập tài khoản học sinh để làm bài
              </h2>
              <p className="text-sm text-slate-600 leading-relaxed">
                Đề kiểm tra gồm <strong>Phần I: Trắc nghiệm 4 lựa chọn (8,0đ - 1,0đ/câu)</strong> và{' '}
                <strong>Phần II: Đúng / Sai (2,0đ - 2 câu)</strong>.
                <br />
                <span className="text-sky-700 font-semibold mt-1 inline-block">
                  * Sau khi hoàn thành bài làm và bấm <strong>&ldquo;Nộp bài&rdquo;</strong>, hệ thống sẽ tính điểm tự động, hiển thị kết quả và giải thích chi tiết tại sao câu đó đúng.
                </span>
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3.5 rounded-xl bg-sky-50/80 border border-sky-200 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-display text-base font-extrabold text-sky-900">
                      I. Trắc nghiệm ({totalMcQuestions} câu)
                    </span>
                    <span className="font-mono text-xs font-extrabold px-2 py-0.5 rounded bg-sky-200/80 text-sky-950">
                      8,0 điểm
                    </span>
                  </div>
                  <div className="text-xs text-sky-800 leading-relaxed">
                    Mỗi câu đúng <strong>1,0 điểm</strong>: gồm {thongHieuCount} câu Thông hiểu và {vanDungCount} câu Vận dụng.
                  </div>
                </div>
                <div className="p-3.5 rounded-xl bg-amber-50/80 border border-amber-200 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-display text-base font-extrabold text-amber-900">
                      II. Đúng / Sai ({totalTfQuestions} câu)
                    </span>
                    <span className="font-mono text-xs font-extrabold px-2 py-0.5 rounded bg-amber-200/80 text-amber-950">
                      2,0 điểm
                    </span>
                  </div>
                  <div className="text-xs text-amber-800 leading-relaxed">
                    Mỗi câu gồm 4 ý a, b, c, d: Đúng 1 ý = <strong>0,1đ</strong>; 2 ý = <strong>0,25đ</strong>; 3 ý = <strong>0,5đ</strong>; 4 ý = <strong>1,0đ</strong>.
                  </div>
                </div>
              </div>
            </div>

            {/* Student Login Form */}
            <div className="lg:col-span-6">
              <form
                onSubmit={handleLoginSubmit}
                noValidate
                className="bg-gradient-to-br from-slate-50 to-sky-50/40 border border-slate-200 rounded-2xl p-6 space-y-4 shadow-xs"
              >
                <div className="flex items-center gap-2.5 border-b border-slate-200 pb-3.5">
                  <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center">
                    <UserCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-display text-lg font-extrabold text-slate-900">
                      Thông tin học sinh
                    </h3>
                    <p className="text-xs text-slate-500">
                      Bắt buộc điền đủ 3 mục để ghi nhận điểm
                    </p>
                  </div>
                </div>
                {loginError && (
                  <div
                    role="alert"
                    className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-900 font-semibold flex items-start gap-2.5"
                  >
                    <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                    <span>{loginError}</span>
                  </div>
                )}
                <div className="space-y-1.5">
                  <label
                    htmlFor="student-fullname"
                    className="block text-xs font-bold text-slate-800"
                  >
                    1. Họ và tên học sinh <span className="text-red-600">*</span>
                  </label>
                  <input
                    id="student-fullname"
                    type="text"
                    value={fullNameInput}
                    onChange={(e) => {
                      setFullNameInput(e.target.value);
                      if (loginError) setLoginError(null);
                    }}
                    placeholder="Ví dụ: Nguyễn Văn An"
                    className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-900 transition-colors"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label
                      htmlFor="student-class"
                      className="block text-xs font-bold text-slate-800"
                    >
                      2. Lớp <span className="text-red-600">*</span>
                    </label>
                    <input
                      id="student-class"
                      type="text"
                      value={classNameInput}
                      onChange={(e) => {
                        setClassNameInput(e.target.value);
                        if (loginError) setLoginError(null);
                      }}
                      placeholder="Ví dụ: 10A1"
                      className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-900 transition-colors"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label
                      htmlFor="student-roll"
                      className="block text-xs font-bold text-slate-800"
                    >
                      3. Số thứ tự (STT) <span className="text-red-600">*</span>
                    </label>
                    <input
                      id="student-roll"
                      type="text"
                      value={rollNumberInput}
                      onChange={(e) => {
                        setRollNumberInput(e.target.value);
                        if (loginError) setLoginError(null);
                      }}
                      placeholder="Ví dụ: 15"
                      className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-900 transition-colors font-mono"
                    />
                  </div>
                </div>
                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full py-3 px-4 bg-gradient-to-r from-slate-900 to-indigo-950 hover:from-slate-800 hover:to-indigo-900 text-white font-display text-sm font-bold rounded-xl shadow-sm transition-all cursor-pointer"
                  >
                    Bắt đầu làm bài ngay ({totalMcQuestions} câu Trắc nghiệm + {totalTfQuestions} câu Đúng/Sai)
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      ) : (
        /* Active Quiz Interface */
        <div className="space-y-6">
          {/* Top Header & Student Status */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 space-y-4 shadow-xs">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                  <span>Học sinh:</span>
                  <span className="font-bold text-slate-900">{student.fullName}</span>
                  <span aria-hidden="true">•</span>
                  <span>
                    Lớp: <strong className="text-slate-900">{student.className}</strong>
                  </span>
                  <span aria-hidden="true">•</span>
                  <span>
                    STT: <strong className="font-mono text-slate-900">{student.rollNumber}</strong>
                  </span>
                </div>
                <h2 className="font-display text-xl sm:text-2xl font-extrabold text-slate-900">
                  Bài Kiểm Tra Bán Kính Nguyên Tử - Hóa 10
                </h2>
              </div>

              {/* Status / Actions on the right */}
              <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                {!isSubmitted ? (
                  <button
                    type="button"
                    onClick={() => setShowConfirmSubmitModal(true)}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-display text-xs sm:text-sm font-extrabold rounded-xl shadow-md transition-all cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                    <span>Nộp bài kiểm tra ({answeredCount}/{totalQuestions} câu)</span>
                  </button>
                ) : (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleResetQuiz}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors whitespace-nowrap cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Làm lại đề này</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        handleResetQuiz();
                        onLogoutStudent();
                      }}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-slate-700 border border-slate-200 hover:bg-slate-50 rounded-xl transition-colors whitespace-nowrap cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Đổi tài khoản</span>
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Test Status Banner: Before vs After Submit */}
            {!isSubmitted ? (
              <div className="p-3.5 sm:p-4 rounded-xl bg-sky-50 border border-sky-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-sky-950">
                <div className="flex items-center gap-2.5">
                  <span className="w-8 h-8 rounded-lg bg-sky-600 text-white flex items-center justify-center shrink-0 font-bold">
                    📝
                  </span>
                  <div>
                    <div className="font-extrabold text-sky-950 text-sm">
                      Chế độ làm bài: Đáp án & Lời giải được bảo mật
                    </div>
                    <p className="text-sky-800 text-xs mt-0.5">
                      Bạn có thể thoải mái chọn và thay đổi đáp án. Sau khi bấm <strong>&ldquo;Nộp bài&rdquo;</strong>, hệ thống mới hiển thị kết quả, đáp án đúng và phần giải thích chi tiết.
                    </p>
                  </div>
                </div>
                <div className="font-mono text-xs font-bold text-sky-900 shrink-0 bg-white px-3 py-1.5 rounded-lg border border-sky-200">
                  Đã làm: {answeredCount} / {totalQuestions} câu
                </div>
              </div>
            ) : (
              <div
                id="quiz-results-banner"
                className="p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white border-2 border-emerald-400/80 shadow-lg space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-md">
                      <Award className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="text-xs font-mono font-bold text-emerald-300 uppercase tracking-wider">
                        ĐÃ NỘP BÀI THÀNH CÔNG • KẾT QUẢ & LỜI GIẢI CHI TIẾT
                      </div>
                      <h3 className="font-display text-xl sm:text-2xl font-extrabold text-white mt-0.5">
                        Điểm số: {scoreOutOf10} / 10 điểm ({currentGradeLabel})
                      </h3>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-3 py-1.5 rounded-xl bg-white/10 font-mono text-xs font-bold text-sky-300">
                      Phần I: {mcScoreStr} / 8,0đ
                    </span>
                    <span className="px-3 py-1.5 rounded-xl bg-white/10 font-mono text-xs font-bold text-amber-300">
                      Phần II: {tfScoreStr} / 2,0đ
                    </span>
                  </div>
                </div>
                <div className="text-xs text-slate-200 leading-relaxed flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <p>
                    🎉 Bạn đã hoàn thành bài thi! Dưới đây là đáp án của từng câu và lời giải thích chi tiết tại sao câu đó đúng theo chuẩn kiến thức SGK Hóa học 10.
                  </p>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={handleSaveScore}
                      disabled={savedCurrentAttempt}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                        savedCurrentAttempt
                          ? 'bg-emerald-600 text-white cursor-default'
                          : 'bg-amber-400 hover:bg-amber-300 text-slate-950 cursor-pointer shadow-sm'
                      }`}
                    >
                      {savedCurrentAttempt ? '✓ Đã ghi danh bảng điểm' : 'Ghi danh Top 5'}
                    </button>
                    <button
                      type="button"
                      onClick={() => window.print()}
                      className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-colors cursor-pointer"
                    >
                      In kết quả
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Segmented Question Completion Map */}
            <div className="p-3.5 sm:p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5">
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                <span className="font-bold text-slate-800">
                  Sơ đồ câu hỏi:
                </span>
                <span className="font-mono text-slate-600">
                  {isSubmitted
                    ? `Đúng ${correctMcCount}/${totalMcQuestions} câu TN • Đúng ${totalCorrectStatementsInTf}/${totalTfQuestions * 4} ý Đ/S`
                    : `Đã chọn: ${answeredCount}/${totalQuestions} câu`}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-[11px] font-semibold text-slate-500 mr-1">
                  Phần I (Trắc nghiệm):
                </span>
                {QUIZ_QUESTIONS.map((q) => {
                  const ans = selectedAnswers[q.id];
                  const isDone = ans !== undefined;
                  const isRight = isDone && ans === q.correctIndex;

                  let badgeColor = 'bg-white border-slate-200 text-slate-600 hover:border-slate-400';
                  if (isSubmitted) {
                    badgeColor = isRight
                      ? 'bg-emerald-600 border-emerald-700 text-white'
                      : 'bg-red-500 border-red-600 text-white';
                  } else if (isDone) {
                    badgeColor = 'bg-sky-600 border-sky-700 text-white';
                  }

                  return (
                    <button
                      key={`mc-nav-${q.id}`}
                      type="button"
                      onClick={() => {
                        const el = document.getElementById(`quiz-question-${q.id}`);
                        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                      }}
                      title={`Câu ${q.id}: ${
                        !isDone
                          ? 'Chưa chọn'
                          : !isSubmitted
                          ? 'Đã chọn phương án'
                          : isRight
                          ? 'Đúng (+1,0đ)'
                          : 'Sai (0đ)'
                      }`}
                      className={`w-7 h-7 rounded-lg font-mono text-[11px] font-bold border transition-all cursor-pointer flex items-center justify-center ${badgeColor}`}
                    >
                      {q.id}
                    </button>
                  );
                })}

                <span className="text-[11px] font-semibold text-slate-500 ml-2 mr-1">
                  Phần II (Đúng/Sai):
                </span>
                {TRUE_FALSE_QUESTIONS.map((tf) => {
                  const tfRes = tfQuestionResults.find((r) => r.id === tf.id)!;
                  const isDone = tfRes.isComplete;
                  let badgeColor = 'bg-white border-amber-300 text-amber-900';
                  if (isSubmitted) {
                    badgeColor =
                      tfRes.correctSubCount === 4
                        ? 'bg-emerald-600 border-emerald-700 text-white'
                        : tfRes.correctSubCount >= 1
                        ? 'bg-amber-500 border-amber-600 text-slate-950'
                        : 'bg-red-500 border-red-600 text-white';
                  } else if (isDone) {
                    badgeColor = 'bg-sky-600 border-sky-700 text-white';
                  }

                  return (
                    <button
                      key={`tf-nav-${tf.id}`}
                      type="button"
                      onClick={() => {
                        const el = document.getElementById(`tf-question-${tf.id}`);
                        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                      }}
                      title={`Câu Đúng/Sai ${tf.id}`}
                      className={`px-2 h-7 rounded-lg font-mono text-[11px] font-bold border transition-all cursor-pointer flex items-center justify-center ${badgeColor}`}
                    >
                      Đ/S {tf.id}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-3 bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
            <div className="text-xs font-semibold text-slate-600">
              Bộ lọc phần thi & mức độ:
            </div>
            <div className="flex flex-wrap items-center gap-1 p-1 bg-slate-100 rounded-xl">
              {(
                [
                  { id: 'ALL', label: `Toàn bộ (${totalQuestions} câu)` },
                  { id: 'PART_1', label: `I. Trắc nghiệm (${totalMcQuestions} câu)` },
                  { id: 'Thông hiểu', label: `Thông hiểu (${thongHieuCount} câu)` },
                  { id: 'Vận dụng', label: `Vận dụng (${vanDungCount} câu)` },
                  { id: 'PART_2', label: `II. Đúng / Sai (${totalTfQuestions} câu)` },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveFilter(tab.id)}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    activeFilter === tab.id
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* ==================== PHẦN I: TRẮC NGHIỆM (8,0 ĐIỂM) ==================== */}
          {showPart1 && (
            <div className="space-y-4">
              <div className="bg-gradient-to-r from-slate-900 via-sky-950 to-slate-900 text-white rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
                <div>
                  <div className="text-xs font-mono font-bold text-sky-300 uppercase tracking-wider">
                    Phần I • Trắc nghiệm 4 lựa chọn (A, B, C, D)
                  </div>
                  <h3 className="font-display text-lg sm:text-xl font-extrabold text-white">
                    I. Trắc nghiệm ({totalMcQuestions} câu - Tối đa 8,0 điểm)
                  </h3>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span className="px-3 py-1.5 rounded-xl bg-white/10 font-mono font-bold text-sky-200">
                    Mỗi câu: +1,0 điểm
                  </span>
                  {isSubmitted && (
                    <span className="px-3 py-1.5 rounded-xl bg-sky-400 text-slate-950 font-mono font-extrabold">
                      Đạt: {mcScoreStr} / 8,0đ
                    </span>
                  )}
                </div>
              </div>

              {displayedMcQuestions.map((q) => {
                const userChoice = selectedAnswers[q.id];
                const isAnswered = userChoice !== undefined;
                const isCorrect = isAnswered && userChoice === q.correctIndex;
                const optionLabels = ['A', 'B', 'C', 'D'];

                return (
                  <div
                    key={q.id}
                    id={`quiz-question-${q.id}`}
                    className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 space-y-4 shadow-xs scroll-mt-24"
                  >
                    <div className="space-y-1.5">
                      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-mono font-extrabold text-indigo-700">
                            Câu {q.id}.
                          </span>
                          <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-800 font-semibold">
                            {q.level}
                          </span>
                          <span>•</span>
                          <span>{q.topic}</span>
                        </div>

                        {/* Status tag */}
                        {isSubmitted ? (
                          <div
                            className={`inline-flex items-center gap-1.5 font-extrabold ${
                              isCorrect ? 'text-emerald-700' : 'text-red-600'
                            }`}
                          >
                            {isCorrect ? (
                              <>
                                <CheckCircle2 className="w-4 h-4" />
                                <span>Chính xác! (+1,0 điểm)</span>
                              </>
                            ) : (
                              <>
                                <XCircle className="w-4 h-4" />
                                <span>
                                  Chưa đúng (Đáp án đúng là {optionLabels[q.correctIndex]})
                                </span>
                              </>
                            )}
                          </div>
                        ) : (
                          <span className="text-[11px] font-semibold text-slate-500">
                            {isAnswered ? (
                              <strong className="text-sky-700">
                                Đã chọn: {optionLabels[userChoice]}
                              </strong>
                            ) : (
                              'Chưa chọn'
                            )}
                          </span>
                        )}
                      </div>

                      <h4 className="font-display text-base sm:text-lg font-bold text-slate-900 leading-snug">
                        <span className="font-mono text-indigo-700 mr-1.5">{q.id}.</span>
                        {q.question}
                      </h4>
                    </div>

                    {/* 4 Options Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {q.options.map((optText, optIdx) => {
                        const isThisSelected = userChoice === optIdx;
                        const isThisCorrectOption = q.correctIndex === optIdx;

                        let btnStyle = 'bg-slate-50 border-slate-200 text-slate-800 hover:bg-sky-50/70 hover:border-sky-300';

                        if (isSubmitted) {
                          // AFTER SUBMIT: Reveal answers clearly
                          if (isThisCorrectOption) {
                            btnStyle = 'bg-emerald-50 border-emerald-500 text-emerald-950 font-semibold ring-2 ring-emerald-400';
                          } else if (isThisSelected && !isThisCorrectOption) {
                            btnStyle = 'bg-red-50 border-red-400 text-red-950 font-medium ring-2 ring-red-300';
                          } else {
                            btnStyle = 'bg-slate-50/70 border-slate-200 text-slate-500';
                          }
                        } else {
                          // BEFORE SUBMIT: Only highlight student's current selection (neutral sky color, no spoilers!)
                          if (isThisSelected) {
                            btnStyle = 'bg-sky-50 border-sky-500 text-sky-950 font-bold ring-2 ring-sky-400 shadow-xs';
                          }
                        }

                        return (
                          <button
                            key={optIdx}
                            type="button"
                            disabled={isSubmitted}
                            onClick={() => handleSelectOption(q, optIdx)}
                            className={`p-3.5 rounded-xl border text-left text-sm transition-all flex items-start justify-between gap-3 ${btnStyle} ${
                              isSubmitted ? 'cursor-default' : 'cursor-pointer'
                            }`}
                          >
                            <div className="flex items-start gap-2.5">
                              <span
                                className={`font-mono text-xs font-bold px-2 py-0.5 rounded-md border shrink-0 mt-0.5 ${
                                  isSubmitted && isThisCorrectOption
                                    ? 'bg-emerald-600 text-white border-emerald-600'
                                    : isThisSelected && !isSubmitted
                                    ? 'bg-sky-600 text-white border-sky-600'
                                    : 'bg-white border-slate-200 text-slate-800'
                                }`}
                              >
                                {optionLabels[optIdx]}.
                              </span>
                              <span className="leading-relaxed">{optText}</span>
                            </div>

                            {/* Icons after submit */}
                            {isSubmitted && (
                              <div className="shrink-0 mt-1">
                                {isThisCorrectOption && (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[11px] font-bold">
                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                    <span>Đáp án đúng</span>
                                  </span>
                                )}
                                {isThisSelected && !isThisCorrectOption && (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-red-100 text-red-800 text-[11px] font-bold">
                                    <XCircle className="w-3.5 h-3.5" />
                                    <span>Bạn đã chọn</span>
                                  </span>
                                )}
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </div>

                    {/* ONLY DISPLAYED AFTER SUBMISSION: Answer and explanation of why it is correct */}
                    {isSubmitted && (
                      <motion.div
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2 }}
                        className={`p-4 rounded-xl border text-xs sm:text-sm leading-relaxed space-y-2 ${
                          isCorrect
                            ? 'bg-emerald-50/80 border-emerald-300 text-emerald-950'
                            : 'bg-amber-50/90 border-amber-300 text-amber-950'
                        }`}
                      >
                        <div className="flex items-center justify-between border-b border-slate-200/60 pb-2">
                          <div className="font-extrabold flex items-center gap-1.5 text-slate-900">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                            <span>
                              Đáp án đúng:{' '}
                              <strong className="text-emerald-700 font-mono text-base">
                                {optionLabels[q.correctIndex]}
                              </strong>
                            </span>
                          </div>
                          <span className="font-mono text-xs font-bold text-slate-600">
                            {isCorrect ? 'Bạn đã làm đúng (+1,0đ)' : 'Bạn chưa ghi điểm câu này (0đ)'}
                          </span>
                        </div>
                        <div>
                          <strong className="text-slate-900 block mb-1">
                            Giải thích tại sao đáp án {optionLabels[q.correctIndex]} đúng:
                          </strong>
                          <p className="text-slate-800 leading-relaxed">{q.explanation}</p>
                        </div>
                      </motion.div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* ==================== PHẦN II: TRẮC NGHIỆM ĐÚNG / SAI (2,0 ĐIỂM) ==================== */}
          {showPart2 && (
            <div className="space-y-4 pt-2">
              <div className="bg-gradient-to-r from-slate-900 via-amber-950 to-slate-900 text-white rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
                <div>
                  <div className="text-xs font-mono font-bold text-amber-300 uppercase tracking-wider">
                    Phần II • Câu trắc nghiệm Đúng / Sai (Mỗi câu gồm 4 ý a, b, c, d)
                  </div>
                  <h3 className="font-display text-lg sm:text-xl font-extrabold text-white">
                    II. Trắc nghiệm Đúng / Sai ({totalTfQuestions} câu - Tối đa 2,0 điểm)
                  </h3>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span className="px-3 py-1.5 rounded-xl bg-white/10 font-mono font-bold text-amber-200">
                    1 ý: 0,1đ • 2 ý: 0,25đ • 3 ý: 0,5đ • 4 ý: 1,0đ
                  </span>
                  {isSubmitted && (
                    <span className="px-3 py-1.5 rounded-xl bg-amber-400 text-slate-950 font-mono font-extrabold">
                      Đạt: {tfScoreStr} / 2,0đ
                    </span>
                  )}
                </div>
              </div>

              {TRUE_FALSE_QUESTIONS.map((tfQ) => {
                const currentEntry = tfAnswers[tfQ.id] || {};
                const tfRes = tfQuestionResults.find((r) => r.id === tfQ.id)!;

                return (
                  <div
                    key={tfQ.id}
                    id={`tf-question-${tfQ.id}`}
                    className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 space-y-4 shadow-xs scroll-mt-24"
                  >
                    <div className="space-y-1.5">
                      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="px-2.5 py-0.5 rounded-md bg-amber-100 text-amber-900 font-mono font-extrabold">
                            Phần II • {tfQ.title}
                          </span>
                          <span>•</span>
                          <span className="font-semibold text-slate-700">{tfQ.topic}</span>
                        </div>

                        {/* Status after vs before submission */}
                        {isSubmitted ? (
                          <div
                            className={`inline-flex items-center gap-1.5 font-mono font-extrabold ${
                              tfRes.correctSubCount === 4
                                ? 'text-emerald-700'
                                : tfRes.correctSubCount >= 1
                                ? 'text-amber-700'
                                : 'text-red-600'
                            }`}
                          >
                            <CheckCircle2 className="w-4 h-4" />
                            <span>
                              Đúng {tfRes.correctSubCount}/4 ý (+{formatScore(tfRes.points)} điểm)
                            </span>
                          </div>
                        ) : (
                          <span className="font-mono text-xs font-bold text-slate-600">
                            Đã chọn: {tfRes.selectedCount}/4 ý
                          </span>
                        )}
                      </div>

                      <h4 className="font-display text-base sm:text-lg font-bold text-slate-900 leading-snug">
                        {tfQ.stem}
                      </h4>
                    </div>

                    {/* 4 Statements List */}
                    <div className="space-y-2.5">
                      {tfQ.statements.map((st) => {
                        const userVal = currentEntry[st.id];
                        const isStAnswered = userVal !== undefined;
                        const isStRight = isSubmitted && isStAnswered && userVal === st.isTrue;

                        let rowBorder = 'bg-slate-50 border-slate-200';
                        if (isSubmitted) {
                          rowBorder = isStRight
                            ? 'bg-emerald-50/70 border-emerald-300'
                            : 'bg-red-50/70 border-red-300';
                        } else if (isStAnswered) {
                          rowBorder = 'bg-sky-50/60 border-sky-300';
                        }

                        return (
                          <div
                            key={st.id}
                            className={`p-3.5 sm:p-4 rounded-xl border transition-all space-y-2.5 ${rowBorder}`}
                          >
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                              <div className="flex items-start gap-2.5 text-sm text-slate-900">
                                <span className="font-mono text-xs font-extrabold px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-900 shrink-0 mt-0.5">
                                  {st.id})
                                </span>
                                <span className="leading-relaxed font-medium">{st.text}</span>
                              </div>

                              {/* True/False Buttons */}
                              <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                                <button
                                  type="button"
                                  disabled={isSubmitted}
                                  onClick={() =>
                                    handleSelectTrueFalseStatement(tfQ, st.id, true)
                                  }
                                  className={`px-3.5 py-1.5 rounded-lg font-display text-xs font-extrabold border transition-all ${
                                    userVal === true
                                      ? isSubmitted
                                        ? st.isTrue
                                          ? 'bg-emerald-600 border-emerald-700 text-white'
                                          : 'bg-red-600 border-red-700 text-white'
                                        : 'bg-sky-600 border-sky-700 text-white shadow-xs'
                                      : 'bg-white border-slate-300 text-slate-700 hover:border-sky-400'
                                  } ${isSubmitted ? 'cursor-default' : 'cursor-pointer'}`}
                                >
                                  Đúng
                                </button>
                                <button
                                  type="button"
                                  disabled={isSubmitted}
                                  onClick={() =>
                                    handleSelectTrueFalseStatement(tfQ, st.id, false)
                                  }
                                  className={`px-3.5 py-1.5 rounded-lg font-display text-xs font-extrabold border transition-all ${
                                    userVal === false
                                      ? isSubmitted
                                        ? !st.isTrue
                                          ? 'bg-emerald-600 border-emerald-700 text-white'
                                          : 'bg-red-600 border-red-700 text-white'
                                        : 'bg-sky-600 border-sky-700 text-white shadow-xs'
                                      : 'bg-white border-slate-300 text-slate-700 hover:border-sky-400'
                                  } ${isSubmitted ? 'cursor-default' : 'cursor-pointer'}`}
                                >
                                  Sai
                                </button>
                              </div>
                            </div>

                            {/* ONLY SHOWN AFTER SUBMISSION: Explanation for why statement is True or False */}
                            {isSubmitted && (
                              <div className="pt-2 border-t border-slate-200/80 flex items-start gap-2 text-xs text-slate-800">
                                {isStRight ? (
                                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                                ) : (
                                  <XCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                                )}
                                <div>
                                  <div className="font-bold text-slate-900 mb-0.5">
                                    Ý {st.id} là: <span className="text-indigo-700 uppercase font-extrabold">{st.isTrue ? 'ĐÚNG' : 'SAI'}</span>
                                    {isStAnswered && (
                                      <span className="font-normal text-slate-500 ml-2">
                                        (Bạn đã chọn: {userVal ? 'Đúng' : 'Sai'})
                                      </span>
                                    )}
                                  </div>
                                  <p className="leading-relaxed">{st.explanation}</p>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* Graded Summary Bar for this True/False Question after submit */}
                    {isSubmitted && (
                      <motion.div
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.15 }}
                        className="p-3.5 rounded-xl bg-amber-50/80 border border-amber-200 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-800"
                      >
                        <div>
                          Kết quả <strong>{tfQ.title}</strong>: Bạn trả lời đúng{' '}
                          <strong className="font-mono text-slate-900">
                            {tfRes.correctSubCount}/4 ý
                          </strong>{' '}
                          (Quy tắc: 1 ý = 0,1đ; 2 ý = 0,25đ; 3 ý = 0,5đ; 4 ý = 1,0đ)
                        </div>
                        <span className="font-mono text-sm font-extrabold text-indigo-700">
                          Nhận được: +{formatScore(tfRes.points)} / 1,0 điểm
                        </span>
                      </motion.div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Large Bottom Submit Action Bar (Before submit) */}
          {!isSubmitted && (
            <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-sky-950 to-slate-900 text-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg border border-sky-500/30">
              <div className="space-y-1 text-center sm:text-left">
                <div className="font-display text-lg font-extrabold">
                  Hoàn thành bài làm & Nộp bài kiểm tra
                </div>
                <p className="text-xs text-slate-300">
                  Đã trả lời: <strong className="text-sky-300">{answeredCount}/{totalQuestions} câu</strong>. Hãy kiểm tra lại trước khi nộp để đạt điểm cao nhất!
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowConfirmSubmitModal(true)}
                className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-display text-sm font-extrabold rounded-xl shadow-lg transition-all cursor-pointer inline-flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                <span>Nộp bài ngay</span>
              </button>
            </div>
          )}

          {/* Modal Xác nhận nộp bài */}
          {showConfirmSubmitModal && (
            <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-200"
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                    <HelpCircle className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-display text-lg font-extrabold text-slate-900">
                      Xác nhận nộp bài kiểm tra
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Học sinh: {student.fullName} ({student.className})
                    </p>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 space-y-2 leading-relaxed">
                  <div className="flex justify-between font-medium">
                    <span>Phần I (Trắc nghiệm):</span>
                    <strong className="text-sky-700">{answeredMcCount} / {totalMcQuestions} câu</strong>
                  </div>
                  <div className="flex justify-between font-medium">
                    <span>Phần II (Đúng / Sai):</span>
                    <strong className="text-amber-700">{answeredTfCount} / {totalTfQuestions} câu</strong>
                  </div>
                  {totalQuestions - answeredCount > 0 ? (
                    <div className="pt-2 border-t border-slate-200 text-red-600 font-semibold">
                      ⚠️ Bạn vẫn còn {totalQuestions - answeredCount} câu chưa trả lời. Các câu chưa làm sẽ nhận 0 điểm.
                    </div>
                  ) : (
                    <div className="pt-2 border-t border-slate-200 text-emerald-700 font-semibold">
                      ✓ Bạn đã hoàn thành đủ {totalQuestions}/{totalQuestions} câu hỏi!
                    </div>
                  )}
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">
                  Sau khi nộp bài, hệ thống sẽ chấm điểm và hiển thị toàn bộ đáp án đúng cùng giải thích chi tiết.
                </p>

                <div className="flex items-center justify-end gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowConfirmSubmitModal(false)}
                    className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold transition-colors cursor-pointer"
                  >
                    Quay lại làm tiếp
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmSubmit}
                    className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold shadow-sm transition-colors cursor-pointer inline-flex items-center gap-1.5"
                  >
                    <FileCheck2 className="w-4 h-4" />
                    <span>Xác nhận nộp bài</span>
                  </button>
                </div>
              </motion.div>
            </div>
          )}

          {/* PHIẾU KẾT QUẢ & PHÂN TÍCH NĂNG LỰC (Sau khi nộp bài) */}
          {isSubmitted && (
            <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-6 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                <div className="space-y-1">
                  <div className="text-xs font-bold text-indigo-600">
                    Phiếu Điểm & Đánh Giá Năng Lực Hóa 10
                  </div>
                  <h3 className="font-display text-xl font-extrabold text-slate-900">
                    Học sinh: {student.fullName} • Lớp {student.className} • STT {student.rollNumber}
                  </h3>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-700 transition-colors cursor-pointer"
                  >
                    <Printer className="w-4 h-4" />
                    <span>In Phiếu Kết Quả</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveScore}
                    disabled={savedCurrentAttempt}
                    className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-display text-xs font-extrabold transition-colors whitespace-nowrap shrink-0 ${
                      savedCurrentAttempt
                        ? 'bg-emerald-600 text-white cursor-default'
                        : 'bg-slate-900 text-white hover:bg-slate-800 cursor-pointer'
                    }`}
                  >
                    <ClipboardCheck className="w-4 h-4" />
                    <span>
                      {savedCurrentAttempt
                        ? '✓ Đã Lưu Bảng Điểm'
                        : 'Lưu vào bảng điểm lớp'}
                    </span>
                  </button>
                </div>
              </div>

              {/* 3 Skill Matrix Bars */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {skillBreakdown.map((item) => (
                  <div
                    key={item.title}
                    className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-800">{item.title}</span>
                      <span className="font-mono font-extrabold text-indigo-700">
                        {item.correct}/{item.total} {item.unit} ({item.pct}%)
                      </span>
                    </div>
                    <div className="h-2.5 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          item.pct >= 75
                            ? 'bg-emerald-500'
                            : item.pct >= 50
                            ? 'bg-sky-500'
                            : 'bg-amber-500'
                        }`}
                        style={{ width: `${item.pct}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Summary Score Banner */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-slate-900 to-indigo-950 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
                <div className="flex items-center gap-3">
                  <Award className="w-8 h-8 text-sky-400 shrink-0" />
                  <div>
                    <div className="text-sm font-extrabold">
                      Tổng kết: {scoreOutOf10} / 10 điểm (Phần I: {mcScoreStr}đ + Phần II: {tfScoreStr}đ) • Xếp loại: {currentGradeLabel}
                    </div>
                    <div className="text-slate-300 mt-0.5">
                      {numericScore >= 8.0
                        ? 'Nhận xét: Nắm rất vững lý thuyết và áp dụng xuất sắc quy luật biến đổi bán kính nguyên tử trong chu kì & nhóm A!'
                        : numericScore >= 5.0
                        ? 'Nhận xét: Nắm được kiến thức cơ bản; cần chú ý phân tích sâu hơn ở các câu giải thích cơ chế và trắc nghiệm Đúng/Sai.'
                        : 'Nhận xét: Cần đọc lại kỹ nội dung lý thuyết trọng tâm (Mục 2) và xem lại các lời giải thích chi tiết bên trên.'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TOP 5 LEADERBOARD BY CLASS */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 space-y-5 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-amber-700">
                Bảng Vàng Thi Đua Học Tập (Cập nhật sau khi nộp bài)
              </div>
              <h3 className="font-display text-lg font-extrabold text-slate-900">
                Bảng Xếp Hạng Top 5 Học Sinh Điểm Cao Nhất
              </h3>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-1 p-1 bg-slate-100 rounded-xl">
            <button
              type="button"
              onClick={() => setLeaderboardClassFilter('ALL')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                leaderboardClassFilter === 'ALL'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Toàn khối ({attemptHistory.length})
            </button>
            {availableClasses.map((cls) => (
              <button
                key={cls}
                type="button"
                onClick={() => setLeaderboardClassFilter(cls)}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  leaderboardClassFilter === cls
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Lớp {cls}
              </button>
            ))}
          </div>
        </div>

        {top5Leaderboard.length === 0 ? (
          <div className="p-6 rounded-xl bg-slate-50 border border-dashed border-slate-200 text-center text-xs text-slate-500">
            Chưa có học sinh nào nộp bài trong lớp này. Hãy hoàn thành bài thi và bấm &ldquo;Lưu vào bảng điểm lớp&rdquo;!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
            {top5Leaderboard.map((item, idx) => {
              const rank = idx + 1;
              const isTop1 = rank === 1;
              const isTop2 = rank === 2;
              const isTop3 = rank === 3;
              const scoreVal = parseFloat(item.scoreOutOf10) || 0;
              const barPct = Math.min(100, Math.max(10, Math.round(scoreVal * 10)));

              return (
                <div
                  key={item.id}
                  className={`p-4 rounded-2xl border flex flex-col justify-between space-y-3 transition-transform hover:-translate-y-0.5 ${
                    isTop1
                      ? 'bg-gradient-to-b from-amber-50/90 to-white border-amber-300 shadow-xs'
                      : isTop2
                      ? 'bg-gradient-to-b from-sky-50/80 to-white border-sky-200'
                      : isTop3
                      ? 'bg-gradient-to-b from-emerald-50/70 to-white border-emerald-200'
                      : 'bg-slate-50/70 border-slate-200'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span
                        className={`font-mono text-xs font-extrabold px-2 py-0.5 rounded-md ${
                          isTop1
                            ? 'bg-amber-500 text-slate-950'
                            : isTop2
                            ? 'bg-sky-600 text-white'
                            : isTop3
                            ? 'bg-emerald-600 text-white'
                            : 'bg-slate-200 text-slate-700'
                        }`}
                      >
                        Hạng #{rank}
                      </span>
                      <span className="font-mono text-xs font-bold text-slate-600">
                        {item.className} • STT {item.rollNumber}
                      </span>
                    </div>
                    <div className="font-display text-base font-extrabold text-slate-900 truncate">
                      {item.fullName}
                    </div>
                  </div>

                  <div className="space-y-1.5 pt-2 border-t border-slate-200/70">
                    <div className="flex items-baseline justify-between">
                      <span className="font-mono text-lg font-extrabold text-indigo-700 tabular-nums">
                        {item.scoreOutOf10}đ
                      </span>
                      <span className="font-mono text-xs font-bold text-emerald-700 tabular-nums">
                        {item.gradeLabel}
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          isTop1
                            ? 'bg-amber-500'
                            : isTop2
                            ? 'bg-sky-500'
                            : 'bg-emerald-500'
                        }`}
                        style={{ width: `${barPct}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* BẢNG ĐIỀU KHIỂN GIÁO VIÊN & XUẤT EXCEL */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 space-y-5 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
              <BarChart2 className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-indigo-600">
                Công cụ dành cho Giáo viên & Lớp trưởng
              </div>
              <h3 className="font-display text-lg font-extrabold text-slate-900">
                Bảng Tổng Hợp Điểm Nộp Bài & Xuất File Excel (.CSV)
              </h3>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleLoadDemoRecords}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
            >
              <Users className="w-4 h-4" />
              <span>Nạp danh sách mẫu (Demo)</span>
            </button>
            <button
              type="button"
              onClick={handleExportCSV}
              disabled={attemptHistory.length === 0}
              className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
                attemptHistory.length === 0
                  ? 'bg-slate-100 text-slate-600 cursor-not-allowed'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer shadow-xs'
              }`}
            >
              <Download className="w-4 h-4" />
              <span>Xuất ra Excel (.CSV)</span>
            </button>
            {attemptHistory.length > 0 && (
              <button
                type="button"
                onClick={handleClearHistory}
                className="inline-flex items-center gap-1 px-3 py-2 rounded-xl border border-slate-200 hover:bg-red-50 hover:text-red-700 text-xs font-semibold text-slate-500 transition-colors cursor-pointer"
                title="Xóa danh sách điểm"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Xóa bảng</span>
              </button>
            )}
          </div>
        </div>

        {/* Summary KPI Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-xs text-slate-500 block">Tổng số bài nộp</span>
            <span className="font-mono text-xl font-extrabold text-slate-900 tabular-nums">
              {teacherStats.count} học sinh
            </span>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-xs text-slate-500 block">Điểm trung bình</span>
            <span className="font-mono text-xl font-extrabold text-indigo-700 tabular-nums">
              {teacherStats.avgScore} / 10
            </span>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-xs text-slate-500 block">Điểm cao nhất</span>
            <span className="font-mono text-xl font-extrabold text-emerald-700 tabular-nums">
              {teacherStats.maxScore}đ
            </span>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-xs text-slate-500 block">Số HS đạt Giỏi / Xuất sắc</span>
            <span className="font-mono text-xl font-extrabold text-sky-700 tabular-nums">
              {teacherStats.highAchievers} học sinh
            </span>
          </div>
        </div>

        {attemptHistory.length === 0 ? (
          <div className="p-8 rounded-xl bg-slate-50 border border-dashed border-slate-200 text-center space-y-2">
            <p className="text-xs text-slate-600 font-medium">
              Chưa có dữ liệu bài nộp. Học sinh sau khi hoàn thành đề bấm <strong>&ldquo;Nộp bài&rdquo;</strong> và <strong>&ldquo;Lưu vào bảng điểm lớp&rdquo;</strong> sẽ được hiển thị tại đây.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-600 bg-slate-50">
                  <th className="py-2.5 px-3 font-semibold">STT</th>
                  <th className="py-2.5 px-3 font-semibold">Họ tên học sinh</th>
                  <th className="py-2.5 px-3 font-semibold">Lớp</th>
                  <th className="py-2.5 px-3 font-semibold">Phần I (8đ)</th>
                  <th className="py-2.5 px-3 font-semibold">Phần II (2đ)</th>
                  <th className="py-2.5 px-3 font-semibold">Tổng điểm</th>
                  <th className="py-2.5 px-3 font-semibold">Xếp loại</th>
                  <th className="py-2.5 px-3 font-semibold">Thời gian nộp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {attemptHistory.map((item) => {
                  const s = parseFloat(item.scoreOutOf10) || 0;
                  const label = item.gradeLabel || getGradeLabel(s);
                  return (
                    <tr key={item.id} className="hover:bg-slate-50/80">
                      <td className="py-2.5 px-3 font-mono font-bold text-slate-800">
                        {item.rollNumber}
                      </td>
                      <td className="py-2.5 px-3 font-bold text-slate-900">{item.fullName}</td>
                      <td className="py-2.5 px-3 font-mono font-semibold text-slate-700">
                        {item.className}
                      </td>
                      <td className="py-2.5 px-3 font-mono text-sky-700 font-bold">
                        {item.mcScore ? `${item.mcScore} / 8.0` : '-'}
                      </td>
                      <td className="py-2.5 px-3 font-mono text-amber-700 font-bold">
                        {item.tfScore ? `${item.tfScore} / 2.0` : '-'}
                      </td>
                      <td className="py-2.5 px-3 font-mono font-extrabold text-indigo-700">
                        {item.scoreOutOf10} / 10
                      </td>
                      <td className="py-2.5 px-3">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-md font-bold ${
                            s >= 8.0
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : s >= 6.5
                              ? 'bg-sky-50 text-sky-700 border border-sky-200'
                              : 'bg-amber-50 text-amber-800 border border-amber-200'
                          }`}
                        >
                          {label}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-mono text-slate-500">
                        {item.completedAt}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
