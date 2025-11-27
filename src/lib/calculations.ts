import { FIELD_LENGTH_M, FIELD_WIDTH_M } from '../constants';

export const sensor = { width: 36, height: 24 };

const STANDARD_ISO_VALUES = [
  100, 125, 160, 200, 250, 320, 400, 500, 640, 800, 1000, 1250, 1600, 2000, 2500, 3200, 4000, 5000, 6400, 8000,
  10000, 12500, 16000, 20000, 25600, 32000, 40000, 51200
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
