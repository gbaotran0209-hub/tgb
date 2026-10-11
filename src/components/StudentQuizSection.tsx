import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion } from 'motion/react';
import confetti from 'canvas-confetti';
import { QUIZ_QUESTIONS, QuizQuestion } from '../data/questions';
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
  scoreOutOf10: string;
  gradeLabel: string;
  completedAt: string;
}

interface StudentQuizSectionProps {
  student: StudentProfile | null;
  onLoginStudent: (profile: StudentProfile) => void;
  onLogoutStudent: () => void;
}

const STORAGE_KEY_HISTORY = 'hoa10_student_quiz_history_v2';

function getGradeLabel(score: number): string {
  if (score >= 9.0) return 'Xuất sắc';
  if (score >= 8.0) return 'Giỏi';
  if (score >= 6.5) return 'Khá';
  if (score >= 5.0) return 'Đạt';
  return 'Cần ôn tập thêm';
}

const DEMO_RECORDS: StudentAttemptRecord[] = [
  {
    id: 'demo-1',
    rollNumber: '07',
    fullName: 'Trần Minh Châu',
    className: '10A1',
    correctCount: 18,
    totalQuestions: 18,
    scoreOutOf10: '10.0',
    gradeLabel: 'Xuất sắc',
    completedAt: '08:15 · Hôm nay',
  },
  {
    id: 'demo-2',
    rollNumber: '14',
    fullName: 'Nguyễn Hoàng Hải',
    className: '10A1',
    correctCount: 16,
    totalQuestions: 18,
    scoreOutOf10: '8.9',
    gradeLabel: 'Giỏi',
    completedAt: '08:12 · Hôm nay',
  },
  {
    id: 'demo-3',
    rollNumber: '22',
    fullName: 'Lê Thu Phương',
    className: '10A1',
    correctCount: 15,
    totalQuestions: 18,
    scoreOutOf10: '8.3',
    gradeLabel: 'Giỏi',
    completedAt: '08:10 · Hôm nay',
  },
  {
    id: 'demo-4',
    rollNumber: '09',
    fullName: 'Đặng Quốc Khánh',
    className: '10A1',
    correctCount: 14,
    totalQuestions: 18,
    scoreOutOf10: '7.8',
    gradeLabel: 'Khá',
    completedAt: '08:08 · Hôm nay',
  },
  {
    id: 'demo-5',
    rollNumber: '31',
    fullName: 'Vũ Ngọc Ánh',
    className: '10A1',
    correctCount: 13,
    totalQuestions: 18,
    scoreOutOf10: '7.2',
    gradeLabel: 'Khá',
    completedAt: '08:06 · Hôm nay',
  },
  {
    id: 'demo-6',
    rollNumber: '05',
    fullName: 'Hoàng Gia Bảo',
    className: '10A2',
    correctCount: 17,
    totalQuestions: 18,
    scoreOutOf10: '9.4',
    gradeLabel: 'Xuất sắc',
    completedAt: '08:14 · Hôm nay',
  },
  {
    id: 'demo-7',
    rollNumber: '18',
    fullName: 'Phạm Quốc Tuấn',
    className: '10A2',
    correctCount: 15,
    totalQuestions: 18,
    scoreOutOf10: '8.3',
    gradeLabel: 'Giỏi',
    completedAt: '08:05 · Hôm nay',
  },
  {
    id: 'demo-8',
    rollNumber: '12',
    fullName: 'Bùi Thanh Hà',
    className: '10A2',
    correctCount: 14,
    totalQuestions: 18,
    scoreOutOf10: '7.8',
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

  // Quiz state
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [streak, setStreak] = useState<number>(0);
  const [bestStreak, setBestStreak] = useState<number>(0);
  const [levelFilter, setLevelFilter] = useState<'ALL' | 'Cơ bản (Dễ)' | 'Thông hiểu' | 'Vận dụng'>('ALL');
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

    // Center celebratory burst
    confetti({
      particleCount: 90,
      spread: 80,
      origin: { y: 0.6 },
      colors: sgkColors,
    });

    // Left and right firework cannons after a short delay
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

    // Fire celebratory confetti fireworks when the student completes all questions!
    if (Object.keys(nextAnswers).length === QUIZ_QUESTIONS.length) {
      triggerCelebrationFireworks();
    }
  };

  const handleResetQuiz = () => {
    setSelectedAnswers({});
    setStreak(0);
    setBestStreak(0);
    setSavedCurrentAttempt(false);
  };

  const totalQuestions = QUIZ_QUESTIONS.length;
  const answeredCount = Object.keys(selectedAnswers).length;
  const progressPercent = Math.round((answeredCount / totalQuestions) * 100);
  const correctCount = QUIZ_QUESTIONS.reduce((acc, q) => {
    return acc + (selectedAnswers[q.id] === q.correctIndex ? 1 : 0);
  }, 0);
  const numericScore = (correctCount / totalQuestions) * 10;
  const scoreOutOf10 = numericScore.toFixed(1);
  const currentGradeLabel = getGradeLabel(numericScore);

  // Skill diagnostic breakdown for the Student Report Card
  const skillBreakdown = useMemo(() => {
    const groups = [
      {
        title: '1. Khái niệm & Quy luật Chu kì / Nhóm A',
        ids: [1, 2, 3, 9],
      },
      {
        title: '2. Xác định vị trí (Ô · Chu kì · Nhóm A/B)',
        ids: [4, 6],
      },
      {
        title: '3. Giải thích hạt nhân & Liên hệ Độ âm điện',
        ids: [5, 7, 8, 14, 18],
      },
      {
        title: '4. Vận dụng So sánh bắc cầu & Bán kính Ion',
        ids: [10, 11, 12, 13, 15, 16, 17],
      },
    ];

    return groups.map((g) => {
      const total = g.ids.length;
      const answered = g.ids.filter((id) => selectedAnswers[id] !== undefined).length;
      const correct = g.ids.filter((id) => {
        const q = QUIZ_QUESTIONS.find((item) => item.id === id);
        return q && selectedAnswers[id] === q.correctIndex;
      }).length;
      return {
        ...g,
        total,
        answered,
        correct,
        pct: Math.round((correct / total) * 100),
      };
    });
  }, [selectedAnswers]);

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
      'Số câu đúng',
      'Tổng số câu',
      'Điểm (Thang 10)',
      'Xếp loại',
      'Thời gian nộp bài',
    ];
    const rows = attemptHistory.map((item) => [
      `"${item.rollNumber.replace(/"/g, '""')}"`,
      `"${item.fullName.replace(/"/g, '""')}"`,
      `"${item.className.replace(/"/g, '""')}"`,
      item.correctCount,
      item.totalQuestions,
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
        if (b.correctCount !== a.correctCount) {
          return b.correctCount - a.correctCount;
        }
        return (parseFloat(b.scoreOutOf10) || 0) - (parseFloat(a.scoreOutOf10) || 0);
      })
      .slice(0, 5);
  }, [attemptHistory, leaderboardClassFilter]);

  const displayedQuestions: QuizQuestion[] =
    levelFilter === 'ALL'
      ? QUIZ_QUESTIONS
      : QUIZ_QUESTIONS.filter((q) => q.level === levelFilter);

  const easyCount = QUIZ_QUESTIONS.filter((q) => q.level === 'Cơ bản (Dễ)').length;
  const mediumCount = QUIZ_QUESTIONS.filter((q) => q.level === 'Thông hiểu').length;
  const hardCount = QUIZ_QUESTIONS.filter((q) => q.level === 'Vận dụng').length;

  return (
    <div className="space-y-6">
      {!student ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-6 space-y-5">
              <div className="inline-flex items-center gap-2 text-xs font-extrabold text-sky-700">
                <Trophy className="w-4 h-4" />
                <span>Đấu trường Trắc nghiệm Hóa học 10 · {totalQuestions} Câu hỏi toàn diện</span>
              </div>
              <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-slate-900 leading-tight">
                Đăng nhập Tài khoản Học sinh để bắt đầu thử thách
              </h2>
              <p className="text-sm text-slate-600 leading-relaxed">
                Chinh phục <strong>{totalQuestions} câu hỏi trắc nghiệm</strong> bao gồm Vị trí nguyên tố (Ô, Chu kì, Nhóm A/B), Quy luật Bán kính nguyên tử, Bán kính Ion và Liên hệ Độ âm điện. Hệ thống tự báo <strong>Đúng / Sai</strong>, phân tích năng lực từng phần và xuất bảng điểm Excel cho giáo viên!
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3.5 rounded-xl bg-sky-50/80 border border-sky-200">
                  <div className="font-display text-lg font-extrabold text-sky-900">
                    {easyCount} câu Dễ
                  </div>
                  <div className="text-xs text-sky-800 mt-0.5">Nhận biết khái niệm & quy luật SGK</div>
                </div>
                <div className="p-3.5 rounded-xl bg-indigo-50/80 border border-indigo-200">
                  <div className="font-display text-lg font-extrabold text-indigo-900">
                    {mediumCount} câu Thông hiểu
                  </div>
                  <div className="text-xs text-indigo-800 mt-0.5">Giải thích hạt nhân & Độ âm điện</div>
                </div>
                <div className="p-3.5 rounded-xl bg-amber-50/80 border border-amber-200">
                  <div className="font-display text-lg font-extrabold text-amber-900">
                    {hardCount} câu Vận dụng
                  </div>
                  <div className="text-xs text-amber-800 mt-0.5">So sánh bắc cầu & Bán kính Ion</div>
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
                  <label htmlFor="student-fullname" className="block text-xs font-bold text-slate-800">
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
                    <label htmlFor="student-class" className="block text-xs font-bold text-slate-800">
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
                    <label htmlFor="student-roll" className="block text-xs font-bold text-slate-800">
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
                    Bắt đầu làm bài ngay ({totalQuestions} câu hỏi)
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
                    Số thứ tự: <strong className="font-mono text-slate-900">{student.rollNumber}</strong>
                  </span>
                </div>
                <h2 className="font-display text-xl sm:text-2xl font-extrabold text-slate-900">
                  {student.fullName}
                </h2>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <div className="flex flex-wrap items-center gap-3 sm:gap-4 px-3 sm:px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                  <div>
                    <span className="text-slate-500 block">Tiến độ</span>
                    <span className="font-mono text-sm font-extrabold text-slate-900 tabular-nums">
                      {answeredCount}/{totalQuestions}
                    </span>
                  </div>
                  <div className="h-7 w-px bg-slate-200" />
                  <div>
                    <span className="text-slate-500 block">Đúng</span>
                    <span className="font-mono text-sm font-extrabold text-emerald-700 tabular-nums">
                      {correctCount} câu
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
                    <span className="text-slate-500 block">Điểm số</span>
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

            {/* Visual Progress Bar & Interactive Question Completion Map */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/90 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900">
                    Thanh tiến trình làm bài:
                  </span>
                  <span className="font-mono font-extrabold text-indigo-700 text-sm tabular-nums">
                    Đã làm {answeredCount} / {totalQuestions} câu ({progressPercent}%)
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
                        chưa trả lời
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

              {/* Segmented Question Completion Map (Click to jump to any question) */}
              <div className="pt-1 flex flex-wrap items-center gap-1.5">
                <span className="text-[11px] font-semibold text-slate-500 mr-1">
                  Sơ đồ câu hỏi:
                </span>
                {QUIZ_QUESTIONS.map((q) => {
                  const ans = selectedAnswers[q.id];
                  const isDone = ans !== undefined;
                  const isRight = isDone && ans === q.correctIndex;
                  return (
                    <button
                      key={q.id}
                      type="button"
                      onClick={() => {
                        if (levelFilter !== 'ALL' && levelFilter !== q.level) {
                          setLevelFilter('ALL');
                        }
                        setTimeout(() => {
                          const el = document.getElementById(`quiz-question-${q.id}`);
                          if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        }, 50);
                      }}
                      title={`Câu ${q.id}: ${
                        !isDone ? 'Chưa làm' : isRight ? 'Đã trả lời Đúng' : 'Đã trả lời Sai'
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
              </div>
            </div>
          </div>

          {/* Filter by Difficulty Level */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
            <div className="text-xs font-semibold text-slate-600">
              Chọn mức độ câu hỏi (Bấm trực tiếp vào phương án A, B, C, D để chấm điểm tức thì):
            </div>
            <div className="flex flex-wrap items-center gap-1 p-1 bg-slate-100 rounded-xl">
              {(
                [
                  { id: 'ALL', label: `Tất cả (${QUIZ_QUESTIONS.length} câu)` },
                  { id: 'Cơ bản (Dễ)', label: `Cơ bản / Dễ (${easyCount} câu)` },
                  { id: 'Thông hiểu', label: `Thông hiểu (${mediumCount} câu)` },
                  { id: 'Vận dụng', label: `Vận dụng (${hardCount} câu)` },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setLevelFilter(tab.id)}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    levelFilter === tab.id
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Questions List */}
          <div className="space-y-4">
            {displayedQuestions.map((q) => {
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
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-extrabold text-indigo-700">
                          Câu {q.id}/{totalQuestions}
                        </span>
                        <span aria-hidden="true">·</span>
                        <span>
                          Mức độ: <strong className="text-slate-800">{q.level}</strong>
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
                              <span>Chính xác! (+1 câu đúng)</span>
                            </>
                          ) : (
                            <>
                              <XCircle className="w-4 h-4" />
                              <span>
                                Chưa đúng (Đáp án là {optionLabels[q.correctIndex]})
                              </span>
                            </>
                          )}
                        </div>
                      )}
                    </div>

                    <h3 className="font-display text-base sm:text-lg font-bold text-slate-900 leading-snug">
                      {q.question}
                    </h3>
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
                          btnStyle = 'bg-red-50 border-red-300 text-red-950';
                        } else {
                          btnStyle = 'bg-slate-50/40 border-slate-200/50 text-slate-400';
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
                              {optionLabels[optIdx]}
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
                          ? 'Giải thích vì sao đúng:'
                          : `Giải thích (Đáp án đúng là ${optionLabels[q.correctIndex]}):`}
                      </div>
                      <p>{q.explanation}</p>
                    </motion.div>
                  )}
                </div>
              );
            })}
          </div>

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
                  <span>Chúc mừng hoàn thành 100% bộ câu hỏi ({totalQuestions}/{totalQuestions} câu)</span>
                </div>
                <h3 className="font-display text-xl sm:text-2xl font-extrabold text-white">
                  Tuyệt vời, {student.fullName}! Bạn đạt {scoreOutOf10} / 10 điểm ({currentGradeLabel})
                </h3>
                <p className="text-xs text-slate-200 leading-relaxed">
                  Bạn đã trả lời đúng <strong className="text-emerald-300">{correctCount}/{totalQuestions} câu</strong>. Hãy bấm lưu điểm bên dưới để ghi danh vào Bảng xếp hạng Top 5 của lớp!
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

          {/* IDEA 3 PART A: PHIẾU KẾT QUẢ HỌC TẬP CÁ NHÂN & PHÂN TÍCH NĂNG LỰC */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-6 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div className="space-y-1">
                <div className="text-xs font-bold text-indigo-600">
                  Phiếu Đánh Giá Năng Lực Hóa Học 10 (Tự động phân tích theo chủ đề)
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
                      ? 'bg-slate-200 text-slate-500 cursor-not-allowed'
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
                      Đúng {item.correct}/{item.total} câu ({item.pct}%)
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
                    Điểm tổng kết: {scoreOutOf10} / 10 điểm · Xếp loại: {currentGradeLabel}
                  </div>
                  <div className="text-slate-300 mt-0.5">
                    {numericScore >= 8.0
                      ? 'Nhận xét: Nắm rất vững quy luật biến đổi tuần hoàn bán kính nguyên tử, bán kính ion và phương pháp so sánh bắc cầu!'
                      : numericScore >= 5.0
                      ? 'Nhận xét: Đã nắm được kiến thức cơ bản trong chu kì và nhóm A; nên luyện tập thêm các câu so sánh bán kính ion và bắc cầu.'
                      : 'Nhận xét: Hãy hoàn thành tất cả các câu hỏi và xem lại mục Giải thích quy luật để cải thiện điểm số.'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TOP 5 LEADERBOARD BY CLASS (BẢNG XẾP HẠNG TOP 5 HỌC SINH THEO LỚP) */}
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
                        {item.correctCount}/{item.totalQuestions} câu
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

      {/* IDEA 3 PART B: BẢNG ĐIỀU KHIỂN GIÁO VIÊN & XUẤT FILE EXCEL (.CSV) */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 space-y-5 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
              <BarChart2 className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-indigo-600">
                Công cụ quản lý dành cho Giáo viên & Lớp học
              </div>
              <h3 className="font-display text-lg font-extrabold text-slate-900">
                Bảng Tổng Hợp Kết Quả Lớp & Xuất File Điểm Excel (.CSV)
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
              <span>Nạp dữ liệu mẫu 4 học sinh (Demo cho Giáo viên)</span>
            </button>

            <button
              type="button"
              onClick={handleExportCSV}
              disabled={attemptHistory.length === 0}
              className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
                attemptHistory.length === 0
                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
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
              Chưa có lượt lưu điểm nào. Học sinh có thể làm bài rồi bấm <strong>"Lưu điểm vào Bảng kết quả lớp"</strong>, hoặc bạn có thể bấm nút <strong>"Nạp dữ liệu mẫu 4 học sinh"</strong> ở trên để trình chiếu thử tính năng Xuất file Excel cho giáo viên xem!
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500">
                  <th className="py-2.5 px-3 font-semibold">STT</th>
                  <th className="py-2.5 px-3 font-semibold">Họ và tên học sinh</th>
                  <th className="py-2.5 px-3 font-semibold">Lớp</th>
                  <th className="py-2.5 px-3 font-semibold">Số câu đúng</th>
                  <th className="py-2.5 px-3 font-semibold">Điểm (Thang 10)</th>
                  <th className="py-2.5 px-3 font-semibold">Xếp loại</th>
                  <th className="py-2.5 px-3 font-semibold">Thời gian nộp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {attemptHistory.map((item) => {
                  const grade = item.gradeLabel || getGradeLabel(Number(item.scoreOutOf10));
                  return (
                    <tr key={item.id} className="hover:bg-slate-50">
                      <td className="py-2.5 px-3 font-mono font-bold text-slate-800 tabular-nums">
                        {item.rollNumber}
                      </td>
                      <td className="py-2.5 px-3 font-bold text-slate-900">
                        {item.fullName}
                      </td>
                      <td className="py-2.5 px-3 text-slate-700 font-medium">{item.className}</td>
                      <td className="py-2.5 px-3 font-mono tabular-nums text-emerald-700 font-bold">
                        {item.correctCount} / {item.totalQuestions}
                      </td>
                      <td className="py-2.5 px-3 font-mono tabular-nums font-extrabold text-indigo-700">
                        {item.scoreOutOf10} điểm
                      </td>
                      <td className="py-2.5 px-3 font-semibold text-slate-800">
                        {grade}
                      </td>
                      <td className="py-2.5 px-3 font-mono text-slate-500 tabular-nums">
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
