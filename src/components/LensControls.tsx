import { lenses } from '../constants';
import { usePlannerStore } from '../store/usePlannerStore';

const shutterOptions = [
  { label: '1/250', value: 1 / 250 },
  { label: '1/500', value: 1 / 500 },
  { label: '1/800', value: 1 / 800 },
  { label: '1/1000', value: 1 / 1000 },
  { label: '1/1600', value: 1 / 1600 },
  { label: '1/2000', value: 1 / 2000 }
];

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
          <div style={{ color: '#475569', fontSize: '0.9rem' }}>Supported: {lens.supportedFocals.join(', ')} mm</div>
        </div>
      </div>
      <div style={{ marginTop: '1rem' }}>
        <div className="label">Aperture (f/{range.min.toFixed(1)} – f/{range.max})</div>
        <input
          type="range"
          min={range.min}
          max={Math.max(range.max, range.min + 0.1)}
          step={0.1}
          className="range"
          value={aperture}
          onChange={(e) => setAperture(Number(e.target.value))}
        />
        <div style={{ marginTop: 6 }}>{`f/${aperture.toFixed(1)}`}</div>
      </div>
    </div>
  );
}
