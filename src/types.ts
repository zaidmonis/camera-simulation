export type Mode = 'auto' | 'manual';

export interface LensProfile {
  id: string;
  name: string;
  minFocal: number;
  maxFocal: number;
  supportedFocals: number[];
  apertureAt: (focal: number) => { min: number; max: number };
}

export interface LightingPreset {
  id: string;
  label: string;
  ev100: number;
}

export interface Player {
  id: string;
  label: string;
  position: { x: number; y: number };
}
