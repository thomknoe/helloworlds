import { Handle, Position } from "reactflow";

export default function DefaultNode({ data }) {
  return (
    <div>
      <strong>{data.label || "Node"}</strong>

      <Handle type="target" position={Position.Left} />
      <Handle type="source" position={Position.Right} />
    </div>
  );
}
