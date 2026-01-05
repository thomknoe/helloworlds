import { useEffect } from "react";
import { Handle, Position } from "reactflow";
export default function NPCNode({ id, data }) {
  const {
    label = "NPC",
    positionX = 0,
    positionY = 0,
    positionZ = 0,
    movementType = "stationary",
    speed = 2.0,
    wanderRadius = 10.0,
    wanderCenterX = 0,
    wanderCenterY = 0,
    wanderCenterZ = 0,
    interactionRadius = 10.0,
    dialogueWords = "hello,world,greetings,traveler,welcome,friend",
    dialogueLength = 5,
    color = "#ffffff",
    size = 3.5,
    onChange,
    onOutput,
  } = data || {};
  const update = (patch) => onChange?.({ ...data, ...patch });
  const stop = (e) => e.stopPropagation();
  useEffect(() => {
    const wordsArray = dialogueWords.split(",").map(w => w.trim()).filter(w => w.length > 0);
    onOutput?.({
      id,
      type: "npc",
      positionX,
      positionY,
      positionZ,
      movementType,
      speed,
      wanderRadius,
      wanderCenterX,
      wanderCenterY,
      wanderCenterZ,
      interactionRadius,
      dialogueWords: wordsArray,
      dialogueLength,
      color,
      size,
    });
  }, [
    id,
    positionX,
    positionY,
    positionZ,
    movementType,
    speed,
    wanderRadius,
    wanderCenterX,
    wanderCenterY,
    wanderCenterZ,
    interactionRadius,
    dialogueWords,
    dialogueLength,
    color,
    size,
    onOutput,
  ]);
  return (
    <div className="node-default node-npc">
      <div className="node-title">{label}</div>
      <div className="node-param-row">
        <div className="node-param-label">Position X</div>
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
        <div className="node-param-label">Position Y</div>
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
        <div className="node-param-label">Position Z</div>
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
        <div className="node-param-label">Movement Type</div>
        <select
          className="node-param-input"
          value={movementType}
          onPointerDown={stop}
          onMouseDown={stop}
          onChange={(e) => update({ movementType: e.target.value })}
        >
          <option value="random">Random</option>
          <option value="path">Path</option>
          <option value="stationary">Stationary</option>
        </select>
      </div>
      {movementType === "random" && (
        <>
          <div className="node-param-row">
            <div className="node-param-label">Speed</div>
            <input
              className="node-param-input"
              type="number"
              step="0.1"
              min="0"
              value={speed}
              onPointerDown={stop}
              onMouseDown={stop}
              onChange={(e) => update({ speed: Number(e.target.value) })}
            />
          </div>
          <div className="node-param-row">
            <div className="node-param-label">Wander Radius</div>
            <input
              className="node-param-input"
              type="number"
              step="0.1"
              min="0"
              value={wanderRadius}
              onPointerDown={stop}
              onMouseDown={stop}
              onChange={(e) => update({ wanderRadius: Number(e.target.value) })}
            />
          </div>
        </>
      )}
      <div className="node-param-row">
        <div className="node-param-label">Interaction Radius</div>
        <input
          className="node-param-input"
          type="number"
          step="0.1"
          min="0"
          value={interactionRadius}
          onPointerDown={stop}
          onMouseDown={stop}
          onChange={(e) => update({ interactionRadius: Number(e.target.value) })}
        />
      </div>
      <div className="node-param-row">
        <div className="node-param-label">Dialogue Words</div>
        <input
          className="node-param-input"
          type="text"
          value={dialogueWords}
          placeholder="hello,world,greetings"
          onPointerDown={stop}
          onMouseDown={stop}
          onChange={(e) => update({ dialogueWords: e.target.value })}
        />
      </div>
      <div className="node-param-row">
        <div className="node-param-label">Dialogue Length</div>
        <input
          className="node-param-input"
          type="number"
          min={1}
          max={20}
          value={dialogueLength}
          onPointerDown={stop}
          onMouseDown={stop}
          onChange={(e) => update({ dialogueLength: Number(e.target.value) })}
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
      <div className="node-param-row">
        <div className="node-param-label">Size</div>
        <input
          className="node-param-input"
          type="number"
          step="0.1"
          min="0.1"
          value={size}
          onPointerDown={stop}
          onMouseDown={stop}
          onChange={(e) => update({ size: Number(e.target.value) })}
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
        NPC →
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
