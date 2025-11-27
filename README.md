# KLFS 2025 Lacrosse Sixes Camera Planner

A production-ready React + TypeScript web app to pre-visualize sports photography for the Kuala Lumpur Friendly Series (Dec 5–7, 2025) at the National Hockey Stadium. Drag camera and players on a scaled field, pick lenses, and simulate frame fill plus exposure (Auto/Manual ISO).

## Features
- **Scaled field (91.4 × 55 m)** with SVG drag handles for camera and multiple players.
- **Lens presets** for EF 70–200 f/2.8, EF 100–400 f/4.5–5.6, RF 200–800 f/6.3–9 with focal sliders and live aperture limits.
- **Geometry metrics**: real-time camera–player distance, horizontal/vertical FOV, frame-fill percentage for a 1.8 m subject (adjustable).
- **Exposure simulation**: lighting EV presets, Auto ISO calculation, Manual ISO stop difference, shutter and aperture controls tied to lens limits.
- **Visual preview**: mock frame with stick-figure scaled to frame fill and brightness overlay for under/over-exposure cues.

## Getting Started
1. Install dependencies
   ```bash
   npm install
   ```
2. Run dev server
   ```bash
   npm run dev
   ```
3. Build for production
   ```bash
   npm run build
   ```
4. Tests
   ```bash
   npm run test
   ```

## Project Structure
- `src/constants.ts` – field dimensions, lens definitions, lighting presets.
- `src/lib/calculations.ts` – FOV, frame-fill, and exposure math helpers.
- `src/store/usePlannerStore.ts` – global state for camera, players, and exposure controls.
- `src/components/FieldView.tsx` – SVG field with drag interactions and distance overlays.
- `src/components/LensControls.tsx` – lens preset selector, focal/aperture sliders, shutter options.
- `src/components/ExposureControls.tsx` – lighting presets, Auto/Manual ISO handling, exposure deltas.
- `src/components/PreviewFrame.tsx` – frame preview showing subject size and brightness cue.
- `plan.md` – architectural decisions and future work notes.

## Notes
- Sensor assumed **full-frame 36 × 24 mm** (Canon R6 Mark II).
- Camera can be positioned slightly outside the boundary to mimic sidelines/behind goals.
- Lighting presets map to EV100 values; ISO suggestion uses `ISO = 100 * 2^(log2(N^2/t) - EV)`.

## License
MIT
