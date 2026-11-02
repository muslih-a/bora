// Quality checks for BoraScan card detection and analysis

import { QUALITY_CONFIG } from './config.ts';
import { Lab, deltaE76 } from './colour.ts';

export type QualityIssueCode =
  | 'FEW_MARKERS'
  | 'TOO_FAR'
  | 'BLURRY'
  | 'GLARE'
  | 'EXPOSURE_DARK'
  | 'EXPOSURE_BRIGHT'
  | 'PAD_MISSING'
  | 'PAD_UNEVEN';

export interface QualityCheckResult {
  passed: boolean;
  code?: QualityIssueCode;
  reasonId?: string; // Indonesian message key
  reasonEn?: string; // English message
  fixId?: string; // Fix advice ID
  fixEn?: string; // Fix advice EN
  metrics: {
    markerCount: number;
    minMarkerSidePx: number;
    laplacianVariance: number;
    glarePadPct: number;
    glareWPct: number;
    meanGW: number;
    padDeltaEFromW: number;
    padSdG: number;
  };
}

// Compute variance of the Laplacian of a canonical grayscale image
export function computeLaplacianVariance(canonicalImageData: ImageData): number {
  const { width, height, data } = canonicalImageData;
  const n = width * height;
  if (n === 0) return 0;

  // Pre-calculate gray values for faster 3x3 convolution
  const gray = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const idx = i * 4;
    gray[i] = 0.299 * data[idx] + 0.587 * data[idx + 1] + 0.114 * data[idx + 2];
  }

  let sum = 0;
  let sumSq = 0;
  let count = 0;

  // 3x3 Laplacian kernel: [[0, 1, 0], [1, -4, 1], [0, 1, 0]]
  for (let y = 1; y < height - 1; y++) {
    const rowOffset = y * width;
    const upOffset = (y - 1) * width;
    const downOffset = (y + 1) * width;

    for (let x = 1; x < width - 1; x++) {
      const c = gray[rowOffset + x];
      const val =
        gray[upOffset + x] +
        gray[downOffset + x] +
        gray[rowOffset + (x - 1)] +
        gray[rowOffset + (x + 1)] -
        4.0 * c;

      sum += val;
      sumSq += val * val;
      count++;
    }
  }

  if (count === 0) return 0;
  const mean = sum / count;
  return sumSq / count - mean * mean;
}

export function performQualityChecks(params: {
  markerCount: number;
  minMarkerSidePx: number;
  laplacianVariance: number;
  glarePadPct: number;
  glareWPct: number;
  meanGW: number;
  padLab: Lab;
  wLab: Lab;
  padSdG: number;
  config?: typeof QUALITY_CONFIG;
}): QualityCheckResult {
  const cfg = params.config || QUALITY_CONFIG;
  const padDeltaEFromW = deltaE76(params.padLab, params.wLab);

  const metrics = {
    markerCount: params.markerCount,
    minMarkerSidePx: params.minMarkerSidePx,
    laplacianVariance: params.laplacianVariance,
    glarePadPct: params.glarePadPct,
    glareWPct: params.glareWPct,
    meanGW: params.meanGW,
    padDeltaEFromW,
    padSdG: params.padSdG,
  };

  // 1. Marker count
  if (params.markerCount < cfg.MIN_MARKERS) {
    return {
      passed: false,
      code: 'FEW_MARKERS',
      reasonId: 'Kartu tidak terlihat penuh',
      reasonEn: 'Card not fully visible',
      fixId: 'Pastikan 4 sudut kartu masuk ke dalam bingkai panduan',
      fixEn: 'Ensure all 4 corners of the card are inside the guide frame',
      metrics,
    };
  }

  // 2. Distance check
  if (params.minMarkerSidePx < cfg.MIN_MARKER_SIDE_PX) {
    return {
      passed: false,
      code: 'TOO_FAR',
      reasonId: 'Dekatkan HP',
      reasonEn: 'Move phone closer (15–20 cm)',
      fixId: 'Posisikan HP sekitar 15–20 cm di atas kartu hingga kartu memenuhi layar',
      fixEn: 'Hold phone 15–20 cm above the card until it fills the guide',
      metrics,
    };
  }

  // 3. Sharpness / Blur check
  if (params.laplacianVariance < cfg.BLUR_MIN) {
    return {
      passed: false,
      code: 'BLURRY',
      reasonId: 'Gambar buram',
      reasonEn: 'Image is blurred',
      fixId: 'Pegang HP dengan stabil dan ketuk layar untuk memfokuskan kamera',
      fixEn: 'Hold phone steady and tap screen to focus camera',
      metrics,
    };
  }

  // 4. Glare check
  if (params.glarePadPct > cfg.GLARE_MAX_PCT || params.glareWPct > cfg.GLARE_MAX_PCT) {
    return {
      passed: false,
      code: 'GLARE',
      reasonId: 'Ada pantulan cahaya',
      reasonEn: 'Glare detected on card',
      fixId: 'Hindari cahaya lampu langsung atau ubah sedikit sudut pengambilan gambar',
      fixEn: 'Tilt phone slightly to avoid direct lamp glare on the strip',
      metrics,
    };
  }

  // 5. Exposure check
  if (params.meanGW < cfg.EXPOSURE_W_MEAN_G_MIN) {
    return {
      passed: false,
      code: 'EXPOSURE_DARK',
      reasonId: 'Pencahayaan terlalu gelap',
      reasonEn: 'Too dark',
      fixId: 'Pindahlah ke tempat yang lebih terang atau nyalakan lampu ruangan',
      fixEn: 'Move to a well-lit area or turn on room lighting',
      metrics,
    };
  }

  if (params.meanGW > cfg.EXPOSURE_W_MEAN_G_MAX) {
    return {
      passed: false,
      code: 'EXPOSURE_BRIGHT',
      reasonId: 'Pencahayaan terlalu terang',
      reasonEn: 'Too bright / overexposed',
      fixId: 'Jauhkan dari sinar matahari langsung',
      fixEn: 'Avoid intense direct sunlight',
      metrics,
    };
  }

  // 6. Pad check: missing or displaced/uneven
  if (padDeltaEFromW < cfg.PAD_DELTA_E_MIN) {
    return {
      passed: false,
      code: 'PAD_MISSING',
      reasonId: 'Pad tidak ada di slot',
      reasonEn: 'No pad detected in slot',
      fixId: 'Letakkan strip uji tepat pada kotak PAD di kartu',
      fixEn: 'Place the test strip pad squarely inside the PAD box',
      metrics,
    };
  }

  if (params.padSdG > cfg.PAD_SD_G_MAX) {
    return {
      passed: false,
      code: 'PAD_UNEVEN',
      reasonId: 'Pad tidak rata / keluar slot',
      reasonEn: 'Pad is uneven or misaligned',
      fixId: 'Ratakan strip uji agar menempel rapi tanpa terlipat',
      fixEn: 'Flatten strip pad so it sits smoothly without folding',
      metrics,
    };
  }

  return {
    passed: true,
    metrics,
  };
}
