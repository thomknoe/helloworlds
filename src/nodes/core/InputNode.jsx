import { Handle, Position } from "reactflow";
export default function InputNode({ data }) {
  return (
    <div>
      <strong>{data.label || "Input"}</strong>
      <Handle type="source" position={Position.Right} />
    </div>
  );
}
