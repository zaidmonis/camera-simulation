# KLFS 2025 Camera Planner – Architecture Plan

## Stack
- **Vite + React + TypeScript** for SPA speed and DX.
- **Zustand** for global planner state (camera, players, lens/exposure settings).
- **SVG** for field visualization + drag interactions (keeps math precise in meters).
- **Vitest + RTL** for unit tests; ESLint + Prettier for lint/format.

## Key Modules
- `constants.ts`: field dimensions, lighting presets, lens profiles with aperture curves.
- `lib/calculations.ts`: geometry and exposure math (distance, FOV, frame-fill %, ISO math).
- `store/usePlannerStore.ts`: Zustand store with setters for camera/players/lens/exposure.
- Components:
  - `FieldView`: SVG field, drag camera/player positions, live distance lines.
  - `LensControls`: lens presets, focal and aperture sliders, shutter selection.
  - `ExposureControls`: lighting presets, Auto/Manual ISO logic, ISO sliders, exposure deltas.
  - `PreviewFrame`: visual mock frame showing subject size + brightness cue from exposure delta.
  - `App` layout with header + “Players & Subject” quick settings.

## Data & Units
- Field scaled in meters → SVG uses 10 px per meter with viewBox for responsiveness.
- Camera allowed slightly outside boundary (±5 m) to mimic sideline/behind-goal positions.
- Players clamped within field; player height default 1.8 m, adjustable.

## Calculations
- **Distance**: Euclidean between camera and player.
- **FOV**: 36×24 mm full-frame sensor → horizontal/vertical FOV via `2*atan(sensor/(2*f))`.
- **Frame fill**: subject height / scene height at distance using vertical FOV → % height of frame.
- **Exposure**: EV100 presets; ISO recommendation `100 * 2^(log2(N^2/t) - EV)`. Manual mode computes stop difference for preview brightness overlay.

## UX Outline
- Left: Field view with legend + numeric metrics.
- Right stack: Lens/Camera, Exposure/Lighting, Players/Subject info, Preview & Analysis.
- Metrics always visible (distance, fill %, FOV, ISO suggestion, exposure delta).

## Future Extensions
- Scenario presets (persist store to localStorage), side-by-side lens compare, multi-player labels/analytics, responsive tweaks for tablets.
