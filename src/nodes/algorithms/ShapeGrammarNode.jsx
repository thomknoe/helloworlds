import { useEffect } from "react";
import { Handle, Position } from "reactflow";
import { ShapeGrammar } from "../../algorithms/shapeGrammar.js";

export default function ShapeGrammarNode({ id, data }) {
  const {
    label = "Shape Grammar",
    grammarType = "building",
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
    const grammar = new ShapeGrammar({
      grammarType,
      levels,
      roomsPerLevel,
      roomSize,
      levelHeight,
      wallThickness,
      hasStairs,
      roomLayout,
    });

    const shape = grammar.generate();

    // For compatibility with Building Grammar, output building structure
    const output = {
      id,
      type: "shapeGrammar",
      grammarType,
      levels,
      roomsPerLevel,
      roomSize,
      levelHeight,
      wallThickness,
      hasStairs,
      roomLayout,
      shape,
    };

    // If building type, also include building structure for compatibility
    if (grammarType === "building") {
      output.building = shape;
      output.type = "buildingGrammar"; // For compatibility with Building Node
    }

    onOutput?.(output);
  }, [id, grammarType, levels, roomsPerLevel, roomSize, levelHeight, wallThickness, hasStairs, roomLayout, onOutput]);

  return (
    <div className="node-default node-shape-grammar">
      <div className="node-title">{label}</div>

      <div className="node-param-row">
        <div className="node-param-label">Grammar Type</div>
        <select
          className="node-param-input"
          value={grammarType}
          onPointerDown={stop}
          onMouseDown={stop}
          onChange={(e) => update({ grammarType: e.target.value })}
        >
          <option value="building">Building</option>
          <option value="facade">Facade</option>
          <option value="floorplan">Floor Plan</option>
        </select>
      </div>

      {grammarType === "building" && (
        <>
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
              value={levelHeight}
              onPointerDown={stop}
              onMouseDown={stop}
              onChange={(e) => update({ levelHeight: Number(e.target.value) })}
            />
          </div>

          <div className="node-param-row">
            <div className="node-param-label">Room Layout</div>
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
        </>
      )}

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
        Shape Grammar →
      </div>
      <Handle
        type="source"
        position={Position.Right}
        id="grammar"
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

