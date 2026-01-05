import { useEffect } from "react";
import { Handle, Position } from "reactflow";
import DomainWarping from "../../algorithms/domainWarping.js";
export default function DomainWarpingNode({ id, data }) {
  const {
    label = "Domain Warping",
    seed = 42,
    baseScale = 0.05,
    warpStrength = 5.0,
    warpScale = 0.1,
    octaves = 4,
    persistence = 0.5,
    amplitude = 10,
    onChange,
    onOutput,
  } = data || {};
  const update = (patch) => onChange?.({ ...data, ...patch });
  const stop = (e) => e.stopPropagation();
  useEffect(() => {
    const value = DomainWarping.noise2DFractal(
      seed * baseScale,
      seed * baseScale,
      baseScale,
      warpStrength,
      warpScale,
      octaves,
      persistence
    );
    onOutput?.({
      id,
      type: "domainWarping",
      value,
      seed,
      baseScale,
      warpStrength,
      warpScale,
      octaves,
      persistence,
      amplitude,
    });
  }, [id, seed, baseScale, warpStrength, warpScale, octaves, persistence, amplitude, onOutput]);
  return (
    <div className="node-default node-domain-warping">
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
        <div className="node-param-label">Base Scale</div>
        <input
          className="node-param-input"
          type="number"
          step="0.001"
          value={baseScale}
          onPointerDown={stop}
          onMouseDown={stop}
          onChange={(e) => update({ baseScale: Number(e.target.value) })}
        />
      </div>
      <div className="node-param-row">
        <div className="node-param-label">Warp Strength</div>
        <input
          className="node-param-input"
          type="number"
          step="0.1"
          value={warpStrength}
          onPointerDown={stop}
          onMouseDown={stop}
          onChange={(e) => update({ warpStrength: Number(e.target.value) })}
        />
      </div>
      <div className="node-param-row">
        <div className="node-param-label">Warp Scale</div>
        <input
          className="node-param-input"
          type="number"
          step="0.001"
          value={warpScale}
          onPointerDown={stop}
          onMouseDown={stop}
          onChange={(e) => update({ warpScale: Number(e.target.value) })}
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
        Domain Warping →
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
