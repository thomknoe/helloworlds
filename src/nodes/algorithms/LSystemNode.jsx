import { useEffect } from "react";
import { Handle, Position } from "reactflow";
import { LSystem } from "../../algorithms/lsystem.js";

export default function LSystemNode({ id, data }) {
  const {
    label = "L-System",
    axiom = "F",
    rule1 = "F",
    rule1Replacement = "F[+F]F[-F]F",
    rule2 = "",
    rule2Replacement = "",
    rule3 = "",
    rule3Replacement = "",
    iterations = 3,
    angle = 25,
    stepSize = 1.0,
    onChange,
    onOutput,
  } = data || {};

  const update = (patch) => onChange?.({ ...data, ...patch });
  const stop = (e) => e.stopPropagation();

  const rules = {};
  if (rule1 && rule1Replacement) rules[rule1] = rule1Replacement;
  if (rule2 && rule2Replacement) rules[rule2] = rule2Replacement;
  if (rule3 && rule3Replacement) rules[rule3] = rule3Replacement;

  useEffect(() => {
    const lsystem = new LSystem(axiom, rules, iterations);
    const resultString = lsystem.iterate();

    onOutput?.({
      id,
      type: "lsystem",
      axiom,
      rules,
      iterations,
      angle: (angle * Math.PI) / 180,
      stepSize,
      resultString,
    });
  }, [id, axiom, rule1, rule1Replacement, rule2, rule2Replacement, rule3, rule3Replacement, iterations, angle, stepSize, onOutput]);

  return (
    <div className="node-default node-lsystem">
      <div className="node-title">{label}</div>

      <div className="node-param-row">
        <div className="node-param-label">Axiom</div>
        <input
          className="node-param-input"
          type="text"
          value={axiom}
          onPointerDown={stop}
          onMouseDown={stop}
          onChange={(e) => update({ axiom: e.target.value })}
        />
      </div>

      <div className="node-param-row">
        <div className="node-param-label">Rule 1: {rule1 || "?"}</div>
        <input
          className="node-param-input"
          type="text"
          placeholder="Character"
          value={rule1}
          onPointerDown={stop}
          onMouseDown={stop}
          onChange={(e) => update({ rule1: e.target.value })}
          style={{ width: "40px", marginRight: "4px" }}
        />
        <input
          className="node-param-input"
          type="text"
          placeholder="Replacement"
          value={rule1Replacement}
          onPointerDown={stop}
          onMouseDown={stop}
          onChange={(e) => update({ rule1Replacement: e.target.value })}
          style={{ flex: 1 }}
        />
      </div>

      <div className="node-param-row">
        <div className="node-param-label">Rule 2: {rule2 || "?"}</div>
        <input
          className="node-param-input"
          type="text"
          placeholder="Character"
          value={rule2}
          onPointerDown={stop}
          onMouseDown={stop}
          onChange={(e) => update({ rule2: e.target.value })}
          style={{ width: "40px", marginRight: "4px" }}
        />
        <input
          className="node-param-input"
          type="text"
          placeholder="Replacement"
          value={rule2Replacement}
          onPointerDown={stop}
          onMouseDown={stop}
          onChange={(e) => update({ rule2Replacement: e.target.value })}
          style={{ flex: 1 }}
        />
      </div>

      <div className="node-param-row">
        <div className="node-param-label">Rule 3: {rule3 || "?"}</div>
        <input
          className="node-param-input"
          type="text"
          placeholder="Character"
          value={rule3}
          onPointerDown={stop}
          onMouseDown={stop}
          onChange={(e) => update({ rule3: e.target.value })}
          style={{ width: "40px", marginRight: "4px" }}
        />
        <input
          className="node-param-input"
          type="text"
          placeholder="Replacement"
          value={rule3Replacement}
          onPointerDown={stop}
          onMouseDown={stop}
          onChange={(e) => update({ rule3Replacement: e.target.value })}
          style={{ flex: 1 }}
        />
      </div>

      <div className="node-param-row">
        <div className="node-param-label">Iterations</div>
        <input
          className="node-param-input"
          type="number"
          min={1}
          max={8}
          value={iterations}
          onPointerDown={stop}
          onMouseDown={stop}
          onChange={(e) => update({ iterations: Number(e.target.value) })}
        />
      </div>

      <div className="node-param-row">
        <div className="node-param-label">Angle (deg)</div>
        <input
          className="node-param-input"
          type="number"
          step="1"
          min={0}
          max={180}
          value={angle}
          onPointerDown={stop}
          onMouseDown={stop}
          onChange={(e) => update({ angle: Number(e.target.value) })}
        />
      </div>

      <div className="node-param-row">
        <div className="node-param-label">Step Size</div>
        <input
          className="node-param-input"
          type="number"
          step="0.1"
          min="0.1"
          max="10"
          value={stepSize}
          onPointerDown={stop}
          onMouseDown={stop}
          onChange={(e) => update({ stepSize: Number(e.target.value) })}
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
        L-System →
      </div>
      <Handle
        type="source"
        position={Position.Right}
        id="lsystem"
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
