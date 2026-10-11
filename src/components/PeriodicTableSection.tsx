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

// Elements right on the upper-right of the SGK Metalloid/Nonmetal Staircase line (B -> Si -> As -> Te -> At)
const STAIRCASE_UPPER_Z = new Set([5, 14, 33, 52, 85]);

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
  isDarkMode = false,
}) => {
  const [colorMode, setColorMode] = useState<TableColorMode>(initialColorMode);
  const [filterMode, setFilterMode] = useState<FilterMode>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [highlightPeriodOrGroup, setHighlightPeriodOrGroup] = useState<'none' | 'period' | 'group'>('none');
  const [hoveredElement, setHoveredElement] = useState<ChemicalElement | null>(null);
  const [showDualCompare, setShowDualCompare] = useState<boolean>(true);
  const [compareElementA, setCompareElementA] = useState<ChemicalElement>(ELEMENT_BY_Z[11]); // Na
  const [compareElementB, setCompareElementB] = useState<ChemicalElement>(ELEMENT_BY_Z[17]); // Cl
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

    return true;
  };

  const getCellStyle = (el: ChemicalElement, isSelected: boolean, isMatched: boolean) => {
    const dimmed = !isMatched ? 'opacity-20 saturate-0 scale-95' : 'opacity-100';

    // Crosshair highlight when hovering another element in the same period or column
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

    // SGK Staircase border accent between Metals and Nonmetals (B, Si, As, Te, At)
    const staircaseBorder =
      colorMode === 'category' && STAIRCASE_UPPER_Z.has(el.atomicNumber)
        ? isDarkMode
          ? 'border-l-[3px] border-b-[3px] border-l-rose-400 border-b-rose-400'
          : 'border-l-[3px] border-b-[3px] border-l-rose-600 border-b-rose-600'
        : '';

    if (colorMode === 'category') {
      if (isDarkMode) {
        const darkCatStyles: Record<ElementCategory, string> = {
          metal:
            'bg-gradient-to-br from-sky-950/95 via-sky-900/80 to-blue-950/90 border-sky-500/75 text-sky-50 hover:border-sky-300 hover:shadow-sky-500/40',
          nonmetal:
            'bg-gradient-to-br from-rose-950/95 via-pink-900/80 to-rose-950/90 border-pink-500/75 text-pink-50 hover:border-pink-300 hover:shadow-pink-500/40',
          noble_gas:
            'bg-gradient-to-br from-amber-950/95 via-amber-900/80 to-yellow-950/90 border-amber-500/80 text-amber-50 hover:border-amber-300 hover:shadow-amber-500/40',
        };
        return `${darkCatStyles[el.category]} ${staircaseBorder} ${crosshairBoost} ${selectedRing} ${dimmed}`;
      }

      // Chuẩn màu SGK Hóa học 10 (Light Mode)
      const catStyles: Record<ElementCategory, string> = {
        metal:
          'bg-gradient-to-br from-[#dff2fe] via-[#bae6fd] to-[#93c5fd]/85 border-sky-400 text-slate-950 hover:border-sky-600 hover:shadow-sky-500/40 hover:from-[#e0f2fe] hover:to-[#7dd3fc]',
        nonmetal:
          'bg-gradient-to-br from-[#fce7f3] via-[#fbcfe8] to-[#f9a8d4]/85 border-pink-400 text-slate-950 hover:border-rose-600 hover:shadow-rose-500/40 hover:from-[#fce7f3] hover:to-[#f472b6]/60',
        noble_gas:
          'bg-gradient-to-br from-[#fef3c7] via-[#fde68a] to-[#fcd34d]/90 border-amber-400 text-slate-950 hover:border-amber-600 hover:shadow-amber-500/40 hover:from-[#fef9c3] hover:to-[#fbbf24]/75',
      };
      return `${catStyles[el.category]} ${staircaseBorder} ${crosshairBoost} ${selectedRing} ${dimmed}`;
    }

    if (colorMode === 'block_spdf') {
      if (isDarkMode) {
        const darkBlockStyles: Record<ElementBlock, string> = {
          s: 'bg-gradient-to-br from-sky-950 via-sky-900/85 to-cyan-950 border-sky-500/80 text-sky-100 hover:border-sky-300 hover:shadow-sky-500/35',
          p: 'bg-gradient-to-br from-amber-950 via-amber-900/85 to-orange-950 border-amber-500/80 text-amber-100 hover:border-amber-300 hover:shadow-amber-500/35',
          d: 'bg-gradient-to-br from-rose-950 via-pink-900/85 to-fuchsia-950 border-rose-500/80 text-rose-100 hover:border-rose-300 hover:shadow-rose-500/35',
          f: 'bg-gradient-to-br from-emerald-950 via-teal-900/85 to-green-950 border-emerald-500/80 text-emerald-100 hover:border-emerald-300 hover:shadow-emerald-500/35',
        };
        return `${darkBlockStyles[el.block]} ${crosshairBoost} ${selectedRing} ${dimmed}`;
      }

      const blockStyles: Record<ElementBlock, string> = {
        s: 'bg-gradient-to-br from-sky-100 via-sky-200/90 to-cyan-200 border-sky-400 text-slate-950 hover:border-sky-600 hover:shadow-sky-500/35',
        p: 'bg-gradient-to-br from-amber-100 via-yellow-200/90 to-orange-200/80 border-amber-400 text-slate-950 hover:border-amber-600 hover:shadow-amber-500/35',
        d: 'bg-gradient-to-br from-rose-100 via-pink-200/85 to-fuchsia-200/80 border-rose-400 text-slate-950 hover:border-rose-600 hover:shadow-rose-500/35',
        f: 'bg-gradient-to-br from-emerald-100 via-teal-200/90 to-green-200/85 border-emerald-400 text-slate-950 hover:border-emerald-600 hover:shadow-emerald-500/35',
      };
      return `${blockStyles[el.block]} ${crosshairBoost} ${selectedRing} ${dimmed}`;
    }

    // Radius heatmap mode
    const r = el.atomicRadius;
    const heatmapHoverShadow = 'hover:shadow-indigo-600/35 hover:ring-1 hover:ring-indigo-400';
    if (isDarkMode) {
      if (!r) {
        return `bg-slate-900/90 border-slate-700 text-slate-300 ${heatmapHoverShadow} ${selectedRing} ${dimmed}`;
      }
      if (r >= 220) {
        return `bg-indigo-500 border-sky-300 text-white ${heatmapHoverShadow} ${selectedRing} ${dimmed}`;
      }
      if (r >= 180) {
        return `bg-indigo-600 border-indigo-300 text-white ${heatmapHoverShadow} ${selectedRing} ${dimmed}`;
      }
      if (r >= 150) {
        return `bg-indigo-700 border-indigo-400 text-white ${heatmapHoverShadow} ${selectedRing} ${dimmed}`;
      }
      if (r >= 125) {
        return `bg-indigo-900/95 border-indigo-400/80 text-indigo-100 ${heatmapHoverShadow} ${selectedRing} ${dimmed}`;
      }
      if (r >= 95) {
        return `bg-indigo-950/90 border-indigo-500/60 text-indigo-200 ${heatmapHoverShadow} ${selectedRing} ${dimmed}`;
      }
      return `bg-slate-950/95 border-indigo-500/40 text-slate-200 ${heatmapHoverShadow} ${selectedRing} ${dimmed}`;
    }

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
    const isSelected = selectedElement?.atomicNumber === el.atomicNumber;
    const isMatched = isElementMatched(el);
    const isDarkCell =
      isDarkMode || (colorMode === 'radius_heatmap' && (el.atomicRadius ?? 0) >= 150);

    // Authentic SGK symbol text color
    const symbolColorClass =
      colorMode === 'radius_heatmap' && (el.atomicRadius ?? 0) >= 150
        ? 'text-white'
        : isDarkMode
        ? colorMode === 'category'
          ? el.category === 'metal'
            ? 'text-sky-300'
            : el.category === 'nonmetal'
            ? 'text-pink-300'
            : 'text-amber-300'
          : 'text-white'
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
        title={`Ô ${el.atomicNumber}: ${el.name} (${el.vietnameseName}) - Chu kì ${el.period}, Nhóm ${el.groupRoman} (Nhóm ${el.groupType})`}
        className={`element-tile-shimmer group relative flex flex-col justify-between p-1 sm:p-1.5 rounded-lg border text-left transition-all duration-200 ease-out will-change-transform select-none cursor-pointer ${
          isCompactMobileTable ? 'min-h-[46px] sm:min-h-[66px]' : 'min-h-[56px] sm:min-h-[66px]'
        } ${getCellStyle(el, isSelected, isMatched)}`}
      >
        {/* Active Selected Corner Indicator */}
        {isSelected && (
          <span
            aria-hidden="true"
            className="w-2 h-2 rounded-full bg-sky-400 ring-2 ring-white absolute top-1 right-1"
          />
        )}

        {/* Top row: Atomic Number + Group Type or Block or Radius pm */}
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
            <span
              className={`text-[8px] font-mono font-extrabold px-1 rounded ${
                isDarkMode
                  ? 'bg-slate-950/90 text-sky-300 border border-sky-400/40'
                  : 'bg-white/90 text-slate-950'
              }`}
            >
              {el.block}
            </span>
          ) : (
            <span
              className={`text-[7px] sm:text-[8px] font-mono font-extrabold uppercase tracking-tighter ${
                isDarkMode
                  ? 'text-slate-200'
                  : el.category === 'metal'
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

        {/* Middle: Chemical Symbol + Scaled Circle in Heatmap Mode */}
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

        {/* Bottom: Element Name & Electron Config */}
        <div className="w-full overflow-hidden">
          <div
            className={`text-[8px] sm:text-[9px] font-bold truncate leading-tight ${
              isDarkCell ? 'text-white' : 'text-slate-950'
            }`}
          >
            {el.vietnameseName}
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
      {/* 1. Control Bar: Quick Spotlight + Color Mode + Filter + Search + SGK Legend */}
      <div className="bg-white border border-slate-200 rounded-2xl sm:rounded-3xl p-3.5 sm:p-5 space-y-4 shadow-xs">
        {/* Quick Spotlight Famous Elements & Flame Test Showcase */}
        <div className="flex flex-col gap-2.5 pb-3 border-b border-slate-100">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-xs font-bold text-slate-700 mr-1 inline-flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                <span>Bấm chọn nhanh nguyên tố:</span>
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
                    {el.symbol} ({el.vietnameseName})
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
                  <span>Nội dung Lý thuyết trọng tâm (Mục 2)</span>
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

          {/* Quick Flame Test & Emission Spectrum Presets */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            <span className="text-xs font-bold text-rose-700 mr-1 inline-flex items-center gap-1">
              <Flame className="w-3.5 h-3.5 text-rose-600 shrink-0" />
              <span>Thí nghiệm Màu ngọn lửa & Quang phổ:</span>
            </span>
            {[
              { z: 3, tag: 'Đỏ thẫm' },
              { z: 11, tag: 'Vàng rực' },
              { z: 19, tag: 'Tím hồng' },
              { z: 29, tag: 'Xanh lục bảo' },
              { z: 20, tag: 'Đỏ cam' },
              { z: 38, tag: 'Đỏ tươi' },
              { z: 56, tag: 'Lục vàng' },
              { z: 55, tag: 'Xanh tím' },
            ].map(({ z, tag }) => {
              const el = ELEMENT_BY_Z[z];
              const prof = getElementSpectrumProfile(el);
              const active = selectedElement?.atomicNumber === z;
              return (
                <button
                  key={z}
                  type="button"
                  onClick={() => handleElementClick(el)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] sm:text-xs font-bold transition-all cursor-pointer inline-flex items-center gap-1.5 border ${
                    active
                      ? 'bg-slate-900 text-white border-slate-900 shadow-xs scale-105'
                      : 'bg-slate-900/95 hover:bg-slate-800 text-white border-slate-700'
                  }`}
                >
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{
                      backgroundColor: prof.primaryHex,
                      boxShadow: `0 0 8px ${prof.primaryHex}`,
                    }}
                  />
                  <span className="font-mono font-extrabold">{el.symbol}</span>
                  <span className="text-slate-300 font-medium">({tag})</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
          {/* Mode Switcher */}
          <div className="space-y-1.5">
            <span className="text-xs font-bold text-slate-700 block">
              Chế độ bảng màu chuẩn SGK Hóa học 10
            </span>
            <div className="flex flex-wrap items-center gap-1 p-1 bg-slate-100 rounded-xl">
              <button
                type="button"
                onClick={() => setColorMode('category')}
                className={`px-2.5 sm:px-3 py-1.5 sm:py-2 text-[11px] sm:text-xs font-bold rounded-lg transition-all cursor-pointer text-left ${
                  colorMode === 'category'
                    ? 'bg-white text-slate-950 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Chuẩn SGK: Kim loại · Phi kim · Khí hiếm
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
                <span>Họ s · p · d · f</span>
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
                Bản đồ nhiệt Bán kính
              </button>
            </div>
          </div>

          {/* Filter by classification */}
          <div className="space-y-1.5">
            <span className="text-xs font-bold text-slate-700 block">
              Lọc nhanh theo phân loại nguyên tố
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

          {/* Search box */}
          <div className="space-y-1.5 w-full xl:w-64">
            <label htmlFor="element-search" className="text-xs font-bold text-slate-700 block">
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

        {/* Color Legend (SGK Standard) */}
        <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4 text-xs">
          {colorMode === 'category' ? (
            <div className="space-y-2.5 w-full">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 sm:gap-3 w-full">
                <button
                  type="button"
                  onClick={() => setFilterMode(filterMode === 'metal' ? 'all' : 'metal')}
                  className={`flex items-center gap-3 p-2.5 sm:p-3 rounded-2xl border-2 text-left transition-all cursor-pointer ${
                    filterMode === 'metal'
                      ? 'bg-[#bae6fd] border-sky-600 shadow-sm'
                      : 'bg-[#e0f2fe]/85 border-sky-300 hover:bg-[#bae6fd]/70'
                  }`}
                >
                  <span className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-br from-sky-500 to-blue-700 text-white flex items-center justify-center shrink-0 shadow-xs">
                    <Zap className="w-4 h-4" />
                  </span>
                  <div>
                    <div className="font-extrabold text-sky-950 text-xs">
                      Màu Xanh Dương SGK · Kim loại (92)
                    </div>
                    <div className="text-[11px] text-sky-900/85">
                      Nhóm IA (trừ H), IIA, IIIA (trừ B), toàn bộ nhóm B & Lanthanide / Actinide
                    </div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setFilterMode(filterMode === 'nonmetal' ? 'all' : 'nonmetal')}
                  className={`flex items-center gap-3 p-2.5 sm:p-3 rounded-2xl border-2 text-left transition-all cursor-pointer ${
                    filterMode === 'nonmetal'
                      ? 'bg-[#fbcfe8] border-rose-600 shadow-sm'
                      : 'bg-[#fce7f3]/90 border-pink-300 hover:bg-[#fbcfe8]/75'
                  }`}
                >
                  <span className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-br from-pink-500 to-rose-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                    <Flame className="w-4 h-4" />
                  </span>
                  <div>
                    <div className="font-extrabold text-rose-950 text-xs">
                      Màu Hồng Phấn SGK · Phi kim (19)
                    </div>
                    <div className="text-[11px] text-rose-900/85">
                      Phía trên bên phải đường ziczac đỏ (Nhóm VA, VIA, VIIA + H, B, C, Si)
                    </div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setFilterMode(filterMode === 'noble_gas' ? 'all' : 'noble_gas')}
                  className={`flex items-center gap-3 p-2.5 sm:p-3 rounded-2xl border-2 text-left transition-all cursor-pointer ${
                    filterMode === 'noble_gas'
                      ? 'bg-[#fde68a] border-amber-600 shadow-sm'
                      : 'bg-[#fef3c7]/90 border-amber-300 hover:bg-[#fde68a]/80'
                  }`}
                >
                  <span className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                    <ShieldCheck className="w-4 h-4" />
                  </span>
                  <div>
                    <div className="font-extrabold text-amber-950 text-xs">
                      Màu Vàng Cam SGK · Khí hiếm (7)
                    </div>
                    <div className="text-[11px] text-amber-900/85">
                      Cột 18 (Nhóm VIIIA): Lớp vỏ ngoài cùng bão hòa bền vững (8e, riêng He 2e)
                    </div>
                  </div>
                </button>
              </div>
              <div className="flex items-start sm:items-center gap-2 text-[11px] text-rose-800 font-semibold px-1">
                <span className="inline-block w-4 h-2.5 border-l-[3px] border-b-[3px] border-rose-600 bg-pink-100 shrink-0 mt-0.5 sm:mt-0" />
                <span>
                  Đường bậc thang ziczac màu đỏ đậm (từ B → Si → As → Te → At): Ranh giới phân chia vùng Kim loại (bên trái) và Phi kim (bên phải) theo chuẩn SGK.
                </span>
              </div>
            </div>
          ) : colorMode === 'block_spdf' ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-3 w-full">
              <div className="p-2.5 rounded-xl bg-sky-100 border border-sky-300 flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-lg bg-sky-600 text-white font-mono font-extrabold flex items-center justify-center text-xs shrink-0">
                  s
                </span>
                <div>
                  <div className="font-bold text-sky-950">Nguyên tố họ s</div>
                  <div className="text-[11px] text-sky-800">Nhóm IA, IIA & He</div>
                </div>
              </div>
              <div className="p-2.5 rounded-xl bg-amber-100 border border-amber-300 flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-lg bg-amber-500 text-white font-mono font-extrabold flex items-center justify-center text-xs shrink-0">
                  p
                </span>
                <div>
                  <div className="font-bold text-amber-950">Nguyên tố họ p</div>
                  <div className="text-[11px] text-amber-800">Nhóm IIIA → VIIIA (trừ He)</div>
                </div>
              </div>
              <div className="p-2.5 rounded-xl bg-rose-100 border border-rose-300 flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-lg bg-rose-600 text-white font-mono font-extrabold flex items-center justify-center text-xs shrink-0">
                  d
                </span>
                <div>
                  <div className="font-bold text-rose-950">Nguyên tố họ d</div>
                  <div className="text-[11px] text-rose-800">Các nhóm B (Cột 3 → 12)</div>
                </div>
              </div>
              <div className="p-2.5 rounded-xl bg-emerald-100 border border-emerald-300 flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-lg bg-emerald-600 text-white font-mono font-extrabold flex items-center justify-center text-xs shrink-0">
                  f
                </span>
                <div>
                  <div className="font-bold text-emerald-950">Nguyên tố họ f</div>
                  <div className="text-[11px] text-emerald-800">Họ Lanthanide & Actinide</div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-wrap items-center justify-between w-full gap-3">
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                <span className="font-bold text-indigo-950">
                  Thang màu Bán kính nguyên tử (pm):
                </span>
                <span
                  className={`px-2 py-1 rounded-md border font-mono text-[11px] ${
                    isDarkMode
                      ? 'bg-slate-950 border-indigo-500/40 text-slate-200'
                      : 'bg-indigo-50 border-indigo-200 text-slate-800'
                  }`}
                >
                  &lt; 95 pm (Nhỏ)
                </span>
                <span
                  className={`px-2 py-1 rounded-md border font-mono text-[11px] ${
                    isDarkMode
                      ? 'bg-indigo-950 border-indigo-500/60 text-indigo-200'
                      : 'bg-indigo-100 border-indigo-200 text-slate-900'
                  }`}
                >
                  95–124 pm
                </span>
                <span
                  className={`px-2 py-1 rounded-md border font-mono text-[11px] font-bold ${
                    isDarkMode
                      ? 'bg-indigo-900 border-indigo-400/80 text-indigo-100'
                      : 'bg-indigo-300 border-indigo-400 text-slate-950'
                  }`}
                >
                  125–149 pm
                </span>
                <span className="px-2 py-1 rounded-md bg-indigo-700 border border-indigo-500 text-white font-mono text-[11px]">
                  150–179 pm
                </span>
                <span className="px-2 py-1 rounded-md bg-indigo-600 border border-indigo-400 text-white font-mono text-[11px]">
                  180–219 pm
                </span>
                <span className="px-2 py-1 rounded-md bg-indigo-500 border border-sky-300 text-white font-mono text-[11px] font-bold">
                  ≥ 220 pm (Rất lớn)
                </span>
              </div>
              <div className="text-slate-600 font-medium text-[11px] sm:text-xs">
                Ô màu càng đậm & vòng tròn càng to → Bán kính nguyên tử càng lớn
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 2. Selected Element Interactive Modal Overlay (Portaled to document.body so blurred backdrop covers 100% of viewport) */}
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
                  onClick={() => {
                    onSelectElement(null);
                    setHighlightPeriodOrGroup('none');
                  }}
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
              {/* Decorative Ambient SGK Color Glow in Top-Left Corner */}
              <div
                aria-hidden="true"
                className={`pointer-events-none absolute -top-24 -left-24 w-72 h-72 rounded-full blur-3xl opacity-35 ${
                  selectedElement.category === 'metal'
                    ? 'bg-sky-400'
                    : selectedElement.category === 'nonmetal'
                    ? 'bg-pink-400'
                    : 'bg-amber-400'
                }`}
              />

              <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 items-stretch">
                {/* Left 7 Cols: Exact Position Breakdown (Ô, Chu kì, Nhóm A/B) */}
                <div className="lg:col-span-7 flex flex-col justify-between space-y-4 sm:space-y-5">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-slate-100 pb-4">
                    <div className="flex items-start sm:items-center gap-3.5 sm:gap-4">
                      {/* Vivid SGK-Colored Collector Element Tile Badge */}
                      <motion.div
                        initial={{ rotate: -4, scale: 0.9 }}
                        animate={{ rotate: 0, scale: 1 }}
                        transition={{ type: 'spring', stiffness: 320, damping: 20 }}
                        className={`element-tile-shimmer w-18 h-18 sm:w-22 sm:h-22 rounded-2xl border-2 flex flex-col items-center justify-center shrink-0 shadow-md ${
                          isDarkMode
                            ? selectedElement.category === 'metal'
                              ? 'bg-gradient-to-br from-sky-900 via-sky-950 to-blue-950 border-sky-400 text-sky-200 shadow-sky-500/30'
                              : selectedElement.category === 'nonmetal'
                              ? 'bg-gradient-to-br from-rose-900 via-pink-950 to-rose-950 border-pink-400 text-pink-200 shadow-pink-500/30'
                              : 'bg-gradient-to-br from-amber-900 via-amber-950 to-yellow-950 border-amber-400 text-amber-200 shadow-amber-500/30'
                            : selectedElement.category === 'metal'
                            ? 'bg-gradient-to-br from-[#dff2fe] via-[#bae6fd] to-[#7dd3fc] border-sky-500 text-sky-950 shadow-sky-500/20'
                            : selectedElement.category === 'nonmetal'
                            ? 'bg-gradient-to-br from-[#fce7f3] via-[#fbcfe8] to-[#f472b6] border-rose-500 text-rose-950 shadow-rose-500/20'
                            : 'bg-gradient-to-br from-[#fef3c7] via-[#fde68a] to-[#fbbf24] border-amber-500 text-amber-950 shadow-amber-500/20'
                        }`}
                      >
                        <span className="font-mono text-[11px] sm:text-xs font-extrabold opacity-90 leading-none">
                          Z = {selectedElement.atomicNumber}
                        </span>
                        <span className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight mt-0.5">
                          {selectedElement.symbol}
                        </span>
                        <span className="text-[9px] sm:text-[10px] font-bold opacity-90 leading-none mt-0.5">
                          M = {selectedElement.atomicMass}
                        </span>
                      </motion.div>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-xs font-semibold text-slate-600">
                          <span
                            className={`font-extrabold ${
                              selectedElement.category === 'metal'
                                ? 'text-sky-700'
                                : selectedElement.category === 'nonmetal'
                                ? 'text-rose-700'
                                : 'text-amber-700'
                            }`}
                          >
                            {categoryLabel(selectedElement.category)} (Màu chuẩn SGK)
                          </span>
                          <span aria-hidden="true">·</span>
                          <span>{selectedElement.subCategory}</span>
                          <span aria-hidden="true">·</span>
                          <span className="text-indigo-700 font-bold">
                            Nguyên tố họ {selectedElement.block}
                          </span>
                        </div>
                        <h2 className="font-display text-xl sm:text-3xl font-extrabold text-slate-900 mt-0.5 break-words">
                          {selectedElement.name}{' '}
                          <span className="text-slate-500 font-semibold">
                            ({selectedElement.vietnameseName})
                          </span>
                        </h2>
                        <p className="text-xs text-slate-600 mt-1 font-mono break-words">
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

                    {/* Prev / Next Element + Close Modal Button */}
                    <div className="flex items-center gap-1.5 self-end sm:self-start shrink-0">
                      {selectedElement.atomicNumber > 1 && (
                        <button
                          type="button"
                          onClick={() =>
                            onSelectElement(ELEMENT_BY_Z[selectedElement.atomicNumber - 1])
                          }
                          title="Nguyên tố đứng trước"
                          className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 text-xs font-mono font-bold transition-colors cursor-pointer"
                        >
                          ← Ô {selectedElement.atomicNumber - 1}
                        </button>
                      )}
                      {selectedElement.atomicNumber < 118 && (
                        <button
                          type="button"
                          onClick={() =>
                            onSelectElement(ELEMENT_BY_Z[selectedElement.atomicNumber + 1])
                          }
                          title="Nguyên tố kế tiếp"
                          className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 text-xs font-mono font-bold transition-colors cursor-pointer"
                        >
                          Ô {selectedElement.atomicNumber + 1} →
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => {
                          onSelectElement(null);
                          setHighlightPeriodOrGroup('none');
                        }}
                        title="Đóng cửa sổ chi tiết (Phím Esc hoặc bấm ra ngoài)"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-colors cursor-pointer shadow-xs"
                      >
                        <X className="w-4 h-4" />
                        <span>Đóng</span>
                      </button>
                    </div>
                  </div>

                  {/* Quick Assign to Dual Comparison */}
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-1.5 bg-sky-50 border border-sky-200 p-1.5 rounded-xl">
                      <button
                        type="button"
                        onClick={() => {
                          setCompareElementA(selectedElement);
                          setShowDualCompare(true);
                          onSelectElement(null);
                          setTimeout(() => {
                            const el = document.getElementById('dual-element-comparison');
                            if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                          }, 80);
                        }}
                        className="px-3 py-1.5 text-xs font-bold text-sky-800 hover:bg-sky-100 rounded-lg transition-colors cursor-pointer"
                      >
                        So sánh: Đặt {selectedElement.symbol} làm nguyên tố A
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setCompareElementB(selectedElement);
                          setShowDualCompare(true);
                          onSelectElement(null);
                          setTimeout(() => {
                            const el = document.getElementById('dual-element-comparison');
                            if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                          }, 80);
                        }}
                        className="px-3 py-1.5 text-xs font-bold text-indigo-800 hover:bg-indigo-100 rounded-lg transition-colors cursor-pointer"
                      >
                        Đặt {selectedElement.symbol} làm nguyên tố B
                      </button>
                    </div>

                    <span className="text-[11px] text-slate-500">
                      Mẹo: Bấm ra vùng mờ bên ngoài hoặc phím <kbd className="px-1.5 py-0.5 rounded bg-slate-100 font-mono font-bold text-slate-700">Esc</kbd> để đóng
                    </span>
                  </div>

                  {/* 3 Core Position Pillars: Số thứ tự ô, Chu kì, Nhóm (ghi rõ nhóm A hay B) */}
                  <div>
                    <div className="text-xs font-bold text-slate-700 mb-2.5 flex items-center gap-1.5">
                      <Compass className="w-4 h-4 text-sky-600 shrink-0" />
                      <span>
                        Vị trí chính xác của nguyên tố {selectedElement.symbol} trong Bảng tuần hoàn:
                      </span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {/* 1. Số thứ tự ô */}
                      <div className="p-3.5 sm:p-4 rounded-2xl bg-gradient-to-br from-slate-50 via-white to-slate-100/80 border border-slate-200/90 shadow-2xs">
                        <div className="text-xs font-semibold text-slate-500">1. Số thứ tự ô nguyên tố</div>
                        <div className="font-display text-xl sm:text-2xl font-extrabold text-slate-900 mt-1 tabular-nums">
                          Ô số {selectedElement.atomicNumber}
                        </div>
                        <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                          Số hiệu nguyên tử{' '}
                          <span className="font-mono font-bold text-slate-900">
                            Z = {selectedElement.atomicNumber}
                          </span>{' '}
                          ({selectedElement.atomicNumber}p, {selectedElement.atomicNumber}e).
                        </p>
                      </div>

                      {/* 2. Chu kì */}
                      <div className="p-3.5 sm:p-4 rounded-2xl bg-gradient-to-br from-sky-50/90 via-white to-sky-100/60 border border-sky-200 shadow-2xs">
                        <div className="text-xs font-semibold text-sky-800">2. Chu kì (Hàng ngang)</div>
                        <div className="font-display text-xl sm:text-2xl font-extrabold text-sky-950 mt-1 tabular-nums">
                          Chu kì {selectedElement.period}
                        </div>
                        <p className="text-xs text-sky-900/85 mt-1.5 leading-relaxed">
                          Nguyên tử có{' '}
                          <strong className="text-sky-950">
                            {selectedElement.shells.length} lớp electron
                          </strong>{' '}
                          ({selectedElement.shells.join(' · ')}).
                        </p>
                      </div>

                      {/* 3. Nhóm (Ghi rõ Nhóm A hay B) */}
                      <div className="p-3.5 sm:p-4 rounded-2xl bg-gradient-to-br from-rose-50/70 via-white to-amber-50/60 border border-rose-200/90 shadow-2xs">
                        <div className="text-xs font-semibold text-rose-800">3. Nhóm (Cột dọc)</div>
                        <div className="font-display text-xl sm:text-2xl font-extrabold text-slate-950 mt-1 tabular-nums">
                          Nhóm {selectedElement.groupRoman}{' '}
                          <span className="text-sm font-extrabold text-rose-700">
                            (Nhóm {selectedElement.groupType})
                          </span>
                        </div>
                        <p className="text-xs text-slate-700 mt-1.5 leading-relaxed">
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
                  <div className="p-3.5 rounded-2xl bg-gradient-to-r from-slate-50 via-sky-50/40 to-rose-50/30 border border-slate-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
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
                        <span className="font-mono text-sm font-extrabold text-rose-700 tabular-nums">
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

                  {/* Interactive Flame Test & Atomic Emission Spectrum Lab */}
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

      {/* 3. Periodic Table 18-Column Grid (Placed BEFORE the Dual Comparison section!) */}
      <div className="bg-white border-2 border-slate-200/90 rounded-2xl sm:rounded-3xl p-3 sm:p-6 shadow-md space-y-3">
        {/* Mobile & Tablet Friendly Toolbar above Periodic Table */}
        <div className="flex flex-wrap items-center justify-between gap-2 lg:hidden pb-1">
          <div className="text-xs font-semibold text-slate-600 flex items-center gap-1.5">
            <Smartphone className="w-4 h-4 text-sky-600 shrink-0" />
            <span>Vuốt ngang bảng để xem 18 cột hoặc bật chế độ Thu gọn:</span>
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
            {isCompactMobileTable ? 'Đang bật: Bảng thu gọn' : 'Thu gọn bảng cho Điện thoại'}
          </button>
        </div>

        {colorMode === 'radius_heatmap' && (
          <div className="p-3 sm:p-3.5 rounded-xl bg-indigo-50 border border-indigo-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-3 text-xs text-indigo-950">
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

        <div className="overflow-x-auto pb-2 -mx-1 px-1">
          <div className={gridMinWidthClass}>
            {/* Live Hover Status Strip above the table */}
            <div className="flex flex-wrap items-center justify-between gap-2 px-3.5 py-2.5 mb-3 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white text-xs shadow-xs">
              {hoveredElement ? (
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-bold text-sky-300">Đang soi tọa độ:</span>
                  <strong className="font-display text-sm text-white">
                    Ô {hoveredElement.atomicNumber} · {hoveredElement.symbol} ({hoveredElement.name} / {hoveredElement.vietnameseName})
                  </strong>
                  <span aria-hidden="true" className="text-slate-400">·</span>
                  <span>
                    Chu kì <strong className="text-sky-300">{hoveredElement.period}</strong>
                  </span>
                  <span aria-hidden="true" className="text-slate-400">·</span>
                  <span>
                    Nhóm <strong className="text-amber-300">{hoveredElement.groupRoman} (Nhóm {hoveredElement.groupType})</strong>
                  </span>
                  <span aria-hidden="true" className="text-slate-400">·</span>
                  <span className="font-mono text-slate-200">
                    Cấu hình: {hoveredElement.electronConfig}
                  </span>
                  {hoveredElement.atomicRadius && (
                    <>
                      <span aria-hidden="true" className="text-slate-400">·</span>
                      <span className="font-mono font-bold text-pink-300">
                        Bán kính: {hoveredElement.atomicRadius} pm
                      </span>
                    </>
                  )}
                </div>
              ) : (
                <div className="text-slate-200">
                  👉 <strong>Bấm vào bất kì ô nguyên tố nào bên dưới</strong> để mở Bảng phân tích vị trí (Ô, Chu kì, Nhóm), Mô hình nguyên tử 3D/Bohr & Thí nghiệm Màu ngọn lửa – Quang phổ phát xạ!
                </div>
              )}
              <span className="font-mono text-[11px] text-sky-300 font-bold shrink-0">
                {selectedElement
                  ? `Đang mở: ${selectedElement.symbol} (Z=${selectedElement.atomicNumber})`
                  : 'Chưa chọn nguyên tố (Bấm vào 1 ô để xem)'}
              </span>
            </div>

            {/* Top Column Headers (1..18 and Group IA..VIIIA / B) */}
            <div className="grid gap-1 sm:gap-1.5 mb-1.5" style={gridTemplateStyle}>
              <div className="flex flex-col items-center justify-center p-1 rounded-lg bg-slate-900 text-[8px] sm:text-[9px] font-bold text-white text-center">
                <span className="text-amber-300">Nhóm →</span>
                <span className="text-sky-300">Chu kì ↓</span>
              </div>
              {Array.from({ length: 18 }, (_, i) => i + 1).map((col) => {
                const grp = COLUMN_TO_GROUP[col];
                const isSelectedCol =
                  selectedElement !== null &&
                  selectedElement.column === col &&
                  !selectedElement.fBlockRow;
                const isHoveredCol = hoveredElement?.column === col && !hoveredElement?.fBlockRow;
                return (
                  <div
                    key={col}
                    className={`flex flex-col items-center justify-center py-1 sm:py-1.5 px-0.5 rounded-lg border text-center transition-all duration-150 ${
                      isSelectedCol
                        ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                        : isHoveredCol
                        ? 'bg-sky-600 text-white border-sky-600 scale-105 shadow-sm'
                        : grp.type === 'A'
                        ? 'bg-sky-50/90 border-sky-200 text-slate-900'
                        : 'bg-rose-50/70 border-rose-200/80 text-slate-700'
                    }`}
                  >
                    <span className="font-mono text-[8px] sm:text-[10px] font-bold leading-tight">
                      {isCompactMobileTable ? col : `Cột ${col}`}
                    </span>
                    <span
                      className={`text-[8px] sm:text-[10px] font-extrabold leading-tight mt-0.5 ${
                        isSelectedCol || isHoveredCol
                          ? 'text-amber-300'
                          : grp.type === 'A'
                          ? 'text-sky-800'
                          : 'text-rose-700'
                      }`}
                    >
                      {grp.roman}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* 7 Periods Rows */}
            <div className="space-y-1 sm:space-y-1.5">
              {Array.from({ length: 7 }, (_, i) => i + 1).map((period) => {
                const isSelectedPeriod = selectedElement?.period === period;
                const isHoveredPeriod = hoveredElement?.period === period;
                return (
                  <div
                    key={period}
                    className="grid gap-1 sm:gap-1.5"
                    style={gridTemplateStyle}
                  >
                    {/* Period Header Cell */}
                    <div
                      className={`flex flex-col items-center justify-center rounded-lg border text-center transition-all duration-150 ${
                        isSelectedPeriod
                          ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                          : isHoveredPeriod
                          ? 'bg-sky-600 text-white border-sky-600 scale-105 shadow-sm'
                          : 'bg-slate-100 border-slate-200 text-slate-800'
                      }`}
                    >
                      <span className="text-[8px] sm:text-[9px] font-semibold opacity-75">
                        {isCompactMobileTable ? 'CK' : 'Chu kì'}
                      </span>
                      <span className="font-display text-sm sm:text-base font-extrabold leading-none mt-0.5">
                        {period}
                      </span>
                      {!isCompactMobileTable && (
                        <span className="font-mono text-[8px] opacity-80 mt-0.5">
                          {period} lớp e
                        </span>
                      )}
                    </div>

                    {/* 18 Columns in this Period */}
                    {Array.from({ length: 18 }, (_, i) => i + 1).map((col) => {
                      if (period === 6 && col === 3) {
                        const isLanthanideSelected = selectedElement?.fBlockRow === 'lanthanide';
                        return (
                          <button
                            key="lanthanide-marker"
                            type="button"
                            onClick={() => handleElementClick(ELEMENT_BY_Z[57])}
                            className={`element-tile-shimmer flex flex-col items-center justify-center p-1 rounded-lg border text-center transition-all duration-200 ease-out hover:scale-[1.12] hover:-translate-y-1 hover:shadow-lg hover:z-30 cursor-pointer ${
                              isCompactMobileTable ? 'min-h-[46px] sm:min-h-[66px]' : 'min-h-[56px] sm:min-h-[66px]'
                            } ${
                              isLanthanideSelected
                                ? 'bg-emerald-700 text-white border-emerald-400 ring-2 ring-white'
                                : isDarkMode
                                ? 'bg-emerald-950/90 border-emerald-500/80 text-emerald-200 hover:border-emerald-300'
                                : 'bg-gradient-to-br from-emerald-100 to-teal-200/85 border-emerald-400 text-emerald-950 hover:border-emerald-600'
                            }`}
                          >
                            <span className="font-mono text-[8px] sm:text-[9px] font-bold">57–71</span>
                            <span className="font-display text-[10px] sm:text-xs font-extrabold mt-0.5">La–Lu</span>
                            {!isCompactMobileTable && (
                              <span className="text-[8px] font-bold leading-tight mt-0.5">
                                Lanthanide ↓
                              </span>
                            )}
                          </button>
                        );
                      }

                      if (period === 7 && col === 3) {
                        const isActinideSelected = selectedElement?.fBlockRow === 'actinide';
                        return (
                          <button
                            key="actinide-marker"
                            type="button"
                            onClick={() => handleElementClick(ELEMENT_BY_Z[89])}
                            className={`element-tile-shimmer flex flex-col items-center justify-center p-1 rounded-lg border text-center transition-all duration-200 ease-out hover:scale-[1.12] hover:-translate-y-1 hover:shadow-lg hover:z-30 cursor-pointer ${
                              isCompactMobileTable ? 'min-h-[46px] sm:min-h-[66px]' : 'min-h-[56px] sm:min-h-[66px]'
                            } ${
                              isActinideSelected
                                ? 'bg-emerald-700 text-white border-emerald-400 ring-2 ring-white'
                                : isDarkMode
                                ? 'bg-emerald-950/90 border-emerald-500/80 text-emerald-200 hover:border-emerald-300'
                                : 'bg-gradient-to-br from-emerald-100 to-teal-200/85 border-emerald-400 text-emerald-950 hover:border-emerald-600'
                            }`}
                          >
                            <span className="font-mono text-[8px] sm:text-[9px] font-bold">89–103</span>
                            <span className="font-display text-[10px] sm:text-xs font-extrabold mt-0.5">Ac–Lr</span>
                            {!isCompactMobileTable && (
                              <span className="text-[8px] font-bold leading-tight mt-0.5">
                                Actinide ↓
                              </span>
                            )}
                          </button>
                        );
                      }

                      const el = mainGridMap.get(`${period}-${col}`);
                      if (!el) {
                        return (
                          <div
                            key={`empty-${period}-${col}`}
                            className={isCompactMobileTable ? 'min-h-[46px] sm:min-h-[66px]' : 'min-h-[56px] sm:min-h-[66px]'}
                          />
                        );
                      }

                      return renderElementCell(el);
                    })}
                  </div>
                );
              })}
            </div>

            {/* Separated 2 Bottom Rows: Lanthanide (57..71) & Actinide (89..103) */}
            <div className="mt-5 pt-4 border-t-2 border-dashed border-slate-200 space-y-1.5 sm:space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-600 mb-1">
                <span className="font-bold text-slate-800">
                  Hai hàng tách riêng bên dưới: Họ Lanthanide (Chu kì 6, Nhóm IIIB) và Họ Actinide (Chu kì 7, Nhóm IIIB)
                </span>
                <span className="text-slate-500 font-medium">
                  Bấm vào bất kì nguyên tố nào để xem cấu hình electron họ 4f / 5f
                </span>
              </div>

              {/* Row 1: Lanthanides (57..71) */}
              <div className="grid gap-1 sm:gap-1.5" style={gridTemplateStyle}>
                <div
                  className={`col-span-3 flex items-center justify-between px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-lg border ${
                    isDarkMode
                      ? 'bg-emerald-950/90 border-emerald-500/80 text-emerald-100'
                      : 'bg-gradient-to-r from-emerald-100 to-teal-100 border-emerald-400 text-emerald-950'
                  }`}
                >
                  <div>
                    <div className="font-display text-[11px] sm:text-xs font-extrabold">Họ Lanthanide</div>
                    <div className="text-[9px] sm:text-[10px] font-semibold text-emerald-800">
                      Chu kì 6 · Nhóm IIIB (57 → 71)
                    </div>
                  </div>
                  <span className="font-mono text-xs font-extrabold">4f</span>
                </div>
                {lanthanides.map((el) => renderElementCell(el))}
                <div className="col-span-1" />
              </div>

              {/* Row 2: Actinides (89..103) */}
              <div className="grid gap-1 sm:gap-1.5" style={gridTemplateStyle}>
                <div
                  className={`col-span-3 flex items-center justify-between px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-lg border ${
                    isDarkMode
                      ? 'bg-emerald-950/90 border-emerald-500/80 text-emerald-100'
                      : 'bg-gradient-to-r from-emerald-100 to-teal-100 border-emerald-400 text-emerald-950'
                  }`}
                >
                  <div>
                    <div className="font-display text-[11px] sm:text-xs font-extrabold">Họ Actinide</div>
                    <div className="text-[9px] sm:text-[10px] font-semibold text-emerald-800">
                      Chu kì 7 · Nhóm IIIB (89 → 103)
                    </div>
                  </div>
                  <span className="font-mono text-xs font-extrabold">5f</span>
                </div>
                {actinides.map((el) => renderElementCell(el))}
                <div className="col-span-1" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Dual Element Side-by-Side Comparison Section — PLACED AFTER THE PERIODIC TABLE! */}
      <div id="dual-element-comparison" className="space-y-3 scroll-mt-20">
        <div className="flex flex-wrap items-center justify-between gap-2 px-1">
          <div className="text-xs font-bold text-slate-600 flex items-center gap-1.5">
            <Scale className="w-4 h-4 text-sky-600" />
            <span>Công cụ mở rộng bên dưới Bảng tuần hoàn:</span>
          </div>
          <button
            type="button"
            onClick={() => setShowDualCompare((prev) => !prev)}
            className="text-xs font-bold text-sky-700 hover:text-sky-900 cursor-pointer underline underline-offset-4"
          >
            {showDualCompare ? 'Thu gọn Bảng so sánh 2 nguyên tố' : 'Mở rộng Bảng so sánh 2 nguyên tố'}
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
