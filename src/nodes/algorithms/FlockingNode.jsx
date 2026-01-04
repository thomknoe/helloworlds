import { useEffect } from "react";
import { Handle, Position } from "reactflow";

export default function FlockingNode({ id, data }) {
  const {
    label = "Flocking Behavior",
    separation = 1.5,
    alignment = 1.0,
    cohesion = 1.0,
    separationRadius = 2.0,
    neighborRadius = 5.0,
    maxSpeed = 5.0,
    maxForce = 0.1,
    boundsWidth = 50,
    boundsDepth = 50,
    planeHeight = 50,
    onChange,
    onOutput,
  } = data || {};

  const update = (patch) => onChange?.({ ...data, ...patch });
  const stop = (e) => e.stopPropagation();

  useEffect(() => {
    onOutput?.({
      id,
      type: "flockingBehavior",
      separation,
      alignment,
      cohesion,
      separationRadius,
      neighborRadius,
      maxSpeed,
      maxForce,
      boundsWidth,
      boundsDepth,
      planeHeight,
    });
  }, [
    id,
    separation,
    alignment,
    cohesion,
    separationRadius,
    neighborRadius,
    maxSpeed,
    maxForce,
    boundsWidth,
    boundsDepth,
    planeHeight,
    onOutput,
  ]);

  return (
    <div className="node-default node-flocking">
      <div className="node-title">{label}</div>

      <div className="node-param-row">
        <div className="node-param-label">Separation</div>
        <input
          className="node-param-input"
          type="number"
          step="0.1"
          value={separation}
          onPointerDown={stop}
          onMouseDown={stop}
          onChange={(e) => update({ separation: Number(e.target.value) })}
        />
      </div>

      <div className="node-param-row">
        <div className="node-param-label">Alignment</div>
        <input
          className="node-param-input"
          type="number"
          step="0.1"
          value={alignment}
          onPointerDown={stop}
          onMouseDown={stop}
          onChange={(e) => update({ alignment: Number(e.target.value) })}
        />
      </div>

      <div className="node-param-row">
        <div className="node-param-label">Cohesion</div>
        <input
          className="node-param-input"
          type="number"
          step="0.1"
          value={cohesion}
          onPointerDown={stop}
          onMouseDown={stop}
          onChange={(e) => update({ cohesion: Number(e.target.value) })}
        />
      </div>

      <div className="node-param-row">
        <div className="node-param-label">Sep. Radius</div>
        <input
          className="node-param-input"
          type="number"
          step="0.1"
          value={separationRadius}
          onPointerDown={stop}
          onMouseDown={stop}
          onChange={(e) => update({ separationRadius: Number(e.target.value) })}
        />
      </div>

      <div className="node-param-row">
        <div className="node-param-label">Neighbor Radius</div>
        <input
          className="node-param-input"
          type="number"
          step="0.1"
          value={neighborRadius}
          onPointerDown={stop}
          onMouseDown={stop}
          onChange={(e) => update({ neighborRadius: Number(e.target.value) })}
        />
      </div>

      <div className="node-param-row">
        <div className="node-param-label">Max Speed</div>
        <input
          className="node-param-input"
          type="number"
          step="0.1"
          value={maxSpeed}
          onPointerDown={stop}
          onMouseDown={stop}
          onChange={(e) => update({ maxSpeed: Number(e.target.value) })}
        />
      </div>

      <div className="node-param-row">
        <div className="node-param-label">Plane Height</div>
        <input
          className="node-param-input"
          type="number"
          step="1"
          value={planeHeight}
          onPointerDown={stop}
          onMouseDown={stop}
          onChange={(e) => update({ planeHeight: Number(e.target.value) })}
        />
      </div>

      <div className="node-param-row">
        <div className="node-param-label">Bounds Width</div>
        <input
          className="node-param-input"
          type="number"
          step="1"
          value={boundsWidth}
          onPointerDown={stop}
          onMouseDown={stop}
          onChange={(e) => update({ boundsWidth: Number(e.target.value) })}
        />
      </div>

      <div className="node-param-row">
        <div className="node-param-label">Bounds Depth</div>
        <input
          className="node-param-input"
          type="number"
          step="1"
          value={boundsDepth}
          onPointerDown={stop}
          onMouseDown={stop}
          onChange={(e) => update({ boundsDepth: Number(e.target.value) })}
        />
      </div>

      <div style={{
        position: 'absolute',
        right: '-100px',
        top: '115px',
        fontSize: '11px',
        color: '#4a9e4a',
        fontWeight: 'bold',
        whiteSpace: 'nowrap',
        pointerEvents: 'none'
      }}>
        Behavior →
      </div>
      <Handle
        type="source"
        position={Position.Right}
        id="behavior"
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
