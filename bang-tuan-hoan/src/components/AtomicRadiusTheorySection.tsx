import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ELEMENT_BY_SYMBOL, ChemicalElement } from '../data/elements';
import { AtomicRadiusSortingGame } from './AtomicRadiusSortingGame';
import {
  ArrowRight,
  ArrowDown,
  Sliders,
  BookOpen,
  CheckCircle2,
  XCircle,
  Eye,
  Zap,
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
                desc: 'Ô nguyên tố, Chu kì (1-7), Nhóm A & Nhóm B, xác định số e hóa trị',
              },
              {
                id: 'what_is_it',
                step: 'Mục II.1: Khái niệm',
                title: '1. Khái niệm & Sơ đồ (r = d/2)',
                desc: 'Khái niệm, sơ đồ đo r = d/2, ví dụ tính toán Cl2, Cu & câu hỏi quan sát chu kì 3',
              },
              {
                id: 'explanation',
                step: 'Mục II.2 & II.3: Quy luật',
                title: '2-3. Quy luật & Năng lượng ion hóa',
                desc: 'Xu hướng trong Chu kì & Nhóm A, giải thích lực hút hạt nhân & Em có biết (I1)',
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
            {activeSubTab === 'overview_table' && (
              <div className="pt-2 space-y-5">
                <div className="inline-flex items-center gap-2 text-xs font-bold text-sky-700">
                  <BookOpen className="w-4 h-4" />
                  <span>I. CẤU TẠO BẢNG TUẦN HOÀN CÁC NGUYÊN TỐ HÓA HỌC</span>
                </div>
                <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-sky-50/80 via-white to-indigo-50/40 border border-sky-200 space-y-3">
                  <h3 className="font-display text-base sm:text-lg font-extrabold text-slate-900">
                    1. Nguyên tắc sắp xếp các nguyên tố trong bảng tuần hoàn
                  </h3>
                  <ul className="space-y-2 text-xs sm:text-sm text-slate-800 leading-relaxed list-disc pl-5">
                    <li>
                      Các nguyên tố được sắp xếp theo <strong>chiều tăng dần của điện tích hạt nhân nguyên tử</strong>.
                    </li>
                    <li>
                      Các nguyên tố có <strong>cùng số lớp electron</strong> được xếp thành một hàng (<strong>chu kì</strong>).
                    </li>
                    <li>
                      Các nguyên tố có <strong>cùng số electron hóa trị</strong> được xếp thành một cột (<strong>nhóm</strong>).
                    </li>
                  </ul>
                  <div className="p-3.5 rounded-xl bg-amber-50/90 border border-amber-200 text-xs sm:text-sm text-amber-950 leading-relaxed">
                    <strong>* Electron hóa trị</strong> là các electron có khả năng tham gia hình thành liên kết hóa học, thường nằm ở <strong>lớp ngoài cùng</strong> hoặc <strong>phân lớp sát ngoài cùng</strong> chưa bão hòa.
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-display text-base sm:text-lg font-extrabold text-slate-900">
                    2. Cấu tạo bảng tuần hoàn
                  </h3>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 flex flex-col justify-between">
                      <div className="space-y-2.5">
                        <h4 className="font-display text-sm sm:text-base font-extrabold text-sky-800">
                          2.1. Ô nguyên tố
                        </h4>
                        <ul className="space-y-1.5 text-xs sm:text-sm text-slate-800 list-disc pl-5">
                          <li>Số hiệu nguyên tử (Z)</li>
                          <li>Kí hiệu hóa học</li>
                          <li>Tên nguyên tố</li>
                          <li>Nguyên tử khối trung bình</li>
                        </ul>
                      </div>
                      <div className="p-3 rounded-xl bg-sky-50 border border-sky-200 text-xs sm:text-sm font-bold text-sky-950">
                        * Số thứ tự ô = Số hiệu nguyên tử = Số proton = Số electron
                      </div>
                    </div>

                    <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 flex flex-col justify-between">
                      <div className="space-y-2.5">
                        <h4 className="font-display text-sm sm:text-base font-extrabold text-indigo-800">
                          2.2. Chu kì
                        </h4>
                        <ul className="space-y-1.5 text-xs sm:text-sm text-slate-800 list-disc pl-5 leading-relaxed">
                          <li>Gồm các nguyên tố mà nguyên tử của chúng có <strong>cùng số lớp electron</strong>.</li>
                          <li>Gồm <strong>7 chu kì</strong> (Chu kì 1, 2, 3 là chu kì nhỏ; Chu kì 4, 5, 6, 7 là chu kì lớn).</li>
                        </ul>
                      </div>
                      <div className="p-3 rounded-xl bg-indigo-50 border border-indigo-200 text-xs sm:text-sm font-bold text-indigo-950">
                        * Số thứ tự chu kì = Số lớp electron trong nguyên tử
                      </div>
                    </div>
                  </div>

                  <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
                    <h4 className="font-display text-sm sm:text-base font-extrabold text-rose-800">
                      2.3. Nhóm nguyên tố
                    </h4>
                    <p className="text-xs sm:text-sm text-slate-800 leading-relaxed">
                      Gồm các nguyên tố có cấu hình electron tương tự nhau, do đó tính chất hóa học tương tự nhau, được xếp thành một cột.
                      Gồm <strong>8 nhóm A (IA đến VIIIA)</strong> và <strong>8 nhóm B (IB đến VIIIB)</strong>.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs sm:text-sm">
                      <div className="p-3.5 rounded-xl bg-sky-50/80 border border-sky-200">
                        <div className="font-extrabold text-sky-950">Nhóm A (Nguyên tố s và p)</div>
                        <div className="font-mono font-bold text-sky-800 mt-1">Số thứ tự nhóm A = Số electron lớp ngoài cùng</div>
                      </div>
                      <div className="p-3.5 rounded-xl bg-rose-50/80 border border-rose-200">
                        <div className="font-extrabold text-rose-950">Nhóm B (Nguyên tố d và f)</div>
                        <div className="font-mono font-bold text-rose-800 mt-1">Cấu hình: (n-1)d^x ns^y (x+y xác định nhóm B)</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

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
                          <strong>Bán kính nguyên tử</strong> đặc trưng cho kích thước của nguyên tử, được tính gần đúng bằng <strong>một nửa khoảng cách trung bình giữa hai hạt nhân nguyên tử gần nhau nhất</strong> trong đơn chất hoặc phân tử (<span className="font-mono font-bold text-indigo-800">r = d / 2</span>).
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

                <div className="lg:col-span-12 space-y-3 pt-4 border-t border-slate-200">
                  <h4 className="font-display text-base font-extrabold text-slate-900">
                    Ví dụ tính bán kính chuẩn SGK Hóa 10
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                      <div className="font-extrabold text-slate-900 text-sm">Phân tử Cl2 (d = 198 pm)</div>
                      <p className="text-xs text-slate-700">r(Cl) = 198 / 2 = <strong className="text-emerald-700 font-mono">99 pm</strong></p>
                    </div>
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                      <div className="font-extrabold text-slate-900 text-sm">Phân tử H2 (d = 74 pm)</div>
                      <p className="text-xs text-slate-700">r(H) = 74 / 2 = <strong className="text-sky-700 font-mono">37 pm</strong></p>
                    </div>
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                      <div className="font-extrabold text-slate-900 text-sm">Tinh thể Cu (d = 256 pm)</div>
                      <p className="text-xs text-slate-700">r(Cu) = 256 / 2 = <strong className="text-amber-700 font-mono">128 pm</strong></p>
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-12 space-y-4 pt-3 border-t border-slate-200">
                  <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-50/90 via-white to-sky-50/80 border-2 border-indigo-200 space-y-4">
                    <h4 className="font-display text-base font-extrabold text-slate-900">
                      Câu hỏi quan sát: Trong cùng 1 chu kì (Chu kì 3), bán kính biến đổi thế nào?
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      {[
                        { key: 'A', text: 'A. Tăng dần theo chiều tăng Z' },
                        { key: 'B', text: 'B. Giảm dần theo chiều tăng Z' },
                        { key: 'C', text: 'C. Không đổi do cùng 3 lớp electron' },
                        { key: 'D', text: 'D. Biến đổi ngẫu nhiên' },
                      ].map((opt) => (
                        <button
                          key={opt.key}
                          type="button"
                          onClick={() => setPeriodObservationAnswer(opt.key)}
                          className={`p-3 rounded-xl border text-left font-semibold transition-all cursor-pointer ${
                            periodObservationAnswer === opt.key
                              ? opt.key === 'B'
                                ? 'bg-emerald-600 text-white border-emerald-600'
                                : 'bg-rose-600 text-white border-rose-600'
                              : 'bg-white hover:bg-slate-50 text-slate-800 border-slate-200'
                          }`}
                        >
                          {opt.text}
                        </button>
                      ))}
                    </div>
                    {periodObservationAnswer && (
                      <div
                        className={`p-4 rounded-xl border text-xs leading-relaxed space-y-1 ${
                          periodObservationAnswer === 'B'
                            ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                            : 'bg-rose-50 border-rose-300 text-rose-950'
                        }`}
                      >
                        <div className="font-bold flex items-center gap-1.5">
                          {periodObservationAnswer === 'B' ? (
                            <>
                              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                              <span>Chính xác: Bán kính nguyên tử GIẢM DẦN từ trái sang phải!</span>
                            </>
                          ) : (
                            <>
                              <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
                              <span>Chưa đúng! Đáp án chính xác là B.</span>
                            </>
                          )}
                        </div>
                        <p>
                          Trong Chu kì 3, các nguyên tố Na đến Cl cùng có 3 lớp electron, nhưng điện tích hạt nhân Z tăng từ +11 lên +17 làm lực hút hạt nhân với electron ngoài cùng tăng, kéo mây electron lại gần hạt nhân hơn khiến bán kính giảm: Na (186 pm) &gt; Mg (160) &gt; Al (143) &gt; Cl (99 pm).
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeSubTab === 'explanation' && (
              <div className="pt-2 space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-50/70 to-white border border-indigo-200 space-y-3">
                    <div className="text-xs font-extrabold text-indigo-700">Trong cùng 1 chu kì</div>
                    <h3 className="font-display text-lg font-extrabold text-slate-900">
                      Bán kính nguyên tử GIẢM DẦN vì:
                    </h3>
                    <ul className="space-y-2 text-sm text-slate-800 leading-relaxed list-disc pl-5">
                      <li>Số lớp electron không đổi.</li>
                      <li>Điện tích hạt nhân tăng dần → lực hút electron mạnh hơn → bán kính giảm dần.</li>
                    </ul>
                  </div>

                  <div className="p-5 rounded-2xl bg-gradient-to-br from-sky-50/70 to-white border border-sky-200 space-y-3">
                    <div className="text-xs font-extrabold text-sky-700">Trong cùng 1 nhóm A</div>
                    <h3 className="font-display text-lg font-extrabold text-slate-900">
                      Bán kính nguyên tử TĂNG DẦN vì:
                    </h3>
                    <ul className="space-y-2 text-sm text-slate-800 leading-relaxed list-disc pl-5">
                      <li>Số lớp electron tăng dần.</li>
                      <li>Mặc dù điện tích hạt nhân tăng, nhưng số lớp electron tăng làm electron ngoài cùng càng xa hạt nhân → bán kính tăng dần.</li>
                    </ul>
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-gradient-to-br from-amber-50/90 via-white to-rose-50/60 border-2 border-amber-300 space-y-3">
                  <div className="flex items-center gap-2">
                    <Zap className="w-5 h-5 text-amber-600" />
                    <h3 className="font-display text-lg font-extrabold text-slate-900">
                      Em có biết: Năng lượng ion hóa thứ nhất (I1)
                    </h3>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-800 leading-relaxed">
                    Năng lượng ion hóa thứ nhất (I1, kJ/mol) là năng lượng tối thiểu cần thiết để tách 1 electron thứ nhất ra khỏi nguyên tử ở trạng thái cơ bản: X(g) → X⁺(g) + 1e.
                    Xu hướng: <strong>Trong 1 chu kì, bán kính giảm → I1 tăng dần</strong>; <strong>Trong 1 nhóm A, bán kính tăng → I1 giảm dần</strong>.
                  </p>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
                    <div className="flex items-center gap-2.5">
                      <Sliders className="w-5 h-5 text-sky-600" />
                      <h4 className="font-display text-base font-extrabold text-slate-900">
                        Thực nghiệm tương tác: Kéo thanh trượt quan sát biến đổi bán kính
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
              </div>
            )}

            {activeSubTab === 'sorting_practice' && (
              <div className="pt-2 space-y-6">
                <AtomicRadiusSortingGame />
              </div>
            )}

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
