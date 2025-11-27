import FieldView from './components/FieldView';
import LensControls from './components/LensControls';
import ExposureControls from './components/ExposureControls';
import PreviewFrame from './components/PreviewFrame';
import { usePlannerStore } from './store/usePlannerStore';

function Header() {
  return (
    <header style={{ padding: '1.25rem 1.5rem 0.5rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
      <div style={{ width: 10, height: 28, borderRadius: 12, background: '#2563eb' }} />
      <div>
        <h1 style={{ margin: 0, fontSize: '1.4rem' }}>Camera Planner</h1>
      </div>
    </header>
  );
}

function Insights() {
  const { playerHeight, setPlayerHeight, players, selectedPlayerId, setSelectedPlayer } =
    usePlannerStore();
  return (
    <div className="panel">
      <h3 className="section-title">Models & Subject</h3>
      <div className="control-row">
        <div>
          <div className="label">Active subject</div>
          <select
            className="input"
            value={selectedPlayerId}
            onChange={(e) => setSelectedPlayer(e.target.value)}
          >
            {players.map((p) => (
              <option key={p.id} value={p.id}>
                {p.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <div className="label">Subject height (m)</div>
          <input
            className="input"
            type="number"
            min={1.4}
            max={2.2}
            step={0.05}
            value={playerHeight}
            onChange={(e) => setPlayerHeight(Number(e.target.value))}
          />
        </div>
      </div>
      <p style={{ color: '#475569', marginTop: '0.75rem' }}>
        Drag subjects inside the field and the camera along sidelines to match your planned shooting
        angles. The selected subject controls the frame preview and exposure math.
      </p>
    </div>
  );
}

export default function App() {
  return (
    <>
      <Header />
      <main className="app-shell">
        <div className="left-column">
          <FieldView />
          <PreviewFrame />
        </div>
        <div className="right-column">
          <LensControls />
          <ExposureControls />
          <Insights />
        </div>
      </main>
    </>
  );
}
