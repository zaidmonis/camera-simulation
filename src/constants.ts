import { LensProfile, LightingPreset } from './types';

export const FIELD_LENGTH_M = 91.4;
export const FIELD_WIDTH_M = 55;
export const DEFAULT_PLAYER_HEIGHT = 1.8;

export const lenses: LensProfile[] = [
  {
    id: 'ef-70-200',
    name: 'EF 70–200mm f/2.8L IS II',
    minFocal: 70,
    maxFocal: 200,
    supportedFocals: [70, 100, 135, 200],
    apertureAt: () => ({ min: 2.8, max: 22 })
  },
  {
    id: 'ef-100-400',
    name: 'EF 100–400mm f/4.5–5.6L IS II',
    minFocal: 100,
    maxFocal: 400,
    supportedFocals: [100, 135, 200, 300, 400],
    apertureAt: (focal: number) => {
      const t = (Math.min(Math.max(focal, 100), 400) - 100) / 300;
      const min = 4.5 + (5.6 - 4.5) * t;
      return { min: parseFloat(min.toFixed(2)), max: 32 };
    }
  },
  {
    id: 'rf-200-800',
    name: 'RF 200–800mm f/6.3–9',
    minFocal: 200,
    maxFocal: 800,
    supportedFocals: [200, 300, 400, 600, 800],
    apertureAt: (focal: number) => {
      const t = (Math.min(Math.max(focal, 200), 800) - 200) / 600;
      const min = 6.3 + (9 - 6.3) * t;
      return { min: parseFloat(min.toFixed(2)), max: 40 };
    }
  }
];

export const lightingPresets: LightingPreset[] = [
  { id: 'ev15', label: 'Bright sunny daylight', ev100: 15 },
  { id: 'ev13', label: 'Overcast daylight', ev100: 13 },
  { id: 'ev12', label: 'Heavy overcast', ev100: 12 },
  { id: 'ev10_5', label: 'Evening golden hour', ev100: 10.5 },
  { id: 'ev10', label: 'Bright stadium lights', ev100: 10 },
  { id: 'ev9', label: 'Average stadium lights', ev100: 9 },
  { id: 'ev8', label: 'Poor stadium lights', ev100: 8 }
];
