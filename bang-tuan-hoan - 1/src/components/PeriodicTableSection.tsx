import React, { useState, useMemo, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  ELEMENTS,
  ELEMENT_BY_Z,
  COLUMN_TO_GROUP,
  ChemicalElement,
  ElementCategory,
  ElementBlock,
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
  Sparkles,
  Layers,
  X,
  Smartphone,
  BookOpen,
} from 'lucide-react';
import { ElementDualComparison } from './ElementDualComparison';
import { Atom3DCanvas } from './Atom3DCanvas';
import {
  FlameAndSpectrumLab,
  getElementSpectrumProfile,
} from './FlameAndSpectrumLab';

interface PeriodicTableSectionProps {
  selectedElement: ChemicalElement | null;
  onSelectElement: (el: ChemicalElement | null) => void;
  onNavigateTab?: (tab: 'table' | 'radius' | 'quiz') => void;
  initialColorMode?: 'category' | 'block_spdf' | 'radius_heatmap';
  isDarkMode?: boolean;
}

type TableColorMode = 'category' | 'block_spdf' | 'radius_heatmap';
type FilterMode = 'all' | 'metal' | 'nonmetal' | 'noble_gas' | 'groupA' | 'groupB';

const QUICK_SPOTLIGHT_Z = [1, 6, 8, 9, 11, 13, 17, 19, 26, 29, 55, 79];
const STAIRCASE_UPPER_Z = new Set([5, 14, 33, 52, 85]);

function getElementFunFact(el: ChemicalElement): string {
  const facts: Record<number, string> = {
    1: 'Nguyên tố phổ biến nhất trong vũ trụ, chiếm khoảng 75% khối lượng vật chất.',
    2: 'Khí hiếm nhẹ nhất, có bán kính nguyên tử nhỏ nhất (31 pm), dùng bơm bóng bay an toàn.',
    3: 'Kim loại nhẹ nhất trong tất cả kim loại, là thành phần chính trong pin Lithium-ion hiện đại.',
    6: 'Nền tảng của sự sống hữu cơ, từ than chì đến kim cương cứng nhất tự nhiên.',
    7: 'Chiếm khoảng 78% thể tích khí quyển Trái Đất, thiết yếu cho protein và axit nucleic.',
    8: 'Duy trì sự cháy và hô hấp; chiếm khoảng 21% khí quyển và gần 50% khối lượng vỏ Trái Đất.',
    9: 'Phi kim mạnh nhất và có độ âm điện lớn nhất (3.98) trong bảng tuần hoàn.',
    10: 'Phát ánh sáng đỏ cam rực rỡ khi có dòng điện phóng qua trong đèn quảng cáo Neon.',
    11: 'Kim loại kiềm mềm có thể cắt bằng dao, phản ứng mãnh liệt với nước tạo khí H₂.',
    12: 'Cháy với ngọn lửa trắng chói lòa, là nguyên tố trung tâm trong phân tử diệp lục của cây xanh.',
    13: 'Kim loại phổ biến nhất trong vỏ Trái Đất, nhẹ, bền và chống ăn mòn tốt.',
    14: 'Vật liệu bán dẫn cốt lõi chế tạo chip máy tính, vi xử lý và pin mặt trời.',
    17: 'Phi kim nhóm Halogen có tính oxi hóa mạnh, dùng khử trùng nước sinh hoạt và sản xuất nhựa PVC.',
    19: 'Kim loại kiềm hoạt động rất mạnh, đóng vai trò thiết yếu truyền xung thần kinh trong cơ thể.',
    20: 'Thành phần chính của xương, răng của động vật và đá vôi, thạch cao trong tự nhiên.',
    26: 'Kim loại quan trọng nhất trong luyện kim (thép) và vận chuyển oxy trong máu (Hemoglobin).',
    29: 'Kim loại dẫn điện, dẫn nhiệt cực tốt, sử dụng rộng rãi trong dây điện và vi mạch.',
    47: 'Kim loại dẫn điện và dẫn nhiệt tốt nhất trong tất cả các kim loại.',
    55: 'Kim loại kiềm có bán kính nguyên tử rất lớn (265 pm), dùng trong đồng hồ nguyên tử siêu chính xác.',
    79: 'Kim loại quý không bị oxi hóa trong không khí và có độ dẻo cao nhất.',
    80: 'Kim loại duy nhất ở thể lỏng ở điều kiện nhiệt độ phòng chuẩn.',
  };
  if (facts[el.atomicNumber]) return facts[el.atomicNumber];
  if (el.category === 'noble_gas') {
    return `Nguyên tố khí hiếm thuộc nhóm VIIIA, có lớp electron ngoài cùng bão hòa rất bền vững.`;
  }
  if (el.fBlockRow === 'lanthanide') {
    return `Nguyên tố đất hiếm thuộc họ Lanthanide (Chu kì 6, Nhóm IIIB), ứng dụng trong nam châm vĩnh cửu và laser.`;
  }
  if (el.fBlockRow === 'actinide') {
    return `Nguyên tố phóng xạ thuộc họ Actinide (Chu kì 7, Nhóm IIIB), có nhiều ứng dụng trong năng lượng hạt nhân.`;
  }
  if (el.category === 'metal') {
    return `Nguyên tố kim loại thuộc Chu kì ${el.period}, Nhóm ${el.groupRoman} (${el.groupType}), dễ nhường electron hóa trị.`;
  }
  return `Nguyên tố phi kim thuộc Chu kì ${el.period}, Nhóm ${el.groupRoman} (${el.groupType}), có xu hướng nhận electron khi liên kết.`;
}

export const PeriodicTableSection: React.FC<PeriodicTableSectionProps> = ({
  selectedElement,
  onSelectElement,
  onNavigateTab,
  initialColorMode = 'category',
  isDarkMode = false,
}) => {
  const [colorMode, setColorMode] = useState<TableColorMode>(initialColorMode);
  const [filterMode, setFilterMode] = useState<FilterMode>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [hoveredElement, setHoveredElement] = useState<ChemicalElement | null>(null);
  const [showDualCompare, setShowDualCompare] = useState<boolean>(true);
  const [compareElementA, setCompareElementA] = useState<ChemicalElement>(ELEMENT_BY_Z[11]);
  const [compareElementB, setCompareElementB] = useState<ChemicalElement>(ELEMENT_BY_Z[17]);
  const [isCompactMobileTable, setIsCompactMobileTable] = useState<boolean>(false);

  useEffect(() => {
    setColorMode(initialColorMode);
  }, [initialColorMode]);

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

  useEffect(() => {
    if (selectedElement) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [selectedElement]);

  const handleElementClick = (el: ChemicalElement) => {
    onSelectElement(el);
  };

  const isElementMatched = (el: ChemicalElement): boolean => {
    // Khi bấm lọc Kim loại, Phi kim hoặc các nhóm khác, họ Lanthanide và Actinide (khối f) là nhóm riêng biệt nên sẽ tắt đi, chỉ bật sáng khi bấm "Tất cả"
    if (filterMode !== 'all' && el.fBlockRow) {
      if (searchQuery.trim() !== '') {
        const q = searchQuery.trim().toLowerCase();
        const matchZ = el.atomicNumber.toString() === q;
        const matchSym = el.symbol.toLowerCase().includes(q);
        const matchName = el.name.toLowerCase().includes(q);
        const matchVi = el.vietnameseName.toLowerCase().includes(q);
        return matchZ || matchSym || matchName || matchVi;
      }
      return false;
    }
    if (filterMode === 'metal' && el.category !== 'metal') return false;
    if (filterMode === 'nonmetal' && el.category !== 'nonmetal') return false;
    if (filterMode === 'noble_gas' && el.category !== 'noble_gas') return false;
    if (filterMode === 'groupA' && el.groupType !== 'A') return false;
    if (filterMode === 'groupB' && (el.groupType !== 'B' || el.fBlockRow)) return false;
    if (searchQuery.trim() !== '') {
      const q = searchQuery.trim().toLowerCase();
      const matchZ = el.atomicNumber.toString() === q;
      const matchSym = el.symbol.toLowerCase().includes(q);
      const matchName = el.name.toLowerCase().includes(q);
      const matchVi = el.vietnameseName.toLowerCase().includes(q);
      if (!matchZ && !matchSym && !matchName && !matchVi) return false;
    }
    return true;
  };

  const getCellStyle = (el: ChemicalElement, isSelected: boolean, isMatched: boolean) => {
    const dimmed = !isMatched ? 'opacity-20 saturate-0 scale-95' : 'opacity-100';
    const isCrosshairLine =
      hoveredElement &&
      hoveredElement.atomicNumber !== el.atomicNumber &&
      (hoveredElement.period === el.period ||
        (!hoveredElement.fBlockRow && !el.fBlockRow && hoveredElement.column === el.column));

    const crosshairBoost = isCrosshairLine
      ? isDarkMode
        ? 'ring-1 ring-sky-400/50 brightness-125'
        : 'ring-1 ring-slate-900/25 brightness-[1.03]'
      : '';

    const selectedRing = isSelected
      ? isDarkMode
        ? 'ring-2 ring-white selected-element-pulse z-20 scale-[1.09] -translate-y-0.5'
        : 'ring-2 ring-slate-950 selected-element-pulse z-20 scale-[1.09] -translate-y-0.5'
      : 'hover:scale-[1.12] sm:hover:scale-[1.16] hover:-translate-y-1 hover:shadow-xl hover:z-30 active:scale-[1.03]';

    const staircaseBorder =
      colorMode === 'category' && STAIRCASE_UPPER_Z.has(el.atomicNumber)
        ? isDarkMode
          ? 'border-l-[3px] border-b-[3px] border-l-rose-400 border-b-rose-400'
          : 'border-l-[3px] border-b-[3px] border-l-rose-600 border-b-rose-600'
        : '';

    if (colorMode === 'category') {
      if (isDarkMode) {
        const darkCatStyles: Record<ElementCategory, string> = {
          metal: 'bg-gradient-to-br from-sky-950/95 via-sky-900/80 to-blue-950/90 border-sky-500/75 text-sky-50',
          nonmetal: 'bg-gradient-to-br from-rose-950/95 via-pink-900/80 to-rose-950/90 border-pink-500/75 text-pink-50',
          noble_gas: 'bg-gradient-to-br from-amber-950/95 via-amber-900/80 to-yellow-950/90 border-amber-500/80 text-amber-50',
        };
        return `${darkCatStyles[el.category]} ${staircaseBorder} ${crosshairBoost} ${selectedRing} ${dimmed}`;
      }
      const catStyles: Record<ElementCategory, string> = {
        metal: 'bg-gradient-to-br from-[#dff2fe] via-[#bae6fd] to-[#93c5fd]/85 border-sky-400 text-slate-950',
        nonmetal: 'bg-gradient-to-br from-[#fce7f3] via-[#fbcfe8] to-[#f9a8d4]/85 border-pink-400 text-slate-950',
        noble_gas: 'bg-gradient-to-br from-[#fef3c7] via-[#fde68a] to-[#fcd34d]/90 border-amber-400 text-slate-950',
      };
      return `${catStyles[el.category]} ${staircaseBorder} ${crosshairBoost} ${selectedRing} ${dimmed}`;
    }

    if (colorMode === 'block_spdf') {
      const blockStyles: Record<ElementBlock, string> = {
        s: 'bg-gradient-to-br from-sky-100 via-sky-200/90 to-cyan-200 border-sky-400 text-slate-950',
        p: 'bg-gradient-to-br from-amber-100 via-yellow-200/90 to-orange-200/80 border-amber-400 text-slate-950',
        d: 'bg-gradient-to-br from-rose-100 via-pink-200/85 to-fuchsia-200/80 border-rose-400 text-slate-950',
        f: 'bg-gradient-to-br from-emerald-100 via-teal-200/90 to-green-200/85 border-emerald-400 text-slate-950',
      };
      return `${blockStyles[el.block]} ${crosshairBoost} ${selectedRing} ${dimmed}`;
    }

    // Radius heatmap mode
    const r = el.atomicRadius;
    if (!r) return `bg-slate-100 border-slate-200 text-slate-700 ${selectedRing} ${dimmed}`;
    if (r >= 220) return `bg-indigo-950 border-indigo-950 text-white font-bold ${selectedRing} ${dimmed}`;
    if (r >= 180) return `bg-indigo-800 border-indigo-800 text-white ${selectedRing} ${dimmed}`;
    if (r >= 150) return `bg-indigo-600 border-indigo-600 text-white ${selectedRing} ${dimmed}`;
    if (r >= 125) return `bg-indigo-300 border-indigo-400 text-slate-950 ${selectedRing} ${dimmed}`;
    if (r >= 95) return `bg-indigo-100 border-indigo-200 text-slate-900 ${selectedRing} ${dimmed}`;
    return `bg-indigo-50 border-indigo-200 text-slate-800 ${selectedRing} ${dimmed}`;
  };

  const categoryLabel = (cat: ElementCategory) => {
    if (cat === 'metal') return 'Kim loại';
    if (cat === 'nonmetal') return 'Phi kim';
    return 'Khí hiếm';
  };

  const renderElementCell = (el: ChemicalElement) => {
    const isSelected = selectedElement?.atomicNumber === el.atomicNumber;
    const isMatched = isElementMatched(el);
    const isDarkCell =
      isDarkMode || (colorMode === 'radius_heatmap' && (el.atomicRadius ?? 0) >= 150);

    const symbolColorClass =
      colorMode === 'radius_heatmap' && (el.atomicRadius ?? 0) >= 150
        ? 'text-white'
        : colorMode === 'category'
        ? el.category === 'metal'
          ? 'text-[#075985]'
          : el.category === 'nonmetal'
          ? 'text-[#9d174d]'
          : 'text-[#92400e]'
        : 'text-slate-950';

    return (
      <button
        key={el.atomicNumber}
        type="button"
        onClick={() => handleElementClick(el)}
        onMouseEnter={() => setHoveredElement(el)}
        onMouseLeave={() => setHoveredElement(null)}
        title={`Ô ${el.atomicNumber}: ${el.name} (${el.vietnameseName}) - Chu kì ${el.period}, Nhóm ${el.groupRoman}`}
        className={`element-tile-shimmer group relative flex flex-col justify-between p-1 sm:p-1.5 rounded-lg border text-left transition-all duration-200 ease-out will-change-transform select-none cursor-pointer ${
          isCompactMobileTable ? 'min-h-[46px] sm:min-h-[66px]' : 'min-h-[56px] sm:min-h-[66px]'
        } ${getCellStyle(el, isSelected, isMatched)}`}
      >
        {isSelected && (
          <span
            aria-hidden="true"
            className="w-2 h-2 rounded-full bg-sky-400 ring-2 ring-white absolute top-1 right-1"
          />
        )}
        <div className="flex items-center justify-between w-full leading-none">
          <span
            className={`font-mono text-[9px] sm:text-[10px] font-extrabold tabular-nums ${
              isDarkCell ? 'text-white' : 'text-slate-900'
            }`}
          >
            {el.atomicNumber}
          </span>
          {colorMode === 'radius_heatmap' ? (
            <span
              className={`font-mono text-[8px] sm:text-[9px] font-bold tabular-nums ${
                isDarkCell ? 'text-indigo-100' : 'text-indigo-900'
              }`}
            >
              {el.atomicRadius ? `${el.atomicRadius}` : '—'}
            </span>
          ) : colorMode === 'block_spdf' ? (
            <span className="text-[8px] font-mono font-extrabold px-1 rounded bg-white/90 text-slate-950">
              {el.block}
            </span>
          ) : (
            <span
              className={`text-[7px] sm:text-[8px] font-mono font-extrabold uppercase tracking-tighter ${
                el.category === 'metal'
                  ? 'text-sky-950'
                  : el.category === 'nonmetal'
                  ? 'text-rose-950'
                  : 'text-amber-950'
              }`}
            >
              {el.groupRoman}
            </span>
          )}
        </div>

        <div className="flex items-baseline justify-between my-0.5">
          <span
            className={`font-display text-xs sm:text-base font-extrabold tracking-tight leading-none transition-transform duration-200 group-hover:scale-105 ${symbolColorClass}`}
          >
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

        <div className="w-full overflow-hidden">
          <div
            className={`text-[8px] sm:text-[9px] font-bold truncate leading-tight ${
              isDarkCell ? 'text-white' : 'text-slate-950'
            }`}
          >
            {el.name}
          </div>
          {!isCompactMobileTable && (
            <div
              className={`hidden sm:block font-mono text-[8px] font-medium truncate leading-tight mt-0.5 ${
                isDarkCell ? 'text-slate-200' : 'text-slate-800'
              }`}
            >
              {el.electronConfig}
            </div>
          )}
        </div>
      </button>
    );
  };

  const gridTemplateStyle = isCompactMobileTable
    ? { gridTemplateColumns: '36px repeat(18, minmax(33px, 1fr))' }
    : { gridTemplateColumns: '46px repeat(18, minmax(52px, 1fr))' };
  const gridMinWidthClass = isCompactMobileTable
    ? 'min-w-[660px] lg:min-w-[1140px]'
    : 'min-w-[980px] lg:min-w-[1140px]';

  return (
    <div className="space-y-5 sm:space-y-6">
      <div className="bg-white border border-slate-200 rounded-2xl sm:rounded-3xl p-3.5 sm:p-5 space-y-4 shadow-xs">
        <div className="flex flex-col gap-2.5 pb-3 border-b border-slate-100">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-xs font-bold text-slate-700 mr-1 inline-flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                <span>Chọn nhanh nguyên tố tiêu biểu:</span>
              </span>
              {QUICK_SPOTLIGHT_Z.map((z) => {
                const el = ELEMENT_BY_Z[z];
                const active = selectedElement?.atomicNumber === z;
                return (
                  <button
                    key={z}
                    type="button"
                    onClick={() => handleElementClick(el)}
                    className={`px-2 sm:px-2.5 py-1 rounded-lg text-[11px] sm:text-xs font-mono font-bold transition-all cursor-pointer ${
                      active
                        ? 'bg-slate-900 text-white shadow-xs scale-105'
                        : el.category === 'metal'
                        ? 'bg-sky-100/80 text-sky-900 hover:bg-sky-200'
                        : 'bg-pink-100/80 text-rose-900 hover:bg-pink-200'
                    }`}
                  >
                    {el.symbol} ({el.name})
                  </button>
                );
              })}
            </div>

            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              {onNavigateTab && (
                <button
                  type="button"
                  onClick={() => onNavigateTab('radius')}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold inline-flex items-center gap-1.5 bg-indigo-50 text-indigo-800 border border-indigo-200 hover:bg-indigo-100 transition-colors cursor-pointer"
                >
                  <BookOpen className="w-3.5 h-3.5 shrink-0" />
                  <span>Lý thuyết trọng tâm (Mục 2)</span>
                  <ArrowRight className="w-3.5 h-3.5 shrink-0" />
                </button>
              )}
              <button
                type="button"
                onClick={() => {
                  setShowDualCompare(true);
                  setTimeout(() => {
                    const cmpEl = document.getElementById('dual-element-comparison');
                    if (cmpEl) cmpEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }, 50);
                }}
                className="px-3 py-1.5 rounded-xl text-xs font-bold inline-flex items-center gap-1.5 bg-sky-50 text-sky-800 border border-sky-200 hover:bg-sky-100 transition-colors cursor-pointer"
              >
                <Scale className="w-3.5 h-3.5 shrink-0" />
                <span>So sánh ({compareElementA.symbol} vs {compareElementB.symbol})</span>
              </button>
            </div>
          </div>
        </div>

        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <span className="text-xs font-bold text-slate-700 block">
              Chế độ màu hiển thị
            </span>
            <div className="flex flex-wrap items-center gap-1 p-1 bg-slate-100 rounded-xl">
              <button
                type="button"
                onClick={() => setColorMode('category')}
                className={`px-2.5 sm:px-3 py-1.5 sm:py-2 text-[11px] sm:text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  colorMode === 'category'
                    ? 'bg-white text-slate-950 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Chuẩn SGK: Kim loại / Phi kim
              </button>
              <button
                type="button"
                onClick={() => setColorMode('block_spdf')}
                className={`px-2.5 sm:px-3 py-1.5 sm:py-2 text-[11px] sm:text-xs font-bold rounded-lg transition-all cursor-pointer inline-flex items-center gap-1 ${
                  colorMode === 'block_spdf'
                    ? 'bg-white text-slate-950 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Layers className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                <span>Họ s, p, d, f</span>
              </button>
              <button
                type="button"
                onClick={() => setColorMode('radius_heatmap')}
                className={`px-2.5 sm:px-3 py-1.5 sm:py-2 text-[11px] sm:text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  colorMode === 'radius_heatmap'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Bản đồ nhiệt bán kính
              </button>
            </div>
          </div>

          <div className="space-y-1.5">
            <span className="text-xs font-bold text-slate-700 block">
              Lọc theo nhóm
            </span>
            <div className="flex flex-wrap items-center gap-1 p-1 bg-slate-100 rounded-xl">
              {(
                [
                  { id: 'all', label: 'Tất cả (118)' },
                  { id: 'metal', label: 'Kim loại (92)' },
                  { id: 'nonmetal', label: 'Phi kim (19)' },
                  { id: 'noble_gas', label: 'Khí hiếm (7)' },
                  { id: 'groupA', label: 'Nhóm A' },
                  { id: 'groupB', label: 'Nhóm B' },
                ] as { id: FilterMode; label: string }[]
              ).map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setFilterMode(tab.id)}
                  className={`px-2.5 sm:px-3 py-1.5 sm:py-2 text-[11px] sm:text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
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

          <div className="space-y-1.5 w-full xl:w-64">
            <label htmlFor="element-search" className="text-xs font-bold text-slate-700 block">
              Tìm kiếm (Z, tên, kí hiệu)
            </label>
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                id="element-search"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="VD: 26, Fe, Sắt, Na..."
                className="w-full pl-9 pr-12 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-900 focus:bg-white transition-colors"
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
      </div>

      {typeof document !== 'undefined' &&
        createPortal(
          <AnimatePresence>
            {selectedElement && (
              <div className={isDarkMode ? 'dark-theme' : ''}>
                <motion.div
                  id="selected-element-detail-panel"
                  key="element-modal-backdrop"
                  role="dialog"
                  aria-modal="true"
                  aria-label={`Chi tiết nguyên tố ${selectedElement.name}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  onClick={() => onSelectElement(null)}
                  style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    width: '100vw',
                    height: '100dvh',
                    minHeight: '100vh',
                    margin: 0,
                  }}
                  className="fixed inset-0 z-[9999] flex items-center justify-center p-2.5 sm:p-6 bg-slate-950/75 backdrop-blur-md overflow-y-auto"
                >
                  <motion.div
                    key={selectedElement.atomicNumber}
                    initial={{ opacity: 0, scale: 0.94, y: 16 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.94, y: 16 }}
                    transition={{ type: 'spring', stiffness: 340, damping: 28 }}
                    onClick={(e) => e.stopPropagation()}
                    className="relative w-full max-w-[1220px] max-h-[92dvh] overflow-y-auto overflow-x-hidden bg-white border-2 border-sky-400/85 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-2xl my-auto"
                  >
                    <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 items-stretch">
                      <div className="lg:col-span-7 flex flex-col justify-between space-y-4 sm:space-y-5">
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-slate-100 pb-4">
                          <div className="flex items-start sm:items-center gap-3.5 sm:gap-4">
                            <div className="element-tile-shimmer w-18 h-18 sm:w-22 sm:h-22 rounded-2xl border-2 flex flex-col items-center justify-center shrink-0 shadow-md bg-sky-100 border-sky-400 text-sky-950">
                              <span className="font-mono text-[11px] sm:text-xs font-extrabold opacity-90 leading-none">
                                Z = {selectedElement.atomicNumber}
                              </span>
                              <span className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight mt-0.5">
                                {selectedElement.symbol}
                              </span>
                              <span className="text-[9px] sm:text-[10px] font-bold opacity-90 leading-none mt-0.5">
                                M = {selectedElement.atomicMass}
                              </span>
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-xs font-semibold text-slate-600">
                                <span className="font-extrabold text-sky-700">
                                  {categoryLabel(selectedElement.category)}
                                </span>
                                <span>•</span>
                                <span>{selectedElement.subCategory}</span>
                                <span>•</span>
                                <span className="text-indigo-700 font-bold">
                                  Khối {selectedElement.block}
                                </span>
                              </div>
                              <h2 className="font-display text-xl sm:text-3xl font-extrabold text-slate-900 mt-0.5 break-words">
                                {selectedElement.name}{' '}
                                <span className="text-slate-500 font-semibold">
                                  ({selectedElement.vietnameseName})
                                </span>
                              </h2>
                              <p className="text-xs text-slate-600 mt-1 font-mono break-words">
                                Cấu hình electron: <strong className="text-slate-950">{selectedElement.fullElectronConfig}</strong>
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 self-end sm:self-start shrink-0">
                            {selectedElement.atomicNumber > 1 && (
                              <button
                                type="button"
                                onClick={() =>
                                  onSelectElement(ELEMENT_BY_Z[selectedElement.atomicNumber - 1])
                                }
                                className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 text-xs font-mono font-bold transition-colors cursor-pointer"
                              >
                                ← #{selectedElement.atomicNumber - 1}
                              </button>
                            )}
                            {selectedElement.atomicNumber < 118 && (
                              <button
                                type="button"
                                onClick={() =>
                                  onSelectElement(ELEMENT_BY_Z[selectedElement.atomicNumber + 1])
                                }
                                className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 text-xs font-mono font-bold transition-colors cursor-pointer"
                              >
                                #{selectedElement.atomicNumber + 1} →
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => onSelectElement(null)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-colors cursor-pointer shadow-xs"
                            >
                              <X className="w-4 h-4" />
                              <span>Đóng</span>
                            </button>
                          </div>
                        </div>

                        <div>
                          <div className="text-xs font-bold text-slate-700 mb-2.5 flex items-center gap-1.5">
                            <Compass className="w-4 h-4 text-sky-600 shrink-0" />
                            <span>Vị trí trong bảng tuần hoàn</span>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-50 border border-slate-200 shadow-2xs">
                              <div className="text-xs font-semibold text-slate-500">1. Ô số</div>
                              <div className="font-display text-xl sm:text-2xl font-extrabold text-slate-900 mt-1">
                                #{selectedElement.atomicNumber}
                              </div>
                              <p className="text-xs text-slate-600 mt-1.5">Z = +{selectedElement.atomicNumber}</p>
                            </div>
                            <div className="p-3.5 sm:p-4 rounded-2xl bg-sky-50 border border-sky-200 shadow-2xs">
                              <div className="text-xs font-semibold text-sky-800">2. Chu kì</div>
                              <div className="font-display text-xl sm:text-2xl font-extrabold text-sky-950 mt-1">
                                Chu kì {selectedElement.period}
                              </div>
                              <p className="text-xs text-sky-900 mt-1.5">{selectedElement.shells.length} lớp electron</p>
                            </div>
                            <div className="p-3.5 sm:p-4 rounded-2xl bg-rose-50 border border-rose-200 shadow-2xs">
                              <div className="text-xs font-semibold text-rose-800">3. Nhóm</div>
                              <div className="font-display text-xl sm:text-2xl font-extrabold text-slate-950 mt-1">
                                Nhóm {selectedElement.groupRoman} ({selectedElement.groupType})
                              </div>
                              <p className="text-xs text-slate-700 mt-1.5">Cột {selectedElement.column}</p>
                            </div>
                          </div>
                        </div>

                        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="text-xs text-slate-700 leading-relaxed flex-1">
                            <strong className="text-slate-900">Điểm thú vị: </strong>
                            {getElementFunFact(selectedElement)}
                          </div>
                          <div className="flex items-center gap-4 shrink-0 border-t sm:border-t-0 sm:border-l border-slate-200 pt-2 sm:pt-0 sm:pl-4 text-xs">
                            <div>
                              <span className="text-slate-500 block">Bán kính nguyên tử</span>
                              <span className="font-mono text-sm font-extrabold text-indigo-700">
                                {selectedElement.atomicRadius ? `${selectedElement.atomicRadius} pm` : 'Chưa có'}
                              </span>
                            </div>
                            <div>
                              <span className="text-slate-500 block">Độ âm điện</span>
                              <span className="font-mono text-sm font-extrabold text-rose-700">
                                {selectedElement.electronegativity !== null ? selectedElement.electronegativity.toFixed(2) : 'Không xét'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <Atom3DCanvas element={selectedElement} />
                    </div>

                    <div className="relative z-10">
                      <FlameAndSpectrumLab
                        element={selectedElement}
                        onSelectElement={(el) => onSelectElement(el)}
                      />
                    </div>
                  </motion.div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>,
          document.body
        )}

      <div className="bg-white border-2 border-slate-200/90 rounded-2xl sm:rounded-3xl p-3 sm:p-6 shadow-md space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2 lg:hidden pb-1">
          <div className="text-xs font-semibold text-slate-600 flex items-center gap-1.5">
            <Smartphone className="w-4 h-4 text-sky-600 shrink-0" />
            <span>Vuốt ngang để xem đủ 18 cột:</span>
          </div>
          <button
            type="button"
            onClick={() => setIsCompactMobileTable((prev) => !prev)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
              isCompactMobileTable
                ? 'bg-sky-600 text-white border-sky-500'
                : 'bg-slate-100 text-slate-800 border-slate-200'
            }`}
          >
            {isCompactMobileTable ? 'Bảng thu gọn' : 'Bảng chuẩn'}
          </button>
        </div>

        <div className="overflow-x-auto pb-2 -mx-1 px-1">
          <div className={gridMinWidthClass}>
            <div className="grid gap-1 sm:gap-1.5 mb-1.5" style={gridTemplateStyle}>
              <div className="flex flex-col items-center justify-center p-1 rounded-lg bg-slate-900 text-[8px] sm:text-[9px] font-bold text-white text-center">
                <span className="text-amber-300">Nhóm</span>
                <span className="text-sky-300">Chu kì</span>
              </div>
              {Array.from({ length: 18 }, (_, i) => i + 1).map((col) => {
                const grp = COLUMN_TO_GROUP[col];
                return (
                  <div
                    key={col}
                    className={`flex flex-col items-center justify-center py-1 sm:py-1.5 px-0.5 rounded-lg border text-center ${
                      grp.type === 'A'
                        ? 'bg-sky-50 border-sky-200 text-slate-900'
                        : 'bg-rose-50 border-rose-200 text-slate-700'
                    }`}
                  >
                    <span className="font-mono text-[8px] sm:text-[10px] font-bold">
                      {isCompactMobileTable ? col : `Cột ${col}`}
                    </span>
                    <span className="text-[8px] sm:text-[10px] font-extrabold mt-0.5">
                      {grp.roman}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="space-y-1 sm:space-y-1.5">
              {Array.from({ length: 7 }, (_, i) => i + 1).map((period) => (
                <div key={period} className="grid gap-1 sm:gap-1.5" style={gridTemplateStyle}>
                  <div className="flex flex-col items-center justify-center rounded-lg border bg-slate-100 border-slate-200 text-slate-800">
                    <span className="text-[8px] sm:text-[9px] font-semibold opacity-75">CK</span>
                    <span className="font-display text-sm sm:text-base font-extrabold leading-none mt-0.5">
                      {period}
                    </span>
                  </div>
                  {Array.from({ length: 18 }, (_, i) => i + 1).map((col) => {
                    if (period === 6 && col === 3) {
                      const isMarkerActive = filterMode === 'all';
                      return (
                        <button
                          key="lanthanide-marker"
                          type="button"
                          disabled={!isMarkerActive}
                          onClick={() => handleElementClick(ELEMENT_BY_Z[57])}
                          className={`element-tile-shimmer flex flex-col items-center justify-center p-1 rounded-lg border text-center transition-all duration-200 ${
                            isCompactMobileTable ? 'min-h-[46px] sm:min-h-[66px]' : 'min-h-[56px] sm:min-h-[66px]'
                          } ${
                            isMarkerActive
                              ? isDarkMode
                                ? 'bg-emerald-950/90 border-emerald-500/80 text-emerald-200 hover:border-emerald-300 hover:scale-105 cursor-pointer'
                                : 'bg-emerald-100 border-emerald-400 text-emerald-950 hover:border-emerald-600 hover:scale-105 cursor-pointer'
                              : 'opacity-20 saturate-0 scale-95 pointer-events-none bg-slate-100 border-slate-200 text-slate-400 cursor-default'
                          }`}
                        >
                          <span className="font-mono text-[8px] sm:text-[9px] font-bold">57-71</span>
                          <span className="font-display text-[10px] sm:text-xs font-extrabold mt-0.5">La-Lu</span>
                          {!isCompactMobileTable && (
                            <span className="text-[8px] font-bold leading-tight mt-0.5">
                              Lanthanide
                            </span>
                          )}
                        </button>
                      );
                    }
                    if (period === 7 && col === 3) {
                      const isMarkerActive = filterMode === 'all';
                      return (
                        <button
                          key="actinide-marker"
                          type="button"
                          disabled={!isMarkerActive}
                          onClick={() => handleElementClick(ELEMENT_BY_Z[89])}
                          className={`element-tile-shimmer flex flex-col items-center justify-center p-1 rounded-lg border text-center transition-all duration-200 ${
                            isCompactMobileTable ? 'min-h-[46px] sm:min-h-[66px]' : 'min-h-[56px] sm:min-h-[66px]'
                          } ${
                            isMarkerActive
                              ? isDarkMode
                                ? 'bg-emerald-950/90 border-emerald-500/80 text-emerald-200 hover:border-emerald-300 hover:scale-105 cursor-pointer'
                                : 'bg-emerald-100 border-emerald-400 text-emerald-950 hover:border-emerald-600 hover:scale-105 cursor-pointer'
                              : 'opacity-20 saturate-0 scale-95 pointer-events-none bg-slate-100 border-slate-200 text-slate-400 cursor-default'
                          }`}
                        >
                          <span className="font-mono text-[8px] sm:text-[9px] font-bold">89-103</span>
                          <span className="font-display text-[10px] sm:text-xs font-extrabold mt-0.5">Ac-Lr</span>
                          {!isCompactMobileTable && (
                            <span className="text-[8px] font-bold leading-tight mt-0.5">
                              Actinide
                            </span>
                          )}
                        </button>
                      );
                    }
                    const el = mainGridMap.get(`${period}-${col}`);
                    if (!el) {
                      return <div key={`empty-${period}-${col}`} className="min-h-[46px] sm:min-h-[66px]" />;
                    }
                    return renderElementCell(el);
                  })}
                </div>
              ))}
            </div>

            <div className="mt-5 pt-4 border-t-2 border-dashed border-slate-200 space-y-1.5 sm:space-y-2">
              <div className="grid gap-1 sm:gap-1.5" style={gridTemplateStyle}>
                <div
                  className={`col-span-3 flex items-center justify-between px-2.5 py-1.5 rounded-lg border transition-all duration-200 ${
                    filterMode === 'all'
                      ? isDarkMode
                        ? 'bg-emerald-950/90 border-emerald-500/80 text-emerald-100'
                        : 'bg-emerald-100 border-emerald-400 text-emerald-950'
                      : 'opacity-20 saturate-0 bg-slate-100 border-slate-200 text-slate-400'
                  }`}
                >
                  <span className="font-display text-xs font-extrabold">Họ Lanthanide (57-71)</span>
                  <span className="font-mono text-xs font-bold">4f</span>
                </div>
                {lanthanides.map((el) => renderElementCell(el))}
                <div className="col-span-1" />
              </div>

              <div className="grid gap-1 sm:gap-1.5" style={gridTemplateStyle}>
                <div
                  className={`col-span-3 flex items-center justify-between px-2.5 py-1.5 rounded-lg border transition-all duration-200 ${
                    filterMode === 'all'
                      ? isDarkMode
                        ? 'bg-emerald-950/90 border-emerald-500/80 text-emerald-100'
                        : 'bg-emerald-100 border-emerald-400 text-emerald-950'
                      : 'opacity-20 saturate-0 bg-slate-100 border-slate-200 text-slate-400'
                  }`}
                >
                  <span className="font-display text-xs font-extrabold">Họ Actinide (89-103)</span>
                  <span className="font-mono text-xs font-bold">5f</span>
                </div>
                {actinides.map((el) => renderElementCell(el))}
                <div className="col-span-1" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div id="dual-element-comparison" className="space-y-3 scroll-mt-20">
        <div className="flex flex-wrap items-center justify-between gap-2 px-1">
          <div className="text-xs font-bold text-slate-600 flex items-center gap-1.5">
            <Scale className="w-4 h-4 text-sky-600" />
            <span>Đối chiếu song song:</span>
          </div>
          <button
            type="button"
            onClick={() => setShowDualCompare((prev) => !prev)}
            className="text-xs font-bold text-sky-700 hover:text-sky-900 cursor-pointer underline underline-offset-4"
          >
            {showDualCompare ? 'Thu gọn bảng so sánh' : 'Mở bảng so sánh'}
          </button>
        </div>
        {showDualCompare && (
          <ElementDualComparison
            elementA={compareElementA}
            elementB={compareElementB}
            onChangeElementA={setCompareElementA}
            onChangeElementB={setCompareElementB}
          />
        )}
      </div>
    </div>
  );
};
