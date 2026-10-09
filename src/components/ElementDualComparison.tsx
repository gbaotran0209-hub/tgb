import React, { useState } from 'react';
import { ELEMENTS, ELEMENT_BY_Z, ChemicalElement } from '../data/elements';
import { ArrowLeftRight, Scale, CheckCircle2, Atom } from 'lucide-react';

interface ElementDualComparisonProps {
  elementA: ChemicalElement;
  elementB: ChemicalElement;
  onChangeElementA: (el: ChemicalElement) => void;
  onChangeElementB: (el: ChemicalElement) => void;
}

const PRESET_PAIRS: { label: string; zA: number; zB: number; note: string }[] = [
  { label: 'Na và Cl', zA: 11, zB: 17, note: 'Cùng Chu kì 3 (Kim loại kiềm vs Halogen)' },
  { label: 'Li và K', zA: 3, zB: 19, note: 'Cùng Nhóm IA (2 lớp e vs 4 lớp e)' },
  { label: 'Mg và Al', zA: 12, zB: 13, note: 'Hai kim loại kế tiếp ở Chu kì 3' },
  { label: 'F và I', zA: 9, zB: 53, note: 'Cùng Nhóm VIIA (Halogen)' },
  { label: 'Na và K', zA: 11, zB: 19, note: 'Hai kim loại kiềm Chu kì 3 & 4' },
  { label: 'Fe và Cu', zA: 26, zB: 29, note: 'Hai kim loại chuyển tiếp Nhóm B' },
];

export const ElementDualComparison: React.FC<ElementDualComparisonProps> = ({
  elementA,
  elementB,
  onChangeElementA,
  onChangeElementB,
}) => {
  const [pickSlot, setPickSlot] = useState<'A' | 'B'>('B');

  const handleSwap = () => {
    const temp = elementA;
    onChangeElementA(elementB);
    onChangeElementB(temp);
  };

  const categoryLabel = (cat: ChemicalElement['category']) => {
    if (cat === 'metal') return 'Kim loại';
    if (cat === 'nonmetal') return 'Phi kim';
    return 'Khí hiếm';
  };

  const rA = elementA.atomicRadius;
  const rB = elementB.atomicRadius;
  const enA = elementA.electronegativity;
  const enB = elementB.electronegativity;

  // Automatic comparison summary
  const getRadiusComparisonText = () => {
    if (!rA || !rB) return 'Một trong hai nguyên tố chưa có số liệu bán kính nguyên tử.';
    if (rA === rB) {
      return `Hai nguyên tố ${elementA.symbol} và ${elementB.symbol} có bán kính nguyên tử xấp xỉ bằng nhau (${rA} pm).`;
    }
    const larger = rA > rB ? elementA : elementB;
    const smaller = rA > rB ? elementB : elementA;
    const diff = Math.abs(rA - rB);

    let reason = '';
    if (elementA.period === elementB.period) {
      reason = `Vì cả hai cùng thuộc Chu kì ${elementA.period} (${elementA.period} lớp e), nguyên tố ${smaller.symbol} (Z=${smaller.atomicNumber}) có điện tích hạt nhân lớn hơn ${larger.symbol} (Z=${larger.atomicNumber}) nên lực hút hạt nhân mạnh hơn, làm bán kính nhỏ hơn.`;
    } else if (elementA.groupRoman === elementB.groupRoman) {
      reason = `Vì cả hai cùng thuộc Nhóm ${elementA.groupRoman}, nguyên tố ${larger.symbol} ở Chu kì ${larger.period} có nhiều lớp electron hơn ${smaller.symbol} (Chu kì ${smaller.period}) nên có bán kính lớn hơn.`;
    } else {
      reason = `${larger.symbol} (Chu kì ${larger.period}, Nhóm ${larger.groupRoman}) có bán kính lớn hơn ${smaller.symbol} (Chu kì ${smaller.period}, Nhóm ${smaller.groupRoman}) là ${diff} pm.`;
    }

    return `R(${larger.symbol}) = ${larger.atomicRadius} pm > R(${smaller.symbol}) = ${smaller.atomicRadius} pm (Chênh lệch ${diff} pm). ${reason}`;
  };

  const getElectronegativityComparisonText = () => {
    if (enA === null || enB === null) {
      return 'Khí hiếm có cấu hình electron bền vững nên thông thường không xét độ âm điện Pauling.';
    }
    if (enA === enB) {
      return `Hai nguyên tố ${elementA.symbol} và ${elementB.symbol} có cùng độ âm điện (${enA.toFixed(2)}).`;
    }
    const stronger = enA > enB ? elementA : elementB;
    const weaker = enA > enB ? elementB : elementA;
    return `χ(${stronger.symbol}) = ${stronger.electronegativity?.toFixed(2)} > χ(${weaker.symbol}) = ${weaker.electronegativity?.toFixed(2)} → Nguyên tử ${stronger.symbol} hút cặp electron dùng chung mạnh hơn ${weaker.symbol}.`;
  };

  const renderMiniBohr = (el: ChemicalElement, accentColor: string) => {
    const visualRadius = Math.max(24, Math.min(72, Math.round((el.atomicRadius ?? 110) / 3.5)));
    return (
      <svg width="155" height="155" viewBox="0 0 170 170" className="shrink-0">
        <circle
          cx="85"
          cy="85"
          r={visualRadius}
          fill={accentColor === 'sky' ? '#e0f2fe' : '#e0e7ff'}
          stroke={accentColor === 'sky' ? '#0284c7' : '#4f46e5'}
          strokeWidth="2"
        />
        {el.shells.map((elecCount, sIdx) => {
          const shellR = ((sIdx + 1) / el.shells.length) * visualRadius;
          return (
            <g key={sIdx}>
              <circle
                cx="85"
                cy="85"
                r={shellR}
                fill="none"
                stroke={accentColor === 'sky' ? '#0369a1' : '#3730a3'}
                strokeOpacity="0.35"
                strokeDasharray="2 2"
              />
              {Array.from({ length: elecCount }).map((_, eIdx) => {
                const angle = (2 * Math.PI * eIdx) / elecCount - Math.PI / 2;
                const cx = 85 + shellR * Math.cos(angle);
                const cy = 85 + shellR * Math.sin(angle);
                return (
                  <circle
                    key={eIdx}
                    cx={cx}
                    cy={cy}
                    r="2.4"
                    fill={accentColor === 'sky' ? '#0284c7' : '#4f46e5'}
                  />
                );
              })}
            </g>
          );
        })}
        <circle cx="85" cy="85" r="13" fill="#0f172a" />
        <text
          x="85"
          y="89"
          textAnchor="middle"
          className="fill-white font-mono text-[10px] font-bold"
        >
          +{el.atomicNumber}
        </text>
      </svg>
    );
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 space-y-6 shadow-xs">
      {/* Header & Quick Preset Pairs */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center shrink-0">
            <Scale className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-bold text-sky-700">
              Công cụ đối chiếu song song 2 nguyên tố bất kỳ (1 – 118)
            </div>
            <h3 className="font-display text-lg sm:text-xl font-extrabold text-slate-900">
              So Sánh Nguyên Tố: Bán Kính, Cấu Hình Electron & Độ Âm Điện
            </h3>
          </div>
        </div>

        {/* Preset pairs */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs font-semibold text-slate-500 mr-1">Cặp hay gặp:</span>
          {PRESET_PAIRS.map((pair) => {
            const isCurrent =
              (elementA.atomicNumber === pair.zA && elementB.atomicNumber === pair.zB) ||
              (elementA.atomicNumber === pair.zB && elementB.atomicNumber === pair.zA);
            return (
              <button
                key={pair.label}
                type="button"
                onClick={() => {
                  onChangeElementA(ELEMENT_BY_Z[pair.zA]);
                  onChangeElementB(ELEMENT_BY_Z[pair.zB]);
                }}
                title={pair.note}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-mono font-bold border transition-all cursor-pointer ${
                  isCurrent
                    ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {pair.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Dual Selector Row (Select Element A & Element B from all 118 elements) */}
      <div className="grid grid-cols-1 lg:grid-cols-11 gap-4 items-center">
        {/* Element A Selector Card */}
        <div
          onClick={() => setPickSlot('A')}
          className={`lg:col-span-5 p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-4 ${
            pickSlot === 'A'
              ? 'bg-sky-50/70 border-sky-400 ring-1 ring-sky-400'
              : 'bg-slate-50 border-slate-200 hover:border-sky-300'
          }`}
        >
          <div className="space-y-2 flex-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-sky-800">
                NGUYÊN TỐ THỨ NHẤT (A)
              </span>
              <span className="text-[11px] text-slate-500">
                {pickSlot === 'A' ? 'Đang chọn để bấm từ Bảng tuần hoàn' : 'Bấm để gán từ bảng'}
              </span>
            </div>
            <select
              aria-label="Chọn nguyên tố thứ nhất"
              value={elementA.atomicNumber}
              onChange={(e) => onChangeElementA(ELEMENT_BY_Z[Number(e.target.value)])}
              className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-sm font-bold text-slate-900 focus:outline-none focus:border-slate-900"
            >
              {ELEMENTS.map((el) => (
                <option key={el.atomicNumber} value={el.atomicNumber}>
                  Ô {el.atomicNumber} — {el.symbol} ({el.name} / {el.vietnameseName}) · Chu kì {el.period}, Nhóm {el.groupRoman}
                </option>
              ))}
            </select>
            <div className="text-xs text-slate-600 font-mono">
              Cấu hình: <strong className="text-slate-900">{elementA.electronConfig}</strong> · R ={' '}
              <strong className="text-sky-700">
                {elementA.atomicRadius ? `${elementA.atomicRadius} pm` : '—'}
              </strong>
            </div>
          </div>
          {renderMiniBohr(elementA, 'sky')}
        </div>

        {/* Center Swap Button */}
        <div className="lg:col-span-1 flex flex-col items-center justify-center">
          <button
            type="button"
            onClick={handleSwap}
            title="Đổi chỗ 2 nguyên tố"
            className="w-11 h-11 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white flex items-center justify-center shadow-sm transition-transform hover:scale-105 cursor-pointer"
          >
            <ArrowLeftRight className="w-5 h-5" />
          </button>
          <span className="text-[11px] font-semibold text-slate-400 mt-1">Đổi vị trí</span>
        </div>

        {/* Element B Selector Card */}
        <div
          onClick={() => setPickSlot('B')}
          className={`lg:col-span-5 p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-4 ${
            pickSlot === 'B'
              ? 'bg-indigo-50/70 border-indigo-400 ring-1 ring-indigo-400'
              : 'bg-slate-50 border-slate-200 hover:border-indigo-300'
          }`}
        >
          <div className="space-y-2 flex-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-indigo-800">
                NGUYÊN TỐ THỨ HAI (B)
              </span>
              <span className="text-[11px] text-slate-500">
                {pickSlot === 'B' ? 'Đang chọn để bấm từ Bảng tuần hoàn' : 'Bấm để gán từ bảng'}
              </span>
            </div>
            <select
              aria-label="Chọn nguyên tố thứ hai"
              value={elementB.atomicNumber}
              onChange={(e) => onChangeElementB(ELEMENT_BY_Z[Number(e.target.value)])}
              className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-sm font-bold text-slate-900 focus:outline-none focus:border-slate-900"
            >
              {ELEMENTS.map((el) => (
                <option key={el.atomicNumber} value={el.atomicNumber}>
                  Ô {el.atomicNumber} — {el.symbol} ({el.name} / {el.vietnameseName}) · Chu kì {el.period}, Nhóm {el.groupRoman}
                </option>
              ))}
            </select>
            <div className="text-xs text-slate-600 font-mono">
              Cấu hình: <strong className="text-slate-900">{elementB.electronConfig}</strong> · R ={' '}
              <strong className="text-indigo-700">
                {elementB.atomicRadius ? `${elementB.atomicRadius} pm` : '—'}
              </strong>
            </div>
          </div>
          {renderMiniBohr(elementB, 'indigo')}
        </div>
      </div>

      {/* Side-by-Side Data Comparison Table */}
      <div className="overflow-x-auto border border-slate-200 rounded-2xl">
        <table className="w-full text-left border-collapse text-xs sm:text-sm">
          <thead>
            <tr className="bg-slate-900 text-white">
              <th className="py-3.5 px-4 font-display font-bold w-1/4">
                Tiêu chí đối chiếu
              </th>
              <th className="py-3.5 px-4 font-display font-bold w-[37.5%] bg-sky-950/80">
                Nguyên tố A: {elementA.name} ({elementA.symbol} · {elementA.vietnameseName})
              </th>
              <th className="py-3.5 px-4 font-display font-bold w-[37.5%] bg-indigo-950/80">
                Nguyên tố B: {elementB.name} ({elementB.symbol} · {elementB.vietnameseName})
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {/* 1. Số thứ tự ô & Điện tích hạt nhân */}
            <tr className="hover:bg-slate-50">
              <td className="py-3 px-4 font-semibold text-slate-700 bg-slate-50/70">
                1. Số thứ tự ô (Số hiệu Z)
              </td>
              <td className="py-3 px-4 font-mono font-bold text-slate-900 tabular-nums">
                Ô số {elementA.atomicNumber} (Z = +{elementA.atomicNumber}, {elementA.atomicNumber}p, {elementA.atomicNumber}e)
              </td>
              <td className="py-3 px-4 font-mono font-bold text-slate-900 tabular-nums">
                Ô số {elementB.atomicNumber} (Z = +{elementB.atomicNumber}, {elementB.atomicNumber}p, {elementB.atomicNumber}e)
              </td>
            </tr>

            {/* 2. Chu kì & Số lớp electron */}
            <tr className="hover:bg-slate-50">
              <td className="py-3 px-4 font-semibold text-slate-700 bg-slate-50/70">
                2. Chu kì & Số lớp electron
              </td>
              <td className="py-3 px-4 font-medium text-slate-900">
                <strong>Chu kì {elementA.period}</strong> · Có <strong>{elementA.shells.length} lớp e</strong> (Phân bố: <span className="font-mono">{elementA.shells.join(' - ')}</span>)
              </td>
              <td className="py-3 px-4 font-medium text-slate-900">
                <strong>Chu kì {elementB.period}</strong> · Có <strong>{elementB.shells.length} lớp e</strong> (Phân bố: <span className="font-mono">{elementB.shells.join(' - ')}</span>)
              </td>
            </tr>

            {/* 3. Nhóm (A hay B) */}
            <tr className="hover:bg-slate-50">
              <td className="py-3 px-4 font-semibold text-slate-700 bg-slate-50/70">
                3. Nhóm (A / B) & Cột IUPAC
              </td>
              <td className="py-3 px-4 font-medium text-slate-900">
                <strong className="text-sky-700">Nhóm {elementA.groupRoman} (Nhóm {elementA.groupType})</strong> · Cột {elementA.column} · Họ <strong>{elementA.block}</strong> ({elementA.valenceElectrons}e lớp ngoài cùng)
              </td>
              <td className="py-3 px-4 font-medium text-slate-900">
                <strong className="text-indigo-700">Nhóm {elementB.groupRoman} (Nhóm {elementB.groupType})</strong> · Cột {elementB.column} · Họ <strong>{elementB.block}</strong> ({elementB.valenceElectrons}e lớp ngoài cùng)
              </td>
            </tr>

            {/* 4. Cấu hình electron */}
            <tr className="hover:bg-slate-50">
              <td className="py-3 px-4 font-semibold text-slate-700 bg-slate-50/70">
                4. Cấu hình electron
              </td>
              <td className="py-3 px-4 font-mono text-xs sm:text-sm text-slate-900">
                <div className="font-bold text-sky-800">{elementA.electronConfig}</div>
                <div className="text-xs text-slate-500 mt-0.5">Đầy đủ: {elementA.fullElectronConfig}</div>
              </td>
              <td className="py-3 px-4 font-mono text-xs sm:text-sm text-slate-900">
                <div className="font-bold text-indigo-800">{elementB.electronConfig}</div>
                <div className="text-xs text-slate-500 mt-0.5">Đầy đủ: {elementB.fullElectronConfig}</div>
              </td>
            </tr>

            {/* 5. Bán kính nguyên tử (pm) */}
            <tr className="bg-sky-50/30 hover:bg-sky-50/60">
              <td className="py-3.5 px-4 font-bold text-slate-900 bg-slate-100/80">
                5. Bán kính nguyên tử (pm)
              </td>
              <td className="py-3.5 px-4">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-mono text-base font-extrabold text-sky-700 tabular-nums">
                    {rA ? `${rA} pm` : 'Chưa xác định'}
                  </span>
                  {rA && rB && rA > rB && (
                    <span className="text-xs font-bold text-emerald-700">
                      Lớn hơn (+{rA - rB} pm)
                    </span>
                  )}
                </div>
                {rA && (
                  <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-sky-600 rounded-full"
                      style={{ width: `${Math.min(100, Math.round((rA / 280) * 100))}%` }}
                    />
                  </div>
                )}
              </td>
              <td className="py-3.5 px-4">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-mono text-base font-extrabold text-indigo-700 tabular-nums">
                    {rB ? `${rB} pm` : 'Chưa xác định'}
                  </span>
                  {rA && rB && rB > rA && (
                    <span className="text-xs font-bold text-emerald-700">
                      Lớn hơn (+{rB - rA} pm)
                    </span>
                  )}
                </div>
                {rB && (
                  <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-indigo-600 rounded-full"
                      style={{ width: `${Math.min(100, Math.round((rB / 280) * 100))}%` }}
                    />
                  </div>
                )}
              </td>
            </tr>

            {/* 6. Độ âm điện Pauling */}
            <tr className="hover:bg-slate-50">
              <td className="py-3.5 px-4 font-bold text-slate-900 bg-slate-50/70">
                6. Độ âm điện (Thang Pauling)
              </td>
              <td className="py-3.5 px-4">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-mono text-base font-extrabold text-slate-900 tabular-nums">
                    {enA !== null ? enA.toFixed(2) : 'Không xét (Khí hiếm)'}
                  </span>
                  {enA !== null && enB !== null && enA > enB && (
                    <span className="text-xs font-bold text-amber-700">
                      Độ âm điện lớn hơn
                    </span>
                  )}
                </div>
                {enA !== null && (
                  <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-amber-500 rounded-full"
                      style={{ width: `${Math.min(100, Math.round((enA / 4.0) * 100))}%` }}
                    />
                  </div>
                )}
              </td>
              <td className="py-3.5 px-4">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-mono text-base font-extrabold text-slate-900 tabular-nums">
                    {enB !== null ? enB.toFixed(2) : 'Không xét (Khí hiếm)'}
                  </span>
                  {enA !== null && enB !== null && enB > enA && (
                    <span className="text-xs font-bold text-amber-700">
                      Độ âm điện lớn hơn
                    </span>
                  )}
                </div>
                {enB !== null && (
                  <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-amber-500 rounded-full"
                      style={{ width: `${Math.min(100, Math.round((enB / 4.0) * 100))}%` }}
                    />
                  </div>
                )}
              </td>
            </tr>

            {/* 7. Phân loại & Tính chất hóa học đặc trưng */}
            <tr className="hover:bg-slate-50">
              <td className="py-3 px-4 font-semibold text-slate-700 bg-slate-50/70">
                7. Phân loại & Bản chất
              </td>
              <td className="py-3 px-4">
                <span className="font-bold text-slate-900">{categoryLabel(elementA.category)}</span> ·{' '}
                <span className="text-slate-600">{elementA.subCategory}</span> ·{' '}
                <span className="font-mono text-xs text-slate-500">M = {elementA.atomicMass} amu</span>
              </td>
              <td className="py-3 px-4">
                <span className="font-bold text-slate-900">{categoryLabel(elementB.category)}</span> ·{' '}
                <span className="text-slate-600">{elementB.subCategory}</span> ·{' '}
                <span className="font-mono text-xs text-slate-500">M = {elementB.atomicMass} amu</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Automatic Conclusion Box */}
      <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200 space-y-2 text-xs sm:text-sm text-emerald-950">
        <div className="font-extrabold flex items-center gap-2 text-emerald-900">
          <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
          <span>Kết luận tự động khi đối chiếu {elementA.symbol} và {elementB.symbol}:</span>
        </div>
        <ul className="list-disc pl-5 space-y-1 text-slate-800">
          <li>
            <strong>Về bán kính nguyên tử:</strong> {getRadiusComparisonText()}
          </li>
          <li>
            <strong>Về độ âm điện:</strong> {getElectronegativityComparisonText()}
          </li>
        </ul>
      </div>
    </div>
  );
};
