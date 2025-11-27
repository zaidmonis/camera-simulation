import { lightingPresets } from '../constants';
import { autoIso, exposureDifferenceStops, STANDARD_ISO_VALUES, STANDARD_SHUTTER_VALUES, getApertureStopsInRange } from '../lib/calculations';
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
  const apertureStops = getApertureStopsInRange(apertureRange.min, apertureRange.max);
  const autoIsoState = autoIso(lighting.ev100, aperture, shutter);
  const suggestedIso = autoIsoState.iso;
  const diffStops =
    mode === 'auto'
      ? exposureDifferenceStops(lighting.ev100, aperture, shutter, suggestedIso)
      : exposureDifferenceStops(lighting.ev100, aperture, shutter, iso);
  const exposureLabel = diffStops > 0.25 ? 'Over' : diffStops < -0.25 ? 'Under' : 'Balanced';

  const findClosestIndex = (values: number[], target: number) => {
    if (!values.length) return 0;
    let closestIdx = 0;
    let smallestDiff = Math.abs(values[0] - target);
    for (let i = 1; i < values.length; i += 1) {
      const diff = Math.abs(values[i] - target);
      if (diff < smallestDiff) {
        smallestDiff = diff;
        closestIdx = i;
      }
    }
    return closestIdx;
  };

  const isoValues = STANDARD_ISO_VALUES;
  const manualIsoIndex = findClosestIndex(isoValues, iso);
  const autoIsoIndex = findClosestIndex(isoValues, suggestedIso);
  const shutterValues = STANDARD_SHUTTER_VALUES;
  const shutterIndex = findClosestIndex(shutterValues, shutter);
  const apertureIndex = findClosestIndex(apertureStops, aperture);

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
        <div style={{ marginTop: 6 }}>f/{(apertureStops[apertureIndex] ?? aperture).toFixed(1)}</div>
      </div>
      <div style={{ marginTop: '1rem' }}>
        <div className="label">Shutter</div>
        <input
          type="range"
          min={0}
          max={Math.max(shutterValues.length - 1, 0)}
          step={1}
          className="range"
          value={shutterIndex}
          onChange={(e) => {
            const idx = Number(e.target.value);
            const nextValue = shutterValues[idx] ?? shutterValues[shutterValues.length - 1] ?? shutter;
            setShutter(nextValue);
          }}
        />
        <div style={{ marginTop: 6 }}>
          {`1/${Math.round(1 / (shutterValues[shutterIndex] ?? shutter))}`} s
        </div>
      </div>
      <div style={{ marginTop: '1rem' }}>
        <div className="label">ISO {mode === 'auto' ? '(computed)' : ''}</div>
        <input
          type="range"
          min={0}
          max={isoValues.length - 1}
          step={1}
          disabled={mode === 'auto'}
          className="range"
          value={mode === 'auto' ? autoIsoIndex : manualIsoIndex}
          onChange={(e) => {
            const idx = Number(e.target.value);
            const nextIso = isoValues[Math.max(0, Math.min(idx, isoValues.length - 1))];
            setIso(nextIso);
          }}
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
