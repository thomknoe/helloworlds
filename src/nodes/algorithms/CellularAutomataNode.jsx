import { useEffect } from "react";
import { Handle, Position } from "reactflow";

export default function CellularAutomataNode({ id, data }) {
  const {
    label = "Cellular Automata",
    width = 100,
    height = 100,
    surviveMin = 2,
    surviveMax = 3,
    birthMin = 3,
    birthMax = 3,
    onChange,
    onOutput,
  } = data || {};

  const update = (patch) => onChange?.({ ...data, ...patch });
  const stop = (e) => e.stopPropagation();

  useEffect(() => {
    onOutput?.({
      id,
      type: "cellularAutomata",
      width,
      height,
      surviveMin,
      surviveMax,
      birthMin,
      birthMax,
    });
  }, [id, width, height, surviveMin, surviveMax, birthMin, birthMax, onOutput]);

  return (
    <div className="node-default node-cellular-automata">
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
        <div className="node-param-label">Survive Min</div>
        <input
          className="node-param-input"
          type="number"
          min={0}
          max={8}
          value={surviveMin}
          onPointerDown={stop}
          onMouseDown={stop}
          onChange={(e) => update({ surviveMin: Number(e.target.value) })}
        />
      </div>

      <div className="node-param-row">
        <div className="node-param-label">Survive Max</div>
        <input
          className="node-param-input"
          type="number"
          min={0}
          max={8}
          value={surviveMax}
          onPointerDown={stop}
          onMouseDown={stop}
          onChange={(e) => update({ surviveMax: Number(e.target.value) })}
        />
      </div>

      <div className="node-param-row">
        <div className="node-param-label">Birth Min</div>
        <input
          className="node-param-input"
          type="number"
          min={0}
          max={8}
          value={birthMin}
          onPointerDown={stop}
          onMouseDown={stop}
          onChange={(e) => update({ birthMin: Number(e.target.value) })}
        />
      </div>

      <div className="node-param-row">
        <div className="node-param-label">Birth Max</div>
        <input
          className="node-param-input"
          type="number"
          min={0}
          max={8}
          value={birthMax}
          onPointerDown={stop}
          onMouseDown={stop}
          onChange={(e) => update({ birthMax: Number(e.target.value) })}
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
        Cellular Automata →
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

