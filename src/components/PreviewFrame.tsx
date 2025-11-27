import { distance, frameFillPercent, horizontalFov, verticalFov, exposureDifferenceStops, autoIso } from '../lib/calculations';
import { usePlannerStore } from '../store/usePlannerStore';
import { getSelectedPlayer } from '../store/usePlannerStore';

export default function PreviewFrame() {
  const state = usePlannerStore();
  const player = getSelectedPlayer();
  const dist = distance(state.camera, player.position);
  const fill = frameFillPercent(dist, state.playerHeight, state.focalLength);
  const hFovDeg = (horizontalFov(state.focalLength) * 180) / Math.PI;
  const vFovDeg = (verticalFov(state.focalLength) * 180) / Math.PI;
  const autoIsoState = autoIso(state.lighting.ev100, state.aperture, state.shutter);
  const activeIso = state.mode === 'auto' ? autoIsoState.iso : state.iso;
  const diffStops = exposureDifferenceStops(state.lighting.ev100, state.aperture, state.shutter, activeIso);
  const darkness = Math.max(0, Math.min(0.85, -diffStops * 0.15));
  const overGlow = Math.max(0, diffStops > 0 ? diffStops * 0.08 : 0);

  const figureFillPercent = Math.max(6, Math.min(fill, 100));

  return (
    <div className="panel preview-panel">
      <div className="flex-between">
        <h3 className="section-title">Preview & Analysis</h3>
        <span className="tag">Canon R6 Mark II · Full-frame</span>
      </div>
      <div className="preview-layout">
        <div className="preview-frame-shell">
          <div className="preview-frame">
            <div
              className="preview-brightness"
              style={{
                background: `rgba(0,0,0,${darkness})`,
                boxShadow: overGlow ? `inset 0 0 40px rgba(255,255,255,${overGlow})` : undefined
              }}
            />
            <div
              className="preview-figure"
              style={{
                height: `${figureFillPercent}%`,
                bottom: 0
              }}
            >
              <div className="head" />
              <div className="body" />
            </div>
          </div>
        </div>
        <div className="preview-metrics">
          <div className="metric">
            <strong>Frame fill (height)</strong>
            <span>{fill.toFixed(1)}%</span>
          </div>
          <div className="metric">
            <strong>Distance</strong>
            <span>{dist.toFixed(1)} m</span>
          </div>
          <div className="metric">
            <strong>Field of view</strong>
            <span>
              {hFovDeg.toFixed(1)}° × {vFovDeg.toFixed(1)}°
            </span>
          </div>
          <div className="metric">
            <strong>Exposure delta</strong>
            <span>{diffStops.toFixed(2)} stops</span>
          </div>
        </div>
      </div>
    </div>
  );
}
