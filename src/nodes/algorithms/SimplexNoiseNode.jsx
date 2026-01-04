import { useEffect } from "react";
import { Handle, Position } from "reactflow";
import Simplex from "../../algorithms/simplex.js";

export default function SimplexNoiseNode({ id, data }) {
  const {
    label = "Simplex Noise",
    seed = 42,
    scale = 0.05,
    octaves = 4,
    persistence = 0.5,
    amplitude = 10,
    zOffset = 0.0,
    onChange,
    onOutput,
  } = data || {};

  const update = (patch) => onChange?.({ ...data, ...patch });
  const stop = (e) => e.stopPropagation();

  useEffect(() => {
    const value = Simplex.noise3DFractal(
      seed * scale,
      seed * scale,
      zOffset,
      octaves,
      persistence,
      scale
    );

    onOutput?.({
      id,
      type: "simplexNoise",
      value,
      seed,
      scale,
      octaves,
      persistence,
      amplitude,
      zOffset,
    });
  }, [id, seed, scale, octaves, persistence, amplitude, zOffset, onOutput]);

  return (
    <div className="node-default node-simplex">
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
        <div className="node-param-label">Z Offset</div>
        <input
          className="node-param-input"
          type="number"
          step="0.1"
          value={zOffset}
          onPointerDown={stop}
          onMouseDown={stop}
          onChange={(e) => update({ zOffset: Number(e.target.value) })}
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
        Simplex Noise →
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

