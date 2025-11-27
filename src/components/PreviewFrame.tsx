import backgroundImage from '../assets/background.jpg';
import playerImage from '../assets/player.png';
import { FIELD_LENGTH_M, FIELD_WIDTH_M } from '../constants';
import { useEffect, useRef, useState } from 'react';
import { distance, distanceToViewBoundary, frameFillPercent, horizontalFov, verticalFov, exposureDifferenceStops, autoIso } from '../lib/calculations';
import { usePlannerStore } from '../store/usePlannerStore';
import { getSelectedPlayer } from '../store/usePlannerStore';

function computeBackgroundBlurPx(
  focalLength: number,
  aperture: number,
  focusDistanceM: number,
  backgroundDistanceM: number,
  pxScale: number
) {
  const SENSOR_COC_MM = 0.03;
  const focusMm = Math.max(focusDistanceM, 0.1) * 1000;
  const backgroundMm = Math.max(backgroundDistanceM, focusDistanceM + 0.1) * 1000;
  const f = focalLength; // already mm
  const N = aperture;
  const denominator = Math.max(1, focusMm - f);
  const defocusCoC =
    (f * f * Math.abs(backgroundMm - focusMm)) / (N * backgroundMm * denominator);
  const effectiveCoC = Math.max(0, defocusCoC - SENSOR_COC_MM);
  return Math.min(18, effectiveCoC * pxScale);
}

export default function PreviewFrame() {
  const frameRef = useRef<HTMLDivElement | null>(null);
  const [frameWidth, setFrameWidth] = useState(420);
  useEffect(() => {
    if (!frameRef.current) return;
    const observer = new ResizeObserver((entries) => {
      if (!entries[0]) return;
      setFrameWidth(entries[0].contentRect.width);
    });
    observer.observe(frameRef.current);
    return () => observer.disconnect();
  }, []);

  const state = usePlannerStore();
  const player = getSelectedPlayer();
  const dist = distance(state.camera, player.position);
  const fill = frameFillPercent(dist, state.playerHeight, state.focalLength);
  const hFovDeg = (horizontalFov(state.focalLength) * 180) / Math.PI;
  const vFovDeg = (verticalFov(state.focalLength) * 180) / Math.PI;
  const autoIsoState = autoIso(state.lighting.ev100, state.aperture, state.shutter);
  const activeIso = state.mode === 'auto' ? autoIsoState.iso : state.iso;
  const diffStops = exposureDifferenceStops(state.lighting.ev100, state.aperture, state.shutter, activeIso);

  const figureFillPercent = Math.max(6, Math.min(fill, 100));
  const viewVector = {
    x: player.position.x - state.camera.x,
    y: player.position.y - state.camera.y
  };
  const hasDirection = Math.abs(viewVector.x) > 1e-3 || Math.abs(viewVector.y) > 1e-3;
  const viewAngle = hasDirection
    ? Math.atan2(viewVector.y, viewVector.x)
    : Math.atan2(FIELD_WIDTH_M / 2 - state.camera.y, FIELD_LENGTH_M / 2 - state.camera.x);
  const viewEdge = distanceToViewBoundary(state.camera, viewAngle);
  const backgroundDistance = Math.max(dist + 0.1, viewEdge.distance + 5);
  const pxScale = frameWidth / 36;
  const backgroundBlur = computeBackgroundBlurPx(
    state.focalLength,
    state.aperture,
    dist,
    backgroundDistance,
    pxScale
  );
  const brightnessFactor = Math.max(0.4, Math.min(1.65, 1 + diffStops * 0.35));
  const overlayAlpha = Math.min(0.5, Math.abs(diffStops) * 0.12);
  const overlayColor =
    diffStops >= 0 ? `rgba(255,255,255,${overlayAlpha})` : `rgba(0,0,0,${overlayAlpha})`;

  return (
    <div className="panel preview-panel">
      <div className="flex-between">
        <h3 className="section-title">Preview & Analysis</h3>
        <span className="tag">Full-frame Camera</span>
      </div>
      <div className="preview-layout">
        <div className="preview-frame-shell">
          <div className="preview-frame" ref={frameRef}>
            <img
              src={backgroundImage}
              alt="Grandstand background"
              className="preview-background"
              style={{ filter: `blur(${backgroundBlur.toFixed(2)}px) brightness(${brightnessFactor.toFixed(2)})` }}
            />
            <div
              className="preview-brightness"
              style={{
                background: overlayColor
              }}
            />
            <img
              src={playerImage}
              alt="Subject silhouette"
              className="preview-player"
              style={{
                height: `${figureFillPercent}%`,
                filter: `brightness(${brightnessFactor.toFixed(2)})`
              }}
            />
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
