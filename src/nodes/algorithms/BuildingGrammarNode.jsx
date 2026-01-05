import { useEffect } from "react";
import { Handle, Position } from "reactflow";
import { BuildingGrammar } from "../../algorithms/buildingGrammar.js";
export default function BuildingGrammarNode({ id, data }) {
  const {
    label = "Building Grammar",
    levels = 3,
    roomsPerLevel = 4,
    roomSize = 4.0,
    levelHeight = 3.0,
    wallThickness = 0.2,
    hasStairs = true,
    roomLayout = "grid",
    onChange,
    onOutput,
  } = data || {};
  const update = (patch) => onChange?.({ ...data, ...patch });
  const stop = (e) => e.stopPropagation();
  useEffect(() => {
    const grammar = new BuildingGrammar({
      levels,
      roomsPerLevel,
      roomSize,
      levelHeight,
      wallThickness,
      hasStairs,
      roomLayout,
    });
    const building = grammar.generate();
    onOutput?.({
      id,
      type: "buildingGrammar",
      levels,
      roomsPerLevel,
      roomSize,
      levelHeight,
      wallThickness,
      hasStairs,
      roomLayout,
      building,
    });
  }, [id, levels, roomsPerLevel, roomSize, levelHeight, wallThickness, hasStairs, roomLayout, onOutput]);
  return (
    <div className="node-default node-building-grammar">
      <div className="node-title">{label}</div>
      <div className="node-param-row">
        <div className="node-param-label">Levels</div>
        <input
          className="node-param-input"
          type="number"
          min={1}
          max={10}
          value={levels}
          onPointerDown={stop}
          onMouseDown={stop}
          onChange={(e) => update({ levels: Number(e.target.value) })}
        />
      </div>
      <div className="node-param-row">
        <div className="node-param-label">Rooms/Level</div>
        <input
          className="node-param-input"
          type="number"
          min={1}
          max={16}
          value={roomsPerLevel}
          onPointerDown={stop}
          onMouseDown={stop}
          onChange={(e) => update({ roomsPerLevel: Number(e.target.value) })}
        />
      </div>
      <div className="node-param-row">
        <div className="node-param-label">Room Size</div>
        <input
          className="node-param-input"
          type="number"
          step="0.1"
          min="2"
          max="10"
          value={roomSize}
          onPointerDown={stop}
          onMouseDown={stop}
          onChange={(e) => update({ roomSize: Number(e.target.value) })}
        />
      </div>
      <div className="node-param-row">
        <div className="node-param-label">Level Height</div>
        <input
          className="node-param-input"
          type="number"
          step="0.1"
          min="2"
          max="6"
          value={levelHeight}
          onPointerDown={stop}
          onMouseDown={stop}
          onChange={(e) => update({ levelHeight: Number(e.target.value) })}
        />
      </div>
      <div className="node-param-row">
        <div className="node-param-label">Wall Thickness</div>
        <input
          className="node-param-input"
          type="number"
          step="0.01"
          min="0.1"
          max="1"
          value={wallThickness}
          onPointerDown={stop}
          onMouseDown={stop}
          onChange={(e) => update({ wallThickness: Number(e.target.value) })}
        />
      </div>
      <div className="node-param-row">
        <div className="node-param-label">Layout</div>
        <select
          className="node-param-input"
          value={roomLayout}
          onPointerDown={stop}
          onMouseDown={stop}
          onChange={(e) => update({ roomLayout: e.target.value })}
        >
          <option value="grid">Grid</option>
          <option value="linear">Linear</option>
          <option value="radial">Radial</option>
        </select>
      </div>
      <div className="node-param-row">
        <div className="node-param-label">Stairs</div>
        <input
          className="node-param-input"
          type="checkbox"
          checked={hasStairs}
          onPointerDown={stop}
          onMouseDown={stop}
          onChange={(e) => update({ hasStairs: e.target.checked })}
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
        Grammar →
      </div>
      <Handle
        type="source"
        position={Position.Right}
        id="grammar"
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
