import { FIELD_LENGTH_M, FIELD_WIDTH_M } from '../constants';

export const sensor = { width: 36, height: 24 };

export const STANDARD_ISO_VALUES = [
  100, 125, 160, 200, 250, 320, 400, 500, 640, 800, 1000, 1250, 1600, 2000, 2500, 3200, 4000, 5000, 6400, 8000,
  10000, 12500, 16000, 20000, 25600, 32000, 40000, 51200
];

export const STANDARD_SHUTTER_VALUES = [
  1 / 8000,
  1 / 6400,
  1 / 5000,
  1 / 4000,
  1 / 3200,
  1 / 2500,
  1 / 2000,
  1 / 1600,
  1 / 1250,
  1 / 1000,
  1 / 800,
  1 / 640,
  1 / 500,
  1 / 400,
  1 / 320,
  1 / 250,
  1 / 200,
  1 / 160,
  1 / 125,
  1 / 100
];

export const STANDARD_APERTURE_VALUES = [
  1.4,
  1.6,
  1.8,
  2,
  2.2,
  2.5,
  2.8,
  3.2,
  3.5,
  4,
  4.5,
  5,
  5.6,
  6.3,
  7.1,
  8,
  9,
  10,
  11,
  13,
  14,
  16,
  18,
  20,
  22
];

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

const roundToNearestIso = (value: number, min: number, max: number) => {
  const clamped = clamp(value, min, max);
  return STANDARD_ISO_VALUES.reduce((best, candidate) =>
    Math.abs(candidate - clamped) < Math.abs(best - clamped) ? candidate : best
  );
};

export function distance(a: { x: number; y: number }, b: { x: number; y: number }) {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.sqrt(dx * dx + dy * dy);
}

export function horizontalFov(focalLength: number) {
  return 2 * Math.atan(sensor.width / (2 * focalLength));
}

export function verticalFov(focalLength: number) {
  return 2 * Math.atan(sensor.height / (2 * focalLength));
}

export function frameFillPercent(distanceMeters: number, subjectHeight: number, focalLength: number) {
  if (distanceMeters === 0) return 100;
  const vfov = verticalFov(focalLength);
  const sceneHeight = 2 * distanceMeters * Math.tan(vfov / 2);
  const fill = (subjectHeight / sceneHeight) * 100;
  return Math.min(400, fill);
}

export function clampFieldPosition(pos: { x: number; y: number }) {
  return {
    x: Math.max(0, Math.min(FIELD_LENGTH_M, pos.x)),
    y: Math.max(0, Math.min(FIELD_WIDTH_M, pos.y))
  };
}

export function recommendedIso(ev100: number, aperture: number, shutter: number) {
  const base = Math.log2((aperture * aperture) / shutter);
  return 100 * 2 ** (base - ev100);
}

export function autoIso(ev100: number, aperture: number, shutter: number, min = 100, max = 51200) {
  const raw = recommendedIso(ev100, aperture, shutter);
  const normalized = roundToNearestIso(raw, min, max);
  return { iso: normalized, raw };
}

export function exposureDifferenceStops(ev100: number, aperture: number, shutter: number, iso: number) {
  const recommended = recommendedIso(ev100, aperture, shutter);
  return Math.log2(iso / recommended);
}

export type FieldWall = 'left' | 'right' | 'top' | 'bottom';

export interface BackgroundInfo {
  wall: FieldWall;
  coordinate: number;
  distance: number;
}

const EPSILON = 1e-4;

function axisRange(origin: number, direction: number, min: number, max: number) {
  if (Math.abs(direction) < EPSILON) {
    if (origin < min || origin > max) return null;
    return { tMin: -Infinity, tMax: Infinity };
  }
  const t1 = (min - origin) / direction;
  const t2 = (max - origin) / direction;
  return { tMin: Math.min(t1, t2), tMax: Math.max(t1, t2) };
}

export function projectRayToField(origin: { x: number; y: number }, angle: number, fallback = 80): { x: number; y: number } {
  const dir = { x: Math.cos(angle), y: Math.sin(angle) };
  const rx = axisRange(origin.x, dir.x, 0, FIELD_LENGTH_M);
  const ry = axisRange(origin.y, dir.y, 0, FIELD_WIDTH_M);
  if (!rx || !ry) {
    return {
      x: origin.x + dir.x * fallback,
      y: origin.y + dir.y * fallback
    };
  }
  const tEnter = Math.max(rx.tMin, ry.tMin);
  const tExit = Math.min(rx.tMax, ry.tMax);
  if (tExit < tEnter) {
    return {
      x: origin.x + dir.x * fallback,
      y: origin.y + dir.y * fallback
    };
  }
  const t = tExit > 0 ? tExit : tEnter;
  if (!Number.isFinite(t) || t <= 0) {
    return {
      x: origin.x + dir.x * fallback,
      y: origin.y + dir.y * fallback
    };
  }
  return {
    x: origin.x + dir.x * t,
    y: origin.y + dir.y * t
  };
}

export function getBackgroundInfo(camera: { x: number; y: number }): BackgroundInfo {
  const candidates: Array<{ wall: FieldWall; distance: number }> = [
    { wall: 'left', distance: Math.abs(camera.x - 0) },
    { wall: 'right', distance: Math.abs(FIELD_LENGTH_M - camera.x) },
    { wall: 'top', distance: Math.abs(camera.y - 0) },
    { wall: 'bottom', distance: Math.abs(FIELD_WIDTH_M - camera.y) }
  ];

  const closest = candidates.reduce((best, current) => (current.distance < best.distance ? current : best));
  const oppositeMap: Record<FieldWall, FieldWall> = {
    left: 'right',
    right: 'left',
    top: 'bottom',
    bottom: 'top'
  };
  const wall = oppositeMap[closest.wall];
  const coordinate =
    wall === 'left' ? 0 : wall === 'right' ? FIELD_LENGTH_M : wall === 'top' ? 0 : FIELD_WIDTH_M;
  const distanceToPlane =
    wall === 'left' || wall === 'right' ? Math.abs(camera.x - coordinate) : Math.abs(camera.y - coordinate);

  return {
    wall,
    coordinate,
    distance: distanceToPlane
  };
}

export function getApertureStopsInRange(min: number, max: number) {
  const withinRange = STANDARD_APERTURE_VALUES.filter((value) => value >= min - 1e-6 && value <= max + 1e-6);
  const augmented = [...withinRange];
  const ensureValue = (val: number) => {
    if (!augmented.some((stop) => Math.abs(stop - val) < 1e-3)) {
      augmented.push(val);
    }
  };
  ensureValue(min);
  ensureValue(max);
  if (augmented.length === 0) {
    augmented.push(min);
    if (max !== min) augmented.push(max);
  }
  return Array.from(new Set(augmented)).sort((a, b) => a - b);
}
