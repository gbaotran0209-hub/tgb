import React, { useEffect, useRef, useState, useMemo } from 'react';
import { ChemicalElement, ELEMENT_BY_Z } from '../data/elements';
import { Flame, Sparkles, Eye } from 'lucide-react';

export interface SpectralLine {
  wavelength: number; // nm (380 - 760)
  intensity: number; // 0.2 - 1.0
  label?: string; // e.g., "D₁", "Hα"
  transition?: string; // e.g., "3p → 3s"
}

export interface ElementSpectrumProfile {
  flameName: string;
  flameViDesc: string;
  excitationType: 'flame' | 'discharge' | 'arc';
  primaryHex: string;
  secondaryHex: string;
  coreHex: string;
  dominantWavelength: number;
  quantumNote: string;
  lines: SpectralLine[];
}

export function wavelengthToRgb(wavelength: number): { r: number; g: number; b: number; css: string } {
  let r = 0;
  let g = 0;
  let b = 0;
  const wl = Math.max(380, Math.min(760, wavelength));
  if (wl >= 380 && wl < 440) {
    r = -(wl - 440) / (440 - 380);
    g = 0;
    b = 1;
  } else if (wl >= 440 && wl < 490) {
    r = 0;
    g = (wl - 440) / (490 - 440);
    b = 1;
  } else if (wl >= 490 && wl < 510) {
    r = 0;
    g = 1;
    b = -(wl - 510) / (510 - 490);
  } else if (wl >= 510 && wl < 580) {
    r = (wl - 510) / (580 - 510);
    g = 1;
    b = 0;
  } else if (wl >= 580 && wl < 645) {
    r = 1;
    g = -(wl - 645) / (645 - 580);
    b = 0;
  } else if (wl >= 645 && wl <= 760) {
    r = 1;
    g = 0;
    b = 0;
  }

  let factor = 1;
  if (wl >= 380 && wl < 420) {
    factor = 0.45 + (0.55 * (wl - 380)) / (420 - 380);
  } else if (wl > 700 && wl <= 760) {
    factor = 0.45 + (0.55 * (760 - wl)) / (760 - 700);
  }

  const R = Math.round(255 * Math.pow(r * factor, 0.8));
  const G = Math.round(255 * Math.pow(g * factor, 0.8));
  const B = Math.round(255 * Math.pow(b * factor, 0.8));
  return { r: R, g: G, b: B, css: `rgb(${R}, ${G}, ${B})` };
}

const CURATED_SPECTRA: Record<number, ElementSpectrumProfile> = {
  1: {
    flameName: 'Hồng tím Balmer (Phóng điện)',
    flameViDesc: 'Ánh sáng hồng tím đặc trưng của dãy quang phổ Balmer khi phóng điện qua khí Hydrogen.',
    excitationType: 'discharge',
    primaryHex: '#f43f5e',
    secondaryHex: '#a855f7',
    coreHex: '#fda4af',
    dominantWavelength: 656.3,
    quantumNote: 'Dãy Balmer nổi tiếng (electron nhảy từ n ≥ 3 về lớp L n = 2): Hα (656.3 nm đỏ), Hβ (486.1 nm lam), Hγ (434.0 nm chàm), Hδ (410.2 nm tím).',
    lines: [
      { wavelength: 410.2, intensity: 0.65, label: 'Hδ', transition: '6 → 2' },
      { wavelength: 434.0, intensity: 0.78, label: 'Hγ', transition: '5 → 2' },
      { wavelength: 486.1, intensity: 0.92, label: 'Hβ', transition: '4 → 2' },
      { wavelength: 656.3, intensity: 1.0, label: 'Hα', transition: '3 → 2' },
    ],
  },
  2: {
    flameName: 'Vàng cam (Phóng điện Helium)',
    flameViDesc: 'Ánh sáng vàng cam pha hổ phách; vạch vàng D3 (587.6 nm) giúp phát hiện ra Helium trên Mặt Trời năm 1868.',
    excitationType: 'discharge',
    primaryHex: '#fb923c',
    secondaryHex: '#fde047',
    coreHex: '#fef08a',
    dominantWavelength: 587.6,
    quantumNote: 'Vạch vàng rực 587.6 nm (chuyển mức 3d → 2p) là bằng chứng đầu tiên tìm ra Helium trong quang phổ Mặt Trời trước khi thấy trên Trái Đất.',
    lines: [
      { wavelength: 447.1, intensity: 0.75, label: 'He-I', transition: '4d → 2p' },
      { wavelength: 471.3, intensity: 0.55 },
      { wavelength: 501.6, intensity: 0.72, transition: '3p → 2s' },
      { wavelength: 587.6, intensity: 1.0, label: 'D3', transition: '3d → 2p' },
      { wavelength: 667.8, intensity: 0.86, transition: '3d → 2p' },
      { wavelength: 706.5, intensity: 0.68 },
    ],
  },
  3: {
    flameName: 'Đỏ thẫm (Crimson Red)',
    flameViDesc: 'Ngọn lửa đỏ thẫm (carmine) cực kì đặc trưng của kim loại kiềm Lithium.',
    excitationType: 'flame',
    primaryHex: '#e11d48',
    secondaryHex: '#f43f5e',
    coreHex: '#fda4af',
    dominantWavelength: 670.8,
    quantumNote: 'Do electron hóa trị bị kích thích từ 2p về lại 2s, phát ra photon bước sóng 670.8 nm.',
    lines: [
      { wavelength: 460.3, intensity: 0.45, transition: '4d → 2p' },
      { wavelength: 610.4, intensity: 0.76, transition: '3d → 2p' },
      { wavelength: 670.8, intensity: 1.0, label: 'Li-Đỏ', transition: '2p → 2s' },
    ],
  },
  5: {
    flameName: 'Xanh lá sáng (Bright Green)',
    flameViDesc: 'Các hợp chất chứa Boron (như axit boric, muối borat) cháy cho ngọn lửa màu xanh lá cây sáng.',
    excitationType: 'flame',
    primaryHex: '#22c55e',
    secondaryHex: '#4ade80',
    coreHex: '#bbf7d0',
    dominantWavelength: 518.0,
    quantumNote: 'Các phân tử trung gian BO2* trong ngọn lửa phát ra ánh sáng xanh lá 518 nm và 547 nm.',
    lines: [
      { wavelength: 494.0, intensity: 0.6 },
      { wavelength: 518.0, intensity: 1.0, label: 'B-Green' },
      { wavelength: 547.0, intensity: 0.92, label: 'B-II' },
      { wavelength: 579.0, intensity: 0.55 },
    ],
  },
  10: {
    flameName: 'Đỏ cam rực (Đèn Neon)',
    flameViDesc: 'Ánh sáng đỏ cam chói đặc trưng của biển quảng cáo bóng Neon mà không cần phủ huỳnh quang.',
    excitationType: 'discharge',
    primaryHex: '#ff3b1d',
    secondaryHex: '#fb923c',
    coreHex: '#fed7aa',
    dominantWavelength: 640.2,
    quantumNote: 'Hàng chục vạch quang phổ dày đặc trong vùng vàng - cam - đỏ (585 nm đến 703 nm) do chuyển mức electron giữa phân lớp 3p → 3s.',
    lines: [
      { wavelength: 540.1, intensity: 0.48, label: 'Ne-G' },
      { wavelength: 585.2, intensity: 0.92, label: 'Ne-Y', transition: '3p → 3s' },
      { wavelength: 607.4, intensity: 0.8 },
      { wavelength: 614.3, intensity: 0.88 },
      { wavelength: 633.4, intensity: 0.9, label: 'HeNe' },
      { wavelength: 640.2, intensity: 1.0, label: 'Ne-R', transition: '3p → 3s' },
      { wavelength: 650.7, intensity: 0.84 },
      { wavelength: 703.2, intensity: 0.75 },
    ],
  },
  11: {
    flameName: 'Vàng rực (Brilliant Golden Yellow)',
    flameViDesc: 'Ngọn lửa vàng rực sáng, nhạy nhất trong các kim loại kiềm (ứng dụng trong đèn hơi Natri chiếu sáng).',
    excitationType: 'flame',
    primaryHex: '#f59e0b',
    secondaryHex: '#fde047',
    coreHex: '#fef9c3',
    dominantWavelength: 589.0,
    quantumNote: 'Cặp vạch kép Natri D-lines (D1 = 589.6 nm và D2 = 589.0 nm) do chuyển mức electron 3p → 3s chiếm hơn 90% cường độ vùng khả kiến.',
    lines: [
      { wavelength: 498.3, intensity: 0.35 },
      { wavelength: 568.8, intensity: 0.52, transition: '4d → 3p' },
      { wavelength: 589.0, intensity: 1.0, label: 'D2', transition: '3p(3/2) → 3s' },
      { wavelength: 589.6, intensity: 0.96, label: 'D1', transition: '3p(1/2) → 3s' },
      { wavelength: 616.1, intensity: 0.42 },
    ],
  },
  12: {
    flameName: 'Trắng chói (Blinding Brilliant White)',
    flameViDesc: 'Dây Magnesium cháy trong không khí phát ra ngọn lửa trắng sáng chói mắt nhiệt độ cao (ứng dụng làm pháo sáng).',
    excitationType: 'flame',
    primaryHex: '#38bdf8',
    secondaryHex: '#f8fafc',
    coreHex: '#ffffff',
    dominantWavelength: 518.4,
    quantumNote: 'Cụm 3 vạch lục Fraunhofer b (516.7 nm, 517.3 nm, 518.4 nm) kết hợp quang phổ nhiệt liệt MgO tạo nên ánh sáng trắng chói lòa.',
    lines: [
      { wavelength: 383.8, intensity: 0.85 },
      { wavelength: 457.1, intensity: 0.65 },
      { wavelength: 516.7, intensity: 0.9, label: 'b4' },
      { wavelength: 517.3, intensity: 0.95, label: 'b2' },
      { wavelength: 518.4, intensity: 1.0, label: 'b1', transition: '4s → 3p' },
    ],
  },
  19: {
    flameName: 'Tím hồng / Hoa cà (Lilac Violet)',
    flameViDesc: 'Ngọn lửa màu tím hồng (tím hoa cà), nhận biết rõ nhất khi quan sát qua tấm kính xanh Cobalt lọc ánh vàng.',
    excitationType: 'flame',
    primaryHex: '#c084fc',
    secondaryHex: '#f472b6',
    coreHex: '#f3e8ff',
    dominantWavelength: 404.4,
    quantumNote: 'Sự pha trộn giữa vạch tím (404.4 nm, 404.7 nm: chuyển mức 5p → 4s) và đỏ ngoại (766.5 nm: 4p → 4s) tạo nên sắc tím hoa cà đặc trưng.',
    lines: [
      { wavelength: 404.4, intensity: 1.0, label: 'K-tím', transition: '5p → 4s' },
      { wavelength: 404.7, intensity: 0.92, label: 'K-tím2', transition: '5p → 4s' },
      { wavelength: 580.2, intensity: 0.42 },
      { wavelength: 693.9, intensity: 0.58 },
      { wavelength: 755.0, intensity: 0.98, label: 'K-đỏ', transition: '4p → 4s' },
    ],
  },
  20: {
    flameName: 'Đỏ cam / Đỏ gạch (Brick Orange-Red)',
    flameViDesc: 'Ngọn lửa đỏ cam (màu gạch nung) của hợp chất Canxi, thường dùng chế tạo pháo hoa màu cam rực.',
    excitationType: 'flame',
    primaryHex: '#ea580c',
    secondaryHex: '#fb923c',
    coreHex: '#ffedd5',
    dominantWavelength: 622.0,
    quantumNote: 'Phổ dải phân tử cam-đỏ (616.2 nm, 622.0 nm) kết hợp vạch tím Ca-I (422.7 nm) và vạch lục (553.0 nm).',
    lines: [
      { wavelength: 422.7, intensity: 0.85, label: 'Ca-g', transition: '4p → 4s' },
      { wavelength: 553.0, intensity: 0.68 },
      { wavelength: 616.2, intensity: 0.95, label: 'Ca-O' },
      { wavelength: 622.0, intensity: 1.0, label: 'Ca-R' },
      { wavelength: 649.4, intensity: 0.76 },
    ],
  },
  26: {
    flameName: 'Vàng kim lấp lánh (Gold Sparkling Flame)',
    flameViDesc: 'Bột sắt (Fe) cháy trong ngọn lửa tạo các tia hoa lửa màu vàng cam lấp lánh như que pháo bông cầm tay.',
    excitationType: 'flame',
    primaryHex: '#f59e0b',
    secondaryHex: '#fbbf24',
    coreHex: '#fef3c7',
    dominantWavelength: 527.0,
    quantumNote: 'Nguyên tử Fe có cấu hình phân lớp 3d dở dang tạo hàng trăm vạch quang phổ dày đặc trải khắp vùng lam, lục và vàng.',
    lines: [
      { wavelength: 404.6, intensity: 0.82 },
      { wavelength: 438.4, intensity: 0.9, label: 'Fe-d' },
      { wavelength: 495.8, intensity: 0.78 },
      { wavelength: 527.0, intensity: 1.0, label: 'Fe-E', transition: '3d-4s' },
      { wavelength: 561.6, intensity: 0.72 },
      { wavelength: 619.2, intensity: 0.65 },
    ],
  },
  29: {
    flameName: 'Xanh lục bảo / Lam lục (Emerald Green)',
    flameViDesc: 'Ngọn lửa màu xanh lục bảo pha ánh lam tuyệt đẹp, đặc biệt rực rỡ khi có mặt ion Halide như CuCl2.',
    excitationType: 'flame',
    primaryHex: '#10b981',
    secondaryHex: '#06b6d4',
    coreHex: '#a7f3d0',
    dominantWavelength: 510.6,
    quantumNote: 'Ba vạch quang phổ chính của nguyên tử Cu ở 510.6 nm, 515.3 nm và 521.8 nm (chuyển mức 4p → 4s/3d).',
    lines: [
      { wavelength: 427.5, intensity: 0.68, label: 'CuCl' },
      { wavelength: 465.1, intensity: 0.72 },
      { wavelength: 510.6, intensity: 1.0, label: 'Cu-G1', transition: '4p → 4s' },
      { wavelength: 515.3, intensity: 0.9, label: 'Cu-G2' },
      { wavelength: 521.8, intensity: 0.96, label: 'Cu-G3', transition: '4d → 4p' },
      { wavelength: 578.2, intensity: 0.64 },
    ],
  },
  37: {
    flameName: 'Đỏ tím (Red-Violet)',
    flameViDesc: 'Ngọn lửa màu đỏ tím tạo nên tên gọi của nguyên tố Rubidium (Rubidus = Đỏ sẫm).',
    excitationType: 'flame',
    primaryHex: '#db2777',
    secondaryHex: '#a855f7',
    coreHex: '#fbcfe8',
    dominantWavelength: 420.2,
    quantumNote: 'Cặp vạch tím đậm (420.2 nm, 421.6 nm: 6p → 5s) và các vạch đỏ sẫm (740 - 760 nm).',
    lines: [
      { wavelength: 420.2, intensity: 1.0, label: 'Rb-V1', transition: '6p → 5s' },
      { wavelength: 421.6, intensity: 0.9, label: 'Rb-V2' },
      { wavelength: 620.6, intensity: 0.68 },
      { wavelength: 629.8, intensity: 0.82 },
      { wavelength: 740.8, intensity: 0.95, label: 'Rb-R' },
    ],
  },
  38: {
    flameName: 'Đỏ tươi / Đỏ son (Scarlet Red)',
    flameViDesc: 'Ngọn lửa đỏ tươi rực rỡ chế tạo trong pháo hoa và pháo hiệu cứu hộ hàng hải.',
    excitationType: 'flame',
    primaryHex: '#ef4444',
    secondaryHex: '#f97316',
    coreHex: '#fecaca',
    dominantWavelength: 650.4,
    quantumNote: 'Cụm vạch đỏ 640 nm đến 707 nm kết hợp vạch lam-tím 460.7 nm (chuyển mức 5p → 5s).',
    lines: [
      { wavelength: 460.7, intensity: 0.88, label: 'Sr-B', transition: '5p → 5s' },
      { wavelength: 606.0, intensity: 0.72 },
      { wavelength: 640.8, intensity: 0.92 },
      { wavelength: 650.4, intensity: 1.0, label: 'Sr-R1' },
      { wavelength: 687.8, intensity: 0.96, label: 'Sr-R2' },
      { wavelength: 707.0, intensity: 0.84 },
    ],
  },
  55: {
    flameName: 'Xanh tím / Lam da trời (Sky Blue-Violet)',
    flameViDesc: 'Ngọn lửa màu xanh lam pha tím; tên gọi Caesium xuất phát từ tiếng Latinh "Caesius" nghĩa là màu xanh bầu trời.',
    excitationType: 'flame',
    primaryHex: '#6366f1',
    secondaryHex: '#38bdf8',
    coreHex: '#e0e7ff',
    dominantWavelength: 455.5,
    quantumNote: 'Cặp vạch lam rực rỡ 455.5 nm và 459.3 nm (chuyển mức 7p → 6s) mang lại màu xanh da trời pha tím đặc sắc nhất.',
    lines: [
      { wavelength: 455.5, intensity: 1.0, label: 'Cs-Lam1', transition: '7p → 6s' },
      { wavelength: 459.3, intensity: 0.92, label: 'Cs-Lam2', transition: '7p → 6s' },
      { wavelength: 601.0, intensity: 0.64 },
      { wavelength: 621.3, intensity: 0.72 },
      { wavelength: 672.3, intensity: 0.8 },
    ],
  },
  56: {
    flameName: 'Lục vàng / Xanh táo (Apple Green)',
    flameViDesc: 'Ngọn lửa màu xanh lục pha vàng (màu xanh táo tây), nguyên tố duy nhất tạo màu xanh lục này cho pháo hoa.',
    excitationType: 'flame',
    primaryHex: '#84cc16',
    secondaryHex: '#22c55e',
    coreHex: '#ecfccb',
    dominantWavelength: 553.5,
    quantumNote: 'Vạch phổ nguyên tử Ba-I cực mạnh ở 553.5 nm (chuyển mức 6p → 6s) cùng các dải phân tử 513 nm và 524 nm.',
    lines: [
      { wavelength: 455.4, intensity: 0.78, label: 'Ba-B' },
      { wavelength: 493.4, intensity: 0.74 },
      { wavelength: 513.7, intensity: 0.85 },
      { wavelength: 524.2, intensity: 0.92, label: 'Ba-G1' },
      { wavelength: 553.5, intensity: 1.0, label: 'Ba-G2', transition: '6p → 6s' },
      { wavelength: 614.2, intensity: 0.65 },
    ],
  },
};

export function getElementSpectrumProfile(el: ChemicalElement): ElementSpectrumProfile {
  if (CURATED_SPECTRA[el.atomicNumber]) {
    return CURATED_SPECTRA[el.atomicNumber];
  }

  const z = el.atomicNumber;
  if (el.category === 'noble_gas') {
    const nobleProfiles: Record<number, { name: string; hex: string; hex2: string; wl: number }> = {
      18: { name: 'Tím hồng (Phóng điện Argon)', hex: '#818cf8', hex2: '#c084fc', wl: 451.1 },
      36: { name: 'Trắng lục nhạt (Phóng điện Krypton)', hex: '#34d399', hex2: '#a7f3d0', wl: 557.0 },
      54: { name: 'Lam tím chói (Phóng điện Xenon)', hex: '#38bdf8', hex2: '#818cf8', wl: 467.1 },
      86: { name: 'Đỏ cam phát quang (Khí Radon)', hex: '#fb7185', hex2: '#fda4af', wl: 645.0 },
      118: { name: 'Quang phổ tính toán lý thuyết (Oganesson)', hex: '#a855f7', hex2: '#38bdf8', wl: 480.0 },
    };
    const np = nobleProfiles[z] || { name: 'Phóng điện khí hiếm', hex: '#38bdf8', hex2: '#818cf8', wl: 480.0 };
    return {
      flameName: np.name,
      flameViDesc: `Khi có điện thế cao phóng qua ống chứa khí hiếm ${el.name} (${el.symbol}), các nguyên tử phát sáng màu đặc trưng và cho quang phổ vạch sắc nét.`,
      excitationType: 'discharge',
      primaryHex: np.hex,
      secondaryHex: np.hex2,
      coreHex: '#e0f2fe',
      dominantWavelength: np.wl,
      quantumNote: `Các electron lớp ngoài của ${el.symbol} bị kích thích bởi điện trường cao lên các mức năng lượng cao rồi nhảy về, phát ra vạch quang phổ đặc trưng.`,
      lines: [
        { wavelength: 420 + (z % 35), intensity: 0.85 },
        { wavelength: np.wl, intensity: 1.0, label: `${el.symbol}-α` },
        { wavelength: 555 + (z % 40), intensity: 0.78 },
        { wavelength: 630 + (z % 55), intensity: 0.9 },
      ],
    };
  }

  if (el.category === 'nonmetal') {
    const isHalogen = el.groupRoman === 'VIIA';
    const primaryHex = isHalogen ? '#34d399' : '#38bdf8';
    const secondaryHex = isHalogen ? '#fde047' : '#818cf8';
    const domWl = isHalogen ? 520 + (z % 45) : 475 + (z % 90);
    return {
      flameName: isHalogen
        ? `Quang phổ kích thích Halogen (${el.symbol})`
        : `Quang phổ hồ quang / phóng điện (${el.symbol})`,
      flameViDesc: `Nguyên tố phi kim ${el.name} (${el.vietnameseName}) khi kích thích bằng hồ quang điện hoặc phóng điện phát ra hệ vạch quang phổ nguyên tử đặc trưng.`,
      excitationType: 'discharge',
      primaryHex,
      secondaryHex,
      coreHex: '#e0f2fe',
      dominantWavelength: domWl,
      quantumNote: `Các electron hóa trị thuộc phân lớp ${el.block} (${el.electronConfig}) khi chuyển mức năng lượng phát ra các vạch bức xạ tạo nên "vân tay quang học" của ${el.symbol}.`,
      lines: [
        { wavelength: 412 + ((z * 7) % 45), intensity: 0.74 },
        { wavelength: domWl, intensity: 1.0, label: `${el.symbol}-I` },
        { wavelength: 565 + ((z * 11) % 50), intensity: 0.82 },
        { wavelength: 642 + ((z * 13) % 60), intensity: 0.88, label: `${el.symbol}-II` },
      ],
    };
  }

  const metalPalettes = [
    { name: 'Lam trắng rực (Hồ quang kim loại)', hex: '#38bdf8', hex2: '#60a5fa', wl: 468 },
    { name: 'Lục lam ánh kim (Flame & Arc)', hex: '#14b8a6', hex2: '#38bdf8', wl: 505 },
    { name: 'Vàng cam kim loại (Hồ quang nhiệt)', hex: '#f59e0b', hex2: '#fbbf24', wl: 578 },
    { name: 'Tím lam rực (Quang phổ nguyên tử)', hex: '#818cf8', hex2: '#c084fc', wl: 442 },
  ];
  const pick = metalPalettes[z % metalPalettes.length];
  const wl1 = 410 + ((z * 9) % 50);
  const wl2 = pick.wl + ((z * 5) % 25);
  const wl3 = 540 + ((z * 7) % 55);
  const wl4 = 615 + ((z * 11) % 70);
  return {
    flameName: pick.name,
    flameViDesc: `Khi nung nóng ở nhiệt độ cao hoặc kích thích bằng hồ quang, nguyên tử kim loại ${el.name} (${el.vietnameseName}) phát ra bộ vạch quang phổ đặc trưng.`,
    excitationType: 'arc',
    primaryHex: pick.hex,
    secondaryHex: pick.hex2,
    coreHex: '#f0f9ff',
    dominantWavelength: wl2,
    quantumNote: `Mỗi vạch sáng trên quang phổ ứng với sự chuyển dịch của electron hóa trị (${el.electronConfig}) từ trạng thái kích thích về trạng thái năng lượng thấp hơn.`,
    lines: [
      { wavelength: wl1, intensity: 0.76 },
      { wavelength: wl2, intensity: 1.0, label: `${el.symbol}-α` },
      { wavelength: wl3, intensity: 0.86, label: `${el.symbol}-β` },
      { wavelength: wl4, intensity: 0.72 },
    ],
  };
}

export const FAMOUS_FLAME_ELEMENTS_Z = [3, 11, 19, 20, 38, 56, 29, 5, 55, 1, 10];

interface FlameAndSpectrumLabProps {
  element: ChemicalElement;
  onSelectElement?: (el: ChemicalElement) => void;
}

interface SparkParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  life: number;
  maxLife: number;
  color: string;
}

export const FlameAndSpectrumLab: React.FC<FlameAndSpectrumLabProps> = ({
  element,
  onSelectElement,
}) => {
  const profile = useMemo(() => getElementSpectrumProfile(element), [element]);
  const [sampleInFlame, setSampleInFlame] = useState<boolean>(true);
  const [spectrumMode, setSpectrumMode] = useState<'emission' | 'absorption'>('emission');
  const [selectedLine, setSelectedLine] = useState<SpectralLine | null>(null);
  const [burstBoost, setBurstBoost] = useState<number>(0);

  const flameCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const sparksRef = useRef<SparkParticle[]>([]);

  useEffect(() => {
    const brightest =
      [...profile.lines].sort((a, b) => b.intensity - a.intensity)[0] || profile.lines[0] || null;
    setSelectedLine(brightest);
    setSampleInFlame(true);
    setBurstBoost(1.0);
  }, [element, profile]);

  const handleTriggerBurst = () => {
    setSampleInFlame(true);
    setBurstBoost(1.6);
    for (let i = 0; i < 24; i++) {
      sparksRef.current.push({
        x: 115 + (Math.random() - 0.5) * 26,
        y: 122 + (Math.random() - 0.5) * 18,
        vx: (Math.random() - 0.5) * 75,
        vy: -55 - Math.random() * 85,
        size: 1.5 + Math.random() * 2.5,
        life: 0,
        maxLife: 0.45 + Math.random() * 0.55,
        color: Math.random() > 0.4 ? profile.primaryHex : profile.coreHex,
      });
    }
  };

  useEffect(() => {
    const canvas = flameCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let lastTime = performance.now();
    let elapsed = 0;

    const renderFlame = (now: number) => {
      const dt = Math.min(0.05, (now - lastTime) / 1000);
      lastTime = now;
      elapsed += dt;

      if (burstBoost > 0) {
        setBurstBoost((prev) => Math.max(0, prev - dt * 0.9));
      }

      const dpr = window.devicePixelRatio || 1;
      const w = 230;
      const h = 195;

      if (canvas.width !== w * dpr || canvas.height !== h * dpr) {
        canvas.width = w * dpr;
        canvas.height = h * dpr;
      }

      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, w, h);

      const cx = w / 2;
      const burnerTopY = 160;

      const activePrimary = sampleInFlame ? profile.primaryHex : '#0284c7';
      const activeSecondary = sampleInFlame ? profile.secondaryHex : '#38bdf8';
      const activeCore = sampleInFlame ? profile.coreHex : '#e0f2fe';

      const ambientGrad = ctx.createRadialGradient(cx, 96, 8, cx, 96, 92);
      ambientGrad.addColorStop(0, `${activePrimary}55`);
      ambientGrad.addColorStop(0.5, `${activeSecondary}22`);
      ambientGrad.addColorStop(1, 'rgba(15, 23, 42, 0)');
      ctx.fillStyle = ambientGrad;
      ctx.fillRect(0, 0, w, h);

      const layers = [
        { width: 38, height: 122, color: activePrimary, alpha: sampleInFlame ? 0.52 : 0.35, speed: 5.2 },
        { width: 29, height: 104, color: activeSecondary, alpha: sampleInFlame ? 0.72 : 0.5, speed: 6.8 },
        { width: 19, height: 80, color: activeCore, alpha: 0.9, speed: 8.5 },
      ];

      layers.forEach((layer, idx) => {
        const sway1 = Math.sin(elapsed * layer.speed + idx) * 4.5;
        const sway2 = Math.cos(elapsed * (layer.speed * 1.3) + idx * 2) * 3.2;
        const tipX = cx + sway1 + sway2 * 0.5;
        const tipY = burnerTopY - layer.height - Math.sin(elapsed * 9 + idx) * 4;

        ctx.save();
        ctx.beginPath();
        ctx.moveTo(cx - layer.width * 0.45, burnerTopY);
        ctx.bezierCurveTo(
          cx - layer.width * 0.85 + sway2,
          burnerTopY - layer.height * 0.35,
          cx - layer.width * 0.45 + sway1,
          burnerTopY - layer.height * 0.75,
          tipX,
          tipY
        );
        ctx.bezierCurveTo(
          cx + layer.width * 0.45 + sway1,
          burnerTopY - layer.height * 0.75,
          cx + layer.width * 0.85 - sway2,
          burnerTopY - layer.height * 0.35,
          cx + layer.width * 0.45,
          burnerTopY
        );
        ctx.closePath();

        const fGrad = ctx.createLinearGradient(cx, burnerTopY, cx, tipY);
        fGrad.addColorStop(0, 'rgba(56, 189, 248, 0.45)');
        fGrad.addColorStop(0.28, layer.color);
        fGrad.addColorStop(0.85, layer.color);
        fGrad.addColorStop(1, 'rgba(255,255,255,0)');

        ctx.globalAlpha = layer.alpha;
        ctx.shadowColor = layer.color;
        ctx.shadowBlur = sampleInFlame ? 18 : 10;
        ctx.fillStyle = fGrad;
        ctx.fill();
        ctx.restore();
      });

      ctx.save();
      ctx.beginPath();
      const innerTipX = cx + Math.sin(elapsed * 10) * 1.2;
      const innerTipY = burnerTopY - 40;
      ctx.moveTo(cx - 9, burnerTopY);
      ctx.quadraticCurveTo(cx - 11, burnerTopY - 20, innerTipX, innerTipY);
      ctx.quadraticCurveTo(cx + 11, burnerTopY - 20, cx + 9, burnerTopY);
      ctx.closePath();

      const coneGrad = ctx.createLinearGradient(cx, burnerTopY, cx, innerTipY);
      coneGrad.addColorStop(0, 'rgba(14, 165, 233, 0.92)');
      coneGrad.addColorStop(0.7, 'rgba(125, 211, 252, 0.85)');
      coneGrad.addColorStop(1, 'rgba(224, 242, 254, 0.2)');
      ctx.fillStyle = coneGrad;
      ctx.fill();
      ctx.restore();

      if (sampleInFlame) {
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(w - 8, 108);
        ctx.lineTo(cx + 6, 118);
        ctx.strokeStyle = '#94a3b8';
        ctx.lineWidth = 2.2;
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(cx + 2, 118, 4.5, 0, Math.PI * 2);
        ctx.fillStyle = activeCore;
        ctx.shadowColor = activePrimary;
        ctx.shadowBlur = 12;
        ctx.fill();
        ctx.strokeStyle = '#e2e8f0';
        ctx.lineWidth = 1.4;
        ctx.stroke();
        ctx.restore();
      }

      if (sampleInFlame && Math.random() < 0.45) {
        sparksRef.current.push({
          x: cx + (Math.random() - 0.5) * 22,
          y: burnerTopY - 28 - Math.random() * 45,
          vx: (Math.random() - 0.5) * 24,
          vy: -38 - Math.random() * 48,
          size: 1.2 + Math.random() * 2.0,
          life: 0,
          maxLife: 0.5 + Math.random() * 0.5,
          color: Math.random() > 0.35 ? activePrimary : activeCore,
        });
      }

      sparksRef.current = sparksRef.current.filter((sp) => {
        sp.life += dt;
        if (sp.life >= sp.maxLife) return false;
        sp.x += sp.vx * dt + Math.sin(elapsed * 8 + sp.y * 0.1) * 0.35;
        sp.y += sp.vy * dt;
        const alpha = 1 - sp.life / sp.maxLife;

        ctx.save();
        ctx.beginPath();
        ctx.arc(sp.x, sp.y, sp.size, 0, Math.PI * 2);
        ctx.fillStyle = sp.color;
        ctx.globalAlpha = alpha;
        ctx.shadowColor = sp.color;
        ctx.shadowBlur = 6;
        ctx.fill();
        ctx.restore();
        return true;
      });

      ctx.save();
      const barrelGrad = ctx.createLinearGradient(cx - 14, burnerTopY, cx + 14, burnerTopY);
      barrelGrad.addColorStop(0, '#334155');
      barrelGrad.addColorStop(0.45, '#94a3b8');
      barrelGrad.addColorStop(1, '#1e293b');

      ctx.fillStyle = '#cbd5e1';
      ctx.fillRect(cx - 13, burnerTopY - 2, 26, 4);

      ctx.fillStyle = barrelGrad;
      ctx.fillRect(cx - 11, burnerTopY + 2, 22, 32);

      ctx.fillStyle = '#0f172a';
      ctx.fillRect(cx - 5, burnerTopY + 14, 10, 7);
      ctx.restore();

      ctx.restore();
      animId = requestAnimationFrame(renderFlame);
    };

    animId = requestAnimationFrame(renderFlame);
    return () => cancelAnimationFrame(animId);
  }, [profile, sampleInFlame, burstBoost]);

  const calcPhotonEnergyEv = (wl: number) => (1239.84 / wl).toFixed(2);

  return (
    <div className="mt-4 pt-4 border-t border-slate-200/90">
      <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-white rounded-2xl p-4 sm:p-5 border border-slate-800 shadow-lg space-y-4">
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-3 pb-3 border-b border-white/10">
          <div className="flex items-start sm:items-center gap-2.5">
            <span
              className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-md border border-white/20"
              style={{
                background: `linear-gradient(135deg, ${profile.primaryHex}, ${profile.secondaryHex})`,
              }}
            >
              <Flame className="w-5 h-5 text-white drop-shadow" />
            </span>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-display text-sm sm:text-base font-extrabold text-white">
                  Thử Nghiệm Màu Ngọn Lửa & Quang Phổ ({element.symbol})
                </h3>
                <span className="text-[11px] font-mono text-sky-300 font-bold">
                  λ ≈ {profile.dominantWavelength} nm • {calcPhotonEnergyEv(profile.dominantWavelength)} eV
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Mỗi nguyên tố khi bị kích thích nhiệt phát ra màu ngọn lửa và vạch quang phổ duy nhất như &ldquo;vân tay quang học&rdquo;.
              </p>
            </div>
          </div>

          {onSelectElement && (
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[11px] font-bold text-slate-300 mr-1">
                Thử nhanh:
              </span>
              {FAMOUS_FLAME_ELEMENTS_Z.map((z) => {
                const famEl = ELEMENT_BY_Z[z];
                const famProf = getElementSpectrumProfile(famEl);
                const isCurrent = element.atomicNumber === z;
                return (
                  <button
                    key={z}
                    type="button"
                    onClick={() => onSelectElement(famEl)}
                    className={`px-2 py-1 rounded-lg text-[11px] font-mono font-bold transition-all cursor-pointer flex items-center gap-1.5 border ${
                      isCurrent
                        ? 'bg-white text-slate-950 border-white shadow-sm scale-105'
                        : 'bg-white/10 hover:bg-white/20 text-white border-white/15'
                    }`}
                  >
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{
                        backgroundColor: famProf.primaryHex,
                        boxShadow: `0 0 6px ${famProf.primaryHex}`,
                      }}
                    />
                    <span>{famEl.symbol}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5 items-stretch">
          <div className="lg:col-span-5 bg-slate-950/80 border border-white/10 rounded-xl p-3.5 sm:p-4 flex flex-col justify-between gap-3">
            <div className="flex items-center justify-between gap-2">
              <div>
                <span className="text-[11px] font-bold text-amber-300 uppercase tracking-wider block">
                  {profile.excitationType === 'flame'
                    ? '1. Ngọn lửa Bunsen'
                    : profile.excitationType === 'discharge'
                    ? '1. Kích thích phóng điện'
                    : '1. Kích thích hồ quang nhiệt'}
                </span>
                <div className="font-display text-sm sm:text-base font-extrabold text-white mt-0.5 flex items-center gap-2">
                  <span
                    className="w-3 h-3 rounded-full shrink-0"
                    style={{
                      backgroundColor: sampleInFlame ? profile.primaryHex : '#38bdf8',
                      boxShadow: `0 0 10px ${sampleInFlame ? profile.primaryHex : '#38bdf8'}`,
                    }}
                  />
                  <span>
                    {sampleInFlame ? profile.flameName : 'Ngọn lửa xanh Bunsen (Chưa nhúng)'}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setSampleInFlame((prev) => !prev)}
                  className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold transition-colors cursor-pointer border ${
                    sampleInFlame
                      ? 'bg-amber-500/20 text-amber-200 border-amber-400/50 hover:bg-amber-500/30'
                      : 'bg-sky-500 text-slate-950 border-sky-400 hover:bg-sky-400'
                  }`}
                >
                  {sampleInFlame ? 'Rút dây Pt ra' : 'Nhúng dây Pt'}
                </button>
                <button
                  type="button"
                  onClick={handleTriggerBurst}
                  title="Phun thêm mẫu muối vào ngọn lửa"
                  className="px-2.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-[11px] font-bold border border-white/15 transition-colors cursor-pointer inline-flex items-center gap-1"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  <span>Bùng lửa</span>
                </button>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3.5 bg-slate-900/90 rounded-xl p-2.5 border border-white/5">
              <div className="relative shrink-0 flex flex-col items-center">
                <canvas
                  ref={flameCanvasRef}
                  width={230}
                  height={195}
                  onClick={handleTriggerBurst}
                  className="w-[195px] h-[165px] cursor-pointer select-none"
                  title="Bấm vào ngọn lửa để kích thích hạt photon"
                />
                <span className="text-[10px] text-slate-300 -mt-1 font-medium">
                  Bấm vào ngọn lửa để kích thích hạt photon
                </span>
              </div>
              <div className="flex-1 space-y-2 text-xs">
                <div className="p-2.5 rounded-lg bg-white/5 border border-white/10 text-slate-200 leading-relaxed">
                  {profile.flameViDesc}
                </div>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-300 font-mono">
                  <span>
                    Mẫu thử: <strong className="text-white">Ion {element.symbol}</strong>
                  </span>
                  <span>•</span>
                  <span>
                    Dây thử: <strong className="text-sky-300">Platin (Pt)</strong>
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 bg-slate-950/80 border border-white/10 rounded-xl p-3.5 sm:p-4 flex flex-col justify-between gap-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <span className="text-[11px] font-bold text-sky-300 uppercase tracking-wider block">
                  2. Máy Quang Phổ Lăng Kính (380 nm - 750 nm)
                </span>
                <div className="font-display text-sm sm:text-base font-extrabold text-white mt-0.5">
                  Dãy Quang Phổ Vạch Của {element.name} ({element.symbol})
                </div>
              </div>

              <div className="flex items-center gap-1 bg-white/10 p-1 rounded-lg">
                <button
                  type="button"
                  onClick={() => setSpectrumMode('emission')}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-colors cursor-pointer ${
                    spectrumMode === 'emission'
                      ? 'bg-sky-500 text-slate-950'
                      : 'text-slate-200 hover:text-white'
                  }`}
                >
                  Phát xạ
                </button>
                <button
                  type="button"
                  onClick={() => setSpectrumMode('absorption')}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-colors cursor-pointer ${
                    spectrumMode === 'absorption'
                      ? 'bg-sky-500 text-slate-950'
                      : 'text-slate-200 hover:text-white'
                  }`}
                >
                  Hấp thụ
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <div
                className="relative w-full h-20 sm:h-24 rounded-xl overflow-hidden border-2 border-slate-700 select-none"
                style={{
                  background:
                    spectrumMode === 'emission'
                      ? 'linear-gradient(180deg, #05070f 0%, #090d1a 50%, #05070f 100%)'
                      : 'linear-gradient(90deg, #581c87 0%, #4338ca 12%, #0284c7 26%, #10b981 42%, #84cc16 54%, #eab308 66%, #f97316 78%, #ef4444 90%, #7f1d1d 100%)',
                }}
              >
                {spectrumMode === 'emission' && (
                  <div
                    className="absolute bottom-0 inset-x-0 h-1.5 opacity-60"
                    style={{
                      background:
                        'linear-gradient(90deg, #581c87 0%, #4338ca 12%, #0284c7 26%, #10b981 42%, #84cc16 54%, #eab308 66%, #f97316 78%, #ef4444 90%, #7f1d1d 100%)',
                    }}
                  />
                )}

                {profile.lines.map((line, idx) => {
                  const pct = ((line.wavelength - 380) / (760 - 380)) * 100;
                  const clampedPct = Math.max(2, Math.min(98, pct));
                  const rgb = wavelengthToRgb(line.wavelength);
                  const isSelected = selectedLine?.wavelength === line.wavelength;
                  return (
                    <button
                      key={`${line.wavelength}-${idx}`}
                      type="button"
                      onClick={() => setSelectedLine(line)}
                      onMouseEnter={() => setSelectedLine(line)}
                      style={{ left: `${clampedPct}%` }}
                      className="group absolute top-0 bottom-0 -translate-x-1/2 px-2 cursor-pointer focus:outline-none"
                      title={`Bước sóng = ${line.wavelength} nm (${calcPhotonEnergyEv(line.wavelength)} eV)`}
                    >
                      {spectrumMode === 'emission' ? (
                        <span
                          className={`block h-full transition-all ${
                            isSelected ? 'w-[4px] scale-x-125' : 'w-[2.5px] group-hover:w-[4px]'
                          }`}
                          style={{
                            backgroundColor: rgb.css,
                            opacity: Math.max(0.7, line.intensity),
                            boxShadow: isSelected
                              ? `0 0 16px 4px ${rgb.css}, 0 0 6px 2px #ffffff`
                              : `0 0 10px 2px ${rgb.css}`,
                          }}
                        />
                      ) : (
                        <span
                          className={`block h-full bg-slate-950 transition-all ${
                            isSelected
                              ? 'w-[4px] ring-1 ring-white'
                              : 'w-[2.5px] opacity-90 group-hover:w-[4px]'
                          }`}
                        />
                      )}
                      <span
                        className={`pointer-events-none absolute top-1.5 left-1/2 -translate-x-1/2 px-1.5 py-0.5 rounded text-[10px] font-mono font-extrabold whitespace-nowrap transition-opacity ${
                          isSelected
                            ? 'opacity-100 bg-slate-900/95 text-white border border-white/30 shadow-md z-20'
                            : 'opacity-0 group-hover:opacity-100 bg-slate-900/90 text-white z-10'
                        }`}
                      >
                        {line.label ? `${line.label}: ` : ''}
                        {line.wavelength} nm
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center justify-between text-[10px] font-mono font-bold text-slate-300 px-1">
                <span className="text-purple-300">380 nm (Tím)</span>
                <span className="text-indigo-300">450 nm (Lam)</span>
                <span className="text-emerald-300">530 nm (Lục)</span>
                <span className="text-amber-300">590 nm (Vàng)</span>
                <span className="text-orange-300">630 nm (Cam)</span>
                <span className="text-rose-300">750 nm (Đỏ)</span>
              </div>
            </div>

            <div className="space-y-2.5">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-[11px] font-bold text-slate-300 mr-1 flex items-center gap-1">
                  <Eye className="w-3.5 h-3.5 text-sky-400" />
                  <span>Các vạch phổ chính:</span>
                </span>
                {profile.lines.map((line, i) => {
                  const rgb = wavelengthToRgb(line.wavelength);
                  const active = selectedLine?.wavelength === line.wavelength;
                  return (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setSelectedLine(line)}
                      className={`px-2 py-1 rounded-lg text-[11px] font-mono font-bold transition-all cursor-pointer flex items-center gap-1.5 border ${
                        active
                          ? 'bg-white text-slate-950 border-white shadow-xs'
                          : 'bg-white/10 hover:bg-white/15 text-white border-white/15'
                      }`}
                    >
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{
                          backgroundColor: rgb.css,
                          boxShadow: `0 0 6px ${rgb.css}`,
                        }}
                      />
                      <span>
                        {line.label ? `${line.label} (${line.wavelength} nm)` : `${line.wavelength} nm`}
                      </span>
                      {line.transition && (
                        <span className={active ? 'text-slate-700' : 'text-sky-300'}>
                          [{line.transition}]
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="p-2.5 sm:p-3 rounded-xl bg-white/5 border border-white/10 text-xs text-slate-200 leading-relaxed flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                <div className="flex-1">
                  <strong className="text-sky-300">Giải thích cơ lượng tử: </strong>
                  {profile.quantumNote}
                </div>
                {selectedLine && (
                  <div className="shrink-0 sm:border-l border-white/15 sm:pl-3 flex items-center gap-3 font-mono text-[11px]">
                    <div>
                      <span className="text-slate-400 block">Bước sóng đang chọn</span>
                      <strong className="text-white text-xs">
                        λ = {selectedLine.wavelength} nm
                      </strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Năng lượng photon</span>
                      <strong className="text-amber-300 text-xs">
                        E = {calcPhotonEnergyEv(selectedLine.wavelength)} eV
                      </strong>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
