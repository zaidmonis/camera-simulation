import { describe, it, expect } from 'vitest';
import { exposureDifferenceStops, frameFillPercent, recommendedIso, verticalFov } from './calculations';

describe('exposure math', () => {
  it('computes ISO for daylight settings', () => {
    const iso = recommendedIso(15, 4, 1 / 1000);
    expect(Math.round(iso)).toBe(200);
  });

  it('detects over exposure when ISO is too high', () => {
    const stops = exposureDifferenceStops(10, 2.8, 1 / 1000, 12800);
    expect(stops).toBeGreaterThan(0);
  });
});

describe('frame fill', () => {
  it('increases as distance shrinks', () => {
    const farFill = frameFillPercent(60, 1.8, 400);
    const closeFill = frameFillPercent(20, 1.8, 400);
    expect(closeFill).toBeGreaterThan(farFill);
  });

  it('respects sensor geometry', () => {
    const vfov = verticalFov(400);
    expect(vfov).toBeGreaterThan(0);
  });
});
