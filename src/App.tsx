/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ELEMENT_BY_Z, ChemicalElement } from './data/elements';
import { PeriodicTableSection } from './components/PeriodicTableSection';
import { AtomicRadiusTheorySection } from './components/AtomicRadiusTheorySection';
import { StudentQuizSection, StudentProfile } from './components/StudentQuizSection';
import { Grid, Compass, Trophy, Atom, Moon, Sun } from 'lucide-react';

type MainModuleTab = 'table' | 'radius' | 'quiz';

const DARK_MODE_STORAGE_KEY = 'hoa10_dark_mode_v1';

export default function App() {
  // Default on first open: ONLY show the Periodic Table ('table')
  const [activeTab, setActiveTab] = useState<MainModuleTab>('table');
  const [tableInitialMode, setTableInitialMode] = useState<'category' | 'radius_heatmap'>('category');
  const [selectedElement, setSelectedElement] = useState<ChemicalElement>(ELEMENT_BY_Z[11]); // Sodium (Na)
  const [student, setStudent] = useState<StudentProfile | null>(null);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    try {
      return localStorage.getItem(DARK_MODE_STORAGE_KEY) === 'true';
    } catch {
      return false;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(DARK_MODE_STORAGE_KEY, String(isDarkMode));
    } catch {
      // Ignore storage errors
    }
  }, [isDarkMode]);

  const handleSwitchTab = useCallback((tab: MainModuleTab) => {
    if (tab !== 'table') {
      setTableInitialMode('category');
    }
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Global Keyboard Shortcuts: Press 1, 2, or 3 to switch tabs rapidly
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore shortcuts if user is typing in an input, textarea, select, or modifier key is pressed
      if (e.ctrlKey || e.altKey || e.metaKey) return;
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT' ||
          target.isContentEditable)
      ) {
        return;
      }

      if (e.key === '1') {
        e.preventDefault();
        handleSwitchTab('table');
      } else if (e.key === '2') {
        e.preventDefault();
        handleSwitchTab('radius');
      } else if (e.key === '3') {
        e.preventDefault();
        handleSwitchTab('quiz');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleSwitchTab]);

  const handleSelectElementFromTheory = (el: ChemicalElement) => {
    setSelectedElement(el);
    setTableInitialMode('category');
    setActiveTab('table');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenHeatmapTable = () => {
    setTableInitialMode('radius_heatmap');
    setActiveTab('table');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div
      className={`min-h-screen flex flex-col chemistry-bg-pattern text-slate-900 ${
        isDarkMode ? 'dark-theme' : ''
      }`}
    >
      {/* Top SGK Accent Ribbon (Sky Blue - Rose Pink - Golden Amber) */}
      <div
        aria-hidden="true"
        className="h-1.5 w-full bg-gradient-to-r from-sky-500 via-pink-500 to-amber-400"
      />

      {/* Strict 3-Zone Top Bar Contract */}
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200/90 shadow-2xs">
        <div className="max-w-[1440px] mx-auto flex items-center justify-between gap-4 sm:gap-8 px-4 sm:px-6 py-3.5">
          {/* Zone 1: Single text element wordmark */}
          <button
            type="button"
            onClick={() => handleSwitchTab('table')}
            className="font-display text-lg font-extrabold tracking-tight text-slate-900 whitespace-nowrap shrink-0 cursor-pointer text-left inline-flex items-center gap-2"
          >
            <Atom className="w-5 h-5 text-sky-500" />
            <span>Hóa Học 10 · Bảng Tuần Hoàn</span>
          </button>

          {/* Zone 2: Clean single-line text navigation links with Keyboard Shortcut Hints */}
          <nav className="hidden lg:flex items-center gap-6 text-sm font-semibold text-slate-600">
            <button
              type="button"
              onClick={() => handleSwitchTab('table')}
              title="Phím tắt: Bấm phím 1"
              className={`transition-colors whitespace-nowrap shrink-0 cursor-pointer inline-flex items-center gap-1.5 ${
                activeTab === 'table'
                  ? 'text-sky-500 font-bold underline underline-offset-8 decoration-2'
                  : 'hover:text-slate-900'
              }`}
            >
              <kbd className="px-1.5 py-0.5 text-[10px] font-mono font-bold rounded bg-slate-200/80 text-slate-700">
                1
              </kbd>
              <span>Bảng tuần hoàn 118 nguyên tố</span>
            </button>
            <button
              type="button"
              onClick={() => handleSwitchTab('radius')}
              title="Phím tắt: Bấm phím 2"
              className={`transition-colors whitespace-nowrap shrink-0 cursor-pointer inline-flex items-center gap-1.5 ${
                activeTab === 'radius'
                  ? 'text-pink-500 font-bold underline underline-offset-8 decoration-2'
                  : 'hover:text-slate-900'
              }`}
            >
              <kbd className="px-1.5 py-0.5 text-[10px] font-mono font-bold rounded bg-slate-200/80 text-slate-700">
                2
              </kbd>
              <span>Quy luật Bán kính nguyên tử</span>
            </button>
            <button
              type="button"
              onClick={() => handleSwitchTab('quiz')}
              title="Phím tắt: Bấm phím 3"
              className={`transition-colors whitespace-nowrap shrink-0 cursor-pointer inline-flex items-center gap-1.5 ${
                activeTab === 'quiz'
                  ? 'text-amber-500 font-bold underline underline-offset-8 decoration-2'
                  : 'hover:text-slate-900'
              }`}
            >
              <kbd className="px-1.5 py-0.5 text-[10px] font-mono font-bold rounded bg-slate-200/80 text-slate-700">
                3
              </kbd>
              <span>Bài tập & Tài khoản Học sinh</span>
            </button>
          </nav>

          {/* Zone 3: Global Dark Mode Toggle + Primary Student Action */}
          <div className="flex items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={() => setIsDarkMode((prev) => !prev)}
              title={isDarkMode ? 'Chuyển sang Giao diện Sáng' : 'Chuyển sang Giao diện Tối (Dark Mode)'}
              aria-label={isDarkMode ? 'Bật giao diện sáng' : 'Bật giao diện tối'}
              className={`px-3 py-2 rounded-xl text-xs font-bold inline-flex items-center gap-1.5 border transition-all cursor-pointer ${
                isDarkMode
                  ? 'bg-slate-800 border-sky-400/70 text-amber-300 hover:bg-slate-700 shadow-sm shadow-sky-500/10'
                  : 'bg-slate-100 border-slate-200 text-slate-800 hover:bg-slate-200'
              }`}
            >
              {isDarkMode ? (
                <>
                  <Sun className="w-3.5 h-3.5 text-amber-400" />
                  <span>Chế độ Sáng</span>
                </>
              ) : (
                <>
                  <Moon className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Dark Mode</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => handleSwitchTab('quiz')}
              className="element-tile-shimmer px-4 py-2 text-xs font-bold text-white bg-gradient-to-r from-slate-900 via-slate-800 to-sky-950 border border-sky-500/30 rounded-xl hover:from-sky-900 hover:to-slate-900 transition-all whitespace-nowrap shrink-0 cursor-pointer shadow-sm"
            >
              {student
                ? `Học sinh: ${student.fullName} (${student.className})`
                : 'Đăng nhập Học sinh & Làm bài'}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Container */}
      <main className="flex-1 max-w-[1440px] w-full mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Big Interactive Module Switcher ("Các mục lớn" để bấm chuyển qua lại hoặc bấm phím 1, 2, 3) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Mục 1: Bảng Tuần Hoàn */}
          <button
            type="button"
            onClick={() => handleSwitchTab('table')}
            className={`element-tile-shimmer group p-4 sm:p-5 rounded-2xl border-2 text-left transition-all duration-200 cursor-pointer flex items-start gap-4 ${
              activeTab === 'table'
                ? 'bg-gradient-to-br from-slate-900 via-sky-950 to-slate-900 text-white border-sky-400 shadow-lg shadow-sky-900/15 -translate-y-0.5'
                : 'bg-white/95 hover:bg-sky-50/70 text-slate-900 border-slate-200 hover:border-sky-400 shadow-xs hover:-translate-y-0.5'
            }`}
          >
            <div
              className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-110 ${
                activeTab === 'table'
                  ? 'bg-sky-400 text-slate-950 shadow-sm'
                  : 'bg-sky-100 text-sky-700 group-hover:bg-sky-200'
              }`}
            >
              <Grid className="w-5 h-5" />
            </div>
            <div className="space-y-1 flex-1">
              <div className="flex items-center justify-between gap-2">
                <span
                  className={`text-[11px] font-mono font-bold uppercase tracking-wider ${
                    activeTab === 'table' ? 'text-sky-300' : 'text-sky-600'
                  }`}
                >
                  Chuyên mục 01 · Màu chuẩn SGK
                </span>
                <kbd
                  className={`px-1.5 py-0.5 text-[10px] font-mono font-bold rounded ${
                    activeTab === 'table'
                      ? 'bg-sky-500/30 text-sky-200 border border-sky-400/40'
                      : 'bg-slate-100 text-slate-600 border border-slate-200'
                  }`}
                >
                  Phím 1
                </kbd>
              </div>
              <div
                className={`font-display text-base sm:text-lg font-extrabold leading-snug ${
                  activeTab === 'table' ? 'text-white' : 'text-slate-900'
                }`}
              >
                Bảng Tuần Hoàn 118 Nguyên Tố
              </div>
              <p
                className={`text-xs leading-relaxed ${
                  activeTab === 'table' ? 'text-slate-300' : 'text-slate-500'
                }`}
              >
                7 chu kì, 18 cột, màu chuẩn SGK (Xanh – Hồng – Vàng), đường ziczac, Mô hình đám mây 3D & So sánh 2 nguyên tố.
              </p>
            </div>
          </button>

          {/* Mục 2: Quy Luật Bán Kính Nguyên Tử */}
          <button
            type="button"
            onClick={() => handleSwitchTab('radius')}
            className={`element-tile-shimmer group p-4 sm:p-5 rounded-2xl border-2 text-left transition-all duration-200 cursor-pointer flex items-start gap-4 ${
              activeTab === 'radius'
                ? 'bg-gradient-to-br from-slate-900 via-rose-950 to-slate-900 text-white border-pink-400 shadow-lg shadow-rose-900/15 -translate-y-0.5'
                : 'bg-white/95 hover:bg-pink-50/70 text-slate-900 border-slate-200 hover:border-pink-400 shadow-xs hover:-translate-y-0.5'
            }`}
          >
            <div
              className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-110 ${
                activeTab === 'radius'
                  ? 'bg-pink-400 text-slate-950 shadow-sm'
                  : 'bg-pink-100 text-rose-700 group-hover:bg-pink-200'
              }`}
            >
              <Compass className="w-5 h-5" />
            </div>
            <div className="space-y-1 flex-1">
              <div className="flex items-center justify-between gap-2">
                <span
                  className={`text-[11px] font-mono font-bold uppercase tracking-wider ${
                    activeTab === 'radius' ? 'text-pink-300' : 'text-rose-600'
                  }`}
                >
                  Chuyên mục 02 · Lý thuyết & Mô phỏng
                </span>
                <kbd
                  className={`px-1.5 py-0.5 text-[10px] font-mono font-bold rounded ${
                    activeTab === 'radius'
                      ? 'bg-pink-500/30 text-pink-200 border border-pink-400/40'
                      : 'bg-slate-100 text-slate-600 border border-slate-200'
                  }`}
                >
                  Phím 2
                </kbd>
              </div>
              <div
                className={`font-display text-base sm:text-lg font-extrabold leading-snug ${
                  activeTab === 'radius' ? 'text-white' : 'text-slate-900'
                }`}
              >
                Quy Luật Bán Kính Nguyên Tử
              </div>
              <p
                className={`text-xs leading-relaxed ${
                  activeTab === 'radius' ? 'text-slate-300' : 'text-slate-500'
                }`}
              >
                Khái niệm · Biến đổi · Giải thích · Máy so sánh · Phòng thí nghiệm Nguyên tử & Ion · Liên hệ Độ âm điện.
              </p>
            </div>
          </button>

          {/* Mục 3: Bài Tập & Tài Khoản Học Sinh */}
          <button
            type="button"
            onClick={() => handleSwitchTab('quiz')}
            className={`element-tile-shimmer group p-4 sm:p-5 rounded-2xl border-2 text-left transition-all duration-200 cursor-pointer flex items-start gap-4 ${
              activeTab === 'quiz'
                ? 'bg-gradient-to-br from-slate-900 via-amber-950 to-slate-900 text-white border-amber-400 shadow-lg shadow-amber-900/15 -translate-y-0.5'
                : 'bg-white/95 hover:bg-amber-50/70 text-slate-900 border-slate-200 hover:border-amber-400 shadow-xs hover:-translate-y-0.5'
            }`}
          >
            <div
              className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-110 ${
                activeTab === 'quiz'
                  ? 'bg-amber-400 text-slate-950 shadow-sm'
                  : 'bg-amber-100 text-amber-800 group-hover:bg-amber-200'
              }`}
            >
              <Trophy className="w-5 h-5" />
            </div>
            <div className="space-y-1 flex-1">
              <div className="flex items-center justify-between gap-2">
                <span
                  className={`text-[11px] font-mono font-bold uppercase tracking-wider ${
                    activeTab === 'quiz' ? 'text-amber-300' : 'text-amber-600'
                  }`}
                >
                  Chuyên mục 03 · Luyện tập & Xếp hạng
                </span>
                <kbd
                  className={`px-1.5 py-0.5 text-[10px] font-mono font-bold rounded ${
                    activeTab === 'quiz'
                      ? 'bg-amber-500/30 text-amber-200 border border-amber-400/40'
                      : 'bg-slate-100 text-slate-600 border border-slate-200'
                  }`}
                >
                  Phím 3
                </kbd>
              </div>
              <div
                className={`font-display text-base sm:text-lg font-extrabold leading-snug ${
                  activeTab === 'quiz' ? 'text-white' : 'text-slate-900'
                }`}
              >
                Bài Tập & Tài Khoản Học Sinh
              </div>
              <p
                className={`text-xs leading-relaxed ${
                  activeTab === 'quiz' ? 'text-slate-300' : 'text-slate-500'
                }`}
              >
                Đăng nhập Họ tên · Lớp · STT, làm 18 câu trắc nghiệm, Bảng xếp hạng Top 5 & Xuất bảng điểm Excel (.CSV).
              </p>
            </div>
          </button>
        </div>

        {/* Active Module Stage: Only renders the chosen section! */}
        <AnimatePresence mode="wait">
          {activeTab === 'table' && (
            <motion.div
              key={`tab-table-${tableInitialMode}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.22 }}
            >
              <PeriodicTableSection
                selectedElement={selectedElement}
                onSelectElement={setSelectedElement}
                onNavigateTab={handleSwitchTab}
                initialColorMode={tableInitialMode}
                isDarkMode={isDarkMode}
              />
            </motion.div>
          )}

          {activeTab === 'radius' && (
            <motion.div
              key="tab-radius"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.22 }}
            >
              <AtomicRadiusTheorySection
                onSelectElementOnTable={handleSelectElementFromTheory}
                onOpenHeatmapTable={handleOpenHeatmapTable}
                onJumpToQuiz={() => handleSwitchTab('quiz')}
              />
            </motion.div>
          )}

          {activeTab === 'quiz' && (
            <motion.div
              key="tab-quiz"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.22 }}
            >
              <StudentQuizSection
                student={student}
                onLoginStudent={(profile) => setStudent(profile)}
                onLogoutStudent={() => setStudent(null)}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Quiet Footer */}
      <footer className="border-t border-slate-200 bg-white/90 backdrop-blur mt-12">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div>
            Học liệu tương tác Hóa học 10 · Mẹo nhanh: Bấm phím <kbd className="px-1.5 py-0.5 rounded bg-slate-100 font-mono font-bold text-slate-700">1</kbd>, <kbd className="px-1.5 py-0.5 rounded bg-slate-100 font-mono font-bold text-slate-700">2</kbd>, <kbd className="px-1.5 py-0.5 rounded bg-slate-100 font-mono font-bold text-slate-700">3</kbd> trên bàn phím để chuyển nhanh giữa 3 chuyên mục.
          </div>
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => handleSwitchTab('table')}
              className="hover:text-slate-900 cursor-pointer font-semibold"
            >
              Bảng tuần hoàn (1)
            </button>
            <span aria-hidden="true">·</span>
            <button
              type="button"
              onClick={() => handleSwitchTab('radius')}
              className="hover:text-slate-900 cursor-pointer font-semibold"
            >
              Quy luật Bán kính (2)
            </button>
            <span aria-hidden="true">·</span>
            <button
              type="button"
              onClick={() => handleSwitchTab('quiz')}
              className="hover:text-slate-900 cursor-pointer font-semibold"
            >
              Làm bài tập (3)
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
