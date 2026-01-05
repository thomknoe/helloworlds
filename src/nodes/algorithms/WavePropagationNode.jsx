import { useEffect } from "react";
import { Handle, Position } from "reactflow";
export default function WavePropagationNode({ id, data }) {
  const {
    label = "Wave Propagation",
    amplitude = 1.0,
    speed = 10.0,
    decayRate = 0.1,
    lifetime = 5.0,
    maxWaves = 10,
    onChange,
    onOutput,
  } = data || {};
  const update = (patch) => onChange?.({ ...data, ...patch });
  const stop = (e) => e.stopPropagation();
  useEffect(() => {
    onOutput?.({
      id,
      type: "wavePropagation",
      amplitude,
      speed,
      decayRate,
      lifetime,
      maxWaves,
    });
  }, [id, amplitude, speed, decayRate, lifetime, maxWaves, onOutput]);
  return (
    <div className="node-default node-wave-propagation">
      <div className="node-title">{label}</div>
      <div className="node-param-row">
        <div className="node-param-label">Amplitude</div>
        <input
          className="node-param-input"
          type="number"
          step="0.1"
          min="0"
          value={amplitude}
          onPointerDown={stop}
          onMouseDown={stop}
          onChange={(e) => update({ amplitude: Number(e.target.value) })}
        />
      </div>
      <div className="node-param-row">
        <div className="node-param-label">Speed</div>
        <input
          className="node-param-input"
          type="number"
          step="0.1"
          min="0"
          value={speed}
          onPointerDown={stop}
          onMouseDown={stop}
          onChange={(e) => update({ speed: Number(e.target.value) })}
        />
      </div>
      <div className="node-param-row">
        <div className="node-param-label">Decay Rate</div>
        <input
          className="node-param-input"
          type="number"
          step="0.01"
          min="0"
          value={decayRate}
          onPointerDown={stop}
          onMouseDown={stop}
          onChange={(e) => update({ decayRate: Number(e.target.value) })}
        />
      </div>
      <div className="node-param-row">
        <div className="node-param-label">Lifetime</div>
        <input
          className="node-param-input"
          type="number"
          step="0.1"
          min="0"
          value={lifetime}
          onPointerDown={stop}
          onMouseDown={stop}
          onChange={(e) => update({ lifetime: Number(e.target.value) })}
        />
      </div>
      <div className="node-param-row">
        <div className="node-param-label">Max Waves</div>
        <input
          className="node-param-input"
          type="number"
          min={1}
          max={100}
          value={maxWaves}
          onPointerDown={stop}
          onMouseDown={stop}
          onChange={(e) => update({ maxWaves: Number(e.target.value) })}
        />
      </div>
      <div style={{
        position: 'absolute',
        right: '-100px',
        top: '40px',
        fontSize: '11px',
        color: '#4a9e4a',
        fontWeight: 'bold',
        whiteSpace: 'nowrap',
        pointerEvents: 'none'
      }}>
        Wave Propagation →
      </div>
      <Handle
        type="source"
        position={Position.Right}
        id="config"
        style={{
          top: 40,
          width: '12px',
          height: '12px',
          background: '#4a9e4a',
          border: '2px solid #ffffff',
          boxShadow: '0 0 8px rgba(74, 158, 74, 0.6)'
        }}
      />
    </div>
  );
}
