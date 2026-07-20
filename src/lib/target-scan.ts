/**
 * Local (free, offline) paper-target scorer — no API calls.
 *
 * Pipeline: load photo into a canvas → find the black aiming area → derive the
 * mm-per-pixel scale from the event's printed target dimensions → detect
 * bullet-hole-sized blobs (bright inside the black, dark on the paper) →
 * score each hole by ring distance with the ISSF outward-gauge rule.
 *
 * Runs on web only for now (uses the DOM Canvas API).
 */

import type { EventDef } from '@/constants/events';
import { maxShotValue } from '@/constants/events';
import { getTargetSpec, type TargetSpec } from '@/constants/targets';
import type { DetectedShot, TargetAnalysis } from '@/lib/photo-analysis';

const MAX_DIM = 1100;
/** Max shots one merged blob may be split into. */
const MAX_SPLIT = 3;

interface Blob {
  area: number;
  sumX: number;
  sumY: number;
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
}

export async function analyzeTargetImage(uri: string, event: EventDef): Promise<TargetAnalysis> {
  if (typeof document === 'undefined') {
    throw new Error('Photo scoring runs in the web app for now — open Triggr in a browser.');
  }
  const spec = getTargetSpec(event.id);
  if (!spec) {
    throw new Error(`No target dimensions registered for ${event.name}.`);
  }

  const { gray, width, height } = await loadGrayscale(uri);
  const notes: string[] = [];

  // --- 1. Find the black aiming area -------------------------------------
  const darkThreshold = Math.min(otsuThreshold(gray), 130);
  const darkMask = new Uint8Array(gray.length);
  for (let i = 0; i < gray.length; i++) darkMask[i] = gray[i] < darkThreshold ? 1 : 0;

  const darkBlobs = labelBlobs(darkMask, width, height);
  const black = pickBlackArea(darkBlobs, width, height);
  if (!black) {
    return {
      targetDetected: false,
      shots: [],
      notes: 'Could not find the black aiming area. Photograph the full target, straight on, in even light.',
    };
  }

  const cx = black.sumX / black.area;
  const cy = black.sumY / black.area;
  const blackRadiusPx = Math.sqrt(black.area / Math.PI);
  const bw = black.maxX - black.minX + 1;
  const bh = black.maxY - black.minY + 1;
  const aspect = Math.max(bw, bh) / Math.max(1, Math.min(bw, bh));
  if (aspect > 1.35) {
    return {
      targetDetected: false,
      shots: [],
      notes: 'The target looks heavily skewed or partly cropped. Retake the photo straight on.',
    };
  }
  if (aspect > 1.12) {
    notes.push('Photo looks angled — scores near ring lines may be off.');
  }

  const mmPerPx = spec.blackDiameterMm / (2 * blackRadiusPx);
  const holeRadiusPx = spec.calibreMm / 2 / mmPerPx;
  const maxRingRadiusPx = spec.rings[spec.rings.length - 1][1] / 2 / mmPerPx;

  if (holeRadiusPx < 1.6) {
    return {
      targetDetected: true,
      shots: [],
      notes: 'Holes are too small to resolve at this distance. Move closer so the target fills the frame.',
    };
  }

  const holeArea = Math.PI * holeRadiusPx * holeRadiusPx;

  // --- 2. Holes inside the black (light against dark) ---------------------
  const blackLevel = meanInsideCircle(gray, width, height, cx, cy, blackRadiusPx * 0.9);
  const brightThreshold = Math.min(blackLevel + 50, 200);
  const brightMask = new Uint8Array(gray.length);
  forEachPixelInCircle(width, height, cx, cy, blackRadiusPx * 1.02, (i) => {
    if (gray[i] > brightThreshold) brightMask[i] = 1;
  });
  const insideHoles = labelBlobs(brightMask, width, height).filter((b) =>
    isHoleLike(b, holeArea, holeRadiusPx),
  );

  // --- 3. Holes on the paper (dark against white), skipped when the target
  // is fully black (rapid fire) --------------------------------------------
  let outsideHoles: Blob[] = [];
  if (spec.blackDiameterMm < spec.rings[spec.rings.length - 1][1]) {
    const paperMask = new Uint8Array(gray.length);
    const outerLimit = Math.min(
      maxRingRadiusPx + holeRadiusPx * 2,
      Math.min(width, height) / 2 - 1,
    );
    forEachPixelInCircle(width, height, cx, cy, outerLimit, (i, dist) => {
      if (dist > blackRadiusPx * 1.05 && gray[i] < darkThreshold) paperMask[i] = 1;
    });
    outsideHoles = labelBlobs(paperMask, width, height).filter((b) =>
      isHoleLike(b, holeArea, holeRadiusPx),
    );
  }

  // --- 4. Score every hole -------------------------------------------------
  const shots: DetectedShot[] = [];
  let merged = 0;
  for (const blob of [...insideHoles, ...outsideHoles]) {
    const count = Math.max(1, Math.min(MAX_SPLIT, Math.round(blob.area / holeArea)));
    if (count > 1) merged += count - 1;
    const hx = blob.sumX / blob.area;
    const hy = blob.sumY / blob.area;
    const distMm = Math.hypot(hx - cx, hy - cy) * mmPerPx;
    const score = scoreAtDistance(distMm, spec, event.decimal);
    if (score === null) continue; // outside the scoring area — noise
    for (let c = 0; c < count; c++) {
      shots.push({
        score,
        x: clamp01((hx - cx) / (2 * maxRingRadiusPx) + 0.5),
        y: clamp01((hy - cy) / (2 * maxRingRadiusPx) + 0.5),
      });
    }
  }

  const max = maxShotValue(event);
  for (const s of shots) s.score = Math.min(s.score, max);
  shots.sort((a, b) => b.score - a.score);

  if (merged > 0) {
    notes.push(`${merged} extra shot${merged > 1 ? 's' : ''} inferred from overlapping holes — double-check the count.`);
  }
  if (shots.length === 0) {
    notes.push('Target found but no holes detected. Works best on a fired target photographed close up.');
  }

  return { targetDetected: true, shots, notes: notes.join(' ') };
}

// ---------------------------------------------------------------------------

async function loadGrayscale(
  uri: string,
): Promise<{ gray: Uint8Array; width: number; height: number }> {
  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const el = new window.Image();
    el.onload = () => resolve(el);
    el.onerror = () => reject(new Error('Could not load the photo.'));
    el.src = uri;
  });

  const scale = Math.min(1, MAX_DIM / Math.max(img.naturalWidth, img.naturalHeight));
  const width = Math.max(1, Math.round(img.naturalWidth * scale));
  const height = Math.max(1, Math.round(img.naturalHeight * scale));

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas is not available in this browser.');
  ctx.drawImage(img, 0, 0, width, height);
  const { data } = ctx.getImageData(0, 0, width, height);

  const gray = new Uint8Array(width * height);
  for (let i = 0; i < gray.length; i++) {
    const o = i * 4;
    gray[i] = (data[o] * 299 + data[o + 1] * 587 + data[o + 2] * 114) / 1000;
  }
  return { gray, width, height };
}

/** Otsu's method — threshold separating dark ink/black from paper. */
function otsuThreshold(gray: Uint8Array): number {
  const hist = new Array<number>(256).fill(0);
  for (let i = 0; i < gray.length; i++) hist[gray[i]]++;
  const total = gray.length;
  let sum = 0;
  for (let t = 0; t < 256; t++) sum += t * hist[t];
  let sumB = 0;
  let wB = 0;
  let best = 127;
  let maxVar = -1;
  for (let t = 0; t < 256; t++) {
    wB += hist[t];
    if (wB === 0) continue;
    const wF = total - wB;
    if (wF === 0) break;
    sumB += t * hist[t];
    const mB = sumB / wB;
    const mF = (sum - sumB) / wF;
    const between = wB * wF * (mB - mF) * (mB - mF);
    if (between > maxVar) {
      maxVar = between;
      best = t;
    }
  }
  return best;
}

/** 4-connected component labeling via iterative flood fill. */
function labelBlobs(mask: Uint8Array, width: number, height: number): Blob[] {
  const visited = new Uint8Array(mask.length);
  const blobs: Blob[] = [];
  const stack: number[] = [];

  for (let start = 0; start < mask.length; start++) {
    if (!mask[start] || visited[start]) continue;
    const blob: Blob = {
      area: 0,
      sumX: 0,
      sumY: 0,
      minX: Infinity,
      maxX: -Infinity,
      minY: Infinity,
      maxY: -Infinity,
    };
    stack.length = 0;
    stack.push(start);
    visited[start] = 1;
    while (stack.length > 0) {
      const i = stack.pop()!;
      const x = i % width;
      const y = (i / width) | 0;
      blob.area++;
      blob.sumX += x;
      blob.sumY += y;
      if (x < blob.minX) blob.minX = x;
      if (x > blob.maxX) blob.maxX = x;
      if (y < blob.minY) blob.minY = y;
      if (y > blob.maxY) blob.maxY = y;
      if (x > 0 && mask[i - 1] && !visited[i - 1]) (visited[i - 1] = 1), stack.push(i - 1);
      if (x < width - 1 && mask[i + 1] && !visited[i + 1]) (visited[i + 1] = 1), stack.push(i + 1);
      if (y > 0 && mask[i - width] && !visited[i - width])
        (visited[i - width] = 1), stack.push(i - width);
      if (y < height - 1 && mask[i + width] && !visited[i + width])
        (visited[i + width] = 1), stack.push(i + width);
    }
    blobs.push(blob);
  }
  return blobs;
}

/** The black aiming area: largest dark blob that is roughly circular. */
function pickBlackArea(blobs: Blob[], width: number, height: number): Blob | null {
  const minArea = width * height * 0.005;
  let best: Blob | null = null;
  for (const b of blobs) {
    if (b.area < minArea) continue;
    const bw = b.maxX - b.minX + 1;
    const bh = b.maxY - b.minY + 1;
    // Fill ratio vs the ellipse inscribed in the bounding box — a disc with a
    // few holes shot through it stays high; scenery/shadows do not.
    const fill = b.area / ((Math.PI / 4) * bw * bh);
    if (fill < 0.6 || fill > 1.25) continue;
    if (!best || b.area > best.area) best = b;
  }
  return best;
}

/**
 * Hole filter: bullet-hole-sized, compact blobs. Rejects ring lines (long,
 * thin, low fill) and most printed ring numbers (stroke-y, low fill).
 */
function isHoleLike(b: Blob, holeArea: number, holeRadiusPx: number): boolean {
  if (b.area < holeArea * 0.35 || b.area > holeArea * (MAX_SPLIT + 0.8)) return false;
  const bw = b.maxX - b.minX + 1;
  const bh = b.maxY - b.minY + 1;
  const holeDia = holeRadiusPx * 2;
  if (Math.min(bw, bh) < holeDia * 0.55) return false;
  if (Math.max(bw, bh) > holeDia * (MAX_SPLIT + 0.6)) return false;
  const fill = b.area / (bw * bh);
  return fill >= 0.55;
}

const meanInsideCircle = (
  gray: Uint8Array,
  width: number,
  height: number,
  cx: number,
  cy: number,
  r: number,
): number => {
  let sum = 0;
  let n = 0;
  forEachPixelInCircle(width, height, cx, cy, r, (i) => {
    sum += gray[i];
    n++;
  });
  return n > 0 ? sum / n : 0;
};

function forEachPixelInCircle(
  width: number,
  height: number,
  cx: number,
  cy: number,
  r: number,
  fn: (index: number, dist: number) => void,
): void {
  const x0 = Math.max(0, Math.floor(cx - r));
  const x1 = Math.min(width - 1, Math.ceil(cx + r));
  const y0 = Math.max(0, Math.floor(cy - r));
  const y1 = Math.min(height - 1, Math.ceil(cy + r));
  for (let y = y0; y <= y1; y++) {
    for (let x = x0; x <= x1; x++) {
      const dist = Math.hypot(x - cx, y - cy);
      if (dist <= r) fn(y * width + x, dist);
    }
  }
}

/**
 * Score for a hole whose CENTER is `distMm` from the target center.
 * Outward gauge: the hole scores by its inner edge (center minus gauge radius).
 * Returns null when the hole sits outside the scoring area entirely.
 */
function scoreAtDistance(distMm: number, spec: TargetSpec, decimal: boolean): number | null {
  const edge = Math.max(0, distMm - spec.calibreMm / 2);
  const rings = spec.rings; // highest score first
  const outermost = rings[rings.length - 1][1] / 2;
  if (edge > outermost) {
    // Full miss well past the 1-ring is treated as noise; a near-miss counts 0.
    return edge <= outermost * 1.1 ? 0 : null;
  }
  for (let i = 0; i < rings.length; i++) {
    const [score, dia] = rings[i];
    const outer = dia / 2;
    if (edge <= outer) {
      if (!decimal) return score;
      const inner = i === 0 ? 0 : rings[i - 1][1] / 2;
      const fraction = outer === inner ? 1 : (outer - edge) / (outer - inner);
      const tenths = Math.min(9, Math.floor(fraction * 10)) / 10;
      return Math.round((score + tenths) * 10) / 10;
    }
  }
  return rings[0][0];
}

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
