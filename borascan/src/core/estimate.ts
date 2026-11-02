// Calculation of signal, optical absorbance, and quantitative borax estimation

import { BatchCalibration } from './config.ts';
import { Lab } from './colour.ts';

export interface BoraxEstimateResult {
  Gn: number; // Normalized green: G_pad_corr / G_W_corr
  A_G: number; // Absorbance: -log10(Gn / g0)
  xPct: number; // Estimated % w/w
  xClampedPct: number; // Clamped at >= 0
  isAboveLinear: boolean; // x > lin
  mgPerKg: number; // x * 10,000
  rangeLoPct: number; // x - 2 * sy / m, clamped at 0
  rangeHiPct: number; // x + 2 * sy / m
  rangeLoMgKg: number;
  rangeHiMgKg: number;
  displayTextPct: string;
  displayTextMgKg: string;
  displayRangePct: string;
}

export function computeBoraxEstimate(
  G_pad_corr: number,
  G_W_corr: number,
  batch: BatchCalibration
): BoraxEstimateResult {
  // Avoid division by zero
  const safeGW = Math.max(1e-6, G_W_corr);
  const Gn = G_pad_corr / safeGW;

  const safeG0 = Math.max(1e-6, batch.g0 || 1.0);
  const ratio = Math.max(1e-6, Gn / safeG0);
  const A_G = -Math.log10(ratio);

  const m = batch.m;
  const b = batch.b;
  const sy = batch.sy;
  const lin = batch.lin;

  // x = (A_G - b) / m
  const x = (A_G - b) / m;
  const xClamped = Math.max(0, x);
  const isAboveLinear = x > lin;

  const delta = (2.0 * sy) / Math.abs(m);
  const rangeLoPct = Math.max(0, x - delta);
  const rangeHiPct = Math.max(0, x + delta);

  const mgPerKg = Math.round(xClamped * 10000);
  const rangeLoMgKg = Math.round(rangeLoPct * 10000);
  const rangeHiMgKg = Math.round(rangeHiPct * 10000);

  // Formatting with comma for Indonesian decimal
  const formatPct = (val: number) => val.toFixed(2).replace('.', ',');
  const formatMg = (val: number) => val.toLocaleString('id-ID');

  let displayTextPct = `${formatPct(xClamped)} %`;
  if (isAboveLinear) {
    displayTextPct = `> ${formatPct(lin)} %`;
  }

  const displayTextMgKg = `${formatMg(mgPerKg)} mg/kg`;
  const displayRangePct = `${formatPct(rangeLoPct)}–${formatPct(rangeHiPct)} %`;

  return {
    Gn,
    A_G,
    xPct: x,
    xClampedPct: xClamped,
    isAboveLinear,
    mgPerKg,
    rangeLoPct,
    rangeHiPct,
    rangeLoMgKg,
    rangeHiMgKg,
    displayTextPct,
    displayTextMgKg,
    displayRangePct,
  };
}

// Ammonia confirmation test decision
export function checkAmmoniaConfirmation(
  labBefore: Lab,
  labAfter: Lab,
  batch: BatchCalibration
): { isPositive: boolean; dL: number; aAfter: number } {
  const dLMeasured = labAfter.L - labBefore.L;
  const aAfterMeasured = labAfter.a;

  const dLThreshold = batch.dL ?? -10;
  const aMaxThreshold = batch.aMax ?? 5;

  // B+ if L*_after - L*_before <= dL AND a*_after <= aMax
  const isPositive = dLMeasured <= dLThreshold && aAfterMeasured <= aMaxThreshold;

  return {
    isPositive,
    dL: dLMeasured,
    aAfter: aAfterMeasured,
  };
}
