import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ELEMENTS, ELEMENT_BY_SYMBOL, ChemicalElement } from '../data/elements';
import { AtomicRadiusSortingGame } from './AtomicRadiusSortingGame';
import {
  ArrowRight,
  ArrowDown,
  Sliders,
  BarChart3,
  BookOpen,
  Scale,
  CheckCircle2,
  XCircle,
  Eye,
  Atom,
  Zap,
  Layers,
  Sparkles,
} from 'lucide-react';

interface AtomicRadiusTheorySectionProps {
  onSelectElementOnTable: (el: ChemicalElement) => void;
  onOpenHeatmapTable: () => void;
  onJumpToQuiz: () => void;
}

type TheorySubTab =
  | 'overview_table'
  | 'what_is_it'
  | 'explanation'
  | 'sorting_practice'
  | 'periodic_links';

type ChartDimension = 'period' | 'groupA';

const GROUP_A_LIST = ['IA', 'IIA', 'IIIA', 'IVA', 'VA', 'VIA', 'VIIA'] as const;
const PERIOD_LIST = [2, 3, 4, 5, 6] as const;




export const AtomicRadiusTheorySection: React.FC<AtomicRadiusTheorySectionProps> = ({
  onSelectElementOnTable,
  onOpenHeatmapTable,
  onJumpToQuiz,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<TheorySubTab>('overview_table');
  const [periodObservationAnswer, setPeriodObservationAnswer] = useState<string | null>(null);

  // Interactive Chart state
  const [chartDimension, setChartDimension] = useState<ChartDimension>('period');
  const [selectedPeriod, setSelectedPeriod] = useState<number>(3);
  const [selectedGroupA, setSelectedGroupA] = useState<string>('IA');

  // Interactive Simulator state (for Explanation tab)
  const [simMode, setSimMode] = useState<'period2' | 'period3' | 'groupIA' | 'groupVIIA'>('period3');
  const [simStepIndex, setSimStepIndex] = useState<number>(0);



  // Synchronized Periodic Trends state (Idea 4)
  const [syncTrendMode, setSyncTrendMode] = useState<'period3' | 'period2' | 'groupIA' | 'groupVIIA'>('period3');
  const [syncElementIdx, setSyncElementIdx] = useState<number>(0);

  const chartElements = useMemo(() => {
    if (chartDimension === 'period') {
      return ELEMENTS.filter(
        (el) =>
          el.period === selectedPeriod &&
          el.groupType === 'A' &&
          el.category !== 'noble_gas' &&
          el.atomicRadius !== null
      ).sort((a, b) => a.atomicNumber - b.atomicNumber);
    } else {
      return ELEMENTS.filter(
        (el) =>
          el.groupRoman === selectedGroupA &&
          el.atomicNumber !== 1 &&
          el.period <= 6 &&
          el.atomicRadius !== null
      ).sort((a, b) => a.period - b.period);
    }
  }, [chartDimension, selectedPeriod, selectedGroupA]);

  const simSequence = useMemo(() => {
    if (simMode === 'period2') {
      return ['Li', 'Be', 'B', 'C', 'N', 'O', 'F'].map((s) => ELEMENT_BY_SYMBOL[s]);
    }
    if (simMode === 'period3') {
      return ['Na', 'Mg', 'Al', 'Si', 'P', 'S', 'Cl'].map((s) => ELEMENT_BY_SYMBOL[s]);
    }
    if (simMode === 'groupIA') {
      return ['Li', 'Na', 'K', 'Rb', 'Cs'].map((s) => ELEMENT_BY_SYMBOL[s]);
    }
    return ['F', 'Cl', 'Br', 'I'].map((s) => ELEMENT_BY_SYMBOL[s]);
  }, [simMode]);

  const currentSimElement = simSequence[Math.min(simStepIndex, simSequence.length - 1)] ?? simSequence[0];
  const firstSimElement = simSequence[0];

  const syncSequence = useMemo(() => {
    if (syncTrendMode === 'period3') {
      return ['Na', 'Mg', 'Al', 'Si', 'P', 'S', 'Cl'].map((s) => ELEMENT_BY_SYMBOL[s]);
    }
    if (syncTrendMode === 'period2') {
      return ['Li', 'Be', 'B', 'C', 'N', 'O', 'F'].map((s) => ELEMENT_BY_SYMBOL[s]);
    }
    if (syncTrendMode === 'groupIA') {
      return ['Li', 'Na', 'K', 'Rb', 'Cs'].map((s) => ELEMENT_BY_SYMBOL[s]);
    }
    return ['F', 'Cl', 'Br', 'I'].map((s) => ELEMENT_BY_SYMBOL[s]);
  }, [syncTrendMode]);

  const currentSyncElement =
    syncSequence[Math.min(syncElementIdx, syncSequence.length - 1)] ?? syncSequence[0];


  return (
    <div className="space-y-6">
      {/* Big 6-Pillar Interactive Navigation Deck */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-xs space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div>
            <div className="text-xs font-semibold text-indigo-600">
              Nội dung lý thuyết trọng tâm Hóa học 10
            </div>
            <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
              I. Sơ lược Bảng tuần hoàn &amp; II. Bán kính nguyên tử – Năng lượng ion hóa I₁
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={onOpenHeatmapTable}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-800 border border-indigo-200 text-xs font-bold transition-colors cursor-pointer whitespace-nowrap shrink-0"
            >
              <Eye className="w-4 h-4" />
              <span>Xem Bản đồ nhiệt trên Bảng tuần hoàn</span>
            </button>
            <button
              type="button"
              onClick={onJumpToQuiz}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors cursor-pointer whitespace-nowrap shrink-0"
            >
              <span>Làm bài tập vận dụng (8 câu TN + 2 câu Đ/S)</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Interactive Sub-Section Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5 sm:gap-3">
          {(
            [
              {
                id: 'overview_table',
                step: 'Mục I · Bảng tuần hoàn',
                title: 'I. Sơ lược Bảng tuần hoàn',
                desc: 'Nguyên tắc sắp xếp, Ô nguyên tử, Chu kì (1–7), Nhóm A & Nhóm B kèm bảng ví dụ cấu hình e xác định nhóm',
              },
              {
                id: 'what_is_it',
                step: 'Mục II.1 · Khái niệm & Ví dụ',
                title: '1. Khái niệm & Sơ đồ đo (r = d/2)',
                desc: 'Khái niệm, sơ đồ đo r = d/2, ví dụ tính toán Cl₂, H₂, Cu & câu hỏi quan sát chu kì',
              },
              {
                id: 'explanation',
                step: 'Mục II.2 & II.3 · Quy luật & I₁',
                title: '2–3. Quy luật, Giải thích & I₁',
                desc: 'Xu hướng biến đổi trong Chu kì & Nhóm A, giải thích lực hút hạt nhân & Em có biết Năng lượng ion hóa I₁',
              },
              {
                id: 'sorting_practice',
                step: 'Luyện tập · Sắp xếp',
                title: 'Bài tập sắp xếp Bán kính',
                desc: 'Thực hành tương tác kéo/chọn và sắp xếp bán kính nguyên tử tăng dần/giảm dần có chấm điểm chi tiết',
              },
              {
                id: 'periodic_links',
                step: 'Tổng hợp chương',
                title: 'Liên hệ Bán kính, I₁ & Độ âm điện',
                desc: 'Đồng bộ 4 quy luật tuần hoàn trong 1 Chu kì và 1 Nhóm A (Bán kính ↔ I₁ ↔ Độ âm điện ↔ Kim loại/Phi kim)',
              },
            ] as { id: TheorySubTab; step: string; title: string; desc: string }[]
          ).map((item) => {
            const isActive = activeSubTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveSubTab(item.id)}
                className={`p-3.5 sm:p-4 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  isActive
                    ? 'bg-gradient-to-br from-slate-900 to-indigo-950 text-white border-slate-900 shadow-md -translate-y-0.5'
                    : 'bg-slate-50/80 hover:bg-white text-slate-800 border-slate-200 hover:border-slate-300'
                }`}
              >
                <div>
                  <span
                    className={`font-mono text-[11px] font-bold ${
                      isActive ? 'text-sky-300' : 'text-indigo-600'
                    }`}
                  >
                    {item.step}
                  </span>
                  <h3 className="font-display text-sm sm:text-base font-extrabold mt-0.5">
                    {item.title}
                  </h3>
                </div>
                <p
                  className={`text-xs mt-1.5 leading-relaxed ${
                    isActive ? 'text-slate-200' : 'text-slate-600'
                  }`}
                >
                  {item.desc}
                </p>
              </button>
            );
          })}
        </div>

        {/* Animated Content Stage for the Active Pillar */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeSubTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18 }}
          >
            {/* PHẦN I: SƠ LƯỢC BẢNG TUẦN HOÀN CÁC NGUYÊN TỐ HÓA HỌC */}
            {activeSubTab === 'overview_table' && (
              <div className="pt-2 space-y-5">
                <div className="inline-flex items-center gap-2 text-xs font-bold text-sky-700">
                  <BookOpen className="w-4 h-4" />
                  <span>I. SƠ LƯỢC BẢNG TUẦN HOÀN CÁC NGUYÊN TỐ HÓA HỌC</span>
                </div>

                {/* 1. Nguyên tắc xây dựng bảng tuần hoàn */}
                <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-sky-50/80 via-white to-indigo-50/40 border border-sky-200 space-y-3">
                  <h3 className="font-display text-base sm:text-lg font-extrabold text-slate-900">
                    1. Nguyên tắc xây dựng bảng tuần hoàn các nguyên tố hóa học:
                  </h3>
                  <div className="text-xs sm:text-sm font-bold text-sky-900">
                    Nguyên tắc sắp xếp các nguyên tố hóa học trong bảng tuần hoàn:
                  </div>
                  <ul className="space-y-2 text-xs sm:text-sm text-slate-800 leading-relaxed list-disc pl-5">
                    <li>
                      Các nguyên tố được sắp xếp theo <strong>chiều tăng dần điện tích hạt nhân nguyên tử</strong>.
                    </li>
                    <li>
                      Các nguyên tố có <strong>cùng số lớp electron</strong> trong nguyên tử được xếp thành một hàng (<strong>chu kì</strong>)
                    </li>
                    <li>
                      Các nguyên tố có <strong>cùng số electron hóa trị</strong> trong nguyên tử được xếp thành một cột (<strong>nhóm</strong>)
                    </li>
                  </ul>
                  <div className="p-3.5 rounded-xl bg-amber-50/90 border border-amber-200 text-xs sm:text-sm text-amber-950 leading-relaxed">
                    <strong>* Electron hóa trị</strong> là các electron có khả năng tham gia cấu tạo thành liên kết hóa học, chúng thường nằm ở <strong>lớp electron ngoài cùng</strong> và <strong>phân lớp sát lớp ngoài cùng</strong>
                  </div>
                </div>

                {/* 2. Cấu tạo bảng tuần hoàn */}
                <div className="space-y-4">
                  <h3 className="font-display text-base sm:text-lg font-extrabold text-slate-900">
                    2. Cấu tạo bảng tuần hoàn các nguyên tố hóa học:
                  </h3>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {/* 2.1. Ô nguyên tử */}
                    <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 flex flex-col justify-between">
                      <div className="space-y-2.5">
                        <h4 className="font-display text-sm sm:text-base font-extrabold text-sky-800">
                          2.1. Ô nguyên tử: cho biết các thông tin
                        </h4>
                        <ul className="space-y-1.5 text-xs sm:text-sm text-slate-800 list-disc pl-5">
                          <li>Số hiệu nguyên tử</li>
                          <li>Kí hiệu nguyên tố hóa học</li>
                          <li>Tên nguyên tố</li>
                          <li>Nguyên tử khối trung bình,...</li>
                        </ul>
                      </div>
                      <div className="p-3 rounded-xl bg-sky-50 border border-sky-200 text-xs sm:text-sm font-bold text-sky-950">
                        * Cách xác định ô nguyên tử:{' '}
                        <span className="font-mono text-sky-800">
                          Ô nguyên tử = Số hiệu nguyên tử = số đơn vị điện tích hạt nhân
                        </span>
                      </div>
                    </div>

                    {/* 2.2. Chu kì */}
                    <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 flex flex-col justify-between">
                      <div className="space-y-2.5">
                        <h4 className="font-display text-sm sm:text-base font-extrabold text-indigo-800">
                          2.2. Chu kì:
                        </h4>
                        <ul className="space-y-1.5 text-xs sm:text-sm text-slate-800 list-disc pl-5 leading-relaxed">
                          <li>
                            Là dãy các nguyên tố mà nguyên tử của chúng có <strong>cùng số lớp electron</strong>, được xếp theo chiều điện tích hạt nhân tăng dần
                          </li>
                          <li>
                            <strong>Cấu tạo:</strong> gồm <strong>7 chu kì</strong> (hàng ngang)
                            <div className="mt-1 font-mono text-xs sm:text-sm font-bold text-indigo-900">
                              1, 2, 3 → chu kì nhỏ &nbsp;;&nbsp; 4, 5, 6, 7 → chu kì lớn
                            </div>
                          </li>
                        </ul>
                      </div>
                      <div className="p-3 rounded-xl bg-indigo-50 border border-indigo-200 text-xs sm:text-sm font-bold text-indigo-950">
                        * Cách xác định chu kì:{' '}
                        <span className="font-mono text-indigo-800">
                          số thứ tự của chu kì = số lớp electron của nguyên tử các nguyên tố
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* 2.3. Nhóm */}
                  <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
                    <h4 className="font-display text-sm sm:text-base font-extrabold text-rose-800">
                      2.3. Nhóm:
                    </h4>
                    <ul className="space-y-2 text-xs sm:text-sm text-slate-800 list-disc pl-5 leading-relaxed">
                      <li>
                        Là dãy các nguyên tố mà nguyên tử của chúng có <strong>cấu hình electron tương tự nhau</strong>, do đó có <strong>tính chất hóa học gần giống nhau</strong> và được xếp thành một cột
                      </li>
                      <li>
                        <strong>Cấu tạo:</strong> gồm <strong>8 nhóm A (IA → VIIIA)</strong> và <strong>8 nhóm B (IB → VIIIB)</strong>, riêng <strong>nhóm VIIIB gồm 3 cột</strong>
                        <div className="mt-1 text-slate-700 font-medium">
                          <em>Ví dụ:</em> Nhóm kim loại kiềm - nhóm IA, nhóm Halogen - nhóm VIIA
                        </div>
                      </li>
                      <li>
                        Nguyên tử các nguyên tố trong cùng một nhóm A có <strong>số electron hóa trị bằng nhau</strong> và <strong>bằng số thứ tự của nhóm</strong> (trừ He)
                      </li>
                    </ul>

                    <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-3">
                      <div className="font-bold text-xs sm:text-sm text-slate-900">
                        * Cách xác định:
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs sm:text-sm">
                        <div className="p-3.5 rounded-xl bg-sky-50/80 border border-sky-200 space-y-1">
                          <div className="font-extrabold text-sky-950">
                            • Nhóm A gồm các nguyên tố s và các nguyên tố p
                          </div>
                          <div className="font-mono font-bold text-sky-800">
                            Số thứ tự nhóm A = số electron lớp ngoài cùng
                          </div>
                        </div>
                        <div className="p-3.5 rounded-xl bg-rose-50/80 border border-rose-200 space-y-1">
                          <div className="font-extrabold text-rose-950">
                            • Nhóm B gồm các nguyên tố d và các nguyên tố f
                          </div>
                          <div className="font-mono font-bold text-rose-800">
                            Số thứ tự nhóm B = số electron lớp ngoài cùng + phân lớp sát lớp ngoài cùng
                          </div>
                        </div>
                      </div>

                      <div className="pt-2 space-y-2">
                        <div className="text-xs sm:text-sm font-bold text-slate-800">
                          Xét cấu hình electron có dạng:{' '}
                          <span className="font-mono px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-indigo-800">
                            ...(n - 1)dˣ nsʸ
                          </span>
                        </div>

                        <div className="overflow-x-auto rounded-xl border border-slate-200">
                          <table className="w-full text-left border-collapse text-xs sm:text-sm">
                            <thead>
                              <tr className="bg-slate-100 border-b border-slate-200 text-slate-800">
                                <th className="py-2.5 px-3 font-extrabold">Tổng số electron (x + y)</th>
                                <th className="py-2.5 px-3 font-extrabold">Xác định nhóm</th>
                                <th className="py-2.5 px-3 font-extrabold">Ví dụ</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200 bg-white">
                              <tr>
                                <td className="py-3 px-3 font-mono font-extrabold text-indigo-700 align-top whitespace-nowrap">
                                  3 → 7
                                </td>
                                <td className="py-3 px-3 font-bold text-slate-900 align-top whitespace-nowrap">
                                  Nhóm IIIB → VIIB
                                </td>
                                <td className="py-3 px-3 text-slate-800 space-y-1">
                                  <div className="font-mono font-bold text-slate-900">
                                    ₂₂Ti: 1s²2s²2p⁶3s²3p⁶3d²4s²
                                  </div>
                                  <div>Ta có:</div>
                                  <ul className="list-disc pl-4 space-y-0.5 text-xs">
                                    <li>Phân lớp 3d có 2 electron</li>
                                    <li>Phân lớp 4s có 2 electron</li>
                                  </ul>
                                  <div className="font-mono font-bold text-indigo-700 text-xs">
                                    → 2 + 2 = 4 → Ti có nhóm IVB, chu kì 4
                                  </div>
                                </td>
                              </tr>
                              <tr>
                                <td className="py-3 px-3 font-mono font-extrabold text-indigo-700 align-top whitespace-nowrap">
                                  8, 9, 10
                                </td>
                                <td className="py-3 px-3 font-bold text-slate-900 align-top whitespace-nowrap">
                                  Nhóm VIIIB
                                </td>
                                <td className="py-3 px-3 text-slate-800 space-y-1">
                                  <div className="font-mono font-bold text-slate-900">
                                    ₂₆Fe: 1s²2s²2p⁶3s²3p⁶3d⁶4s²
                                  </div>
                                  <div>Ta có:</div>
                                  <ul className="list-disc pl-4 space-y-0.5 text-xs">
                                    <li>Phân lớp 3d có 6 electron</li>
                                    <li>Phân lớp 4s có 2 electron</li>
                                  </ul>
                                  <div className="font-mono font-bold text-indigo-700 text-xs">
                                    → 6 + 2 = 8 → Fe thuộc nhóm VIIIB, chu kì 4
                                  </div>
                                </td>
                              </tr>
                              <tr>
                                <td className="py-3 px-3 font-mono font-extrabold text-indigo-700 align-top whitespace-nowrap">
                                  11, 12
                                </td>
                                <td className="py-3 px-3 font-bold text-slate-900 align-top whitespace-nowrap">
                                  Nhóm IB, IIB
                                </td>
                                <td className="py-3 px-3 text-slate-800 space-y-1">
                                  <div className="font-mono font-bold text-slate-900">
                                    ₂₉Cu: 1s²2s²2p⁶3s²3p⁶3d¹⁰4s¹
                                  </div>
                                  <ul className="list-disc pl-4 space-y-0.5 text-xs">
                                    <li>Phân lớp 3d có 10 electron</li>
                                    <li>Phân lớp 4s có 1 electron</li>
                                  </ul>
                                  <div className="font-mono font-bold text-indigo-700 text-xs">
                                    → 10 + 1 = 11 → Cu thuộc nhóm IB, chu kì 4
                                  </div>
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap justify-end gap-2 pt-3 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={() => setActiveSubTab('what_is_it')}
                    className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold inline-flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                  >
                    <span>Tiếp theo: Phần II.1. Khái niệm & Sơ đồ đo bán kính (r = d/2)</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* PILLAR 1: II.1. KHÁI NIỆM BÁN KÍNH NGUYÊN TỬ */}
            {activeSubTab === 'what_is_it' && (
              <div className="pt-2 grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                <div className="lg:col-span-7 space-y-4 flex flex-col justify-between">
                  <div className="space-y-4">
                    <div className="inline-flex items-center gap-2 text-xs font-bold text-sky-700">
                      <BookOpen className="w-4 h-4" />
                      <span>II. BÁN KÍNH NGUYÊN TỬ · 1. Khái niệm</span>
                    </div>
                    <h3 className="font-display text-xl sm:text-2xl font-extrabold text-slate-900">
                      1. Khái niệm Bán kính nguyên tử
                    </h3>
                    <div className="p-5 rounded-2xl bg-gradient-to-br from-sky-50/80 to-indigo-50/50 border border-sky-200/80 space-y-3 text-sm text-slate-800 leading-relaxed">
                      <ul className="space-y-3 list-disc pl-5">
                        <li>
                          <strong>Bán kính nguyên tử</strong> là một đại lượng đặc trưng cho <strong>kích thước của nguyên tử</strong>, được xác định gần đúng bằng <strong>một nửa khoảng cách trung bình giữa hai hạt nhân nguyên tử gần nhau nhất</strong> trong chất rắn đơn chất hoặc trong phân tử gồm hai nguyên tử giống nhau (<span className="font-mono font-bold text-indigo-800">r = d / 2</span>).
                        </li>
                        <li>
                          <strong>Bán kính nguyên tử</strong> phụ thuộc vào <strong>lực hút giữa hạt nhân và các electron ở lớp ngoài cùng</strong>.
                        </li>
                      </ul>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
                      <div className="text-xs font-semibold text-slate-500">Đơn vị đo lường</div>
                      <div className="font-mono text-lg font-extrabold text-slate-900 mt-1">
                        Picomet (pm) · Angstrom (Å)
                      </div>
                      <p className="text-xs text-slate-600 mt-1 font-mono">
                        1 pm = 10⁻¹² m · 1 Å = 10⁻¹⁰ m = 100 pm
                      </p>
                    </div>
                    <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
                      <div className="text-xs font-semibold text-slate-500">Hai cực trị đáng nhớ</div>
                      <div className="font-mono text-lg font-extrabold text-indigo-700 mt-1">
                        He (31 pm) ↔ Fr (280 pm)
                      </div>
                      <p className="text-xs text-slate-600 mt-1">
                        Xét các nguyên tố nhóm A (trừ khí hiếm): <strong>H (37 pm)</strong> và <strong>F (64 pm)</strong> có bán kính nhỏ nhất; <strong>Cs (265 pm)</strong> và <strong>Fr (280 pm)</strong> lớn nhất.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Visual Diagram of Atomic Radius r = d/2 */}
                <div className="lg:col-span-5 bg-gradient-to-br from-slate-900 to-indigo-950 text-white rounded-2xl p-6 flex flex-col items-center justify-center">
                  <div className="text-xs font-bold text-sky-300 mb-3 text-center">
                    Mô hình đo bán kính nguyên tử thực nghiệm (r = d / 2)
                  </div>
                  <svg
                    width="320"
                    height="200"
                    viewBox="0 0 320 200"
                    className="w-full max-w-[320px]"
                    aria-label="Sơ đồ minh họa bán kính nguyên tử r = d/2"
                  >
                    <defs>
                      <radialGradient id="cloudGrad" cx="50%" cy="50%" r="50%">
                        <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.45" />
                        <stop offset="70%" stopColor="#0284c7" stopOpacity="0.2" />
                        <stop offset="100%" stopColor="#0284c7" stopOpacity="0.05" />
                      </radialGradient>
                    </defs>

                    <circle
                      cx="105"
                      cy="100"
                      r="65"
                      fill="url(#cloudGrad)"
                      stroke="#38bdf8"
                      strokeWidth="1.75"
                      strokeDasharray="4 3"
                    />
                    <circle cx="105" cy="100" r="38" fill="none" stroke="#94a3b8" strokeOpacity="0.4" strokeDasharray="2 2" />

                    <circle
                      cx="225"
                      cy="100"
                      r="65"
                      fill="url(#cloudGrad)"
                      stroke="#38bdf8"
                      strokeWidth="1.75"
                      strokeDasharray="4 3"
                    />
                    <circle cx="225" cy="100" r="38" fill="none" stroke="#94a3b8" strokeOpacity="0.4" strokeDasharray="2 2" />

                    <line x1="105" y1="100" x2="225" y2="100" stroke="#e2e8f0" strokeWidth="2" />
                    <line x1="165" y1="30" x2="165" y2="165" stroke="#94a3b8" strokeWidth="1" strokeDasharray="3 3" />

                    <line x1="105" y1="45" x2="165" y2="45" stroke="#38bdf8" strokeWidth="2.5" />
                    <circle cx="105" cy="45" r="3.5" fill="#38bdf8" />
                    <circle cx="165" cy="45" r="3.5" fill="#38bdf8" />
                    <text x="135" y="36" textAnchor="middle" className="fill-sky-300 font-mono text-xs font-bold">
                      r = d / 2
                    </text>

                    <line x1="105" y1="160" x2="225" y2="160" stroke="#cbd5e1" strokeWidth="1.5" />
                    <text x="165" y="178" textAnchor="middle" className="fill-slate-200 font-mono text-xs font-semibold">
                      Khoảng cách tâm hai hạt nhân (d)
                    </text>

                    <circle cx="105" cy="100" r="13" fill="#38bdf8" />
                    <text x="105" y="104" textAnchor="middle" className="fill-slate-950 font-mono text-[10px] font-extrabold">
                      +Z
                    </text>
                    <circle cx="225" cy="100" r="13" fill="#38bdf8" />
                    <text x="225" y="104" textAnchor="middle" className="fill-slate-950 font-mono text-[10px] font-extrabold">
                      +Z
                    </text>
                  </svg>
                  <button
                    type="button"
                    onClick={() => setActiveSubTab('explanation')}
                    className="mt-3 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold text-sky-200 inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <span>Xem tiếp: Quy luật & Giải thích biến đổi</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* 3 Minh họa tính toán thực tế theo công thức r = d/2 (Chuẩn SGK Hóa 10 - Hình 4) */}
                <div className="lg:col-span-12 space-y-3 pt-4 border-t border-slate-200">
                  <div className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-lg bg-sky-600 text-white flex items-center justify-center text-xs font-bold shrink-0">
                      VD
                    </span>
                    <div>
                      <h4 className="font-display text-base font-extrabold text-slate-900">
                        Ví dụ minh họa tính toán bán kính nguyên tử (Chuẩn SGK Hóa học 10)
                      </h4>
                      <p className="text-xs text-slate-600">
                        Áp dụng công thức:{' '}
                        <strong className="font-mono text-indigo-700">r = d / 2</strong>{' '}
                        (với d là khoảng cách giữa 2 hạt nhân nguyên tử gần nhau nhất)
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {/* Ví dụ 1: Cl2 */}
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 flex flex-col justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-display font-extrabold text-slate-900 text-sm">
                            1. Phân tử Chlorine (Cl₂)
                          </span>
                          <span className="font-mono text-[11px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">
                            Phi kim Cl
                          </span>
                        </div>
                        <p className="text-xs text-slate-700 leading-relaxed">
                          Trong phân tử Cl₂, khoảng cách giữa hai hạt nhân nguyên tử Chlorine là{' '}
                          <strong className="font-mono text-slate-900">d = 198 pm</strong>.
                        </p>
                      </div>
                      <div className="p-3 rounded-lg bg-white border border-emerald-300 font-mono text-xs space-y-1">
                        <div className="text-slate-600">Bán kính nguyên tử Chlorine:</div>
                        <div className="text-emerald-700 font-extrabold text-sm">
                          r(Cl) = 198 / 2 = 99 pm
                        </div>
                      </div>
                    </div>

                    {/* Ví dụ 2: H2 */}
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 flex flex-col justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-display font-extrabold text-slate-900 text-sm">
                            2. Phân tử Hydrogen (H₂)
                          </span>
                          <span className="font-mono text-[11px] px-2 py-0.5 rounded-full bg-sky-100 text-sky-800 font-bold">
                            Phi kim H
                          </span>
                        </div>
                        <p className="text-xs text-slate-700 leading-relaxed">
                          Trong phân tử H₂, khoảng cách giữa hai hạt nhân nguyên tử Hydrogen là{' '}
                          <strong className="font-mono text-slate-900">d = 74 pm</strong>.
                        </p>
                      </div>
                      <div className="p-3 rounded-lg bg-white border border-sky-300 font-mono text-xs space-y-1">
                        <div className="text-slate-600">Bán kính nguyên tử Hydrogen:</div>
                        <div className="text-sky-700 font-extrabold text-sm">
                          r(H) = 74 / 2 = 37 pm
                        </div>
                      </div>
                    </div>

                    {/* Ví dụ 3: Cu */}
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 flex flex-col justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-display font-extrabold text-slate-900 text-sm">
                            3. Tinh thể Kim loại Copper (Cu)
                          </span>
                          <span className="font-mono text-[11px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold">
                            Kim loại Cu
                          </span>
                        </div>
                        <p className="text-xs text-slate-700 leading-relaxed">
                          Trong mạng tinh thể đồng, khoảng cách giữa hai hạt nhân Copper gần nhau nhất là{' '}
                          <strong className="font-mono text-slate-900">d = 256 pm</strong>.
                        </p>
                      </div>
                      <div className="p-3 rounded-lg bg-white border border-amber-300 font-mono text-xs space-y-1">
                        <div className="text-slate-600">Bán kính nguyên tử Copper:</div>
                        <div className="text-amber-700 font-extrabold text-sm">
                          r(Cu) = 256 / 2 = 128 pm
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Câu hỏi quan sát hình thực nghiệm: Chu kì (Hình 5) */}
                <div className="lg:col-span-12 space-y-4 pt-3 border-t border-slate-200">
                  <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-50/90 via-white to-sky-50/80 border-2 border-indigo-200 space-y-4 shadow-2xs">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-indigo-100 pb-3">
                      <div className="flex items-center gap-2">
                        <span className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center text-xs font-bold shrink-0">
                          ?
                        </span>
                        <div>
                          <span className="text-[11px] font-bold text-indigo-700 uppercase tracking-wide">
                            Câu hỏi quan sát hình học tập (Hình 5)
                          </span>
                          <h4 className="font-display text-base font-extrabold text-slate-900">
                            Quan sát hình sau và cho biết trong cùng 1 chu kì thì độ lớn của bán kính các nguyên tử như thế nào?
                          </h4>
                        </div>
                      </div>
                      <span className="text-xs font-semibold text-slate-500">
                        Ví dụ thực nghiệm: Chu kì 3 (Na → Cl)
                      </span>
                    </div>

                    {/* Graphic illustration of Period 3 Elements with proportional radius circles */}
                    <div className="bg-white rounded-xl border border-indigo-100 p-4">
                      <div className="text-xs font-bold text-slate-700 mb-2 flex items-center justify-between">
                        <span>Sơ đồ kích thước nguyên tử Chu kì 3 (Z tăng dần từ trái sang phải):</span>
                        <span className="text-indigo-600 font-mono font-bold text-[11px]">
                          → Chiều tăng dần điện tích hạt nhân (+Z)
                        </span>
                      </div>
                      <div className="grid grid-cols-4 sm:grid-cols-7 gap-2 items-end text-center pt-3 pb-1">
                        {[
                          { sym: 'Na', name: 'Sodium', z: 11, r: 186, px: 56 },
                          { sym: 'Mg', name: 'Magnesium', z: 12, r: 160, px: 48 },
                          { sym: 'Al', name: 'Aluminium', z: 13, r: 143, px: 43 },
                          { sym: 'Si', name: 'Silicon', z: 14, r: 117, px: 37 },
                          { sym: 'P', name: 'Phosphorus', z: 15, r: 110, px: 33 },
                          { sym: 'S', name: 'Sulfur', z: 16, r: 104, px: 30 },
                          { sym: 'Cl', name: 'Chlorine', z: 17, r: 99, px: 27 },
                        ].map((item) => (
                          <div key={item.sym} className="flex flex-col items-center justify-end">
                            <div className="h-16 flex items-center justify-center">
                              <div
                                className="rounded-full bg-gradient-to-br from-sky-300 via-sky-500 to-indigo-600 flex items-center justify-center shadow-xs border border-sky-400 text-white font-mono font-bold text-[10px]"
                                style={{ width: `${item.px}px`, height: `${item.px}px` }}
                              >
                                {item.sym}
                              </div>
                            </div>
                            <div className="font-display font-extrabold text-xs text-slate-900 mt-2">
                              {item.name}
                            </div>
                            <div className="font-mono text-[10px] text-slate-500">
                              Z = +{item.z}
                            </div>
                            <div className="font-mono font-extrabold text-xs text-indigo-700 mt-0.5">
                              {item.r} pm
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Interactive Multiple Choice */}
                    <div className="space-y-2">
                      <div className="text-xs font-bold text-slate-800">
                        Chọn nhận định đúng nhất dựa trên hình vẽ:
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                        {[
                          { key: 'A', text: 'A. Tăng dần theo chiều tăng dần của điện tích hạt nhân' },
                          { key: 'B', text: 'B. Giảm dần theo chiều tăng dần của điện tích hạt nhân' },
                          { key: 'C', text: 'C. Không đổi do có cùng số lớp electron' },
                          { key: 'D', text: 'D. Biến đổi ngẫu nhiên, không theo quy luật' },
                        ].map((opt) => {
                          const isSelected = periodObservationAnswer === opt.key;
                          return (
                            <button
                              key={opt.key}
                              type="button"
                              onClick={() => setPeriodObservationAnswer(opt.key)}
                              className={`p-3 rounded-xl border text-left font-semibold transition-all cursor-pointer ${
                                isSelected
                                  ? opt.key === 'B'
                                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                                    : 'bg-rose-600 text-white border-rose-600 shadow-xs'
                                  : 'bg-white hover:bg-slate-50 text-slate-800 border-slate-200'
                              }`}
                            >
                              {opt.text}
                            </button>
                          );
                        })}
                      </div>

                      {periodObservationAnswer && (
                        <div
                          className={`p-4 rounded-xl border text-xs leading-relaxed space-y-1.5 mt-2 ${
                            periodObservationAnswer === 'B'
                              ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                              : 'bg-rose-50 border-rose-300 text-rose-950'
                          }`}
                        >
                          <div className="font-bold font-display text-sm flex items-center gap-1.5">
                            {periodObservationAnswer === 'B' ? (
                              <>
                                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                                <span>Chính xác! Đáp án đúng là B: Bán kính nguyên tử GIẢM DẦN.</span>
                              </>
                            ) : (
                              <>
                                <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
                                <span>Chưa chính xác! Hãy quan sát kích thước các hình tròn trên sơ đồ.</span>
                              </>
                            )}
                          </div>
                          <p>
                            <strong>Giải thích quy luật:</strong> Trong cùng 1 chu kì (ví dụ Chu kì 3), khi đi từ trái sang phải theo chiều tăng dần của điện tích hạt nhân: các nguyên tử đều có <strong>cùng 3 lớp electron</strong> (số lớp electron không đổi), nhưng <strong>điện tích hạt nhân lại tăng dần</strong> từ +11 (Sodium) đến +17 (Chlorine), làm <strong>lực hút của hạt nhân lên các electron ngoài cùng ngày càng mạnh hơn</strong>, kéo các electron lại sát gần hạt nhân hơn → <strong>Bán kính nguyên tử GIẢM DẦN</strong>: Na (186 pm) &gt; Mg (160) &gt; Al (143) &gt; Si (117) &gt; P (110) &gt; S (104) &gt; Cl (99 pm).
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-12 flex flex-wrap justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setActiveSubTab('explanation')}
                    className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold inline-flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                  >
                    <span>Tiếp theo: Phần II.2 & II.3. Quy luật & Giải thích chi tiết</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}





            {/* PILLAR 3: II.3. GIẢI THÍCH & EM CÓ BIẾT: NĂNG LƯỢNG ION HÓA THỨ NHẤT */}
            {activeSubTab === 'explanation' && (
              <div className="pt-2 space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-50/70 to-white border border-indigo-200 space-y-3">
                    <div className="text-xs font-extrabold text-indigo-700">
                      II.3. Giải thích · Trong cùng 1 chu kì
                    </div>
                    <h3 className="font-display text-lg font-extrabold text-slate-900">
                      - Trong cùng 1 chu kì, bán kính nguyên tử giảm vì:
                    </h3>
                    <ul className="space-y-2 text-sm text-slate-800 leading-relaxed list-disc pl-5">
                      <li>
                        <strong>Số lớp electron không đổi</strong> (bằng số chu kì)
                      </li>
                      <li>
                        <strong>Điện tích hạt nhân lại tăng</strong> dẫn đến hút các electron về phía hạt nhân mạnh hơn →{' '}
                        <strong className="text-indigo-700">Bán kính nguyên tử GIẢM</strong>
                      </li>
                    </ul>
                  </div>

                  <div className="p-5 rounded-2xl bg-gradient-to-br from-sky-50/70 to-white border border-sky-200 space-y-3">
                    <div className="text-xs font-extrabold text-sky-700">
                      II.3. Giải thích · Trong cùng 1 nhóm
                    </div>
                    <h3 className="font-display text-lg font-extrabold text-slate-900">
                      - Trong cùng 1 nhóm, bán kính nguyên tử tăng vì:
                    </h3>
                    <ul className="space-y-2 text-sm text-slate-800 leading-relaxed list-disc pl-5">
                      <li>
                        <strong>Số lớp electron tăng dần</strong>
                      </li>
                      <li>
                        Mặc dù số đơn vị điện tích hạt nhân tăng nhưng khi càng nhiều lớp electron, dẫn đến <strong>electron ngoài cùng càng xa hạt nhân</strong>, do đó <strong>lực hút giảm đi đáng kể</strong> →{' '}
                        <strong className="text-sky-700">Bán kính nguyên tử TĂNG</strong>
                      </li>
                    </ul>
                  </div>
                </div>

                {/* *Em có biết: Năng lượng ion hóa thứ nhất (I1) */}
                <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-amber-50/90 via-white to-rose-50/60 border-2 border-amber-300/90 space-y-4 shadow-2xs">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-amber-200/70 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs">
                        <Zap className="w-4 h-4" />
                      </span>
                      <div>
                        <div className="text-xs font-extrabold text-amber-800 uppercase tracking-wide">
                          Kiến thức mở rộng SGK Hóa học 10
                        </div>
                        <h3 className="font-display text-lg sm:text-xl font-extrabold text-slate-900">
                          * Em có biết: Năng lượng ion hóa thứ nhất
                        </h3>
                      </div>
                    </div>
                    <span className="px-3 py-1 rounded-xl bg-amber-100 border border-amber-300 font-mono text-xs font-extrabold text-amber-950">
                      Kí hiệu: I₁ · Đơn vị: kJ/mol
                    </span>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch text-xs sm:text-sm text-slate-800 leading-relaxed">
                    <div className="lg:col-span-7 space-y-3">
                      <ul className="space-y-2.5 list-disc pl-5">
                        <li>
                          <strong>Năng lượng ion hóa thứ nhất</strong> của nguyên tử là <strong>năng lượng tối thiểu cần thiết để tách electron thứ nhất ra khỏi nguyên tử ở thể khí, ở trạng thái cơ bản</strong>:
                          <div className="my-2 px-3.5 py-2 rounded-xl bg-white border border-amber-200 font-mono font-extrabold text-indigo-800 inline-block">
                            X(g) → X⁺(g) + e
                          </div>
                        </li>
                        <li>
                          <strong>VD:</strong> để tách một electron ra khỏi một mol nguyên tử hydrogen theo quá trình:
                          <div className="my-1.5 px-3.5 py-2 rounded-xl bg-white border border-amber-200 font-mono font-bold text-slate-900">
                            H(g) → H⁺(g) + e phải tiêu tốn năng lượng là 1312 kJ, do đó <span className="text-rose-700 font-extrabold">I₁ = 1312 kJ/mol</span>
                          </div>
                        </li>
                        <li>
                          Năng lượng ion hóa thứ nhất kí hiệu là <strong className="font-mono">I₁</strong>, đơn vị là <strong className="font-mono">kJ/mol</strong>
                        </li>
                      </ul>
                    </div>

                    <div className="lg:col-span-5 flex flex-col justify-between gap-3">
                      <div className="p-3.5 rounded-xl bg-indigo-50/90 border border-indigo-200 space-y-1.5">
                        <div className="font-extrabold text-indigo-900 flex items-center gap-1.5">
                          <ArrowRight className="w-4 h-4 text-indigo-700 shrink-0" />
                          <span>Xu hướng trong 1 Chu kì (Trái → Phải):</span>
                        </div>
                        <p className="text-xs sm:text-sm text-slate-800">
                          Trong 1 chu kì, <strong>bán kính nguyên tử nhìn chung giảm dần</strong>, khiến lực hút của hạt nhân lên electron ngoài cùng mạnh hơn →{' '}
                          <strong className="text-indigo-800 underline underline-offset-4">
                            năng lượng ion hóa thứ nhất tăng dần
                          </strong>
                        </p>
                        <p className="text-xs text-amber-950 font-semibold bg-amber-100/80 px-2.5 py-1 rounded-lg border border-amber-200">
                          Tuy nhiên, vẫn có một số ngoại lệ như <strong>Be - B</strong> và <strong>N - O</strong>
                        </p>
                      </div>

                      <div className="p-3.5 rounded-xl bg-sky-50/90 border border-sky-200 space-y-1">
                        <div className="font-extrabold text-sky-900 flex items-center gap-1.5">
                          <ArrowDown className="w-4 h-4 text-sky-700 shrink-0" />
                          <span>Xu hướng trong 1 Nhóm A (Trên → Dưới):</span>
                        </div>
                        <p className="text-xs sm:text-sm text-slate-800">
                          Trong một nhóm A, <strong>bán kính nguyên tử nhìn chung tăng dần</strong>, khoảng cách từ hạt nhân đến electron ngoài cùng lớn hơn, lực liên kết giảm →{' '}
                          <strong className="text-sky-800 underline underline-offset-4">
                            năng lượng ion hóa thứ nhất nhìn chung giảm dần
                          </strong>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Interactive Simulator */}
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
                    <div className="flex items-center gap-2.5">
                      <Sliders className="w-5 h-5 text-sky-600" />
                      <div>
                        <h4 className="font-display text-base font-extrabold text-slate-900">
                          Phòng thí nghiệm mô phỏng: Kéo thanh trượt quan sát lực hút hạt nhân (+Z) & Số lớp electron
                        </h4>
                        <p className="text-xs text-slate-600">
                          So sánh trực tiếp nguyên tố đang chọn với nguyên tố đầu dãy ({firstSimElement.symbol})
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-1 p-1 bg-white border border-slate-200 rounded-xl">
                      {(
                        [
                          { id: 'period3', label: 'Chu kì 3 (Na → Cl)' },
                          { id: 'period2', label: 'Chu kì 2 (Li → F)' },
                          { id: 'groupIA', label: 'Nhóm IA (Li → Cs)' },
                          { id: 'groupVIIA', label: 'Nhóm VIIA (F → I)' },
                        ] as const
                      ).map((m) => (
                        <button
                          key={m.id}
                          type="button"
                          onClick={() => {
                            setSimMode(m.id);
                            setSimStepIndex(0);
                          }}
                          className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                            simMode === m.id
                              ? 'bg-slate-900 text-white shadow-xs'
                              : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          {m.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs font-medium text-slate-700">
                      <span>
                        Đang khảo sát:{' '}
                        <strong className="text-slate-900">
                          {currentSimElement.name} ({currentSimElement.symbol})
                        </strong>{' '}
                        · Điện tích hạt nhân:{' '}
                        <strong className="font-mono">+{currentSimElement.atomicNumber}</strong> · Số lớp e:{' '}
                        <strong className="font-mono">{currentSimElement.period}</strong> · Bán kính:{' '}
                        <strong className="font-mono text-sky-700">
                          {currentSimElement.atomicRadius} pm
                        </strong>
                      </span>
                      <span className="font-mono text-slate-500">
                        Bước {Math.min(simStepIndex + 1, simSequence.length)} / {simSequence.length}
                      </span>
                    </div>

                    <input
                      type="range"
                      min={0}
                      max={simSequence.length - 1}
                      value={Math.min(simStepIndex, simSequence.length - 1)}
                      onChange={(e) => setSimStepIndex(Number(e.target.value))}
                      aria-label="Thanh trượt chọn nguyên tố trong dãy mô phỏng"
                      className="w-full accent-sky-600 cursor-pointer"
                    />

                    <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
                      {simSequence.map((el, idx) => {
                        const isActive = idx === Math.min(simStepIndex, simSequence.length - 1);
                        return (
                          <button
                            key={el.symbol}
                            type="button"
                            onClick={() => setSimStepIndex(idx)}
                            className={`p-2 rounded-xl border text-center transition-all cursor-pointer ${
                              isActive
                                ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                            }`}
                          >
                            <div className="font-display text-sm font-extrabold">{el.symbol}</div>
                            <div className="font-mono text-[10px] opacity-80">Z={el.atomicNumber}</div>
                            <div className="font-mono text-[11px] font-bold mt-0.5">
                              {el.atomicRadius} pm
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                    {[firstSimElement, currentSimElement].map((el, cardIdx) => {
                      const visualRadius = Math.max(24, Math.min(78, Math.round((el.atomicRadius ?? 100) / 3.3)));
                      return (
                        <div
                          key={`${cardIdx}-${el.symbol}`}
                          className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 shadow-xs"
                        >
                          <div className="space-y-1.5 text-xs">
                            <div className="text-slate-500 font-semibold">
                              {cardIdx === 0 ? 'Nguyên tố đầu dãy (Mốc so sánh)' : 'Nguyên tố đang khảo sát'}
                            </div>
                            <div className="font-display text-xl font-extrabold text-slate-900">
                              {el.name} ({el.symbol})
                            </div>
                            <div className="space-y-1 font-mono text-slate-700">
                              <div>
                                Điện tích hạt nhân: <strong>+{el.atomicNumber}</strong>
                              </div>
                              <div>
                                Số lớp electron: <strong>{el.period} lớp ({el.shells.join('-')})</strong>
                              </div>
                              <div>
                                Cấu hình e: <strong>{el.electronConfig}</strong>
                              </div>
                              <div className="text-indigo-700 font-extrabold text-sm pt-1">
                                Bán kính R = {el.atomicRadius} pm
                              </div>
                            </div>
                          </div>

                          <svg width="170" height="170" viewBox="0 0 180 180" className="shrink-0">
                            <circle
                              cx="90"
                              cy="90"
                              r={visualRadius}
                              fill="#e0f2fe"
                              stroke="#0284c7"
                              strokeWidth="2"
                            />
                            {el.shells.map((_, sIdx) => {
                              const shellR = ((sIdx + 1) / el.shells.length) * visualRadius;
                              return (
                                <circle
                                  key={sIdx}
                                  cx="90"
                                  cy="90"
                                  r={shellR}
                                  fill="none"
                                  stroke="#0369a1"
                                  strokeOpacity="0.35"
                                  strokeDasharray="2 2"
                                />
                              );
                            })}
                            <circle cx="90" cy="90" r="14" fill="#0f172a" />
                            <text
                              x="90"
                              y="94"
                              textAnchor="middle"
                              className="fill-white font-mono text-[10px] font-bold"
                            >
                              +{el.atomicNumber}
                            </text>
                          </svg>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="flex flex-wrap justify-end gap-2 pt-2 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={() => setActiveSubTab('sorting_practice')}
                    className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold inline-flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                  >
                    <span>Tiếp theo: Luyện tập Sắp xếp bán kính nguyên tử (Bài tập)</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* PILLAR 4: BÀI TẬP SẮP XẾP BÁN KÍNH NGUYÊN TỬ (HÌNH 3) */}
            {activeSubTab === 'sorting_practice' && (
              <div className="pt-2 space-y-6">
                <AtomicRadiusSortingGame />

                <div className="flex flex-wrap justify-end gap-2 pt-2 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={() => setActiveSubTab('periodic_links')}
                    className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold inline-flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                  >
                    <span>Tiếp theo: Tổng hợp liên hệ Bán kính, I₁ &amp; Độ âm điện</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}




            {/* PILLAR 6 (NEW - IDEA 4): LIÊN HỆ ĐỒNG BỘ BÁN KÍNH ↔ ĐỘ ÂM ĐIỆN & TÍNH KIM LOẠI / PHI KIM */}
            {activeSubTab === 'periodic_links' && (
              <div className="pt-2 space-y-6">
                <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white space-y-2">
                  <div className="text-xs font-bold text-sky-300">
                    Sơ đồ tư duy hệ quả logic toàn chương Bảng tuần hoàn
                  </div>
                  <h3 className="font-display text-lg sm:text-xl font-extrabold">
                    Vì sao hiểu rõ Bán kính nguyên tử sẽ suy ra được toàn bộ các quy luật tuần hoàn khác?
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                    Khi <strong>Bán kính nguyên tử càng nhỏ</strong> → khoảng cách từ hạt nhân đến lớp vỏ ngoài cùng càng gần → lực hút electron càng mạnh → <strong>Độ âm điện càng lớn</strong> → nguyên tử càng dễ nhận electron (<strong>Tính phi kim tăng</strong>) và càng khó nhường electron (<strong>Tính kim loại giảm</strong>).
                  </p>
                </div>

                {/* Synchronized Multi-Property Explorer */}
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 sm:p-6 space-y-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
                    <div>
                      <h4 className="font-display text-base font-extrabold text-slate-900">
                        Thanh trượt đồng bộ 4 đại lượng: Bán kính (R) · Độ âm điện (χ) · Tính Kim loại · Tính Phi kim
                      </h4>
                      <p className="text-xs text-slate-600">
                        Chọn dãy nguyên tố và bấm vào từng nguyên tố để xem các thanh chỉ số biến thiên ngược chiều nhau như thế nào
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-1 p-1 bg-white border border-slate-200 rounded-xl">
                      {(
                        [
                          { id: 'period3', label: 'Chu kì 3 (Na → Cl)' },
                          { id: 'period2', label: 'Chu kì 2 (Li → F)' },
                          { id: 'groupIA', label: 'Nhóm IA (Li → Cs)' },
                          { id: 'groupVIIA', label: 'Nhóm VIIA (F → I)' },
                        ] as const
                      ).map((m) => (
                        <button
                          key={m.id}
                          type="button"
                          onClick={() => {
                            setSyncTrendMode(m.id);
                            setSyncElementIdx(0);
                          }}
                          className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                            syncTrendMode === m.id
                              ? 'bg-slate-900 text-white'
                              : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          {m.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Element selector strip */}
                  <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
                    {syncSequence.map((el, idx) => {
                      const active = idx === Math.min(syncElementIdx, syncSequence.length - 1);
                      return (
                        <button
                          key={el.symbol}
                          type="button"
                          onClick={() => setSyncElementIdx(idx)}
                          className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                            active
                              ? 'bg-slate-900 text-white border-slate-900 shadow-sm -translate-y-0.5'
                              : 'bg-white text-slate-800 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          <div className="font-display text-base font-extrabold">{el.symbol}</div>
                          <div className="text-[11px] opacity-80">{el.name}</div>
                          <div className="font-mono text-[10px] mt-1 opacity-90">
                            R={el.atomicRadius}pm · χ={el.electronegativity}
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {/* Synchronized Gauges for Selected Element */}
                  {(() => {
                    const r = currentSyncElement.atomicRadius ?? 100;
                    const en = currentSyncElement.electronegativity ?? 1.0;
                    const radiusPct = Math.min(100, Math.max(12, Math.round((r / 265) * 100)));
                    const enPct = Math.min(100, Math.max(12, Math.round((en / 4.0) * 100)));
                    const metallicPct = Math.min(100, Math.max(8, 108 - enPct));
                    const nonMetallicPct = enPct;

                    return (
                      <div className="bg-white border border-slate-200 rounded-2xl p-5 grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                        <div className="space-y-4">
                          <div>
                            <div className="flex justify-between text-xs font-bold mb-1">
                              <span className="text-sky-800">1. Bán kính nguyên tử (R)</span>
                              <span className="font-mono text-sky-700">{r} pm</span>
                            </div>
                            <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-sky-500 rounded-full transition-all duration-300"
                                style={{ width: `${radiusPct}%` }}
                              />
                            </div>
                          </div>

                          <div>
                            <div className="flex justify-between text-xs font-bold mb-1">
                              <span className="text-indigo-800">
                                2. Độ âm điện Pauling (χ - Khả năng hút electron)
                              </span>
                              <span className="font-mono text-indigo-700">{en.toFixed(2)}</span>
                            </div>
                            <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-indigo-600 rounded-full transition-all duration-300"
                                style={{ width: `${enPct}%` }}
                              />
                            </div>
                          </div>

                          <div>
                            <div className="flex justify-between text-xs font-bold mb-1">
                              <span className="text-emerald-800">
                                3. Tính Kim loại (Độ dễ nhường electron hóa trị)
                              </span>
                              <span className="font-mono text-emerald-700">
                                {currentSyncElement.category === 'metal' ? 'Mạnh / Đặc trưng' : 'Rất yếu'}
                              </span>
                            </div>
                            <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                                style={{ width: `${metallicPct}%` }}
                              />
                            </div>
                          </div>

                          <div>
                            <div className="flex justify-between text-xs font-bold mb-1">
                              <span className="text-amber-800">
                                4. Tính Phi kim (Độ dễ nhận electron)
                              </span>
                              <span className="font-mono text-amber-700">
                                {currentSyncElement.category === 'nonmetal' ? 'Mạnh / Đặc trưng' : 'Yếu'}
                              </span>
                            </div>
                            <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-amber-500 rounded-full transition-all duration-300"
                                style={{ width: `${nonMetallicPct}%` }}
                              />
                            </div>
                          </div>
                        </div>

                        {/* Comparison Table of the 4 periodic trends */}
                        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3 text-xs">
                          <div className="font-display text-sm font-extrabold text-slate-900">
                            Bảng tổng kết quy luật biến đổi tuần hoàn (Nhóm A)
                          </div>
                          <table className="w-full text-left border-collapse">
                            <thead>
                              <tr className="border-b border-slate-200 text-slate-500">
                                <th className="py-2 pr-2">Đại lượng</th>
                                <th className="py-2 px-2">Trong 1 Chu kì (Trái → Phải)</th>
                                <th className="py-2 pl-2">Trong 1 Nhóm A (Trên → Dưới)</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200/70 font-medium">
                              <tr>
                                <td className="py-2 pr-2 font-bold text-slate-900">Bán kính nguyên tử (R)</td>
                                <td className="py-2 px-2 text-indigo-700 font-bold">Giảm dần ↓</td>
                                <td className="py-2 pl-2 text-sky-700 font-bold">Tăng dần ↑</td>
                              </tr>
                              <tr>
                                <td className="py-2 pr-2 font-bold text-slate-900">Năng lượng ion hóa thứ nhất (I₁)</td>
                                <td className="py-2 px-2 text-sky-700 font-bold">Tăng dần ↑</td>
                                <td className="py-2 pl-2 text-indigo-700 font-bold">Giảm dần ↓</td>
                              </tr>
                              <tr>
                                <td className="py-2 pr-2 font-bold text-slate-900">Độ âm điện (χ)</td>
                                <td className="py-2 px-2 text-sky-700 font-bold">Tăng dần ↑</td>
                                <td className="py-2 pl-2 text-indigo-700 font-bold">Giảm dần ↓</td>
                              </tr>
                              <tr>
                                <td className="py-2 pr-2 font-bold text-slate-900">Tính Kim loại</td>
                                <td className="py-2 px-2 text-indigo-700 font-bold">Giảm dần ↓</td>
                                <td className="py-2 pl-2 text-sky-700 font-bold">Tăng dần ↑</td>
                              </tr>
                              <tr>
                                <td className="py-2 pr-2 font-bold text-slate-900">Tính Phi kim</td>
                                <td className="py-2 px-2 text-sky-700 font-bold">Tăng dần ↑</td>
                                <td className="py-2 pl-2 text-indigo-700 font-bold">Giảm dần ↓</td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};
