import { lenses } from '../constants';
import { STANDARD_SHUTTER_VALUES, getApertureStopsInRange } from '../lib/calculations';
import { usePlannerStore } from '../store/usePlannerStore';

const shutterOptions = STANDARD_SHUTTER_VALUES.map((value) => ({
  label: `1/${Math.round(1 / value)}`,
  value
}));

const findClosestIndex = (values: number[], target: number) => {
  if (!values.length) return 0;
  let closest = 0;
  let minDiff = Math.abs(values[0] - target);
  for (let i = 1; i < values.length; i += 1) {
    const diff = Math.abs(values[i] - target);
    if (diff < minDiff) {
      minDiff = diff;
      closest = i;
    }
  }
  return closest;
};

export default function LensControls() {
  const {
    lens,
    setLens,
    focalLength,
    setFocalLength,
    aperture,
    setAperture,
    shutter,
    setShutter
  } = usePlannerStore();
  const range = lens.apertureAt(focalLength);
  const apertureStops = getApertureStopsInRange(range.min, range.max);
  const apertureIndex = findClosestIndex(apertureStops, aperture);

  return (
    <div className="panel">
      <h3 className="section-title">Lens & Camera</h3>
      <div className="control-row">
        <div>
          <div className="label">Lens preset</div>
          <select
            className="input"
            value={lens.id}
            onChange={(e) => setLens(e.target.value)}
          >
            {lenses.map((l) => (
              <option value={l.id} key={l.id}>
                {l.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <div className="label">Shutter speed</div>
          <select
            className="input"
            value={shutter}
            onChange={(e) => setShutter(Number(e.target.value))}
          >
            {shutterOptions.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div style={{ marginTop: '1rem' }}>
        <div className="label">Focal length ({lens.minFocal}–{lens.maxFocal} mm)</div>
        <input
          type="range"
          min={lens.minFocal}
          max={lens.maxFocal}
          step={1}
          className="range"
          value={focalLength}
          onChange={(e) => setFocalLength(Number(e.target.value))}
        />
        <div className="flex-between" style={{ marginTop: 6 }}>
          <div>{focalLength.toFixed(0)} mm</div>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Supported: {lens.supportedFocals.join(', ')} mm
          </div>
        </div>
      </div>
      <div style={{ marginTop: '1rem' }}>
        <div className="label">Aperture (f/{range.min.toFixed(1)} – f/{range.max})</div>
        <input
          type="range"
          min={0}
          max={Math.max(apertureStops.length - 1, 0)}
          step={1}
          className="range"
          value={apertureIndex}
          onChange={(e) => {
            const idx = Number(e.target.value);
            const nextValue = apertureStops[idx] ?? apertureStops[apertureStops.length - 1] ?? aperture;
            setAperture(nextValue);
          }}
        />
        <div style={{ marginTop: 6 }}>{`f/${(apertureStops[apertureIndex] ?? aperture).toFixed(1)}`}</div>
      </div>
    </div>
  );
}
