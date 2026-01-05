import { useEffect } from "react";
import { Handle, Position } from "reactflow";
import RidgeNoise from "../../algorithms/ridgeNoise.js";
export default function RidgeNoiseNode({ id, data }) {
  const {
    label = "Ridge Noise",
    seed = 42,
    scale = 0.05,
    octaves = 4,
    persistence = 0.5,
    amplitude = 10,
    offset = 0.0,
    power = 2.0,
    onChange,
    onOutput,
  } = data || {};
  const update = (patch) => onChange?.({ ...data, ...patch });
  const stop = (e) => e.stopPropagation();
  useEffect(() => {
    const value = RidgeNoise.noise2DFractal(
      seed * scale,
      seed * scale,
      scale,
      octaves,
      persistence,
      offset,
      power
    );
    onOutput?.({
      id,
      type: "ridgeNoise",
      value,
      seed,
      scale,
      octaves,
      persistence,
      amplitude,
      offset,
      power,
    });
  }, [id, seed, scale, octaves, persistence, amplitude, offset, power, onOutput]);
  return (
    <div className="node-default node-ridge-noise">
      <div className="node-title">{label}</div>
      <div className="node-param-row">
        <div className="node-param-label">Seed</div>
        <input
          className="node-param-input"
          type="number"
          value={seed}
          onPointerDown={stop}
          onMouseDown={stop}
          onChange={(e) => update({ seed: Number(e.target.value) })}
        />
      </div>
      <div className="node-param-row">
        <div className="node-param-label">Scale</div>
        <input
          className="node-param-input"
          type="number"
          step="0.001"
          value={scale}
          onPointerDown={stop}
          onMouseDown={stop}
          onChange={(e) => update({ scale: Number(e.target.value) })}
        />
      </div>
      <div className="node-param-row">
        <div className="node-param-label">Octaves</div>
        <input
          className="node-param-input"
          type="number"
          min={1}
          max={8}
          value={octaves}
          onPointerDown={stop}
          onMouseDown={stop}
          onChange={(e) => update({ octaves: Number(e.target.value) })}
        />
      </div>
      <div className="node-param-row">
        <div className="node-param-label">Persistence</div>
        <input
          className="node-param-input"
          type="number"
          step="0.01"
          value={persistence}
          onPointerDown={stop}
          onMouseDown={stop}
          onChange={(e) => update({ persistence: Number(e.target.value) })}
        />
      </div>
      <div className="node-param-row">
        <div className="node-param-label">Amplitude</div>
        <input
          className="node-param-input"
          type="number"
          value={amplitude}
          onPointerDown={stop}
          onMouseDown={stop}
          onChange={(e) => update({ amplitude: Number(e.target.value) })}
        />
      </div>
      <div className="node-param-row">
        <div className="node-param-label">Offset</div>
        <input
          className="node-param-input"
          type="number"
          step="0.01"
          value={offset}
          onPointerDown={stop}
          onMouseDown={stop}
          onChange={(e) => update({ offset: Number(e.target.value) })}
        />
      </div>
      <div className="node-param-row">
        <div className="node-param-label">Power</div>
        <input
          className="node-param-input"
          type="number"
          step="0.1"
          value={power}
          onPointerDown={stop}
          onMouseDown={stop}
          onChange={(e) => update({ power: Number(e.target.value) })}
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
        Ridge Noise →
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
