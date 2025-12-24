import { useEffect } from "react";
import { Handle, Position } from "reactflow";

export default function BuildingNode({ id, data }) {
  const {
    label = "Building",
    positionX = 0,
    positionY = 0,
    positionZ = 0,
    color = "#ffffff",
    onChange,
    onOutput,
  } = data || {};

  const update = (patch) => onChange?.({ ...data, ...patch });
  const stop = (e) => e.stopPropagation();

  useEffect(() => {
    onOutput?.({
      id,
      type: "building",
      positionX,
      positionY,
      positionZ,
      color,
    });
  }, [id, positionX, positionY, positionZ, color, onOutput]);

  return (
    <div className="node-default node-building">

      <div style={{
        position: 'absolute',
        left: '-95px',
        top: '35px',
        fontSize: '11px',
        color: '#4a90e2',
        fontWeight: 'bold',
        whiteSpace: 'nowrap',
        pointerEvents: 'none'
      }}>
        ← Grammar
      </div>
      <Handle
        type="target"
        position={Position.Left}
        id="grammar"
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
        <div className="node-param-label">X (Horizontal)</div>
        <input
          className="node-param-input"
          type="number"
          step="0.1"
          value={positionX}
          onPointerDown={stop}
          onMouseDown={stop}
          onChange={(e) => update({ positionX: Number(e.target.value) })}
        />
      </div>

      <div className="node-param-row">
        <div className="node-param-label">Y (Vertical/Up)</div>
        <input
          className="node-param-input"
          type="number"
          step="0.1"
          value={positionY}
          onPointerDown={stop}
          onMouseDown={stop}
          onChange={(e) => update({ positionY: Number(e.target.value) })}
        />
      </div>

      <div className="node-param-row">
        <div className="node-param-label">Z (Depth/Forward)</div>
        <input
          className="node-param-input"
          type="number"
          step="0.1"
          value={positionZ}
          onPointerDown={stop}
          onMouseDown={stop}
          onChange={(e) => update({ positionZ: Number(e.target.value) })}
        />
      </div>

      <div className="node-param-row">
        <div className="node-param-label">Color</div>
        <input
          className="node-param-input"
          type="color"
          value={color}
          onPointerDown={stop}
          onMouseDown={stop}
          onChange={(e) => update({ color: e.target.value })}
        />
      </div>

      <div style={{
        position: 'absolute',
        right: '-85px',
        top: '115px',
        fontSize: '11px',
        color: '#4a9e4a',
        fontWeight: 'bold',
        whiteSpace: 'nowrap',
        pointerEvents: 'none'
      }}>
        Building →
      </div>
      <Handle
        type="source"
        position={Position.Right}
        id="building"
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
