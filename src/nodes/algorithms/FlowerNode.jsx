import { useEffect } from "react";
import { Handle, Position } from "reactflow";
export default function FlowerNode({ id, data }) {
  const {
    label = "Flowers",
    count = 50,
    spread = 50.0,
    size = 1.0,
    onChange,
    onOutput,
  } = data || {};
  const update = (patch) => onChange?.({ ...data, ...patch });
  const stop = (e) => e.stopPropagation();
  useEffect(() => {
    onOutput?.({
      id,
      type: "flower",
      count,
      spread,
      size,
    });
  }, [id, count, spread, size, onOutput]);
  return (
    <div className="node-default node-flower">
      <div style={{
        position: 'absolute',
        left: '-80px',
        top: '35px',
        fontSize: '11px',
        color: '#4a90e2',
        fontWeight: 'bold',
        whiteSpace: 'nowrap',
        pointerEvents: 'none'
      }}>
        ← Perlin Noise
      </div>
      <Handle
        type="target"
        position={Position.Left}
        id="noise"
        style={{
          top: 40,
          width: '12px',
          height: '12px',
          background: '#4a90e2',
          border: '2px solid #ffffff',
          boxShadow: '0 0 8px rgba(74, 144, 226, 0.6)'
        }}
      />
      <div className="node-title">{label}</div>
      <div className="node-param-row">
        <div className="node-param-label">Count</div>
        <input
          className="node-param-input"
          type="number"
          min={1}
          max={500}
          value={count}
          onPointerDown={stop}
          onMouseDown={stop}
          onChange={(e) => update({ count: Number(e.target.value) })}
        />
      </div>
      <div className="node-param-row">
        <div className="node-param-label">Spread</div>
        <input
          className="node-param-input"
          type="number"
          step="1"
          min="10"
          max="200"
          value={spread}
          onPointerDown={stop}
          onMouseDown={stop}
          onChange={(e) => update({ spread: Number(e.target.value) })}
        />
      </div>
      <div className="node-param-row">
        <div className="node-param-label">Size</div>
        <input
          className="node-param-input"
          type="number"
          step="0.1"
          min="0.5"
          max="3.0"
          value={size}
          onPointerDown={stop}
          onMouseDown={stop}
          onChange={(e) => update({ size: Number(e.target.value) })}
        />
      </div>
      <div style={{
        position: 'absolute',
        right: '-75px',
        top: '115px',
        fontSize: '11px',
        color: '#4a9e4a',
        fontWeight: 'bold',
        whiteSpace: 'nowrap',
        pointerEvents: 'none'
      }}>
        Flowers →
      </div>
      <Handle
        type="source"
        position={Position.Right}
        id="flower"
        style={{
          top: 120,
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
