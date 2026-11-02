// Result categories, symbols, WCAG accessible patterns, Okabe-Ito colors, and vibrations

export type ResultCategoryCode = '0' | '1' | '2' | 'B+' | 'B-';

export interface CategoryInfo {
  code: ResultCategoryCode;
  symbol: string;
  pattern: 'plain' | 'dots' | 'stripes' | 'cross-hatch' | 'diagonal-stripes';
  hexColor: string; // Okabe-Ito
  textColor: string;
  messageId: string;
  messageEn: string;
  vibrationPattern: number[]; // ms
  descriptionId: string;
  descriptionEn: string;
}

export const CATEGORIES: Record<ResultCategoryCode, CategoryInfo> = {
  '0': {
    code: '0',
    symbol: '○',
    pattern: 'plain',
    hexColor: '#0072B2', // Okabe-Ito Blue
    textColor: '#FFFFFF',
    messageId: 'Boraks tidak terdeteksi',
    messageEn: 'No borax detected',
    vibrationPattern: [120],
    descriptionId: 'Kadar boraks di bawah batas deteksi strip.',
    descriptionEn: 'Borax level is below the strip detection limit.',
  },
  '1': {
    code: '1',
    symbol: '△',
    pattern: 'dots',
    hexColor: '#E69F00', // Okabe-Ito Orange
    textColor: '#1D1D1B',
    messageId: 'Belum jelas – lakukan tes amonia',
    messageEn: 'Unclear – do the ammonia step',
    vibrationPattern: [120, 120, 120],
    descriptionId: 'Perubahan warna samar. Perlu konfirmasi tetes amonia untuk memastikan.',
    descriptionEn: 'Faint color shift. Ammonia confirmation step required.',
  },
  '2': {
    code: '2',
    symbol: '□',
    pattern: 'stripes',
    hexColor: '#D55E00', // Okabe-Ito Vermillion
    textColor: '#FFFFFF',
    messageId: 'Boraks terdeteksi – lakukan tes amonia',
    messageEn: 'Borax detected – do the ammonia step',
    vibrationPattern: [120, 120, 120],
    descriptionId: 'Warna coklat kemerahan terdeteksi. Lakukan tes tetes amonia untuk konfirmasi.',
    descriptionEn: 'Reddish-brown color detected. Perform ammonia test to confirm.',
  },
  'B+': {
    code: 'B+',
    symbol: '⊗',
    pattern: 'cross-hatch',
    hexColor: '#1D1D1B', // Black
    textColor: '#FFFFFF',
    messageId: 'Boraks terkonfirmasi – jangan dimakan, laporkan',
    messageEn: 'Borax confirmed – do not eat, report it',
    vibrationPattern: [600, 200, 600, 200, 600],
    descriptionId: 'Reaksi khas boraks terkonfirmasi positif setelah diteteskan amonia. Makanan tidak aman!',
    descriptionEn: 'Borax confirmed positive after ammonia test. Do not consume!',
  },
  'B-': {
    code: 'B-',
    symbol: '⊖',
    pattern: 'diagonal-stripes',
    hexColor: '#56B4E9', // Okabe-Ito Sky Blue
    textColor: '#1D1D1B',
    messageId: 'Bukan boraks – makanan hanya bersifat basa',
    messageEn: 'Not borax – the food is only alkaline',
    vibrationPattern: [600],
    descriptionId: 'Warna tidak berubah menjadi hijau-kehitaman. Sampel hanya bersifat basa alami.',
    descriptionEn: 'No greenish-black shift. The sample is only naturally alkaline.',
  },
};

// Determine initial category from concentration x and batch thresholds
export function determineInitialCategory(
  x: number,
  lod: number,
  cut: number
): '0' | '1' | '2' {
  if (x < lod) {
    return '0';
  }
  if (x < cut) {
    return '1';
  }
  return '2';
}
