import { lightingPresets } from '../constants';
import { autoIso, exposureDifferenceStops } from '../lib/calculations';
import { usePlannerStore } from '../store/usePlannerStore';

export default function ExposureControls() {
  const {
    mode,
    setMode,
    aperture,
    setAperture,
    shutter,
    setShutter,
    iso,
    setIso,
    lighting,
    setLighting,
    lens,
    focalLength
  } = usePlannerStore();

  const apertureRange = lens.apertureAt(focalLength);
  const autoIsoState = autoIso(lighting.ev100, aperture, shutter);
  const suggestedIso = autoIsoState.iso;
  const diffStops =
    mode === 'auto'
      ? exposureDifferenceStops(lighting.ev100, aperture, shutter, suggestedIso)
      : exposureDifferenceStops(lighting.ev100, aperture, shutter, iso);
  const exposureLabel = diffStops > 0.25 ? 'Over' : diffStops < -0.25 ? 'Under' : 'Balanced';

  return (
    <div className="panel">
      <h3 className="section-title">Exposure & Lighting</h3>
      <div className="control-row">
        <div>
          <div className="label">Mode</div>
          <select className="input" value={mode} onChange={(e) => setMode(e.target.value as any)}>
            <option value="auto">Auto ISO</option>
            <option value="manual">Manual ISO</option>
          </select>
        </div>
        <div>
          <div className="label">Lighting</div>
          <select
            className="input"
            value={lighting.id}
            onChange={(e) => setLighting(e.target.value)}
          >
            {lightingPresets.map((p) => (
              <option key={p.id} value={p.id}>
                {p.label} (EV {p.ev100})
              </option>
            ))}
          </select>
        </div>
      </div>
      <div style={{ marginTop: '1rem' }}>
        <div className="label">Aperture</div>
        <input
          type="range"
          min={apertureRange.min}
          max={Math.max(apertureRange.max, apertureRange.min + 0.1)}
          step={0.1}
          className="range"
          value={aperture}
          onChange={(e) => setAperture(Number(e.target.value))}
        />
        <div style={{ marginTop: 6 }}>f/{aperture.toFixed(1)}</div>
      </div>
      <div style={{ marginTop: '1rem' }}>
        <div className="label">Shutter</div>
        <input
          type="range"
          min={1 / 2000}
          max={1 / 250}
          step={0.0001}
          className="range"
          value={shutter}
          onChange={(e) => setShutter(Number(e.target.value))}
        />
        <div style={{ marginTop: 6 }}>
          {`1/${Math.round(1 / shutter)}`} s
        </div>
      </div>
      <div style={{ marginTop: '1rem' }}>
        <div className="label">ISO {mode === 'auto' ? '(computed)' : ''}</div>
        <input
          type="range"
          min={100}
          max={51200}
          step={100}
          disabled={mode === 'auto'}
          className="range"
          value={mode === 'auto' ? suggestedIso : iso}
          onChange={(e) => setIso(Number(e.target.value))}
        />
        <div style={{ marginTop: 6 }}>
          {mode === 'auto' ? suggestedIso.toFixed(0) : iso} {mode === 'manual' && ' (adjustable)'}
        </div>
      </div>
      <div className="metric-grid" style={{ marginTop: '1rem' }}>
        <div className="metric">
          <strong>Exposure balance</strong>
          <span>
            {exposureLabel} {Math.abs(diffStops).toFixed(2)} stops
          </span>
        </div>
        <div className="metric">
          <strong>Suggested ISO</strong>
          <span>{suggestedIso.toFixed(0)}</span>
        </div>
        <div className="metric">
          <strong>Min aperture @ focal</strong>
          <span>f/{apertureRange.min.toFixed(1)}</span>
        </div>
        <div className="metric">
          <strong>Max aperture @ focal</strong>
          <span>f/{apertureRange.max.toFixed(0)}</span>
        </div>
      </div>
    </div>
  );
}
