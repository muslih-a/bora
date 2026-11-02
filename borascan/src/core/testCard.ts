// Test Card Generator for BoraScan card (exact 850x550 geometry and ArUco markers)

import {
  CANONICAL_WIDTH,
  CANONICAL_HEIGHT,
  MARKER_DEFINITIONS,
  REFERENCE_PATCHES,
  PAD_INNER_ROI,
} from './config.ts';

// Binary bitstrings for ArUco MIP 36h12 (6x6 inner bits, '1' = white, '0' = black)
export const ARUCO_MIP_36H12_CODES: Record<number, string> = {
  0: '110100101011011000111010000010011101',
  1: '011000000000000100010011010011100101',
  2: '000100100000011011111011111001110010',
  3: '111111111000101011010110110010110100',
};

// Draw an 8x8 cell ArUco marker on canvas context
export function drawArUcoMarker(
  ctx: CanvasRenderingContext2D,
  id: number,
  x: number,
  y: number,
  sizePx: number
): void {
  const code = ARUCO_MIP_36H12_CODES[id];
  if (!code) return;

  const cellSize = sizePx / 8.0;

  // Outer black border (8x8 cells black background)
  ctx.fillStyle = '#000000';
  ctx.fillRect(x, y, sizePx, sizePx);

  // Inner 6x6 cells
  ctx.fillStyle = '#FFFFFF';
  for (let r = 0; r < 6; r++) {
    for (let c = 0; c < 6; c++) {
      const bit = code[r * 6 + c];
      if (bit === '1') {
        ctx.fillRect(x + (c + 1) * cellSize, y + (r + 1) * cellSize, cellSize, cellSize);
      }
    }
  }
}

export interface CardRenderOptions {
  padRgb?: [number, number, number]; // [R, G, B] of pad
  padLabel?: string;
  lightingWarmth?: number; // 0.0 to 1.0 (warm yellow tint)
  rotationDeg?: number;
}

// Render complete canonical card into an HTML canvas (850 x 550)
export function renderCanonicalCardToCanvas(
  canvas: HTMLCanvasElement,
  options: CardRenderOptions = {}
): void {
  const {
    padRgb = [233, 194, 38], // Default curcumin yellow
    padLabel,
    lightingWarmth = 0,
  } = options;

  canvas.width = CANONICAL_WIDTH;
  canvas.height = CANONICAL_HEIGHT;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  // Card White Background (850x550)
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, CANONICAL_WIDTH, CANONICAL_HEIGHT);

  // Card Outer Border line
  ctx.strokeStyle = '#D1D5DB';
  ctx.lineWidth = 2;
  ctx.strokeRect(1, 1, CANONICAL_WIDTH - 2, CANONICAL_HEIGHT - 2);

  // Title Branding Text
  ctx.fillStyle = '#7B1E2E';
  ctx.font = 'bold 24px sans-serif';
  ctx.fillText('BoraScan', 240, 60);

  ctx.fillStyle = '#4B5563';
  ctx.font = '14px sans-serif';
  ctx.fillText('Card v2.0 | 85 × 55 mm | ARUCO_MIP_36h12', 240, 85);

  // 1. Draw 4 ArUco Markers (10x10 mm -> 100x100 px each)
  for (const m of MARKER_DEFINITIONS) {
    const x = m.canonicalCorners[0][0];
    const y = m.canonicalCorners[0][1];
    drawArUcoMarker(ctx, m.id, x, y, 100);
  }

  // 2. Draw 6 Reference Patches
  // W, G, 0, 1, 2, B+
  for (const patch of REFERENCE_PATCHES) {
    const { x, y, w, h } = patch.canonicalRoi;
    // Outer patch box (7.5x8 mm -> 75x80 px)
    const patchOuterX = (patch.xMm) * 10;
    const patchOuterY = (patch.yMm) * 10;
    const patchOuterW = patch.wMm * 10;
    const patchOuterH = patch.hMm * 10;

    ctx.fillStyle = patch.nominalHex;
    ctx.fillRect(patchOuterX, patchOuterY, patchOuterW, patchOuterH);

    ctx.strokeStyle = '#9CA3AF';
    ctx.lineWidth = 1;
    ctx.strokeRect(patchOuterX, patchOuterY, patchOuterW, patchOuterH);

    // Label below patch
    ctx.fillStyle = '#1F2937';
    ctx.font = 'bold 12px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(patch.name, patchOuterX + patchOuterW / 2, patchOuterY + patchOuterH + 16);
  }
  ctx.textAlign = 'left';

  // 3. Draw PAD Slot (x 36, y 30, w 15, h 10 mm -> x 360, y 300, w 150, h 100 px)
  const slotX = 360;
  const slotY = 300;
  const slotW = 150;
  const slotH = 100;

  ctx.strokeStyle = '#6B7280';
  ctx.setLineDash([4, 4]);
  ctx.lineWidth = 2;
  ctx.strokeRect(slotX, slotY, slotW, slotH);
  ctx.setLineDash([]);

  // Label for slot
  ctx.fillStyle = '#6B7280';
  ctx.font = 'bold 13px sans-serif';
  ctx.fillText('PAD', slotX + 6, slotY + 20);

  // Strip Handle Zone (to the right of the pad: zone x 510–830 px)
  ctx.fillStyle = '#E5E7EB';
  ctx.fillRect(510, 315, 200, 70);
  ctx.fillStyle = '#9CA3AF';
  ctx.font = '11px sans-serif';
  ctx.fillText('Pegangan Strip (Abaikan)', 520, 355);

  // Pad Color Fill (inner ROI: x 380, y 320, w 110, h 60 px)
  const [pr, pg, pb] = padRgb;
  ctx.fillStyle = `rgb(${pr}, ${pg}, ${pb})`;
  ctx.fillRect(PAD_INNER_ROI.canonicalRoi.x, PAD_INNER_ROI.canonicalRoi.y, PAD_INNER_ROI.canonicalRoi.w, PAD_INNER_ROI.canonicalRoi.h);

  if (padLabel) {
    ctx.fillStyle = (pr * 0.299 + pg * 0.587 + pb * 0.114) > 128 ? '#000000' : '#FFFFFF';
    ctx.font = 'bold 11px sans-serif';
    ctx.fillText(padLabel, PAD_INNER_ROI.canonicalRoi.x + 10, PAD_INNER_ROI.canonicalRoi.y + 35);
  }

  // Optional warm lighting simulation (apply slight yellowish tint)
  if (lightingWarmth > 0) {
    ctx.fillStyle = `rgba(255, 220, 150, ${lightingWarmth * 0.25})`;
    ctx.fillRect(0, 0, CANONICAL_WIDTH, CANONICAL_HEIGHT);
  }
}

// Generate data URL for sample test cards
export function getSampleCardDataUrl(sampleType: 'blank' | 'unclear' | 'borax' | 'ammonia_pos' | 'ammonia_neg'): string {
  if (typeof document === 'undefined') return '';
  const canvas = document.createElement('canvas');

  let padRgb: [number, number, number] = [233, 194, 38];
  let label = '0 ○';

  if (sampleType === 'unclear') {
    padRgb = [208, 134, 42]; // #D0862A orange
    label = '1 △';
  } else if (sampleType === 'borax') {
    padRgb = [158, 47, 37]; // #9E2F25 red-brown
    label = '2 □';
  } else if (sampleType === 'ammonia_pos') {
    padRgb = [47, 59, 42]; // #2F3B2A dark greenish-black
    label = 'B+ ⊗';
  } else if (sampleType === 'ammonia_neg') {
    padRgb = [190, 110, 40]; // Still brownish, not greenish-black
    label = 'B− ⊖';
  }

  renderCanonicalCardToCanvas(canvas, { padRgb, padLabel: label });
  return canvas.toDataURL('image/jpeg', 0.9);
}
