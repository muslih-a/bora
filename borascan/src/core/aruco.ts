// ArUco marker detection wrapper using js-aruco2 with ARUCO_MIP_36h12 dictionary

import jsAruco2 from 'js-aruco2';
import { MARKER_DEFINITIONS } from './config.ts';
import { Point2D } from './homography.ts';

// Extract AR from default export if needed
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const AR = (jsAruco2 as any).default?.AR || (jsAruco2 as any).AR || jsAruco2;

export interface DetectedMarker {
  id: number;
  corners: Point2D[]; // [TL, TR, BR, BL] in clockwise order
  sideLengthPx: number; // average side length in pixels
}

export interface MarkerDetectionResult {
  detectedMarkers: DetectedMarker[];
  matchedCount: number; // Number of valid card markers (0, 1, 2, 3)
  allFound: boolean; // all 4 card markers found
  srcPoints: Point2D[]; // All matched marker corners in source image
  dstPoints: Point2D[]; // Corresponding canonical 850x550 points
}

let cachedDetector: any = null;

export function getArucoDetector(): any {
  if (!cachedDetector && AR && AR.Detector) {
    try {
      cachedDetector = new AR.Detector({
        dictionaryName: 'ARUCO_MIP_36h12',
      });
    } catch (e) {
      console.warn('Failed to initialize AR.Detector with ARUCO_MIP_36h12:', e);
      try {
        cachedDetector = new AR.Detector();
      } catch (e2) {
        console.error('Failed to initialize default AR.Detector:', e2);
      }
    }
  }
  return cachedDetector;
}

// Helper to downscale and grayscale an ImageData if width > maxDim (default 1280px)
export function prepareDetectionImage(
  imageData: ImageData,
  maxWidth = 1280
): { processed: ImageData; scale: number } {
  const { width, height, data } = imageData;
  if (width <= maxWidth) {
    return { processed: imageData, scale: 1.0 };
  }

  const scale = maxWidth / width;
  const newWidth = Math.round(width * scale);
  const newHeight = Math.round(height * scale);
  const newBuffer = new Uint8ClampedArray(newWidth * newHeight * 4);

  // Simple box sampling for downscaling
  for (let ny = 0; ny < newHeight; ny++) {
    const srcY = Math.min(Math.floor(ny / scale), height - 1);
    for (let nx = 0; nx < newWidth; nx++) {
      const srcX = Math.min(Math.floor(nx / scale), width - 1);
      const srcIdx = (srcY * width + srcX) * 4;
      const dstIdx = (ny * newWidth + nx) * 4;

      // Convert to grayscale in place for fast thresholding
      const gray = Math.round(
        0.299 * data[srcIdx] + 0.587 * data[srcIdx + 1] + 0.114 * data[srcIdx + 2]
      );
      newBuffer[dstIdx] = gray;
      newBuffer[dstIdx + 1] = gray;
      newBuffer[dstIdx + 2] = gray;
      newBuffer[dstIdx + 3] = 255;
    }
  }

  const processed =
    typeof ImageData !== 'undefined'
      ? new ImageData(newBuffer, newWidth, newHeight)
      : ({ width: newWidth, height: newHeight, data: newBuffer } as ImageData);

  return { processed, scale };
}

// Detect markers in image
export function detectCardMarkers(srcImageData: ImageData): MarkerDetectionResult {
  const detector = getArucoDetector();
  if (!detector) {
    return {
      detectedMarkers: [],
      matchedCount: 0,
      allFound: false,
      srcPoints: [],
      dstPoints: [],
    };
  }

  // Pre-scale if too large
  const { processed, scale } = prepareDetectionImage(srcImageData, 1280);
  const invScale = 1.0 / scale;

  let rawMarkers: any[] = [];
  try {
    rawMarkers = detector.detect(processed);
  } catch (err) {
    console.error('Error in detector.detect:', err);
    rawMarkers = [];
  }

  const validCardIds = new Set([0, 1, 2, 3]);
  const detectedMarkers: DetectedMarker[] = [];
  const srcPoints: Point2D[] = [];
  const dstPoints: Point2D[] = [];

  for (const raw of rawMarkers) {
    if (!validCardIds.has(raw.id)) continue;

    // Corner coordinates mapped back to full source resolution
    const corners: Point2D[] = raw.corners.map((c: any) => ({
      x: c.x * invScale,
      y: c.y * invScale,
    }));

    // Calculate average side length in source px
    const side0 = Math.hypot(corners[1].x - corners[0].x, corners[1].y - corners[0].y);
    const side1 = Math.hypot(corners[2].x - corners[1].x, corners[2].y - corners[1].y);
    const side2 = Math.hypot(corners[3].x - corners[2].x, corners[3].y - corners[2].y);
    const side3 = Math.hypot(corners[0].x - corners[3].x, corners[0].y - corners[3].y);
    const sideLengthPx = (side0 + side1 + side2 + side3) / 4.0;

    detectedMarkers.push({
      id: raw.id,
      corners,
      sideLengthPx,
    });

    // Find canonical coordinates for this marker
    const markerDef = MARKER_DEFINITIONS.find((m) => m.id === raw.id);
    if (markerDef) {
      for (let i = 0; i < 4; i++) {
        srcPoints.push(corners[i]);
        dstPoints.push({
          x: markerDef.canonicalCorners[i][0],
          y: markerDef.canonicalCorners[i][1],
        });
      }
    }
  }

  // Sort by marker ID
  detectedMarkers.sort((a, b) => a.id - b.id);

  return {
    detectedMarkers,
    matchedCount: detectedMarkers.length,
    allFound: detectedMarkers.length === 4,
    srcPoints,
    dstPoints,
  };
}
