import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion } from 'motion/react';
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
  Flame,
  Trophy,
  Download,
  Printer,
  Users,
  BarChart2,
  Trash2,
  Sparkles,
  ListChecks,
  CheckSquare,
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
  return 'Cần ôn tập thêm';
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
    completedAt: '08:15 · Hôm nay',
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
    completedAt: '08:12 · Hôm nay',
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
    completedAt: '08:10 · Hôm nay',
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
    completedAt: '08:08 · Hôm nay',
  },
  {
    id: 'demo-5',
    rollNumber: '31',
    fullName: 'Vũ Ngọc Ánh',
    className: '10A1',
    correctCount: 8,
    totalQuestions: 10,
    mcScore: '6.0',
    tfScore: '1.25',
    scoreOutOf10: '7.25',
    gradeLabel: 'Khá',
    completedAt: '08:06 · Hôm nay',
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
    completedAt: '08:14 · Hôm nay',
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
    completedAt: '08:05 · Hôm nay',
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
    completedAt: '08:02 · Hôm nay',
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
  const [streak, setStreak] = useState<number>(0);
  const [bestStreak, setBestStreak] = useState<number>(0);
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
        `Không thể bắt đầu làm bài! Bạn chưa nhập: ${missingFields.join(', ')}. Vui lòng điền đầy đủ không bỏ trống.`
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

  const handleSelectOption = (q: QuizQuestion, optionIdx: number) => {
    if (selectedAnswers[q.id] !== undefined) return;
    const nextAnswers = {
      ...selectedAnswers,
      [q.id]: optionIdx,
    };
    setSelectedAnswers(nextAnswers);

    if (optionIdx === q.correctIndex) {
      const nextStreak = streak + 1;
      setStreak(nextStreak);
      if (nextStreak > bestStreak) {
        setBestStreak(nextStreak);
      }
    } else {
      setStreak(0);
    }

    const totalDoneAfter =
      Object.keys(nextAnswers).length + countCompletedTrueFalseQuestions(tfAnswers);
    if (totalDoneAfter === QUIZ_QUESTIONS.length + TRUE_FALSE_QUESTIONS.length) {
      triggerCelebrationFireworks();
    }
  };

  const handleSelectTrueFalseStatement = (
    tfQuestion: TrueFalseQuestion,
    statementId: 'a' | 'b' | 'c' | 'd',
    choice: boolean
  ) => {
    // Once all 4 statements in this TF question are answered, lock it and grade it
    if (isTrueFalseQuestionComplete(tfQuestion.id, tfAnswers)) return;

    const currentEntry = tfAnswers[tfQuestion.id] || {};
    const nextEntry: Partial<Record<'a' | 'b' | 'c' | 'd', boolean>> = {
      ...currentEntry,
      [statementId]: choice,
    };
    const nextTfMap: TrueFalseAnswerMap = {
      ...tfAnswers,
      [tfQuestion.id]: nextEntry,
    };
    setTfAnswers(nextTfMap);

    // Check if this click completed all 4 statements of this TF question
    if (isTrueFalseQuestionComplete(tfQuestion.id, nextTfMap)) {
      const correctSubCount = tfQuestion.statements.filter(
        (st) => nextEntry[st.id] === st.isTrue
      ).length;

      if (correctSubCount === 4) {
        const nextStreak = streak + 1;
        setStreak(nextStreak);
        if (nextStreak > bestStreak) {
          setBestStreak(nextStreak);
        }
      } else if (correctSubCount === 0) {
        setStreak(0);
      }

      const totalDoneAfter =
        Object.keys(selectedAnswers).length + countCompletedTrueFalseQuestions(nextTfMap);
      if (totalDoneAfter === QUIZ_QUESTIONS.length + TRUE_FALSE_QUESTIONS.length) {
        triggerCelebrationFireworks();
      }
    }
  };

  const handleResetQuiz = () => {
    setSelectedAnswers({});
    setTfAnswers({});
    setStreak(0);
    setBestStreak(0);
    setSavedCurrentAttempt(false);
  };

  // ==================== SCORING CALCULATIONS ====================
  // Phần I: Trắc nghiệm 8,0 điểm (8 câu, mỗi câu 1,0 điểm; tối đa 8,0 điểm)
  const totalMcQuestions = QUIZ_QUESTIONS.length;
  const answeredMcCount = Object.keys(selectedAnswers).length;
  const correctMcCount = QUIZ_QUESTIONS.reduce((acc, q) => {
    return acc + (selectedAnswers[q.id] === q.correctIndex ? 1 : 0);
  }, 0);

  const rawMcPoints = Math.min(8.0, Math.round(correctMcCount * 1.0 * 100) / 100);

  // Phần II: Đúng / Sai 2,0 điểm (2 câu, mỗi câu 1,0đ: 1 ý = 0,1đ; 2 ý = 0,25đ; 3 ý = 0,5đ; 4 ý = 1,0đ)
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
      const correctSubCount = isComplete
        ? tf.statements.filter((st) => entry[st.id] === st.isTrue).length
        : 0;
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

  // Tổng hợp toàn đề (Thang điểm 10 = Phần I (8đ) + Phần II (2đ))
  const totalQuestions = totalMcQuestions + totalTfQuestions;
  const answeredCount = answeredMcCount + answeredTfCount;
  const progressPercent = Math.round((answeredCount / totalQuestions) * 100);
  const correctCount = correctMcCount + perfectTfCount;

  const numericScore = Math.min(10.0, Math.round((rawMcPoints + rawTfPoints) * 100) / 100);
  const mcScoreStr = formatScore(rawMcPoints);
  const tfScoreStr = formatScore(rawTfPoints);
  const scoreOutOf10 = formatScore(numericScore);
  const currentGradeLabel = getGradeLabel(numericScore);

  // Skill diagnostic breakdown for the Student Report Card
  const skillBreakdown = useMemo(() => {
    const groups = [
      {
        title: '1. Phần I · a) Thông hiểu (Câu 1 – 4)',
        correct: QUIZ_QUESTIONS.filter(
          (q) => q.sectionCode === 'a' && selectedAnswers[q.id] === q.correctIndex
        ).length,
        total: QUIZ_QUESTIONS.filter((q) => q.sectionCode === 'a').length,
        unit: 'câu',
      },
      {
        title: '2. Phần I · b) Vận dụng (Câu 5 – 8)',
        correct: QUIZ_QUESTIONS.filter(
          (q) => q.sectionCode === 'b' && selectedAnswers[q.id] === q.correctIndex
        ).length,
        total: QUIZ_QUESTIONS.filter((q) => q.sectionCode === 'b').length,
        unit: 'câu',
      },
      {
        title: '3. Phần II · Trắc nghiệm Đúng / Sai (2 câu · 8 ý)',
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
      ' · ' +
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
      'Họ và tên học sinh',
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

  // Teacher dashboard statistics
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

  // Unique classes for Top 5 Leaderboard filter
  const availableClasses = useMemo(() => {
    const classSet = new Set<string>();
    attemptHistory.forEach((item) => {
      if (item.className.trim()) {
        classSet.add(item.className.trim().toUpperCase());
      }
    });
    return Array.from(classSet).sort();
  }, [attemptHistory]);

  // Top 5 Highest Scoring Students for Selected Class
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
  const vanDungCaoCount = QUIZ_QUESTIONS.filter((q) => q.level === 'Vận dụng cao').length;

  return (
    <div className="space-y-6">
      {!student ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-6 space-y-5">
              <div className="inline-flex items-center gap-2 text-xs font-extrabold text-sky-700">
                <Trophy className="w-4 h-4" />
                <span>
                  Đề Kiểm Tra Hóa Học 10 Chuẩn Mới · Thang điểm 10 (8,0đ Trắc nghiệm + 2,0đ Đúng/Sai)
                </span>
              </div>
              <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-slate-900 leading-tight">
                Đăng nhập Tài khoản Học sinh để bắt đầu làm bài
              </h2>
              <p className="text-sm text-slate-600 leading-relaxed">
                Cấu trúc bài tập gồm <strong>Phần I: Trắc nghiệm 4 lựa chọn (8,0 điểm · 1,0đ/câu)</strong> chia theo 2 mức độ <em>Thông hiểu – Vận dụng</em> và <strong>Phần II: Trắc nghiệm Đúng / Sai (2,0 điểm · 2 câu lớn)</strong> chấm theo bậc điểm <strong>0,1đ – 0,25đ – 0,5đ – 1,0đ</strong>.
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
                    Mỗi câu đúng được <strong>1,0 điểm</strong>: gồm {thongHieuCount} câu Thông hiểu và {vanDungCount} câu Vận dụng.
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
                    Mỗi câu gồm 4 ý a, b, c, d: Đúng 1 ý <strong>0,1đ</strong> · 2 ý <strong>0,25đ</strong> · 3 ý <strong>0,5đ</strong> · 4 ý <strong>1,0đ</strong>.
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
                      Thông tin Tài khoản Học sinh
                    </h3>
                    <p className="text-xs text-slate-500">
                      Bắt buộc nhập đủ 3 mục để mở khóa đề bài
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
        /* Active Quiz Interface after Student Login */
        <div className="space-y-6">
          {/* Student Status & Gamified Progress Bar */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 space-y-4 shadow-xs">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                  <span>Học sinh đang làm bài</span>
                  <span aria-hidden="true">·</span>
                  <span>
                    Lớp: <strong className="text-slate-900">{student.className}</strong>
                  </span>
                  <span aria-hidden="true">·</span>
                  <span>
                    Số thứ tự:{' '}
                    <strong className="font-mono text-slate-900">{student.rollNumber}</strong>
                  </span>
                </div>
                <h2 className="font-display text-xl sm:text-2xl font-extrabold text-slate-900">
                  {student.fullName}
                </h2>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <div className="flex flex-wrap items-center gap-3 sm:gap-4 px-3 sm:px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                  <div>
                    <span className="text-slate-500 block">I. Trắc nghiệm</span>
                    <span className="font-mono text-sm font-extrabold text-sky-700 tabular-nums">
                      {mcScoreStr} / 8,0 đ
                    </span>
                  </div>
                  <div className="h-7 w-px bg-slate-200" />
                  <div>
                    <span className="text-slate-500 block">II. Đúng / Sai</span>
                    <span className="font-mono text-sm font-extrabold text-amber-700 tabular-nums">
                      {tfScoreStr} / 2,0 đ
                    </span>
                  </div>
                  <div className="h-7 w-px bg-slate-200" />
                  <div>
                    <span className="text-slate-500 block">Chuỗi đúng</span>
                    <span className="font-mono text-sm font-extrabold text-amber-600 tabular-nums inline-flex items-center gap-1">
                      <Flame className="w-3.5 h-3.5" />
                      {streak}
                    </span>
                  </div>
                  <div className="h-7 w-px bg-slate-200" />
                  <div>
                    <span className="text-slate-500 block">Tổng điểm</span>
                    <span className="font-mono text-sm font-extrabold text-indigo-700 tabular-nums">
                      {scoreOutOf10} / 10
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleResetQuiz}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Làm lại</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      handleResetQuiz();
                      onLogoutStudent();
                    }}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-slate-700 border border-slate-200 hover:bg-slate-50 rounded-xl transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Đổi tài khoản</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Scoring Rules Banner */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
              <div className="p-3 rounded-xl bg-sky-50/70 border border-sky-200 flex items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2">
                  <ListChecks className="w-4 h-4 text-sky-700 shrink-0" />
                  <span className="text-slate-800">
                    <strong>Phần I. Trắc nghiệm (8,0 điểm):</strong> Mỗi câu đúng được{' '}
                    <strong className="font-mono text-sky-800">1,0 điểm</strong> (Đúng cả {totalMcQuestions} câu đạt tối đa{' '}
                    <strong className="font-mono text-sky-800">8,0 điểm</strong>).
                  </span>
                </div>
                <span className="font-mono font-extrabold text-sky-800 shrink-0">
                  Đúng {correctMcCount}/{totalMcQuestions}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200 flex items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2">
                  <CheckSquare className="w-4 h-4 text-amber-700 shrink-0" />
                  <span className="text-slate-800">
                    <strong>Phần II. Đúng / Sai (2,0 điểm):</strong> Đúng 1 ý:{' '}
                    <strong className="font-mono text-amber-900">0,1đ</strong> · 2 ý:{' '}
                    <strong className="font-mono text-amber-900">0,25đ</strong> · 3 ý:{' '}
                    <strong className="font-mono text-amber-900">0,5đ</strong> · 4 ý:{' '}
                    <strong className="font-mono text-amber-900">1,0đ</strong>.
                  </span>
                </div>
                <span className="font-mono font-extrabold text-amber-900 shrink-0">
                  Đã chấm {answeredTfCount}/{totalTfQuestions}
                </span>
              </div>
            </div>

            {/* Visual Progress Bar & Interactive Question Completion Map */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/90 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900">Thanh tiến trình làm bài:</span>
                  <span className="font-mono font-extrabold text-indigo-700 text-sm tabular-nums">
                    Đã hoàn thành {answeredCount} / {totalQuestions} câu ({progressPercent}%)
                  </span>
                </div>
                <div className="flex items-center gap-3 text-slate-600">
                  <span className="font-medium">
                    {answeredCount === totalQuestions ? (
                      <strong className="text-emerald-700">
                        Đã hoàn thành tất cả {totalQuestions} câu hỏi!
                      </strong>
                    ) : (
                      <>
                        Còn lại:{' '}
                        <strong className="font-mono text-slate-900">
                          {totalQuestions - answeredCount} câu
                        </strong>{' '}
                        chưa hoàn thành
                      </>
                    )}
                  </span>
                  <span aria-hidden="true">·</span>
                  <span className="font-mono">Chuỗi đúng cao nhất: {bestStreak}</span>
                </div>
              </div>

              {/* Continuous Progress Bar */}
              <div
                role="progressbar"
                aria-valuenow={answeredCount}
                aria-valuemin={0}
                aria-valuemax={totalQuestions}
                aria-label={`Đã làm ${answeredCount} trên tổng số ${totalQuestions} câu hỏi`}
                className="w-full h-3.5 bg-slate-200/90 rounded-full overflow-hidden p-0.5"
              >
                <div
                  className={`h-full transition-all duration-300 ease-out rounded-full ${
                    answeredCount === totalQuestions
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-500'
                      : 'bg-gradient-to-r from-sky-500 via-indigo-500 to-indigo-600'
                  }`}
                  style={{ width: `${progressPercent}%` }}
                />
              </div>

              {/* Segmented Question Completion Map */}
              <div className="pt-1 flex flex-wrap items-center gap-1.5">
                <span className="text-[11px] font-semibold text-slate-600 mr-1">
                  Phần I (1–{totalMcQuestions}):
                </span>
                {QUIZ_QUESTIONS.map((q) => {
                  const ans = selectedAnswers[q.id];
                  const isDone = ans !== undefined;
                  const isRight = isDone && ans === q.correctIndex;
                  return (
                    <button
                      key={`mc-nav-${q.id}`}
                      type="button"
                      onClick={() => {
                        if (!showPart1 || (activeFilter !== 'ALL' && activeFilter !== 'PART_1' && activeFilter !== q.level)) {
                          setActiveFilter('ALL');
                        }
                        setTimeout(() => {
                          const el = document.getElementById(`quiz-question-${q.id}`);
                          if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        }, 50);
                      }}
                      title={`Phần I - Câu ${q.id} (${q.level}): ${
                        !isDone ? 'Chưa làm' : isRight ? 'Đúng (+1,0đ)' : 'Sai (0đ)'
                      }`}
                      className={`w-7 h-7 rounded-lg font-mono text-[11px] font-bold border transition-all cursor-pointer flex items-center justify-center ${
                        !isDone
                          ? 'bg-white border-slate-200 text-slate-600 hover:border-slate-400 hover:scale-105'
                          : isRight
                          ? 'bg-emerald-600 border-emerald-700 text-white shadow-xs hover:scale-105'
                          : 'bg-red-500 border-red-600 text-white shadow-xs hover:scale-105'
                      }`}
                    >
                      {q.id}
                    </button>
                  );
                })}

                <span className="text-[11px] font-semibold text-slate-500 ml-2 mr-1">
                  Phần II (Đ/S):
                </span>
                {tfQuestionResults.map((tfRes) => {
                  return (
                    <button
                      key={`tf-nav-${tfRes.id}`}
                      type="button"
                      onClick={() => {
                        if (!showPart2) {
                          setActiveFilter('ALL');
                        }
                        setTimeout(() => {
                          const el = document.getElementById(`tf-question-${tfRes.id}`);
                          if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        }, 50);
                      }}
                      title={`Phần II - Câu Đúng/Sai ${tfRes.id}: ${
                        !tfRes.isComplete
                          ? `Đã chọn ${tfRes.selectedCount}/4 ý`
                          : `Đúng ${tfRes.correctSubCount}/4 ý (+${formatScore(tfRes.points)}đ)`
                      }`}
                      className={`px-2 h-7 rounded-lg font-mono text-[11px] font-bold border transition-all cursor-pointer flex items-center justify-center ${
                        !tfRes.isComplete
                          ? 'bg-white border-amber-300 text-amber-800 hover:border-amber-500 hover:scale-105'
                          : tfRes.correctSubCount === 4
                          ? 'bg-emerald-600 border-emerald-700 text-white shadow-xs hover:scale-105'
                          : tfRes.correctSubCount >= 1
                          ? 'bg-amber-500 border-amber-600 text-slate-950 shadow-xs hover:scale-105'
                          : 'bg-red-500 border-red-600 text-white shadow-xs hover:scale-105'
                      }`}
                    >
                      Đ/S {tfRes.id}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Filter by Section / Difficulty Level */}
          <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-3 bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
            <div className="text-xs font-semibold text-slate-600">
              Bộ lọc phần thi &amp; mức độ câu hỏi:
            </div>
            <div className="flex flex-wrap items-center gap-1 p-1 bg-slate-100 rounded-xl">
              {(
                [
                  { id: 'ALL', label: `Toàn bộ đề (${totalQuestions} câu · 10đ)` },
                  { id: 'PART_1', label: `I. Trắc nghiệm (${totalMcQuestions} câu · 8đ)` },
                  { id: 'Thông hiểu', label: `a) Thông hiểu (${thongHieuCount} câu)` },
                  { id: 'Vận dụng', label: `b) Vận dụng (${vanDungCount} câu)` },
                  ...(vanDungCaoCount > 0 ? [{ id: 'Vận dụng cao' as const, label: `c) Vận dụng cao (${vanDungCaoCount} câu)` }] : []),
                  { id: 'PART_2', label: `II. Đúng / Sai (${totalTfQuestions} câu · 2đ)` },
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
                <div className="space-y-0.5">
                  <div className="text-xs font-mono font-bold text-sky-300 uppercase tracking-wider">
                    Phần I · Trắc nghiệm 4 phương án lựa chọn (A, B, C, D)
                  </div>
                  <h3 className="font-display text-lg sm:text-xl font-extrabold text-white">
                    I. Trắc nghiệm ({totalMcQuestions} câu · Tối đa 8,0 điểm)
                  </h3>
                </div>
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span className="px-3 py-1.5 rounded-xl bg-white/10 border border-white/15 font-mono font-bold text-sky-200">
                    Mỗi câu đúng: +1,0 điểm
                  </span>
                  <span className="px-3 py-1.5 rounded-xl bg-sky-400 text-slate-950 font-mono font-extrabold">
                    Điểm Phần I: {mcScoreStr} / 8,0 đ
                  </span>
                </div>
              </div>

              {displayedMcQuestions.map((q, idx) => {
                const userChoice = selectedAnswers[q.id];
                const isAnswered = userChoice !== undefined;
                const isCorrect = isAnswered && userChoice === q.correctIndex;
                const optionLabels = ['A', 'B', 'C', 'D'];

                const prevQuestion = idx > 0 ? displayedMcQuestions[idx - 1] : null;
                const showSectionHeader =
                  !prevQuestion || prevQuestion.sectionCode !== q.sectionCode;

                const sectionHeaderTitle =
                  q.sectionCode === 'a'
                    ? 'a) Thông hiểu (Câu 1 – Câu 4)'
                    : 'b) Vận dụng (Câu 5 – Câu 8)';

                return (
                  <React.Fragment key={q.id}>
                    {showSectionHeader && (
                      <div className="pt-2 flex items-center gap-3">
                        <span className="px-3.5 py-1.5 rounded-xl bg-sky-100 border border-sky-200 font-display text-xs sm:text-sm font-extrabold text-sky-900">
                          {sectionHeaderTitle}
                        </span>
                        <div className="h-px flex-1 bg-slate-200" />
                      </div>
                    )}

                    <div
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
                              {q.sectionCode}) {q.level}
                            </span>
                            <span aria-hidden="true">·</span>
                            <span>{q.topic}</span>
                          </div>

                          {isAnswered && (
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

                          let btnStyle =
                            'bg-slate-50 border-slate-200 text-slate-800 hover:bg-sky-50/60 hover:border-sky-300';
                          if (isAnswered) {
                            if (isThisCorrectOption) {
                              btnStyle =
                                'bg-emerald-50 border-emerald-400 text-emerald-950 font-semibold';
                            } else if (isThisSelected && !isThisCorrectOption) {
                              btnStyle = 'bg-red-50 border-red-300 text-red-950 font-medium';
                            } else {
                              btnStyle = 'bg-slate-50 border-slate-200 text-slate-700';
                            }
                          }

                          return (
                            <button
                              key={optIdx}
                              type="button"
                              disabled={isAnswered}
                              onClick={() => handleSelectOption(q, optIdx)}
                              className={`p-3.5 rounded-xl border text-left text-sm transition-all flex items-start justify-between gap-3 ${btnStyle} ${
                                isAnswered ? 'cursor-default' : 'cursor-pointer'
                              }`}
                            >
                              <div className="flex items-start gap-2.5">
                                <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-800 shrink-0 mt-0.5">
                                  {optionLabels[optIdx]}.
                                </span>
                                <span className="leading-relaxed">{optText}</span>
                              </div>

                              {isAnswered && isThisCorrectOption && (
                                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-1" />
                              )}
                              {isAnswered && isThisSelected && !isThisCorrectOption && (
                                <XCircle className="w-4 h-4 text-red-600 shrink-0 mt-1" />
                              )}
                            </button>
                          );
                        })}
                      </div>

                      {/* Immediate Short Explanation */}
                      {isAnswered && (
                        <motion.div
                          initial={{ opacity: 0, y: 4 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.15 }}
                          className={`p-4 rounded-xl border text-xs sm:text-sm leading-relaxed ${
                            isCorrect
                              ? 'bg-emerald-50/70 border-emerald-200 text-slate-800'
                              : 'bg-amber-50/80 border-amber-200 text-slate-800'
                          }`}
                        >
                          <div className="font-bold text-slate-900 mb-1">
                            {isCorrect
                              ? `Giải thích (Đáp án ${optionLabels[q.correctIndex]}):`
                              : `Giải thích (Đáp án đúng là ${optionLabels[q.correctIndex]}):`}
                          </div>
                          <p>{q.explanation}</p>
                        </motion.div>
                      )}
                    </div>
                  </React.Fragment>
                );
              })}
            </div>
          )}

          {/* ==================== PHẦN II: TRẮC NGHIỆM ĐÚNG / SAI (2,0 ĐIỂM) ==================== */}
          {showPart2 && (
            <div className="space-y-4 pt-2">
              <div className="bg-gradient-to-r from-slate-900 via-amber-950 to-slate-900 text-white rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
                <div className="space-y-0.5">
                  <div className="text-xs font-mono font-bold text-amber-300 uppercase tracking-wider">
                    Phần II · Câu trắc nghiệm Đúng / Sai (Mỗi câu gồm 4 ý a, b, c, d)
                  </div>
                  <h3 className="font-display text-lg sm:text-xl font-extrabold text-white">
                    II. Trắc nghiệm Đúng / Sai ({totalTfQuestions} câu · Tối đa 2,0 điểm)
                  </h3>
                </div>
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span className="px-3 py-1.5 rounded-xl bg-white/10 border border-white/15 font-mono font-bold text-amber-200">
                    1 ý: 0,1đ · 2 ý: 0,25đ · 3 ý: 0,5đ · 4 ý: 1,0đ
                  </span>
                  <span className="px-3 py-1.5 rounded-xl bg-amber-400 text-slate-950 font-mono font-extrabold">
                    Điểm Phần II: {tfScoreStr} / 2,0 đ
                  </span>
                </div>
              </div>

              {TRUE_FALSE_QUESTIONS.map((tfQ) => {
                const currentEntry = tfAnswers[tfQ.id] || {};
                const tfRes = tfQuestionResults.find((r) => r.id === tfQ.id)!;
                const isGraded = tfRes.isComplete;

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
                            Phần II · {tfQ.title}
                          </span>
                          <span aria-hidden="true">·</span>
                          <span className="font-semibold text-slate-700">{tfQ.topic}</span>
                        </div>

                        {!isGraded ? (
                          <span className="font-mono text-xs font-bold text-amber-700">
                            Đã chọn {tfRes.selectedCount}/4 ý (Chọn đủ 4 ý a, b, c, d để chấm điểm)
                          </span>
                        ) : (
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
                        )}
                      </div>

                      <h4 className="font-display text-base sm:text-lg font-bold text-slate-900 leading-snug">
                        {tfQ.stem}
                      </h4>
                    </div>

                    {/* 4 Statements Table / List */}
                    <div className="space-y-2.5">
                      {tfQ.statements.map((st) => {
                        const userVal = currentEntry[st.id];
                        const isStAnswered = userVal !== undefined;
                        const isStRight = isGraded && userVal === st.isTrue;

                        let rowBorder = 'bg-slate-50 border-slate-200';
                        if (isGraded) {
                          rowBorder = isStRight
                            ? 'bg-emerald-50/70 border-emerald-300'
                            : 'bg-red-50/70 border-red-300';
                        } else if (isStAnswered) {
                          rowBorder = 'bg-sky-50/50 border-sky-300';
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

                              <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                                <button
                                  type="button"
                                  disabled={isGraded}
                                  onClick={() =>
                                    handleSelectTrueFalseStatement(tfQ, st.id, true)
                                  }
                                  className={`px-3.5 py-1.5 rounded-lg font-display text-xs font-extrabold border transition-all ${
                                    userVal === true
                                      ? isGraded
                                        ? st.isTrue
                                          ? 'bg-emerald-600 border-emerald-700 text-white'
                                          : 'bg-red-600 border-red-700 text-white'
                                        : 'bg-sky-600 border-sky-700 text-white shadow-xs'
                                      : 'bg-white border-slate-300 text-slate-700 hover:border-sky-400'
                                  } ${isGraded ? 'cursor-default' : 'cursor-pointer'}`}
                                >
                                  Đúng
                                </button>

                                <button
                                  type="button"
                                  disabled={isGraded}
                                  onClick={() =>
                                    handleSelectTrueFalseStatement(tfQ, st.id, false)
                                  }
                                  className={`px-3.5 py-1.5 rounded-lg font-display text-xs font-extrabold border transition-all ${
                                    userVal === false
                                      ? isGraded
                                        ? !st.isTrue
                                          ? 'bg-emerald-600 border-emerald-700 text-white'
                                          : 'bg-red-600 border-red-700 text-white'
                                        : 'bg-sky-600 border-sky-700 text-white shadow-xs'
                                      : 'bg-white border-slate-300 text-slate-700 hover:border-sky-400'
                                  } ${isGraded ? 'cursor-default' : 'cursor-pointer'}`}
                                >
                                  Sai
                                </button>
                              </div>
                            </div>

                            {isGraded && (
                              <div className="pt-2 border-t border-slate-200/80 flex items-start gap-2 text-xs text-slate-700">
                                {isStRight ? (
                                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                                ) : (
                                  <XCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                                )}
                                <div>
                                  <strong className="text-slate-900">
                                    Đáp án ý {st.id}: {st.isTrue ? 'Đúng' : 'Sai'}.
                                  </strong>{' '}
                                  {st.explanation}
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* Graded Summary Bar for this True/False Question */}
                    {isGraded && (
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
                          (Quy tắc: 1 ý = 0,1đ · 2 ý = 0,25đ · 3 ý = 0,5đ · 4 ý = 1,0đ).
                        </div>
                        <span className="font-mono text-sm font-extrabold text-indigo-700">
                          Điểm đạt được: +{formatScore(tfRes.points)} / 1,0 điểm
                        </span>
                      </motion.div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Celebratory Completion Banner when all questions are answered */}
          {answeredCount === totalQuestions && (
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              className="bg-gradient-to-r from-sky-900 via-indigo-950 to-emerald-950 text-white border-2 border-amber-400/80 rounded-2xl p-5 sm:p-6 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-amber-300 uppercase tracking-wider">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>
                    Chúc mừng hoàn thành 100% đề kiểm tra ({totalMcQuestions} câu Trắc nghiệm + {totalTfQuestions} câu Đúng/Sai)
                  </span>
                </div>
                <h3 className="font-display text-xl sm:text-2xl font-extrabold text-white">
                  Tuyệt vời, {student.fullName}! Bạn đạt {scoreOutOf10} / 10 điểm ({currentGradeLabel})
                </h3>
                <p className="text-xs text-slate-200 leading-relaxed">
                  Điểm Phần I (Trắc nghiệm): <strong className="text-sky-300">{mcScoreStr}/7,0đ</strong> ({correctMcCount}/{totalMcQuestions} câu) · Điểm Phần II (Đúng/Sai): <strong className="text-amber-300">{tfScoreStr}/3,0đ</strong>. Hãy bấm lưu điểm bên dưới để ghi danh vào Bảng xếp hạng Top 5 của lớp!
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                <button
                  type="button"
                  onClick={triggerCelebrationFireworks}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-display text-xs font-extrabold transition-all cursor-pointer shadow-sm"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Bắn pháo hoa chúc mừng</span>
                </button>
              </div>
            </motion.div>
          )}

          {/* PHIẾU KẾT QUẢ HỌC TẬP CÁ NHÂN & PHÂN TÍCH NĂNG LỰC */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-6 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div className="space-y-1">
                <div className="text-xs font-bold text-indigo-600">
                  Phiếu Điểm &amp; Đánh Giá Năng Lực Hóa Học 10 (Cấu trúc 7,0đ Trắc nghiệm + 3,0đ Đúng/Sai)
                </div>
                <h3 className="font-display text-xl font-extrabold text-slate-900">
                  Học sinh: {student.fullName} · Lớp {student.className} · STT {student.rollNumber}
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
                  disabled={answeredCount === 0 || savedCurrentAttempt}
                  className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-display text-xs font-extrabold transition-colors whitespace-nowrap shrink-0 ${
                    savedCurrentAttempt
                      ? 'bg-emerald-600 text-white cursor-default'
                      : answeredCount === 0
                      ? 'bg-slate-200 text-slate-700 cursor-not-allowed'
                      : 'bg-slate-900 text-white hover:bg-slate-800 cursor-pointer'
                  }`}
                >
                  <ClipboardCheck className="w-4 h-4" />
                  <span>
                    {savedCurrentAttempt
                      ? 'Đã lưu vào Bảng điểm Giáo viên'
                      : 'Lưu điểm vào Bảng kết quả lớp'}
                  </span>
                </button>
              </div>
            </div>

            {/* 4 Skill Matrix Bars */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {skillBreakdown.map((item) => (
                <div
                  key={item.title}
                  className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-800">{item.title}</span>
                    <span className="font-mono font-extrabold text-indigo-700">
                      Đúng {item.correct}/{item.total} {item.unit} ({item.pct}%)
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
                    Điểm tổng kết: {scoreOutOf10} / 10 điểm (Phần I: {mcScoreStr}đ + Phần II: {tfScoreStr}đ) · Xếp loại: {currentGradeLabel}
                  </div>
                  <div className="text-slate-300 mt-0.5">
                    {numericScore >= 8.0
                      ? 'Nhận xét: Nắm rất vững lý thuyết và vận dụng xuất sắc quy luật biến đổi bán kính nguyên tử trong chu kì và nhóm A!'
                      : numericScore >= 5.0
                      ? 'Nhận xét: Đã nắm được kiến thức cơ bản trong chu kì và nhóm A; nên rèn luyện thêm các câu Vận dụng cao và Đúng/Sai.'
                      : 'Nhận xét: Hãy hoàn thành tất cả các câu hỏi Phần I và Phần II, đồng thời xem lại mục Lý thuyết trọng tâm (Mục 2) để cải thiện điểm số.'}
                  </div>
                </div>
              </div>
            </div>
          </div>
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
                Bảng Vàng Thi Đua Học Tập · Cập nhật tự động khi lưu điểm
              </div>
              <h3 className="font-display text-lg font-extrabold text-slate-900">
                Bảng Xếp Hạng Top 5 Học Sinh Điểm Cao Nhất Theo Lớp
              </h3>
            </div>
          </div>

          {/* Class Filter Tabs */}
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
            Chưa có học sinh nào trong lớp này lưu điểm. Hãy hoàn thành bài tập và bấm "Lưu điểm" để ghi danh lên Bảng xếp hạng Top 5!
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
                        Lớp {item.className} · STT {item.rollNumber}
                      </span>
                    </div>

                    <div className="font-display text-base font-extrabold text-slate-900 truncate">
                      {item.fullName}
                    </div>
                  </div>

                  <div className="space-y-1.5 pt-2 border-t border-slate-200/70">
                    <div className="flex items-baseline justify-between">
                      <span className="font-mono text-lg font-extrabold text-indigo-700 tabular-nums">
                        {item.scoreOutOf10} đ
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

      {/* BẢNG ĐIỀU KHIỂN GIÁO VIÊN & XUẤT FILE EXCEL (.CSV) */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 space-y-5 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
              <BarChart2 className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-indigo-600">
                Công cụ quản lý dành cho Giáo viên &amp; Lớp học
              </div>
              <h3 className="font-display text-lg font-extrabold text-slate-900">
                Bảng Tổng Hợp Kết Quả Lớp &amp; Xuất File Điểm Excel (.CSV)
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
              <span>Nạp dữ liệu mẫu học sinh (Demo cho Giáo viên)</span>
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
              <span>Xuất bảng điểm ra Excel (.CSV)</span>
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

        {/* Class Summary KPI Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-xs text-slate-500 block">Tổng số lượt nộp bài</span>
            <span className="font-mono text-xl font-extrabold text-slate-900 tabular-nums">
              {teacherStats.count} học sinh
            </span>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-xs text-slate-500 block">Điểm trung bình chung</span>
            <span className="font-mono text-xl font-extrabold text-indigo-700 tabular-nums">
              {teacherStats.avgScore} / 10
            </span>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-xs text-slate-500 block">Điểm cao nhất</span>
            <span className="font-mono text-xl font-extrabold text-emerald-700 tabular-nums">
              {teacherStats.maxScore} điểm
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
              Chưa có lượt lưu điểm nào. Học sinh có thể làm bài rồi bấm{' '}
              <strong>"Lưu điểm vào Bảng kết quả lớp"</strong>, hoặc bấm nút{' '}
              <strong>"Nạp dữ liệu mẫu học sinh"</strong> ở trên để xem thử tính năng Xuất file Excel!
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-600 bg-slate-50">
                  <th className="py-2.5 px-3 font-semibold">STT</th>
                  <th className="py-2.5 px-3 font-semibold">Họ và tên học sinh</th>
                  <th className="py-2.5 px-3 font-semibold">Lớp</th>
                  <th className="py-2.5 px-3 font-semibold">I. Trắc nghiệm (8đ)</th>
                  <th className="py-2.5 px-3 font-semibold">II. Đúng/Sai (2đ)</th>
                  <th className="py-2.5 px-3 font-semibold">Tổng điểm</th>
                  <th className="py-2.5 px-3 font-semibold">Xếp loại</th>
                  <th className="py-2.5 px-3 font-semibold">Thời gian</th>
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
