/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ELEMENT_BY_Z, ChemicalElement } from './data/elements';
import { PeriodicTableSection } from './components/PeriodicTableSection';
import { AtomicRadiusTheorySection } from './components/AtomicRadiusTheorySection';
import { StudentQuizSection, StudentProfile } from './components/StudentQuizSection';
import { Grid, Compass, Trophy } from 'lucide-react';

type MainModuleTab = 'table' | 'radius' | 'quiz';

export default function App() {
  // Default on first open: ONLY show the Periodic Table ('table')
  const [activeTab, setActiveTab] = useState<MainModuleTab>('table');
  const [tableInitialMode, setTableInitialMode] = useState<'category' | 'radius_heatmap'>('category');
  const [selectedElement, setSelectedElement] = useState<ChemicalElement>(ELEMENT_BY_Z[11]); // Sodium (Na)
  const [student, setStudent] = useState<StudentProfile | null>(null);

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

  const handleSwitchTab = (tab: MainModuleTab) => {
    if (tab !== 'table') {
      setTableInitialMode('category');
    }
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      {/* Strict 3-Zone Top Bar Contract */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-slate-200">
        <div className="max-w-[1440px] mx-auto flex items-center justify-between gap-8 px-4 sm:px-6 py-3.5">
          {/* Zone 1: Single text element wordmark */}
          <button
            type="button"
            onClick={() => handleSwitchTab('table')}
            className="font-display text-lg font-extrabold tracking-tight text-slate-900 whitespace-nowrap shrink-0 cursor-pointer text-left"
          >
            Hóa Học 10 · Bảng Tuần Hoàn
          </button>

          {/* Zone 2: Clean single-line text navigation links */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-semibold text-slate-600">
            <button
              type="button"
              onClick={() => handleSwitchTab('table')}
              className={`transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                activeTab === 'table'
                  ? 'text-sky-700 underline underline-offset-8 decoration-2'
                  : 'hover:text-slate-900'
              }`}
            >
              1. Bảng tuần hoàn 118 nguyên tố
            </button>
            <button
              type="button"
              onClick={() => handleSwitchTab('radius')}
              className={`transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                activeTab === 'radius'
                  ? 'text-indigo-700 underline underline-offset-8 decoration-2'
                  : 'hover:text-slate-900'
              }`}
            >
              2. Quy luật Bán kính nguyên tử
            </button>
            <button
              type="button"
              onClick={() => handleSwitchTab('quiz')}
              className={`transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                activeTab === 'quiz'
                  ? 'text-emerald-700 underline underline-offset-8 decoration-2'
                  : 'hover:text-slate-900'
              }`}
            >
              3. Bài tập & Tài khoản Học sinh
            </button>
          </nav>

          {/* Zone 3: 1 primary action */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => handleSwitchTab('quiz')}
              className="px-4 py-2 text-xs font-bold text-white bg-slate-900 rounded-xl hover:bg-slate-800 transition-colors whitespace-nowrap shrink-0 cursor-pointer shadow-xs"
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
        {/* Big Interactive Module Switcher ("Các mục lớn" để bấm chuyển qua lại) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
          {/* Mục 1: Bảng Tuần Hoàn */}
          <button
            type="button"
            onClick={() => handleSwitchTab('table')}
            className={`group p-4 sm:p-5 rounded-2xl border text-left transition-all duration-150 cursor-pointer flex items-start gap-4 ${
              activeTab === 'table'
                ? 'bg-gradient-to-br from-slate-900 via-slate-900 to-sky-950 text-white border-slate-900 shadow-md -translate-y-0.5'
                : 'bg-white hover:bg-sky-50/40 text-slate-900 border-slate-200 hover:border-sky-300 shadow-xs'
            }`}
          >
            <div
              className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                activeTab === 'table'
                  ? 'bg-sky-500 text-slate-950'
                  : 'bg-sky-100 text-sky-700 group-hover:bg-sky-200'
              }`}
            >
              <Grid className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <div
                className={`text-[11px] font-mono font-bold uppercase tracking-wider ${
                  activeTab === 'table' ? 'text-sky-300' : 'text-sky-700'
                }`}
              >
                Chuyên mục 01 · Đang hiển thị mặc định
              </div>
              <div className="font-display text-base sm:text-lg font-extrabold leading-snug">
                Bảng Tuần Hoàn 118 Nguyên Tố
              </div>
              <p
                className={`text-xs leading-relaxed ${
                  activeTab === 'table' ? 'text-slate-300' : 'text-slate-500'
                }`}
              >
                7 chu kì, 18 cột, phân loại Kim loại – Phi kim – Khí hiếm, tra cứu Ô, Chu kì, Nhóm A/B & Mô hình nguyên tử.
              </p>
            </div>
          </button>

          {/* Mục 2: Quy Luật Bán Kính Nguyên Tử */}
          <button
            type="button"
            onClick={() => handleSwitchTab('radius')}
            className={`group p-4 sm:p-5 rounded-2xl border text-left transition-all duration-150 cursor-pointer flex items-start gap-4 ${
              activeTab === 'radius'
                ? 'bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white border-slate-900 shadow-md -translate-y-0.5'
                : 'bg-white hover:bg-indigo-50/40 text-slate-900 border-slate-200 hover:border-indigo-300 shadow-xs'
            }`}
          >
            <div
              className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                activeTab === 'radius'
                  ? 'bg-indigo-400 text-slate-950'
                  : 'bg-indigo-100 text-indigo-700 group-hover:bg-indigo-200'
              }`}
            >
              <Compass className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <div
                className={`text-[11px] font-mono font-bold uppercase tracking-wider ${
                  activeTab === 'radius' ? 'text-indigo-300' : 'text-indigo-700'
                }`}
              >
                Chuyên mục 02 · Lý thuyết & Mô phỏng
              </div>
              <div className="font-display text-base sm:text-lg font-extrabold leading-snug">
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
            className={`group p-4 sm:p-5 rounded-2xl border text-left transition-all duration-150 cursor-pointer flex items-start gap-4 ${
              activeTab === 'quiz'
                ? 'bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-900 text-white border-slate-900 shadow-md -translate-y-0.5'
                : 'bg-white hover:bg-emerald-50/40 text-slate-900 border-slate-200 hover:border-emerald-300 shadow-xs'
            }`}
          >
            <div
              className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                activeTab === 'quiz'
                  ? 'bg-emerald-400 text-slate-950'
                  : 'bg-emerald-100 text-emerald-700 group-hover:bg-emerald-200'
              }`}
            >
              <Trophy className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <div
                className={`text-[11px] font-mono font-bold uppercase tracking-wider ${
                  activeTab === 'quiz' ? 'text-emerald-300' : 'text-emerald-700'
                }`}
              >
                Chuyên mục 03 · Luyện tập & Xuất điểm Giáo viên
              </div>
              <div className="font-display text-base sm:text-lg font-extrabold leading-snug">
                Bài Tập & Tài Khoản Học Sinh
              </div>
              <p
                className={`text-xs leading-relaxed ${
                  activeTab === 'quiz' ? 'text-slate-300' : 'text-slate-500'
                }`}
              >
                Đăng nhập Họ tên · Lớp · STT, làm 18 câu trắc nghiệm, Phiếu đánh giá năng lực & Xuất bảng điểm Excel (.CSV).
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
              transition={{ duration: 0.2 }}
            >
              <PeriodicTableSection
                selectedElement={selectedElement}
                onSelectElement={setSelectedElement}
                onNavigateTab={handleSwitchTab}
                initialColorMode={tableInitialMode}
              />
            </motion.div>
          )}

          {activeTab === 'radius' && (
            <motion.div
              key="tab-radius"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
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
              transition={{ duration: 0.2 }}
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
      <footer className="border-t border-slate-200 bg-white mt-12">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div>
            Học liệu tương tác Hóa học 10 · Bảng tuần hoàn 118 nguyên tố & Quy luật biến đổi Bán kính nguyên tử.
          </div>
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => handleSwitchTab('table')}
              className="hover:text-slate-900 cursor-pointer"
            >
              Bảng tuần hoàn
            </button>
            <span aria-hidden="true">·</span>
            <button
              type="button"
              onClick={() => handleSwitchTab('radius')}
              className="hover:text-slate-900 cursor-pointer"
            >
              Quy luật Bán kính
            </button>
            <span aria-hidden="true">·</span>
            <button
              type="button"
              onClick={() => handleSwitchTab('quiz')}
              className="hover:text-slate-900 cursor-pointer"
            >
              Làm bài tập
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
