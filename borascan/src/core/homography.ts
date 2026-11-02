// Homography estimation using Direct Linear Transformation (DLT) with point normalization
// and backward bilinear warping into canonical 850x550 canvas.

export interface Point2D {
  x: number;
  y: number;
}

export type Matrix3x3 = [
  [number, number, number],
  [number, number, number],
  [number, number, number]
];

// Hartley normalization for 2D points: translate centroid to origin and scale average distance to sqrt(2)
export function normalizePoints(points: Point2D[]): { normalized: Point2D[]; transform: Matrix3x3; invTransform: Matrix3x3 } {
  const n = points.length;
  if (n === 0) {
    throw new Error('Points array cannot be empty');
  }

  let meanX = 0;
  let meanY = 0;
  for (const p of points) {
    meanX += p.x;
    meanY += p.y;
  }
  meanX /= n;
  meanY /= n;

  let meanDist = 0;
  for (const p of points) {
    const dx = p.x - meanX;
    const dy = p.y - meanY;
    meanDist += Math.hypot(dx, dy);
  }
  meanDist /= n;

  const scale = meanDist > 1e-8 ? Math.SQRT2 / meanDist : 1.0;

  const transform: Matrix3x3 = [
    [scale, 0, -scale * meanX],
    [0, scale, -scale * meanY],
    [0, 0, 1],
  ];

  const invTransform: Matrix3x3 = [
    [1 / scale, 0, meanX],
    [0, 1 / scale, meanY],
    [0, 0, 1],
  ];

  const normalized = points.map((p) => ({
    x: scale * (p.x - meanX),
    y: scale * (p.y - meanY),
  }));

  return { normalized, transform, invTransform };
}

// Multiply two 3x3 matrices
export function multiply3x3(A: Matrix3x3, B: Matrix3x3): Matrix3x3 {
  const C: Matrix3x3 = [
    [0, 0, 0],
    [0, 0, 0],
    [0, 0, 0],
  ];
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      C[i][j] = A[i][0] * B[0][j] + A[i][1] * B[1][j] + A[i][2] * B[2][j];
    }
  }
  return C;
}

// Invert 3x3 matrix
export function invert3x3(m: Matrix3x3): Matrix3x3 | null {
  const a00 = m[0][0], a01 = m[0][1], a02 = m[0][2];
  const a10 = m[1][0], a11 = m[1][1], a12 = m[1][2];
  const a20 = m[2][0], a21 = m[2][1], a22 = m[2][2];

  const b01 = a22 * a11 - a12 * a21;
  const b11 = -a22 * a10 + a12 * a20;
  const b21 = a21 * a10 - a11 * a20;

  const det = a00 * b01 + a01 * b11 + a02 * b21;
  if (Math.abs(det) < 1e-12) return null;

  const invDet = 1.0 / det;

  return [
    [b01 * invDet, (-a22 * a01 + a02 * a21) * invDet, (a12 * a01 - a02 * a11) * invDet],
    [b11 * invDet, (a22 * a00 - a02 * a20) * invDet, (-a12 * a00 + a02 * a10) * invDet],
    [b21 * invDet, (-a21 * a00 + a01 * a20) * invDet, (a11 * a00 - a01 * a10) * invDet],
  ];
}

// Apply 3x3 homography to a 2D point: (u, v) = H * (x, y, 1)
export function transformPoint(H: Matrix3x3, pt: Point2D): Point2D {
  const z = H[2][0] * pt.x + H[2][1] * pt.y + H[2][2];
  const normZ = Math.abs(z) > 1e-9 ? z : 1e-9;
  return {
    x: (H[0][0] * pt.x + H[0][1] * pt.y + H[0][2]) / normZ,
    y: (H[1][0] * pt.x + H[1][1] * pt.y + H[1][2]) / normZ,
  };
}

// Solve 9x9 smallest eigenvector of ATA using Jacobi eigenvalue algorithm
function smallestEigenvector9x9(ATA: number[][]): number[] {
  const n = 9;
  const V: number[][] = Array.from({ length: n }, (_, i) =>
    Array.from({ length: n }, (_, j) => (i === j ? 1 : 0))
  );
  const A = ATA.map((row) => [...row]);

  const maxIter = 100;
  for (let iter = 0; iter < maxIter; iter++) {
    // Find largest off-diagonal element
    let maxOff = 0;
    let p = 0;
    let q = 1;
    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        const absVal = Math.abs(A[i][j]);
        if (absVal > maxOff) {
          maxOff = absVal;
          p = i;
          q = j;
        }
      }
    }

    if (maxOff < 1e-12) break;

    const diff = A[q][q] - A[p][p];
    let t: number;
    if (Math.abs(A[p][q]) < 1e-15) {
      t = 0;
    } else {
      const phi = diff / (2.0 * A[p][q]);
      t = 1.0 / (Math.abs(phi) + Math.sqrt(phi * phi + 1.0));
      if (phi < 0) t = -t;
    }

    const c = 1.0 / Math.sqrt(t * t + 1.0);
    const s = t * c;
    const tau = s / (1.0 + c);

    const App = A[p][p];
    const Aqq = A[q][q];
    const Apq = A[p][q];

    A[p][p] = App - t * Apq;
    A[q][q] = Aqq + t * Apq;
    A[p][q] = 0;
    A[q][p] = 0;

    for (let i = 0; i < n; i++) {
      if (i !== p && i !== q) {
        const Aip = A[i][p];
        const Aiq = A[i][q];
        A[i][p] = Aip - s * (Aiq + tau * Aip);
        A[p][i] = A[i][p];
        A[i][q] = Aiq + s * (Aip - tau * Aiq);
        A[q][i] = A[i][q];
      }
    }

    for (let i = 0; i < n; i++) {
      const Vip = V[i][p];
      const Viq = V[i][q];
      V[i][p] = Vip - s * (Viq + tau * Vip);
      V[i][q] = Viq + s * (Vip - tau * Viq);
    }
  }

  // Find index of smallest eigenvalue on diagonal of A
  let minIdx = 0;
  let minVal = A[0][0];
  for (let i = 1; i < n; i++) {
    if (A[i][i] < minVal) {
      minVal = A[i][i];
      minIdx = i;
    }
  }

  const result: number[] = [];
  for (let i = 0; i < n; i++) {
    result.push(V[i][minIdx]);
  }
  return result;
}

// Compute 3x3 Homography mapping srcPoints to dstPoints using Normalized DLT
// Need at least 4 points (8 equations). With 3 or 4 markers we have 12 or 16 points.
export function findHomography(srcPoints: Point2D[], dstPoints: Point2D[]): Matrix3x3 | null {
  if (srcPoints.length < 4 || srcPoints.length !== dstPoints.length) {
    return null;
  }

  const normSrc = normalizePoints(srcPoints);
  const normDst = normalizePoints(dstPoints);

  const numPoints = srcPoints.length;
  // Construct matrix A of size (2*numPoints) x 9
  // For each point:
  // [-xi, -yi, -1, 0, 0, 0, ui*xi, ui*yi, ui]
  // [0, 0, 0, -xi, -yi, -1, vi*xi, vi*yi, vi]
  const ATA: number[][] = Array.from({ length: 9 }, () => Array(9).fill(0));

  for (let i = 0; i < numPoints; i++) {
    const x = normSrc.normalized[i].x;
    const y = normSrc.normalized[i].y;
    const u = normDst.normalized[i].x;
    const v = normDst.normalized[i].y;

    const row1 = [-x, -y, -1, 0, 0, 0, u * x, u * y, u];
    const row2 = [0, 0, 0, -x, -y, -1, v * x, v * y, v];

    // Accumulate into ATA
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        ATA[r][c] += row1[r] * row1[c] + row2[r] * row2[c];
      }
    }
  }

  const h = smallestEigenvector9x9(ATA);
  const Hnorm: Matrix3x3 = [
    [h[0], h[1], h[2]],
    [h[3], h[4], h[5]],
    [h[6], h[7], h[8]],
  ];

  // Denormalize: H = inv(T_dst) * Hnorm * T_src
  const temp = multiply3x3(Hnorm, normSrc.transform);
  const H = multiply3x3(normDst.invTransform, temp);

  // Normalize scale so that H[2][2] is 1 (if not near zero)
  const normFactor = Math.abs(H[2][2]) > 1e-8 ? H[2][2] : 1.0;
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      H[i][j] /= normFactor;
    }
  }

  return H;
}

// Backward Bilinear Image Warping from source ImageData to target dimensions (850x550)
export function warpImageBilinear(
  srcImageData: ImageData,
  H_src_to_dst: Matrix3x3,
  targetWidth = 850,
  targetHeight = 550
): ImageData {
  // We need H_dst_to_src to map destination pixel (u, v) back to source (x, y)
  const H_inv = invert3x3(H_src_to_dst);
  if (!H_inv) {
    throw new Error('Homography matrix is singular and cannot be inverted');
  }

  const srcWidth = srcImageData.width;
  const srcHeight = srcImageData.height;
  const srcData = srcImageData.data;

  // Create target ImageData (works in DOM or standard canvas)
  const targetBuffer = new Uint8ClampedArray(targetWidth * targetHeight * 4);

  for (let v = 0; v < targetHeight; v++) {
    const rowOffset = v * targetWidth * 4;
    for (let u = 0; u < targetWidth; u++) {
      // Map (u, v) -> (srcX, srcY)
      const z = H_inv[2][0] * u + H_inv[2][1] * v + H_inv[2][2];
      const normZ = Math.abs(z) > 1e-9 ? z : 1e-9;
      const srcX = (H_inv[0][0] * u + H_inv[0][1] * v + H_inv[0][2]) / normZ;
      const srcY = (H_inv[1][0] * u + H_inv[1][1] * v + H_inv[1][2]) / normZ;

      const pxOffset = rowOffset + u * 4;

      if (srcX < 0 || srcX >= srcWidth - 1 || srcY < 0 || srcY >= srcHeight - 1) {
        // Outside or border: check if within single pixel
        if (srcX >= 0 && srcX < srcWidth && srcY >= 0 && srcY < srcHeight) {
          const ix = Math.floor(srcX);
          const iy = Math.floor(srcY);
          const srcIdx = (iy * srcWidth + ix) * 4;
          targetBuffer[pxOffset] = srcData[srcIdx];
          targetBuffer[pxOffset + 1] = srcData[srcIdx + 1];
          targetBuffer[pxOffset + 2] = srcData[srcIdx + 2];
          targetBuffer[pxOffset + 3] = 255;
        } else {
          targetBuffer[pxOffset] = 0;
          targetBuffer[pxOffset + 1] = 0;
          targetBuffer[pxOffset + 2] = 0;
          targetBuffer[pxOffset + 3] = 0;
        }
        continue;
      }

      // Bilinear interpolation
      const x0 = Math.floor(srcX);
      const y0 = Math.floor(srcY);
      const x1 = x0 + 1;
      const y1 = y0 + 1;

      const fx = srcX - x0;
      const fy = srcY - y0;
      const w00 = (1 - fx) * (1 - fy);
      const w10 = fx * (1 - fy);
      const w01 = (1 - fx) * fy;
      const w11 = fx * fy;

      const idx00 = (y0 * srcWidth + x0) * 4;
      const idx10 = (y0 * srcWidth + x1) * 4;
      const idx01 = (y1 * srcWidth + x0) * 4;
      const idx11 = (y1 * srcWidth + x1) * 4;

      targetBuffer[pxOffset] = Math.round(
        w00 * srcData[idx00] + w10 * srcData[idx10] + w01 * srcData[idx01] + w11 * srcData[idx11]
      );
      targetBuffer[pxOffset + 1] = Math.round(
        w00 * srcData[idx00 + 1] + w10 * srcData[idx10 + 1] + w01 * srcData[idx01 + 1] + w11 * srcData[idx11 + 1]
      );
      targetBuffer[pxOffset + 2] = Math.round(
        w00 * srcData[idx00 + 2] + w10 * srcData[idx10 + 2] + w01 * srcData[idx01 + 2] + w11 * srcData[idx11 + 2]
      );
      targetBuffer[pxOffset + 3] = 255;
    }
  }

  // Return as ImageData-like object or ImageData if available
  if (typeof ImageData !== 'undefined') {
    return new ImageData(targetBuffer, targetWidth, targetHeight);
  }
  return {
    width: targetWidth,
    height: targetHeight,
    data: targetBuffer,
    colorSpace: 'srgb',
  } as ImageData;
}
