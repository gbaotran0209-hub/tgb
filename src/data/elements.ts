export type ElementCategory = 'metal' | 'nonmetal' | 'noble_gas';

export type ElementBlock = 's' | 'p' | 'd' | 'f';

export interface ChemicalElement {
  atomicNumber: number;
  symbol: string;
  name: string;
  vietnameseName: string;
  atomicMass: string;
  period: number; // 1..7
  column: number; // 1..18 (3 for Lanthanides/Actinides)
  fBlockRow?: 'lanthanide' | 'actinide';
  fBlockIndex?: number; // 1..15
  groupRoman: string; // IA..VIIIA, IB..VIIIB
  groupType: 'A' | 'B';
  block: ElementBlock;
  category: ElementCategory;
  subCategory: string;
  electronConfig: string; // e.g. [Ne] 3s¹
  fullElectronConfig: string;
  shells: number[]; // electrons per shell K, L, M, N, O, P, Q
  valenceElectrons: number;
  atomicRadius: number | null; // in picometers (pm)
  electronegativity: number | null; // Pauling scale
}

interface RawElementTuple {
  z: number;
  sym: string;
  name: string;
  vi: string;
  mass: string;
  period: number;
  col: number;
  block: ElementBlock;
  cat: ElementCategory;
  subCat: string;
  config: string;
  shells: number[];
  radius: number | null;
  en: number | null;
  fRow?: 'lanthanide' | 'actinide';
  fIdx?: number;
}

const RAW_ELEMENTS: RawElementTuple[] = [
  // Period 1
  { z: 1, sym: 'H', name: 'Hydrogen', vi: 'Hiđro', mass: '1.008', period: 1, col: 1, block: 's', cat: 'nonmetal', subCat: 'Phi kim', config: '1s¹', shells: [1], radius: 37, en: 2.20 },
  { z: 2, sym: 'He', name: 'Helium', vi: 'Heli', mass: '4.0026', period: 1, col: 18, block: 's', cat: 'noble_gas', subCat: 'Khí hiếm', config: '1s²', shells: [2], radius: 31, en: null },

  // Period 2
  { z: 3, sym: 'Li', name: 'Lithium', vi: 'Liti', mass: '6.94', period: 2, col: 1, block: 's', cat: 'metal', subCat: 'Kim loại kiềm', config: '[He] 2s¹', shells: [2, 1], radius: 152, en: 0.98 },
  { z: 4, sym: 'Be', name: 'Beryllium', vi: 'Beri', mass: '9.0122', period: 2, col: 2, block: 's', cat: 'metal', subCat: 'Kim loại kiềm thổ', config: '[He] 2s²', shells: [2, 2], radius: 112, en: 1.57 },
  { z: 5, sym: 'B', name: 'Boron', vi: 'Bo', mass: '10.81', period: 2, col: 13, block: 'p', cat: 'nonmetal', subCat: 'Phi kim (Á kim)', config: '[He] 2s² 2p¹', shells: [2, 3], radius: 85, en: 2.04 },
  { z: 6, sym: 'C', name: 'Carbon', vi: 'Cacbon', mass: '12.011', period: 2, col: 14, block: 'p', cat: 'nonmetal', subCat: 'Phi kim', config: '[He] 2s² 2p²', shells: [2, 4], radius: 77, en: 2.55 },
  { z: 7, sym: 'N', name: 'Nitrogen', vi: 'Nitơ', mass: '14.007', period: 2, col: 15, block: 'p', cat: 'nonmetal', subCat: 'Phi kim', config: '[He] 2s² 2p³', shells: [2, 5], radius: 70, en: 3.04 },
  { z: 8, sym: 'O', name: 'Oxygen', vi: 'Oxi', mass: '15.999', period: 2, col: 16, block: 'p', cat: 'nonmetal', subCat: 'Phi kim', config: '[He] 2s² 2p⁴', shells: [2, 6], radius: 66, en: 3.44 },
  { z: 9, sym: 'F', name: 'Fluorine', vi: 'Flo', mass: '18.998', period: 2, col: 17, block: 'p', cat: 'nonmetal', subCat: 'Phi kim (Halogen)', config: '[He] 2s² 2p⁵', shells: [2, 7], radius: 64, en: 3.98 },
  { z: 10, sym: 'Ne', name: 'Neon', vi: 'Neon', mass: '20.180', period: 2, col: 18, block: 'p', cat: 'noble_gas', subCat: 'Khí hiếm', config: '[He] 2s² 2p⁶', shells: [2, 8], radius: 38, en: null },

  // Period 3
  { z: 11, sym: 'Na', name: 'Sodium', vi: 'Natri', mass: '22.990', period: 3, col: 1, block: 's', cat: 'metal', subCat: 'Kim loại kiềm', config: '[Ne] 3s¹', shells: [2, 8, 1], radius: 186, en: 0.93 },
  { z: 12, sym: 'Mg', name: 'Magnesium', vi: 'Magiê', mass: '24.305', period: 3, col: 2, block: 's', cat: 'metal', subCat: 'Kim loại kiềm thổ', config: '[Ne] 3s²', shells: [2, 8, 2], radius: 160, en: 1.31 },
  { z: 13, sym: 'Al', name: 'Aluminium', vi: 'Nhôm', mass: '26.982', period: 3, col: 13, block: 'p', cat: 'metal', subCat: 'Kim loại nhóm A', config: '[Ne] 3s² 3p¹', shells: [2, 8, 3], radius: 143, en: 1.61 },
  { z: 14, sym: 'Si', name: 'Silicon', vi: 'Silic', mass: '28.085', period: 3, col: 14, block: 'p', cat: 'nonmetal', subCat: 'Phi kim (Á kim)', config: '[Ne] 3s² 3p²', shells: [2, 8, 4], radius: 117, en: 1.90 },
  { z: 15, sym: 'P', name: 'Phosphorus', vi: 'Photpho', mass: '30.974', period: 3, col: 15, block: 'p', cat: 'nonmetal', subCat: 'Phi kim', config: '[Ne] 3s² 3p³', shells: [2, 8, 5], radius: 110, en: 2.19 },
  { z: 16, sym: 'S', name: 'Sulfur', vi: 'Lưu huỳnh', mass: '32.06', period: 3, col: 16, block: 'p', cat: 'nonmetal', subCat: 'Phi kim', config: '[Ne] 3s² 3p⁴', shells: [2, 8, 6], radius: 104, en: 2.58 },
  { z: 17, sym: 'Cl', name: 'Chlorine', vi: 'Clo', mass: '35.45', period: 3, col: 17, block: 'p', cat: 'nonmetal', subCat: 'Phi kim (Halogen)', config: '[Ne] 3s² 3p⁵', shells: [2, 8, 7], radius: 99, en: 3.16 },
  { z: 18, sym: 'Ar', name: 'Argon', vi: 'Agon', mass: '39.948', period: 3, col: 18, block: 'p', cat: 'noble_gas', subCat: 'Khí hiếm', config: '[Ne] 3s² 3p⁶', shells: [2, 8, 8], radius: 71, en: null },

  // Period 4
  { z: 19, sym: 'K', name: 'Potassium', vi: 'Kali', mass: '39.098', period: 4, col: 1, block: 's', cat: 'metal', subCat: 'Kim loại kiềm', config: '[Ar] 4s¹', shells: [2, 8, 8, 1], radius: 227, en: 0.82 },
  { z: 20, sym: 'Ca', name: 'Calcium', vi: 'Canxi', mass: '40.078', period: 4, col: 2, block: 's', cat: 'metal', subCat: 'Kim loại kiềm thổ', config: '[Ar] 4s²', shells: [2, 8, 8, 2], radius: 197, en: 1.00 },
  { z: 21, sym: 'Sc', name: 'Scandium', vi: 'Scanđi', mass: '44.956', period: 4, col: 3, block: 'd', cat: 'metal', subCat: 'Kim loại chuyển tiếp', config: '[Ar] 3d¹ 4s²', shells: [2, 8, 9, 2], radius: 162, en: 1.36 },
  { z: 22, sym: 'Ti', name: 'Titanium', vi: 'Titan', mass: '47.867', period: 4, col: 4, block: 'd', cat: 'metal', subCat: 'Kim loại chuyển tiếp', config: '[Ar] 3d² 4s²', shells: [2, 8, 10, 2], radius: 147, en: 1.54 },
  { z: 23, sym: 'V', name: 'Vanadium', vi: 'Vanađi', mass: '50.942', period: 4, col: 5, block: 'd', cat: 'metal', subCat: 'Kim loại chuyển tiếp', config: '[Ar] 3d³ 4s²', shells: [2, 8, 11, 2], radius: 134, en: 1.63 },
  { z: 24, sym: 'Cr', name: 'Chromium', vi: 'Crom', mass: '51.996', period: 4, col: 6, block: 'd', cat: 'metal', subCat: 'Kim loại chuyển tiếp', config: '[Ar] 3d⁵ 4s¹', shells: [2, 8, 13, 1], radius: 128, en: 1.66 },
  { z: 25, sym: 'Mn', name: 'Manganese', vi: 'Mangan', mass: '54.938', period: 4, col: 7, block: 'd', cat: 'metal', subCat: 'Kim loại chuyển tiếp', config: '[Ar] 3d⁵ 4s²', shells: [2, 8, 13, 2], radius: 127, en: 1.55 },
  { z: 26, sym: 'Fe', name: 'Iron', vi: 'Sắt', mass: '55.845', period: 4, col: 8, block: 'd', cat: 'metal', subCat: 'Kim loại chuyển tiếp', config: '[Ar] 3d⁶ 4s²', shells: [2, 8, 14, 2], radius: 126, en: 1.83 },
  { z: 27, sym: 'Co', name: 'Cobalt', vi: 'Coban', mass: '58.933', period: 4, col: 9, block: 'd', cat: 'metal', subCat: 'Kim loại chuyển tiếp', config: '[Ar] 3d⁷ 4s²', shells: [2, 8, 15, 2], radius: 125, en: 1.88 },
  { z: 28, sym: 'Ni', name: 'Nickel', vi: 'Niken', mass: '58.693', period: 4, col: 10, block: 'd', cat: 'metal', subCat: 'Kim loại chuyển tiếp', config: '[Ar] 3d⁸ 4s²', shells: [2, 8, 16, 2], radius: 124, en: 1.91 },
  { z: 29, sym: 'Cu', name: 'Copper', vi: 'Đồng', mass: '63.546', period: 4, col: 11, block: 'd', cat: 'metal', subCat: 'Kim loại chuyển tiếp', config: '[Ar] 3d¹⁰ 4s¹', shells: [2, 8, 18, 1], radius: 128, en: 1.90 },
  { z: 30, sym: 'Zn', name: 'Zinc', vi: 'Kẽm', mass: '65.38', period: 4, col: 12, block: 'd', cat: 'metal', subCat: 'Kim loại chuyển tiếp', config: '[Ar] 3d¹⁰ 4s²', shells: [2, 8, 18, 2], radius: 134, en: 1.65 },
  { z: 31, sym: 'Ga', name: 'Gallium', vi: 'Gali', mass: '69.723', period: 4, col: 13, block: 'p', cat: 'metal', subCat: 'Kim loại nhóm A', config: '[Ar] 3d¹⁰ 4s² 4p¹', shells: [2, 8, 18, 3], radius: 135, en: 1.81 },
  { z: 32, sym: 'Ge', name: 'Germanium', vi: 'Gecmani', mass: '72.630', period: 4, col: 14, block: 'p', cat: 'metal', subCat: 'Kim loại / Bán kim', config: '[Ar] 3d¹⁰ 4s² 4p²', shells: [2, 8, 18, 4], radius: 122, en: 2.01 },
  { z: 33, sym: 'As', name: 'Arsenic', vi: 'Asen', mass: '74.922', period: 4, col: 15, block: 'p', cat: 'nonmetal', subCat: 'Phi kim (Á kim)', config: '[Ar] 3d¹⁰ 4s² 4p³', shells: [2, 8, 18, 5], radius: 119, en: 2.18 },
  { z: 34, sym: 'Se', name: 'Selenium', vi: 'Selen', mass: '78.971', period: 4, col: 16, block: 'p', cat: 'nonmetal', subCat: 'Phi kim', config: '[Ar] 3d¹⁰ 4s² 4p⁴', shells: [2, 8, 18, 6], radius: 116, en: 2.55 },
  { z: 35, sym: 'Br', name: 'Bromine', vi: 'Brom', mass: '79.904', period: 4, col: 17, block: 'p', cat: 'nonmetal', subCat: 'Phi kim (Halogen)', config: '[Ar] 3d¹⁰ 4s² 4p⁵', shells: [2, 8, 18, 7], radius: 114, en: 2.96 },
  { z: 36, sym: 'Kr', name: 'Krypton', vi: 'Kripton', mass: '83.798', period: 4, col: 18, block: 'p', cat: 'noble_gas', subCat: 'Khí hiếm', config: '[Ar] 3d¹⁰ 4s² 4p⁶', shells: [2, 8, 18, 8], radius: 88, en: 3.00 },

  // Period 5
  { z: 37, sym: 'Rb', name: 'Rubidium', vi: 'Rubiđi', mass: '85.468', period: 5, col: 1, block: 's', cat: 'metal', subCat: 'Kim loại kiềm', config: '[Kr] 5s¹', shells: [2, 8, 18, 8, 1], radius: 248, en: 0.82 },
  { z: 38, sym: 'Sr', name: 'Strontium', vi: 'Stronti', mass: '87.62', period: 5, col: 2, block: 's', cat: 'metal', subCat: 'Kim loại kiềm thổ', config: '[Kr] 5s²', shells: [2, 8, 18, 8, 2], radius: 215, en: 0.95 },
  { z: 39, sym: 'Y', name: 'Yttrium', vi: 'Ytri', mass: '88.906', period: 5, col: 3, block: 'd', cat: 'metal', subCat: 'Kim loại chuyển tiếp', config: '[Kr] 4d¹ 5s²', shells: [2, 8, 18, 9, 2], radius: 180, en: 1.22 },
  { z: 40, sym: 'Zr', name: 'Zirconium', vi: 'Ziriconi', mass: '91.224', period: 5, col: 4, block: 'd', cat: 'metal', subCat: 'Kim loại chuyển tiếp', config: '[Kr] 4d² 5s²', shells: [2, 8, 18, 10, 2], radius: 160, en: 1.33 },
  { z: 41, sym: 'Nb', name: 'Niobium', vi: 'Niobi', mass: '92.906', period: 5, col: 5, block: 'd', cat: 'metal', subCat: 'Kim loại chuyển tiếp', config: '[Kr] 4d⁴ 5s¹', shells: [2, 8, 18, 12, 1], radius: 146, en: 1.60 },
  { z: 42, sym: 'Mo', name: 'Molybdenum', vi: 'Molipđen', mass: '95.95', period: 5, col: 6, block: 'd', cat: 'metal', subCat: 'Kim loại chuyển tiếp', config: '[Kr] 4d⁵ 5s¹', shells: [2, 8, 18, 13, 1], radius: 139, en: 2.16 },
  { z: 43, sym: 'Tc', name: 'Technetium', vi: 'Tecnexi', mass: '[98]', period: 5, col: 7, block: 'd', cat: 'metal', subCat: 'Kim loại chuyển tiếp', config: '[Kr] 4d⁵ 5s²', shells: [2, 8, 18, 13, 2], radius: 136, en: 1.90 },
  { z: 44, sym: 'Ru', name: 'Ruthenium', vi: 'Ruteni', mass: '101.07', period: 5, col: 8, block: 'd', cat: 'metal', subCat: 'Kim loại chuyển tiếp', config: '[Kr] 4d⁷ 5s¹', shells: [2, 8, 18, 15, 1], radius: 134, en: 2.20 },
  { z: 45, sym: 'Rh', name: 'Rhodium', vi: 'Rođi', mass: '102.91', period: 5, col: 9, block: 'd', cat: 'metal', subCat: 'Kim loại chuyển tiếp', config: '[Kr] 4d⁸ 5s¹', shells: [2, 8, 18, 16, 1], radius: 134, en: 2.28 },
  { z: 46, sym: 'Pd', name: 'Palladium', vi: 'Palađi', mass: '106.42', period: 5, col: 10, block: 'd', cat: 'metal', subCat: 'Kim loại chuyển tiếp', config: '[Kr] 4d¹⁰', shells: [2, 8, 18, 18], radius: 137, en: 2.20 },
  { z: 47, sym: 'Ag', name: 'Silver', vi: 'Bạc', mass: '107.87', period: 5, col: 11, block: 'd', cat: 'metal', subCat: 'Kim loại chuyển tiếp', config: '[Kr] 4d¹⁰ 5s¹', shells: [2, 8, 18, 18, 1], radius: 144, en: 1.93 },
  { z: 48, sym: 'Cd', name: 'Cadmium', vi: 'Cađimi', mass: '112.41', period: 5, col: 12, block: 'd', cat: 'metal', subCat: 'Kim loại chuyển tiếp', config: '[Kr] 4d¹⁰ 5s²', shells: [2, 8, 18, 18, 2], radius: 151, en: 1.69 },
  { z: 49, sym: 'In', name: 'Indium', vi: 'Inđi', mass: '114.82', period: 5, col: 13, block: 'p', cat: 'metal', subCat: 'Kim loại nhóm A', config: '[Kr] 4d¹⁰ 5s² 5p¹', shells: [2, 8, 18, 18, 3], radius: 167, en: 1.78 },
  { z: 50, sym: 'Sn', name: 'Tin', vi: 'Thiếc', mass: '118.71', period: 5, col: 14, block: 'p', cat: 'metal', subCat: 'Kim loại nhóm A', config: '[Kr] 4d¹⁰ 5s² 5p²', shells: [2, 8, 18, 18, 4], radius: 140, en: 1.96 },
  { z: 51, sym: 'Sb', name: 'Antimony', vi: 'Antimon', mass: '121.76', period: 5, col: 15, block: 'p', cat: 'metal', subCat: 'Kim loại / Bán kim', config: '[Kr] 4d¹⁰ 5s² 5p³', shells: [2, 8, 18, 18, 5], radius: 140, en: 2.05 },
  { z: 52, sym: 'Te', name: 'Tellurium', vi: 'Telu', mass: '127.60', period: 5, col: 16, block: 'p', cat: 'nonmetal', subCat: 'Phi kim (Á kim)', config: '[Kr] 4d¹⁰ 5s² 5p⁴', shells: [2, 8, 18, 18, 6], radius: 135, en: 2.10 },
  { z: 53, sym: 'I', name: 'Iodine', vi: 'Iốt', mass: '126.90', period: 5, col: 17, block: 'p', cat: 'nonmetal', subCat: 'Phi kim (Halogen)', config: '[Kr] 4d¹⁰ 5s² 5p⁵', shells: [2, 8, 18, 18, 7], radius: 133, en: 2.66 },
  { z: 54, sym: 'Xe', name: 'Xenon', vi: 'Xenon', mass: '131.29', period: 5, col: 18, block: 'p', cat: 'noble_gas', subCat: 'Khí hiếm', config: '[Kr] 4d¹⁰ 5s² 5p⁶', shells: [2, 8, 18, 18, 8], radius: 108, en: 2.60 },

  // Period 6 (Main + Lanthanides 57..71)
  { z: 55, sym: 'Cs', name: 'Caesium', vi: 'Xesi', mass: '132.91', period: 6, col: 1, block: 's', cat: 'metal', subCat: 'Kim loại kiềm', config: '[Xe] 6s¹', shells: [2, 8, 18, 18, 8, 1], radius: 265, en: 0.79 },
  { z: 56, sym: 'Ba', name: 'Barium', vi: 'Bari', mass: '137.33', period: 6, col: 2, block: 's', cat: 'metal', subCat: 'Kim loại kiềm thổ', config: '[Xe] 6s²', shells: [2, 8, 18, 18, 8, 2], radius: 222, en: 0.89 },

  // Lanthanides (Z = 57..71, Period 6, Group IIIB / Col 3)
  { z: 57, sym: 'La', name: 'Lanthanum', vi: 'Lantan', mass: '138.91', period: 6, col: 3, block: 'f', cat: 'metal', subCat: 'Họ Lanthanide', config: '[Xe] 5d¹ 6s²', shells: [2, 8, 18, 18, 9, 2], radius: 187, en: 1.10, fRow: 'lanthanide', fIdx: 1 },
  { z: 58, sym: 'Ce', name: 'Cerium', vi: 'Xeri', mass: '140.12', period: 6, col: 3, block: 'f', cat: 'metal', subCat: 'Họ Lanthanide', config: '[Xe] 4f¹ 5d¹ 6s²', shells: [2, 8, 18, 19, 9, 2], radius: 182, en: 1.12, fRow: 'lanthanide', fIdx: 2 },
  { z: 59, sym: 'Pr', name: 'Praseodymium', vi: 'Prazeođim', mass: '140.91', period: 6, col: 3, block: 'f', cat: 'metal', subCat: 'Họ Lanthanide', config: '[Xe] 4f³ 6s²', shells: [2, 8, 18, 21, 8, 2], radius: 182, en: 1.13, fRow: 'lanthanide', fIdx: 3 },
  { z: 60, sym: 'Nd', name: 'Neodymium', vi: 'Neođim', mass: '144.24', period: 6, col: 3, block: 'f', cat: 'metal', subCat: 'Họ Lanthanide', config: '[Xe] 4f⁴ 6s²', shells: [2, 8, 18, 22, 8, 2], radius: 181, en: 1.14, fRow: 'lanthanide', fIdx: 4 },
  { z: 61, sym: 'Pm', name: 'Promethium', vi: 'Prometi', mass: '[145]', period: 6, col: 3, block: 'f', cat: 'metal', subCat: 'Họ Lanthanide', config: '[Xe] 4f⁵ 6s²', shells: [2, 8, 18, 23, 8, 2], radius: 183, en: 1.13, fRow: 'lanthanide', fIdx: 5 },
  { z: 62, sym: 'Sm', name: 'Samarium', vi: 'Samari', mass: '150.36', period: 6, col: 3, block: 'f', cat: 'metal', subCat: 'Họ Lanthanide', config: '[Xe] 4f⁶ 6s²', shells: [2, 8, 18, 24, 8, 2], radius: 180, en: 1.17, fRow: 'lanthanide', fIdx: 6 },
  { z: 63, sym: 'Eu', name: 'Europium', vi: 'Europi', mass: '151.96', period: 6, col: 3, block: 'f', cat: 'metal', subCat: 'Họ Lanthanide', config: '[Xe] 4f⁷ 6s²', shells: [2, 8, 18, 25, 8, 2], radius: 199, en: 1.20, fRow: 'lanthanide', fIdx: 7 },
  { z: 64, sym: 'Gd', name: 'Gadolinium', vi: 'Gađolini', mass: '157.25', period: 6, col: 3, block: 'f', cat: 'metal', subCat: 'Họ Lanthanide', config: '[Xe] 4f⁷ 5d¹ 6s²', shells: [2, 8, 18, 25, 9, 2], radius: 180, en: 1.20, fRow: 'lanthanide', fIdx: 8 },
  { z: 65, sym: 'Tb', name: 'Terbium', vi: 'Tecbi', mass: '158.93', period: 6, col: 3, block: 'f', cat: 'metal', subCat: 'Họ Lanthanide', config: '[Xe] 4f⁹ 6s²', shells: [2, 8, 18, 27, 8, 2], radius: 177, en: 1.20, fRow: 'lanthanide', fIdx: 9 },
  { z: 66, sym: 'Dy', name: 'Dysprosium', vi: 'Đisprozi', mass: '162.50', period: 6, col: 3, block: 'f', cat: 'metal', subCat: 'Họ Lanthanide', config: '[Xe] 4f¹⁰ 6s²', shells: [2, 8, 18, 28, 8, 2], radius: 178, en: 1.22, fRow: 'lanthanide', fIdx: 10 },
  { z: 67, sym: 'Ho', name: 'Holmium', vi: 'Honmi', mass: '164.93', period: 6, col: 3, block: 'f', cat: 'metal', subCat: 'Họ Lanthanide', config: '[Xe] 4f¹¹ 6s²', shells: [2, 8, 18, 29, 8, 2], radius: 176, en: 1.23, fRow: 'lanthanide', fIdx: 11 },
  { z: 68, sym: 'Er', name: 'Erbium', vi: 'Ecbi', mass: '167.26', period: 6, col: 3, block: 'f', cat: 'metal', subCat: 'Họ Lanthanide', config: '[Xe] 4f¹² 6s²', shells: [2, 8, 18, 30, 8, 2], radius: 176, en: 1.24, fRow: 'lanthanide', fIdx: 12 },
  { z: 69, sym: 'Tm', name: 'Thulium', vi: 'Tuli', mass: '168.93', period: 6, col: 3, block: 'f', cat: 'metal', subCat: 'Họ Lanthanide', config: '[Xe] 4f¹³ 6s²', shells: [2, 8, 18, 31, 8, 2], radius: 176, en: 1.25, fRow: 'lanthanide', fIdx: 13 },
  { z: 70, sym: 'Yb', name: 'Ytterbium', vi: 'Ytecbi', mass: '173.05', period: 6, col: 3, block: 'f', cat: 'metal', subCat: 'Họ Lanthanide', config: '[Xe] 4f¹⁴ 6s²', shells: [2, 8, 18, 32, 8, 2], radius: 193, en: 1.10, fRow: 'lanthanide', fIdx: 14 },
  { z: 71, sym: 'Lu', name: 'Lutetium', vi: 'Lutexi', mass: '174.97', period: 6, col: 3, block: 'f', cat: 'metal', subCat: 'Họ Lanthanide', config: '[Xe] 4f¹⁴ 5d¹ 6s²', shells: [2, 8, 18, 32, 9, 2], radius: 174, en: 1.27, fRow: 'lanthanide', fIdx: 15 },

  // Period 6 continued (Col 4..18)
  { z: 72, sym: 'Hf', name: 'Hafnium', vi: 'Hafini', mass: '178.49', period: 6, col: 4, block: 'd', cat: 'metal', subCat: 'Kim loại chuyển tiếp', config: '[Xe] 4f¹⁴ 5d² 6s²', shells: [2, 8, 18, 32, 10, 2], radius: 159, en: 1.30 },
  { z: 73, sym: 'Ta', name: 'Tantalum', vi: 'Tantan', mass: '180.95', period: 6, col: 5, block: 'd', cat: 'metal', subCat: 'Kim loại chuyển tiếp', config: '[Xe] 4f¹⁴ 5d³ 6s²', shells: [2, 8, 18, 32, 11, 2], radius: 146, en: 1.50 },
  { z: 74, sym: 'W', name: 'Tungsten', vi: 'Vonfram', mass: '183.84', period: 6, col: 6, block: 'd', cat: 'metal', subCat: 'Kim loại chuyển tiếp', config: '[Xe] 4f¹⁴ 5d⁴ 6s²', shells: [2, 8, 18, 32, 12, 2], radius: 139, en: 2.36 },
  { z: 75, sym: 'Re', name: 'Rhenium', vi: 'Reni', mass: '186.21', period: 6, col: 7, block: 'd', cat: 'metal', subCat: 'Kim loại chuyển tiếp', config: '[Xe] 4f¹⁴ 5d⁵ 6s²', shells: [2, 8, 18, 32, 13, 2], radius: 137, en: 1.90 },
  { z: 76, sym: 'Os', name: 'Osmium', vi: 'Osimi', mass: '190.23', period: 6, col: 8, block: 'd', cat: 'metal', subCat: 'Kim loại chuyển tiếp', config: '[Xe] 4f¹⁴ 5d⁶ 6s²', shells: [2, 8, 18, 32, 14, 2], radius: 135, en: 2.20 },
  { z: 77, sym: 'Ir', name: 'Iridium', vi: 'Iriđi', mass: '192.22', period: 6, col: 9, block: 'd', cat: 'metal', subCat: 'Kim loại chuyển tiếp', config: '[Xe] 4f¹⁴ 5d⁷ 6s²', shells: [2, 8, 18, 32, 15, 2], radius: 136, en: 2.20 },
  { z: 78, sym: 'Pt', name: 'Platinum', vi: 'Platin (Bạch kim)', mass: '195.08', period: 6, col: 10, block: 'd', cat: 'metal', subCat: 'Kim loại chuyển tiếp', config: '[Xe] 4f¹⁴ 5d⁹ 6s¹', shells: [2, 8, 18, 32, 17, 1], radius: 139, en: 2.28 },
  { z: 79, sym: 'Au', name: 'Gold', vi: 'Vàng', mass: '196.97', period: 6, col: 11, block: 'd', cat: 'metal', subCat: 'Kim loại chuyển tiếp', config: '[Xe] 4f¹⁴ 5d¹⁰ 6s¹', shells: [2, 8, 18, 32, 18, 1], radius: 144, en: 2.54 },
  { z: 80, sym: 'Hg', name: 'Mercury', vi: 'Thủy ngân', mass: '200.59', period: 6, col: 12, block: 'd', cat: 'metal', subCat: 'Kim loại chuyển tiếp', config: '[Xe] 4f¹⁴ 5d¹⁰ 6s²', shells: [2, 8, 18, 32, 18, 2], radius: 151, en: 2.00 },
  { z: 81, sym: 'Tl', name: 'Thallium', vi: 'Tali', mass: '204.38', period: 6, col: 13, block: 'p', cat: 'metal', subCat: 'Kim loại nhóm A', config: '[Xe] 4f¹⁴ 5d¹⁰ 6s² 6p¹', shells: [2, 8, 18, 32, 18, 3], radius: 170, en: 1.62 },
  { z: 82, sym: 'Pb', name: 'Lead', vi: 'Chì', mass: '207.2', period: 6, col: 14, block: 'p', cat: 'metal', subCat: 'Kim loại nhóm A', config: '[Xe] 4f¹⁴ 5d¹⁰ 6s² 6p²', shells: [2, 8, 18, 32, 18, 4], radius: 175, en: 2.33 },
  { z: 83, sym: 'Bi', name: 'Bismuth', vi: 'Bitmut', mass: '208.98', period: 6, col: 15, block: 'p', cat: 'metal', subCat: 'Kim loại nhóm A', config: '[Xe] 4f¹⁴ 5d¹⁰ 6s² 6p³', shells: [2, 8, 18, 32, 18, 5], radius: 156, en: 2.02 },
  { z: 84, sym: 'Po', name: 'Polonium', vi: 'Poloni', mass: '[209]', period: 6, col: 16, block: 'p', cat: 'metal', subCat: 'Kim loại phóng xạ', config: '[Xe] 4f¹⁴ 5d¹⁰ 6s² 6p⁴', shells: [2, 8, 18, 32, 18, 6], radius: 168, en: 2.00 },
  { z: 85, sym: 'At', name: 'Astatine', vi: 'Atatin', mass: '[210]', period: 6, col: 17, block: 'p', cat: 'nonmetal', subCat: 'Phi kim (Halogen)', config: '[Xe] 4f¹⁴ 5d¹⁰ 6s² 6p⁵', shells: [2, 8, 18, 32, 18, 7], radius: 150, en: 2.20 },
  { z: 86, sym: 'Rn', name: 'Radon', vi: 'Rađon', mass: '[222]', period: 6, col: 18, block: 'p', cat: 'noble_gas', subCat: 'Khí hiếm', config: '[Xe] 4f¹⁴ 5d¹⁰ 6s² 6p⁶', shells: [2, 8, 18, 32, 18, 8], radius: 120, en: 2.20 },

  // Period 7 (Main + Actinides 89..103)
  { z: 87, sym: 'Fr', name: 'Francium', vi: 'Franxi', mass: '[223]', period: 7, col: 1, block: 's', cat: 'metal', subCat: 'Kim loại kiềm', config: '[Rn] 7s¹', shells: [2, 8, 18, 32, 18, 8, 1], radius: 280, en: 0.70 },
  { z: 88, sym: 'Ra', name: 'Radium', vi: 'Rađi', mass: '[226]', period: 7, col: 2, block: 's', cat: 'metal', subCat: 'Kim loại kiềm thổ', config: '[Rn] 7s²', shells: [2, 8, 18, 32, 18, 8, 2], radius: 235, en: 0.90 },

  // Actinides (Z = 89..103, Period 7, Group IIIB / Col 3)
  { z: 89, sym: 'Ac', name: 'Actinium', vi: 'Actini', mass: '[227]', period: 7, col: 3, block: 'f', cat: 'metal', subCat: 'Họ Actinide', config: '[Rn] 6d¹ 7s²', shells: [2, 8, 18, 32, 18, 9, 2], radius: 195, en: 1.10, fRow: 'actinide', fIdx: 1 },
  { z: 90, sym: 'Th', name: 'Thorium', vi: 'Thori', mass: '232.04', period: 7, col: 3, block: 'f', cat: 'metal', subCat: 'Họ Actinide', config: '[Rn] 6d² 7s²', shells: [2, 8, 18, 32, 18, 10, 2], radius: 180, en: 1.30, fRow: 'actinide', fIdx: 2 },
  { z: 91, sym: 'Pa', name: 'Protactinium', vi: 'Protactini', mass: '231.04', period: 7, col: 3, block: 'f', cat: 'metal', subCat: 'Họ Actinide', config: '[Rn] 5f² 6d¹ 7s²', shells: [2, 8, 18, 32, 20, 9, 2], radius: 163, en: 1.50, fRow: 'actinide', fIdx: 3 },
  { z: 92, sym: 'U', name: 'Uranium', vi: 'Urani', mass: '238.03', period: 7, col: 3, block: 'f', cat: 'metal', subCat: 'Họ Actinide', config: '[Rn] 5f³ 6d¹ 7s²', shells: [2, 8, 18, 32, 21, 9, 2], radius: 156, en: 1.38, fRow: 'actinide', fIdx: 4 },
  { z: 93, sym: 'Np', name: 'Neptunium', vi: 'Neptuni', mass: '[237]', period: 7, col: 3, block: 'f', cat: 'metal', subCat: 'Họ Actinide', config: '[Rn] 5f⁴ 6d¹ 7s²', shells: [2, 8, 18, 32, 22, 9, 2], radius: 155, en: 1.36, fRow: 'actinide', fIdx: 5 },
  { z: 94, sym: 'Pu', name: 'Plutonium', vi: 'Plutoni', mass: '[244]', period: 7, col: 3, block: 'f', cat: 'metal', subCat: 'Họ Actinide', config: '[Rn] 5f⁶ 7s²', shells: [2, 8, 18, 32, 24, 8, 2], radius: 159, en: 1.28, fRow: 'actinide', fIdx: 6 },
  { z: 95, sym: 'Am', name: 'Americium', vi: 'Amerixi', mass: '[243]', period: 7, col: 3, block: 'f', cat: 'metal', subCat: 'Họ Actinide', config: '[Rn] 5f⁷ 7s²', shells: [2, 8, 18, 32, 25, 8, 2], radius: 173, en: 1.30, fRow: 'actinide', fIdx: 7 },
  { z: 96, sym: 'Cm', name: 'Curium', vi: 'Curi', mass: '[247]', period: 7, col: 3, block: 'f', cat: 'metal', subCat: 'Họ Actinide', config: '[Rn] 5f⁷ 6d¹ 7s²', shells: [2, 8, 18, 32, 25, 9, 2], radius: 174, en: 1.30, fRow: 'actinide', fIdx: 8 },
  { z: 97, sym: 'Bk', name: 'Berkelium', vi: 'Beckeli', mass: '[247]', period: 7, col: 3, block: 'f', cat: 'metal', subCat: 'Họ Actinide', config: '[Rn] 5f⁹ 7s²', shells: [2, 8, 18, 32, 27, 8, 2], radius: 170, en: 1.30, fRow: 'actinide', fIdx: 9 },
  { z: 98, sym: 'Cf', name: 'Californium', vi: 'Califoni', mass: '[251]', period: 7, col: 3, block: 'f', cat: 'metal', subCat: 'Họ Actinide', config: '[Rn] 5f¹⁰ 7s²', shells: [2, 8, 18, 32, 28, 8, 2], radius: 186, en: 1.30, fRow: 'actinide', fIdx: 10 },
  { z: 99, sym: 'Es', name: 'Einsteinium', vi: ' Anhstanhni', mass: '[252]', period: 7, col: 3, block: 'f', cat: 'metal', subCat: 'Họ Actinide', config: '[Rn] 5f¹¹ 7s²', shells: [2, 8, 18, 32, 29, 8, 2], radius: 186, en: 1.30, fRow: 'actinide', fIdx: 11 },
  { z: 100, sym: 'Fm', name: 'Fermium', vi: 'Fecmi', mass: '[257]', period: 7, col: 3, block: 'f', cat: 'metal', subCat: 'Họ Actinide', config: '[Rn] 5f¹² 7s²', shells: [2, 8, 18, 32, 30, 8, 2], radius: 185, en: 1.30, fRow: 'actinide', fIdx: 12 },
  { z: 101, sym: 'Md', name: 'Mendelevium', vi: 'Menđelevi', mass: '[258]', period: 7, col: 3, block: 'f', cat: 'metal', subCat: 'Họ Actinide', config: '[Rn] 5f¹³ 7s²', shells: [2, 8, 18, 32, 31, 8, 2], radius: 184, en: 1.30, fRow: 'actinide', fIdx: 13 },
  { z: 102, sym: 'No', name: 'Nobelium', vi: 'Nobeli', mass: '[259]', period: 7, col: 3, block: 'f', cat: 'metal', subCat: 'Họ Actinide', config: '[Rn] 5f¹⁴ 7s²', shells: [2, 8, 18, 32, 32, 8, 2], radius: 183, en: 1.30, fRow: 'actinide', fIdx: 14 },
  { z: 103, sym: 'Lr', name: 'Lawrencium', vi: 'Lorenxi', mass: '[266]', period: 7, col: 3, block: 'f', cat: 'metal', subCat: 'Họ Actinide', config: '[Rn] 5f¹⁴ 7s² 7p¹', shells: [2, 8, 18, 32, 32, 8, 3], radius: 180, en: 1.30, fRow: 'actinide', fIdx: 15 },

  // Period 7 continued (Col 4..18)
  { z: 104, sym: 'Rf', name: 'Rutherfordium', vi: 'Rơzơfođi', mass: '[267]', period: 7, col: 4, block: 'd', cat: 'metal', subCat: 'Kim loại chuyển tiếp', config: '[Rn] 5f¹⁴ 6d² 7s²', shells: [2, 8, 18, 32, 32, 10, 2], radius: 157, en: null },
  { z: 105, sym: 'Db', name: 'Dubnium', vi: 'Đupni', mass: '[268]', period: 7, col: 5, block: 'd', cat: 'metal', subCat: 'Kim loại chuyển tiếp', config: '[Rn] 5f¹⁴ 6d³ 7s²', shells: [2, 8, 18, 32, 32, 11, 2], radius: 149, en: null },
  { z: 106, sym: 'Sg', name: 'Seaborgium', vi: 'Siboqi', mass: '[269]', period: 7, col: 6, block: 'd', cat: 'metal', subCat: 'Kim loại chuyển tiếp', config: '[Rn] 5f¹⁴ 6d⁴ 7s²', shells: [2, 8, 18, 32, 32, 12, 2], radius: 143, en: null },
  { z: 107, sym: 'Bh', name: 'Bohrium', vi: 'Bori', mass: '[270]', period: 7, col: 7, block: 'd', cat: 'metal', subCat: 'Kim loại chuyển tiếp', config: '[Rn] 5f¹⁴ 6d⁵ 7s²', shells: [2, 8, 18, 32, 32, 13, 2], radius: 141, en: null },
  { z: 108, sym: 'Hs', name: 'Hassium', vi: 'Haxi', mass: '[277]', period: 7, col: 8, block: 'd', cat: 'metal', subCat: 'Kim loại chuyển tiếp', config: '[Rn] 5f¹⁴ 6d⁶ 7s²', shells: [2, 8, 18, 32, 32, 14, 2], radius: 134, en: null },
  { z: 109, sym: 'Mt', name: 'Meitnerium', vi: 'Meitneri', mass: '[278]', period: 7, col: 9, block: 'd', cat: 'metal', subCat: 'Kim loại chuyển tiếp', config: '[Rn] 5f¹⁴ 6d⁷ 7s²', shells: [2, 8, 18, 32, 32, 15, 2], radius: 129, en: null },
  { z: 110, sym: 'Ds', name: 'Darmstadtium', vi: 'Đamstati', mass: '[281]', period: 7, col: 10, block: 'd', cat: 'metal', subCat: 'Kim loại chuyển tiếp', config: '[Rn] 5f¹⁴ 6d⁸ 7s²', shells: [2, 8, 18, 32, 32, 16, 2], radius: 128, en: null },
  { z: 111, sym: 'Rg', name: 'Roentgenium', vi: 'Rơngheni', mass: '[282]', period: 7, col: 11, block: 'd', cat: 'metal', subCat: 'Kim loại chuyển tiếp', config: '[Rn] 5f¹⁴ 6d⁹ 7s²', shells: [2, 8, 18, 32, 32, 17, 2], radius: 121, en: null },
  { z: 112, sym: 'Cn', name: 'Copernicium', vi: 'Copernixi', mass: '[285]', period: 7, col: 12, block: 'd', cat: 'metal', subCat: 'Kim loại chuyển tiếp', config: '[Rn] 5f¹⁴ 6d¹⁰ 7s²', shells: [2, 8, 18, 32, 32, 18, 2], radius: 122, en: null },
  { z: 113, sym: 'Nh', name: 'Nihonium', vi: 'Nihoni', mass: '[286]', period: 7, col: 13, block: 'p', cat: 'metal', subCat: 'Kim loại nhóm A', config: '[Rn] 5f¹⁴ 6d¹⁰ 7s² 7p¹', shells: [2, 8, 18, 32, 32, 18, 3], radius: 136, en: null },
  { z: 114, sym: 'Fl', name: 'Flerovium', vi: 'Flerovi', mass: '[289]', period: 7, col: 14, block: 'p', cat: 'metal', subCat: 'Kim loại nhóm A', config: '[Rn] 5f¹⁴ 6d¹⁰ 7s² 7p²', shells: [2, 8, 18, 32, 32, 18, 4], radius: 143, en: null },
  { z: 115, sym: 'Mc', name: 'Moscovium', vi: 'Moscovi', mass: '[290]', period: 7, col: 15, block: 'p', cat: 'metal', subCat: 'Kim loại nhóm A', config: '[Rn] 5f¹⁴ 6d¹⁰ 7s² 7p³', shells: [2, 8, 18, 32, 32, 18, 5], radius: 162, en: null },
  { z: 116, sym: 'Lv', name: 'Livermorium', vi: 'Livermori', mass: '[293]', period: 7, col: 16, block: 'p', cat: 'metal', subCat: 'Kim loại nhóm A', config: '[Rn] 5f¹⁴ 6d¹⁰ 7s² 7p⁴', shells: [2, 8, 18, 32, 32, 18, 6], radius: 175, en: null },
  { z: 117, sym: 'Ts', name: 'Tennessine', vi: 'Tennessin', mass: '[294]', period: 7, col: 17, block: 'p', cat: 'nonmetal', subCat: 'Phi kim (Halogen)', config: '[Rn] 5f¹⁴ 6d¹⁰ 7s² 7p⁵', shells: [2, 8, 18, 32, 32, 18, 7], radius: 165, en: null },
  { z: 118, sym: 'Og', name: 'Oganesson', vi: 'Oganesson', mass: '[294]', period: 7, col: 18, block: 'p', cat: 'noble_gas', subCat: 'Khí hiếm', config: '[Rn] 5f¹⁴ 6d¹⁰ 7s² 7p⁶', shells: [2, 8, 18, 32, 32, 18, 8], radius: 157, en: null },
];

export const COLUMN_TO_GROUP: Record<number, { roman: string; type: 'A' | 'B' }> = {
  1: { roman: 'IA', type: 'A' },
  2: { roman: 'IIA', type: 'A' },
  3: { roman: 'IIIB', type: 'B' },
  4: { roman: 'IVB', type: 'B' },
  5: { roman: 'VB', type: 'B' },
  6: { roman: 'VIB', type: 'B' },
  7: { roman: 'VIIB', type: 'B' },
  8: { roman: 'VIIIB', type: 'B' },
  9: { roman: 'VIIIB', type: 'B' },
  10: { roman: 'VIIIB', type: 'B' },
  11: { roman: 'IB', type: 'B' },
  12: { roman: 'IIB', type: 'B' },
  13: { roman: 'IIIA', type: 'A' },
  14: { roman: 'IVA', type: 'A' },
  15: { roman: 'VA', type: 'A' },
  16: { roman: 'VIA', type: 'A' },
  17: { roman: 'VIIA', type: 'A' },
  18: { roman: 'VIIIA', type: 'A' },
};

const NOBLE_CORE_EXPANSION: Record<string, string> = {
  '[He]': '1s²',
  '[Ne]': '1s² 2s² 2p⁶',
  '[Ar]': '1s² 2s² 2p⁶ 3s² 3p⁶',
  '[Kr]': '1s² 2s² 2p⁶ 3s² 3p⁶ 3d¹⁰ 4s² 4p⁶',
  '[Xe]': '1s² 2s² 2p⁶ 3s² 3p⁶ 3d¹⁰ 4s² 4p⁶ 4d¹⁰ 5s² 5p⁶',
  '[Rn]': '1s² 2s² 2p⁶ 3s² 3p⁶ 3d¹⁰ 4s² 4p⁶ 4d¹⁰ 4f¹⁴ 5s² 5p⁶ 5d¹⁰ 6s² 6p⁶',
};

function expandElectronConfig(shortConfig: string): string {
  for (const [core, full] of Object.entries(NOBLE_CORE_EXPANSION)) {
    if (shortConfig.startsWith(core)) {
      return shortConfig.replace(core, full).trim();
    }
  }
  return shortConfig;
}

export const ELEMENTS: ChemicalElement[] = RAW_ELEMENTS.map((item) => {
  const groupInfo = COLUMN_TO_GROUP[item.col];
  const outerShellElectrons = item.shells[item.shells.length - 1] ?? 1;
  return {
    atomicNumber: item.z,
    symbol: item.sym,
    name: item.name,
    vietnameseName: item.vi.trim(),
    atomicMass: item.mass,
    period: item.period,
    column: item.col,
    fBlockRow: item.fRow,
    fBlockIndex: item.fIdx,
    groupRoman: groupInfo.roman,
    groupType: groupInfo.type,
    block: item.block,
    category: item.cat,
    subCategory: item.subCat,
    electronConfig: item.config,
    fullElectronConfig: expandElectronConfig(item.config),
    shells: item.shells,
    valenceElectrons: outerShellElectrons,
    atomicRadius: item.radius,
    electronegativity: item.en,
  };
});

export const ELEMENT_BY_Z: Record<number, ChemicalElement> = Object.fromEntries(
  ELEMENTS.map((el) => [el.atomicNumber, el])
);

export const ELEMENT_BY_SYMBOL: Record<string, ChemicalElement> = Object.fromEntries(
  ELEMENTS.map((el) => [el.symbol, el])
);
