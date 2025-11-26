import { Handle, Position } from "reactflow";

export default function PanelNode({ data }) {
  const {
    label = "Panel",
    children = "Panel Content",

  } = data || {};



  return (
    <div>
      <Handle type="target" position={Position.Left} />

      <strong>{label}</strong>

      <div style={{ marginTop: "4px" }}>
        {children}
      </div>

      <Handle type="source" position={Position.Right} />
    </div>
  );
}
