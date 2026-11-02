import { describe, it, expect } from 'vitest';
import {
  sRGBToLinear,
  linearToSRGB,
  fitColorCorrectionMatrix,
  applyColorCorrection,
  xyzToLab,
  linearToXYZ,
  RGB,
  LinearRGB,
} from '../src/core/colour.ts';
import {
  findHomography,
  transformPoint,
  Point2D,
} from '../src/core/homography.ts';
import {
  computeBoraxEstimate,
  checkAmmoniaConfirmation,
} from '../src/core/estimate.ts';
import {
  determineInitialCategory,
  CATEGORIES,
} from '../src/core/categories.ts';
import { DEMO_BATCH } from '../src/core/config.ts';

describe('BoraScan Core Math & Algorithms', () => {
  it('sRGB <-> Linear RGB round trip preserves standard colors', () => {
    const testColors: RGB[] = [
      [0, 0, 0],
      [255, 255, 255],
      [128, 128, 128],
      [233, 194, 38], // nominal '0' patch
      [208, 134, 42], // nominal '1' patch
      [158, 47, 37],  // nominal '2' patch
    ];

    for (const original of testColors) {
      const linear = sRGBToLinear(original);
      const reconstructed = linearToSRGB(linear);
      expect(Math.abs(reconstructed[0] - original[0])).toBeLessThanOrEqual(1);
      expect(Math.abs(reconstructed[1] - original[1])).toBeLessThanOrEqual(1);
      expect(Math.abs(reconstructed[2] - original[2])).toBeLessThanOrEqual(1);
    }
  });

  it('Least squares matrix fitting recovers identity when measured matches reference', () => {
    const refs: LinearRGB[] = [
      [0.9, 0.9, 0.9],
      [0.5, 0.5, 0.5],
      [0.8, 0.6, 0.1],
      [0.6, 0.3, 0.1],
      [0.4, 0.1, 0.1],
      [0.1, 0.1, 0.1],
    ];

    const M = fitColorCorrectionMatrix(refs, refs);
    // Should be close to 3x3 identity
    expect(M[0][0]).toBeCloseTo(1.0, 2);
    expect(M[1][1]).toBeCloseTo(1.0, 2);
    expect(M[2][2]).toBeCloseTo(1.0, 2);
    expect(M[0][1]).toBeCloseTo(0.0, 2);
    expect(M[1][0]).toBeCloseTo(0.0, 2);
  });

  it('Color correction matrix scales channel values accurately', () => {
    const refs: LinearRGB[] = [
      [0.8, 0.8, 0.8],
      [0.5, 0.5, 0.5],
      [0.7, 0.5, 0.1],
      [0.5, 0.3, 0.1],
      [0.3, 0.1, 0.1],
      [0.1, 0.1, 0.1],
    ];
    // Suppose measured has 20% dimmer green
    const measured: LinearRGB[] = refs.map(([r, g, b]) => [r, g * 0.8, b]);
    const M = fitColorCorrectionMatrix(measured, refs);

    const testInput: LinearRGB = [0.5, 0.4, 0.3];
    const corrected = applyColorCorrection(testInput, M);
    // Green channel should be scaled back up
    expect(corrected[1]).toBeCloseTo(0.5, 2);
  });

  it('Homography DLT maps four card corners accurately under perspective transform', () => {
    // Canonical rectangle
    const dst: Point2D[] = [
      { x: 30, y: 30 },
      { x: 820, y: 30 },
      { x: 820, y: 520 },
      { x: 30, y: 520 },
    ];
    // Skewed source coordinates (perspective view)
    const src: Point2D[] = [
      { x: 80, y: 60 },
      { x: 900, y: 40 },
      { x: 850, y: 600 },
      { x: 50, y: 550 },
    ];

    const H = findHomography(src, dst);
    expect(H).not.toBeNull();

    if (H) {
      for (let i = 0; i < 4; i++) {
        const mapped = transformPoint(H, src[i]);
        expect(mapped.x).toBeCloseTo(dst[i].x, 0);
        expect(mapped.y).toBeCloseTo(dst[i].y, 0);
      }
    }
  });

  it('Borax estimate calculates absorbance and concentrations correctly', () => {
    // Given G_pad_corr = 0.5, G_W_corr = 1.0 => Gn = 0.5
    // A_G = -log10(0.5 / 1.0) = 0.30103
    // x = (0.30103 - b) / m
    const res = computeBoraxEstimate(0.5, 1.0, DEMO_BATCH);
    expect(res.Gn).toBeCloseTo(0.5, 3);
    expect(res.A_G).toBeCloseTo(0.30103, 3);
    const expectedX = (0.30103 - DEMO_BATCH.b) / DEMO_BATCH.m;
    expect(res.xPct).toBeCloseTo(expectedX, 3);
    expect(res.mgPerKg).toBe(Math.round(Math.max(0, expectedX) * 10000));
  });

  it('Category rules correctly classify concentration thresholds', () => {
    // lod = 0.02, cut = 0.10
    expect(determineInitialCategory(0.015, 0.02, 0.10)).toBe('0');
    expect(determineInitialCategory(0.05, 0.02, 0.10)).toBe('1');
    expect(determineInitialCategory(0.15, 0.02, 0.10)).toBe('2');
  });

  it('Ammonia test confirms positive B+ when dL <= dLThreshold and aAfter <= aMax', () => {
    // Before ammonia: pad has L*=55, a*=20
    const labBefore = { L: 55, a: 20, b: 15 };
    // After ammonia: turned dark greenish-black: L*=40 (dL = -15 <= -10), a*=2 (<= 5)
    const labAfterPositive = { L: 40, a: 2, b: 10 };
    const posDecision = checkAmmoniaConfirmation(labBefore, labAfterPositive, DEMO_BATCH);
    expect(posDecision.isPositive).toBe(true);

    // Negative case (just alkaline, no greenish-black drop in L* or high red remaining)
    const labAfterNegative = { L: 50, a: 12, b: 15 }; // dL = -5 (not <= -10)
    const negDecision = checkAmmoniaConfirmation(labBefore, labAfterNegative, DEMO_BATCH);
    expect(negDecision.isPositive).toBe(false);
  });

  it('Accessible categories contain distinct WCAG patterns and Okabe-Ito colors', () => {
    const codes = ['0', '1', '2', 'B+', 'B-'] as const;
    const colors = new Set<string>();
    const patterns = new Set<string>();

    for (const code of codes) {
      const cat = CATEGORIES[code];
      expect(cat.symbol).toBeTruthy();
      expect(cat.messageId).toBeTruthy();
      expect(cat.vibrationPattern.length).toBeGreaterThan(0);
      colors.add(cat.hexColor);
      patterns.add(cat.pattern);
    }

    // Every code has an accessible color and pattern
    expect(colors.size).toBe(5);
    expect(patterns.size).toBe(5);
  });
});
