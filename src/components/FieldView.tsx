import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { FIELD_LENGTH_M, FIELD_WIDTH_M } from '../constants';
import { distance, distanceToViewBoundary, horizontalFov, projectRayToField } from '../lib/calculations';
import { usePlannerStore } from '../store/usePlannerStore';

function useSvgPoint(svgRef: React.RefObject<SVGSVGElement>) {
  return (clientX: number, clientY: number) => {
    const svg = svgRef.current;
    if (!svg) return { x: 0, y: 0 };
    const pt = svg.createSVGPoint();
    pt.x = clientX;
    pt.y = clientY;
    const screenPoint = pt.matrixTransform(svg.getScreenCTM()?.inverse());
    return { x: screenPoint.x / 10, y: screenPoint.y / 10 };
  };
}

export default function FieldView() {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const projector = useSvgPoint(svgRef);
  const { camera, players, movePlayer, setCamera, selectedPlayerId, setSelectedPlayer, focalLength } =
    usePlannerStore();
  const [dragging, setDragging] = useState<{ type: 'camera' | 'player'; id?: string } | null>(
    null
  );

  const distances = useMemo(() => {
    return players.map((p) => ({ id: p.id, value: distance(camera, p.position) }));
  }, [camera, players]);

  const handleDown = (type: 'camera' | 'player', id?: string) =>
    setDragging({ type, id });

  const updatePosition = useCallback(
    (clientX: number, clientY: number) => {
      if (!dragging) return;
      const posMeters = projector(clientX, clientY);
      if (dragging.type === 'camera') {
        setCamera(posMeters);
      } else if (dragging.type === 'player' && dragging.id) {
        movePlayer(dragging.id, posMeters);
      }
    },
    [dragging, movePlayer, projector, setCamera]
  );

  const handleMove: React.PointerEventHandler<SVGSVGElement> = (evt) => {
    updatePosition(evt.clientX, evt.clientY);
  };

  const handleUp = () => setDragging(null);

  useEffect(() => {
    if (!dragging) return;
    const handleGlobalMove = (evt: PointerEvent) => {
      updatePosition(evt.clientX, evt.clientY);
    };
    const handleGlobalUp = () => setDragging(null);
    window.addEventListener('pointermove', handleGlobalMove);
    window.addEventListener('pointerup', handleGlobalUp);
    window.addEventListener('pointercancel', handleGlobalUp);
    return () => {
      window.removeEventListener('pointermove', handleGlobalMove);
      window.removeEventListener('pointerup', handleGlobalUp);
      window.removeEventListener('pointercancel', handleGlobalUp);
    };
  }, [dragging, updatePosition]);

  const selectedPlayer = players.find((p) => p.id === selectedPlayerId) ?? players[0];
  const playerDistance = distances.find((d) => d.id === selectedPlayerId)?.value ?? 0;
  const viewVector = {
    x: selectedPlayer.position.x - camera.x,
    y: selectedPlayer.position.y - camera.y
  };
  const hasDirection = Math.abs(viewVector.x) > 1e-3 || Math.abs(viewVector.y) > 1e-3;
  const viewAngle = hasDirection
    ? Math.atan2(viewVector.y, viewVector.x)
    : Math.atan2(FIELD_WIDTH_M / 2 - camera.y, FIELD_LENGTH_M / 2 - camera.x);
  const hfov = horizontalFov(focalLength);
  const halfFov = hfov / 2;
  const viewEdge = distanceToViewBoundary(camera, viewAngle);
  const backgroundDistance = viewEdge.distance;
  const leftBeam = projectRayToField(camera, viewAngle - halfFov);
  const rightBeam = projectRayToField(camera, viewAngle + halfFov);

  return (
    <div className="panel field-panel">
      <div className="flex-between">
        <h3 className="section-title">Field & Positions</h3>
        <span className="tag">Hockey Stadium · 91.4 × 55 m</span>
      </div>
      <div className="field-wrapper">
        <div className="field-body">
          <div className="field-info">
            <div className="legend legend-vertical">
              <span>
                <span className="dot" style={{ background: '#fb7185' }} /> Camera
              </span>
              <span>
                <span className="dot" style={{ background: '#2563eb' }} /> Target subject link
              </span>
            </div>
            <div className="field-metrics">
              <div className="metric">
                <strong>Camera position</strong>
                <span>{camera.x.toFixed(1)} m, {camera.y.toFixed(1)} m</span>
              </div>
              <div className="metric">
                <strong>Distance to subject</strong>
                <span>{playerDistance.toFixed(1)} m</span>
              </div>
              <div className="metric">
                <strong>Distance to background</strong>
                <span>{backgroundDistance.toFixed(1)} m</span>
              </div>
            </div>
          </div>
          <svg
            ref={svgRef}
            className="field-svg"
            viewBox={`-50 -50 ${FIELD_LENGTH_M * 10 + 100} ${FIELD_WIDTH_M * 10 + 100}`}
            onPointerMove={handleMove}
            onPointerUp={handleUp}
          >
            <defs>
              <pattern id="turf" x="0" y="0" width="12" height="12" patternUnits="userSpaceOnUse">
                <rect x="0" y="0" width="12" height="12" fill="#0f9f6e" opacity="0.16" />
                <rect x="0" y="0" width="6" height="6" fill="#0f9f6e" opacity="0.14" />
                <rect x="6" y="6" width="6" height="6" fill="#0f9f6e" opacity="0.12" />
              </pattern>
            </defs>
            <rect
              x={0}
              y={0}
              width={FIELD_LENGTH_M * 10}
              height={FIELD_WIDTH_M * 10}
              fill="url(#turf)"
              stroke="var(--field-outline)"
              strokeWidth={2}
              rx={12}
            />
            {leftBeam && rightBeam && (
              <path
                d={`M${camera.x * 10},${camera.y * 10} L${leftBeam.x * 10},${leftBeam.y * 10} L${rightBeam.x * 10},${rightBeam.y * 10} Z`}
                fill="rgba(37, 99, 235, 0.08)"
                stroke="rgba(37, 99, 235, 0.3)"
                strokeWidth={1}
              />
            )}
            <line
              x1={FIELD_LENGTH_M * 5}
              y1={0}
              x2={FIELD_LENGTH_M * 5}
              y2={FIELD_WIDTH_M * 10}
              stroke="var(--field-line)"
              strokeDasharray="8 6"
              strokeWidth={2}
            />
            <g stroke="var(--field-line)" strokeWidth={2}>
              <rect x={10} y={(FIELD_WIDTH_M * 10) / 2 - 90} width={40} height={180} fill="none" />
              <rect
                x={FIELD_LENGTH_M * 10 - 50}
                y={(FIELD_WIDTH_M * 10) / 2 - 90}
                width={40}
                height={180}
                fill="none"
              />
            </g>

            <g fill="#fb7185">
              <circle
                cx={camera.x * 10}
                cy={camera.y * 10}
                r={10}
                fill="#fb7185"
                stroke="#be123c"
                strokeWidth={3}
                onPointerDown={(e) => {
                  handleDown('camera');
                  e.stopPropagation();
                }}
                role="button"
              />
              <path
                d={`M${camera.x * 10 - 12},${camera.y * 10 - 16} h24 l-6 8 h-12 z`}
                fill="#be123c"
              />
            </g>

            {players.map((player) => (
              <g
                key={player.id}
                onPointerDown={(e) => {
                  handleDown('player', player.id);
                  e.stopPropagation();
                  setSelectedPlayer(player.id);
                }}
                style={{ cursor: 'grab' }}
              >
                <line
                  x1={camera.x * 10}
                  y1={camera.y * 10}
                  x2={player.position.x * 10}
                  y2={player.position.y * 10}
                  stroke={player.id === selectedPlayerId ? '#2563eb' : '#94a3b8'}
                  strokeDasharray="6 6"
                />
                <circle
                  cx={player.position.x * 10}
                  cy={player.position.y * 10}
                  r={9}
                  fill={player.id === selectedPlayerId ? '#2563eb' : '#38bdf8'}
                  stroke="var(--field-outline)"
                  strokeWidth={2}
                />
                <text
                  x={player.position.x * 10 + 14}
                  y={player.position.y * 10 - 14}
                  fontSize={24}
                  fill="var(--text-color)"
                >
                  {player.label}
                </text>
              </g>
            ))}
          </svg>
        </div>
      </div>
    </div>
  );
}
