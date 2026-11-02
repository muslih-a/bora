// Color space transformations, least-squares color correction matrix fitting,
// and CIELAB color coordinate calculations.

import { Matrix3x3, invert3x3 } from './homography.ts';

export type RGB = [number, number, number]; // 0-255
export type LinearRGB = [number, number, number]; // 0.0 - 1.0
export type XYZ = [number, number, number];
export type Lab = { L: number; a: number; b: number };

// IEC 61966-2-1: sRGB (0-255) to Linear RGB (0-1)
export function sRGBToLinear(rgb: RGB): LinearRGB {
  return rgb.map((val) => {
    const c = Math.max(0, Math.min(255, val)) / 255.0;
    return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  }) as LinearRGB;
}

// IEC 61966-2-1: Linear RGB (0-1) to sRGB (0-255)
export function linearToSRGB(linear: LinearRGB): RGB {
  return linear.map((val) => {
    const c = Math.max(0, val);
    const s = c <= 0.0031308 ? 12.92 * c : 1.055 * Math.pow(c, 1.0 / 2.4) - 0.055;
    return Math.max(0, Math.min(255, Math.round(s * 255.0)));
  }) as RGB;
}

// Fit 3x3 color correction matrix M using least squares:
// X (6x3 measured linear) * M ≈ Y (6x3 reference linear)
// Normal equations: (X^T * X) * M = X^T * Y => M = inv(X^T * X) * (X^T * Y)
export function fitColorCorrectionMatrix(
  measuredLinear: LinearRGB[],
  referenceLinear: LinearRGB[]
): Matrix3x3 {
  if (measuredLinear.length < 3 || measuredLinear.length !== referenceLinear.length) {
    // Identity fallback
    return [
      [1, 0, 0],
      [0, 1, 0],
      [0, 0, 1],
    ];
  }

  const n = measuredLinear.length;

  // Compute X^T * X (3x3)
  const XTX: Matrix3x3 = [
    [0, 0, 0],
    [0, 0, 0],
    [0, 0, 0],
  ];
  for (let i = 0; i < n; i++) {
    const row = measuredLinear[i];
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 3; c++) {
        XTX[r][c] += row[r] * row[c];
      }
    }
  }

  // Compute X^T * Y (3x3)
  const XTY: Matrix3x3 = [
    [0, 0, 0],
    [0, 0, 0],
    [0, 0, 0],
  ];
  for (let i = 0; i < n; i++) {
    const xRow = measuredLinear[i];
    const yRow = referenceLinear[i];
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 3; c++) {
        XTY[r][c] += xRow[r] * yRow[c];
      }
    }
  }

  // Invert XTX
  const invXTX = invert3x3(XTX);
  if (!invXTX) {
    console.warn('Singular XTX in color correction matrix fitting, using identity');
    return [
      [1, 0, 0],
      [0, 1, 0],
      [0, 0, 1],
    ];
  }

  // M = invXTX * XTY
  const M: Matrix3x3 = [
    [0, 0, 0],
    [0, 0, 0],
    [0, 0, 0],
  ];
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      M[i][j] =
        invXTX[i][0] * XTY[0][j] +
        invXTX[i][1] * XTY[1][j] +
        invXTX[i][2] * XTY[2][j];
    }
  }

  return M;
}

// Apply 3x3 matrix M to measured linear RGB vector: [R, G, B] * M
export function applyColorCorrection(linear: LinearRGB, M: Matrix3x3): LinearRGB {
  const r = linear[0] * M[0][0] + linear[1] * M[1][0] + linear[2] * M[2][0];
  const g = linear[0] * M[0][1] + linear[1] * M[1][1] + linear[2] * M[2][1];
  const b = linear[0] * M[0][2] + linear[1] * M[1][2] + linear[2] * M[2][2];
  return [Math.max(0, r), Math.max(0, g), Math.max(0, b)];
}

// Linear RGB to CIE XYZ (D65, standard sRGB matrix)
export function linearToXYZ(linear: LinearRGB): XYZ {
  const [r, g, b] = linear;
  const X = 0.4124564 * r + 0.3575761 * g + 0.1804375 * b;
  const Y = 0.2126729 * r + 0.7151522 * g + 0.072175 * b;
  const Z = 0.0193339 * r + 0.119192 * g + 0.9503041 * b;
  return [X, Y, Z];
}

// CIE XYZ to CIELAB (D65 white point: Xn=0.95047, Yn=1.00000, Zn=1.08883)
export function xyzToLab(xyz: XYZ): Lab {
  const [X, Y, Z] = xyz;
  const Xn = 0.95047;
  const Yn = 1.0;
  const Zn = 1.08883;

  function f(t: number): number {
    return t > 0.008856 ? Math.cbrt(t) : 7.787 * t + 16.0 / 116.0;
  }

  const fx = f(X / Xn);
  const fy = f(Y / Yn);
  const fz = f(Z / Zn);

  const L = 116.0 * fy - 16.0;
  const a = 500.0 * (fx - fy);
  const b = 200.0 * (fy - fz);

  return { L, a, b };
}

// Convert sRGB directly to CIELAB
export function sRGBToLab(rgb: RGB): Lab {
  const linear = sRGBToLinear(rgb);
  const xyz = linearToXYZ(linear);
  return xyzToLab(xyz);
}

// CIE76 color difference: ΔE76 = sqrt((L1 - L2)^2 + (a1 - a2)^2 + (b1 - b2)^2)
export function deltaE76(lab1: Lab, lab2: Lab): number {
  const dL = lab1.L - lab2.L;
  const da = lab1.a - lab2.a;
  const db = lab1.b - lab2.b;
  return Math.sqrt(dL * dL + da * da + db * db);
}

// Extract median R, G, B of an ROI in an ImageData
export function extractRoiMedianRGB(
  imageData: ImageData,
  roi: { x: number; y: number; w: number; h: number }
): { medianRGB: RGB; meanRGB: RGB; sdG: number; glarePixelPct: number } {
  const { width, height, data } = imageData;
  const startX = Math.max(0, Math.floor(roi.x));
  const startY = Math.max(0, Math.floor(roi.y));
  const endX = Math.min(width, Math.floor(roi.x + roi.w));
  const endY = Math.min(height, Math.floor(roi.y + roi.h));

  const rVals: number[] = [];
  const gVals: number[] = [];
  const bVals: number[] = [];

  let sumR = 0;
  let sumG = 0;
  let sumB = 0;
  let glareCount = 0;
  let totalPixels = 0;

  for (let y = startY; y < endY; y++) {
    const rowOffset = y * width * 4;
    for (let x = startX; x < endX; x++) {
      const idx = rowOffset + x * 4;
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];

      rVals.push(r);
      gVals.push(g);
      bVals.push(b);

      sumR += r;
      sumG += g;
      sumB += b;
      totalPixels++;

      if (r >= 250 || g >= 250 || b >= 250) {
        glareCount++;
      }
    }
  }

  if (totalPixels === 0) {
    return {
      medianRGB: [0, 0, 0],
      meanRGB: [0, 0, 0],
      sdG: 0,
      glarePixelPct: 0,
    };
  }

  rVals.sort((a, b) => a - b);
  gVals.sort((a, b) => a - b);
  bVals.sort((a, b) => a - b);

  const mid = Math.floor(totalPixels / 2);
  const medianR = totalPixels % 2 === 0 ? Math.round((rVals[mid - 1] + rVals[mid]) / 2) : rVals[mid];
  const medianG = totalPixels % 2 === 0 ? Math.round((gVals[mid - 1] + gVals[mid]) / 2) : gVals[mid];
  const medianB = totalPixels % 2 === 0 ? Math.round((bVals[mid - 1] + bVals[mid]) / 2) : bVals[mid];

  const meanG = sumG / totalPixels;
  let varG = 0;
  for (const g of gVals) {
    const diff = g - meanG;
    varG += diff * diff;
  }
  const sdG = Math.sqrt(varG / totalPixels);

  return {
    medianRGB: [medianR, medianG, medianB],
    meanRGB: [Math.round(sumR / totalPixels), Math.round(meanG), Math.round(sumB / totalPixels)],
    sdG,
    glarePixelPct: glareCount / totalPixels,
  };
}
