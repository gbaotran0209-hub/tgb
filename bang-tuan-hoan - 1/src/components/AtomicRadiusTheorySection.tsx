import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ELEMENT_BY_SYMBOL, ChemicalElement } from '../data/elements';
import { AtomicRadiusSortingGame } from './AtomicRadiusSortingGame';
import {
  ArrowRight,
  Sliders,
  BookOpen,
  CheckCircle2,
  XCircle,
  Eye,
  Zap,
  HelpCircle,
  TableProperties,
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

export const AtomicRadiusTheorySection: React.FC<AtomicRadiusTheorySectionProps> = ({
  onOpenHeatmapTable,
  onJumpToQuiz,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<TheorySubTab>('overview_table');
  const [periodObservationAnswer, setPeriodObservationAnswer] = useState<string | null>(null);

  const [simMode, setSimMode] = useState<'period2' | 'period3' | 'groupIA' | 'groupVIIA'>('period3');
  const [simStepIndex, setSimStepIndex] = useState<number>(0);

  const [syncTrendMode, setSyncTrendMode] = useState<'period3' | 'period2' | 'groupIA' | 'groupVIIA'>('period3');
  const [syncElementIdx, setSyncElementIdx] = useState<number>(0);

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
      <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-xs space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div>
            <div className="text-xs font-semibold text-indigo-600">
              Nội dung lý thuyết trọng tâm - SGK Hóa 10
            </div>
            <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
              I. Cấu tạo bảng tuần hoàn & II. Bán kính nguyên tử & Năng lượng ion hóa
            </h2>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={onOpenHeatmapTable}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-800 border border-indigo-200 text-xs font-bold transition-colors cursor-pointer whitespace-nowrap shrink-0"
            >
              <Eye className="w-4 h-4" />
              <span>Xem Bản đồ nhiệt bán kính</span>
            </button>
            <button
              type="button"
              onClick={onJumpToQuiz}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors cursor-pointer whitespace-nowrap shrink-0"
            >
              <span>Làm bài tập trắc nghiệm</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5 sm:gap-3">
          {(
            [
              {
                id: 'overview_table',
                step: 'Mục I: Cấu tạo BTH',
                title: 'I. Cấu tạo bảng tuần hoàn',
                desc: 'Ô nguyên tố, Chu kì (1-7), Nhóm A & Nhóm B (chuẩn IUPAC/SGK xác định nhóm d & f)',
              },
              {
                id: 'what_is_it',
                step: 'Mục II.1: Khái niệm',
                title: '1. Khái niệm & Sơ đồ (r = d/2)',
                desc: 'Khái niệm, sơ đồ đo r = d/2, các ví dụ tính toán Cl₂, H₂, Cu chuẩn quốc tế',
              },
              {
                id: 'explanation',
                step: 'Mục II.2 & II.3: Quy luật',
                title: '2-3. Quy luật & Năng lượng ion hóa',
                desc: 'Câu hỏi quan sát Chu kì 3, giải thích lực hút hạt nhân, I₁ & mô phỏng tương tác',
              },
              {
                id: 'sorting_practice',
                step: 'Luyện tập',
                title: 'Bài tập sắp xếp bán kính',
                desc: 'Thực hành tương tác kéo/chọn nguyên tố theo thứ tự tăng dần/giảm dần',
              },
              {
                id: 'periodic_links',
                step: 'Tổng hợp',
                title: 'Liên hệ Bán kính - Tính kim loại/phi kim',
                desc: 'Đồng bộ 4 quy luật tuần hoàn (Bán kính, Độ âm điện, Tính kim loại, Tính phi kim)',
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

        <AnimatePresence mode="wait">
          <motion.div
            key={activeSubTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18 }}
          >
            {/* =========================================================================
                MỤC I: CẤU TẠO BẢNG TUẦN HOÀN (CHUẨN HÓA NHÓM A & NHÓM B THEO SGK/IUPAC/WIKI)
                ========================================================================= */}
            {activeSubTab === 'overview_table' && (
              <div className="pt-2 space-y-6">
                <div className="inline-flex items-center gap-2 text-xs font-bold text-sky-700">
                  <BookOpen className="w-4 h-4" />
                  <span>I. CẤU TẠO BẢNG TUẦN HOÀN CÁC NGUYÊN TỐ HÓA HỌC</span>
                </div>

                {/* 1. Nguyên tắc sắp xếp */}
                <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-sky-50/80 via-white to-indigo-50/40 border border-sky-200 space-y-3">
                  <h3 className="font-display text-base sm:text-lg font-extrabold text-slate-900">
                    1. Nguyên tắc sắp xếp các nguyên tố trong bảng tuần hoàn
                  </h3>
                  <ul className="space-y-2 text-xs sm:text-sm text-slate-800 leading-relaxed list-disc pl-5">
                    <li>
                      Các nguyên tố được sắp xếp theo <strong>chiều tăng dần của điện tích hạt nhân nguyên tử</strong>.
                    </li>
                    <li>
                      Các nguyên tố có <strong>cùng số lớp electron</strong> trong nguyên tử được xếp thành một hàng (<strong>chu kì</strong>).
                    </li>
                    <li>
                      Các nguyên tố có <strong>cùng số electron hóa trị</strong> trong nguyên tử được xếp thành một cột (<strong>nhóm</strong>).
                    </li>
                  </ul>
                  <div className="p-3.5 rounded-xl bg-amber-50/90 border border-amber-200 text-xs sm:text-sm text-amber-950 leading-relaxed">
                    <strong>* Electron hóa trị</strong> là các electron có khả năng tham gia hình thành liên kết hóa học. Đối với nguyên tố nhóm A, electron hóa trị nằm ở <strong>lớp ngoài cùng</strong>. Đối với nguyên tố nhóm B, electron hóa trị nằm ở <strong>lớp ngoài cùng và phân lớp d (hoặc f) sát ngoài cùng</strong> chưa bão hòa.
                  </div>
                </div>

                {/* 2. Cấu tạo bảng tuần hoàn */}
                <div className="space-y-4">
                  <h3 className="font-display text-base sm:text-lg font-extrabold text-slate-900">
                    2. Cấu tạo bảng tuần hoàn: Ô nguyên tố, Chu kì và Nhóm
                  </h3>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {/* 2.1. Ô nguyên tố */}
                    <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 flex flex-col justify-between">
                      <div className="space-y-2.5">
                        <h4 className="font-display text-sm sm:text-base font-extrabold text-sky-800">
                          2.1. Ô nguyên tố
                        </h4>
                        <ul className="space-y-1.5 text-xs sm:text-sm text-slate-800 list-disc pl-5">
                          <li>Số hiệu nguyên tử (Z)</li>
                          <li>Kí hiệu hóa học của nguyên tố</li>
                          <li>Tên nguyên tố (tiếng Anh & tên tiếng Việt)</li>
                          <li>Nguyên tử khối trung bình</li>
                        </ul>
                      </div>
                      <div className="p-3 rounded-xl bg-sky-50 border border-sky-200 text-xs sm:text-sm font-bold text-sky-950">
                        * Số thứ tự ô = Số hiệu nguyên tử (Z) = Số proton = Số electron
                      </div>
                    </div>

                    {/* 2.2. Chu kì */}
                    <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 flex flex-col justify-between">
                      <div className="space-y-2.5">
                        <h4 className="font-display text-sm sm:text-base font-extrabold text-indigo-800">
                          2.2. Chu kì
                        </h4>
                        <ul className="space-y-1.5 text-xs sm:text-sm text-slate-800 list-disc pl-5 leading-relaxed">
                          <li>Gồm các nguyên tố mà nguyên tử có <strong>cùng số lớp electron</strong>.</li>
                          <li>
                            Gồm <strong>7 chu kì</strong> được đánh số từ 1 đến 7:
                            <br />
                            <span className="font-semibold text-indigo-900">
                              • Chu kì nhỏ: Chu kì 1 (2 ngtố), Chu kì 2 (8 ngtố), Chu kì 3 (8 ngtố).
                              <br />
                              • Chu kì lớn: Chu kì 4 (18 ngtố), Chu kì 5 (18 ngtố), Chu kì 6 (32 ngtố), Chu kì 7 (32 ngtố).
                            </span>
                          </li>
                        </ul>
                      </div>
                      <div className="p-3 rounded-xl bg-indigo-50 border border-indigo-200 text-xs sm:text-sm font-bold text-indigo-950">
                        * Số thứ tự chu kì = Số lớp electron trong nguyên tử
                      </div>
                    </div>
                  </div>

                  {/* 2.3. Nhóm nguyên tố - CHUẨN XÁC VỀ NHÓM B (IUPAC & SGK HÓA 10 & WIKIPEDIA) */}
                  <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
                      <div>
                        <h4 className="font-display text-base sm:text-lg font-extrabold text-slate-900">
                          2.3. Nhóm nguyên tố: Nhóm A (chính) và Nhóm B (phụ / kim loại chuyển tiếp)
                        </h4>
                        <p className="text-xs text-slate-600 mt-0.5">
                          Tập hợp các nguyên tố có cấu hình electron tương tự nhau, do đó có tính chất hóa học gần giống nhau.
                        </p>
                      </div>
                      <span className="px-3 py-1 rounded-xl bg-sky-100 text-sky-900 text-xs font-mono font-bold shrink-0 self-start sm:self-auto">
                        18 cột IUPAC = 8 nhóm A + 8 nhóm B
                      </span>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                      {/* Cột nhóm A */}
                      <div className="lg:col-span-5 p-4 rounded-xl bg-sky-50/80 border border-sky-200 space-y-2.5">
                        <div className="flex items-center justify-between">
                          <span className="font-display text-sm font-extrabold text-sky-950">
                            Nhóm A (Nguyên tố s và p)
                          </span>
                          <span className="text-[11px] font-mono font-bold text-sky-800">
                            IA → VIIIA
                          </span>
                        </div>
                        <p className="text-xs text-slate-700 leading-relaxed">
                          Gồm 8 nhóm đánh số La Mã từ IA đến VIIIA. Electron hóa trị chính là các electron ở lớp ngoài cùng:
                        </p>
                        <div className="p-2.5 rounded-lg bg-white border border-sky-200 font-mono text-xs font-bold text-sky-900">
                          Số thứ tự nhóm A = Số electron lớp ngoài cùng
                        </div>
                        <ul className="text-xs text-slate-700 space-y-1 list-disc pl-4">
                          <li>Nhóm IA: Kim loại kiềm (1e hóa trị, trừ H)</li>
                          <li>Nhóm IIA: Kim loại kiềm thổ (2e hóa trị)</li>
                          <li>Nhóm VIIA: Halogen (7e hóa trị)</li>
                          <li>Nhóm VIIIA: Khí hiếm (8e ngoài cùng bền vững, riêng He có 2e)</li>
                        </ul>
                      </div>

                      {/* Cột nhóm B - CHUẨN XÁC ĐẦY ĐỦ CƠ CHẾ S = a + b */}
                      <div className="lg:col-span-7 p-4 rounded-xl bg-amber-50/80 border border-amber-200 space-y-2.5">
                        <div className="flex items-center justify-between">
                          <span className="font-display text-sm font-extrabold text-amber-950">
                            Nhóm B (Kim loại chuyển tiếp - Nguyên tố d và f)
                          </span>
                          <span className="text-[11px] font-mono font-bold text-amber-800">
                            Cột 3 → 12 IUPAC
                          </span>
                        </div>
                        <p className="text-xs text-slate-700 leading-relaxed">
                          Gồm 8 nhóm B (IB đến VIIIB). Cấu hình electron hóa trị tổng quát của các nguyên tố khối d là:
                        </p>
                        <div className="p-2.5 rounded-lg bg-white border border-amber-300 font-mono text-xs font-bold text-amber-950 text-center">
                          (n - 1)d<sup>a</sup> ns<sup>b</sup> &nbsp;&nbsp;(với a = 1 ÷ 10;&nbsp; b = 1 ÷ 2)
                        </div>
                        <p className="text-xs text-slate-800 font-medium">
                          Đặt tổng số electron hóa trị: <strong className="font-mono text-indigo-700">S = a + b</strong>. Quy tắc xác định nhóm B chuẩn quốc tế (IUPAC / Wikipedia & SGK Hóa 10) như sau:
                        </p>
                      </div>
                    </div>

                    {/* Bảng tra cứu nhóm B chi tiết, rõ ràng */}
                    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
                      <div className="px-4 py-2.5 bg-slate-100 border-b border-slate-200 flex items-center justify-between">
                        <span className="text-xs font-extrabold text-slate-800 flex items-center gap-1.5">
                          <TableProperties className="w-4 h-4 text-indigo-600" />
                          <span>Bảng quy tắc xác định nhóm B theo tổng electron hóa trị S = a + b:</span>
                        </span>
                        <span className="text-[11px] text-slate-500 font-mono">Chuẩn IUPAC & SGK</span>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-xs">
                          <thead>
                            <tr className="bg-slate-50 border-b border-slate-200 text-slate-700">
                              <th className="py-2.5 px-3 font-extrabold">Tổng S = a + b</th>
                              <th className="py-2.5 px-3 font-extrabold">Nhóm B</th>
                              <th className="py-2.5 px-3 font-extrabold">Cột IUPAC</th>
                              <th className="py-2.5 px-3 font-extrabold">Ví dụ thực tế chuẩn SGK</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 text-slate-800">
                            <tr className="hover:bg-slate-50">
                              <td className="py-2.5 px-3 font-mono font-bold text-indigo-700">S = 3, 4, 5, 6, 7</td>
                              <td className="py-2.5 px-3 font-bold text-slate-900">Nhóm S B (IIIB, IVB, VB, VIB, VIIB)</td>
                              <td className="py-2.5 px-3 font-mono">Cột 3, 4, 5, 6, 7</td>
                              <td className="py-2.5 px-3 leading-relaxed">
                                • Sc (Z=21): [Ar] 3d¹ 4s² → S = 1+2 = 3 → <strong>Nhóm IIIB</strong><br />
                                • Ti (Z=22): [Ar] 3d² 4s² → S = 2+2 = 4 → <strong>Nhóm IVB</strong><br />
                                • Mn (Z=25): [Ar] 3d⁵ 4s² → S = 5+2 = 7 → <strong>Nhóm VIIB</strong>
                              </td>
                            </tr>
                            <tr className="hover:bg-slate-50 bg-amber-50/30">
                              <td className="py-2.5 px-3 font-mono font-bold text-amber-800">S = 8, 9, 10</td>
                              <td className="py-2.5 px-3 font-bold text-amber-950">Nhóm VIIIB (Đặc biệt gồm 3 cột)</td>
                              <td className="py-2.5 px-3 font-mono">Cột 8, 9, 10</td>
                              <td className="py-2.5 px-3 leading-relaxed">
                                • Fe (Z=26): [Ar] 3d⁶ 4s² → S = 8 → <strong>Nhóm VIIIB (Cột 8)</strong><br />
                                • Co (Z=27): [Ar] 3d⁷ 4s² → S = 9 → <strong>Nhóm VIIIB (Cột 9)</strong><br />
                                • Ni (Z=28): [Ar] 3d⁸ 4s² → S = 10 → <strong>Nhóm VIIIB (Cột 10)</strong>
                              </td>
                            </tr>
                            <tr className="hover:bg-slate-50">
                              <td className="py-2.5 px-3 font-mono font-bold text-rose-700">S = 11</td>
                              <td className="py-2.5 px-3 font-bold text-rose-950">Nhóm IB</td>
                              <td className="py-2.5 px-3 font-mono">Cột 11</td>
                              <td className="py-2.5 px-3 leading-relaxed">
                                • Cu (Z=29): [Ar] 3d¹⁰ 4s¹ → S = 10+1 = 11 → <strong>Nhóm IB</strong> (bán bão hòa s, bão hòa d)
                              </td>
                            </tr>
                            <tr className="hover:bg-slate-50">
                              <td className="py-2.5 px-3 font-mono font-bold text-emerald-700">S = 12</td>
                              <td className="py-2.5 px-3 font-bold text-emerald-950">Nhóm IIB</td>
                              <td className="py-2.5 px-3 font-mono">Cột 12</td>
                              <td className="py-2.5 px-3 leading-relaxed">
                                • Zn (Z=30): [Ar] 3d¹⁰ 4s² → S = 10+2 = 12 → <strong>Nhóm IIB</strong> (bão hòa cả d và s)
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Về nguyên tố khối f (Họ Lanthanide và Họ Actinide) */}
                    <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200 text-xs text-emerald-950 leading-relaxed">
                      <strong>* Về các nguyên tố khối f (Họ Lanthanide và Họ Actinide):</strong><br />
                      Gồm 2 họ (mỗi họ 14 nguyên tố) có electron điền vào phân lớp 4f (Lanthanide, Z = 57 đến 71) hoặc 5f (Actinide, Z = 89 đến 103). Về bản chất, chúng thuộc Chu kì 6 và Chu kì 7, cùng quy ước thuộc vị trí ô thứ 3 (<strong>Nhóm IIIB</strong>). Nhằm đảm bảo bảng tuần hoàn có chiều ngang vừa vặn, chuẩn quốc tế xếp 2 họ này thành 2 hàng riêng biệt đặt ở đáy bảng.
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="button"
                    onClick={() => setActiveSubTab('what_is_it')}
                    className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold inline-flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                  >
                    <span>Tiếp theo: Sang Mục II.1. Khái niệm & Sơ đồ đo r = d/2</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* =========================================================================
                MỤC II.1: KHÁI NIỆM & SƠ ĐỒ ĐO (CHỈ SỐ DƯỚI Cl₂ VÀ H₂ CHUẨN QUỐC TẾ)
                ========================================================================= */}
            {activeSubTab === 'what_is_it' && (
              <div className="pt-2 grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                <div className="lg:col-span-7 space-y-4 flex flex-col justify-between">
                  <div className="space-y-4">
                    <div className="inline-flex items-center gap-2 text-xs font-bold text-sky-700">
                      <BookOpen className="w-4 h-4" />
                      <span>II. BÁN KÍNH NGUYÊN TỬ - 1. Khái niệm</span>
                    </div>
                    <h3 className="font-display text-xl sm:text-2xl font-extrabold text-slate-900">
                      1. Khái niệm bán kính nguyên tử
                    </h3>
                    <div className="p-5 rounded-2xl bg-gradient-to-br from-sky-50/80 to-indigo-50/50 border border-sky-200/80 space-y-3 text-sm text-slate-800 leading-relaxed">
                      <ul className="space-y-3 list-disc pl-5">
                        <li>
                          <strong>Bán kính nguyên tử</strong> đặc trưng cho kích thước của nguyên tử, được tính gần đúng bằng <strong>một nửa khoảng cách trung bình giữa hai hạt nhân nguyên tử gần nhau nhất</strong> trong đơn chất hoặc trong phân tử (<span className="font-mono font-bold text-indigo-800">r = d / 2</span>).
                        </li>
                        <li>
                          Bán kính nguyên tử phụ thuộc vào <strong>lực giữ của hạt nhân đối với các electron lớp ngoài cùng</strong>.
                        </li>
                      </ul>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
                      <div className="text-xs font-semibold text-slate-500">Đơn vị đo</div>
                      <div className="font-mono text-lg font-extrabold text-slate-900 mt-1">
                        Picomet (pm) hoặc Ångström (Å)
                      </div>
                      <p className="text-xs text-slate-600 mt-1 font-mono">
                        1 pm = 10⁻¹² m; 1 Å = 100 pm
                      </p>
                    </div>
                    <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
                      <div className="text-xs font-semibold text-slate-500">Hai cực trị điển hình</div>
                      <div className="font-mono text-lg font-extrabold text-indigo-700 mt-1">
                        He (31 pm) ↔ Cs (265 pm) / Fr (280 pm)
                      </div>
                      <p className="text-xs text-slate-600 mt-1">
                        H (37 pm) và F (64 pm) có bán kính nhỏ nhất trong nhóm A; Cs và Fr lớn nhất.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Sơ đồ mô hình thực nghiệm r = d / 2 */}
                <div className="lg:col-span-5 bg-gradient-to-br from-slate-900 to-indigo-950 text-white rounded-2xl p-6 flex flex-col items-center justify-center">
                  <div className="text-xs font-bold text-sky-300 mb-3 text-center">
                    Mô hình bán kính thực nghiệm (r = d / 2)
                  </div>
                  <svg
                    width="320"
                    height="200"
                    viewBox="0 0 320 200"
                    className="w-full max-w-[320px]"
                    aria-label="Sơ đồ minh họa bán kính nguyên tử r = d/2"
                  >
                    <circle cx="105" cy="100" r="65" fill="#38bdf8" fillOpacity="0.2" stroke="#38bdf8" strokeWidth="2" strokeDasharray="4 3" />
                    <circle cx="225" cy="100" r="65" fill="#38bdf8" fillOpacity="0.2" stroke="#38bdf8" strokeWidth="2" strokeDasharray="4 3" />
                    <line x1="105" y1="100" x2="225" y2="100" stroke="#e2e8f0" strokeWidth="2" />
                    <circle cx="105" cy="100" r="12" fill="#38bdf8" />
                    <text x="105" y="104" textAnchor="middle" className="fill-slate-950 font-mono text-[10px] font-extrabold">+Z</text>
                    <circle cx="225" cy="100" r="12" fill="#38bdf8" />
                    <text x="225" y="104" textAnchor="middle" className="fill-slate-950 font-mono text-[10px] font-extrabold">+Z</text>
                    <line x1="105" y1="45" x2="165" y2="45" stroke="#38bdf8" strokeWidth="2.5" />
                    <text x="135" y="36" textAnchor="middle" className="fill-sky-300 font-mono text-xs font-bold">r = d / 2</text>
                    <text x="165" y="178" textAnchor="middle" className="fill-slate-200 font-mono text-xs">Khoảng cách giữa hai tâm (d)</text>
                  </svg>
                </div>

                {/* 3 Ví dụ tính toán: Chỉ số dưới Cl₂ và H₂ hiển thị dưới chân chuẩn quốc tế */}
                <div className="lg:col-span-12 space-y-3 pt-4 border-t border-slate-200">
                  <div className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-lg bg-sky-600 text-white flex items-center justify-center text-xs font-bold shrink-0">
                      VD
                    </span>
                    <div>
                      <h4 className="font-display text-base font-extrabold text-slate-900">
                        Ví dụ minh họa tính toán bán kính nguyên tử (Chuẩn quốc tế & SGK Hóa 10)
                      </h4>
                      <p className="text-xs text-slate-600">
                        Áp dụng công thức: <strong className="font-mono text-indigo-700">r = d / 2</strong> (với d là khoảng cách giữa 2 hạt nhân nguyên tử gần nhau nhất)
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                    {/* Ví dụ 1: Cl₂ */}
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 flex flex-col justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-display font-extrabold text-slate-900 text-sm">
                            1. Phân tử Cl<sub>2</sub> (d = 198 pm)
                          </span>
                          <span className="font-mono text-[11px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">
                            Phi kim Cl
                          </span>
                        </div>
                        <p className="text-xs text-slate-700 leading-relaxed">
                          Trong phân tử Chlorine (Cl<sub>2</sub>), khoảng cách giữa hai hạt nhân nguyên tử là <strong className="font-mono">d = 198 pm</strong>.
                        </p>
                      </div>
                      <div className="p-3 rounded-lg bg-white border border-emerald-300 font-mono text-xs space-y-1">
                        <div className="text-slate-600">Bán kính nguyên tử Chlorine:</div>
                        <div className="text-emerald-700 font-extrabold text-sm">
                          r(Cl) = 198 / 2 = 99 pm
                        </div>
                      </div>
                    </div>

                    {/* Ví dụ 2: H₂ */}
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 flex flex-col justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-display font-extrabold text-slate-900 text-sm">
                            2. Phân tử H<sub>2</sub> (d = 74 pm)
                          </span>
                          <span className="font-mono text-[11px] px-2 py-0.5 rounded-full bg-sky-100 text-sky-800 font-bold">
                            Phi kim H
                          </span>
                        </div>
                        <p className="text-xs text-slate-700 leading-relaxed">
                          Trong phân tử Hydrogen (H<sub>2</sub>), khoảng cách giữa hai hạt nhân nguyên tử là <strong className="font-mono">d = 74 pm</strong>.
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
                            3. Tinh thể Cu (d = 256 pm)
                          </span>
                          <span className="font-mono text-[11px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold">
                            Kim loại Cu
                          </span>
                        </div>
                        <p className="text-xs text-slate-700 leading-relaxed">
                          Trong mạng tinh thể kim loại Đồng (Cu), khoảng cách giữa hai hạt nhân gần nhau nhất là <strong className="font-mono">d = 256 pm</strong>.
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

                <div className="lg:col-span-12 flex justify-end pt-3">
                  <button
                    type="button"
                    onClick={() => setActiveSubTab('explanation')}
                    className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold inline-flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                  >
                    <span>Tiếp theo: Sang Mục 2 - Quy luật biến đổi & Câu hỏi quan sát Chu kì 3</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* =========================================================================
                MỤC II.2 & II.3: QUY LUẬT BIẾN ĐỔI (ĐÃ ĐƯA CÂU HỎI QUAN SÁT QUA ĐÂY)
                ========================================================================= */}
            {activeSubTab === 'explanation' && (
              <div className="pt-2 space-y-6">
                {/* CÂU HỎI QUAN SÁT CHU KÌ 3 ĐƯỢC ĐẶT TẠI ĐÂY THEO YÊU CẦU */}
                <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-50/90 via-white to-sky-50/80 border-2 border-indigo-200 space-y-4 shadow-2xs">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-indigo-100 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center text-xs font-bold shrink-0">
                        <HelpCircle className="w-4 h-4" />
                      </span>
                      <div>
                        <span className="text-[11px] font-bold text-indigo-700 uppercase tracking-wide">
                          Khởi động & Quan sát thực nghiệm (Chu kì 3)
                        </span>
                        <h4 className="font-display text-base font-extrabold text-slate-900">
                          Câu hỏi quan sát: Trong cùng 1 chu kì (Chu kì 3), bán kính biến đổi thế nào?
                        </h4>
                      </div>
                    </div>
                    <span className="text-xs font-semibold text-slate-500">
                      Thực nghiệm: Na → Cl
                    </span>
                  </div>

                  {/* Sơ đồ trực quan các nguyên tử Chu kì 3 */}
                  <div className="bg-white rounded-xl border border-indigo-100 p-4">
                    <div className="text-xs font-bold text-slate-700 mb-2 flex items-center justify-between">
                      <span>Kích thước bán kính thực nghiệm từ Na đến Cl:</span>
                      <span className="text-indigo-600 font-mono font-bold text-[11px]">
                        Chiều tăng điện tích hạt nhân (+Z) →
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

                  {/* 4 Lựa chọn tương tác A, B, C, D */}
                  <div className="space-y-2">
                    <div className="text-xs font-bold text-slate-800">
                      Chọn nhận định đúng dựa vào hình ảnh quan sát:
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      {[
                        { key: 'A', text: 'A. Tăng dần theo chiều tăng Z' },
                        { key: 'B', text: 'B. Giảm dần theo chiều tăng Z' },
                        { key: 'C', text: 'C. Không đổi do cùng 3 lớp electron' },
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
                              <span>Chưa đúng! Hãy quan sát kích thước các hình cầu thu nhỏ dần từ Na sang Cl.</span>
                            </>
                          )}
                        </div>
                        <p>
                          <strong>Giải thích quy luật:</strong> Trong cùng một chu kì (ở đây là Chu kì 3), khi đi từ trái sang phải theo chiều tăng dần của điện tích hạt nhân: các nguyên tố đều có <strong>cùng 3 lớp electron</strong> (số lớp electron không đổi), nhưng <strong>điện tích hạt nhân tăng dần</strong> từ +11 (Sodium) đến +17 (Chlorine), làm <strong>lực hút của hạt nhân đối với electron lớp ngoài cùng ngày càng mạnh hơn</strong>, kéo các electron lại gần hạt nhân hơn. Vì vậy <strong>bán kính nguyên tử giảm dần</strong>: Na (186 pm) &gt; Mg (160) &gt; Al (143) &gt; Si (117) &gt; P (110) &gt; S (104) &gt; Cl (99 pm).
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Phần lý thuyết phân tích chuyên sâu Chu kì & Nhóm A */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-50/70 to-white border border-indigo-200 space-y-3">
                    <div className="text-xs font-extrabold text-indigo-700">
                      II.2. Quy luật trong cùng 1 chu kì
                    </div>
                    <h3 className="font-display text-lg font-extrabold text-slate-900">
                      Trong cùng 1 chu kì: Bán kính nguyên tử GIẢM DẦN vì:
                    </h3>
                    <ul className="space-y-2 text-sm text-slate-800 leading-relaxed list-disc pl-5">
                      <li>
                        <strong>Số lớp electron không đổi</strong> (bằng số thứ tự chu kì).
                      </li>
                      <li>
                        <strong>Điện tích hạt nhân Z tăng dần</strong> → lực hút của hạt nhân đối với các electron lớp ngoài cùng tăng mạnh → kéo electron lại gần hạt nhân hơn → <strong className="text-indigo-700">Bán kính nguyên tử GIẢM DẦN</strong>.
                      </li>
                    </ul>
                  </div>

                  <div className="p-5 rounded-2xl bg-gradient-to-br from-sky-50/70 to-white border border-sky-200 space-y-3">
                    <div className="text-xs font-extrabold text-sky-700">
                      II.2. Quy luật trong cùng 1 nhóm A
                    </div>
                    <h3 className="font-display text-lg font-extrabold text-slate-900">
                      Trong cùng 1 nhóm A: Bán kính nguyên tử TĂNG DẦN vì:
                    </h3>
                    <ul className="space-y-2 text-sm text-slate-800 leading-relaxed list-disc pl-5">
                      <li>
                        <strong>Số lớp electron tăng dần</strong> (từ trên xuống dưới).
                      </li>
                      <li>
                        Mặc dù điện tích hạt nhân tăng, nhưng sự gia tăng số lớp electron là yếu tố vượt trội, khiến các electron lớp ngoài cùng ngày càng xa hạt nhân hơn → <strong className="text-sky-700">Bán kính nguyên tử TĂNG DẦN</strong>.
                      </li>
                    </ul>
                  </div>
                </div>

                {/* Em có biết: Năng lượng ion hóa thứ nhất (I1) */}
                <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-amber-50/90 via-white to-rose-50/60 border-2 border-amber-300/90 space-y-4 shadow-2xs">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-amber-200/70 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs">
                        <Zap className="w-4 h-4" />
                      </span>
                      <div>
                        <div className="text-xs font-extrabold text-amber-800 uppercase tracking-wide">
                          Kiến thức bổ trợ SGK Hóa 10
                        </div>
                        <h3 className="font-display text-lg sm:text-xl font-extrabold text-slate-900">
                          * Em có biết: Năng lượng ion hóa thứ nhất (I₁)
                        </h3>
                      </div>
                    </div>
                    <span className="px-3 py-1 rounded-xl bg-amber-100 border border-amber-300 font-mono text-xs font-extrabold text-amber-950">
                      Kí hiệu: I₁ • Đơn vị: kJ/mol
                    </span>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch text-xs sm:text-sm text-slate-800 leading-relaxed">
                    <div className="lg:col-span-7 space-y-3">
                      <ul className="space-y-2.5 list-disc pl-5">
                        <li>
                          <strong>Năng lượng ion hóa thứ nhất (I₁)</strong> của nguyên tử là năng lượng tối thiểu cần thiết để tách electron thứ nhất ra khỏi nguyên tử ở trạng thái cơ bản (thể khí):
                          <div className="my-2 px-3.5 py-2 rounded-xl bg-white border border-amber-200 font-mono font-extrabold text-indigo-800 inline-block">
                            X(g) → X⁺(g) + 1e
                          </div>
                        </li>
                        <li>
                          <strong>Ví dụ:</strong> Để tách một electron ra khỏi một mol nguyên tử hydrogen theo quá trình:
                          <div className="my-1.5 px-3.5 py-2 rounded-xl bg-white border border-amber-200 font-mono font-bold text-slate-900">
                            H(g) → H⁺(g) + 1e cần tiêu tốn năng lượng là 1312 kJ, do đó <span className="text-rose-700 font-extrabold">I₁ = 1312 kJ/mol</span>.
                          </div>
                        </li>
                      </ul>
                    </div>

                    <div className="lg:col-span-5 flex flex-col justify-between gap-3">
                      <div className="p-3.5 rounded-xl bg-indigo-50/90 border border-indigo-200 space-y-1.5">
                        <div className="font-extrabold text-indigo-900">
                          Xu hướng trong 1 Chu kì:
                        </div>
                        <p className="text-xs sm:text-sm text-slate-800">
                          Bán kính nguyên tử nhìn chung giảm dần, hạt nhân giữ electron ngoài cùng chặt chẽ hơn → <strong className="text-indigo-800 underline underline-offset-4">Năng lượng ion hóa I₁ nhìn chung tăng dần</strong>.
                        </p>
                      </div>

                      <div className="p-3.5 rounded-xl bg-sky-50/90 border border-sky-200 space-y-1">
                        <div className="font-extrabold text-sky-900">
                          Xu hướng trong 1 Nhóm A:
                        </div>
                        <p className="text-xs sm:text-sm text-slate-800">
                          Bán kính nguyên tử nhìn chung tăng dần, electron ngoài cùng xa hạt nhân hơn và bị chắn nhiều hơn → <strong className="text-sky-800 underline underline-offset-4">Năng lượng ion hóa I₁ nhìn chung giảm dần</strong>.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Phòng thí nghiệm tương tác kéo thanh trượt */}
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
                    <div className="flex items-center gap-2.5">
                      <Sliders className="w-5 h-5 text-sky-600" />
                      <h4 className="font-display text-base font-extrabold text-slate-900">
                        Phòng thí nghiệm tương tác: Kéo thanh trượt quan sát biến đổi bán kính
                      </h4>
                    </div>
                    <div className="flex flex-wrap gap-1 p-1 bg-white border border-slate-200 rounded-xl">
                      {[
                        { id: 'period3', label: 'Chu kì 3 (Na - Cl)' },
                        { id: 'period2', label: 'Chu kì 2 (Li - F)' },
                        { id: 'groupIA', label: 'Nhóm IA (Li - Cs)' },
                        { id: 'groupVIIA', label: 'Nhóm VIIA (F - I)' },
                      ].map((m) => (
                        <button
                          key={m.id}
                          type="button"
                          onClick={() => {
                            setSimMode(m.id as any);
                            setSimStepIndex(0);
                          }}
                          className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                            simMode === m.id ? 'bg-slate-900 text-white' : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          {m.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <input
                      type="range"
                      min={0}
                      max={simSequence.length - 1}
                      value={Math.min(simStepIndex, simSequence.length - 1)}
                      onChange={(e) => setSimStepIndex(Number(e.target.value))}
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
                            <div className="font-mono text-[11px] font-bold mt-0.5">{el.atomicRadius} pm</div>
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
                              {cardIdx === 0 ? 'Nguyên tố mốc' : 'Nguyên tố đang chọn'}
                            </div>
                            <div className="font-display text-xl font-extrabold text-slate-900">
                              {el.name} ({el.symbol})
                            </div>
                            <div className="font-mono text-slate-700">
                              <div>Z = +{el.atomicNumber}</div>
                              <div>{el.period} lớp electron</div>
                              <div className="text-indigo-700 font-extrabold text-sm pt-1">
                                R = {el.atomicRadius} pm
                              </div>
                            </div>
                          </div>
                          <svg width="170" height="170" viewBox="0 0 180 180" className="shrink-0">
                            <circle cx="90" cy="90" r={visualRadius} fill="#e0f2fe" stroke="#0284c7" strokeWidth="2" />
                            <circle cx="90" cy="90" r="14" fill="#0f172a" />
                            <text x="90" y="94" textAnchor="middle" className="fill-white font-mono text-[10px] font-bold">
                              +{el.atomicNumber}
                            </text>
                          </svg>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="button"
                    onClick={() => setActiveSubTab('sorting_practice')}
                    className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold inline-flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                  >
                    <span>Tiếp theo: Luyện tập sắp xếp bán kính</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* Subtab 4: Luyện tập sắp xếp bán kính */}
            {activeSubTab === 'sorting_practice' && (
              <div className="pt-2 space-y-6">
                <AtomicRadiusSortingGame />
              </div>
            )}

            {/* Subtab 5: Tổng hợp liên hệ các tính chất */}
            {activeSubTab === 'periodic_links' && (
              <div className="pt-2 space-y-6">
                <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white space-y-2">
                  <h3 className="font-display text-lg sm:text-xl font-extrabold">
                    Mối liên hệ giữa Bán kính nguyên tử với Tính kim loại & Tính phi kim
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                    Khi bán kính càng nhỏ, lực hút giữa hạt nhân với electron ngoài cùng càng mạnh → nguyên tử càng dễ nhận electron (<strong>Tính phi kim tăng</strong>, <strong>Độ âm điện tăng</strong>) và càng khó nhường electron (<strong>Tính kim loại giảm</strong>).
                  </p>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 sm:p-6 space-y-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
                    <h4 className="font-display text-base font-extrabold text-slate-900">
                      So sánh đồng bộ các tính chất
                    </h4>
                    <div className="flex flex-wrap gap-1 p-1 bg-white border border-slate-200 rounded-xl">
                      {[
                        { id: 'period3', label: 'Chu kì 3 (Na - Cl)' },
                        { id: 'period2', label: 'Chu kì 2 (Li - F)' },
                        { id: 'groupIA', label: 'Nhóm IA (Li - Cs)' },
                        { id: 'groupVIIA', label: 'Nhóm VIIA (F - I)' },
                      ].map((m) => (
                        <button
                          key={m.id}
                          type="button"
                          onClick={() => {
                            setSyncTrendMode(m.id as any);
                            setSyncElementIdx(0);
                          }}
                          className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                            syncTrendMode === m.id ? 'bg-slate-900 text-white' : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          {m.label}
                        </button>
                      ))}
                    </div>
                  </div>

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
                            R={el.atomicRadius}pm
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {(() => {
                    const r = currentSyncElement.atomicRadius ?? 100;
                    const en = currentSyncElement.electronegativity ?? 1.0;
                    const radiusPct = Math.min(100, Math.max(12, Math.round((r / 265) * 100)));
                    const enPct = Math.min(100, Math.max(12, Math.round((en / 4.0) * 100)));
                    return (
                      <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4">
                        <div>
                          <div className="flex justify-between text-xs font-bold mb-1">
                            <span className="text-sky-800">1. Bán kính nguyên tử (R)</span>
                            <span className="font-mono text-sky-700">{r} pm</span>
                          </div>
                          <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full bg-sky-500 rounded-full transition-all duration-300" style={{ width: `${radiusPct}%` }} />
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between text-xs font-bold mb-1">
                            <span className="text-indigo-800">2. Độ âm điện (χ)</span>
                            <span className="font-mono text-indigo-700">{en.toFixed(2)}</span>
                          </div>
                          <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full bg-indigo-600 rounded-full transition-all duration-300" style={{ width: `${enPct}%` }} />
                          </div>
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
