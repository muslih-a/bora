// Configuration and constants for BoraScan card detection and analysis

export interface CardMarkerDef {
  id: number;
  name: string;
  xMm: number;
  yMm: number;
  sizeMm: number;
  cornersMm: [number, number][]; // [TL, TR, BR, BL]
  canonicalCorners: [number, number][]; // in 850x550 canonical pixels (10 px/mm)
}

export interface PatchROI {
  name: string;
  nominalHex: string;
  nominalRgb: [number, number, number];
  xMm: number;
  yMm: number;
  wMm: number;
  hMm: number;
  canonicalRoi: { x: number; y: number; w: number; h: number };
}

export const CARD_WIDTH_MM = 85;
export const CARD_HEIGHT_MM = 55;
export const SCALE_PX_PER_MM = 10;
export const CANONICAL_WIDTH = 850;
export const CANONICAL_HEIGHT = 550;

// 4 ArUco markers: ARUCO_MIP_36h12, size 10x10 mm
export const MARKER_DEFINITIONS: CardMarkerDef[] = [
  {
    id: 0,
    name: 'top-left',
    xMm: 3,
    yMm: 3,
    sizeMm: 10,
    cornersMm: [
      [3, 3],
      [13, 3],
      [13, 13],
      [3, 13],
    ],
    canonicalCorners: [
      [30, 30],
      [130, 30],
      [130, 130],
      [30, 130],
    ],
  },
  {
    id: 1,
    name: 'top-right',
    xMm: 72,
    yMm: 3,
    sizeMm: 10,
    cornersMm: [
      [72, 3],
      [82, 3],
      [82, 13],
      [72, 13],
    ],
    canonicalCorners: [
      [720, 30],
      [820, 30],
      [820, 130],
      [720, 130],
    ],
  },
  {
    id: 2,
    name: 'bottom-right',
    xMm: 72,
    yMm: 42,
    sizeMm: 10,
    cornersMm: [
      [72, 42],
      [82, 42],
      [82, 52],
      [72, 52],
    ],
    canonicalCorners: [
      [720, 420],
      [820, 420],
      [820, 520],
      [720, 520],
    ],
  },
  {
    id: 3,
    name: 'bottom-left',
    xMm: 3,
    yMm: 42,
    sizeMm: 10,
    cornersMm: [
      [3, 42],
      [13, 42],
      [13, 52],
      [3, 52],
    ],
    canonicalCorners: [
      [30, 420],
      [130, 420],
      [130, 520],
      [30, 520],
    ],
  },
];

// 6 reference patches nominal sRGB
// W #F5F5F2, G #9A9A96, 0 #E9C226, 1 #D0862A, 2 #9E2F25, B+ #2F3B2A
// Inner ROI: x + 1.5, y 15.6, w 4.5, h 4.8 mm
export const REFERENCE_PATCHES: PatchROI[] = [
  {
    name: 'W',
    nominalHex: '#F5F5F2',
    nominalRgb: [245, 245, 242],
    xMm: 17.0,
    yMm: 14.0,
    wMm: 7.5,
    hMm: 8.0,
    canonicalRoi: { x: 185, y: 156, w: 45, h: 48 },
  },
  {
    name: 'G',
    nominalHex: '#9A9A96',
    nominalRgb: [154, 154, 150],
    xMm: 25.6,
    yMm: 14.0,
    wMm: 7.5,
    hMm: 8.0,
    canonicalRoi: { x: 271, y: 156, w: 45, h: 48 },
  },
  {
    name: '0',
    nominalHex: '#E9C226',
    nominalRgb: [233, 194, 38],
    xMm: 34.2,
    yMm: 14.0,
    wMm: 7.5,
    hMm: 8.0,
    canonicalRoi: { x: 357, y: 156, w: 45, h: 48 },
  },
  {
    name: '1',
    nominalHex: '#D0862A',
    nominalRgb: [208, 134, 42],
    xMm: 42.8,
    yMm: 14.0,
    wMm: 7.5,
    hMm: 8.0,
    canonicalRoi: { x: 443, y: 156, w: 45, h: 48 },
  },
  {
    name: '2',
    nominalHex: '#9E2F25',
    nominalRgb: [158, 47, 37],
    xMm: 51.4,
    yMm: 14.0,
    wMm: 7.5,
    hMm: 8.0,
    canonicalRoi: { x: 529, y: 156, w: 45, h: 48 },
  },
  {
    name: 'B+',
    nominalHex: '#2F3B2A',
    nominalRgb: [47, 59, 42],
    xMm: 60.0,
    yMm: 14.0,
    wMm: 7.5,
    hMm: 8.0,
    canonicalRoi: { x: 615, y: 156, w: 45, h: 48 },
  },
];

// Pad Slot & Inner ROI
// slot: x 36, y 30, w 15, h 10 mm
// sample inner ROI: x 38, y 32, w 11, h 6 mm
export const PAD_INNER_ROI = {
  xMm: 38,
  yMm: 32,
  wMm: 11,
  hMm: 6,
  canonicalRoi: { x: 380, y: 320, w: 110, h: 60 },
};

// Quality Check Thresholds
export const QUALITY_CONFIG = {
  BLUR_MIN: 60, // Variance of Laplacian
  MIN_MARKER_SIDE_PX: 40,
  MIN_MARKERS: 3,
  GLARE_THRESHOLD_VAL: 250,
  GLARE_MAX_PCT: 0.02, // 2%
  EXPOSURE_W_MEAN_G_MIN: 90,
  EXPOSURE_W_MEAN_G_MAX: 250,
  PAD_DELTA_E_MIN: 12, // ΔE76 from W < 12 -> pad missing
  PAD_SD_G_MAX: 18, // SD of G in pad ROI > 18 -> pad uneven / displaced
};

// Default batch calibration (BN-2611-01 DEMO)
export interface BatchCalibration {
  v: number;
  batch: string;
  m: number;
  b: number;
  sy: number;
  g0: number;
  lod: number;
  cut: number;
  lin: number;
  dL: number;
  aMax: number;
  made: string;
  exp: string;
  isDemo?: boolean;
}

export const DEMO_BATCH: BatchCalibration = {
  v: 1,
  batch: 'BN-2611-01',
  m: 0.974,
  b: 0.002,
  sy: 0.006,
  g0: 1.0,
  lod: 0.020,
  cut: 0.10,
  lin: 0.25,
  dL: -10,
  aMax: 5,
  made: '2026-11-03',
  exp: '2026-12-31',
  isDemo: true,
};

export const BPOM_WHATSAPP_NUMBER = '628119181533';
