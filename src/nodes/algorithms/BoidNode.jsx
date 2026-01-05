import { useEffect } from "react";
import { Handle, Position } from "reactflow";
export default function BoidNode({ id, data }) {
  const {
    label = "Boids",
    count = 10,
    positionX = 0,
    positionY = 50,
    positionZ = 0,
    velocityX = 0,
    velocityY = 0,
    velocityZ = 0,
    size = 0.3,
    spread = 5.0,
    onChange,
    onOutput,
  } = data || {};
  const update = (patch) => onChange?.({ ...data, ...patch });
  const stop = (e) => e.stopPropagation();
  useEffect(() => {
    onOutput?.({
      id,
      type: "boid",
      count,
      positionX,
      positionY,
      positionZ,
      velocityX,
      velocityY,
      velocityZ,
      size,
      spread,
    });
  }, [id, count, positionX, positionY, positionZ, velocityX, velocityY, velocityZ, size, spread, onOutput]);
  return (
    <div className="node-default node-boid">
      <Handle type="target" position={Position.Left} id="behavior" style={{ top: 40 }} />
      <div className="node-title">{label}</div>
      <div className="node-param-row">
        <div className="node-param-label">Count</div>
        <input
          className="node-param-input"
          type="number"
          min={1}
          max={200}
          value={count}
          onPointerDown={stop}
          onMouseDown={stop}
          onChange={(e) => update({ count: Number(e.target.value) })}
        />
      </div>
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
        <div className="node-param-label">Size</div>
        <input
          className="node-param-input"
          type="number"
          step="0.01"
          min="0.1"
          max="2"
          value={size}
          onPointerDown={stop}
          onMouseDown={stop}
          onChange={(e) => update({ size: Number(e.target.value) })}
        />
      </div>
      <div className="node-param-row">
        <div className="node-param-label">Spread</div>
        <input
          className="node-param-input"
          type="number"
          step="0.1"
          min="0"
          max="50"
          value={spread}
          onPointerDown={stop}
          onMouseDown={stop}
          onChange={(e) => update({ spread: Number(e.target.value) })}
        />
      </div>
      <Handle
        type="source"
        position={Position.Right}
        id="boid"
        style={{ top: 120 }}
      />
    </div>
  );
}
