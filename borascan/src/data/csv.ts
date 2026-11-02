// CSV generation and Batch Analysis for Research Mode experiments

import { PipelineResult } from '../core/pipeline.ts';

export interface BatchAnalysisRow {
  fileName: string;
  experiment: string;
  strip: string;
  sample: number;
  replicate: string;
  markers: number;
  blur: number;
  glare: number;
  wGRaw: number;
  padRRaw: number;
  padGRaw: number;
  padBRaw: number;
  padRCorr: number;
  padGCorr: number;
  padBCorr: number;
  Gn: number;
  A_G: number;
  uncorrectedAG?: number;
  L: number;
  a: number;
  b: number;
  estimatePct: number;
  category: string;
  ok: boolean;
  reason: string;
}

// Parse filenames like KAL_S2_0.25_r1.jpg into { experiment, strip, sample, replicate }
export function parseExperimentFilename(name: string): {
  experiment: string;
  strip: string;
  sample: number;
  replicate: string;
} {
  const base = name.replace(/\.[^/.]+$/, '');
  const parts = base.split('_');

  const experiment = parts[0] || 'EXP';
  const strip = parts[1] || 'S1';
  const sampleNum = parseFloat(parts[2]);
  const sample = isNaN(sampleNum) ? 0 : sampleNum;
  const replicate = parts[3] || 'r1';

  return { experiment, strip, sample, replicate };
}

export function pipelineResultToRow(
  fileName: string,
  result: PipelineResult,
  includeUncorrected = true
): BatchAnalysisRow {
  const parsed = parseExperimentFilename(fileName);

  return {
    fileName,
    experiment: parsed.experiment,
    strip: parsed.strip,
    sample: parsed.sample,
    replicate: parsed.replicate,
    markers: result.markers.matchedCount,
    blur: Number(result.quality.metrics.laplacianVariance.toFixed(1)),
    glare: Number((result.quality.metrics.glarePadPct * 100).toFixed(2)),
    wGRaw: result.rawWRGB[1],
    padRRaw: result.rawPadRGB[0],
    padGRaw: result.rawPadRGB[1],
    padBRaw: result.rawPadRGB[2],
    padRCorr: result.correctedPadRGB[0],
    padGCorr: result.correctedPadRGB[1],
    padBCorr: result.correctedPadRGB[2],
    Gn: Number(result.estimate.Gn.toFixed(4)),
    A_G: Number(result.estimate.A_G.toFixed(4)),
    uncorrectedAG: includeUncorrected ? Number(result.uncorrectedAG.toFixed(4)) : undefined,
    L: Number(result.correctedPadLab.L.toFixed(2)),
    a: Number(result.correctedPadLab.a.toFixed(2)),
    b: Number(result.correctedPadLab.b.toFixed(2)),
    estimatePct: Number(result.estimate.xClampedPct.toFixed(4)),
    category: result.category,
    ok: result.success,
    reason: result.quality.reasonEn || (result.success ? 'OK' : 'Error'),
  };
}

export function exportRowsToCSV(rows: BatchAnalysisRow[], includeUncorrected = true): string {
  const headers = [
    'file',
    'experiment',
    'strip',
    'sample',
    'replicate',
    'markers',
    'blur',
    'glare',
    'W_G_raw',
    'pad_R_raw',
    'pad_G_raw',
    'pad_B_raw',
    'pad_R_corr',
    'pad_G_corr',
    'pad_B_corr',
    'Gn',
    'A_G',
    ...(includeUncorrected ? ['uncorrected_A_G'] : []),
    'L',
    'a',
    'b',
    'estimate_pct',
    'category',
    'ok',
    'reason',
  ];

  const escapeCSV = (val: any) => {
    if (val === undefined || val === null) return '';
    const str = String(val);
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const lines = [headers.join(',')];

  for (const r of rows) {
    const fields = [
      escapeCSV(r.fileName),
      escapeCSV(r.experiment),
      escapeCSV(r.strip),
      r.sample,
      escapeCSV(r.replicate),
      r.markers,
      r.blur,
      r.glare,
      r.wGRaw,
      r.padRRaw,
      r.padGRaw,
      r.padBRaw,
      r.padRCorr,
      r.padGCorr,
      r.padBCorr,
      r.Gn,
      r.A_G,
      ...(includeUncorrected ? [r.uncorrectedAG] : []),
      r.L,
      r.a,
      r.b,
      r.estimatePct,
      escapeCSV(r.category),
      r.ok ? 'TRUE' : 'FALSE',
      escapeCSV(r.reason),
    ];
    lines.push(fields.join(','));
  }

  return lines.join('\n');
}

// Linear regression fitting for creating a new batch calibration from research data
export function fitBatchCalibrationFromRows(
  rows: BatchAnalysisRow[],
  linLimit = 0.25
): {
  m: number;
  b: number;
  r2: number;
  sy: number;
  lod: number;
  g0: number;
  blankCount: number;
} | null {
  // Filter rows within linear range [0, linLimit] that passed quality checks
  const valid = rows.filter((r) => r.ok && r.sample >= 0 && r.sample <= linLimit);
  if (valid.length < 3) return null;

  // Extract blanks (sample === 0)
  const blanks = valid.filter((r) => r.sample === 0);
  const blankCount = blanks.length;
  const g0 =
    blankCount > 0 ? blanks.reduce((acc, r) => acc + r.Gn, 0) / blankCount : 1.0;

  // Linear regression A_G (y) vs sample % (x)
  const n = valid.length;
  let sumX = 0;
  let sumY = 0;
  let sumXY = 0;
  let sumX2 = 0;
  let sumY2 = 0;

  for (const row of valid) {
    const x = row.sample;
    const y = row.A_G;
    sumX += x;
    sumY += y;
    sumXY += x * y;
    sumX2 += x * x;
    sumY2 += y * y;
  }

  const denom = n * sumX2 - sumX * sumX;
  if (Math.abs(denom) < 1e-12) return null;

  const m = (n * sumXY - sumX * sumY) / denom;
  const b = (sumY - m * sumX) / n;

  // Residual standard error sy = sqrt( sum( (yi - (m*xi + b))^2 ) / (n - 2) )
  let sumResidualSq = 0;
  const meanY = sumY / n;
  let totalSS = 0;
  for (const row of valid) {
    const pred = m * row.sample + b;
    const res = row.A_G - pred;
    sumResidualSq += res * res;
    totalSS += (row.A_G - meanY) * (row.A_G - meanY);
  }

  const sy = n > 2 ? Math.sqrt(sumResidualSq / (n - 2)) : 0.005;
  const r2 = totalSS > 0 ? Math.max(0, 1.0 - sumResidualSq / totalSS) : 1.0;

  // LOD = 3.3 * SD(blank A_G) / m
  let lod = 0.02;
  if (blankCount >= 2 && Math.abs(m) > 1e-6) {
    const meanBlankAG = blanks.reduce((acc, r) => acc + r.A_G, 0) / blankCount;
    let varBlankAG = 0;
    for (const blk of blanks) {
      const diff = blk.A_G - meanBlankAG;
      varBlankAG += diff * diff;
    }
    const sdBlankAG = Math.sqrt(varBlankAG / (blankCount - 1));
    lod = (3.3 * sdBlankAG) / Math.abs(m);
  }

  return {
    m: Number(m.toFixed(4)),
    b: Number(b.toFixed(4)),
    r2: Number(r2.toFixed(4)),
    sy: Number(sy.toFixed(4)),
    lod: Number(lod.toFixed(4)),
    g0: Number(g0.toFixed(4)),
    blankCount,
  };
}
