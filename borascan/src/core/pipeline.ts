// Full image processing pipeline for BoraScan test strip reading

import {
  CANONICAL_WIDTH,
  CANONICAL_HEIGHT,
  REFERENCE_PATCHES,
  PAD_INNER_ROI,
  BatchCalibration,
  QUALITY_CONFIG,
} from './config.ts';
import { detectCardMarkers, MarkerDetectionResult } from './aruco.ts';
import { findHomography, warpImageBilinear, Matrix3x3 } from './homography.ts';
import {
  RGB,
  LinearRGB,
  Lab,
  sRGBToLinear,
  linearToSRGB,
  fitColorCorrectionMatrix,
  applyColorCorrection,
  linearToXYZ,
  xyzToLab,
  extractRoiMedianRGB,
} from './colour.ts';
import {
  computeLaplacianVariance,
  performQualityChecks,
  QualityCheckResult,
} from './quality.ts';
import {
  computeBoraxEstimate,
  checkAmmoniaConfirmation,
  BoraxEstimateResult,
} from './estimate.ts';
import {
  ResultCategoryCode,
  determineInitialCategory,
  CATEGORIES,
} from './categories.ts';

export interface PipelineResult {
  success: boolean;
  quality: QualityCheckResult;
  markers: MarkerDetectionResult;
  homography: Matrix3x3 | null;
  canonicalImageData?: ImageData;
  canonicalDataUrl?: string;

  // Color measurements
  measuredPatchesLinear: Record<string, LinearRGB>;
  referencePatchesLinear: Record<string, LinearRGB>;
  colorCorrectionMatrix: Matrix3x3 | null;

  // Raw & Corrected values
  rawPadRGB: RGB;
  rawWRGB: RGB;
  rawGRGB: RGB;
  correctedPadRGB: RGB;
  correctedWRGB: RGB;
  correctedPadLab: Lab;
  correctedWLab: Lab;

  // Uncorrected metrics (for research lighting experiment)
  uncorrectedGn: number;
  uncorrectedAG: number;

  // Quantitative Borax result
  estimate: BoraxEstimateResult;
  category: ResultCategoryCode;
  categoryInfo: (typeof CATEGORIES)[ResultCategoryCode];

  // Ammonia comparison if second scan
  ammoniaDecision?: {
    isPositive: boolean;
    dL: number;
    aAfter: number;
  };
}

export interface PipelineOptions {
  batch: BatchCalibration;
  isAmmoniaScan?: boolean;
  firstScanPadLab?: Lab;
  customQualityConfig?: typeof QUALITY_CONFIG;
}

// Convert ImageData to canvas data URL for UI display and IndexedDB storage
export function imageDataToDataUrl(imageData: ImageData): string {
  if (typeof document === 'undefined') return '';
  const canvas = document.createElement('canvas');
  canvas.width = imageData.width;
  canvas.height = imageData.height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';
  ctx.putImageData(imageData, 0, 0);
  return canvas.toDataURL('image/jpeg', 0.85);
}

// Execute complete BoraScan image pipeline on an input ImageData
export function processCardImage(
  inputImageData: ImageData,
  options: PipelineOptions
): PipelineResult {
  const { batch, isAmmoniaScan = false, firstScanPadLab, customQualityConfig } = options;

  // Step 1: Detect ArUco markers
  const markers = detectCardMarkers(inputImageData);

  let minMarkerSidePx = 0;
  if (markers.detectedMarkers.length > 0) {
    minMarkerSidePx = Math.min(...markers.detectedMarkers.map((m) => m.sideLengthPx));
  }

  // If fewer than 3 markers, fail fast on quality check
  if (markers.matchedCount < 3) {
    const dummyLab: Lab = { L: 0, a: 0, b: 0 };
    const quality = performQualityChecks({
      markerCount: markers.matchedCount,
      minMarkerSidePx,
      laplacianVariance: 0,
      glarePadPct: 0,
      glareWPct: 0,
      meanGW: 0,
      padLab: dummyLab,
      wLab: dummyLab,
      padSdG: 0,
      config: customQualityConfig,
    });

    const fallbackCat: ResultCategoryCode = '0';
    return {
      success: false,
      quality,
      markers,
      homography: null,
      measuredPatchesLinear: {},
      referencePatchesLinear: {},
      colorCorrectionMatrix: null,
      rawPadRGB: [0, 0, 0],
      rawWRGB: [0, 0, 0],
      rawGRGB: [0, 0, 0],
      correctedPadRGB: [0, 0, 0],
      correctedWRGB: [0, 0, 0],
      correctedPadLab: dummyLab,
      correctedWLab: dummyLab,
      uncorrectedGn: 0,
      uncorrectedAG: 0,
      estimate: computeBoraxEstimate(0, 1, batch),
      category: fallbackCat,
      categoryInfo: CATEGORIES[fallbackCat],
    };
  }

  // Step 2: Compute Homography mapping from source corners to canonical corners
  const H = findHomography(markers.srcPoints, markers.dstPoints);
  if (!H) {
    const dummyLab: Lab = { L: 0, a: 0, b: 0 };
    const quality = performQualityChecks({
      markerCount: markers.matchedCount,
      minMarkerSidePx,
      laplacianVariance: 0,
      glarePadPct: 0,
      glareWPct: 0,
      meanGW: 0,
      padLab: dummyLab,
      wLab: dummyLab,
      padSdG: 0,
      config: customQualityConfig,
    });
    const fallbackCat: ResultCategoryCode = '0';
    return {
      success: false,
      quality: {
        ...quality,
        passed: false,
        code: 'FEW_MARKERS',
        reasonId: 'Kartu tidak terdeteksi dengan tepat',
        reasonEn: 'Could not compute card perspective',
      },
      markers,
      homography: null,
      measuredPatchesLinear: {},
      referencePatchesLinear: {},
      colorCorrectionMatrix: null,
      rawPadRGB: [0, 0, 0],
      rawWRGB: [0, 0, 0],
      rawGRGB: [0, 0, 0],
      correctedPadRGB: [0, 0, 0],
      correctedWRGB: [0, 0, 0],
      correctedPadLab: dummyLab,
      correctedWLab: dummyLab,
      uncorrectedGn: 0,
      uncorrectedAG: 0,
      estimate: computeBoraxEstimate(0, 1, batch),
      category: fallbackCat,
      categoryInfo: CATEGORIES[fallbackCat],
    };
  }

  // Step 3: Warp with bilinear sampling into canonical 850x550
  const canonicalImg = warpImageBilinear(inputImageData, H, CANONICAL_WIDTH, CANONICAL_HEIGHT);

  // Step 4: Extract Colors from Reference Patches
  const measuredLinearList: LinearRGB[] = [];
  const referenceLinearList: LinearRGB[] = [];
  const measuredPatchesLinear: Record<string, LinearRGB> = {};
  const referencePatchesLinear: Record<string, LinearRGB> = {};

  let wMedianRGB: RGB = [255, 255, 255];
  let wMeanRGB: RGB = [255, 255, 255];
  let wGlarePct = 0;
  let gMedianRGB: RGB = [128, 128, 128];

  for (const patch of REFERENCE_PATCHES) {
    const stats = extractRoiMedianRGB(canonicalImg, patch.canonicalRoi);
    const mLinear = sRGBToLinear(stats.medianRGB);
    const rLinear = sRGBToLinear(patch.nominalRgb);

    measuredPatchesLinear[patch.name] = mLinear;
    referencePatchesLinear[patch.name] = rLinear;

    measuredLinearList.push(mLinear);
    referenceLinearList.push(rLinear);

    if (patch.name === 'W') {
      wMedianRGB = stats.medianRGB;
      wMeanRGB = stats.meanRGB;
      wGlarePct = stats.glarePixelPct;
    } else if (patch.name === 'G') {
      gMedianRGB = stats.medianRGB;
    }
  }

  // Extract Pad ROI
  const padStats = extractRoiMedianRGB(canonicalImg, PAD_INNER_ROI.canonicalRoi);
  const padMedianRGB = padStats.medianRGB;
  const padLinear = sRGBToLinear(padMedianRGB);

  // Step 5: Fit 3x3 color correction matrix M
  const M = fitColorCorrectionMatrix(measuredLinearList, referenceLinearList);

  // Correct pad and white patch
  const correctedPadLinear = applyColorCorrection(padLinear, M);
  const correctedWLinear = applyColorCorrection(sRGBToLinear(wMedianRGB), M);

  const correctedPadRGB = linearToSRGB(correctedPadLinear);
  const correctedWRGB = linearToSRGB(correctedWLinear);

  const correctedPadXYZ = linearToXYZ(correctedPadLinear);
  const correctedPadLab = xyzToLab(correctedPadXYZ);

  const correctedWXYZ = linearToXYZ(correctedWLinear);
  const correctedWLab = xyzToLab(correctedWXYZ);

  // Sharpness metric: variance of Laplacian on canonical image
  const laplacianVar = computeLaplacianVariance(canonicalImg);

  // Step 6: Quality Checks
  const quality = performQualityChecks({
    markerCount: markers.matchedCount,
    minMarkerSidePx,
    laplacianVariance: laplacianVar,
    glarePadPct: padStats.glarePixelPct,
    glareWPct: wGlarePct,
    meanGW: wMeanRGB[1],
    padLab: correctedPadLab,
    wLab: correctedWLab,
    padSdG: padStats.sdG,
    config: customQualityConfig,
  });

  // Step 7: Signal & Borax Estimate
  // Corrected Green Signal: Gn = G_pad_corr / G_W_corr
  const estimate = computeBoraxEstimate(correctedPadLinear[1], correctedWLinear[1], batch);

  // Uncorrected Signal for research mode
  const uncorrectedGn = padLinear[1] / Math.max(1e-6, sRGBToLinear(wMedianRGB)[1]);
  const uncorrectedAG = -Math.log10(Math.max(1e-6, uncorrectedGn / (batch.g0 || 1.0)));

  // Step 8: Category Determination
  let category: ResultCategoryCode;
  let ammoniaDecision: { isPositive: boolean; dL: number; aAfter: number } | undefined;

  if (isAmmoniaScan && firstScanPadLab) {
    ammoniaDecision = checkAmmoniaConfirmation(firstScanPadLab, correctedPadLab, batch);
    category = ammoniaDecision.isPositive ? 'B+' : 'B-';
  } else {
    category = determineInitialCategory(estimate.xPct, batch.lod, batch.cut);
  }

  const categoryInfo = CATEGORIES[category];

  return {
    success: quality.passed,
    quality,
    markers,
    homography: H,
    canonicalImageData: canonicalImg,
    canonicalDataUrl: imageDataToDataUrl(canonicalImg),
    measuredPatchesLinear,
    referencePatchesLinear,
    colorCorrectionMatrix: M,
    rawPadRGB: padMedianRGB,
    rawWRGB: wMedianRGB,
    rawGRGB: gMedianRGB,
    correctedPadRGB,
    correctedWRGB,
    correctedPadLab,
    correctedWLab,
    uncorrectedGn,
    uncorrectedAG,
    estimate,
    category,
    categoryInfo,
    ammoniaDecision,
  };
}
