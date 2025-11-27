import { FIELD_LENGTH_M, FIELD_WIDTH_M } from '../constants';

export const sensor = { width: 36, height: 24 };

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

export function exposureDifferenceStops(ev100: number, aperture: number, shutter: number, iso: number) {
  const recommended = recommendedIso(ev100, aperture, shutter);
  return Math.log2(iso / recommended);
}
