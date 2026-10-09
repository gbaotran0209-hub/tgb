import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ELEMENTS, ELEMENT_BY_SYMBOL, ChemicalElement } from '../data/elements';
import { WORKED_EXAMPLES } from '../data/questions';
import {
  ArrowRight,
  ArrowDown,
  Sliders,
  BarChart3,
  BookOpen,
  Scale,
  CheckCircle2,
  Eye,
  Atom,
  Zap,
  Layers,
} from 'lucide-react';

interface AtomicRadiusTheorySectionProps {
  onSelectElementOnTable: (el: ChemicalElement) => void;
  onOpenHeatmapTable: () => void;
  onJumpToQuiz: () => void;
}

type TheorySubTab =
  | 'what_is_it'
  | 'how_it_changes'
  | 'explanation'
  | 'examples'
  | 'ion_lab'
  | 'periodic_links';

type ChartDimension = 'period' | 'groupA';

const GROUP_A_LIST = ['IA', 'IIA', 'IIIA', 'IVA', 'VA', 'VIA', 'VIIA'] as const;
const PERIOD_LIST = [2, 3, 4, 5, 6] as const;

const POPULAR_COMPARE_SYMBOLS = [
  'Li', 'Be', 'B', 'C', 'N', 'O', 'F',
  'Na', 'Mg', 'Al', 'Si', 'P', 'S', 'Cl',
  'K', 'Ca', 'Br', 'Rb', 'Sr', 'I', 'Cs', 'Ba',
];

interface IonTransformData {
  symbol: string;
  name: string;
  viName: string;
  z: number;
  type: 'cation' | 'anion';
  actionLabel: string;
  ionSymbol: string;
  atomConfig: string;
  ionConfig: string;
  atomShells: number[];
  ionShells: number[];
  atomRadius: number;
  ionRadius: number;
  explanation: string;
}

const ION_LAB_ITEMS: IonTransformData[] = [
  {
    symbol: 'Na',
    name: 'Sodium',
    viName: 'Natri',
    z: 11,
    type: 'cation',
    actionLabel: 'Nhường 1e (Tạo cation Na⁺)',
    ionSymbol: 'Na⁺',
    atomConfig: '1s² 2s² 2p⁶ 3s¹',
    ionConfig: '1s² 2s² 2p⁶ (Giống Ne)',
    atomShells: [2, 8, 1],
    ionShells: [2, 8],
    atomRadius: 186,
    ionRadius: 102,
    explanation:
      'Nguyên tử Na nhường 1e ở lớp thứ 3 (3s¹) để tạo ion dương Na⁺. Lúc này Na⁺ mất hẳn lớp vỏ thứ 3 (chỉ còn 2 lớp e), đồng thời hạt nhân (+11) hút 10e còn lại mạnh hơn nên bán kính co rút mạnh từ 186 pm xuống 102 pm: R(Na⁺) < R(Na).',
  },
  {
    symbol: 'Mg',
    name: 'Magnesium',
    viName: 'Magiê',
    z: 12,
    type: 'cation',
    actionLabel: 'Nhường 2e (Tạo cation Mg²⁺)',
    ionSymbol: 'Mg²⁺',
    atomConfig: '1s² 2s² 2p⁶ 3s²',
    ionConfig: '1s² 2s² 2p⁶ (Giống Ne)',
    atomShells: [2, 8, 2],
    ionShells: [2, 8],
    atomRadius: 160,
    ionRadius: 72,
    explanation:
      'Nguyên tử Mg nhường 2e lớp ngoài cùng (3s²) tạo cation Mg²⁺. Số lớp electron giảm từ 3 lớp xuống 2 lớp và điện tích hạt nhân +12 hút chặt 10e còn lại nên bán kính giảm hơn một nửa (từ 160 pm xuống 72 pm): R(Mg²⁺) < R(Mg).',
  },
  {
    symbol: 'Al',
    name: 'Aluminium',
    viName: 'Nhôm',
    z: 13,
    type: 'cation',
    actionLabel: 'Nhường 3e (Tạo cation Al³⁺)',
    ionSymbol: 'Al³⁺',
    atomConfig: '1s² 2s² 2p⁶ 3s² 3p¹',
    ionConfig: '1s² 2s² 2p⁶ (Giống Ne)',
    atomShells: [2, 8, 3],
    ionShells: [2, 8],
    atomRadius: 143,
    ionRadius: 54,
    explanation:
      'Nguyên tử Al nhường 3e hóa trị tạo cation Al³⁺. Mất lớp electron thứ 3 và điện tích hạt nhân lớn (+13) kéo 10e lại rất sát hạt nhân, làm bán kính giảm từ 143 pm xuống chỉ còn 54 pm: R(Al³⁺) < R(Al).',
  },
  {
    symbol: 'Cl',
    name: 'Chlorine',
    viName: 'Clo',
    z: 17,
    type: 'anion',
    actionLabel: 'Nhận thêm 1e (Tạo anion Cl⁻)',
    ionSymbol: 'Cl⁻',
    atomConfig: '[Ne] 3s² 3p⁵',
    ionConfig: '[Ne] 3s² 3p⁶ (Giống Ar)',
    atomShells: [2, 8, 7],
    ionShells: [2, 8, 8],
    atomRadius: 99,
    ionRadius: 181,
    explanation:
      'Nguyên tử Cl nhận thêm 1e vào lớp ngoài cùng để đạt 8e bền vững (tạo anion Cl⁻). Điện tích hạt nhân vẫn là +17 nhưng lực đẩy giữa các electron trong đám mây tăng lên làm lớp vỏ phình to từ 99 pm lên 181 pm: R(Cl⁻) > R(Cl).',
  },
  {
    symbol: 'F',
    name: 'Fluorine',
    viName: 'Flo',
    z: 9,
    type: 'anion',
    actionLabel: 'Nhận thêm 1e (Tạo anion F⁻)',
    ionSymbol: 'F⁻',
    atomConfig: '1s² 2s² 2p⁵',
    ionConfig: '1s² 2s² 2p⁶ (Giống Ne)',
    atomShells: [2, 8],
    ionShells: [2, 8],
    atomRadius: 64,
    ionRadius: 133,
    explanation:
      'Nguyên tử F nhận thêm 1e tạo anion F⁻ (có 10e). Do số electron tăng lên mà điện tích hạt nhân (+9) giữ nguyên nên lực đẩy nội tại giữa các electron tăng, làm bán kính tăng gấp đôi từ 64 pm lên 133 pm: R(F⁻) > R(F).',
  },
  {
    symbol: 'O',
    name: 'Oxygen',
    viName: 'Oxi',
    z: 8,
    type: 'anion',
    actionLabel: 'Nhận thêm 2e (Tạo anion O²⁻)',
    ionSymbol: 'O²⁻',
    atomConfig: '1s² 2s² 2p⁴',
    ionConfig: '1s² 2s² 2p⁶ (Giống Ne)',
    atomShells: [2, 6],
    ionShells: [2, 8],
    atomRadius: 66,
    ionRadius: 140,
    explanation:
      'Nguyên tử O nhận thêm 2e vào lớp L tạo anion O²⁻. Lực đẩy giữa 10 electron lớn hơn nhiều so với khi chỉ có 8 electron, khiến bán kính tăng mạnh từ 66 pm lên 140 pm: R(O²⁻) > R(O).',
  },
];

const ISOELECTRONIC_10E = [
  { label: 'O²⁻', z: 8, electrons: 10, radius: 140, config: '1s² 2s² 2p⁶', role: 'Anion 2-' },
  { label: 'F⁻', z: 9, electrons: 10, radius: 133, config: '1s² 2s² 2p⁶', role: 'Anion 1-' },
  { label: 'Na⁺', z: 11, electrons: 10, radius: 102, config: '1s² 2s² 2p⁶', role: 'Cation 1+' },
  { label: 'Mg²⁺', z: 12, electrons: 10, radius: 72, config: '1s² 2s² 2p⁶', role: 'Cation 2+' },
  { label: 'Al³⁺', z: 13, electrons: 10, radius: 54, config: '1s² 2s² 2p⁶', role: 'Cation 3+' },
];

export const AtomicRadiusTheorySection: React.FC<AtomicRadiusTheorySectionProps> = ({
  onSelectElementOnTable,
  onOpenHeatmapTable,
  onJumpToQuiz,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<TheorySubTab>('what_is_it');

  // Interactive Chart state
  const [chartDimension, setChartDimension] = useState<ChartDimension>('period');
  const [selectedPeriod, setSelectedPeriod] = useState<number>(3);
  const [selectedGroupA, setSelectedGroupA] = useState<string>('IA');

  // Interactive Simulator state (for Explanation tab)
  const [simMode, setSimMode] = useState<'period2' | 'period3' | 'groupIA' | 'groupVIIA'>('period3');
  const [simStepIndex, setSimStepIndex] = useState<number>(0);

  // Interactive Multi-Element Comparator state (for Examples tab)
  const [compareSymbols, setCompareSymbols] = useState<string[]>(['Na', 'Mg', 'Al', 'K']);

  // Ion Lab state (Idea 1)
  const [selectedIonIdx, setSelectedIonIdx] = useState<number>(0);
  const [isIonized, setIsIonized] = useState<boolean>(false);

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

  const toggleCompareSymbol = (sym: string) => {
    setCompareSymbols((prev) => {
      if (prev.includes(sym)) {
        if (prev.length <= 2) return prev;
        return prev.filter((s) => s !== sym);
      }
      if (prev.length >= 6) return prev;
      return [...prev, sym];
    });
  };

  const comparedElementsAsc = useMemo(() => {
    return compareSymbols
      .map((s) => ELEMENT_BY_SYMBOL[s])
      .filter((el): el is ChemicalElement => Boolean(el && el.atomicRadius !== null))
      .sort((a, b) => (a.atomicRadius ?? 0) - (b.atomicRadius ?? 0));
  }, [compareSymbols]);

  const comparedElementsDesc = useMemo(() => {
    return [...comparedElementsAsc].reverse();
  }, [comparedElementsAsc]);

  const currentIonItem = ION_LAB_ITEMS[selectedIonIdx] ?? ION_LAB_ITEMS[0];
  const activeShells = isIonized ? currentIonItem.ionShells : currentIonItem.atomShells;
  const activeRadius = isIonized ? currentIonItem.ionRadius : currentIonItem.atomRadius;

  return (
    <div className="space-y-6">
      {/* Big 6-Pillar Interactive Navigation Deck */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-xs space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div>
            <div className="text-xs font-semibold text-indigo-600">
              Chuyên đề trọng tâm & Mở rộng nâng cao Hóa học 10
            </div>
            <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
              Quy luật Bán kính nguyên tử, Bán kính Ion & Độ âm điện
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
              <span>Làm 18 câu Bài tập vận dụng</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* 6 Interactive Sub-Section Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {(
            [
              {
                id: 'what_is_it',
                step: 'Mục 01 · Cơ bản',
                title: 'Bán kính nguyên tử là gì?',
                desc: 'Khái niệm chuẩn SGK, đơn vị đo pm & sơ đồ xác định r = d/2',
              },
              {
                id: 'how_it_changes',
                step: 'Mục 02 · Quy luật',
                title: 'Biến đổi thế nào?',
                desc: 'Quy luật trong Chu kì & Nhóm A kèm biểu đồ cột & cầu 3D',
              },
              {
                id: 'explanation',
                step: 'Mục 03 · Bản chất',
                title: 'Giải thích quy luật',
                desc: 'Mô phỏng lực hút hạt nhân (+Z) và số lớp electron (n)',
              },
              {
                id: 'examples',
                step: 'Mục 04 · Thực hành',
                title: 'Ví dụ & Máy so sánh',
                desc: '3 bài mẫu giải chi tiết & công cụ tự chọn nguyên tố so sánh',
              },
              {
                id: 'ion_lab',
                step: 'Mục 05 · Nâng cao ăn điểm',
                title: 'Phòng thí nghiệm Nguyên tử & Ion',
                desc: 'Biến đổi nhường/nhận e (Na⁺, Cl⁻...) & Dãy đẳng electron 10e',
              },
              {
                id: 'periodic_links',
                step: 'Mục 06 · Tổng hợp chương',
                title: 'Liên hệ Độ âm điện & Kim loại – Phi kim',
                desc: 'Đồng bộ quy luật Bán kính ↔ Độ âm điện ↔ Tính Kim loại / Phi kim',
              },
            ] as { id: TheorySubTab; step: string; title: string; desc: string }[]
          ).map((item) => {
            const isActive = activeSubTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveSubTab(item.id)}
                className={`p-4 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
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
                  <h3 className="font-display text-base font-extrabold mt-0.5">
                    {item.title}
                  </h3>
                </div>
                <p
                  className={`text-xs mt-1.5 leading-relaxed ${
                    isActive ? 'text-slate-300' : 'text-slate-500'
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
            {/* PILLAR 1: LÀ GÌ? */}
            {activeSubTab === 'what_is_it' && (
              <div className="pt-2 grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                <div className="lg:col-span-7 space-y-4 flex flex-col justify-between">
                  <div className="space-y-4">
                    <div className="inline-flex items-center gap-2 text-xs font-bold text-sky-700">
                      <BookOpen className="w-4 h-4" />
                      <span>Khái niệm chuẩn theo Sách Giáo Khoa Hóa học 10</span>
                    </div>
                    <h3 className="font-display text-xl sm:text-2xl font-extrabold text-slate-900">
                      1. Khái niệm Bán kính nguyên tử
                    </h3>
                    <div className="p-5 rounded-2xl bg-gradient-to-br from-sky-50/80 to-indigo-50/50 border border-sky-200/80 space-y-3 text-sm text-slate-800 leading-relaxed">
                      <p>
                        <strong className="text-slate-950">Định nghĩa:</strong> Bán kính nguyên tử là khoảng cách từ{' '}
                        <strong className="text-sky-700">tâm hạt nhân</strong> đến{' '}
                        <strong className="text-sky-700">lớp electron ngoài cùng</strong> của nguyên tử.
                      </p>
                      <p>
                        Do các electron chuyển động rất nhanh xung quanh hạt nhân tạo nên đám mây electron không có ranh giới cố định, nên trong thực nghiệm người ta xác định bán kính nguyên tử bằng{' '}
                        <strong>một nửa khoảng cách giữa hai tâm hạt nhân của hai nguyên tử cùng loại liên kết với nhau</strong> trong phân tử đơn chất hoặc tinh thể (<span className="font-mono font-bold text-indigo-800">r = d / 2</span>).
                      </p>
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
                    onClick={() => setActiveSubTab('how_it_changes')}
                    className="mt-3 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold text-sky-200 inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <span>Tiếp theo: Xem quy luật biến đổi</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* PILLAR 2: BIẾN ĐỔI THẾ NÀO? */}
            {activeSubTab === 'how_it_changes' && (
              <div className="pt-2 space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                  <div className="lg:col-span-6 space-y-4 flex flex-col justify-between">
                    <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-50/90 to-slate-50 border border-indigo-200 space-y-2">
                      <div className="flex items-center gap-2 text-xs font-extrabold text-indigo-700">
                        <ArrowRight className="w-4 h-4" />
                        <span>Quy luật 1: Trong một Chu kì (Đi từ Trái sang Phải)</span>
                      </div>
                      <p className="text-sm text-slate-800 leading-relaxed">
                        Trong một chu kì, theo chiều tăng dần của điện tích hạt nhân (<span className="font-mono font-bold">Z</span> tăng), bán kính nguyên tử của các nguyên tố nhóm A{' '}
                        <strong className="text-indigo-700 underline decoration-indigo-300 underline-offset-4">
                          GIẢM DẦN
                        </strong>.
                      </p>
                      <p className="text-xs text-slate-600 font-mono pt-1">
                        Ví dụ Chu kì 2: Li (152 pm) &gt; Be (112) &gt; B (85) &gt; C (77) &gt; N (70) &gt; O (66) &gt; F (64 pm).
                      </p>
                    </div>

                    <div className="p-5 rounded-2xl bg-gradient-to-br from-sky-50/90 to-slate-50 border border-sky-200 space-y-2">
                      <div className="flex items-center gap-2 text-xs font-extrabold text-sky-700">
                        <ArrowDown className="w-4 h-4" />
                        <span>Quy luật 2: Trong một Nhóm A (Đi từ Trên xuống Dưới)</span>
                      </div>
                      <p className="text-sm text-slate-800 leading-relaxed">
                        Trong một nhóm A, theo chiều tăng dần của điện tích hạt nhân (từ trên xuống dưới), bán kính nguyên tử của các nguyên tố{' '}
                        <strong className="text-sky-700 underline decoration-sky-300 underline-offset-4">
                          TĂNG DẦN
                        </strong>.
                      </p>
                      <p className="text-xs text-slate-600 font-mono pt-1">
                        Ví dụ Nhóm IA: Li (152 pm) &lt; Na (186) &lt; K (227) &lt; Rb (248) &lt; Cs (265 pm).
                      </p>
                    </div>
                  </div>

                  {/* Mini Visual Heatmap Schematic with Arrows */}
                  <div className="lg:col-span-6 bg-slate-50 border border-slate-200 rounded-2xl p-5 flex flex-col justify-between">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-slate-800">
                        Minh họa Tô màu Đậm – Nhạt & Mũi tên chiều biến đổi (Nhóm A)
                      </span>
                      <span className="text-[11px] text-slate-500">Bấm vào ô để xem chi tiết</span>
                    </div>
                    <div className="relative bg-white border border-slate-200 rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-3 pl-8">
                        <span className="text-[11px] font-bold text-indigo-800 whitespace-nowrap">
                          Chu kì (Z tăng): Bán kính GIẢM DẦN
                        </span>
                        <div className="flex-1 h-1 rounded bg-gradient-to-r from-indigo-800 to-indigo-200 relative">
                          <span className="absolute -right-1 -top-2.5 text-indigo-600 font-bold">→</span>
                        </div>
                      </div>

                      <div className="flex items-stretch gap-3">
                        <div className="flex flex-col items-center justify-between py-1 w-6">
                          <span className="text-[10px] font-bold text-sky-800 [writing-mode:vertical-rl] rotate-180">
                            Nhóm A: Bán kính TĂNG DẦN
                          </span>
                          <span className="text-sky-700 font-bold text-sm">↓</span>
                        </div>

                        <div className="flex-1 grid grid-cols-7 gap-1.5 text-center">
                          {['IA', 'IIA', 'IIIA', 'IVA', 'VA', 'VIA', 'VIIA'].map((g) => (
                            <div key={g} className="text-[10px] font-mono font-bold text-slate-500 pb-1">
                              {g}
                            </div>
                          ))}
                          {[
                            ['Li', 'Be', 'B', 'C', 'N', 'O', 'F'],
                            ['Na', 'Mg', 'Al', 'Si', 'P', 'S', 'Cl'],
                            ['K', 'Ca', 'Ga', 'Ge', 'As', 'Se', 'Br'],
                            ['Rb', 'Sr', 'In', 'Sn', 'Sb', 'Te', 'I'],
                          ].map((row, rIdx) =>
                            row.map((sym) => {
                              const el = ELEMENT_BY_SYMBOL[sym];
                              const r = el?.atomicRadius ?? 100;
                              const circleDiameter = Math.max(8, Math.min(28, Math.round(r / 8.5)));
                              const shade =
                                r >= 200
                                  ? 'bg-indigo-950 text-white'
                                  : r >= 155
                                  ? 'bg-indigo-700 text-white'
                                  : r >= 125
                                  ? 'bg-indigo-400 text-slate-950'
                                  : r >= 95
                                  ? 'bg-indigo-200 text-slate-900'
                                  : 'bg-indigo-50 text-slate-800 border border-indigo-200';
                              return (
                                <button
                                  key={`${rIdx}-${sym}`}
                                  type="button"
                                  onClick={() => el && onSelectElementOnTable(el)}
                                  className={`p-1.5 rounded-lg flex flex-col items-center justify-center gap-1 transition-transform hover:scale-105 cursor-pointer ${shade}`}
                                  title={`Bấm để xem ${sym} (${r} pm) trên Bảng tuần hoàn`}
                                >
                                  <span
                                    className="rounded-full bg-current opacity-35 inline-block"
                                    style={{ width: `${circleDiameter}px`, height: `${circleDiameter}px` }}
                                  />
                                  <span className="font-display text-xs font-bold leading-none">{sym}</span>
                                  <span className="font-mono text-[9px] opacity-90 leading-none">{r}</span>
                                </button>
                              );
                            })
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Interactive Chart: Explore any Period or Group A */}
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-2.5">
                      <BarChart3 className="w-5 h-5 text-sky-600" />
                      <div>
                        <h4 className="font-display text-base font-extrabold text-slate-900">
                          Biểu đồ tương tác & Hình cầu nguyên tử tỉ lệ thực (Đơn vị: pm)
                        </h4>
                        <p className="text-xs text-slate-600">
                          Bấm chọn Chu kì (2–6) hoặc Nhóm A (IA–VIIA) để quan sát sự thay đổi kích thước nguyên tử
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <div className="inline-flex p-1 bg-white border border-slate-200 rounded-xl">
                        <button
                          type="button"
                          onClick={() => setChartDimension('period')}
                          className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                            chartDimension === 'period'
                              ? 'bg-slate-900 text-white'
                              : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          Theo Chu kì (Trái → Phải)
                        </button>
                        <button
                          type="button"
                          onClick={() => setChartDimension('groupA')}
                          className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                            chartDimension === 'groupA'
                              ? 'bg-slate-900 text-white'
                              : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          Theo Nhóm A (Trên → Dưới)
                        </button>
                      </div>

                      {chartDimension === 'period' ? (
                        <div className="inline-flex p-1 bg-white border border-slate-200 rounded-xl gap-1">
                          {PERIOD_LIST.map((p) => (
                            <button
                              key={p}
                              type="button"
                              onClick={() => setSelectedPeriod(p)}
                              className={`px-2.5 py-1.5 text-xs font-mono font-bold rounded-lg transition-colors cursor-pointer ${
                                selectedPeriod === p
                                  ? 'bg-sky-600 text-white'
                                  : 'text-slate-600 hover:text-slate-900'
                              }`}
                            >
                              Chu kì {p}
                            </button>
                          ))}
                        </div>
                      ) : (
                        <div className="inline-flex p-1 bg-white border border-slate-200 rounded-xl gap-1">
                          {GROUP_A_LIST.map((g) => (
                            <button
                              key={g}
                              type="button"
                              onClick={() => setSelectedGroupA(g)}
                              className={`px-2.5 py-1.5 text-xs font-mono font-bold rounded-lg transition-colors cursor-pointer ${
                                selectedGroupA === g
                                  ? 'bg-sky-600 text-white'
                                  : 'text-slate-600 hover:text-slate-900'
                              }`}
                            >
                              {g}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="bg-white border border-slate-200 rounded-xl p-5">
                    <div className="grid grid-cols-2 sm:grid-cols-7 gap-4 items-end min-h-[240px] pt-6">
                      {chartElements.map((el) => {
                        const r = el.atomicRadius ?? 100;
                        const heightPercent = Math.max(18, Math.min(100, Math.round((r / 270) * 100)));
                        const sphereSize = Math.max(18, Math.min(68, Math.round(r / 4.0)));

                        return (
                          <button
                            key={el.atomicNumber}
                            type="button"
                            onClick={() => onSelectElementOnTable(el)}
                            className="group flex flex-col items-center justify-end h-full text-center focus:outline-none cursor-pointer"
                          >
                            <div className="h-18 flex items-center justify-center mb-2">
                              <div
                                className="rounded-full flex items-center justify-center transition-transform group-hover:scale-110 shadow-sm border border-sky-400/60"
                                style={{
                                  width: `${sphereSize}px`,
                                  height: `${sphereSize}px`,
                                  background:
                                    'radial-gradient(circle at 32% 32%, #e0f2fe 0%, #38bdf8 55%, #0369a1 100%)',
                                }}
                              >
                                <span className="w-1.5 h-1.5 rounded-full bg-white/90" />
                              </div>
                            </div>

                            <span className="font-mono text-xs font-extrabold text-slate-900 tabular-nums mb-1">
                              {r} pm
                            </span>

                            <div className="w-full max-w-[46px] h-28 bg-slate-100 rounded-t-xl flex items-end overflow-hidden p-0.5">
                              <div
                                className="w-full rounded-t-lg bg-gradient-to-t from-indigo-700 via-sky-600 to-sky-400 transition-all duration-300"
                                style={{ height: `${heightPercent}%` }}
                              />
                            </div>

                            <div className="mt-2 pt-1.5 border-t border-slate-100 w-full">
                              <div className="font-display text-sm font-extrabold text-slate-900">
                                {el.symbol}{' '}
                                <span className="font-mono text-[11px] font-normal text-slate-500">
                                  (Z={el.atomicNumber})
                                </span>
                              </div>
                              <div className="text-[11px] text-slate-500">
                                {el.vietnameseName} · {el.period} lớp e
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* PILLAR 3: GIẢI THÍCH */}
            {activeSubTab === 'explanation' && (
              <div className="pt-2 space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-50/70 to-white border border-indigo-200 space-y-3">
                    <div className="text-xs font-extrabold text-indigo-700">
                      Giải thích quy luật 1 · Trong cùng một Chu kì (Trái → Phải)
                    </div>
                    <h3 className="font-display text-lg font-extrabold text-slate-900">
                      Vì sao bán kính nguyên tử GIẢM DẦN khi Z tăng trong 1 chu kì?
                    </h3>
                    <ul className="space-y-2 text-sm text-slate-700 leading-relaxed list-disc pl-5">
                      <li>
                        <strong>Số lớp electron không đổi:</strong> Các nguyên tố cùng một chu kì đều có{' '}
                        <strong className="text-slate-900">cùng số lớp electron</strong>.
                      </li>
                      <li>
                        <strong>Điện tích hạt nhân tăng dần:</strong> Đi từ trái sang phải, <span className="font-mono font-bold">Z</span> tăng nên{' '}
                        <strong className="text-indigo-700">điện tích hạt nhân (+Z) tăng dần</strong>.
                      </li>
                      <li>
                        <strong>Kết luận:</strong> Lực hút tĩnh điện giữa hạt nhân với các electron lớp ngoài cùng{' '}
                        <strong>tăng mạnh</strong>, kéo các lớp vỏ electron co lại gần hạt nhân hơn →{' '}
                        <strong className="text-slate-900">Bán kính nguyên tử giảm dần</strong>.
                      </li>
                    </ul>
                  </div>

                  <div className="p-5 rounded-2xl bg-gradient-to-br from-sky-50/70 to-white border border-sky-200 space-y-3">
                    <div className="text-xs font-extrabold text-sky-700">
                      Giải thích quy luật 2 · Trong cùng một Nhóm A (Trên → Dưới)
                    </div>
                    <h3 className="font-display text-lg font-extrabold text-slate-900">
                      Vì sao bán kính nguyên tử TĂNG DẦN khi Z tăng trong 1 nhóm A?
                    </h3>
                    <ul className="space-y-2 text-sm text-slate-700 leading-relaxed list-disc pl-5">
                      <li>
                        <strong>Số lớp electron tăng dần:</strong> Đi từ trên xuống dưới trong một nhóm A, mỗi chu kì kế tiếp nguyên tử lại{' '}
                        <strong className="text-sky-700">tăng thêm 1 lớp electron mới</strong>.
                      </li>
                      <li>
                        <strong>Hiệu ứng chắn tăng:</strong> Các lớp electron bên trong chắn bớt lực hút của hạt nhân đối với electron lớp ngoài cùng.
                      </li>
                      <li>
                        <strong>Kết luận:</strong> Sự tăng số lớp electron là yếu tố quyết định làm khoảng cách từ tâm hạt nhân đến lớp vỏ ngoài cùng tăng lên →{' '}
                        <strong className="text-slate-900">Bán kính nguyên tử tăng dần</strong>.
                      </li>
                    </ul>
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
                          className="p-5 rounded-2xl bg-white border border-slate-200 flex items-center justify-between gap-4 shadow-xs"
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
              </div>
            )}

            {/* PILLAR 4: VÍ DỤ & MÁY SO SÁNH BÁN KÍNH */}
            {activeSubTab === 'examples' && (
              <div className="pt-2 space-y-6">
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <Scale className="w-5 h-5 text-sky-600" />
                      <div>
                        <h3 className="font-display text-base font-extrabold text-slate-900">
                          Máy so sánh bán kính nguyên tử tự động
                        </h3>
                        <p className="text-xs text-slate-600">
                          Bấm chọn từ 2 đến 6 nguyên tố bên dưới để tự động sắp xếp chiều tăng / giảm bán kính
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {POPULAR_COMPARE_SYMBOLS.map((sym) => {
                      const el = ELEMENT_BY_SYMBOL[sym];
                      const isPicked = compareSymbols.includes(sym);
                      return (
                        <button
                          key={sym}
                          type="button"
                          onClick={() => toggleCompareSymbol(sym)}
                          className={`px-3 py-1.5 rounded-xl border text-xs font-mono font-bold transition-all cursor-pointer ${
                            isPicked
                              ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                              : 'bg-white text-slate-700 border-slate-200 hover:border-slate-400'
                          }`}
                        >
                          {sym} (Z={el?.atomicNumber})
                        </button>
                      );
                    })}
                  </div>

                  <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                      <div className="p-3.5 rounded-xl bg-sky-50/70 border border-sky-200">
                        <span className="text-sky-900 font-semibold block mb-1">
                          Chiều TĂNG DẦN bán kính nguyên tử:
                        </span>
                        <div className="font-mono text-sm font-extrabold text-slate-900">
                          {comparedElementsAsc
                            .map((el) => `R(${el.symbol}) [${el.atomicRadius} pm]`)
                            .join(' < ')}
                        </div>
                      </div>
                      <div className="p-3.5 rounded-xl bg-indigo-50/70 border border-indigo-200">
                        <span className="text-indigo-900 font-semibold block mb-1">
                          Chiều GIẢM DẦN bán kính nguyên tử:
                        </span>
                        <div className="font-mono text-sm font-extrabold text-slate-900">
                          {comparedElementsDesc
                            .map((el) => `R(${el.symbol}) [${el.atomicRadius} pm]`)
                            .join(' > ')}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-6 gap-3 pt-2">
                      {comparedElementsAsc.map((el, i) => {
                        const size = Math.max(22, Math.min(70, Math.round((el.atomicRadius ?? 100) / 3.7)));
                        return (
                          <div
                            key={el.symbol}
                            className="p-3 rounded-xl border border-slate-100 bg-slate-50/70 flex flex-col items-center justify-end text-center"
                          >
                            <div className="h-20 flex items-center justify-center">
                              <div
                                className="rounded-full flex items-center justify-center shadow-xs border border-sky-400/60"
                                style={{
                                  width: `${size}px`,
                                  height: `${size}px`,
                                  background:
                                    'radial-gradient(circle at 32% 32%, #e0f2fe 0%, #38bdf8 55%, #0369a1 100%)',
                                }}
                              >
                                <span className="font-mono text-[10px] font-extrabold text-white drop-shadow-xs">
                                  {el.symbol}
                                </span>
                              </div>
                            </div>
                            <div className="font-display text-xs font-extrabold text-slate-900 mt-1">
                              #{i + 1}. {el.name} ({el.symbol})
                            </div>
                            <div className="text-[11px] text-slate-500">
                              Chu kì {el.period} · Nhóm {el.groupRoman}
                            </div>
                            <div className="font-mono text-xs font-extrabold text-indigo-700 mt-0.5">
                              {el.atomicRadius} pm
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* 3 Worked Textbook Examples */}
                <div className="space-y-4">
                  <h3 className="font-display text-lg font-extrabold text-slate-900">
                    Các ví dụ mẫu giải chi tiết từng bước
                  </h3>
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    {WORKED_EXAMPLES.map((ex) => (
                      <div
                        key={ex.id}
                        className="p-5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col justify-between space-y-4"
                      >
                        <div className="space-y-2.5">
                          <div className="text-xs text-indigo-600 font-bold">
                            Mức độ: {ex.level}
                          </div>
                          <h4 className="font-display text-base font-extrabold text-slate-900">
                            {ex.title}
                          </h4>
                          <p className="text-xs text-slate-800 bg-white p-3.5 rounded-xl border border-slate-200 leading-relaxed font-medium">
                            <strong>Đề bài:</strong> {ex.problem}
                          </p>
                          <div className="space-y-1.5 pt-1">
                            {ex.steps.map((step, sIdx) => (
                              <p key={sIdx} className="text-xs text-slate-600 leading-relaxed">
                                {step}
                              </p>
                            ))}
                          </div>
                        </div>

                        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-950 font-semibold flex items-start gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                          <span>{ex.conclusion}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* PILLAR 5 (NEW - IDEA 1): PHÒNG THÍ NGHIỆM SO SÁNH NGUYÊN TỬ & ION */}
            {activeSubTab === 'ion_lab' && (
              <div className="pt-2 space-y-6">
                {/* Core Rule Summary Banner */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 rounded-2xl bg-sky-50/80 border border-sky-200 space-y-1">
                    <div className="text-xs font-extrabold text-sky-800">
                      1. Khi Kim loại nhường e tạo Cation (Mⁿ⁺)
                    </div>
                    <div className="font-mono text-base font-extrabold text-slate-900">
                      R(Cation Mⁿ⁺) &lt; R(Nguyên tử M)
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Vì mất toàn bộ electron lớp ngoài cùng (giảm đi 1 lớp e) và hạt nhân hút các electron còn lại mạnh hơn.
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200 space-y-1">
                    <div className="text-xs font-extrabold text-amber-800">
                      2. Khi Phi kim nhận e tạo Anion (Xᵐ⁻)
                    </div>
                    <div className="font-mono text-base font-extrabold text-slate-900">
                      R(Anion Xᵐ⁻) &gt; R(Nguyên tử X)
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Vì nhận thêm electron làm tăng lực đẩy giữa các electron trong đám mây, khiến lớp vỏ phình to ra.
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-indigo-50/80 border border-indigo-200 space-y-1">
                    <div className="text-xs font-extrabold text-indigo-800">
                      3. Dãy các hạt Đẳng Electron (Cùng số e)
                    </div>
                    <div className="font-mono text-base font-extrabold text-slate-900">
                      Z càng lớn → Bán kính càng nhỏ
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Cùng cấu hình 1s²2s²2p⁶ (10e): R(O²⁻) &gt; R(F⁻) &gt; R(Na⁺) &gt; R(Mg²⁺) &gt; R(Al³⁺).
                    </p>
                  </div>
                </div>

                {/* Interactive Atom <-> Ion Transformer */}
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 sm:p-6 space-y-5">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-200 pb-4">
                    <div>
                      <div className="text-xs font-bold text-indigo-600">
                        Mô phỏng trực quan quá trình Nhường / Nhận electron
                      </div>
                      <h3 className="font-display text-lg sm:text-xl font-extrabold text-slate-900 mt-0.5">
                        Bấm nút biến đổi giữa Nguyên tử trung hòa và Ion tương ứng
                      </h3>
                    </div>

                    {/* Choose element to ionize */}
                    <div className="flex flex-wrap gap-1.5">
                      {ION_LAB_ITEMS.map((item, idx) => (
                        <button
                          key={item.symbol}
                          type="button"
                          onClick={() => {
                            setSelectedIonIdx(idx);
                            setIsIonized(false);
                          }}
                          className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold border transition-all cursor-pointer ${
                            selectedIonIdx === idx
                              ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                              : 'bg-white text-slate-700 border-slate-200 hover:border-slate-400'
                          }`}
                        >
                          {item.symbol} → {item.ionSymbol}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                    {/* Left 6 Cols: Controls & Explanation */}
                    <div className="lg:col-span-6 space-y-4">
                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setIsIonized(false)}
                          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                            !isIonized
                              ? 'bg-slate-900 text-white shadow-sm'
                              : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                          }`}
                        >
                          Trạng thái 1: Nguyên tử {currentIonItem.symbol} trung hòa
                        </button>
                        <button
                          type="button"
                          onClick={() => setIsIonized(true)}
                          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                            isIonized
                              ? currentIonItem.type === 'cation'
                                ? 'bg-sky-600 text-white shadow-sm'
                                : 'bg-amber-600 text-white shadow-sm'
                              : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                          }`}
                        >
                          Trạng thái 2: {currentIonItem.actionLabel}
                        </button>
                      </div>

                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div
                          className={`p-4 rounded-xl border transition-all ${
                            !isIonized
                              ? 'bg-white border-slate-900 ring-1 ring-slate-900'
                              : 'bg-white/60 border-slate-200'
                          }`}
                        >
                          <div className="text-slate-500 font-semibold">
                            Nguyên tử {currentIonItem.symbol} (Z={currentIonItem.z})
                          </div>
                          <div className="font-mono text-lg font-extrabold text-slate-900 mt-1">
                            R = {currentIonItem.atomRadius} pm
                          </div>
                          <div className="font-mono text-[11px] text-slate-600 mt-1">
                            Cấu hình: {currentIonItem.atomConfig}
                          </div>
                          <div className="font-mono text-[11px] text-slate-500">
                            Phân bố lớp: {currentIonItem.atomShells.join(' - ')} ({currentIonItem.atomShells.length} lớp)
                          </div>
                        </div>

                        <div
                          className={`p-4 rounded-xl border transition-all ${
                            isIonized
                              ? 'bg-white border-indigo-600 ring-1 ring-indigo-600'
                              : 'bg-white/60 border-slate-200'
                          }`}
                        >
                          <div className="text-indigo-700 font-semibold">
                            Ion {currentIonItem.ionSymbol} (Z={currentIonItem.z})
                          </div>
                          <div className="font-mono text-lg font-extrabold text-indigo-700 mt-1">
                            R = {currentIonItem.ionRadius} pm
                          </div>
                          <div className="font-mono text-[11px] text-slate-600 mt-1">
                            Cấu hình: {currentIonItem.ionConfig}
                          </div>
                          <div className="font-mono text-[11px] text-slate-500">
                            Phân bố lớp: {currentIonItem.ionShells.join(' - ')} ({currentIonItem.ionShells.length} lớp)
                          </div>
                        </div>
                      </div>

                      <div className="p-4 rounded-xl bg-white border border-slate-200 text-xs text-slate-700 leading-relaxed">
                        <strong className="text-slate-900 block mb-1">
                          Giải thích sự thay đổi bán kính ({currentIonItem.atomRadius} pm → {currentIonItem.ionRadius} pm):
                        </strong>
                        {currentIonItem.explanation}
                      </div>
                    </div>

                    {/* Right 6 Cols: Dynamic SVG Atom vs Ion Visualizer */}
                    <div className="lg:col-span-6 bg-gradient-to-br from-slate-900 to-indigo-950 text-white rounded-2xl p-6 flex flex-col items-center justify-center">
                      <div className="text-xs font-bold text-sky-300 mb-2">
                        {isIonized
                          ? `Mô hình Ion ${currentIonItem.ionSymbol} — Bán kính: ${currentIonItem.ionRadius} pm`
                          : `Mô hình Nguyên tử ${currentIonItem.symbol} — Bán kính: ${currentIonItem.atomRadius} pm`}
                      </div>

                      <svg width="240" height="220" viewBox="0 0 240 220" className="overflow-visible">
                        {/* Ghost outline of neutral atom radius for reference */}
                        <circle
                          cx="120"
                          cy="110"
                          r={Math.round(currentIonItem.atomRadius / 2.2)}
                          fill="none"
                          stroke="rgba(148, 163, 184, 0.35)"
                          strokeWidth="1.5"
                          strokeDasharray="4 4"
                        />

                        {/* Active electron cloud */}
                        <circle
                          cx="120"
                          cy="110"
                          r={Math.round(activeRadius / 2.2)}
                          fill={
                            currentIonItem.type === 'cation'
                              ? 'rgba(56, 189, 248, 0.2)'
                              : 'rgba(251, 191, 36, 0.2)'
                          }
                          stroke={currentIonItem.type === 'cation' ? '#38bdf8' : '#fbbf24'}
                          strokeWidth="2.5"
                          className="transition-all duration-300"
                        />

                        {/* Concentric Shells */}
                        {activeShells.map((elecCount, sIdx) => {
                          const outerR = Math.round(activeRadius / 2.2);
                          const r = ((sIdx + 1) / activeShells.length) * outerR;
                          return (
                            <g key={sIdx}>
                              <circle
                                cx="120"
                                cy="110"
                                r={r}
                                fill="none"
                                stroke="rgba(255,255,255,0.35)"
                                strokeWidth="1"
                              />
                              {Array.from({ length: elecCount }).map((_, eIdx) => {
                                const angle = (2 * Math.PI * eIdx) / elecCount - Math.PI / 2;
                                const cx = 120 + r * Math.cos(angle);
                                const cy = 110 + r * Math.sin(angle);
                                return (
                                  <circle
                                    key={eIdx}
                                    cx={cx}
                                    cy={cy}
                                    r="3.2"
                                    fill={currentIonItem.type === 'cation' ? '#38bdf8' : '#fbbf24'}
                                  />
                                );
                              })}
                            </g>
                          );
                        })}

                        {/* Nucleus */}
                        <circle cx="120" cy="110" r="16" fill="#0284c7" />
                        <text
                          x="120"
                          y="114"
                          textAnchor="middle"
                          className="fill-white font-mono text-[11px] font-extrabold"
                        >
                          +{currentIonItem.z}
                        </text>
                      </svg>

                      <div className="text-[11px] text-slate-300 text-center mt-2">
                        Vòng nét đứt là kích thước nguyên tử trung hòa ban đầu ({currentIonItem.atomRadius} pm) để đối chiếu.
                      </div>
                    </div>
                  </div>
                </div>

                {/* Isoelectronic Series 10e Visual Comparison */}
                <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4">
                  <div>
                    <h4 className="font-display text-base font-extrabold text-slate-900">
                      So sánh kinh điển trong đề thi: Dãy các ion đẳng electron (Cùng có 10e: 1s² 2s² 2p⁶)
                    </h4>
                    <p className="text-xs text-slate-600">
                      Tất cả 5 ion dưới đây đều có 2 lớp electron (2, 8), nhưng khi điện tích hạt nhân (+Z) tăng từ +8 đến +13 thì bán kính giảm liên tục:
                    </p>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                    {ISOELECTRONIC_10E.map((ion) => {
                      const size = Math.max(24, Math.min(72, Math.round(ion.radius / 2.0)));
                      return (
                        <div
                          key={ion.label}
                          className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col items-center justify-end text-center"
                        >
                          <div className="h-20 flex items-center justify-center">
                            <div
                              className="rounded-full flex items-center justify-center shadow-xs border border-indigo-400/60"
                              style={{
                                width: `${size}px`,
                                height: `${size}px`,
                                background:
                                  'radial-gradient(circle at 32% 32%, #e0e7ff 0%, #6366f1 60%, #312e81 100%)',
                              }}
                            >
                              <span className="font-mono text-xs font-extrabold text-white">
                                {ion.label}
                              </span>
                            </div>
                          </div>
                          <div className="font-display text-sm font-extrabold text-slate-900 mt-2">
                            Ion {ion.label} (Z = +{ion.z})
                          </div>
                          <div className="text-[11px] text-slate-500">
                            {ion.electrons} electron · {ion.config}
                          </div>
                          <div className="font-mono text-sm font-extrabold text-indigo-700 mt-1">
                            R = {ion.radius} pm
                          </div>
                        </div>
                      );
                    })}
                  </div>
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
                          <div className="text-[11px] opacity-80">{el.vietnameseName}</div>
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
