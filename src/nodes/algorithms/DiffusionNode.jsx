import { useEffect } from "react";
import { Handle, Position } from "reactflow";
export default function DiffusionNode({ id, data }) {
  const {
    label = "Diffusion Heat",
    width = 100,
    height = 100,
    diffusionRate = 0.1,
    dt = 0.1,
    onChange,
    onOutput,
  } = data || {};
  const update = (patch) => onChange?.({ ...data, ...patch });
  const stop = (e) => e.stopPropagation();
  useEffect(() => {
    onOutput?.({
      id,
      type: "diffusion",
      width,
      height,
      diffusionRate,
      dt,
    });
  }, [id, width, height, diffusionRate, dt, onOutput]);
  return (
    <div className="node-default node-diffusion">
      <div className="node-title">{label}</div>
      <div className="node-param-row">
        <div className="node-param-label">Grid Width</div>
        <input
          className="node-param-input"
          type="number"
          min={10}
          max={500}
          value={width}
          onPointerDown={stop}
          onMouseDown={stop}
          onChange={(e) => update({ width: Number(e.target.value) })}
        />
      </div>
      <div className="node-param-row">
        <div className="node-param-label">Grid Height</div>
        <input
          className="node-param-input"
          type="number"
          min={10}
          max={500}
          value={height}
          onPointerDown={stop}
          onMouseDown={stop}
          onChange={(e) => update({ height: Number(e.target.value) })}
        />
      </div>
      <div className="node-param-row">
        <div className="node-param-label">Diffusion Rate</div>
        <input
          className="node-param-input"
          type="number"
          step="0.01"
          min="0"
          max="1"
          value={diffusionRate}
          onPointerDown={stop}
          onMouseDown={stop}
          onChange={(e) => update({ diffusionRate: Number(e.target.value) })}
        />
      </div>
      <div className="node-param-row">
        <div className="node-param-label">Time Step</div>
        <input
          className="node-param-input"
          type="number"
          step="0.01"
          min="0"
          value={dt}
          onPointerDown={stop}
          onMouseDown={stop}
          onChange={(e) => update({ dt: Number(e.target.value) })}
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
        Diffusion →
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
