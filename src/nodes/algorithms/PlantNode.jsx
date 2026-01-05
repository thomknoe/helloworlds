import { useEffect } from "react";
import { Handle, Position } from "reactflow";
export default function PlantNode({ id, data }) {
  const {
    label = "Plant",
    positionX = 0,
    positionY = 0,
    positionZ = 0,
    branchThickness = 0.1,
    branchColor = "#8B4513",
    leafSize = 0.3,
    leafColor = "#228B22",
    leafDensity = 0.7,
    onChange,
    onOutput,
  } = data || {};
  const update = (patch) => onChange?.({ ...data, ...patch });
  const stop = (e) => e.stopPropagation();
  useEffect(() => {
    onOutput?.({
      id,
      type: "plant",
      positionX,
      positionY,
      positionZ,
      branchThickness,
      branchColor,
      leafSize,
      leafColor,
      leafDensity,
    });
  }, [id, positionX, positionY, positionZ, branchThickness, branchColor, leafSize, leafColor, leafDensity, onOutput]);
  return (
    <div className="node-default node-plant">
      <div style={{
        position: 'absolute',
        left: '-90px',
        top: '35px',
        fontSize: '11px',
        color: '#4a90e2',
        fontWeight: 'bold',
        whiteSpace: 'nowrap',
        pointerEvents: 'none'
      }}>
        ← L-System
      </div>
      <Handle
        type="target"
        position={Position.Left}
        id="lsystem"
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
        <div className="node-param-label">Pos X</div>
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
        <div className="node-param-label">Pos Y</div>
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
        <div className="node-param-label">Pos Z</div>
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
        <div className="node-param-label">Branch Thickness</div>
        <input
          className="node-param-input"
          type="number"
          step="0.01"
          min="0.01"
          max="1"
          value={branchThickness}
          onPointerDown={stop}
          onMouseDown={stop}
          onChange={(e) => update({ branchThickness: Number(e.target.value) })}
        />
      </div>
      <div className="node-param-row">
        <div className="node-param-label">Bark Color</div>
        <input
          className="node-param-input"
          type="color"
          value={branchColor}
          onPointerDown={stop}
          onMouseDown={stop}
          onChange={(e) => update({ branchColor: e.target.value })}
        />
      </div>
      <div className="node-param-row">
        <div className="node-param-label">Leaf Size</div>
        <input
          className="node-param-input"
          type="number"
          step="0.05"
          min="0.1"
          max="1.0"
          value={leafSize}
          onPointerDown={stop}
          onMouseDown={stop}
          onChange={(e) => update({ leafSize: Number(e.target.value) })}
        />
      </div>
      <div className="node-param-row">
        <div className="node-param-label">Leaf Color</div>
        <input
          className="node-param-input"
          type="color"
          value={leafColor}
          onPointerDown={stop}
          onMouseDown={stop}
          onChange={(e) => update({ leafColor: e.target.value })}
        />
      </div>
      <div className="node-param-row">
        <div className="node-param-label">Leaf Density</div>
        <input
          className="node-param-input"
          type="number"
          step="0.1"
          min="0"
          max="1"
          value={leafDensity}
          onPointerDown={stop}
          onMouseDown={stop}
          onChange={(e) => update({ leafDensity: Number(e.target.value) })}
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
        Plant →
      </div>
      <Handle
        type="source"
        position={Position.Right}
        id="plant"
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
