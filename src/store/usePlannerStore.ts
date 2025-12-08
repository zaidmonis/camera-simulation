import { create } from 'zustand';
import { DEFAULT_PLAYER_HEIGHT, FIELD_LENGTH_M, FIELD_WIDTH_M, lenses, lightingPresets } from '../constants';
import { LensProfile, LightingPreset, Mode, Player, ThemeMode } from '../types';

interface PlannerState {
  camera: { x: number; y: number };
  players: Player[];
  selectedPlayerId: string;
  lens: LensProfile;
  focalLength: number;
  aperture: number;
  shutter: number;
  iso: number;
  mode: Mode;
  lighting: LightingPreset;
  playerHeight: number;
  theme: ThemeMode;
  setCamera: (pos: { x: number; y: number }) => void;
  movePlayer: (id: string, pos: { x: number; y: number }) => void;
  setSelectedPlayer: (id: string) => void;
  setLens: (lensId: string) => void;
  setFocalLength: (focal: number) => void;
  setAperture: (aperture: number) => void;
  setShutter: (shutter: number) => void;
  setIso: (iso: number) => void;
  setMode: (mode: Mode) => void;
  setLighting: (id: string) => void;
  setPlayerHeight: (height: number) => void;
  setTheme: (mode: ThemeMode) => void;
}

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

export const usePlannerStore = create<PlannerState>((set, get) => ({
  camera: { x: FIELD_LENGTH_M / 2, y: -3 },
  players: [
    {
      id: 'p1',
      label: 'Target Subject',
      position: { x: FIELD_LENGTH_M / 2, y: FIELD_WIDTH_M / 2 }
    },
    {
      id: 'p2',
      label: 'Secondary Subject',
      position: { x: FIELD_LENGTH_M / 2 - 10, y: FIELD_WIDTH_M / 2 + 8 }
    }
  ],
  selectedPlayerId: 'p1',
  lens: lenses[0],
  focalLength: 200,
  aperture: 2.8,
  shutter: 1 / 1000,
  iso: 1600,
  mode: 'auto',
  lighting: lightingPresets[5],
  playerHeight: DEFAULT_PLAYER_HEIGHT,
  theme: 'light',
  setCamera: (pos) =>
    set(() => ({
      camera: {
        x: clamp(pos.x, -2, FIELD_LENGTH_M + 2),
        y: clamp(pos.y, -2, FIELD_WIDTH_M + 2)
      }
    })),
  movePlayer: (id, pos) =>
    set((state) => ({
      players: state.players.map((p) =>
        p.id === id
          ? {
              ...p,
              position: {
                x: clamp(pos.x, 0, FIELD_LENGTH_M),
                y: clamp(pos.y, 0, FIELD_WIDTH_M)
              }
            }
          : p
      )
    })),
  setSelectedPlayer: (id) => set(() => ({ selectedPlayerId: id })),
  setLens: (lensId) =>
    set((state) => {
      const nextLens = lenses.find((l) => l.id === lensId) ?? state.lens;
      const clampedFocal = clamp(state.focalLength, nextLens.minFocal, nextLens.maxFocal);
      const apertureRange = nextLens.apertureAt(clampedFocal);
      const nextAperture = clamp(state.aperture, apertureRange.min, apertureRange.max);
      return { lens: nextLens, focalLength: clampedFocal, aperture: nextAperture };
    }),
  setFocalLength: (focal) =>
    set((state) => {
      const clamped = clamp(focal, state.lens.minFocal, state.lens.maxFocal);
      const apertureRange = state.lens.apertureAt(clamped);
      const nextAperture = clamp(state.aperture, apertureRange.min, apertureRange.max);
      return { focalLength: clamped, aperture: nextAperture };
    }),
  setAperture: (aperture) =>
    set((state) => {
      const range = state.lens.apertureAt(state.focalLength);
      return { aperture: clamp(aperture, range.min, range.max) };
    }),
  setShutter: (shutter) => set(() => ({ shutter })),
  setIso: (iso) => set(() => ({ iso })),
  setMode: (mode) => set(() => ({ mode })),
  setLighting: (id) => set(() => ({ lighting: lightingPresets.find((p) => p.id === id) ?? lightingPresets[0] })),
  setPlayerHeight: (height) => set(() => ({ playerHeight: clamp(height, 1.4, 2.2) })),
  setTheme: (mode) => set(() => ({ theme: mode }))
}));

export const getSelectedPlayer = () => {
  const state = usePlannerStore.getState();
  return state.players.find((p) => p.id === state.selectedPlayerId) ?? state.players[0];
};
