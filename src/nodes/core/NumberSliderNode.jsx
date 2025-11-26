// src/nodes/NumberSliderNode.jsx
import { Handle, Position } from "reactflow";

export default function NumberSliderNode({ id, data }) {
  const {
    label = "Number",
    min = 0,
    max = 1,
    step = 0.01,
    value = 0,
    onChange,
    onOutput,
  } = data || {};

  const update = (patch) => {
    onChange?.({ ...data, ...patch });
  };

  const stopProp = (e) => {
    e.stopPropagation();
  };

  const clamp = (v) => {
    if (v < min) return min;
    if (v > max) return max;
    return v;
  };

  return (
    <div className="node-default node-number-input">
      <Handle type="target" position={Position.Left} />

      <strong>{label}</strong>

      <div className="node-param-row">
        <div className="node-param-label">Value</div>
        <input
          className="node-param-input"
          type="number"
          min={min}
          max={max}
          step={step}
          value={value}
          onMouseDown={stopProp}
          onPointerDown={stopProp}
          onClick={stopProp}
          onChange={(e) => {
            const raw = Number(e.target.value);
            const v = clamp(isNaN(raw) ? 0 : raw);
            update({ value: v });
            onOutput?.({ id, value: v });
          }}
        />
      </div>

      <Handle type="source" position={Position.Right} />
    </div>
  );
}
