import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ELEMENTS,
  ELEMENT_BY_Z,
  COLUMN_TO_GROUP,
  ChemicalElement,
  ElementCategory,
} from '../data/elements';
import {
  Search,
  ArrowRight,
  ArrowDown,
  Compass,
  Flame,
  Zap,
  ShieldCheck,
  Scale,
} from 'lucide-react';
import { ElementDualComparison } from './ElementDualComparison';
import { Atom3DCanvas } from './Atom3DCanvas';

interface PeriodicTableSectionProps {
  selectedElement: ChemicalElement;
  onSelectElement: (el: ChemicalElement) => void;
  onNavigateTab?: (tab: 'table' | 'radius' | 'quiz') => void;
  initialColorMode?: 'category' | 'radius_heatmap';
}

type TableColorMode = 'category' | 'radius_heatmap';
type FilterMode = 'all' | 'metal' | 'nonmetal' | 'noble_gas' | 'groupA' | 'groupB';

const QUICK_SPOTLIGHT_Z = [1, 6, 8, 9, 11, 13, 17, 19, 26, 29, 55, 79];

function getElementFunFact(el: ChemicalElement): string {
  const facts: Record<number, string> = {
    1: 'Nguyên tố nhẹ nhất và phổ biến nhất trong vũ trụ, chiếm khoảng 75% khối lượng vũ trụ.',
    2: 'Khí hiếm nhẹ nhất, có bán kính nguyên tử nhỏ nhất (31 pm), dùng bơm khinh khí cầu an toàn.',
    3: 'Kim loại nhẹ nhất trong tất cả các kim loại, là thành phần chính trong pin Lithium-ion hiện đại.',
    6: 'Nền tảng của sự sống hữu cơ; tạo nên cả than chì mềm lẫn kim cương cứng nhất tự nhiên.',
    7: 'Chiếm khoảng 78% thể tích khí quyển Trái Đất, thiết yếu cho protein và axit nucleic.',
    8: 'Duy trì sự hô hấp và sự cháy; chiếm khoảng 21% thể tích không khí và gần 50% vỏ Trái Đất.',
    9: 'Phi kim mạnh nhất và có độ âm điện lớn nhất (3.98) trong bảng tuần hoàn.',
    10: 'Phát sáng màu đỏ cam rực rỡ khi có dòng điện phóng qua trong đèn quảng cáo Neon.',
    11: 'Kim loại kiềm mềm có thể cắt bằng dao, phản ứng mãnh liệt với nước tạo dung dịch kiềm.',
    12: 'Cháy với ngọn lửa trắng chói lòa, là nguyên tố trung tâm trong diệp lục tố của cây xanh.',
    13: 'Kim loại phổ biến nhất trong vỏ Trái Đất, nhẹ, bền và dẫn điện tốt.',
    14: 'Vật liệu bán dẫn cốt lõi chế tạo chip máy tính, vi xử lý và pin mặt trời.',
    17: 'Phi kim nhóm Halogen có tính oxi hóa mạnh, dùng khử trùng nước sinh hoạt và sản xuất nhựa PVC.',
    19: 'Kim loại kiềm hoạt động rất mạnh, đóng vai trò thiết yếu truyền dẫn xung thần kinh.',
    20: 'Thành phần chính cấu tạo xương, răng của cơ thể và đá vôi, thạch cao trong tự nhiên.',
    26: 'Kim loại quan trọng nhất trong công nghiệp luyện kim (thép) và vận chuyển oxy trong máu (Hemoglobin).',
    29: 'Kim loại đỏ dẫn điện và dẫn nhiệt cực tốt, sử dụng rộng rãi trong dây dẫn điện.',
    47: 'Kim loại dẫn điện và dẫn nhiệt tốt nhất trong tất cả các kim loại.',
    55: 'Kim loại kiềm có bán kính nguyên tử rất lớn (265 pm), dùng trong đồng hồ nguyên tử siêu chính xác.',
    79: 'Kim loại quý hiếm không bị oxi hóa trong không khí, có tính dẻo cao nhất.',
    80: 'Kim loại duy nhất tồn tại ở trạng thái lỏng ở điều kiện nhiệt độ phòng.',
  };

  if (facts[el.atomicNumber]) return facts[el.atomicNumber];
  if (el.category === 'noble_gas') {
    return `Nguyên tố khí hiếm thuộc nhóm VIIIA, có lớp vỏ electron ngoài cùng bền vững nên rất trơ về mặt hóa học.`;
  }
  if (el.fBlockRow === 'lanthanide') {
    return `Nguyên tố đất hiếm thuộc họ Lanthanide (Chu kì 6, Nhóm IIIB), ứng dụng trong nam châm vĩnh cửu, laser và quang học.`;
  }
  if (el.fBlockRow === 'actinide') {
    return `Nguyên tố phóng xạ thuộc họ Actinide (Chu kì 7, Nhóm IIIB), có hạt nhân nặng và kém bền.`;
  }
  if (el.category === 'metal') {
    return `Nguyên tố kim loại thuộc Chu kì ${el.period}, Nhóm ${el.groupRoman} (Nhóm ${el.groupType}), dễ nhường electron hóa trị trong các phản ứng hóa học.`;
  }
  return `Nguyên tố phi kim thuộc Chu kì ${el.period}, Nhóm ${el.groupRoman} (Nhóm ${el.groupType}), có xu hướng nhận hoặc góp chung electron khi liên kết.`;
}

export const PeriodicTableSection: React.FC<PeriodicTableSectionProps> = ({
  selectedElement,
  onSelectElement,
  onNavigateTab,
  initialColorMode = 'category',
}) => {
  const [colorMode, setColorMode] = useState<TableColorMode>(initialColorMode);
  const [filterMode, setFilterMode] = useState<FilterMode>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [highlightPeriodOrGroup, setHighlightPeriodOrGroup] = useState<'none' | 'period' | 'group'>('none');
  const [hoveredElement, setHoveredElement] = useState<ChemicalElement | null>(null);
  const [showDualCompare, setShowDualCompare] = useState<boolean>(true);
  const [compareElementA, setCompareElementA] = useState<ChemicalElement>(ELEMENT_BY_Z[11]); // Na
  const [compareElementB, setCompareElementB] = useState<ChemicalElement>(ELEMENT_BY_Z[17]); // Cl

  const mainGridMap = useMemo(() => {
    const map = new Map<string, ChemicalElement>();
    for (const el of ELEMENTS) {
      if (!el.fBlockRow) {
        map.set(`${el.period}-${el.column}`, el);
      }
    }
    return map;
  }, []);

  const lanthanides = useMemo(
    () => ELEMENTS.filter((el) => el.fBlockRow === 'lanthanide').sort((a, b) => a.atomicNumber - b.atomicNumber),
    []
  );

  const actinides = useMemo(
    () => ELEMENTS.filter((el) => el.fBlockRow === 'actinide').sort((a, b) => a.atomicNumber - b.atomicNumber),
    []
  );

  const isElementMatched = (el: ChemicalElement): boolean => {
    if (filterMode === 'metal' && el.category !== 'metal') return false;
    if (filterMode === 'nonmetal' && el.category !== 'nonmetal') return false;
    if (filterMode === 'noble_gas' && el.category !== 'noble_gas') return false;
    if (filterMode === 'groupA' && el.groupType !== 'A') return false;
    if (filterMode === 'groupB' && el.groupType !== 'B') return false;

    if (searchQuery.trim() !== '') {
      const q = searchQuery.trim().toLowerCase();
      const matchZ = el.atomicNumber.toString() === q;
      const matchSym = el.symbol.toLowerCase().includes(q);
      const matchName = el.name.toLowerCase().includes(q);
      const matchVi = el.vietnameseName.toLowerCase().includes(q);
      if (!matchZ && !matchSym && !matchName && !matchVi) return false;
    }

    if (highlightPeriodOrGroup === 'period' && el.period !== selectedElement.period) {
      return false;
    }
    if (highlightPeriodOrGroup === 'group' && el.groupRoman !== selectedElement.groupRoman) {
      return false;
    }

    return true;
  };

  const getCellStyle = (el: ChemicalElement, isSelected: boolean, isMatched: boolean) => {
    const dimmed = !isMatched ? 'opacity-20 saturate-0 scale-95' : 'opacity-100';
    const selectedRing = isSelected
      ? 'ring-2 ring-slate-950 shadow-xl shadow-slate-900/20 z-20 scale-[1.09] -translate-y-1'
      : 'hover:scale-[1.12] hover:-translate-y-1 hover:shadow-xl hover:z-30 active:scale-[1.03]';

    if (colorMode === 'category') {
      const catStyles: Record<ElementCategory, string> = {
        metal:
          'bg-gradient-to-br from-sky-50 via-sky-100/90 to-blue-100/80 border-sky-300/90 text-slate-900 hover:border-sky-500 hover:shadow-sky-500/25 hover:from-sky-100 hover:to-blue-100',
        nonmetal:
          'bg-gradient-to-br from-amber-50 via-amber-100/90 to-orange-100/80 border-amber-300/90 text-slate-900 hover:border-amber-500 hover:shadow-amber-500/25 hover:from-amber-100 hover:to-orange-100',
        noble_gas:
          'bg-gradient-to-br from-emerald-50 via-teal-100/90 to-emerald-100/80 border-emerald-300/90 text-slate-900 hover:border-emerald-500 hover:shadow-emerald-500/25 hover:from-emerald-100 hover:to-teal-100',
      };
      return `${catStyles[el.category]} ${selectedRing} ${dimmed}`;
    }

    // Radius heatmap mode
    const r = el.atomicRadius;
    const heatmapHoverShadow = 'hover:shadow-indigo-600/30 hover:ring-1 hover:ring-indigo-400';
    if (!r) {
      return `bg-slate-100 border-slate-200 text-slate-700 ${heatmapHoverShadow} ${selectedRing} ${dimmed}`;
    }
    if (r >= 220) {
      return `bg-indigo-950 border-indigo-900 text-white ${heatmapHoverShadow} ${selectedRing} ${dimmed}`;
    }
    if (r >= 180) {
      return `bg-indigo-800 border-indigo-700 text-white ${heatmapHoverShadow} ${selectedRing} ${dimmed}`;
    }
    if (r >= 150) {
      return `bg-indigo-600 border-indigo-500 text-white ${heatmapHoverShadow} ${selectedRing} ${dimmed}`;
    }
    if (r >= 125) {
      return `bg-indigo-300 border-indigo-400 text-slate-950 ${heatmapHoverShadow} ${selectedRing} ${dimmed}`;
    }
    if (r >= 95) {
      return `bg-indigo-100 border-indigo-200 text-slate-900 ${heatmapHoverShadow} ${selectedRing} ${dimmed}`;
    }
    return `bg-indigo-50/80 border-indigo-200/70 text-slate-900 ${heatmapHoverShadow} ${selectedRing} ${dimmed}`;
  };

  const categoryLabel = (cat: ElementCategory) => {
    if (cat === 'metal') return 'Kim loại';
    if (cat === 'nonmetal') return 'Phi kim';
    return 'Khí hiếm';
  };

  const renderElementCell = (el: ChemicalElement) => {
    const isSelected = el.atomicNumber === selectedElement.atomicNumber;
    const isMatched = isElementMatched(el);
    const isDarkCell =
      colorMode === 'radius_heatmap' && (el.atomicRadius ?? 0) >= 150;

    return (
      <button
        key={el.atomicNumber}
        type="button"
        onClick={() => onSelectElement(el)}
        onMouseEnter={() => setHoveredElement(el)}
        onMouseLeave={() => setHoveredElement(null)}
        title={`Ô ${el.atomicNumber}: ${el.name} (${el.vietnameseName}) - Chu kì ${el.period}, Nhóm ${el.groupRoman} (Nhóm ${el.groupType})`}
        className={`group relative flex flex-col justify-between p-1.5 rounded-lg border text-left transition-all duration-200 ease-out will-change-transform select-none min-h-[64px] cursor-pointer ${getCellStyle(
          el,
          isSelected,
          isMatched
        )}`}
      >
        {/* Top row: Atomic Number + Group Type or Radius pm */}
        <div className="flex items-center justify-between w-full leading-none">
          <span
            className={`font-mono text-[10px] font-bold tabular-nums ${
              isDarkCell ? 'text-indigo-100' : 'text-slate-700'
            }`}
          >
            {el.atomicNumber}
          </span>
          {colorMode === 'radius_heatmap' ? (
            <span
              className={`font-mono text-[9px] tabular-nums ${
                isDarkCell ? 'text-indigo-100' : 'text-indigo-800 font-semibold'
              }`}
            >
              {el.atomicRadius ? `${el.atomicRadius}` : '—'}
            </span>
          ) : (
            <span
              className={`text-[8px] font-mono font-bold uppercase tracking-tighter ${
                el.category === 'metal'
                  ? 'text-sky-800'
                  : el.category === 'nonmetal'
                  ? 'text-amber-800'
                  : 'text-emerald-800'
              }`}
            >
              {el.groupRoman}
            </span>
          )}
        </div>

        {/* Middle: Chemical Symbol + Scaled Circle in Heatmap Mode */}
        <div className="flex items-baseline justify-between my-0.5">
          <span className="font-display text-sm sm:text-base font-extrabold tracking-tight leading-none">
            {el.symbol}
          </span>
          {colorMode === 'radius_heatmap' && el.atomicRadius && (
            <span
              aria-hidden="true"
              className={`inline-block rounded-full border ${
                isDarkCell
                  ? 'bg-white/35 border-white/75'
                  : 'bg-indigo-600/25 border-indigo-600/60'
              }`}
              style={{
                width: `${Math.max(4, Math.min(16, Math.round(el.atomicRadius / 17)))}px`,
                height: `${Math.max(4, Math.min(16, Math.round(el.atomicRadius / 17)))}px`,
              }}
            />
          )}
        </div>

        {/* Bottom: Element Name & Electron Config */}
        <div className="w-full overflow-hidden">
          <div
            className={`text-[9px] font-semibold truncate leading-tight ${
              isDarkCell ? 'text-indigo-50' : 'text-slate-800'
            }`}
          >
            {el.vietnameseName}
          </div>
          <div
            className={`font-mono text-[8px] truncate leading-tight mt-0.5 ${
              isDarkCell ? 'text-indigo-200' : 'text-slate-600'
            }`}
          >
            {el.electronConfig}
          </div>
        </div>
      </button>
    );
  };

  return (
    <div className="space-y-6">
      {/* Selected Element Interactive Spotlight Stage (Animated with motion/react) */}
      <AnimatePresence mode="wait">
        <motion.div
          key={selectedElement.atomicNumber}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.18 }}
          className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 shadow-xs"
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            {/* Left 7 Cols: Exact Position Breakdown (Ô, Chu kì, Nhóm A/B) */}
            <div className="lg:col-span-7 flex flex-col justify-between space-y-5">
              <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-100 pb-4">
                <div className="flex items-center gap-4">
                  {/* Vivid Element Tile Badge */}
                  <div
                    className={`w-20 h-20 rounded-2xl border-2 flex flex-col items-center justify-center shrink-0 shadow-xs ${
                      selectedElement.category === 'metal'
                        ? 'bg-gradient-to-br from-sky-100 to-blue-200/80 border-sky-400 text-slate-950'
                        : selectedElement.category === 'nonmetal'
                        ? 'bg-gradient-to-br from-amber-100 to-orange-200/80 border-amber-400 text-slate-950'
                        : 'bg-gradient-to-br from-emerald-100 to-teal-200/80 border-emerald-400 text-slate-950'
                    }`}
                  >
                    <span className="font-mono text-xs font-bold text-slate-700 leading-none">
                      Z = {selectedElement.atomicNumber}
                    </span>
                    <span className="font-display text-3xl font-extrabold tracking-tight mt-0.5">
                      {selectedElement.symbol}
                    </span>
                    <span className="text-[10px] font-semibold text-slate-700 leading-none mt-0.5">
                      {selectedElement.atomicMass}
                    </span>
                  </div>

                  <div>
                    <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-slate-600">
                      <span
                        className={`font-bold ${
                          selectedElement.category === 'metal'
                            ? 'text-sky-700'
                            : selectedElement.category === 'nonmetal'
                            ? 'text-amber-700'
                            : 'text-emerald-700'
                        }`}
                      >
                        {categoryLabel(selectedElement.category)}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span>{selectedElement.subCategory}</span>
                      <span aria-hidden="true">·</span>
                      <span>Nguyên tố họ {selectedElement.block}</span>
                    </div>
                    <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-slate-900 mt-0.5">
                      {selectedElement.name}{' '}
                      <span className="text-slate-500 font-semibold">
                        ({selectedElement.vietnameseName})
                      </span>
                    </h2>
                    <p className="text-xs text-slate-600 mt-1 font-mono">
                      Cấu hình electron:{' '}
                      <strong className="text-slate-950">{selectedElement.fullElectronConfig}</strong>{' '}
                      {selectedElement.electronConfig !== selectedElement.fullElectronConfig && (
                        <span className="text-sky-700 font-semibold">
                          (Rút gọn: {selectedElement.electronConfig})
                        </span>
                      )}
                    </p>
                  </div>
                </div>

                {/* Highlight toggle for current period / group & Assign to Dual Comparison */}
                <div className="flex flex-wrap items-center gap-2">
                  <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
                    <button
                      type="button"
                      onClick={() =>
                        setHighlightPeriodOrGroup(
                          highlightPeriodOrGroup === 'period' ? 'none' : 'period'
                        )
                      }
                      className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                        highlightPeriodOrGroup === 'period'
                          ? 'bg-slate-900 text-white shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Soi Chu kì {selectedElement.period}
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setHighlightPeriodOrGroup(
                          highlightPeriodOrGroup === 'group' ? 'none' : 'group'
                        )
                      }
                      className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                        highlightPeriodOrGroup === 'group'
                          ? 'bg-slate-900 text-white shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Soi Nhóm {selectedElement.groupRoman}
                    </button>
                  </div>

                  <div className="flex items-center gap-1 bg-sky-50 border border-sky-200 p-1 rounded-xl">
                    <button
                      type="button"
                      onClick={() => {
                        setCompareElementA(selectedElement);
                        setShowDualCompare(true);
                        const el = document.getElementById('dual-element-comparison');
                        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                      }}
                      className="px-2.5 py-1 text-xs font-bold text-sky-800 hover:bg-sky-100 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                    >
                      So sánh: Đặt {selectedElement.symbol} làm A
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setCompareElementB(selectedElement);
                        setShowDualCompare(true);
                        const el = document.getElementById('dual-element-comparison');
                        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                      }}
                      className="px-2.5 py-1 text-xs font-bold text-indigo-800 hover:bg-indigo-100 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                    >
                      Đặt {selectedElement.symbol} làm B
                    </button>
                  </div>
                </div>
              </div>

              {/* 3 Core Position Pillars required by prompt: Số thứ tự ô, Chu kì, Nhóm (ghi rõ nhóm A hay B) */}
              <div>
                <div className="text-xs font-bold text-slate-700 mb-2.5 flex items-center gap-1.5">
                  <Compass className="w-4 h-4 text-sky-600" />
                  <span>
                    Vị trí chính xác của nguyên tố {selectedElement.symbol} trong Bảng tuần hoàn:
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                  {/* 1. Số thứ tự ô */}
                  <div className="p-4 rounded-xl bg-gradient-to-b from-slate-50 to-slate-100/60 border border-slate-200/90">
                    <div className="text-xs font-medium text-slate-500">1. Số thứ tự ô nguyên tố</div>
                    <div className="font-display text-2xl font-extrabold text-slate-900 mt-1 tabular-nums">
                      Ô số {selectedElement.atomicNumber}
                    </div>
                    <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                      Số hiệu nguyên tử{' '}
                      <span className="font-mono font-bold text-slate-900">
                        Z = {selectedElement.atomicNumber}
                      </span>{' '}
                      ({selectedElement.atomicNumber} proton, {selectedElement.atomicNumber} electron).
                    </p>
                  </div>

                  {/* 2. Chu kì */}
                  <div className="p-4 rounded-xl bg-gradient-to-b from-sky-50/70 to-sky-100/40 border border-sky-200/90">
                    <div className="text-xs font-medium text-sky-800">2. Chu kì (Hàng ngang)</div>
                    <div className="font-display text-2xl font-extrabold text-sky-950 mt-1 tabular-nums">
                      Chu kì {selectedElement.period}
                    </div>
                    <p className="text-xs text-sky-900/80 mt-1.5 leading-relaxed">
                      Nguyên tử có{' '}
                      <strong className="text-sky-950">
                        {selectedElement.shells.length} lớp electron
                      </strong>{' '}
                      ({selectedElement.shells.join(' · ')}).
                    </p>
                  </div>

                  {/* 3. Nhóm (Ghi rõ Nhóm A hay B) */}
                  <div className="p-4 rounded-xl bg-gradient-to-b from-indigo-50/70 to-indigo-100/40 border border-indigo-200/90">
                    <div className="text-xs font-medium text-indigo-800">3. Nhóm (Cột dọc)</div>
                    <div className="font-display text-2xl font-extrabold text-indigo-950 mt-1 tabular-nums">
                      Nhóm {selectedElement.groupRoman}{' '}
                      <span className="text-sm font-bold text-indigo-700">
                        (Nhóm {selectedElement.groupType})
                      </span>
                    </div>
                    <p className="text-xs text-indigo-950/80 mt-1.5 leading-relaxed">
                      Thuộc <strong>Nhóm {selectedElement.groupType}</strong> (Cột {selectedElement.column}) · Họ{' '}
                      <strong>{selectedElement.block}</strong>
                      {selectedElement.fBlockRow
                        ? ` (${selectedElement.fBlockRow === 'lanthanide' ? 'Lanthanide' : 'Actinide'})`
                        : `, có ${selectedElement.valenceElectrons}e lớp ngoài cùng`}
                      .
                    </p>
                  </div>
                </div>
              </div>

              {/* Fun Chemistry Note & Key Metrics */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="text-xs text-slate-700 leading-relaxed flex-1">
                  <strong className="text-slate-900">Đặc điểm & Ứng dụng thú vị: </strong>
                  {getElementFunFact(selectedElement)}
                </div>
                <div className="flex items-center gap-4 shrink-0 border-t sm:border-t-0 sm:border-l border-slate-200 pt-2 sm:pt-0 sm:pl-4 text-xs">
                  <div>
                    <span className="text-slate-500 block">Bán kính nguyên tử</span>
                    <span className="font-mono text-sm font-extrabold text-indigo-700 tabular-nums">
                      {selectedElement.atomicRadius ? `${selectedElement.atomicRadius} pm` : '—'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Độ âm điện</span>
                    <span className="font-mono text-sm font-extrabold text-slate-900 tabular-nums">
                      {selectedElement.electronegativity !== null
                        ? selectedElement.electronegativity.toFixed(2)
                        : 'Khí hiếm'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right 5 Cols: Interactive 3D Canvas Atom Model */}
            <Atom3DCanvas element={selectedElement} />
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Dual Element Side-by-Side Comparison Section */}
      {showDualCompare && (
        <div id="dual-element-comparison">
          <ElementDualComparison
            elementA={compareElementA}
            elementB={compareElementB}
            onChangeElementA={setCompareElementA}
            onChangeElementB={setCompareElementB}
          />
        </div>
      )}

      {/* Quick Spotlight Bar + View Mode + Filter Controls */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 space-y-4 shadow-xs">
        {/* Quick Spotlight Famous Elements */}
        <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs font-semibold text-slate-600 mr-1">
              Chọn nhanh nguyên tố tiêu biểu:
            </span>
            {QUICK_SPOTLIGHT_Z.map((z) => {
              const el = ELEMENT_BY_Z[z];
              const active = selectedElement.atomicNumber === z;
              return (
                <button
                  key={z}
                  type="button"
                  onClick={() => onSelectElement(el)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-mono font-semibold transition-all cursor-pointer ${
                    active
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {el.symbol} ({el.vietnameseName})
                </button>
              );
            })}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => setShowDualCompare(!showDualCompare)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold inline-flex items-center gap-1.5 transition-colors cursor-pointer ${
                showDualCompare
                  ? 'bg-sky-600 text-white shadow-xs'
                  : 'bg-sky-50 text-sky-800 border border-sky-200 hover:bg-sky-100'
              }`}
            >
              <Scale className="w-3.5 h-3.5" />
              <span>
                {showDualCompare
                  ? `Đang mở Bảng so sánh (${compareElementA.symbol} vs ${compareElementB.symbol})`
                  : 'Mở Bảng so sánh 2 nguyên tố'}
              </span>
            </button>

            {onNavigateTab && (
              <button
                type="button"
                onClick={() => onNavigateTab('radius')}
                className="text-xs font-semibold text-indigo-700 hover:text-indigo-900 inline-flex items-center gap-1 cursor-pointer"
              >
                <span>Xem bài học Quy luật Bán kính nguyên tử</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Mode Switcher */}
          <div className="space-y-1.5">
            <span className="text-xs font-semibold text-slate-600 block">
              Chế độ màu sắc trên Bảng tuần hoàn
            </span>
            <div className="inline-flex flex-wrap items-center gap-1 p-1 bg-slate-100 rounded-xl">
              <button
                type="button"
                onClick={() => setColorMode('category')}
                className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  colorMode === 'category'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Phân biệt: Kim loại · Phi kim · Khí hiếm
              </button>
              <button
                type="button"
                onClick={() => setColorMode('radius_heatmap')}
                className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  colorMode === 'radius_heatmap'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Bản đồ nhiệt Bán kính nguyên tử (Đậm – Nhạt & Mũi tên)
              </button>
            </div>
          </div>

          {/* Filter by classification */}
          <div className="space-y-1.5">
            <span className="text-xs font-semibold text-slate-600 block">
              Lọc nhanh theo phân loại
            </span>
            <div className="flex flex-wrap items-center gap-1 p-1 bg-slate-100 rounded-xl">
              {(
                [
                  { id: 'all', label: 'Tất cả (118)' },
                  { id: 'metal', label: 'Kim loại (92)' },
                  { id: 'nonmetal', label: 'Phi kim (19)' },
                  { id: 'noble_gas', label: 'Khí hiếm (7)' },
                  { id: 'groupA', label: 'Nhóm A (s, p)' },
                  { id: 'groupB', label: 'Nhóm B (d, f)' },
                ] as { id: FilterMode; label: string }[]
              ).map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setFilterMode(tab.id)}
                  className={`px-3 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    filterMode === tab.id
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Search box */}
          <div className="space-y-1.5 min-w-[230px]">
            <label htmlFor="element-search" className="text-xs font-semibold text-slate-600 block">
              Tìm kiếm nguyên tố (Z, kí hiệu, tên)
            </label>
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                id="element-search"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="VD: 26, Fe, Sắt, Natri, Au..."
                className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-900 focus:bg-white transition-colors"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[11px] font-semibold text-slate-500 hover:text-slate-800 cursor-pointer"
                >
                  Xóa
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Color Legend */}
        <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4 text-xs">
          {colorMode === 'category' ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 w-full">
              <button
                type="button"
                onClick={() => setFilterMode(filterMode === 'metal' ? 'all' : 'metal')}
                className={`flex items-center gap-3 p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                  filterMode === 'metal'
                    ? 'bg-sky-100 border-sky-400 ring-1 ring-sky-400'
                    : 'bg-sky-50/70 border-sky-200 hover:bg-sky-100/60'
                }`}
              >
                <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-sky-400 to-blue-600 text-white flex items-center justify-center shrink-0">
                  <Zap className="w-4 h-4" />
                </span>
                <div>
                  <div className="font-bold text-slate-900">Kim loại (92 nguyên tố)</div>
                  <div className="text-[11px] text-slate-600">
                    Thường có 1, 2, 3e lớp ngoài cùng (Nhóm IA, IIA, IIIA trừ B, nhóm B & họ Lanthanide/Actinide)
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setFilterMode(filterMode === 'nonmetal' ? 'all' : 'nonmetal')}
                className={`flex items-center gap-3 p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                  filterMode === 'nonmetal'
                    ? 'bg-amber-100 border-amber-400 ring-1 ring-amber-400'
                    : 'bg-amber-50/70 border-amber-200 hover:bg-amber-100/60'
                }`}
              >
                <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 text-white flex items-center justify-center shrink-0">
                  <Flame className="w-4 h-4" />
                </span>
                <div>
                  <div className="font-bold text-slate-900">Phi kim (19 nguyên tố)</div>
                  <div className="text-[11px] text-slate-600">
                    Thường có 5, 6, 7e lớp ngoài cùng (Nhóm VA, VIA, VIIA + H, B, C, Si)
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setFilterMode(filterMode === 'noble_gas' ? 'all' : 'noble_gas')}
                className={`flex items-center gap-3 p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                  filterMode === 'noble_gas'
                    ? 'bg-emerald-100 border-emerald-400 ring-1 ring-emerald-400'
                    : 'bg-emerald-50/70 border-emerald-200 hover:bg-emerald-100/60'
                }`}
              >
                <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-400 to-teal-600 text-white flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-4 h-4" />
                </span>
                <div>
                  <div className="font-bold text-slate-900">Khí hiếm (7 nguyên tố)</div>
                  <div className="text-[11px] text-slate-600">
                    Nhóm VIIIA (Cột 18): Có 8e lớp ngoài cùng bền vững (riêng He có 2e)
                  </div>
                </div>
              </button>
            </div>
          ) : (
            <div className="flex flex-wrap items-center justify-between w-full gap-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-bold text-indigo-950">
                  Thang màu Bán kính nguyên tử (pm):
                </span>
                <span className="px-2.5 py-1 rounded-md bg-indigo-50 border border-indigo-200 text-slate-800 font-mono text-[11px]">
                  &lt; 95 pm (Nhỏ)
                </span>
                <span className="px-2.5 py-1 rounded-md bg-indigo-100 border border-indigo-200 text-slate-900 font-mono text-[11px]">
                  95–124 pm
                </span>
                <span className="px-2.5 py-1 rounded-md bg-indigo-300 border border-indigo-400 text-slate-950 font-mono text-[11px]">
                  125–149 pm
                </span>
                <span className="px-2.5 py-1 rounded-md bg-indigo-600 text-white font-mono text-[11px]">
                  150–179 pm
                </span>
                <span className="px-2.5 py-1 rounded-md bg-indigo-800 text-white font-mono text-[11px]">
                  180–219 pm
                </span>
                <span className="px-2.5 py-1 rounded-md bg-indigo-950 text-white font-mono text-[11px]">
                  ≥ 220 pm (Rất lớn)
                </span>
              </div>
              <div className="text-slate-600 font-medium">
                Ô màu càng đậm & vòng tròn càng to → Bán kính nguyên tử càng lớn
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Periodic Table 18-Column Grid + Trend Arrows */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-6 overflow-x-auto shadow-xs">
        {colorMode === 'radius_heatmap' && (
          <div className="mb-4 p-3.5 rounded-xl bg-indigo-50 border border-indigo-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-indigo-950">
            <div className="flex items-center gap-2 font-bold">
              <ArrowRight className="w-4 h-4 text-indigo-700 shrink-0" />
              <span>
                Trong 1 Chu kì (Trái → Phải): Điện tích hạt nhân Z tăng → Bán kính nguyên tử GIẢM DẦN (Màu nhạt dần)
              </span>
            </div>
            <div className="flex items-center gap-2 font-bold">
              <ArrowDown className="w-4 h-4 text-indigo-700 shrink-0" />
              <span>
                Trong 1 Nhóm A (Trên → Dưới): Số lớp electron tăng → Bán kính nguyên tử TĂNG DẦN (Màu đậm dần)
              </span>
            </div>
          </div>
        )}

        <div className="min-w-[1140px]">
          {/* Live Hover Status Strip above the table */}
          <div className="flex items-center justify-between px-3 py-2 mb-2.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs">
            {hoveredElement ? (
              <div className="flex flex-wrap items-center gap-2 text-slate-800">
                <span className="font-semibold text-sky-700">Đang di chuột qua:</span>
                <strong className="font-display text-sm text-slate-950">
                  Ô {hoveredElement.atomicNumber} · {hoveredElement.symbol} ({hoveredElement.name} / {hoveredElement.vietnameseName})
                </strong>
                <span aria-hidden="true">·</span>
                <span>
                  Chu kì <strong>{hoveredElement.period}</strong>
                </span>
                <span aria-hidden="true">·</span>
                <span>
                  Nhóm <strong>{hoveredElement.groupRoman} (Nhóm {hoveredElement.groupType})</strong>
                </span>
                <span aria-hidden="true">·</span>
                <span className="font-mono text-slate-600">
                  Cấu hình: {hoveredElement.electronConfig}
                </span>
                {hoveredElement.atomicRadius && (
                  <>
                    <span aria-hidden="true">·</span>
                    <span className="font-mono font-bold text-indigo-700">
                      Bán kính: {hoveredElement.atomicRadius} pm
                    </span>
                  </>
                )}
              </div>
            ) : (
              <div className="text-slate-500">
                Di chuột qua bất kì ô nguyên tố nào để xem nhanh thông số và bấm vào ô để quan sát mô hình nguyên tử 3D hiện đại (đám mây electron) phía trên.
              </div>
            )}
            <span className="font-mono text-[11px] text-slate-400 shrink-0 ml-2">
              Đang chọn: {selectedElement.symbol} (Z={selectedElement.atomicNumber})
            </span>
          </div>

          {/* Top Column Headers (1..18 and Group IA..VIIIA / B) */}
          <div
            className="grid gap-1.5 mb-1.5"
            style={{ gridTemplateColumns: '52px repeat(18, minmax(55px, 1fr))' }}
          >
            <div className="flex flex-col items-center justify-center p-1 rounded-lg bg-slate-100 text-[9px] font-bold text-slate-600 text-center">
              <span>Nhóm →</span>
              <span>Chu kì ↓</span>
            </div>
            {Array.from({ length: 18 }, (_, i) => i + 1).map((col) => {
              const grp = COLUMN_TO_GROUP[col];
              const isSelectedCol = selectedElement.column === col && !selectedElement.fBlockRow;
              const isHoveredCol = hoveredElement?.column === col && !hoveredElement?.fBlockRow;
              return (
                <div
                  key={col}
                  className={`flex flex-col items-center justify-center py-1.5 px-0.5 rounded-lg border text-center transition-all duration-150 ${
                    isSelectedCol
                      ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                      : isHoveredCol
                      ? 'bg-sky-600 text-white border-sky-600 scale-105 shadow-xs'
                      : grp.type === 'A'
                      ? 'bg-slate-100/80 border-slate-200 text-slate-900'
                      : 'bg-slate-50 border-slate-200/70 text-slate-600'
                  }`}
                >
                  <span className="font-mono text-[10px] font-bold leading-tight">
                    Cột {col}
                  </span>
                  <span
                    className={`text-[10px] font-extrabold leading-tight mt-0.5 ${
                      isSelectedCol || isHoveredCol
                        ? 'text-sky-200'
                        : grp.type === 'A'
                        ? 'text-sky-700'
                        : 'text-indigo-600'
                    }`}
                  >
                    {grp.roman}
                  </span>
                </div>
              );
            })}
          </div>

          {/* 7 Periods Rows */}
          <div className="space-y-1.5">
            {Array.from({ length: 7 }, (_, i) => i + 1).map((period) => {
              const isSelectedPeriod = selectedElement.period === period;
              const isHoveredPeriod = hoveredElement?.period === period;
              return (
                <div
                  key={period}
                  className="grid gap-1.5"
                  style={{ gridTemplateColumns: '52px repeat(18, minmax(55px, 1fr))' }}
                >
                  {/* Period Header Cell */}
                  <div
                    className={`flex flex-col items-center justify-center rounded-lg border text-center transition-all duration-150 ${
                      isSelectedPeriod
                        ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                        : isHoveredPeriod
                        ? 'bg-sky-600 text-white border-sky-600 scale-105 shadow-xs'
                        : 'bg-slate-100/70 border-slate-200 text-slate-700'
                    }`}
                  >
                    <span className="text-[9px] font-semibold opacity-75">Chu kì</span>
                    <span className="font-display text-base font-extrabold leading-none mt-0.5">
                      {period}
                    </span>
                    <span className="font-mono text-[8px] opacity-80 mt-0.5">
                      {period} lớp e
                    </span>
                  </div>

                  {/* 18 Columns in this Period */}
                  {Array.from({ length: 18 }, (_, i) => i + 1).map((col) => {
                    if (period === 6 && col === 3) {
                      const isLanthanideSelected = selectedElement.fBlockRow === 'lanthanide';
                      return (
                        <button
                          key="lanthanide-marker"
                          type="button"
                          onClick={() => onSelectElement(ELEMENT_BY_Z[57])}
                          className={`flex flex-col items-center justify-center p-1 rounded-lg border text-center transition-all duration-200 ease-out hover:scale-[1.1] hover:-translate-y-1 hover:shadow-lg hover:z-30 min-h-[64px] cursor-pointer ${
                            isLanthanideSelected
                              ? 'bg-sky-900 text-white border-sky-950 ring-2 ring-slate-900'
                              : 'bg-sky-100/90 border-sky-300 text-sky-950 hover:bg-sky-200'
                          }`}
                        >
                          <span className="font-mono text-[9px] font-bold">57–71</span>
                          <span className="font-display text-xs font-extrabold mt-0.5">La–Lu</span>
                          <span className="text-[8px] font-semibold leading-tight mt-0.5">
                            Lanthanide ↓
                          </span>
                        </button>
                      );
                    }

                    if (period === 7 && col === 3) {
                      const isActinideSelected = selectedElement.fBlockRow === 'actinide';
                      return (
                        <button
                          key="actinide-marker"
                          type="button"
                          onClick={() => onSelectElement(ELEMENT_BY_Z[89])}
                          className={`flex flex-col items-center justify-center p-1 rounded-lg border text-center transition-all duration-200 ease-out hover:scale-[1.1] hover:-translate-y-1 hover:shadow-lg hover:z-30 min-h-[64px] cursor-pointer ${
                            isActinideSelected
                              ? 'bg-sky-900 text-white border-sky-950 ring-2 ring-slate-900'
                              : 'bg-sky-100/90 border-sky-300 text-sky-950 hover:bg-sky-200'
                          }`}
                        >
                          <span className="font-mono text-[9px] font-bold">89–103</span>
                          <span className="font-display text-xs font-extrabold mt-0.5">Ac–Lr</span>
                          <span className="text-[8px] font-semibold leading-tight mt-0.5">
                            Actinide ↓
                          </span>
                        </button>
                      );
                    }

                    const el = mainGridMap.get(`${period}-${col}`);
                    if (!el) {
                      return <div key={`empty-${period}-${col}`} className="min-h-[64px]" />;
                    }

                    return renderElementCell(el);
                  })}
                </div>
              );
            })}
          </div>

          {/* Separated 2 Bottom Rows: Lanthanide (57..71) & Actinide (89..103) */}
          <div className="mt-6 pt-5 border-t-2 border-dashed border-slate-200 space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-600 mb-1">
              <span className="font-bold text-slate-800">
                Hai hàng tách riêng bên dưới: Họ Lanthanide (Chu kì 6, Nhóm IIIB) và Họ Actinide (Chu kì 7, Nhóm IIIB)
              </span>
              <span className="text-slate-500 font-medium">
                Bấm vào bất kì nguyên tố nào để xem cấu hình electron họ 4f / 5f
              </span>
            </div>

            {/* Row 1: Lanthanides (57..71) */}
            <div
              className="grid gap-1.5"
              style={{ gridTemplateColumns: '52px repeat(18, minmax(55px, 1fr))' }}
            >
              <div className="col-span-3 flex items-center justify-between px-3.5 py-2 rounded-lg bg-gradient-to-r from-sky-100 to-blue-50 border border-sky-300 text-sky-950">
                <div>
                  <div className="font-display text-xs font-extrabold">Họ Lanthanide</div>
                  <div className="text-[10px] font-medium text-sky-800">
                    Chu kì 6 · Nhóm IIIB (57 → 71)
                  </div>
                </div>
                <span className="font-mono text-xs font-bold">4f</span>
              </div>
              {lanthanides.map((el) => renderElementCell(el))}
              <div className="col-span-1" />
            </div>

            {/* Row 2: Actinides (89..103) */}
            <div
              className="grid gap-1.5"
              style={{ gridTemplateColumns: '52px repeat(18, minmax(55px, 1fr))' }}
            >
              <div className="col-span-3 flex items-center justify-between px-3.5 py-2 rounded-lg bg-gradient-to-r from-sky-100 to-blue-50 border border-sky-300 text-sky-950">
                <div>
                  <div className="font-display text-xs font-extrabold">Họ Actinide</div>
                  <div className="text-[10px] font-medium text-sky-800">
                    Chu kì 7 · Nhóm IIIB (89 → 103)
                  </div>
                </div>
                <span className="font-mono text-xs font-bold">5f</span>
              </div>
              {actinides.map((el) => renderElementCell(el))}
              <div className="col-span-1" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
